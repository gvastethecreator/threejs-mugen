import { describe, expect, it } from "vitest";
import {
  RuntimeTeamRoundDecisionWorld,
  type RuntimeTeamRoundDecision,
} from "../mugen/runtime/RuntimeTeamRoundDecisionSystem";
import {
  RuntimeTeamRoundHandoffWorld,
  type RuntimeTeamRoundHandoffActor,
} from "../mugen/runtime/RuntimeTeamRoundHandoffSystem";
import type { RuntimeTeamState } from "../mugen/runtime/types";

describe("RuntimeTeamRoundHandoffWorld", () => {
  it("promotes one Turns replacement with an ordered commit trace", () => {
    const actors = turnsActors({ p1Life: 0 });
    const result = apply(actors);

    expect(result).toMatchObject({
      schema: "mugen-web-sandbox/runtime-team-round-handoff/v0",
      outcome: "replacement",
      applied: true,
      changes: [
        { side: 1, role: "outgoing", actorId: "p1" },
        { side: 1, role: "incoming", actorId: "p3" },
      ],
      phases: [
        "decision:read",
        "decision:replacement-required",
        "handoff:preflight",
        "handoff:commit",
        "handoff:complete",
      ],
    });
    expect(actors.find((actor) => actor.id === "p1")?.teamState).toMatchObject({ standby: true, overKo: true });
    expect(actors.find((actor) => actor.id === "p3")?.teamState).toMatchObject({ standby: false, overKo: false });
  });

  it("commits both side promotions in stable side order", () => {
    const actors = turnsActors({ p1Life: 0, p2Life: 0 });
    const result = apply(actors);

    expect(result.applied).toBe(true);
    expect(result.changes.map(({ actorId }) => actorId)).toEqual(["p1", "p3", "p2", "p4"]);
    expect(actors.map(({ id, teamState }) => `${id}:${Number(teamState.standby)}:${Number(teamState.overKo)}`)).toEqual([
      "p1:1:1",
      "p2:1:1",
      "p3:0:0",
      "p4:0:0",
    ]);
  });

  it("promotes a healthy replacement when the current Turns slot is missing", () => {
    const actors = turnsActors({ p1Life: 1000, p1Standby: true });
    const result = apply(actors);

    expect(result.outcome).toBe("replacement");
    expect(result.applied).toBe(true);
    expect(result.changes.map(({ actorId }) => actorId)).toEqual(["p3"]);
    expect(actors.find((actor) => actor.id === "p1")?.teamState).toMatchObject({ standby: true, overKo: false });
  });

  it("does not mutate team state while RoundNotOver blocks the decision", () => {
    const actors = turnsActors({ p1Life: 0 });
    const decision = decisionFor(actors, true);
    const result = new RuntimeTeamRoundHandoffWorld().apply({ actors, decision });

    expect(result).toMatchObject({ outcome: "round-not-over", applied: false, changes: [] });
    expect(result.phases).toEqual(["decision:read", "decision:round-not-over", "handoff:skip"]);
    expect(actors.find((actor) => actor.id === "p1")?.teamState).toMatchObject({ standby: false, overKo: false });
  });

  it("keeps side defeat as a no-op when no replacement exists", () => {
    const actors = turnsActors({ p1Life: 0, includeP3: false });
    const result = apply(actors);

    expect(result).toMatchObject({ outcome: "side-defeat", applied: false, changes: [] });
    expect(result.phases).toEqual(["decision:read", "decision:side-defeat", "handoff:skip"]);
  });

  it("fails preflight without partially mutating a stale replacement", () => {
    const actors = turnsActors({ p1Life: 0 });
    const decision = decisionFor(actors);
    actors.find((actor) => actor.id === "p3")!.teamState.standby = false;

    const result = new RuntimeTeamRoundHandoffWorld().apply({ actors, decision });

    expect(result).toMatchObject({ outcome: "blocked", applied: false, changes: [] });
    expect(result.diagnostics).toEqual(["invalid-replacement:p3"]);
    expect(actors.find((actor) => actor.id === "p1")?.teamState).toMatchObject({ standby: false, overKo: false });
  });

  it("does not let an unrelated disabled root block a valid promotion", () => {
    const actors = turnsActors({ p1Life: 0 });
    const disabled = actor("p5", 1, 0, true, false, 2);
    disabled.teamState.disabled = true;
    actors.push(disabled);

    const result = apply(actors);

    expect(result.applied).toBe(true);
    expect(result.diagnostics).toEqual([]);
    expect(actors.find((actor) => actor.id === "p3")?.teamState.standby).toBe(false);
  });

  it("blocks malformed decision input before any commit", () => {
    const actors = turnsActors({ p1Life: 0 });
    const decision = decisionFor(actors);
    const malformed = { ...decision, diagnostics: ["duplicate-actor:p1"] } satisfies RuntimeTeamRoundDecision;
    const result = new RuntimeTeamRoundHandoffWorld().apply({ actors, decision: malformed });

    expect(result).toMatchObject({ outcome: "blocked", applied: false });
    expect(result.diagnostics).toEqual(["invalid-decision:duplicate-actor:p1"]);
    expect(actors.find((actor) => actor.id === "p1")?.teamState).toMatchObject({ standby: false, overKo: false });
  });
});

type TurnsActorOptions = {
  p1Life: number;
  p2Life?: number;
  p1Standby?: boolean;
  includeP3?: boolean;
};

function apply(actors: RuntimeTeamRoundHandoffActor[]) {
  return new RuntimeTeamRoundHandoffWorld().apply({ actors, decision: decisionFor(actors) });
}

function decisionFor(actors: readonly RuntimeTeamRoundHandoffActor[], roundNotOver = false) {
  return new RuntimeTeamRoundDecisionWorld().snapshot({
    actors,
    modeBySide: { 1: "turns", 2: "turns" },
    roundNotOver,
    tick: 12,
  });
}

function turnsActors(options: TurnsActorOptions): RuntimeTeamRoundHandoffActor[] {
  const p1Standby = options.p1Standby ?? false;
  const actors: RuntimeTeamRoundHandoffActor[] = [
    actor("p1", 1, options.p1Life, p1Standby, false, 0),
    actor("p2", 2, options.p2Life ?? 1000, false, false, 0),
  ];
  if (options.includeP3 !== false) actors.push(actor("p3", 1, 1000, true, true, 1));
  actors.push(actor("p4", 2, 1000, true, true, 1));
  return actors;
}

function actor(
  id: string,
  side: 1 | 2,
  life: number,
  standby: boolean,
  replacementEligible: boolean,
  memberNo: number,
): RuntimeTeamRoundHandoffActor {
  const teamState = teamStateFor(standby);
  return {
    id,
    side,
    life,
    standby,
    overKo: false,
    playerType: true,
    replacementEligible,
    memberNo,
    teamState,
  };
}

function teamStateFor(standby: boolean): RuntimeTeamState {
  return {
    disabled: false,
    standby,
    overKo: false,
    playerType: true,
  };
}

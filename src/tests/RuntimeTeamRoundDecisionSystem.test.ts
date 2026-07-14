import { describe, expect, it } from "vitest";
import {
  RuntimeTeamRoundDecisionWorld,
  type RuntimeTeamRoundActor,
} from "../mugen/runtime/RuntimeTeamRoundDecisionSystem";

describe("RuntimeTeamRoundDecisionWorld", () => {
  it("separates one-on-one actor KO from the winning side", () => {
    const decision = new RuntimeTeamRoundDecisionWorld().snapshot({
      actors: [
        { id: "p2", side: 2, life: 800 },
        { id: "p1", side: 1, life: 0 },
        { id: "p1-helper-0", rootId: "p1", side: 1, life: 500 },
      ],
      modeBySide: { 1: "single", 2: "single" },
      tick: -4,
    });

    expect(decision).toEqual({
      schema: "mugen-web-sandbox/runtime-team-round-decision/v0",
      tick: 0,
      roundNotOver: false,
      outcome: "side-defeat",
      winnerSide: 2,
      sides: [
        {
          side: 1,
          mode: "single",
          loseOnKo: false,
          actorIds: ["p1"],
          currentActorIds: ["p1"],
          aliveActorIds: [],
          koActorIds: ["p1"],
          overKoActorIds: [],
          replacementCandidateIds: [],
          memberKo: false,
          needsReplacement: false,
          sideDefeated: true,
        },
        {
          side: 2,
          mode: "single",
          loseOnKo: false,
          actorIds: ["p2"],
          currentActorIds: ["p2"],
          aliveActorIds: ["p2"],
          koActorIds: [],
          overKoActorIds: [],
          replacementCandidateIds: [],
          memberKo: false,
          needsReplacement: false,
          sideDefeated: false,
        },
      ],
      diagnostics: ["ignored-helper:p1-helper-0"],
    });
  });

  it("keeps a tag side alive when a standby member remains and LoseOnKO is disabled", () => {
    const decision = new RuntimeTeamRoundDecisionWorld().snapshot({
      actors: [
        { id: "p1", side: 1, life: 0 },
        { id: "p3", side: 1, life: 700, standby: true },
        { id: "p2", side: 2, life: 700 },
      ],
      modeBySide: { 1: "tag", 2: "tag" },
    });

    expect(decision.outcome).toBe("ongoing");
    expect(decision.winnerSide).toBeUndefined();
    expect(decision.sides[0]).toMatchObject({
      actorIds: ["p1", "p3"],
      currentActorIds: ["p1"],
      aliveActorIds: ["p3"],
      koActorIds: ["p1"],
      sideDefeated: false,
    });
  });

  it("applies explicit tag LoseOnKO policy without confusing over-KO state", () => {
    const decision = new RuntimeTeamRoundDecisionWorld().snapshot({
      actors: [
        { id: "p1", side: 1, life: 0, overKo: true },
        { id: "p3", side: 1, life: 700, standby: true },
        { id: "p2", side: 2, life: 700 },
      ],
      modeBySide: { 1: "tag", 2: "tag" },
      loseOnKoBySide: { 1: true },
    });

    expect(decision).toMatchObject({ outcome: "side-defeat", winnerSide: 2 });
    expect(decision.sides[0]).toMatchObject({
      overKoActorIds: ["p1"],
      aliveActorIds: ["p3"],
      memberKo: false,
      sideDefeated: true,
    });
  });

  it("returns replacement-required before turns-side defeat", () => {
    const world = new RuntimeTeamRoundDecisionWorld();
    const withReplacement = world.snapshot({
      actors: [
        { id: "p1", side: 1, life: 0, memberNo: 0 },
        { id: "p3", side: 1, life: 900, standby: true, replacementEligible: true, memberNo: 1 },
        { id: "p2", side: 2, life: 900 },
      ],
      modeBySide: { 1: "turns", 2: "turns" },
    });

    expect(withReplacement).toMatchObject({ outcome: "replacement-required" });
    expect(withReplacement.sides[0]).toMatchObject({
      currentActorIds: ["p1"],
      aliveActorIds: [],
      koActorIds: ["p1"],
      replacementCandidateIds: ["p3"],
      memberKo: true,
      needsReplacement: true,
      sideDefeated: false,
    });

    const withoutReplacement = world.snapshot({
      actors: [
        { id: "p1", side: 1, life: 0, memberNo: 0 },
        { id: "p2", side: 2, life: 900 },
      ],
      modeBySide: { 1: "turns", 2: "turns" },
    });

    expect(withoutReplacement).toMatchObject({ outcome: "side-defeat", winnerSide: 2 });
    expect(withoutReplacement.sides[0]).toMatchObject({ memberKo: true, sideDefeated: true });
  });

  it("does not hide a pending Turns replacement when the current slot is already empty", () => {
    const decision = new RuntimeTeamRoundDecisionWorld().snapshot({
      actors: [
        { id: "p3", side: 1, life: 900, standby: true, replacementEligible: true, memberNo: 1 },
        { id: "p2", side: 2, life: 900 },
      ],
      modeBySide: { 1: "turns", 2: "turns" },
    });

    expect(decision).toMatchObject({ outcome: "replacement-required" });
    expect(decision.sides[0]).toMatchObject({
      currentActorIds: [],
      memberKo: false,
      needsReplacement: true,
      replacementCandidateIds: ["p3"],
      sideDefeated: false,
    });
    expect(decision.diagnostics).toContain("empty-side:1");
    expect(decision.diagnostics).toContain("missing-current:1");
  });

  it("treats a simultaneous Turns KO as a normal draw without effective loss", () => {
    const decision = new RuntimeTeamRoundDecisionWorld().snapshot({
      actors: [
        { id: "p1", side: 1, life: 0, memberNo: 0 },
        { id: "p3", side: 1, life: 900, standby: true, replacementEligible: true, memberNo: 1 },
        { id: "p2", side: 2, life: 0, memberNo: 0 },
        { id: "p4", side: 2, life: 900, standby: true, replacementEligible: true, memberNo: 1 },
      ],
      modeBySide: { 1: "turns", 2: "turns" },
      effectiveLossBySide: { 1: false, 2: false },
    });

    expect(decision).toMatchObject({ outcome: "draw" });
    expect(decision.winnerSide).toBeUndefined();
    expect(decision.sides).toEqual([
      expect.objectContaining({ needsReplacement: false, sideDefeated: false }),
      expect.objectContaining({ needsReplacement: false, sideDefeated: false }),
    ]);
  });

  it("limits simultaneous Turns draw replacement to the effective-loss side", () => {
    const decision = new RuntimeTeamRoundDecisionWorld().snapshot({
      actors: [
        { id: "p1", side: 1, life: 0, memberNo: 0 },
        { id: "p3", side: 1, life: 900, standby: true, replacementEligible: true, memberNo: 1 },
        { id: "p2", side: 2, life: 0, memberNo: 0 },
        { id: "p4", side: 2, life: 900, standby: true, replacementEligible: true, memberNo: 1 },
      ],
      modeBySide: { 1: "turns", 2: "turns" },
      effectiveLossBySide: { 1: true, 2: false },
    });

    expect(decision).toMatchObject({ outcome: "replacement-required", winnerSide: 2 });
    expect(decision.sides[0]).toMatchObject({ effectiveLoss: true, needsReplacement: true });
    expect(decision.sides[1]).toMatchObject({ needsReplacement: false, sideDefeated: false });
  });

  it("keeps side facts observable while RoundNotOver blocks the global outcome", () => {
    const actors: RuntimeTeamRoundActor[] = [
      { id: "p1", side: 1, life: 0 },
      { id: "p1", side: 1, life: 400 },
      { id: "helper", rootId: "p1", side: 1, life: 100 },
      { id: "neutral", life: 100 },
      { id: "p2", side: 2, life: 800 },
    ];

    const decision = new RuntimeTeamRoundDecisionWorld().snapshot({
      actors,
      modeBySide: { 1: "single", 2: "single" },
      roundNotOver: true,
      tick: 4.6,
    });

    expect(decision).toMatchObject({
      tick: 5,
      roundNotOver: true,
      outcome: "round-not-over",
      diagnostics: ["duplicate-actor:p1", "ignored-helper:helper", "unknown-side:neutral"],
    });
    expect(decision.sides[0]).toMatchObject({ sideDefeated: true, koActorIds: ["p1"] });
  });
});

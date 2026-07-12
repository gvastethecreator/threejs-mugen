import { describe, expect, it } from "vitest";
import {
  RuntimeRootPhaseCapabilitiesWorld,
  type RuntimeRootPhaseCapabilitiesInput,
} from "../mugen/runtime/RuntimeRootPhaseCapabilitiesSystem";

describe("RuntimeRootPhaseCapabilitiesWorld", () => {
  it("projects playable and bounded-reserve owners from existing diagnostics", () => {
    const diagnostic = new RuntimeRootPhaseCapabilitiesWorld().diagnostic(input());

    expect(diagnostic).toEqual({
      schema: "RuntimeRootPhaseCapabilities/v0",
      mode: "ikemen-tag",
      roots: [
        expect.objectContaining({
          id: "p1",
          side: 1,
          available: true,
          standby: false,
          effectiveCtrl: true,
          phases: {
            commands: true,
            controllerCns: "playable",
            directInput: true,
            ai: false,
            kinematics: true,
            animation: true,
            effects: true,
            combat: true,
            round: true,
            presentation: true,
            resources: true,
          },
        }),
        expect.objectContaining({
          id: "p2",
          side: 2,
          available: true,
          standby: false,
          effectiveCtrl: true,
          phases: expect.objectContaining({ commands: true, controllerCns: "playable", directInput: false, ai: true }),
        }),
        expect.objectContaining({
          id: "p3",
          side: 1,
          available: true,
          standby: true,
          effectiveCtrl: false,
          phases: {
            commands: true,
            controllerCns: "bounded-reserve",
            directInput: false,
            ai: false,
            kinematics: false,
            animation: false,
            effects: false,
            combat: false,
            round: false,
            presentation: false,
            resources: false,
          },
        }),
      ],
    });
  });

  it("keeps Single reserve commands disabled without changing bounded CNS ownership", () => {
    const source = input();
    source.inputRouting.mode = "ikemen-single";
    source.inputRouting.roots[2] = {
      ...source.inputRouting.roots[2]!,
      commandSource: null,
      commandMapped: false,
    };

    const reserve = new RuntimeRootPhaseCapabilitiesWorld().diagnostic(source).roots[2]!;

    expect(reserve.phases).toMatchObject({ commands: false, controllerCns: "bounded-reserve" });
  });

  it("fails closed for unavailable, invalid-side, and non-player roots", () => {
    const source = input();
    source.roots[0]!.teamState.disabled = true;
    source.participation.roots[0]!.disabled = true;
    source.participation.roots[0]!.structurallyActive = false;
    source.roots[1]!.side = null;
    source.roots[2]!.teamState.playerType = false;

    const diagnostic = new RuntimeRootPhaseCapabilitiesWorld().diagnostic(source);

    for (const root of diagnostic.roots) {
      expect(root.available).toBe(false);
      expect(root.phases).toEqual({
        commands: false,
        controllerCns: "none",
        directInput: false,
        ai: false,
        kinematics: false,
        animation: false,
        effects: false,
        combat: false,
        round: false,
        presentation: false,
        resources: false,
      });
    }
  });

  it("rejects diagnostic id drift before publishing a partial matrix", () => {
    const source = input();
    source.inputRouting.roots[2] = { ...source.inputRouting.roots[2]!, id: "p5" };

    expect(() => new RuntimeRootPhaseCapabilitiesWorld().diagnostic(source)).toThrow(
      "Root phase capability ids must match participation and input routing",
    );
  });

  it("rejects team-state and side drift across source diagnostics", () => {
    const stateDrift = input();
    stateDrift.inputRouting.roots[2] = { ...stateDrift.inputRouting.roots[2]!, standby: false };
    expect(() => new RuntimeRootPhaseCapabilitiesWorld().diagnostic(stateDrift)).toThrow(
      "Root phase capability state drift for p3",
    );

    const activityDrift = input();
    activityDrift.roots[0]!.teamState.overKo = true;
    expect(() => new RuntimeRootPhaseCapabilitiesWorld().diagnostic(activityDrift)).toThrow(
      "Root phase capability state drift for p1",
    );

    const sideDrift = input();
    sideDrift.inputRouting.roots[2] = { ...sideDrift.inputRouting.roots[2]!, side: 2 };
    expect(() => new RuntimeRootPhaseCapabilitiesWorld().diagnostic(sideDrift)).toThrow(
      "Root phase capability side drift for p3",
    );
  });
});

function input(): RuntimeRootPhaseCapabilitiesInput {
  return {
    roots: [
      { id: "p1", side: 1, teamState: teamState() },
      { id: "p2", side: 2, teamState: teamState() },
      { id: "p3", side: 1, teamState: teamState({ standby: true }) },
    ],
    participation: {
      schema: "RuntimeRootParticipation/v0",
      activeRootIdsBySide: { 1: ["p1"], 2: ["p2"] },
      roots: [
        participation("p1", 1, true),
        participation("p2", 2, true),
        participation("p3", 1, false),
      ],
    },
    inputRouting: {
      schema: "RuntimeRootInputRouting/v0",
      mode: "ikemen-tag",
      scope: "normal-active-tick",
      roots: [
        routing("p1", 1, "p1", { directControlled: true }),
        routing("p2", 2, "p2", { aiControlled: true }),
        routing("p3", 3, "p1", { standby: true, effectiveCtrl: false }),
      ],
    },
    resourceOwnedRootIds: ["p1", "p2"],
  };
}

function teamState(overrides: Partial<RuntimeRootPhaseCapabilitiesInput["roots"][number]["teamState"]> = {}) {
  return { disabled: false, standby: false, overKo: false, playerType: true, ...overrides };
}

function participation(id: string, side: 1 | 2, playable: boolean) {
  return {
    id,
    side,
    owned: true as const,
    disabled: false,
    standby: !playable,
    structurallyActive: playable,
    scheduled: true,
    inputOwned: playable,
    combatOwned: playable,
    roundOwned: playable,
    presented: playable,
    effectStoreOwned: playable,
  };
}

function routing(
  id: string,
  playerNo: number,
  commandSource: "p1" | "p2",
  overrides: { directControlled?: boolean; aiControlled?: boolean; standby?: boolean; effectiveCtrl?: boolean } = {},
) {
  return {
    id,
    playerNo,
    side: playerNo % 2 === 1 ? 1 as const : 2 as const,
    commandSource,
    commandMapped: true,
    directControlled: overrides.directControlled ?? false,
    aiControlled: overrides.aiControlled ?? false,
    standby: overrides.standby ?? false,
    effectiveCtrl: overrides.effectiveCtrl ?? true,
  };
}

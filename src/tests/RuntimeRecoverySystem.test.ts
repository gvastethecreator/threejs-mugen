import { describe, expect, it } from "vitest";
import {
  defaultDownRecoverTime,
  defaultFallDefenseMultiplier,
  ensureDownRecoveryTime,
  isImportedGroundRecoveryLandingState,
  RuntimeRecoverySystem,
  type RuntimeRecoveryActor,
  type RuntimeRecoveryTransitionApi,
} from "../mugen/runtime/RuntimeRecoverySystem";

describe("RuntimeRecoverySystem", () => {
  it("ticks fall recoverTime while recovery is enabled and clamps at zero", () => {
    const system = new RuntimeRecoverySystem();
    const fighter = actor({ recoverTime: 2 });

    system.tickHitFallRecoveryWindow(fighter);
    expect(fighter.runtime.hitFall?.recoverTime).toBe(1);

    system.tickHitFallRecoveryWindow(fighter);
    system.tickHitFallRecoveryWindow(fighter);
    expect(fighter.runtime.hitFall?.recoverTime).toBe(0);
  });

  it("applies Common1 fall defense once and restores it after leaving Hit", () => {
    const system = new RuntimeRecoverySystem();
    const fighter = actor({
      source: "imported",
      stateNo: 5100,
      stateElapsed: 1,
      moveType: "H",
      constants: { "data.fall.defence_up": 50 },
    });

    system.applyCommon1FallDefenseUp(fighter);
    system.applyCommon1FallDefenseUp(fighter);

    expect(fighter.runtime.fallDefenseMultiplier).toBeCloseTo(2 / 3);
    expect(fighter.runtime.hitFall?.fallDefenseApplied).toBe(true);

    fighter.runtime.moveType = "I";
    system.tickHitFallRecoveryWindow(fighter);

    expect(fighter.runtime.fallDefenseMultiplier).toBeUndefined();
    expect(fighter.runtime.hitFall?.fallDefenseApplied).toBe(false);
  });

  it("counts Common1 fall entry before HitFallDamage and remains idempotent", () => {
    const system = new RuntimeRecoverySystem();
    const fighter = actor({
      source: "imported",
      stateNo: 5100,
      stateElapsed: 1,
      moveType: "H",
    });

    system.applyCommon1FallDefenseUp(fighter);
    system.applyCommon1FallDefenseUp(fighter);

    expect(fighter.runtime.hitFall).toMatchObject({
      fallCount: 1,
      fallCountedGroundImpact: true,
      common1FallMechanicsStateNo: 5100,
    });
  });

  it("honors NoFallCount at the Common1 state-entry boundary", () => {
    const system = new RuntimeRecoverySystem();
    const fighter = actor({
      source: "imported",
      stateNo: 5100,
      stateElapsed: 1,
      moveType: "H",
      assertSpecial: {
        flags: ["nofallcount"],
        globalFlags: [],
        noFallCount: true,
      },
    });

    system.applyCommon1FallDefenseUp(fighter);

    expect(fighter.runtime.hitFall).not.toHaveProperty("fallCount");
    expect(fighter.runtime.hitFall).not.toHaveProperty("fallCountedGroundImpact");
    expect(fighter.runtime.hitFall?.common1FallMechanicsStateNo).toBe(5100);
  });

  it("shortens repeated Common1 ground recovery and preserves the secondary HitBy slot", () => {
    const system = new RuntimeRecoverySystem();
    const fighter = actor({
      source: "imported",
      stateNo: 5100,
      stateElapsed: 1,
      moveType: "H",
      fallCount: 1,
      downRecoverTime: 18,
      hitBy: { slot2: { mode: "allow", attr: "S,NT", remaining: 4 } },
    });

    system.applyCommon1FallDefenseUp(fighter);

    expect(fighter.runtime.hitFall).toMatchObject({ fallCount: 2, downRecoverTime: 9 });
    expect(fighter.runtime.hitBy).toEqual({
      slot1: { mode: "deny", attr: "SCA", remaining: 180 },
      slot2: { mode: "allow", attr: "S,NT", remaining: 4 },
    });
  });

  it("clears per-entry fall markers before a later Common1 fall entry", () => {
    const system = new RuntimeRecoverySystem();
    const fighter = actor({
      source: "imported",
      stateNo: 5100,
      stateElapsed: 1,
      moveType: "H",
    });

    system.applyCommon1FallDefenseUp(fighter);
    fighter.runtime.stateNo = 5101;
    system.tickHitFallRecoveryWindow(fighter);
    fighter.runtime.stateNo = 5100;
    system.applyCommon1FallDefenseUp(fighter);

    expect(fighter.runtime.hitFall).toMatchObject({
      fallCount: 2,
      common1FallMechanicsStateNo: 5100,
    });
  });

  it("honors Common1 NoFallDefenceUp without applying the transient factor", () => {
    const system = new RuntimeRecoverySystem();
    const fighter = actor({
      source: "imported",
      stateNo: 5070,
      stateElapsed: 1,
      moveType: "H",
      constants: { "data.fall.defence_up": 50 },
      assertSpecial: {
        flags: ["nofalldefenceup"],
        globalFlags: [],
        noFallDefenceUp: true,
      },
    });

    system.applyCommon1FallDefenseUp(fighter);

    expect(fighter.runtime.fallDefenseMultiplier).toBeUndefined();
    expect(fighter.runtime.hitFall?.fallDefenseApplied).toBe(true);
  });

  it("uses data.liedown.time as the default down recovery window", () => {
    expect(defaultDownRecoverTime({ constants: { "data.liedown.time": 14.6 } })).toBe(15);
    expect(defaultDownRecoverTime({ constants: { "data.liedown.time": -5 } })).toBe(0);
    expect(defaultDownRecoverTime({})).toBe(60);
  });

  it("derives the incoming fall-damage factor from canonical Data values", () => {
    expect(defaultFallDefenseMultiplier({ constants: { "data.fall.defence_up": 50 } })).toBeCloseTo(2 / 3);
    expect(defaultFallDefenseMultiplier({ constants: { "data.fall.defence_mul": 1.5 } })).toBeCloseTo(2 / 3);
    expect(defaultFallDefenseMultiplier({ constants: {} })).toBeUndefined();
  });

  it("ensures and decrements Common1 liedown recovery time", () => {
    const system = new RuntimeRecoverySystem();
    const fighter = actor({ stateNo: 5110, downRecoverTime: undefined, constants: { "data.liedown.time": 3 } });

    expect(ensureDownRecoveryTime(fighter)).toMatchObject({ downRecover: true, downRecoverTime: 3 });

    system.advanceCommon1LieDownRecovery(fighter, transitions().api);

    expect(fighter.runtime.hitFall).toMatchObject({ downRecover: true, downRecoverTime: 2 });
  });

  it("routes Common1 liedown to recovery state 5120 after the down recovery window expires", () => {
    const system = new RuntimeRecoverySystem();
    const fighter = actor({ stateNo: 5110, downRecoverTime: 0, stateElapsed: 1 });
    const transition = transitions();

    system.advanceCommon1LieDownRecovery(fighter, transition.api);

    expect(transition.entered).toEqual([5120]);
  });

  it("blocks Common1 liedown get-up while AssertSpecial NoGetUpFromLieDown is active", () => {
    const system = new RuntimeRecoverySystem();
    const fighter = actor({
      stateNo: 5110,
      downRecoverTime: 0,
      stateElapsed: 1,
      assertSpecial: { flags: ["nogetupfromliedown"], globalFlags: [], noGetUpFromLieDown: true },
    });
    const transition = transitions();

    system.advanceCommon1LieDownRecovery(fighter, transition.api);

    expect(transition.entered).toEqual([]);
  });

  it("fast-recovers Common1 liedown on recovery input while down recovery time remains positive", () => {
    const system = new RuntimeRecoverySystem();
    const fighter = actor({ stateNo: 5110, stateType: "L", downRecoverTime: 5, stateElapsed: 1 });
    const transition = transitions({ isFastRecoverFromLieDownRequested: () => true });

    system.advanceCommon1LieDownRecovery(fighter, transition.api);

    expect(fighter.runtime.hitFall?.downRecoverTime).toBe(0);
    expect(transition.entered).toEqual([5120]);
  });

  it("blocks Common1 liedown fast recovery while AssertSpecial NoFastRecoverFromLieDown is active", () => {
    const system = new RuntimeRecoverySystem();
    const fighter = actor({
      stateNo: 5110,
      stateType: "L",
      downRecoverTime: 5,
      stateElapsed: 1,
      assertSpecial: {
        flags: ["nofastrecoverfromliedown"],
        globalFlags: [],
        noFastRecoverFromLieDown: true,
      },
    });
    const transition = transitions({ isFastRecoverFromLieDownRequested: () => true });

    system.advanceCommon1LieDownRecovery(fighter, transition.api);

    expect(fighter.runtime.hitFall?.downRecoverTime).toBe(4);
    expect(transition.entered).toEqual([]);
  });

  it("lands imported ground recovery state 5201 into state 52", () => {
    const system = new RuntimeRecoverySystem();
    const fighter = actor({ source: "imported", stateNo: 5201, physics: "A", posY: 6, velY: 4 });
    const transition = transitions();

    expect(isImportedGroundRecoveryLandingState(fighter)).toBe(true);

    system.advanceImportedGroundRecoveryLanding(fighter, transition.api);

    expect(fighter.runtime.pos.y).toBe(0);
    expect(fighter.runtime.vel.y).toBe(0);
    expect(transition.entered).toEqual([52]);
  });

  it("does not land non-imported recovery states", () => {
    const system = new RuntimeRecoverySystem();
    const fighter = actor({ stateNo: 5201, physics: "A", posY: 6, velY: 4 });
    const transition = transitions();

    expect(isImportedGroundRecoveryLandingState(fighter)).toBe(false);

    system.advanceImportedGroundRecoveryLanding(fighter, transition.api);

    expect(transition.entered).toEqual([]);
  });
});

function actor(options: {
  source?: "demo" | "imported";
  constants?: Record<string, number>;
  stateNo?: number;
  stateType?: "S" | "C" | "A" | "L";
  stateElapsed?: number;
  recoverTime?: number;
  downRecoverTime?: number;
  fallCount?: number;
  hitBy?: RuntimeRecoveryActor["runtime"]["hitBy"];
  moveType?: "I" | "A" | "H";
  physics?: "S" | "C" | "A" | "N";
  posY?: number;
  velY?: number;
  assertSpecial?: RuntimeRecoveryActor["runtime"]["assertSpecial"];
}): RuntimeRecoveryActor {
  return {
    definition: {
      source: options.source ?? "demo",
      constants: options.constants,
    },
    runtime: {
      stateNo: options.stateNo ?? 5000,
      moveType: options.moveType ?? "I",
      stateType: options.stateType ?? "S",
      life: 1000,
      physics: options.physics ?? "S",
      pos: { x: 0, y: options.posY ?? 0 },
      vel: { x: 0, y: options.velY ?? 0 },
      assertSpecial: options.assertSpecial,
      hitFall: {
        falling: true,
        damage: 0,
        velocity: { y: 0 },
        recover: true,
        recoverTime: options.recoverTime,
        ...(options.fallCount === undefined ? {} : { fallCount: options.fallCount }),
        downRecoverTime: options.downRecoverTime,
      },
      hitBy: options.hitBy,
    },
    stateElapsed: options.stateElapsed ?? 0,
  };
}

function transitions(options: Partial<RuntimeRecoveryTransitionApi> = {}): { api: RuntimeRecoveryTransitionApi; entered: number[] } {
  const entered: number[] = [];
  return {
    entered,
    api: {
      canEnterState: () => true,
      enterState: (stateId) => entered.push(stateId),
      ...options,
    },
  };
}

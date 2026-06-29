import { describe, expect, it } from "vitest";
import {
  defaultDownRecoverTime,
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

  it("uses data.liedown.time as the default down recovery window", () => {
    expect(defaultDownRecoverTime({ constants: { "data.liedown.time": 14.6 } })).toBe(15);
    expect(defaultDownRecoverTime({ constants: { "data.liedown.time": -5 } })).toBe(0);
    expect(defaultDownRecoverTime({})).toBe(60);
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
  stateElapsed?: number;
  recoverTime?: number;
  downRecoverTime?: number;
  physics?: "S" | "C" | "A" | "N";
  posY?: number;
  velY?: number;
}): RuntimeRecoveryActor {
  return {
    definition: {
      source: options.source ?? "demo",
      constants: options.constants,
    },
    runtime: {
      stateNo: options.stateNo ?? 5000,
      life: 1000,
      physics: options.physics ?? "S",
      pos: { x: 0, y: options.posY ?? 0 },
      vel: { x: 0, y: options.velY ?? 0 },
      hitFall: {
        falling: true,
        damage: 0,
        velocity: { y: 0 },
        recover: true,
        recoverTime: options.recoverTime,
        downRecoverTime: options.downRecoverTime,
      },
    },
    stateElapsed: options.stateElapsed ?? 0,
  };
}

function transitions(): { api: RuntimeRecoveryTransitionApi; entered: number[] } {
  const entered: number[] = [];
  return {
    entered,
    api: {
      canEnterState: () => true,
      enterState: (stateId) => entered.push(stateId),
    },
  };
}

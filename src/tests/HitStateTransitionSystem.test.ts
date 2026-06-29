import { describe, expect, it } from "vitest";
import {
  RuntimeHitStateTransitionWorld,
  type RuntimeHitStateEntryOptions,
  type RuntimeHitStateTransitionActor,
  type RuntimeHitStateTransitionHooks,
} from "../mugen/runtime/HitStateTransitionSystem";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("RuntimeHitStateTransitionSystem", () => {
  it("routes target-owned and attacker-owned hit states through one boundary", () => {
    const world = new RuntimeHitStateTransitionWorld();
    const attacker = actor("p1");
    const defender = actor("p2");
    const hooks = hooksFor([777, 888]);

    const outcome = world.applyHitStateTransitions(
      attacker,
      defender,
      { p1StateNo: 777, p2StateNo: 888 },
      hooks,
    );

    expect(outcome).toEqual({ attackerEntered: true, defenderEntered: true });
    expect(attacker.runtime.stateNo).toBe(777);
    expect(attacker.runtime.customState).toBeUndefined();
    expect(defender.runtime.stateNo).toBe(888);
    expect(defender.runtime.customState).toEqual({ ownerId: "p1", stateNo: 888, getP1State: true });
  });

  it("clears target ownership when p2getp1state is false", () => {
    const world = new RuntimeHitStateTransitionWorld();
    const attacker = actor("p1");
    const defender = actor("p2", {
      customState: { ownerId: "old", stateNo: 5000, getP1State: true },
    });

    const entered = world.enterTargetHitState(defender, attacker, 888, false, hooksFor([888]));

    expect(entered).toBe(true);
    expect(defender.runtime.stateNo).toBe(888);
    expect(defender.runtime.customState).toBeUndefined();
  });

  it("does not mutate when the requested state is unavailable", () => {
    const world = new RuntimeHitStateTransitionWorld();
    const attacker = actor("p1", { stateNo: 200 });
    const defender = actor("p2", { stateNo: 0 });

    const outcome = world.applyHitStateTransitions(
      attacker,
      defender,
      { p1StateNo: 777, p2StateNo: 888 },
      hooksFor([777]),
    );

    expect(outcome).toEqual({ attackerEntered: true, defenderEntered: false });
    expect(attacker.runtime.stateNo).toBe(777);
    expect(defender.runtime.stateNo).toBe(0);
    expect(defender.runtime.customState).toBeUndefined();
  });
});

type TestActor = RuntimeHitStateTransitionActor;

function hooksFor(availableStates: number[]): RuntimeHitStateTransitionHooks<TestActor> {
  return {
    canEnterState: (_target, stateNo) => availableStates.includes(stateNo),
    enterState: (target, stateNo, options = {}) => {
      applyStateEntry(target, stateNo, options);
    },
  };
}

function applyStateEntry(
  target: TestActor,
  stateNo: number,
  options: RuntimeHitStateEntryOptions<TestActor>,
): void {
  target.runtime.stateNo = stateNo;
  if (options.clearStateOwner || !options.stateOwner) {
    target.runtime.customState = undefined;
    return;
  }
  target.runtime.customState = {
    ownerId: options.stateOwner.id,
    stateNo,
    getP1State: true,
  };
}

function actor(id: string, overrides: Partial<CharacterRuntimeState> = {}): TestActor {
  return {
    id,
    runtime: runtime(overrides),
  };
}

function runtime(overrides: Partial<CharacterRuntimeState> = {}): CharacterRuntimeState {
  return {
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
    facing: 1,
    stateNo: 0,
    animNo: 0,
    animTime: 0,
    frameIndex: 0,
    life: 1000,
    power: 0,
    ctrl: true,
    stateType: "S",
    moveType: "I",
    physics: "S",
    vars: [],
    fvars: [],
    ...overrides,
  };
}

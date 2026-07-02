import { describe, expect, it } from "vitest";
import { RuntimeTargetStateEntryWorld } from "../mugen/runtime/RuntimeTargetStateEntrySystem";
import type { RuntimeTargetWorldActor } from "../mugen/runtime/TargetSystem";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("RuntimeTargetStateEntryWorld", () => {
  it("enters target state with the controller actor as state owner", () => {
    const world = new RuntimeTargetStateEntryWorld();
    const attacker = actor("p1");
    const defender = actor("p2");
    const calls: string[] = [];

    const result = world.enter({
      actor: attacker,
      target: defender,
      stateId: 888,
      hooks: {
        canEnterState: (target, stateId, stateOwner) => {
          calls.push(`can:${target.id}:${stateId}:${stateOwner.id}`);
          return true;
        },
        enterState: (target, stateId, options) => {
          calls.push(`enter:${target.id}:${stateId}:${options.stateOwner.id}`);
          target.runtime.stateNo = stateId;
        },
      },
    });

    expect(result).toMatchObject({ entered: true, target: defender, stateId: 888, stateOwner: attacker });
    expect(defender.runtime.stateNo).toBe(888);
    expect(calls).toEqual(["can:p2:888:p1", "enter:p2:888:p1"]);
  });

  it("preserves an existing owner-backed custom-state owner", () => {
    const world = new RuntimeTargetStateEntryWorld();
    const attacker = actor("p1");
    const customOwner = actor("p1-owner");
    const defender = actor("p2");
    attacker.stateOwner = customOwner;
    const calls: string[] = [];

    const result = world.enter({
      actor: attacker,
      target: defender,
      stateId: 889,
      hooks: {
        canEnterState: (_target, _stateId, stateOwner) => {
          calls.push(`can:${stateOwner.id}`);
          return true;
        },
        enterState: (_target, _stateId, options) => calls.push(`enter:${options.stateOwner.id}`),
      },
    });

    expect(result).toMatchObject({ entered: true, stateOwner: customOwner });
    expect(calls).toEqual(["can:p1-owner", "enter:p1-owner"]);
  });

  it("fails closed when the owner cannot provide the target state", () => {
    const world = new RuntimeTargetStateEntryWorld();
    const attacker = actor("p1");
    const defender = actor("p2");
    const calls: string[] = [];

    const result = world.enter({
      actor: attacker,
      target: defender,
      stateId: 999,
      hooks: {
        canEnterState: (_target, stateId, stateOwner) => {
          calls.push(`can:${stateId}:${stateOwner.id}`);
          return false;
        },
        enterState: () => calls.push("enter"),
      },
    });

    expect(result).toEqual({ entered: false, reason: "unavailable-state", stateOwner: attacker });
    expect(calls).toEqual(["can:999:p1"]);
    expect(defender.runtime.stateNo).toBe(0);
  });
});

type TargetStateEntryTestActor = RuntimeTargetWorldActor & {
  stateOwner?: TargetStateEntryTestActor;
};

function actor(id: string): TargetStateEntryTestActor {
  return {
    id,
    runtime: runtimeState(),
    targets: [],
    targetBindings: [],
  };
}

function runtimeState(): CharacterRuntimeState {
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
  };
}

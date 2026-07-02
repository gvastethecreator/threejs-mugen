import { describe, expect, it } from "vitest";
import { RuntimeGuardWorld } from "../mugen/runtime/GuardSystem";
import { RuntimeAutoGuardStartWorld, type RuntimeAutoGuardStartActor } from "../mugen/runtime/RuntimeAutoGuardStartSystem";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("RuntimeAutoGuardStartWorld", () => {
  it("enters imported guard-start state and applies guard-start mutation", () => {
    const world = new RuntimeAutoGuardStartWorld();
    const defender = actor({ id: "p1", source: "imported", input: ["B"], velX: 4 });
    const attacker = actor({ id: "p2", source: "imported" });
    const calls: string[] = [];

    const result = world.apply({
      defender,
      attacker,
      guardWorld: new RuntimeGuardWorld(),
      hooks: {
        isInGuardDistance: (guarder, aggressor) => {
          calls.push(`dist:${guarder.id}:${aggressor.id}`);
          return true;
        },
        canEnterState: (_guarder, stateNo) => {
          calls.push(`can:${stateNo}`);
          return stateNo === 120;
        },
        enterState: (guarder, stateNo, options) => {
          calls.push(`enter:${stateNo}:${options.clearStateOwner}`);
          guarder.runtime.stateNo = stateNo;
        },
      },
    });

    expect(result).toEqual({ started: true, stateNo: 120 });
    expect(defender.runtime.stateNo).toBe(120);
    expect(defender.runtime.ctrl).toBe(false);
    expect(defender.runtime.vel.x).toBe(0);
    expect(calls).toEqual(["dist:p1:p2", "can:120", "can:120", "enter:120:true"]);
  });

  it("fails closed for non-imported, ineligible input, and out-of-distance defenders", () => {
    const world = new RuntimeAutoGuardStartWorld();
    const attacker = actor({ id: "p2", source: "imported" });
    const hooks = {
      isInGuardDistance: () => true,
      canEnterState: () => true,
      enterState: () => {
        throw new Error("should not enter state");
      },
    };

    expect(world.apply({ defender: actor({ source: "demo", input: ["B"] }), attacker, guardWorld: new RuntimeGuardWorld(), hooks })).toEqual({
      started: false,
      reason: "non-imported",
    });
    expect(world.apply({ defender: actor({ source: "imported", input: ["F"] }), attacker, guardWorld: new RuntimeGuardWorld(), hooks })).toEqual({
      started: false,
      reason: "ineligible",
    });
    expect(
      world.apply({
        defender: actor({ source: "imported", input: ["B"] }),
        attacker,
        guardWorld: new RuntimeGuardWorld(),
        hooks: { ...hooks, isInGuardDistance: () => false },
      }),
    ).toEqual({ started: false, reason: "out-of-guard-distance" });
  });

  it("does not mutate when no guard-start state is available", () => {
    const world = new RuntimeAutoGuardStartWorld();
    const defender = actor({ id: "p1", source: "imported", input: ["B"], velX: 3 });
    const attacker = actor({ id: "p2", source: "imported" });

    const result = world.apply({
      defender,
      attacker,
      guardWorld: new RuntimeGuardWorld(),
      hooks: {
        isInGuardDistance: () => true,
        canEnterState: () => false,
        enterState: () => {
          throw new Error("unavailable guard state should not enter");
        },
      },
    });

    expect(result).toEqual({ started: false, reason: "unavailable-state", stateNo: undefined });
    expect(defender.runtime.stateNo).toBe(0);
    expect(defender.runtime.ctrl).toBe(true);
    expect(defender.runtime.vel.x).toBe(3);
  });
});

type AutoGuardTestActor = RuntimeAutoGuardStartActor & { id: string };

function actor(options: { id?: string; source: string; input?: string[]; velX?: number }): AutoGuardTestActor {
  return {
    id: options.id ?? "p1",
    definition: { source: options.source },
    currentInput: new Set(options.input ?? []),
    runtime: runtimeState({ vel: { x: options.velX ?? 0, y: 0 } }),
    hitPause: 0,
    hitStun: 0,
  };
}

function runtimeState(overrides: Partial<CharacterRuntimeState> = {}): CharacterRuntimeState {
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

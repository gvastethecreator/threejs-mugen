import { describe, expect, it } from "vitest";
import {
  RuntimeInputControlWorld,
  type RuntimeInputControlActor,
} from "../mugen/runtime/RuntimeInputControlSystem";

describe("RuntimeInputControlWorld", () => {
  it("blocks player input during stun, active moves, disabled control, or imported move-type preservation", () => {
    const world = new RuntimeInputControlWorld();
    const calls: string[] = [];

    expect(
      world.handlePlayerInput(actor(), new Set(["F"]), { hasStun: true, changeAction: (id) => calls.push(`anim:${id}`) }),
    ).toBe("blocked");
    expect(world.handlePlayerInput(actor({ currentMove: {} }), new Set(["F"]))).toBe("blocked");
    expect(world.handlePlayerInput(actor({ ctrl: false }), new Set(["F"]))).toBe("blocked");
    expect(world.handlePlayerInput(actor(), new Set(["F"]), { preserveImportedStateMoveType: true })).toBe("blocked");
    expect(calls).toEqual([]);
  });

  it("runs state-entry setup before local buttons and stops when state-entry applies", () => {
    const world = new RuntimeInputControlWorld();
    const fighter = actor();
    const calls: string[] = [];

    const result = world.handlePlayerInput(fighter, new Set(["x"]), {
      runStateEntrySetup: () => calls.push("setup"),
      tryApplyStateEntry: () => {
        calls.push("entry");
        return true;
      },
      startMove: (move) => calls.push(`move:${move}`),
    });

    expect(result).toBe("state-entry");
    expect(calls).toEqual(["setup", "entry"]);
  });

  it("owns player crouch, jump, walk, and idle control mutations", () => {
    const world = new RuntimeInputControlWorld();
    const calls: string[] = [];

    const crouch = actor();
    expect(world.handlePlayerInput(crouch, new Set(["D"]), hooks(calls))).toBe("crouch");
    expect(crouch.runtime.stateType).toBe("C");
    expect(crouch.runtime.physics).toBe("C");
    expect(calls.splice(0)).toEqual(["anim:10", "state:10"]);

    const jump = actor();
    expect(world.handlePlayerInput(jump, new Set(["U"]), hooks(calls))).toBe("jump");
    expect(jump.runtime.stateType).toBe("A");
    expect(jump.runtime.physics).toBe("A");
    expect(jump.runtime.vel.y).toBe(-9);
    expect(calls.splice(0)).toEqual(["anim:40", "state:40"]);

    const walk = actor({ facing: -1, speed: 2 });
    expect(world.handlePlayerInput(walk, new Set(["F"]), hooks(calls))).toBe("walk");
    expect(walk.runtime.vel.x).toBe(-2);
    expect(walk.runtime.stateType).toBe("S");
    expect(walk.runtime.physics).toBe("S");
    expect(calls.splice(0)).toEqual(["anim:20", "state:20"]);

    const idle = actor({ velX: 4 });
    expect(world.handlePlayerInput(idle, new Set(), hooks(calls))).toBe("idle");
    expect(idle.runtime.vel.x).toBe(0);
    expect(idle.runtime.stateType).toBe("S");
    expect(idle.runtime.physics).toBe("S");
    expect(calls.splice(0)).toEqual(["anim:0", "state:0", "ctrl"]);
  });

  it("honors NoWalk and preserves airborne action while applying air drift", () => {
    const world = new RuntimeInputControlWorld();
    const calls: string[] = [];

    const noWalk = actor({ noWalk: true, velX: 3 });
    expect(world.handlePlayerInput(noWalk, new Set(["F"]), hooks(calls))).toBe("walk-blocked");
    expect(noWalk.runtime.vel.x).toBe(0);
    expect(calls).toEqual([]);

    const air = actor({ stateType: "A", physics: "A", facing: -1, speed: 2 });
    expect(world.handlePlayerInput(air, new Set(["F"]), hooks(calls))).toBe("air-drift");
    expect(air.runtime.vel.x).toBe(-2);
    expect(air.runtime.stateType).toBe("A");
    expect(air.runtime.physics).toBe("A");
    expect(calls).toEqual([]);
  });

  it("owns simple AI chase and attack cooldown behavior", () => {
    const world = new RuntimeInputControlWorld();
    const calls: string[] = [];

    const chaser = actor({ speed: 2, aiCooldown: 10, posX: 0 });
    expect(world.handleSimpleAi(chaser, actor({ posX: 200 }), 12, hooks(calls))).toBe("ai-chase");
    expect(chaser.aiCooldown).toBe(9);
    expect(chaser.runtime.vel.x).toBeCloseTo(1.3);
    expect(calls.splice(0)).toEqual(["anim:20", "state:20"]);

    const attacker = actor({ aiCooldown: 0, posX: 0 });
    expect(world.handleSimpleAi(attacker, actor({ posX: 60 }), 13, hooks(calls))).toBe("move");
    expect(attacker.aiCooldown).toBe(70);
    expect(attacker.runtime.vel.x).toBe(0);
    expect(calls).toEqual(["move:kick"]);
  });
});

function actor(
  overrides: Partial<RuntimeInputControlActor> & {
    aiCooldown?: number;
    ctrl?: boolean;
    currentMove?: unknown;
    facing?: 1 | -1;
    noWalk?: boolean;
    physics?: "S" | "C" | "A" | "N";
    posX?: number;
    speed?: number;
    stateType?: "S" | "C" | "A" | "L";
    velX?: number;
  } = {},
): RuntimeInputControlActor {
  const stateType = overrides.stateType ?? "S";
  const physics = overrides.physics ?? (stateType === "L" ? "N" : stateType);
  return {
    currentMove: overrides.currentMove,
    aiCooldown: overrides.aiCooldown ?? 0,
    definition: {
      speed: overrides.speed ?? 1,
      jumpVelocity: -9,
      idleAction: 0,
      walkAction: 20,
      crouchAction: 10,
      jumpAction: 40,
    },
    runtime: {
      ctrl: overrides.ctrl ?? true,
      facing: overrides.facing ?? 1,
      pos: { x: overrides.posX ?? 0, y: 0 },
      vel: { x: overrides.velX ?? 0, y: 0 },
      stateType,
      physics,
      ...(overrides.noWalk ? { assertSpecial: { flags: ["nowalk"], globalFlags: [], noWalk: true } } : {}),
    },
  };
}

function hooks(calls: string[]) {
  return {
    startMove: (move: "punch" | "kick") => calls.push(`move:${move}`),
    changeAction: (actionId: number) => calls.push(`anim:${actionId}`),
    setStateNo: (stateNo: number) => calls.push(`state:${stateNo}`),
    restoreControl: () => calls.push("ctrl"),
  };
}

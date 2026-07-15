import { describe, expect, it } from "vitest";
import { RuntimeControllerEvaluationContextWorld } from "../mugen/runtime/RuntimeControllerEvaluationContextSystem";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("RuntimeControllerEvaluationContextWorld", () => {
  it("creates executor context from actor, owner, and tick callbacks", () => {
    const world = new RuntimeControllerEvaluationContextWorld();
    const actor = { id: "p1", hitPause: 7 };
    const owner = { id: "owner", consts: { attack: 125 } };
    const randomActors: unknown[] = [];
    const constReads: unknown[] = [];

    const context = world.create({
      actor,
      owner,
      tick: 42,
      gameSpace: { width: 640, height: 480, zoom: 2 },
      getConst: (stateOwner, name) => {
        constReads.push({ stateOwner, name });
        return stateOwner.consts[name as keyof typeof stateOwner.consts];
      },
      nextRandom: (randomActor) => {
        randomActors.push(randomActor);
        return 0.25;
      },
    });

    expect(context.stageTime).toBe(42);
    expect(context.gameSpace).toEqual({ width: 640, height: 480, zoom: 2 });
    expect(context.hitPauseTime?.()).toBe(7);
    expect(context.getConst?.("attack")).toBe(125);
    expect(context.random?.()).toBe(0.25);
    expect(constReads).toEqual([{ stateOwner: owner, name: "attack" }]);
    expect(randomActors).toEqual([actor]);
  });

  it("forwards bounded redirect state into executor expression contexts", () => {
    const world = new RuntimeControllerEvaluationContextWorld();
    const actor = { id: "p1", hitPause: 0, playerId: 56, playerNo: 1 };
    const owner = { id: "owner", consts: {} };
    const opponent = { runtime: runtimeState({ life: 963, vel: { x: -2, y: -5 } }), playerId: 58, playerNo: 2 };
    const parent = { runtime: runtimeState({ vel: { x: 4, y: 0 } }), playerId: 57, playerNo: 3 };
    const root = { runtime: runtimeState({ vel: { x: 0, y: -7 } }), playerId: 56, playerNo: 1 };

    const context = world.create({
      actor,
      owner,
      opponent,
      parent,
      root,
      target: (targetId) => (targetId === 77 ? { self: opponent.runtime, opponent: runtimeState({ life: 1000 }) } : undefined),
      playerIdTarget: (playerId) => (playerId === 58 ? { self: opponent.runtime, playerId: 58, playerNo: 2 } : undefined),
      tick: 42,
      getConst: () => undefined,
      nextRandom: () => 0,
    });

    expect(context.opponent).toBe(opponent.runtime);
    expect([context.playerId, context.playerNo]).toEqual([56, 1]);
    expect([context.opponentPlayerId, context.opponentPlayerNo]).toEqual([58, 2]);
    expect(context.parent).toBe(parent.runtime);
    expect([context.parentPlayerId, context.parentPlayerNo]).toEqual([57, 3]);
    expect(context.root).toBe(root.runtime);
    expect([context.rootPlayerId, context.rootPlayerNo]).toEqual([56, 1]);
    expect(context.target?.(77)?.self.life).toBe(963);
    expect(context.target?.(999)).toBeUndefined();
    expect(context.playerIdTarget?.(58)?.self.life).toBe(963);
    expect(context.playerIdTarget?.(999)).toBeUndefined();
  });
});

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

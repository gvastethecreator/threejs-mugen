import { describe, expect, it } from "vitest";
import type { MugenStateController } from "../mugen/model/MugenState";
import { RuntimeActorConstraintWorld, type RuntimeActorConstraintState } from "../mugen/runtime/ActorConstraintSystem";

describe("ActorConstraintSystem", () => {
  it("applies bounded Width params from raw and typed controllers", () => {
    const world = new RuntimeActorConstraintWorld();
    const state = actorState();

    world.applyWidth(state, controller("Width", { player: "18,44" }));
    expect(state.bodyWidth).toEqual({ front: 18, back: 44 });

    world.applyWidth(state, controller("Width", { value: "1,1" }), {
      kind: "collision",
      controllerType: "width",
      front: -220,
      back: 0,
    });
    expect(state.bodyWidth).toEqual({ front: 160, back: 1 });
  });

  it("resets one-frame constraints and preserves frozen position axes", () => {
    const world = new RuntimeActorConstraintWorld();
    const state = actorState({
      playerPush: false,
      posFreeze: { x: true, y: true },
      screenBound: { bound: false, moveCameraX: false, moveCameraY: true },
    });

    world.resetFrameConstraints(state);
    expect(state.playerPush).toBe(true);
    expect(state.posFreeze).toBeUndefined();
    expect(state.screenBound).toBeUndefined();

    state.pos = { x: 20, y: -12 };
    state.posFreeze = { x: true, y: false };
    world.preserveFrozenPosition(state, { x: 5, y: -30 });
    expect(state.pos).toEqual({ x: 5, y: -12 });
  });

  it("clamps actors to stage bounds unless ScreenBound disables it", () => {
    const world = new RuntimeActorConstraintWorld();
    const state = actorState({ pos: { x: 80, y: 0 } });

    world.clampToStage(state, { bounds: { left: -40, right: 40 } });
    expect(state.pos.x).toBe(40);

    state.pos.x = 80;
    state.screenBound = { bound: false, moveCameraX: false, moveCameraY: true };
    world.clampToStage(state, { bounds: { left: -40, right: 40 } });
    expect(state.pos.x).toBe(80);
  });

  it("separates overlapping actors using facing-aware body widths", () => {
    const world = new RuntimeActorConstraintWorld();
    const left = actorState({ pos: { x: 0, y: 0 }, facing: 1, bodyWidth: { front: 20, back: 10 } });
    const right = actorState({ pos: { x: 10, y: 0 }, facing: -1, bodyWidth: { front: 20, back: 10 } });

    world.separate(left, right);
    expect(left.pos.x).toBe(-15);
    expect(right.pos.x).toBe(25);

    left.pos.x = 0;
    right.pos.x = 10;
    left.playerPush = false;
    world.separate(left, right);
    expect(left.pos.x).toBe(0);
    expect(right.pos.x).toBe(10);
  });
});

function actorState(overrides: Partial<RuntimeActorConstraintState> = {}): RuntimeActorConstraintState {
  return {
    pos: { x: 0, y: 0 },
    facing: 1,
    playerPush: true,
    ...overrides,
  };
}

function controller(type: string, params: Record<string, string>): MugenStateController {
  return {
    stateId: 200,
    type,
    params,
    triggers: [],
    line: 1,
    rawHeader: `[State 200, ${type}]`,
  };
}

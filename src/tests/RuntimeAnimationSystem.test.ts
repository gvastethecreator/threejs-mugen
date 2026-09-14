import { describe, expect, it } from "vitest";
import type { MugenAnimationAction, MugenAnimationFrame } from "../mugen/model/MugenAnimation";
import {
  RuntimeAnimationWorld,
  runtimeAnimationElapsedBeforeFrame,
  runtimeAnimationElementNo,
  runtimeAnimationElementTime,
  runtimeAnimationElementVar,
  runtimeAnimationElementVarForFrame,
  runtimeAnimationLength,
  runtimeAnimationPlayerNo,
  runtimeAnimationTimeRemaining,
  type RuntimeAnimationActor,
  type RuntimeAnimationChangeActor,
} from "../mugen/runtime/RuntimeAnimationSystem";

describe("RuntimeAnimationWorld", () => {
  it("leaves empty actions unchanged", () => {
    const world = new RuntimeAnimationWorld();
    const actor = runtimeActor(action(10, []));

    const result = world.advance(actor);

    expect(result).toEqual({
      advanced: false,
      frameChanged: false,
      completed: false,
      looped: false,
      previousFrameIndex: 0,
      frameIndex: 0,
      frameElapsed: 0,
      animTime: 0,
    });
    expect(actor.runtime).toMatchObject({ animTime: 0, frameIndex: 0 });
    expect(actor.frameElapsed).toBe(0);
    expect(actor.animationComplete).toBe(false);
  });

  it("tracks the player that owns a ChangeAnim2 action", () => {
    const world = new RuntimeAnimationWorld();
    const nextAction = action(920, [2]);
    const actor = runtimeChangeActor(action(10, [1]), { animationOwnerPlayerNo: 1 });

    const result = world.changeAction(actor, {
      actionId: 920,
      source: "state-owner",
      actionOwner: { ...actionOwner(nextAction), playerNo: 2 },
    });

    expect(result.actionFound).toBe(true);
    expect(actor.animationOwnerPlayerNo).toBe(2);
    expect(runtimeAnimationPlayerNo({ ...actor, playerNo: 1 })).toBe(2);
    expect(runtimeAnimationPlayerNo({ animationOwnerPlayerNo: undefined, playerNo: 1 })).toBe(1);
  });

  it("ticks inside a frame until authored duration elapses", () => {
    const world = new RuntimeAnimationWorld();
    const actor = runtimeActor(action(10, [3, 2]));

    const first = world.advance(actor);
    const second = world.advance(actor);

    expect(first).toMatchObject({ advanced: true, frameChanged: false, frameIndex: 0, frameElapsed: 1 });
    expect(second).toMatchObject({ frameChanged: false, frameIndex: 0, frameElapsed: 2, animTime: 2 });
    expect(actor.runtime.frameIndex).toBe(0);
  });

  it("advances to the next frame and resets elapsed frame time", () => {
    const world = new RuntimeAnimationWorld();
    const actor = runtimeActor(action(10, [2, 4]));

    world.advance(actor);
    const result = world.advance(actor);

    expect(result).toMatchObject({
      advanced: true,
      frameChanged: true,
      completed: false,
      looped: false,
      previousFrameIndex: 0,
      frameIndex: 1,
      frameElapsed: 0,
      animTime: 2,
    });
    expect(actor.runtime.frameIndex).toBe(1);
    expect(actor.animationComplete).toBe(false);
  });

  it("marks completion and loops to loopStart after the last frame", () => {
    const world = new RuntimeAnimationWorld();
    const actor = runtimeActor(action(10, [1, 1, 1], 1));

    world.advance(actor);
    world.advance(actor);
    const result = world.advance(actor);

    expect(result).toMatchObject({
      completed: true,
      looped: true,
      previousFrameIndex: 2,
      frameIndex: 1,
      frameElapsed: 0,
      animTime: 3,
    });
    expect(actor.animationComplete).toBe(true);
  });

  it("holds the final frame when no loopStart exists", () => {
    const world = new RuntimeAnimationWorld();
    const actor = runtimeActor(action(10, [1, 1]));

    world.advance(actor);
    const result = world.advance(actor);

    expect(result).toMatchObject({
      completed: true,
      looped: false,
      previousFrameIndex: 1,
      frameIndex: 1,
      frameChanged: false,
    });
    expect(actor.animationComplete).toBe(true);
  });

  it("resolves AnimElemNo from signed time offsets on the active AIR timeline", () => {
    const actor = runtimeActor(action(10, [2, 3, 4], 1));
    const frameIndex = actor.runtime.frameIndex;
    const frameElapsed = actor.frameElapsed;
    const animTime = actor.runtime.animTime;

    expect(runtimeAnimationElementNo(actor, 0)).toBe(1);
    expect(runtimeAnimationElementNo(actor, 2)).toBe(2);
    expect(runtimeAnimationElementNo(actor, -1)).toBeUndefined();
    expect(actor.runtime.frameIndex).toBe(frameIndex);
    expect(actor.frameElapsed).toBe(frameElapsed);
    expect(actor.runtime.animTime).toBe(animTime);

    actor.runtime.frameIndex = 1;
    actor.frameElapsed = 0;
    actor.runtime.animTime = 2;
    expect(runtimeAnimationElementNo(actor, 0)).toBe(2);
    expect(runtimeAnimationElementNo(actor, -1)).toBe(3);
    expect(runtimeAnimationElementNo(actor, 3)).toBe(3);
    expect(runtimeAnimationElementNo(actor, 8)).toBe(2);
    actor.runtime.frameIndex = 2;
    actor.runtime.animTime = 5;
    expect(runtimeAnimationElementNo(actor, -1)).toBe(2);

    const linear = runtimeActor(action(12, [2, 3, 4]));
    linear.runtime.frameIndex = 1;
    linear.runtime.animTime = 2;
    expect(runtimeAnimationElementNo(linear, -1)).toBe(1);

    const held = runtimeActor(action(11, [2, -1]));
    expect(runtimeAnimationElementNo(held, 5)).toBe(2);
  });

  it("treats zero and negative durations as one tick", () => {
    const world = new RuntimeAnimationWorld();
    const actor = runtimeActor(action(10, [0, -5, 2]));

    const first = world.advance(actor);
    const second = world.advance(actor);

    expect(first).toMatchObject({ frameChanged: true, frameIndex: 1 });
    expect(second).toMatchObject({ frameChanged: true, frameIndex: 2 });
  });

  it("reports timing helpers from the same duration rules", () => {
    const actor = runtimeActor(action(10, [2, 0, 4]), { frameIndex: 1, frameElapsed: 0, animTime: 2 });

    expect(runtimeAnimationElapsedBeforeFrame(actor.currentAction, 2)).toBe(3);
    expect(runtimeAnimationTimeRemaining(actor)).toBe(4);
    expect(runtimeAnimationElementTime(actor, 1)).toBe(2);
    expect(runtimeAnimationElementTime(actor, 2)).toBe(0);
    expect(runtimeAnimationElementTime(actor, 99)).toBeUndefined();
  });

  it("sums effective frame durations for AnimLength", () => {
    expect(runtimeAnimationLength(action(10, [2, 0, -5, 4]))).toBe(8);
    expect(runtimeAnimationLength(action(11, []))).toBe(0);
    expect(runtimeAnimationLength(undefined)).toBe(0);
  });

  it("reads supported AnimElemVar metadata from the active AIR frame", () => {
    const currentAction = action(10, [5, 7]);
    currentAction.frames[0] = {
      ...currentAction.frames[0]!,
      spriteGroup: 200,
      spriteIndex: 3,
      offsetX: -4,
      offsetY: 9,
      flip: "H",
      clsn1: [{ x1: 1, y1: 2, x2: 3, y2: 4 }],
      clsn2: [
        { x1: -1, y1: -2, x2: 5, y2: 6 },
        { x1: 7, y1: 8, x2: 9, y2: 10 },
      ],
    };
    const actor = runtimeActor(currentAction);

    expect(runtimeAnimationElementVar(actor, "Group")).toBe(200);
    expect(runtimeAnimationElementVar(actor, "Image")).toBe(3);
    expect(runtimeAnimationElementVar(actor, "Time")).toBe(5);
    expect(runtimeAnimationElementVar(actor, "XOffset")).toBe(-4);
    expect(runtimeAnimationElementVar(actor, "YOffset")).toBe(9);
    expect(runtimeAnimationElementVar(actor, "HFlip")).toBe(1);
    expect(runtimeAnimationElementVar(actor, "VFlip")).toBe(0);
    expect(runtimeAnimationElementVar(actor, "NumClsn1")).toBe(1);
    expect(runtimeAnimationElementVar(actor, "NumClsn2")).toBe(2);
    expect(runtimeAnimationElementVarForFrame(undefined, "Group")).toBeUndefined();
    expect(runtimeAnimationElementVar(actor, "AlphaDest")).toBeUndefined();
  });

  it("changes to an authored action and applies elem timing through the animation world", () => {
    const world = new RuntimeAnimationWorld();
    const nextAction = action(20, [3, 5, 2]);
    const actor = runtimeChangeActor(action(10, [1]));

    const result = world.changeAction(actor, {
      actionId: 20,
      actionOwner: actionOwner(nextAction),
      elem: 2,
      elemTime: 4,
    });

    expect(result).toMatchObject({
      applied: true,
      actionFound: true,
      changed: true,
      elementApplied: true,
      frameIndex: 1,
      frameElapsed: 4,
      animTime: 7,
    });
    expect(actor.currentAction).toBe(nextAction);
    expect(actor.runtime).toMatchObject({ animNo: 20, animationSource: "self", frameIndex: 1, animTime: 7 });
    expect(actor.animationComplete).toBe(false);
  });

  it("applies elem timing without resetting when the current action already matches", () => {
    const world = new RuntimeAnimationWorld();
    const currentAction = action(20, [3, 5, 2]);
    const actor = runtimeChangeActor(currentAction, { animNo: 20, frameIndex: 2, frameElapsed: 1, animTime: 9 });

    const result = world.changeAction(actor, {
      actionId: 20,
      actionOwner: actionOwner(currentAction),
      elem: 2,
      elemTime: 99,
    });

    expect(result).toMatchObject({
      applied: true,
      actionFound: true,
      changed: false,
      elementApplied: true,
      frameIndex: 1,
      frameElapsed: 4,
      animTime: 7,
    });
    expect(actor.currentAction).toBe(currentAction);
    expect(actor.runtime).toMatchObject({ animNo: 20, frameIndex: 1, animTime: 7 });
  });

  it("reports missing action without mutating actor animation state", () => {
    const world = new RuntimeAnimationWorld();
    const currentAction = action(10, [2]);
    const actor = runtimeChangeActor(currentAction, { animNo: 10, frameIndex: 0, frameElapsed: 1, animTime: 1 });

    const result = world.changeAction(actor, {
      actionId: 404,
      actionOwner: actionOwner(currentAction),
    });

    expect(result).toMatchObject({
      applied: false,
      actionFound: false,
      changed: false,
      elementApplied: false,
      frameIndex: 0,
      frameElapsed: 1,
      animTime: 1,
    });
    expect(actor.currentAction).toBe(currentAction);
    expect(actor.runtime).toMatchObject({ animNo: 10, frameIndex: 0, animTime: 1 });
  });
});

function runtimeActor(
  currentAction: MugenAnimationAction,
  options: Partial<RuntimeAnimationActor> & { frameIndex?: number; animTime?: number } = {},
): RuntimeAnimationActor {
  return {
    currentAction,
    frameElapsed: options.frameElapsed ?? 0,
    animationComplete: options.animationComplete ?? false,
    runtime: {
      animTime: options.animTime ?? 0,
      frameIndex: options.frameIndex ?? 0,
    },
  };
}

function runtimeChangeActor(
  currentAction: MugenAnimationAction,
  options: Partial<RuntimeAnimationChangeActor> & {
    animNo?: number;
    animationSource?: RuntimeAnimationChangeActor["runtime"]["animationSource"];
    frameIndex?: number;
    animTime?: number;
  } = {},
): RuntimeAnimationChangeActor {
  return {
    currentAction,
    frameElapsed: options.frameElapsed ?? 0,
    animationComplete: options.animationComplete ?? false,
    runtime: {
      animNo: options.animNo ?? currentAction.id,
      animationSource: options.animationSource ?? "self",
      animTime: options.animTime ?? 0,
      frameIndex: options.frameIndex ?? 0,
    },
  };
}

function actionOwner(...actions: MugenAnimationAction[]) {
  return { animations: new Map(actions.map((candidate) => [candidate.id, candidate])) };
}

function action(id: number, durations: number[], loopStart?: number): MugenAnimationAction {
  return {
    id,
    loopStart,
    rawLines: [],
    frames: durations.map((duration, index) => frame(index, duration)),
  };
}

function frame(index: number, duration: number): MugenAnimationFrame {
  return {
    spriteGroup: 0,
    spriteIndex: index,
    offsetX: 0,
    offsetY: 0,
    duration,
    clsn1: [],
    clsn2: [],
    raw: "",
    line: index + 1,
  };
}

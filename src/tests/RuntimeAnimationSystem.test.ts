import { describe, expect, it } from "vitest";
import type { MugenAnimationAction, MugenAnimationFrame } from "../mugen/model/MugenAnimation";
import {
  RuntimeAnimationWorld,
  runtimeAnimationElapsedBeforeFrame,
  runtimeAnimationElementTime,
  runtimeAnimationTimeRemaining,
  type RuntimeAnimationActor,
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

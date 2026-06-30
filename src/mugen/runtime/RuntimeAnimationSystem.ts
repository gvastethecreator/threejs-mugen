import type { MugenAnimationAction, MugenAnimationFrame } from "../model/MugenAnimation";
import type { CharacterRuntimeState } from "./types";

export type RuntimeAnimationActor = {
  currentAction: MugenAnimationAction;
  frameElapsed: number;
  animationComplete: boolean;
  runtime: Pick<CharacterRuntimeState, "animTime" | "frameIndex">;
};

export type RuntimeAnimationAdvanceResult = {
  advanced: boolean;
  frameChanged: boolean;
  completed: boolean;
  looped: boolean;
  previousFrameIndex: number;
  frameIndex: number;
  frameElapsed: number;
  animTime: number;
};

export class RuntimeAnimationWorld {
  advance(actor: RuntimeAnimationActor): RuntimeAnimationAdvanceResult {
    const frames = actor.currentAction.frames;
    const previousFrameIndex = actor.runtime.frameIndex;
    if (frames.length === 0) {
      return {
        advanced: false,
        frameChanged: false,
        completed: false,
        looped: false,
        previousFrameIndex,
        frameIndex: actor.runtime.frameIndex,
        frameElapsed: actor.frameElapsed,
        animTime: actor.runtime.animTime,
      };
    }

    actor.runtime.animTime += 1;
    actor.frameElapsed += 1;

    const frame = frames[actor.runtime.frameIndex];
    if (actor.frameElapsed < runtimeAnimationFrameDuration(frame)) {
      return {
        advanced: true,
        frameChanged: false,
        completed: false,
        looped: false,
        previousFrameIndex,
        frameIndex: actor.runtime.frameIndex,
        frameElapsed: actor.frameElapsed,
        animTime: actor.runtime.animTime,
      };
    }

    actor.frameElapsed = 0;
    const nextFrameIndex = actor.runtime.frameIndex + 1;
    if (nextFrameIndex < frames.length) {
      actor.runtime.frameIndex = nextFrameIndex;
      return {
        advanced: true,
        frameChanged: true,
        completed: false,
        looped: false,
        previousFrameIndex,
        frameIndex: actor.runtime.frameIndex,
        frameElapsed: actor.frameElapsed,
        animTime: actor.runtime.animTime,
      };
    }

    actor.animationComplete = true;
    actor.runtime.frameIndex = actor.currentAction.loopStart ?? Math.max(0, frames.length - 1);
    return {
      advanced: true,
      frameChanged: actor.runtime.frameIndex !== previousFrameIndex,
      completed: true,
      looped: actor.currentAction.loopStart !== undefined,
      previousFrameIndex,
      frameIndex: actor.runtime.frameIndex,
      frameElapsed: actor.frameElapsed,
      animTime: actor.runtime.animTime,
    };
  }
}

export function runtimeAnimationFrameDuration(frame: MugenAnimationFrame | undefined): number {
  return Math.max(1, frame?.duration ?? 1);
}

export function runtimeAnimationElapsedBeforeFrame(action: MugenAnimationAction, frameIndex: number): number {
  let elapsed = 0;
  for (let index = 0; index < frameIndex; index += 1) {
    elapsed += runtimeAnimationFrameDuration(action.frames[index]);
  }
  return elapsed;
}

export function runtimeAnimationTimeRemaining(actor: RuntimeAnimationActor): number {
  const frames = actor.currentAction.frames;
  if (frames.length === 0 || actor.animationComplete) {
    return 0;
  }

  let remaining = Math.max(0, runtimeAnimationFrameDuration(frames[actor.runtime.frameIndex]) - actor.frameElapsed - 1);
  for (let index = actor.runtime.frameIndex + 1; index < frames.length; index += 1) {
    remaining += runtimeAnimationFrameDuration(frames[index]);
  }
  return remaining;
}

export function runtimeAnimationElementTime(
  actor: RuntimeAnimationActor,
  elementNumber: number,
): number | undefined {
  const frames = actor.currentAction.frames;
  const elementIndex = Math.floor(elementNumber) - 1;
  if (elementIndex < 0 || elementIndex >= frames.length) {
    return undefined;
  }

  const currentElapsed =
    runtimeAnimationElapsedBeforeFrame(actor.currentAction, actor.runtime.frameIndex) + actor.frameElapsed;
  const targetElapsed = runtimeAnimationElapsedBeforeFrame(actor.currentAction, elementIndex);
  return currentElapsed - targetElapsed;
}

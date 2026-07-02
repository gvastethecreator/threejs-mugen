import type { MugenAnimationAction, MugenAnimationFrame } from "../model/MugenAnimation";
import type { CharacterRuntimeState } from "./types";

export type RuntimeAnimationActor = {
  currentAction: MugenAnimationAction;
  frameElapsed: number;
  animationComplete: boolean;
  runtime: Pick<CharacterRuntimeState, "animTime" | "frameIndex">;
};

export type RuntimeAnimationChangeActor = Omit<RuntimeAnimationActor, "runtime"> & {
  runtime: RuntimeAnimationActor["runtime"] & Pick<CharacterRuntimeState, "animNo" | "animationSource">;
};

export type RuntimeAnimationActionOwner = {
  animations: Pick<Map<number, MugenAnimationAction>, "get">;
};

export type RuntimeAnimationElementOptions = {
  elem?: number;
  elemTime?: number;
};

export type RuntimeAnimationChangeActionOptions = RuntimeAnimationElementOptions & {
  actionId: number;
  source?: NonNullable<CharacterRuntimeState["animationSource"]>;
  actionOwner: RuntimeAnimationActionOwner;
};

export type RuntimeAnimationChangeActionResult = {
  applied: boolean;
  actionFound: boolean;
  changed: boolean;
  elementApplied: boolean;
  frameIndex: number;
  frameElapsed: number;
  animTime: number;
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
  changeAction(
    actor: RuntimeAnimationChangeActor,
    options: RuntimeAnimationChangeActionOptions,
  ): RuntimeAnimationChangeActionResult {
    const source = options.source ?? "self";
    const action = options.actionOwner.animations.get(options.actionId);
    if (!action) {
      return animationChangeResult(actor, {
        applied: false,
        actionFound: false,
        changed: false,
        elementApplied: false,
      });
    }

    const alreadyCurrent =
      actor.runtime.animNo === options.actionId && actor.runtime.animationSource === source && actor.currentAction === action;
    if (alreadyCurrent) {
      const elementApplied = this.applyElement(actor, options).applied;
      return animationChangeResult(actor, {
        applied: true,
        actionFound: true,
        changed: false,
        elementApplied,
      });
    }

    actor.currentAction = action;
    actor.runtime.animNo = options.actionId;
    actor.runtime.animationSource = source;
    actor.runtime.frameIndex = 0;
    actor.runtime.animTime = 0;
    actor.frameElapsed = 0;
    actor.animationComplete = false;
    const elementApplied = this.applyElement(actor, options).applied;
    return animationChangeResult(actor, {
      applied: true,
      actionFound: true,
      changed: true,
      elementApplied,
    });
  }

  applyElement(actor: RuntimeAnimationActor, options: RuntimeAnimationElementOptions): { applied: boolean } {
    if (options.elem === undefined) {
      return { applied: false };
    }

    const frames = actor.currentAction.frames;
    if (frames.length === 0) {
      return { applied: false };
    }

    const frameIndex = clamp(Math.round(options.elem) - 1, 0, frames.length - 1);
    const frameDuration = runtimeAnimationFrameDuration(frames[frameIndex]);
    const elemTime = clamp(Math.round(options.elemTime ?? 0), 0, frameDuration - 1);
    actor.runtime.frameIndex = frameIndex;
    actor.frameElapsed = elemTime;
    actor.runtime.animTime = runtimeAnimationElapsedBeforeFrame(actor.currentAction, frameIndex) + elemTime;
    actor.animationComplete = false;
    return { applied: true };
  }

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

function animationChangeResult(
  actor: RuntimeAnimationChangeActor,
  result: Pick<RuntimeAnimationChangeActionResult, "applied" | "actionFound" | "changed" | "elementApplied">,
): RuntimeAnimationChangeActionResult {
  return {
    ...result,
    frameIndex: actor.runtime.frameIndex,
    frameElapsed: actor.frameElapsed,
    animTime: actor.runtime.animTime,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

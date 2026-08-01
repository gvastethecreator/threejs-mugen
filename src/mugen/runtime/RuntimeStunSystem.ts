import type { CharacterRuntimeState } from "./types";

export type RuntimeStunActor = {
  runtime: Pick<CharacterRuntimeState, "guardStun" | "guarding" | "moveType" | "vel">
    & Partial<Pick<CharacterRuntimeState, "ctrl" | "guardSlideTimeRemaining" | "guardControlTimeRemaining">>;
  hitStun: number;
};

export type RuntimeStunTickResult = {
  guardActive: boolean;
  hitActive: boolean;
};

export type RuntimeGuardStunActor = Pick<RuntimeStunActor, "runtime">;

export type RuntimeStunAdvanceOptions<TActor extends RuntimeStunActor> = {
  hasCurrentMove?: boolean;
  preserveImportedStateMoveType?: boolean;
  preserveImportedGuardTiming?: boolean;
  suppressHitStunAction?: boolean;
  showHitStunAction?: (actor: TActor) => void;
};

export type RuntimeStunAdvanceResult = RuntimeStunTickResult & {
  hitStunActionRequests: number;
  restoredIdleMoveType: boolean;
};

export function hasRuntimeStun(actor: RuntimeStunActor): boolean {
  return actor.hitStun > 0 || (actor.runtime.guardStun ?? 0) > 0;
}

export function tickRuntimeGuardStun(actor: RuntimeGuardStunActor): boolean {
  actor.runtime.guarding = false;
  const guardActive = (actor.runtime.guardStun ?? 0) > 0;
  if (guardActive) {
    actor.runtime.guardStun = Math.max(0, (actor.runtime.guardStun ?? 0) - 1);
    actor.runtime.guarding = actor.runtime.guardStun > 0;
    actor.runtime.moveType = actor.runtime.guarding ? "H" : actor.runtime.moveType;
    actor.runtime.vel.x *= 0.82;
  }
  tickRuntimeGuardTiming(actor.runtime);
  return guardActive;
}

export function tickRuntimeStun(actor: RuntimeStunActor): RuntimeStunTickResult {
  const result: RuntimeStunTickResult = {
    guardActive: false,
    hitActive: false,
  };

  result.guardActive = tickRuntimeGuardStun(actor);

  if (actor.hitStun > 0) {
    actor.hitStun = Math.max(0, actor.hitStun - 1);
    actor.runtime.vel.x *= 0.88;
    result.hitActive = true;
  }

  return result;
}

export class RuntimeStunWorld {
  hasStun(actor: RuntimeStunActor): boolean {
    return hasRuntimeStun(actor);
  }

  advance<TActor extends RuntimeStunActor>(
    actor: TActor,
    options: RuntimeStunAdvanceOptions<TActor> = {},
  ): RuntimeStunAdvanceResult {
    const slideTimeBefore = actor.runtime.guardSlideTimeRemaining;
    const tick = tickRuntimeStun(actor);
    const result: RuntimeStunAdvanceResult = {
      ...tick,
      hitStunActionRequests: 0,
      restoredIdleMoveType: false,
    };
    const preserveImportedStateMoveType = options.preserveImportedStateMoveType ?? false;
    const preserveImportedGuardTiming = options.preserveImportedGuardTiming ?? preserveImportedStateMoveType;
    const canShowHitStunAction =
      !preserveImportedStateMoveType && !options.suppressHitStunAction && options.showHitStunAction;

    if (
      !preserveImportedGuardTiming &&
      !options.hasCurrentMove &&
      slideTimeBefore !== undefined &&
      slideTimeBefore > 0 &&
      actor.runtime.guardSlideTimeRemaining === 0
    ) {
      actor.runtime.vel.x = 0;
    }
    if (
      !preserveImportedGuardTiming &&
      !options.hasCurrentMove &&
      actor.runtime.guardControlTimeRemaining !== undefined &&
      actor.runtime.guardControlTimeRemaining <= 0 &&
      actor.runtime.ctrl === false
    ) {
      actor.runtime.ctrl = true;
    }

    if (tick.guardActive && canShowHitStunAction) {
      options.showHitStunAction?.(actor);
      result.hitStunActionRequests += 1;
    }
    if (tick.hitActive && canShowHitStunAction) {
      options.showHitStunAction?.(actor);
      result.hitStunActionRequests += 1;
    }

    if (!options.hasCurrentMove && !hasRuntimeStun(actor) && !preserveImportedStateMoveType) {
      actor.runtime.moveType = "I";
      result.restoredIdleMoveType = true;
    }

    return result;
  }
}

function tickRuntimeGuardTiming(runtime: RuntimeStunActor["runtime"]): void {
  if (runtime.guardSlideTimeRemaining !== undefined) {
    runtime.guardSlideTimeRemaining = decrementRuntimeTimer(runtime.guardSlideTimeRemaining);
  }
  if (runtime.guardControlTimeRemaining !== undefined) {
    runtime.guardControlTimeRemaining = decrementRuntimeTimer(runtime.guardControlTimeRemaining);
  }
}

function decrementRuntimeTimer(value: number): number {
  return Math.max(0, Math.trunc(value) - 1);
}

import type { CharacterRuntimeState } from "./types";

export type RuntimeFighterAdvanceActor = {
  runtime: Pick<CharacterRuntimeState, "pos" | "renderAngle" | "renderScale">;
};

export type RuntimeFighterAdvanceHooks<TActor extends RuntimeFighterAdvanceActor> = {
  tickSpriteEffects: (actor: TActor) => void;
  tickHitBySlots: (actor: TActor) => void;
  tickHitOverrideSlots: (actor: TActor) => void;
  advanceContactTimers: (actor: TActor) => void;
  advanceStateClock: (actor: TActor) => void;
  resetFrameConstraints: (actor: TActor) => void;
  tickHitFallRecoveryWindow: (actor: TActor) => void;
  shouldPreserveImportedStateMoveType: (actor: TActor) => boolean;
  advanceStun: (actor: TActor, preserveImportedStateMoveType: boolean) => void;
  advanceMoveLifecycle: (actor: TActor) => void;
  advanceKinematics: (actor: TActor, preserveImportedStateMoveType: boolean) => void;
  advanceAnimation: (actor: TActor) => void;
  runActiveStateControllers: (actor: TActor) => void;
  advanceImportedGroundRecoveryLanding: (actor: TActor) => void;
  advanceCommon1LieDownRecovery: (actor: TActor) => void;
  preserveFrozenPosition: (actor: TActor, tickStartPos: { x: number; y: number }) => void;
};

export type RuntimeFighterAdvanceInput<TActor extends RuntimeFighterAdvanceActor> = {
  actor: TActor;
  hooks: RuntimeFighterAdvanceHooks<TActor>;
};

export type RuntimeFighterAdvanceResult = {
  tickStartPos: { x: number; y: number };
  preserveImportedStateMoveType: boolean;
};

export class RuntimeFighterAdvanceWorld {
  advance<TActor extends RuntimeFighterAdvanceActor>(
    input: RuntimeFighterAdvanceInput<TActor>,
  ): RuntimeFighterAdvanceResult {
    const { actor, hooks } = input;

    hooks.tickSpriteEffects(actor);
    hooks.tickHitBySlots(actor);
    hooks.tickHitOverrideSlots(actor);
    hooks.advanceContactTimers(actor);
    actor.runtime.renderAngle = undefined;
    actor.runtime.renderScale = undefined;
    hooks.advanceStateClock(actor);
    hooks.resetFrameConstraints(actor);
    hooks.tickHitFallRecoveryWindow(actor);

    const tickStartPos = { ...actor.runtime.pos };
    const preserveImportedStateMoveType = hooks.shouldPreserveImportedStateMoveType(actor);

    hooks.advanceStun(actor, preserveImportedStateMoveType);
    hooks.advanceMoveLifecycle(actor);
    hooks.advanceKinematics(actor, preserveImportedStateMoveType);
    hooks.advanceAnimation(actor);
    hooks.runActiveStateControllers(actor);
    hooks.advanceImportedGroundRecoveryLanding(actor);
    hooks.advanceCommon1LieDownRecovery(actor);
    hooks.preserveFrozenPosition(actor, tickStartPos);

    return { tickStartPos, preserveImportedStateMoveType };
  }
}

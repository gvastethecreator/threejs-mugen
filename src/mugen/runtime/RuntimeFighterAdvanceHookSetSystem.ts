import type {
  RuntimeFighterAdvanceActor,
  RuntimeFighterAdvanceHooks,
} from "./RuntimeFighterAdvanceSystem";

export type RuntimeFighterAdvanceHookSetInput<TActor extends RuntimeFighterAdvanceActor> =
  RuntimeFighterAdvanceHooks<TActor>;

export class RuntimeFighterAdvanceHookSetWorld {
  create<TActor extends RuntimeFighterAdvanceActor>(
    input: RuntimeFighterAdvanceHookSetInput<TActor>,
  ): RuntimeFighterAdvanceHooks<TActor> {
    return {
      tickSpriteEffects: input.tickSpriteEffects,
      tickHitBySlots: input.tickHitBySlots,
      tickHitOverrideSlots: input.tickHitOverrideSlots,
      advanceContactTimers: input.advanceContactTimers,
      advanceStateClock: input.advanceStateClock,
      resetFrameConstraints: input.resetFrameConstraints,
      tickHitFallRecoveryWindow: input.tickHitFallRecoveryWindow,
      shouldPreserveImportedStateMoveType: input.shouldPreserveImportedStateMoveType,
      advanceStun: input.advanceStun,
      advanceMoveLifecycle: input.advanceMoveLifecycle,
      advanceKinematics: input.advanceKinematics,
      advanceAnimation: input.advanceAnimation,
      runActiveStateControllers: input.runActiveStateControllers,
      applyCommon1FallDefenseUp: input.applyCommon1FallDefenseUp,
      advanceImportedGroundRecoveryLanding: input.advanceImportedGroundRecoveryLanding,
      advanceCommon1LieDownRecovery: input.advanceCommon1LieDownRecovery,
      preserveFrozenPosition: input.preserveFrozenPosition,
    };
  }
}

import type { AudioControllerOp } from "../compiler/ControllerOps";
import type { CollisionBox } from "../model/CollisionBox";
import type { RuntimeDirectCombatWorld } from "./DirectCombatSystem";
import type { RuntimeEffectLifecycleActor, RuntimeEffectLifecycleWorld } from "./EffectLifecycleSystem";
import type { RuntimeGetHitStateWorld } from "./GetHitStateSystem";
import type { RuntimeGuardWorld } from "./GuardSystem";
import type { RuntimeHitOverrideWorld } from "./HitOverrideSystem";
import type { RuntimeHitStateTransitionWorld } from "./HitStateTransitionSystem";
import type { RuntimeProjectile } from "./ProjectileSystem";
import type { RuntimeContactPresentationWorld } from "./RuntimeContactPresentationSystem";
import type { RuntimeStageBounds } from "./HitDefCornerPush";
import type {
  RuntimeCombatResolutionActor,
  RuntimeCombatResolutionStateHooks,
  RuntimeCombatResolutionWorld,
} from "./RuntimeCombatResolutionSystem";
import type {
  RuntimeHelperCombatDefender,
  RuntimeHelperCombatOwner,
  RuntimeHelperCombatStateHooks,
  RuntimeHelperCombatWorld,
} from "./RuntimeHelperCombatSystem";
import type { RuntimeReversalWorld } from "./ReversalSystem";
import type { RuntimeTargetWorld } from "./TargetSystem";

export type RuntimeMatchCombatBridgeActor =
  RuntimeCombatResolutionActor &
  RuntimeHelperCombatOwner &
  RuntimeHelperCombatDefender &
  RuntimeEffectLifecycleActor;

export type RuntimeMatchCombatBridgeInput<TActor extends RuntimeMatchCombatBridgeActor> = {
  combatResolutionWorld: Pick<RuntimeCombatResolutionWorld, "resolvePriorityClash" | "resolveDirect" | "resolveProjectile">;
  helperCombatWorld: Pick<RuntimeHelperCombatWorld, "resolveDirect">;
  directCombatWorld: RuntimeDirectCombatWorld;
  hitOverrideWorld: RuntimeHitOverrideWorld;
  reversalWorld: RuntimeReversalWorld;
  guardWorld: RuntimeGuardWorld;
  getHitStateWorld: RuntimeGetHitStateWorld;
  hitStateTransitionWorld: RuntimeHitStateTransitionWorld;
  contactPresentationWorld: RuntimeContactPresentationWorld;
  effectLifecycleWorld: Pick<RuntimeEffectLifecycleWorld, "markGetHit">;
  targetWorld: RuntimeTargetWorld;
  runtimeTick: number;
  stageBounds?: RuntimeStageBounds;
  getHurtBoxes: (actor: TActor) => CollisionBox[] | undefined;
  combatStateHooks: RuntimeCombatResolutionStateHooks<TActor>;
  helperStateHooks: RuntimeHelperCombatStateHooks<TActor>;
  recordAudioOperation?: (actor: TActor, operation: AudioControllerOp) => void;
  defaultHurtBoxes: CollisionBox[];
  canActorBeHit?: (actorId: string) => boolean;
  rememberProjectileTarget?: (source: TActor, target: TActor, projectile: RuntimeProjectile) => void;
  log: (line: string) => void;
};

export type RuntimeMatchCombatBridgeResolvers<TActor extends RuntimeMatchCombatBridgeActor> = {
  resolvePriorityClash: (left: TActor, right: TActor) => string | undefined;
  resolveDirectCombat: (attacker: TActor, defender: TActor) => void;
  resolveProjectileCombat: (attacker: TActor, defender: TActor) => void;
  resolveHelperCombat: (attacker: TActor, defender: TActor) => void;
};

export class RuntimeMatchCombatBridgeWorld {
  createResolvers<TActor extends RuntimeMatchCombatBridgeActor>(
    input: RuntimeMatchCombatBridgeInput<TActor>,
  ): RuntimeMatchCombatBridgeResolvers<TActor> {
    return {
      resolvePriorityClash: (left, right) =>
        input.combatResolutionWorld.resolvePriorityClash({
          left,
          right,
          directCombatWorld: input.directCombatWorld,
        }),
      resolveDirectCombat: (attacker, defender) => {
        input.combatResolutionWorld.resolveDirect({
          attacker,
          defender,
          directCombatWorld: input.directCombatWorld,
          hitOverrideWorld: input.hitOverrideWorld,
          reversalWorld: input.reversalWorld,
          guardWorld: input.guardWorld,
          getHitStateWorld: input.getHitStateWorld,
          hitStateTransitionWorld: input.hitStateTransitionWorld,
          contactPresentationWorld: input.contactPresentationWorld,
          runtimeTick: input.runtimeTick,
          stageBounds: input.stageBounds,
          getHurtBoxes: input.getHurtBoxes,
          canDefenderBeHit: (defender) => input.canActorBeHit?.(defender.id) ?? true,
          recordAudioOperation: input.recordAudioOperation,
          stateHooks: input.combatStateHooks,
          log: input.log,
        });
      },
      resolveProjectileCombat: (attacker, defender) => {
        input.combatResolutionWorld.resolveProjectile({
          attacker,
          defender,
          hitOverrideWorld: input.hitOverrideWorld,
          reversalWorld: input.reversalWorld,
          effectLifecycleWorld: input.effectLifecycleWorld,
          guardWorld: input.guardWorld,
          getHitStateWorld: input.getHitStateWorld,
          hitStateTransitionWorld: input.hitStateTransitionWorld,
          contactPresentationWorld: input.contactPresentationWorld,
          runtimeTick: input.runtimeTick,
          stageBounds: input.stageBounds,
          getHurtBoxes: input.getHurtBoxes,
          canDefenderBeHit: (defender) => input.canActorBeHit?.(defender.id) ?? true,
          recordAudioOperation: input.recordAudioOperation,
          stateHooks: input.combatStateHooks,
          rememberProjectileTarget: input.rememberProjectileTarget,
          log: input.log,
        });
      },
      resolveHelperCombat: (attacker, defender) => {
        input.helperCombatWorld.resolveDirect({
          owner: attacker,
          defender,
          directCombatWorld: input.directCombatWorld,
          reversalWorld: input.reversalWorld,
          guardWorld: input.guardWorld,
          getHitStateWorld: input.getHitStateWorld,
          contactPresentationWorld: input.contactPresentationWorld,
          targetWorld: input.targetWorld,
          runtimeTick: input.runtimeTick,
          stageBounds: input.stageBounds,
          getHurtBoxes: input.getHurtBoxes,
          canDefenderBeHit: (defender) => input.canActorBeHit?.(defender.id) ?? true,
          stateHooks: input.helperStateHooks,
          recordAudioOperation: (_owner, operation) => input.recordAudioOperation?.(attacker, operation),
          defaultHurtBoxes: input.defaultHurtBoxes,
          log: input.log,
        });
      },
    };
  }
}

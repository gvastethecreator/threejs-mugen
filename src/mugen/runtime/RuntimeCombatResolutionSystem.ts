import type { CollisionBox } from "../model/CollisionBox";
import {
  canRuntimeBeHitBy,
  collisionBoxesIntersect,
  findRuntimeHitOverride,
  hasRuntimeBoxContact,
  hitAttributeMatches,
  resolveRuntimeCombatHit,
  runtimeWorldBox,
} from "./CombatResolver";
import type { RuntimeContactMemory, RuntimeContactMemoryWorld } from "./ContactMemorySystem";
import type { DemoFighterDefinition, DemoMove } from "./demoFighters";
import type { RuntimeDirectCombatOutcome, RuntimeDirectCombatWorld } from "./DirectCombatSystem";
import type { RuntimeEffectActorWorld } from "./EffectActorSystem";
import type { RuntimeGetHitStateWorld } from "./GetHitStateSystem";
import type { RuntimeGuardWorld } from "./GuardSystem";
import type { RuntimeHitOverrideWorld } from "./HitOverrideSystem";
import type {
  RuntimeHitStateEntryOptions,
  RuntimeHitStateTransitionActor,
  RuntimeHitStateTransitionWorld,
} from "./HitStateTransitionSystem";
import { isRuntimeHoldingBack } from "./RuntimeInput";
import type { RuntimeContactPresentationActor, RuntimeContactPresentationWorld } from "./RuntimeContactPresentationSystem";
import type { RuntimeReversalWorld } from "./ReversalSystem";
import type { RuntimeTarget, RuntimeTargetBinding, RuntimeTargetWorld } from "./TargetSystem";
import type { CharacterRuntimeState } from "./types";
import type { RuntimeProjectile } from "./ProjectileSystem";
import type { RuntimeStageBounds } from "./HitDefCornerPush";

const defaultHurtBoxes: CollisionBox[] = [{ x1: -24, y1: -96, x2: 24, y2: 0 }];

export type RuntimeCombatResolutionActor = RuntimeHitStateTransitionActor &
  RuntimeContactPresentationActor & {
    label: string;
    runtime: CharacterRuntimeState;
    currentMove?: DemoMove;
    currentMoveLabel?: string;
    moveTick: number;
    hitStun: number;
    hitPause: number;
    hasHit: boolean;
    contact: RuntimeContactMemory;
    definition: Pick<DemoFighterDefinition, "source" | "constants" | "animations" | "hitSparkLibraries">;
    contactWorld: Pick<RuntimeContactMemoryWorld, "markProjectileContact" | "markReceivedDamage">;
    currentInput: Iterable<string>;
    targetWorld: Pick<RuntimeTargetWorld, "remember">;
    targets: RuntimeTarget[];
    targetBindings: RuntimeTargetBinding[];
    effectActorWorld: Pick<RuntimeEffectActorWorld, "removeExplodsOnGetHit" | "resolveProjectileCombat" | "helpers">;
  };

export type RuntimeCombatResolutionStateHooks<TActor extends RuntimeCombatResolutionActor> = {
  canEnterState: (target: TActor, stateNo: number, stateOwner?: TActor) => boolean;
  enterState: (target: TActor, stateNo: number, options?: RuntimeHitStateEntryOptions<TActor>) => void;
};

export type RuntimeCombatResolutionDirectInput<TActor extends RuntimeCombatResolutionActor> = {
  attacker: TActor;
  defender: TActor;
  directCombatWorld: RuntimeDirectCombatWorld;
  hitOverrideWorld: RuntimeHitOverrideWorld;
  reversalWorld: RuntimeReversalWorld;
  guardWorld: RuntimeGuardWorld;
  getHitStateWorld: RuntimeGetHitStateWorld;
  hitStateTransitionWorld: RuntimeHitStateTransitionWorld;
  contactPresentationWorld: RuntimeContactPresentationWorld;
  runtimeTick: number;
  stageBounds?: RuntimeStageBounds;
  getHurtBoxes?: (actor: TActor) => CollisionBox[] | undefined;
  canDefenderBeHit?: (defender: TActor) => boolean;
  stateHooks: RuntimeCombatResolutionStateHooks<TActor>;
  log: (line: string) => void;
};

export type RuntimeCombatResolutionProjectileInput<TActor extends RuntimeCombatResolutionActor> = {
  attacker: TActor;
  defender: TActor;
  hitOverrideWorld: RuntimeHitOverrideWorld;
  effectLifecycleWorld: { markGetHit: (actor: TActor) => void };
  guardWorld: RuntimeGuardWorld;
  getHitStateWorld: RuntimeGetHitStateWorld;
  hitStateTransitionWorld: RuntimeHitStateTransitionWorld;
  contactPresentationWorld: RuntimeContactPresentationWorld;
  runtimeTick: number;
  stageBounds?: RuntimeStageBounds;
  getHurtBoxes?: (actor: TActor) => CollisionBox[] | undefined;
  canDefenderBeHit?: (defender: TActor) => boolean;
  stateHooks: RuntimeCombatResolutionStateHooks<TActor>;
  rememberProjectileTarget?: (attacker: TActor, defender: TActor, projectile: RuntimeProjectile) => void;
  log: (line: string) => void;
};

export type RuntimeCombatResolutionPriorityInput<TActor extends RuntimeCombatResolutionActor> = {
  left: TActor;
  right: TActor;
  directCombatWorld: RuntimeDirectCombatWorld;
};

export type RuntimeDirectCombatResolutionResult =
  | { kind: "skipped"; reason: RuntimeDirectCombatSkipReason }
  | { kind: "reversal"; message: string }
  | { kind: "hitoverride"; message: string }
  | (RuntimeDirectCombatOutcome & { kind: "hit" | "guard" });

export type RuntimeDirectCombatSkipReason =
  | "missing-move"
  | "already-hit"
  | "compiled-hitdef"
  | "reversal-move"
  | "inactive"
  | "no-contact"
  | "superpause-unhittable"
  | "hitby-rejected"
  | "hitoverride-custom-state-miss";

export class RuntimeCombatResolutionWorld {
  resolvePriorityClash<TActor extends RuntimeCombatResolutionActor>(
    input: RuntimeCombatResolutionPriorityInput<TActor>,
  ): string | undefined {
    return input.directCombatWorld.resolvePriorityClash(input.left, input.right, {
      isMoveActive: runtimeMoveIsActive,
      worldBox: runtimeWorldBox,
      boxesIntersect: collisionBoxesIntersect,
    })?.message;
  }

  resolveDirect<TActor extends RuntimeCombatResolutionActor>(
    input: RuntimeCombatResolutionDirectInput<TActor>,
  ): RuntimeDirectCombatResolutionResult {
    const { attacker, defender } = input;
    if (!attacker.currentMove) {
      return { kind: "skipped", reason: "missing-move" };
    }
    if (attacker.hasHit) {
      return { kind: "skipped", reason: "already-hit" };
    }
    const move = attacker.currentMove;
    if (move.requiresHitDef) {
      return { kind: "skipped", reason: "compiled-hitdef" };
    }
    if (move.isReversal) {
      return { kind: "skipped", reason: "reversal-move" };
    }
    if (!runtimeMoveIsActive(move, attacker.moveTick)) {
      return { kind: "skipped", reason: "inactive" };
    }

    const attackBox = runtimeWorldBox(attacker.runtime, move.hitbox);
    const reversal = input.reversalWorld.findActive(defender, move, attackBox, {
      isMoveActive: runtimeMoveIsActive,
      worldBox: runtimeWorldBox,
      boxesIntersect: collisionBoxesIntersect,
      attrMatches: hitAttributeMatches,
      canDefenderBeHit: input.canDefenderBeHit,
    });
    if (reversal) {
      const outcome = input.reversalWorld.apply(defender, attacker, reversal, {
        rememberTarget: (source, target, targetId) => this.rememberTarget(source, target, targetId),
        canEnterState: input.stateHooks.canEnterState,
        enterState: input.stateHooks.enterState,
        enterTargetHitState: (target, owner, stateNo, getP1State) =>
          input.hitStateTransitionWorld.enterTargetHitState(
            target,
            owner,
            stateNo,
            getP1State,
            this.hitStateTransitionHooks(input.stateHooks),
          ),
      });
      input.log(outcome.message);
      return { kind: "reversal", message: outcome.message };
    }

    const hurtBoxes = input.getHurtBoxes?.(defender) ?? defaultHurtBoxes;
    if (!hasRuntimeBoxContact(attackBox, defender.runtime, hurtBoxes)) {
      return { kind: "skipped", reason: "no-contact" };
    }
    if (input.canDefenderBeHit?.(defender) === false) {
      const message = `${defender.label} rejected ${attacker.label} ${move.attr ?? "S,NA"} via SuperPause unhittable`;
      input.log(message);
      return { kind: "skipped", reason: "superpause-unhittable" };
    }
    if (!canRuntimeBeHitBy(defender.runtime, move.attr ?? "S,NA")) {
      const message = `${defender.label} rejected ${attacker.label} ${move.attr ?? "S,NA"} via HitBy/NotHitBy`;
      input.log(message);
      return { kind: "skipped", reason: "hitby-rejected" };
    }

    const override = findRuntimeHitOverride(defender.runtime, move.attr ?? "S,NA", move.guardFlag ?? "MA");
    if (override) {
      if (shouldRuntimeHitOverrideMissDirect(move)) {
        const missReason =
          move.missOnOverride === true
            ? "because missonoverride = 1 forces active override miss"
            : "because active override cannot receive custom-state HitDef";
        const message = `${defender.label} rejected ${attacker.label} ${move.attr ?? "S,NA"} ${missReason}`;
        input.log(message);
        return { kind: "skipped", reason: "hitoverride-custom-state-miss" };
      }
      attacker.hasHit = true;
      this.rememberTarget(attacker, defender, move.targetId);
      const result = input.hitOverrideWorld.applyRedirect(attacker, defender, override, move.hitPause, {
        tryEnterState: (target, stateNo) => {
          if (!input.stateHooks.canEnterState(target, stateNo)) {
            return false;
          }
          input.stateHooks.enterState(target, stateNo);
          return true;
        },
      });
      input.log(result.message);
      return { kind: "hitoverride", message: result.message };
    }

    attacker.hasHit = true;
    this.rememberTarget(attacker, defender, move.targetId);
    const result = resolveRuntimeCombatHit({
      attacker: attacker.runtime,
      defender: defender.runtime,
      attack: move,
      holdingBack: isRuntimeHoldingBack(defender.currentInput),
    });
    const outcome = input.directCombatWorld.applyResolvedHit(attacker, defender, move, result, {
      applyGuardHit: (target) => this.applyDefaultGuardHitState(target, input.guardWorld, input.stateHooks),
      applyHitStateTransitions: (source, target, moveArg) =>
        input.hitStateTransitionWorld.applyHitStateTransitions(
          source,
          target,
          moveArg,
          this.hitStateTransitionHooks(input.stateHooks),
        ),
      applyDefaultGetHit: (target, moveArg) =>
        this.applyDefaultGetHitState(target, moveArg, input.getHitStateWorld, input.stateHooks),
    }, { stageBounds: input.stageBounds });
    input.contactPresentationWorld.emitHitDefContact({
      attacker,
      defender,
      kind: outcome.kind,
      move,
      runtimeTick: input.runtimeTick,
    });
    input.log(outcome.message);
    return outcome;
  }

  resolveProjectile<TActor extends RuntimeCombatResolutionActor>(
    input: RuntimeCombatResolutionProjectileInput<TActor>,
  ): void {
    const hurtBoxes = input.getHurtBoxes?.(input.defender) ?? defaultHurtBoxes;
    input.attacker.effectActorWorld.resolveProjectileCombat(input.attacker.id, {
      attacker: input.attacker,
      defender: input.defender,
      hurtBoxes,
      holdingBack: isRuntimeHoldingBack(input.defender.currentInput),
      canDefenderBeHit: input.canDefenderBeHit,
      log: input.log,
      rememberTarget: (source, target, targetId, projectile) => {
        this.rememberTarget(source, target, targetId);
        input.rememberProjectileTarget?.(source, target, projectile);
      },
      applyHitOverride: (source, target, override, hitPause, logger) => {
        const result = input.hitOverrideWorld.applyRedirect(source, target, override, hitPause, {
          tryEnterState: (candidate, stateNo) => {
            if (!input.stateHooks.canEnterState(candidate, stateNo)) {
              return false;
            }
            input.stateHooks.enterState(candidate, stateNo);
            return true;
          },
        });
        logger(result.message);
      },
      applyGuardHit: (target) => this.applyDefaultGuardHitState(target, input.guardWorld, input.stateHooks),
      applyHitState: (source, target, projectile) =>
        this.applyProjectileHitState(source, target, projectile, input.hitStateTransitionWorld, input.getHitStateWorld, input.stateHooks),
      markDefenderGotHit: (target) => input.effectLifecycleWorld.markGetHit(target),
      recordProjectileContact: (source, target, projectile, kind) => {
        source.contactWorld.markProjectileContact(source.contact, source.runtime.stateNo, projectile.projectileId, kind, target.id);
        if (projectile.parentId !== source.id) {
          const helper = source.effectActorWorld.helpers(source.id).find((candidate) => candidate.serialId === projectile.parentId);
          if (helper) {
            source.contactWorld.markProjectileContact(helper.contact, helper.stateNo ?? 0, projectile.projectileId, kind, target.id);
          }
        }
      },
      emitProjectileContactEffects: (source, _target, projectile, kind) => {
        input.contactPresentationWorld.emitProjectileContact({ actor: source, projectile, kind, runtimeTick: input.runtimeTick });
      },
      recordReceivedDamage: (target, damage) => {
        target.contactWorld.markReceivedDamage(target.contact, target.runtime.stateNo, damage);
      },
      stageBounds: input.stageBounds,
    });
  }

  private rememberTarget<TActor extends RuntimeCombatResolutionActor>(
    attacker: TActor,
    defender: TActor,
    targetId: number | undefined,
  ): void {
    attacker.targetWorld.remember(attacker, defender.id, targetId);
  }

  private applyDefaultGetHitState<TActor extends RuntimeCombatResolutionActor>(
    defender: TActor,
    move: DemoMove,
    getHitStateWorld: RuntimeGetHitStateWorld,
    stateHooks: RuntimeCombatResolutionStateHooks<TActor>,
  ): void {
    if (move.p2StateNo !== undefined || defender.definition.source !== "imported") {
      return;
    }
    const stateNo =
      move.defaultTargetStateNo ??
      getHitStateWorld.defaultGetHitStateNo(defender.runtime, (candidate) => stateHooks.canEnterState(defender, candidate));
    if (stateNo === undefined || !stateHooks.canEnterState(defender, stateNo)) {
      return;
    }
    stateHooks.enterState(defender, stateNo, { clearStateOwner: true });
  }

  private applyDefaultGuardHitState<TActor extends RuntimeCombatResolutionActor>(
    defender: TActor,
    guardWorld: RuntimeGuardWorld,
    stateHooks: RuntimeCombatResolutionStateHooks<TActor>,
  ): void {
    if (defender.definition.source !== "imported") {
      return;
    }
    const stateNo = guardWorld.defaultGuardHitStateNo(defender.runtime, (candidate) => stateHooks.canEnterState(defender, candidate));
    if (stateNo === undefined || !stateHooks.canEnterState(defender, stateNo)) {
      return;
    }
    stateHooks.enterState(defender, stateNo, { clearStateOwner: true });
  }

  private applyDefaultProjectileGetHitState<TActor extends RuntimeCombatResolutionActor>(
    defender: TActor,
    getHitStateWorld: RuntimeGetHitStateWorld,
    stateHooks: RuntimeCombatResolutionStateHooks<TActor>,
  ): void {
    if (defender.definition.source !== "imported") {
      return;
    }
    const stateNo = getHitStateWorld.defaultGetHitStateNo(defender.runtime, (candidate) => stateHooks.canEnterState(defender, candidate));
    if (stateNo === undefined || !stateHooks.canEnterState(defender, stateNo)) {
      return;
    }
    stateHooks.enterState(defender, stateNo, { clearStateOwner: true });
  }

  private applyProjectileHitState<TActor extends RuntimeCombatResolutionActor>(
    attacker: TActor,
    defender: TActor,
    projectile: RuntimeProjectile,
    hitStateTransitionWorld: RuntimeHitStateTransitionWorld,
    getHitStateWorld: RuntimeGetHitStateWorld,
    stateHooks: RuntimeCombatResolutionStateHooks<TActor>,
  ): void {
    if (projectile.p2StateNo !== undefined) {
      hitStateTransitionWorld.enterTargetHitState(
        defender,
        attacker,
        projectile.p2StateNo,
        projectile.p2GetP1State ?? true,
        this.hitStateTransitionHooks(stateHooks),
      );
      return;
    }
    this.applyDefaultProjectileGetHitState(defender, getHitStateWorld, stateHooks);
  }

  private hitStateTransitionHooks<TActor extends RuntimeCombatResolutionActor>(
    stateHooks: RuntimeCombatResolutionStateHooks<TActor>,
  ): RuntimeCombatResolutionStateHooks<TActor> {
    return stateHooks;
  }
}

function shouldRuntimeHitOverrideMissDirect(move: DemoMove): boolean {
  if (move.missOnOverride !== undefined) {
    return move.missOnOverride;
  }
  return move.p1StateNo !== undefined || move.p2StateNo !== undefined;
}

function runtimeMoveIsActive(move: DemoMove, tick: number): boolean {
  return tick >= move.activeStart && tick <= move.activeEnd;
}

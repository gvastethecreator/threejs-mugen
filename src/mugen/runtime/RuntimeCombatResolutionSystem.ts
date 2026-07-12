import type { AudioControllerOp } from "../compiler/ControllerOps";
import type { CollisionBox } from "../model/CollisionBox";
import {
  canRuntimeBeHitBy,
  collisionBoxesIntersect,
  findRuntimeHitOverride,
  hasRuntimeBoxContact,
  hitAttributeMatches,
  resolveRuntimeCombatHit,
  runtimeWorldBox,
  type RuntimeCombatHitResult,
} from "./CombatResolver";
import type { RuntimeContactMemory, RuntimeContactMemoryWorld } from "./ContactMemorySystem";
import type { DemoFighterDefinition, DemoMove } from "./demoFighters";
import {
  interruptRuntimeDirectMove,
  type RuntimeDirectCombatOutcome,
  type RuntimeDirectCombatWorld,
} from "./DirectCombatSystem";
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
import {
  bufferRuntimeHitDefTarget,
  hasRuntimeHitDefTarget,
  type RuntimeHitDefContactMemoryActor,
} from "./RuntimeHitDefContactMemorySystem";

const defaultHurtBoxes: CollisionBox[] = [{ x1: -24, y1: -96, x2: 24, y2: 0 }];

function directTradeKey(leftId: string, rightId: string): string {
  return leftId < rightId ? `${leftId}\u0000${rightId}` : `${rightId}\u0000${leftId}`;
}

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
    hitDefTargets?: RuntimeHitDefContactMemoryActor["hitDefTargets"];
    pendingHitDefTargets?: RuntimeHitDefContactMemoryActor["pendingHitDefTargets"];
    contact: RuntimeContactMemory;
    definition: Pick<
      DemoFighterDefinition,
      "source" | "constants" | "animations" | "hitSparkLibraries" | "hitDefPriorityProfile"
    >;
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
  recordAudioOperation?: (actor: TActor, operation: AudioControllerOp) => void;
  stateHooks: RuntimeCombatResolutionStateHooks<TActor>;
  log: (line: string) => void;
};

export type RuntimeCombatResolutionProjectileInput<TActor extends RuntimeCombatResolutionActor> = {
  attacker: TActor;
  defender: TActor;
  hitOverrideWorld: RuntimeHitOverrideWorld;
  reversalWorld: RuntimeReversalWorld;
  effectLifecycleWorld: { markGetHit: (actor: TActor) => void };
  guardWorld: RuntimeGuardWorld;
  getHitStateWorld: RuntimeGetHitStateWorld;
  hitStateTransitionWorld: RuntimeHitStateTransitionWorld;
  contactPresentationWorld: RuntimeContactPresentationWorld;
  runtimeTick: number;
  stageBounds?: RuntimeStageBounds;
  getHurtBoxes?: (actor: TActor) => CollisionBox[] | undefined;
  canDefenderBeHit?: (defender: TActor) => boolean;
  recordAudioOperation?: (actor: TActor, operation: AudioControllerOp) => void;
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
  private readonly equalPriorityHitTrades = new Map<string, {
    leftId: string;
    rightId: string;
    leftMove: DemoMove;
    rightMove: DemoMove;
    message: string;
  }>();

  resolvePriorityClash<TActor extends RuntimeCombatResolutionActor>(
    input: RuntimeCombatResolutionPriorityInput<TActor>,
  ): string | undefined {
    const outcome = input.directCombatWorld.resolvePriorityClash(input.left, input.right, {
      isMoveActive: runtimeMoveIsActive,
      worldBox: runtimeWorldBox,
      boxesIntersect: collisionBoxesIntersect,
    });
    const tradeKey = directTradeKey(input.left.id, input.right.id);
    if (outcome?.kind === "trade" && input.left.currentMove && input.right.currentMove) {
      this.equalPriorityHitTrades.set(tradeKey, {
        leftId: input.left.id,
        rightId: input.right.id,
        leftMove: input.left.currentMove,
        rightMove: input.right.currentMove,
        message: outcome.message,
      });
    }
    else this.equalPriorityHitTrades.delete(tradeKey);
    return outcome?.kind === "trade" ? undefined : outcome?.message;
  }

  resolveDirect<TActor extends RuntimeCombatResolutionActor>(
    input: RuntimeCombatResolutionDirectInput<TActor>,
  ): RuntimeDirectCombatResolutionResult {
    const { attacker, defender } = input;
    if (!attacker.currentMove) {
      return { kind: "skipped", reason: "missing-move" };
    }
    if (hasExplicitHitDefContactMemory(attacker)
      ? hasRuntimeHitDefTarget(attacker, defender.id)
      : attacker.hasHit) {
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
      bufferRuntimeHitDefTarget(defender, attacker.id);
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
      bufferRuntimeHitDefTarget(attacker, defender.id);
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
    bufferRuntimeHitDefTarget(attacker, defender.id);
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
    }, {
      stageBounds: input.stageBounds,
      hitDefPriorityProfile: attacker.definition.hitDefPriorityProfile,
    });
    input.contactPresentationWorld.emitHitDefContact({
      attacker,
      defender,
      kind: outcome.kind,
      move,
      runtimeTick: input.runtimeTick,
      recordAudioOperation: input.recordAudioOperation,
    });
    input.log(outcome.message);
    return outcome;
  }

  resolveEqualPriorityHitTrades<TActor extends RuntimeCombatResolutionActor>(
    input: Omit<RuntimeCombatResolutionDirectInput<TActor>, "attacker" | "defender"> & { actors: readonly TActor[] },
  ): number {
    const pending = [...this.equalPriorityHitTrades.values()];
    this.equalPriorityHitTrades.clear();
    if (pending.length === 0) return 0;
    const actorsById = new Map(input.actors.map((actor) => [actor.id, actor]));
    const preparedHits: Array<{ attacker: TActor; defender: TActor; move: DemoMove; result: RuntimeCombatHitResult }> = [];
    const interruptedMoves = new Map<TActor, DemoMove>();
    let resolvedPairs = 0;
    for (const trade of pending) {
      const left = actorsById.get(trade.leftId);
      const right = actorsById.get(trade.rightId);
      if (!left || !right || left.currentMove !== trade.leftMove || right.currentMove !== trade.rightMove) continue;
      const first = this.prepareEqualPriorityHit(input, left, right);
      const second = this.prepareEqualPriorityHit(input, right, left);
      if (!first || !second) continue;
      input.log(trade.message);
      preparedHits.push(first, second);
      interruptedMoves.set(left, trade.leftMove);
      interruptedMoves.set(right, trade.rightMove);
      resolvedPairs += 1;
    }
    for (const prepared of preparedHits) {
      prepared.attacker.hasHit = true;
      bufferRuntimeHitDefTarget(prepared.attacker, prepared.defender.id);
      this.rememberTarget(prepared.attacker, prepared.defender, prepared.move.targetId);
    }
    for (const prepared of preparedHits) this.applyEqualPriorityHit(input, prepared);
    for (const [actor, move] of interruptedMoves) interruptRuntimeDirectMove(actor, move);
    return resolvedPairs;
  }

  private prepareEqualPriorityHit<TActor extends RuntimeCombatResolutionActor>(
    input: Omit<RuntimeCombatResolutionDirectInput<TActor>, "attacker" | "defender">,
    attacker: TActor,
    defender: TActor,
  ): { attacker: TActor; defender: TActor; move: DemoMove; result: RuntimeCombatHitResult } | undefined {
    const move = attacker.currentMove;
    if (!move
      || (hasExplicitHitDefContactMemory(attacker) ? hasRuntimeHitDefTarget(attacker, defender.id) : attacker.hasHit)
      || move.requiresHitDef
      || move.isReversal
      || !runtimeMoveIsActive(move, attacker.moveTick)) {
      return undefined;
    }
    const attackBox = runtimeWorldBox(attacker.runtime, move.hitbox);
    if (input.reversalWorld.findActive(defender, move, attackBox, {
      isMoveActive: runtimeMoveIsActive,
      worldBox: runtimeWorldBox,
      boxesIntersect: collisionBoxesIntersect,
      attrMatches: hitAttributeMatches,
    })) return undefined;
    const hurtBoxes = input.getHurtBoxes?.(defender) ?? defaultHurtBoxes;
    if (!hasRuntimeBoxContact(attackBox, defender.runtime, hurtBoxes)
      || input.canDefenderBeHit?.(defender) === false
      || !canRuntimeBeHitBy(defender.runtime, move.attr ?? "S,NA")
      || findRuntimeHitOverride(defender.runtime, move.attr ?? "S,NA", move.guardFlag ?? "MA")) {
      return undefined;
    }
    return {
      attacker,
      defender,
      move,
      result: resolveRuntimeCombatHit({
        attacker: attacker.runtime,
        defender: defender.runtime,
        attack: move,
        holdingBack: isRuntimeHoldingBack(defender.currentInput),
      }),
    };
  }

  private applyEqualPriorityHit<TActor extends RuntimeCombatResolutionActor>(
    input: Omit<RuntimeCombatResolutionDirectInput<TActor>, "attacker" | "defender">,
    prepared: { attacker: TActor; defender: TActor; move: DemoMove; result: RuntimeCombatHitResult },
  ): RuntimeDirectCombatOutcome {
    const { attacker, defender, move, result } = prepared;
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
    }, {
      stageBounds: input.stageBounds,
      hitDefPriorityProfile: attacker.definition.hitDefPriorityProfile,
      preserveDefenderMove: true,
    });
    input.contactPresentationWorld.emitHitDefContact({
      attacker,
      defender,
      kind: outcome.kind,
      move,
      runtimeTick: input.runtimeTick,
      recordAudioOperation: input.recordAudioOperation,
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
      applyProjectileReversal: (source, target, projectile, attackBox) => {
        const incomingMove = runtimeProjectileIncomingMove(projectile);
        const reversal = input.reversalWorld.findActive(target, incomingMove, attackBox, {
          isMoveActive: runtimeMoveIsActive,
          worldBox: runtimeWorldBox,
          boxesIntersect: collisionBoxesIntersect,
          attrMatches: hitAttributeMatches,
        });
        if (!reversal) {
          return false;
        }
        const outcome = input.reversalWorld.apply(target, source, reversal, {
          rememberTarget: (reverser, attacker, targetId) => this.rememberTarget(reverser, attacker, targetId),
          canEnterState: input.stateHooks.canEnterState,
          enterState: input.stateHooks.enterState,
          enterTargetHitState: (attacker, reverser, stateNo, getP1State) =>
            input.hitStateTransitionWorld.enterTargetHitState(
              attacker,
              reverser,
              stateNo,
              getP1State,
              this.hitStateTransitionHooks(input.stateHooks),
            ),
        });
        input.log(outcome.message);
        return true;
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
        input.contactPresentationWorld.emitProjectileContact({
          actor: source,
          projectile,
          kind,
          runtimeTick: input.runtimeTick,
          recordAudioOperation: input.recordAudioOperation,
        });
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

function hasExplicitHitDefContactMemory(actor: RuntimeCombatResolutionActor): boolean {
  return actor.hitDefTargets !== undefined || actor.pendingHitDefTargets !== undefined;
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

function runtimeProjectileIncomingMove(projectile: RuntimeProjectile): DemoMove {
  return {
    actionId: projectile.animNo,
    startup: 0,
    activeStart: 0,
    activeEnd: Number.MAX_SAFE_INTEGER,
    recovery: 0,
    damage: projectile.damage,
    attr: projectile.attr ?? "S,SP",
    targetId: projectile.targetId,
    hitPause: projectile.hitPause,
    hitStun: projectile.hitStun,
    push: projectile.push,
    guardFlag: projectile.guardFlag,
    hitbox: projectile.hitbox,
  };
}

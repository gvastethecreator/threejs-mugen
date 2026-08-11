import type { ModifyReversalDefControllerOp, ReversalDefControllerOp, MugenHitDefExpressionPair } from "../compiler/ControllerOps";
import type { ControllerIr } from "../compiler/RuntimeIr";
import type { CollisionBox } from "../model/CollisionBox";
import type { MugenStateController } from "../model/MugenState";
import type { DemoFighterDefinition, DemoMove } from "./demoFighters";
import type { RuntimeEffectActorWorld } from "./EffectActorSystem";
import { markRuntimeEffectActorGotHit } from "./EffectLifecycleSystem";
import { RuntimeContactMemoryWorld, type RuntimeContactMemory } from "./ContactMemorySystem";
import { runtimeGuardFlagOverlaps } from "./CombatResolver";
import { applyRuntimeHitDefSpritePriorityContact } from "./HitDefSpritePrioritySystem";
import { applyRuntimePowerDelta } from "./RuntimeResourceSystem";
import { resetRuntimeHitDefContactMemory, type RuntimeHitDefContactMemoryActor } from "./RuntimeHitDefContactMemorySystem";
import { findControllerParam } from "./StateProgramExecutor";
import { markRuntimeHitTmpReversal } from "./RuntimeHitTmpSystem";
import { evaluateRuntimeControllerNumber, type RuntimeControllerEvaluationContext } from "./RuntimeControllerExpressionContextSystem";
import {
  applyRuntimeAttackerUnhittableTime,
  applyRuntimeReceiverUnhittableTime,
} from "./RuntimeUnhittableTimeSystem";
import type { CharacterRuntimeState } from "./types";

export type RuntimeReversalActor = {
  id: string;
  label: string;
  definition: Pick<DemoFighterDefinition, "constants" | "hitDefPriorityProfile">;
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
  effectActorWorld: Pick<RuntimeEffectActorWorld, "removeExplodsOnGetHit">;
};

export type RuntimeReversalActivation = {
  attr: string;
  reversalGuardFlag?: string;
  reversalGuardFlagNot?: string;
  hitDefAttr?: string;
  guardFlag?: string;
  missOnOverride?: boolean;
  hitbox?: CollisionBox;
  label?: string;
  hitPause: number;
  hitShakeTime?: number;
  hitCount?: number;
  p1SpritePriority?: number;
  p2SpritePriority?: number;
  p1StateNo?: number;
  p2StateNo?: number;
  p2GetP1State?: boolean;
  p1Facing?: number;
  p1GetP2Facing?: number;
  p2Facing?: number;
  targetId?: number;
  /** Resolved ReversalDef chain-id requirement; negative values disable the requirement. */
  chainId?: number;
  attackDepth?: [number, number];
  unhittableTime?: [number, number];
};

export type RuntimeReversalHooks<TActor extends RuntimeReversalActor = RuntimeReversalActor> = {
  isMoveActive: (move: DemoMove, tick: number) => boolean;
  worldBox: (state: CharacterRuntimeState, box: CollisionBox) => CollisionBox;
  boxesIntersect: (left: CollisionBox, right: CollisionBox) => boolean;
  attrMatches: (reversalAttr: string, incomingAttr: string) => boolean;
  canDefenderBeHit?: (defender: TActor) => boolean;
  rememberTarget: (attacker: TActor, defender: TActor, targetId: number | undefined) => void;
  canEnterState: (actor: TActor, stateNo: number) => boolean;
  enterState: (actor: TActor, stateNo: number) => void;
  enterTargetHitState: (target: TActor, owner: TActor, stateNo: number, getP1State: boolean) => void;
};

export type RuntimeReversalApplyHooks<
  TReverser extends RuntimeReversalActor = RuntimeReversalActor,
  TAttacker extends RuntimeReversalActor = TReverser,
> = {
  rememberTarget: (reverser: TReverser, attacker: TAttacker, targetId: number | undefined) => void;
  canEnterState: (actor: TReverser, stateNo: number) => boolean;
  enterState: (actor: TReverser, stateNo: number) => void;
  enterTargetHitState: (target: TAttacker, owner: TReverser, stateNo: number, getP1State: boolean) => void;
};

export type RuntimeReversalOutcome = {
  p1StateNo?: number;
  p2StateNo?: number;
  message: string;
};

export type RuntimeReversalIncomingOptions = {
  incomingUnguardable?: boolean;
};

export type RuntimeReversalControllerDispatchOptions<TActor extends RuntimeReversalActor> = {
  actor: TActor;
  controller: ControllerIr;
  hitbox?: CollisionBox;
  reversalWorld: RuntimeReversalWorld;
  context?: RuntimeControllerEvaluationContext;
  recordController?: (actor: TActor, controller: MugenStateController) => void;
  recordOperation?: (actor: TActor, operation: ReversalDefControllerOp) => void;
};

export type RuntimeReversalControllerDispatchResult = {
  activated: boolean;
  recordedController: boolean;
  recordedOperation: boolean;
  operation?: ReversalDefControllerOp;
};

export type RuntimeModifyReversalDefControllerDispatchOptions<TActor extends RuntimeReversalActor> = {
  actor: TActor;
  controller: ControllerIr;
  /** Original controller caller; redirects mutate a receiver but evaluate expressions here. */
  context?: RuntimeControllerEvaluationContext;
  recordController?: (actor: TActor, controller: MugenStateController) => void;
  recordOperation?: (actor: TActor, operation: ModifyReversalDefControllerOp) => void;
};

export type RuntimeModifyReversalDefControllerDispatchResult = {
  modified: boolean;
  reason?: "unsupported-operation" | "missing-active-reversal";
  recordedController: boolean;
  recordedOperation: boolean;
  operation?: ModifyReversalDefControllerOp;
};

export class RuntimeReversalControllerDispatchWorld {
  apply<TActor extends RuntimeReversalActor>({
    actor,
    controller,
    hitbox,
    reversalWorld,
    context,
    recordController,
    recordOperation,
  }: RuntimeReversalControllerDispatchOptions<TActor>): RuntimeReversalControllerDispatchResult {
    const source = controller.source;
    const operation = controller.operation?.kind === "reversaldef" ? controller.operation : undefined;
    recordController?.(actor, source);
    if (operation) {
      recordOperation?.(actor, operation);
    }
    const pauseTimeRaw = findParam(source, "pausetime");
    const pauseOperationValue = operation?.pauseTimeExpressions
      ?? (pauseTimeRaw === undefined && operation?.hitPause !== undefined ? [operation.hitPause] : undefined);
    const pauseTime = resolveRuntimeReversalPausePair(
      pauseOperationValue,
      pauseTimeRaw,
      actor.runtime,
      context,
      [0, 0],
      false,
    );
    const hitPause = pauseTime[0] ?? 0;
    const hitShakeTime = pauseTime[1] ?? 0;
    const resolvedTargetId = resolveRuntimeReversalInteger(
      operation?.targetIdExpression ?? operation?.targetId,
      findParam(source, "id"),
      actor.runtime,
      context,
    );
    const resolvedChainId = resolveRuntimeReversalInteger(
      operation?.chainId,
      findParam(source, "chainid"),
      actor.runtime,
      context,
    );
    const activated = reversalWorld.activate(actor, {
      attr: (operation?.attr ?? stripMugenString(findParam(source, "reversal.attr")))?.trim() ?? "",
      reversalGuardFlag: operation?.reversalGuardFlag,
      reversalGuardFlagNot: operation?.reversalGuardFlagNot,
      hitDefAttr: operation?.hitDefAttr,
      guardFlag: operation?.guardFlag,
      missOnOverride: operation?.missOnOverride,
      hitbox,
      label: source.name ?? "ReversalDef",
      hitPause,
      hitShakeTime,
      hitCount: resolveRuntimeReversalInteger(
        operation?.hitCountExpression ?? operation?.hitCount,
        findParam(source, "numhits"),
        actor.runtime,
        context,
      ) ?? staticReversalHitCount(findParam(source, "numhits")),
      p1SpritePriority: resolveRuntimeReversalInteger(
        operation?.p1SpritePriorityExpression ?? operation?.p1SpritePriority,
        findParam(source, "p1sprpriority"),
        actor.runtime,
        context,
      ),
      p2SpritePriority: resolveRuntimeReversalInteger(
        operation?.p2SpritePriorityExpression ?? operation?.p2SpritePriority,
        findParam(source, "p2sprpriority"),
        actor.runtime,
        context,
      ),
      p1StateNo: resolveRuntimeReversalStateNo(
        operation?.p1StateNo,
        findParam(source, "p1stateno"),
        actor.runtime,
        context,
      ),
      p2StateNo: resolveRuntimeReversalStateNo(
        operation?.p2StateNo,
        findParam(source, "p2stateno"),
        actor.runtime,
        context,
      ),
      p2GetP1State: resolveRuntimeReversalBoolean(
        operation?.p2GetP1State,
        findParam(source, "p2getp1state"),
        actor.runtime,
        context,
      ),
      p1Facing: resolveRuntimeReversalInteger(
        operation?.p1Facing,
        findParam(source, "p1facing"),
        actor.runtime,
        context,
      ),
      p1GetP2Facing: resolveRuntimeReversalInteger(
        operation?.p1GetP2Facing,
        findParam(source, "p1getp2facing"),
        actor.runtime,
        context,
      ),
      p2Facing: resolveRuntimeReversalInteger(
        operation?.p2Facing,
        findParam(source, "p2facing"),
        actor.runtime,
        context,
      ),
      targetId: resolvedTargetId === undefined ? undefined : Math.max(0, resolvedTargetId),
      chainId: resolvedChainId !== undefined && resolvedChainId >= 0 ? resolvedChainId : undefined,
      attackDepth:
        operation?.attackDepth ??
        resolveRuntimeReversalFloatPair(
          operation?.attackDepthExpressions,
          findParam(source, "attack.depth"),
          actor.runtime,
          context,
          actor.runtime.combatDepth?.attack,
        ) ?? actor.runtime.combatDepth?.attack,
      unhittableTime: resolveRuntimeReversalIntegerPair(
        operation?.unhittableTime,
        findParam(source, "unhittabletime"),
        actor.runtime,
        context,
        [-1, Math.trunc(hitPause) + 1],
      ),
    });
    return {
      activated,
      recordedController: recordController !== undefined,
      recordedOperation: operation !== undefined && recordOperation !== undefined,
      ...(operation ? { operation } : {}),
    };
  }

  modify<TActor extends RuntimeReversalActor>({
    actor,
    controller,
    context,
    recordController,
    recordOperation,
  }: RuntimeModifyReversalDefControllerDispatchOptions<TActor>): RuntimeModifyReversalDefControllerDispatchResult {
    const operation = controller.operation?.kind === "modifyreversaldef" ? controller.operation : undefined;
    if (!operation) {
      return {
        modified: false,
        reason: "unsupported-operation",
        recordedController: false,
        recordedOperation: false,
      };
    }

    const existing = actor.currentMove;
    const runtimeReversal = actor.runtime.reversal;
    if (!existing?.isReversal || !existing.reversalAttr || !runtimeReversal?.attr) {
      return {
        modified: false,
        reason: "missing-active-reversal",
        recordedController: false,
        recordedOperation: false,
      };
    }

    if (operation.reversalAttr !== undefined) {
      existing.reversalAttr = operation.reversalAttr;
      runtimeReversal.attr = operation.reversalAttr;
    }
    if (operation.reversalGuardFlag !== undefined) {
      existing.reversalGuardFlag = operation.reversalGuardFlag;
      runtimeReversal.reversalGuardFlag = operation.reversalGuardFlag;
    }
    if (operation.reversalGuardFlagNot !== undefined) {
      existing.reversalGuardFlagNot = operation.reversalGuardFlagNot;
      runtimeReversal.reversalGuardFlagNot = operation.reversalGuardFlagNot;
    }
    if (operation.hitDefAttr !== undefined) {
      existing.attr = operation.hitDefAttr;
      runtimeReversal.hitDefAttr = operation.hitDefAttr;
    }
    if (operation.guardFlag !== undefined) {
      existing.guardFlag = operation.guardFlag;
      runtimeReversal.guardFlag = operation.guardFlag;
    }
    if (operation.missOnOverride !== undefined) {
      existing.missOnOverride = operation.missOnOverride;
      runtimeReversal.missOnOverride = operation.missOnOverride;
    }
    const pauseTimeRaw = findParam(controller.source, "pausetime");
    const pauseOperationValue = operation.pauseTimeExpressions
      ?? (pauseTimeRaw === undefined && operation.hitPause !== undefined ? [operation.hitPause] : undefined);
    const pauseTime = resolveRuntimeReversalPausePair(
      pauseOperationValue,
      pauseTimeRaw,
      actor.runtime,
      context,
      [existing.hitPause, existing.hitShakeTime ?? 0],
      true,
    );
    if (pauseTime[0] !== undefined) {
      existing.hitPause = pauseTime[0];
      runtimeReversal.hitPause = pauseTime[0];
    }
    if (pauseTime[1] !== undefined) {
      existing.hitShakeTime = pauseTime[1];
      runtimeReversal.hitShakeTime = pauseTime[1];
    }
    const hitCount = resolveRuntimeReversalInteger(
      operation.hitCountExpression ?? operation.hitCount,
      undefined,
      actor.runtime,
      context,
    );
    if ((operation.hitCountExpression !== undefined || operation.hitCount !== undefined) && hitCount !== undefined) {
      existing.hitVars = { ...existing.hitVars, hitCount };
      runtimeReversal.hitCount = hitCount;
    }
    const p1SpritePriority = resolveRuntimeReversalInteger(
      operation.p1SpritePriorityExpression ?? operation.p1SpritePriority,
      undefined,
      actor.runtime,
      context,
    );
    if ((operation.p1SpritePriorityExpression !== undefined || operation.p1SpritePriority !== undefined) && p1SpritePriority !== undefined) {
      existing.p1SpritePriority = p1SpritePriority;
      runtimeReversal.p1SpritePriority = p1SpritePriority;
    }
    const p2SpritePriority = resolveRuntimeReversalInteger(
      operation.p2SpritePriorityExpression ?? operation.p2SpritePriority,
      undefined,
      actor.runtime,
      context,
    );
    if ((operation.p2SpritePriorityExpression !== undefined || operation.p2SpritePriority !== undefined) && p2SpritePriority !== undefined) {
      existing.p2SpritePriority = p2SpritePriority;
      runtimeReversal.p2SpritePriority = p2SpritePriority;
    }
    const p1StateNo = resolveRuntimeReversalStateNo(operation.p1StateNo, undefined, actor.runtime, context);
    if (operation.p1StateNo !== undefined && p1StateNo !== undefined) {
      existing.p1StateNo = p1StateNo;
      runtimeReversal.p1StateNo = p1StateNo;
    }
    const p2StateNo = resolveRuntimeReversalStateNo(operation.p2StateNo, undefined, actor.runtime, context);
    if (operation.p2StateNo !== undefined && p2StateNo !== undefined) {
      existing.p2StateNo = p2StateNo;
      runtimeReversal.p2StateNo = p2StateNo;
    }
    const p2GetP1State = resolveRuntimeReversalBoolean(operation.p2GetP1State, undefined, actor.runtime, context);
    if (operation.p2GetP1State !== undefined && p2GetP1State !== undefined) {
      existing.p2GetP1State = p2GetP1State;
      runtimeReversal.p2GetP1State = p2GetP1State;
    }
    const p1Facing = resolveRuntimeReversalInteger(operation.p1Facing, undefined, actor.runtime, context);
    if (operation.p1Facing !== undefined && p1Facing !== undefined) {
      existing.p1Facing = p1Facing;
      runtimeReversal.p1Facing = p1Facing;
    }
    const p1GetP2Facing = resolveRuntimeReversalInteger(operation.p1GetP2Facing, undefined, actor.runtime, context);
    if (operation.p1GetP2Facing !== undefined && p1GetP2Facing !== undefined) {
      existing.p1GetP2Facing = p1GetP2Facing;
      runtimeReversal.p1GetP2Facing = p1GetP2Facing;
    }
    const p2Facing = resolveRuntimeReversalInteger(operation.p2Facing, undefined, actor.runtime, context);
    if (operation.p2Facing !== undefined && p2Facing !== undefined) {
      existing.p2Facing = p2Facing;
      runtimeReversal.p2Facing = p2Facing;
    }
    if (operation.targetId !== undefined || operation.targetIdExpression !== undefined) {
      const targetId = resolveRuntimeReversalInteger(
        operation.targetIdExpression ?? operation.targetId,
        findParam(controller.source, "id"),
        actor.runtime,
        context,
      );
      if (targetId !== undefined) {
        existing.targetId = Math.max(0, targetId);
        existing.hitVars = { ...(existing.hitVars ?? {}), hitId: existing.targetId };
        runtimeReversal.targetId = existing.targetId;
      }
    }
    if (operation.chainId !== undefined) {
      const chainId = resolveRuntimeReversalInteger(
        operation.chainId,
        findParam(controller.source, "chainid"),
        actor.runtime,
        context,
      );
      if (chainId !== undefined) {
        const normalizedChainId = chainId >= 0 ? chainId : undefined;
        existing.chainId = normalizedChainId;
        runtimeReversal.chainId = normalizedChainId;
      }
    }
    const attackDepth = operation.attackDepth ?? resolveRuntimeReversalFloatPair(
      operation.attackDepthExpressions,
      findParam(controller.source, "attack.depth"),
      actor.runtime,
      context,
      existing.attackDepth ?? runtimeReversal.attackDepth,
      true,
    );
    if (attackDepth !== undefined) {
      existing.attackDepth = [...attackDepth] as [number, number];
      runtimeReversal.attackDepth = [...attackDepth] as [number, number];
    }
    recordController?.(actor, controller.source);
    recordOperation?.(actor, operation);
    return {
      modified: true,
      recordedController: recordController !== undefined,
      recordedOperation: recordOperation !== undefined,
      operation,
    };
  }
}

export class RuntimeReversalWorld {
  constructor(private readonly contactWorld: RuntimeContactMemoryWorld = new RuntimeContactMemoryWorld()) {}

  activate<TActor extends RuntimeReversalActor>(fighter: TActor, activation: RuntimeReversalActivation): boolean {
    const attr = activation.attr.trim();
    if (!attr) {
      this.clear(fighter, true);
      return false;
    }
    if (!activation.hitbox) {
      fighter.runtime.reversal = undefined;
      return false;
    }
    const hitDefAttr = activation.hitDefAttr?.trim() || "S,NA";
    const hitCount = normalizedReversalHitCount(activation.hitCount);
    const chainId = activation.chainId !== undefined && Number.isFinite(activation.chainId) && activation.chainId >= 0
      ? Math.trunc(activation.chainId)
      : undefined;
    fighter.currentMove = {
      actionId: fighter.runtime.stateNo,
      startup: 0,
      activeStart: 0,
      activeEnd: 3600,
      recovery: 3600,
      damage: 0,
      attr: hitDefAttr,
      targetId: activation.targetId,
      ...(chainId === undefined ? {} : { chainId }),
      isReversal: true,
      reversalAttr: attr,
      reversalGuardFlag: activation.reversalGuardFlag,
      reversalGuardFlagNot: activation.reversalGuardFlagNot,
      guardFlag: activation.guardFlag,
      missOnOverride: activation.missOnOverride,
      p1SpritePriority: activation.p1SpritePriority,
      p2SpritePriority: activation.p2SpritePriority,
      p1StateNo: activation.p1StateNo,
      p2StateNo: activation.p2StateNo,
      p2GetP1State: activation.p2GetP1State,
      p1Facing: activation.p1Facing,
      p1GetP2Facing: activation.p1GetP2Facing,
      p2Facing: activation.p2Facing,
      hitPause: activation.hitPause,
      ...(activation.hitShakeTime === undefined ? {} : { hitShakeTime: activation.hitShakeTime }),
      hitVars: {
        hitCount,
        ...(activation.targetId === undefined ? {} : { hitId: Math.max(0, activation.targetId) }),
      },
      ...(activation.attackDepth ? { attackDepth: [...activation.attackDepth] as [number, number] } : {}),
      ...(activation.unhittableTime ? { unhittableTime: [...activation.unhittableTime] as [number, number] } : {}),
      hitStun: 0,
      push: 0,
      hitbox: cloneBox(activation.hitbox),
    };
    fighter.currentMoveLabel = activation.label ?? "ReversalDef";
    fighter.hasHit = false;
    resetRuntimeHitDefContactMemory(fighter);
    fighter.runtime.reversal = {
      attr,
      hitPause: activation.hitPause,
      ...(activation.reversalGuardFlag === undefined ? {} : { reversalGuardFlag: activation.reversalGuardFlag }),
      ...(activation.reversalGuardFlagNot === undefined ? {} : { reversalGuardFlagNot: activation.reversalGuardFlagNot }),
      ...(activation.hitDefAttr === undefined ? {} : { hitDefAttr }),
      ...(activation.guardFlag === undefined ? {} : { guardFlag: activation.guardFlag }),
      ...(activation.missOnOverride === undefined ? {} : { missOnOverride: activation.missOnOverride }),
      ...(activation.p1SpritePriority === undefined ? {} : { p1SpritePriority: activation.p1SpritePriority }),
      ...(activation.p2SpritePriority === undefined ? {} : { p2SpritePriority: activation.p2SpritePriority }),
      ...(activation.attackDepth ? { attackDepth: [...activation.attackDepth] as [number, number] } : {}),
      ...(activation.unhittableTime ? { unhittableTime: [...activation.unhittableTime] as [number, number] } : {}),
      ...(activation.p1StateNo !== undefined ? { p1StateNo: activation.p1StateNo } : {}),
      ...(activation.p2StateNo !== undefined ? { p2StateNo: activation.p2StateNo } : {}),
      ...(activation.p2GetP1State === undefined ? {} : { p2GetP1State: activation.p2GetP1State }),
      ...(activation.p1Facing === undefined ? {} : { p1Facing: activation.p1Facing }),
      ...(activation.p1GetP2Facing === undefined ? {} : { p1GetP2Facing: activation.p1GetP2Facing }),
      ...(activation.p2Facing === undefined ? {} : { p2Facing: activation.p2Facing }),
      ...(activation.hitShakeTime === undefined ? {} : { hitShakeTime: activation.hitShakeTime }),
      ...(activation.hitCount === undefined ? {} : { hitCount }),
      ...(activation.targetId === undefined ? {} : { targetId: Math.max(0, activation.targetId) }),
      ...(chainId === undefined ? {} : { chainId }),
    };
    return true;
  }

  findActive<TActor extends RuntimeReversalActor>(
    defender: TActor,
    incomingMove: DemoMove,
    incomingAttackBox: CollisionBox | readonly CollisionBox[],
    hooks: Pick<RuntimeReversalHooks<TActor>, "isMoveActive" | "worldBox" | "boxesIntersect" | "attrMatches">,
    incoming: RuntimeReversalIncomingOptions = {},
  ): DemoMove | undefined {
    const reversal = defender.currentMove;
    if (!reversal?.isReversal || defender.hasHit || !reversal.reversalAttr) {
      return undefined;
    }
    if (!hooks.isMoveActive(reversal, defender.moveTick)) {
      return undefined;
    }
    if (!hooks.attrMatches(reversal.reversalAttr, incomingMove.attr ?? "S,NA")) {
      return undefined;
    }
    if (
      reversal.chainId !== undefined
      && defender.runtime.hitVars?.hitId !== Math.trunc(reversal.chainId)
    ) {
      return undefined;
    }
    if (
      reversal.reversalGuardFlag
      && (incoming.incomingUnguardable || !runtimeGuardFlagOverlaps(reversal.reversalGuardFlag, incomingMove.guardFlag ?? "MA"))
    ) {
      return undefined;
    }
    if (
      reversal.reversalGuardFlagNot
      && !incoming.incomingUnguardable
      && runtimeGuardFlagOverlaps(reversal.reversalGuardFlagNot, incomingMove.guardFlag ?? "MA")
    ) {
      return undefined;
    }
    const reversalBox = hooks.worldBox(defender.runtime, reversal.hitbox);
    return incomingCollisionBoxes(incomingAttackBox).some((box) => hooks.boxesIntersect(reversalBox, box))
      ? reversal
      : undefined;
  }

  apply<TReverser extends RuntimeReversalActor, TAttacker extends RuntimeReversalActor>(
    reverser: TReverser,
    attacker: TAttacker,
    reversal: DemoMove,
    hooks: RuntimeReversalApplyHooks<TReverser, TAttacker>,
  ): RuntimeReversalOutcome {
    reverser.hasHit = true;
    attacker.hasHit = true;
    markRuntimeHitTmpReversal(attacker.runtime);
    this.contactWorld.markMoveReversed(attacker.contact, attacker.runtime.stateNo);
    this.contactWorld.markReceivedHits(attacker.contact, attacker.runtime.stateNo, reversal.hitVars?.hitCount ?? 1);
    if (reversal.targetId !== undefined || reversal.hitVars?.hitId !== undefined) {
      attacker.runtime.hitVars = {
        ...(attacker.runtime.hitVars ?? {}),
        hitId: reversal.hitVars?.hitId ?? reversal.targetId ?? 0,
      };
    }
    hooks.rememberTarget(reverser, attacker, reversal.targetId);
    reverser.hitPause = reversal.hitPause;
    attacker.hitPause = reversal.hitShakeTime ?? reversal.hitPause;
    attacker.hitStun = 0;
    interruptCurrentMove(attacker);
    attacker.runtime.guardStun = 0;
    attacker.runtime.guardSlideTime = 0;
    attacker.runtime.guardControlTime = 0;
    attacker.runtime.guardSlideTimeRemaining = undefined;
    attacker.runtime.guardControlTimeRemaining = undefined;
    attacker.runtime.guarding = false;
    applyRuntimeReceiverUnhittableTime(attacker.runtime, reversal);
    applyRuntimeAttackerUnhittableTime(reverser.runtime, reversal);
    markRuntimeEffectActorGotHit(attacker);
    applyRuntimePowerDelta(reverser.runtime, 25, reverser.definition.constants);

    const p1StateNo = reversal.p1StateNo;
    const p2StateNo = reversal.p2StateNo;
    const reverserFacing = reverser.runtime.facing;
    const incomingFacing = attacker.runtime.facing;
    if (p1StateNo !== undefined && hooks.canEnterState(reverser, p1StateNo)) {
      hooks.enterState(reverser, p1StateNo);
    } else {
      this.clear(reverser, false);
    }
    if (p2StateNo !== undefined) {
      hooks.enterTargetHitState(attacker, reverser, p2StateNo, reversal.p2GetP1State ?? true);
    }
    applyRuntimeReversalP1Facing(reverser.runtime, incomingFacing, reversal.p1Facing, reversal.p1GetP2Facing);
    applyRuntimeReversalP2Facing(reverserFacing, attacker.runtime, reversal.p2Facing);
    applyRuntimeHitDefSpritePriorityContact(
      reverser,
      attacker,
      reversal,
      "hit",
      reverser.definition.hitDefPriorityProfile ?? "unknown",
    );

    const p1 = p1StateNo !== undefined ? ` p1->${p1StateNo}` : "";
    const p2 = p2StateNo !== undefined ? ` p2->${p2StateNo}` : "";
    return {
      p1StateNo,
      p2StateNo,
      message: `${reverser.label} reversed ${attacker.label}${p1}${p2}`,
    };
  }

  clear(actor: RuntimeReversalActor, resetHit: boolean): void {
    if (actor.currentMove?.isReversal) {
      interruptCurrentMove(actor);
      if (resetHit) {
        actor.hasHit = false;
      }
    }
    actor.runtime.reversal = undefined;
  }
}

function incomingCollisionBoxes(value: CollisionBox | readonly CollisionBox[]): readonly CollisionBox[] {
  return Array.isArray(value) ? value as readonly CollisionBox[] : [value as CollisionBox];
}

function resolveRuntimeReversalPausePair(
  operationValue: MugenHitDefExpressionPair | undefined,
  rawValue: string | undefined,
  state: CharacterRuntimeState,
  context: RuntimeControllerEvaluationContext = {},
  fallback: [number, number] = [0, 0],
  preserveMissing = false,
): [number?, number?] {
  const source = operationValue ?? splitRuntimeReversalExpressionPair(rawValue);
  if (!source) {
    return preserveMissing ? [undefined, undefined] : [...fallback];
  }
  const resolve = (value: number | string | undefined, fallbackValue: number | undefined): number | undefined => {
    if (value === undefined) return fallbackValue;
    const result = typeof value === "number" ? value : evaluateRuntimeControllerNumber(value, state, context);
    return Number.isFinite(result) ? Math.max(0, Math.trunc(result!)) : fallbackValue;
  };
  const first = resolve(source[0], preserveMissing ? undefined : fallback[0]);
  const second = source.length > 1
    ? resolve(source[1], preserveMissing ? undefined : fallback[1])
    : preserveMissing ? undefined : fallback[1];
  return [first, second];
}

function resolveRuntimeReversalIntegerPair(
  operationValue: MugenHitDefExpressionPair | undefined,
  rawValue: string | undefined,
  state: CharacterRuntimeState,
  context: RuntimeControllerEvaluationContext = {},
  fallback: [number, number] = [-1, -1],
): [number, number] {
  const source = operationValue ?? splitRuntimeReversalExpressionPair(rawValue);
  if (!source) return [...fallback];
  const resolve = (value: number | string | undefined, fallback: number): number => {
    if (value === undefined) return fallback;
    const result = typeof value === "number" ? value : evaluateRuntimeControllerNumber(value, state, context);
    return Number.isFinite(result) ? Math.trunc(result!) : fallback;
  };
  return [resolve(source[0], -1), resolve(source[1], -1)];
}

function resolveRuntimeReversalFloatPair(
  operationValue: MugenHitDefExpressionPair | undefined,
  rawValue: string | undefined,
  state: CharacterRuntimeState,
  context: RuntimeControllerEvaluationContext = {},
  fallback?: [number, number],
  preserveMissing = false,
): [number, number] | undefined {
  const source = operationValue ?? splitRuntimeReversalExpressionPair(rawValue);
  if (!source) return preserveMissing ? undefined : fallback ? [...fallback] as [number, number] : undefined;
  const resolve = (value: number | string | undefined, fallbackValue: number | undefined): number | undefined => {
    if (value === undefined) return fallbackValue;
    const result = typeof value === "number" ? value : evaluateRuntimeControllerNumber(value, state, context);
    return Number.isFinite(result) ? result : fallbackValue;
  };
  const first = resolve(source[0], preserveMissing ? undefined : fallback?.[0]);
  if (first === undefined) return preserveMissing ? undefined : fallback ? [...fallback] as [number, number] : undefined;
  const second = source.length > 1
    ? resolve(source[1], preserveMissing ? undefined : fallback?.[1])
    : first;
  if (second === undefined) return preserveMissing ? undefined : fallback ? [...fallback] as [number, number] : undefined;
  return [first, second];
}

function resolveRuntimeReversalInteger(
  operationValue: number | string | undefined,
  rawValue: string | undefined,
  state: CharacterRuntimeState,
  context: RuntimeControllerEvaluationContext = {},
): number | undefined {
  const value = operationValue ?? rawValue;
  if (value === undefined) {
    return undefined;
  }
  const resolved = typeof value === "number" ? value : evaluateRuntimeControllerNumber(value, state, context);
  return Number.isFinite(resolved) ? Math.trunc(resolved!) : undefined;
}

function resolveRuntimeReversalStateNo(
  operationValue: number | string | undefined,
  rawValue: string | undefined,
  state: CharacterRuntimeState,
  context: RuntimeControllerEvaluationContext = {},
): number | undefined {
  const resolved = resolveRuntimeReversalInteger(operationValue, rawValue, state, context);
  return resolved === undefined ? undefined : Math.max(0, resolved);
}

function resolveRuntimeReversalBoolean(
  operationValue: boolean | string | undefined,
  rawValue: string | undefined,
  state: CharacterRuntimeState,
  context: RuntimeControllerEvaluationContext = {},
): boolean | undefined {
  if (typeof operationValue === "boolean") {
    return operationValue;
  }
  const value = operationValue ?? rawValue;
  if (value === undefined) {
    return undefined;
  }
  const resolved = typeof value === "string"
    ? evaluateRuntimeControllerNumber(value, state, context)
    : value;
  return Number.isFinite(resolved) ? resolved !== 0 : undefined;
}

function splitRuntimeReversalExpressionPair(raw: string | undefined): [string, string?] | undefined {
  if (!raw) return undefined;
  let depth = 0;
  let split = -1;
  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index]!;
    if (char === "(") depth += 1;
    else if (char === ")") depth -= 1;
    else if (char === "," && depth === 0) {
      if (split >= 0) return undefined;
      split = index;
    }
    if (depth < 0) return undefined;
  }
  if (depth !== 0) return undefined;
  const first = (split < 0 ? raw : raw.slice(0, split)).trim();
  const second = split < 0 ? undefined : raw.slice(split + 1).trim();
  return first && (split < 0 || second) ? [first, second] : undefined;
}

function staticReversalHitCount(value: string | undefined): number | undefined {
  if (!value || value.includes(",")) {
    return undefined;
  }
  const parsed = Number(value.trim());
  return Number.isFinite(parsed) ? Math.trunc(parsed) : undefined;
}

function normalizedReversalHitCount(value: number | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.trunc(value) : 1;
}

function interruptCurrentMove(actor: RuntimeReversalActor): void {
  actor.currentMove = undefined;
  actor.currentMoveLabel = undefined;
  actor.moveTick = 0;
}

function applyRuntimeReversalP2Facing(
  reverserFacing: CharacterRuntimeState["facing"],
  attacker: CharacterRuntimeState,
  p2Facing: number | undefined,
): void {
  if (p2Facing === undefined || p2Facing === 0) {
    return;
  }
  attacker.facing = p2Facing < 0
    ? reverserFacing
    : reverserFacing === 1 ? -1 : 1;
}

function applyRuntimeReversalP1Facing(
  reverser: CharacterRuntimeState,
  incomingFacing: CharacterRuntimeState["facing"],
  p1Facing: number | undefined,
  p1GetP2Facing: number | undefined,
): void {
  if (p1GetP2Facing !== undefined && p1GetP2Facing !== 0) {
    reverser.facing = p1GetP2Facing < 0
      ? incomingFacing === 1 ? -1 : 1
      : incomingFacing;
    return;
  }
  if (p1Facing !== undefined && p1Facing < 0) {
    reverser.facing = reverser.facing === 1 ? -1 : 1;
  }
}

function cloneBox(box: CollisionBox): CollisionBox {
  return { x1: box.x1, y1: box.y1, x2: box.x2, y2: box.y2 };
}

function findParam(controller: { params: Record<string, string> }, key: string): string | undefined {
  return findControllerParam(controller, key);
}

function stripMugenString(value: string | undefined): string | undefined {
  return value?.trim().replace(/^"(.*)"$/, "$1");
}

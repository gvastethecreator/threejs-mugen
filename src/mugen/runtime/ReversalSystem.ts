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
  hitCount?: number;
  p1SpritePriority?: number;
  p2SpritePriority?: number;
  p1StateNo?: number;
  p2StateNo?: number;
  p2GetP1State?: boolean;
  p2Facing?: number;
  targetId?: number;
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
    const hitPause = operation?.hitPause ?? Math.max(0, Math.round(firstNumber(findParam(source, "pausetime")) ?? 0));
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
      hitCount: operation?.hitCount ?? staticReversalHitCount(findParam(source, "numhits")),
      p1SpritePriority: operation?.p1SpritePriority,
      p2SpritePriority: operation?.p2SpritePriority,
      p1StateNo: operation?.p1StateNo ?? firstNumber(findParam(source, "p1stateno")),
      p2StateNo: operation?.p2StateNo ?? firstNumber(findParam(source, "p2stateno")),
      p2GetP1State: operation?.p2GetP1State,
      p2Facing: operation?.p2Facing,
      targetId: operation?.targetId ?? firstNumber(findParam(source, "id")),
      attackDepth:
        operation?.attackDepth ?? normalizedNumberPair(findParam(source, "attack.depth")) ?? actor.runtime.combatDepth?.attack,
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
    if (operation.hitPause !== undefined) {
      existing.hitPause = operation.hitPause;
      runtimeReversal.hitPause = operation.hitPause;
    }
    if (operation.hitCount !== undefined) {
      existing.hitVars = { ...existing.hitVars, hitCount: operation.hitCount };
      runtimeReversal.hitCount = operation.hitCount;
    }
    if (operation.p1SpritePriority !== undefined) {
      existing.p1SpritePriority = operation.p1SpritePriority;
      runtimeReversal.p1SpritePriority = operation.p1SpritePriority;
    }
    if (operation.p2SpritePriority !== undefined) {
      existing.p2SpritePriority = operation.p2SpritePriority;
      runtimeReversal.p2SpritePriority = operation.p2SpritePriority;
    }
    if (operation.p1StateNo !== undefined) {
      existing.p1StateNo = operation.p1StateNo;
      runtimeReversal.p1StateNo = operation.p1StateNo;
    }
    if (operation.p2StateNo !== undefined) {
      existing.p2StateNo = operation.p2StateNo;
      runtimeReversal.p2StateNo = operation.p2StateNo;
    }
    if (operation.p2GetP1State !== undefined) {
      existing.p2GetP1State = operation.p2GetP1State;
      runtimeReversal.p2GetP1State = operation.p2GetP1State;
    }
    if (operation.p2Facing !== undefined) {
      existing.p2Facing = operation.p2Facing;
      runtimeReversal.p2Facing = operation.p2Facing;
    }
    if (operation.targetId !== undefined) {
      existing.targetId = operation.targetId;
    }
    if (operation.attackDepth !== undefined) {
      existing.attackDepth = [...operation.attackDepth] as [number, number];
      runtimeReversal.attackDepth = [...operation.attackDepth] as [number, number];
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
    fighter.currentMove = {
      actionId: fighter.runtime.stateNo,
      startup: 0,
      activeStart: 0,
      activeEnd: 3600,
      recovery: 3600,
      damage: 0,
      attr: hitDefAttr,
      targetId: activation.targetId,
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
      p2Facing: activation.p2Facing,
      hitPause: activation.hitPause,
      hitVars: { hitCount },
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
      ...(activation.p2Facing === undefined ? {} : { p2Facing: activation.p2Facing }),
      ...(activation.hitCount === undefined ? {} : { hitCount }),
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
    hooks.rememberTarget(reverser, attacker, reversal.targetId);
    reverser.hitPause = reversal.hitPause;
    attacker.hitPause = reversal.hitPause;
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
    if (p1StateNo !== undefined && hooks.canEnterState(reverser, p1StateNo)) {
      hooks.enterState(reverser, p1StateNo);
    } else {
      this.clear(reverser, false);
    }
    if (p2StateNo !== undefined) {
      hooks.enterTargetHitState(attacker, reverser, p2StateNo, reversal.p2GetP1State ?? true);
    }
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

function normalizedNumberPair(value: string | undefined): [number, number] | undefined {
  const values = value?.split(",").map((entry) => Number(entry.trim()));
  if (!values?.length || !Number.isFinite(values[0]) || (values[1] !== undefined && !Number.isFinite(values[1]))) {
    return undefined;
  }
  return [values[0], values[1] ?? values[0]];
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

function cloneBox(box: CollisionBox): CollisionBox {
  return { x1: box.x1, y1: box.y1, x2: box.x2, y2: box.y2 };
}

function findParam(controller: { params: Record<string, string> }, key: string): string | undefined {
  return findControllerParam(controller, key);
}

function firstNumber(value: string | undefined): number | undefined {
  const raw = value?.split(",")[0]?.trim();
  if (!raw) {
    return undefined;
  }
  const numberValue = Number(raw);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function stripMugenString(value: string | undefined): string | undefined {
  return value?.trim().replace(/^"(.*)"$/, "$1");
}

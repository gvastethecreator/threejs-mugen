import type { CollisionBox } from "../model/CollisionBox";
import type { DemoFighterDefinition, DemoMove } from "./demoFighters";
import type { RuntimeEffectActorWorld } from "./EffectActorSystem";
import { markRuntimeEffectActorGotHit } from "./EffectLifecycleSystem";
import { RuntimeContactMemoryWorld, type RuntimeContactMemory } from "./ContactMemorySystem";
import { applyRuntimePowerDelta } from "./RuntimeResourceSystem";
import type { CharacterRuntimeState } from "./types";

export type RuntimeReversalActor = {
  id: string;
  label: string;
  definition: Pick<DemoFighterDefinition, "constants">;
  runtime: CharacterRuntimeState;
  currentMove?: DemoMove;
  currentMoveLabel?: string;
  moveTick: number;
  hitStun: number;
  hitPause: number;
  hasHit: boolean;
  contact: RuntimeContactMemory;
  effectActorWorld: Pick<RuntimeEffectActorWorld, "removeExplodsOnGetHit">;
};

export type RuntimeReversalActivation = {
  attr: string;
  hitbox?: CollisionBox;
  label?: string;
  hitPause: number;
  p1StateNo?: number;
  p2StateNo?: number;
  targetId?: number;
};

export type RuntimeReversalHooks<TActor extends RuntimeReversalActor = RuntimeReversalActor> = {
  isMoveActive: (move: DemoMove, tick: number) => boolean;
  worldBox: (state: CharacterRuntimeState, box: CollisionBox) => CollisionBox;
  boxesIntersect: (left: CollisionBox, right: CollisionBox) => boolean;
  attrMatches: (reversalAttr: string, incomingAttr: string) => boolean;
  rememberTarget: (attacker: TActor, defender: TActor, targetId: number | undefined) => void;
  canEnterState: (actor: TActor, stateNo: number) => boolean;
  enterState: (actor: TActor, stateNo: number) => void;
  enterTargetHitState: (target: TActor, owner: TActor, stateNo: number, getP1State: boolean) => void;
};

export type RuntimeReversalOutcome = {
  p1StateNo?: number;
  p2StateNo?: number;
  message: string;
};

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
    fighter.currentMove = {
      actionId: fighter.runtime.stateNo,
      startup: 0,
      activeStart: 0,
      activeEnd: 3600,
      recovery: 3600,
      damage: 0,
      attr: "S,NA",
      targetId: activation.targetId,
      isReversal: true,
      reversalAttr: attr,
      p1StateNo: activation.p1StateNo,
      p2StateNo: activation.p2StateNo,
      hitPause: activation.hitPause,
      hitStun: 0,
      push: 0,
      hitbox: cloneBox(activation.hitbox),
    };
    fighter.currentMoveLabel = activation.label ?? "ReversalDef";
    fighter.hasHit = false;
    fighter.runtime.reversal = {
      attr,
      hitPause: activation.hitPause,
      ...(activation.p1StateNo !== undefined ? { p1StateNo: activation.p1StateNo } : {}),
      ...(activation.p2StateNo !== undefined ? { p2StateNo: activation.p2StateNo } : {}),
    };
    return true;
  }

  findActive<TActor extends RuntimeReversalActor>(
    defender: TActor,
    incomingMove: DemoMove,
    incomingAttackBox: CollisionBox,
    hooks: Pick<RuntimeReversalHooks<TActor>, "isMoveActive" | "worldBox" | "boxesIntersect" | "attrMatches">,
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
    const reversalBox = hooks.worldBox(defender.runtime, reversal.hitbox);
    return hooks.boxesIntersect(reversalBox, incomingAttackBox) ? reversal : undefined;
  }

  apply<TActor extends RuntimeReversalActor>(
    reverser: TActor,
    attacker: TActor,
    reversal: DemoMove,
    hooks: Pick<RuntimeReversalHooks<TActor>, "rememberTarget" | "canEnterState" | "enterState" | "enterTargetHitState">,
  ): RuntimeReversalOutcome {
    reverser.hasHit = true;
    attacker.hasHit = true;
    this.contactWorld.markMoveReversed(attacker.contact, attacker.runtime.stateNo);
    hooks.rememberTarget(reverser, attacker, reversal.targetId);
    reverser.hitPause = reversal.hitPause;
    attacker.hitPause = reversal.hitPause;
    attacker.hitStun = 0;
    interruptCurrentMove(attacker);
    attacker.runtime.guardStun = 0;
    attacker.runtime.guardSlideTime = 0;
    attacker.runtime.guardControlTime = 0;
    attacker.runtime.guarding = false;
    markRuntimeEffectActorGotHit(attacker);
    applyRuntimePowerDelta(reverser.runtime, 25, reverser.definition.constants);

    const p1StateNo = reversal.p1StateNo;
    const p2StateNo = reversal.p2StateNo;
    if (p1StateNo !== undefined && hooks.canEnterState(reverser, p1StateNo)) {
      hooks.enterState(reverser, p1StateNo);
    } else {
      this.clear(reverser, false);
    }
    if (p2StateNo !== undefined) {
      hooks.enterTargetHitState(attacker, reverser, p2StateNo, true);
    }

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

function interruptCurrentMove(actor: RuntimeReversalActor): void {
  actor.currentMove = undefined;
  actor.currentMoveLabel = undefined;
  actor.moveTick = 0;
}

function cloneBox(box: CollisionBox): CollisionBox {
  return { x1: box.x1, y1: box.y1, x2: box.x2, y2: box.y2 };
}

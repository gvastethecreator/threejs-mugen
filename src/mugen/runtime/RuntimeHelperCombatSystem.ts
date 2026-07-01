import type { CollisionBox } from "../model/CollisionBox";
import type { DemoFighterDefinition, DemoMove } from "./demoFighters";
import type { RuntimeDirectCombatActor } from "./DirectCombatSystem";
import { RuntimeDirectCombatWorld } from "./DirectCombatSystem";
import type { RuntimeEffectActorWorld } from "./EffectActorSystem";
import { RuntimeGetHitStateWorld } from "./GetHitStateSystem";
import { RuntimeGuardWorld } from "./GuardSystem";
import {
  applyRuntimeStateToHelper,
  helperRuntimeState,
  rememberRuntimeHelperTarget,
  type RuntimeHelper,
} from "./HelperSystem";
import type { RuntimeContactPresentationActor } from "./RuntimeContactPresentationSystem";
import { RuntimeContactPresentationWorld } from "./RuntimeContactPresentationSystem";
import { isRuntimeHoldingBack } from "./RuntimeInput";
import { RuntimeTargetWorld } from "./TargetSystem";
import type { RuntimeHitEffectEvent, RuntimeSoundEvent } from "./types";
import {
  canRuntimeBeHitBy,
  hasRuntimeBoxContact,
  resolveRuntimeCombatHit,
  runtimeWorldBox,
} from "./CombatResolver";

type RuntimeHelperCombatDefinition = Pick<
  DemoFighterDefinition,
  "source" | "constants" | "animations" | "hitSparkLibraries"
>;

export type RuntimeHelperCombatOwner = {
  id: string;
  definition: RuntimeHelperCombatDefinition;
  effectActorWorld: Pick<RuntimeEffectActorWorld, "helpers" | "removeExplodsOnGetHit">;
  audioWorld: RuntimeHelperDirectCombatActor["audioWorld"];
  hitEffectWorld: RuntimeHelperDirectCombatActor["hitEffectWorld"];
};

export type RuntimeHelperCombatDefender = RuntimeDirectCombatActor &
  RuntimeContactPresentationActor & {
    definition: RuntimeHelperCombatDefinition;
    currentInput: Iterable<string>;
  };

export type RuntimeHelperCombatStateHooks<TDefender extends RuntimeHelperCombatDefender = RuntimeHelperCombatDefender> = {
  canEnterState: (target: TDefender, stateNo: number) => boolean;
  enterState: (
    target: TDefender,
    stateNo: number,
    options?: { stateOwner?: TDefender; clearStateOwner?: boolean },
  ) => void;
};

export type RuntimeHelperCombatInput<TDefender extends RuntimeHelperCombatDefender = RuntimeHelperCombatDefender> = {
  owner: RuntimeHelperCombatOwner;
  defender: TDefender;
  directCombatWorld: RuntimeDirectCombatWorld;
  guardWorld: RuntimeGuardWorld;
  getHitStateWorld: RuntimeGetHitStateWorld;
  contactPresentationWorld: RuntimeContactPresentationWorld;
  targetWorld: RuntimeTargetWorld;
  runtimeTick: number;
  getHurtBoxes: (defender: TDefender) => CollisionBox[] | undefined;
  stateHooks: RuntimeHelperCombatStateHooks<TDefender>;
  defaultHurtBoxes?: CollisionBox[];
  log?: (line: string) => void;
};

type RuntimeHelperDirectCombatActor = RuntimeDirectCombatActor &
  RuntimeContactPresentationActor & {
    definition: RuntimeHelperCombatDefinition;
    stateElapsed: number;
    soundEvents: RuntimeSoundEvent[];
    hitEffectEvents: RuntimeHitEffectEvent[];
    stateOwner?: { definition: RuntimeHelperCombatDefinition };
  };

const defaultHelperCombatHurtBoxes: CollisionBox[] = [{ x1: -24, y1: -96, x2: 24, y2: 0 }];

export class RuntimeHelperCombatWorld {
  resolveDirect<TDefender extends RuntimeHelperCombatDefender>(
    input: RuntimeHelperCombatInput<TDefender>,
  ): void {
    for (const helper of input.owner.effectActorWorld.helpers(input.owner.id)) {
      const attacker = helperDirectCombatActor(helper, input.owner);
      const move = attacker.currentMove;
      if (!move || attacker.hasHit || move.requiresHitDef || move.isReversal || !runtimeHelperMoveIsActive(move, attacker.moveTick)) {
        continue;
      }
      const attackBox = runtimeWorldBox(attacker.runtime, move.hitbox);
      const hurtBoxes = input.getHurtBoxes(input.defender) ?? input.defaultHurtBoxes ?? defaultHelperCombatHurtBoxes;
      if (!hasRuntimeBoxContact(attackBox, input.defender.runtime, hurtBoxes)) {
        continue;
      }
      if (!canRuntimeBeHitBy(input.defender.runtime, move.attr ?? "S,NA")) {
        input.log?.(`${input.defender.label} rejected ${attacker.label} ${move.attr ?? "S,NA"} via HitBy/NotHitBy`);
        continue;
      }
      const result = resolveRuntimeCombatHit({
        attacker: attacker.runtime,
        defender: input.defender.runtime,
        attack: move,
        holdingBack: isRuntimeHoldingBack(input.defender.currentInput),
      });
      const outcome = input.directCombatWorld.applyResolvedHit<RuntimeDirectCombatActor>(
        attacker,
        input.defender,
        move,
        result,
        {
          applyGuardHit: () => applyDefaultHelperGuardHitState(input.defender, input.guardWorld, input.stateHooks),
          applyHitStateTransitions: () => {},
          applyDefaultGetHit: () => applyDefaultHelperGetHitState(input.defender, input.getHitStateWorld, input.stateHooks),
        },
      );
      if (move.targetId !== undefined) {
        rememberRuntimeHelperTarget(helper, input.defender.id, move.targetId, input.targetWorld);
      }
      input.contactPresentationWorld.emitHitDefContact({
        attacker,
        defender: input.defender,
        kind: outcome.kind,
        move,
        runtimeTick: input.runtimeTick,
      });
      syncHelperFromDirectCombatActor(helper, attacker);
      input.log?.(outcome.message);
    }
  }
}

function helperDirectCombatActor(helper: RuntimeHelper, owner: RuntimeHelperCombatOwner): RuntimeHelperDirectCombatActor {
  return {
    id: helper.serialId,
    label: `Helper ${helper.name ?? helper.helperId ?? helper.stateNo ?? helper.animNo}`,
    definition: owner.definition,
    stateOwner: { definition: owner.definition },
    runtime: helperRuntimeState(helper),
    currentMove: helper.currentMove,
    currentMoveLabel: helper.currentMoveLabel,
    moveTick: helper.moveTick,
    hitStun: 0,
    hitPause: 0,
    hasHit: helper.hasHit,
    contact: helper.contact,
    effectActorWorld: owner.effectActorWorld,
    stateElapsed: helper.stateTime,
    soundEvents: helper.soundEvents,
    hitEffectEvents: helper.hitEffectEvents,
    audioWorld: owner.audioWorld,
    hitEffectWorld: owner.hitEffectWorld,
  };
}

function syncHelperFromDirectCombatActor(helper: RuntimeHelper, actor: RuntimeHelperDirectCombatActor): void {
  helper.currentMove = actor.currentMove;
  helper.currentMoveLabel = actor.currentMoveLabel;
  helper.moveTick = actor.moveTick;
  helper.hasHit = actor.hasHit;
  applyRuntimeStateToHelper(helper, actor.runtime);
}

function runtimeHelperMoveIsActive(move: DemoMove, tick: number): boolean {
  return tick >= move.activeStart && tick <= move.activeEnd;
}

function applyDefaultHelperGetHitState<TDefender extends RuntimeHelperCombatDefender>(
  defender: TDefender,
  getHitStateWorld: RuntimeGetHitStateWorld,
  stateHooks: RuntimeHelperCombatStateHooks<TDefender>,
): void {
  if (defender.definition.source !== "imported") {
    return;
  }
  const stateNo = getHitStateWorld.defaultGetHitStateNo(defender.runtime, (candidate) =>
    stateHooks.canEnterState(defender, candidate),
  );
  if (stateNo === undefined || !stateHooks.canEnterState(defender, stateNo)) {
    return;
  }
  stateHooks.enterState(defender, stateNo, { clearStateOwner: true });
}

function applyDefaultHelperGuardHitState<TDefender extends RuntimeHelperCombatDefender>(
  defender: TDefender,
  guardWorld: RuntimeGuardWorld,
  stateHooks: RuntimeHelperCombatStateHooks<TDefender>,
): void {
  if (defender.definition.source !== "imported") {
    return;
  }
  const stateNo = guardWorld.defaultGuardHitStateNo(defender.runtime, (candidate) =>
    stateHooks.canEnterState(defender, candidate),
  );
  if (stateNo === undefined || !stateHooks.canEnterState(defender, stateNo)) {
    return;
  }
  stateHooks.enterState(defender, stateNo, { clearStateOwner: true });
}

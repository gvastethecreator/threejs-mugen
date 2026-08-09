import type { AudioControllerOp } from "../compiler/ControllerOps";
import type { CollisionBox } from "../model/CollisionBox";
import type { DemoFighterDefinition, DemoMove } from "./demoFighters";
import type { RuntimeDirectCombatActor } from "./DirectCombatSystem";
import { RuntimeDirectCombatWorld } from "./DirectCombatSystem";
import type { RuntimeEffectActorWorld } from "./EffectActorSystem";
import { RuntimeGetHitStateWorld } from "./GetHitStateSystem";
import { RuntimeGuardWorld } from "./GuardSystem";
import {
  RuntimeHitOverrideWorld,
  shouldRuntimeHitOverrideMissDirect,
} from "./HitOverrideSystem";
import {
  applyRuntimeStateToHelper,
  helperRuntimeState,
  rememberRuntimeHelperTarget,
  runtimeHelperCanDirectlyInteract,
  type RuntimeHelper,
} from "./HelperSystem";
import {
  applyRuntimeDirectAirJuggleHit,
  canRuntimeDirectAirJuggle,
  prepareRuntimeInheritedJugglePoints,
  type RuntimeDirectJuggleActor,
} from "./RuntimeJuggleSystem";
import type { RuntimeContactPresentationActor } from "./RuntimeContactPresentationSystem";
import { RuntimeContactPresentationWorld } from "./RuntimeContactPresentationSystem";
import { isRuntimeHoldingBack } from "./RuntimeInput";
import { RuntimeTargetWorld } from "./TargetSystem";
import { scaleRuntimeCollisionBoxes } from "./RuntimeCollisionTransformSystem";
import type { RuntimeStageBounds } from "./HitDefCornerPush";
import type { RuntimeCompatibilityProfile } from "./RuntimeCompatibilityProfile";
import { runtimeChainIdOverridesEqualNoChainId } from "./RuntimeChainIdPolicy";
import {
  applyRuntimeHitOverrideUnhittableTime,
  hasRuntimeUnhittableTime,
} from "./RuntimeUnhittableTimeSystem";
import type { CharacterRuntimeState, RuntimeHitEffectEvent, RuntimeSoundEvent } from "./types";
import {
  canRuntimeBeHitBy,
  collisionBoxesIntersect,
  findRuntimeHitOverride,
  hasRuntimeBoxContact,
  hitAttributeMatches,
  runtimeHitFlagRejectionReason,
  resolveRuntimeCombatHit,
  runtimeWorldBox,
} from "./CombatResolver";
import type { RuntimeReversalWorld } from "./ReversalSystem";

type RuntimeHelperCombatDefinition = Pick<
  DemoFighterDefinition,
  "source" | "constants" | "animations" | "hitSparkLibraries" | "hitDefPriorityProfile"
>;

export type RuntimeHelperCombatOwner = {
  id: string;
  definition: RuntimeHelperCombatDefinition;
  runtime: CharacterRuntimeState;
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

export type RuntimeHelperRootOwnershipResolver = (helper: RuntimeHelper, ownerId: string) => boolean;

export type RuntimeHelperCombatInput<TDefender extends RuntimeHelperCombatDefender = RuntimeHelperCombatDefender> = {
  owner: RuntimeHelperCombatOwner;
  defender: TDefender;
  runtimeProfile?: RuntimeCompatibilityProfile;
  directCombatWorld: RuntimeDirectCombatWorld;
  hitOverrideWorld?: RuntimeHitOverrideWorld;
  reversalWorld: RuntimeReversalWorld;
  guardWorld: RuntimeGuardWorld;
  getHitStateWorld: RuntimeGetHitStateWorld;
  contactPresentationWorld: RuntimeContactPresentationWorld;
  targetWorld: RuntimeTargetWorld;
  runtimeTick: number;
  stageBounds?: RuntimeStageBounds;
  getHurtBoxes: (defender: TDefender) => CollisionBox[] | undefined;
  canDefenderBeHit?: (defender: TDefender) => boolean;
  isHelperRootOwned?: RuntimeHelperRootOwnershipResolver;
  stateHooks: RuntimeHelperCombatStateHooks<TDefender>;
  recordAudioOperation?: (owner: RuntimeHelperCombatOwner, operation: AudioControllerOp) => void;
  emitDirectEnvShake?: (owner: RuntimeHelperCombatOwner, move: DemoMove) => void;
  defaultHurtBoxes?: CollisionBox[];
  log?: (line: string) => void;
};

type RuntimeHelperDirectCombatActor = RuntimeDirectCombatActor & RuntimeDirectJuggleActor &
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
      if (!runtimeHelperCanDirectlyInteract(helper)) {
        continue;
      }
      const attacker = helperDirectCombatActor(helper, input.owner, input.isHelperRootOwned);
      const move = attacker.currentMove;
      if (!move || attacker.hasHit || move.requiresHitDef || move.isReversal || !runtimeHelperMoveIsActive(move, attacker.moveTick)) {
        continue;
      }
      const attackBox = runtimeWorldBox(
        attacker.runtime,
        scaleRuntimeCollisionBoxes([move.hitbox], attacker.runtime.clsnScaleMultiplier)[0] ?? move.hitbox,
      );
      const reversal = input.reversalWorld.findActive(input.defender, move, attackBox, {
        isMoveActive: runtimeHelperMoveIsActive,
        worldBox: runtimeWorldBox,
        boxesIntersect: collisionBoxesIntersect,
        attrMatches: hitAttributeMatches,
      }, { incomingUnguardable: attacker.runtime.assertSpecial?.unguardable });
      if (reversal && hasRuntimeUnhittableTime(input.defender.runtime)) {
        input.log?.(`${input.defender.label} rejected ${attacker.label} ${move.attr ?? "S,NA"} via HitDef unhittabletime`);
        continue;
      }
      const chainAdmissionRejection = runtimeHelperChainAdmissionRejection(move, attacker, input.defender, input.runtimeProfile);
      if (reversal && chainAdmissionRejection) {
        input.log?.(chainAdmissionRejection);
        continue;
      }
      if (reversal) {
        const outcome = input.reversalWorld.apply(input.defender, attacker, reversal, {
          rememberTarget: () => undefined,
          canEnterState: input.stateHooks.canEnterState,
          enterState: (target, stateNo) => input.stateHooks.enterState(target, stateNo),
          enterTargetHitState: (target, _owner, stateNo) => {
            target.runtime.stateNo = stateNo;
          },
        });
        syncHelperFromDirectCombatActor(helper, attacker);
        input.log?.(outcome.message);
        continue;
      }
      const hurtBoxes = input.getHurtBoxes(input.defender) ?? input.defaultHurtBoxes ?? defaultHelperCombatHurtBoxes;
      if (!hasRuntimeBoxContact(attackBox, input.defender.runtime, hurtBoxes)) {
        continue;
      }
      if (hasRuntimeUnhittableTime(input.defender.runtime)) {
        input.log?.(`${input.defender.label} rejected ${attacker.label} ${move.attr ?? "S,NA"} via HitDef unhittabletime`);
        continue;
      }
      if (input.canDefenderBeHit?.(input.defender) === false) {
        input.log?.(`${input.defender.label} rejected ${attacker.label} ${move.attr ?? "S,NA"} via SuperPause unhittable`);
        continue;
      }
      const hitFlagReason = runtimeHitFlagRejectionReason({ attacker: attacker.runtime, defender: input.defender.runtime, hitFlag: move.hitFlag });
      if (hitFlagReason) {
        const suffix = hitFlagReason === "state-type-hitflag-rejected"
          ? "HitFlag state type"
          : hitFlagReason === "fall-hitflag-rejected"
          ? "fall HitFlag/NoFallHitFlag"
          : hitFlagReason === "minus-hitflag-rejected"
            ? "HitFlag -"
            : "HitFlag +";
        input.log?.(`${input.defender.label} rejected ${attacker.label} ${move.attr ?? "S,NA"} via ${suffix}`);
        continue;
      }
      if (!canRuntimeBeHitBy(input.defender.runtime, move.attr ?? "S,NA")) {
        input.log?.(`${input.defender.label} rejected ${attacker.label} ${move.attr ?? "S,NA"} via HitBy/NotHitBy`);
        continue;
      }
      if (chainAdmissionRejection) {
        input.log?.(chainAdmissionRejection);
        continue;
      }
      const defenderJuggleActor: RuntimeDirectJuggleActor = {
        id: input.defender.id,
        definition: input.defender.definition,
        runtime: input.defender.runtime,
      };
      prepareRuntimeInheritedJugglePoints({
        profile: input.runtimeProfile,
        attacker,
        defender: defenderJuggleActor,
      });
      const targetWasFalling = input.defender.runtime.moveType === "H" && input.defender.runtime.hitFall?.falling === true;
      if (!canRuntimeDirectAirJuggle({
        profile: input.runtimeProfile,
        attacker,
        defender: defenderJuggleActor,
        move,
      })) {
        input.log?.(`${input.defender.label} rejected ${attacker.label} ${move.attr ?? "S,NA"} via air.juggle`);
        continue;
      }
      const result = resolveRuntimeCombatHit({
        attacker: attacker.runtime,
        defender: input.defender.runtime,
        attack: move,
        holdingBack: isRuntimeHoldingBack(input.defender.currentInput),
      });
      const override = findRuntimeHitOverride(input.defender.runtime, move.attr ?? "S,NA", move.guardFlag ?? "MA");
      if (override) {
        if (shouldRuntimeHitOverrideMissDirect(move)) {
          const missReason = move.missOnOverride === true
            ? "because missonoverride = 1 forces active override miss"
            : "because active override cannot receive custom-state HitDef";
          input.log?.(`${input.defender.label} rejected ${attacker.label} ${move.attr ?? "S,NA"} ${missReason}`);
          continue;
        }
        attacker.hasHit = true;
        if (move.targetId !== undefined) {
          rememberRuntimeHelperTarget(helper, input.defender.id, move.targetId, input.targetWorld);
        }
        applyRuntimeHitOverrideUnhittableTime(
          attacker.runtime,
          input.defender.runtime,
          move,
          override.forceGuard === true || result.kind === "guard",
        );
        const redirect = (input.hitOverrideWorld ?? new RuntimeHitOverrideWorld()).applyRedirect(
          attacker,
          input.defender,
          override,
          move.hitPause,
          {
            tryEnterState: (target, stateNo) => {
              if (!input.stateHooks.canEnterState(target, stateNo)) {
                return false;
              }
              input.stateHooks.enterState(target, stateNo);
              return true;
            },
          },
        );
        syncHelperFromDirectCombatActor(helper, attacker);
        input.log?.(redirect.message);
        continue;
      }
      const outcome = input.directCombatWorld.applyResolvedHit<RuntimeDirectCombatActor>(
        attacker,
        input.defender,
        move,
        result,
        {
          applyGuardHit: () => applyDefaultHelperGuardHitState(input.defender, input.guardWorld, input.stateHooks),
          applyHitStateTransitions: () => {},
          applyDefaultGetHit: () => applyDefaultHelperGetHitState(input.defender, move, input.getHitStateWorld, input.stateHooks),
          emitHitEnvShake: (_source, moveArg) => input.emitDirectEnvShake?.(input.owner, moveArg),
        },
        {
          stageBounds: input.stageBounds,
          hitDefPriorityProfile: input.owner.definition.hitDefPriorityProfile,
        },
      );
      if (outcome.kind === "hit") {
        applyRuntimeDirectAirJuggleHit({
          profile: input.runtimeProfile,
          attacker,
          defender: defenderJuggleActor,
          move,
          targetWasFalling,
        });
      }
      if (move.targetId !== undefined) {
        rememberRuntimeHelperTarget(helper, input.defender.id, move.targetId, input.targetWorld);
      }
      input.contactPresentationWorld.emitHitDefContact({
        attacker,
        defender: input.defender,
        kind: outcome.kind,
        move,
        runtimeTick: input.runtimeTick,
        recordAudioOperation: (_helperActor, operation) => input.recordAudioOperation?.(input.owner, operation),
      });
      syncHelperFromDirectCombatActor(helper, attacker);
      input.log?.(outcome.message);
    }
  }
}

function helperDirectCombatActor(
  helper: RuntimeHelper,
  owner: RuntimeHelperCombatOwner,
  isHelperRootOwned?: RuntimeHelperRootOwnershipResolver,
): RuntimeHelperDirectCombatActor {
  return {
    id: helper.serialId,
    playerId: helper.playerId,
    playerNo: helper.playerNo,
    rootId: helper.rootId,
    rootOwned: isHelperRootOwned
      ? isHelperRootOwned(helper, owner.id)
      : helper.rootId === owner.id &&
        helper.parentId === helper.rootId &&
        helper.playerNo !== undefined &&
        helper.rootPlayerNo === helper.playerNo,
    effectOwnerId: owner.id,
    label: `Helper ${helper.name ?? helper.helperId ?? helper.stateNo ?? helper.animNo}`,
    definition: owner.definition,
    stateOwner: { definition: owner.definition },
    inheritJuggle: helper.inheritJuggle === 1 || helper.inheritJuggle === 2 ? helper.inheritJuggle : undefined,
    juggleParent: resolveHelperJuggleOrigin(helper, owner, 1),
    juggleRoot: resolveHelperJuggleOrigin(helper, owner, 2),
    runtime: helperRuntimeState(helper),
    currentMove: helper.currentMove,
    currentMoveLabel: helper.currentMoveLabel,
    moveTick: helper.moveTick,
    hitStun: 0,
    hitPause: helper.hitPause,
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

function resolveHelperJuggleOrigin(
  helper: RuntimeHelper,
  owner: RuntimeHelperCombatOwner,
  mode: 1 | 2,
): RuntimeDirectJuggleActor | undefined {
  const originId = mode === 1 ? helper.parentId : helper.rootId;
  if (originId === owner.id) {
    return {
      id: owner.id,
      definition: owner.definition,
      runtime: owner.runtime,
    };
  }
  const origin = owner.effectActorWorld.helpers(owner.id).find((candidate) => candidate.serialId === originId);
  return origin === undefined ? undefined : {
    id: origin.serialId,
    definition: owner.definition,
    runtime: helperRuntimeState(origin),
  };
}

function syncHelperFromDirectCombatActor(helper: RuntimeHelper, actor: RuntimeHelperDirectCombatActor): void {
  helper.currentMove = actor.currentMove;
  helper.currentMoveLabel = actor.currentMoveLabel;
  helper.moveTick = actor.moveTick;
  helper.hasHit = actor.hasHit;
  helper.hitPause = actor.hitPause;
  applyRuntimeStateToHelper(helper, actor.runtime);
}

function runtimeHelperMoveIsActive(move: DemoMove, tick: number): boolean {
  return tick >= move.activeStart && tick <= move.activeEnd;
}

function runtimeHelperChainIdRejects(move: DemoMove, defender: CharacterRuntimeState): boolean {
  const chainId = move.hitVars?.chainId;
  return chainId !== undefined && chainId >= 0 && defender.hitVars?.hitId !== Math.trunc(chainId);
}

function runtimeHelperChainAdmissionRejection(
  move: DemoMove,
  attacker: Pick<RuntimeHelperDirectCombatActor, "id" | "label" | "playerId">,
  defender: Pick<RuntimeHelperCombatDefender, "hitPause" | "label" | "runtime">,
  profile?: RuntimeCompatibilityProfile,
): string | undefined {
  if (runtimeHelperChainIdRejects(move, defender.runtime)) {
    const previousHitId = defender.runtime.hitVars?.hitId;
    return `${defender.label} rejected ${attacker.label} ${move.attr ?? "S,NA"} via ChainID ${Math.trunc(move.hitVars!.chainId!)} (previous HitDef id ${previousHitId === undefined ? "none" : previousHitId})`;
  }
  const blockedNoChainId = runtimeHelperNoChainIdRejection(move, attacker, defender, profile);
  return blockedNoChainId === undefined
    ? undefined
    : `${defender.label} rejected ${attacker.label} ${move.attr ?? "S,NA"} via NoChainID ${blockedNoChainId}`;
}

function runtimeHelperNoChainIdRejection(
  move: DemoMove,
  attacker: Pick<RuntimeHelperDirectCombatActor, "id" | "playerId">,
  defender: Pick<RuntimeHelperCombatDefender, "hitPause" | "runtime">,
  profile?: RuntimeCompatibilityProfile,
): number | undefined {
  const previous = defender.runtime.hitVars;
  if (!previous || previous.hitId === undefined) {
    return undefined;
  }
  const blockedId = move.noChainIds
    ?.slice(0, 8)
    .map(Math.trunc)
    .find((candidate) => candidate >= 0 && candidate === previous.hitId);
  if (blockedId === undefined) return undefined;
  if (runtimeChainIdOverridesEqualNoChainId(profile, move.hitVars?.chainId, blockedId)) return undefined;
  const sameSourcePlayer = attacker.playerId !== undefined && previous.sourcePlayerId === attacker.playerId;
  const sameSourceActor = previous.sourceActorId === attacker.id;
  return sameSourceActor || (sameSourcePlayer && defender.hitPause > 0) ? blockedId : undefined;
}

function applyDefaultHelperGetHitState<TDefender extends RuntimeHelperCombatDefender>(
  defender: TDefender,
  move: DemoMove,
  getHitStateWorld: RuntimeGetHitStateWorld,
  stateHooks: RuntimeHelperCombatStateHooks<TDefender>,
): void {
  if (move.p2StateNo !== undefined || defender.definition.source !== "imported") {
    return;
  }
  const forcedStateType =
    move.forceStand && defender.runtime.stateType === "C"
      ? "S"
      : move.forceCrouch && defender.runtime.stateType === "S"
        ? "C"
        : defender.runtime.stateType;
  const stateNo = getHitStateWorld.defaultGetHitStateNo(
    { ...defender.runtime, stateType: forcedStateType },
    (candidate) => stateHooks.canEnterState(defender, candidate),
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

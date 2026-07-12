import type {
  ControllerOp,
  HelperControllerOp,
  PauseControllerOp,
  TeamStandbyControllerOp,
} from "../compiler/ControllerOps";
import type { ControllerIr, RuntimeProgramIr } from "../compiler/RuntimeIr";
import type { MugenAnimationAction } from "../model/MugenAnimation";
import type { MugenStageDefinition } from "../model/MugenStage";
import type { ExpressionGameSpace } from "./ExpressionEvaluator";
import type { MugenStateController, MugenStateDef } from "../model/MugenState";
import { evaluateExpression } from "./ExpressionEvaluator";
import { createRuntimeSoundEvent, pushRuntimeSoundEvent, type RuntimeResolvedSoundValue } from "./AudioEventSystem";
import {
  advanceRuntimeContactTimers,
  createRuntimeContactMemory,
  createRuntimeContactMemoryForStateEntry,
  runtimeMoveContactValue,
  runtimeMoveHitCountValue,
  runtimeMoveReversedValue,
  type RuntimeContactMemory,
} from "./ContactMemorySystem";
import type { DemoMove } from "./demoFighters";
import { RuntimeHitDefControllerDispatchWorld } from "./HitDefSystem";
import { runtimeActorTeamSide } from "./RuntimeExpressionContextSystem";
import { RuntimeOpponentSelectionWorld, type RuntimeOpponentRosterEntry } from "./RuntimeOpponentSelectionSystem";
import type {
  RuntimeModifyProjectileNumberParam,
  RuntimeModifyProjectilePairParam,
  RuntimeProjectileModifyResolver,
} from "./ProjectileSystem";
import type { MatchPauseControllerResult, RuntimePauseControllerParamResolvers } from "./PauseSystem";
import { RuntimeControllerDispatchWorld } from "./RuntimeControllerDispatchSystem";
import { dispatchStateProgramController, findControllerParam } from "./StateProgramExecutor";
import { evaluateTriggerIr } from "./TriggerEvaluator";
import {
  normalizeRuntimeMoveType,
  normalizeRuntimePhysics,
  normalizeRuntimeStateType,
} from "./RuntimeStateEntrySystem";
import {
  isRuntimeTargetControllerDispatchEffect,
  RuntimeTargetControllerDispatchWorld,
  RuntimeTargetWorld,
  type RuntimeTarget,
  type RuntimeTargetBinding,
  type RuntimeTargetWorldActor,
} from "./TargetSystem";
import type { ActorSnapshot, CharacterRuntimeState, RuntimeHitEffectEvent, RuntimeSoundEvent, RuntimeTeamState } from "./types";

export type RuntimeHelperProjectileContactKind = "contact" | "hit" | "guard";

export type RuntimeHelper = {
  serialId: string;
  playerId?: number;
  playerNo?: number;
  parentPlayerId?: number;
  parentPlayerNo?: number;
  rootPlayerId?: number;
  rootPlayerNo?: number;
  destroyed?: boolean;
  runOrderId: number;
  runOrder?: number;
  helperId?: number;
  name?: string;
  actorKind: "helper";
  teamState?: RuntimeTeamState;
  ownerId: string;
  rootId: string;
  parentId: string;
  spriteOwnerId: string;
  spriteOwnerDefinitionId: string;
  spriteOwnerLabel: string;
  localCoord?: [number, number];
  runtimeProgram?: Pick<RuntimeProgramIr, "states">;
  animations?: Map<number, MugenAnimationAction>;
  action: MugenAnimationAction;
  stateNo?: number;
  animNo: number;
  currentMove?: DemoMove;
  currentMoveLabel?: string;
  moveTick: number;
  hasHit: boolean;
  firedHitDefs: Set<string>;
  contact: RuntimeContactMemory;
  targets: RuntimeTarget[];
  targetBindings: RuntimeTargetBinding[];
  bindToTarget?: RuntimeTargetBinding;
  pos: { x: number; y: number };
  vel: { x: number; y: number };
  bodyWidth?: { front: number; back: number };
  scale: { x: number; y: number };
  facing: 1 | -1;
  ctrl: boolean;
  stateType: CharacterRuntimeState["stateType"];
  moveType: CharacterRuntimeState["moveType"];
  physics: CharacterRuntimeState["physics"];
  lifeMax: number;
  life: number;
  superPauseDefenseMultiplier?: number;
  powerMax: number;
  power: number;
  vars: number[];
  sysvars: number[];
  fvars: number[];
  frameIndex: number;
  frameElapsed: number;
  age: number;
  stateTime: number;
  removeTime: number;
  ignoreHitPause: boolean;
  pauseMoveTime: number;
  superMoveTime: number;
  spritePriority: number;
  hitDefSpritePriority?: CharacterRuntimeState["hitDefSpritePriority"];
  assertSpecial?: CharacterRuntimeState["assertSpecial"];
  soundEvents: RuntimeSoundEvent[];
  hitEffectEvents: RuntimeHitEffectEvent[];
  ownerBind?: RuntimeHelperOwnerBind;
};

export type RuntimeHelperOwnerBind = {
  target: "parent" | "root";
  offset: { x: number; y: number; z?: number };
  remaining: number;
  facing?: 1 | -1;
};

export type RuntimeHelperPauseKind = "hitpause" | "Pause" | "SuperPause";

export type RuntimeHelperOpponentEntry = RuntimeOpponentRosterEntry<CharacterRuntimeState>;

export type RuntimeHelperAdvanceOptions = {
  pauseKind?: RuntimeHelperPauseKind;
  stageBounds?: MugenStageDefinition["bounds"];
  gameSpace?: ExpressionGameSpace;
  stageTime?: number;
  runtimeTick?: number;
  opponentId?: string;
  parentState?: CharacterRuntimeState;
  rootState?: CharacterRuntimeState;
  opponentState?: CharacterRuntimeState;
  opponentStates?: CharacterRuntimeState[];
  opponentRoster?: readonly RuntimeHelperOpponentEntry[];
  countExplods?: (helper: RuntimeHelper, explodId?: number) => number;
  countHelpers?: (helper: RuntimeHelper, helperId?: number) => number;
  countProjectiles?: (helper: RuntimeHelper, projectileId?: number) => number;
  projectileContact?: (helper: RuntimeHelper, kind: RuntimeHelperProjectileContactKind, projectileId?: number) => boolean;
  projectileContactTime?: (helper: RuntimeHelper, kind: RuntimeHelperProjectileContactKind, projectileId?: number) => number;
  projectileCancelTime?: (helper: RuntimeHelper, projectileId?: number) => number;
  targetCandidates?: RuntimeTargetWorldActor[];
  enterTargetState?: (helper: RuntimeHelper, target: RuntimeTargetWorldActor, stateId: number) => void;
  onSpawnExplod?: (helper: RuntimeHelper, controller: ControllerIr) => boolean;
  onSpawnProjectile?: (helper: RuntimeHelper, controller: ControllerIr) => boolean;
  onRemoveExplod?: (helper: RuntimeHelper, controller: ControllerIr) => boolean;
  onModifyExplod?: (helper: RuntimeHelper, controller: ControllerIr) => boolean;
  onModifyProjectile?: (helper: RuntimeHelper, controller: ControllerIr, resolveModifyProjectile?: RuntimeProjectileModifyResolver) => boolean;
  onPauseController?: (
    helper: RuntimeHelper,
    controller: ControllerIr,
    operation: PauseControllerOp | undefined,
    resolveSoundValue: () => RuntimeResolvedSoundValue | undefined,
    resolveParams: RuntimePauseControllerParamResolvers,
  ) => MatchPauseControllerResult | undefined;
  scaleTargetDamage?: (runtime: CharacterRuntimeState, damage: number) => number;
  onTeamStandby?: (helper: RuntimeHelper, operation: TeamStandbyControllerOp) => TeamStandbyControllerOp | undefined;
  onController?: (helper: RuntimeHelper, controller: ControllerIr) => void;
  onOperation?: (helper: RuntimeHelper, operation: ControllerOp) => void;
  onUnsupportedController?: (helper: RuntimeHelper, controller: ControllerIr) => void;
};

export type RuntimeHelperRemovalFilter = {
  helperId?: number;
  serialId?: string;
};

export function runtimeHelperCanDirectlyInteract(helper: RuntimeHelper): boolean {
  return helper.destroyed !== true &&
    helper.teamState?.disabled !== true &&
    helper.teamState?.standby !== true;
}

export type RuntimeHelperSpawnInput = {
  serialId: string;
  runOrderId?: number;
  controller: MugenStateController;
  operation?: HelperControllerOp;
  ownerId?: string;
  rootId?: string;
  parentId?: string;
  spriteOwnerId: string;
  spriteOwnerDefinitionId: string;
  spriteOwnerLabel: string;
  localCoord?: [number, number];
  runtimeProgram?: Pick<RuntimeProgramIr, "states">;
  animations?: Map<number, MugenAnimationAction>;
  action: MugenAnimationAction;
  stateNo?: number;
  animNo: number;
  initialStandby?: boolean;
  initialControl?: boolean;
  pos: { x: number; y: number };
  bodyWidth?: { front: number; back: number };
  fallbackFacing: 1 | -1;
};

export function createRuntimeHelper(input: RuntimeHelperSpawnInput): RuntimeHelper {
  const operation = input.operation;
  const forcedFacing = operation?.facing ?? firstNumber(findControllerParam(input.controller, "facing"));
  const identity = resolveActorIdentity(input);
  const initialState = input.runtimeProgram?.states.find((candidate) => candidate.id === input.stateNo)?.source;
  return {
    serialId: input.serialId,
    destroyed: false,
    runOrderId: input.runOrderId ?? Number.MAX_SAFE_INTEGER,
    helperId: operation?.helperId ?? firstNumber(findControllerParam(input.controller, "id")),
    name: operation?.name ?? stripMugenString(findControllerParam(input.controller, "name")),
    ...identity,
    teamState: {
      disabled: false,
      standby: input.initialStandby ?? false,
      overKo: false,
      playerType: false,
    },
    spriteOwnerId: input.spriteOwnerId,
    spriteOwnerDefinitionId: input.spriteOwnerDefinitionId,
    spriteOwnerLabel: input.spriteOwnerLabel,
    localCoord: input.localCoord,
    runtimeProgram: input.runtimeProgram,
    animations: input.animations,
    action: input.action,
    stateNo: input.stateNo,
    animNo: input.animNo,
    currentMove: undefined,
    currentMoveLabel: undefined,
    moveTick: 0,
    hasHit: false,
    firedHitDefs: new Set(),
    contact: createRuntimeContactMemory(),
    targets: [],
    targetBindings: [],
    pos: input.pos,
    vel: helperVelocity(input.controller, operation),
    bodyWidth: input.bodyWidth,
    scale: helperScale(input.controller, operation),
    facing: forcedFacing === -1 || forcedFacing === 1 ? forcedFacing : input.fallbackFacing,
    ctrl: input.initialControl ?? (initialState?.ctrl ?? 1) !== 0,
    stateType: "S",
    moveType: "I",
    physics: "N",
    lifeMax: 1000,
    life: 1000,
    powerMax: 3000,
    power: 0,
    vars: Array.from({ length: 60 }, () => 0),
    sysvars: [],
    fvars: Array.from({ length: 40 }, () => 0),
    frameIndex: 0,
    frameElapsed: 0,
    age: 0,
    stateTime: 0,
    removeTime: clampHelperTime(operation?.removeTime ?? firstNumber(findControllerParam(input.controller, "removetime")) ?? 180),
    ignoreHitPause: operation?.ignoreHitPause ?? booleanNumber(findControllerParam(input.controller, "ignorehitpause")) ?? false,
    pauseMoveTime: clampHelperMoveTime(operation?.pauseMoveTime ?? firstNumber(findControllerParam(input.controller, "pausemovetime")) ?? 0),
    superMoveTime: clampHelperMoveTime(operation?.superMoveTime ?? firstNumber(findControllerParam(input.controller, "supermovetime")) ?? 0),
    spritePriority: Math.max(-5, Math.min(10, Math.round(operation?.spritePriority ?? firstNumber(findControllerParam(input.controller, "sprpriority")) ?? 3))),
    soundEvents: [],
    hitEffectEvents: [],
  };
}

export function advanceRuntimeHelpers(
  helpers: RuntimeHelper[],
  stage: Pick<MugenStageDefinition, "bounds">,
  options: RuntimeHelperAdvanceOptions = {},
): RuntimeHelper[] {
  return helpers.filter((helper) => advanceRuntimeHelperActor(helper, stage, options));
}

export function advanceRuntimeHelperActor(
  helper: RuntimeHelper,
  stage: Pick<MugenStageDefinition, "bounds">,
  options: RuntimeHelperAdvanceOptions = {},
): boolean {
  if (canAdvanceRuntimeHelper(helper, options.pauseKind)) {
    helper.assertSpecial = undefined;
    if (runRuntimeHelperStateControllers(helper, options) === "destroyed") {
      return false;
    }
    advanceRuntimeHelper(helper, options);
    consumeRuntimeHelperPauseMoveTime(helper, options.pauseKind);
  }
  const margin = 240;
  if (helper.removeTime >= 0 && helper.age >= helper.removeTime) {
    return false;
  }
  return (
    helper.pos.x >= stage.bounds.left - margin &&
    helper.pos.x <= stage.bounds.right + margin &&
    helper.pos.y >= -360 &&
    helper.pos.y <= 180
  );
}

export type RuntimeHelperControllerResult = "active" | "destroyed";

export function runRuntimeHelperStateControllers(
  helper: RuntimeHelper,
  options: Pick<
    RuntimeHelperAdvanceOptions,
    | "stageBounds"
    | "gameSpace"
    | "stageTime"
    | "runtimeTick"
    | "parentState"
    | "rootState"
    | "opponentState"
    | "opponentStates"
    | "opponentRoster"
    | "countExplods"
    | "countHelpers"
    | "countProjectiles"
    | "projectileContact"
    | "projectileContactTime"
    | "targetCandidates"
    | "enterTargetState"
    | "onSpawnExplod"
    | "onSpawnProjectile"
    | "onRemoveExplod"
    | "onModifyExplod"
    | "onModifyProjectile"
    | "onPauseController"
    | "scaleTargetDamage"
    | "onTeamStandby"
    | "onController"
    | "onOperation"
    | "onUnsupportedController"
  > = {},
): RuntimeHelperControllerResult {
  const stateProgram = helper.runtimeProgram?.states.find((candidate) => candidate.id === helper.stateNo);
  if (!stateProgram) {
    return "active";
  }
  for (const controller of stateProgram.controllers) {
    if (!helperTriggersPass(helper, controller, options)) {
      continue;
    }
    if (controller.normalizedType === "bindtoparent" || controller.normalizedType === "bindtoroot") {
      if (!applyRuntimeHelperOwnerBindController(helper, controller, options)) {
        continue;
      }
      options.onController?.(helper, controller);
      continue;
    }
    const dispatch = dispatchStateProgramController(controller);
    if (dispatch.kind === "change-state") {
      const stateId = resolveHelperNumber(helper, dispatch.stateId, dispatch.stateExpression, options);
      if (stateId === undefined) {
        continue;
      }
      options.onController?.(helper, controller);
      changeHelperState(helper, stateId, resolveHelperNumber(helper, dispatch.animOverride, dispatch.animExpression, options));
      return "active";
    }
    if (dispatch.kind === "change-anim") {
      const actionId = resolveHelperNumber(helper, dispatch.actionId, dispatch.actionExpression, options);
      if (actionId === undefined) {
        continue;
      }
      options.onController?.(helper, controller);
      changeHelperAction(helper, actionId);
      continue;
    }
    if (dispatch.kind === "runtime-controller") {
      if (controller.normalizedType === "destroyself") {
        options.onController?.(helper, controller);
        return "destroyed";
      }
      if (controller.operation?.kind === "team-standby") {
        const operation = resolveRuntimeHelperSelfTeamStandbyOperation(helper, controller.operation, options);
        const appliedOperation = operation === undefined ? undefined : options.onTeamStandby?.(helper, operation);
        if (!appliedOperation) {
          options.onUnsupportedController?.(helper, controller);
          continue;
        }
        options.onController?.(helper, controller);
        options.onOperation?.(helper, appliedOperation);
        continue;
      }
      if (!helperRuntimeControllers.has(controller.normalizedType)) {
        options.onUnsupportedController?.(helper, controller);
        continue;
      }
      if (controller.normalizedType === "playsnd" || controller.normalizedType === "stopsnd") {
        emitHelperSoundEvent(helper, controller, options.runtimeTick ?? options.stageTime ?? helper.age);
        continue;
      }
      const expressionContext = helperExpressionContext(helper, options);
      const actor = { runtime: helperRuntimeState(helper) };
      helperControllerDispatchWorld.apply(actor, controller, {
        context: {
          self: expressionContext.self,
          playerId: expressionContext.playerId,
          playerNo: expressionContext.playerNo,
          stageBounds: options.stageBounds,
          stageTime: options.stageTime,
          opponent: expressionContext.opponent,
          parent: expressionContext.parent,
          parentPlayerId: expressionContext.parentPlayerId,
          parentPlayerNo: expressionContext.parentPlayerNo,
          root: expressionContext.root,
          rootPlayerId: expressionContext.rootPlayerId,
          rootPlayerNo: expressionContext.rootPlayerNo,
          target: expressionContext.target,
          teamSide: expressionContext.teamSide,
          opponentTeamSide: expressionContext.opponentTeamSide,
          parentTeamSide: expressionContext.parentTeamSide,
          rootTeamSide: expressionContext.rootTeamSide,
          isHelper: expressionContext.isHelper,
          helperId: expressionContext.helperId,
          stateTime: expressionContext.stateTime,
        },
        recordController: () => options.onController?.(helper, controller),
        recordOperation: (_actor, operation) => options.onOperation?.(helper, operation),
      });
      applyRuntimeStateToHelper(helper, actor.runtime);
      continue;
    }
    if (dispatch.kind === "side-effect" && dispatch.effect === "sound") {
      options.onController?.(helper, controller);
      emitHelperSoundEvent(helper, controller, options.runtimeTick ?? options.stageTime ?? helper.age);
      continue;
    }
    if (dispatch.kind === "side-effect" && dispatch.effect === "hitdef") {
      if (activateRuntimeHelperHitDef(helper, controller, helperHitDefWorld, options)) {
        options.onController?.(helper, controller);
        continue;
      }
      options.onUnsupportedController?.(helper, controller);
      continue;
    }
    if (dispatch.kind === "side-effect" && dispatch.effect === "pause") {
      const operation = controller.operation?.kind === "pause" ? controller.operation : undefined;
      const result = options.onPauseController?.(
        helper,
        controller,
        operation,
        () => resolveRuntimeHelperSoundValueParam(helper, controller, "sound", options),
        helperPauseControllerParamResolvers(helper, controller, options),
      );
      if (result) {
        options.onController?.(helper, controller);
        if (result.pause && operation) {
          options.onOperation?.(helper, operation);
        }
        continue;
      }
      options.onUnsupportedController?.(helper, controller);
      continue;
    }
    if (dispatch.kind === "side-effect" && isRuntimeTargetControllerDispatchEffect(dispatch.effect)) {
      if (applyRuntimeHelperTargetController(helper, controller, dispatch.effect, options)) {
        options.onController?.(helper, controller);
        continue;
      }
      options.onUnsupportedController?.(helper, controller);
      continue;
    }
    if (dispatch.kind === "side-effect" && dispatch.effect === "explod") {
      if (options.onSpawnExplod?.(helper, controller)) {
        options.onController?.(helper, controller);
        continue;
      }
      options.onUnsupportedController?.(helper, controller);
      continue;
    }
    if (dispatch.kind === "side-effect" && dispatch.effect === "projectile") {
      if (options.onSpawnProjectile?.(helper, controller)) {
        options.onController?.(helper, controller);
        if (controller.operation?.kind === "projectile") {
          options.onOperation?.(helper, controller.operation);
        }
        continue;
      }
      options.onUnsupportedController?.(helper, controller);
      continue;
    }
    if (dispatch.kind === "side-effect" && dispatch.effect === "removeexplod") {
      if (options.onRemoveExplod?.(helper, controller)) {
        options.onController?.(helper, controller);
        continue;
      }
      options.onUnsupportedController?.(helper, controller);
      continue;
    }
    if (dispatch.kind === "side-effect" && dispatch.effect === "modifyexplod") {
      if (options.onModifyExplod?.(helper, controller)) {
        options.onController?.(helper, controller);
        continue;
      }
      options.onUnsupportedController?.(helper, controller);
      continue;
    }
    if (dispatch.kind === "side-effect" && dispatch.effect === "modifyprojectile") {
      if (options.onModifyProjectile?.(helper, controller, helperModifyProjectileResolver(helper, controller, options))) {
        options.onController?.(helper, controller);
        continue;
      }
      options.onUnsupportedController?.(helper, controller);
      continue;
    }
    options.onUnsupportedController?.(helper, controller);
  }
  return "active";
}

function resolveRuntimeHelperSelfTeamStandbyOperation(
  helper: RuntimeHelper,
  operation: TeamStandbyControllerOp,
  options: Parameters<typeof resolveHelperNumber>[3],
): TeamStandbyControllerOp | undefined {
  if (
    helper.destroyed ||
    helper.teamState?.disabled ||
    operation.redirectPlayerId !== undefined ||
    operation.redirectPlayerIdExpression !== undefined ||
    operation.partnerOrdinal !== undefined ||
    operation.partnerOrdinalExpression !== undefined ||
    operation.callerStateNo !== undefined ||
    operation.callerStateExpression !== undefined ||
    operation.partnerStateNo !== undefined ||
    operation.partnerStateExpression !== undefined ||
    operation.callerControl !== undefined ||
    operation.callerControlExpression !== undefined ||
    operation.partnerControl !== undefined ||
    operation.partnerControlExpression !== undefined ||
    operation.memberPosition !== undefined ||
    operation.memberPositionExpression !== undefined ||
    operation.leaderPlayerNo !== undefined ||
    operation.leaderPlayerNoExpression !== undefined
  ) {
    return undefined;
  }
  const resolvedSelf = operation.selfExpression === undefined
    ? operation.self
    : resolveHelperNumber(helper, undefined, operation.selfExpression, options);
  if (resolvedSelf === undefined) {
    return undefined;
  }
  const { selfExpression: _selfExpression, ...staticOperation } = operation;
  return { ...staticOperation, self: typeof resolvedSelf === "boolean" ? resolvedSelf : resolvedSelf !== 0 };
}

function helperModifyProjectileResolver(
  helper: RuntimeHelper,
  controller: ControllerIr,
  options: Parameters<typeof resolveHelperNumber>[3],
): RuntimeProjectileModifyResolver {
  return {
    resolveNumber: (key) => resolveHelperModifyProjectileNumberParam(helper, controller, key, options),
    resolvePair: (key) => resolveHelperModifyProjectilePairParam(helper, controller, key, options),
  };
}

function resolveHelperModifyProjectileNumberParam(
  helper: RuntimeHelper,
  controller: ControllerIr,
  key: RuntimeModifyProjectileNumberParam,
  options: Parameters<typeof resolveHelperNumber>[3],
): number | undefined {
  const raw = findHelperModifyProjectileNumberParam(controller, key);
  if (raw === undefined) {
    return undefined;
  }
  return resolveHelperNumber(helper, undefined, raw.trim(), options);
}

function resolveHelperModifyProjectilePairParam(
  helper: RuntimeHelper,
  controller: ControllerIr,
  key: RuntimeModifyProjectilePairParam,
  options: Parameters<typeof resolveHelperNumber>[3],
): [number, number] | undefined {
  const raw = findHelperModifyProjectilePairParam(controller, key);
  if (raw === undefined) {
    return undefined;
  }
  return resolveHelperExpressionPair(helper, raw, options);
}

function findHelperModifyProjectileNumberParam(
  controller: ControllerIr,
  key: RuntimeModifyProjectileNumberParam,
): string | undefined {
  switch (key) {
    case "projid":
      return findControllerParam(controller.source, "projid") ?? findControllerParam(controller.source, "id");
    case "projremovetime":
      return findControllerParam(controller.source, "projremovetime") ?? findControllerParam(controller.source, "removetime");
    case "sprpriority":
      return findControllerParam(controller.source, "sprpriority") ?? findControllerParam(controller.source, "projsprpriority");
    case "projpriority":
      return findControllerParam(controller.source, "projpriority") ?? findControllerParam(controller.source, "priority");
    default:
      return findControllerParam(controller.source, key);
  }
}

function findHelperModifyProjectilePairParam(
  controller: ControllerIr,
  key: RuntimeModifyProjectilePairParam,
): string | undefined {
  switch (key) {
    case "velocity":
      return findControllerParam(controller.source, "velocity") ?? findControllerParam(controller.source, "vel");
    case "projscale":
      return findControllerParam(controller.source, "projscale") ?? findControllerParam(controller.source, "scale");
    default:
      return findControllerParam(controller.source, key);
  }
}

function resolveHelperExpressionPair(
  helper: RuntimeHelper,
  raw: string,
  options: Parameters<typeof resolveHelperNumber>[3],
): [number, number] | undefined {
  const splitIndices = topLevelCommaIndices(raw);
  if (splitIndices.length === 0) {
    const value = resolveHelperNumber(helper, undefined, raw.trim(), options);
    return value === undefined ? undefined : [value, value];
  }
  let best: { pair: [number, number]; maxCommaCount: number; balance: number; index: number } | undefined;
  for (const index of splitIndices) {
    const lowExpression = raw.slice(0, index).trim();
    const highExpression = raw.slice(index + 1).trim();
    if (!lowExpression || !highExpression) {
      continue;
    }
    const low = resolveHelperNumber(helper, undefined, lowExpression, options);
    const high = resolveHelperNumber(helper, undefined, highExpression, options);
    if (low !== undefined && high !== undefined) {
      const leftCommaCount = topLevelCommaIndices(lowExpression).length;
      const rightCommaCount = topLevelCommaIndices(highExpression).length;
      const candidate = {
        pair: [low, high] as [number, number],
        maxCommaCount: Math.max(leftCommaCount, rightCommaCount),
        balance: Math.abs(leftCommaCount - rightCommaCount),
        index,
      };
      if (
        !best ||
        candidate.maxCommaCount < best.maxCommaCount ||
        (candidate.maxCommaCount === best.maxCommaCount && candidate.balance < best.balance) ||
        (candidate.maxCommaCount === best.maxCommaCount && candidate.balance === best.balance && candidate.index > best.index)
      ) {
        best = candidate;
      }
    }
  }
  return best?.pair;
}

function topLevelCommaIndices(raw: string): number[] {
  const indices: number[] = [];
  let depth = 0;
  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index];
    if (char === "(") {
      depth += 1;
    } else if (char === ")") {
      depth = Math.max(0, depth - 1);
    } else if (char === "," && depth === 0) {
      indices.push(index);
    }
  }
  return indices;
}

export function removeRuntimeHelpers(helpers: RuntimeHelper[], filter: RuntimeHelperRemovalFilter = {}): RuntimeHelper[] {
  return helpers.filter((helper) => !matchesRuntimeHelperRemovalFilter(helper, filter));
}

export function runtimeHelpersToSnapshots(helpers: RuntimeHelper[], sourceStateNo: number): ActorSnapshot[] {
  return helpers
    .map((helper): ActorSnapshot | undefined => {
      const frame = helper.action.frames[helper.frameIndex];
      if (!frame) {
        return undefined;
      }
      const runtime = helperRuntimeState(helper);
      if (helper.stateNo === undefined) {
        runtime.stateNo = sourceStateNo;
      }
      return {
        id: helper.serialId,
        label: `Helper ${helper.name ?? helper.helperId ?? helper.stateNo ?? helper.animNo}`,
        actorKind: "helper",
        ownerId: helper.ownerId,
        rootId: helper.rootId,
        parentId: helper.parentId,
        source: "effect",
        spriteOwnerId: helper.spriteOwnerId,
        spriteOwnerDefinitionId: helper.spriteOwnerDefinitionId,
        spriteOwnerLabel: helper.spriteOwnerLabel,
        effect: {
          kind: "helper",
          id: helper.helperId,
          name: helper.name,
          stateNo: helper.stateNo,
          age: helper.age,
          stateTime: helper.stateTime,
          removeTime: helper.removeTime,
          spritePriority: helper.spritePriority,
          targetCount: helper.targets.length,
          scale: { ...helper.scale },
          ignoreHitPause: helper.ignoreHitPause,
          pauseMoveTime: helper.pauseMoveTime,
          superMoveTime: helper.superMoveTime,
          ...(helper.ownerBind
            ? {
                ownerBind: {
                  target: helper.ownerBind.target,
                  offset: { ...helper.ownerBind.offset },
                  remaining: Number.isFinite(helper.ownerBind.remaining) ? helper.ownerBind.remaining : -1,
                },
              }
            : {}),
        },
        runtime,
        frame,
        clsn1: frame.clsn1.map(cloneBox),
        clsn2: frame.clsn2.map(cloneBox),
        soundEvents: helper.soundEvents.map((event) => ({ ...event })),
        hitEffectEvents: helper.hitEffectEvents.map((event) => ({ ...event })),
      };
    })
    .filter((snapshot): snapshot is ActorSnapshot => snapshot !== undefined);
}

function matchesRuntimeHelperRemovalFilter(helper: RuntimeHelper, filter: RuntimeHelperRemovalFilter): boolean {
  if (filter.serialId !== undefined) {
    return helper.serialId === filter.serialId;
  }
  if (filter.helperId !== undefined) {
    return helper.helperId === filter.helperId;
  }
  return true;
}

const helperRuntimeControllers = new Set([
  "velset",
  "veladd",
  "velmul",
  "posset",
  "posadd",
  "gravity",
  "ctrlset",
  "lifeadd",
  "lifeset",
  "poweradd",
  "powerset",
  "statetypeset",
  "assertspecial",
  "varset",
  "varadd",
  "varrandom",
  "varrangeset",
  "null",
]);

const helperHitDefWorld = new RuntimeHitDefControllerDispatchWorld();
const helperControllerDispatchWorld = new RuntimeControllerDispatchWorld();
const helperTargetWorld = new RuntimeTargetWorld();
const helperTargetControllerDispatchWorld = new RuntimeTargetControllerDispatchWorld();
const helperOpponentSelectionWorld = new RuntimeOpponentSelectionWorld();

export function activateRuntimeHelperHitDef(
  helper: RuntimeHelper,
  controller: ControllerIr,
  hitDefWorld: RuntimeHitDefControllerDispatchWorld = helperHitDefWorld,
  options?: Parameters<typeof resolveHelperNumber>[3],
): boolean {
  const runtime = helperRuntimeState(helper);
  const actor = {
    runtime,
    currentMove: helper.currentMove,
    currentMoveLabel: helper.currentMoveLabel,
    moveTick: helper.moveTick,
    frameElapsed: helper.frameElapsed,
    hasHit: helper.hasHit,
    firedHitDefs: helper.firedHitDefs,
  };
  const result = hitDefWorld.apply({
    actor,
    controller,
    frame: helper.action.frames[helper.frameIndex],
    resolveSoundValue: options
      ? (key) => resolveRuntimeHelperSoundValueParam(helper, controller, key, options)
      : undefined,
  });
  helper.currentMove = actor.currentMove;
  helper.currentMoveLabel = actor.currentMoveLabel;
  helper.moveTick = actor.moveTick;
  helper.hasHit = actor.hasHit;
  applyRuntimeStateToHelper(helper, runtime);
  return result.activated || result.duplicate;
}

export function rememberRuntimeHelperTarget(
  helper: RuntimeHelper,
  targetActorId: string,
  targetId: number | undefined,
  targetWorld: RuntimeTargetWorld = helperTargetWorld,
): void {
  const actor = runtimeHelperTargetActor(helper);
  targetWorld.remember(actor, targetActorId, targetId);
  syncRuntimeHelperTargetActor(helper, actor);
}

export function resolveRuntimeHelperSoundValueParam(
  helper: RuntimeHelper,
  controller: ControllerIr,
  key: "sound" | "hitsound" | "guardsound",
  options: Parameters<typeof resolveHelperNumber>[3],
): RuntimeResolvedSoundValue | undefined {
  const raw = findControllerParam(controller.source, key);
  if (!raw) {
    return undefined;
  }
  const valueExpressions = splitHelperSoundValueExpressions(raw);
  if (!valueExpressions) {
    return undefined;
  }
  const [groupExpressionWithPrefix, indexExpression] = valueExpressions;
  const prefixMatch = /^([FS])\s*(.+)$/.exec(groupExpressionWithPrefix);
  const rawPrefix = prefixMatch?.[1]?.toUpperCase() as "F" | "S" | undefined;
  const groupExpression = prefixMatch?.[2]?.trim() ?? groupExpressionWithPrefix;
  if (!groupExpression) {
    return undefined;
  }
  const group = resolveHelperNumber(helper, undefined, groupExpression, options);
  const index = resolveHelperNumber(helper, undefined, indexExpression, options);
  if (group === undefined || index === undefined) {
    return undefined;
  }
  return { ...(rawPrefix ? { rawPrefix } : {}), group, index };
}

function helperPauseControllerParamResolvers(
  helper: RuntimeHelper,
  controller: ControllerIr,
  options: Parameters<typeof resolveHelperNumber>[3],
): RuntimePauseControllerParamResolvers {
  const numberParam = (key: string) => () =>
    resolveHelperNumber(helper, undefined, findControllerParam(controller.source, key), options);
  const animActionNo = () => {
    const raw = findControllerParam(controller.source, "anim")?.trim();
    if (!raw) return undefined;
    const expression = /^[FS]\s*(.+)$/i.exec(raw)?.[1]?.trim() ?? raw;
    return resolveHelperNumber(helper, undefined, expression, options);
  };
  const pos = () => {
    const raw = findControllerParam(controller.source, "pos");
    return raw ? resolveHelperExpressionPair(helper, raw, options) : undefined;
  };
  return {
    time: numberParam("time"),
    moveTime: numberParam("movetime"),
    pauseBg: numberParam("pausebg"),
    unhittable: numberParam("unhittable"),
    darken: numberParam("darken"),
    powerAdd: numberParam("poweradd"),
    p2DefMul: () => resolveHelperFloat(helper, findControllerParam(controller.source, "p2defmul"), options),
    animActionNo,
    posX: () => pos()?.[0],
    posY: () => pos()?.[1],
  };
}

function splitHelperSoundValueExpressions(raw: string): [string, string] | undefined {
  const [index] = topLevelCommaIndices(raw);
  if (index === undefined) {
    return undefined;
  }
  const groupExpression = raw.slice(0, index).trim();
  const indexExpression = raw.slice(index + 1).trim();
  return groupExpression && indexExpression ? [groupExpression, indexExpression] : undefined;
}

function applyRuntimeHelperTargetController(
  helper: RuntimeHelper,
  controller: ControllerIr,
  effect: "target" | "bindtotarget",
  options: Pick<RuntimeHelperAdvanceOptions, "targetCandidates" | "enterTargetState" | "onOperation" | "scaleTargetDamage">,
): boolean {
  if (controller.normalizedType === "targetstate" && !options.enterTargetState) {
    return false;
  }
  const actor = runtimeHelperTargetActor(helper);
  const result = helperTargetControllerDispatchWorld.apply({
    actor,
    candidateTargets: options.targetCandidates ?? [],
    controller,
    effect,
    targetWorld: helperTargetWorld,
    recordOperation: (_actor, operation) => options.onOperation?.(helper, operation),
    scaleIncomingDamage: options.scaleTargetDamage,
    enterTargetState: (target, stateId) => options.enterTargetState?.(helper, target, stateId),
  });
  applyRuntimeStateToHelper(helper, actor.runtime);
  syncRuntimeHelperTargetActor(helper, actor);
  return result.matchedTargets > 0 || result.operationExecuted;
}

function emitHelperSoundEvent(helper: RuntimeHelper, controller: ControllerIr, runtimeTick: number): void {
  const operation = controller.operation?.kind === "audio" ? controller.operation : undefined;
  pushRuntimeSoundEvent(
    helper.soundEvents,
    createRuntimeSoundEvent(
      {
        runtime: { stateNo: helper.stateNo ?? 0 },
        stateElapsed: helper.stateTime,
      },
      controller.source,
      runtimeTick,
      operation,
    ),
  );
}

function helperTriggersPass(
  helper: RuntimeHelper,
  controller: ControllerIr,
  options: Pick<
    RuntimeHelperAdvanceOptions,
    | "stageBounds"
    | "gameSpace"
    | "stageTime"
    | "opponentId"
    | "parentState"
    | "rootState"
    | "opponentState"
    | "opponentStates"
    | "opponentRoster"
    | "countExplods"
    | "countHelpers"
    | "countProjectiles"
    | "projectileContact"
    | "projectileContactTime"
  >,
): boolean {
  const triggerAll = controller.triggers.filter((trigger) => trigger.index === 0);
  if (!triggerAll.every((trigger) => evaluateTriggerIr(trigger, helperExpressionContext(helper, options)))) {
    return false;
  }
  const grouped = new Map<number, ControllerIr["triggers"]>();
  for (const trigger of controller.triggers) {
    if (trigger.index <= 0) {
      continue;
    }
    const triggers = grouped.get(trigger.index) ?? [];
    triggers.push(trigger);
    grouped.set(trigger.index, triggers);
  }
  if (grouped.size === 0) {
    return true;
  }
  return [...grouped.values()].some((triggers) =>
    triggers.every((trigger) => evaluateTriggerIr(trigger, helperExpressionContext(helper, options))),
  );
}

function resolveHelperNumber(
  helper: RuntimeHelper,
  value: number | undefined,
  expression: string | undefined,
  options: Pick<
    RuntimeHelperAdvanceOptions,
    | "stageBounds"
    | "gameSpace"
    | "stageTime"
    | "opponentId"
    | "parentState"
    | "rootState"
    | "opponentState"
    | "opponentStates"
    | "opponentRoster"
    | "countExplods"
    | "countHelpers"
    | "countProjectiles"
    | "projectileContact"
    | "projectileContactTime"
  >,
): number | undefined {
  if (value !== undefined) {
    return value;
  }
  if (!expression) {
    return undefined;
  }
  const result = Number(evaluateExpression(expression, helperExpressionContext(helper, options)));
  return Number.isFinite(result) ? Math.trunc(result) : undefined;
}

function resolveHelperFloat(
  helper: RuntimeHelper,
  expression: string | undefined,
  options: Parameters<typeof resolveHelperNumber>[3],
): number | undefined {
  if (!expression) return undefined;
  const result = Number(evaluateExpression(expression, helperExpressionContext(helper, options)));
  return Number.isFinite(result) ? result : undefined;
}

function changeHelperState(helper: RuntimeHelper, stateNo: number, animOverride?: number): void {
  const state = findHelperState(helper, stateNo);
  cancelHelperStaleMove(helper, stateNo, state);
  helper.stateNo = stateNo;
  helper.stateTime = 0;
  helper.firedHitDefs.clear();
  resetHelperContactState(helper, stateNo, state);
  if (state?.type) {
    helper.stateType = normalizeRuntimeStateType(state.type, helper.stateType);
  }
  if (state?.moveType) {
    helper.moveType = normalizeRuntimeMoveType(state.moveType, helper.moveType);
  }
  if (state?.physics) {
    helper.physics = normalizeRuntimePhysics(state.physics, helper.physics);
  }
  if (state?.ctrl !== undefined) {
    helper.ctrl = state.ctrl !== 0;
  }
  const animNo = animOverride ?? state?.anim;
  if (animNo !== undefined) {
    changeHelperAction(helper, animNo);
  }
}

export type RuntimeHelperTagStateControlMutation = {
  stateNo?: number;
  control?: boolean;
};

export function hasRuntimeHelperState(helper: RuntimeHelper, stateNo: number): boolean {
  return Number.isInteger(stateNo) && stateNo >= 0 && findHelperState(helper, stateNo) !== undefined;
}

export function applyRuntimeHelperTagStateControl(
  helper: RuntimeHelper,
  mutation: RuntimeHelperTagStateControlMutation,
): boolean {
  if (mutation.stateNo !== undefined && !hasRuntimeHelperState(helper, mutation.stateNo)) {
    return false;
  }
  if (mutation.stateNo !== undefined) {
    changeHelperState(helper, mutation.stateNo);
  }
  if (mutation.control !== undefined) {
    helper.ctrl = mutation.control;
  }
  return true;
}

function findHelperState(helper: RuntimeHelper, stateNo: number): MugenStateDef | undefined {
  return helper.runtimeProgram?.states.find((candidate) => candidate.id === stateNo)?.source;
}

function cancelHelperStaleMove(helper: RuntimeHelper, stateNo: number, state?: MugenStateDef): void {
  if (!helper.currentMove || helper.currentMove.actionId === stateNo) {
    return;
  }
  if (state?.hitDefPersist && !helper.currentMove.isReversal) {
    return;
  }
  helper.currentMove = undefined;
  helper.currentMoveLabel = undefined;
  helper.moveTick = 0;
  helper.hasHit = false;
}

function resetHelperContactState(helper: RuntimeHelper, stateNo: number, state?: MugenStateDef): void {
  helper.contact = createRuntimeContactMemoryForStateEntry(helper.contact, stateNo, {
    moveHit: Boolean(state?.moveHitPersist),
    hitCount: Boolean(state?.hitCountPersist),
  });
}

function changeHelperAction(helper: RuntimeHelper, animNo: number): void {
  const action = helper.animations?.get(animNo);
  if (!action) {
    return;
  }
  helper.action = action;
  helper.animNo = animNo;
  helper.frameIndex = 0;
  helper.frameElapsed = 0;
}

function applyRuntimeHelperOwnerBindController(
  helper: RuntimeHelper,
  controller: ControllerIr,
  options: Pick<RuntimeHelperAdvanceOptions, "parentState" | "rootState">,
): boolean {
  const operation = controller.operation?.kind === "helper-bind" ? controller.operation : undefined;
  const target = (operation?.controllerType ?? controller.normalizedType) === "bindtoroot" ? "root" : "parent";
  const targetState = target === "root" ? options.rootState : options.parentState;
  if (!targetState) {
    return false;
  }
  const offset = operation?.pos ?? pairWithDefault(numberPair(findControllerParam(controller.source, "pos")));
  const facing = normalizeFacing(operation?.facing ?? firstNumber(findControllerParam(controller.source, "facing")));
  helper.ownerBind = {
    target,
    offset: { x: offset[0], y: offset[1] },
    remaining: operation?.time ?? clampHelperBindTime(firstNumber(findControllerParam(controller.source, "time")) ?? 1),
    ...(facing === undefined ? {} : { facing }),
  };
  applyRuntimeHelperOwnerBind(helper, { parentState: options.parentState, rootState: options.rootState }, false);
  return true;
}

function applyRuntimeHelperOwnerBind(
  helper: RuntimeHelper,
  options: Pick<RuntimeHelperAdvanceOptions, "parentState" | "rootState">,
  tickRemaining: boolean,
): void {
  const bind = helper.ownerBind;
  if (!bind) {
    return;
  }
  const targetState = bind.target === "root" ? options.rootState : options.parentState;
  if (!targetState) {
    helper.ownerBind = undefined;
    return;
  }
  helper.pos = {
    x: targetState.pos.x + bind.offset.x * targetState.facing,
    y: targetState.pos.y + bind.offset.y,
  };
  if (bind.facing !== undefined) {
    helper.facing = bind.facing === 1 ? targetState.facing : ((targetState.facing * -1) as 1 | -1);
  }
  if (tickRemaining && Number.isFinite(bind.remaining)) {
    bind.remaining -= 1;
    if (bind.remaining <= 0) {
      helper.ownerBind = undefined;
    }
  }
}

function helperExpressionContext(
  helper: RuntimeHelper,
  options: Pick<
    RuntimeHelperAdvanceOptions,
    | "stageBounds"
    | "gameSpace"
    | "stageTime"
    | "opponentId"
    | "parentState"
    | "rootState"
    | "opponentState"
    | "opponentStates"
    | "countExplods"
    | "countHelpers"
    | "countProjectiles"
    | "projectileContact"
    | "projectileContactTime"
    | "projectileCancelTime"
  > = {},
) {
  const opponentRoster = helperOpponentRoster(helper, options);
  const currentOpponent = opponentRoster[0];
  return {
    self: helperExpressionRuntimeState(helper),
    playerId: helper.playerId,
    playerNo: helper.playerNo,
    opponent: currentOpponent ? cloneRuntimeStateForRedirect(currentOpponent.state) : undefined,
    enemyNear: (index: number) => helperEnemyNearRedirect(helper, opponentRoster, index),
    parent: options.parentState ? cloneRuntimeStateForRedirect(options.parentState) : undefined,
    parentPlayerId: helper.parentPlayerId,
    parentPlayerNo: helper.parentPlayerNo,
    root: options.rootState ? cloneRuntimeStateForRedirect(options.rootState) : undefined,
    rootPlayerId: helper.rootPlayerId,
    rootPlayerNo: helper.rootPlayerNo,
    teamSide: runtimeActorTeamSide({ id: helper.ownerId }),
    opponentTeamSide: currentOpponent?.id === undefined ? undefined : runtimeActorTeamSide({ id: currentOpponent.id }),
    parentTeamSide: runtimeActorTeamSide({ id: helper.ownerId }),
    rootTeamSide: runtimeActorTeamSide({ id: helper.rootId ?? helper.ownerId }),
    isHelper: true,
    helperId: helper.helperId,
    stageBounds: options.stageBounds,
    gameSpace: options.gameSpace,
    stageTime: options.stageTime,
    stateTime: helper.stateTime,
    target: (targetId?: number) => helperTargetRedirect(helper, options, targetId),
    numTarget: (targetId?: number) => helperTargetWorld.count(runtimeHelperTargetActor(helper), targetId),
    numEnemy: () => opponentRoster.length,
    numExplod: (explodId?: number) => options.countExplods?.(helper, explodId) ?? 0,
    numHelper: (helperId?: number) => options.countHelpers?.(helper, helperId) ?? 0,
    numProj: (projectileId?: number) => options.countProjectiles?.(helper, projectileId) ?? 0,
    projContact: (projectileId?: number) => options.projectileContact?.(helper, "contact", projectileId) ?? false,
    projHit: (projectileId?: number) => options.projectileContact?.(helper, "hit", projectileId) ?? false,
    projGuarded: (projectileId?: number) => options.projectileContact?.(helper, "guard", projectileId) ?? false,
    projContactTime: (projectileId?: number) => options.projectileContactTime?.(helper, "contact", projectileId) ?? -1,
    projHitTime: (projectileId?: number) => options.projectileContactTime?.(helper, "hit", projectileId) ?? -1,
    projGuardedTime: (projectileId?: number) => options.projectileContactTime?.(helper, "guard", projectileId) ?? -1,
    projCancelTime: (projectileId?: number) => options.projectileCancelTime?.(helper, projectileId) ?? -1,
    moveContact: () => runtimeMoveContactValue(helper.contact, helper.stateNo ?? 0, "contact"),
    moveHit: () => runtimeMoveContactValue(helper.contact, helper.stateNo ?? 0, "hit"),
    moveGuarded: () => runtimeMoveContactValue(helper.contact, helper.stateNo ?? 0, "guard"),
    moveReversed: () => runtimeMoveReversedValue(helper.contact, helper.stateNo ?? 0),
    hitCount: () => runtimeMoveHitCountValue(helper.contact, helper.stateNo ?? 0, false),
    uniqueHitCount: () => runtimeMoveHitCountValue(helper.contact, helper.stateNo ?? 0, true),
    animExists: (animationId: number) => helper.animations?.has(animationId) ?? false,
    stateExists: (stateNo: number) => helper.runtimeProgram?.states.some((candidate) => candidate.id === stateNo) ?? false,
  };
}

function helperExpressionRuntimeState(helper: RuntimeHelper): CharacterRuntimeState {
  const runtime = helperRuntimeState(helper);
  runtime.ctrl = runtime.ctrl && runtime.teamState?.standby !== true;
  return runtime;
}

export function helperRuntimeState(helper: RuntimeHelper): CharacterRuntimeState {
  return {
    teamState: {
      disabled: helper.teamState?.disabled ?? false,
      standby: helper.teamState?.standby ?? false,
      overKo: helper.teamState?.overKo ?? false,
      playerType: helper.teamState?.playerType ?? false,
    },
    pos: { ...helper.pos },
    vel: { ...helper.vel },
    facing: helper.facing,
    spritePriority: helper.spritePriority,
    hitDefSpritePriority: helper.hitDefSpritePriority ? { ...helper.hitDefSpritePriority } : undefined,
    assertSpecial: helper.assertSpecial
      ? { ...helper.assertSpecial, flags: [...helper.assertSpecial.flags], globalFlags: [...helper.assertSpecial.globalFlags] }
      : undefined,
    runOrder: helper.runOrder,
    stateNo: helper.stateNo ?? 0,
    animNo: helper.animNo,
    animTime: helper.stateTime,
    frameIndex: helper.frameIndex,
    lifeMax: helper.lifeMax,
    life: helper.life,
    ...(helper.superPauseDefenseMultiplier === undefined
      ? {}
      : { superPauseDefenseMultiplier: helper.superPauseDefenseMultiplier }),
    powerMax: helper.powerMax,
    power: helper.power,
    bodyWidth: helper.bodyWidth ? { ...helper.bodyWidth } : undefined,
    ctrl: helper.ctrl,
    stateType: helper.stateType,
    moveType: helper.moveType,
    physics: helper.physics,
    vars: [...helper.vars],
    sysvars: [...helper.sysvars],
    fvars: [...helper.fvars],
    ...(isDefaultScale(helper.scale) ? {} : { renderScale: { ...helper.scale } }),
    targetCount: helper.targets.length,
    targetRefs: helper.targets.map((target) => ({ ...target })),
    targetBindings: helper.targetBindings.map((binding) => ({
      actorId: binding.actorId,
      targetId: binding.targetId,
      remaining: binding.remaining === Number.POSITIVE_INFINITY ? "infinite" : binding.remaining,
      offset: { ...binding.offset },
    })),
    ...(helper.bindToTarget
      ? {
          bindToTarget: {
            actorId: helper.bindToTarget.actorId,
            targetId: helper.bindToTarget.targetId,
            remaining: helper.bindToTarget.remaining === Number.POSITIVE_INFINITY ? "infinite" : helper.bindToTarget.remaining,
            offset: { ...helper.bindToTarget.offset },
          },
        }
      : {}),
  };
}

function cloneRuntimeStateForRedirect(state: CharacterRuntimeState): CharacterRuntimeState {
  return {
    ...state,
    pos: { ...state.pos },
    vel: { ...state.vel },
    vars: [...state.vars],
    sysvars: state.sysvars ? [...state.sysvars] : undefined,
    fvars: [...state.fvars],
  };
}

export function applyRuntimeStateToHelper(helper: RuntimeHelper, runtime: CharacterRuntimeState): void {
  helper.teamState = runtime.teamState ? { ...runtime.teamState } : helper.teamState;
  helper.pos = { ...runtime.pos };
  helper.vel = { ...runtime.vel };
  helper.facing = runtime.facing;
  helper.stateNo = runtime.stateNo;
  helper.animNo = runtime.animNo;
  helper.spritePriority = runtime.spritePriority ?? helper.spritePriority;
  helper.hitDefSpritePriority = runtime.hitDefSpritePriority ? { ...runtime.hitDefSpritePriority } : undefined;
  helper.lifeMax = runtime.lifeMax ?? helper.lifeMax;
  helper.life = runtime.life;
  helper.superPauseDefenseMultiplier = runtime.superPauseDefenseMultiplier;
  helper.powerMax = runtime.powerMax ?? helper.powerMax;
  helper.power = runtime.power;
  helper.ctrl = runtime.ctrl;
  helper.stateType = runtime.stateType;
  helper.moveType = runtime.moveType;
  helper.physics = runtime.physics;
  helper.assertSpecial = runtime.assertSpecial
    ? { ...runtime.assertSpecial, flags: [...runtime.assertSpecial.flags], globalFlags: [...runtime.assertSpecial.globalFlags] }
    : undefined;
  helper.runOrder = runtime.runOrder;
  helper.vars = [...runtime.vars];
  helper.sysvars = [...(runtime.sysvars ?? [])];
  helper.fvars = [...runtime.fvars];
}

function advanceRuntimeHelper(helper: RuntimeHelper, options: Pick<RuntimeHelperAdvanceOptions, "parentState" | "rootState"> = {}): void {
  advanceRuntimeHelperMove(helper);
  advanceRuntimeContactTimers(helper.contact);
  advanceRuntimeHelperTargetMemory(helper);
  helper.age += 1;
  helper.stateTime += 1;
  helper.pos.x += helper.vel.x;
  helper.pos.y += helper.vel.y;
  helper.frameElapsed += 1;
  const frame = helper.action.frames[helper.frameIndex];
  if (frame && helper.frameElapsed >= Math.max(1, frame.duration)) {
    helper.frameElapsed = 0;
    const next = helper.frameIndex + 1;
    helper.frameIndex = next < helper.action.frames.length ? next : helper.action.loopStart ?? helper.action.frames.length - 1;
  }
  applyRuntimeHelperOwnerBind(helper, options, true);
}

function advanceRuntimeHelperTargetMemory(helper: RuntimeHelper): void {
  const actor = runtimeHelperTargetActor(helper);
  helperTargetWorld.advance(actor);
  syncRuntimeHelperTargetActor(helper, actor);
}

function helperEnemyNearRedirect(
  helper: RuntimeHelper,
  opponentRoster: readonly RuntimeHelperResolvedOpponentEntry[],
  index: number,
) {
  const opponent = opponentRoster[index];
  if (!opponent) {
    return undefined;
  }
  return {
    self: cloneRuntimeStateForRedirect(opponent.state),
    opponent: helperRuntimeState(helper),
    teamSide: opponent.id === undefined ? undefined : runtimeActorTeamSide({ id: opponent.id }),
    opponentTeamSide: runtimeActorTeamSide({ id: helper.ownerId }),
  };
}

type RuntimeHelperResolvedOpponentEntry = RuntimeHelperOpponentEntry & {
  runtime: CharacterRuntimeState;
};

function helperOpponentRoster(
  helper: RuntimeHelper,
  options: Pick<RuntimeHelperAdvanceOptions, "opponentId" | "opponentState" | "opponentStates" | "opponentRoster">,
): readonly RuntimeHelperResolvedOpponentEntry[] {
  if (options.opponentRoster) {
    return sortHelperOpponentRoster(helper, options.opponentRoster.map(resolveHelperOpponentEntry));
  }
  if (options.opponentStates) {
    return sortHelperOpponentRoster(
      helper,
      options.opponentStates.map((state) =>
        resolveHelperOpponentEntry({
          state,
          ...(options.opponentId !== undefined && state === options.opponentState ? { id: options.opponentId } : {}),
        }),
      ),
    );
  }
  return options.opponentState ? [resolveHelperOpponentEntry({ id: options.opponentId, state: options.opponentState })] : [];
}

function sortHelperOpponentRoster(
  helper: RuntimeHelper,
  roster: readonly RuntimeHelperResolvedOpponentEntry[],
): readonly RuntimeHelperResolvedOpponentEntry[] {
  const runtime = helperRuntimeState(helper);
  return helperOpponentSelectionWorld.orderByNearest({ state: runtime, runtime }, roster);
}

function resolveHelperOpponentEntry(entry: RuntimeHelperOpponentEntry): RuntimeHelperResolvedOpponentEntry {
  return {
    ...entry,
    runtime: entry.state,
  };
}

function helperTargetRedirect(
  helper: RuntimeHelper,
  options: Pick<RuntimeHelperAdvanceOptions, "opponentId" | "opponentState">,
  targetId?: number,
) {
  if (!options.opponentId || !options.opponentState) {
    return undefined;
  }
  const actor = runtimeHelperTargetActor(helper);
  if (!helperTargetWorld.find(actor, options.opponentId, targetId)) {
    return undefined;
  }
  return {
    self: cloneRuntimeStateForRedirect(options.opponentState),
    opponent: helperRuntimeState(helper),
    teamSide: runtimeActorTeamSide({ id: options.opponentId }),
    opponentTeamSide: runtimeActorTeamSide({ id: helper.ownerId }),
  };
}

function runtimeHelperTargetActor(helper: RuntimeHelper): RuntimeTargetWorldActor {
  return {
    id: helper.serialId,
    runtime: helperRuntimeState(helper),
    targets: helper.targets,
    targetBindings: helper.targetBindings,
    bindToTarget: helper.bindToTarget,
  };
}

function syncRuntimeHelperTargetActor(helper: RuntimeHelper, actor: RuntimeTargetWorldActor): void {
  helper.targets = actor.targets;
  helper.targetBindings = actor.targetBindings;
  helper.bindToTarget = actor.bindToTarget;
}

function advanceRuntimeHelperMove(helper: RuntimeHelper): void {
  if (!helper.currentMove) {
    return;
  }
  helper.moveTick += 1;
  helper.moveType = "A";
  if (helper.moveTick <= helper.currentMove.startup + helper.currentMove.recovery) {
    return;
  }
  helper.currentMove = undefined;
  helper.currentMoveLabel = undefined;
  helper.moveTick = 0;
  helper.hasHit = false;
  helper.moveType = "I";
}

export function canAdvanceRuntimeHelper(helper: RuntimeHelper, pauseKind: RuntimeHelperPauseKind | undefined): boolean {
  if (!pauseKind) {
    return true;
  }
  if (pauseKind === "hitpause") {
    return helper.ignoreHitPause;
  }
  const moveTime = pauseKind === "SuperPause" ? helper.superMoveTime : helper.pauseMoveTime;
  return moveTime < 0 || moveTime > 0;
}

function consumeRuntimeHelperPauseMoveTime(helper: RuntimeHelper, pauseKind: RuntimeHelperPauseKind | undefined): void {
  if (pauseKind === "Pause" && helper.pauseMoveTime > 0) {
    helper.pauseMoveTime -= 1;
  }
  if (pauseKind === "SuperPause" && helper.superMoveTime > 0) {
    helper.superMoveTime -= 1;
  }
}

function resolveActorIdentity(input: RuntimeHelperSpawnInput): Pick<
  RuntimeHelper,
  "actorKind" | "ownerId" | "rootId" | "parentId"
> {
  const ownerId = input.ownerId ?? input.spriteOwnerId;
  const rootId = input.rootId ?? ownerId;
  const parentId = input.parentId ?? ownerId;
  return { actorKind: "helper", ownerId, rootId, parentId };
}

function cloneBox<T extends { x1: number; y1: number; x2: number; y2: number }>(box: T): T {
  return { ...box };
}

function firstNumber(value: string | undefined): number | undefined {
  const raw = value?.split(",")[0]?.trim();
  if (!raw) {
    return undefined;
  }
  const numberValue = Number(raw);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function helperVelocity(controller: MugenStateController, operation: HelperControllerOp | undefined): { x: number; y: number } {
  const velocity = operation?.velocity ?? numberPair(findControllerParam(controller, "velset") ?? findControllerParam(controller, "vel") ?? findControllerParam(controller, "velocity"));
  return {
    x: clampHelperVelocity(velocity?.[0] ?? 0),
    y: clampHelperVelocity(velocity?.[1] ?? 0),
  };
}

function helperScale(controller: MugenStateController, operation: HelperControllerOp | undefined): { x: number; y: number } {
  const scale = operation?.scale ?? helperScalePair(controller);
  return {
    x: clampHelperScale(scale?.[0] ?? 1),
    y: clampHelperScale(scale?.[1] ?? 1),
  };
}

function helperScalePair(controller: MugenStateController): [number, number] | undefined {
  const explicit = numberPair(findControllerParam(controller, "scale"));
  if (explicit) {
    return explicit;
  }
  const x = firstNumber(findControllerParam(controller, "size.xscale") ?? findControllerParam(controller, "xscale"));
  const y = firstNumber(findControllerParam(controller, "size.yscale") ?? findControllerParam(controller, "yscale"));
  return x === undefined && y === undefined ? undefined : [x ?? 1, y ?? x ?? 1];
}

function numberPair(value: string | undefined): [number, number] | undefined {
  if (!value) {
    return undefined;
  }
  const [rawX, rawY] = value.split(",");
  const x = Number(rawX?.trim());
  const y = Number(rawY?.trim());
  return Number.isFinite(x) && Number.isFinite(y) ? [x, y] : undefined;
}

function pairWithDefault(value: [number, number] | undefined): [number, number] {
  return [value?.[0] ?? 0, value?.[1] ?? 0];
}

function clampHelperVelocity(value: number): number {
  return Math.max(-80, Math.min(80, value));
}

function clampHelperMoveTime(value: number): number {
  return value < 0 ? -1 : Math.max(0, Math.min(600, Math.round(value)));
}

function clampHelperScale(value: number): number {
  return Math.max(0.05, Math.min(8, value));
}

function isDefaultScale(scale: { x: number; y: number }): boolean {
  return scale.x === 1 && scale.y === 1;
}

function clampHelperTime(value: number): number {
  return value < 0 ? -1 : Math.max(1, Math.min(1200, Math.round(value)));
}

function clampHelperBindTime(value: number): number {
  if (value < 0) {
    return Number.POSITIVE_INFINITY;
  }
  return Math.max(0, Math.min(3600, Math.round(value)));
}

function normalizeFacing(value: number | undefined): 1 | -1 | undefined {
  if (value === 1 || value === -1) {
    return value;
  }
  return undefined;
}

function booleanNumber(value: string | undefined): boolean | undefined {
  if (value === undefined) {
    return undefined;
  }
  const parsed = firstNumber(value);
  return parsed === undefined ? undefined : parsed !== 0;
}

function stripMugenString(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }
  return trimmed.replace(/^"|"$/g, "");
}

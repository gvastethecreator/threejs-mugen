import type { BindToTargetControllerOp, TargetControllerOp } from "../compiler/ControllerOps";
import type { ControllerIr } from "../compiler/RuntimeIr";
import type { MugenStateController } from "../model/MugenState";
import { scaleRuntimeIncomingAmount } from "./CombatResolver";
import {
  applyRuntimeDizzyPointsAdd,
  applyRuntimeGuardPointsAdd,
  applyRuntimeLifeAdd,
  applyRuntimePowerDelta,
  applyRuntimeRedLifeAdd,
} from "./RuntimeResourceSystem";
import { runtimeDizzyPointsMultiplier } from "./DizzyPointsDefaults";
import { runtimeRedLifeMultiplier } from "./RedLifeDefaults";
import type { RuntimeResourceConstants } from "./RuntimeResourceSystem";
import type {
  CharacterRuntimeState,
  RuntimeRedirectedTargetDispatchOperationClass,
  RuntimeTargetBindingSnapshot,
  RuntimeTargetSnapshot,
} from "./types";

export type RuntimeTarget = {
  actorId: string;
  targetId?: number;
  age: number;
};

export type RuntimeTargetBinding = {
  actorId: string;
  targetId?: number;
  remaining: number;
  offset: { x: number; y: number; z?: number };
};

export type RuntimeTargetPostype = "foot" | "mid" | "head";

export type RuntimeTargetMemory = {
  targets: RuntimeTarget[];
  bindings: RuntimeTargetBinding[];
};

export type RuntimeTargetMemorySnapshot = {
  targets: RuntimeTargetSnapshot[];
  bindings: RuntimeTargetBindingSnapshot[];
};

export type RuntimeTargetRuntimeSnapshot = RuntimeTargetMemorySnapshot & {
  targetCount: number;
  bindToTarget?: RuntimeTargetBindingSnapshot;
};

export type RuntimeTargetLinkSnapshot = {
  ownerId: string;
  actorId: string;
  targetId?: number;
  age: number;
  binding?: RuntimeTargetBindingSnapshot;
};

export type RuntimeTargetLinkSource = RuntimeTargetMemorySnapshot & {
  ownerId: string;
  bindToTarget?: RuntimeTargetBindingSnapshot;
};

export type RuntimeTargetControllerActor = {
  id: string;
  definition?: { id?: string; localCoord?: [number, number] };
  runtime: CharacterRuntimeState;
  targets: RuntimeTarget[];
  targetBindings: RuntimeTargetBinding[];
};

export type RuntimeTargetWorldActor = RuntimeTargetControllerActor & {
  bindToTarget?: RuntimeTargetBinding;
};

export type RuntimeTargetControllerOptions<TActor extends RuntimeTargetControllerActor> = {
  actor: TActor;
  candidateTargets: TActor[];
  controller: MugenStateController;
  operation?: TargetControllerOp;
  onOperation?: (operation: TargetControllerOp) => void;
  constants?: RuntimeResourceConstants;
  getTargetConst?: (target: TActor, name: string) => number | undefined;
  scaleIncomingDamage?: (runtime: CharacterRuntimeState, damage: number) => number;
  canEnterTargetState?: (target: TActor, stateId: number) => boolean;
  enterTargetState?: (target: TActor, stateId: number) => unknown;
};

export type RuntimeBindToTargetControllerOptions<TActor extends RuntimeTargetWorldActor> = {
  actor: TActor;
  candidateTargets: TActor[];
  controller: MugenStateController;
  operation?: BindToTargetControllerOp;
  onOperation?: (operation: BindToTargetControllerOp) => void;
  getTargetConst?: (target: TActor, name: string) => number | undefined;
};

export type RuntimeTargetBindingApplyResult = {
  appliedBindings: number;
};

export type RuntimeTargetControllerResult = {
  controllerType: string;
  matchedTargets: number;
  operationExecuted: boolean;
};

export type RuntimeTargetControllerDispatchEffect = "target" | "bindtotarget";

export type RuntimeTargetControllerDispatchOperation = TargetControllerOp | BindToTargetControllerOp;

export type RuntimeTargetControllerDispatchSelection = {
  destinationId: string;
  controllerType: string;
  operationClass: RuntimeRedirectedTargetDispatchOperationClass;
  effect: RuntimeTargetControllerDispatchEffect;
  candidateTargetIds: string[];
  requestedId?: number;
  selectedTargetIds: string[];
  mutatedActorIds: string[];
  matchedTargets: number;
  operationExecuted: boolean;
};

export type RuntimeTargetControllerDispatchOptions<TActor extends RuntimeTargetWorldActor> = {
  actor: TActor;
  candidateTargets: TActor[];
  controller: ControllerIr;
  effect: RuntimeTargetControllerDispatchEffect;
  targetWorld: RuntimeTargetWorld;
  recordController?: (actor: TActor, controller: MugenStateController) => void;
  recordOperation?: (actor: TActor, operation: RuntimeTargetControllerDispatchOperation) => void;
  recordTargetLifeAdd?: (sourceActor: TActor, targetActor: TActor, lifeBefore: number) => void;
  recordDispatch?: (selection: RuntimeTargetControllerDispatchSelection) => void;
  constants?: RuntimeResourceConstants;
  scaleIncomingDamage?: (runtime: CharacterRuntimeState, damage: number) => number;
  canEnterTargetState?: (target: TActor, stateId: number) => boolean;
  enterTargetState?: (target: TActor, stateId: number) => unknown;
  getTargetConst?: (target: TActor, name: string) => number | undefined;
};

export type RuntimeTargetControllerDispatchResult = RuntimeTargetControllerResult & {
  recordedController: boolean;
  recordedOperation: boolean;
};

export class RuntimeTargetWorld {
  remember(actor: RuntimeTargetControllerActor, targetActorId: string, targetId: number | undefined): void {
    actor.targets = rememberRuntimeTarget(actor.targets, targetActorId, targetId);
    syncRuntimeTargetCount(actor);
  }

  advance(actor: RuntimeTargetWorldActor): void {
    const next = advanceRuntimeTargetMemory({ targets: actor.targets, bindings: actor.targetBindings });
    actor.targets = next.targets;
    actor.targetBindings = next.bindings;
    actor.bindToTarget = tickRuntimeBindToTarget(actor.bindToTarget, actor.targets);
    syncRuntimeTargetCount(actor);
  }

  clearBindingSubject(actor: RuntimeTargetWorldActor): void {
    markRuntimeTargetBindingSubject(actor.runtime, false);
  }

  snapshot(actor: RuntimeTargetControllerActor): RuntimeTargetMemorySnapshot {
    return snapshotRuntimeTargetMemory({ targets: actor.targets, bindings: actor.targetBindings });
  }

  snapshotRuntimeState(runtime: CharacterRuntimeState): RuntimeTargetRuntimeSnapshot {
    return snapshotRuntimeTargetRuntimeState(runtime);
  }

  snapshotLinks(source: RuntimeTargetLinkSource): RuntimeTargetLinkSnapshot[] {
    return snapshotRuntimeTargetLinks(source);
  }

  count(actor: RuntimeTargetControllerActor, targetId?: number): number {
    return actor.targets.filter((target) => matchesRuntimeTargetId(target, targetId)).length;
  }

  find(actor: RuntimeTargetControllerActor, actorId: string, requestedId?: number): RuntimeTarget | undefined {
    return actor.targets.find((target) => target.actorId === actorId && matchesRuntimeTargetId(target, requestedId));
  }

  resolveCandidates<TActor extends { id: string }>(
    actor: RuntimeTargetControllerActor,
    candidateTargets: TActor[],
    requestedId?: number,
  ): TActor[] {
    return matchingRuntimeTargetActors(actor.targets, candidateTargets, requestedId);
  }

  applyController<TActor extends RuntimeTargetControllerActor>(
    options: RuntimeTargetControllerOptions<TActor>,
  ): RuntimeTargetControllerResult {
    const requestedId =
      options.operation?.controllerType === "targetdrop"
        ? undefined
        : options.operation?.requestedId ?? firstNumber(findControllerParam(options.controller, "id"));
    return applyRuntimeTargetController({
      ...options,
      candidateTargets: this.resolveCandidates(options.actor, options.candidateTargets, requestedId),
    });
  }

  applyBindToTargetController<TActor extends RuntimeTargetWorldActor>(
    options: RuntimeBindToTargetControllerOptions<TActor>,
  ): RuntimeTargetControllerResult {
    const requestedId = options.operation?.requestedId ?? firstNumber(findControllerParam(options.controller, "id")) ?? -1;
    return applyRuntimeBindToTargetController({
      ...options,
      candidateTargets: this.resolveCandidates(options.actor, options.candidateTargets, requestedId),
    });
  }

  applyTargetBindings<TActor extends RuntimeTargetWorldActor>(
    actor: TActor,
    candidateTargets: TActor[],
  ): RuntimeTargetBindingApplyResult {
    return applyRuntimeTargetBindings(actor, this.resolveCandidates(actor, candidateTargets));
  }

  applyBindToTarget<TActor extends RuntimeTargetWorldActor>(
    actor: TActor,
    candidateTargets: TActor[],
  ): RuntimeTargetBindingApplyResult {
    return applyRuntimeBindToTarget(actor, this.resolveCandidates(actor, candidateTargets));
  }
}

export class RuntimeTargetControllerDispatchWorld {
  apply<TActor extends RuntimeTargetWorldActor>(
    options: RuntimeTargetControllerDispatchOptions<TActor>,
  ): RuntimeTargetControllerDispatchResult {
    let recordedOperation = false;
    const beforeTargets = options.actor.targets.map((target) => ({ ...target }));
    const beforeBindings = options.actor.targetBindings.map((binding) => ({ ...binding, offset: { ...binding.offset } }));
    const beforeCandidateLives = new Map(options.candidateTargets.map((candidate) => [candidate.id, candidate.runtime.life] as const));
    const beforeBindingSubjects = new Map(
      options.candidateTargets.map((candidate) => [candidate.id, candidate.runtime.hitVars?.isBound] as const),
    );
    options.recordController?.(options.actor, options.controller.source);

    if (options.effect === "target") {
      const result = options.targetWorld.applyController({
        actor: options.actor,
        candidateTargets: options.candidateTargets,
        controller: options.controller.source,
        operation: options.controller.operation?.kind === "target" ? options.controller.operation : undefined,
        onOperation: (operation) => {
          recordedOperation = true;
          options.recordOperation?.(options.actor, operation);
        },
        constants: options.constants,
        getTargetConst: options.getTargetConst,
        scaleIncomingDamage: options.scaleIncomingDamage,
        canEnterTargetState: options.canEnterTargetState,
        enterTargetState: options.enterTargetState,
      });
      const selection = createRuntimeTargetControllerDispatchSelection(
        options,
        result,
        beforeTargets,
        beforeBindings,
        beforeBindingSubjects,
      );
      if (result.controllerType === "targetlifeadd" && result.matchedTargets > 0) {
        for (const target of options.candidateTargets) {
          if (!selection.selectedTargetIds.includes(target.id)) continue;
          const lifeBefore = beforeCandidateLives.get(target.id);
          if (lifeBefore === undefined) continue;
          options.recordTargetLifeAdd?.(options.actor, target, lifeBefore);
        }
      }
      options.recordDispatch?.(selection);
      return {
        ...result,
        recordedController: Boolean(options.recordController),
        recordedOperation,
      };
    }

    const result = options.targetWorld.applyBindToTargetController({
      actor: options.actor,
      candidateTargets: options.candidateTargets,
      controller: options.controller.source,
      operation: options.controller.operation?.kind === "bindtotarget" ? options.controller.operation : undefined,
      onOperation: (operation) => {
        recordedOperation = true;
        options.recordOperation?.(options.actor, operation);
      },
      getTargetConst: options.getTargetConst,
    });
    options.recordDispatch?.(
      createRuntimeTargetControllerDispatchSelection(
        options,
        result,
        beforeTargets,
        beforeBindings,
        beforeBindingSubjects,
      ),
    );
    return {
      ...result,
      recordedController: Boolean(options.recordController),
      recordedOperation,
    };
  }
}

function createRuntimeTargetControllerDispatchSelection<TActor extends RuntimeTargetWorldActor>(
  options: RuntimeTargetControllerDispatchOptions<TActor>,
  result: RuntimeTargetControllerResult,
  beforeTargets: RuntimeTarget[],
  beforeBindings: RuntimeTargetBinding[],
  beforeBindingSubjects: ReadonlyMap<string, boolean | undefined>,
): RuntimeTargetControllerDispatchSelection {
  const operation = options.controller.operation;
  const controllerType = result.controllerType;
  const candidateTargetIds = uniqueRuntimeActorIds(options.candidateTargets.map(({ id }) => id));
  const operationClass = runtimeTargetControllerDispatchOperationClass(controllerType, options.effect);
  const requestedId =
    (operation && "requestedId" in operation ? operation.requestedId : undefined) ??
    (controllerType === "targetdrop" ? undefined : firstNumber(findControllerParam(options.controller.source, "id")));
  const selectedTargetIds = controllerType === "targetdrop"
    ? droppedRuntimeTargetActorIds(beforeTargets, options.actor.targets)
    : options.effect === "bindtotarget"
      ? selectedBindToTargetActorIds(beforeTargets, options.candidateTargets, requestedId)
      : matchingRuntimeTargetActors(beforeTargets, options.candidateTargets, requestedId).map(({ id }) => id);
  const targetStateMutationIds = controllerType === "targetstate" && !result.operationExecuted
    ? []
    : selectedTargetIds;
  const changedBindingSubjects = options.candidateTargets
    .filter((candidate) => beforeBindingSubjects.get(candidate.id) !== candidate.runtime.hitVars?.isBound)
    .map(({ id }) => id);
  const mutatedActorIds = uniqueRuntimeActorIds([
    ...(options.effect === "bindtotarget" || controllerType === "targetbind" || controllerType === "targetdrop"
      ? [options.actor.id]
      : []),
    ...targetStateMutationIds,
    ...changedBindingSubjects,
    ...(
      controllerType === "targetdrop"
        ? beforeBindings
            .filter((binding) => !hasRuntimeTargetBindingTarget(options.actor.targets, binding))
            .map(({ actorId }) => actorId)
        : []
    ),
  ]);
  return {
    destinationId: options.actor.id,
    controllerType,
    operationClass,
    effect: options.effect,
    candidateTargetIds,
    ...(requestedId === undefined ? {} : { requestedId }),
    selectedTargetIds: uniqueRuntimeActorIds(selectedTargetIds),
    mutatedActorIds,
    matchedTargets: result.matchedTargets,
    operationExecuted: result.operationExecuted,
  };
}

function runtimeTargetControllerDispatchOperationClass(
  controllerType: string,
  effect: RuntimeTargetControllerDispatchEffect,
): RuntimeRedirectedTargetDispatchOperationClass {
  if (effect === "bindtotarget") return "bind-to-target";
  if (controllerType === "targetstate") return "target-state";
  if (controllerType === "targetbind" || controllerType === "targetdrop") return "target-binding";
  if (controllerType === "targetfacing" || controllerType === "targetveladd" || controllerType === "targetvelset") {
    return "target-motion";
  }
  if (
    controllerType === "targetlifeadd" ||
    controllerType === "targetpoweradd" ||
    controllerType === "targetredlifeadd" ||
    controllerType === "targetguardpointsadd" ||
    controllerType === "targetdizzypointsadd"
  ) {
    return "target-resource";
  }
  return "target-controller";
}

function droppedRuntimeTargetActorIds(beforeTargets: RuntimeTarget[], afterTargets: RuntimeTarget[]): string[] {
  const afterKeys = new Set(afterTargets.map(runtimeTargetKey));
  return beforeTargets.filter((target) => !afterKeys.has(runtimeTargetKey(target))).map(({ actorId }) => actorId);
}

function selectedBindToTargetActorIds<TActor extends RuntimeTargetWorldActor>(
  beforeTargets: RuntimeTarget[],
  candidates: TActor[],
  requestedId: number | undefined,
): string[] {
  const target = candidates.find((candidate) => hasRuntimeTarget(beforeTargets, candidate.id, requestedId));
  return target ? [target.id] : [];
}

function runtimeTargetKey(target: RuntimeTarget): string {
  return `${target.actorId}:${target.targetId ?? "*"}`;
}

function uniqueRuntimeActorIds(ids: string[]): string[] {
  return [...new Set(ids)];
}

export function isRuntimeTargetControllerDispatchEffect(effect: string): effect is RuntimeTargetControllerDispatchEffect {
  return effect === "target" || effect === "bindtotarget";
}

export function applyRuntimeTargetController<TActor extends RuntimeTargetControllerActor>(
  options: RuntimeTargetControllerOptions<TActor>,
): RuntimeTargetControllerResult {
  const type = options.operation?.controllerType ?? options.controller.type.toLowerCase();
  if (type === "targetdrop") {
    if (options.actor.targets.length === 0) {
      return { controllerType: type, matchedTargets: 0, operationExecuted: false };
    }
    if (options.operation) {
      options.onOperation?.(options.operation);
    }
    const operation = options.operation?.controllerType === "targetdrop" ? options.operation : undefined;
    const excludeId = operation?.excludeId ?? firstNumber(findControllerParam(options.controller, "excludeid") ?? findControllerParam(options.controller, "id"));
    const keepOne = operation?.keepOne ?? (firstNumber(findControllerParam(options.controller, "keepone")) ?? 1) !== 0;
    const beforeCount = options.actor.targets.length;
    const next = dropRuntimeTargets({ targets: options.actor.targets, bindings: options.actor.targetBindings }, excludeId, keepOne);
    options.actor.targets = next.targets;
    options.actor.targetBindings = next.bindings;
    for (const target of options.candidateTargets) {
      markRuntimeTargetBindingSubject(target.runtime, hasRuntimeTargetBindingSubject(options.actor, target.id));
    }
    syncRuntimeTargetCount(options.actor);
    return { controllerType: type, matchedTargets: beforeCount, operationExecuted: Boolean(options.operation) };
  }

  const targetOperation = options.operation?.controllerType === "targetdrop" ? undefined : options.operation;
  const requestedId = targetOperation?.requestedId ?? firstNumber(findControllerParam(options.controller, "id"));
  const targets = matchingRuntimeTargetActors(options.actor.targets, options.candidateTargets, requestedId);
  if (targets.length === 0) {
    return { controllerType: type, matchedTargets: 0, operationExecuted: false };
  }
  const targetStateId =
    options.operation?.controllerType === "targetstate"
      ? options.operation.stateNo
      : firstNumber(findControllerParam(options.controller, "value"));
  if (
    type === "targetstate" &&
    (targetStateId === undefined ||
      (options.canEnterTargetState !== undefined &&
        targets.some((target) => !options.canEnterTargetState!(target, targetStateId))))
  ) {
    return { controllerType: type, matchedTargets: 0, operationExecuted: false };
  }
  if (options.operation) {
    options.onOperation?.(options.operation);
  }

  for (const target of targets) {
    if (type === "targetlifeadd") {
      const typed = options.operation?.controllerType === "targetlifeadd" ? options.operation : undefined;
      const value = typed?.value ?? firstNumber(findControllerParam(options.controller, "value")) ?? 0;
      const absolute = typed?.absolute ?? (firstNumber(findControllerParam(options.controller, "absolute")) ?? 0) !== 0;
      const kill = typed?.kill ?? (firstNumber(findControllerParam(options.controller, "kill")) ?? 1) !== 0;
      const dizzy = typed?.dizzy ?? (firstNumber(findControllerParam(options.controller, "dizzy")) ?? 1) !== 0;
      const redLife = typed?.redLife ?? (firstNumber(findControllerParam(options.controller, "redlife")) ?? 1) !== 0;
      const scaledDamage = options.scaleIncomingDamage ?? ((_runtime, damage) => Math.round(damage));
      const delta = value < 0 && !absolute ? -scaledDamage(target.runtime, Math.abs(value)) : Math.round(value);
      const lifeBefore = target.runtime.life;
      applyRuntimeLifeAdd(target.runtime, delta, kill);
      const lifeDelta = target.runtime.life - lifeBefore;
      if (lifeDelta !== 0) {
        const constants = runtimeTargetResourceConstants(options, target);
        const sourceAttr = target.runtime.hitVars?.sourceAttr;
        if (redLife) {
          applyRuntimeRedLifeAdd(target.runtime, lifeDelta * runtimeRedLifeMultiplier(sourceAttr, constants), true);
        }
        if (dizzy && target.runtime.dizzyPoints !== 0 && target.runtime.assertSpecial?.noDizzyPointsDamage !== true) {
          applyRuntimeDizzyPointsAdd(target.runtime, lifeDelta * runtimeDizzyPointsMultiplier(sourceAttr, constants));
        }
      }
      if (delta !== 0) {
        target.runtime.hitVars = { ...target.runtime.hitVars, kill };
      }
    } else if (type === "targetredlifeadd") {
      const typed = options.operation?.controllerType === "targetredlifeadd" ? options.operation : undefined;
      const value = typed?.value ?? firstNumber(findControllerParam(options.controller, "value")) ?? 0;
      const absolute = typed?.absolute ?? (firstNumber(findControllerParam(options.controller, "absolute")) ?? 0) !== 0;
      if (target.runtime.assertSpecial?.noRedLifeDamage !== true) {
        const delta = resolveTargetResourceDelta(target.runtime, value, absolute, true);
        applyRuntimeRedLifeAdd(target.runtime, delta, true);
      }
    } else if (type === "targetguardpointsadd") {
      const typed = options.operation?.controllerType === "targetguardpointsadd" ? options.operation : undefined;
      const value = typed?.value ?? firstNumber(findControllerParam(options.controller, "value")) ?? 0;
      const absolute = typed?.absolute ?? (firstNumber(findControllerParam(options.controller, "absolute")) ?? 0) !== 0;
      if (target.runtime.assertSpecial?.noGuardPointsDamage !== true) {
        applyRuntimeGuardPointsAdd(target.runtime, resolveTargetResourceDelta(target.runtime, value, absolute, false));
      }
    } else if (type === "targetdizzypointsadd") {
      const typed = options.operation?.controllerType === "targetdizzypointsadd" ? options.operation : undefined;
      const value = typed?.value ?? firstNumber(findControllerParam(options.controller, "value")) ?? 0;
      const absolute = typed?.absolute ?? (firstNumber(findControllerParam(options.controller, "absolute")) ?? 0) !== 0;
      if (target.runtime.dizzyPoints !== 0 && target.runtime.assertSpecial?.noDizzyPointsDamage !== true) {
        applyRuntimeDizzyPointsAdd(target.runtime, resolveTargetResourceDelta(target.runtime, value, absolute, false));
      }
    } else if (type === "targetpoweradd") {
      const value =
        options.operation?.controllerType === "targetpoweradd"
          ? options.operation.value
          : firstNumber(findControllerParam(options.controller, "value")) ?? 0;
      applyRuntimePowerDelta(target.runtime, value);
    } else if (type === "targetfacing") {
      const value =
        options.operation?.controllerType === "targetfacing"
          ? options.operation.value
          : firstNumber(findControllerParam(options.controller, "value")) ?? 1;
      target.runtime.facing = value < 0 ? (options.actor.runtime.facing === 1 ? -1 : 1) : options.actor.runtime.facing;
    } else if (type === "targetveladd") {
      const typed = options.operation?.controllerType === "targetveladd" ? options.operation : undefined;
      const x = typed?.x ?? firstNumber(findControllerParam(options.controller, "x")) ?? 0;
      const y = typed?.y ?? firstNumber(findControllerParam(options.controller, "y")) ?? 0;
      target.runtime.vel.x += x * target.runtime.facing;
      target.runtime.vel.y += y;
    } else if (type === "targetvelset") {
      const typed = options.operation?.controllerType === "targetvelset" ? options.operation : undefined;
      const x = typed?.x ?? firstNumber(findControllerParam(options.controller, "x"));
      const y = typed?.y ?? firstNumber(findControllerParam(options.controller, "y"));
      target.runtime.vel = {
        x: x === undefined ? target.runtime.vel.x : x * options.actor.runtime.facing,
        y: y === undefined ? target.runtime.vel.y : y,
      };
    } else if (type === "targetbind") {
      const typed = options.operation?.controllerType === "targetbind" ? options.operation : undefined;
      const offset = typed?.pos ?? numberTriple(findControllerParam(options.controller, "pos")) ?? [0, 0];
      const remaining = typed?.time ?? firstNumber(findControllerParam(options.controller, "time")) ?? 1;
      target.runtime.pos = {
        x: options.actor.runtime.pos.x + offset[0] * options.actor.runtime.facing,
        y: options.actor.runtime.pos.y + offset[1],
      };
      applyRuntimeTargetBindDepth(target, options.actor, offset[2]);
      markRuntimeTargetBindingSubject(target.runtime, true);
      options.actor.targetBindings = addRuntimeTargetBinding(
        options.actor.targetBindings,
        createRuntimeTargetBinding({
          actorId: target.id,
          targetId: findRuntimeTargetId(options.actor.targets, target.id),
          remaining,
          offset: { x: offset[0], y: offset[1], ...(offset[2] === undefined ? {} : { z: offset[2] }) },
        }),
      );
    } else if (type === "targetstate") {
      if (targetStateId !== undefined) {
        options.enterTargetState?.(target, targetStateId);
      }
    }
  }

  return { controllerType: type, matchedTargets: targets.length, operationExecuted: Boolean(options.operation) };
}

function runtimeTargetResourceConstants<TActor extends RuntimeTargetControllerActor>(
  options: RuntimeTargetControllerOptions<TActor>,
  target: TActor,
): RuntimeResourceConstants {
  const constants = { ...(options.constants ?? {}) };
  for (const name of [
    "default.lifetoredlifemul",
    "super.lifetoredlifemul",
    "default.lifetodizzypointsmul",
    "super.lifetodizzypointsmul",
  ]) {
    const value = options.getTargetConst?.(target, name);
    if (value !== undefined) {
      constants[name] = value;
    }
  }
  return constants;
}

function resolveTargetResourceDelta(
  runtime: CharacterRuntimeState,
  value: number,
  absolute: boolean,
  boundToLife: boolean,
): number {
  let delta = absolute ? value : scaleRuntimeIncomingAmount(runtime, value);
  if (delta > 0 && delta < 1) {
    delta = 1;
  }
  if (boundToLife && delta > runtime.life) {
    delta = runtime.life;
  }
  if (delta >= runtime.life && runtime.life > 0) {
    delta = runtime.life - 1;
  }
  return Math.round(delta);
}

export function applyRuntimeBindToTargetController<TActor extends RuntimeTargetWorldActor>(
  options: RuntimeBindToTargetControllerOptions<TActor>,
): RuntimeTargetControllerResult {
  const requestedId = options.operation?.requestedId ?? firstNumber(findControllerParam(options.controller, "id")) ?? -1;
  const target = options.candidateTargets.find((candidate) => hasRuntimeTarget(options.actor.targets, candidate.id, requestedId));
  if (!target) {
    return { controllerType: "bindtotarget", matchedTargets: 0, operationExecuted: false };
  }

  const memoryTarget = options.actor.targets.find((candidate) => candidate.actorId === target.id && matchesRuntimeTargetId(candidate, requestedId));
  const bindParams = options.operation ? { pos: options.operation.pos, postype: options.operation.postype } : bindToTargetParams(options.controller);
  const anchor = resolveRuntimeTargetAnchor(target, bindParams.postype, options.getTargetConst);
  const posZ = options.operation?.posZ ?? firstNumber(findControllerParam(options.controller, "posz"));
  const offset = {
    x: anchor.x + bindParams.pos[0],
    y: anchor.y + bindParams.pos[1],
    ...(posZ === undefined ? {} : { z: posZ }),
  };
  const remaining = options.operation?.time ?? firstNumber(findControllerParam(options.controller, "time")) ?? 1;
  options.actor.bindToTarget = createRuntimeTargetBinding({
    actorId: target.id,
    targetId: memoryTarget?.targetId,
    remaining,
    offset,
  });
  options.actor.runtime.pos = resolveRuntimeTargetBindingPosition(target.runtime.pos, target.runtime.facing, options.actor.bindToTarget);
  applyRuntimeBindToTargetDepth(options.actor, target, options.actor.bindToTarget.offset.z);
  options.onOperation?.(
    options.operation ?? {
      kind: "bindtotarget",
      requestedId,
      pos: bindParams.pos,
      posZ: options.actor.bindToTarget.offset.z,
      postype: bindParams.postype,
      time: options.actor.bindToTarget.remaining,
    },
  );
  return { controllerType: "bindtotarget", matchedTargets: 1, operationExecuted: true };
}

export function applyRuntimeTargetBindings<TActor extends RuntimeTargetWorldActor>(
  actor: TActor,
  candidateTargets: TActor[],
): RuntimeTargetBindingApplyResult {
  let appliedBindings = 0;
  for (const target of candidateTargets) {
    markRuntimeTargetBindingSubject(target.runtime, false);
  }
  for (const binding of actor.targetBindings) {
    const target = findBoundRuntimeTargetActor(actor.targets, binding, candidateTargets);
    if (!target) {
      continue;
    }
    target.runtime.pos = resolveRuntimeTargetBindingPosition(actor.runtime.pos, actor.runtime.facing, binding);
    applyRuntimeTargetBindDepth(target, actor, binding.offset.z);
    markRuntimeTargetBindingSubject(target.runtime, true);
    appliedBindings += 1;
  }
  return { appliedBindings };
}

export function applyRuntimeBindToTarget<TActor extends RuntimeTargetWorldActor>(
  actor: TActor,
  candidateTargets: TActor[],
): RuntimeTargetBindingApplyResult {
  const binding = actor.bindToTarget;
  if (!binding) {
    return { appliedBindings: 0 };
  }
  const target = findBoundRuntimeTargetActor(actor.targets, binding, candidateTargets);
  if (!target) {
    return { appliedBindings: 0 };
  }
  actor.runtime.pos = resolveRuntimeTargetBindingPosition(target.runtime.pos, target.runtime.facing, binding);
  applyRuntimeBindToTargetDepth(actor, target, binding.offset.z);
  return { appliedBindings: 1 };
}

export function rememberRuntimeTarget(
  targets: RuntimeTarget[],
  actorId: string,
  targetId: number | undefined,
  limit = 8,
): RuntimeTarget[] {
  const existing = targets.find((target) => target.actorId === actorId && target.targetId === targetId);
  if (existing) {
    existing.age = 0;
    return targets;
  }
  targets.unshift({ actorId, targetId, age: 0 });
  targets.splice(limit);
  return targets;
}

export function advanceRuntimeTargetMemory(memory: RuntimeTargetMemory, maxAge = 600): RuntimeTargetMemory {
  for (const target of memory.targets) {
    target.age += 1;
  }
  for (const binding of memory.bindings) {
    if (binding.remaining !== Number.POSITIVE_INFINITY) {
      binding.remaining -= 1;
    }
  }
  const targets = memory.targets.filter((target) => target.age <= maxAge);
  return {
    targets,
    bindings: memory.bindings.filter((binding) => binding.remaining > 0 && hasRuntimeTargetBindingTarget(targets, binding)),
  };
}

export function snapshotRuntimeTargetMemory(memory: RuntimeTargetMemory): RuntimeTargetMemorySnapshot {
  return {
    targets: memory.targets.map((target) => ({
      actorId: target.actorId,
      targetId: target.targetId,
      age: target.age,
    })),
    bindings: memory.bindings.map((binding) => ({
      actorId: binding.actorId,
      targetId: binding.targetId,
      remaining: binding.remaining === Number.POSITIVE_INFINITY ? "infinite" : binding.remaining,
      offset: { ...binding.offset },
    })),
  };
}

export function snapshotRuntimeTargetRuntimeState(runtime: CharacterRuntimeState): RuntimeTargetRuntimeSnapshot {
  const targets = runtime.targetRefs?.map(cloneRuntimeTargetSnapshot) ?? [];
  const bindings = runtime.targetBindings?.map(cloneRuntimeTargetBindingSnapshot) ?? [];
  return {
    targetCount: runtime.targetCount ?? targets.length,
    targets,
    bindings,
    ...(runtime.bindToTarget ? { bindToTarget: cloneRuntimeTargetBindingSnapshot(runtime.bindToTarget) } : {}),
  };
}

export function snapshotRuntimeTargetLinks(source: RuntimeTargetLinkSource): RuntimeTargetLinkSnapshot[] {
  const links: RuntimeTargetLinkSnapshot[] = [];
  for (const target of source.targets) {
    const bindings = [
      ...source.bindings.filter((binding) => binding.actorId === target.actorId && binding.targetId === target.targetId),
      ...(source.bindToTarget?.actorId === target.actorId && source.bindToTarget.targetId === target.targetId
        ? [source.bindToTarget]
        : []),
    ];
    if (bindings.length === 0) {
      links.push({
        ownerId: source.ownerId,
        actorId: target.actorId,
        targetId: target.targetId,
        age: target.age,
      });
      continue;
    }
    for (const binding of bindings) {
      links.push({
        ownerId: source.ownerId,
        actorId: target.actorId,
        targetId: target.targetId,
        age: target.age,
        binding: cloneRuntimeTargetBindingSnapshot(binding),
      });
    }
  }
  return links;
}

export function dropRuntimeTargets(
  memory: RuntimeTargetMemory,
  excludeId: number | undefined,
  keepOne: boolean,
): RuntimeTargetMemory {
  const keptTargets = memory.targets.filter((target) => shouldKeepTargetAfterDrop(target, excludeId));
  const boundedTargets = keepOne ? keptTargets.slice(0, 1) : keptTargets;
  return {
    targets: boundedTargets,
    bindings: memory.bindings.filter((binding) => hasRuntimeTargetBindingTarget(boundedTargets, binding)),
  };
}

function shouldKeepTargetAfterDrop(target: RuntimeTarget, excludeId: number | undefined): boolean {
  const effectiveExcludeId = excludeId ?? -1;
  return effectiveExcludeId >= 0 && target.targetId === effectiveExcludeId;
}

export function hasRuntimeTarget(
  targets: RuntimeTarget[],
  actorId: string,
  requestedId: number | undefined,
): boolean {
  return targets.some((target) => target.actorId === actorId && matchesRuntimeTargetId(target, requestedId));
}

export function findRuntimeTargetId(targets: RuntimeTarget[], actorId: string): number | undefined {
  return targets.find((target) => target.actorId === actorId)?.targetId;
}

export function matchingRuntimeTargetActors<TActor extends { id: string }>(
  targets: RuntimeTarget[],
  candidates: TActor[],
  requestedId: number | undefined,
): TActor[] {
  return candidates.filter((candidate) => hasRuntimeTarget(targets, candidate.id, requestedId));
}

export function matchesRuntimeTargetId(target: { targetId?: number }, requestedId: number | undefined): boolean {
  return requestedId === undefined || requestedId < 0 || target.targetId === requestedId;
}

function findBoundRuntimeTargetActor<TActor extends { id: string }>(
  targets: RuntimeTarget[],
  binding: RuntimeTargetBinding,
  candidates: TActor[],
): TActor | undefined {
  if (!hasRuntimeTargetBindingTarget(targets, binding)) {
    return undefined;
  }
  return candidates.find((candidate) => candidate.id === binding.actorId);
}

function hasRuntimeTargetBindingTarget(
  targets: RuntimeTarget[],
  binding: Pick<RuntimeTargetBinding, "actorId" | "targetId">,
): boolean {
  return targets.some((target) => target.actorId === binding.actorId && target.targetId === binding.targetId);
}

function hasRuntimeTargetBindingSubject(actor: RuntimeTargetControllerActor, actorId: string): boolean {
  return actor.targetBindings.some(
    (binding) => binding.actorId === actorId && hasRuntimeTargetBindingTarget(actor.targets, binding),
  );
}

function markRuntimeTargetBindingSubject(runtime: CharacterRuntimeState, isBound: boolean): void {
  runtime.hitVars = { ...runtime.hitVars, isBound };
}

export function createRuntimeTargetBinding(input: {
  actorId: string;
  targetId?: number;
  remaining: number;
  offset: { x: number; y: number; z?: number };
}): RuntimeTargetBinding {
  return {
    actorId: input.actorId,
    targetId: input.targetId,
    remaining: clampRuntimeTargetDuration(input.remaining),
    offset: { ...input.offset },
  };
}

export function addRuntimeTargetBinding(
  bindings: RuntimeTargetBinding[],
  binding: RuntimeTargetBinding,
  limit = 8,
): RuntimeTargetBinding[] {
  bindings.unshift(binding);
  bindings.splice(limit);
  return bindings;
}

export function tickRuntimeBindToTarget(
  binding: RuntimeTargetBinding | undefined,
  targets: RuntimeTarget[],
): RuntimeTargetBinding | undefined {
  if (!binding || !hasRuntimeTargetBindingTarget(targets, binding)) {
    return undefined;
  }
  if (binding.remaining === Number.POSITIVE_INFINITY) {
    return binding;
  }
  const remaining = binding.remaining - 1;
  return remaining > 0 ? { ...binding, remaining } : undefined;
}

export function resolveRuntimeTargetBindingPosition(
  ownerPos: { x: number; y: number },
  ownerFacing: 1 | -1,
  binding: RuntimeTargetBinding,
): { x: number; y: number } {
  return {
    x: ownerPos.x + binding.offset.x * ownerFacing,
    y: ownerPos.y + binding.offset.y,
  };
}

function applyRuntimeTargetBindDepth(
  subject: RuntimeTargetControllerActor,
  owner: RuntimeTargetControllerActor,
  offsetZ: number | undefined,
): void {
  if (offsetZ === undefined || !subject.runtime.combatDepth || !owner.runtime.combatDepth) return;
  subject.runtime.combatDepth.position =
    (owner.runtime.combatDepth.position + offsetZ) * (localDepthScale(owner) / localDepthScale(subject));
}

function applyRuntimeBindToTargetDepth(
  subject: RuntimeTargetControllerActor,
  target: RuntimeTargetControllerActor,
  offsetZ: number | undefined,
): void {
  if (offsetZ === undefined || !subject.runtime.combatDepth || !target.runtime.combatDepth) return;
  subject.runtime.combatDepth.position =
    target.runtime.combatDepth.position * (localDepthScale(target) / localDepthScale(subject)) + offsetZ;
}

function localDepthScale(actor: RuntimeTargetControllerActor): number {
  const width = actor.definition?.localCoord?.[0];
  return typeof width === "number" && Number.isFinite(width) && width > 0 ? 320 / width : 1;
}

export function resolveRuntimeTargetAnchor<TActor>(
  target: TActor,
  postype: RuntimeTargetPostype,
  getConst?: (target: TActor, name: string) => number | undefined,
): { x: number; y: number } {
  if (postype === "foot") {
    return { x: 0, y: 0 };
  }
  const key = postype === "head" ? "size.head.pos" : "size.mid.pos";
  return {
    x: getConst?.(target, `${key}.x`) ?? getConst?.(target, key) ?? 0,
    y: getConst?.(target, `${key}.y`) ?? 0,
  };
}

export function clampRuntimeTargetDuration(value: number): number {
  if (value < 0) {
    return Number.POSITIVE_INFINITY;
  }
  return Math.max(0, Math.min(3600, Math.round(value)));
}

function syncRuntimeTargetCount(actor: RuntimeTargetControllerActor): void {
  actor.runtime.targetCount = actor.targets.length;
}

function cloneRuntimeTargetSnapshot(target: RuntimeTargetSnapshot): RuntimeTargetSnapshot {
  return {
    actorId: target.actorId,
    targetId: target.targetId,
    age: target.age,
  };
}

function cloneRuntimeTargetBindingSnapshot(binding: RuntimeTargetBindingSnapshot): RuntimeTargetBindingSnapshot {
  return {
    actorId: binding.actorId,
    targetId: binding.targetId,
    remaining: binding.remaining,
    offset: { ...binding.offset },
  };
}

function findControllerParam(controller: MugenStateController, key: string): string | undefined {
  const lower = key.toLowerCase();
  return Object.entries(controller.params).find(([candidate]) => candidate.toLowerCase() === lower)?.[1];
}

function firstNumber(value: string | undefined): number | undefined {
  const raw = value?.split(",")[0]?.trim();
  if (!raw) {
    return undefined;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function numberTriple(value: string | undefined): [number, number, number?] | undefined {
  if (!value) return undefined;
  const values = value.split(",").map((part) => Number(part.trim()));
  if (!Number.isFinite(values[0]) || !Number.isFinite(values[1])) return undefined;
  return Number.isFinite(values[2]) ? [values[0]!, values[1]!, values[2]!] : [values[0]!, values[1]!];
}

function bindToTargetParams(controller: MugenStateController): { pos: [number, number]; postype: RuntimeTargetPostype } {
  const raw = findControllerParam(controller, "pos");
  if (!raw) {
    return { pos: [0, 0], postype: "foot" };
  }
  const parts = raw.split(",").map((part) => part.trim());
  const pair = bindToTargetNumberPair(raw) ?? [0, 0];
  return {
    pos: [pair[0], pair[1] ?? 0],
    postype: normalizeRuntimeTargetPostype(parts[2]),
  };
}

function normalizeRuntimeTargetPostype(value: string | undefined): RuntimeTargetPostype {
  const normalized = value?.replace(/^"|"$/g, "").trim().toLowerCase();
  return normalized === "mid" || normalized === "head" ? normalized : "foot";
}

function bindToTargetNumberPair(value: string | undefined): [number, number] | undefined {
  if (!value) {
    return undefined;
  }
  const numbers = value
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((numberValue) => Number.isFinite(numberValue));
  if (numbers.length === 0 || numbers[0] === undefined) {
    return undefined;
  }
  return [numbers[0], numbers[1] ?? numbers[0]];
}

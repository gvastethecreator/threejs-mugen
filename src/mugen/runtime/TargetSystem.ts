import type { TargetControllerOp } from "../compiler/ControllerOps";
import type { MugenStateController } from "../model/MugenState";
import { applyRuntimeDamage, canRuntimeDamageKill } from "./CombatResolver";
import type { CharacterRuntimeState, RuntimeTargetBindingSnapshot, RuntimeTargetSnapshot } from "./types";

export type RuntimeTarget = {
  actorId: string;
  targetId?: number;
  age: number;
};

export type RuntimeTargetBinding = {
  actorId: string;
  targetId?: number;
  remaining: number;
  offset: { x: number; y: number };
};

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
  scaleIncomingDamage?: (runtime: CharacterRuntimeState, damage: number) => number;
  enterTargetState?: (target: TActor, stateId: number) => void;
};

export type RuntimeTargetControllerResult = {
  controllerType: string;
  matchedTargets: number;
  operationExecuted: boolean;
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

  applyController<TActor extends RuntimeTargetControllerActor>(
    options: RuntimeTargetControllerOptions<TActor>,
  ): RuntimeTargetControllerResult {
    return applyRuntimeTargetController(options);
  }
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
    syncRuntimeTargetCount(options.actor);
    return { controllerType: type, matchedTargets: beforeCount, operationExecuted: Boolean(options.operation) };
  }

  const targetOperation = options.operation?.controllerType === "targetdrop" ? undefined : options.operation;
  const requestedId = targetOperation?.requestedId ?? firstNumber(findControllerParam(options.controller, "id"));
  const targets = matchingRuntimeTargetActors(options.actor.targets, options.candidateTargets, requestedId);
  if (targets.length === 0) {
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
      const scaledDamage = options.scaleIncomingDamage ?? ((_runtime, damage) => Math.round(damage));
      const delta = value < 0 && !absolute ? -scaledDamage(target.runtime, Math.abs(value)) : Math.round(value);
      target.runtime.life =
        delta < 0
          ? applyRuntimeDamage(target.runtime.life, Math.abs(delta), canRuntimeDamageKill(target.runtime, kill))
          : Math.max(0, Math.min(target.runtime.lifeMax ?? Number.POSITIVE_INFINITY, target.runtime.life + delta));
    } else if (type === "targetpoweradd") {
      const value =
        options.operation?.controllerType === "targetpoweradd"
          ? options.operation.value
          : firstNumber(findControllerParam(options.controller, "value")) ?? 0;
      target.runtime.power = Math.max(0, Math.min(target.runtime.powerMax ?? 3000, target.runtime.power + value));
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
      const offset = typed?.pos ?? numberPair(findControllerParam(options.controller, "pos")) ?? [0, 0];
      const remaining = typed?.time ?? firstNumber(findControllerParam(options.controller, "time")) ?? 1;
      target.runtime.pos = {
        x: options.actor.runtime.pos.x + offset[0] * options.actor.runtime.facing,
        y: options.actor.runtime.pos.y + offset[1],
      };
      options.actor.targetBindings = addRuntimeTargetBinding(
        options.actor.targetBindings,
        createRuntimeTargetBinding({
          actorId: target.id,
          targetId: findRuntimeTargetId(options.actor.targets, target.id),
          remaining,
          offset: { x: offset[0], y: offset[1] },
        }),
      );
    } else if (type === "targetstate") {
      const stateId =
        options.operation?.controllerType === "targetstate"
          ? options.operation.stateNo
          : firstNumber(findControllerParam(options.controller, "value"));
      if (stateId !== undefined) {
        options.enterTargetState?.(target, stateId);
      }
    }
  }

  return { controllerType: type, matchedTargets: targets.length, operationExecuted: Boolean(options.operation) };
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
  return {
    targets: memory.targets.filter((target) => target.age <= maxAge),
    bindings: memory.bindings.filter((binding) => binding.remaining > 0),
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
    bindings: memory.bindings.filter((binding) => boundedTargets.some((target) => target.actorId === binding.actorId && target.targetId === binding.targetId)),
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

export function createRuntimeTargetBinding(input: {
  actorId: string;
  targetId?: number;
  remaining: number;
  offset: { x: number; y: number };
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
  if (!binding || !targets.some((target) => target.actorId === binding.actorId && target.targetId === binding.targetId)) {
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

function numberPair(value: string | undefined): [number, number] | undefined {
  if (!value) {
    return undefined;
  }
  const [xRaw, yRaw] = value.split(",");
  const x = Number(xRaw?.trim());
  const y = Number(yRaw?.trim());
  return Number.isFinite(x) && Number.isFinite(y) ? [x, y] : undefined;
}

import type { ContactControllerOp } from "../compiler/ControllerOps";
import type { ControllerIr } from "../compiler/RuntimeIr";
import type { MugenStateController } from "../model/MugenState";

export type RuntimeContactMemory = {
  moveContactState?: number;
  moveHitState?: number;
  moveGuardState?: number;
  moveContactTime?: number;
  moveHitTime?: number;
  moveGuardTime?: number;
  moveHitCount?: number;
  moveUniqueHitCount?: number;
  moveHitTargetIds?: Set<string>;
  moveReversedState?: number;
  moveReversedTime?: number;
  receivedDamageState?: number;
  receivedDamageAmount?: number;
  receivedHitsState?: number;
  receivedHitsCount?: number;
  projectileContactState?: number;
  projectileHitState?: number;
  projectileGuardState?: number;
  projectileId?: number;
  projectileContactTime?: number;
  projectileHitTime?: number;
  projectileGuardTime?: number;
};

export type RuntimeContactKind = "contact" | "hit" | "guard";

export type RuntimeContactControllerActor = {
  contact: RuntimeContactMemory;
  runtime: { stateNo: number };
};

export type RuntimeContactControllerDispatchOptions<TActor extends RuntimeContactControllerActor> = {
  actor: TActor;
  controller: ControllerIr;
  contactWorld: RuntimeContactMemoryWorld;
  recordController?: (actor: TActor, controller: MugenStateController) => void;
  recordOperation?: (actor: TActor, operation: ContactControllerOp) => void;
};

export type RuntimeContactControllerDispatchResult = {
  applied: boolean;
  controllerType: string;
  recordedController: boolean;
  recordedOperation: boolean;
};

export class RuntimeContactMemoryWorld {
  create(): RuntimeContactMemory {
    return createRuntimeContactMemory();
  }

  resetMoveContact(memory: RuntimeContactMemory): void {
    resetRuntimeMoveContact(memory);
  }

  applyHitAdd(memory: RuntimeContactMemory, stateNo: number, value: number): void {
    applyRuntimeHitAdd(memory, stateNo, value);
  }

  markMoveContact(
    memory: RuntimeContactMemory,
    stateNo: number,
    kind: Extract<RuntimeContactKind, "hit" | "guard">,
    targetActorId?: string,
  ): void {
    markRuntimeMoveContact(memory, stateNo, kind, targetActorId);
  }

  markMoveReversed(memory: RuntimeContactMemory, stateNo: number): void {
    markRuntimeMoveReversed(memory, stateNo);
  }

  markReceivedDamage(memory: RuntimeContactMemory, stateNo: number, damage: number): void {
    markRuntimeReceivedDamage(memory, stateNo, damage);
  }

  markProjectileContact(
    memory: RuntimeContactMemory,
    stateNo: number,
    projectileId: number | undefined,
    kind: Extract<RuntimeContactKind, "hit" | "guard">,
  ): void {
    markRuntimeProjectileContact(memory, stateNo, projectileId, kind);
  }

  advance(memory: RuntimeContactMemory): void {
    advanceRuntimeContactTimers(memory);
  }

  moveContactValue(memory: RuntimeContactMemory, stateNo: number, kind: RuntimeContactKind): number {
    return runtimeMoveContactValue(memory, stateNo, kind);
  }

  moveHitCountValue(memory: RuntimeContactMemory, stateNo: number, unique: boolean): number {
    return runtimeMoveHitCountValue(memory, stateNo, unique);
  }

  moveReversedValue(memory: RuntimeContactMemory, stateNo: number): number {
    return runtimeMoveReversedValue(memory, stateNo);
  }

  receivedDamageValue(memory: RuntimeContactMemory, stateNo: number): number {
    return runtimeReceivedDamageValue(memory, stateNo);
  }

  receivedHitsValue(memory: RuntimeContactMemory, stateNo: number): number {
    return runtimeReceivedHitsValue(memory, stateNo);
  }

  hasProjectileContact(
    memory: RuntimeContactMemory,
    stateNo: number,
    kind: RuntimeContactKind,
    projectileId?: number,
  ): boolean {
    return hasRuntimeProjectileContact(memory, stateNo, kind, projectileId);
  }

  projectileContactTime(
    memory: RuntimeContactMemory,
    stateNo: number,
    kind: RuntimeContactKind,
    projectileId?: number,
  ): number {
    return runtimeProjectileContactTime(memory, stateNo, kind, projectileId);
  }
}

export class RuntimeContactControllerDispatchWorld {
  apply<TActor extends RuntimeContactControllerActor>(
    options: RuntimeContactControllerDispatchOptions<TActor>,
  ): RuntimeContactControllerDispatchResult {
    const controllerType = options.controller.source.type.toLowerCase();
    const operation = options.controller.operation?.kind === "contact" ? options.controller.operation : undefined;
    options.recordController?.(options.actor, options.controller.source);
    if (operation) {
      options.recordOperation?.(options.actor, operation);
    }

    if (controllerType === "hitadd") {
      const value = operation?.controllerType === "hitadd" ? operation.value : firstNumber(findControllerParam(options.controller.source, "value"));
      if (value === undefined) {
        return {
          applied: false,
          controllerType,
          recordedController: Boolean(options.recordController),
          recordedOperation: Boolean(operation && options.recordOperation),
        };
      }
      options.contactWorld.applyHitAdd(options.actor.contact, options.actor.runtime.stateNo, value);
      return {
        applied: true,
        controllerType,
        recordedController: Boolean(options.recordController),
        recordedOperation: Boolean(operation && options.recordOperation),
      };
    }

    options.contactWorld.resetMoveContact(options.actor.contact);
    return {
      applied: true,
      controllerType,
      recordedController: Boolean(options.recordController),
      recordedOperation: Boolean(operation && options.recordOperation),
    };
  }
}

export function createRuntimeContactMemory(): RuntimeContactMemory {
  return {};
}

export function resetRuntimeMoveContact(memory: RuntimeContactMemory): void {
  delete memory.moveContactState;
  delete memory.moveHitState;
  delete memory.moveGuardState;
  delete memory.moveContactTime;
  delete memory.moveHitTime;
  delete memory.moveGuardTime;
  delete memory.moveHitCount;
  delete memory.moveUniqueHitCount;
  delete memory.moveHitTargetIds;
  delete memory.moveReversedState;
  delete memory.moveReversedTime;
}

export function applyRuntimeHitAdd(memory: RuntimeContactMemory, stateNo: number, value: number): void {
  const current = memory.moveHitState === stateNo ? memory.moveHitCount ?? 0 : 0;
  memory.moveHitState = stateNo;
  memory.moveHitTime = memory.moveHitTime ?? 0;
  memory.moveHitCount = clampHitCount(current + value);
}

export function markRuntimeMoveContact(
  memory: RuntimeContactMemory,
  stateNo: number,
  kind: Extract<RuntimeContactKind, "hit" | "guard">,
  targetActorId?: string,
): void {
  memory.moveContactState = stateNo;
  memory.moveContactTime = 0;
  if (kind === "hit") {
    memory.moveHitState = stateNo;
    memory.moveHitTime = 0;
    memory.moveHitCount = clampHitCount((memory.moveHitCount ?? 0) + 1);
    if (targetActorId) {
      const targetIds = memory.moveHitTargetIds ?? new Set<string>();
      if (!targetIds.has(targetActorId)) {
        targetIds.add(targetActorId);
        memory.moveUniqueHitCount = clampHitCount((memory.moveUniqueHitCount ?? 0) + 1);
      }
      memory.moveHitTargetIds = targetIds;
    } else {
      memory.moveUniqueHitCount = clampHitCount((memory.moveUniqueHitCount ?? 0) + 1);
    }
  } else {
    memory.moveGuardState = stateNo;
    memory.moveGuardTime = 0;
  }
}

export function markRuntimeMoveReversed(memory: RuntimeContactMemory, stateNo: number): void {
  memory.moveReversedState = stateNo;
  memory.moveReversedTime = 0;
}

export function markRuntimeReceivedDamage(memory: RuntimeContactMemory, stateNo: number, damage: number): void {
  memory.receivedDamageState = stateNo;
  memory.receivedDamageAmount = Math.max(0, Math.round(damage));
  memory.receivedHitsState = stateNo;
  memory.receivedHitsCount = clampHitCount((memory.receivedHitsCount ?? 0) + 1);
}

export function markRuntimeProjectileContact(
  memory: RuntimeContactMemory,
  stateNo: number,
  projectileId: number | undefined,
  kind: Extract<RuntimeContactKind, "hit" | "guard">,
): void {
  memory.projectileContactState = stateNo;
  memory.projectileId = projectileId;
  memory.projectileContactTime = 0;
  if (kind === "hit") {
    memory.projectileHitState = stateNo;
    memory.projectileHitTime = 0;
  } else {
    memory.projectileGuardState = stateNo;
    memory.projectileGuardTime = 0;
  }
}

export function advanceRuntimeContactTimers(memory: RuntimeContactMemory): void {
  if (memory.moveContactTime !== undefined) memory.moveContactTime += 1;
  if (memory.moveHitTime !== undefined) memory.moveHitTime += 1;
  if (memory.moveGuardTime !== undefined) memory.moveGuardTime += 1;
  if (memory.moveReversedTime !== undefined) memory.moveReversedTime += 1;
  if (memory.projectileContactTime !== undefined) memory.projectileContactTime += 1;
  if (memory.projectileHitTime !== undefined) memory.projectileHitTime += 1;
  if (memory.projectileGuardTime !== undefined) memory.projectileGuardTime += 1;
}

export function runtimeMoveContactValue(memory: RuntimeContactMemory, stateNo: number, kind: RuntimeContactKind): number {
  if (kind === "hit") {
    return memory.moveHitState === stateNo ? memory.moveHitTime ?? 0 : 0;
  }
  if (kind === "guard") {
    return memory.moveGuardState === stateNo ? memory.moveGuardTime ?? 0 : 0;
  }
  return memory.moveContactState === stateNo ? memory.moveContactTime ?? 0 : 0;
}

export function runtimeMoveHitCountValue(memory: RuntimeContactMemory, stateNo: number, unique: boolean): number {
  if (memory.moveHitState !== stateNo) {
    return 0;
  }
  return unique ? memory.moveUniqueHitCount ?? 0 : memory.moveHitCount ?? 0;
}

export function runtimeMoveReversedValue(memory: RuntimeContactMemory, stateNo: number): number {
  return memory.moveReversedState === stateNo ? memory.moveReversedTime ?? 0 : 0;
}

export function runtimeReceivedDamageValue(memory: RuntimeContactMemory, stateNo: number): number {
  return memory.receivedDamageState === stateNo ? memory.receivedDamageAmount ?? 0 : 0;
}

export function runtimeReceivedHitsValue(memory: RuntimeContactMemory, stateNo: number): number {
  return memory.receivedHitsState === stateNo ? memory.receivedHitsCount ?? 0 : 0;
}

export function hasRuntimeProjectileContact(
  memory: RuntimeContactMemory,
  stateNo: number,
  kind: RuntimeContactKind,
  projectileId?: number,
): boolean {
  if (projectileId !== undefined && memory.projectileId !== projectileId) {
    return false;
  }
  if (kind === "hit") {
    return memory.projectileHitState === stateNo;
  }
  if (kind === "guard") {
    return memory.projectileGuardState === stateNo;
  }
  return memory.projectileContactState === stateNo;
}

export function runtimeProjectileContactTime(
  memory: RuntimeContactMemory,
  stateNo: number,
  kind: RuntimeContactKind,
  projectileId?: number,
): number {
  if (projectileId !== undefined && memory.projectileId !== projectileId) {
    return -1;
  }
  if (kind === "hit") {
    return memory.projectileHitState === stateNo ? memory.projectileHitTime ?? 0 : -1;
  }
  if (kind === "guard") {
    return memory.projectileGuardState === stateNo ? memory.projectileGuardTime ?? 0 : -1;
  }
  return memory.projectileContactState === stateNo ? memory.projectileContactTime ?? 0 : -1;
}

function clampHitCount(value: number): number {
  return Math.max(0, Math.min(999, Math.round(value)));
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

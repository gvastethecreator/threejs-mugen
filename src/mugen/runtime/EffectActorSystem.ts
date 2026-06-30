import type {
  ExplodControllerOp,
  ModifyExplodControllerOp,
  ModifyProjectileControllerOp,
  ProjectileControllerOp,
  RemoveExplodControllerOp,
} from "../compiler/ControllerOps";
import type { ControllerIr } from "../compiler/RuntimeIr";
import type { MugenStageDefinition } from "../model/MugenStage";
import {
  advanceRuntimeExplods,
  createRuntimeExplod,
  modifyRuntimeExplods,
  removeRuntimeExplodsOnGetHit,
  removeRuntimeExplods,
  runtimeExplodsToSnapshots,
  type RuntimeExplod,
  type RuntimeExplodAdvanceOptions,
  type RuntimeExplodBindAnchor,
  type RuntimeExplodModifyInput,
  type RuntimeExplodSpawnInput,
} from "./ExplodSystem";
import {
  advanceRuntimeHelpers,
  createRuntimeHelper,
  removeRuntimeHelpers,
  runtimeHelpersToSnapshots,
  type RuntimeHelper,
  type RuntimeHelperAdvanceOptions,
  type RuntimeHelperRemovalFilter,
  type RuntimeHelperSpawnInput,
} from "./HelperSystem";
import {
  advanceRuntimeProjectiles,
  createRuntimeProjectile,
  modifyRuntimeProjectiles,
  runtimeProjectilesToSnapshots,
  shouldKeepRuntimeProjectileAfterRemoval,
  type RuntimeProjectile,
  type RuntimeProjectileModifyInput,
  type RuntimeProjectileSpawnInput,
} from "./ProjectileSystem";
import {
  RuntimeProjectileCombatWorld,
  type RuntimeProjectileCombatActor,
  type RuntimeProjectileCombatInput,
} from "./ProjectileCombatSystem";
import { findControllerParam } from "./StateProgramExecutor";
import type { ActorSnapshot } from "./types";

export type RuntimeEffectActorStore = {
  explods: RuntimeExplod[];
  helpers: RuntimeHelper[];
  projectiles: RuntimeProjectile[];
  nextExplodSerial: number;
  nextHelperSerial: number;
  nextProjectileSerial: number;
};

export type RuntimeEffectActorStores = {
  p1: RuntimeEffectActorStore;
  p2: RuntimeEffectActorStore;
};

export type RuntimeEffectActorOwnerKey = keyof RuntimeEffectActorStores;

export type RuntimeEffectActorStoreSummary = {
  ownerId: string;
  total: number;
  explods: string[];
  helpers: string[];
  projectiles: string[];
  nextSerials: {
    explod: number;
    helper: number;
    projectile: number;
  };
};

export type RuntimeEffectActorCountKind = "explod" | "helper" | "projectile";

export type RuntimeEffectPresentationAdvanceOptions = RuntimeExplodAdvanceOptions &
  RuntimeHelperAdvanceOptions & {
  stage?: Pick<MugenStageDefinition, "bounds">;
};

export class RuntimeEffectActorWorld {
  private readonly stores: RuntimeEffectActorStores;
  private readonly projectileCombatWorld: RuntimeProjectileCombatWorld;

  constructor(
    stores: RuntimeEffectActorStores = createRuntimeEffectActorStores(),
    projectileCombatWorld: RuntimeProjectileCombatWorld = new RuntimeProjectileCombatWorld(),
  ) {
    this.stores = stores;
    this.projectileCombatWorld = projectileCombatWorld;
  }

  getStores(): RuntimeEffectActorStores {
    return this.stores;
  }

  getStore(ownerId: string): RuntimeEffectActorStore {
    return this.stores[toEffectActorOwnerKey(ownerId)];
  }

  reset(): void {
    resetRuntimeEffectActorStore(this.stores.p1);
    resetRuntimeEffectActorStore(this.stores.p2);
  }

  summarize(ownerIds: Record<RuntimeEffectActorOwnerKey, string> = { p1: "p1", p2: "p2" }): RuntimeEffectActorStoreSummary[] {
    return [
      summarizeRuntimeEffectActorStore(this.stores.p1, ownerIds.p1),
      summarizeRuntimeEffectActorStore(this.stores.p2, ownerIds.p2),
    ];
  }

  spawnExplod(ownerId: string, input: Omit<RuntimeExplodSpawnInput, "serialId">): RuntimeExplod {
    return spawnRuntimeExplodActor(this.getStore(ownerId), ownerId, input);
  }

  removeExplods(ownerId: string, explodId: number | undefined): number {
    return removeRuntimeExplodActors(this.getStore(ownerId), explodId);
  }

  modifyExplods(ownerId: string, input: RuntimeExplodModifyInput): number {
    return modifyRuntimeExplodActors(this.getStore(ownerId), input);
  }

  removeExplodsOnGetHit(ownerId: string): void {
    removeRuntimeExplodActorsOnGetHit(this.getStore(ownerId));
  }

  advanceExplods(ownerId: string, bindAnchor?: RuntimeExplodBindAnchor, options?: RuntimeExplodAdvanceOptions): void {
    advanceRuntimeExplodActors(this.getStore(ownerId), bindAnchor, options);
  }

  advanceActiveEffects(ownerId: string, stage: Pick<MugenStageDefinition, "bounds">, options?: RuntimeHelperAdvanceOptions): void {
    this.advanceHelpers(ownerId, stage, options);
    this.advanceProjectiles(ownerId, stage);
  }

  advancePresentationEffects(ownerId: string, bindAnchor?: RuntimeExplodBindAnchor, options?: RuntimeEffectPresentationAdvanceOptions): void {
    if (options?.pauseKind && options.stage) {
      this.advanceHelpers(ownerId, options.stage, options);
    }
    this.advanceExplods(ownerId, bindAnchor, options);
  }

  explodSnapshots(ownerId: string, sourceStateNo: number): ActorSnapshot[] {
    return runtimeExplodActorsToSnapshots(this.getStore(ownerId), sourceStateNo);
  }

  countExplods(ownerId: string, explodId?: number): number {
    return this.getStore(ownerId).explods.filter((explod) => explodId === undefined || explod.explodId === explodId).length;
  }

  countActors(ownerId: string, kind: RuntimeEffectActorCountKind, actorId?: number): number {
    if (kind === "explod") {
      return this.countExplods(ownerId, actorId);
    }
    if (kind === "helper") {
      return this.countHelpers(ownerId, actorId);
    }
    return this.countProjectiles(ownerId, actorId);
  }

  spawnHelper(ownerId: string, input: Omit<RuntimeHelperSpawnInput, "serialId">): RuntimeHelper {
    return spawnRuntimeHelperActor(this.getStore(ownerId), ownerId, input);
  }

  removeHelpers(ownerId: string, helperId?: number): number {
    return removeRuntimeHelperActors(this.getStore(ownerId), { helperId });
  }

  destroyHelper(ownerId: string, serialId: string): boolean {
    return removeRuntimeHelperActors(this.getStore(ownerId), { serialId }) > 0;
  }

  advanceHelpers(ownerId: string, stage: Pick<MugenStageDefinition, "bounds">, options?: RuntimeHelperAdvanceOptions): void {
    advanceRuntimeHelperActors(this.getStore(ownerId), stage, options);
  }

  helperSnapshots(ownerId: string, sourceStateNo: number): ActorSnapshot[] {
    return runtimeHelperActorsToSnapshots(this.getStore(ownerId), sourceStateNo);
  }

  countHelpers(ownerId: string, helperId?: number): number {
    return this.getStore(ownerId).helpers.filter((helper) => helperId === undefined || helper.helperId === helperId).length;
  }

  spawnProjectile(ownerId: string, input: Omit<RuntimeProjectileSpawnInput, "serialId">): RuntimeProjectile {
    return spawnRuntimeProjectileActor(this.getStore(ownerId), ownerId, input);
  }

  modifyProjectiles(ownerId: string, input: RuntimeProjectileModifyInput): number {
    return modifyRuntimeProjectileActors(this.getStore(ownerId), input);
  }

  advanceProjectiles(ownerId: string, stage: Pick<MugenStageDefinition, "bounds">): void {
    advanceRuntimeProjectileActors(this.getStore(ownerId), stage);
  }

  projectiles(ownerId: string): RuntimeProjectile[] {
    return this.getStore(ownerId).projectiles;
  }

  countProjectiles(ownerId: string, projectileId?: number): number {
    return this.projectiles(ownerId).filter(
      (projectile) => !projectile.removalReason && (projectileId === undefined || projectile.projectileId === projectileId),
    ).length;
  }

  removeProjectilesMarkedForRemoval(ownerId: string): void {
    removeRuntimeProjectilesMarkedForRemoval(this.getStore(ownerId));
  }

  resolveProjectileCombat<TActor extends RuntimeProjectileCombatActor>(
    ownerId: string,
    input: Omit<RuntimeProjectileCombatInput<TActor>, "projectiles" | "removeProjectilesMarkedForRemoval">,
  ): void {
    this.projectileCombatWorld.resolveCombat({
      ...input,
      projectiles: this.projectiles(ownerId),
      removeProjectilesMarkedForRemoval: () => this.removeProjectilesMarkedForRemoval(ownerId),
    });
  }

  resolveProjectileClashes(
    leftOwnerId: string,
    rightOwnerId: string,
    input: { leftLabel: string; rightLabel: string; log: (line: string) => void },
  ): void {
    this.projectileCombatWorld.resolveClashes({
      ...input,
      leftProjectiles: this.projectiles(leftOwnerId),
      rightProjectiles: this.projectiles(rightOwnerId),
      removeProjectilesMarkedForRemoval: () => {
        this.removeProjectilesMarkedForRemoval(leftOwnerId);
        this.removeProjectilesMarkedForRemoval(rightOwnerId);
      },
    });
  }

  projectileSnapshots(ownerId: string, sourceStateNo: number): ActorSnapshot[] {
    return runtimeProjectileActorsToSnapshots(this.getStore(ownerId), sourceStateNo);
  }
}

export function createRuntimeEffectActorStore(): RuntimeEffectActorStore {
  return {
    explods: [],
    helpers: [],
    projectiles: [],
    nextExplodSerial: 0,
    nextHelperSerial: 0,
    nextProjectileSerial: 0,
  };
}

export function createRuntimeEffectActorStores(): RuntimeEffectActorStores {
  return {
    p1: createRuntimeEffectActorStore(),
    p2: createRuntimeEffectActorStore(),
  };
}

export function resetRuntimeEffectActorStore(store: RuntimeEffectActorStore): void {
  store.explods = [];
  store.helpers = [];
  store.projectiles = [];
  store.nextExplodSerial = 0;
  store.nextHelperSerial = 0;
  store.nextProjectileSerial = 0;
}

function toEffectActorOwnerKey(ownerId: string): RuntimeEffectActorOwnerKey {
  return ownerId === "p2" ? "p2" : "p1";
}

export function summarizeRuntimeEffectActorStore(
  store: RuntimeEffectActorStore,
  ownerId: string,
): RuntimeEffectActorStoreSummary {
  return {
    ownerId,
    total: store.explods.length + store.helpers.length + store.projectiles.length,
    explods: store.explods.map((actor) => actor.serialId),
    helpers: store.helpers.map((actor) => actor.serialId),
    projectiles: store.projectiles.map((actor) => actor.serialId),
    nextSerials: {
      explod: store.nextExplodSerial,
      helper: store.nextHelperSerial,
      projectile: store.nextProjectileSerial,
    },
  };
}

export function spawnRuntimeExplodActor(
  store: RuntimeEffectActorStore,
  ownerId: string,
  input: Omit<RuntimeExplodSpawnInput, "serialId">,
): RuntimeExplod {
  const explod = createRuntimeExplod({
    ...input,
    serialId: `${ownerId}-explod-${store.nextExplodSerial++}`,
  });
  store.explods.unshift(explod);
  store.explods.splice(24);
  return explod;
}

export function removeRuntimeExplodActors(store: RuntimeEffectActorStore, explodId: number | undefined): number {
  const before = store.explods.length;
  store.explods = removeRuntimeExplods(store.explods, explodId);
  return before - store.explods.length;
}

export function modifyRuntimeExplodActors(store: RuntimeEffectActorStore, input: RuntimeExplodModifyInput): number {
  return modifyRuntimeExplods(store.explods, input);
}

export function removeRuntimeExplodActorsOnGetHit(store: RuntimeEffectActorStore): void {
  store.explods = removeRuntimeExplodsOnGetHit(store.explods);
}

export function advanceRuntimeExplodActors(
  store: RuntimeEffectActorStore,
  bindAnchor?: RuntimeExplodBindAnchor,
  options?: RuntimeExplodAdvanceOptions,
): void {
  store.explods = advanceRuntimeExplods(store.explods, bindAnchor, options);
}

export function runtimeExplodActorsToSnapshots(store: RuntimeEffectActorStore, sourceStateNo: number): ActorSnapshot[] {
  return runtimeExplodsToSnapshots(store.explods, sourceStateNo);
}

export function spawnRuntimeHelperActor(
  store: RuntimeEffectActorStore,
  ownerId: string,
  input: Omit<RuntimeHelperSpawnInput, "serialId">,
): RuntimeHelper {
  const helper = createRuntimeHelper({
    ...input,
    serialId: `${ownerId}-helper-${store.nextHelperSerial++}`,
  });
  store.helpers.unshift(helper);
  store.helpers.splice(16);
  return helper;
}

export function advanceRuntimeHelperActors(
  store: RuntimeEffectActorStore,
  stage: Pick<MugenStageDefinition, "bounds">,
  options?: RuntimeHelperAdvanceOptions,
): void {
  store.helpers = advanceRuntimeHelpers(store.helpers, stage, {
    ...options,
    countExplods: (helper, explodId) => {
      if (options?.countExplods) {
        return options.countExplods(helper, explodId);
      }
      return countRuntimeHelperExplodActors(store, helper, explodId);
    },
    countHelpers: (helper, helperId) => {
      if (options?.countHelpers) {
        return options.countHelpers(helper, helperId);
      }
      return countRuntimeHelperActors(store, helper, helperId);
    },
    countProjectiles: (helper, projectileId) => {
      if (options?.countProjectiles) {
        return options.countProjectiles(helper, projectileId);
      }
      return countRuntimeHelperProjectileActors(store, helper, projectileId);
    },
    onSpawnExplod: (helper, controller) => {
      if (options?.onSpawnExplod) {
        return options.onSpawnExplod(helper, controller);
      }
      return spawnRuntimeHelperExplodActor(store, helper, controller, options) !== undefined;
    },
    onSpawnProjectile: (helper, controller) => {
      if (options?.onSpawnProjectile) {
        return options.onSpawnProjectile(helper, controller);
      }
      return spawnRuntimeHelperProjectileActor(store, helper, controller, options) !== undefined;
    },
    onRemoveExplod: (helper, controller) => {
      if (options?.onRemoveExplod) {
        return options.onRemoveExplod(helper, controller);
      }
      removeRuntimeHelperExplodActors(store, helper, controller);
      return true;
    },
    onModifyExplod: (helper, controller) => {
      if (options?.onModifyExplod) {
        return options.onModifyExplod(helper, controller);
      }
      modifyRuntimeHelperExplodActors(store, helper, controller);
      return true;
    },
    onModifyProjectile: (helper, controller) => {
      if (options?.onModifyProjectile) {
        return options.onModifyProjectile(helper, controller);
      }
      modifyRuntimeHelperProjectileActors(store, helper, controller);
      return true;
    },
  });
}

export function spawnRuntimeHelperProjectileActor(
  store: RuntimeEffectActorStore,
  helper: RuntimeHelper,
  controller: ControllerIr,
  options: Pick<RuntimeHelperAdvanceOptions, "opponentState"> = {},
): RuntimeProjectile | undefined {
  const operation = projectileOperation(controller);
  const animNo = operation?.projAnim ?? firstNumber(findControllerParam(controller, "projanim") ?? findControllerParam(controller, "anim")) ?? 0;
  const action = helper.animations?.get(animNo);
  if (!isPlayableAction(action)) {
    return undefined;
  }
  const localPos = operation?.offset ?? operation?.pos ?? numberPair(findControllerParam(controller, "offset") ?? findControllerParam(controller, "pos")) ?? [0, 0];
  const pos = resolveHelperExplodPosition(helper, options.opponentState, operation?.postype ?? findControllerParam(controller, "postype"), localPos);
  if (!pos) {
    return undefined;
  }
  return spawnRuntimeProjectileActor(store, helper.ownerId, {
    controller: controller.source,
    operation,
    ownerId: helper.ownerId,
    rootId: helper.rootId,
    parentId: helper.serialId,
    spriteOwnerId: helper.spriteOwnerId,
    spriteOwnerDefinitionId: helper.spriteOwnerDefinitionId,
    spriteOwnerLabel: helper.spriteOwnerLabel,
    action,
    animNo,
    terminalActions: resolveHelperProjectileTerminalActions(helper, controller, operation),
    pos,
    fallbackFacing: helper.facing,
  });
}

export function spawnRuntimeHelperExplodActor(
  store: RuntimeEffectActorStore,
  helper: RuntimeHelper,
  controller: ControllerIr,
  options: Pick<RuntimeHelperAdvanceOptions, "opponentState"> = {},
): RuntimeExplod | undefined {
  const operation = explodOperation(controller);
  const animNo = operation?.animNo ?? firstNumber(findControllerParam(controller, "anim"));
  if (animNo === undefined) {
    return undefined;
  }
  const action = helper.animations?.get(animNo);
  if (!isPlayableAction(action)) {
    return undefined;
  }
  const localPos = operation?.pos ?? numberPair(findControllerParam(controller, "pos")) ?? [0, 0];
  const pos = resolveHelperExplodPosition(helper, options.opponentState, operation?.postype ?? findControllerParam(controller, "postype"), localPos);
  if (!pos) {
    return undefined;
  }
  return spawnRuntimeExplodActor(store, helper.ownerId, {
    controller: controller.source,
    operation,
    ownerId: helper.ownerId,
    rootId: helper.rootId,
    parentId: helper.serialId,
    spriteOwnerId: helper.spriteOwnerId,
    spriteOwnerDefinitionId: helper.spriteOwnerDefinitionId,
    spriteOwnerLabel: helper.spriteOwnerLabel,
    action,
    animNo,
    pos,
    fallbackFacing: helper.facing,
    defaultRemoveTime: actionDuration(action),
  });
}

export function removeRuntimeHelperExplodActors(store: RuntimeEffectActorStore, _helper: RuntimeHelper, controller: ControllerIr): number {
  const operation = removeExplodOperation(controller);
  const explodId = operation?.explodId ?? firstNumber(findControllerParam(controller, "id"));
  return removeRuntimeExplodActors(store, explodId);
}

export function modifyRuntimeHelperExplodActors(store: RuntimeEffectActorStore, helper: RuntimeHelper, controller: ControllerIr): number {
  const operation = modifyExplodOperation(controller);
  const explodId = operation?.explodId ?? firstNumber(findControllerParam(controller, "id"));
  const helperExplods = store.explods.filter(
    (explod) => explod.parentId === helper.serialId && (explodId === undefined || explod.explodId === explodId),
  );
  return modifyRuntimeExplods(helperExplods, {
    controller: controller.source,
    operation,
  });
}

export function modifyRuntimeHelperProjectileActors(store: RuntimeEffectActorStore, helper: RuntimeHelper, controller: ControllerIr): number {
  const operation = modifyProjectileOperation(controller);
  const projectileId = operation?.projectileId ?? firstNumber(findControllerParam(controller, "projid") ?? findControllerParam(controller, "id"));
  const helperProjectiles = store.projectiles.filter(
    (projectile) => projectile.parentId === helper.serialId && (projectileId === undefined || projectile.projectileId === projectileId),
  );
  return modifyRuntimeProjectiles(helperProjectiles, {
    controller: controller.source,
    operation,
  });
}

export function countRuntimeHelperExplodActors(
  store: RuntimeEffectActorStore,
  helper: RuntimeHelper,
  explodId?: number,
): number {
  return store.explods.filter((explod) => {
    return explod.parentId === helper.serialId && (explodId === undefined || explod.explodId === explodId);
  }).length;
}

export function countRuntimeHelperActors(
  store: RuntimeEffectActorStore,
  _helper: RuntimeHelper,
  helperId?: number,
): number {
  return store.helpers.filter((candidate) => helperId === undefined || candidate.helperId === helperId).length;
}

export function countRuntimeHelperProjectileActors(
  store: RuntimeEffectActorStore,
  helper: RuntimeHelper,
  projectileId?: number,
): number {
  return store.projectiles.filter((projectile) => {
    return (
      !projectile.removalReason &&
      projectile.parentId === helper.serialId &&
      (projectileId === undefined || projectile.projectileId === projectileId)
    );
  }).length;
}

export function removeRuntimeHelperActors(store: RuntimeEffectActorStore, filter: RuntimeHelperRemovalFilter = {}): number {
  const before = store.helpers.length;
  store.helpers = removeRuntimeHelpers(store.helpers, filter);
  return before - store.helpers.length;
}

export function runtimeHelperActorsToSnapshots(store: RuntimeEffectActorStore, sourceStateNo: number): ActorSnapshot[] {
  return runtimeHelpersToSnapshots(store.helpers, sourceStateNo);
}

export function spawnRuntimeProjectileActor(
  store: RuntimeEffectActorStore,
  ownerId: string,
  input: Omit<RuntimeProjectileSpawnInput, "serialId">,
): RuntimeProjectile {
  const projectile = createRuntimeProjectile({
    ...input,
    serialId: `${ownerId}-projectile-${store.nextProjectileSerial++}`,
  });
  store.projectiles.unshift(projectile);
  store.projectiles.splice(16);
  return projectile;
}

export function modifyRuntimeProjectileActors(store: RuntimeEffectActorStore, input: RuntimeProjectileModifyInput): number {
  return modifyRuntimeProjectiles(store.projectiles, input);
}

export function advanceRuntimeProjectileActors(
  store: RuntimeEffectActorStore,
  stage: Pick<MugenStageDefinition, "bounds">,
): void {
  store.projectiles = advanceRuntimeProjectiles(store.projectiles, stage);
}

export function removeRuntimeProjectilesMarkedForRemoval(store: RuntimeEffectActorStore): void {
  store.projectiles = store.projectiles.filter(shouldKeepRuntimeProjectileAfterRemoval);
}

export function runtimeProjectileActorsToSnapshots(store: RuntimeEffectActorStore, sourceStateNo: number): ActorSnapshot[] {
  return runtimeProjectilesToSnapshots(store.projectiles, sourceStateNo);
}

function explodOperation(controller: ControllerIr): ExplodControllerOp | undefined {
  return controller.operation?.kind === "explod" ? controller.operation : undefined;
}

function removeExplodOperation(controller: ControllerIr): RemoveExplodControllerOp | undefined {
  return controller.operation?.kind === "removeexplod" ? controller.operation : undefined;
}

function modifyExplodOperation(controller: ControllerIr): ModifyExplodControllerOp | undefined {
  return controller.operation?.kind === "modifyexplod" ? controller.operation : undefined;
}

function projectileOperation(controller: ControllerIr): ProjectileControllerOp | undefined {
  return controller.operation?.kind === "projectile" ? controller.operation : undefined;
}

function modifyProjectileOperation(controller: ControllerIr): ModifyProjectileControllerOp | undefined {
  return controller.operation?.kind === "modifyprojectile" ? controller.operation : undefined;
}

function resolveHelperProjectileTerminalActions(
  helper: RuntimeHelper,
  controller: ControllerIr,
  operation?: ProjectileControllerOp,
): RuntimeProjectileSpawnInput["terminalActions"] {
  const hitAnim = operation?.hitAnim ?? firstNumber(findControllerParam(controller, "projhitanim"));
  const removeAnim = operation?.removeAnim ?? firstNumber(findControllerParam(controller, "projremanim"));
  const cancelAnim = operation?.cancelAnim ?? firstNumber(findControllerParam(controller, "projcancelanim"));
  return {
    hit: hitAnim === undefined ? undefined : helper.animations?.get(hitAnim),
    remove: removeAnim === undefined ? undefined : helper.animations?.get(removeAnim),
    cancel: cancelAnim === undefined ? undefined : helper.animations?.get(cancelAnim),
  };
}

function resolveHelperExplodPosition(
  helper: RuntimeHelper,
  opponentState: RuntimeHelperAdvanceOptions["opponentState"],
  postype: string | undefined,
  localPos: [number, number],
): { x: number; y: number } | undefined {
  const type = postype?.trim().toLowerCase() ?? "p1";
  if (type === "p2") {
    if (!opponentState) {
      return undefined;
    }
    return { x: opponentState.pos.x + localPos[0] * opponentState.facing, y: opponentState.pos.y + localPos[1] };
  }
  if (type === "front") {
    return { x: helper.pos.x + localPos[0] * helper.facing + 48 * helper.facing, y: helper.pos.y + localPos[1] };
  }
  if (type === "back") {
    return { x: helper.pos.x + localPos[0] * helper.facing - 48 * helper.facing, y: helper.pos.y + localPos[1] };
  }
  if (type === "left") {
    return { x: localPos[0], y: localPos[1] };
  }
  return { x: helper.pos.x + localPos[0] * helper.facing, y: helper.pos.y + localPos[1] };
}

function isPlayableAction(action: RuntimeHelper["action"] | undefined): action is RuntimeHelper["action"] {
  return Boolean(action && action.frames.length > 0);
}

function firstNumber(value: string | undefined): number | undefined {
  const raw = value?.split(",")[0]?.trim();
  if (!raw) {
    return undefined;
  }
  const numberValue = Number(raw);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function numberPair(value: string | undefined): [number, number] | undefined {
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
  return [numbers[0], numbers[1] ?? 0];
}

function actionDuration(action: RuntimeHelper["action"]): number {
  return action.frames.reduce((total, frame) => total + Math.max(1, frame.duration), 0);
}

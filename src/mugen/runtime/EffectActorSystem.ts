import type { MugenStageDefinition } from "../model/MugenStage";
import {
  advanceRuntimeExplods,
  createRuntimeExplod,
  removeRuntimeExplodsOnGetHit,
  removeRuntimeExplods,
  runtimeExplodsToSnapshots,
  type RuntimeExplod,
  type RuntimeExplodAdvanceOptions,
  type RuntimeExplodBindAnchor,
  type RuntimeExplodSpawnInput,
} from "./ExplodSystem";
import {
  advanceRuntimeHelpers,
  createRuntimeHelper,
  runtimeHelpersToSnapshots,
  type RuntimeHelper,
  type RuntimeHelperAdvanceOptions,
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

export type RuntimeEffectPresentationAdvanceOptions = RuntimeExplodAdvanceOptions & {
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

  removeExplods(ownerId: string, explodId: number | undefined): void {
    removeRuntimeExplodActors(this.getStore(ownerId), explodId);
  }

  removeExplodsOnGetHit(ownerId: string): void {
    removeRuntimeExplodActorsOnGetHit(this.getStore(ownerId));
  }

  advanceExplods(ownerId: string, bindAnchor?: RuntimeExplodBindAnchor, options?: RuntimeExplodAdvanceOptions): void {
    advanceRuntimeExplodActors(this.getStore(ownerId), bindAnchor, options);
  }

  advanceActiveEffects(ownerId: string, stage: Pick<MugenStageDefinition, "bounds">): void {
    this.advanceHelpers(ownerId, stage);
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

  spawnHelper(ownerId: string, input: Omit<RuntimeHelperSpawnInput, "serialId">): RuntimeHelper {
    return spawnRuntimeHelperActor(this.getStore(ownerId), ownerId, input);
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

export function removeRuntimeExplodActors(store: RuntimeEffectActorStore, explodId: number | undefined): void {
  store.explods = removeRuntimeExplods(store.explods, explodId);
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
  store.helpers = advanceRuntimeHelpers(store.helpers, stage, options);
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

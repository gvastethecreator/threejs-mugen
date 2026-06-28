import type { MugenStageDefinition } from "../model/MugenStage";
import { demoFighters, type DemoFighterDefinition } from "./demoFighters";
import { trainingStage } from "./demoStage";
import {
  PlayableMatchRuntime,
  type MatchInput,
  type MatchRuntimeCommand,
  type MatchStepOptions,
} from "./PlayableMatchRuntime";
import {
  RuntimeEffectActorWorld,
  type RuntimeEffectActorStoreSummary,
} from "./EffectActorSystem";
import {
  createMatchWorldLifecycleRecord,
  createStatelessLifecycle,
  MatchWorldLifecycleTracker,
  type MatchWorldActorLifecycleRecord,
  type MatchWorldActorLifecycleSummary,
} from "./MatchWorldLifecycleSystem";
import { RuntimeTargetWorld, type RuntimeTargetLinkSnapshot } from "./TargetSystem";
import type {
  ActorSnapshot,
  MugenSnapshot,
  RuntimeActorKind,
  RuntimeTargetBindingSnapshot,
  RuntimeTargetSnapshot,
} from "./types";

export type MatchWorldOptions = {
  p1?: DemoFighterDefinition;
  p2?: DemoFighterDefinition;
  stage?: MugenStageDefinition;
  roundTimerFrames?: number;
};

export type MatchWorldActorRecord = {
  id: string;
  label: string;
  kind: RuntimeActorKind;
  source: ActorSnapshot["source"];
  ownerId: string;
  rootId: string;
  parentId: string;
  spriteOwnerId?: string;
  spriteOwnerDefinitionId?: string;
  layer: "actor" | "effect";
  stateNo: number;
  animNo: number;
  life: number;
  power: number;
  targetCount: number;
  targets: RuntimeTargetSnapshot[];
  targetBindings: RuntimeTargetBindingSnapshot[];
  bindToTarget?: RuntimeTargetBindingSnapshot;
  lifecycle: MatchWorldActorLifecycleRecord;
};

export type MatchWorldTargetLink = RuntimeTargetLinkSnapshot;

export type MatchWorldActorRegistrySnapshot = {
  actors: MatchWorldActorRecord[];
  byId: Record<string, MatchWorldActorRecord>;
  byKind: Record<RuntimeActorKind, string[]>;
  byOwner: Record<string, string[]>;
  players: string[];
  effects: string[];
  targetLinks: MatchWorldTargetLink[];
  effectStores: RuntimeEffectActorStoreSummary[];
  lifecycle: MatchWorldActorLifecycleSummary;
};

export class MatchWorld {
  private runtime: PlayableMatchRuntime;
  private readonly effectActorWorld: RuntimeEffectActorWorld;
  private readonly targetWorld: RuntimeTargetWorld;
  private lifecycleTracker = new MatchWorldLifecycleTracker();
  private actorRegistry: MatchWorldActorRegistrySnapshot;
  private registryKey = "";

  constructor(options: MatchWorldOptions = {}) {
    this.effectActorWorld = new RuntimeEffectActorWorld();
    this.targetWorld = new RuntimeTargetWorld();
    this.runtime = new PlayableMatchRuntime(
      options.p1 ?? demoFighters[0]!,
      options.p2 ?? demoFighters[1]!,
      options.stage ?? trainingStage,
      { effectActorWorld: this.effectActorWorld, targetWorld: this.targetWorld, roundTimerFrames: options.roundTimerFrames },
    );
    this.actorRegistry = this.refreshActorRegistry(this.runtime.getSnapshot(), true);
  }

  dispatch(command: MatchRuntimeCommand): MugenSnapshot {
    const snapshot = this.runtime.dispatch(command);
    this.refreshActorRegistry(snapshot, command.type === "reset");
    return snapshot;
  }

  step(input: MatchInput, options: MatchStepOptions = {}): MugenSnapshot {
    const snapshot = this.runtime.step(input, options);
    this.refreshActorRegistry(snapshot);
    return snapshot;
  }

  getSnapshot(): MugenSnapshot {
    const snapshot = this.runtime.getSnapshot();
    this.refreshActorRegistry(snapshot);
    return snapshot;
  }

  getActorRegistry(): MatchWorldActorRegistrySnapshot {
    this.refreshActorRegistry(this.runtime.getSnapshot());
    return this.actorRegistry;
  }

  getEffectActorStores(): RuntimeEffectActorStoreSummary[] {
    return this.effectActorStoreSummaries();
  }

  reset(): MugenSnapshot {
    return this.dispatch({ type: "reset" });
  }

  private refreshActorRegistry(snapshot: MugenSnapshot, resetLifecycle = false): MatchWorldActorRegistrySnapshot {
    const effectStores = this.effectActorStoreSummaries();
    const key = actorRegistryKey(snapshot, effectStores);
    if (!resetLifecycle && key === this.registryKey) {
      return this.actorRegistry;
    }
    if (resetLifecycle) {
      this.lifecycleTracker.reset();
    }
    const records = buildActorRecordBases(snapshot);
    const lifecycle = this.lifecycleTracker.update(snapshot.tick, records);
    this.actorRegistry = buildMatchWorldActorRegistryFromRecords(records, lifecycle, effectStores, this.targetWorld);
    this.registryKey = key;
    return this.actorRegistry;
  }

  private effectActorStoreSummaries(): RuntimeEffectActorStoreSummary[] {
    return this.effectActorWorld.summarize({ p1: "p1", p2: "p2" });
  }
}

export function buildMatchWorldActorRegistry(snapshot: MugenSnapshot): MatchWorldActorRegistrySnapshot {
  const records = buildActorRecordBases(snapshot);
  return buildMatchWorldActorRegistryFromRecords(
    records,
    createStatelessLifecycle(snapshot.tick, records),
    inferEffectStoresFromSnapshot(snapshot),
    new RuntimeTargetWorld(),
  );
}

function buildMatchWorldActorRegistryFromRecords(
  records: MatchWorldActorRecordBase[],
  lifecycle: MatchWorldActorLifecycleSummary,
  effectStores: RuntimeEffectActorStoreSummary[],
  targetWorld: RuntimeTargetWorld,
): MatchWorldActorRegistrySnapshot {
  const actors = records.map((actor) => ({
    ...actor,
    lifecycle: lifecycle.records.find((record) => record.id === actor.id) ?? createMatchWorldLifecycleRecord(actor, "active", 0, 0),
  }));
  const byId: Record<string, MatchWorldActorRecord> = {};
  const byKind = emptyKindIndex();
  const byOwner: Record<string, string[]> = {};
  const players: string[] = [];
  const effects: string[] = [];
  const targetLinks: MatchWorldTargetLink[] = [];

  for (const actor of actors) {
    byId[actor.id] = actor;
    byKind[actor.kind].push(actor.id);
    byOwner[actor.ownerId] = [...(byOwner[actor.ownerId] ?? []), actor.id];
    if (actor.layer === "actor") {
      players.push(actor.id);
    } else {
      effects.push(actor.id);
    }
    targetLinks.push(
      ...targetWorld.snapshotLinks({
        ownerId: actor.id,
        targets: actor.targets,
        bindings: actor.targetBindings,
        bindToTarget: actor.bindToTarget,
      }),
    );
  }

  return {
    actors,
    byId,
    byKind,
    byOwner,
    players,
    effects,
    targetLinks,
    effectStores: cloneEffectStoreSummaries(effectStores),
    lifecycle,
  };
}

type MatchWorldActorRecordBase = Omit<MatchWorldActorRecord, "lifecycle">;

function buildActorRecordBases(snapshot: MugenSnapshot): MatchWorldActorRecordBase[] {
  return [
    ...snapshot.actors.map((actor) => toActorRecordBase(actor, "actor")),
    ...(snapshot.effects ?? []).map((actor) => toActorRecordBase(actor, "effect")),
  ];
}

function toActorRecordBase(actor: ActorSnapshot, layer: MatchWorldActorRecord["layer"]): MatchWorldActorRecordBase {
  return {
    id: actor.id,
    label: actor.label,
    kind: actor.actorKind,
    source: actor.source,
    ownerId: actor.ownerId,
    rootId: actor.rootId,
    parentId: actor.parentId,
    spriteOwnerId: actor.spriteOwnerId,
    spriteOwnerDefinitionId: actor.spriteOwnerDefinitionId,
    layer,
    stateNo: actor.runtime.stateNo,
    animNo: actor.runtime.animNo,
    life: actor.runtime.life,
    power: actor.runtime.power,
    targetCount: actor.runtime.targetCount ?? 0,
    targets: actor.runtime.targetRefs?.map((target) => ({ ...target })) ?? [],
    targetBindings: actor.runtime.targetBindings?.map(cloneTargetBinding) ?? [],
    bindToTarget: actor.runtime.bindToTarget ? cloneTargetBinding(actor.runtime.bindToTarget) : undefined,
  };
}

function actorRegistryKey(snapshot: MugenSnapshot, effectStores: RuntimeEffectActorStoreSummary[] = []): string {
  const ids = [
    ...snapshot.actors.map((actor) => actor.id),
    ...(snapshot.effects ?? []).map((effect) => effect.id),
  ];
  const targetKey = snapshot.actors
    .map((actor) => {
      const targets = (actor.runtime.targetRefs ?? [])
        .map((target) => `${target.actorId}:${target.targetId ?? "*"}:${target.age}`)
        .join(",");
      const bindings = (actor.runtime.targetBindings ?? [])
        .map(
          (binding) =>
            `${binding.actorId}:${binding.targetId ?? "*"}:${binding.remaining}:${binding.offset.x},${binding.offset.y}`,
        )
        .join(",");
      const bindToTarget = actor.runtime.bindToTarget
        ? `${actor.runtime.bindToTarget.actorId}:${actor.runtime.bindToTarget.targetId ?? "*"}:${actor.runtime.bindToTarget.remaining}:${actor.runtime.bindToTarget.offset.x},${actor.runtime.bindToTarget.offset.y}`
        : "";
      return `${actor.id}:${targets}:${bindings}:${bindToTarget}`;
    })
    .join("|");
  const storeKey = effectStores
    .map(
      (store) =>
        `${store.ownerId}:${store.total}:${store.nextSerials.explod},${store.nextSerials.helper},${store.nextSerials.projectile}:${store.explods.join(",")}:${store.helpers.join(",")}:${store.projectiles.join(",")}`,
    )
    .join("|");
  return `${snapshot.tick}:${ids.join("|")}:${targetKey}:${storeKey}`;
}

function inferEffectStoresFromSnapshot(snapshot: MugenSnapshot): RuntimeEffectActorStoreSummary[] {
  const stores = new Map<string, RuntimeEffectActorStoreSummary>();
  for (const actor of snapshot.actors) {
    stores.set(actor.id, emptyEffectStoreSummary(actor.id));
  }
  for (const effect of snapshot.effects ?? []) {
    const store = stores.get(effect.ownerId) ?? emptyEffectStoreSummary(effect.ownerId);
    if (effect.actorKind === "explod") {
      store.explods.push(effect.id);
    } else if (effect.actorKind === "helper") {
      store.helpers.push(effect.id);
    } else if (effect.actorKind === "projectile") {
      store.projectiles.push(effect.id);
    }
    store.total = store.explods.length + store.helpers.length + store.projectiles.length;
    stores.set(effect.ownerId, store);
  }
  return [...stores.values()];
}

function emptyEffectStoreSummary(ownerId: string): RuntimeEffectActorStoreSummary {
  return {
    ownerId,
    total: 0,
    explods: [],
    helpers: [],
    projectiles: [],
    nextSerials: {
      explod: 0,
      helper: 0,
      projectile: 0,
    },
  };
}

function cloneEffectStoreSummaries(effectStores: RuntimeEffectActorStoreSummary[]): RuntimeEffectActorStoreSummary[] {
  return effectStores.map((store) => ({
    ownerId: store.ownerId,
    total: store.total,
    explods: [...store.explods],
    helpers: [...store.helpers],
    projectiles: [...store.projectiles],
    nextSerials: { ...store.nextSerials },
  }));
}

function cloneTargetBinding(binding: RuntimeTargetBindingSnapshot): RuntimeTargetBindingSnapshot {
  return {
    actorId: binding.actorId,
    targetId: binding.targetId,
    remaining: binding.remaining,
    offset: { ...binding.offset },
  };
}

function emptyKindIndex(): Record<RuntimeActorKind, string[]> {
  return {
    player: [],
    helper: [],
    projectile: [],
    explod: [],
  };
}

export type {
  MatchWorldActorLifecycleEvent,
  MatchWorldActorLifecycleEventType,
  MatchWorldActorLifecycleRecord,
  MatchWorldActorLifecycleStatus,
  MatchWorldActorLifecycleSummary,
} from "./MatchWorldLifecycleSystem";
export type { MatchInput, MatchRuntimeCommand, MatchStepOptions };

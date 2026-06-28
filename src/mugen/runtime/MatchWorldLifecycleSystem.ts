import type { RuntimeActorKind } from "./types";

export type MatchWorldLifecycleActorInput = {
  id: string;
  label: string;
  kind: RuntimeActorKind;
  layer: "actor" | "effect";
  ownerId: string;
  rootId: string;
  parentId: string;
};

export type MatchWorldActorLifecycleStatus = "spawned" | "active" | "removed";

export type MatchWorldActorLifecycleRecord = MatchWorldLifecycleActorInput & {
  status: MatchWorldActorLifecycleStatus;
  firstSeenTick: number;
  lastSeenTick: number;
  ageTicks: number;
};

export type MatchWorldActorLifecycleEventType = "spawn" | "active" | "remove";

export type MatchWorldActorLifecycleEvent = MatchWorldLifecycleActorInput & {
  type: MatchWorldActorLifecycleEventType;
  tick: number;
  ageTicks: number;
};

export type MatchWorldActorLifecycleSummary = {
  records: MatchWorldActorLifecycleRecord[];
  live: string[];
  spawnedThisTick: string[];
  removedThisTick: string[];
  removed: string[];
  eventsThisTick: MatchWorldActorLifecycleEvent[];
  recentEvents: MatchWorldActorLifecycleEvent[];
};

export class MatchWorldLifecycleTracker {
  private records = new Map<string, MatchWorldActorLifecycleRecord>();
  private recentEvents: MatchWorldActorLifecycleEvent[] = [];

  reset(): void {
    this.records.clear();
    this.recentEvents = [];
  }

  update(tick: number, actors: MatchWorldLifecycleActorInput[]): MatchWorldActorLifecycleSummary {
    const liveIds = new Set(actors.map((actor) => actor.id));
    const spawnedThisTick: string[] = [];
    const removedThisTick: string[] = [];
    const live: string[] = [];
    const eventsThisTick: MatchWorldActorLifecycleEvent[] = [];

    for (const actor of actors) {
      const previous = this.records.get(actor.id);
      const status: MatchWorldActorLifecycleStatus = previous && previous.status !== "removed" ? "active" : "spawned";
      if (status === "spawned") {
        spawnedThisTick.push(actor.id);
      }
      const firstSeenTick = status === "active" && previous ? previous.firstSeenTick : tick;
      const record = createMatchWorldLifecycleRecord(actor, status, firstSeenTick, tick);
      this.records.set(actor.id, record);
      eventsThisTick.push(lifecycleEventFromRecord(record, status === "spawned" ? "spawn" : "active"));
      live.push(actor.id);
    }

    for (const [id, record] of this.records) {
      if (liveIds.has(id) || record.status === "removed") {
        continue;
      }
      this.records.set(id, {
        ...record,
        status: "removed",
        lastSeenTick: tick,
        ageTicks: Math.max(0, tick - record.firstSeenTick),
      });
      removedThisTick.push(id);
      eventsThisTick.push(lifecycleEventFromRecord(this.records.get(id)!, "remove"));
    }

    this.recentEvents = [...eventsThisTick, ...this.recentEvents].slice(0, 80);
    const records = [...this.records.values()].sort((left, right) => compareLifecycleRecords(left, right, live));
    return {
      records,
      live,
      spawnedThisTick,
      removedThisTick,
      removed: records.filter((record) => record.status === "removed").map((record) => record.id),
      eventsThisTick,
      recentEvents: [...this.recentEvents],
    };
  }
}

export function createStatelessLifecycle(
  tick: number,
  actors: MatchWorldLifecycleActorInput[],
): MatchWorldActorLifecycleSummary {
  const records = actors.map((actor) => createMatchWorldLifecycleRecord(actor, "active", tick, tick));
  return {
    records,
    live: actors.map((actor) => actor.id),
    spawnedThisTick: [],
    removedThisTick: [],
    removed: [],
    eventsThisTick: records.map((record) => lifecycleEventFromRecord(record, "active")),
    recentEvents: records.map((record) => lifecycleEventFromRecord(record, "active")),
  };
}

export function createMatchWorldLifecycleRecord(
  actor: MatchWorldLifecycleActorInput,
  status: MatchWorldActorLifecycleStatus,
  firstSeenTick: number,
  lastSeenTick: number,
): MatchWorldActorLifecycleRecord {
  return {
    id: actor.id,
    label: actor.label,
    kind: actor.kind,
    layer: actor.layer,
    ownerId: actor.ownerId,
    rootId: actor.rootId,
    parentId: actor.parentId,
    status,
    firstSeenTick,
    lastSeenTick,
    ageTicks: Math.max(0, lastSeenTick - firstSeenTick),
  };
}

function lifecycleEventFromRecord(
  record: MatchWorldActorLifecycleRecord,
  type: MatchWorldActorLifecycleEventType,
): MatchWorldActorLifecycleEvent {
  return {
    type,
    id: record.id,
    label: record.label,
    kind: record.kind,
    layer: record.layer,
    ownerId: record.ownerId,
    rootId: record.rootId,
    parentId: record.parentId,
    tick: record.lastSeenTick,
    ageTicks: record.ageTicks,
  };
}

function compareLifecycleRecords(
  left: MatchWorldActorLifecycleRecord,
  right: MatchWorldActorLifecycleRecord,
  live: string[],
): number {
  const leftLiveIndex = live.indexOf(left.id);
  const rightLiveIndex = live.indexOf(right.id);
  if (leftLiveIndex !== -1 || rightLiveIndex !== -1) {
    if (leftLiveIndex === -1) {
      return 1;
    }
    if (rightLiveIndex === -1) {
      return -1;
    }
    return leftLiveIndex - rightLiveIndex;
  }
  if (left.lastSeenTick !== right.lastSeenTick) {
    return right.lastSeenTick - left.lastSeenTick;
  }
  return left.id.localeCompare(right.id);
}

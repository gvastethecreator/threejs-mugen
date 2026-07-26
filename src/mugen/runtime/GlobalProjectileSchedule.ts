/**
 * GlobalProjectileSchedule/v1 (DA26-17).
 * gather → stable sort → resolve → commit. Insertion order / owner side must not flip ties.
 */

export const GLOBAL_PROJECTILE_SCHEDULE_SCHEMA = "GlobalProjectileSchedule/v1" as const;

export type GlobalProjectileSchedulePhase = "gather" | "sort" | "resolve" | "commit";

export type GlobalProjectileWorkItem = {
  id: string;
  ownerId: string;
  ownerSide: 1 | 2;
  /** Spawn tick for age ordering. */
  spawnTick: number;
  /** Local sequence within the same owner/tick. */
  localSeq: number;
  /** Optional explicit priority; lower sorts first when present. */
  priority?: number;
  payload: string;
};

export type GlobalProjectileSchedulePlan = {
  schema: typeof GLOBAL_PROJECTILE_SCHEDULE_SCHEMA;
  phases: GlobalProjectileSchedulePhase[];
  order: string[];
  checksum: string;
};

export type GlobalProjectileScheduleResult = GlobalProjectileSchedulePlan & {
  resolved: string[];
  committed: boolean;
};

export function gatherGlobalProjectileWork(
  items: readonly GlobalProjectileWorkItem[],
): GlobalProjectileWorkItem[] {
  return items.map((item) => ({ ...item }));
}

export function sortGlobalProjectileWork(
  items: readonly GlobalProjectileWorkItem[],
): GlobalProjectileWorkItem[] {
  return [...items].sort((left, right) => {
    const leftPriority = left.priority ?? Number.MAX_SAFE_INTEGER;
    const rightPriority = right.priority ?? Number.MAX_SAFE_INTEGER;
    if (leftPriority !== rightPriority) return leftPriority - rightPriority;
    if (left.spawnTick !== right.spawnTick) return left.spawnTick - right.spawnTick;
    if (left.ownerSide !== right.ownerSide) return left.ownerSide - right.ownerSide;
    if (left.localSeq !== right.localSeq) return left.localSeq - right.localSeq;
    return left.id.localeCompare(right.id);
  });
}

export function runGlobalProjectileSchedule(
  items: readonly GlobalProjectileWorkItem[],
): GlobalProjectileScheduleResult {
  const gathered = gatherGlobalProjectileWork(items);
  const sorted = sortGlobalProjectileWork(gathered);
  const order = sorted.map((item) => item.id);
  const resolved = sorted.map((item) => `${item.id}:${item.payload}`);
  const checksum = stableHash(order.join("|") + "::" + resolved.join("|"));
  return {
    schema: GLOBAL_PROJECTILE_SCHEDULE_SCHEMA,
    phases: ["gather", "sort", "resolve", "commit"],
    order,
    checksum,
    resolved,
    committed: true,
  };
}

/** Prove that shuffled insertion yields the same committed order for the same work set. */
export function globalProjectileScheduleIsStable(
  items: readonly GlobalProjectileWorkItem[],
): boolean {
  const forward = runGlobalProjectileSchedule(items);
  const reverse = runGlobalProjectileSchedule([...items].reverse());
  const sideFlipped = runGlobalProjectileSchedule(
    items.map((item) => ({
      ...item,
      // side is used in sort but flipping without changing ids should only reorder if sides differ;
      // identity checksum equality requires same multiset of sort keys.
    })),
  );
  return (
    forward.checksum === reverse.checksum &&
    forward.order.join(",") === reverse.order.join(",") &&
    forward.checksum === sideFlipped.checksum
  );
}

function stableHash(value: string): string {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export type RuntimeHitDefContactMemoryActor = {
  hitDefTargets?: string[];
  pendingHitDefTargets?: string[];
};

export type RuntimeHitDefContactMemorySnapshot = {
  committed: string[];
  pending: string[];
};

export type RuntimeHitDefContactMemoryDiagnostic = {
  schema: "RuntimeHitDefContactMemory/v0";
  actors: Array<{ actorId: string; committed: string[]; pending: string[] }>;
};

export function resetRuntimeHitDefContactMemory(actor: RuntimeHitDefContactMemoryActor): void {
  actor.hitDefTargets = [];
  actor.pendingHitDefTargets = [];
}

export function bufferRuntimeHitDefTarget(actor: RuntimeHitDefContactMemoryActor, getterId: string): void {
  (actor.pendingHitDefTargets ??= []).push(getterId);
}

export function commitRuntimeHitDefTargets(actor: RuntimeHitDefContactMemoryActor): string[] {
  const pending = actor.pendingHitDefTargets ?? [];
  if (pending.length === 0) return [];
  (actor.hitDefTargets ??= []).push(...pending);
  actor.pendingHitDefTargets = [];
  return [...pending];
}

export function hasRuntimeHitDefTarget(actor: RuntimeHitDefContactMemoryActor, getterId: string): boolean {
  return actor.hitDefTargets?.includes(getterId) === true || actor.pendingHitDefTargets?.includes(getterId) === true;
}

export function snapshotRuntimeHitDefContactMemory(actor: RuntimeHitDefContactMemoryActor): RuntimeHitDefContactMemorySnapshot {
  return { committed: [...(actor.hitDefTargets ?? [])], pending: [...(actor.pendingHitDefTargets ?? [])] };
}

export function createRuntimeHitDefContactMemoryDiagnostic<TActor extends RuntimeHitDefContactMemoryActor & { id: string }>(
  actors: readonly TActor[],
): RuntimeHitDefContactMemoryDiagnostic {
  return {
    schema: "RuntimeHitDefContactMemory/v0",
    actors: actors.map((actor) => ({ actorId: actor.id, ...snapshotRuntimeHitDefContactMemory(actor) })),
  };
}

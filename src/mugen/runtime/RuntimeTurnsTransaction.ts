/**
 * RuntimeTurnsTransaction/v1 (DA26-15).
 * prepare → validate → commit → restore with integral checksum.
 */

export const RUNTIME_TURNS_TRANSACTION_SCHEMA = "RuntimeTurnsTransaction/v1" as const;

export type RuntimeTurnsTransactionPhase = "prepare" | "validate" | "commit" | "restore";

export type RuntimeTurnsActorSnapshot = {
  id: string;
  side: 1 | 2;
  life: number;
  lifeMax: number;
  power: number;
  standby: boolean;
  overKo: boolean;
  stateNo: number;
};

export type RuntimeTurnsWorldSnapshot = {
  tick: number;
  roundNo: number;
  actors: RuntimeTurnsActorSnapshot[];
  effectsChecksum: string;
};

export type RuntimeTurnsTransactionPlan = {
  schema: typeof RUNTIME_TURNS_TRANSACTION_SCHEMA;
  phases: RuntimeTurnsTransactionPhase[];
  ready: boolean;
  diagnostics: string[];
  preimageChecksum: string;
  postimageChecksum?: string;
};

export type RuntimeTurnsTransactionResult = RuntimeTurnsTransactionPlan & {
  applied: boolean;
  restored: boolean;
  receiptId: string;
};

export type RuntimeTurnsTransactionInput = {
  world: RuntimeTurnsWorldSnapshot;
  /** Mutation applied only after validate succeeds. */
  mutate: (world: RuntimeTurnsWorldSnapshot) => RuntimeTurnsWorldSnapshot | { error: string };
  /** When true, force failure after mutate to exercise restore. */
  injectFaultAfterCommit?: boolean;
};

export function checksumRuntimeTurnsWorld(world: RuntimeTurnsWorldSnapshot): string {
  return stableHash(JSON.stringify(canonicalizeWorld(world)));
}

export function prepareRuntimeTurnsTransaction(world: RuntimeTurnsWorldSnapshot): {
  preimage: RuntimeTurnsWorldSnapshot;
  preimageChecksum: string;
  phases: RuntimeTurnsTransactionPhase[];
} {
  const preimage = cloneWorld(world);
  return {
    preimage,
    preimageChecksum: checksumRuntimeTurnsWorld(preimage),
    phases: ["prepare"],
  };
}

export function validateRuntimeTurnsWorld(world: RuntimeTurnsWorldSnapshot): string[] {
  const diagnostics: string[] = [];
  if (!Number.isFinite(world.tick) || world.tick < 0) diagnostics.push("invalid-tick");
  if (!Number.isFinite(world.roundNo) || world.roundNo < 1) diagnostics.push("invalid-round");
  if (world.actors.length === 0) diagnostics.push("empty-roster");
  const ids = new Set<string>();
  for (const actor of world.actors) {
    if (!actor.id.trim()) diagnostics.push("empty-actor-id");
    if (ids.has(actor.id)) diagnostics.push(`duplicate-actor:${actor.id}`);
    ids.add(actor.id);
    if (actor.side !== 1 && actor.side !== 2) diagnostics.push(`invalid-side:${actor.id}`);
    if (actor.life < 0 || actor.life > actor.lifeMax) diagnostics.push(`invalid-life:${actor.id}`);
  }
  return diagnostics;
}

export function runRuntimeTurnsTransaction(input: RuntimeTurnsTransactionInput): {
  world: RuntimeTurnsWorldSnapshot;
  result: RuntimeTurnsTransactionResult;
} {
  const prepared = prepareRuntimeTurnsTransaction(input.world);
  const phases: RuntimeTurnsTransactionPhase[] = [...prepared.phases, "validate"];
  const preDiagnostics = validateRuntimeTurnsWorld(prepared.preimage);
  if (preDiagnostics.length > 0) {
    return {
      world: cloneWorld(prepared.preimage),
      result: {
        schema: RUNTIME_TURNS_TRANSACTION_SCHEMA,
        phases,
        ready: false,
        diagnostics: preDiagnostics,
        preimageChecksum: prepared.preimageChecksum,
        applied: false,
        restored: false,
        receiptId: receiptId(prepared.preimageChecksum, "blocked"),
      },
    };
  }

  const mutation = input.mutate(cloneWorld(prepared.preimage));
  if ("error" in mutation) {
    return {
      world: cloneWorld(prepared.preimage),
      result: {
        schema: RUNTIME_TURNS_TRANSACTION_SCHEMA,
        phases: [...phases, "restore"],
        ready: false,
        diagnostics: [`mutate:${mutation.error}`],
        preimageChecksum: prepared.preimageChecksum,
        applied: false,
        restored: true,
        receiptId: receiptId(prepared.preimageChecksum, "mutate-fail"),
      },
    };
  }

  const postDiagnostics = validateRuntimeTurnsWorld(mutation);
  if (postDiagnostics.length > 0) {
    return {
      world: cloneWorld(prepared.preimage),
      result: {
        schema: RUNTIME_TURNS_TRANSACTION_SCHEMA,
        phases: [...phases, "restore"],
        ready: false,
        diagnostics: postDiagnostics.map((d) => `post:${d}`),
        preimageChecksum: prepared.preimageChecksum,
        applied: false,
        restored: true,
        receiptId: receiptId(prepared.preimageChecksum, "post-invalid"),
      },
    };
  }

  phases.push("commit");
  const postimageChecksum = checksumRuntimeTurnsWorld(mutation);
  if (input.injectFaultAfterCommit) {
    phases.push("restore");
    return {
      world: cloneWorld(prepared.preimage),
      result: {
        schema: RUNTIME_TURNS_TRANSACTION_SCHEMA,
        phases,
        ready: false,
        diagnostics: ["fault-injection:restore"],
        preimageChecksum: prepared.preimageChecksum,
        postimageChecksum,
        applied: false,
        restored: true,
        receiptId: receiptId(prepared.preimageChecksum, "fault"),
      },
    };
  }

  return {
    world: mutation,
    result: {
      schema: RUNTIME_TURNS_TRANSACTION_SCHEMA,
      phases,
      ready: true,
      diagnostics: [],
      preimageChecksum: prepared.preimageChecksum,
      postimageChecksum,
      applied: true,
      restored: false,
      receiptId: receiptId(postimageChecksum, "ok"),
    },
  };
}

function cloneWorld(world: RuntimeTurnsWorldSnapshot): RuntimeTurnsWorldSnapshot {
  return {
    tick: world.tick,
    roundNo: world.roundNo,
    effectsChecksum: world.effectsChecksum,
    actors: world.actors.map((actor) => ({ ...actor })),
  };
}

function canonicalizeWorld(world: RuntimeTurnsWorldSnapshot): RuntimeTurnsWorldSnapshot {
  return {
    tick: world.tick,
    roundNo: world.roundNo,
    effectsChecksum: world.effectsChecksum,
    actors: [...world.actors]
      .map((actor) => ({ ...actor }))
      .sort((a, b) => a.id.localeCompare(b.id)),
  };
}

function receiptId(checksum: string, tag: string): string {
  return `turns-tx:${tag}:${checksum.slice(0, 12)}`;
}

function stableHash(value: string): string {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

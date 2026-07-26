/**
 * LiveRuntimeTurnsBridge/v1 (DA28-08).
 * Projects live match roots into RuntimeTurnsTransaction and records
 * prepare/validate/commit/restore receipts around handoff mutations.
 */

import {
  checksumRuntimeTurnsWorld,
  runRuntimeTurnsTransaction,
  type RuntimeTurnsActorSnapshot,
  type RuntimeTurnsTransactionResult,
  type RuntimeTurnsWorldSnapshot,
} from "./RuntimeTurnsTransaction";

export const LIVE_RUNTIME_TURNS_BRIDGE_SCHEMA = "LiveRuntimeTurnsBridge/v1" as const;

export type LiveTurnsRootLike = {
  id: string;
  side: 1 | 2;
  life: number;
  lifeMax: number;
  power: number;
  standby: boolean;
  overKo: boolean;
  stateNo: number;
};

export type LiveRuntimeTurnsBridgeReport = {
  schema: typeof LIVE_RUNTIME_TURNS_BRIDGE_SCHEMA;
  transaction: RuntimeTurnsTransactionResult;
  world: RuntimeTurnsWorldSnapshot;
  claims: {
    allowed: string[];
    blocked: string[];
  };
  checksum: string;
};

export function projectLiveTurnsWorld(input: {
  tick: number;
  roundNo: number;
  roots: readonly LiveTurnsRootLike[];
  effectsChecksum?: string;
}): RuntimeTurnsWorldSnapshot {
  const actors: RuntimeTurnsActorSnapshot[] = input.roots.map((root) => ({
    id: root.id,
    side: root.side,
    life: root.life,
    lifeMax: root.lifeMax,
    power: root.power,
    standby: root.standby,
    overKo: root.overKo,
    stateNo: root.stateNo,
  }));
  return {
    tick: input.tick,
    roundNo: input.roundNo,
    actors,
    effectsChecksum: input.effectsChecksum ?? "live-fx",
  };
}

/** Run a live-shaped Turns transaction (handoff/replacement/fault). */
export function runLiveRuntimeTurnsBridge(input: {
  tick: number;
  roundNo: number;
  roots: readonly LiveTurnsRootLike[];
  effectsChecksum?: string;
  /** Mutate projected world (handoff). */
  mutate: (world: RuntimeTurnsWorldSnapshot) => RuntimeTurnsWorldSnapshot | { error: string };
  injectFaultAfterCommit?: boolean;
  injectFaultBeforeCommit?: boolean;
}): LiveRuntimeTurnsBridgeReport {
  const world = projectLiveTurnsWorld(input);
  if (input.injectFaultBeforeCommit) {
    const blocked = runRuntimeTurnsTransaction({
      world,
      mutate: () => ({ error: "pre-commit-fault" }),
    });
    return finish(blocked.world, blocked.result);
  }
  const { world: next, result } = runRuntimeTurnsTransaction({
    world,
    mutate: input.mutate,
    injectFaultAfterCommit: input.injectFaultAfterCommit,
  });
  return finish(next, result);
}

/** Convenience: commit a side-1 replacement when p1 active is KO and a standby exists. */
export function runLiveTurnsReplacementHandoff(input: {
  tick: number;
  roundNo: number;
  roots: readonly LiveTurnsRootLike[];
  injectFaultAfterCommit?: boolean;
}): LiveRuntimeTurnsBridgeReport {
  return runLiveRuntimeTurnsBridge({
    ...input,
    mutate: (world) => {
      const active = world.actors.find((actor) => actor.side === 1 && !actor.standby);
      const next = world.actors.find((actor) => actor.side === 1 && actor.standby && !actor.overKo);
      if (!active || !active.overKo) return { error: "no-ko-active" };
      if (!next) return { error: "no-standby-replacement" };
      return {
        ...world,
        tick: world.tick + 1,
        actors: world.actors.map((actor) => {
          if (actor.id === active.id) return { ...actor, standby: true };
          if (actor.id === next.id) return { ...actor, standby: false, stateNo: 5900, life: actor.lifeMax };
          return actor;
        }),
      };
    },
    injectFaultAfterCommit: input.injectFaultAfterCommit,
  });
}

function finish(
  world: RuntimeTurnsWorldSnapshot,
  transaction: RuntimeTurnsTransactionResult,
): LiveRuntimeTurnsBridgeReport {
  const payload = {
    schema: LIVE_RUNTIME_TURNS_BRIDGE_SCHEMA,
    applied: transaction.applied,
    restored: transaction.restored,
    phases: transaction.phases.join(","),
    pre: transaction.preimageChecksum,
    post: transaction.postimageChecksum ?? "",
    world: checksumRuntimeTurnsWorld(world),
  };
  return {
    schema: LIVE_RUNTIME_TURNS_BRIDGE_SCHEMA,
    transaction,
    world,
    claims: {
      allowed: [
        "live-shaped roots project into RuntimeTurnsTransaction",
        "prepare/validate/commit/restore receipts around handoff mutations",
        "fault injection restores preimage",
      ],
      blocked: [
        "full browser Turns multi-replacement matrix",
        "score movement",
        "Simul/Tag parity",
      ],
    },
    checksum: stableHash(stableStringify(payload)),
  };
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(",")}}`;
}

function stableHash(value: string): string {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

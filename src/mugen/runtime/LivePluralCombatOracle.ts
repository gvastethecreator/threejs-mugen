/**
 * LivePluralCombatOracle/v1 (DA28-07).
 * Runs PluralCombatOracle cells against live projectile roots/helpers from
 * RuntimeEffectActorWorld (or free projectile lists). Mutation of order/missing
 * subjects fails the integrity check.
 */

import {
  evaluatePluralCombatOracleCell,
  runPluralCombatOracle,
  type PluralCombatOracleCellInput,
  type PluralCombatOracleReport,
} from "./PluralCombatOracle";
import {
  gatherLiveProjectileWork,
  runLiveGlobalProjectileSchedule,
  type LiveGlobalProjectileScheduleReport,
} from "./LiveGlobalProjectileSchedule";
import type { RuntimeProjectile } from "./ProjectileSystem";
import type { RuntimeEffectActorWorld } from "./EffectActorSystem";

export const LIVE_PLURAL_COMBAT_ORACLE_SCHEMA = "LivePluralCombatOracle/v1" as const;

export type LivePluralCombatOracleInput = {
  projectiles?: readonly RuntimeProjectile[];
  /** Preferred: pull projectiles from both p1 and p2 stores. */
  effectWorld?: RuntimeEffectActorWorld;
  ownerIds?: readonly string[];
  tick?: number;
  hitpauseTicks?: number;
  juggleRemaining?: number;
  juggleCost?: number;
  reversalAttr?: string;
  incomingAttr?: string;
};

export type LivePluralCombatOracleReport = {
  schema: typeof LIVE_PLURAL_COMBAT_ORACLE_SCHEMA;
  liveSchedule: LiveGlobalProjectileScheduleReport;
  oracle: PluralCombatOracleReport;
  integrity: {
    reorderFails: boolean;
    missingSubjectFails: boolean;
    passed: boolean;
  };
  claims: {
    allowed: string[];
    blocked: string[];
  };
  checksum: string;
};

export function collectLiveProjectiles(input: LivePluralCombatOracleInput): RuntimeProjectile[] {
  if (input.projectiles) return [...input.projectiles];
  if (!input.effectWorld) return [];
  const owners = input.ownerIds ?? ["p1", "p2"];
  return owners.flatMap((ownerId) => input.effectWorld!.projectiles(ownerId));
}

export function buildLivePluralCombatCells(
  projectiles: readonly RuntimeProjectile[],
  options: {
    tick?: number;
    hitpauseTicks?: number;
    juggleRemaining?: number;
    juggleCost?: number;
    reversalAttr?: string;
    incomingAttr?: string;
  } = {},
): PluralCombatOracleCellInput[] {
  const subjects = gatherLiveProjectileWork({
    projectiles,
    tick: options.tick,
  });
  const work = subjects.map((subject) => subject.work);
  const helpers = work.filter((item) => {
    const parts = item.payload.split(":");
    // payload = rootId:parentId:projectileId:attr
    return parts[0] !== parts[1];
  });
  const cells: PluralCombatOracleCellInput[] = [];
  if (work.length >= 2) {
    cells.push({
      id: "live-projectile-order",
      kind: work.length >= 3 ? "projectile-three-owners" : "projectile-tie",
      projectiles: work,
    });
  }
  if (helpers.length > 0) {
    cells.push({
      id: "live-projectile-helper",
      kind: "projectile-helper",
      projectiles: work,
    });
  }
  if (work.length >= 2) {
    cells.push({
      id: "live-projectile-cancel",
      kind: "projectile-cancel",
      projectiles: work,
      cancelId: work[work.length - 1]?.id,
    });
  }
  cells.push({
    id: "live-hitpause",
    kind: "hitpause-hold",
    hitpauseTicks: options.hitpauseTicks ?? 4,
  });
  cells.push({
    id: "live-juggle",
    kind: "juggle-cost",
    juggleCost: options.juggleCost ?? 2,
    juggleRemaining: options.juggleRemaining ?? 10,
  });
  if (options.reversalAttr && options.incomingAttr) {
    cells.push({
      id: "live-reversal",
      kind: "reversal-attr",
      reversalAttr: options.reversalAttr,
      incomingAttr: options.incomingAttr,
    });
  }
  return cells;
}

export function runLivePluralCombatOracle(
  input: LivePluralCombatOracleInput,
): LivePluralCombatOracleReport {
  const projectiles = collectLiveProjectiles(input);
  const liveSchedule = runLiveGlobalProjectileSchedule({
    projectiles,
    tick: input.tick,
  });
  const cells = buildLivePluralCombatCells(projectiles, input);
  const oracle = runPluralCombatOracle(cells);

  // Integrity requires at least two live projectiles so reorder/missing mutation can fail.
  const orderCell = cells.find((cell) => cell.id === "live-projectile-order");
  let reorderFails = false;
  if (orderCell?.projectiles && orderCell.projectiles.length >= 2) {
    const mutated = {
      ...orderCell,
      id: "live-projectile-order-mutated",
      projectiles: [...orderCell.projectiles].reverse().map((item, index) => ({
        ...item,
        // Corrupt sort keys so the mutated multiset is not the same schedule input.
        localSeq: 999 - index,
        priority: (item.priority ?? 0) + 50 + index,
      })),
    };
    const original = evaluatePluralCombatOracleCell(orderCell);
    const mutatedResult = evaluatePluralCombatOracleCell(mutated);
    reorderFails = original.checksum !== mutatedResult.checksum;
  }

  const missing = orderCell
    ? evaluatePluralCombatOracleCell({
        ...orderCell,
        id: "live-projectile-order-missing",
        projectiles: (orderCell.projectiles ?? []).slice(0, Math.max(0, (orderCell.projectiles?.length ?? 0) - 1)),
      })
    : undefined;
  const full = orderCell ? evaluatePluralCombatOracleCell(orderCell) : undefined;
  const missingSubjectFails =
    orderCell && full && missing ? full.checksum !== missing.checksum : false;

  const integrityPassed = reorderFails && missingSubjectFails;
  const payload = {
    schema: LIVE_PLURAL_COMBAT_ORACLE_SCHEMA,
    liveScheduleChecksum: liveSchedule.checksum,
    oracleChecksum: oracle.checksum,
    reorderFails,
    missingSubjectFails,
    integrityPassed,
    order: liveSchedule.order.join(","),
  };

  return {
    schema: LIVE_PLURAL_COMBAT_ORACLE_SCHEMA,
    liveSchedule,
    oracle,
    integrity: {
      reorderFails,
      missingSubjectFails,
      passed: integrityPassed,
    },
    claims: {
      allowed: [
        "PluralCombatOracle cells consume live projectile roots/helpers",
        "live schedule order feeds the oracle matrix",
        "reordered or missing subjects fail integrity checks",
      ],
      blocked: [
        "full Ikemen plural combat parity",
        "browser plural combat oracle",
        "score movement",
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

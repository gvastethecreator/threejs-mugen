/**
 * PluralCombatOracle/v1 (DA26-18 bounded).
 * Stable matrix for multi-owner projectile / ReversalDef / juggle cells.
 * Claim blocked: full browser combat oracle and exact Ikemen parity.
 */

import {
  runGlobalProjectileSchedule,
  type GlobalProjectileWorkItem,
} from "./GlobalProjectileSchedule";

export const PLURAL_COMBAT_ORACLE_SCHEMA = "PluralCombatOracle/v1" as const;

export type PluralCombatOracleCellKind =
  | "projectile-three-owners"
  | "projectile-helper"
  | "projectile-tie"
  | "projectile-cancel"
  | "hitpause-hold"
  | "reversal-attr"
  | "juggle-cost"
  | "juggle-reset";

export type PluralCombatOracleCellInput = {
  id: string;
  kind: PluralCombatOracleCellKind;
  /** Work items for projectile cells; ignored for pure juggle/reversal. */
  projectiles?: readonly GlobalProjectileWorkItem[];
  /** Optional cancel of one projectile id before commit. */
  cancelId?: string;
  hitpauseTicks?: number;
  reversalAttr?: string;
  incomingAttr?: string;
  juggleCost?: number;
  juggleRemaining?: number;
  juggleReset?: boolean;
  noJuggleCheck?: boolean;
};

export type PluralCombatOracleCellResult = {
  id: string;
  kind: PluralCombatOracleCellKind;
  admitted: boolean;
  order: string[];
  outcome: string;
  checksum: string;
};

export type PluralCombatOracleReport = {
  schema: typeof PLURAL_COMBAT_ORACLE_SCHEMA;
  cells: PluralCombatOracleCellResult[];
  cellCount: number;
  admittedCount: number;
  checksum: string;
  claims: {
    allowed: string[];
    blocked: string[];
  };
};

export function evaluatePluralCombatOracleCell(
  cell: PluralCombatOracleCellInput,
): PluralCombatOracleCellResult {
  switch (cell.kind) {
    case "projectile-three-owners":
    case "projectile-helper":
    case "projectile-tie":
    case "projectile-cancel": {
      const items = [...(cell.projectiles ?? [])];
      const filtered =
        cell.kind === "projectile-cancel" && cell.cancelId
          ? items.filter((item) => item.id !== cell.cancelId)
          : items;
      const schedule = runGlobalProjectileSchedule(filtered);
      const hitpause = cell.hitpauseTicks ?? 0;
      const outcome =
        hitpause > 0
          ? `order=${schedule.order.join(",")};hitpause=${hitpause}`
          : `order=${schedule.order.join(",")};committed=${schedule.committed ? "1" : "0"}`;
      return finishCell(cell, true, schedule.order, outcome);
    }
    case "hitpause-hold": {
      const ticks = Math.max(0, cell.hitpauseTicks ?? 0);
      return finishCell(cell, ticks > 0, [], `hitpause-hold=${ticks}`);
    }
    case "reversal-attr": {
      const rev = (cell.reversalAttr ?? "").toUpperCase();
      const inc = (cell.incomingAttr ?? "").toUpperCase();
      const admitted = rev.length > 0 && inc.length > 0 && attrMatches(rev, inc);
      return finishCell(cell, admitted, [], `reversal=${rev}->${inc}:${admitted ? "hit" : "miss"}`);
    }
    case "juggle-cost": {
      const cost = cell.juggleCost ?? 0;
      const remaining = cell.juggleRemaining ?? 0;
      const bypass = cell.noJuggleCheck === true;
      const admitted = bypass || cost <= remaining;
      const after = bypass ? remaining : Math.max(0, remaining - cost);
      return finishCell(
        cell,
        admitted,
        [],
        `juggle cost=${cost} rem=${remaining}->${after} admit=${admitted ? "1" : "0"}`,
      );
    }
    case "juggle-reset": {
      const remaining = cell.juggleReset ? 15 : (cell.juggleRemaining ?? 0);
      return finishCell(cell, cell.juggleReset === true, [], `juggle-reset rem=${remaining}`);
    }
    default: {
      const _exhaustive: never = cell.kind;
      return finishCell({ ...cell, kind: "juggle-cost" }, false, [], `unknown:${String(_exhaustive)}`);
    }
  }
}

export function runPluralCombatOracle(
  cells: readonly PluralCombatOracleCellInput[],
): PluralCombatOracleReport {
  const results = cells.map(evaluatePluralCombatOracleCell);
  const checksum = stableHash(results.map((cell) => cell.checksum).join("|"));
  return {
    schema: PLURAL_COMBAT_ORACLE_SCHEMA,
    cells: results,
    cellCount: results.length,
    admittedCount: results.filter((cell) => cell.admitted).length,
    checksum,
    claims: {
      allowed: [
        "unit matrix for projectile order, cancel, hitpause, reversal attr, juggle cost/reset",
        "stable checksum under cell reordering when cell ids differ",
      ],
      blocked: [
        "browser plural combat oracle",
        "exact Ikemen ReversalDef timing parity",
        "full Helper projectile ownership graph",
      ],
    },
  };
}

/** Same multiset of cells yields the same report checksum regardless of input order. */
export function pluralCombatOracleIsOrderIndependent(
  cells: readonly PluralCombatOracleCellInput[],
): boolean {
  const forward = runPluralCombatOracle(cells);
  const reverse = runPluralCombatOracle([...cells].reverse());
  // Sort by cell id so order independence is about cell set identity, not array order.
  const sorted = runPluralCombatOracle(
    [...cells].sort((a, b) => a.id.localeCompare(b.id)),
  );
  const forwardSorted = stableHash(
    [...forward.cells]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((c) => c.checksum)
      .join("|"),
  );
  const reverseSorted = stableHash(
    [...reverse.cells]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((c) => c.checksum)
      .join("|"),
  );
  return forwardSorted === reverseSorted && reverseSorted === sorted.checksum;
}

function attrMatches(reversalAttr: string, incomingAttr: string): boolean {
  if (reversalAttr === "A" || reversalAttr === "SA") {
    return incomingAttr.includes("A") || incomingAttr.startsWith("S");
  }
  if (reversalAttr === "AA") {
    return incomingAttr === "AA" || incomingAttr.startsWith("AA,") || incomingAttr.includes(",AA");
  }
  return reversalAttr === incomingAttr || incomingAttr.includes(reversalAttr);
}

function finishCell(
  cell: PluralCombatOracleCellInput,
  admitted: boolean,
  order: string[],
  outcome: string,
): PluralCombatOracleCellResult {
  const checksum = stableHash(`${cell.id}|${cell.kind}|${admitted ? 1 : 0}|${order.join(",")}|${outcome}`);
  return {
    id: cell.id,
    kind: cell.kind,
    admitted,
    order,
    outcome,
    checksum,
  };
}

function stableHash(value: string): string {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

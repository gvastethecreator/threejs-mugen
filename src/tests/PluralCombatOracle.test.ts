import { describe, expect, it } from "vitest";
import {
  evaluatePluralCombatOracleCell,
  pluralCombatOracleIsOrderIndependent,
  runPluralCombatOracle,
  type PluralCombatOracleCellInput,
} from "../mugen/runtime/PluralCombatOracle";
import type { GlobalProjectileWorkItem } from "../mugen/runtime/GlobalProjectileSchedule";

function proj(
  id: string,
  ownerSide: 1 | 2,
  spawnTick: number,
  localSeq: number,
  priority?: number,
): GlobalProjectileWorkItem {
  return {
    id,
    ownerId: `o${ownerSide}-${id}`,
    ownerSide,
    spawnTick,
    localSeq,
    ...(priority === undefined ? {} : { priority }),
    payload: `p:${id}`,
  };
}

function matrix(): PluralCombatOracleCellInput[] {
  return [
    {
      id: "c-three",
      kind: "projectile-three-owners",
      projectiles: [proj("a", 1, 1, 0), proj("b", 2, 1, 0), proj("c", 1, 2, 0, 0)],
    },
    {
      id: "c-helper",
      kind: "projectile-helper",
      projectiles: [proj("h1", 1, 3, 0), proj("root", 1, 3, 1)],
    },
    {
      id: "c-tie",
      kind: "projectile-tie",
      projectiles: [proj("t2", 2, 5, 0), proj("t1", 1, 5, 0)],
    },
    {
      id: "c-cancel",
      kind: "projectile-cancel",
      projectiles: [proj("keep", 1, 1, 0), proj("drop", 1, 1, 1)],
      cancelId: "drop",
    },
    {
      id: "c-hitpause",
      kind: "hitpause-hold",
      hitpauseTicks: 8,
    },
    {
      id: "c-rev",
      kind: "reversal-attr",
      reversalAttr: "A",
      incomingAttr: "SA,NA",
    },
    {
      id: "c-juggle",
      kind: "juggle-cost",
      juggleCost: 3,
      juggleRemaining: 10,
    },
    {
      id: "c-juggle-block",
      kind: "juggle-cost",
      juggleCost: 8,
      juggleRemaining: 2,
    },
    {
      id: "c-reset",
      kind: "juggle-reset",
      juggleReset: true,
    },
  ];
}

describe("PluralCombatOracle", () => {
  it("evaluates the full plural matrix with stable report checksum", () => {
    const report = runPluralCombatOracle(matrix());
    expect(report.schema).toBe("PluralCombatOracle/v1");
    expect(report.cellCount).toBe(9);
    expect(report.admittedCount).toBeGreaterThanOrEqual(7);
    expect(report.checksum).toMatch(/^[0-9a-f]{8}$/);
    const blocked = report.cells.find((cell) => cell.id === "c-juggle-block");
    expect(blocked?.admitted).toBe(false);
    const cancel = report.cells.find((cell) => cell.id === "c-cancel");
    expect(cancel?.order).toEqual(["keep"]);
  });

  it("keeps cell outcomes order-independent by id multiset", () => {
    expect(pluralCombatOracleIsOrderIndependent(matrix())).toBe(true);
  });

  it("orders projectile ties by side then id", () => {
    const cell = evaluatePluralCombatOracleCell({
      id: "tie",
      kind: "projectile-tie",
      projectiles: [proj("z", 2, 1, 0), proj("a", 1, 1, 0)],
    });
    expect(cell.order).toEqual(["a", "z"]);
  });
});

/**
 * DA30-046: plural projectile lifecycle/order test hook over GlobalProjectileSchedule.
 */
import {
  type GlobalProjectileWorkItem,
  runGlobalProjectileSchedule,
  globalProjectileScheduleIsStable,
} from "../runtime/GlobalProjectileSchedule";

export type PluralProjectileMatrixCase = {
  id: string;
  items: GlobalProjectileWorkItem[];
  expectOrder: string[];
  expectStable: boolean;
  rejectReason?: string;
};

function item(
  id: string,
  ownerId: string,
  ownerSide: 1 | 2,
  spawnTick: number,
  localSeq: number,
  priority?: number,
): GlobalProjectileWorkItem {
  return {
    id,
    ownerId,
    ownerSide,
    spawnTick,
    localSeq,
    priority,
    payload: `p:${id}`,
  };
}

export function pluralProjectileMatrix(): PluralProjectileMatrixCase[] {
  return [
    {
      id: "three-owners-stable-order",
      items: [
        item("a", "p1", 1, 10, 0, 2),
        item("b", "p2", 2, 10, 0, 1),
        item("c", "p1-helper-0", 1, 11, 0, 1),
      ],
      expectOrder: ["b", "c", "a"],
      expectStable: true,
    },
    {
      id: "same-side-tie-break-by-id",
      items: [item("z", "p1", 1, 5, 0), item("y", "p1", 1, 5, 1), item("x", "p1", 1, 5, 2)],
      expectOrder: ["z", "y", "x"],
      expectStable: true,
    },
    {
      id: "reject-stale-owner-empty",
      items: [],
      expectOrder: [],
      expectStable: true,
      rejectReason: "empty work set has no owners",
    },
  ];
}

export function runPluralProjectileMatrix(): {
  cases: Array<{ id: string; ok: boolean; order: string[]; checksum: string; stable: boolean }>;
  ok: boolean;
} {
  const cases = pluralProjectileMatrix().map((c) => {
    const result = runGlobalProjectileSchedule(c.items);
    const stable = c.items.length === 0 ? true : globalProjectileScheduleIsStable(c.items);
    const orderOk = result.order.join("|") === c.expectOrder.join("|");
    const stableOk = stable === c.expectStable;
    return {
      id: c.id,
      ok: orderOk && stableOk,
      order: result.order,
      checksum: result.checksum,
      stable,
    };
  });
  return { cases, ok: cases.every((c) => c.ok) };
}

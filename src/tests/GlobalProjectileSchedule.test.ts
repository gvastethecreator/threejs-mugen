import { describe, expect, it } from "vitest";
import {
  globalProjectileScheduleIsStable,
  runGlobalProjectileSchedule,
  type GlobalProjectileWorkItem,
} from "../mugen/runtime/GlobalProjectileSchedule";

function item(
  id: string,
  ownerSide: 1 | 2,
  spawnTick: number,
  localSeq: number,
  priority?: number,
): GlobalProjectileWorkItem {
  return {
    id,
    ownerId: `p${ownerSide}`,
    ownerSide,
    spawnTick,
    localSeq,
    ...(priority === undefined ? {} : { priority }),
    payload: `hit:${id}`,
  };
}

describe("GlobalProjectileSchedule", () => {
  it("orders by priority, spawn tick, side, local seq, then id", () => {
    const result = runGlobalProjectileSchedule([
      item("c", 2, 5, 0, 2),
      item("a", 1, 5, 1, 1),
      item("b", 1, 5, 0, 1),
      item("d", 2, 4, 0),
    ]);
    // priority 1 before 2; within priority 1, localSeq 0 before 1; then priority 2; then unprioritized by tick.
    expect(result.order).toEqual(["b", "a", "c", "d"]);
    expect(result.phases).toEqual(["gather", "sort", "resolve", "commit"]);
    expect(result.committed).toBe(true);
  });

  it("keeps order stable under reversed insertion", () => {
    const items = [item("z", 2, 3, 1), item("y", 1, 3, 0), item("x", 1, 2, 0, 0)];
    expect(globalProjectileScheduleIsStable(items)).toBe(true);
    const forward = runGlobalProjectileSchedule(items);
    const reverse = runGlobalProjectileSchedule([...items].reverse());
    expect(forward.checksum).toBe(reverse.checksum);
    expect(forward.order).toEqual(reverse.order);
  });
});

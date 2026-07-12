import { describe, expect, it } from "vitest";
import {
  RuntimeMoveStartWorld,
  type RuntimeMoveStartActor,
  type RuntimeMoveStartMove,
} from "../mugen/runtime/RuntimeMoveStartSystem";

type TestMove = RuntimeMoveStartMove & {
  damage: number;
};

describe("RuntimeMoveStartWorld", () => {
  it("owns selected move metadata and attack state reset", () => {
    const world = new RuntimeMoveStartWorld();
    const move = { actionId: 200, damage: 42 };
    const fighter = actor({
      currentMove: { actionId: 100, damage: 1 },
      currentMoveLabel: "old",
      moveTick: 9,
      hasHit: true,
      moveType: "H",
      reversal: true,
    });
    fighter.hitDefTargets = ["p2"];
    fighter.pendingHitDefTargets = ["p4"];

    const result = world.start(fighter, move, "QCF_x");

    expect(result).toEqual({ actionId: 200, label: "QCF_x", started: true });
    expect(fighter.currentMove).toBe(move);
    expect(fighter.currentMoveLabel).toBe("QCF_x");
    expect(fighter.moveTick).toBe(0);
    expect(fighter.hasHit).toBe(false);
    expect(fighter.hitDefTargets).toEqual([]);
    expect(fighter.pendingHitDefTargets).toEqual([]);
    expect(fighter.runtime.reversal).toBeUndefined();
    expect(fighter.runtime.moveType).toBe("A");
  });

  it("applies control before entering the authored action state", () => {
    const world = new RuntimeMoveStartWorld();
    const move = { actionId: 245, damage: 16 };
    const fighter = actor();
    const calls: string[] = [];

    const result = world.start(fighter, move, "kick", {
      applyControl: (target, ctrl) => {
        calls.push(`control:${ctrl}:${target.currentMoveLabel}:${target.runtime.moveType}`);
      },
      enterState: (target, stateId, routedMove) => {
        calls.push(`state:${stateId}:${target.currentMoveLabel}:${routedMove.damage}`);
      },
    });

    expect(result.started).toBe(true);
    expect(calls).toEqual(["control:false:kick:A", "state:245:kick:16"]);
  });
});

function actor(
  overrides: Partial<RuntimeMoveStartActor<TestMove>> & { moveType?: "I" | "A" | "H"; reversal?: boolean } = {},
): RuntimeMoveStartActor<TestMove> {
  return {
    currentMove: overrides.currentMove,
    currentMoveLabel: overrides.currentMoveLabel,
    moveTick: overrides.moveTick ?? 0,
    hasHit: overrides.hasHit ?? false,
    runtime: {
      moveType: overrides.moveType ?? "I",
      ...(overrides.reversal ? { reversal: { attr: "S,NA", hitPause: 8 } } : {}),
    },
  };
}

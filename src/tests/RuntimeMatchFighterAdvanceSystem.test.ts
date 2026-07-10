import { describe, expect, it } from "vitest";
import { RuntimeMatchFighterAdvanceWorld } from "../mugen/runtime/RuntimeMatchFighterAdvanceSystem";

describe("RuntimeMatchFighterAdvanceWorld", () => {
  it("owns the normal 1v1 fighter advance and auto-guard order", () => {
    const calls: string[] = [];
    const result = new RuntimeMatchFighterAdvanceWorld().advancePair({
      p1: actor("p1"),
      p2: actor("p2"),
      advanceFighter: (fighter, opponent) => calls.push(`advance:${fighter.id}:${opponent.id}`),
      applyAutoGuardStart: (defender, attacker, checkpoint) => calls.push(`guard:${checkpoint}:${defender.id}:${attacker.id}`),
      isPaused: () => false,
    });

    expect(result).toEqual({ advancedP2: true });
    expect(calls).toEqual([
      "guard:pre:p1:p2",
      "guard:pre:p2:p1",
      "advance:p1:p2",
      "guard:post:p1:p2",
      "advance:p2:p1",
      "guard:post:p2:p1",
    ]);
  });

  it("skips P2 advance and its post guard check when P1 starts match pause", () => {
    const calls: string[] = [];
    let paused = false;
    const result = new RuntimeMatchFighterAdvanceWorld().advancePair({
      p1: actor("p1"),
      p2: actor("p2"),
      advanceFighter: (fighter, opponent) => {
        calls.push(`advance:${fighter.id}:${opponent.id}`);
        if (fighter.id === "p1") {
          paused = true;
        }
      },
      applyAutoGuardStart: (defender, attacker, checkpoint) => calls.push(`guard:${checkpoint}:${defender.id}:${attacker.id}`),
      isPaused: () => paused,
    });

    expect(result).toEqual({ advancedP2: false });
    expect(calls).toEqual([
      "guard:pre:p1:p2",
      "guard:pre:p2:p1",
      "advance:p1:p2",
      "guard:post:p1:p2",
    ]);
  });
});

function actor(id: string): { id: string } {
  return { id };
}

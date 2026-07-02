import { describe, expect, it } from "vitest";
import { RuntimeMatchFighterAdvanceWorld } from "../mugen/runtime/RuntimeMatchFighterAdvanceSystem";

describe("RuntimeMatchFighterAdvanceWorld", () => {
  it("owns the normal 1v1 fighter advance and auto-guard order", () => {
    const calls: string[] = [];
    const result = new RuntimeMatchFighterAdvanceWorld().advancePair({
      p1: actor("p1"),
      p2: actor("p2"),
      advanceFighter: (fighter, opponent) => calls.push(`advance:${fighter.id}:${opponent.id}`),
      applyAutoGuardStart: (defender, attacker) => calls.push(`guard:${defender.id}:${attacker.id}`),
      isPaused: () => false,
    });

    expect(result).toEqual({ advancedP2: true });
    expect(calls).toEqual(["advance:p1:p2", "guard:p2:p1", "advance:p2:p1", "guard:p1:p2"]);
  });

  it("skips P2 advance and P1 auto-guard when P1 starts match pause", () => {
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
      applyAutoGuardStart: (defender, attacker) => calls.push(`guard:${defender.id}:${attacker.id}`),
      isPaused: () => paused,
    });

    expect(result).toEqual({ advancedP2: false });
    expect(calls).toEqual(["advance:p1:p2", "guard:p2:p1"]);
  });
});

function actor(id: string): { id: string } {
  return { id };
}

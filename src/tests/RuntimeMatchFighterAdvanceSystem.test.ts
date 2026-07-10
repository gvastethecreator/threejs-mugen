import { describe, expect, it } from "vitest";
import { RuntimeMatchFighterAdvanceWorld } from "../mugen/runtime/RuntimeMatchFighterAdvanceSystem";

describe("RuntimeMatchFighterAdvanceWorld", () => {
  it("owns the normal 1v1 fighter advance and auto-guard order", () => {
    const calls: string[] = [];
    new RuntimeMatchFighterAdvanceWorld().advancePair({
      p1: actor("p1"),
      p2: actor("p2"),
      advanceFighter: (fighter, opponent) => calls.push(`advance:${fighter.id}:${opponent.id}`),
      applyAutoGuardStart: (defender, attacker, checkpoint) => calls.push(`guard:${checkpoint}:${defender.id}:${attacker.id}`),
    });

    expect(calls).toEqual([
      "guard:pre:p1:p2",
      "guard:pre:p2:p1",
      "advance:p1:p2",
      "guard:post:p1:p2",
      "advance:p2:p1",
      "guard:post:p2:p1",
    ]);
  });

  it("lets P2 finish the prepared active tick when P1 starts match pause", () => {
    const calls: string[] = [];
    let pauseSource: string | undefined;
    new RuntimeMatchFighterAdvanceWorld().advancePair({
      p1: actor("p1"),
      p2: actor("p2"),
      advanceFighter: (fighter, opponent) => {
        calls.push(`advance:${fighter.id}:${opponent.id}:pause=${pauseSource ?? "none"}`);
        if (fighter.id === "p1") {
          pauseSource = fighter.id;
        }
      },
      applyAutoGuardStart: (defender, attacker, checkpoint) => calls.push(`guard:${checkpoint}:${defender.id}:${attacker.id}`),
    });

    expect(calls).toEqual([
      "guard:pre:p1:p2",
      "guard:pre:p2:p1",
      "advance:p1:p2:pause=none",
      "guard:post:p1:p2",
      "advance:p2:p1:pause=p1",
      "guard:post:p2:p1",
    ]);
  });
});

function actor(id: string): { id: string } {
  return { id };
}

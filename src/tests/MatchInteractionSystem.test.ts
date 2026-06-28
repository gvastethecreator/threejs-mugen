import { describe, expect, it } from "vitest";
import { RuntimeMatchInteractionWorld } from "../mugen/runtime/MatchInteractionSystem";

describe("RuntimeMatchInteractionWorld", () => {
  it("owns post-fighter target, effect, combat, clamp, and presentation ordering", () => {
    const world = new RuntimeMatchInteractionWorld();
    const calls: string[] = [];
    const tag = (label: string, fighter?: string, opponent?: string) => {
      calls.push([label, fighter, opponent].filter(Boolean).join(":"));
    };

    world.advance({
      p1: "p1",
      p2: "p2",
      advanceTargetMemory: (fighter) => tag("target-memory", fighter),
      advanceActiveEffects: (fighter) => tag("active-effects", fighter),
      resolveProjectileClashes: (left, right) => tag("projectile-clash", left, right),
      separateActors: (left, right) => tag("separate", left, right),
      applyTargetBindings: (fighter, opponent) => tag("target-bind", fighter, opponent),
      applyBindToTarget: (fighter, opponent) => tag("bind-to-target", fighter, opponent),
      resolvePriorityClash: (left, right) => {
        tag("priority", left, right);
        return "priority resolved";
      },
      resolveDirectCombat: (attacker, defender) => tag("direct-combat", attacker, defender),
      resolveProjectileCombat: (attacker, defender) => tag("projectile-combat", attacker, defender),
      clampToStage: (fighter) => tag("clamp", fighter),
      advancePresentationEffects: (fighter) => tag("presentation", fighter),
      log: (line) => tag("log", line),
    });

    expect(calls).toEqual([
      "target-memory:p1",
      "target-memory:p2",
      "active-effects:p1",
      "active-effects:p2",
      "projectile-clash:p1:p2",
      "separate:p1:p2",
      "target-bind:p1:p2",
      "target-bind:p2:p1",
      "bind-to-target:p1:p2",
      "bind-to-target:p2:p1",
      "priority:p1:p2",
      "log:priority resolved",
      "direct-combat:p1:p2",
      "direct-combat:p2:p1",
      "projectile-combat:p1:p2",
      "projectile-combat:p2:p1",
      "clamp:p1",
      "clamp:p2",
      "presentation:p1",
      "presentation:p2",
    ]);
  });
});

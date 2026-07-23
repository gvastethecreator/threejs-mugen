import { describe, expect, it } from "vitest";
import type { DemoMove } from "../mugen/runtime/demoFighters";
import {
  applyRuntimeDirectAirJuggleHit,
  canRuntimeDirectAirJuggle,
  runtimeAirJuggleBudget,
  runtimeAirJuggleCost,
  runtimeAirJuggleRemaining,
  type RuntimeDirectJuggleActor,
} from "../mugen/runtime/RuntimeJuggleSystem";

describe("RuntimeJuggleSystem", () => {
  it("uses target data.airjuggle and charges a direct hit that leaves the target falling", () => {
    const attacker = actor("p1");
    const defender = actor("p2", {}, { constants: { "data.airjuggle": 4 } });
    const hit = move({ airJuggle: 3, fall: { enabled: true } });

    expect(runtimeAirJuggleBudget(defender)).toBe(4);
    expect(runtimeAirJuggleCost(hit)).toBe(3);
    expect(canRuntimeDirectAirJuggle({ profile: "ikemen-go", attacker, defender, move: hit })).toBe(true);

    defender.runtime.hitFall = { falling: true };
    expect(applyRuntimeDirectAirJuggleHit({
      profile: "ikemen-go",
      attacker,
      defender,
      move: hit,
      targetWasFalling: false,
    })).toEqual({ cost: 3, remainingBefore: 4, remainingAfter: 1, charged: true, bypassed: false });
    expect(runtimeAirJuggleRemaining(defender, attacker.id)).toBe(1);
  });

  it("rejects over-budget falling contacts and lets NoJuggleCheck bypass without charging", () => {
    const attacker = actor("p1");
    const defender = actor("p2", {
      airJugglePoints: { p1: 1 },
      moveType: "H",
      hitFall: { falling: true },
    }, { constants: { "data.airjuggle": 4 } });
    const hit = move({ airJuggle: 3 });

    expect(canRuntimeDirectAirJuggle({ profile: "ikemen-go", attacker, defender, move: hit })).toBe(false);

    attacker.runtime.assertSpecial = { noJuggleCheck: true };
    expect(canRuntimeDirectAirJuggle({ profile: "ikemen-go", attacker, defender, move: hit })).toBe(true);
    expect(applyRuntimeDirectAirJuggleHit({
      profile: "ikemen-go",
      attacker,
      defender,
      move: hit,
      targetWasFalling: true,
    })).toEqual({ cost: 3, remainingBefore: 1, remainingAfter: 1, charged: false, bypassed: true });
  });

  it("leaves air-juggle inactive outside the IKEMEN profile", () => {
    const attacker = actor("p1");
    const defender = actor("p2", {
      hitFall: { falling: true },
    }, { constants: { "data.airjuggle": 1 } });

    expect(canRuntimeDirectAirJuggle({ profile: "mugen-1.1", attacker, defender, move: move({ airJuggle: 5 }) })).toBe(true);
    expect(applyRuntimeDirectAirJuggleHit({
      profile: "mugen-1.1",
      attacker,
      defender,
      move: move({ airJuggle: 5 }),
      targetWasFalling: true,
    })).toBeUndefined();
    expect(defender.runtime.airJugglePoints).toBeUndefined();
  });

  it("uses the bounded getting-hit fall state for admission", () => {
    const attacker = actor("p1");
    const defender = actor("p2", {
      moveType: "I",
      hitFall: { falling: true },
      airJugglePoints: { p1: 1 },
    }, { constants: { "data.airjuggle": 4 } });

    expect(canRuntimeDirectAirJuggle({
      profile: "ikemen-go",
      attacker,
      defender,
      move: move({ airJuggle: 3 }),
    })).toBe(true);
  });
});

function actor(
  id: string,
  runtime: RuntimeDirectJuggleActor["runtime"] = {},
  definition: RuntimeDirectJuggleActor["definition"] = { constants: {} },
): RuntimeDirectJuggleActor {
  return { id, definition, runtime };
}

function move(overrides: Partial<DemoMove> = {}): DemoMove {
  return {
    actionId: 200,
    startup: 0,
    activeStart: 0,
    activeEnd: 1,
    recovery: 1,
    damage: 1,
    hitPause: 0,
    hitStun: 1,
    push: 0,
    hitbox: { x1: 0, y1: 0, x2: 1, y2: 1 },
    ...overrides,
  };
}

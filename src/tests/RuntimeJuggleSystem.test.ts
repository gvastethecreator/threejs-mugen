import { describe, expect, it } from "vitest";
import type { DemoMove } from "../mugen/runtime/demoFighters";
import {
  applyRuntimeDirectAirJuggleHit,
  applyRuntimeHitDefJuggle,
  applyRuntimeStateDefJuggle,
  buildRuntimeJuggleTrace,
  canRuntimeDirectAirJuggle,
  runtimeAirJuggleBudget,
  runtimeAirJuggleCost,
  runtimeAirJuggleRemaining,
  runtimeDirectAirJuggleCost,
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

    defender.runtime.hitFall = { falling: true, damage: 0, velocity: { y: -1 } };
    expect(applyRuntimeDirectAirJuggleHit({
      profile: "ikemen-go",
      attacker,
      defender,
      move: hit,
      targetWasFalling: false,
    })).toEqual({
      cost: 3,
      remainingBefore: 4,
      remainingAfter: 1,
      charged: true,
      bypassed: false,
      fallingContact: true,
      costOrigin: "move",
      activeJuggle: 0,
    });
    expect(runtimeAirJuggleRemaining(defender, attacker.id)).toBe(1);
    expect(attacker.runtime.juggle).toBe(0);
    expect(attacker.runtime.juggleOrigin).toBe("reset");
  });

  it("rejects over-budget falling contacts and lets NoJuggleCheck bypass without charging", () => {
    const attacker = actor("p1");
    const defender = actor("p2", {
      airJugglePoints: { p1: 1 },
      moveType: "H",
      hitFall: { falling: true, damage: 0, velocity: { y: -1 } },
    }, { constants: { "data.airjuggle": 4 } });
    const hit = move({ airJuggle: 3 });

    expect(canRuntimeDirectAirJuggle({ profile: "ikemen-go", attacker, defender, move: hit })).toBe(false);

    attacker.runtime.assertSpecial = { flags: ["nojugglecheck"], globalFlags: [], noJuggleCheck: true };
    expect(canRuntimeDirectAirJuggle({ profile: "ikemen-go", attacker, defender, move: hit })).toBe(true);
    expect(applyRuntimeDirectAirJuggleHit({
      profile: "ikemen-go",
      attacker,
      defender,
      move: hit,
      targetWasFalling: true,
    })).toEqual({
      cost: 3,
      remainingBefore: 1,
      remainingAfter: 1,
      charged: false,
      bypassed: true,
      fallingContact: true,
      costOrigin: "move",
      activeJuggle: 0,
    });
  });

  it("leaves air-juggle inactive outside the IKEMEN profile", () => {
    const attacker = actor("p1");
    const defender = actor("p2", {
      hitFall: { falling: true, damage: 0, velocity: { y: -1 } },
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
      hitFall: { falling: true, damage: 0, velocity: { y: -1 } },
      airJugglePoints: { p1: 1 },
    }, { constants: { "data.airjuggle": 4 } });

    expect(canRuntimeDirectAirJuggle({
      profile: "ikemen-go",
      attacker,
      defender,
      move: move({ airJuggle: 3 }),
    })).toBe(true);
  });

  it("separates explicit HitDef air.juggle 0 from an omitted field", () => {
    const state = { juggle: 5 as number | undefined, juggleOrigin: "statedef" as const };

    applyRuntimeHitDefJuggle(state, undefined, { profile: "ikemen-go" });
    expect(state.juggle).toBe(5);
    expect(state.juggleOrigin).toBe("statedef");

    applyRuntimeHitDefJuggle(state, 0, { profile: "ikemen-go" });
    expect(state.juggle).toBe(0);
    expect(state.juggleOrigin).toBe("hitdef");
  });

  it("does not arm HitDef juggle outside the IKEMEN profile", () => {
    const state = { juggle: 4 as number | undefined, juggleOrigin: "statedef" as const };
    applyRuntimeHitDefJuggle(state, 9, { profile: "mugen-1.1" });
    expect(state.juggle).toBe(4);
  });

  it("applies StateDef juggle presence, A inherit, and IKEMEN non-A reset", () => {
    const attack = { moveType: "A" as const, juggle: 7 as number | undefined, juggleOrigin: "hitdef" as const };
    applyRuntimeStateDefJuggle(attack, undefined, "ikemen-go");
    expect(attack.juggle).toBe(7);

    applyRuntimeStateDefJuggle(attack, 3, "ikemen-go");
    expect(attack.juggle).toBe(3);
    expect(attack.juggleOrigin).toBe("statedef");

    const idle = { moveType: "I" as const, juggle: 3 as number | undefined, juggleOrigin: "statedef" as const };
    applyRuntimeStateDefJuggle(idle, undefined, "ikemen-go");
    expect(idle.juggle).toBe(0);
    expect(idle.juggleOrigin).toBe("reset");

    const mugenIdle = { moveType: "I" as const, juggle: 8 as number | undefined, juggleOrigin: "hitdef" as const };
    applyRuntimeStateDefJuggle(mugenIdle, undefined, "mugen-1.1");
    expect(mugenIdle.juggle).toBe(8);

    const idleExplicit = { moveType: "I" as const, juggle: undefined as number | undefined };
    applyRuntimeStateDefJuggle(idleExplicit, 2, "ikemen-go");
    expect(idleExplicit.juggle).toBe(2);
  });

  it("uses armed active cost after HitDef re-arm and rejects a second over-budget contact", () => {
    const attacker = actor("p1", { moveType: "A" });
    const defender = actor("p2", {
      moveType: "H",
      hitFall: { falling: true, damage: 0, velocity: { y: -1 } },
    }, { constants: { "data.airjuggle": 4 } });
    const hit = move({ airJuggle: 3 });

    applyRuntimeHitDefJuggle(attacker.runtime, 3, { profile: "ikemen-go" });
    expect(runtimeDirectAirJuggleCost(attacker, hit)).toBe(3);
    expect(applyRuntimeDirectAirJuggleHit({
      profile: "ikemen-go",
      attacker,
      defender,
      move: hit,
      targetWasFalling: true,
    })).toMatchObject({ cost: 3, remainingAfter: 1, charged: true });
    expect(attacker.runtime.juggle).toBe(0);

    // Same HitDef without re-arm would use cost 0; explicit re-arm restores the field.
    applyRuntimeHitDefJuggle(attacker.runtime, 3, { profile: "ikemen-go" });
    expect(canRuntimeDirectAirJuggle({ profile: "ikemen-go", attacker, defender, move: hit })).toBe(false);
  });

  it("builds a JuggleTrace decision with origin, remaining points, and reset", () => {
    const attacker = actor("p1", { moveType: "A", juggle: 3, juggleOrigin: "hitdef" });
    const defender = actor("p2", {
      moveType: "H",
      hitFall: { falling: true, damage: 0, velocity: { y: -1 } },
      airJugglePoints: { p1: 4 },
    }, { constants: { "data.airjuggle": 4 } });
    const hit = move({ airJuggle: 3 });

    const admission = buildRuntimeJuggleTrace({
      profile: "ikemen-go",
      attacker,
      defender,
      move: hit,
      targetWasFalling: true,
    });
    expect(admission).toMatchObject({
      attackerId: "p1",
      defenderId: "p2",
      cost: 3,
      costOrigin: "hitdef",
      remainingBefore: 4,
      admitted: true,
      fallingContact: true,
    });

    const hitResult = applyRuntimeDirectAirJuggleHit({
      profile: "ikemen-go",
      attacker,
      defender,
      move: hit,
      targetWasFalling: true,
    });
    const spend = buildRuntimeJuggleTrace({
      profile: "ikemen-go",
      attacker,
      defender,
      move: hit,
      hitResult: hitResult!,
    });
    expect(spend).toMatchObject({
      remainingAfter: 1,
      charged: true,
      activeJuggle: 0,
      costOrigin: "hitdef",
    });
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

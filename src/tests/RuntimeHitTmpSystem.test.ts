import { describe, expect, it } from "vitest";
import {
  markRuntimeHitTmpReversal,
  RuntimeHitTmpWorld,
  runtimeHitTmpValue,
} from "../mugen/runtime/RuntimeHitTmpSystem";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("RuntimeHitTmpSystem", () => {
  it("materializes idle, getting-hit, and falling phases", () => {
    const world = new RuntimeHitTmpWorld();
    const actor: Pick<CharacterRuntimeState, "hitFall" | "hitTmp" | "moveType"> = {
      moveType: "I",
      hitFall: undefined,
      hitTmp: 2,
    };

    expect(world.sync(actor)).toBe(0);
    actor.moveType = "H";
    expect(world.sync(actor)).toBe(1);
    actor.hitFall = { falling: true, damage: 0, velocity: { y: -1 } };
    expect(world.sync(actor)).toBe(2);
  });

  it("preserves the reversal marker while the actor leaves hit state", () => {
    const world = new RuntimeHitTmpWorld();
    const actor = { moveType: "I" as const, hitTmp: -1 as const };

    expect(world.sync(actor)).toBe(-1);
    expect(actor.hitTmp).toBe(-1);
  });

  it("falls back to the existing runtime projection when no field is materialized", () => {
    expect(runtimeHitTmpValue({ moveType: "H" })).toBe(1);
    expect(runtimeHitTmpValue({ moveType: "H", hitFall: { falling: true, damage: 0, velocity: { y: -1 } } })).toBe(2);
    expect(runtimeHitTmpValue({ moveType: "I", hitFall: { falling: true, damage: 0, velocity: { y: -1 } } })).toBe(0);
  });

  it("marks only an idle actor as reversaldef", () => {
    const idle = { hitTmp: 0 as const };
    const gettingHit = { hitTmp: 1 as const };

    expect(markRuntimeHitTmpReversal(idle)).toBe(-1);
    expect(markRuntimeHitTmpReversal(gettingHit)).toBe(1);
  });
});

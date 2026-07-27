import { describe, expect, it } from "vitest";
import { RuntimeActTmpWorld } from "../mugen/runtime/RuntimeActTmpSystem";

describe("RuntimeActTmpSystem", () => {
  it("starts at zero and finishes at one for an unpaused action", () => {
    const world = new RuntimeActTmpWorld();
    const actor: { actTmp?: -3 | -2 | -1 | 0 | 1 } = {};

    expect(world.prepare(actor, false)).toBe(0);
    expect(world.finish(actor, { matchPaused: false, hitPaused: false })).toBe(1);
  });

  it("keeps the global pause marker at minus two", () => {
    const world = new RuntimeActTmpWorld();
    const actor: { actTmp?: -3 | -2 | -1 | 0 | 1 } = {};

    expect(world.prepare(actor, true)).toBe(-2);
    expect(world.finish(actor, { matchPaused: true, hitPaused: false })).toBe(-2);
  });

  it("subtracts one for hitpause after an unpaused prepare", () => {
    const world = new RuntimeActTmpWorld();
    const actor: { actTmp?: -3 | -2 | -1 | 0 | 1 } = {};

    world.prepare(actor, false);
    expect(world.finish(actor, { matchPaused: false, hitPaused: true })).toBe(-1);
  });

  it("preserves the source arithmetic when both pause signals are active", () => {
    const world = new RuntimeActTmpWorld();
    const actor: { actTmp?: -3 | -2 | -1 | 0 | 1 } = {};

    world.prepare(actor, true);
    expect(world.finish(actor, { matchPaused: true, hitPaused: true })).toBe(-3);
  });
});

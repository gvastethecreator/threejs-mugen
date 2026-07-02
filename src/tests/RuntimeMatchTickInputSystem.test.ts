import { describe, expect, it } from "vitest";
import {
  RuntimeMatchTickInputWorld,
  type RuntimeMatchTickInputActor,
} from "../mugen/runtime/RuntimeMatchTickInputSystem";

describe("RuntimeMatchTickInputWorld", () => {
  it("stamps compatibility tick and clones current frame input", () => {
    const world = new RuntimeMatchTickInputWorld();
    const p1 = actor();
    const p2 = actor();
    const p1Input = new Set(["x"]);
    const p2Input = new Set(["B"]);

    world.stampFrame({ tick: 42, p1, p2, p1Input, p2Input });
    p1Input.add("y");
    p2Input.clear();

    expect(p1.compatibilityTick).toBe(42);
    expect(p2.compatibilityTick).toBe(42);
    expect([...p1.currentInput]).toEqual(["x"]);
    expect([...p2.currentInput]).toEqual(["B"]);
  });

  it("pushes normal command buffers without hitpause flag", () => {
    const world = new RuntimeMatchTickInputWorld();
    const p1 = actor();
    const p2 = actor();

    world.pushNormalCommandBuffers({
      tick: 12,
      p1,
      p2,
      p1Input: new Set(["D", "x"]),
      p2Input: new Set(["B"]),
    });

    expect(p1.commandCalls).toEqual(["12:D+x:false"]);
    expect(p2.commandCalls).toEqual(["12:B:false"]);
  });

  it("keeps stamping and buffering separate for pause and hitpause callers", () => {
    const world = new RuntimeMatchTickInputWorld();
    const p1 = actor();
    const p2 = actor();

    world.stampFrame({ tick: 7, p1, p2, p1Input: new Set(["x"]), p2Input: new Set(["y"]) });

    expect(p1.commandCalls).toEqual([]);
    expect(p2.commandCalls).toEqual([]);
    expect([...p1.currentInput]).toEqual(["x"]);
    expect([...p2.currentInput]).toEqual(["y"]);
  });
});

function actor(): RuntimeMatchTickInputActor & { commandCalls: string[] } {
  const commandCalls: string[] = [];
  return {
    compatibilityTick: 0,
    currentInput: new Set(),
    commandCalls,
    commandBuffer: {
      push: (frame, values, options) =>
        commandCalls.push(`${frame}:${[...values].join("+")}:${Boolean(options?.hitPause)}`),
    },
  };
}

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

  it("stamps and buffers mapped roots once with independent input copies", () => {
    const world = new RuntimeMatchTickInputWorld();
    const p1 = actor();
    const p3 = actor();
    const sharedInput = new Set(["x"]);
    const routes = [
      { actorId: "p1", actor: p1, input: new Set(sharedInput) },
      { actorId: "p3", actor: p3, input: new Set(sharedInput) },
    ];

    world.stampMappedActors({ tick: 17, routes });
    world.pushMappedNormalCommandBuffers({ tick: 17, routes });
    sharedInput.add("y");
    routes[0]!.input.add("z");

    expect([...p1.currentInput]).toEqual(["x"]);
    expect([...p3.currentInput]).toEqual(["x"]);
    expect(p1.commandCalls).toEqual(["17:x:false"]);
    expect(p3.commandCalls).toEqual(["17:x:false"]);
  });

  it("rejects duplicate mapped actor ids before mutation", () => {
    const world = new RuntimeMatchTickInputWorld();
    const p1 = actor();

    expect(() => world.pushMappedNormalCommandBuffers({
      tick: 18,
      routes: [
        { actorId: "p1", actor: p1, input: new Set(["x"]) },
        { actorId: "p1", actor: p1, input: new Set(["y"]) },
      ],
    })).toThrow("Duplicate mapped input actor p1");
    expect(p1.commandCalls).toEqual([]);
  });

  it("rejects one mapped actor aliased under multiple ids before mutation", () => {
    const world = new RuntimeMatchTickInputWorld();
    const p1 = actor();

    expect(() => world.stampMappedActors({
      tick: 19,
      routes: [
        { actorId: "p1", actor: p1, input: new Set(["x"]) },
        { actorId: "p3", actor: p1, input: new Set(["y"]) },
      ],
    })).toThrow("Duplicate mapped input actor p3");
    expect(p1.compatibilityTick).toBe(0);
    expect([...p1.currentInput]).toEqual([]);
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

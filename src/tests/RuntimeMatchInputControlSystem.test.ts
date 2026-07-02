import { describe, expect, it } from "vitest";
import { RuntimeMatchInputControlWorld } from "../mugen/runtime/RuntimeMatchInputControlSystem";

describe("RuntimeMatchInputControlWorld", () => {
  it("dispatches P1 before controlled P2 with mirrored opponents", () => {
    const calls: string[] = [];
    const world = new RuntimeMatchInputControlWorld();
    const p1 = actor("p1");
    const p2 = actor("p2");

    const result = world.apply({
      p1,
      p2,
      p1Input: new Set(["F", "x"]),
      p2Input: new Set(["B"]),
      p2Controlled: true,
      handlePlayerInput: (target, input, opponent) => {
        calls.push(`player:${target.id}:${[...input].join("+")}:${opponent.id}`);
        return `player:${target.id}`;
      },
      handleAi: (target, opponent) => {
        calls.push(`ai:${target.id}:${opponent.id}`);
        return `ai:${target.id}`;
      },
    });

    expect(calls).toEqual(["player:p1:F+x:p2", "player:p2:B:p1"]);
    expect(result).toEqual({ p1: "player:p1", p2: "player:p2", p2Controlled: true });
  });

  it("dispatches P1 then simple AI for uncontrolled P2", () => {
    const calls: string[] = [];
    const world = new RuntimeMatchInputControlWorld();
    const p1 = actor("p1");
    const p2 = actor("p2");

    const result = world.apply({
      p1,
      p2,
      p1Input: new Set(["D"]),
      p2Input: new Set(),
      p2Controlled: false,
      handlePlayerInput: (target, input, opponent) => {
        calls.push(`player:${target.id}:${[...input].join("+")}:${opponent.id}`);
        return `player:${target.id}`;
      },
      handleAi: (target, opponent) => {
        calls.push(`ai:${target.id}:${opponent.id}`);
        return `ai:${target.id}`;
      },
    });

    expect(calls).toEqual(["player:p1:D:p2", "ai:p2:p1"]);
    expect(result).toEqual({ p1: "player:p1", p2: "ai:p2", p2Controlled: false });
  });
});

function actor(id: string): { id: string } {
  return { id };
}

import { describe, expect, it } from "vitest";
import { RuntimeMatchActiveWorld } from "../mugen/runtime/RuntimeMatchActiveSystem";

describe("RuntimeMatchActiveWorld", () => {
  it("owns normal active match order and returns each sub-world result", () => {
    const calls: string[] = [];

    const result = new RuntimeMatchActiveWorld().advance({
      tickRoundTimer: () => {
        calls.push("round-timer");
        return "timer";
      },
      pushNormalCommandBuffers: () => {
        calls.push("command-buffers");
        return { buffered: true };
      },
      applyInputControl: () => {
        calls.push("input-control");
        return ["p1", "p2"];
      },
      advanceFighters: () => {
        calls.push("fighters");
        return { advancedP2: true };
      },
      advancePostFighter: () => {
        calls.push("post-fighter");
        return 2;
      },
      finishRoundIfNeeded: () => {
        calls.push("finish");
        return { finished: false };
      },
    });

    expect(calls).toEqual(["round-timer", "command-buffers", "input-control", "fighters", "post-fighter", "finish"]);
    expect(result).toEqual({
      roundTimer: "timer",
      commandBuffer: { buffered: true },
      inputControl: ["p1", "p2"],
      fighterAdvance: { advancedP2: true },
      postFighter: 2,
      finish: { finished: false },
    });
  });
});

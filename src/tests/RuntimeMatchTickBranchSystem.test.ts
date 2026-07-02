import { describe, expect, it } from "vitest";
import { RuntimeMatchTickBranchWorld } from "../mugen/runtime/RuntimeMatchTickBranchSystem";

describe("RuntimeMatchTickBranchWorld", () => {
  it("lets hitpause own the tick before pause or active branches", () => {
    const calls: string[] = [];

    const result = new RuntimeMatchTickBranchWorld().advance({
      advanceHitPause: () => {
        calls.push("hitpause");
        return { paused: true, result: "hitpause-result" };
      },
      isMatchPaused: () => {
        calls.push("pause-check");
        return true;
      },
      advancePaused: () => {
        calls.push("pause");
        return "pause-result";
      },
      advanceActive: () => {
        calls.push("active");
        return "active-result";
      },
    });

    expect(result).toEqual({ branch: "hitpause", result: "hitpause-result" });
    expect(calls).toEqual(["hitpause"]);
  });

  it("runs paused match when hitpause did not consume the tick", () => {
    const calls: string[] = [];

    const result = new RuntimeMatchTickBranchWorld().advance({
      advanceHitPause: () => {
        calls.push("hitpause");
        return { paused: false, result: "hitpause-clear" };
      },
      isMatchPaused: () => {
        calls.push("pause-check");
        return true;
      },
      advancePaused: () => {
        calls.push("pause");
        return { paused: true };
      },
      advanceActive: () => {
        calls.push("active");
        return { active: true };
      },
    });

    expect(result).toEqual({ branch: "pause", result: { paused: true } });
    expect(calls).toEqual(["hitpause", "pause-check", "pause"]);
  });

  it("runs active match only when neither hitpause nor match pause owns the tick", () => {
    const calls: string[] = [];

    const result = new RuntimeMatchTickBranchWorld().advance({
      advanceHitPause: () => {
        calls.push("hitpause");
        return { paused: false, result: "hitpause-clear" };
      },
      isMatchPaused: () => {
        calls.push("pause-check");
        return false;
      },
      advancePaused: () => {
        calls.push("pause");
        return { paused: true };
      },
      advanceActive: () => {
        calls.push("active");
        return { active: true };
      },
    });

    expect(result).toEqual({ branch: "active", result: { active: true } });
    expect(calls).toEqual(["hitpause", "pause-check", "active"]);
  });
});

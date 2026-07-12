import { describe, expect, it } from "vitest";
import { RuntimeRootMotionAdvanceWorld } from "../mugen/runtime/RuntimeRootMotionAdvanceSystem";

describe("RuntimeRootMotionAdvanceWorld", () => {
  it("runs controller state before kinematics and animation", () => {
    const calls: string[] = [];
    const actor = { id: "p3" };

    new RuntimeRootMotionAdvanceWorld().advance({
      actor,
      hooks: {
        advanceStateClock: (root) => calls.push(`clock:${root.id}`),
        runMotionControllers: (root) => calls.push(`controllers:${root.id}`),
        advanceKinematics: (root) => calls.push(`kinematics:${root.id}`),
        advanceAnimation: (root) => calls.push(`animation:${root.id}`),
      },
    });

    expect(calls).toEqual(["clock:p3", "controllers:p3", "kinematics:p3", "animation:p3"]);
  });
});

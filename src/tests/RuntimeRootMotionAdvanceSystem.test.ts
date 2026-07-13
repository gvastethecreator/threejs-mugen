import { describe, expect, it } from "vitest";
import { RuntimeRootMotionAdvanceWorld } from "../mugen/runtime/RuntimeRootMotionAdvanceSystem";
import { RuntimeActorConstraintWorld } from "../mugen/runtime/ActorConstraintSystem";

describe("RuntimeRootMotionAdvanceWorld", () => {
  it("runs controller state before kinematics, animation, and actor-local constraints", () => {
    const calls: string[] = [];
    const actor = { id: "p3" };

    new RuntimeRootMotionAdvanceWorld().advance({
      actor,
      hooks: {
        advanceGuardStun: (root) => calls.push(`guard-stun:${root.id}`),
        advanceStateClock: (root) => calls.push(`clock:${root.id}`),
        runMotionControllers: (root) => calls.push(`controllers:${root.id}`),
        advanceKinematics: (root) => calls.push(`kinematics:${root.id}`),
        advanceAnimation: (root) => calls.push(`animation:${root.id}`),
        applyConstraints: (root) => calls.push(`constraints:${root.id}`),
      },
    });

    expect(calls).toEqual(["guard-stun:p3", "clock:p3", "controllers:p3", "kinematics:p3", "animation:p3", "constraints:p3"]);
  });

  it("clamps the final motion position and honors the one-frame ScreenBound opt-out", () => {
    const constraintWorld = new RuntimeActorConstraintWorld();
    const advance = (bound: boolean) => {
      const actor = {
        id: "p3",
        runtime: {
          pos: { x: 9, y: 0 },
          facing: 1 as const,
          playerPush: true,
          screenBound: { bound, moveCameraX: true, moveCameraY: true },
        },
      };
      new RuntimeRootMotionAdvanceWorld().advance({
        actor,
        hooks: {
          advanceGuardStun: () => undefined,
          advanceStateClock: () => undefined,
          runMotionControllers: () => undefined,
          advanceKinematics: (root) => { root.runtime.pos.x += 5; },
          advanceAnimation: () => undefined,
          applyConstraints: (root) => constraintWorld.clampToStage(root.runtime, { bounds: { left: -10, right: 10 } }),
        },
      });
      return actor.runtime.pos.x;
    };

    expect(advance(true)).toBe(10);
    expect(advance(false)).toBe(14);
  });
});

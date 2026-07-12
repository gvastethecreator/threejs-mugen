import { describe, expect, it, vi } from "vitest";
import {
  ACTIVE_MOTION_ROOT_CNS_CAPABILITIES,
  PLAYABLE_ROOT_CNS_CAPABILITIES,
  RuntimeRootCnsExecutionWorld,
  STANDBY_ROOT_CNS_CAPABILITIES,
} from "../mugen/runtime/RuntimeRootCnsExecutionSystem";

describe("RuntimeRootCnsExecutionWorld", () => {
  it("selects explicit playable, active-motion, and standby capability profiles", () => {
    const run = vi.fn((_input: unknown) => ({ actor: {}, executed: 0, stopped: false }));
    const world = new RuntimeRootCnsExecutionWorld({ run } as never);
    const input = {} as never;

    world.execute(input, "playable");
    world.execute(input, "active-motion");
    world.execute(input, "standby");

    expect(run.mock.calls[0]?.[0]).toMatchObject({ capabilities: PLAYABLE_ROOT_CNS_CAPABILITIES });
    expect(run.mock.calls[1]?.[0]).toMatchObject({ capabilities: ACTIVE_MOTION_ROOT_CNS_CAPABILITIES });
    expect(run.mock.calls[2]?.[0]).toMatchObject({ capabilities: STANDBY_ROOT_CNS_CAPABILITIES });
    expect(STANDBY_ROOT_CNS_CAPABILITIES.runtimeControllers).toEqual(expect.arrayContaining(["tagin", "tagout"]));
    expect(ACTIVE_MOTION_ROOT_CNS_CAPABILITIES.runtimeControllers).toEqual(
      expect.arrayContaining(["tagin", "velset", "posadd"]),
    );
    expect(ACTIVE_MOTION_ROOT_CNS_CAPABILITIES.sideEffects).toEqual(["hitdef"]);
    expect(STANDBY_ROOT_CNS_CAPABILITIES.sideEffects).toEqual([]);
  });
});

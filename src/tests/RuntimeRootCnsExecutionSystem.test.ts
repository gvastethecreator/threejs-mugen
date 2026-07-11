import { describe, expect, it, vi } from "vitest";
import {
  PLAYABLE_ROOT_CNS_CAPABILITIES,
  RuntimeRootCnsExecutionWorld,
  STANDBY_ROOT_CNS_CAPABILITIES,
} from "../mugen/runtime/RuntimeRootCnsExecutionSystem";

describe("RuntimeRootCnsExecutionWorld", () => {
  it("selects explicit playable and standby capability profiles", () => {
    const run = vi.fn((_input: unknown) => ({ actor: {}, executed: 0, stopped: false }));
    const world = new RuntimeRootCnsExecutionWorld({ run } as never);
    const input = {} as never;

    world.execute(input, "playable");
    world.execute(input, "standby");

    expect(run.mock.calls[0]?.[0]).toMatchObject({ capabilities: PLAYABLE_ROOT_CNS_CAPABILITIES });
    expect(run.mock.calls[1]?.[0]).toMatchObject({ capabilities: STANDBY_ROOT_CNS_CAPABILITIES });
  });
});

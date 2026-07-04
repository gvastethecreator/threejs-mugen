import { describe, expect, it } from "vitest";
import type { EnvColorControllerOp } from "../mugen/compiler/ControllerOps";
import type { MugenStateController } from "../mugen/model/MugenState";
import { RuntimeEnvColorWorld } from "../mugen/runtime/EnvColorSystem";
import { RuntimeMatchEnvColorBridgeWorld } from "../mugen/runtime/RuntimeMatchEnvColorBridgeSystem";

describe("RuntimeMatchEnvColorBridgeWorld", () => {
  it("forwards match-level EnvColor controller emission through RuntimeEnvColorWorld", () => {
    const bridge = new RuntimeMatchEnvColorBridgeWorld();
    const envColorWorld = new RuntimeEnvColorWorld();
    const operation: EnvColorControllerOp = {
      kind: "envcolor",
      color: [24, 72, 180],
      time: 18,
      under: true,
    };

    const event = bridge.apply({
      controller: controller("EnvColor", { value: "1,1,1", time: "1", under: "0" }),
      operation,
      runtimeTick: 44,
      envColorWorld,
    });

    expect(event).toEqual({
      type: "EnvColor",
      color: [24, 72, 180],
      time: 18,
      under: true,
      runtimeTick: 44,
    });
    expect(envColorWorld.snapshotStageFlash(45)).toMatchObject({
      color: [24, 72, 180],
      remaining: 17,
      under: true,
    });
  });

  it("returns undefined when the EnvColor controller produces no event", () => {
    const bridge = new RuntimeMatchEnvColorBridgeWorld();

    expect(
      bridge.apply({
        controller: controller("EnvColor", { value: "255,255,255", time: "0" }),
        runtimeTick: 12,
        envColorWorld: new RuntimeEnvColorWorld(),
      }),
    ).toBeUndefined();
  });
});

function controller(type: string, params: Record<string, string>): MugenStateController {
  return {
    stateId: 200,
    type,
    params,
    triggers: [],
    line: 1,
    rawHeader: `[State 200, ${type}]`,
  };
}

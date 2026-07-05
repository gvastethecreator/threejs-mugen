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

  it("forwards dynamic EnvColor resolver through the match bridge", () => {
    const bridge = new RuntimeMatchEnvColorBridgeWorld();
    const envColorWorld = new RuntimeEnvColorWorld();

    const event = bridge.apply({
      controller: controller("EnvColor", { value: "var(0),var(1),var(2)", time: "var(3)", under: "var(4)" }),
      runtimeTick: 50,
      envColorWorld,
      resolveEnvColor: {
        resolveNumber: (key) => ({ time: 14, under: 1 })[key],
        resolveTriplet: () => [32, 128, 240],
      },
    });

    expect(event).toEqual({
      type: "EnvColor",
      color: [32, 128, 240],
      time: 14,
      under: true,
      runtimeTick: 50,
    });
    expect(envColorWorld.snapshotStageFlash(51)).toMatchObject({
      color: [32, 128, 240],
      remaining: 13,
      under: true,
    });
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

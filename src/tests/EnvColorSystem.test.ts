import { describe, expect, it } from "vitest";
import { compileControllerIr } from "../mugen/compiler/StateControllerCompiler";
import type { EnvColorControllerOp } from "../mugen/compiler/ControllerOps";
import type { MugenStateController } from "../mugen/model/MugenState";
import {
  calculateRuntimeStageFlash,
  createRuntimeEnvColorEvent,
  pushRuntimeEnvColorEvent,
  RuntimeEnvColorControllerDispatchWorld,
  RuntimeEnvColorWorld,
} from "../mugen/runtime/EnvColorSystem";
import type { RuntimeEnvColorEvent } from "../mugen/runtime/types";

describe("EnvColorSystem", () => {
  it("creates bounded stage flash events from EnvColor controllers", () => {
    const event = createRuntimeEnvColorEvent(controller("EnvColor", { value: "300,-4,64.4", time: "999", under: "1" }), 120);

    expect(event).toEqual({
      type: "EnvColor",
      color: [255, 0, 64],
      time: 240,
      under: true,
      runtimeTick: 120,
    });
  });

  it("prefers compiled operation data over raw params", () => {
    const operation: EnvColorControllerOp = {
      kind: "envcolor",
      color: [16, 96, 255],
      time: 12,
      under: false,
    };

    expect(createRuntimeEnvColorEvent(controller("EnvColor", { value: "1,1,1", time: "1", under: "1" }), 5, operation)).toEqual({
      type: "EnvColor",
      color: [16, 96, 255],
      time: 12,
      under: false,
      runtimeTick: 5,
    });
  });

  it("ignores zero-length EnvColor controllers", () => {
    expect(createRuntimeEnvColorEvent(controller("EnvColor", { time: "0" }), 10)).toBeUndefined();
  });

  it("keeps newest EnvColor events first and bounds history", () => {
    const events: RuntimeEnvColorEvent[] = [];
    for (let tick = 0; tick < 10; tick += 1) {
      pushRuntimeEnvColorEvent(events, event(tick), 4);
    }

    expect(events.map((item) => item.runtimeTick)).toEqual([9, 8, 7, 6]);
  });

  it("calculates deterministic stage flash from newest active event", () => {
    const flash = calculateRuntimeStageFlash(13, [
      { ...event(10), time: 12, color: [16, 96, 255], under: false },
      { ...event(4), time: 60, color: [255, 0, 0], under: true },
    ]);

    expect(flash).toEqual({
      color: [16, 96, 255],
      opacity: 0.495,
      remaining: 9,
      under: false,
    });
  });

  it("returns no stage flash when every event is expired or from the future", () => {
    expect(calculateRuntimeStageFlash(20, [{ ...event(0), time: 3 }])).toBeUndefined();
    expect(calculateRuntimeStageFlash(2, [{ ...event(5), time: 3 }])).toBeUndefined();
  });

  it("wraps EnvColor event history and stage-flash projection behind RuntimeEnvColorWorld", () => {
    const world = new RuntimeEnvColorWorld();

    const emitted = world.emitController(
      controller("EnvColor", { value: "16,96,255", time: "12", under: "0" }),
      10,
    );

    expect(emitted).toMatchObject({ type: "EnvColor", color: [16, 96, 255], time: 12, under: false });
    expect(world.snapshotStageFlash(13)).toEqual({
      color: [16, 96, 255],
      opacity: 0.495,
      remaining: 9,
      under: false,
    });

    world.reset();
    expect(world.snapshotStageFlash(13)).toBeUndefined();
  });

  it("dispatches active EnvColor controllers with telemetry hooks", () => {
    const dispatchWorld = new RuntimeEnvColorControllerDispatchWorld();
    const envColorWorld = new RuntimeEnvColorWorld();
    const actor = { id: "p1" };
    const ir = compileControllerIr(controller("EnvColor", { value: "16,96,255", time: "12", under: "1" }));
    const recordedControllers: string[] = [];
    const recordedOperations: string[] = [];

    const result = dispatchWorld.apply({
      actor,
      controller: ir,
      runtimeTick: 24,
      emitController: (source, runtimeTick, operation) => envColorWorld.emitController(source, runtimeTick, operation),
      recordController: (_actor, source) => recordedControllers.push(source.type),
      recordOperation: (_actor, operation) => recordedOperations.push(`${operation.kind}:${operation.time}`),
    });

    expect(result.event).toMatchObject({
      type: "EnvColor",
      color: [16, 96, 255],
      time: 12,
      under: true,
      runtimeTick: 24,
    });
    expect(envColorWorld.snapshotStageFlash(25)).toMatchObject({ color: [16, 96, 255], remaining: 11, under: true });
    expect(recordedControllers).toEqual(["EnvColor"]);
    expect(recordedOperations).toEqual(["envcolor:12"]);
    expect(result).toMatchObject({ recordedController: true, recordedOperation: true });
  });
});

function event(runtimeTick: number): RuntimeEnvColorEvent {
  return {
    type: "EnvColor",
    color: [255, 255, 255],
    time: 12,
    under: false,
    runtimeTick,
  };
}

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

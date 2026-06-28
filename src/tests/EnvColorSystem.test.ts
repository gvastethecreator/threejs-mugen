import { describe, expect, it } from "vitest";
import type { EnvColorControllerOp } from "../mugen/compiler/ControllerOps";
import type { MugenStateController } from "../mugen/model/MugenState";
import { calculateRuntimeStageFlash, createRuntimeEnvColorEvent, pushRuntimeEnvColorEvent } from "../mugen/runtime/EnvColorSystem";
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

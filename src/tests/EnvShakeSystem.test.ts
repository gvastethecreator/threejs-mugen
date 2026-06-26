import { describe, expect, it } from "vitest";
import type { MugenStateController } from "../mugen/model/MugenState";
import {
  calculateRuntimeCameraShake,
  createRuntimeEnvShakeEvent,
  createRuntimeFallEnvShakeEvent,
  pushRuntimeEnvShakeEvent,
} from "../mugen/runtime/EnvShakeSystem";
import type { RuntimeEnvShakeEvent } from "../mugen/runtime/types";

describe("EnvShakeSystem", () => {
  it("creates bounded camera shake events from EnvShake controllers", () => {
    const event = createRuntimeEnvShakeEvent(
      actor(200, 4),
      controller("EnvShake", { time: "999", freq: "-30", ampl: "-99", phase: "1.5" }),
      120,
    );

    expect(event).toEqual({
      type: "EnvShake",
      time: 240,
      freq: 30,
      ampl: -64,
      phase: 1.5,
      stateNo: 200,
      tick: 4,
      runtimeTick: 120,
    });
  });

  it("ignores zero-length EnvShake controllers", () => {
    expect(createRuntimeEnvShakeEvent(actor(200, 1), controller("EnvShake", { time: "0" }), 10)).toBeUndefined();
  });

  it("creates FallEnvShake events from hit fall metadata", () => {
    const event = createRuntimeFallEnvShakeEvent(
      actor(5050, 9, { time: 15, freq: 178, ampl: 6, phase: 0.25 }),
      77,
    );

    expect(event).toEqual({
      type: "EnvShake",
      time: 15,
      freq: 178,
      ampl: 6,
      phase: 0.25,
      stateNo: 5050,
      tick: 9,
      runtimeTick: 77,
    });
  });

  it("keeps newest shake events first and bounds history", () => {
    const events: RuntimeEnvShakeEvent[] = [];
    for (let tick = 0; tick < 10; tick += 1) {
      pushRuntimeEnvShakeEvent(events, event(tick, tick), 4);
    }

    expect(events.map((item) => item.runtimeTick)).toEqual([9, 8, 7, 6]);
  });

  it("calculates deterministic camera shake from the strongest active event", () => {
    const shake = calculateRuntimeCameraShake(13, [
      { ...event(10, 10), time: 12, freq: 30, ampl: -6, phase: 0 },
      { ...event(12, 12), time: 12, freq: 30, ampl: 2, phase: 0 },
    ]);

    expect(shake).toMatchObject({ remaining: 9, amplitude: -4.5 });
    expect(shake?.x).toBeCloseTo(-1.4532, 3);
    expect(shake?.y).toBeCloseTo(-2.6450, 3);
  });

  it("returns no camera shake when every event is expired or from the future", () => {
    expect(calculateRuntimeCameraShake(20, [{ ...event(0, 0), time: 3 }])).toBeUndefined();
    expect(calculateRuntimeCameraShake(2, [{ ...event(5, 5), time: 3 }])).toBeUndefined();
  });
});

function actor(
  stateNo: number,
  stateElapsed: number,
  envShake?: { time: number; freq: number; ampl: number; phase: number },
) {
  return {
    runtime: {
      stateNo,
      hitFall: envShake
        ? {
            falling: true,
            damage: 0,
            velocity: { y: 0 },
            envShake,
          }
        : undefined,
    },
    stateElapsed,
  };
}

function event(runtimeTick: number, tick: number): RuntimeEnvShakeEvent {
  return {
    type: "EnvShake",
    time: 12,
    freq: 30,
    ampl: -6,
    phase: 0,
    stateNo: 200,
    tick,
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

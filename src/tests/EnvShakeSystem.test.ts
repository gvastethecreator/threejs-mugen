import { describe, expect, it } from "vitest";
import { compileControllerIr } from "../mugen/compiler/StateControllerCompiler";
import type { MugenStateController } from "../mugen/model/MugenState";
import {
  calculateRuntimeCameraShake,
  createRuntimeEnvShakeEvent,
  createRuntimeFallEnvShakeEvent,
  pushRuntimeEnvShakeEvent,
  RuntimeEnvShakeControllerDispatchWorld,
  RuntimeEnvShakeWorld,
  RuntimeFallEnvShakeControllerDispatchWorld,
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

  it("uses typed EnvShake operations when available while preserving event shape", () => {
    const event = createRuntimeEnvShakeEvent(actor(200, 4), controller("EnvShake", { time: "1", freq: "2" }), 120, {
      kind: "envshake",
      time: 16,
      freq: 30,
      ampl: -7,
      phase: 0.5,
    });

    expect(event).toEqual({
      type: "EnvShake",
      time: 16,
      freq: 30,
      ampl: -7,
      phase: 0.5,
      stateNo: 200,
      tick: 4,
      runtimeTick: 120,
    });
  });

  it("resolves dynamic EnvShake params without typed operation evidence", () => {
    const dispatchWorld = new RuntimeEnvShakeControllerDispatchWorld();
    const envShakeWorld = new RuntimeEnvShakeWorld();
    const fighter = actor(200, 4);
    const ir = compileControllerIr(
      controller("EnvShake", { time: "var(0)", freq: "var(1)", ampl: "var(2)", phase: "fvar(0)" }),
    );
    const recordedControllers: string[] = [];
    const recordedOperations: string[] = [];

    const result = dispatchWorld.apply({
      actor: fighter,
      controller: ir,
      runtimeTick: 120,
      envShakeWorld,
      resolveEnvShake: {
        resolveNumber: (key) => ({ time: 18, ampl: -9 })[key],
        resolveFloat: (key) => ({ freq: 45, phase: 0.25 })[key],
      },
      recordController: (_actor, source) => recordedControllers.push(source.type),
      recordOperation: (_actor, operation) => recordedOperations.push(`${operation.kind}:${operation.time}`),
    });

    expect(ir.operation).toBeUndefined();
    expect(result.event).toMatchObject({
      type: "EnvShake",
      time: 18,
      freq: 45,
      ampl: -9,
      phase: 0.25,
      stateNo: 200,
      runtimeTick: 120,
    });
    expect(fighter.envShakeEvents).toEqual([result.event]);
    expect(recordedControllers).toEqual(["EnvShake"]);
    expect(recordedOperations).toEqual([]);
    expect(result).toMatchObject({ recordedController: true, recordedOperation: false });
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

  it("wraps EnvShake event mutation and camera projection behind RuntimeEnvShakeWorld", () => {
    const world = new RuntimeEnvShakeWorld();
    const p1 = actor(200, 4);
    const p2 = actor(5050, 8, { time: 20, freq: 30, ampl: -8, phase: 0 });

    world.emitController(p1, controller("EnvShake", { time: "12", freq: "30", ampl: "3", phase: "0" }), 10);
    world.emitFall(p2, 11);

    expect(p1.envShakeEvents).toHaveLength(1);
    expect(p2.envShakeEvents).toHaveLength(1);
    expect(p2.envShakeEvents[0]).toMatchObject({ stateNo: 5050, runtimeTick: 11, ampl: -8 });

    const shake = world.snapshotCameraShake(12, [p1, p2]);

    expect(shake?.amplitude).toBeLessThan(0);
    expect(shake?.remaining).toBe(19);
  });

  it("dispatches active EnvShake controllers with telemetry hooks", () => {
    const dispatchWorld = new RuntimeEnvShakeControllerDispatchWorld();
    const envShakeWorld = new RuntimeEnvShakeWorld();
    const fighter = actor(200, 4);
    const ir = compileControllerIr(controller("EnvShake", { time: "16", freq: "30", ampl: "-7", phase: "0.5" }));
    const recordedControllers: string[] = [];
    const recordedOperations: string[] = [];

    const result = dispatchWorld.apply({
      actor: fighter,
      controller: ir,
      runtimeTick: 120,
      envShakeWorld,
      recordController: (_actor, source) => recordedControllers.push(source.type),
      recordOperation: (_actor, operation) => recordedOperations.push(`${operation.kind}:${operation.time}`),
    });

    expect(result.event).toMatchObject({ type: "EnvShake", time: 16, freq: 30, ampl: -7, stateNo: 200, runtimeTick: 120 });
    expect(fighter.envShakeEvents).toEqual([result.event]);
    expect(recordedControllers).toEqual(["EnvShake"]);
    expect(recordedOperations).toEqual(["envshake:16"]);
    expect(result).toMatchObject({ recordedController: true, recordedOperation: true });
  });

  it("dispatches active FallEnvShake controllers with telemetry hooks", () => {
    const dispatchWorld = new RuntimeFallEnvShakeControllerDispatchWorld();
    const envShakeWorld = new RuntimeEnvShakeWorld();
    const fighter = actor(5050, 9, { time: 15, freq: 30, ampl: -8, phase: 0.25 });
    const ir = compileControllerIr(controller("FallEnvShake", {}));
    const recordedControllers: string[] = [];
    const recordedOperations: string[] = [];

    const result = dispatchWorld.apply({
      actor: fighter,
      controller: ir,
      runtimeTick: 121,
      envShakeWorld,
      recordController: (_actor, source) => recordedControllers.push(source.type),
      recordOperation: (_actor, operation) => recordedOperations.push(operation.kind),
    });

    expect(result.event).toMatchObject({ type: "EnvShake", time: 15, ampl: -8, stateNo: 5050, runtimeTick: 121 });
    expect(fighter.envShakeEvents).toEqual([result.event]);
    expect(fighter.runtime.hitFall?.envShake).toBeUndefined();
    expect(recordedControllers).toEqual(["FallEnvShake"]);
    expect(recordedOperations).toEqual(["fallenvshake"]);
    expect(result).toMatchObject({ clearedFallEnvShake: true, recordedController: true, recordedOperation: true });
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
    envShakeEvents: [],
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

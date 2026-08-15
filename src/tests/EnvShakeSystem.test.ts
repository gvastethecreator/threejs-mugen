import { describe, expect, it } from "vitest";
import { compileControllerIr } from "../mugen/compiler/StateControllerCompiler";
import type { MugenStateController } from "../mugen/model/MugenState";
import {
  calculateRuntimeCameraShake,
  createRuntimeEnvShakeEvent,
  createRuntimeFallEnvShakeEvent,
  createRuntimeProjectileEnvShakeEvent,
  pushRuntimeEnvShakeEvent,
  resolveRuntimeEnvShakeControllerOperation,
  RuntimeEnvShakeControllerDispatchWorld,
  RuntimeEnvShakeWorld,
  RuntimeFallEnvShakeControllerDispatchWorld,
} from "../mugen/runtime/EnvShakeSystem";
import type { RuntimeEnvShakeEvent } from "../mugen/runtime/types";

describe("EnvShakeSystem", () => {
  it("keeps finite active EnvShake durations above the former local ceiling", () => {
    const event = createRuntimeEnvShakeEvent(
      actor(200, 4),
      controller("EnvShake", { time: "999", freq: "-30", ampl: "-99", phase: "1.5" }),
      120,
    );

    expect(event).toEqual({
      type: "EnvShake",
      time: 999,
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

  it("resolves dynamic EnvShake params into typed operation evidence", () => {
    const dispatchWorld = new RuntimeEnvShakeControllerDispatchWorld();
    const envShakeWorld = new RuntimeEnvShakeWorld();
    const fighter = actor(200, 4);
    const source = controller("EnvShake", {
      time: "var(0)",
      freq: "var(1)",
      ampl: "var(2)",
      phase: "fvar(0)",
      mul: "var(3)",
      dir: "var(4)",
      diradd: "var(5)",
      decay: "var(6)",
    });
    const ir = compileControllerIr(source);
    const recordedControllers: string[] = [];
    const recordedOperations: string[] = [];
    const resolver = {
      resolveNumber: (key: "time" | "ampl") => ({ time: 18, ampl: -9 })[key],
      resolveFloat: (key: "freq" | "phase" | "mul" | "dir" | "diradd" | "decay") => ({
        freq: 45,
        phase: 0.25,
        mul: 1.5,
        dir: 30,
        diradd: 5,
        decay: 1.25,
      })[key],
    };

    const result = dispatchWorld.apply({
      actor: fighter,
      controller: ir,
      runtimeTick: 120,
      envShakeWorld,
      resolveEnvShake: resolver,
      recordController: (_actor, source) => recordedControllers.push(source.type),
      recordOperation: (_actor, operation) => recordedOperations.push(`${operation.kind}:${operation.time}`),
    });

    expect(ir.operation).toBeUndefined();
    expect(resolveRuntimeEnvShakeControllerOperation(source, resolver)).toEqual({
      kind: "envshake",
      time: 18,
      freq: 45,
      ampl: -9,
      phase: 0.25,
      mul: 1.5,
      dir: 30,
      dirAdd: 5,
      decay: 1.25,
    });
    expect(resolveRuntimeEnvShakeControllerOperation(controller("EnvShake", { time: "var(0)" }))).toBeUndefined();
    expect(result.event).toMatchObject({
      type: "EnvShake",
      time: 18,
      freq: 45,
      ampl: -9,
      phase: 0.25,
      mul: 1.5,
      dir: 30,
      dirAdd: 5,
      decay: 1.25,
      stateNo: 200,
      runtimeTick: 120,
    });
    expect(fighter.envShakeEvents).toEqual([result.event]);
    expect(recordedControllers).toEqual(["EnvShake"]);
    expect(recordedOperations).toEqual(["envshake:18"]);
    expect(result).toMatchObject({ recordedController: true, recordedOperation: true });
  });

  it("applies Ikemen diradd and decay per active EnvShake tick", () => {
    const event: RuntimeEnvShakeEvent = {
      ...eventAt(0, 0),
      time: 10,
      freq: 45,
      ampl: 8,
      phase: 10,
      dir: 10,
      dirAdd: 20,
      decay: 1,
    };

    const shake = calculateRuntimeCameraShake(2, [event]);

    expect(shake?.remaining).toBe(8);
    expect(shake?.amplitude).toBeCloseTo(5.12, 10);
    expect(shake?.x).toBeCloseTo(-3.86256, 4);
    expect(shake?.y).toBeCloseTo(3.24107, 4);
  });

  it("creates FallEnvShake events from hit fall metadata", () => {
    const event = createRuntimeFallEnvShakeEvent(
      actor(5050, 9, { time: 15, freq: 178, ampl: 6, phase: 0.25, mul: 0.75, dir: 67.5 }),
      77,
    );

    expect(event).toEqual({
      type: "EnvShake",
      time: 15,
      freq: 178,
      ampl: 6,
      phase: 0.25,
      mul: 0.75,
      dir: 67.5,
      stateNo: 5050,
      tick: 9,
      runtimeTick: 77,
    });
  });

  it("emits Projectile contact shake metadata and projects mul and dir", () => {
    const event = createRuntimeProjectileEnvShakeEvent(
      actor(1000, 6),
      { envShake: { time: 20, freq: 90, ampl: -8, phase: 45, mul: 2, dir: 90 } },
      10,
    );

    expect(event).toEqual({
      type: "EnvShake",
      time: 20,
      freq: 90,
      ampl: -8,
      phase: 45,
      mul: 2,
      dir: 90,
      stateNo: 1000,
      tick: 6,
      runtimeTick: 10,
    });
    expect(calculateRuntimeCameraShake(14, [event!])).toMatchObject({
      remaining: 16,
      amplitude: -12.8,
    });
    expect(calculateRuntimeCameraShake(14, [event!])?.x).toBeCloseTo(9.0509, 3);
    expect(calculateRuntimeCameraShake(14, [event!])?.y).toBeCloseTo(0, 5);
    expect(createRuntimeProjectileEnvShakeEvent(actor(1000, 6), {
      envShake: { time: 0, freq: 60, ampl: -4, phase: 0, mul: 1, dir: 0 },
    }, 10)).toBeUndefined();
  });

  it("keeps non-active EnvShake producers on their existing bounded policy", () => {
    expect(createRuntimeFallEnvShakeEvent(
      actor(5050, 9, { time: 999, freq: 60, ampl: -4, phase: 0 }),
      77,
    )?.time).toBe(240);
    expect(createRuntimeProjectileEnvShakeEvent(
      actor(1000, 6),
      { envShake: { time: 999, freq: 60, ampl: -4, phase: 0, mul: 1, dir: 0 } },
      10,
    )?.time).toBe(240);
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
  envShake?: { time: number; freq: number; ampl: number; phase: number; mul?: number; dir?: number; dirAdd?: number; decay?: number },
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

function eventAt(runtimeTick: number, tick: number): RuntimeEnvShakeEvent {
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

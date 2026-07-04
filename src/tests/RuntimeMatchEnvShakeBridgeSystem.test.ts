import { describe, expect, it } from "vitest";
import { compileControllerIr } from "../mugen/compiler/StateControllerCompiler";
import type { MugenStateController } from "../mugen/model/MugenState";
import { RuntimeEnvShakeWorld } from "../mugen/runtime/EnvShakeSystem";
import { RuntimeMatchEnvShakeBridgeWorld } from "../mugen/runtime/RuntimeMatchEnvShakeBridgeSystem";

describe("RuntimeMatchEnvShakeBridgeWorld", () => {
  it("forwards match-level EnvShake controller emission through RuntimeEnvShakeWorld", () => {
    const bridge = new RuntimeMatchEnvShakeBridgeWorld();
    const envShakeWorld = new RuntimeEnvShakeWorld();
    const fighter = actor(200, 4);
    const recordedControllers: string[] = [];
    const recordedOperations: string[] = [];

    const result = bridge.applyController({
      actor: fighter,
      controller: compileControllerIr(controller("EnvShake", { time: "16", freq: "30", ampl: "-7", phase: "0.5" })),
      runtimeTick: 120,
      envShakeWorld,
      recordController: (_actor, source) => recordedControllers.push(source.type),
      recordOperation: (_actor, operation) => recordedOperations.push(`${operation.kind}:${operation.time}`),
    });

    expect(result.event).toMatchObject({
      type: "EnvShake",
      time: 16,
      freq: 30,
      ampl: -7,
      phase: 0.5,
      stateNo: 200,
      tick: 4,
      runtimeTick: 120,
    });
    expect(fighter.envShakeEvents).toEqual([result.event]);
    expect(recordedControllers).toEqual(["EnvShake"]);
    expect(recordedOperations).toEqual(["envshake:16"]);
    expect(result).toMatchObject({ recordedController: true, recordedOperation: true });
  });

  it("forwards FallEnvShake through hit fall metadata and clears consumed env shake state", () => {
    const bridge = new RuntimeMatchEnvShakeBridgeWorld();
    const envShakeWorld = new RuntimeEnvShakeWorld();
    const fighter = actor(5050, 9, { time: 15, freq: 30, ampl: -8, phase: 0.25 });
    const recordedControllers: string[] = [];
    const recordedOperations: string[] = [];

    const result = bridge.applyFallController({
      actor: fighter,
      controller: compileControllerIr(controller("FallEnvShake", {})),
      runtimeTick: 121,
      envShakeWorld,
      recordController: (_actor, source) => recordedControllers.push(source.type),
      recordOperation: (_actor, operation) => recordedOperations.push(operation.kind),
    });

    expect(result.event).toMatchObject({
      type: "EnvShake",
      time: 15,
      ampl: -8,
      stateNo: 5050,
      tick: 9,
      runtimeTick: 121,
    });
    expect(fighter.envShakeEvents).toEqual([result.event]);
    expect(fighter.runtime.hitFall?.envShake).toBeUndefined();
    expect(recordedControllers).toEqual(["FallEnvShake"]);
    expect(recordedOperations).toEqual(["fallenvshake"]);
    expect(result).toMatchObject({ clearedFallEnvShake: true, recordedController: true, recordedOperation: true });
  });

  it("reports no FallEnvShake event when the actor has no pending hit fall env shake metadata", () => {
    const bridge = new RuntimeMatchEnvShakeBridgeWorld();
    const fighter = actor(5050, 9);

    const result = bridge.applyFallController({
      actor: fighter,
      controller: compileControllerIr(controller("FallEnvShake", {})),
      runtimeTick: 122,
      envShakeWorld: new RuntimeEnvShakeWorld(),
      recordController: () => undefined,
      recordOperation: () => undefined,
    });

    expect(result.event).toBeUndefined();
    expect(fighter.envShakeEvents).toEqual([]);
    expect(result).toMatchObject({ clearedFallEnvShake: false, recordedController: true, recordedOperation: false });
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

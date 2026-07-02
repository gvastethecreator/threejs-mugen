import { describe, expect, it } from "vitest";
import { compileControllerIr } from "../mugen/compiler/StateControllerCompiler";
import type { MugenStateController } from "../mugen/model/MugenState";
import {
  createRuntimeSoundEvent,
  parseMugenSoundValue,
  pushRuntimeSoundEvent,
  RuntimeAudioControllerDispatchWorld,
  RuntimeAudioWorld,
} from "../mugen/runtime/AudioEventSystem";
import type { RuntimeSoundEvent } from "../mugen/runtime/types";

describe("AudioEventSystem", () => {
  it("creates PlaySnd runtime events from MUGEN sound values", () => {
    const event = createRuntimeSoundEvent(
      actor(200, 4),
      controller("PlaySnd", { value: "S5,0", channel: "2", lowpriority: "1", volumescale: "50", freqmul: "0.5", loop: "1", pan: "32" }),
      120,
    );

    expect(event).toEqual({
      type: "PlaySnd",
      group: 5,
      index: 0,
      channel: 2,
      lowPriority: true,
      volumeScale: 50,
      freqMul: 0.5,
      loop: true,
      pan: 32,
      raw: "S5,0",
      stateNo: 200,
      tick: 4,
      runtimeTick: 120,
    });
  });

  it("creates StopSnd events with channel targeting", () => {
    const event = createRuntimeSoundEvent(actor(300, 8), controller("StopSnd", { channel: "1" }), 140);

    expect(event).toMatchObject({
      type: "StopSnd",
      channel: 1,
      stateNo: 300,
      tick: 8,
      runtimeTick: 140,
    });
    expect(event.group).toBeUndefined();
    expect(event.index).toBeUndefined();
  });

  it("preserves invalid raw values as debug telemetry instead of dropping the event", () => {
    const event = createRuntimeSoundEvent(actor(1000, 1), controller("PlaySnd", { value: "fightfx.fail" }), 2);

    expect(event).toMatchObject({
      type: "PlaySnd",
      raw: "fightfx.fail",
      stateNo: 1000,
    });
    expect(event.group).toBeUndefined();
    expect(event.index).toBeUndefined();
  });

  it("uses typed audio operations when available while preserving runtime event shape", () => {
    const event = createRuntimeSoundEvent(actor(200, 4), controller("PlaySnd", { value: "S1,1", channel: "7" }), 120, {
      kind: "audio",
      controllerType: "playsnd",
      value: "S5,0",
      channel: 2,
      lowPriority: false,
      volumeScale: 25,
      freqMul: 1.25,
      loop: true,
      absPan: -64,
    });

    expect(event).toEqual({
      type: "PlaySnd",
      group: 5,
      index: 0,
      channel: 2,
      lowPriority: false,
      volumeScale: 25,
      freqMul: 1.25,
      loop: true,
      absPan: -64,
      raw: "S5,0",
      stateNo: 200,
      tick: 4,
      runtimeTick: 120,
    });
  });

  it("uses typed StopSnd channel data in RuntimeAudioWorld", () => {
    const world = new RuntimeAudioWorld();
    const fighter = { ...actor(300, 8), soundEvents: [] as RuntimeSoundEvent[] };

    const event = world.emitController(fighter, controller("StopSnd", { channel: "1" }), 140, {
      kind: "audio",
      controllerType: "stopsnd",
      channel: 4,
    });

    expect(event).toMatchObject({ type: "StopSnd", channel: 4, stateNo: 300, tick: 8, runtimeTick: 140 });
    expect(fighter.soundEvents).toEqual([event]);
  });

  it("parses optional S prefix and negative sound ids", () => {
    expect(parseMugenSoundValue("5, 2")).toEqual({ group: 5, index: 2 });
    expect(parseMugenSoundValue("S-3,-7")).toEqual({ group: -3, index: -7 });
    expect(parseMugenSoundValue("F5,0")).toEqual({ group: 5, index: 0 });
    expect(parseMugenSoundValue("abc")).toBeUndefined();
  });

  it("keeps newest sound events first and bounds the history", () => {
    const events: RuntimeSoundEvent[] = [];
    for (let tick = 0; tick < 10; tick += 1) {
      pushRuntimeSoundEvent(events, { type: "PlaySnd", stateNo: 200, tick, runtimeTick: tick }, 4);
    }

    expect(events.map((event) => event.tick)).toEqual([9, 8, 7, 6]);
  });

  it("wraps sound event history mutation behind RuntimeAudioWorld", () => {
    const world = new RuntimeAudioWorld();
    const fighter = { ...actor(200, 4), soundEvents: [] as RuntimeSoundEvent[] };

    const event = world.emitController(fighter, controller("PlaySnd", { value: "S5,0", channel: "2" }), 120);

    expect(event).toMatchObject({ type: "PlaySnd", group: 5, index: 0, channel: 2, stateNo: 200 });
    expect(fighter.soundEvents).toEqual([event]);
  });

  it("dispatches active audio controllers with telemetry hooks", () => {
    const dispatchWorld = new RuntimeAudioControllerDispatchWorld();
    const audioWorld = new RuntimeAudioWorld();
    const fighter = { ...actor(200, 4), soundEvents: [] as RuntimeSoundEvent[] };
    const ir = compileControllerIr(controller("PlaySnd", { value: "S5,0", channel: "2" }));
    const recordedControllers: string[] = [];
    const recordedOperations: string[] = [];

    const result = dispatchWorld.apply({
      actor: fighter,
      controller: ir,
      runtimeTick: 120,
      audioWorld,
      recordController: (_actor, source) => recordedControllers.push(source.type),
      recordOperation: (_actor, operation) => recordedOperations.push(`${operation.kind}:${operation.controllerType}`),
    });

    expect(result.event).toMatchObject({ type: "PlaySnd", group: 5, index: 0, channel: 2, stateNo: 200, runtimeTick: 120 });
    expect(fighter.soundEvents).toEqual([result.event]);
    expect(recordedControllers).toEqual(["PlaySnd"]);
    expect(recordedOperations).toEqual(["audio:playsnd"]);
    expect(result).toMatchObject({ recordedController: true, recordedOperation: true });
  });

  it("wraps direct HitDef sound telemetry behind RuntimeAudioWorld", () => {
    const world = new RuntimeAudioWorld();
    const fighter = { ...actor(200, 6), soundEvents: [] as RuntimeSoundEvent[] };

    const event = world.emitHitDefSound(fighter, "S6,0", 140);

    expect(event).toMatchObject({
      type: "PlaySnd",
      group: 6,
      index: 0,
      raw: "S6,0",
      stateNo: 200,
      tick: 6,
      runtimeTick: 140,
    });
    expect(fighter.soundEvents).toEqual([event]);
  });

  it("tags direct HitDef sound telemetry with contact package metadata", () => {
    const world = new RuntimeAudioWorld();
    const fighter = { ...actor(200, 6), soundEvents: [] as RuntimeSoundEvent[] };

    const event = world.emitHitDefSound(fighter, "S5,0", 140, {
      contactId: "direct:p1:p2:140:200:6:hit",
      contactTick: 140,
      contactKind: "hit",
    });

    expect(event).toMatchObject({
      type: "PlaySnd",
      group: 5,
      index: 0,
      contactId: "direct:p1:p2:140:200:6:hit",
      contactTick: 140,
      contactKind: "hit",
    });
  });

  it("tags F-prefixed sounds with the actor FightFX prefix", () => {
    const world = new RuntimeAudioWorld();
    const fighter = { ...actor(200, 6), definition: { fightFxPrefix: "kfm_fx" }, soundEvents: [] as RuntimeSoundEvent[] };

    const event = world.emitHitDefSound(fighter, "F5,0", 140);

    expect(event).toMatchObject({
      type: "PlaySnd",
      group: 5,
      index: 0,
      raw: "F5,0",
      soundPrefix: "kfm_fx",
      stateNo: 200,
      tick: 6,
      runtimeTick: 140,
    });
  });
});

function actor(stateNo: number, stateElapsed: number) {
  return { runtime: { stateNo }, stateElapsed };
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

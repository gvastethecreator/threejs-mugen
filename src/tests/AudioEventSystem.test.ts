import { describe, expect, it } from "vitest";
import type { MugenStateController } from "../mugen/model/MugenState";
import {
  createRuntimeSoundEvent,
  parseMugenSoundValue,
  pushRuntimeSoundEvent,
} from "../mugen/runtime/AudioEventSystem";
import type { RuntimeSoundEvent } from "../mugen/runtime/types";

describe("AudioEventSystem", () => {
  it("creates PlaySnd runtime events from MUGEN sound values", () => {
    const event = createRuntimeSoundEvent(actor(200, 4), controller("PlaySnd", { value: "S5,0", channel: "2" }), 120);

    expect(event).toEqual({
      type: "PlaySnd",
      group: 5,
      index: 0,
      channel: 2,
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

  it("parses optional S prefix and negative sound ids", () => {
    expect(parseMugenSoundValue("5, 2")).toEqual({ group: 5, index: 2 });
    expect(parseMugenSoundValue("S-3,-7")).toEqual({ group: -3, index: -7 });
    expect(parseMugenSoundValue("abc")).toBeUndefined();
  });

  it("keeps newest sound events first and bounds the history", () => {
    const events: RuntimeSoundEvent[] = [];
    for (let tick = 0; tick < 10; tick += 1) {
      pushRuntimeSoundEvent(events, { type: "PlaySnd", stateNo: 200, tick, runtimeTick: tick }, 4);
    }

    expect(events.map((event) => event.tick)).toEqual([9, 8, 7, 6]);
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

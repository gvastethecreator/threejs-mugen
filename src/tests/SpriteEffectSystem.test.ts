import { describe, expect, it } from "vitest";
import type { MugenStateController } from "../mugen/model/MugenState";
import {
  applyRuntimeAfterImageController,
  applyRuntimeAfterImageTimeController,
  applyRuntimePaletteFxController,
  applyRuntimeSpritePriorityController,
  tickRuntimeAfterImage,
  tickRuntimePaletteFx,
} from "../mugen/runtime/SpriteEffectSystem";
import type { CharacterRuntimeState, RuntimeAfterImageSample } from "../mugen/runtime/types";

describe("SpriteEffectSystem", () => {
  it("applies bounded sprite priority from SprPriority controllers", () => {
    const state = runtimeState();

    applyRuntimeSpritePriorityController(state, controller("SprPriority", { value: "99" }));

    expect(state.spritePriority).toBe(10);
  });

  it("applies and ticks PalFX material telemetry", () => {
    const state = runtimeState();

    applyRuntimePaletteFxController(
      state,
      controller("PalFX", {
        time: "2",
        add: "80,-10,300",
        mul: "256,160,160",
        color: "999",
        invertall: "1",
      }),
    );

    expect(state.paletteFx).toMatchObject({
      remaining: 2,
      time: 2,
      add: [80, -10, 255],
      mul: [256, 160, 160],
      color: 256,
      invert: true,
    });
    tickRuntimePaletteFx(state);
    expect(state.paletteFx?.remaining).toBe(1);
    tickRuntimePaletteFx(state);
    expect(state.paletteFx).toBeUndefined();
  });

  it("clears PalFX when the controller time is zero", () => {
    const state = runtimeState();
    state.paletteFx = {
      remaining: 1,
      time: 1,
      add: [0, 0, 0],
      mul: [256, 256, 256],
      color: 256,
      invert: false,
    };

    applyRuntimePaletteFxController(state, controller("PalFX", { time: "0" }));

    expect(state.paletteFx).toBeUndefined();
  });

  it("applies AfterImage and captures bounded sprite samples", () => {
    const state = runtimeState();
    let serial = 0;

    applyRuntimeAfterImageController(
      state,
      controller("AfterImage", {
        time: "3",
        length: "2",
        timegap: "1",
        framegap: "1",
        paladd: "0,40,90",
        palmul: "160,160,256",
        trans: "add",
      }),
      () => sample(serial++),
    );

    expect(state.afterImage).toMatchObject({
      remaining: 3,
      time: 3,
      length: 2,
      timeGap: 1,
      frameGap: 1,
      palAdd: [0, 40, 90],
      palMul: [160, 160, 256],
      opacity: 0.34,
    });
    expect(state.afterImage?.samples.map((item) => item.spriteIndex)).toEqual([0]);

    tickRuntimeAfterImage(state, () => sample(serial++));
    expect(state.afterImage?.samples.map((item) => item.spriteIndex)).toEqual([1, 0]);

    tickRuntimeAfterImage(state, () => sample(serial++));
    expect(state.afterImage?.samples.map((item) => item.spriteIndex)).toEqual([2, 1]);

    tickRuntimeAfterImage(state, () => sample(serial++));
    expect(state.afterImage).toBeUndefined();
  });

  it("applies AfterImageTime as a default lightweight effect and can clear it", () => {
    const state = runtimeState();

    applyRuntimeAfterImageTimeController(state, controller("AfterImageTime", { value: "8" }));
    expect(state.afterImage).toMatchObject({
      remaining: 8,
      time: 8,
      length: 6,
      opacity: 0.42,
    });

    applyRuntimeAfterImageTimeController(state, controller("AfterImageTime", { value: "0" }));
    expect(state.afterImage).toBeUndefined();
  });
});

function runtimeState(): CharacterRuntimeState {
  return {
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
    facing: 1,
    stateNo: 0,
    animNo: 0,
    animTime: 0,
    frameIndex: 0,
    life: 1000,
    power: 0,
    ctrl: true,
    stateType: "S",
    moveType: "I",
    physics: "S",
    vars: [],
    fvars: [],
  };
}

function sample(spriteIndex: number): RuntimeAfterImageSample {
  return {
    age: 0,
    pos: { x: spriteIndex, y: 0 },
    facing: 1,
    spriteOwnerId: "p1",
    spriteOwnerDefinitionId: "fighter",
    spriteGroup: 10000,
    spriteIndex,
    offsetX: 0,
    offsetY: 0,
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

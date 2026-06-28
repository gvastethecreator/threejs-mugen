import { describe, expect, it } from "vitest";
import type { MugenStateController } from "../mugen/model/MugenState";
import {
  applyRuntimeAfterImageController,
  applyRuntimeAfterImageTimeController,
  applyRuntimeAngleController,
  applyRuntimePaletteFxController,
  applyRuntimeSpritePriorityController,
  applyRuntimeTransController,
  tickRuntimeAfterImage,
  tickRuntimePaletteFx,
} from "../mugen/runtime/SpriteEffectSystem";
import type { CharacterRuntimeState, RuntimeAfterImageSample } from "../mugen/runtime/types";

describe("SpriteEffectSystem", () => {
  it("applies bounded sprite priority from SprPriority controllers", () => {
    const state = runtimeState();

    applyRuntimeSpritePriorityController(state, controller("SprPriority", { value: "99" }));

    expect(state.spritePriority).toBe(10);

    applyRuntimeSpritePriorityController(state, controller("SprPriority", { value: "0" }), {
      kind: "sprite-effect",
      controllerType: "sprpriority",
      priority: -3,
    });

    expect(state.spritePriority).toBe(-3);
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

    applyRuntimePaletteFxController(state, controller("PalFX", { time: "1" }), {
      kind: "sprite-effect",
      controllerType: "palfx",
      time: 4,
      add: [10, 20, 30],
      mul: [256, 200, 180],
      color: 128,
      invert: true,
    });
    expect(state.paletteFx).toMatchObject({
      remaining: 4,
      time: 4,
      add: [10, 20, 30],
      mul: [256, 200, 180],
      color: 128,
      invert: true,
    });
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

  it("applies bounded Trans opacity from raw and typed params", () => {
    const state = runtimeState();

    applyRuntimeTransController(state, controller("Trans", { trans: "addalpha,128,128" }));
    expect(state.renderOpacity).toBe(0.5);

    applyRuntimeTransController(state, controller("Trans", { value: "add" }));
    expect(state.renderOpacity).toBe(0.78);

    applyRuntimeTransController(state, controller("Trans", { trans: "add" }), {
      kind: "sprite-effect",
      controllerType: "trans",
      trans: "sub",
      opacity: 0.65,
    });
    expect(state.renderOpacity).toBe(0.65);
  });

  it("applies bounded AngleSet, AngleAdd, and AngleDraw telemetry", () => {
    const state = runtimeState();

    applyRuntimeAngleController(state, controller("AngleSet", { value: "45" }));
    expect(state.angle).toBe(45);
    expect(state.renderAngle).toBeUndefined();

    applyRuntimeAngleController(state, controller("AngleAdd", { value: "10" }));
    expect(state.angle).toBe(55);

    applyRuntimeAngleController(state, controller("AngleDraw", {}));
    expect(state.renderAngle).toBe(55);

    applyRuntimeAngleController(state, controller("AngleSet", { value: "9999" }), {
      kind: "sprite-effect",
      controllerType: "angleset",
      angle: -30,
    });
    applyRuntimeAngleController(state, controller("AngleDraw", {}), {
      kind: "sprite-effect",
      controllerType: "angledraw",
    });
    expect(state.angle).toBe(-30);
    expect(state.renderAngle).toBe(-30);
  });

  it("applies typed AfterImage and AfterImageTime operations before raw params", () => {
    const state = runtimeState();

    applyRuntimeAfterImageController(
      state,
      controller("AfterImage", {
        time: "1",
        length: "1",
        paladd: "0,0,0",
      }),
      () => sample(7),
      {
        kind: "sprite-effect",
        controllerType: "afterimage",
        time: 20,
        length: 4,
        timeGap: 2,
        frameGap: 1,
        palAdd: [0, 40, 90],
        palMul: [160, 160, 256],
        opacity: 0.34,
      },
    );

    expect(state.afterImage).toMatchObject({
      remaining: 20,
      time: 20,
      length: 4,
      timeGap: 2,
      frameGap: 1,
      palAdd: [0, 40, 90],
      palMul: [160, 160, 256],
      opacity: 0.34,
    });

    applyRuntimeAfterImageTimeController(state, controller("AfterImageTime", { time: "0" }), {
      kind: "sprite-effect",
      controllerType: "afterimagetime",
      time: 11,
    });

    expect(state.afterImage).toMatchObject({
      remaining: 11,
      time: 20,
      length: 4,
    });
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

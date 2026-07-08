import { describe, expect, it } from "vitest";
import { compileControllerIr } from "../mugen/compiler/StateControllerCompiler";
import type { MugenStateController } from "../mugen/model/MugenState";
import {
  applyRuntimeAfterImageController,
  applyRuntimeAfterImageTimeController,
  applyRuntimeAngleController,
  applyRuntimePaletteFxController,
  applyRuntimeRemapPalController,
  applyRuntimeSpritePriorityController,
  applyRuntimeTransController,
  resolveRuntimeSpritePriorityControllerOperation,
  RuntimeSpriteEffectControllerWorld,
  RuntimeSpriteEffectWorld,
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

  it("resolves dynamic sprite priority from SprPriority controllers", () => {
    const state = runtimeState();
    const operation = resolveRuntimeSpritePriorityControllerOperation(controller("SprPriority", { value: "var(0)" }), (key) =>
      key === "value" ? 7 : undefined,
    );

    applyRuntimeSpritePriorityController(
      state,
      controller("SprPriority", { value: "var(0)" }),
      undefined,
      (key) => (key === "value" ? 7 : undefined),
    );

    expect(operation).toEqual({ kind: "sprite-effect", controllerType: "sprpriority", priority: 7 });
    expect(state.spritePriority).toBe(7);
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

  it("resolves dynamic PalFX material params from active expressions", () => {
    const state = runtimeState();

    applyRuntimePaletteFxController(
      state,
      controller("PalFX", {
        time: "var(0)",
        add: "var(1),-16,var(2)",
        mul: "var(3),var(4),256",
        color: "var(5)",
        invertall: "var(6)",
      }),
      undefined,
      {
        resolveNumber: (key) =>
          ({ time: 6, color: 200, invertall: 1, invert: undefined })[key],
        resolveTriplet: (key) => (key === "add" ? [64, -16, 300] : [224, 144, 256]),
      },
    );

    expect(state.paletteFx).toMatchObject({
      remaining: 6,
      time: 6,
      add: [64, -16, 255],
      mul: [224, 144, 256],
      color: 200,
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

  it("applies bounded RemapPal palette telemetry from raw and typed params", () => {
    const state = runtimeState();

    applyRuntimeRemapPalController(state, controller("RemapPal", { source: "-1,1.4", dest: "2,3" }));
    expect(state.paletteRemap).toEqual({ source: [0, 1], dest: [2, 3] });

    applyRuntimeRemapPalController(state, controller("RemapPal", { source: "1,1", dest: "1,2" }), {
      kind: "sprite-effect",
      controllerType: "remappal",
      source: [3, 4],
      dest: [5, 6],
    });
    expect(state.paletteRemap).toEqual({ source: [3, 4], dest: [5, 6] });
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

  it("resolves dynamic AfterImage params from active expressions", () => {
    const state = runtimeState();

    applyRuntimeAfterImageController(
      state,
      controller("AfterImage", {
        time: "var(0)",
        length: "var(1)",
        timegap: "var(2)",
        framegap: "var(3)",
        paladd: "var(4),40,var(5)",
        palmul: "var(6),160,var(7)",
        trans: "add",
      }),
      () => sample(0),
      undefined,
      {
        resolveNumber: (key) => ({ time: 18, length: 5, timegap: 2, framegap: 3 })[key],
        resolveTriplet: (key) => (key === "paladd" ? [-20, 40, 90] : [180, 160, 280]),
      },
    );

    expect(state.afterImage).toMatchObject({
      remaining: 18,
      time: 18,
      length: 5,
      timeGap: 2,
      frameGap: 3,
      palAdd: [-20, 40, 90],
      palMul: [180, 160, 280],
      opacity: 0.34,
    });
    expect(state.afterImage?.samples.map((item) => item.spriteIndex)).toEqual([0]);
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

  it("resolves dynamic AfterImageTime params from active expressions", () => {
    const state = runtimeState();

    applyRuntimeAfterImageTimeController(state, controller("AfterImageTime", { value: "var(0)" }), undefined, (key) =>
      key === "value" ? 14 : undefined,
    );

    expect(state.afterImage).toMatchObject({
      remaining: 14,
      time: 14,
      length: 6,
      opacity: 0.42,
    });

    applyRuntimeAfterImageTimeController(state, controller("AfterImageTime", { time: "var(1)" }), undefined, (key) =>
      key === "time" ? 3 : undefined,
    );

    expect(state.afterImage).toMatchObject({
      remaining: 3,
      time: 14,
    });
  });

  it("applies bounded Trans opacity from raw and typed params", () => {
    const state = runtimeState();

    applyRuntimeTransController(state, controller("Trans", { trans: "addalpha,128,128" }));
    expect(state.renderOpacity).toBe(0.5);

    applyRuntimeTransController(state, controller("Trans", { trans: "addalpha", alpha: "96,160" }));
    expect(state.renderOpacity).toBe(0.375);

    applyRuntimeTransController(state, controller("Trans", { trans: "addalpha", alpha: "var(0),var(1)" }), undefined, () => [
      64,
      192,
    ]);
    expect(state.renderOpacity).toBe(0.25);

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

    applyRuntimeAngleController(state, controller("AngleMul", { value: "2" }));
    expect(state.angle).toBe(110);

    applyRuntimeAngleController(state, controller("AngleDraw", {}));
    expect(state.renderAngle).toBe(110);
    expect(state.renderScale).toBeUndefined();

    applyRuntimeAngleController(state, controller("AngleDraw", { value: "-15", scale: "2,0.5" }));
    expect(state.renderAngle).toBe(-15);
    expect(state.renderScale).toEqual({ x: 2, y: 0.5 });

    applyRuntimeAngleController(state, controller("AngleSet", { value: "9999" }), {
      kind: "sprite-effect",
      controllerType: "angleset",
      angle: -30,
    });
    applyRuntimeAngleController(state, controller("AngleMul", { value: "9999" }), {
      kind: "sprite-effect",
      controllerType: "anglemul",
      multiplier: -0.5,
    });
    applyRuntimeAngleController(state, controller("AngleDraw", {}), {
      kind: "sprite-effect",
      controllerType: "angledraw",
      angle: 25,
      scale: [1.5, 0.75],
    });
    expect(state.angle).toBe(15);
    expect(state.renderAngle).toBe(25);
    expect(state.renderScale).toEqual({ x: 1.5, y: 0.75 });
  });

  it("resolves dynamic Angle params from active expressions", () => {
    const state = runtimeState();

    applyRuntimeAngleController(
      state,
      controller("AngleSet", { value: "var(0)" }),
      undefined,
      {
        resolveNumber: () => 40,
        resolvePair: () => undefined,
      },
    );
    applyRuntimeAngleController(
      state,
      controller("AngleAdd", { value: "var(1)" }),
      undefined,
      {
        resolveNumber: () => -10,
        resolvePair: () => undefined,
      },
    );
    applyRuntimeAngleController(
      state,
      controller("AngleDraw", { value: "var(2)", scale: "var(3),var(4)" }),
      undefined,
      {
        resolveNumber: () => 35,
        resolvePair: () => [2, 0.5],
      },
    );

    applyRuntimeAngleController(
      state,
      controller("AngleMul", { value: "fvar(0)" }),
      undefined,
      {
        resolveNumber: () => 2,
        resolvePair: () => undefined,
      },
    );

    expect(state.angle).toBe(60);
    expect(state.renderAngle).toBe(35);
    expect(state.renderScale).toEqual({ x: 2, y: 0.5 });
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

  it("wraps runtime sprite effect mutation and ticking behind RuntimeSpriteEffectWorld", () => {
    const world = new RuntimeSpriteEffectWorld();
    const state = runtimeState();
    let serial = 0;

    world.applySpritePriority(state, controller("SprPriority", { value: "1" }), {
      kind: "sprite-effect",
      controllerType: "sprpriority",
      priority: 4,
    });
    world.applyPaletteFx(state, controller("PalFX", { time: "2", add: "10,20,30" }));
    world.applyRemapPal(state, controller("RemapPal", { source: "1,0", dest: "2,4" }));
    world.applyAfterImage(
      state,
      controller("AfterImage", { time: "3", length: "2", timegap: "1", framegap: "1" }),
      () => sample(serial++),
    );
    world.applyTrans(state, controller("Trans", { trans: "addalpha,128,128" }));
    world.applyAngle(state, controller("AngleSet", { value: "35" }));
    world.applyAngle(state, controller("AngleMul", { value: "2" }));
    world.applyAngle(state, controller("AngleDraw", { scale: "2,0.5" }));

    expect(state.spritePriority).toBe(4);
    expect(state.paletteFx).toMatchObject({ remaining: 2, time: 2, add: [10, 20, 30] });
    expect(state.paletteRemap).toEqual({ source: [1, 0], dest: [2, 4] });
    expect(state.afterImage?.samples.map((item) => item.spriteIndex)).toEqual([0]);
    expect(state.renderOpacity).toBe(0.5);
    expect(state.renderAngle).toBe(70);
    expect(state.renderScale).toEqual({ x: 2, y: 0.5 });

    world.tick(state, () => sample(serial++));

    expect(state.paletteFx?.remaining).toBe(1);
    expect(state.afterImage).toMatchObject({ remaining: 2, time: 3 });
    expect(state.afterImage?.samples.map((item) => item.spriteIndex)).toEqual([1, 0]);
  });

  it("dispatches active-state sprite effect controllers with telemetry hooks", () => {
    const world = new RuntimeSpriteEffectControllerWorld();
    const actor = { runtime: runtimeState() };
    const ir = compileControllerIr(
      controller("PalFX", {
        time: "5",
        add: "10,20,30",
        mul: "256,200,180",
        color: "128",
      }),
    );
    const recordedControllers: string[] = [];
    const recordedOperations: string[] = [];

    const result = world.apply({
      actor,
      controller: ir,
      effect: "palfx",
      spriteEffectWorld: new RuntimeSpriteEffectWorld(),
      sampleFactory: () => undefined,
      recordController: (_actor, source) => recordedControllers.push(source.type),
      recordOperation: (_actor, operation) => recordedOperations.push(`${operation.kind}:${operation.controllerType}`),
    });

    expect(actor.runtime.paletteFx).toMatchObject({
      remaining: 5,
      time: 5,
      add: [10, 20, 30],
      mul: [256, 200, 180],
      color: 128,
    });
    expect(recordedControllers).toEqual(["PalFX"]);
    expect(recordedOperations).toEqual(["sprite-effect:palfx"]);
    expect(result).toEqual({ applied: true, recordedController: true, recordedOperation: true });
  });

  it("resolves dynamic PalFX through the active-state sprite boundary", () => {
    const world = new RuntimeSpriteEffectControllerWorld();
    const actor = { runtime: runtimeState() };
    const ir = compileControllerIr(
      controller("PalFX", {
        time: "var(0)",
        add: "var(1),-16,var(2)",
        mul: "var(3),var(4),256",
        color: "var(5)",
        invertall: "var(6)",
      }),
    );
    const recordedOperations: string[] = [];

    const result = world.apply({
      actor,
      controller: ir,
      effect: "palfx",
      spriteEffectWorld: new RuntimeSpriteEffectWorld(),
      sampleFactory: () => undefined,
      resolvePaletteFx: {
        resolveNumber: (key) =>
          ({ time: 6, color: 200, invertall: 1, invert: undefined })[key],
        resolveTriplet: (key) => (key === "add" ? [64, -16, 300] : [224, 144, 256]),
      },
      recordOperation: (_actor, operation) => recordedOperations.push(`${operation.kind}:${operation.controllerType}`),
    });

    expect(ir.operation).toBeUndefined();
    expect(actor.runtime.paletteFx).toMatchObject({
      remaining: 6,
      time: 6,
      add: [64, -16, 255],
      mul: [224, 144, 256],
      color: 200,
      invert: true,
    });
    expect(recordedOperations).toEqual([]);
    expect(result).toEqual({ applied: true, recordedController: false, recordedOperation: false });
  });

  it("dispatches Trans controllers through the active-state sprite boundary", () => {
    const world = new RuntimeSpriteEffectControllerWorld();
    const actor = { runtime: runtimeState() };
    const ir = compileControllerIr(controller("Trans", { trans: "addalpha,128,128" }));
    const recordedOperations: string[] = [];

    const result = world.apply({
      actor,
      controller: ir,
      effect: "trans",
      spriteEffectWorld: new RuntimeSpriteEffectWorld(),
      sampleFactory: () => undefined,
      recordOperation: (_actor, operation) => recordedOperations.push(`${operation.kind}:${operation.controllerType}`),
    });

    expect(actor.runtime.renderOpacity).toBe(0.5);
    expect(recordedOperations).toEqual(["sprite-effect:trans"]);
    expect(result).toEqual({ applied: true, recordedController: false, recordedOperation: true });
  });

  it("resolves dynamic Trans alpha through the active-state sprite boundary", () => {
    const world = new RuntimeSpriteEffectControllerWorld();
    const actor = { runtime: runtimeState() };
    const ir = compileControllerIr(controller("Trans", { trans: "addalpha", alpha: "var(0),var(1)" }));
    const recordedOperations: string[] = [];

    const result = world.apply({
      actor,
      controller: ir,
      effect: "trans",
      spriteEffectWorld: new RuntimeSpriteEffectWorld(),
      sampleFactory: () => undefined,
      resolveTransAlpha: () => [96, 160],
      recordOperation: (_actor, operation) => recordedOperations.push(`${operation.kind}:${operation.controllerType}`),
    });

    expect(ir.operation).toBeUndefined();
    expect(actor.runtime.renderOpacity).toBe(0.375);
    expect(recordedOperations).toEqual([]);
    expect(result).toEqual({ applied: true, recordedController: false, recordedOperation: false });
  });

  it("resolves dynamic AfterImage through the active-state sprite boundary", () => {
    const world = new RuntimeSpriteEffectControllerWorld();
    const actor = { runtime: runtimeState() };
    const ir = compileControllerIr(
      controller("AfterImage", {
        time: "var(0)",
        length: "var(1)",
        timegap: "var(2)",
        framegap: "var(3)",
        paladd: "var(4),40,var(5)",
        palmul: "var(6),160,var(7)",
        trans: "add",
      }),
    );
    const recordedOperations: string[] = [];

    const result = world.apply({
      actor,
      controller: ir,
      effect: "afterimage",
      spriteEffectWorld: new RuntimeSpriteEffectWorld(),
      sampleFactory: () => sample(7),
      resolveAfterImage: {
        resolveNumber: (key) => ({ time: 18, length: 5, timegap: 2, framegap: 3 })[key],
        resolveTriplet: (key) => (key === "paladd" ? [-20, 40, 90] : [180, 160, 280]),
      },
      recordOperation: (_actor, operation) => recordedOperations.push(`${operation.kind}:${operation.controllerType}`),
    });

    expect(ir.operation).toBeUndefined();
    expect(actor.runtime.afterImage).toMatchObject({
      remaining: 18,
      time: 18,
      length: 5,
      timeGap: 2,
      frameGap: 3,
      palAdd: [-20, 40, 90],
      palMul: [180, 160, 280],
    });
    expect(actor.runtime.afterImage?.samples.map((item) => item.spriteIndex)).toEqual([7]);
    expect(recordedOperations).toEqual([]);
    expect(result).toEqual({ applied: true, recordedController: false, recordedOperation: false });
  });

  it("resolves dynamic AfterImageTime through the active-state sprite boundary", () => {
    const world = new RuntimeSpriteEffectControllerWorld();
    const actor = { runtime: runtimeState() };
    const ir = compileControllerIr(controller("AfterImageTime", { value: "var(0)" }));
    const recordedOperations: string[] = [];

    const result = world.apply({
      actor,
      controller: ir,
      effect: "afterimagetime",
      spriteEffectWorld: new RuntimeSpriteEffectWorld(),
      sampleFactory: () => undefined,
      resolveAfterImageTime: (key) => (key === "value" ? 14 : undefined),
      recordOperation: (_actor, operation) => recordedOperations.push(`${operation.kind}:${operation.controllerType}`),
    });

    expect(ir.operation).toBeUndefined();
    expect(actor.runtime.afterImage).toMatchObject({
      remaining: 14,
      time: 14,
    });
    expect(recordedOperations).toEqual([]);
    expect(result).toEqual({ applied: true, recordedController: false, recordedOperation: false });
  });

  it("dispatches RemapPal controllers through the active-state sprite boundary", () => {
    const world = new RuntimeSpriteEffectControllerWorld();
    const actor = { runtime: runtimeState() };
    const ir = compileControllerIr(controller("RemapPal", { source: "1,0", dest: "2,4" }));
    const recordedOperations: string[] = [];

    const result = world.apply({
      actor,
      controller: ir,
      effect: "remappal",
      spriteEffectWorld: new RuntimeSpriteEffectWorld(),
      sampleFactory: () => undefined,
      recordOperation: (_actor, operation) => recordedOperations.push(`${operation.kind}:${operation.controllerType}`),
    });

    expect(actor.runtime.paletteRemap).toEqual({ source: [1, 0], dest: [2, 4] });
    expect(recordedOperations).toEqual(["sprite-effect:remappal"]);
    expect(result).toEqual({ applied: true, recordedController: false, recordedOperation: true });
  });

  it("resolves dynamic RemapPal pairs through the active-state sprite boundary", () => {
    const world = new RuntimeSpriteEffectControllerWorld();
    const actor = { runtime: runtimeState() };
    const ir = compileControllerIr(controller("RemapPal", { source: "1,var(0)", dest: "2,var(1)" }));
    const recordedOperations: string[] = [];

    const result = world.apply({
      actor,
      controller: ir,
      effect: "remappal",
      spriteEffectWorld: new RuntimeSpriteEffectWorld(),
      sampleFactory: () => undefined,
      resolveRemapPalPair: (key) => (key === "source" ? [1, 5] : [2, 7]),
      recordOperation: (_actor, operation) => recordedOperations.push(`${operation.kind}:${operation.controllerType}`),
    });

    expect(ir.operation).toBeUndefined();
    expect(actor.runtime.paletteRemap).toEqual({ source: [1, 5], dest: [2, 7] });
    expect(recordedOperations).toEqual([]);
    expect(result).toEqual({ applied: true, recordedController: false, recordedOperation: false });
  });

  it("resolves dynamic SprPriority through the active-state sprite boundary", () => {
    const world = new RuntimeSpriteEffectControllerWorld();
    const actor = { runtime: runtimeState() };
    const ir = compileControllerIr(controller("SprPriority", { value: "var(0)" }));
    const recordedOperations: string[] = [];

    const result = world.apply({
      actor,
      controller: ir,
      effect: "sprpriority",
      spriteEffectWorld: new RuntimeSpriteEffectWorld(),
      sampleFactory: () => undefined,
      resolveSpritePriority: (key) => (key === "value" ? 7 : undefined),
      recordOperation: (_actor, operation) => recordedOperations.push(`${operation.kind}:${operation.controllerType}`),
    });

    expect(ir.operation).toBeUndefined();
    expect(actor.runtime.spritePriority).toBe(7);
    expect(recordedOperations).toEqual(["sprite-effect:sprpriority"]);
    expect(result).toEqual({ applied: true, recordedController: false, recordedOperation: true });
  });

  it("dispatches AfterImage controllers through the active-state sprite boundary", () => {
    const world = new RuntimeSpriteEffectControllerWorld();
    const actor = { runtime: runtimeState() };
    const ir = compileControllerIr(controller("AfterImage", { time: "4", length: "2", timegap: "1", framegap: "1" }));
    const recordedOperations: string[] = [];

    world.apply({
      actor,
      controller: ir,
      effect: "afterimage",
      spriteEffectWorld: new RuntimeSpriteEffectWorld(),
      sampleFactory: () => sample(9),
      recordOperation: (_actor, operation) => recordedOperations.push(`${operation.kind}:${operation.controllerType}`),
    });

    expect(actor.runtime.afterImage).toMatchObject({
      remaining: 4,
      time: 4,
      length: 2,
    });
    expect(actor.runtime.afterImage?.samples.map((item) => item.spriteIndex)).toEqual([9]);
    expect(recordedOperations).toEqual(["sprite-effect:afterimage"]);
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

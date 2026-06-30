import { describe, expect, it } from "vitest";
import { compileControllerIr } from "../mugen/compiler/StateControllerCompiler";
import type { ControllerIr } from "../mugen/compiler/RuntimeIr";
import type { MugenAnimationAction, MugenAnimationFrame } from "../mugen/model/MugenAnimation";
import type { MugenStateController } from "../mugen/model/MugenState";
import { RuntimeAnimationControllerWorld } from "../mugen/runtime/AnimationControllerSystem";
import { executeControllerIr } from "../mugen/runtime/StateControllerExecutor";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("RuntimeAnimationControllerWorld", () => {
  it("applies ChangeAnim with expression params and self animation source", () => {
    const world = new RuntimeAnimationControllerWorld();
    const state = runtimeState({ frameIndex: 3, animTime: 18, stateType: "S" });

    const result = world.applyController(state, source("ChangeAnim", { value: "Const(anim.base) + (statetype = S)" }), {
      getConst: (name) => (name === "anim.base" ? 120 : undefined),
    });

    expect(result).toMatchObject({ applied: true, controllerType: "changeanim", animationSource: "self", animNo: 121 });
    expect(state.animNo).toBe(121);
    expect(state.animationSource).toBe("self");
    expect(state.frameIndex).toBe(0);
    expect(state.animTime).toBe(0);
  });

  it("applies ChangeAnim2 as state-owner and seeds elem/elemtime against known AIR frames", () => {
    const world = new RuntimeAnimationControllerWorld();
    const state = runtimeState({ frameIndex: 0, animTime: 0 });
    const action = animation(930, [5, 5, 5]);

    const result = world.applyController(
      state,
      source("ChangeAnim2", { value: "930", elem: "3", elemtime: "1" }),
      { getAnimation: (animNo, sourceName) => (animNo === 930 && sourceName === "state-owner" ? action : undefined) },
    );

    expect(result).toMatchObject({ applied: true, controllerType: "changeanim2", animationSource: "state-owner", animNo: 930 });
    expect(state.animNo).toBe(930);
    expect(state.animationSource).toBe("state-owner");
    expect(state.frameIndex).toBe(2);
    expect(state.animTime).toBe(11);
  });

  it("clamps elem/elemtime when AIR data is available and keeps a bounded fallback without it", () => {
    const world = new RuntimeAnimationControllerWorld();
    const clamped = runtimeState();

    world.applyController(clamped, source("ChangeAnim", { value: "930", elem: "9", elemtime: "20" }), {
      getAnimation: () => animation(930, [4, 2, 6]),
    });
    expect(clamped.frameIndex).toBe(2);
    expect(clamped.animTime).toBe(11);

    const fallback = runtimeState();
    world.applyController(fallback, source("ChangeAnim", { value: "930", elem: "9", elemtime: "20" }));
    expect(fallback.frameIndex).toBe(8);
    expect(fallback.animTime).toBe(20);
  });

  it("keeps missing value controllers as a no-op", () => {
    const world = new RuntimeAnimationControllerWorld();
    const state = runtimeState({ animNo: 100, frameIndex: 2, animTime: 8 });

    const result = world.applyController(state, source("ChangeAnim", { elem: "2" }));

    expect(result).toMatchObject({ applied: false, controllerType: "changeanim" });
    expect(state.animNo).toBe(100);
    expect(state.frameIndex).toBe(2);
    expect(state.animTime).toBe(8);
  });

  it("keeps StateControllerExecutor as router for animation controllers", () => {
    const state = runtimeState({ animNo: 100, frameIndex: 1, animTime: 4 });
    const next = executeControllerIr(
      compileControllerIr(controller("ChangeAnim2", { value: "930", elem: "2", elemtime: "1" })),
      state,
      () => undefined,
      { getAnimation: () => animation(930, [3, 7]) },
    );

    expect(state.animNo).toBe(100);
    expect(next.animNo).toBe(930);
    expect(next.animationSource).toBe("state-owner");
    expect(next.frameIndex).toBe(1);
    expect(next.animTime).toBe(4);
  });
});

function source(type: string, params: Record<string, string>): Pick<ControllerIr, "params" | "type" | "normalizedType"> {
  return {
    type,
    normalizedType: type.toLowerCase(),
    params,
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

function animation(id: number, durations: number[]): MugenAnimationAction {
  return {
    id,
    rawLines: [],
    frames: durations.map((duration, index) => frame(id, index, duration)),
  };
}

function frame(group: number, index: number, duration: number): MugenAnimationFrame {
  return {
    spriteGroup: group,
    spriteIndex: index,
    offsetX: 0,
    offsetY: 0,
    duration,
    clsn1: [],
    clsn2: [],
    raw: "",
    line: index + 1,
  };
}

function runtimeState(overrides: Partial<CharacterRuntimeState> = {}): CharacterRuntimeState {
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
    ...overrides,
  };
}

import { describe, expect, it } from "vitest";
import { compileRuntimeProgram } from "../mugen/compiler/StateControllerCompiler";
import type { ControllerIr } from "../mugen/compiler/RuntimeIr";
import { parseCns } from "../mugen/parsers/CnsParser";
import { RuntimeAssertSpecialWorld } from "../mugen/runtime/RuntimeAssertSpecialSystem";
import {
  RuntimeMatchPreFacingAssertSpecialWorld,
  type RuntimeMatchPreFacingAssertSpecialActor,
} from "../mugen/runtime/RuntimeMatchPreFacingAssertSpecialSystem";
import type {
  RuntimeControllerDispatchActor,
  RuntimeControllerDispatchHooks,
  RuntimeControllerDispatchResult,
  RuntimeControllerDispatchWorld,
} from "../mugen/runtime/RuntimeControllerDispatchSystem";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("RuntimeMatchPreFacingAssertSpecialWorld", () => {
  it("routes imported pre-facing AssertSpecial through trigger and dispatch context hooks", () => {
    const stageBounds = { left: -160, right: 160 };
    const actor = actorWithProgram(
      "imported",
      `
[Statedef 0]
type = S
movetype = I
physics = S
anim = 0

[State 0, Pre Facing Flags]
type = AssertSpecial
trigger1 = Time = 9
flag = NoAutoTurn
      `,
      { "velocity.walk.fwd.x": 3 },
      { hitPause: 5 },
    );
    const opponent = actorWithProgram("demo", "");
    const gateCalls: unknown[] = [];
    const dispatchContext = {
      controllerType: "",
      constValue: undefined as number | undefined,
      hitPause: undefined as number | undefined,
      random: undefined as number | undefined,
      stageBounds: undefined as typeof stageBounds | undefined,
      stageTime: undefined as number | undefined,
    };
    const controllerDispatchWorld: Pick<RuntimeControllerDispatchWorld, "apply"> = {
      apply<TActor extends RuntimeControllerDispatchActor>(
        target: TActor,
        controller: ControllerIr,
        hooks: RuntimeControllerDispatchHooks<TActor> = {},
      ): RuntimeControllerDispatchResult {
        dispatchContext.controllerType = controller.type;
        dispatchContext.constValue = hooks.context?.getConst?.("velocity.walk.fwd.x");
        dispatchContext.hitPause = hooks.context?.hitPauseTime?.();
        dispatchContext.random = hooks.context?.random?.();
        dispatchContext.stageBounds = hooks.context?.stageBounds;
        dispatchContext.stageTime = hooks.context?.stageTime;
        target.runtime.ctrl = false;
        return { unsupported: [], recordedController: false, recordedOperation: false };
      },
    };

    const result = new RuntimeMatchPreFacingAssertSpecialWorld().apply({
      actor,
      opponent,
      tick: 9,
      stageBounds,
      assertSpecialWorld: new RuntimeAssertSpecialWorld(),
      controllerDispatchWorld,
      triggersPass: (controller, target, targetOpponent, owner, tick, bounds) => {
        gateCalls.push({
          type: controller.type,
          actor: target.definition.source,
          opponent: targetOpponent.definition.source,
          owner: owner.definition.source,
          tick,
          bounds,
        });
        return true;
      },
      getConst: (owner, name) => owner.definition.constants?.[name],
      nextRandom: () => 777,
    });

    expect(result).toEqual({ applied: 1, skipped: false });
    expect(gateCalls).toEqual([
      {
        type: "AssertSpecial",
        actor: "imported",
        opponent: "demo",
        owner: "imported",
        tick: 9,
        bounds: stageBounds,
      },
    ]);
    expect(dispatchContext).toEqual({
      controllerType: "AssertSpecial",
      constValue: 3,
      hitPause: 5,
      random: 777,
      stageBounds,
      stageTime: 9,
    });
    expect(actor.runtime.ctrl).toBe(false);
  });
});

function actorWithProgram(
  source: string,
  cns: string,
  constants: Record<string, number> = {},
  options: { hitPause?: number; runtime?: Partial<CharacterRuntimeState> } = {},
): RuntimeMatchPreFacingAssertSpecialActor & { definition: { source: string; constants: Record<string, number> } } {
  const parsed = cns.trim() ? parseCns(cns) : { states: [], controllers: [] };
  return {
    definition: { source, constants },
    hitPause: options.hitPause ?? 0,
    runtime: runtime(options.runtime),
    runtimeProgram: compileRuntimeProgram({
      commands: [],
      states: parsed.states,
      stateEntryControllers: parsed.controllers,
      animations: new Map(),
    }),
  };
}

function runtime(overrides: Partial<CharacterRuntimeState> = {}): CharacterRuntimeState {
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

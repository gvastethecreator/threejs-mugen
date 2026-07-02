import { describe, expect, it } from "vitest";
import { compileControllerIr } from "../mugen/compiler/StateControllerCompiler";
import type { TriggerIr } from "../mugen/compiler/RuntimeIr";
import type { MugenStateController } from "../mugen/model/MugenState";
import { RuntimeTriggerEvaluationWorld } from "../mugen/runtime/RuntimeTriggerEvaluationSystem";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("RuntimeTriggerEvaluationWorld", () => {
  it("evaluates one trigger through the supplied runtime expression context", () => {
    const world = new RuntimeTriggerEvaluationWorld();
    const trigger = compiledTrigger('Time >= 7 && command = "fire" && InGuardDist && NumEnemy = 2');
    const actor = actorRef("p1");
    const opponent = actorRef("p2");
    const extraOpponent = actorRef("p3");
    const owner = actorRef("owner");
    const forwarded: unknown[] = [];

    const result = world.evaluate({
      trigger,
      actor,
      opponent,
      opponents: [opponent, extraOpponent],
      owner,
      tick: 33,
      createContext: (input) => {
        forwarded.push(input);
        return {
          self: runtimeState({ animTime: 7 }),
          opponent: runtimeState(),
          stateTime: 7,
          commandActive: (name) => name === "fire",
          inGuardDist: () => true,
          numEnemy: () => input.opponents?.length ?? 0,
        };
      },
    });

    expect(result.passed).toBe(true);
    expect(Boolean(result.value)).toBe(true);
    expect(forwarded).toEqual([{ trigger, actor, opponent, opponents: [opponent, extraOpponent], owner, tick: 33 }]);
  });

  it("fails when the evaluated trigger result is zero", () => {
    const world = new RuntimeTriggerEvaluationWorld();
    const result = world.evaluate({
      trigger: compiledTrigger("Time < 3"),
      actor: actorRef("p1"),
      opponent: actorRef("p2"),
      owner: actorRef("p1"),
      createContext: () => ({
        self: runtimeState({ animTime: 7 }),
        stateTime: 7,
      }),
    });

    expect(result).toEqual({
      passed: false,
      value: 0,
    });
  });

  it("uses compiled normalized expressions instead of raw source text", () => {
    const world = new RuntimeTriggerEvaluationWorld();
    const trigger = {
      ...compiledTrigger("0"),
      expression: {
        ...compiledTrigger("0").expression,
        raw: "0",
        normalized: "1",
      },
    } satisfies TriggerIr;

    expect(
      world.passes({
        trigger,
        actor: actorRef("p1"),
        opponent: actorRef("p2"),
        owner: actorRef("p1"),
        createContext: () => ({ self: runtimeState() }),
      }),
    ).toBe(true);
  });
});

type TriggerEvaluationTestActor = { id: string };

function actorRef(id: string): TriggerEvaluationTestActor {
  return { id };
}

function compiledTrigger(expression: string): TriggerIr {
  return compileControllerIr(controller("Null", expression)).triggers[0]!;
}

function controller(type: string, triggerExpression: string): MugenStateController {
  return {
    stateId: 200,
    type,
    params: {},
    triggers: [{ index: 1, expression: triggerExpression, raw: `trigger1 = ${triggerExpression}`, line: 1 }],
    line: 1,
    rawHeader: `[State 200, ${type}]`,
  };
}

function runtimeState(overrides: Partial<CharacterRuntimeState> = {}): CharacterRuntimeState {
  return {
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
    facing: 1,
    stateNo: 200,
    animNo: 200,
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

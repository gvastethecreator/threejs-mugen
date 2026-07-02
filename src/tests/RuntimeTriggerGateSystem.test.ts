import { describe, expect, it } from "vitest";
import type { ControllerIr, TriggerIr } from "../mugen/compiler/RuntimeIr";
import { RuntimeTriggerGateWorld } from "../mugen/runtime/RuntimeTriggerGateSystem";

describe("RuntimeTriggerGateWorld", () => {
  it("requires triggerall and then accepts the first passing numbered trigger group", () => {
    const world = new RuntimeTriggerGateWorld();
    const controller = controllerWithTriggers([
      trigger(0, "ctrl"),
      trigger(1, "command = a"),
      trigger(1, "time > 2"),
      trigger(2, "command = b"),
    ]);
    const calls: string[] = [];

    const result = world.evaluate({
      controller,
      actor: actor("p1"),
      opponent: actor("p2"),
      owner: actor("owner"),
      tick: 9,
      evaluateTrigger: (triggerInput, actorInput, opponentInput, ownerInput, tick) => {
        calls.push(`${triggerInput.index}:${triggerInput.expression.raw}:${actorInput.id}:${opponentInput.id}:${ownerInput.id}:${tick}`);
        return triggerInput.expression.raw !== "time > 2";
      },
    });

    expect(result).toEqual({
      passed: true,
      evaluatedTriggers: 4,
      evaluatedGroups: 2,
      matchedGroup: 2,
    });
    expect(calls).toEqual([
      "0:ctrl:p1:p2:owner:9",
      "1:command = a:p1:p2:owner:9",
      "1:time > 2:p1:p2:owner:9",
      "2:command = b:p1:p2:owner:9",
    ]);
  });

  it("fails before numbered groups when triggerall fails", () => {
    const world = new RuntimeTriggerGateWorld();
    const controller = controllerWithTriggers([trigger(0, "alive"), trigger(1, "command = x")]);
    const calls: string[] = [];

    const result = world.evaluate({
      controller,
      actor: actor("p1"),
      opponent: actor("p2"),
      owner: actor("p1"),
      evaluateTrigger: (triggerInput) => {
        calls.push(`${triggerInput.index}:${triggerInput.expression.raw}`);
        return false;
      },
    });

    expect(result).toEqual({
      passed: false,
      evaluatedTriggers: 1,
      evaluatedGroups: 0,
      failedTriggerAll: true,
    });
    expect(calls).toEqual(["0:alive"]);
  });

  it("passes when triggerall passes and no numbered groups exist", () => {
    const world = new RuntimeTriggerGateWorld();
    const result = world.evaluate({
      controller: controllerWithTriggers([trigger(0, "ctrl"), trigger(0, "time >= 0")]),
      actor: actor("p1"),
      opponent: actor("p2"),
      owner: actor("p1"),
      evaluateTrigger: () => true,
    });

    expect(result).toEqual({
      passed: true,
      evaluatedTriggers: 2,
      evaluatedGroups: 0,
    });
  });

  it("fails when all numbered groups fail", () => {
    const world = new RuntimeTriggerGateWorld();
    const result = world.evaluate({
      controller: controllerWithTriggers([trigger(1, "command = a"), trigger(2, "command = b")]),
      actor: actor("p1"),
      opponent: actor("p2"),
      owner: actor("p1"),
      evaluateTrigger: () => false,
    });

    expect(result).toEqual({
      passed: false,
      evaluatedTriggers: 2,
      evaluatedGroups: 2,
      failedTriggerAll: false,
    });
  });
});

type TriggerGateTestActor = { id: string };

function actor(id: string): TriggerGateTestActor {
  return { id };
}

function controllerWithTriggers(triggers: TriggerIr[]): ControllerIr {
  return {
    source: {
      stateId: 200,
      type: "ChangeState",
      triggers: triggers.map((triggerInput) => triggerInput.source),
      params: {},
      line: 1,
      rawHeader: "[State 200, ChangeState]",
    },
    stateId: 200,
    type: "ChangeState",
    normalizedType: "changestate",
    supportLevel: "partial",
    triggers,
    params: {},
    line: 1,
    unsupportedFeatures: [],
  };
}

function trigger(index: number, expression: string): TriggerIr {
  return {
    source: {
      index,
      expression,
      raw: `trigger${index} = ${expression}`,
      line: index + 1,
    },
    index,
    expression: {
      raw: expression,
      normalized: expression,
      identifiers: [],
      functions: [],
      unsupportedFeatures: [],
      supportLevel: "partial",
    },
    line: index + 1,
  };
}

import { describe, expect, it } from "vitest";
import { RuntimeDispatchEvaluationWorld } from "../mugen/runtime/RuntimeDispatchEvaluationSystem";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("RuntimeDispatchEvaluationWorld", () => {
  it("returns compiled numeric values without building an expression context", () => {
    const world = new RuntimeDispatchEvaluationWorld();

    expect(
      world.resolveNumber({
        value: 220,
        expression: "999",
        actor: actorRef("p1"),
        opponent: actorRef("p2"),
        owner: actorRef("p1"),
        createContext: () => {
          throw new Error("context should not be created for compiled values");
        },
      }),
    ).toBe(220);
  });

  it("evaluates dynamic numeric fallback with actor/opponent/owner/tick context", () => {
    const world = new RuntimeDispatchEvaluationWorld();
    const actor = actorRef("p1");
    const opponent = actorRef("p2");
    const extraOpponent = actorRef("p3");
    const owner = actorRef("owner");
    const forwarded: unknown[] = [];

    const result = world.resolveNumber({
      expression: "Time + StageTime + Random / 1000 + NumEnemy",
      actor,
      opponent,
      opponents: [opponent, extraOpponent],
      owner,
      tick: 11,
      createContext: (input) => {
        forwarded.push(input);
        return {
          self: runtimeState({ animTime: 5 }),
          opponent: runtimeState(),
          stateTime: 5,
          stageTime: input.tick,
          random: () => 0.9,
          numEnemy: () => input.opponents?.length ?? 0,
        };
      },
    });

    expect(result).toBe(18);
    expect(forwarded).toEqual([
      { expression: "Time + StageTime + Random / 1000 + NumEnemy", actor, opponent, opponents: [opponent, extraOpponent], owner, tick: 11 },
    ]);
  });

  it("resolves dynamic booleans through numeric expression truthiness", () => {
    const world = new RuntimeDispatchEvaluationWorld();

    expect(
      world.resolveBoolean({
        expression: "Ctrl",
        actor: actorRef("p1"),
        opponent: actorRef("p2"),
        owner: actorRef("p1"),
        createContext: () => ({ self: runtimeState({ ctrl: true }) }),
      }),
    ).toBe(true);
    expect(
      world.resolveBoolean({
        expression: "0",
        actor: actorRef("p1"),
        opponent: actorRef("p2"),
        owner: actorRef("p1"),
        createContext: () => ({ self: runtimeState() }),
      }),
    ).toBe(false);
  });

  it("returns undefined for missing or non-numeric fallback expressions", () => {
    const world = new RuntimeDispatchEvaluationWorld();

    expect(
      world.resolveNumber({
        actor: actorRef("p1"),
        opponent: actorRef("p2"),
        owner: actorRef("p1"),
        createContext: () => ({ self: runtimeState() }),
      }),
    ).toBeUndefined();
    expect(
      world.resolveNumber({
        expression: '"not numeric"',
        actor: actorRef("p1"),
        opponent: actorRef("p2"),
        owner: actorRef("p1"),
        createContext: () => ({ self: runtimeState() }),
      }),
    ).toBeUndefined();
  });
});

type DispatchEvaluationTestActor = { id: string };

function actorRef(id: string): DispatchEvaluationTestActor {
  return { id };
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
    ctrl: false,
    stateType: "S",
    moveType: "I",
    physics: "S",
    vars: [],
    fvars: [],
    ...overrides,
  };
}

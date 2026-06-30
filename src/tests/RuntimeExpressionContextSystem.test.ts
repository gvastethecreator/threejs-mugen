import { describe, expect, it } from "vitest";
import { compileControllerIr } from "../mugen/compiler/StateControllerCompiler";
import type { MugenStateController } from "../mugen/model/MugenState";
import { RuntimeContactMemoryWorld, type RuntimeContactMemory } from "../mugen/runtime/ContactMemorySystem";
import {
  RuntimeExpressionContextWorld,
  type RuntimeExpressionContextActor,
  runtimeActorHasState,
  runtimeDefinitionConst,
  runtimeHitVar,
} from "../mugen/runtime/RuntimeExpressionContextSystem";
import { RuntimeTargetWorld } from "../mugen/runtime/TargetSystem";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("RuntimeExpressionContextWorld", () => {
  it("builds one runtime expression context for CNS numeric reads", () => {
    const world = new RuntimeExpressionContextWorld();
    const actor = runtimeActor("p1", "Author", {
      stateNo: 200,
      animNo: 200,
      life: 920,
      hitFall: { falling: true, damage: 17, velocity: { y: -6 } },
    });
    const opponent = runtimeActor("p2", "Rival", { life: 875 });
    actor.targets = [{ actorId: "p2", targetId: 77, age: 0 }];

    const result = world.evaluateNumber(
      [
        "Const(data.attack)",
        "Random",
        "AnimTime",
        "AnimElemTime(2)",
        "NumTarget(77)",
        "NumExplod(9)",
        "NumHelper(42)",
        "NumProj(77)",
        "MoveHit",
        "HitCount",
        "UniqHitCount",
        "ProjHitTime(77)",
        "ReceivedDamage",
        "ReceivedHits",
        "GetHitVar(fall.damage)",
      ].join(" + "),
      {
        actor,
        opponent,
        random: () => 0.321,
        animTimeRemaining: 5,
        animElemTime: (elementNumber) => (elementNumber === 2 ? 4 : undefined),
      },
    );

    expect(result).toBe(629);
  });

  it("owns target redirect reads used by trigger and expression evaluation", () => {
    const world = new RuntimeExpressionContextWorld();
    const actor = runtimeActor("p1", "Author");
    const opponent = runtimeActor("p2", "Rival", { life: 875 });
    actor.targets = [{ actorId: "p2", targetId: 77, age: 0 }];

    expect(world.evaluateNumber("Target(77), Life", { actor, opponent })).toBe(875);
    expect(world.evaluateNumber("Target(99), Life", { actor, opponent })).toBe(0);
    expect(world.resolveTargetRedirect(actor, opponent, 77)).toMatchObject({
      self: opponent.runtime,
      opponent: actor.runtime,
      name: "p2",
      opponentName: "p1",
    });
  });

  it("evaluates compiled triggers through the same runtime read model", () => {
    const world = new RuntimeExpressionContextWorld();
    const actor = runtimeActor("p1", "Author", { stateNo: 200, animNo: 200 });
    const opponent = runtimeActor("p2", "Rival");

    const trigger = compiledTrigger('command = "fire" && ProjHit(77) && InGuardDist');

    expect(
      world.evaluateTrigger(trigger, {
        actor,
        opponent,
        inGuardDist: () => true,
      }),
    ).toBe(true);
  });

  it("exposes shared const, state, and HitVar helpers", () => {
    const actor = runtimeActor("p1", "Author", {
      hitVars: { animType: 2, isBound: true },
      hitFall: { falling: true, damage: 31, defenceUp: 80, velocity: { x: -2, y: -8 } },
    });

    expect(runtimeDefinitionConst(actor.definition, " DATA.ATTACK ")).toBe(200);
    expect(runtimeActorHasState(actor, 555)).toBe(true);
    expect(runtimeActorHasState(actor, 777)).toBe(false);
    expect(runtimeActorHasState({ ...actor, runtimeProgram: undefined }, 777)).toBe(true);
    expect(runtimeHitVar(actor.runtime, "animtype")).toBe(2);
    expect(runtimeHitVar(actor.runtime, "isbound")).toBe(1);
    expect(runtimeHitVar(actor.runtime, "fall.damage")).toBe(31);
    expect(runtimeHitVar(actor.runtime, "fall.defence_up")).toBe(80);
    expect(runtimeHitVar(actor.runtime, "fall.xvel")).toBe(-2);
  });
});

function runtimeActor(
  id: string,
  authorName: string,
  runtimeOverrides: Partial<CharacterRuntimeState> = {},
): RuntimeExpressionContextActor {
  const runtime = runtimeState(runtimeOverrides);
  const contactWorld = new RuntimeContactMemoryWorld();
  return {
    id,
    definition: {
      displayName: id,
      authorName,
      constants: { "data.attack": 200 },
      commands: [],
      animations: new Map<number, unknown>([[200, {}]]),
      states: [{ id: 777 }],
    },
    runtimeProgram: { states: [{ id: 555 }] },
    commandBuffer: {
      isCommandActive: (name) => name === "fire",
    },
    currentMove: { attr: "S,NA" },
    stateElapsed: 9,
    hitPause: 0,
    hitStun: 0,
    runtime,
    targets: [],
    targetBindings: [],
    contactWorld,
    contact: contactMemory(),
    targetWorld: new RuntimeTargetWorld(),
    effectActorWorld: {
      countActors: (_ownerId, kind, actorId) => {
        if (kind === "explod" && actorId === 9) return 2;
        if (kind === "helper" && actorId === 42) return 3;
        if (kind === "projectile" && actorId === 77) return 4;
        return 0;
      },
    },
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
    moveType: "A",
    physics: "S",
    vars: [],
    fvars: [],
    ...overrides,
  };
}

function contactMemory(): RuntimeContactMemory {
  return {
    moveContactState: 200,
    moveContactTime: 7,
    moveHitState: 200,
    moveHitTime: 7,
    moveHitCount: 5,
    moveUniqueHitCount: 3,
    moveReversedState: 200,
    moveReversedTime: 6,
    receivedDamageState: 200,
    receivedDamageAmount: 44,
    receivedHitsState: 200,
    receivedHitsCount: 2,
    projectileContactState: 200,
    projectileHitState: 200,
    projectileId: 77,
    projectileContactTime: 11,
    projectileHitTime: 11,
  };
}

function compiledTrigger(expression: string) {
  return compileControllerIr(controller("Null", {}, expression)).triggers[0]!;
}

function controller(type: string, params: Record<string, string>, triggerExpression: string): MugenStateController {
  return {
    stateId: 200,
    type,
    params,
    triggers: [{ index: 1, expression: triggerExpression, raw: `trigger1 = ${triggerExpression}`, line: 1 }],
    line: 1,
    rawHeader: `[State 200, ${type}]`,
  };
}

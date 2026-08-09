import { describe, expect, it } from "vitest";
import { RuntimeContactMemoryWorld, type RuntimeContactMemory } from "../mugen/runtime/ContactMemorySystem";
import { evaluateExpression } from "../mugen/runtime/ExpressionEvaluator";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
import { RuntimeActiveExpressionContextWorld } from "../mugen/runtime/RuntimeActiveExpressionContextSystem";
import type { RuntimeExpressionContextActor } from "../mugen/runtime/RuntimeExpressionContextSystem";
import { RuntimeTargetWorld } from "../mugen/runtime/TargetSystem";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("RuntimeActiveExpressionContextWorld", () => {
  it("creates shared active expression contexts for dynamic controller and trigger evaluation", () => {
    const world = new RuntimeActiveExpressionContextWorld();
    const actor = runtimeActor("p1", { animTime: 9 });
    const opponent = runtimeActor("p2");
    actor.playerId = 56;
    opponent.playerId = 58;
    const owner = runtimeActor("owner");
    owner.definition.constants = { "data.attack": 300 };
    const randomActors: string[] = [];
    const elemReads: Array<{ actorId: string; elementNumber: number }> = [];
    const guardReads: Array<{ actorId: string; opponentId: string }> = [];

    const createContext = world.createFactory({
      stageBounds: { left: -160, right: 160 },
      gameSpace: { width: 640, height: 480, zoom: 2 },
      nextRandom: (source) => {
        randomActors.push(source.id);
        return 0.456;
      },
      animTimeRemaining: (source) => source.runtime.animTime + 5,
      animElemTime: (source, elementNumber) => {
        elemReads.push({ actorId: source.id, elementNumber });
        return elementNumber + 2;
      },
      inGuardDist: (source, target) => {
        guardReads.push({ actorId: source.id, opponentId: target.id });
        return true;
      },
    });

    const context = createContext({
      actor,
      opponent,
      opponents: [opponent],
      owner,
      tick: 77,
    });

    expect(context.stageBounds).toEqual({ left: -160, right: 160 });
    expect(context.gameSpace).toEqual({ width: 640, height: 480, zoom: 2 });
    expect(context.stageTime).toBe(77);
    expect(context.getConst?.("data.attack")).toBe(300);
    expect(context.random?.()).toBe(0.456);
    expect(context.animTimeRemaining).toBe(14);
    expect(context.animElemTime?.(3)).toBe(5);
    expect(context.inGuardDist?.()).toBe(true);
    expect(context.numEnemy?.()).toBe(1);
    expect(evaluateExpression("PlayerID(58), Life", context)).toBe(1000);
    actor.runtime.vars = [58];
    expect(evaluateExpression("PlayerID(var(0)), Life", context)).toBe(1000);
    expect(randomActors).toEqual(["p1"]);
    expect(elemReads).toEqual([{ actorId: "p1", elementNumber: 3 }]);
    expect(guardReads).toEqual([{ actorId: "p1", opponentId: "p2" }]);
  });

  it("projects AnimLength from the live actor action into active contexts", () => {
    const world = new RuntimeActiveExpressionContextWorld();
    const actor = runtimeActor("p1");
    const opponent = runtimeActor("p2");
    actor.currentAction = {
      id: 400,
      rawLines: [],
      frames: [
        { ...emptyAnimationFrame(1), duration: 3 },
        { ...emptyAnimationFrame(2), duration: 5 },
      ],
    } satisfies MugenAnimationAction;

    const context = world.create({
      actor,
      opponent,
      owner: actor,
      nextRandom: () => 0,
      animTimeRemaining: () => 0,
      animElemTime: () => undefined,
      inGuardDist: () => false,
    });

    expect(context.animLength).toBe(8);
    expect(evaluateExpression("AnimLength = 8", context)).toBe(1);
  });

  it("projects the live animation owner into active contexts", () => {
    const world = new RuntimeActiveExpressionContextWorld();
    const actor = runtimeActor("p1");
    const opponent = runtimeActor("p2");
    actor.playerNo = 1;
    actor.animationOwnerPlayerNo = 2;

    const context = world.create({
      actor,
      opponent,
      owner: actor,
      nextRandom: () => 0,
      animTimeRemaining: () => 0,
      animElemTime: () => undefined,
      inGuardDist: () => false,
    });

    expect(context.animPlayerNo).toBe(2);
    expect(evaluateExpression("AnimPlayerNo = 2", context)).toBe(1);
  });

  it("projects current-frame ClsnVar reads into active contexts", () => {
    const world = new RuntimeActiveExpressionContextWorld();
    const actor = runtimeActor("p1");
    const opponent = runtimeActor("p2");
    actor.currentAction = {
      id: 400,
      rawLines: [],
      frames: [{ ...emptyAnimationFrame(1), clsn1: [{ x1: -14, y1: -72, x2: 26, y2: 4 }] }],
    } satisfies MugenAnimationAction;

    const context = world.create({
      actor,
      opponent,
      owner: actor,
      nextRandom: () => 0,
      animTimeRemaining: () => 0,
      animElemTime: () => undefined,
      inGuardDist: () => false,
    });

    expect(evaluateExpression("ClsnVar(Clsn1, 0, Back) = -14", context)).toBe(1);
    expect(evaluateExpression("ClsnVar(Clsn1, 0, Bottom) = 4", context)).toBe(1);
  });

  it("propagates an explicit IKEMEN root selection while legacy factories stay unselected", () => {
    const world = new RuntimeActiveExpressionContextWorld();
    const actor = runtimeActor("p1", { pos: { x: 0, y: 0 }, facing: 1 });
    const behind = runtimeActor("p2", { pos: { x: -5, y: 0 } });
    const front = runtimeActor("p4", { pos: { x: 34, y: 0 } });
    const partner = runtimeActor("p3");
    const baseFactory = {
      stageBounds: { left: -160, right: 160 },
      nextRandom: () => 0.5,
      animTimeRemaining: () => 0,
      animElemTime: () => 0,
      inGuardDist: () => false,
    };
    const rootSelection = {
      actorId: actor.id,
      side: 1 as const,
      partnerIds: [partner.id],
      enemyIds: [behind.id, front.id],
      p2CandidateIds: [behind.id, front.id],
    };
    const ikemenContext = world.createFactory({
      ...baseFactory,
      resolveRootSelection: () => rootSelection,
    })({
      actor,
      opponent: behind,
      opponents: [behind],
      characters: [actor, behind, front, partner],
      owner: actor,
    });

    expect(evaluateExpression('P2Name = "p4" && P4Name = "p2" && P3Name = "p3"', ikemenContext)).toBe(1);

    const legacyContext = world.createFactory(baseFactory)({
      actor,
      opponent: behind,
      opponents: [behind],
      characters: [actor, behind, front, partner],
      owner: actor,
    });
    expect(evaluateExpression('P2Name = "p2" && P4Name = ""', legacyContext)).toBe(1);
  });
});

function runtimeActor(id: string, runtimeOverrides: Partial<CharacterRuntimeState> = {}): RuntimeExpressionContextActor {
  const contactWorld = new RuntimeContactMemoryWorld();
  return {
    id,
    definition: {
      displayName: id,
      constants: {},
      commands: [],
      animations: new Map<number, unknown>(),
      states: [],
    },
    commandBuffer: {
      isCommandActive: () => false,
    },
    stateElapsed: 0,
    hitPause: 0,
    hitStun: 0,
    runtime: runtimeState(runtimeOverrides),
    targets: [],
    targetBindings: [],
    contactWorld,
    contact: contactMemory(),
    targetWorld: new RuntimeTargetWorld(),
    effectActorWorld: {
      countActors: () => 0,
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
    moveType: "I",
    physics: "S",
    vars: [],
    fvars: [],
    ...overrides,
  };
}

function emptyAnimationFrame(index: number) {
  return {
    spriteGroup: 0,
    spriteIndex: index,
    offsetX: 0,
    offsetY: 0,
    duration: 1,
    clsn1: [],
    clsn2: [],
    raw: "",
    line: index,
  };
}

function contactMemory(): RuntimeContactMemory {
  return {
    moveContactState: undefined,
    moveContactTime: -1,
    moveHitState: undefined,
    moveHitTime: -1,
    moveHitCount: 0,
    moveUniqueHitCount: 0,
    moveReversedState: undefined,
    moveReversedTime: -1,
    receivedDamageState: undefined,
    receivedDamageAmount: 0,
    receivedHitsState: undefined,
    receivedHitsCount: 0,
  };
}

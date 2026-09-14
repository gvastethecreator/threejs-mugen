import { describe, expect, it } from "vitest";
import {
  createRuntimeControllerExpressionContext,
  evaluateRuntimeControllerNumber,
} from "../mugen/runtime/RuntimeControllerExpressionContextSystem";
import { evaluateExpression } from "../mugen/runtime/ExpressionEvaluator";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("RuntimeControllerExpressionContextSystem", () => {
  it("evaluates raw controller numbers through the shared redirect-aware context", () => {
    const self = runtimeState({ hitVelocity: { x: 4, y: -3 }, life: 1000 });
    const target = runtimeState({ life: 963, vel: { x: -8, y: -5 } });
    const parent = runtimeState({ vel: { x: 4, y: 0 } });
    const root = runtimeState({ vel: { x: 0, y: -7 } });

    const context = {
      getConst: (name: string) => (name === "data.attack" ? 90 : undefined),
      hitPauseTime: () => 7,
      parent,
      root,
      gameSpace: { width: 640, height: 480, zoom: 2 },
      localCoord: [640, 480] as [number, number],
      stageTime: 42,
      target: (targetId?: number) =>
        targetId === 77 || targetId === undefined ? { self: target, opponent: self } : undefined,
      playerIdTarget: (playerId: number) =>
        playerId === 58 ? { self: target, playerId: 58, playerNo: 2, opponent: self } : undefined,
      animElemVar: (parameter: string) => (parameter.toLowerCase() === "group" ? 200 : undefined),
      animLength: 8,
      animPlayerNo: 2,
      clsnVar: (group: "clsn1" | "clsn2" | "size", index: number, coordinate: "back" | "front" | "top" | "bottom") =>
        group === "clsn2" && index === 0 && coordinate === "front" ? 48 : undefined,
      clsnOverlap: (actorGroup: "clsn1" | "clsn2" | "size", playerId: number, targetGroup: "clsn1" | "clsn2" | "size") =>
        actorGroup === "clsn1" && playerId === 58 && targetGroup === "clsn2",
      projClsnOverlap: (index: number, playerId: number, targetGroup: "clsn1" | "clsn2" | "size") =>
        index === 0 && playerId === 58 && targetGroup === "clsn2",
      projVar: (projectileId: number, index: number, parameter: string) =>
        projectileId === 77 && index === 0 && parameter.toLowerCase() === "projid" ? 77 : undefined,
      projVarFlag: (
        projectileId: number,
        index: number,
        parameter: "attr" | "guardflag" | "hitflag",
        filter: string,
        operator: "=" | "!=",
      ) => projectileId === 77 && index === 0 && parameter === "hitflag" && filter === "H" && operator === "=",
    };

    expect(evaluateRuntimeControllerNumber("Target(77), Life - 960", self, context)).toBe(3);
    expect(evaluateRuntimeControllerNumber("Target, Vel Y", self, context)).toBe(-5);
    expect(evaluateRuntimeControllerNumber("PlayerID(58), Life", self, context)).toBe(963);
    expect(evaluateRuntimeControllerNumber("PlayerID(4)", self, context)).toBe(4);
    expect(evaluateRuntimeControllerNumber("Parent, Vel X", self, context)).toBe(4);
    expect(evaluateRuntimeControllerNumber("Root, Vel Y", self, context)).toBe(-7);
    expect(evaluateRuntimeControllerNumber("Const(data.attack) + HitPauseTime + StageTime", self, context)).toBe(139);
    expect(evaluateRuntimeControllerNumber("GameWidth + GameHeight", self, context)).toBe(560);
    expect(evaluateRuntimeControllerNumber("ScreenWidth + ScreenHeight", self, context)).toBe(1120);
    expect(evaluateRuntimeControllerNumber("Const240p(3)+Const480p(6)+Const720p(12)", self, context)).toBe(18);
    expect(evaluateRuntimeControllerNumber("GetHitVar(xvel)", self, context)).toBe(4);
    expect(evaluateRuntimeControllerNumber("AnimElemVar(Group) + 1", self, context)).toBe(201);
    expect(evaluateRuntimeControllerNumber("AnimLength - 3", self, context)).toBe(5);
    expect(evaluateRuntimeControllerNumber("AnimPlayerNo + 1", self, context)).toBe(3);
    expect(
      evaluateRuntimeControllerNumber("AnimExist(7777)", self, {
        ...context,
        animExists: (id) => id === 6666,
        activeAnimExists: (id) => id === 7777,
      }),
    ).toBe(1);
    expect(
      evaluateRuntimeControllerNumber("SelfAnimExist(7777)", self, {
        ...context,
        animExists: (id) => id === 6666,
        activeAnimExists: (id) => id === 7777,
      }),
    ).toBe(0);
    expect(evaluateRuntimeControllerNumber("ClsnVar(Clsn2, var(0), Front)", self, context)).toBe(48);
    expect(evaluateRuntimeControllerNumber("ClsnOverlap(Clsn1, 58, Clsn2)", self, context)).toBe(1);
    expect(evaluateRuntimeControllerNumber("ProjClsnOverlap(0, 58, Clsn2)", self, context)).toBe(1);
    expect(evaluateRuntimeControllerNumber("ProjVar(77, 0, ProjID)", self, context)).toBe(77);
    expect(evaluateRuntimeControllerNumber("ProjVar(77, 0, hitflag) = H", self, context)).toBe(1);
  });

  it("builds expression contexts with helper identity and team ownership metadata", () => {
    const self = runtimeState();
    const parent = runtimeState();
    const root = runtimeState();
    const context = createRuntimeControllerExpressionContext(self, {
      helperId: 222,
      isHelper: true,
      playerId: 60,
      playerNo: 3,
      parent,
      parentPlayerId: 56,
      parentPlayerNo: 1,
      parentTeamSide: 1,
      root,
      rootPlayerId: 56,
      rootPlayerNo: 1,
      rootTeamSide: 1,
      teamSide: 1,
    });

    expect(evaluateExpression("IsHelper && IsHelper(222)", context)).toBe(1);
    expect(evaluateExpression("ID = 60 && PlayerNo = 3", context)).toBe(1);
    expect(evaluateExpression("Parent, ID = 56 && PlayerNo = 1", context)).toBe(1);
    expect(evaluateExpression("Root, ID = 56 && PlayerNo = 1", context)).toBe(1);
    expect(evaluateExpression("Parent, TeamSide = 1", context)).toBe(1);
    expect(evaluateExpression("Root, TeamSide = 1", context)).toBe(1);
  });

  it("keeps dynamic P2-family names available to controller value expressions", () => {
    const context = createRuntimeControllerExpressionContext(runtimeState(), {
      opponentName: "Live P4",
      p4Name: "Live P2",
    });

    expect(evaluateExpression('P2Name = "Live P4"', context)).toBe(1);
    expect(evaluateExpression('P4Name = "Live P2"', context)).toBe(1);
  });
});

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

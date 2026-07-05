import { describe, expect, it } from "vitest";
import { compileControllerIr } from "../mugen/compiler/StateControllerCompiler";
import type { MugenStateController } from "../mugen/model/MugenState";
import { hitAttributeMatches } from "../mugen/runtime/CombatResolver";
import { evaluateExpression } from "../mugen/runtime/ExpressionEvaluator";
import { executeControllerIr, executeStateController } from "../mugen/runtime/StateControllerExecutor";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("ExpressionEvaluator", () => {
  it("evaluates basic MUGEN-style comparisons and boolean operators", () => {
    const state = runtimeState({ animNo: 200, animTime: 7, ctrl: true, stateType: "S" });

    expect(evaluateExpression("time >= 5 && anim = 200 && statetype = S", { self: state })).toBe(1);
    expect(evaluateExpression("animelem = 1", { self: state })).toBe(1);
    expect(evaluateExpression("!ctrl", { self: state })).toBe(0);
    expect(evaluateExpression("3 + 4 * 2", { self: state })).toBe(11);
    expect(evaluateExpression("PrevStateNo = 100", { self: runtimeState({ prevStateNo: 100 }) })).toBe(1);
    expect(evaluateExpression("PrevStateNo = 100", { self: runtimeState() })).toBe(0);
    expect(evaluateExpression("PrevAnim = 205", { self: runtimeState({ prevAnimNo: 205 }) })).toBe(1);
    expect(evaluateExpression("PrevAnim = 205", { self: runtimeState() })).toBe(0);
    expect(evaluateExpression("PrevStateType = A", { self: runtimeState({ prevStateType: "A" }) })).toBe(1);
    expect(evaluateExpression("PrevStateType = A", { self: runtimeState() })).toBe(0);
    expect(evaluateExpression("PrevMoveType = A", { self: runtimeState({ prevMoveType: "A" }) })).toBe(1);
    expect(evaluateExpression("PrevMoveType = A", { self: runtimeState() })).toBe(0);
    expect(evaluateExpression("StageTime >= 7", { self: state, stageTime: 8 })).toBe(1);
    expect(evaluateExpression("GameTime = 8", { self: state, stageTime: 8 })).toBe(1);
    expect(evaluateExpression("StageTime > 0", { self: state })).toBe(0);
    expect(evaluateExpression("TeamSide = 1", { self: state, teamSide: 1 })).toBe(1);
    expect(evaluateExpression("EnemyNear, TeamSide = 2", { self: state, opponent: runtimeState(), teamSide: 1, opponentTeamSide: 2 })).toBe(1);
    expect(evaluateExpression("var(1)", { self: runtimeState({ vars: [0, 1] }) })).toBe(1);
    expect(evaluateExpression("sysvar(0)", { self: runtimeState({ sysvars: [1] }) })).toBe(1);
    expect(evaluateExpression("power >= 1000", { self: runtimeState({ power: 0 }) })).toBe(0);
    expect(evaluateExpression("power >= 1000", { self: runtimeState({ power: 1200 }) })).toBe(1);
    expect(evaluateExpression("!alive", { self: runtimeState({ life: 1000 }) })).toBe(0);
    expect(evaluateExpression("!alive", { self: runtimeState({ life: 0 }) })).toBe(1);
  });

  it("evaluates command triggers through the command callback", () => {
    const state = runtimeState();

    expect(evaluateExpression('command = "hadouken"', { self: state, commandActive: (name) => name === "hadouken" })).toBe(1);
    expect(evaluateExpression('command("dash")', { self: state, commandActive: (name) => name === "dash" })).toBe(1);
    expect(evaluateExpression('SelfCommand = "dash"', { self: state, commandActive: (name) => name === "dash" })).toBe(1);
    expect(evaluateExpression('SelfCommand("dash")', { self: state, commandActive: (name) => name === "dash" })).toBe(1);
    expect(evaluateExpression('SelfCommand != "dash"', { self: state, commandActive: () => false })).toBe(1);
    expect(evaluateExpression('151 + 2*(command = "holddown")', { self: state, commandActive: (name) => name === "holddown" })).toBe(153);
    expect(evaluateExpression('151 + 2*(command = "holddown")', { self: state, commandActive: (name) => name === "holdback" })).toBe(151);
    expect(evaluateExpression('statetype = S && command != "holddown"', { self: state, commandActive: (name) => name === "holdback" })).toBe(1);
    expect(evaluateExpression("InGuardDist", { self: state, inGuardDist: () => true })).toBe(1);
    expect(evaluateExpression("!InGuardDist", { self: state, inGuardDist: () => false })).toBe(1);
  });

  it("evaluates AnimElemTime through the runtime timing callback", () => {
    const state = runtimeState({ frameIndex: 1 });

    expect(evaluateExpression("AnimElemTime(2) = 4", { self: state, animElemTime: (elem) => (elem === 2 ? 4 : undefined) })).toBe(1);
    expect(evaluateExpression("AnimElemTime(3) < 0", { self: state, animElemTime: (elem) => (elem === 3 ? -2 : undefined) })).toBe(1);
  });

  it("evaluates legacy AnimElem trigger timing through the runtime timing callback", () => {
    const state = runtimeState({ frameIndex: 1 });
    const context = {
      self: state,
      animElemTime: (elem: number) => {
        if (elem === 2) {
          return 4;
        }
        if (elem === 3) {
          return 0;
        }
        return -1;
      },
    };

    expect(evaluateExpression("AnimElem = 2", { self: state, animElemTime: (elem) => (elem === 2 ? 0 : -1) })).toBe(1);
    expect(evaluateExpression("AnimElem = 2", context)).toBe(0);
    expect(evaluateExpression("AnimElem = 2, = 4", context)).toBe(1);
    expect(evaluateExpression("AnimElem = 2, >= 4", context)).toBe(1);
    expect(evaluateExpression("AnimElem = 2, < 4", context)).toBe(0);
    expect(evaluateExpression("Time >= 0 && AnimElem = 2, = 4", context)).toBe(1);
    expect(evaluateExpression("AnimElem = 3 && Time >= 0", context)).toBe(1);
    expect(evaluateExpression("AnimElem = 3, = 0", context)).toBe(1);
    expect(evaluateExpression("AnimElem = 0", context)).toBe(0);
  });

  it("evaluates hit shake and hit over triggers through runtime callbacks", () => {
    const state = runtimeState({ moveType: "H" });

    expect(evaluateExpression("HitShakeOver", { self: state, hitShakeOver: () => true })).toBe(1);
    expect(evaluateExpression("HitShakeOver", { self: state, hitShakeOver: () => false })).toBe(0);
    expect(evaluateExpression("HitOver", { self: state, hitOver: () => true })).toBe(1);
    expect(evaluateExpression("!HitOver", { self: state, hitOver: () => false })).toBe(1);
    expect(evaluateExpression("HitPauseTime > 0", { self: state, hitPauseTime: () => 4 })).toBe(1);
    expect(evaluateExpression("HitPauseTime = 0", { self: state })).toBe(1);
    expect(evaluateExpression("MoveContact && MoveHit", { self: state, moveContact: () => true, moveHit: () => true })).toBe(1);
    expect(evaluateExpression("MoveGuarded", { self: state, moveGuarded: () => true })).toBe(1);
    expect(evaluateExpression("MoveHit >= 3", { self: state, moveHit: () => 3 })).toBe(1);
    expect(evaluateExpression("MoveContact = 0", { self: state, moveContact: () => 0 })).toBe(1);
    expect(evaluateExpression("MoveReversed >= 1", { self: state, moveReversed: () => 2 })).toBe(1);
    expect(evaluateExpression("HitCount >= 2", { self: state, hitCount: () => 2 })).toBe(1);
    expect(evaluateExpression("UniqHitCount = 1", { self: state, uniqueHitCount: () => 1 })).toBe(1);
    expect(evaluateExpression("ReceivedDamage > 30", { self: state, receivedDamage: () => 37 })).toBe(1);
    expect(evaluateExpression("ReceivedHits >= 1", { self: state, receivedHits: () => 1 })).toBe(1);
    expect(evaluateExpression("HitDefAttr(SC, NA, SA, HA)", { self: state, hitDefAttr: (filter) => hitAttributeMatches(filter, "S,NA") })).toBe(1);
    expect(evaluateExpression("HitDefAttr = SC, NA, SA, HA", { self: state, hitDefAttr: (filter) => hitAttributeMatches(filter, "S,NA") })).toBe(1);
    expect(evaluateExpression("HitDefAttr != A, NT", { self: state, hitDefAttr: (filter) => hitAttributeMatches(filter, "S,NA") })).toBe(1);
    expect(evaluateExpression("HitDefAttr(A, NT)", { self: state, hitDefAttr: (filter) => hitAttributeMatches(filter, "S,NA") })).toBe(0);
    expect(evaluateExpression("ProjHit(77)", { self: state, projHit: (id) => id === 77 })).toBe(1);
    expect(evaluateExpression("ProjContact && !ProjGuarded(77)", { self: state, projContact: () => true, projGuarded: () => false })).toBe(1);
    expect(evaluateExpression("ProjHitTime(77) >= 2", { self: state, projHitTime: (id) => (id === 77 ? 2 : -1) })).toBe(1);
    expect(evaluateExpression("ProjContactTime(0) = 3", { self: state, projContactTime: (id) => (id === undefined ? 3 : -1) })).toBe(1);
    expect(evaluateExpression("ProjGuardedTime(77) < 0", { self: state, projGuardedTime: () => -1 })).toBe(1);
    expect(evaluateExpression("ProjCancelTime(0) = 4", { self: state, projCancelTime: (id) => (id === undefined ? 4 : -1) })).toBe(1);
    expect(evaluateExpression("ProjCancelTime(77) >= 2", { self: state, projCancelTime: (id) => (id === 77 ? 2 : -1) })).toBe(1);
    expect(evaluateExpression("NumTarget > 0", { self: runtimeState({ targetCount: 1 }) })).toBe(1);
    expect(evaluateExpression("NumTarget(77) = 1", { self: state, numTarget: (id) => (id === 77 ? 1 : 0) })).toBe(1);
    expect(
      evaluateExpression("NumTarget(77) = 1", {
        self: runtimeState({ targetRefs: [{ actorId: "p2", targetId: 77, age: 0 }] }),
      }),
    ).toBe(1);
    expect(evaluateExpression("NumExplod(9000) = 1", { self: state, numExplod: (id) => (id === 9000 ? 1 : 0) })).toBe(1);
    expect(evaluateExpression("NumHelper(42) = 1", { self: state, numHelper: (id) => (id === 42 ? 1 : 0) })).toBe(1);
    expect(evaluateExpression("NumProj > 0", { self: state, numProj: () => 1 })).toBe(1);
    expect(evaluateExpression("NumProjID(77) = 1", { self: state, numProj: (id) => (id === 77 ? 1 : 0) })).toBe(1);
  });

  it("evaluates legacy projectile trigger suffix and second-form timing syntax", () => {
    const state = runtimeState();
    const context = {
      self: state,
      projContact: (id?: number) => id === 8897 || id === undefined,
      projHit: (id?: number) => id === 8898 || id === undefined,
      projGuarded: (id?: number) => id === 8899 || id === undefined,
      projContactTime: (id?: number) => (id === 8897 || id === undefined ? 2 : -1),
      projHitTime: (id?: number) => (id === 8898 ? 4 : id === undefined ? 2 : -1),
      projGuardedTime: (id?: number) => (id === 8899 ? 0 : id === undefined ? 1 : -1),
    };

    expect(evaluateExpression("ProjContact8897 = 1", context)).toBe(1);
    expect(evaluateExpression("ProjHit8898 = 1 && ProjGuarded8899 = 1", context)).toBe(1);
    expect(evaluateExpression("ProjContact8897 = 1, >= 1", context)).toBe(1);
    expect(evaluateExpression("ProjHit8898 = 1, < 4", context)).toBe(0);
    expect(evaluateExpression("ProjGuarded8899 = 1, = 0", context)).toBe(1);
    expect(evaluateExpression("ProjContact8897 = 0, < 15", context)).toBe(0);
    expect(evaluateExpression("ProjContact1234 = 0, < 15", context)).toBe(1);
    expect(evaluateExpression("ProjContact0 = 1", context)).toBe(1);
    expect(evaluateExpression("ProjContact = 1, >= 1", context)).toBe(1);
    expect(evaluateExpression("ProjHit0 = 1", context)).toBe(1);
    expect(evaluateExpression("ProjHit = 1, >= 1", context)).toBe(1);
    expect(evaluateExpression("ProjGuarded0 = 1", context)).toBe(1);
    expect(evaluateExpression("ProjGuarded = 1, >= 1", context)).toBe(1);
  });

  it("evaluates common MUGEN axis, range, const, and hitvar trigger syntax", () => {
    const state = runtimeState({ pos: { x: 20, y: -12 }, vel: { x: 0.02, y: 4 }, animNo: 42 });
    const opponent = runtimeState({ pos: { x: 108, y: -4 }, stateType: "A", moveType: "H" });

    expect(evaluateExpression("Vel Y > 0", { self: state })).toBe(1);
    expect(evaluateExpression("Pos Y >= 0", { self: state })).toBe(0);
    expect(evaluateExpression("abs(vel x) < Const(movement.stand.friction.threshold)", { self: state })).toBe(1);
    expect(evaluateExpression("P2BodyDist X < 50", { self: state, opponent })).toBe(1);
    expect(evaluateExpression("P2Dist Y = 8", { self: state, opponent })).toBe(1);
    const stageBounds = { left: -100, right: 160 };
    const edgeState = runtimeState({ pos: { x: 20, y: 0 }, facing: 1, bodyWidth: { front: 18, back: 44 } });
    expect(evaluateExpression("FrontEdgeDist = 140", { self: edgeState, stageBounds })).toBe(1);
    expect(evaluateExpression("BackEdgeDist = 120", { self: edgeState, stageBounds })).toBe(1);
    expect(evaluateExpression("FrontEdgeBodyDist = 122", { self: edgeState, stageBounds })).toBe(1);
    expect(evaluateExpression("BackEdgeBodyDist = 76", { self: edgeState, stageBounds })).toBe(1);
    const turnedEdgeState = runtimeState({ pos: { x: 20, y: 0 }, facing: -1, bodyWidth: { front: 18, back: 44 } });
    expect(evaluateExpression("FrontEdgeDist = 120", { self: turnedEdgeState, stageBounds })).toBe(1);
    expect(evaluateExpression("BackEdgeBodyDist = 96", { self: turnedEdgeState, stageBounds })).toBe(1);
    expect(evaluateExpression("FrontEdgeDist = 999", { self: edgeState })).toBe(1);
    expect(evaluateExpression("Facing = 1", { self: state, opponent })).toBe(1);
    expect(evaluateExpression("P2Facing = 1", { self: state, opponent })).toBe(1);
    expect(evaluateExpression("P2Life = 1000", { self: state, opponent })).toBe(1);
    expect(evaluateExpression("P2Power = 0", { self: state, opponent })).toBe(1);
    expect(evaluateExpression("NumEnemy", { self: state, opponent })).toBe(1);
    expect(evaluateExpression("NumEnemy = 2", { self: state, opponent, numEnemy: () => 2 })).toBe(1);
    expect(evaluateExpression("NumEnemy = 0", { self: state, opponent, numEnemy: () => Number.NaN })).toBe(1);
    expect(evaluateExpression('Name = "Kung Fu Man"', { self: state, name: "Kung Fu Man" })).toBe(1);
    expect(evaluateExpression('P1Name = "Kung Fu Man"', { self: state, name: "Kung Fu Man" })).toBe(1);
    expect(evaluateExpression('P2Name = "Mira Volt"', { self: state, opponent, opponentName: "Mira Volt" })).toBe(1);
    expect(evaluateExpression('AuthorName = "Elecbyte"', { self: state, authorName: "Elecbyte" })).toBe(1);
    expect(
      evaluateExpression('EnemyNear, AuthorName = "Mugen Sandbox"', {
        self: state,
        opponent,
        name: "Kung Fu Man",
        opponentName: "Mira Volt",
        authorName: "Elecbyte",
        opponentAuthorName: "Mugen Sandbox",
      }),
    ).toBe(1);
    expect(
      evaluateExpression('Time >= 0 && EnemyNear, AuthorName = "Mugen Sandbox"', {
        self: state,
        opponent,
        name: "Kung Fu Man",
        opponentName: "Mira Volt",
        authorName: "Elecbyte",
        opponentAuthorName: "Mugen Sandbox",
      }),
    ).toBe(1);
    expect(evaluateExpression("EnemyNear, StateNo = 0", { self: state, opponent })).toBe(1);
    expect(evaluateExpression("EnemyNear(0), MoveType = H", { self: state, opponent })).toBe(1);
    const indexedOpponent = {
      ...opponent,
      stateNo: 5000,
      life: 650,
      vars: Array.from({ length: 60 }, (_, index) => (index === 2 ? 1 : index === 4 ? 11 : 0)),
    };
    expect(
      evaluateExpression("EnemyNear(1), StateNo = 5000 && EnemyNear(var(2)), Var(4) = 11", {
        self: {
          ...state,
          vars: Array.from({ length: 60 }, (_, index) => (index === 2 ? 1 : 0)),
        },
        opponent,
        enemyNear: (index) =>
          index === 0
            ? { self: opponent, opponent: state }
            : index === 1
              ? { self: indexedOpponent, opponent: state }
              : undefined,
      }),
    ).toBe(1);
    const enemyNearIndexUnsupported: string[] = [];
    expect(
      evaluateExpression("EnemyNear(1), StateNo = 0", {
        self: state,
        opponent,
        reportUnsupported: (feature) => enemyNearIndexUnsupported.push(feature),
      }),
    ).toBe(0);
    expect(enemyNearIndexUnsupported).toEqual([]);
    const enemyNearNegativeUnsupported: string[] = [];
    expect(
      evaluateExpression("EnemyNear(-1), StateNo = 0", {
        self: state,
        opponent,
        reportUnsupported: (feature) => enemyNearNegativeUnsupported.push(feature),
      }),
    ).toBe(0);
    expect(enemyNearNegativeUnsupported).toEqual(["enemynear(negative)"]);
    expect(evaluateExpression("EnemyNear, Pos X = 108", { self: state, opponent })).toBe(1);
    expect(
      evaluateExpression("Target(77), Life = 1000 && Target, StateNo = 0", {
        self: state,
        target: (id) => (id === undefined || id === 77 ? { self: opponent, opponent: state } : undefined),
      }),
    ).toBe(1);
    expect(
      evaluateExpression("Target(42), Life = 1000", {
        self: state,
        target: (id) => (id === 77 ? { self: opponent, opponent: state } : undefined),
      }),
    ).toBe(0);
    expect(
      evaluateExpression("Target(var(0)), Life = 1000 && Target(var(0) + 1), Life = 900", {
        self: runtimeState({ vars: [77] }),
        target: (id) => (id === 77 ? { self: opponent, opponent: state } : id === 78 ? { self: runtimeState({ life: 900 }) } : undefined),
      }),
    ).toBe(1);
    const unsupported: string[] = [];
    expect(
      evaluateExpression("Target(-1), Life = 1000", {
        self: state,
        target: () => ({ self: opponent, opponent: state }),
        reportUnsupported: (feature) => unsupported.push(feature),
      }),
    ).toBe(0);
    expect(unsupported).toEqual(["target(negative)"]);
    const unsupportedDynamic: string[] = [];
    expect(
      evaluateExpression("Target(EnemyNear(1), StateNo), Life = 1000", {
        self: state,
        opponent,
        target: () => ({ self: opponent, opponent: state }),
        reportUnsupported: (feature) => unsupportedDynamic.push(feature),
      }),
    ).toBe(0);
    expect(unsupportedDynamic).toEqual([]);
    expect(evaluateExpression("GetHitVar(animtype) = [3,5]", { self: state, getHitVar: () => 4 })).toBe(1);
    expect(evaluateExpression("SelfAnimExist(anim + 3)", { self: state, animExists: (id) => id === 45 })).toBe(1);
    expect(evaluateExpression("SelfStateNoExist(5000)", { self: state, stateExists: (id) => id === 5000 })).toBe(1);
    expect(evaluateExpression("!SelfStateNoExist(9999)", { self: state, stateExists: (id) => id === 5000 })).toBe(1);
    expect(evaluateExpression("Alive", { self: state })).toBe(1);
    expect(evaluateExpression("Alive", { self: runtimeState({ life: 0 }) })).toBe(0);
    expect(evaluateExpression("RoundNo = 1", { self: state })).toBe(1);
    expect(evaluateExpression("RoundState = 2", { self: state })).toBe(1);
    expect(evaluateExpression("RoundsExisted = 0", { self: state })).toBe(1);
    expect(evaluateExpression("!MatchOver", { self: state })).toBe(1);
    expect(evaluateExpression("LifeMax = 1000", { self: state })).toBe(1);
    expect(evaluateExpression("PowerMax = 3000", { self: state })).toBe(1);
    expect(evaluateExpression("LifeMax = 750", { self: runtimeState({ lifeMax: 750 }) })).toBe(1);
    expect(evaluateExpression("PowerMax = 1200", { self: runtimeState({ powerMax: 1200 }) })).toBe(1);
    expect(evaluateExpression("LifeMax = 750", { self: state, lifeMax: 750 })).toBe(1);
    expect(evaluateExpression("PowerMax = 1200", { self: state, powerMax: 1200 })).toBe(1);
    expect(evaluateExpression("IsHelper", { self: state })).toBe(0);
    expect(evaluateExpression("IsHelper", { self: state, isHelper: true, helperId: 42 })).toBe(1);
    expect(evaluateExpression("IsHelper(42)", { self: state, isHelper: true, helperId: 42 })).toBe(1);
    expect(evaluateExpression("IsHelper(43)", { self: state, isHelper: true, helperId: 42 })).toBe(0);
    expect(evaluateExpression("ifelse(ctrl, 10, 20)", { self: state })).toBe(10);
    expect(
      evaluateExpression("Const(movement.down.bounce.offset.y) = 24", {
        self: state,
        getConst: (name) => (name === "movement.down.bounce.offset.y" ? 24 : undefined),
      }),
    ).toBe(1);
  });

  it("evaluates bounded parent and root redirects inside composite expressions", () => {
    const helper = runtimeState({
      stateNo: 6000,
      vars: Array.from({ length: 60 }, (_value, index) => (index === 3 ? 99 : 0)),
    });
    const owner = runtimeState({
      stateNo: 200,
      vel: { x: 4, y: -1 },
      vars: Array.from({ length: 60 }, (_value, index) => (index === 3 ? 7 : index === 5 ? 6002 : 0)),
    });
    const unsupported: string[] = [];

    expect(
      evaluateExpression("Time = 0 && Parent,Var(3) = 7 && Root,Vel X = 4", {
        self: helper,
        parent: owner,
        root: owner,
        reportUnsupported: (feature) => unsupported.push(feature),
      }),
    ).toBe(1);
    expect(evaluateExpression("1 + Root,Var(5) + Parent,Vel Y", { self: helper, parent: owner, root: owner })).toBe(6002);
    expect(evaluateExpression("IfElse(Parent,StateNo = 200, Root,Var(5), 0)", { self: helper, parent: owner, root: owner })).toBe(6002);
    expect(evaluateExpression("Time = 0 && Parent,Var(3) = 7", { self: helper, reportUnsupported: (feature) => unsupported.push(feature) })).toBe(0);
    expect(evaluateExpression("(Parent,StateNo = 0) || 1", { self: helper, reportUnsupported: (feature) => unsupported.push(feature) })).toBe(0);
    expect(evaluateExpression("(Parent,StateNo = 0) + 1", { self: helper, reportUnsupported: (feature) => unsupported.push(feature) })).toBe(0);
    expect(evaluateExpression("IfElse(1, 7, Parent,StateNo)", { self: helper, reportUnsupported: (feature) => unsupported.push(feature) })).toBe(7);
    expect(evaluateExpression("IfElse(0, Parent,StateNo, 9)", { self: helper, reportUnsupported: (feature) => unsupported.push(feature) })).toBe(9);
    const skippedIfElseUnsupported: string[] = [];
    expect(evaluateExpression("IfElse(1, 7, Parent,StateNo)", { self: helper, reportUnsupported: (feature) => skippedIfElseUnsupported.push(feature) })).toBe(7);
    expect(evaluateExpression("IfElse(0, Parent,StateNo, 9)", { self: helper, reportUnsupported: (feature) => skippedIfElseUnsupported.push(feature) })).toBe(9);
    expect(skippedIfElseUnsupported).toEqual(["parent", "parent"]);
    const selectedIfElseUnsupported: string[] = [];
    expect(evaluateExpression("IfElse(1, Parent,StateNo, 9)", { self: helper, reportUnsupported: (feature) => selectedIfElseUnsupported.push(feature) })).toBe(0);
    expect(selectedIfElseUnsupported).toEqual(["parent"]);
    expect(evaluateExpression("Cond((Parent,StateNo = 200), (Root,Var(5)), 0)", { self: helper, parent: owner, root: owner })).toBe(6002);
    const skippedCondUnsupported: string[] = [];
    expect(evaluateExpression("Cond(0, (Parent,StateNo), 9)", { self: helper, reportUnsupported: (feature) => skippedCondUnsupported.push(feature) })).toBe(9);
    expect(evaluateExpression("Cond(1, 7, (Parent,StateNo))", { self: helper, reportUnsupported: (feature) => skippedCondUnsupported.push(feature) })).toBe(7);
    expect(skippedCondUnsupported).toEqual([]);
    const selectedCondUnsupported: string[] = [];
    expect(evaluateExpression("Cond(1, (Parent,StateNo), 9)", { self: helper, reportUnsupported: (feature) => selectedCondUnsupported.push(feature) })).toBe(0);
    expect(selectedCondUnsupported).toEqual(["parent"]);
    expect(unsupported).toContain("parent");
  });

  it("evaluates partial hit-fall runtime trigger data", () => {
    const state = runtimeState({
      hitFall: {
        falling: true,
        damage: 70,
        defenceUp: 150,
        velocity: { x: -3, y: -6 },
        recover: true,
        recoverTime: 30,
        kill: false,
        envShake: { time: 15, freq: 178, ampl: 6, phase: 0 },
      },
    });

    expect(evaluateExpression("HitFall", { self: state })).toBe(1);
    expect(evaluateExpression("CanRecover", { self: state })).toBe(0);
    expect(
      evaluateExpression("GetHitVar(fall.recover) && !CanRecover", {
        self: state,
        getHitVar: (name) => {
          const key = name.toLowerCase();
          if (key === "fall.recover") return state.hitFall?.recover ? 1 : 0;
          if (key === "fall.recovertime") return state.hitFall?.recoverTime;
          return undefined;
        },
      }),
    ).toBe(1);
    state.hitFall = { ...state.hitFall!, recoverTime: 0 };
    expect(evaluateExpression("CanRecover", { self: state })).toBe(1);
    expect(
      evaluateExpression("GetHitVar(fall.damage) = 70", {
        self: state,
        getHitVar: (name) => (name.toLowerCase() === "fall.damage" ? state.hitFall?.damage : undefined),
      }),
    ).toBe(1);
    expect(
      evaluateExpression("GetHitVar(fall.defence_up) = 150", {
        self: state,
        getHitVar: (name) => (name.toLowerCase() === "fall.defence_up" ? state.hitFall?.defenceUp : undefined),
      }),
    ).toBe(1);
    expect(
      evaluateExpression("GetHitVar(fall.kill) = 0", {
        self: state,
        getHitVar: (name) => (name.toLowerCase() === "fall.kill" ? (state.hitFall?.kill === false ? 0 : 1) : undefined),
      }),
    ).toBe(1);
    state.hitFall = {
      ...state.hitFall!,
      downRecover: true,
      downRecoverTime: 24,
    };
    expect(
      evaluateExpression("GetHitVar(recovertime) = 24 && GetHitVar(down.recover)", {
        self: state,
        getHitVar: (name) => {
          const key = name.toLowerCase();
          if (key === "recovertime" || key === "down.recovertime") return state.hitFall?.downRecoverTime;
          if (key === "down.recover") return state.hitFall?.downRecover ? 1 : 0;
          return undefined;
        },
      }),
    ).toBe(1);
  });
});

describe("StateControllerExecutor", () => {
  it("executes the same simple controller behavior through ControllerIr", () => {
    const parsedController = controller("VelSet", { value: "4,-3" });
    const compiled = compileControllerIr(parsedController);
    const parsedResult = executeStateController(parsedController, runtimeState(), () => undefined);
    const irResult = executeControllerIr(compiled, runtimeState(), () => undefined);

    expect(compiled.operation).toEqual({ kind: "kinematic", controllerType: "velset", x: 4, y: -3 });
    expect(irResult.vel).toEqual(parsedResult.vel);
    expect(irResult.vel).toEqual({ x: 4, y: -3 });
  });

  it("keeps controller GetHitVar fall.recover independent from recovery timer", () => {
    const state = runtimeState({
      hitFall: {
        falling: true,
        damage: 0,
        velocity: { y: -6 },
        recover: true,
        recoverTime: 20,
      },
    });

    const result = executeStateController(controller("VelSet", { x: "GetHitVar(fall.recover)", y: "CanRecover" }), state, () => undefined);

    expect(result.vel).toEqual({ x: 1, y: 0 });
  });

  it("evaluates HitPauseTime in runtime controller params when context supplies actor hitpause", () => {
    const result = executeControllerIr(
      compileControllerIr(controller("ChangeState", { value: "HitPauseTime + 200" })),
      runtimeState(),
      () => undefined,
      { hitPauseTime: () => 6 },
    );

    expect(result.stateNo).toBe(206);
  });

  it("accepts debug clipboard controllers as no-op runtime controllers", () => {
    for (const type of ["DisplayToClipboard", "AppendToClipboard", "ClearClipboard", "MakeDust", "DestroySelf"]) {
      const compiled = compileControllerIr(
        controller(type, { text: '"state=%d"', params: "StateNo", pos: "0,0", spacing: "1" }),
      );
      const result = executeControllerIr(compiled, runtimeState({ stateNo: 200, life: 777 }), () => undefined);

      expect(compiled.supportLevel).toBe("noop");
      expect(result).toMatchObject({ stateNo: 200, life: 777 });
    }
  });

  it("executes movement, animation, and state controllers", () => {
    let state = runtimeState();
    const unsupported: string[] = [];

    state = executeStateController(controller("ChangeAnim", { value: "200" }), state, (item) => unsupported.push(item));
    state = executeStateController(controller("ChangeAnim2", { value: "820" }), state, (item) => unsupported.push(item));
    state = executeStateController(controller("VelSet", { value: "3,-2" }), state, (item) => unsupported.push(item));
    state = executeStateController(controller("VelAdd", { y: "0.5" }), state, (item) => unsupported.push(item));
    state = executeStateController(controller("PosAdd", { x: "4" }), state, (item) => unsupported.push(item));
    state = executeStateController(controller("ChangeState", { value: "210", ctrl: "0" }), state, (item) => unsupported.push(item));

    expect(state.animNo).toBe(820);
    expect(state.animationSource).toBe("state-owner");
    expect(state.vel).toEqual({ x: 3, y: -1.5 });
    expect(state.pos).toEqual({ x: 4, y: 0 });
    expect(state.stateNo).toBe(210);
    expect(state.prevStateNo).toBe(0);
    expect(state.ctrl).toBe(false);
    expect(unsupported).toEqual([]);
  });

  it("evaluates controller params with character constants", () => {
    const state = executeControllerIr(
      compileControllerIr(controller("PosSet", { y: "Const(movement.down.bounce.offset.y)" })),
      runtimeState(),
      () => undefined,
      { getConst: (name) => (name === "movement.down.bounce.offset.y" ? 24 : undefined) },
    );

    expect(state.pos.y).toBe(24);
    expect(compileControllerIr(controller("PosSet", { y: "Const(movement.down.bounce.offset.y)" })).operation).toBeUndefined();
  });

  it("evaluates controller params with runtime hit variables", () => {
    const state = executeControllerIr(
      compileControllerIr(controller("CtrlSet", { value: "GetHitVar(fall.kill)" })),
      runtimeState({
        ctrl: true,
        hitFall: {
          falling: true,
          damage: 70,
          kill: false,
          velocity: { x: 2, y: -7 },
        },
      }),
      () => undefined,
    );

    expect(state.ctrl).toBe(false);

    const typedState = executeControllerIr(
      compileControllerIr(
        controller("PowerSet", {
          value:
            "100 + GetHitVar(damage) + GetHitVar(hitid) * 100 + GetHitVar(chainid) + GetHitVar(hitcount) * 100000 + GetHitVar(animtype) + GetHitVar(type) * 10000 + GetHitVar(groundtype) * 10 + GetHitVar(airtype) * 100 + GetHitVar(yaccel) * 100 + GetHitVar(isbound) + GetHitVar(guarded) * 1000 + GetHitVar(xoff) * 1000000 + GetHitVar(yoff) * 10000000 + GetHitVar(zoff) * 100000000",
        }),
      ),
      runtimeState({
        hitVars: {
          damage: 9,
          hitId: 77,
          chainId: 43,
          hitCount: 3,
          hitOffset: { x: 5, y: 2, z: 1 },
          animType: 4,
          groundType: 2,
          airType: 3,
          yAccel: 6,
          isBound: false,
          guarded: true,
        },
      }),
      () => undefined,
    );

    expect(typedState.power).toBe(125329776);
  });

  it("executes additional simple CNS controllers and expression params", () => {
    let state = runtimeState({ vel: { x: 10, y: -2 }, stateType: "C", moveType: "I", physics: "C" });
    const unsupported: string[] = [];

    state = executeStateController(controller("VelMul", { x: ".5", y: "2" }), state, (item) => unsupported.push(item));
    state = executeStateController(controller("VelAdd", { y: "Const(movement.yaccel)" }), state, (item) => unsupported.push(item));
    state = executeStateController(
      controller("StateTypeSet", { statetype: "S", movetype: "A", physics: "S" }),
      state,
      (item) => unsupported.push(item),
    );
    state = executeStateController(controller("ChangeAnim", { value: "120 + (statetype = S)" }), state, (item) =>
      unsupported.push(item),
    );
    state = executeStateController(controller("Null", {}), state, (item) => unsupported.push(item));

    expect(state.vel.x).toBe(5);
    expect(state.vel.y).toBeCloseTo(-3.56, 5);
    expect(state.stateType).toBe("S");
    expect(state.moveType).toBe("A");
    expect(state.physics).toBe("S");
    expect(state.animNo).toBe(121);
    expect(unsupported).toEqual([]);
  });

  it("executes life, power, and variable controllers", () => {
    let state = runtimeState({ life: 900, power: 100 });
    const compiledLife = compileControllerIr(controller("LifeAdd", { value: "-50" }));
    const compiledSysvarSet = compileControllerIr(controller("VarSet", { "sysvar(0)": "1" }));
    const compiledSysvarAdd = compileControllerIr(controller("VarAdd", { "sysvar(0)": "2" }));
    const compiledVarRandom = compileControllerIr(controller("VarRandom", { v: "5", range: "10,12" }));

    state = executeControllerIr(compiledLife, state, () => undefined);
    state = executeStateController(controller("PowerAdd", { value: "75" }), state, () => undefined);
    state = executeStateController(controller("VarSet", { v: "3", value: "8" }), state, () => undefined);
    state = executeStateController(controller("VarAdd", { v: "3", value: "2" }), state, () => undefined);
    state = executeStateController(controller("VarSet", { "var(1)": "7" }), state, () => undefined);
    state = executeControllerIr(compiledSysvarSet, state, () => undefined);
    state = executeControllerIr(compiledSysvarAdd, state, () => undefined);
    state = executeControllerIr(compiledVarRandom, state, () => undefined, { random: () => 0.5 });
    state = executeStateController(controller("VarSet", { "sysvar(1)": "4" }), state, () => undefined);
    state = executeStateController(controller("VarSet", { fv: "2", value: "1.5" }), state, () => undefined);

    expect(compiledLife.operation).toEqual({ kind: "resource", controllerType: "lifeadd", value: -50 });
    expect(compiledSysvarSet.operation).toEqual({ kind: "variable", controllerType: "varset", variableType: "sysvar", index: 0, value: 1 });
    expect(compiledSysvarAdd.operation).toEqual({ kind: "variable", controllerType: "varadd", variableType: "sysvar", index: 0, value: 2 });
    expect(compiledVarRandom.operation).toEqual({ kind: "variable", controllerType: "varrandom", variableType: "var", index: 5, min: 10, max: 12 });
    expect(state.life).toBe(850);
    expect(state.power).toBe(175);
    expect(state.vars[3]).toBe(10);
    expect(state.vars[1]).toBe(7);
    expect(state.vars[5]).toBe(11);
    expect(state.sysvars?.[0]).toBe(3);
    expect(state.sysvars?.[1]).toBe(4);
    expect(state.fvars[2]).toBe(1.5);
  });

  it("respects LifeAdd kill = 0 and AssertSpecial NoKO clamps", () => {
    let state = runtimeState({ life: 25 });

    state = executeControllerIr(compileControllerIr(controller("LifeAdd", { value: "-80", kill: "0" })), state, () => undefined);
    expect(state.life).toBe(1);

    state = runtimeState({
      life: 25,
      assertSpecial: { flags: ["noko"], globalFlags: [], noKo: true },
    });
    state = executeControllerIr(compileControllerIr(controller("LifeAdd", { value: "-80" })), state, () => undefined);
    expect(state.life).toBe(1);
  });

  it("executes compatibility movement and meter controllers used by common CNS files", () => {
    let state = runtimeState({
      facing: 1,
      vel: { x: 0, y: 0 },
      hitVelocity: { x: -6, y: -9 },
      playerPush: true,
      posFreeze: undefined,
      life: 400,
      power: 50,
    });
    const unsupported: string[] = [];
    const compiledHitVelSet = compileControllerIr(controller("HitVelSet", { x: "1", y: "1" }));
    const compiledPosFreeze = compileControllerIr(controller("PosFreeze", { x: "1", y: "0" }));
    const compiledScreenBound = compileControllerIr(controller("ScreenBound", { value: "0", movecamera: "0,1" }));

    state = executeControllerIr(compiledHitVelSet, state, (item) => unsupported.push(item));
    state = executeStateController(controller("PlayerPush", { value: "0" }), state, (item) => unsupported.push(item));
    state = executeStateController(controller("Turn", {}), state, (item) => unsupported.push(item));
    state = executeControllerIr(compiledPosFreeze, state, (item) => unsupported.push(item));
    state = executeControllerIr(compiledScreenBound, state, (item) => unsupported.push(item));
    const compiledNotHitBy = compileControllerIr(controller("NotHitBy", { value: "SCA", time: "12" }));
    const compiledHitOverride = compileControllerIr(
      controller("HitOverride", { attr: "S,NA", stateno: "777", slot: "1", time: "12", forceair: "1" }),
    );
    state = executeControllerIr(compiledNotHitBy, state, (item) => unsupported.push(item));
    state = executeStateController(controller("HitBy", { value2: "S,NA", time: "8" }), state, (item) =>
      unsupported.push(item),
    );
    state = executeControllerIr(compiledHitOverride, state, (item) => unsupported.push(item));
    state = executeStateController(controller("DefenceMulSet", { value: "0.5" }), state, (item) => unsupported.push(item));
    state = executeStateController(controller("AttackMulSet", { value: "1.5" }), state, (item) => unsupported.push(item));
    state = executeStateController(controller("RemapPal", { source: "1,1", dest: "2,3" }), state, (item) => unsupported.push(item));
    state = executeStateController(controller("ForceFeedback", { time: "8" }), state, (item) => unsupported.push(item));
    state = executeStateController(controller("MakeDust", { pos: "0,0", spacing: "1" }), state, (item) => unsupported.push(item));
    state = executeStateController(controller("DestroySelf", {}), state, (item) => unsupported.push(item));
    state = executeStateController(controller("LifeSet", { value: "777" }), state, (item) => unsupported.push(item));
    state = executeStateController(controller("PowerSet", { value: "1234" }), state, (item) => unsupported.push(item));
    state = executeStateController(controller("VarRangeSet", { first: "2", last: "4", value: "9" }), state, (item) =>
      unsupported.push(item),
    );
    const compiledAssertSpecial = compileControllerIr(
      controller("AssertSpecial", {
        flag: "NoAutoTurn",
        flag2: "NoWalk, Invisible, TimerFreeze, RoundNotOver, NoKOSlow, Intro",
        flag3: "NoGetUpFromLieDown, NoFastRecoverFromLieDown",
      }),
    );
    state = executeControllerIr(compiledAssertSpecial, state, (item) => unsupported.push(item));

    expect(state.vel).toEqual({ x: -6, y: -9 });
    expect(compiledHitVelSet.operation).toEqual({ kind: "kinematic", controllerType: "hitvelset", x: 1, y: 1 });
    expect(state.playerPush).toBe(false);
    expect(state.facing).toBe(-1);
    expect(state.posFreeze).toEqual({ x: true, y: false });
    expect(state.screenBound).toEqual({ bound: false, moveCameraX: false, moveCameraY: true });
    expect(compiledPosFreeze.operation).toEqual({ kind: "bounds", controllerType: "posfreeze", x: true, y: false });
    expect(compiledScreenBound.operation).toEqual({
      kind: "bounds",
      controllerType: "screenbound",
      bound: false,
      moveCameraX: false,
      moveCameraY: true,
    });
    expect(state.hitBy?.slot1).toEqual({ mode: "deny", attr: "SCA", remaining: 12 });
    expect(state.hitBy?.slot2).toEqual({ mode: "allow", attr: "S,NA", remaining: 8 });
    expect(compiledNotHitBy.operation).toMatchObject({ kind: "eligibility", controllerType: "nothitby" });
    expect(compiledHitOverride.operation).toMatchObject({ kind: "hitoverride", stateNo: 777, forceAir: true });
    expect(state.hitOverrides).toEqual([
      { slot: 1, attr: "S,NA", stateNo: 777, remaining: 12, forceAir: true, forceGuard: false, keepState: false },
    ]);
    expect(state.defenseMultiplier).toBe(0.5);
    expect(state.attackMultiplier).toBe(1.5);
    expect(state.paletteRemap).toEqual({ source: [1, 1], dest: [2, 3] });
    expect(state.life).toBe(777);
    expect(state.power).toBe(1234);
    expect(state.vars.slice(2, 5)).toEqual([9, 9, 9]);
    expect(state.assertSpecial).toMatchObject({
      flags: ["noautoturn", "nowalk", "invisible", "nogetupfromliedown", "nofastrecoverfromliedown"],
      globalFlags: ["timerfreeze", "roundnotover", "nokoslow", "intro"],
      noAutoTurn: true,
      noWalk: true,
      invisible: true,
      noKoSlow: true,
      timerFreeze: true,
      roundNotOver: true,
      intro: true,
      noGetUpFromLieDown: true,
      noFastRecoverFromLieDown: true,
    });
    expect(compiledAssertSpecial.operation).toEqual({
      kind: "assertspecial",
      flags: ["noautoturn", "nowalk", "invisible", "nogetupfromliedown", "nofastrecoverfromliedown"],
      globalFlags: ["timerfreeze", "roundnotover", "nokoslow", "intro"],
    });
    expect(state.renderOpacity).toBe(0);
    expect(unsupported).toEqual([]);
  });

  it("executes partial hit-fall controllers used by common get-hit states", () => {
    let state = runtimeState({
      moveType: "H",
      vel: { x: 0, y: 0 },
      life: 500,
      hitFall: {
        falling: true,
        damage: 70,
        velocity: { x: -3, y: -6 },
        recover: false,
        recoverTime: 30,
        envShake: { time: 15, freq: 178, ampl: 6, phase: 0 },
      },
    });
    const unsupported: string[] = [];

    state = executeStateController(controller("HitFallVel", {}), state, (item) => unsupported.push(item));
    state = executeStateController(controller("HitFallDamage", {}), state, (item) => unsupported.push(item));
    state = executeStateController(controller("HitFallSet", { value: "0", xvel: "2", yvel: "-7" }), state, (item) =>
      unsupported.push(item),
    );
    state = executeStateController(controller("FallEnvShake", {}), state, (item) => unsupported.push(item));

    expect(state.vel).toEqual({ x: -3, y: -6 });
    expect(state.life).toBe(430);
    expect(state.hitFall).toMatchObject({
      falling: false,
      damage: 0,
      velocity: { x: 2, y: -7 },
    });
    expect(unsupported).toEqual([]);
  });

  it("respects fall.kill = 0 when HitFallDamage applies stored damage", () => {
    const state = runtimeState({
      moveType: "H",
      life: 30,
      hitFall: {
        falling: true,
        damage: 70,
        kill: false,
        velocity: { y: -6 },
      },
    });

    const result = executeStateController(controller("HitFallDamage", {}), state, () => undefined);

    expect(result.life).toBe(1);
    expect(result.hitFall).toMatchObject({ damage: 0, kill: false });
  });

  it("respects AssertSpecial NoKO when HitFallDamage applies stored damage", () => {
    const state = runtimeState({
      life: 30,
      moveType: "H",
      assertSpecial: { flags: ["noko"], globalFlags: [], noKo: true },
      hitFall: {
        falling: true,
        damage: 70,
        kill: true,
        velocity: { y: -6 },
      },
    });

    const result = executeStateController(controller("HitFallDamage", {}), state, () => undefined);

    expect(result.life).toBe(1);
    expect(result.hitFall).toMatchObject({ damage: 0, kill: true });
  });
});

function controller(type: string, params: Record<string, string>): MugenStateController {
  return {
    stateId: 200,
    type,
    triggers: [],
    params,
    line: 1,
    rawHeader: `[State 200, ${type}]`,
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
    sysvars: [],
    ...overrides,
  };
}

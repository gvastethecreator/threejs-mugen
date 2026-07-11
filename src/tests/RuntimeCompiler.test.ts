import { describe, expect, it } from "vitest";
import { compileCommandIr } from "../mugen/compiler/CommandCompiler";
import { compileExpression } from "../mugen/compiler/ExpressionCompiler";
import { compileControllerIr, compileRuntimeProgram, getControllerSupport, isRuntimeExecutableController } from "../mugen/compiler/StateControllerCompiler";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
import type { MugenStateController, MugenStateDef } from "../mugen/model/MugenState";
import { parseCmd } from "../mugen/parsers/CmdParser";
import { parseCns } from "../mugen/parsers/CnsParser";

describe("runtime compiler IR", () => {
  it("compiles CMD tokens into executable ordered steps", () => {
    const command = parseCmd(`
[Command]
name = "charged_combo"
command = ~30$D, F, x+y|z
time = 20
`).commands[0];

    if (!command) {
      throw new Error("Expected parsed command");
    }

    const compiled = compileCommandIr(command);

    expect(compiled.supportLevel).toBe("executable");
    expect(compiled.steps).toHaveLength(3);
    expect(compiled.steps[0]?.parts[0]).toEqual([{ raw: "D", type: "direction", modifiers: ["~", "$"], chargeTime: 30 }]);
    expect(compiled.steps[2]?.parts).toEqual([
      [{ raw: "x", type: "button", modifiers: [], chargeTime: undefined }],
      [
        { raw: "y", type: "button", modifiers: [], chargeTime: undefined },
        { raw: "z", type: "button", modifiers: [], chargeTime: undefined },
      ],
    ]);
  });

  it("classifies supported and unsupported trigger expressions before runtime evaluation", () => {
    const clean = compileExpression(
      'P2BodyDist X < 40 && SelfAnimExist(anim + 3) && SelfStateNoExist(5000) && SelfCommand = "x" && StageTime >= 3 && GameWidth >= 320 && GameHeight >= 240 && ScreenWidth >= 320 && ScreenHeight >= 240 && Const240p(3) = 6 && Const480p(6) = 6 && Const720p(12) = 6 && Alive && RoundNo = 1 && RoundState = 2 && RoundsExisted = 0 && !MatchOver && LifeMax >= Life && PowerMax >= Power',
    );
    const constCoordinateArgs = compileExpression("Const720p(var(0) + 12) = 12");
    const contact = compileExpression(
      "MoveGuarded || MoveReversed || ProjHit(77) || ProjGuarded(77) || ProjContactTime(0) >= 0 || ProjHitTime(0) >= 0 || ProjHitTime(77) >= 0 || ProjGuardedTime(0) >= 0 || ProjCancelTime(0) >= 0 || NumTarget(77) > 0 || HitCount >= 1 || UniqHitCount >= 1 || ReceivedDamage > 0 || ReceivedHits >= 1 || HitPauseTime > 0",
    );
    const legacyProjectileContact = compileExpression(
      "ProjContact8897 = 1, >= 1 && ProjContact = 1, >= 1 && ProjContact0 = 1 && ProjHit8898 = 1, >= 1 && ProjHit = 1, >= 1 && ProjGuarded8899 = 1, = 0 && ProjGuarded0 = 1 && ProjGuarded = 1, >= 1 && ProjGuarded0 = 0, < 15",
    );
    const actorCounts = compileExpression("NumExplod(9000) || NumHelper(42) > 0 || NumProj || NumProjID(77)");
    const helperIdentity = compileExpression("IsHelper && IsHelper(42)");
    const helperIdentityFunction = compileExpression("IsHelper(42)");
    const hitDefAttr = compileExpression("HitDefAttr = SC, NA, SA, HA");
    const enemyNear = compileExpression("enemynear, stateno = 5000");
    const parentRedirect = compileExpression("Parent,Var(3) = 7");
    const rootRedirect = compileExpression("Root,Vel X = 4");
    const targetRedirect = compileExpression("Target(77), Life < 1000 && Target, StateNo >= 5000");
    const dynamicTargetRedirect = compileExpression("Target(var(0) + 1), Life > 0");
    const nestedRedirect = compileExpression("Time = 0 && Parent,Var(3) = 7 && Root,Vel X = 4");
    const p2Metrics = compileExpression(
      'NumEnemy && TeamSide = 1 && Facing = 1 && P2Facing = -1 && P2Life > 0 && P2Power >= 0 && Name = "KFM" && P1Name = "KFM" && P2Name != "Training" && AuthorName = "Elecbyte" && PrevAnim = 205 && PrevStateType = A && PrevMoveType = A',
    );
    const enemyNearIndexed = compileExpression("enemynear(1), stateno = 5000");
    const enemyNearDynamicIndex = compileExpression("enemynear(var(0)), stateno = 5000");
    const unsupportedEnemyNearNegative = compileExpression("enemynear(-1), stateno = 5000");
    const unsupportedParentIndex = compileExpression("Time = 0 && Parent(1),Var(3) = 7");
    const unsupportedTargetDynamic = compileExpression("Target(enemynear(1), stateno), Life > 0");
    const unsupportedTargetNegative = compileExpression("Target(-1), Life > 0");

    expect(clean.normalized).toBe(
      'p2bodydistx < 40 && SelfAnimExist(anim + 3) && SelfStateNoExist(5000) && SelfCommand = "x" && StageTime >= 3 && GameWidth >= 320 && GameHeight >= 240 && ScreenWidth >= 320 && ScreenHeight >= 240 && Const240p(3) = 6 && Const480p(6) = 6 && Const720p(12) = 6 && Alive && RoundNo = 1 && RoundState = 2 && RoundsExisted = 0 && !MatchOver && LifeMax >= Life && PowerMax >= Power',
    );
    expect(clean.supportLevel).toBe("executable");
    expect(clean.functions).toEqual(["Const240p", "Const480p", "Const720p", "SelfAnimExist", "SelfStateNoExist"]);
    expect(constCoordinateArgs.supportLevel).toBe("executable");
    expect(constCoordinateArgs.functions).toEqual(["Const720p", "var"]);
    expect(clean.identifiers).toContain("SelfCommand");
    expect(clean.identifiers).toContain("StageTime");
    expect(clean.identifiers).toContain("GameWidth");
    expect(clean.identifiers).toContain("GameHeight");
    expect(clean.identifiers).toContain("ScreenWidth");
    expect(clean.identifiers).toContain("ScreenHeight");
    expect(clean.identifiers).toContain("Alive");
    expect(clean.identifiers).toContain("RoundNo");
    expect(clean.identifiers).toContain("RoundState");
    expect(clean.identifiers).toContain("RoundsExisted");
    expect(clean.identifiers).toContain("MatchOver");
    expect(clean.identifiers).toContain("LifeMax");
    expect(clean.identifiers).toContain("PowerMax");
    expect(contact.supportLevel).toBe("executable");
    expect(contact.functions).toEqual(["NumTarget", "ProjCancelTime", "ProjContactTime", "ProjGuarded", "ProjGuardedTime", "ProjHit", "ProjHitTime"]);
    expect(contact.identifiers).toEqual([
      "HitCount",
      "HitPauseTime",
      "MoveGuarded",
      "MoveReversed",
      "ReceivedDamage",
      "ReceivedHits",
      "UniqHitCount",
    ]);
    expect(legacyProjectileContact.supportLevel).toBe("executable");
    expect(legacyProjectileContact.normalized).toBe(
      "((ProjContactTime(8897) >= 0) && (ProjContactTime(8897) >= 1)) && ((ProjContactTime() >= 0) && (ProjContactTime() >= 1)) && ProjContact() = 1 && ((ProjHitTime(8898) >= 0) && (ProjHitTime(8898) >= 1)) && ((ProjHitTime() >= 0) && (ProjHitTime() >= 1)) && ((ProjGuardedTime(8899) >= 0) && (ProjGuardedTime(8899) = 0)) && ProjGuarded() = 1 && ((ProjGuardedTime() >= 0) && (ProjGuardedTime() >= 1)) && (!((ProjGuardedTime() >= 0) && (ProjGuardedTime() < 15)))",
    );
    expect(legacyProjectileContact.functions).toEqual(["ProjContact", "ProjContactTime", "ProjGuarded", "ProjGuardedTime", "ProjHitTime"]);
    expect(legacyProjectileContact.identifiers).toEqual([]);
    expect(actorCounts.supportLevel).toBe("executable");
    expect(actorCounts.functions).toEqual(["NumExplod", "NumHelper", "NumProjID"]);
    expect(actorCounts.identifiers).toEqual(["NumProj"]);
    expect(helperIdentity.supportLevel).toBe("executable");
    expect(helperIdentity.functions).toEqual(["IsHelper"]);
    expect(helperIdentity.identifiers).toEqual(["IsHelper"]);
    expect(helperIdentityFunction.supportLevel).toBe("executable");
    expect(helperIdentityFunction.functions).toEqual(["IsHelper"]);
    expect(helperIdentityFunction.identifiers).toEqual([]);
    expect(hitDefAttr.supportLevel).toBe("executable");
    expect(hitDefAttr.identifiers).toEqual(["HitDefAttr"]);
    expect(enemyNear.supportLevel).toBe("executable");
    expect(enemyNear.identifiers).toEqual(["stateno"]);
    expect(parentRedirect.supportLevel).toBe("executable");
    expect(parentRedirect.functions).toEqual(["Var"]);
    expect(rootRedirect.supportLevel).toBe("executable");
    expect(rootRedirect.identifiers).toEqual(["velx"]);
    expect(targetRedirect.supportLevel).toBe("executable");
    expect(targetRedirect.identifiers).toEqual(["Life", "StateNo"]);
    expect(dynamicTargetRedirect.supportLevel).toBe("executable");
    expect(dynamicTargetRedirect.functions).toEqual(["var"]);
    expect(dynamicTargetRedirect.identifiers).toEqual(["Life"]);
    expect(nestedRedirect.supportLevel).toBe("executable");
    expect(nestedRedirect.functions).toEqual(["Var"]);
    expect(nestedRedirect.identifiers).toEqual(["Time", "velx"]);
    expect(p2Metrics.supportLevel).toBe("executable");
    expect(p2Metrics.identifiers).toEqual([
      "AuthorName",
      "Facing",
      "Name",
      "NumEnemy",
      "P1Name",
      "P2Facing",
      "P2Life",
      "P2Name",
      "P2Power",
      "PrevAnim",
      "PrevMoveType",
      "PrevStateType",
      "TeamSide",
    ]);
    expect(enemyNearIndexed.supportLevel).toBe("executable");
    expect(enemyNearIndexed.identifiers).toEqual(["stateno"]);
    expect(enemyNearDynamicIndex.supportLevel).toBe("executable");
    expect(enemyNearDynamicIndex.functions).toEqual(["var"]);
    expect(enemyNearDynamicIndex.identifiers).toEqual(["stateno"]);
    expect(unsupportedEnemyNearNegative.supportLevel).toBe("unsupported");
    expect(unsupportedEnemyNearNegative.unsupportedFeatures).toEqual(["enemynear(negative)"]);
    expect(unsupportedParentIndex.supportLevel).toBe("unsupported");
    expect(unsupportedParentIndex.unsupportedFeatures).toEqual(["parent(index)"]);
    expect(unsupportedTargetDynamic.supportLevel).toBe("executable");
    expect(unsupportedTargetDynamic.identifiers).toEqual(["Life", "stateno"]);
    expect(unsupportedTargetNegative.supportLevel).toBe("unsupported");
    expect(unsupportedTargetNegative.unsupportedFeatures).toEqual(["target(negative)"]);
  });

  it("summarizes controller and State -1 routability as compiler output", () => {
    const program = compileRuntimeProgram({
      commands: [],
      animations: new Map<number, MugenAnimationAction>([[1000, action(1000)]]),
      states: [
        state(1000, 1000, [
          controller(1000, "VelSet", ["time = 0"], { x: "2" }),
          controller(1000, "MysteryController", ["enemynear(-1), stateno = 5000"]),
        ]),
      ],
      stateEntryControllers: [controller(-1, "ChangeState", ['command = "qcf_x"', "ctrl"], { value: "1000" })],
    });

    expect(program.report.states.compiled).toBe(1);
    expect(program.report.states.runtimeRoutableStateTargets).toEqual([1000]);
    expect(program.report.controllers.compiled).toBe(2);
    expect(program.report.controllers.unsupported).toBe(1);
    expect(program.report.controllers.unsupportedByType).toEqual({ MysteryController: 1 });
    expect(program.report.triggers.unsupportedFeatures).toEqual({ "enemynear(negative)": 1 });
  });

  it("keeps controller support metadata in one registry", () => {
    expect(isRuntimeExecutableController("HitDef")).toBe(true);
    expect(isRuntimeExecutableController("MoveHitReset")).toBe(true);
    expect(getControllerSupport("MoveHitReset").runtimeLabel).toBe("contact memory");
    expect(isRuntimeExecutableController("HitAdd")).toBe(true);
    expect(getControllerSupport("HitAdd").runtimeLabel).toBe("contact memory");
    expect(isRuntimeExecutableController("VarRandom")).toBe(true);
    expect(getControllerSupport("VarRandom").runtimeLabel).toBe("variables");
    expect(isRuntimeExecutableController("ForceFeedback")).toBe(true);
    expect(getControllerSupport("ForceFeedback").level).toBe("noop");
    expect(isRuntimeExecutableController("MakeDust")).toBe(true);
    expect(getControllerSupport("MakeDust")).toEqual({
      level: "noop",
      runtimeLabel: "deprecated dust presentation no-op",
    });
    expect(isRuntimeExecutableController("DestroySelf")).toBe(true);
    expect(getControllerSupport("DestroySelf")).toEqual({
      level: "noop",
      runtimeLabel: "helper lifecycle no-op",
    });
    expect(isRuntimeExecutableController("Trans")).toBe(true);
    expect(getControllerSupport("Trans").level).toBe("partial");
    expect(isRuntimeExecutableController("EnvColor")).toBe(true);
    expect(getControllerSupport("EnvColor").level).toBe("partial");
    expect(isRuntimeExecutableController("AssertSpecial")).toBe(true);
    expect(getControllerSupport("AssertSpecial").level).toBe("partial");
    expect(isRuntimeExecutableController("AngleDraw")).toBe(true);
    expect(getControllerSupport("AngleDraw").runtimeLabel).toBe("sprite rotation");
    expect(isRuntimeExecutableController("AngleMul")).toBe(true);
    expect(getControllerSupport("AngleMul").runtimeLabel).toBe("sprite rotation");
    expect(isRuntimeExecutableController("BindToParent")).toBe(true);
    expect(getControllerSupport("BindToParent").runtimeLabel).toBe("bounded helper binding");
    expect(isRuntimeExecutableController("BindToRoot")).toBe(true);
    expect(getControllerSupport("BindToRoot").runtimeLabel).toBe("bounded helper binding");
  });

  it("compiles accepted no-op controllers into typed operations", () => {
    expect(compileControllerIr(controller(200, "Null", [])).operation).toEqual({ kind: "noop", controllerType: "null" });
    expect(compileControllerIr(controller(200, "ForceFeedback", [], { time: "8" })).operation).toEqual({
      kind: "noop",
      controllerType: "forcefeedback",
    });
    expect(compileControllerIr(controller(200, "DisplayToClipboard", [], { text: '"debug"' })).operation).toEqual({
      kind: "noop",
      controllerType: "displaytoclipboard",
    });
    expect(compileControllerIr(controller(200, "AppendToClipboard", [], { text: '"debug"' })).operation).toEqual({
      kind: "noop",
      controllerType: "appendtoclipboard",
    });
    expect(compileControllerIr(controller(200, "ClearClipboard", [])).operation).toEqual({
      kind: "noop",
      controllerType: "clearclipboard",
    });
    expect(compileControllerIr(controller(200, "MakeDust", [], { pos: "0,0" })).operation).toEqual({
      kind: "noop",
      controllerType: "makedust",
    });
    expect(compileControllerIr(controller(200, "DestroySelf", [])).operation).toEqual({
      kind: "noop",
      controllerType: "destroyself",
    });
  });

  it("compiles only parameterless self TagIn and TagOut into typed standby operations", () => {
    expect(compileControllerIr(controller(200, "TagIn", [])).operation).toEqual({
      kind: "team-standby",
      controllerType: "tagin",
      standby: false,
      self: true,
    });
    expect(compileControllerIr(controller(200, "TagOut", [])).operation).toEqual({
      kind: "team-standby",
      controllerType: "tagout",
      standby: true,
      self: true,
    });
    const parsedTagIn = parseCns(`[Statedef 0]\ntype = S\n[State 0, Tag]\ntype = TagIn\ntrigger1 = 1`).states[0]!.controllers[0]!;
    expect(compileControllerIr(parsedTagIn).operation).toEqual({
      kind: "team-standby",
      controllerType: "tagin",
      standby: false,
      self: true,
    });
    expect(compileControllerIr(controller(200, "TagIn", [], { partner: "2" })).operation).toEqual({
      kind: "team-standby",
      controllerType: "tagin",
      standby: false,
      self: false,
      partnerOrdinal: 2,
    });

    const unsupportedParamSets: Record<string, string>[] = [
      { self: "0" },
      { partner: "var(0)" },
      { partner: "-1" },
      { stateno: "5600" },
      { ctrl: "1" },
      { leader: "3" },
      { memberno: "2" },
    ];
    for (const params of unsupportedParamSets) {
      const compiled = compileControllerIr(controller(200, "TagIn", [], params));
      expect(compiled.supportLevel).toBe("unsupported");
      expect(compiled.operation).toBeUndefined();
      expect(compiled.unsupportedFeatures).toEqual(["TagIn:optional-params"]);
    }
  });

  it("compiles static AssertSpecial flags into typed operations", () => {
    const compiled = compileControllerIr(
      controller(200, "AssertSpecial", [], {
        flag: "NoAutoTurn, NoWalk",
        flag2: '"Invisible", GlobalNoKO, TimerFreeze, RoundNotOver, NoKOSlow, Intro, NoWalk',
        flag3: "NoGetUpFromLieDown, NoFastRecoverFromLieDown, RunFirst, RunLast",
      }),
    );
    const disabled = compileControllerIr(controller(200, "AssertSpecial", [], { flag: "NoWalk", value: "0" }));
    const dynamic = compileControllerIr(controller(200, "AssertSpecial", [], { flag: "IfElse(var(0), NoWalk, Invisible)" }));

    expect(compiled.operation).toEqual({
      kind: "assertspecial",
      flags: ["noautoturn", "nowalk", "invisible", "nogetupfromliedown", "nofastrecoverfromliedown", "runfirst", "runlast"],
      globalFlags: ["globalnoko", "timerfreeze", "roundnotover", "nokoslow", "intro"],
    });
    expect(disabled.operation).toBeUndefined();
    expect(dynamic.operation).toBeUndefined();
  });

  it("compiles contact-memory controllers into typed operations", () => {
    expect(compileControllerIr(controller(200, "MoveHitReset", [], {})).operation).toEqual({
      kind: "contact",
      controllerType: "movehitreset",
    });
    expect(compileControllerIr(controller(200, "HitAdd", [], { value: "2" })).operation).toEqual({
      kind: "contact",
      controllerType: "hitadd",
      value: 2,
    });
    expect(compileControllerIr(controller(200, "HitAdd", [], { value: "Const(data.life)" })).operation).toBeUndefined();
  });

  it("compiles HitDef params into a typed controller operation", () => {
    const compiled = compileControllerIr(
      controller(200, "HitDef", ["AnimElem = 3"], {
        id: "7",
        numhits: "3",
        attr: "S, NA",
        damage: "42,5",
        kill: "0",
        "guard.kill": "0",
        priority: "6, Hit",
        p1sprpriority: "3",
        p2sprpriority: "-2",
        pausetime: "8,9",
        guardflag: "MA",
        "ground.hittime": "17",
        "ground.velocity": "-4,-6",
        "air.velocity": "-3,-8",
        "guard.dist": "96",
        "guard.pausetime": "4,5",
        "guard.hittime": "11",
        "guard.slidetime": "6",
        "guard.ctrltime": "8",
        "guard.velocity": "-2",
        "airguard.velocity": "-5,-2",
        "ground.cornerpush.veloff": "3",
        "air.cornerpush.veloff": "4",
        "down.cornerpush.veloff": "5",
        "guard.cornerpush.veloff": "6",
        "airguard.cornerpush.veloff": "7",
        hitsound: "S5,0",
        guardsound: "S6,0",
        sparkno: "S7001",
        "guard.sparkno": "S7000",
        sparkxy: "12,-64",
        p1stateno: "210",
        p2stateno: "5100",
        p2getp1state: "0",
        missonoverride: "0",
        fall: "1",
        "fall.kill": "0",
        "fall.yvelocity": "-7",
        "fall.recover": "0",
        "fall.recovertime": "19",
        "down.recover": "1",
        "down.recovertime": "45",
      }),
    );

    expect(compiled.operation).toMatchObject({
      kind: "hitdef",
      id: 7,
      hitCount: 3,
      attr: "S, NA",
      damage: 42,
      guardDamage: 5,
      kill: false,
      guardKill: false,
      priority: 6,
      p1SpritePriority: 3,
      p2SpritePriority: -2,
      pauseTime: 8,
      groundHitTime: 17,
      groundVelocity: [-4, -6],
      airVelocity: [-3, -8],
      guardDistance: 96,
      guardFlag: "MA",
      guardPauseTime: 4,
      guardHitTime: 11,
      guardSlideTime: 6,
      guardControlTime: 8,
      guardVelocity: [-2],
      airGuardVelocity: [-5, -2],
      groundCornerPush: 3,
      airCornerPush: 4,
      downCornerPush: 5,
      guardCornerPush: 6,
      airGuardCornerPush: 7,
      hitSound: "S5,0",
      guardSound: "S6,0",
      hitSpark: "S7001",
      guardSpark: "S7000",
      sparkXy: [12, -64],
      p1StateNo: 210,
      p2StateNo: 5100,
      p2GetP1State: false,
      missOnOverride: false,
      fall: {
        enabled: true,
        kill: false,
        yVelocity: -7,
        recover: false,
        recoverTime: 19,
        downRecover: true,
        downRecoverTime: 45,
      },
    });
  });

  it("preserves authored versus omitted static HitDef sprite priorities", () => {
    const authored = compileControllerIr(
      controller(200, "HitDef", [], {
        p1sprpriority: "4",
        p2sprpriority: "-3",
      }),
    );
    const omitted = compileControllerIr(controller(200, "HitDef", [], {}));
    const dynamic = compileControllerIr(
      controller(200, "HitDef", [], {
        p1sprpriority: "var(0)",
        p2sprpriority: "fvar(1)",
      }),
    );

    expect(authored.operation).toMatchObject({
      kind: "hitdef",
      p1SpritePriority: 4,
      p2SpritePriority: -3,
    });
    expect(omitted.operation).not.toHaveProperty("p1SpritePriority");
    expect(omitted.operation).not.toHaveProperty("p2SpritePriority");
    expect(dynamic.operation).not.toHaveProperty("p1SpritePriority");
    expect(dynamic.operation).not.toHaveProperty("p2SpritePriority");
  });

  it("compiles Target controllers into typed target operations", () => {
    const life = compileControllerIr(controller(200, "TargetLifeAdd", [], { id: "3", value: "-20", absolute: "1", kill: "0" }));
    const bind = compileControllerIr(controller(200, "TargetBind", [], { id: "3", pos: "12,-8", time: "6" }));
    const bindToTarget = compileControllerIr(controller(200, "BindToTarget", [], { id: "3", pos: "12,-8,Foot", time: "6" }));
    const state = compileControllerIr(controller(200, "TargetState", [], { id: "3", value: "5300" }));
    const drop = compileControllerIr(controller(200, "TargetDrop", [], { excludeID: "3", keepone: "1" }));
    const defaultDrop = compileControllerIr(controller(200, "TargetDrop", [], { excludeID: "3" }));

    expect(life.operation).toMatchObject({
      kind: "target",
      controllerType: "targetlifeadd",
      requestedId: 3,
      value: -20,
      absolute: true,
      kill: false,
    });
    expect(bind.operation).toMatchObject({
      kind: "target",
      controllerType: "targetbind",
      requestedId: 3,
      pos: [12, -8],
      time: 6,
    });
    expect(bindToTarget.operation).toMatchObject({
      kind: "bindtotarget",
      requestedId: 3,
      pos: [12, -8],
      postype: "foot",
      time: 6,
    });
    expect(compileControllerIr(controller(200, "BindToTarget", [], { id: "3", pos: "12,-8,Head", time: "6" })).operation).toMatchObject({
      kind: "bindtotarget",
      postype: "head",
    });
    expect(state.operation).toMatchObject({
      kind: "target",
      controllerType: "targetstate",
      requestedId: 3,
      stateNo: 5300,
    });
    expect(drop.operation).toMatchObject({
      kind: "target",
      controllerType: "targetdrop",
      excludeId: 3,
      keepOne: true,
    });
    expect(defaultDrop.operation).toMatchObject({
      kind: "target",
      controllerType: "targetdrop",
      excludeId: 3,
      keepOne: true,
    });
  });

  it("compiles helper owner bind controllers into typed helper-bind operations", () => {
    expect(compileControllerIr(controller(6000, "BindToParent", [], { pos: "24,-18", time: "7", facing: "-1" })).operation).toEqual({
      kind: "helper-bind",
      controllerType: "bindtoparent",
      pos: [24, -18],
      time: 7,
      facing: -1,
    });
    expect(compileControllerIr(controller(6000, "BindToRoot", [], { time: "-1" })).operation).toEqual({
      kind: "helper-bind",
      controllerType: "bindtoroot",
      pos: [0, 0],
      time: Number.POSITIVE_INFINITY,
    });
  });

  it("compiles Pause and SuperPause controllers into typed pause operations", () => {
    const pause = compileControllerIr(controller(200, "Pause", [], { time: "8", movetime: "2", poweradd: "999" }));
    const superPause = compileControllerIr(
      controller(200, "SuperPause", [], {
        time: "12",
        movetime: "4",
        darken: "0",
        poweradd: "100",
        p2defmul: "2",
        sound: "S10,0",
        anim: "S200",
        pos: "24,-48",
      }),
    );

    expect(pause.operation).toMatchObject({
      kind: "pause",
      controllerType: "pause",
        time: 8,
        moveTime: 2,
        pauseBg: true,
        darken: false,
        powerAdd: 0,
    });
    expect(superPause.operation).toMatchObject({
      kind: "pause",
      controllerType: "superpause",
        time: 12,
        moveTime: 4,
        pauseBg: true,
        darken: false,
      powerAdd: 100,
      p2DefMul: 2,
      sound: "S10,0",
      anim: "S200",
      pos: [24, -48],
    });
  });

  it("compiles static PlaySnd and StopSnd controllers into typed audio operations", () => {
    const play = compileControllerIr(controller(200, "PlaySnd", [], { value: "S5,0", channel: "2", lowpriority: "1", volumescale: "50", volume: "-8", freqmul: "0.5", loop: "1", pan: "32" }));
    const absolutePan = compileControllerIr(controller(200, "PlaySnd", [], { value: "S5,1", abspan: "-64" }));
    const pan = compileControllerIr(controller(200, "SndPan", [], { channel: "2", pan: "-48" }));
    const absoluteChannelPan = compileControllerIr(controller(200, "SndPan", [], { channel: "3", abspan: "96" }));
    const stop = compileControllerIr(controller(200, "StopSnd", [], { channel: "2" }));
    const dynamic = compileControllerIr(controller(200, "PlaySnd", [], { value: "var(0),1" }));
    const dynamicValue = compileControllerIr(controller(200, "PlaySnd", [], { value: "Fvar(0),var(1)" }));
    const dynamicPan = compileControllerIr(controller(200, "PlaySnd", [], { value: "S5,0", pan: "var(0)" }));
    const dynamicSndPan = compileControllerIr(controller(200, "SndPan", [], { channel: "2", pan: "var(0)" }));
    const invalidPan = compileControllerIr(controller(200, "SndPan", [], { pan: "-48" }));

    expect(play.operation).toEqual({
      kind: "audio",
      controllerType: "playsnd",
      value: "S5,0",
      channel: 2,
      lowPriority: true,
      volumeScale: 50,
      legacyVolume: -8,
      freqMul: 0.5,
      loop: true,
      pan: 32,
    });
    expect(absolutePan.operation).toEqual({
      kind: "audio",
      controllerType: "playsnd",
      value: "S5,1",
      absPan: -64,
    });
    expect(pan.operation).toEqual({
      kind: "audio",
      controllerType: "sndpan",
      channel: 2,
      pan: -48,
    });
    expect(absoluteChannelPan.operation).toEqual({
      kind: "audio",
      controllerType: "sndpan",
      channel: 3,
      absPan: 96,
    });
    expect(stop.operation).toEqual({
      kind: "audio",
      controllerType: "stopsnd",
      channel: 2,
    });
    expect(dynamic.operation).toBeUndefined();
    expect(dynamicValue.operation).toBeUndefined();
    expect(dynamicPan.operation).toBeUndefined();
    expect(dynamicSndPan.operation).toBeUndefined();
    expect(invalidPan.operation).toBeUndefined();
  });

  it("compiles static EnvShake controllers into typed camera-shake operations", () => {
    const shake = compileControllerIr(controller(200, "EnvShake", [], { time: "999", freq: "-30", ampl: "-99", phase: "1.5" }));
    const defaults = compileControllerIr(controller(200, "EnvShake", [], { time: "8" }));
    const zero = compileControllerIr(controller(200, "EnvShake", [], { time: "0" }));
    const dynamic = compileControllerIr(controller(200, "EnvShake", [], { time: "var(0)" }));

    expect(shake.operation).toEqual({
      kind: "envshake",
      time: 240,
      freq: 30,
      ampl: -64,
      phase: 1.5,
    });
    expect(defaults.operation).toEqual({
      kind: "envshake",
      time: 8,
      freq: 60,
      ampl: -4,
      phase: 0,
    });
    expect(zero.operation).toBeUndefined();
    expect(dynamic.operation).toBeUndefined();
  });

  it("compiles simple movement controllers into typed kinematic operations", () => {
    const velSet = compileControllerIr(controller(200, "VelSet", [], { value: "4,-3" }));
    const velAdd = compileControllerIr(controller(200, "VelAdd", [], { y: "0.5" }));
    const posSet = compileControllerIr(controller(200, "PosSet", [], { x: "12", y: "-24" }));
    const posAdd = compileControllerIr(controller(200, "PosAdd", [], { value: "8,-2" }));
    const hitVelSet = compileControllerIr(controller(200, "HitVelSet", [], { x: "1", y: "0" }));
    const gravity = compileControllerIr(controller(200, "Gravity", [], {}));
    const dynamic = compileControllerIr(controller(200, "VelAdd", [], { y: "Const(movement.yaccel)" }));

    expect(velSet.operation).toEqual({ kind: "kinematic", controllerType: "velset", x: 4, y: -3 });
    expect(velAdd.operation).toEqual({ kind: "kinematic", controllerType: "veladd", y: 0.5 });
    expect(posSet.operation).toEqual({ kind: "kinematic", controllerType: "posset", x: 12, y: -24 });
    expect(posAdd.operation).toEqual({ kind: "kinematic", controllerType: "posadd", x: 8, y: -2 });
    expect(hitVelSet.operation).toEqual({ kind: "kinematic", controllerType: "hitvelset", x: 1, y: 0 });
    expect(gravity.operation).toEqual({ kind: "kinematic", controllerType: "gravity", y: 0.55 });
    expect(dynamic.operation).toBeUndefined();
  });

  it("compiles static bounds controllers into typed operations", () => {
    const posFreeze = compileControllerIr(controller(200, "PosFreeze", [], { x: "1", y: "0" }));
    const posFreezeDefault = compileControllerIr(controller(200, "PosFreeze", [], {}));
    const screenBound = compileControllerIr(controller(200, "ScreenBound", [], { value: "0", movecamera: "0,1" }));
    const dynamic = compileControllerIr(controller(200, "ScreenBound", [], { value: "Const(data.life)" }));

    expect(posFreeze.operation).toEqual({ kind: "bounds", controllerType: "posfreeze", x: true, y: false });
    expect(posFreezeDefault.operation).toEqual({ kind: "bounds", controllerType: "posfreeze", x: true, y: true });
    expect(screenBound.operation).toEqual({
      kind: "bounds",
      controllerType: "screenbound",
      bound: false,
      moveCameraX: false,
      moveCameraY: true,
    });
    expect(dynamic.operation).toBeUndefined();
  });

  it("compiles static Width controllers into typed collision operations", () => {
    const width = compileControllerIr(controller(200, "Width", [], { player: "18,44" }));
    const valueFallback = compileControllerIr(controller(200, "Width", [], { value: "9" }));
    const dynamic = compileControllerIr(controller(200, "Width", [], { player: "Const(size.ground.front),44" }));

    expect(width.operation).toEqual({ kind: "collision", controllerType: "width", front: 18, back: 44 });
    expect(valueFallback.operation).toEqual({ kind: "collision", controllerType: "width", front: 9, back: 9 });
    expect(dynamic.operation).toBeUndefined();
  });

  it("compiles static PlayerPush controllers into typed collision operations", () => {
    const disabled = compileControllerIr(controller(200, "PlayerPush", [], { value: "0" }));
    const enabled = compileControllerIr(controller(200, "PlayerPush", [], { value: "1" }));
    const defaultEnabled = compileControllerIr(controller(200, "PlayerPush", [], {}));
    const dynamic = compileControllerIr(controller(200, "PlayerPush", [], { value: "Const(data.life)" }));

    expect(disabled.operation).toEqual({ kind: "collision", controllerType: "playerpush", enabled: false });
    expect(enabled.operation).toEqual({ kind: "collision", controllerType: "playerpush", enabled: true });
    expect(defaultEnabled.operation).toEqual({ kind: "collision", controllerType: "playerpush", enabled: true });
    expect(dynamic.operation).toBeUndefined();
  });

  it("compiles Turn controllers into typed orientation operations", () => {
    const turn = compileControllerIr(controller(200, "Turn", [], {}));

    expect(turn.operation).toEqual({ kind: "orientation", controllerType: "turn" });
  });

  it("compiles static SprPriority controllers into typed sprite-effect operations", () => {
    const value = compileControllerIr(controller(200, "SprPriority", [], { value: "5" }));
    const priority = compileControllerIr(controller(200, "SprPriority", [], { priority: "99" }));
    const dynamic = compileControllerIr(controller(200, "SprPriority", [], { value: "Const(data.life)" }));

    expect(value.operation).toEqual({ kind: "sprite-effect", controllerType: "sprpriority", priority: 5 });
    expect(priority.operation).toEqual({ kind: "sprite-effect", controllerType: "sprpriority", priority: 10 });
    expect(dynamic.operation).toBeUndefined();
  });

  it("compiles static PalFX controllers into typed sprite-effect operations", () => {
    const value = compileControllerIr(
      controller(200, "PalFX", [], {
        time: "18",
        add: "80,-10,300",
        mul: "256,160,160",
        color: "999",
        invertall: "1",
      }),
    );
    const clear = compileControllerIr(controller(200, "PalFX", [], { time: "0" }));
    const dynamic = compileControllerIr(controller(200, "PalFX", [], { time: "18", add: "Const(data.life),0,0" }));

    expect(value.operation).toEqual({
      kind: "sprite-effect",
      controllerType: "palfx",
      time: 18,
      add: [80, -10, 255],
      mul: [256, 160, 160],
      color: 256,
      invert: true,
    });
    expect(clear.operation).toEqual({
      kind: "sprite-effect",
      controllerType: "palfx",
      time: 0,
      add: [0, 0, 0],
      mul: [256, 256, 256],
      color: 256,
      invert: false,
    });
    expect(dynamic.operation).toBeUndefined();
  });

  it("compiles static RemapPal controllers into typed sprite-effect operations", () => {
    const value = compileControllerIr(controller(200, "RemapPal", [], { source: "-1,1.4", dest: "2,3" }));
    const dynamic = compileControllerIr(controller(200, "RemapPal", [], { source: "Const(data.life),1", dest: "2,3" }));
    const missing = compileControllerIr(controller(200, "RemapPal", [], { source: "1,1" }));

    expect(value.operation).toEqual({
      kind: "sprite-effect",
      controllerType: "remappal",
      source: [0, 1],
      dest: [2, 3],
    });
    expect(dynamic.operation).toBeUndefined();
    expect(missing.operation).toBeUndefined();
  });

  it("compiles static AfterImage controllers into typed sprite-effect operations", () => {
    const value = compileControllerIr(
      controller(200, "AfterImage", [], {
        time: "20",
        length: "4",
        timegap: "2",
        framegap: "1",
        paladd: "0,40,90",
        palmul: "160,160,256",
        trans: "add",
      }),
    );
    const defaults = compileControllerIr(controller(200, "AfterImage", [], {}));
    const dynamic = compileControllerIr(controller(200, "AfterImage", [], { time: "Const(data.life)" }));

    expect(value.operation).toEqual({
      kind: "sprite-effect",
      controllerType: "afterimage",
      time: 20,
      length: 4,
      timeGap: 2,
      frameGap: 1,
      palAdd: [0, 40, 90],
      palMul: [160, 160, 256],
      opacity: 0.34,
    });
    expect(defaults.operation).toEqual({
      kind: "sprite-effect",
      controllerType: "afterimage",
      time: 20,
      length: 6,
      timeGap: 1,
      frameGap: 1,
      palAdd: [0, 0, 0],
      palMul: [192, 192, 192],
      opacity: 0.42,
    });
    expect(dynamic.operation).toBeUndefined();
  });

  it("compiles static AfterImageTime controllers into typed sprite-effect operations", () => {
    const time = compileControllerIr(controller(200, "AfterImageTime", [], { time: "11" }));
    const value = compileControllerIr(controller(200, "AfterImageTime", [], { value: "999" }));
    const dynamic = compileControllerIr(controller(200, "AfterImageTime", [], { value: "Const(data.life)" }));

    expect(time.operation).toEqual({ kind: "sprite-effect", controllerType: "afterimagetime", time: 11 });
    expect(value.operation).toEqual({ kind: "sprite-effect", controllerType: "afterimagetime", time: 600 });
    expect(dynamic.operation).toBeUndefined();
  });

  it("compiles static StateTypeSet controllers into typed metadata operations", () => {
    const stateTypeSet = compileControllerIr(controller(200, "StateTypeSet", [], { statetype: "C", movetype: "A", physics: "N" }));
    const partial = compileControllerIr(controller(200, "StateTypeSet", [], { movetype: "I" }));
    const dynamic = compileControllerIr(controller(200, "StateTypeSet", [], { statetype: "IfElse(Time > 0, A, S)" }));

    expect(stateTypeSet.operation).toEqual({
      kind: "metadata",
      controllerType: "statetypeset",
      stateType: "C",
      moveType: "A",
      physics: "N",
    });
    expect(partial.operation).toEqual({ kind: "metadata", controllerType: "statetypeset", moveType: "I" });
    expect(dynamic.operation).toBeUndefined();
  });

  it("compiles static resource and variable controllers into typed operations", () => {
    const ctrl = compileControllerIr(controller(200, "CtrlSet", [], { value: "1" }));
    const life = compileControllerIr(controller(200, "LifeAdd", [], { value: "-25", kill: "0" }));
    const power = compileControllerIr(controller(200, "PowerSet", [], { value: "1000" }));
    const varSet = compileControllerIr(controller(200, "VarSet", [], { v: "3", value: "8" }));
    const varAdd = compileControllerIr(controller(200, "VarAdd", [], { "var(1)": "7" }));
    const fvarSet = compileControllerIr(controller(200, "VarSet", [], { fv: "2", value: "1.5" }));
    const sysvarSet = compileControllerIr(controller(200, "VarSet", [], { "sysvar(0)": "1" }));
    const sysvarAdd = compileControllerIr(controller(200, "VarAdd", [], { "sysvar(0)": "2" }));
    const varRandom = compileControllerIr(controller(200, "VarRandom", [], { v: "5", range: "10,12" }));
    const range = compileControllerIr(controller(200, "VarRangeSet", [], { first: "2", last: "4", value: "9" }));
    const dynamic = compileControllerIr(controller(200, "PowerAdd", [], { value: "Const(data.power)" }));

    expect(ctrl.operation).toEqual({ kind: "resource", controllerType: "ctrlset", value: true });
    expect(life.operation).toEqual({ kind: "resource", controllerType: "lifeadd", value: -25, kill: false });
    expect(power.operation).toEqual({ kind: "resource", controllerType: "powerset", value: 1000 });
    expect(varSet.operation).toEqual({ kind: "variable", controllerType: "varset", variableType: "var", index: 3, value: 8 });
    expect(varAdd.operation).toEqual({ kind: "variable", controllerType: "varadd", variableType: "var", index: 1, value: 7 });
    expect(fvarSet.operation).toEqual({ kind: "variable", controllerType: "varset", variableType: "fvar", index: 2, value: 1.5 });
    expect(sysvarSet.operation).toEqual({ kind: "variable", controllerType: "varset", variableType: "sysvar", index: 0, value: 1 });
    expect(sysvarAdd.operation).toEqual({ kind: "variable", controllerType: "varadd", variableType: "sysvar", index: 0, value: 2 });
    expect(varRandom.operation).toEqual({ kind: "variable", controllerType: "varrandom", variableType: "var", index: 5, min: 10, max: 12 });
    expect(range.operation).toEqual({ kind: "variable", controllerType: "varrangeset", variableType: "var", first: 2, last: 4, value: 9 });
    expect(dynamic.operation).toBeUndefined();
  });

  it("compiles static hit eligibility controllers into typed operations", () => {
    const hitBy = compileControllerIr(controller(200, "HitBy", [], { value: "S,NA", value2: "A,SA", time: "8" }));
    const notHitBy = compileControllerIr(controller(200, "NotHitBy", [], { value: "SCA", time: "12" }));
    const override = compileControllerIr(
      controller(200, "HitOverride", [], {
        attr: "S,NA",
        stateno: "777",
        slot: "1",
        time: "12",
        guardflag: "MA",
        "guardflag.not": "A",
        forceair: "1",
        forceguard: "0",
        keepstate: "1",
      }),
    );
    const dynamic = compileControllerIr(controller(200, "HitOverride", [], { attr: "S,NA", stateno: "Const(data.life)" }));

    expect(hitBy.operation).toEqual({
      kind: "eligibility",
      controllerType: "hitby",
      mode: "allow",
      slots: [
        { slot: 1, attr: "S,NA", remaining: 8 },
        { slot: 2, attr: "A,SA", remaining: 8 },
      ],
    });
    expect(notHitBy.operation).toEqual({
      kind: "eligibility",
      controllerType: "nothitby",
      mode: "deny",
      slots: [{ slot: 1, attr: "SCA", remaining: 12 }],
    });
    expect(override.operation).toEqual({
      kind: "hitoverride",
      slot: 1,
      attr: "S,NA",
      remaining: 12,
      stateNo: 777,
      guardFlag: "MA",
      guardFlagNot: "A",
      forceAir: true,
      forceGuard: false,
      keepState: true,
    });
    expect(dynamic.operation).toBeUndefined();
  });

  it("compiles static ReversalDef controllers into typed operations", () => {
    const reversal = compileControllerIr(
      controller(200, "ReversalDef", [], {
        "reversal.attr": "SA,AA",
        pausetime: "3,3",
        p1stateno: "777",
        p2stateno: "778",
        id: "88",
      }),
    );
    const dynamic = compileControllerIr(
      controller(200, "ReversalDef", [], {
        "reversal.attr": "SA,AA",
        p1stateno: "Const(data.life)",
      }),
    );

    expect(reversal.operation).toEqual({
      kind: "reversaldef",
      attr: "SA,AA",
      hitPause: 3,
      p1StateNo: 777,
      p2StateNo: 778,
      targetId: 88,
    });
    expect(dynamic.operation).toBeUndefined();
  });

  it("compiles static damage scale controllers into typed operations", () => {
    const attack = compileControllerIr(controller(200, "AttackMulSet", [], { value: "1.5" }));
    const defence = compileControllerIr(controller(0, "DefenceMulSet", [], { value: "0.5" }));
    const dynamic = compileControllerIr(controller(200, "AttackMulSet", [], { value: "Const(data.attack)" }));

    expect(attack.operation).toEqual({
      kind: "damage-scale",
      controllerType: "attackmulset",
      multiplier: 1.5,
    });
    expect(defence.operation).toEqual({
      kind: "damage-scale",
      controllerType: "defencemulset",
      multiplier: 0.5,
    });
    expect(dynamic.operation).toBeUndefined();
  });

  it("compiles HitDef fall.defence_up into typed fall metadata", () => {
    const hitDef = compileControllerIr(
      controller(200, "HitDef", [], {
        damage: "40",
        fall: "1",
        "fall.damage": "20",
        "fall.defence_up": "150",
      }),
    );

    expect(hitDef.operation).toMatchObject({
      kind: "hitdef",
      damage: 40,
      fall: {
        enabled: true,
        damage: 20,
        defenceUp: 150,
      },
    });
  });

  it("applies CNS Data spark defaults while compiling HitDef controller ops", () => {
    const program = compileRuntimeProgram({
      commands: [],
      animations: new Map<number, MugenAnimationAction>([[200, action(200)]]),
      states: [state(200, 200, [controller(200, "HitDef", [], { damage: "30" })])],
      stateEntryControllers: [],
      constants: {
        "data.sparkno": 2,
        "data.guard.sparkno": 40,
      },
    });

    expect(program.states[0]?.controllers[0]?.operation).toMatchObject({
      kind: "hitdef",
      hitSpark: "2",
      guardSpark: "40",
    });
  });

  it("keeps explicit HitDef spark refs ahead of CNS Data defaults", () => {
    const program = compileRuntimeProgram({
      commands: [],
      animations: new Map<number, MugenAnimationAction>([[200, action(200)]]),
      states: [
        state(200, 200, [
          controller(200, "HitDef", [], {
            damage: "30",
            sparkno: "S7001",
            "guard.sparkno": "F7004",
          }),
        ]),
      ],
      stateEntryControllers: [],
      constants: {
        "data.sparkno": 2,
        "data.guard.sparkno": 40,
      },
    });

    expect(program.states[0]?.controllers[0]?.operation).toMatchObject({
      kind: "hitdef",
      hitSpark: "S7001",
      guardSpark: "F7004",
    });
  });

  it("compiles HitDef get-hit anim and type metadata into typed data", () => {
    const hitDef = compileControllerIr(
      controller(200, "HitDef", [], {
        id: "91",
        chainID: "43",
        numhits: "3",
        damage: "40",
        animtype: "Medium",
        "fall.animtype": "Up",
        "ground.type": "Low",
        "air.type": "Trip",
        yaccel: ".62",
        snap: "16,-24",
      }),
    );

    expect(hitDef.operation).toMatchObject({
      kind: "hitdef",
      id: 91,
      chainId: 43,
      hitCount: 3,
      damage: 40,
      animType: 1,
      fallAnimType: 4,
      groundType: 2,
      airType: 3,
      yAccel: 0.62,
      snap: [16, -24],
    });
  });

  it("compiles Trans controllers into typed sprite opacity operations", () => {
    const trans = compileControllerIr(controller(200, "Trans", [], { trans: "addalpha,128,128" }));
    const alpha = compileControllerIr(controller(200, "Trans", [], { trans: "addalpha", alpha: "96,160" }));
    const dynamic = compileControllerIr(controller(200, "Trans", [], { trans: "addalpha", alpha: "var(0),var(1)" }));
    const inlineDynamic = compileControllerIr(controller(200, "Trans", [], { trans: "addalpha,var(0),var(1)" }));

    expect(trans.operation).toEqual({
      kind: "sprite-effect",
      controllerType: "trans",
      trans: "addalpha,128,128",
      opacity: 0.5,
    });
    expect(alpha.operation).toEqual({
      kind: "sprite-effect",
      controllerType: "trans",
      trans: "addalpha",
      opacity: 0.375,
    });
    expect(dynamic.operation).toBeUndefined();
    expect(inlineDynamic.operation).toBeUndefined();
  });

  it("compiles static Angle controllers into typed sprite rotation operations", () => {
    const angleSet = compileControllerIr(controller(200, "AngleSet", [], { value: "45" }));
    const angleAdd = compileControllerIr(controller(200, "AngleAdd", [], { value: "10" }));
    const angleMul = compileControllerIr(controller(200, "AngleMul", [], { value: "1.5" }));
    const angleDraw = compileControllerIr(controller(200, "AngleDraw", [], {}));
    const angleDrawValueScale = compileControllerIr(controller(200, "AngleDraw", [], { value: "35", scale: "2,0.5" }));
    const dynamic = compileControllerIr(controller(200, "AngleSet", [], { value: "Const(data.life)" }));
    const dynamicMul = compileControllerIr(controller(200, "AngleMul", [], { value: "fvar(0)" }));
    const dynamicDraw = compileControllerIr(controller(200, "AngleDraw", [], { value: "var(0)", scale: "2,0.5" }));
    const dynamicScale = compileControllerIr(controller(200, "AngleDraw", [], { value: "35", scale: "var(0),0.5" }));

    expect(angleSet.operation).toEqual({ kind: "sprite-effect", controllerType: "angleset", angle: 45 });
    expect(angleAdd.operation).toEqual({ kind: "sprite-effect", controllerType: "angleadd", delta: 10 });
    expect(angleMul.operation).toEqual({ kind: "sprite-effect", controllerType: "anglemul", multiplier: 1.5 });
    expect(angleDraw.operation).toEqual({ kind: "sprite-effect", controllerType: "angledraw" });
    expect(angleDrawValueScale.operation).toEqual({
      kind: "sprite-effect",
      controllerType: "angledraw",
      angle: 35,
      scale: [2, 0.5],
    });
    expect(dynamic.operation).toBeUndefined();
    expect(dynamicMul.operation).toBeUndefined();
    expect(dynamicDraw.operation).toBeUndefined();
    expect(dynamicScale.operation).toBeUndefined();
  });

  it("compiles EnvColor controllers into typed stage flash operations", () => {
    const envColor = compileControllerIr(controller(200, "EnvColor", [], { value: "16,96,300", time: "999", under: "1" }));
    const dynamic = compileControllerIr(
      controller(200, "EnvColor", [], { value: "var(0),var(1),var(2)", time: "var(3)", under: "var(4)" }),
    );

    expect(envColor.operation).toEqual({
      kind: "envcolor",
      color: [16, 96, 255],
      time: 240,
      under: true,
    });
    expect(dynamic.operation).toBeUndefined();
  });

  it("compiles Projectile controllers into typed projectile operations", () => {
    const projectile = compileControllerIr(
      controller(1000, "Projectile", [], {
        projid: "77",
        id: "78",
        chainID: "43",
        numhits: "3",
        projanim: "910",
        offset: "62,-45",
        postype: "p1",
        velocity: "12,0",
        accel: "0.5,0.25",
        velmul: "0.75,1.25",
        projscale: "2,0.5",
        facing: "-1",
        projhitanim: "911",
        projremanim: "912",
        projcancelanim: "913",
        projremovetime: "60",
        projhits: "2",
        projmisstime: "3",
        damage: "31",
        kill: "0",
        "guard.kill": "0",
        attr: "S, SP",
        pausetime: "4,4",
        "ground.hittime": "13",
        "ground.velocity": "-5,-2",
        "air.velocity": "-4,-8",
        "guard.velocity": "-3,-1",
        "airguard.velocity": "-6,-2",
        "ground.cornerpush.veloff": "3",
        "air.cornerpush.veloff": "4",
        "down.cornerpush.veloff": "5",
        "guard.cornerpush.veloff": "6",
        "airguard.cornerpush.veloff": "7",
        p2stateno: "889",
        p2getp1state: "0",
        missonoverride: "1",
        sprpriority: "7",
        trans: "add",
        projremove: "0",
      }),
    );

    expect(projectile.operation).toMatchObject({
      kind: "projectile",
      projectileId: 77,
      targetId: 78,
      chainId: 43,
      hitDefHitCount: 3,
      projAnim: 910,
      offset: [62, -45],
      postype: "p1",
      velocity: [12, 0],
      acceleration: [0.5, 0.25],
      velocityMultiplier: [0.75, 1.25],
      scale: [2, 0.5],
      facing: -1,
      hitAnim: 911,
      removeAnim: 912,
      cancelAnim: 913,
      removeTime: 60,
      hitCount: 2,
      missTime: 3,
      damage: 31,
      kill: false,
      guardKill: false,
      attr: "S, SP",
      hitPause: 4,
      hitStun: 13,
      groundVelocity: [-5, -2],
      airVelocity: [-4, -8],
      guardVelocity: [-3, -1],
      airGuardVelocity: [-6, -2],
      groundCornerPush: 3,
      airCornerPush: 4,
      downCornerPush: 5,
      guardCornerPush: 6,
      airGuardCornerPush: 7,
      p2StateNo: 889,
      p2GetP1State: false,
      missOnOverride: true,
      spritePriority: 7,
      trans: "add",
      removeOnHit: false,
    });
  });

  it("compiles ModifyProjectile controllers into typed projectile mutation operations", () => {
    const modifyProjectile = compileControllerIr(
      controller(1000, "ModifyProjectile", [], {
        projid: "77",
        velocity: "5,-1",
        accel: "0.25,0",
        velmul: "0.5,1",
        projscale: "1.5,0.75",
        projedgebound: "48",
        projstagebound: "32",
        projheightbound: "-96,64",
        projremovetime: "18",
        sprpriority: "8",
        projpriority: "3",
        projhits: "4",
        projmisstime: "5",
        projremove: "0",
      }),
    );

    expect(modifyProjectile.operation).toEqual({
      kind: "modifyprojectile",
      projectileId: 77,
      velocity: [5, -1],
      acceleration: [0.25, 0],
      velocityMultiplier: [0.5, 1],
      scale: [1.5, 0.75],
      edgeBound: 48,
      stageBound: 32,
      heightBound: { low: -96, high: 64 },
      removeTime: 18,
      spritePriority: 8,
      priority: 3,
      hitCount: 4,
      missTime: 5,
      removeOnHit: false,
    });
  });

  it("compiles Helper controllers into typed helper operations", () => {
    const helper = compileControllerIr(
      controller(200, "Helper", [], {
        id: "42",
        name: '"Buddy"',
        stateno: "1200",
        anim: "920",
        pos: "-44,-28",
        velset: "3,-1",
        "size.xscale": "1.5",
        "size.yscale": "0.75",
        ignorehitpause: "1",
        pausemovetime: "2",
        supermovetime: "4",
        postype: "p1",
        facing: "1",
        removetime: "30",
        sprpriority: "8",
      }),
    );

    expect(helper.operation).toMatchObject({
      kind: "helper",
      helperId: 42,
      name: "Buddy",
      stateNo: 1200,
      animNo: 920,
      pos: [-44, -28],
      velocity: [3, -1],
      scale: [1.5, 0.75],
      ignoreHitPause: true,
      pauseMoveTime: 2,
      superMoveTime: 4,
      postype: "p1",
      facing: 1,
      removeTime: 30,
      spritePriority: 8,
    });
  });

  it("compiles Explod, ModifyExplod, and RemoveExplod controllers into typed effect operations", () => {
    const explod = compileControllerIr(
      controller(200, "Explod", [], {
        id: "9000",
        anim: "930",
        pos: "42,-58",
        postype: "p1",
        bindtime: "12",
        scale: "1.25,0.5",
        vel: "3,-1",
        accel: "0.5,0.25",
        facing: "-1",
        removetime: "18",
        removeongethit: "1",
        ignorehitpause: "1",
        pausemovetime: "2",
        supermovetime: "4",
        sprpriority: "6",
        trans: "add",
      }),
    );
    const modifyExplod = compileControllerIr(
      controller(200, "ModifyExplod", [], {
        id: "9000",
        bindtime: "6",
        scale: "2,0.5",
        vel: "4,-2",
        accel: "1,0.25",
        facing: "1",
        removetime: "24",
        removeongethit: "1",
        ignorehitpause: "1",
        pausemovetime: "3",
        supermovetime: "5",
        sprpriority: "8",
        trans: "none",
      }),
    );
    const removeExplod = compileControllerIr(controller(200, "RemoveExplod", [], { id: "9000" }));

    expect(explod.operation).toMatchObject({
      kind: "explod",
      explodId: 9000,
      animNo: 930,
      pos: [42, -58],
      postype: "p1",
      bindTime: 12,
      scale: [1.25, 0.5],
      velocity: [3, -1],
      acceleration: [0.5, 0.25],
      facing: -1,
      removeTime: 18,
      removeOnGetHit: true,
      ignoreHitPause: true,
      pauseMoveTime: 2,
      superMoveTime: 4,
      spritePriority: 6,
      trans: "add",
    });
    expect(removeExplod.operation).toMatchObject({
      kind: "removeexplod",
      explodId: 9000,
    });
    expect(modifyExplod.operation).toMatchObject({
      kind: "modifyexplod",
      explodId: 9000,
      bindTime: 6,
      scale: [2, 0.5],
      velocity: [4, -2],
      acceleration: [1, 0.25],
      facing: 1,
      removeTime: 24,
      removeOnGetHit: true,
      ignoreHitPause: true,
      pauseMoveTime: 3,
      superMoveTime: 5,
      spritePriority: 8,
      trans: "none",
    });
  });

  it("compiles HitFall and FallEnvShake controllers into typed fall operations", () => {
    const hitFallVel = compileControllerIr(controller(5100, "HitFallVel", [], {}));
    const hitFallDamage = compileControllerIr(controller(5100, "HitFallDamage", [], {}));
    const hitFallSet = compileControllerIr(
      controller(5100, "HitFallSet", [], {
        value: "0",
        xvel: "2",
        yvel: "-7",
      }),
    );
    const fallEnvShake = compileControllerIr(controller(5100, "FallEnvShake", [], {}));

    expect(hitFallVel.operation).toMatchObject({
      kind: "hitfall",
      controllerType: "hitfallvel",
    });
    expect(hitFallDamage.operation).toMatchObject({
      kind: "hitfall",
      controllerType: "hitfalldamage",
    });
    expect(hitFallSet.operation).toMatchObject({
      kind: "hitfall",
      controllerType: "hitfallset",
      falling: false,
      xVelocity: 2,
      yVelocity: -7,
    });
    expect(fallEnvShake.operation).toEqual({ kind: "fallenvshake" });
  });
});

function action(id: number): MugenAnimationAction {
  return {
    id,
    rawLines: [`[Begin Action ${id}]`],
    frames: [
      {
        spriteGroup: id,
        spriteIndex: 0,
        offsetX: 0,
        offsetY: 0,
        duration: 4,
        clsn1: [],
        clsn2: [],
        raw: `${id},0,0,0,4`,
        line: 1,
      },
    ],
  };
}

function state(id: number, anim: number, controllers: MugenStateController[]): MugenStateDef {
  return {
    id,
    anim,
    rawParams: {},
    controllers,
    line: 1,
  };
}

function controller(
  stateId: number,
  type: string,
  triggers: string[],
  params: Record<string, string> = {},
): MugenStateController {
  return {
    stateId,
    type,
    triggers: triggers.map((expression, index) => ({
      index: index + 1,
      expression,
      raw: `trigger${index + 1} = ${expression}`,
      line: index + 1,
    })),
    params,
    line: 1,
    rawHeader: `[State ${stateId}, ${type}]`,
  };
}

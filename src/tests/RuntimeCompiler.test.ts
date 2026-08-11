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
    const helperVar = compileExpression("HelperVar(helpertype) = 1 && HelperVar(id) = 42 && HelperVar(keyctrl) = 1 && HelperVar(ownpal) = 1 && HelperVar(ownprojectile) = 1 && HelperVar(preserve) = 1 && HelperVar(ownclsnscale) = 1 && HelperVar(clsnproxy) = 1");
    const unsupportedHelperVar = compileExpression("HelperVar(unknownfield) = 1");
    const characterIdentity = compileExpression("ID >= 56 && PlayerNo = 1 && EnemyNear, ID >= 56");
    const hitDefAttr = compileExpression("HitDefAttr = SC, NA, SA, HA");
    const getHitVarAttr = compileExpression("GetHitVar(attr) = SCA, HA");
    const getHitVarGuardFlag = compileExpression("GetHitVar(guardflag) = MA");
    const getHitVarHitFlag = compileExpression("GetHitVar(hitflag) = MAF");
    const getHitVarProjectileId = compileExpression("GetHitVar(projid) = 77");
    const getHitVarTeamSide = compileExpression("GetHitVar(teamside) = 1");
    const getHitVarKeepState = compileExpression("GetHitVar(keepstate) = 1");
    const getHitVarFrame = compileExpression("GetHitVar(frame) = 1");
    const getHitVarPriority = compileExpression("GetHitVar(priority) = 4");
    const getHitVarDizzyPoints = compileExpression("GetHitVar(dizzypoints) = 20");
    const getHitVarGuardPoints = compileExpression("GetHitVar(guardpoints) = 15");
    const getHitVarGuardCount = compileExpression("GetHitVar(guardcount) = 2");
    const getHitVarHitCount = compileExpression("GetHitVar(hitcount) = 2");
    const getHitVarRedLife = compileExpression("GetHitVar(redlife) = 12");
    const getHitVarGuardPower = compileExpression("GetHitVar(guardpower) = 11");
    const getHitVarHitPower = compileExpression("GetHitVar(hitpower) = 5");
    const getHitVarPower = compileExpression("GetHitVar(power) = 6");
    const getHitVarScore = compileExpression("GetHitVar(score) = 6.5");
    const getHitVarFacing = compileExpression("GetHitVar(facing) = -1");
    const enemyNear = compileExpression("enemynear, stateno = 5000");
    const parentRedirect = compileExpression("Parent,Var(3) = 7");
    const rootRedirect = compileExpression("Root,Vel X = 4");
    const targetRedirect = compileExpression("Target(77), Life < 1000 && Target, StateNo >= 5000");
    const dynamicTargetRedirect = compileExpression("Target(var(0) + 1), Life > 0");
    const playerIdRedirect = compileExpression("PlayerID(58), Life < 1000");
    const dynamicPlayerIdRedirect = compileExpression("PlayerID(var(0)), Life > 0");
    const playerIdParameter = compileExpression("PlayerID(58)");
    const nestedRedirect = compileExpression("Time = 0 && Parent,Var(3) = 7 && Root,Vel X = 4");
    const p2Metrics = compileExpression(
      'NumEnemy && TeamSide = 1 && Facing = 1 && P2Facing = -1 && P2Life > 0 && P2Power >= 0 && Name = "KFM" && P1Name = "KFM" && P2Name != "Training" && AuthorName = "Elecbyte" && PrevAnim = 205 && PrevStateType = A && PrevMoveType = A',
    );
    const rosterIdentity = compileExpression(
      'NumPartner = 1 && P3Name = "Partner" && P4Name = "Enemy 2" && P5Name = "Partner 2" && P6Name = "Enemy 6" && P7Name = "Partner 3" && P8Name = "Enemy 8" && Partner, Life > 0 && Enemy(var(0)), Life > 0',
    );
    const enemyNearIndexed = compileExpression("enemynear(1), stateno = 5000");
    const enemyNearDynamicIndex = compileExpression("enemynear(var(0)), stateno = 5000");
    const unsupportedEnemyNearNegative = compileExpression("enemynear(-1), stateno = 5000");
    const unsupportedPartnerNegative = compileExpression("partner(-1), life > 0");
    const unsupportedParentIndex = compileExpression("Time = 0 && Parent(1),Var(3) = 7");
    const unsupportedTargetDynamic = compileExpression("Target(enemynear(1), stateno), Life > 0");
    const unsupportedTargetNegative = compileExpression("Target(-1), Life > 0");
    const unsupportedPlayerIdNegative = compileExpression("PlayerID(-1), Life > 0");

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
    expect(helperVar.supportLevel).toBe("executable");
    expect(helperVar.functions).toEqual(["HelperVar"]);
    expect(unsupportedHelperVar.supportLevel).toBe("unsupported");
    expect(helperIdentityFunction.functions).toEqual(["IsHelper"]);
    expect(helperIdentityFunction.identifiers).toEqual([]);
    expect(characterIdentity.supportLevel).toBe("executable");
    expect(characterIdentity.identifiers).toEqual(["ID", "PlayerNo"]);
    expect(hitDefAttr.supportLevel).toBe("executable");
    expect(hitDefAttr.identifiers).toEqual(["HitDefAttr"]);
    expect(getHitVarAttr.supportLevel).toBe("executable");
    expect(getHitVarAttr.functions).toEqual(["GetHitVar"]);
    expect(getHitVarAttr.identifiers).toEqual([]);
    expect(getHitVarGuardFlag.supportLevel).toBe("executable");
    expect(getHitVarGuardFlag.functions).toEqual(["GetHitVar"]);
    expect(getHitVarGuardFlag.identifiers).toEqual([]);
    expect(getHitVarHitFlag.supportLevel).toBe("executable");
    expect(getHitVarHitFlag.functions).toEqual(["GetHitVar"]);
    expect(getHitVarHitFlag.identifiers).toEqual([]);
    expect(getHitVarProjectileId.supportLevel).toBe("executable");
    expect(getHitVarProjectileId.functions).toEqual(["GetHitVar"]);
    expect(getHitVarProjectileId.identifiers).toEqual([]);
    expect(getHitVarTeamSide.supportLevel).toBe("executable");
    expect(getHitVarTeamSide.functions).toEqual(["GetHitVar"]);
    expect(getHitVarTeamSide.identifiers).toEqual([]);
    expect(getHitVarKeepState.supportLevel).toBe("executable");
    expect(getHitVarKeepState.functions).toEqual(["GetHitVar"]);
    expect(getHitVarKeepState.identifiers).toEqual([]);
    expect(getHitVarFrame.supportLevel).toBe("executable");
    expect(getHitVarFrame.functions).toEqual(["GetHitVar"]);
    expect(getHitVarFrame.identifiers).toEqual([]);
    expect(getHitVarPriority.supportLevel).toBe("executable");
    expect(getHitVarPriority.functions).toEqual(["GetHitVar"]);
    expect(getHitVarPriority.identifiers).toEqual([]);
    expect(getHitVarDizzyPoints.supportLevel).toBe("executable");
    expect(getHitVarDizzyPoints.functions).toEqual(["GetHitVar"]);
    expect(getHitVarDizzyPoints.identifiers).toEqual([]);
    expect(getHitVarGuardPoints.supportLevel).toBe("executable");
    expect(getHitVarGuardPoints.functions).toEqual(["GetHitVar"]);
    expect(getHitVarGuardPoints.identifiers).toEqual([]);
    expect(getHitVarGuardCount.supportLevel).toBe("executable");
    expect(getHitVarGuardCount.functions).toEqual(["GetHitVar"]);
    expect(getHitVarGuardCount.identifiers).toEqual([]);
    expect(getHitVarHitCount.supportLevel).toBe("executable");
    expect(getHitVarHitCount.functions).toEqual(["GetHitVar"]);
    expect(getHitVarHitCount.identifiers).toEqual([]);
    expect(getHitVarRedLife.supportLevel).toBe("executable");
    expect(getHitVarRedLife.functions).toEqual(["GetHitVar"]);
    expect(getHitVarRedLife.identifiers).toEqual([]);
    expect(getHitVarGuardPower.supportLevel).toBe("executable");
    expect(getHitVarGuardPower.functions).toEqual(["GetHitVar"]);
    expect(getHitVarGuardPower.identifiers).toEqual([]);
    expect(getHitVarHitPower.supportLevel).toBe("executable");
    expect(getHitVarHitPower.functions).toEqual(["GetHitVar"]);
    expect(getHitVarHitPower.identifiers).toEqual([]);
    expect(getHitVarPower.supportLevel).toBe("executable");
    expect(getHitVarPower.functions).toEqual(["GetHitVar"]);
    expect(getHitVarPower.identifiers).toEqual([]);
    expect(getHitVarScore.supportLevel).toBe("executable");
    expect(getHitVarScore.functions).toEqual(["GetHitVar"]);
    expect(getHitVarScore.identifiers).toEqual([]);
    expect(getHitVarFacing.supportLevel).toBe("executable");
    expect(getHitVarFacing.functions).toEqual(["GetHitVar"]);
    expect(getHitVarFacing.identifiers).toEqual([]);
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
    expect(playerIdRedirect.supportLevel).toBe("executable");
    expect(playerIdRedirect.identifiers).toEqual(["Life"]);
    expect(dynamicPlayerIdRedirect.supportLevel).toBe("executable");
    expect(dynamicPlayerIdRedirect.functions).toEqual(["var"]);
    expect(dynamicPlayerIdRedirect.identifiers).toEqual(["Life"]);
    expect(playerIdParameter.supportLevel).toBe("executable");
    expect(playerIdParameter.functions).toEqual(["PlayerID"]);
    expect(playerIdParameter.identifiers).toEqual([]);
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
    expect(rosterIdentity.supportLevel).toBe("executable");
    expect(rosterIdentity.functions).toEqual(["var"]);
    expect(rosterIdentity.identifiers).toEqual(["Life", "NumPartner", "P3Name", "P4Name", "P5Name", "P6Name", "P7Name", "P8Name"]);
    expect(enemyNearIndexed.supportLevel).toBe("executable");
    expect(enemyNearIndexed.identifiers).toEqual(["stateno"]);
    expect(enemyNearDynamicIndex.supportLevel).toBe("executable");
    expect(enemyNearDynamicIndex.functions).toEqual(["var"]);
    expect(enemyNearDynamicIndex.identifiers).toEqual(["stateno"]);
    expect(unsupportedEnemyNearNegative.supportLevel).toBe("unsupported");
    expect(unsupportedEnemyNearNegative.unsupportedFeatures).toEqual(["enemynear(negative)"]);
    expect(unsupportedPartnerNegative.supportLevel).toBe("unsupported");
    expect(unsupportedPartnerNegative.unsupportedFeatures).toEqual(["partner(negative)"]);
    expect(unsupportedParentIndex.supportLevel).toBe("unsupported");
    expect(unsupportedParentIndex.unsupportedFeatures).toEqual(["parent(index)"]);
    expect(unsupportedTargetDynamic.supportLevel).toBe("executable");
    expect(unsupportedTargetDynamic.identifiers).toEqual(["Life", "stateno"]);
    expect(unsupportedTargetNegative.supportLevel).toBe("unsupported");
    expect(unsupportedTargetNegative.unsupportedFeatures).toEqual(["target(negative)"]);
    expect(unsupportedPlayerIdNegative.supportLevel).toBe("unsupported");
    expect(unsupportedPlayerIdNegative.unsupportedFeatures).toEqual(["playerid(negative)"]);
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

  it("preserves IKEMEN +1 identity in IR without routing it as normal State 1", () => {
    const parsed = parseCns(`
[Statedef +1]
anim = 1
[State +1, Post current]
type = VarAdd
trigger1 = 1
v = 0
value = 7

[State -1, Numeric route]
type = ChangeState
trigger1 = 1
value = 1
`);
    const program = compileRuntimeProgram({
      commands: [],
      animations: new Map<number, MugenAnimationAction>([[1, action(1)]]),
      states: parsed.states,
      stateEntryControllers: parsed.controllers.filter((controller) => controller.stateId === -1),
    });

    expect(program.states[0]).toMatchObject({ id: 1, special: "plus-one" });
    expect(program.states[0]?.controllers[0]).toMatchObject({ stateId: 1, special: "plus-one" });
    expect(program.report.states.runtimeRoutableStateTargets).toEqual([]);
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

  it("compiles Helper boolean metadata as static and expression-backed values", () => {
    expect(compileControllerIr(controller(200, "Helper", [], { ownprojectile: "1" })).operation).toMatchObject({
      kind: "helper",
      ownProjectile: true,
    });
    expect(compileControllerIr(controller(200, "Helper", [], { ownprojectile: "var(0)" })).operation).toMatchObject({
      kind: "helper",
      ownProjectile: false,
      ownProjectileExpression: "var(0)",
    });
    expect(compileControllerIr(controller(200, "Helper", [], { ownpal: "1" })).operation).toMatchObject({
      kind: "helper",
      ownPalette: true,
    });
    expect(compileControllerIr(controller(200, "Helper", [], { ownpal: "var(0)" })).operation).toMatchObject({
      kind: "helper",
      ownPalette: false,
      ownPaletteExpression: "var(0)",
    });
    expect(compileControllerIr(controller(200, "Helper", [], { preserve: "1" })).operation).toMatchObject({
      kind: "helper",
      preserve: true,
    });
    expect(compileControllerIr(controller(200, "Helper", [], { preserve: "var(0)" })).operation).toMatchObject({
      kind: "helper",
      preserve: false,
      preserveExpression: "var(0)",
    });
    expect(compileControllerIr(controller(200, "Helper", [], { ownclsnscale: "1" })).operation).toMatchObject({
      kind: "helper",
      ownClsnScale: true,
    });
    expect(compileControllerIr(controller(200, "Helper", [], { ownclsnscale: "var(0)" })).operation).toMatchObject({
      kind: "helper",
      ownClsnScale: false,
      ownClsnScaleExpression: "var(0)",
    });
    expect(compileControllerIr(controller(200, "Helper", [], { clsnproxy: "1" })).operation).toMatchObject({
      kind: "helper",
      clsnProxy: true,
    });
    expect(compileControllerIr(controller(200, "Helper", [], { clsnproxy: "var(0)" })).operation).toMatchObject({
      kind: "helper",
      clsnProxy: false,
      clsnProxyExpression: "var(0)",
    });
    expect(compileControllerIr(controller(200, "Helper", [], { inheritjuggle: "1" })).operation).toMatchObject({
      kind: "helper",
      inheritJuggle: 1,
    });
    expect(compileControllerIr(controller(200, "Helper", [], { inheritjuggle: "var(0)" })).operation).toMatchObject({
      kind: "helper",
      inheritJuggle: 0,
      inheritJuggleExpression: "var(0)",
    });
    for (const value of ["", "1.5", "3"]) {
      expect(compileControllerIr(controller(200, "Helper", [], { inheritjuggle: value })).operation).toBeUndefined();
    }
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

  it("compiles bounded static Tag self and partner combinations with IKEMEN defaults", () => {
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
    expect(compileControllerIr(controller(200, "TagIn", [], { redirectid: "56" })).operation).toEqual({
      kind: "team-standby",
      controllerType: "tagin",
      standby: false,
      redirectPlayerIdExpression: "56",
      self: true,
    });
    expect(compileControllerIr(controller(200, "TagOut", [], { redirectid: "ID + var(0)" })).operation).toEqual({
      kind: "team-standby",
      controllerType: "tagout",
      standby: true,
      redirectPlayerIdExpression: "ID + var(0)",
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
    expect(compileControllerIr(controller(200, "TagOut", [], { self: "0" })).operation).toEqual({
      kind: "team-standby",
      controllerType: "tagout",
      standby: true,
      self: false,
    });
    expect(compileControllerIr(controller(200, "TagIn", [], { self: "1", partner: "0" })).operation).toEqual({
      kind: "team-standby",
      controllerType: "tagin",
      standby: false,
      self: true,
      partnerOrdinal: 0,
    });
    expect(compileControllerIr(controller(200, "TagOut", [], { self: "0", partner: "0" })).operation).toEqual({
      kind: "team-standby",
      controllerType: "tagout",
      standby: true,
      self: false,
      partnerOrdinal: 0,
    });
    expect(compileControllerIr(controller(200, "TagIn", [], { stateno: "200" })).operation).toEqual({
      kind: "team-standby",
      controllerType: "tagin",
      standby: false,
      self: true,
      callerStateNo: 200,
    });
    expect(compileControllerIr(controller(200, "TagOut", [], { self: "0", stateno: "200" })).operation).toEqual({
      kind: "team-standby",
      controllerType: "tagout",
      standby: true,
      self: false,
      callerStateNo: 200,
    });
    expect(compileControllerIr(controller(200, "TagIn", [], { partner: "0", partnerstateno: "200" })).operation).toEqual({
      kind: "team-standby",
      controllerType: "tagin",
      standby: false,
      self: false,
      partnerOrdinal: 0,
      partnerStateNo: 200,
    });
    expect(compileControllerIr(controller(200, "TagIn", [], {
      self: "1",
      partner: "0",
      stateno: "1201",
      partnerstateno: "201",
      ctrl: "1",
      partnerctrl: "0",
    })).operation).toEqual({
      kind: "team-standby",
      controllerType: "tagin",
      standby: false,
      self: true,
      partnerOrdinal: 0,
      callerStateNo: 1201,
      partnerStateNo: 201,
      callerControl: true,
      partnerControl: false,
    });
    expect(compileControllerIr(controller(200, "TagIn", [], { partner: "0", ctrl: "1", partnerctrl: "0" })).operation).toEqual({
      kind: "team-standby",
      controllerType: "tagin",
      standby: false,
      self: true,
      partnerOrdinal: 0,
      callerControl: true,
      partnerControl: false,
    });
    expect(compileControllerIr(controller(200, "TagIn", [], { ctrl: "1" })).operation).toEqual({
      kind: "team-standby",
      controllerType: "tagin",
      standby: false,
      self: true,
      callerControl: true,
    });
    expect(compileControllerIr(controller(200, "TagOut", [], { memberno: "2" })).operation).toEqual({
      kind: "team-standby",
      controllerType: "tagout",
      standby: true,
      self: true,
      memberPosition: 2,
    });
    expect(compileControllerIr(controller(200, "TagIn", [], { leader: "3" })).operation).toEqual({
      kind: "team-standby",
      controllerType: "tagin",
      standby: false,
      self: true,
      leaderPlayerNo: 3,
    });
    expect(compileControllerIr(controller(200, "TagOut", [], { self: "var(0)" })).operation).toEqual({
      kind: "team-standby",
      controllerType: "tagout",
      standby: true,
      self: false,
      selfExpression: "var(0)",
    });
    for (const truthySelf of ["-1", "2"]) {
      expect(compileControllerIr(controller(200, "TagIn", [], { self: truthySelf })).operation).toMatchObject({
        kind: "team-standby",
        self: false,
        selfExpression: truthySelf,
      });
    }
    expect(compileControllerIr(controller(200, "TagIn", [], { ctrl: "var(1)" })).operation).toEqual({
      kind: "team-standby",
      controllerType: "tagin",
      standby: false,
      self: true,
      callerControl: false,
      callerControlExpression: "var(1)",
    });
    expect(compileControllerIr(controller(200, "TagIn", [], { partner: "0", partnerctrl: "var(2)" })).operation).toEqual({
      kind: "team-standby",
      controllerType: "tagin",
      standby: false,
      self: false,
      partnerOrdinal: 0,
      partnerControl: false,
      partnerControlExpression: "var(2)",
    });
    expect(compileControllerIr(controller(200, "TagOut", [], { stateno: "var(3) + 200" })).operation).toEqual({
      kind: "team-standby",
      controllerType: "tagout",
      standby: true,
      self: true,
      callerStateExpression: "var(3) + 200",
    });
    expect(compileControllerIr(controller(200, "TagIn", [], { stateno: "200.9" })).operation).toMatchObject({
      callerStateExpression: "200.9",
    });
    expect(compileControllerIr(controller(200, "TagIn", [], { partner: "0", partnerstateno: "var(4) + 200" })).operation).toEqual({
      kind: "team-standby",
      controllerType: "tagin",
      standby: false,
      self: false,
      partnerOrdinal: 0,
      partnerStateExpression: "var(4) + 200",
    });
    expect(compileControllerIr(controller(200, "TagOut", [], { partner: "0", partnerstateno: "var(4) + 200" })).operation).toEqual({
      kind: "team-standby",
      controllerType: "tagout",
      standby: true,
      self: false,
      partnerOrdinal: 0,
      partnerStateExpression: "var(4) + 200",
    });
    expect(compileControllerIr(controller(200, "TagIn", [], { partner: "var(5)" })).operation).toEqual({
      kind: "team-standby",
      controllerType: "tagin",
      standby: false,
      self: false,
      partnerOrdinalExpression: "var(5)",
    });
    expect(compileControllerIr(controller(200, "TagOut", [], { partner: "-1" })).operation).toEqual({
      kind: "team-standby",
      controllerType: "tagout",
      standby: true,
      self: false,
      partnerOrdinalExpression: "-1",
    });
    expect(compileControllerIr(controller(200, "TagOut", [], { memberno: "var(6) + 1" })).operation).toEqual({
      kind: "team-standby",
      controllerType: "tagout",
      standby: true,
      self: true,
      memberPositionExpression: "var(6) + 1",
    });
    expect(compileControllerIr(controller(200, "TagIn", [], { memberno: "-1" })).operation).toEqual({
      kind: "team-standby",
      controllerType: "tagin",
      standby: false,
      self: true,
      memberPositionExpression: "-1",
    });
    expect(compileControllerIr(controller(200, "TagIn", [], { leader: "var(7) + 3" })).operation).toEqual({
      kind: "team-standby",
      controllerType: "tagin",
      standby: false,
      self: true,
      leaderPlayerNoExpression: "var(7) + 3",
    });
    expect(compileControllerIr(controller(200, "TagIn", [], { leader: "-1" })).operation).toEqual({
      kind: "team-standby",
      controllerType: "tagin",
      standby: false,
      self: true,
      leaderPlayerNoExpression: "-1",
    });

    const unsupportedParamSets: Record<string, string>[] = [
      { self: "1, 0" },
      { self: "(" },
      { stateno: "1, 0" },
      { stateno: "(" },
      { partnerstateno: "200" },
      { partner: "0", partnerstateno: "1, 0" },
      { partner: "0", partnerstateno: "(" },
      { memberno: "" },
      { memberno: "1, 0" },
      { memberno: "(" },
      { leader: "" },
      { leader: "1, 0" },
      { leader: "(" },
      { redirectid: "" },
      { redirectid: "1, 0" },
      { redirectid: "(" },
      { partner: "" },
      { partner: "1, 0" },
      { partner: "(" },
    ];
    for (const params of unsupportedParamSets) {
      const compiled = compileControllerIr(controller(200, "TagIn", [], params));
      expect(compiled.supportLevel).toBe("unsupported");
      expect(compiled.operation).toBeUndefined();
      expect(compiled.unsupportedFeatures).toEqual(["TagIn:optional-params"]);
    }
    const invalidControlParamSets: Record<string, string>[] = [
      { ctrl: "1, 0" },
      { ctrl: "(" },
      { partnerctrl: "1" },
      { partner: "0", partnerctrl: "1, 0" },
      { partner: "0", partnerctrl: "(" },
    ];
    for (const params of invalidControlParamSets) {
      expect(compileControllerIr(controller(200, "TagIn", [], params)).operation).toBeUndefined();
    }
    expect(compileControllerIr(controller(200, "TagOut", [], { ctrl: "1" })).operation).toBeUndefined();
    expect(compileControllerIr(controller(200, "TagOut", [], { leader: "1" })).operation).toBeUndefined();
  });

  it("compiles static AssertSpecial flags into typed operations", () => {
    const compiled = compileControllerIr(
      controller(200, "AssertSpecial", [], {
        flag: "NoAutoTurn, NoWalk",
        flag2: '"Invisible", GlobalNoKO, TimerFreeze, RoundNotOver, NoKOSlow, Intro, NoWalk, SkipRoundDisplay, SkipFightDisplay',
        flag3: "NoGetUpFromLieDown, NoFastRecoverFromLieDown, RunFirst, RunLast, SizePushOnly",
      }),
    );
    const disabled = compileControllerIr(controller(200, "AssertSpecial", [], { flag: "NoWalk", value: "0" }));
    const dynamic = compileControllerIr(controller(200, "AssertSpecial", [], { flag: "IfElse(var(0), NoWalk, Invisible)" }));

    expect(compiled.operation).toEqual({
      kind: "assertspecial",
      flags: ["noautoturn", "nowalk", "invisible", "nogetupfromliedown", "nofastrecoverfromliedown", "runfirst", "runlast", "sizepushonly"],
      globalFlags: ["globalnoko", "timerfreeze", "roundnotover", "nokoslow", "intro", "skiprounddisplay", "skipfightdisplay"],
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
        chainid: "13",
        nochainid: "40,41,42,43,44,45,46,47,48,49",
        numhits: "3",
        attr: "S, NA",
        hitflag: "H,L,A,F,P",
        affectteam: "F",
        teamside: "2",
        p2clsncheck: "Size",
        p2clsnrequire: "Clsn1",
        damage: "42,5",
        kill: "0",
        keepstate: "1",
        "guard.kill": "0",
        "air.juggle": "7",
        priority: "6, Hit",
        p1sprpriority: "3",
        p2sprpriority: "-2",
        pausetime: "8,9",
        guardflag: "MA",
        "ground.hittime": "17",
        "air.hittime": "19",
        "down.hittime": "21",
        "down.bounce": "1",
        "ground.velocity": "-4,-6",
        "air.velocity": "-3,-8",
        "down.velocity": "-2,0",
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
        p2facing: "-1",
        missonoverride: "0",
        ignorereversaldef: "1",
        fall: "1",
        "air.fall": "1",
        "fall.kill": "0",
        "fall.yvelocity": "-7",
        "fall.zvelocity": "2.5",
        "fall.recover": "0",
        "fall.recovertime": "19",
        "fall.envshake.mul": "0.75",
        "fall.envshake.dir": "67.5",
        "down.recover": "1",
        "down.recovertime": "45",
      }),
    );

    expect(compiled.operation).toMatchObject({
      kind: "hitdef",
      id: 7,
      chainId: 13,
      noChainIds: [40, 41, 42, 43, 44, 45, 46, 47],
      hitCount: 3,
      attr: "S, NA",
      hitFlag: "H,L,A,F,P",
      affectTeam: -1,
      teamSide: 2,
      p2ClsnCheck: "size",
      p2ClsnRequire: "clsn1",
      damage: 42,
      guardDamage: 5,
      kill: false,
      keepState: true,
      guardKill: false,
      airJuggle: 7,
      priority: 6,
      priorityType: "hit",
      p1SpritePriority: 3,
      p2SpritePriority: -2,
      pauseTime: 8,
      hitShakeTime: 9,
      groundHitTime: 17,
      airHitTime: 19,
      downHitTime: 21,
      downBounce: true,
      groundVelocity: [-4, -6],
      airVelocity: [-3, -8],
      downVelocity: [-2, 0],
      guardDistance: 96,
      guardFlag: "MA",
      guardPauseTime: 4,
      guardShakeTime: 5,
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
      p2GetP1State: 0,
      p2Facing: -1,
      missOnOverride: false,
      ignoreReversalDef: true,
      fall: {
        enabled: true,
        airFall: true,
        kill: false,
        yVelocity: -7,
        zVelocity: 2.5,
        recover: false,
        recoverTime: 19,
        downRecover: true,
        downRecoverTime: 45,
        envShakeMultiplier: 0.75,
        envShakeDirection: 67.5,
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
    const alias = compileControllerIr(controller(200, "HitDef", [], { sprpriority: "var(2) + 1" }));
    const malformed = compileControllerIr(controller(200, "HitDef", [], { p1sprpriority: "var(" }));

    expect(authored.operation).toMatchObject({
      kind: "hitdef",
      p1SpritePriority: 4,
      p2SpritePriority: -3,
    });
    expect(omitted.operation).not.toHaveProperty("p1SpritePriority");
    expect(omitted.operation).not.toHaveProperty("p2SpritePriority");
    expect(dynamic.operation).toMatchObject({
      kind: "hitdef",
      p1SpritePriorityExpression: "var(0)",
      p2SpritePriorityExpression: "fvar(1)",
    });
    expect(alias.operation).toMatchObject({ kind: "hitdef", p1SpritePriorityExpression: "var(2) + 1" });
    expect(malformed.operation).toBeUndefined();
  });

  it("compiles dynamic HitDef priority with a static class", () => {
    const dynamic = compileControllerIr(controller(200, "HitDef", [], { priority: "var(0) + 2, Dodge" }));
    const redirected = compileControllerIr(controller(200, "HitDef", [], { priority: "Parent,var(1), Miss" }));
    const redirectedDefaultClass = compileControllerIr(controller(200, "HitDef", [], { priority: "Parent, Time" }));
    const functionDefaultClass = compileControllerIr(controller(200, "HitDef", [], { priority: "ifelse(1, 4, Time)" }));
    const malformed = compileControllerIr(controller(200, "HitDef", [], { priority: "var(0), Unknown" }));

    expect(dynamic.operation).toMatchObject({
      kind: "hitdef",
      priorityExpression: "var(0) + 2",
      priorityType: "dodge",
    });
    expect(redirected.operation).toMatchObject({
      kind: "hitdef",
      priorityExpression: "Parent,var(1)",
      priorityType: "miss",
    });
    expect(redirectedDefaultClass.operation).toMatchObject({
      kind: "hitdef",
      priorityExpression: "Parent, Time",
      priorityType: "hit",
    });
    expect(functionDefaultClass.operation).toMatchObject({
      kind: "hitdef",
      priorityExpression: "ifelse(1, 4, Time)",
      priorityType: "hit",
    });
    expect(malformed.operation).toBeUndefined();
  });

  it("compiles fresh Projectile projpriority expressions and rejects malformed values", () => {
    const authored = compileControllerIr(controller(200, "Projectile", [], { projpriority: "4" }));
    const dynamic = compileControllerIr(controller(200, "Projectile", [], { projpriority: "var(0) + 2" }));
    const redirected = compileControllerIr(controller(200, "Projectile", [], { projpriority: "Parent,var(1)" }));
    const malformed = compileControllerIr(controller(200, "Projectile", [], { projpriority: "var(" }));

    expect(authored.operation).toMatchObject({ kind: "projectile", priority: 4 });
    expect(authored.operation).not.toHaveProperty("priorityExpression");
    expect(dynamic.operation).toMatchObject({ kind: "projectile", priorityExpression: "var(0) + 2" });
    expect(redirected.operation).toMatchObject({ kind: "projectile", priorityExpression: "Parent,var(1)" });
    expect(malformed.operation).toBeUndefined();
  });

  it("compiles fresh Projectile projhits expressions and rejects malformed values", () => {
    const authored = compileControllerIr(controller(200, "Projectile", [], { projhits: "4" }));
    const dynamic = compileControllerIr(controller(200, "Projectile", [], { projhits: "var(0) + 1" }));
    const redirected = compileControllerIr(controller(200, "Projectile", [], { projhits: "Parent,var(1)" }));
    const malformed = compileControllerIr(controller(200, "Projectile", [], { projhits: "var(" }));

    expect(authored.operation).toMatchObject({ kind: "projectile", hitCount: 4 });
    expect(authored.operation).not.toHaveProperty("hitCountExpression");
    expect(dynamic.operation).toMatchObject({ kind: "projectile", hitCount: 1, hitCountExpression: "var(0) + 1" });
    expect(redirected.operation).toMatchObject({ kind: "projectile", hitCount: 1, hitCountExpression: "Parent,var(1)" });
    expect(malformed.operation).toBeUndefined();
  });

  it("compiles fresh Projectile p2facing in static and caller-expression forms", () => {
    const authored = compileControllerIr(controller(200, "Projectile", [], { p2facing: "-1" }));
    const dynamic = compileControllerIr(controller(200, "Projectile", [], { p2facing: "Parent,var(1)" }));
    const malformed = compileControllerIr(controller(200, "Projectile", [], { p2facing: "var(" }));

    expect(authored.operation).toMatchObject({ kind: "projectile", p2Facing: -1 });
    expect(authored.operation).not.toHaveProperty("p2FacingExpression");
    expect(dynamic.operation).toMatchObject({ kind: "projectile", p2FacingExpression: "Parent,var(1)" });
    expect(dynamic.operation).not.toHaveProperty("p2Facing");
    expect(malformed.operation).toBeUndefined();
  });

  it("compiles ModifyProjectile p2facing in static and caller-expression forms", () => {
    const authored = compileControllerIr(controller(200, "ModifyProjectile", [], { id: "77", p2facing: "-1" }));
    const dynamic = compileControllerIr(
      controller(200, "ModifyProjectile", [], { id: "77", p2facing: "Parent,var(1)" }),
    );
    const malformed = compileControllerIr(controller(200, "ModifyProjectile", [], { id: "77", p2facing: "var(" }));

    expect(authored.operation).toMatchObject({ kind: "modifyprojectile", p2Facing: -1 });
    expect(authored.operation).not.toHaveProperty("p2FacingExpression");
    expect(dynamic.operation).toMatchObject({ kind: "modifyprojectile", p2FacingExpression: "Parent,var(1)" });
    expect(dynamic.operation).not.toHaveProperty("p2Facing");
    expect(malformed.operation).toBeUndefined();
  });

  it("compiles Target controllers into typed target operations", () => {
    const life = compileControllerIr(controller(200, "TargetLifeAdd", [], { id: "3", value: "-20", absolute: "1", kill: "0", redirectid: "57" }));
    const redirectedRedLife = compileControllerIr(
      controller(200, "TargetRedLifeAdd", [], { id: "3", value: "25", absolute: "1", redirectid: "57" }),
    );
    const redirectedGuardPoints = compileControllerIr(
      controller(200, "TargetGuardPointsAdd", [], { id: "3", value: "-20", redirectid: "56" }),
    );
    const redirectedDizzyPoints = compileControllerIr(
      controller(200, "TargetDizzyPointsAdd", [], { id: "3", value: "-30", redirectid: "56" }),
    );
    const redirectedPower = compileControllerIr(
      controller(200, "TargetPowerAdd", [], { id: "3", value: "40", redirectid: "57" }),
    );
    const redirectedVelocityAdd = compileControllerIr(
      controller(200, "TargetVelAdd", [], { id: "3", x: "2", y: "-1", redirectid: "56" }),
    );
    const redirectedVelocitySet = compileControllerIr(
      controller(200, "TargetVelSet", [], { id: "3", x: "3", redirectid: "56" }),
    );
    const redirectedFacing = compileControllerIr(
      controller(200, "TargetFacing", [], { id: "3", value: "-1", redirectid: "56" }),
    );
    const redirectedDrop = compileControllerIr(
      controller(200, "TargetDrop", [], { excludeID: "3", keepone: "0", redirectid: "57" }),
    );
    const redirectedBind = compileControllerIr(
      controller(200, "TargetBind", [], { id: "3", pos: "12,-8,5", time: "6", redirectid: "57" }),
    );
    const redirectedState = compileControllerIr(
      controller(200, "TargetState", [], { id: "3", value: "5300", redirectid: "57" }),
    );
    const redirectedBindToTarget = compileControllerIr(
      controller(200, "BindToTarget", [], { id: "3", pos: "12,-8,Head", posz: "7", time: "6", redirectid: "56" }),
    );
    const bind = compileControllerIr(controller(200, "TargetBind", [], { id: "3", pos: "12,-8,5", time: "6" }));
    const bindToTarget = compileControllerIr(controller(200, "BindToTarget", [], { id: "3", pos: "12,-8,Foot", posz: "7", time: "6" }));
    const state = compileControllerIr(controller(200, "TargetState", [], { id: "3", value: "5300" }));
    const drop = compileControllerIr(controller(200, "TargetDrop", [], { excludeID: "3", keepone: "1" }));
    const defaultDrop = compileControllerIr(controller(200, "TargetDrop", [], { excludeID: "3" }));
    const invalidLifeRedirect = compileControllerIr(
      controller(200, "TargetLifeAdd", [], { id: "3", value: "-20", redirectid: "57, 0" }),
    );
    const invalidFacingRedirect = compileControllerIr(
      controller(200, "TargetFacing", [], { id: "3", value: "1", redirectid: "57, 0" }),
    );
    const invalidDropRedirect = compileControllerIr(
      controller(200, "TargetDrop", [], { excludeID: "3", keepone: "0", redirectid: "57, 0" }),
    );
    const invalidBindRedirect = compileControllerIr(
      controller(200, "TargetBind", [], { id: "3", pos: "12,-8,5", time: "6", redirectid: "57, 0" }),
    );
    const invalidStateRedirect = compileControllerIr(
      controller(200, "TargetState", [], { id: "3", value: "5300", redirectid: "57, 0" }),
    );
    const invalidBindToTargetRedirect = compileControllerIr(
      controller(200, "BindToTarget", [], { id: "3", pos: "12,-8,Foot", time: "6", redirectid: "57, 0" }),
    );

    expect(life.operation).toMatchObject({
      kind: "target",
      controllerType: "targetlifeadd",
      requestedId: 3,
      value: -20,
      absolute: true,
      kill: false,
      dizzy: true,
      redLife: true,
      redirectPlayerIdExpression: "57",
    });
    expect(redirectedRedLife.operation).toEqual({
      kind: "target",
      controllerType: "targetredlifeadd",
      requestedId: 3,
      value: 25,
      absolute: true,
      redirectPlayerIdExpression: "57",
    });
    expect(redirectedGuardPoints.operation).toEqual({
      kind: "target",
      controllerType: "targetguardpointsadd",
      requestedId: 3,
      value: -20,
      absolute: false,
      redirectPlayerIdExpression: "56",
    });
    expect(redirectedDizzyPoints.operation).toEqual({
      kind: "target",
      controllerType: "targetdizzypointsadd",
      requestedId: 3,
      value: -30,
      absolute: false,
      redirectPlayerIdExpression: "56",
    });
    expect(redirectedPower.operation).toEqual({
      kind: "target",
      controllerType: "targetpoweradd",
      requestedId: 3,
      value: 40,
      redirectPlayerIdExpression: "57",
    });
    expect(redirectedVelocityAdd.operation).toEqual({
      kind: "target",
      controllerType: "targetveladd",
      requestedId: 3,
      x: 2,
      y: -1,
      redirectPlayerIdExpression: "56",
    });
    expect(redirectedVelocitySet.operation).toEqual({
      kind: "target",
      controllerType: "targetvelset",
      requestedId: 3,
      x: 3,
      redirectPlayerIdExpression: "56",
    });
    expect(redirectedFacing.operation).toEqual({
      kind: "target",
      controllerType: "targetfacing",
      requestedId: 3,
      value: -1,
      redirectPlayerIdExpression: "56",
    });
    expect(redirectedDrop.operation).toEqual({
      kind: "target",
      controllerType: "targetdrop",
      excludeId: 3,
      keepOne: false,
      redirectPlayerIdExpression: "57",
    });
    expect(redirectedBind.operation).toEqual({
      kind: "target",
      controllerType: "targetbind",
      requestedId: 3,
      pos: [12, -8, 5],
      time: 6,
      redirectPlayerIdExpression: "57",
    });
    expect(redirectedState.operation).toEqual({
      kind: "target",
      controllerType: "targetstate",
      requestedId: 3,
      stateNo: 5300,
      redirectPlayerIdExpression: "57",
    });
    expect(redirectedBindToTarget.operation).toEqual({
      kind: "bindtotarget",
      requestedId: 3,
      pos: [12, -8],
      posZ: 7,
      postype: "head",
      time: 6,
      redirectPlayerIdExpression: "56",
    });
    expect(invalidLifeRedirect.operation).toBeUndefined();
    expect(invalidFacingRedirect.operation).toBeUndefined();
    expect(invalidDropRedirect.operation).toBeUndefined();
    expect(invalidBindRedirect.operation).toBeUndefined();
    expect(invalidStateRedirect.operation).toBeUndefined();
    expect(invalidBindToTargetRedirect.operation).toBeUndefined();
    expect(bind.operation).toMatchObject({
      kind: "target",
      controllerType: "targetbind",
      requestedId: 3,
      pos: [12, -8, 5],
      time: 6,
    });
    expect(bindToTarget.operation).toMatchObject({
      kind: "bindtotarget",
      requestedId: 3,
      pos: [12, -8],
      posZ: 7,
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
    const velSet = compileControllerIr(controller(200, "VelSet", [], { value: "4,-3", z: "2" }));
    const velAdd = compileControllerIr(controller(200, "VelAdd", [], { y: "0.5", z: "-1" }));
    const posSet = compileControllerIr(controller(200, "PosSet", [], { x: "12", y: "-24", z: "9" }));
    const posAdd = compileControllerIr(controller(200, "PosAdd", [], { value: "8,-2", z: "-3" }));
    const hitVelSet = compileControllerIr(controller(200, "HitVelSet", [], { x: "1", y: "0", z: "1" }));
    const gravity = compileControllerIr(controller(200, "Gravity", [], {}));
    const dynamic = compileControllerIr(controller(200, "VelAdd", [], { y: "Const(movement.yaccel)" }));

    expect(velSet.operation).toEqual({ kind: "kinematic", controllerType: "velset", x: 4, y: -3, z: 2 });
    expect(velAdd.operation).toEqual({ kind: "kinematic", controllerType: "veladd", y: 0.5, z: -1 });
    expect(posSet.operation).toEqual({ kind: "kinematic", controllerType: "posset", x: 12, y: -24, z: 9 });
    expect(posAdd.operation).toEqual({ kind: "kinematic", controllerType: "posadd", x: 8, y: -2, z: -3 });
    expect(hitVelSet.operation).toEqual({ kind: "kinematic", controllerType: "hitvelset", x: 1, y: 0, z: 1 });
    expect(gravity.operation).toEqual({ kind: "kinematic", controllerType: "gravity", y: 0.55 });
    expect(dynamic.operation).toBeUndefined();
  });

  it("compiles static bounds controllers into typed operations", () => {
    const posFreeze = compileControllerIr(controller(200, "PosFreeze", [], { x: "1", y: "0" }));
    const posFreezeDefault = compileControllerIr(controller(200, "PosFreeze", [], {}));
    const posFreezeRedirect = compileControllerIr(controller(200, "PosFreeze", [], { value: "1", redirectid: "ID + var(0)" }));
    const screenBound = compileControllerIr(controller(200, "ScreenBound", [], { value: "0", movecamera: "0,1" }));
    const screenStageBound = compileControllerIr(controller(200, "ScreenBound", [], { stagebound: "0" }));
    const redirected = compileControllerIr(controller(200, "ScreenBound", [], { value: "1", redirectid: "ID + var(0)" }));
    const invalidRedirect = compileControllerIr(controller(200, "ScreenBound", [], { redirectid: "1, 0" }));
    const dynamic = compileControllerIr(controller(200, "ScreenBound", [], { value: "Const(data.life)" }));

    expect(posFreeze.operation).toEqual({ kind: "bounds", controllerType: "posfreeze", x: true, y: false });
    expect(posFreezeDefault.operation).toEqual({ kind: "bounds", controllerType: "posfreeze", x: true, y: true });
    expect(posFreezeRedirect.operation).toEqual({
      kind: "bounds",
      controllerType: "posfreeze",
      x: true,
      y: true,
      redirectPlayerIdExpression: "ID + var(0)",
    });
    expect(screenBound.operation).toEqual({
      kind: "bounds",
      controllerType: "screenbound",
      bound: false,
      moveCameraX: false,
      moveCameraY: true,
    });
    expect(screenStageBound.operation).toEqual({
      kind: "bounds",
      controllerType: "screenbound",
      bound: false,
      moveCameraX: false,
      moveCameraY: false,
      stageBound: false,
    });
    expect(redirected.operation).toMatchObject({ redirectPlayerIdExpression: "ID + var(0)" });
    expect(invalidRedirect.operation).toBeUndefined();
    expect(dynamic.operation).toBeUndefined();
  });

  it("compiles static Width controllers into typed collision operations", () => {
    const width = compileControllerIr(controller(200, "Width", [], { player: "18,44" }));
    const edge = compileControllerIr(controller(200, "Width", [], { edge: "7,3" }));
    const combined = compileControllerIr(controller(200, "Width", [], { edge: "7,3", player: "18,44" }));
    const valueFallback = compileControllerIr(controller(200, "Width", [], { value: "9" }));
    const redirected = compileControllerIr(controller(200, "Width", [], { player: "18,44", redirectid: "59" }));
    const invalidRedirect = compileControllerIr(controller(200, "Width", [], { player: "18,44", redirectid: "1, 0" }));
    const dynamic = compileControllerIr(controller(200, "Width", [], { player: "Const(size.ground.front),44" }));

    expect(width.operation).toEqual({ kind: "collision", controllerType: "width", front: 18, back: 44 });
    expect(edge.operation).toEqual({ kind: "collision", controllerType: "width", front: 7, back: 3, mode: "edge" });
    expect(combined.operation).toEqual({
      kind: "collision",
      controllerType: "width",
      front: 18,
      back: 44,
      edgeFront: 7,
      edgeBack: 3,
    });
    expect(valueFallback.operation).toEqual({
      kind: "collision",
      controllerType: "width",
      front: 9,
      back: 9,
      mode: "value",
      edgeFront: 9,
      edgeBack: 9,
    });
    expect(redirected.operation).toEqual({
      kind: "collision",
      controllerType: "width",
      front: 18,
      back: 44,
      redirectPlayerIdExpression: "59",
    });
    expect(invalidRedirect.operation).toBeUndefined();
    expect(dynamic.operation).toBeUndefined();
  });

  it("compiles static Height values and RedirectID into typed collision operations", () => {
    const pair = compileControllerIr(controller(200, "Height", [], { value: "12,3" }));
    const topOnly = compileControllerIr(controller(200, "Height", [], { value: "7" }));
    const redirected = compileControllerIr(controller(200, "Height", [], { value: "2.5,-1", redirectid: "59" }));
    const dynamic = compileControllerIr(controller(200, "Height", [], { value: "var(0),3" }));

    expect(pair.operation).toEqual({ kind: "collision", controllerType: "height", top: 12, bottom: 3 });
    expect(topOnly.operation).toEqual({ kind: "collision", controllerType: "height", top: 7, bottom: 0 });
    expect(redirected.operation).toEqual({
      kind: "collision",
      controllerType: "height",
      top: 2.5,
      bottom: -1,
      redirectPlayerIdExpression: "59",
    });
    expect(dynamic.operation).toBeUndefined();
  });

  it("compiles static TransformClsn scale and leaves expression values for runtime", () => {
    const value = compileControllerIr(controller(200, "TransformClsn", [], { scale: "2,-0.5", redirectid: "59" }));
    const topOnly = compileControllerIr(controller(200, "TransformClsn", [], { scale: "1.5" }));
    const angle = compileControllerIr(controller(200, "TransformClsn", [], { angle: "45" }));
    const dynamic = compileControllerIr(controller(200, "TransformClsn", [], { scale: "var(0),0.5" }));

    expect(value.operation).toEqual({
      kind: "collision-transform",
      controllerType: "transformclsn",
      scale: [2, -0.5],
      redirectPlayerIdExpression: "59",
    });
    expect(topOnly.operation).toEqual({ kind: "collision-transform", controllerType: "transformclsn", scale: [1.5, 1] });
    expect(angle.operation).toEqual({ kind: "collision-transform", controllerType: "transformclsn", angle: 45 });
    expect(dynamic.operation).toBeUndefined();
  });

  it("compiles static OverrideClsn modifiers and leaves dynamic payloads for runtime", () => {
    const value = compileControllerIr(controller(200, "OverrideClsn", [], { group: "Size", index: "-1", rect: "30,10,-20,-40", redirectid: "59" }));
    const clear = compileControllerIr(controller(200, "OverrideClsn", [], { group: "None" }));
    const dynamic = compileControllerIr(controller(200, "OverrideClsn", [], { group: "Clsn2", index: "var(0)", rect: "var(1),-20,20,0" }));

    expect(value.operation).toEqual({ kind: "collision", controllerType: "overrideclsn", group: 3, index: -1, rect: [-20, -40, 30, 10], redirectPlayerIdExpression: "59" });
    expect(clear.operation).toEqual({ kind: "collision", controllerType: "overrideclsn", group: 0, index: 0, rect: [0, 0, 0, 0] });
    expect(dynamic.operation).toBeUndefined();
  });

  it("compiles static Depth player, edge, and value modes", () => {
    const player = compileControllerIr(controller(200, "Depth", [], { player: "2,5" }));
    const edge = compileControllerIr(controller(200, "Depth", [], { edge: "7,9" }));
    const value = compileControllerIr(controller(200, "Depth", [], { value: "4" }));
    const dynamic = compileControllerIr(controller(200, "Depth", [], { player: "var(0),5" }));
    const redirected = compileControllerIr(controller(200, "Depth", [], { player: "2,5", redirectid: "59" }));
    const invalidRedirect = compileControllerIr(controller(200, "Depth", [], { value: "4", redirectid: "(" }));

    expect(player.operation).toEqual({ kind: "collision", controllerType: "depth", mode: "player", top: 2, bottom: 5 });
    expect(edge.operation).toEqual({ kind: "collision", controllerType: "depth", mode: "edge", top: 7, bottom: 9 });
    expect(value.operation).toEqual({ kind: "collision", controllerType: "depth", mode: "value", top: 4, bottom: 0 });
    expect(dynamic.operation).toBeUndefined();
    expect(redirected.operation).toEqual({
      kind: "collision",
      controllerType: "depth",
      mode: "player",
      top: 2,
      bottom: 5,
      redirectPlayerIdExpression: "59",
    });
    expect(invalidRedirect.operation).toBeUndefined();
  });

  it("compiles static PlayerPush controllers into typed collision operations", () => {
    const disabled = compileControllerIr(controller(200, "PlayerPush", [], { value: "0" }));
    const enabled = compileControllerIr(controller(200, "PlayerPush", [], { value: "1" }));
    const defaultEnabled = compileControllerIr(controller(200, "PlayerPush", [], {}));
    const dynamic = compileControllerIr(controller(200, "PlayerPush", [], { value: "Const(data.life)" }));
    const policy = compileControllerIr(controller(200, "PlayerPush", [], { priority: "4", affectteam: "F", redirectid: "59" }));
    const invalidTeam = compileControllerIr(controller(200, "PlayerPush", [], { affectteam: "X" }));

    expect(disabled.operation).toEqual({ kind: "collision", controllerType: "playerpush", enabled: false });
    expect(enabled.operation).toEqual({ kind: "collision", controllerType: "playerpush", enabled: true });
    expect(defaultEnabled.operation).toEqual({ kind: "collision", controllerType: "playerpush", enabled: true });
    expect(dynamic.operation).toBeUndefined();
    expect(policy.operation).toEqual({
      kind: "collision",
      controllerType: "playerpush",
      priority: 4,
      affectTeam: -1,
      redirectPlayerIdExpression: "59",
    });
    expect(invalidTeam.operation).toBeUndefined();
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

  it("compiles bounded resource RedirectID expressions and rejects malformed targets", () => {
    const control = compileControllerIr(controller(200, "CtrlSet", [], { value: "0", redirectid: "57" }));
    const life = compileControllerIr(controller(200, "LifeAdd", [], { value: "-25", kill: "0", redirectid: "57" }));
    const power = compileControllerIr(controller(200, "PowerSet", [], { value: "900", redirectid: "PlayerID(57)" }));
    const guard = compileControllerIr(controller(200, "GuardPointsSet", [], { value: "650", redirectid: "57" }));
    const dizzy = compileControllerIr(controller(200, "DizzyPointsAdd", [], { value: "-25", redirectid: "57" }));
    const redLife = compileControllerIr(controller(200, "RedLifeAdd", [], { value: "25", absolute: "1", redirectid: "57" }));
    const invalid = compileControllerIr(controller(200, "LifeSet", [], { value: "750", redirectid: "57, 0" }));

    expect(life.operation).toEqual({
      kind: "resource",
      controllerType: "lifeadd",
      value: -25,
      kill: false,
      redirectPlayerIdExpression: "57",
    });
    expect(control.operation).toEqual({
      kind: "resource",
      controllerType: "ctrlset",
      value: false,
      redirectPlayerIdExpression: "57",
    });
    expect(power.operation).toEqual({
      kind: "resource",
      controllerType: "powerset",
      value: 900,
      redirectPlayerIdExpression: "PlayerID(57)",
    });
    expect(guard.operation).toEqual({
      kind: "resource",
      controllerType: "guardpointsset",
      value: 650,
      redirectPlayerIdExpression: "57",
    });
    expect(dizzy.operation).toEqual({
      kind: "resource",
      controllerType: "dizzypointsadd",
      value: -25,
      redirectPlayerIdExpression: "57",
    });
    expect(redLife.operation).toEqual({
      kind: "resource",
      controllerType: "redlifeadd",
      value: 25,
      absolute: true,
      redirectPlayerIdExpression: "57",
    });
    expect(invalid.operation).toBeUndefined();
  });

  it("compiles static hit eligibility controllers into typed operations", () => {
    const hitBy = compileControllerIr(
      controller(200, "HitBy", [], { value: "S,NA", value2: "A,SA", time: "8", redirectid: "57" }),
    );
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
        redirectid: "57",
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
      redirectPlayerIdExpression: "57",
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
      redirectPlayerIdExpression: "57",
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
        p2getp1state: "0",
        p2facing: "-2",
        id: "88",
        "attack.depth": "6, 9",
        redirectid: "57",
      }),
    );
    const selfOwned = compileControllerIr(
      controller(200, "ReversalDef", [], { "reversal.attr": "S,NA", p2stateno: "889", p2getp1state: "2" }),
    );
    const dynamic = compileControllerIr(
      controller(200, "ReversalDef", [], {
        "reversal.attr": "SA,AA",
        p1stateno: "Const(data.life)",
      }),
    );
    const dynamicP2Get = compileControllerIr(
      controller(200, "ReversalDef", [], { "reversal.attr": "S,NA", p2getp1state: "var(1)" }),
    );
    const dynamicP2Facing = compileControllerIr(
      controller(200, "ReversalDef", [], { "reversal.attr": "S,NA", p2facing: "var(1)" }),
    );

    expect(reversal.operation).toEqual({
      kind: "reversaldef",
      attr: "SA,AA",
      hitPause: 3,
      p1StateNo: 777,
      p2StateNo: 778,
      p2GetP1State: false,
      p2Facing: -2,
      targetId: 88,
      attackDepth: [6, 9],
      redirectPlayerIdExpression: "57",
    });
    expect(selfOwned.operation).toMatchObject({
      kind: "reversaldef",
      p2StateNo: 889,
      p2GetP1State: true,
    });
    expect(dynamic.operation).toBeUndefined();
    expect(dynamicP2Get.operation).toBeUndefined();
    expect(dynamicP2Facing.operation).toBeUndefined();
  });

  it("duplicates a single attack.depth value in typed HitDef operations", () => {
    const hitDef = compileControllerIr(
      controller(200, "HitDef", [], { attr: "S,NA", "attack.depth": "7", redirectid: "var(0)" }),
    );
    const invalidRedirect = compileControllerIr(controller(200, "HitDef", [], { redirectid: "var(" }));

    expect(hitDef.operation).toMatchObject({
      kind: "hitdef",
      attackDepth: [7, 7],
      redirectPlayerIdExpression: "var(0)",
    });
    expect(invalidRedirect.operation).toBeUndefined();
  });

  it("compiles direct HitDef facing integer expressions and rejects malformed values", () => {
    expect(compileControllerIr(controller(200, "HitDef", [], {
      p1facing: "-1.8",
      p1getp2facing: "var(2)",
      p2facing: "var(3)",
    })).operation).toMatchObject({
      kind: "hitdef",
      p1Facing: -1,
      p1GetP2Facing: "var(2)",
      p2Facing: "var(3)",
    });
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      p1facing: "Parent,var(0)",
      p1getp2facing: "-2.9",
      p2facing: "var(4)",
      redirectid: "57",
    })).operation).toMatchObject({
      kind: "modifyhitdef",
      p1Facing: "Parent,var(0)",
      p1GetP2Facing: -2,
      p2Facing: "var(4)",
      redirectPlayerIdExpression: "57",
    });
    expect(compileControllerIr(controller(200, "HitDef", [], { p1facing: "var(" })).operation).toBeUndefined();
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      p1getp2facing: "1,2",
      redirectid: "57",
    })).operation).toBeUndefined();
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      p2facing: "var(",
      redirectid: "57",
    })).operation).toBeUndefined();
  });

  it("compiles direct HitDef posture integer expressions and rejects malformed values", () => {
    expect(compileControllerIr(controller(200, "HitDef", [], {
      forcestand: "0.8",
      forcecrouch: "var(2)",
      forcenofall: "var(4)",
    })).operation).toMatchObject({
      kind: "hitdef",
      forceStand: 0,
      forceCrouch: "var(2)",
      forceNoFall: "var(4)",
    });
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      forcestand: "Parent,var(0)",
      forcecrouch: "-2.9",
      forcenofall: "var(5)",
      redirectid: "57",
    })).operation).toMatchObject({
      kind: "modifyhitdef",
      forceStand: "Parent,var(0)",
      forceCrouch: -2,
      forceNoFall: "var(5)",
      redirectPlayerIdExpression: "57",
    });
    expect(compileControllerIr(controller(200, "HitDef", [], { forcestand: "var(" })).operation).toBeUndefined();
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      forcecrouch: "1,2",
      redirectid: "57",
    })).operation).toBeUndefined();
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      forcenofall: "var(",
      redirectid: "57",
    })).operation).toBeUndefined();
  });

  it("compiles fresh root HitDef state integer expressions and rejects malformed values", () => {
    expect(compileControllerIr(controller(200, "HitDef", [], {
      p1stateno: "777.9",
      p2stateno: "var(2)",
      p2getp1state: "Parent,var(3)",
    })).operation).toMatchObject({
      kind: "hitdef",
      p1StateNo: 777,
      p2StateNo: "var(2)",
      p2GetP1State: "Parent,var(3)",
    });
    expect(compileControllerIr(controller(200, "HitDef", [], { p1stateno: "var(" })).operation).toBeUndefined();
    expect(compileControllerIr(controller(200, "HitDef", [], { p2stateno: "1,2" })).operation).toBeUndefined();
    expect(compileControllerIr(controller(200, "HitDef", [], { p2getp1state: "1e999" })).operation).toBeUndefined();
  });

  it("compiles direct HitDef id and chainid integer expressions", () => {
    expect(compileControllerIr(controller(200, "HitDef", [], {
      id: "-3.8",
      chainid: "-1.8",
    })).operation).toMatchObject({
      kind: "hitdef",
      id: 0,
      chainId: -1,
    });
    expect(compileControllerIr(controller(200, "HitDef", [], {
      id: "var(1)",
      chainid: "Parent,var(2)",
    })).operation).toMatchObject({
      kind: "hitdef",
      id: "var(1)",
      chainId: "Parent,var(2)",
    });
    expect(compileControllerIr(controller(200, "HitDef", [], { id: "var(" })).operation).toBeUndefined();
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      chainid: "1,2",
      redirectid: "57",
    })).operation).toBeUndefined();
  });

  it("compiles typed direct-HitDef getpower expressions and rejects malformed pairs", () => {
    expect(compileControllerIr(controller(200, "HitDef", [], { getpower: "9.8" })).operation).toMatchObject({
      kind: "hitdef",
      getPower: [9],
    });
    expect(compileControllerIr(controller(200, "HitDef", [], {
      getpower: "var(1),Parent,var(2)",
    })).operation).toMatchObject({
      kind: "hitdef",
      getPower: ["var(1)", "Parent,var(2)"],
    });
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      getpower: "var(3)",
      redirectid: "57",
    })).operation).toMatchObject({
      kind: "modifyhitdef",
      getPower: ["var(3)"],
      redirectPlayerIdExpression: "57",
    });
    expect(compileControllerIr(controller(200, "Projectile", [], {
      getpower: "var(4),-3.8",
    })).operation).toMatchObject({
      kind: "projectile",
      getPower: ["var(4)", -3],
    });
    expect(compileControllerIr(controller(200, "HitDef", [], { getpower: "1,2,3" })).operation).toBeUndefined();
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      getpower: "var(",
      redirectid: "57",
    })).operation).toBeUndefined();
  });

  it("compiles dynamic and mixed direct-HitDef damage pairs", () => {
    const staticPair = compileControllerIr(controller(200, "HitDef", [], { damage: "40,7" }));
    const dynamicSingle = compileControllerIr(controller(200, "HitDef", [], { damage: "var(1)" }));
    const mixedPair = compileControllerIr(controller(200, "HitDef", [], { damage: "40,Parent,var(2)" }));
    const modified = compileControllerIr(controller(200, "ModifyHitDef", [], {
      damage: "var(3),fvar(1)",
      redirectid: "57",
    }));

    expect(staticPair.operation).toMatchObject({ kind: "hitdef", damage: 40, guardDamage: 7 });
    expect(staticPair.operation).not.toHaveProperty("damageExpressions");
    expect(dynamicSingle.operation).toMatchObject({ kind: "hitdef", damageExpressions: ["var(1)"] });
    expect(mixedPair.operation).toMatchObject({
      kind: "hitdef",
      damageExpressions: [40, "Parent,var(2)"],
    });
    expect(modified.operation).toMatchObject({
      kind: "modifyhitdef",
      damageExpressions: ["var(3)", "fvar(1)"],
      redirectPlayerIdExpression: "57",
    });
    expect(compileControllerIr(controller(200, "HitDef", [], { damage: "1,2,3" })).operation).toBeUndefined();
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      damage: "var(",
      redirectid: "57",
    })).operation).toBeUndefined();
  });

  it("compiles dynamic and mixed direct-HitDef pause pairs", () => {
    const staticSingle = compileControllerIr(controller(200, "HitDef", [], { pausetime: "8" }));
    const dynamic = compileControllerIr(controller(200, "HitDef", [], {
      pausetime: "var(1),fvar(2)",
      "guard.pausetime": "4,Parent,var(3)",
    }));

    expect(staticSingle.operation).toMatchObject({ kind: "hitdef", pauseTime: 8, hitShakeTime: 0 });
    expect(staticSingle.operation).not.toHaveProperty("pauseTimeExpressions");
    expect(dynamic.operation).toMatchObject({
      kind: "hitdef",
      pauseTimeExpressions: ["var(1)", "fvar(2)"],
      guardPauseTimeExpressions: [4, "Parent,var(3)"],
    });
    expect(compileControllerIr(controller(200, "HitDef", [], { pausetime: "1,2,3" })).operation).toBeUndefined();
    expect(compileControllerIr(controller(200, "HitDef", [], { "guard.pausetime": "var(" })).operation).toBeUndefined();
  });

  it("compiles dynamic direct HitDef and ModifyHitDef ground.hittime scalars", () => {
    expect(compileControllerIr(controller(200, "HitDef", [], {
      "ground.hittime": "var(1) + 2",
    })).operation).toMatchObject({
      kind: "hitdef",
      groundHitTime: "var(1) + 2",
    });
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      "ground.hittime": "fvar(2) * 3",
      redirectid: "57",
    })).operation).toMatchObject({
      kind: "modifyhitdef",
      groundHitTime: "fvar(2) * 3",
      redirectPlayerIdExpression: "57",
    });
    expect(compileControllerIr(controller(200, "HitDef", [], {
      "ground.hittime": "var(",
    })).operation).toBeUndefined();
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      "ground.hittime": "var(",
      redirectid: "57",
    })).operation).toBeUndefined();
  });

  it("compiles dynamic direct HitDef and ModifyHitDef ground.slidetime scalars", () => {
    expect(compileControllerIr(controller(200, "HitDef", [], {
      "ground.slidetime": "var(1) + 2",
    })).operation).toMatchObject({
      kind: "hitdef",
      groundSlideTime: "var(1) + 2",
    });
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      "ground.slidetime": "fvar(2) * 3",
      redirectid: "57",
    })).operation).toMatchObject({
      kind: "modifyhitdef",
      groundSlideTime: "fvar(2) * 3",
      redirectPlayerIdExpression: "57",
    });
    expect(compileControllerIr(controller(200, "HitDef", [], {
      "ground.slidetime": "var(",
    })).operation).toBeUndefined();
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      "ground.slidetime": "var(",
      redirectid: "57",
    })).operation).toBeUndefined();
  });

  it("compiles dynamic direct HitDef and ModifyHitDef guard.hittime scalars", () => {
    expect(compileControllerIr(controller(200, "HitDef", [], {
      "guard.hittime": "var(1) + 2",
    })).operation).toMatchObject({
      kind: "hitdef",
      guardHitTime: "var(1) + 2",
    });
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      "guard.hittime": "fvar(2) * 3",
      redirectid: "57",
    })).operation).toMatchObject({
      kind: "modifyhitdef",
      guardHitTime: "fvar(2) * 3",
      redirectPlayerIdExpression: "57",
    });
    expect(compileControllerIr(controller(200, "HitDef", [], {
      "guard.hittime": "var(",
    })).operation).toBeUndefined();
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      "guard.hittime": "var(",
      redirectid: "57",
    })).operation).toBeUndefined();
  });

  it("compiles dynamic direct HitDef and ModifyHitDef guard.slidetime scalars", () => {
    expect(compileControllerIr(controller(200, "HitDef", [], {
      "guard.slidetime": "var(1) + 2",
    })).operation).toMatchObject({
      kind: "hitdef",
      guardSlideTime: "var(1) + 2",
    });
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      "guard.slidetime": "fvar(2) * 3",
      redirectid: "57",
    })).operation).toMatchObject({
      kind: "modifyhitdef",
      guardSlideTime: "fvar(2) * 3",
      redirectPlayerIdExpression: "57",
    });
    expect(compileControllerIr(controller(200, "HitDef", [], {
      "guard.slidetime": "var(",
    })).operation).toBeUndefined();
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      "guard.slidetime": "var(",
      redirectid: "57",
    })).operation).toBeUndefined();
  });

  it("compiles dynamic direct HitDef and ModifyHitDef guard.ctrltime scalars", () => {
    expect(compileControllerIr(controller(200, "HitDef", [], {
      "guard.ctrltime": "var(1) + 2",
    })).operation).toMatchObject({
      kind: "hitdef",
      guardControlTime: "var(1) + 2",
    });
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      "guard.ctrltime": "fvar(2) * 3",
      redirectid: "57",
    })).operation).toMatchObject({
      kind: "modifyhitdef",
      guardControlTime: "fvar(2) * 3",
      redirectPlayerIdExpression: "57",
    });
    expect(compileControllerIr(controller(200, "HitDef", [], {
      "guard.ctrltime": "var(",
    })).operation).toBeUndefined();
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      "guard.ctrltime": "var(",
      redirectid: "57",
    })).operation).toBeUndefined();
  });

  it("compiles dynamic direct HitDef and ModifyHitDef airguard.ctrltime scalars", () => {
    expect(compileControllerIr(controller(200, "HitDef", [], {
      "airguard.ctrltime": "var(1) + 2",
    })).operation).toMatchObject({
      kind: "hitdef",
      airGuardControlTime: "var(1) + 2",
    });
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      "airguard.ctrltime": "fvar(2) * 3",
      redirectid: "57",
    })).operation).toMatchObject({
      kind: "modifyhitdef",
      airGuardControlTime: "fvar(2) * 3",
      redirectPlayerIdExpression: "57",
    });
    expect(compileControllerIr(controller(200, "HitDef", [], {
      "airguard.ctrltime": "var(",
    })).operation).toBeUndefined();
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      "airguard.ctrltime": "var(",
      redirectid: "57",
    })).operation).toBeUndefined();
  });

  it("compiles dynamic direct HitDef and ModifyHitDef air.hittime scalars", () => {
    expect(compileControllerIr(controller(200, "HitDef", [], {
      "air.hittime": "var(1) + 2",
    })).operation).toMatchObject({
      kind: "hitdef",
      airHitTime: "var(1) + 2",
    });
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      "air.hittime": "fvar(2) * 3",
      redirectid: "57",
    })).operation).toMatchObject({
      kind: "modifyhitdef",
      airHitTime: "fvar(2) * 3",
      redirectPlayerIdExpression: "57",
    });
    expect(compileControllerIr(controller(200, "HitDef", [], {
      "air.hittime": "var(",
    })).operation).toBeUndefined();
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      "air.hittime": "var(",
      redirectid: "57",
    })).operation).toBeUndefined();
  });

  it("compiles dynamic direct HitDef and ModifyHitDef down.hittime scalars", () => {
    expect(compileControllerIr(controller(200, "HitDef", [], {
      "down.hittime": "var(1) + 2",
    })).operation).toMatchObject({
      kind: "hitdef",
      downHitTime: "var(1) + 2",
    });
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      "down.hittime": "fvar(2) * 3",
      redirectid: "57",
    })).operation).toMatchObject({
      kind: "modifyhitdef",
      downHitTime: "fvar(2) * 3",
      redirectPlayerIdExpression: "57",
    });
    expect(compileControllerIr(controller(200, "HitDef", [], {
      "down.hittime": "var(",
    })).operation).toBeUndefined();
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      "down.hittime": "var(",
      redirectid: "57",
    })).operation).toBeUndefined();
  });

  it("compiles dynamic direct HitDef and ModifyHitDef guard.dist scalars", () => {
    expect(compileControllerIr(controller(200, "HitDef", [], {
      "guard.dist": "var(1) + 2",
    })).operation).toMatchObject({
      kind: "hitdef",
      guardDistance: "var(1) + 2",
    });
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      "guard.dist": "fvar(2) * 3",
      redirectid: "57",
    })).operation).toMatchObject({
      kind: "modifyhitdef",
      guardDistance: "fvar(2) * 3",
      redirectPlayerIdExpression: "57",
    });
    expect(compileControllerIr(controller(200, "HitDef", [], {
      "guard.dist": "var(",
    })).operation).toBeUndefined();
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      "guard.dist": "var(",
      redirectid: "57",
    })).operation).toBeUndefined();
  });

  it("compiles dynamic direct HitDef and ModifyHitDef ground.velocity X/Y pairs", () => {
    expect(compileControllerIr(controller(200, "HitDef", [], {
      "ground.velocity": "var(1)",
    })).operation).toMatchObject({
      kind: "hitdef",
      groundVelocityExpressions: ["var(1)"],
    });
    expect(compileControllerIr(controller(200, "HitDef", [], {
      "ground.velocity": "-4.5,var(2)",
    })).operation).toMatchObject({
      kind: "hitdef",
      groundVelocityExpressions: [-4.5, "var(2)"],
    });
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      "ground.velocity": "fvar(1),var(2) + .5",
      redirectid: "57",
    })).operation).toMatchObject({
      kind: "modifyhitdef",
      groundVelocity: ["fvar(1)", "var(2) + .5"],
      redirectPlayerIdExpression: "57",
    });
    expect(compileControllerIr(controller(200, "HitDef", [], {
      "ground.velocity": "var(",
    })).operation).toBeUndefined();
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      "ground.velocity": "var(1),var(2),var(3)",
      redirectid: "57",
    })).operation).toBeUndefined();
  });

  it("compiles direct HitDef and root ModifyHitDef guard.velocity X expressions", () => {
    expect(compileControllerIr(controller(200, "HitDef", [], {
      "guard.velocity": "-4.5",
    })).operation).toMatchObject({
      kind: "hitdef",
      guardVelocity: [-4.5],
    });
    expect(compileControllerIr(controller(200, "HitDef", [], {
      "guard.velocity": "var(1) + 2",
    })).operation).toMatchObject({
      kind: "hitdef",
      guardVelocityExpression: "var(1) + 2",
    });
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      "guard.velocity": "-3.5",
      redirectid: "57",
    })).operation).toMatchObject({
      kind: "modifyhitdef",
      guardVelocityExpression: -3.5,
      redirectPlayerIdExpression: "57",
    });
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      "guard.velocity": "fvar(2) - 1",
      redirectid: "57",
    })).operation).toMatchObject({
      kind: "modifyhitdef",
      guardVelocityExpression: "fvar(2) - 1",
      redirectPlayerIdExpression: "57",
    });
    expect(compileControllerIr(controller(200, "HitDef", [], {
      "guard.velocity": "var(",
    })).operation).toBeUndefined();
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      "guard.velocity": "var(",
      redirectid: "57",
    })).operation).toBeUndefined();
  });

  it("compiles direct HitDef and root ModifyHitDef air.velocity X/Y expressions", () => {
    expect(compileControllerIr(controller(200, "HitDef", [], {
      "air.velocity": "-6,-10,4",
    })).operation).toMatchObject({
      kind: "hitdef",
      airVelocity: [-6, -10, 4],
    });
    expect(compileControllerIr(controller(200, "HitDef", [], {
      "air.velocity": "var(1)",
    })).operation).toMatchObject({
      kind: "hitdef",
      airVelocityExpressions: ["var(1)"],
    });
    expect(compileControllerIr(controller(200, "HitDef", [], {
      "air.velocity": "-6.5,fvar(2)",
    })).operation).toMatchObject({
      kind: "hitdef",
      airVelocityExpressions: [-6.5, "fvar(2)"],
    });
    expect(compileControllerIr(controller(200, "HitDef", [], {
      "air.velocity": "var(1),var(2),var(3)",
    })).operation).toBeUndefined();
    expect(compileControllerIr(controller(200, "HitDef", [], {
      "air.velocity": "var(1),var(",
    })).operation).toBeUndefined();
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      "air.velocity": "var(1)",
      redirectid: "57",
    })).operation).toMatchObject({
      kind: "modifyhitdef",
      airVelocity: ["var(1)"],
      redirectPlayerIdExpression: "57",
    });
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      "air.velocity": "-7.5,fvar(2)",
      redirectid: "57",
    })).operation).toMatchObject({
      kind: "modifyhitdef",
      airVelocity: [-7.5, "fvar(2)"],
      redirectPlayerIdExpression: "57",
    });
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      "air.velocity": "var(1),var(2),3",
      redirectid: "57",
    })).operation).toBeUndefined();
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      "air.velocity": "var(1),var(",
      redirectid: "57",
    })).operation).toBeUndefined();
  });

  it("compiles direct HitDef down.velocity X/Y expressions", () => {
    expect(compileControllerIr(controller(200, "HitDef", [], {
      "down.velocity": "-4,-6,3",
    })).operation).toMatchObject({
      kind: "hitdef",
      downVelocity: [-4, -6, 3],
    });
    expect(compileControllerIr(controller(200, "HitDef", [], {
      "down.velocity": "var(1)",
    })).operation).toMatchObject({
      kind: "hitdef",
      downVelocityExpressions: ["var(1)"],
    });
    expect(compileControllerIr(controller(200, "HitDef", [], {
      "down.velocity": "-3.5,fvar(2)",
    })).operation).toMatchObject({
      kind: "hitdef",
      downVelocityExpressions: [-3.5, "fvar(2)"],
    });
    expect(compileControllerIr(controller(200, "HitDef", [], {
      "down.velocity": "var(1),var(2),var(3)",
    })).operation).toBeUndefined();
    expect(compileControllerIr(controller(200, "HitDef", [], {
      "down.velocity": "var(1),var(",
    })).operation).toBeUndefined();
  });

  it("compiles root ModifyHitDef down.velocity with live component-preserving expressions", () => {
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      redirectid: "57",
      "down.velocity": "-2,-8,2",
    })).operation).toMatchObject({
      kind: "modifyhitdef",
      downVelocity: [-2, -8, 2],
      redirectPlayerIdExpression: "57",
    });
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      redirectid: "57",
      "down.velocity": "var(1)",
    })).operation).toMatchObject({
      kind: "modifyhitdef",
      downVelocityExpressions: ["var(1)"],
      redirectPlayerIdExpression: "57",
    });
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      redirectid: "57",
      "down.velocity": "-3.5,fvar(2)",
    })).operation).toMatchObject({
      kind: "modifyhitdef",
      downVelocityExpressions: [-3.5, "fvar(2)"],
    });
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      redirectid: "57",
      "down.velocity": "var(1),var(2),var(3)",
    })).operation).toMatchObject({
      kind: "modifyhitdef",
      downVelocityExpressions: ["var(1)", "var(2)"],
      downVelocityZExpression: "var(3)",
      redirectPlayerIdExpression: "57",
    });
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      redirectid: "57",
      "down.velocity": "-3.5,fvar(2),var(3)",
    })).operation).toMatchObject({
      kind: "modifyhitdef",
      downVelocityExpressions: [-3.5, "fvar(2)"],
      downVelocityZExpression: "var(3)",
    });
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      redirectid: "57",
      "down.velocity": "var(1),var(",
    })).operation).toBeUndefined();
  });

  it("compiles one-, two-, and three-component direct HitDef airguard.velocity expressions", () => {
    expect(compileControllerIr(controller(200, "HitDef", [], {
      "airguard.velocity": "-4.25",
    })).operation).toMatchObject({
      kind: "hitdef",
      airGuardVelocity: [-4.25],
    });
    expect(compileControllerIr(controller(200, "HitDef", [], {
      "airguard.velocity": "-5.5,-2.25",
    })).operation).toMatchObject({
      kind: "hitdef",
      airGuardVelocity: [-5.5, -2.25],
    });
    expect(compileControllerIr(controller(200, "HitDef", [], {
      "airguard.velocity": "var(1),fvar(2)",
    })).operation).toMatchObject({
      kind: "hitdef",
      airGuardVelocityExpressions: ["var(1)", "fvar(2)"],
    });
    expect(compileControllerIr(controller(200, "HitDef", [], {
      "airguard.velocity": "-6.5,var(3) + .5",
    })).operation).toMatchObject({
      kind: "hitdef",
      airGuardVelocityExpressions: [-6.5, "var(3) + .5"],
    });
    expect(compileControllerIr(controller(200, "HitDef", [], {
      "airguard.velocity": "var(1)",
    })).operation).toMatchObject({
      kind: "hitdef",
      airGuardVelocityExpressions: ["var(1)"],
    });
    expect(compileControllerIr(controller(200, "HitDef", [], {
      "airguard.velocity": "var(1),var(2),var(3)",
    })).operation).toMatchObject({
      kind: "hitdef",
      airGuardVelocityExpressions: ["var(1)", "var(2)"],
      airGuardVelocityZExpression: "var(3)",
    });
    expect(compileControllerIr(controller(200, "HitDef", [], {
      "airguard.velocity": "var(1),var(",
    })).operation).toBeUndefined();
  });

  it("compiles one-, two-, and three-component root ModifyHitDef airguard.velocity expressions", () => {
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      "airguard.velocity": "-4.25",
      redirectid: "57",
    })).operation).toMatchObject({
      kind: "modifyhitdef",
      airGuardVelocityExpressions: [-4.25],
      redirectPlayerIdExpression: "57",
    });
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      "airguard.velocity": "-5.5,-2.25",
      redirectid: "57",
    })).operation).toMatchObject({
      kind: "modifyhitdef",
      airGuardVelocityExpressions: [-5.5, -2.25],
      redirectPlayerIdExpression: "57",
    });
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      "airguard.velocity": "-6.5,var(3) + .5",
      redirectid: "57",
    })).operation).toMatchObject({
      kind: "modifyhitdef",
      airGuardVelocityExpressions: [-6.5, "var(3) + .5"],
    });
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      "airguard.velocity": "var(1),fvar(2)",
      redirectid: "57",
    })).operation).toMatchObject({
      kind: "modifyhitdef",
      airGuardVelocityExpressions: ["var(1)", "fvar(2)"],
    });
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      "airguard.velocity": "-7,-3,4",
      redirectid: "57",
    })).operation).toMatchObject({
      kind: "modifyhitdef",
      airGuardVelocityExpressions: [-7, -3],
      airGuardVelocityZ: 4,
    });
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      "airguard.velocity": "var(1)",
      redirectid: "57",
    })).operation).toMatchObject({
      kind: "modifyhitdef",
      airGuardVelocityExpressions: ["var(1)"],
    });
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      "airguard.velocity": "var(1),var(2),var(3)",
      redirectid: "57",
    })).operation).toMatchObject({
      kind: "modifyhitdef",
      airGuardVelocityExpressions: ["var(1)", "var(2)"],
      airGuardVelocityZExpression: "var(3)",
    });
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      "airguard.velocity": "var(1),var(",
      redirectid: "57",
    })).operation).toBeUndefined();
  });

  it("compiles typed HitDef givepower expressions and rejects malformed pairs", () => {
    expect(compileControllerIr(controller(200, "HitDef", [], { givepower: "9.8" })).operation).toMatchObject({
      kind: "hitdef",
      givePower: [9],
    });
    expect(compileControllerIr(controller(200, "HitDef", [], {
      givepower: "var(1),Parent,var(2)",
    })).operation).toMatchObject({
      kind: "hitdef",
      givePower: ["var(1)", "Parent,var(2)"],
    });
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      givepower: "var(3)",
      redirectid: "57",
    })).operation).toMatchObject({
      kind: "modifyhitdef",
      givePower: ["var(3)"],
      redirectPlayerIdExpression: "57",
    });
    expect(compileControllerIr(controller(200, "Projectile", [], {
      givepower: "var(4),-3.8",
    })).operation).toMatchObject({
      kind: "projectile",
      givePower: ["var(4)", -3],
    });
    expect(compileControllerIr(controller(200, "HitDef", [], { givepower: "1,2,3" })).operation).toBeUndefined();
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      givepower: "var(",
      redirectid: "57",
    })).operation).toBeUndefined();
  });

  it("compiles contact PalFX for HitDef, ModifyHitDef, and Projectile", () => {
    const params = {
      "palfx.time": "var(0) + 2",
      "palfx.add": "var(1),Parent,var(2),-3",
      "palfx.mul": "200,201,202",
      "palfx.color": "var(3)",
      "palfx.invertall": "1",
    };
    expect(compileControllerIr(controller(200, "HitDef", [], params)).operation).toMatchObject({
      kind: "hitdef",
      paletteFx: {
        time: "var(0) + 2",
        add: ["var(1)", "Parent,var(2)", -3],
        mul: [200, 201, 202],
        color: "var(3)",
        invertAll: 1,
      },
    });
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], { ...params, redirectid: "57" })).operation)
      .toMatchObject({ kind: "modifyhitdef", paletteFx: expect.any(Object) });
    expect(compileControllerIr(controller(200, "Projectile", [], params)).operation)
      .toMatchObject({ kind: "projectile", paletteFx: expect.any(Object) });
    expect(compileControllerIr(controller(200, "HitDef", [], { "palfx.add": "1,2" })).operation).toBeUndefined();
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      redirectid: "57",
      "palfx.mul": "1,2,3,4",
    })).operation).toBeUndefined();
  });

  it("compiles direct HitDef contact and fall EnvShake expressions and rejects malformed values", () => {
    const params = {
      "envshake.time": "var(0) + 2",
      "envshake.freq": "Parent,var(1)",
      "envshake.ampl": "-7.8",
      "envshake.phase": "var(2) * .5",
      "envshake.mul": "1.25",
      "envshake.dir": "-30",
      "fall.envshake.time": "var(3) + 4",
      "fall.envshake.freq": "Root,var(4)",
      "fall.envshake.ampl": "-11.9",
      "fall.envshake.phase": "var(5) * .25",
      "fall.envshake.mul": ".75",
      "fall.envshake.dir": "67.5",
    };
    expect(compileControllerIr(controller(200, "HitDef", [], params)).operation).toMatchObject({
      kind: "hitdef",
      envShake: {
        time: "var(0) + 2",
        freq: "Parent,var(1)",
        ampl: -7,
        phase: "var(2) * .5",
        mul: 1.25,
        dir: -30,
      },
      fallEnvShake: {
        time: "var(3) + 4",
        freq: "Root,var(4)",
        ampl: -11,
        phase: "var(5) * .25",
        mul: 0.75,
        dir: 67.5,
      },
    });
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], { ...params, redirectid: "57" })).operation)
      .toMatchObject({ kind: "modifyhitdef", envShake: expect.any(Object), fallEnvShake: expect.any(Object) });
    expect(compileControllerIr(controller(200, "HitDef", [], { "envshake.time": "var(" })).operation).toBeUndefined();
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      redirectid: "57",
      "envshake.freq": "Parent,",
    })).operation).toBeUndefined();
    expect(compileControllerIr(controller(200, "HitDef", [], { "fall.envshake.phase": "var(" })).operation).toBeUndefined();
  });

  it("compiles dynamic direct HitDef fall impact fields and live ModifyHitDef replacements", () => {
    const params = {
      "fall.damage": "var(0) + 3",
      "fall.xvelocity": "Parent,var(1)",
      "fall.yvelocity": "var(2) * .5",
      "fall.zvelocity": "Root,var(3)",
    };
    expect(compileControllerIr(controller(200, "HitDef", [], params)).operation).toMatchObject({
      kind: "hitdef",
      fallImpact: {
        damage: "var(0) + 3",
        xVelocity: "Parent,var(1)",
        yVelocity: "var(2) * .5",
        zVelocity: "Root,var(3)",
      },
    });
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], { ...params, redirectid: "57" })).operation)
      .toMatchObject({ kind: "modifyhitdef", fallImpact: expect.any(Object) });
    expect(compileControllerIr(controller(200, "HitDef", [], { "fall.damage": "var(" })).operation).toBeUndefined();
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      redirectid: "57",
      "fall.zvelocity": "Parent,",
    })).operation).toBeUndefined();
  });

  it("compiles dynamic direct HitDef fall recovery fields and live ModifyHitDef replacements", () => {
    const params = {
      "fall.recover": "var(0) - 3",
      "fall.recovertime": "Parent,var(1)",
      "down.recover": "var(2) - 2",
      "down.recovertime": "Root,var(3)",
    };
    expect(compileControllerIr(controller(200, "HitDef", [], params)).operation).toMatchObject({
      kind: "hitdef",
      fallRecovery: {
        recover: "var(0) - 3",
        recoverTime: "Parent,var(1)",
        downRecover: "var(2) - 2",
        downRecoverTime: "Root,var(3)",
      },
    });
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], { ...params, redirectid: "57" })).operation)
      .toMatchObject({ kind: "modifyhitdef", fallRecovery: expect.any(Object) });
    expect(compileControllerIr(controller(200, "HitDef", [], { "fall.recover": "var(" })).operation).toBeUndefined();
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      redirectid: "57",
      "down.recovertime": "Parent,",
    })).operation).toBeUndefined();
  });

  it("compiles dynamic direct HitDef fall flags and live ModifyHitDef replacements", () => {
    const params = {
      fall: "var(0) - 2",
      "air.fall": "Parent,var(1)",
      "fall.kill": "Root,var(2)",
    };
    expect(compileControllerIr(controller(200, "HitDef", [], params)).operation).toMatchObject({
      kind: "hitdef",
      fallFlags: {
        enabled: "var(0) - 2",
        airFall: "Parent,var(1)",
        kill: "Root,var(2)",
      },
    });
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], { ...params, redirectid: "57" })).operation)
      .toMatchObject({ kind: "modifyhitdef", fallFlags: expect.any(Object) });
    expect(compileControllerIr(controller(200, "HitDef", [], { fall: "var(" })).operation).toBeUndefined();
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      redirectid: "57",
      "air.fall": "Parent,",
    })).operation).toBeUndefined();
  });

  it("compiles dynamic direct HitDef down.bounce and live ModifyHitDef replacement", () => {
    expect(compileControllerIr(controller(200, "HitDef", [], {
      "down.bounce": "var(0) - 2",
    })).operation).toMatchObject({
      kind: "hitdef",
      downBounceExpression: "var(0) - 2",
    });
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      redirectid: "57",
      "down.bounce": "Parent,var(1)",
    })).operation).toMatchObject({
      kind: "modifyhitdef",
      downBounceExpression: "Parent,var(1)",
    });
    expect(compileControllerIr(controller(200, "HitDef", [], { "down.bounce": "var(" })).operation).toBeUndefined();
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      redirectid: "57",
      "down.bounce": "Parent,",
    })).operation).toBeUndefined();
  });

  it("compiles dynamic direct HitDef air.juggle and rejects malformed expressions", () => {
    expect(compileControllerIr(controller(200, "HitDef", [], {
      "air.juggle": "var(0) + 2",
    })).operation).toMatchObject({
      kind: "hitdef",
      airJuggleExpression: "var(0) + 2",
    });
    expect(compileControllerIr(controller(200, "HitDef", [], {
      "air.juggle": "Parent,var(1)",
    })).operation).toMatchObject({
      kind: "hitdef",
      airJuggleExpression: "Parent,var(1)",
    });
    expect(compileControllerIr(controller(200, "HitDef", [], { "air.juggle": "var(" })).operation).toBeUndefined();
  });

  it("compiles dynamic direct HitDef numhits and live ModifyHitDef replacement", () => {
    expect(compileControllerIr(controller(200, "HitDef", [], {
      numhits: "var(0) + 2",
    })).operation).toMatchObject({
      kind: "hitdef",
      hitCountExpression: "var(0) + 2",
    });
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      redirectid: "57",
      numhits: "Parent,var(1)",
    })).operation).toMatchObject({
      kind: "modifyhitdef",
      hitCountExpression: "Parent,var(1)",
    });
    expect(compileControllerIr(controller(200, "HitDef", [], { numhits: "var(" })).operation).toBeUndefined();
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      redirectid: "57",
      numhits: "Parent,",
    })).operation).toBeUndefined();
  });

  it("compiles dynamic direct HitDef lethal flags and live ModifyHitDef replacements", () => {
    const params = {
      kill: "var(0)",
      "guard.kill": "Parent,var(1)",
      hitonce: "Root,var(2)",
    };
    expect(compileControllerIr(controller(200, "HitDef", [], params)).operation).toMatchObject({
      kind: "hitdef",
      lethalFlags: {
        kill: "var(0)",
        guardKill: "Parent,var(1)",
        hitOnce: "Root,var(2)",
      },
    });
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], { ...params, redirectid: "57" })).operation)
      .toMatchObject({ kind: "modifyhitdef", lethalFlags: expect.any(Object) });
    expect(compileControllerIr(controller(200, "HitDef", [], { kill: "var(" })).operation).toBeUndefined();
    expect(compileControllerIr(controller(200, "ModifyHitDef", [], {
      redirectid: "57",
      "guard.kill": "Parent,",
    })).operation).toBeUndefined();
  });

  it("compiles typed ModifyProjectile getpower expressions and rejects malformed pairs", () => {
    expect(compileControllerIr(controller(200, "ModifyProjectile", [], { getpower: "9.8" })).operation).toMatchObject({
      kind: "modifyprojectile",
      getPower: [9],
    });
    expect(compileControllerIr(controller(200, "ModifyProjectile", [], {
      getpower: "var(1),Parent,var(2)",
    })).operation).toMatchObject({
      kind: "modifyprojectile",
      getPower: ["var(1)", "Parent,var(2)"],
    });
    expect(compileControllerIr(controller(200, "ModifyProjectile", [], { getpower: "1,2,3" })).operation).toBeUndefined();
    expect(compileControllerIr(controller(200, "ModifyProjectile", [], { getpower: "var(" })).operation).toBeUndefined();
  });

  it("compiles fresh and live Projectile damage expressions as typed pairs", () => {
    expect(compileControllerIr(controller(200, "Projectile", [], {
      damage: "var(1),Parent,var(2)",
    })).operation).toMatchObject({
      kind: "projectile",
      damageExpressions: ["var(1)", "Parent,var(2)"],
    });
    expect(compileControllerIr(controller(200, "ModifyProjectile", [], {
      damage: "var(3)",
    })).operation).toMatchObject({
      kind: "modifyprojectile",
      damageExpressions: ["var(3)"],
    });
    expect(compileControllerIr(controller(200, "Projectile", [], { damage: "1,2,3" })).operation).toBeUndefined();
    expect(compileControllerIr(controller(200, "ModifyProjectile", [], { damage: "var(" })).operation).toBeUndefined();
  });

  it("compiles typed ModifyProjectile projanim expressions and rejects non-scalar input", () => {
    expect(compileControllerIr(controller(200, "ModifyProjectile", [], { projanim: "930" })).operation).toMatchObject({
      kind: "modifyprojectile",
      projAnim: 930,
    });
    expect(compileControllerIr(controller(200, "ModifyProjectile", [], { projanim: "var(0) + 2" })).operation).toMatchObject({
      kind: "modifyprojectile",
      projAnimExpression: "var(0) + 2",
    });
    expect(compileControllerIr(controller(200, "ModifyProjectile", [], { projanim: "var(" })).operation).toBeUndefined();
    expect(compileControllerIr(controller(200, "ModifyProjectile", [], { projanim: "var(0),930" })).operation).toBeUndefined();
  });

  it("compiles static root ModifyHitDef RedirectID payloads and rejects unsupported values", () => {
    const modified = compileControllerIr(
      controller(200, "ModifyHitDef", [], {
        damage: "41,8",
        "air.hittime": "18",
        "down.hittime": "20",
        "ground.velocity": "-3,-4,1.25",
        "air.velocity": "-5,-6,1.5",
        "down.velocity": "-2,0,1.75",
        "down.bounce": "0",
        "guard.velocity": "-1,0,2",
        "airguard.velocity": "-2,-1,2.5",
        xaccel: "-.2",
        yaccel: ".4",
        zaccel: ".15",
        "stand.friction": ".62",
        "crouch.friction": ".72",
        sparkscale: "1.5,-0.5",
        "guard.sparkscale": "0.75",
        id: "92",
        chainid: "13",
        nochainid: "40,41,42,43,44,45,46,47,48,49",
        numhits: "3",
        attr: "C,HP",
        guardflag: "H",
        hitflag: "LAF",
        p1stateno: "777",
        p2stateno: "888",
        p2getp1state: "0",
        p1sprpriority: "5.8",
        p2sprpriority: "-4.6",
        priority: "12.8, Dodge",
        kill: "0",
        "guard.kill": "0",
        "fall.kill": "0",
        hitonce: "0",
        redirectid: "var(0)",
      }),
    );
    const primaryDamageOnly = compileControllerIr(
      controller(200, "ModifyHitDef", [], { damage: "41", redirectid: "57" }),
    );
    const filtersOnly = compileControllerIr(
      controller(200, "ModifyHitDef", [], { attr: "S,NA", guardflag: "MA", hitflag: "MAF", redirectid: "57" }),
    );
    const targetStateOnly = compileControllerIr(
      controller(200, "ModifyHitDef", [], { p1stateno: "777.4", p2stateno: "888.6", redirectid: "57" }),
    );
    const enabledKill = compileControllerIr(
      controller(200, "ModifyHitDef", [], { kill: "1", "guard.kill": "-2", "fall.kill": "-3", hitonce: "-4", redirectid: "57" }),
    );
    const noPayload = compileControllerIr(
      controller(200, "ModifyHitDef", [], { redirectid: "57" }),
    );
    const dynamicPayload = compileControllerIr(
      controller(200, "ModifyHitDef", [], { damage: "var(1)", redirectid: "57" }),
    );
    const dynamicAcceleration = compileControllerIr(
      controller(200, "ModifyHitDef", [], { xaccel: "var(1)", redirectid: "57" }),
    );
    const dynamicFriction = compileControllerIr(
      controller(200, "ModifyHitDef", [], {
        "stand.friction": "var(1) + .1",
        "crouch.friction": "var(2)",
        redirectid: "57",
      }),
    );
    const malformedFriction = compileControllerIr(
      controller(200, "ModifyHitDef", [], { "stand.friction": "var(", redirectid: "57" }),
    );
    const dynamicSparkScale = compileControllerIr(
      controller(200, "ModifyHitDef", [], {
        sparkscale: "var(3)",
        "guard.sparkscale": "fvar(1),-var(4)",
        redirectid: "57",
      }),
    );
    const malformedSparkScale = compileControllerIr(
      controller(200, "ModifyHitDef", [], { sparkscale: "1,2,3", redirectid: "57" }),
    );
    const dynamicHitCount = compileControllerIr(
      controller(200, "ModifyHitDef", [], { damage: "41", numhits: "var(1)", redirectid: "57" }),
    );
    const dynamicId = compileControllerIr(
      controller(200, "ModifyHitDef", [], { damage: "41", id: "var(1)", redirectid: "57" }),
    );
    const dynamicChainId = compileControllerIr(
      controller(200, "ModifyHitDef", [], { damage: "41", chainid: "var(1)", redirectid: "57" }),
    );
    const dynamicNoChainIds = compileControllerIr(
      controller(200, "ModifyHitDef", [], { nochainid: "var(1) + 40,var(1) + 41", redirectid: "57" }),
    );
    const malformedNoChainIds = compileControllerIr(
      controller(200, "ModifyHitDef", [], { nochainid: "var(", redirectid: "57" }),
    );
    const dynamicAttr = compileControllerIr(
      controller(200, "ModifyHitDef", [], { damage: "41", attr: "var(1)", redirectid: "57" }),
    );
    const dynamicGuardFlag = compileControllerIr(
      controller(200, "ModifyHitDef", [], { damage: "41", guardflag: "var(1)", redirectid: "57" }),
    );
    const dynamicHitFlag = compileControllerIr(
      controller(200, "ModifyHitDef", [], { damage: "41", hitflag: "var(1)", redirectid: "57" }),
    );
    const dynamicP1StateNo = compileControllerIr(
      controller(200, "ModifyHitDef", [], { damage: "41", p1stateno: "var(1)", redirectid: "57" }),
    );
    const dynamicP2StateNo = compileControllerIr(
      controller(200, "ModifyHitDef", [], { damage: "41", p2stateno: "var(1)", redirectid: "57" }),
    );
    const dynamicP2GetP1State = compileControllerIr(
      controller(200, "ModifyHitDef", [], { damage: "41", p2getp1state: "var(1)", redirectid: "57" }),
    );
    const dynamicP1SpritePriority = compileControllerIr(
      controller(200, "ModifyHitDef", [], { damage: "41", p1sprpriority: "var(1)", redirectid: "57" }),
    );
    const dynamicP2SpritePriority = compileControllerIr(
      controller(200, "ModifyHitDef", [], { damage: "41", p2sprpriority: "var(1)", redirectid: "57" }),
    );
    const dynamicPriority = compileControllerIr(
      controller(200, "ModifyHitDef", [], { damage: "41", priority: "var(1), Hit", redirectid: "57" }),
    );
    const malformedPriority = compileControllerIr(
      controller(200, "ModifyHitDef", [], { damage: "41", priority: "12, Unknown", redirectid: "57" }),
    );
    const dynamicKill = compileControllerIr(
      controller(200, "ModifyHitDef", [], { damage: "41", kill: "var(1)", redirectid: "57" }),
    );
    const dynamicGuardKill = compileControllerIr(
      controller(200, "ModifyHitDef", [], { damage: "41", "guard.kill": "var(1)", redirectid: "57" }),
    );
    const dynamicFallKill = compileControllerIr(
      controller(200, "ModifyHitDef", [], { damage: "41", "fall.kill": "var(1)", redirectid: "57" }),
    );
    const dynamicHitOnce = compileControllerIr(
      controller(200, "ModifyHitDef", [], { damage: "41", hitonce: "var(1)", redirectid: "57" }),
    );
    const malformedKill = compileControllerIr(
      controller(200, "ModifyHitDef", [], { damage: "41", kill: "never", redirectid: "57" }),
    );
    const malformedFallKill = compileControllerIr(
      controller(200, "ModifyHitDef", [], { damage: "41", "fall.kill": "never", redirectid: "57" }),
    );
    const malformedHitOnce = compileControllerIr(
      controller(200, "ModifyHitDef", [], { damage: "41", hitonce: "never", redirectid: "57" }),
    );
    const malformedRedirect = compileControllerIr(
      controller(200, "ModifyHitDef", [], { damage: "41", redirectid: "var(" }),
    );
    const oversizedPair = compileControllerIr(
      controller(200, "ModifyHitDef", [], { damage: "41,8,4", redirectid: "57" }),
    );
    const negativeId = compileControllerIr(
      controller(200, "ModifyHitDef", [], { damage: "41", id: "-3", redirectid: "57" }),
    );

    expect(modified).toMatchObject({
      supportLevel: "partial",
      operation: {
        kind: "modifyhitdef",
        damage: 41,
        guardDamage: 8,
        airHitTime: 18,
        downHitTime: 20,
        groundVelocity: [-3, -4],
        groundVelocityZ: 1.25,
        airVelocity: [-5, -6],
        airVelocityZ: 1.5,
        downVelocity: [-2, 0, 1.75],
        downBounce: false,
        guardVelocityZ: 2,
        airGuardVelocityZ: 2.5,
        xAccel: -0.2,
        yAccel: 0.4,
        zAccel: 0.15,
        standFriction: 0.62,
        crouchFriction: 0.72,
        hitSparkScale: [1.5, -0.5],
        guardSparkScale: [0.75],
        id: 92,
        chainId: 13,
        noChainIds: [40, 41, 42, 43, 44, 45, 46, 47],
        hitCount: 3,
        attr: "C,HP",
        guardFlag: "H",
        hitFlag: "LAF",
        p1StateNo: 777,
        p2StateNo: 888,
        p2GetP1State: false,
        p1SpritePriority: 5,
        p2SpritePriority: -4,
        priority: 12,
        priorityType: "dodge",
        kill: false,
        guardKill: false,
        fallKill: false,
        hitOnce: false,
        redirectPlayerIdExpression: "var(0)",
      },
    });
    expect(primaryDamageOnly.operation).toEqual({
      kind: "modifyhitdef",
      damage: 41,
      redirectPlayerIdExpression: "57",
    });
    expect(filtersOnly.operation).toEqual({
      kind: "modifyhitdef",
      attr: "S,NA",
      guardFlag: "MA",
      hitFlag: "MAF",
      redirectPlayerIdExpression: "57",
    });
    expect(targetStateOnly.operation).toEqual({
      kind: "modifyhitdef",
      p1StateNo: 777,
      p2StateNo: 889,
      redirectPlayerIdExpression: "57",
    });
    expect(enabledKill.operation).toEqual({
      kind: "modifyhitdef",
      kill: true,
      guardKill: true,
      fallKill: true,
      hitOnce: true,
      redirectPlayerIdExpression: "57",
    });
    expect(noPayload.operation).toBeUndefined();
    expect(dynamicPayload.supportLevel).toBe("partial");
    expect(dynamicPayload.operation).toMatchObject({ damageExpressions: ["var(1)"] });
    expect(dynamicAcceleration.supportLevel).toBe("partial");
    expect(dynamicAcceleration.operation).toMatchObject({
      kind: "modifyhitdef",
      xAccel: "var(1)",
      redirectPlayerIdExpression: "57",
    });
    expect(dynamicFriction.supportLevel).toBe("partial");
    expect(dynamicFriction.operation).toMatchObject({
      kind: "modifyhitdef",
      standFriction: "var(1) + .1",
      crouchFriction: "var(2)",
      redirectPlayerIdExpression: "57",
    });
    expect(malformedFriction.supportLevel).toBe("unsupported");
    expect(malformedFriction.operation).toBeUndefined();
    expect(dynamicSparkScale.operation).toMatchObject({
      hitSparkScale: ["var(3)"],
      guardSparkScale: ["fvar(1)", "-var(4)"],
    });
    expect(malformedSparkScale.operation).toBeUndefined();
    expect(dynamicHitCount.supportLevel).toBe("partial");
    expect(dynamicHitCount.operation).toMatchObject({ hitCountExpression: "var(1)" });
    expect(dynamicId.supportLevel).toBe("partial");
    expect(dynamicId.operation).toMatchObject({ id: "var(1)" });
    expect(dynamicChainId.supportLevel).toBe("partial");
    expect(dynamicChainId.operation).toMatchObject({ chainId: "var(1)" });
    expect(dynamicNoChainIds.supportLevel).toBe("partial");
    expect(dynamicNoChainIds.operation).toEqual({
      kind: "modifyhitdef",
      redirectPlayerIdExpression: "57",
    });
    expect(malformedNoChainIds.supportLevel).toBe("unsupported");
    expect(malformedNoChainIds.operation).toBeUndefined();
    expect(dynamicAttr.supportLevel).toBe("unsupported");
    expect(dynamicAttr.operation).toBeUndefined();
    expect(dynamicGuardFlag.supportLevel).toBe("unsupported");
    expect(dynamicGuardFlag.operation).toBeUndefined();
    expect(dynamicHitFlag.supportLevel).toBe("unsupported");
    expect(dynamicHitFlag.operation).toBeUndefined();
    expect(dynamicP1StateNo.supportLevel).toBe("unsupported");
    expect(dynamicP1StateNo.operation).toBeUndefined();
    expect(dynamicP2StateNo.supportLevel).toBe("unsupported");
    expect(dynamicP2StateNo.operation).toBeUndefined();
    expect(dynamicP2GetP1State.supportLevel).toBe("unsupported");
    expect(dynamicP2GetP1State.operation).toBeUndefined();
    expect(dynamicP1SpritePriority.supportLevel).toBe("partial");
    expect(dynamicP1SpritePriority.operation).toMatchObject({ p1SpritePriorityExpression: "var(1)" });
    expect(dynamicP2SpritePriority.supportLevel).toBe("partial");
    expect(dynamicP2SpritePriority.operation).toMatchObject({ p2SpritePriorityExpression: "var(1)" });
    expect(dynamicPriority.supportLevel).toBe("partial");
    expect(dynamicPriority.operation).toMatchObject({ priorityExpression: "var(1)", priorityType: "hit" });
    expect(malformedPriority.operation).toBeUndefined();
    expect(dynamicKill.supportLevel).toBe("partial");
    expect(dynamicKill.operation).toMatchObject({ lethalFlags: { kill: "var(1)" } });
    expect(dynamicGuardKill.supportLevel).toBe("partial");
    expect(dynamicGuardKill.operation).toMatchObject({ lethalFlags: { guardKill: "var(1)" } });
    expect(dynamicFallKill.supportLevel).toBe("partial");
    expect(dynamicFallKill.operation).toMatchObject({
      kind: "modifyhitdef",
      fallFlags: { kill: "var(1)" },
      redirectPlayerIdExpression: "57",
    });
    expect(dynamicHitOnce.supportLevel).toBe("partial");
    expect(dynamicHitOnce.operation).toMatchObject({ lethalFlags: { hitOnce: "var(1)" } });
    expect(malformedKill.operation).toBeUndefined();
    expect(malformedFallKill.operation).toBeUndefined();
    expect(malformedHitOnce.operation).toBeUndefined();
    expect(malformedRedirect.operation).toBeUndefined();
    expect(oversizedPair.operation).toBeUndefined();
    expect(negativeId.operation).toEqual({ kind: "modifyhitdef", damage: 41, id: 0, redirectPlayerIdExpression: "57" });
  });

  it("compiles static root ModifyReversalDef RedirectID core fields and rejects unsupported payloads", () => {
    const modified = compileControllerIr(
      controller(200, "ModifyReversalDef", [], {
        "reversal.attr": "S,NA",
        pausetime: "7,11",
        p1stateno: "778",
        p2stateno: "779",
        id: "92",
        "attack.depth": "4,8",
        redirectid: "var(0)",
      }),
    );
    const coreOnly = compileControllerIr(
      controller(200, "ModifyReversalDef", [], { pausetime: "6", redirectid: "57" }),
    );
    const unsupportedPayload = compileControllerIr(
      controller(200, "ModifyReversalDef", [], { "reversal.attr": "S,NA", "guard.kill": "1", redirectid: "57" }),
    );
    const dynamicPayload = compileControllerIr(
      controller(200, "ModifyReversalDef", [], { pausetime: "var(1),7", redirectid: "57" }),
    );
    const dynamicP2State = compileControllerIr(
      controller(200, "ModifyReversalDef", [], { p2stateno: "var(1)", redirectid: "57" }),
    );
    const missingRedirect = compileControllerIr(
      controller(200, "ModifyReversalDef", [], { "reversal.attr": "S,NA" }),
    );
    const emptyPayload = compileControllerIr(
      controller(200, "ModifyReversalDef", [], { redirectid: "57" }),
    );
    const malformedRedirect = compileControllerIr(
      controller(200, "ModifyReversalDef", [], { "reversal.attr": "S,NA", redirectid: "var(" }),
    );

    expect(modified).toMatchObject({
      supportLevel: "partial",
      operation: {
        kind: "modifyreversaldef",
        reversalAttr: "S,NA",
        hitPause: 7,
        p1StateNo: 778,
        p2StateNo: 779,
        targetId: 92,
        attackDepth: [4, 8],
        redirectPlayerIdExpression: "var(0)",
      },
    });
    expect(coreOnly.operation).toEqual({
      kind: "modifyreversaldef",
      hitPause: 6,
      redirectPlayerIdExpression: "57",
    });
    expect(unsupportedPayload.supportLevel).toBe("unsupported");
    expect(dynamicPayload.operation).toBeUndefined();
    expect(dynamicP2State.operation).toBeUndefined();
    expect(unsupportedPayload.operation).toBeUndefined();
    expect(missingRedirect.operation).toBeUndefined();
    expect(emptyPayload.operation).toBeUndefined();
    expect(malformedRedirect.operation).toBeUndefined();
  });

  it("compiles static root ModifyReversalDef p2getp1state RedirectID values and rejects dynamic input", () => {
    const targetOwned = compileControllerIr(
      controller(200, "ModifyReversalDef", [], { p2getp1state: "0", redirectid: "57" }),
    );
    const receiverOwned = compileControllerIr(
      controller(200, "ModifyReversalDef", [], { p2stateno: "889", p2getp1state: "2", redirectid: "var(0)" }),
    );
    const dynamic = compileControllerIr(
      controller(200, "ModifyReversalDef", [], { p2getp1state: "var(1)", redirectid: "57" }),
    );

    expect(targetOwned.operation).toEqual({
      kind: "modifyreversaldef",
      p2GetP1State: false,
      redirectPlayerIdExpression: "57",
    });
    expect(receiverOwned.operation).toMatchObject({
      kind: "modifyreversaldef",
      p2StateNo: 889,
      p2GetP1State: true,
      redirectPlayerIdExpression: "var(0)",
    });
    expect(dynamic.operation).toBeUndefined();
  });

  it("compiles static ReversalDef and root ModifyReversalDef p2facing values", () => {
    const reversal = compileControllerIr(
      controller(200, "ReversalDef", [], { "reversal.attr": "S,NA", p2facing: "-1" }),
    );
    const modified = compileControllerIr(
      controller(200, "ModifyReversalDef", [], { p2facing: "2", redirectid: "57" }),
    );
    const zero = compileControllerIr(
      controller(200, "ModifyReversalDef", [], { p2facing: "0", redirectid: "57" }),
    );
    const dynamic = compileControllerIr(
      controller(200, "ModifyReversalDef", [], { p2facing: "var(1)", redirectid: "57" }),
    );

    expect(reversal.operation).toMatchObject({ kind: "reversaldef", p2Facing: -1 });
    expect(modified.operation).toEqual({
      kind: "modifyreversaldef",
      p2Facing: 2,
      redirectPlayerIdExpression: "57",
    });
    expect(zero.operation).toEqual({
      kind: "modifyreversaldef",
      p2Facing: 0,
      redirectPlayerIdExpression: "57",
    });
    expect(dynamic.operation).toBeUndefined();
  });

  it("compiles static ReversalDef and root ModifyReversalDef numhits values", () => {
    const reversal = compileControllerIr(
      controller(200, "ReversalDef", [], { "reversal.attr": "S,NA", numhits: "3" }),
    );
    const modified = compileControllerIr(
      controller(200, "ModifyReversalDef", [], { numhits: "4", redirectid: "57" }),
    );
    const dynamicReversal = compileControllerIr(
      controller(200, "ReversalDef", [], { "reversal.attr": "S,NA", numhits: "var(1)" }),
    );
    const dynamicModified = compileControllerIr(
      controller(200, "ModifyReversalDef", [], { numhits: "var(1)", redirectid: "57" }),
    );

    expect(reversal.operation).toMatchObject({ kind: "reversaldef", hitCount: 3 });
    expect(modified.operation).toEqual({
      kind: "modifyreversaldef",
      hitCount: 4,
      redirectPlayerIdExpression: "57",
    });
    expect(dynamicReversal.operation).toBeUndefined();
    expect(dynamicModified.operation).toBeUndefined();
  });

  it("compiles static ReversalDef and root ModifyReversalDef reversal guard filters", () => {
    const reversal = compileControllerIr(
      controller(200, "ReversalDef", [], {
        "reversal.attr": "S,NA",
        "reversal.guardflag": "m",
        "reversal.guardflag.not": "a",
      }),
    );
    const redirected = compileControllerIr(
      controller(200, "ModifyReversalDef", [], { "reversal.guardflag": "H, A", redirectid: "57" }),
    );
    const dynamic = compileControllerIr(
      controller(200, "ModifyReversalDef", [], { "reversal.guardflag": "var(1)", redirectid: "57" }),
    );
    const dynamicNegative = compileControllerIr(
      controller(200, "ModifyReversalDef", [], { "reversal.guardflag.not": "var(1)", redirectid: "57" }),
    );
    const unsupported = compileControllerIr(
      controller(200, "ModifyReversalDef", [], { "reversal.guardflag": "F", redirectid: "57" }),
    );
    const negative = compileControllerIr(
      controller(200, "ModifyReversalDef", [], { "reversal.guardflag.not": "H", redirectid: "57" }),
    );

    expect(reversal.operation).toMatchObject({
      kind: "reversaldef",
      attr: "S,NA",
      reversalGuardFlag: "M",
      reversalGuardFlagNot: "A",
    });
    expect(redirected.operation).toEqual({
      kind: "modifyreversaldef",
      reversalGuardFlag: "HA",
      redirectPlayerIdExpression: "57",
    });
    expect(dynamic.operation).toBeUndefined();
    expect(dynamicNegative.operation).toBeUndefined();
    expect(unsupported.operation).toBeUndefined();
    expect(negative.operation).toEqual({
      kind: "modifyreversaldef",
      reversalGuardFlagNot: "H",
      redirectPlayerIdExpression: "57",
    });
  });

  it("compiles static ReversalDef and root ModifyReversalDef sprite priorities", () => {
    const reversal = compileControllerIr(
      controller(200, "ReversalDef", [], {
        "reversal.attr": "S,NA",
        p1sprpriority: "4",
        p2sprpriority: "-3",
      }),
    );
    const redirected = compileControllerIr(
      controller(200, "ModifyReversalDef", [], {
        p1sprpriority: "5",
        p2sprpriority: "-4",
        redirectid: "57",
      }),
    );
    const dynamic = compileControllerIr(
      controller(200, "ModifyReversalDef", [], { p1sprpriority: "var(1)", redirectid: "57" }),
    );
    const dynamicNegative = compileControllerIr(
      controller(200, "ModifyReversalDef", [], { p2sprpriority: "fvar(1)", redirectid: "57" }),
    );

    expect(reversal.operation).toMatchObject({
      kind: "reversaldef",
      attr: "S,NA",
      p1SpritePriority: 4,
      p2SpritePriority: -3,
    });
    expect(redirected.operation).toEqual({
      kind: "modifyreversaldef",
      p1SpritePriority: 5,
      p2SpritePriority: -4,
      redirectPlayerIdExpression: "57",
    });
    expect(dynamic.operation).toBeUndefined();
    expect(dynamicNegative.operation).toBeUndefined();
  });

  it("compiles static ReversalDef and root ModifyReversalDef missonoverride values", () => {
    const reversal = compileControllerIr(
      controller(200, "ReversalDef", [], {
        "reversal.attr": "S,NA",
        attr: "S,SP",
        guardflag: "A",
        missonoverride: "1",
      }),
    );
    const redirected = compileControllerIr(
      controller(200, "ModifyReversalDef", [], {
        attr: "C,HP",
        guardflag: "H",
        missonoverride: "0",
        redirectid: "57",
      }),
    );
    const dynamic = compileControllerIr(
      controller(200, "ModifyReversalDef", [], { missonoverride: "var(1)", redirectid: "57" }),
    );
    const dynamicPayload = compileControllerIr(
      controller(200, "ModifyReversalDef", [], { attr: "var(1)", redirectid: "57" }),
    );

    expect(reversal.operation).toMatchObject({
      kind: "reversaldef",
      attr: "S,NA",
      hitDefAttr: "S,SP",
      guardFlag: "A",
      missOnOverride: true,
    });
    expect(redirected.operation).toEqual({
      kind: "modifyreversaldef",
      hitDefAttr: "C,HP",
      guardFlag: "H",
      missOnOverride: false,
      redirectPlayerIdExpression: "57",
    });
    expect(dynamic.operation).toBeUndefined();
    expect(dynamicPayload.operation).toBeUndefined();
  });

  it("compiles static damage scale controllers into typed operations", () => {
    const attack = compileControllerIr(controller(200, "AttackMulSet", [], { value: "1.5" }));
    const dizzyOnly = compileControllerIr(controller(200, "AttackMulSet", [], { dizzypoints: "0.75" }));
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
    expect(dizzyOnly.operation).toEqual({
      kind: "damage-scale",
      controllerType: "attackmulset",
      dizzyPointsMultiplier: 0.75,
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
        "air.animtype": "Up",
        "fall.animtype": "Up",
        "ground.type": "Low",
        "air.type": "Trip",
        xaccel: "-.18",
        yaccel: ".62",
        zaccel: ".27",
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
      airAnimType: 4,
      fallAnimType: 4,
      groundType: 2,
      airType: 3,
      xAccel: -0.18,
      yAccel: 0.62,
      zAccel: 0.27,
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
        redirectid: "ID + var(0)",
        chainID: "43",
        nochainid: "40,41,42,43,44,45,46,47,48,49",
        numhits: "3",
        affectteam: "B",
        teamside: "2",
        projanim: "910",
        offset: "62,-45",
        postype: "p1",
        velocity: "12,0",
        remvelocity: "-3,2,0.5",
        accel: "0.5,0.25",
        velmul: "0.75,1.25,1.5",
        projscale: "2,0.5",
        projangle: "33.5",
        projxangle: "-22.5",
        projyangle: "17.25",
        projxshear: "0.375",
        projshadow: "32,64,96",
        projreflection: "1",
        projprojection: "perspective",
        projfocallength: "320",
        projwindow: "-48,-24,64,32",
        ownpal: "1",
        remappal: "2,3",
        projclsnscale: "1.25,0.75",
        projclsnangle: "20",
        facing: "-1",
        projhitanim: "911",
        projremanim: "912",
        projcancelanim: "913",
        projremovetime: "60",
        projlayerno: "7",
        projhits: "2",
        projmisstime: "3",
        priority: "6, Dodge",
        p1sprpriority: "5",
        p2sprpriority: "-4",
        projpriority: "2",
        pausemovetime: "6",
        supermovetime: "8",
        damage: "31",
        dizzypoints: "23",
        guardpoints: "17",
        redlife: "13,5",
        givepower: "5,11",
        score: "6.5,2.25",
        animtype: "Medium",
        "air.animtype": "Up",
        "fall.animtype": "DiagUp",
        kill: "0",
        "guard.kill": "0",
        attr: "S, SP",
        hitflag: "H,L,A,F,+",
        pausetime: "4,4",
        "ground.hittime": "13",
         "air.hittime": "15",
         "down.hittime": "16",
         "down.bounce": "1",
         forcenofall: "1",
         forcestand: "1",
         forcecrouch: "0",
         "ground.velocity": "-5,-2",
        "air.velocity": "-4,-8",
        "down.velocity": "-2,0",
        "guard.velocity": "-3,-1",
        "airguard.velocity": "-6,-2",
        xaccel: "-.12",
        yaccel: ".35",
        zaccel: ".2",
        "envshake.time": "20",
        "envshake.freq": "90.5",
        "envshake.ampl": "-6",
        "envshake.phase": "30.25",
        "envshake.mul": "1.5",
        "envshake.dir": "75",
        "ground.cornerpush.veloff": "3",
        "air.cornerpush.veloff": "4",
        "down.cornerpush.veloff": "5",
        "guard.cornerpush.veloff": "6",
        "airguard.cornerpush.veloff": "7",
        p2stateno: "889",
        p2getp1state: "0",
        p1stateno: "777",
        p2facing: "-1",
        p2clsncheck: "Clsn1",
        p2clsnrequire: "Size",
        missonoverride: "1",
        projsprpriority: "7",
        trans: "add",
        "air.juggle": "3.5",
        projremove: "0",
      }),
    );

    expect(projectile.operation).toMatchObject({
      kind: "projectile",
      redirectPlayerIdExpression: "ID + var(0)",
      projectileId: 77,
      targetId: 78,
      chainId: 43,
      noChainIds: [40, 41, 42, 43, 44, 45, 46, 47],
      hitDefHitCount: 3,
      affectTeam: 0,
      teamSide: 2,
      hitFlag: "H,L,A,F,+",
      dizzyPoints: 23,
      guardPoints: 17,
      redLife: 13,
      guardRedLife: 5,
      guardPower: 11,
      hitPower: 5,
      score: 6.5,
      guardScore: 2.25,
      projAnim: 910,
      offset: [62, -45],
      postype: "p1",
      velocity: [12, 0],
      removalVelocity: [-3, 2, 0.5],
      acceleration: [0.5, 0.25],
      velocityMultiplier: [0.75, 1.25, 1.5],
      scale: [2, 0.5],
      angle: 33.5,
      xAngle: -22.5,
      yAngle: 17.25,
      xShear: 0.375,
      shadow: [32, 64, 96],
      reflection: 1,
      projection: "perspective",
      focalLength: 320,
      window: [-48, -24, 64, 32],
      ownPalette: true,
      paletteRemap: [2, 3],
      clsnScale: [1.25, 0.75],
      clsnAngle: 20,
      facing: -1,
      hitAnim: 911,
      removeAnim: 912,
      cancelAnim: 913,
      removeTime: 60,
      layerNo: 1,
      hitCount: 2,
      missTime: 3,
      hitPriority: 6,
      hitPriorityType: "dodge",
      p1SpritePriority: 5,
      p2SpritePriority: -4,
      priority: 2,
      pauseMoveTime: 6,
      superMoveTime: 8,
      damage: 31,
      animType: 1,
      airAnimType: 4,
      fallAnimType: 5,
      airJuggle: 3.5,
      kill: false,
      guardKill: false,
      attr: "S, SP",
      hitPause: 4,
      hitStun: 13,
      airHitTime: 15,
      downHitTime: 16,
      downBounce: true,
      forceNoFall: true,
      forceStand: true,
      forceCrouch: false,
      groundVelocity: [-5, -2],
      airVelocity: [-4, -8],
      downVelocity: [-2, 0],
      guardVelocity: [-3, -1],
      airGuardVelocity: [-6, -2],
      xAccel: -0.12,
      yAccel: 0.35,
      zAccel: 0.2,
      envShakeTime: 20,
      envShakeFrequency: 90.5,
      envShakeAmplitude: -6,
      envShakePhase: 30.25,
      envShakeMultiplier: 1.5,
      envShakeDirection: 75,
      groundCornerPush: 3,
      airCornerPush: 4,
      downCornerPush: 5,
      guardCornerPush: 6,
      airGuardCornerPush: 7,
      p2StateNo: 889,
      p2GetP1State: false,
      p1StateNo: 777,
      p2Facing: -1,
      p2ClsnCheck: "clsn1",
      p2ClsnRequire: "size",
      missOnOverride: true,
      spritePriority: 7,
      trans: "add",
      removeOnHit: false,
    });
  });

  it("compiles fresh Projectile projremovetime expressions and rejects malformed values", () => {
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      projremovetime: "var(0) + 3",
    })).operation).toMatchObject({
      kind: "projectile",
      removeTime: -1,
      removeTimeExpression: "var(0) + 3",
    });
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      removetime: "7",
    })).operation).toMatchObject({
      kind: "projectile",
      removeTime: 7,
    });
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      projremovetime: "var(",
    })).operation).toBeUndefined();
  });

  it("compiles Projectile keepstate as a static flag or caller expression", () => {
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      keepstate: "1",
    })).operation).toMatchObject({
      kind: "projectile",
      keepState: true,
    });
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      keepstate: "var(0)",
    })).operation).toMatchObject({
      kind: "projectile",
      keepStateExpression: "var(0)",
    });
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      keepstate: "var(0),1",
    })).operation).toBeUndefined();
  });

  it("compiles fresh Projectile projmisstime expressions and rejects malformed values", () => {
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      projmisstime: "var(0) + 2",
    })).operation).toMatchObject({
      kind: "projectile",
      missTime: 0,
      missTimeExpression: "var(0) + 2",
    });
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      projmisstime: "5",
    })).operation).toMatchObject({
      kind: "projectile",
      missTime: 5,
    });
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      projmisstime: "var(",
    })).operation).toBeUndefined();
  });

  it("compiles dynamic Projectile airguard.velocity components", () => {
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      "airguard.velocity": "var(0),fvar(1),var(2)",
    })).operation).toMatchObject({
      kind: "projectile",
      airGuardVelocityExpressions: ["var(0)", "fvar(1)"],
      airGuardVelocityZExpression: "var(2)",
    });
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      "airguard.velocity": "var(0),fvar(1)",
    })).operation).toMatchObject({
      kind: "projectile",
      airGuardVelocityExpressions: ["var(0)", "fvar(1)"],
    });
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      "airguard.velocity": "var(0)",
    })).operation).toMatchObject({
      kind: "projectile",
      airGuardVelocityExpressions: ["var(0)"],
    });
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      "airguard.velocity": "var(0),fvar(1),var(",
    })).operation).toBeUndefined();
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      "airguard.velocity": "var(0),fvar(1),var(2),4",
    })).operation).toBeUndefined();
  });

  it("compiles dynamic Projectile air.velocity components", () => {
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      "air.velocity": "var(0),fvar(1),var(2)",
    })).operation).toMatchObject({
      kind: "projectile",
      airVelocityExpressions: ["var(0)", "fvar(1)"],
      airVelocityZExpression: "var(2)",
    });
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      "air.velocity": "var(0),fvar(1)",
    })).operation).toMatchObject({
      kind: "projectile",
      airVelocityExpressions: ["var(0)", "fvar(1)"],
    });
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      "air.velocity": "var(0)",
    })).operation).toMatchObject({
      kind: "projectile",
      airVelocityExpressions: ["var(0)"],
    });
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      "air.velocity": "var(0),fvar(1),var(",
    })).operation).toBeUndefined();
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      "air.velocity": "var(0),fvar(1),var(2),4",
    })).operation).toBeUndefined();
  });

  it("compiles dynamic Projectile ground.velocity components", () => {
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      "ground.velocity": "var(0),fvar(1),var(2)",
    })).operation).toMatchObject({
      kind: "projectile",
      groundVelocityExpressions: ["var(0)", "fvar(1)"],
      groundVelocityZExpression: "var(2)",
    });
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      "ground.velocity": "var(0),fvar(1)",
    })).operation).toMatchObject({
      kind: "projectile",
      groundVelocityExpressions: ["var(0)", "fvar(1)"],
    });
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      "ground.velocity": "var(0)",
    })).operation).toMatchObject({
      kind: "projectile",
      groundVelocityExpressions: ["var(0)"],
    });
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      "ground.velocity": "var(0),fvar(1),var(",
    })).operation).toBeUndefined();
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      "ground.velocity": "var(0),fvar(1),var(2),4",
    })).operation).toBeUndefined();
  });

  it("compiles dynamic Projectile down.velocity components", () => {
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      "down.velocity": "var(0),fvar(1),var(2)",
    })).operation).toMatchObject({
      kind: "projectile",
      downVelocityExpressions: ["var(0)", "fvar(1)"],
      downVelocityZExpression: "var(2)",
    });
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      "down.velocity": "var(0),fvar(1)",
    })).operation).toMatchObject({
      kind: "projectile",
      downVelocityExpressions: ["var(0)", "fvar(1)"],
    });
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      "down.velocity": "var(0)",
    })).operation).toMatchObject({
      kind: "projectile",
      downVelocityExpressions: ["var(0)"],
    });
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      "down.velocity": "var(0),fvar(1),var(",
    })).operation).toBeUndefined();
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      "down.velocity": "var(0),fvar(1),var(2),4",
    })).operation).toBeUndefined();
  });

  it("compiles dynamic Projectile down.hittime and preserves the fresh default", () => {
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      "down.hittime": "var(0) + 3",
    })).operation).toMatchObject({
      kind: "projectile",
      downHitTime: 20,
      downHitTimeExpression: "var(0) + 3",
    });
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      "down.hittime": "16",
    })).operation).toMatchObject({
      kind: "projectile",
      downHitTime: 16,
    });
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      "down.hittime": "var(",
    })).operation).toBeUndefined();
    expect(compileControllerIr(controller(1000, "Projectile", [], {})).operation).toMatchObject({
      kind: "projectile",
      downHitTime: 20,
    });
  });

  it("compiles dynamic Projectile ground.hittime and preserves the fresh default", () => {
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      "ground.hittime": "var(0) + 3",
    })).operation).toMatchObject({
      kind: "projectile",
      hitStun: 18,
      groundHitTimeExpression: "var(0) + 3",
    });
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      "ground.hittime": "16",
    })).operation).toMatchObject({
      kind: "projectile",
      hitStun: 16,
    });
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      "ground.hittime": "var(",
    })).operation).toBeUndefined();
    expect(compileControllerIr(controller(1000, "Projectile", [], {})).operation).toMatchObject({
      kind: "projectile",
      hitStun: 18,
    });
  });

  it("compiles dynamic Projectile guard.hittime and preserves the fresh fallback", () => {
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      "guard.hittime": "var(0) + 3",
    })).operation).toMatchObject({
      kind: "projectile",
      guardHitTimeExpression: "var(0) + 3",
    });
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      "guard.hittime": "16",
    })).operation).toMatchObject({
      kind: "projectile",
      guardHitTime: 16,
    });
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      "guard.hittime": "var(",
    })).operation).toBeUndefined();
    const omitted = compileControllerIr(controller(1000, "Projectile", [], {})).operation;
    expect(omitted).toMatchObject({ kind: "projectile" });
    expect(omitted).not.toHaveProperty("guardHitTimeExpression");
  });

  it("compiles dynamic Projectile ground.slidetime and preserves the fresh omission", () => {
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      "ground.slidetime": "var(0) + 3",
    })).operation).toMatchObject({
      kind: "projectile",
      groundSlideTimeExpression: "var(0) + 3",
    });
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      "ground.slidetime": "16",
    })).operation).toMatchObject({
      kind: "projectile",
      groundSlideTime: 16,
    });
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      "ground.slidetime": "var(",
    })).operation).toBeUndefined();
    const omitted = compileControllerIr(controller(1000, "Projectile", [], {})).operation;
    expect(omitted).toMatchObject({ kind: "projectile" });
    expect(omitted).not.toHaveProperty("groundSlideTimeExpression");
  });

  it("compiles dynamic Projectile air.hittime and preserves the fresh default", () => {
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      "air.hittime": "var(0) + 3",
    })).operation).toMatchObject({
      kind: "projectile",
      airHitTimeExpression: "var(0) + 3",
      airHitTime: 20,
    });
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      "air.hittime": "16",
    })).operation).toMatchObject({
      kind: "projectile",
      airHitTime: 16,
    });
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      "air.hittime": "var(",
    })).operation).toBeUndefined();
    const omitted = compileControllerIr(controller(1000, "Projectile", [], {})).operation;
    expect(omitted).toMatchObject({ kind: "projectile", airHitTime: 20 });
    expect(omitted).not.toHaveProperty("airHitTimeExpression");
  });

  it("compiles fresh Projectile projanim as a caller-context integer expression", () => {
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      projanim: "var(0) + 2",
    })).operation).toMatchObject({
      kind: "projectile",
      projAnimExpression: "var(0) + 2",
    });
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      projanim: "910",
    })).operation).toMatchObject({
      kind: "projectile",
      projAnim: 910,
    });
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      projanim: "var(",
    })).operation).toBeUndefined();
    const omitted = compileControllerIr(controller(1000, "Projectile", [], {})).operation;
    expect(omitted).toMatchObject({ kind: "projectile" });
    expect(omitted).not.toHaveProperty("projAnimExpression");
  });

  it("compiles dynamic Projectile guard.velocity components", () => {
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      "guard.velocity": "var(0),fvar(1),var(2)",
    })).operation).toMatchObject({
      kind: "projectile",
      guardVelocityExpressions: ["var(0)", "fvar(1)"],
      guardVelocityZExpression: "var(2)",
    });
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      "guard.velocity": "var(0),fvar(1)",
    })).operation).toMatchObject({
      kind: "projectile",
      guardVelocityExpressions: ["var(0)", "fvar(1)"],
    });
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      "guard.velocity": "var(0)",
    })).operation).toMatchObject({
      kind: "projectile",
      guardVelocityExpressions: ["var(0)"],
    });
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      "guard.velocity": "var(0),fvar(1),var(",
    })).operation).toBeUndefined();
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      "guard.velocity": "var(0),fvar(1),var(2),4",
    })).operation).toBeUndefined();
  });

  it("compiles ModifyProjectile controllers into typed projectile mutation operations", () => {
    const modifyProjectile = compileControllerIr(
      controller(1000, "ModifyProjectile", [], {
        id: "77",
        chainid: "43",
        nochainid: "101,102",
        index: "1",
        projid: "91",
        projanim: "1000",
        projhitanim: "1001",
        projremanim: "1002",
        projcancelanim: "1003",
        attr: "A,NP",
        guardflag: "A",
        affectteam: "B",
        animtype: "Medium",
        "air.animtype": "Up",
        "fall.animtype": "DiagUp",
        kill: "0",
        "guard.kill": "0",
        "fall.kill": "0",
        forcenofall: "0",
        forcestand: "0",
        forcecrouch: "1",
        "fall.damage": "13",
        "fall.xvelocity": "-3.5",
        "fall.yvelocity": "-8.25",
        "fall.zvelocity": "2.5",
        "fall.recover": "0",
        "fall.recovertime": "19",
        "down.recover": "0",
        "down.recovertime": "27",
        "fall.envshake.time": "15",
        "fall.envshake.freq": "178.5",
        "fall.envshake.ampl": "6",
        "fall.envshake.phase": "0.25",
        "fall.envshake.mul": "0.75",
        "fall.envshake.dir": "67.5",
        dizzypoints: "23",
        guardpoints: "17",
        "air.juggle": "3",
        damage: "41,7",
        givepower: "43,33",
        redlife: "23,9",
        score: "6.5,2.25",
        numhits: "5",
        priority: "7, Miss",
        p1sprpriority: "9",
        p2sprpriority: "-5",
        p2stateno: "889",
        p2getp1state: "0",
        p2facing: "-2",
        "air.hittime": "23",
        fall: "1",
        "air.fall": "0",
        "down.bounce": "1",
        "ground.hittime": "29",
        "guard.hittime": "31",
        "guard.slidetime": "37",
        "guard.ctrltime": "39",
        "airguard.ctrltime": "41",
        "down.hittime": "43",
        "down.velocity": "-3.5,-8.25,2.5",
        "air.velocity": "-6.5,-9.25,3.5",
        "guard.velocity": "-4.5,-1.25,1.5",
        "airguard.velocity": "-7.5,-2.25,2.5",
        p1stateno: "777",
        missonoverride: "0",
        p2clsncheck: "Clsn1",
        p2clsnrequire: "Size",
        teamside: "1",
        redirectid: "ID + var(0)",
        velocity: "5,-1",
        remvelocity: "-4,1,0.75",
        accel: "0.25,0",
        velmul: "0.5,1,1.25",
        projscale: "1.5,0.75",
        projangle: "-12.25",
        projxangle: "14.5",
        projyangle: "-9.75",
        projxshear: "-0.625",
        projshadow: "128",
        projreflection: "0",
        projprojection: "perspective2",
        projfocallength: "-10",
        projwindow: "-20,-10,40,30",
        ownpal: "1",
        remappal: "4,5",
        projclsnscale: "0.8,1.2",
        projclsnangle: "-15",
        projedgebound: "48",
        projstagebound: "32",
        projdepthbound: "12",
        projheightbound: "-96,64",
        projlayerno: "-3",
        hitflag: "H-",
        projremovetime: "18",
        projsprpriority: "8",
        projpriority: "3",
        projhits: "4",
        projmisstime: "5",
        pausemovetime: "7",
        supermovetime: "9",
        projremove: "0",
      }),
    );

    expect(modifyProjectile.operation).toEqual({
      kind: "modifyprojectile",
      redirectPlayerIdExpression: "ID + var(0)",
      selectionId: 77,
      targetId: 77,
      chainId: 43,
      noChainIds: [101, 102],
      selectionIndex: 1,
      projectileId: 91,
      projAnim: 1000,
      hitAnim: 1001,
      removeAnim: 1002,
      cancelAnim: 1003,
      attr: "A,NP",
      guardFlag: "A",
      affectTeam: 0,
      animType: 1,
      airAnimType: 4,
      fallAnimType: 5,
      kill: false,
      guardKill: false,
      fallKill: false,
      forceNoFall: false,
      forceStand: false,
      forceCrouch: true,
      fallDamage: 13,
      fallXVelocity: -3.5,
      fallYVelocity: -8.25,
      fallZVelocity: 2.5,
      fallRecover: false,
      fallRecoverTime: 19,
      downRecover: false,
      downRecoverTime: 27,
      fallEnvShakeTime: 15,
      fallEnvShakeFrequency: 178.5,
      fallEnvShakeAmplitude: 6,
      fallEnvShakePhase: 0.25,
      fallEnvShakeMultiplier: 0.75,
      fallEnvShakeDirection: 67.5,
      dizzyPoints: 23,
      guardPoints: 17,
      airJuggle: 3,
      damage: 41,
      guardDamage: 7,
      hitPower: 43,
      guardPower: 33,
      redLife: 23,
      guardRedLife: 9,
      score: 6.5,
      guardScore: 2.25,
      hitDefHitCount: 5,
      hitPriority: 7,
      hitPriorityType: "miss",
      p2SpritePriority: -5,
      p2StateNo: 889,
      p2GetP1State: false,
      p2Facing: -2,
      airHitTime: 23,
      groundFall: true,
      airFall: false,
      downBounce: true,
      hitStun: 29,
      guardHitTime: 31,
      guardSlideTime: 37,
      guardControlTime: 39,
      airGuardControlTime: 41,
      downHitTime: 43,
      downVelocity: [-3.5, -8.25, 2.5],
      airVelocity: [-6.5, -9.25, 3.5],
      guardVelocity: [-4.5, -1.25, 1.5],
      airGuardVelocity: [-7.5, -2.25, 2.5],
      p1StateNo: 777,
      missOnOverride: false,
      p2ClsnCheck: "clsn1",
      p2ClsnRequire: "size",
      teamSide: 1,
      hitFlag: "H-",
      velocity: [5, -1],
      removalVelocity: [-4, 1, 0.75],
      acceleration: [0.25, 0],
      velocityMultiplier: [0.5, 1, 1.25],
      scale: [1.5, 0.75],
      angle: -12.25,
      xAngle: 14.5,
      yAngle: -9.75,
      xShear: -0.625,
      shadow: [128],
      reflection: 0,
      projection: "perspective2",
      focalLength: -10,
      window: [-20, -10, 40, 30],
      clsnScale: [0.8, 1.2],
      clsnAngle: -15,
      edgeBound: 48,
      stageBound: 32,
      depthBound: 12,
      heightBound: { low: -96, high: 64 },
      removeTime: 18,
      layerNo: -1,
      spritePriority: 8,
      priority: 3,
      hitCount: 4,
      missTime: 5,
      pauseMoveTime: 7,
      superMoveTime: 9,
      removeOnHit: false,
    });
    expect(compileControllerIr(controller(1000, "Projectile", [], { velmul: "2" })).operation).toMatchObject({
      velocityMultiplier: [2, 1, 1],
    });
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], { velmul: "2" })).operation).toMatchObject({
      velocityMultiplier: [2, 0, 0],
    });
    expect(compileControllerIr(controller(1000, "Projectile", [], { ownpal: "var(0)", remappal: "2,var(1)" })).operation).not.toHaveProperty("paletteRemap");
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], { ownpal: "1", remappal: "2,3" })).operation).toEqual({
      kind: "modifyprojectile",
    });
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      attr: "ifelse(var(0),S, A)",
      guardflag: "var(1)",
      hitflag: "ifelse(var(2),H,L)",
    })).operation).toEqual({
      kind: "modifyprojectile",
    });
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], { affectteam: "X" })).operation).toEqual({
      kind: "modifyprojectile",
    });
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], { damage: "41" })).operation).toEqual({
      kind: "modifyprojectile",
      damage: 41,
      guardDamage: 0,
    });
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], { givepower: "43" })).operation).toEqual({
      kind: "modifyprojectile",
      hitPower: 43,
      guardPower: 0,
    });
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], { redlife: "23", score: "6.5" })).operation).toEqual({
      kind: "modifyprojectile",
      redLife: 23,
      guardRedLife: 0,
      score: 6.5,
      guardScore: 0,
    });
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      sprpriority: "6",
      projsprpriority: "8",
    })).operation).toMatchObject({
      p1SpritePriority: 6,
      spritePriority: 8,
    });
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      p1sprpriority: "9",
      p2sprpriority: "-5",
    })).operation).toEqual({
      kind: "modifyprojectile",
      p2SpritePriority: -5,
    });
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      p2clsncheck: "var(0)",
      p2clsnrequire: "invalid",
    })).operation).toEqual({
      kind: "modifyprojectile",
    });
    expect(compileControllerIr(controller(1000, "Projectile", [], { projlayerno: "0" })).operation).toMatchObject({
      layerNo: 0,
    });
  });

  it("retains dynamic ModifyProjectile terminal animation expressions", () => {
    const compiled = compileControllerIr(
      controller(1000, "ModifyProjectile", [], {
        projhitanim: "Parent,Var(0) + 1",
        projremanim: "Root,Var(1) + 2",
        projcancelanim: "var(2) + 3",
      }),
    );

    expect(compiled.operation).toMatchObject({
      kind: "modifyprojectile",
      hitAnimExpression: "Parent,Var(0) + 1",
      removeAnimExpression: "Root,Var(1) + 2",
      cancelAnimExpression: "var(2) + 3",
    });
    expect(compiled.operation).not.toHaveProperty("hitAnim");
    expect(compiled.operation).not.toHaveProperty("removeAnim");
    expect(compiled.operation).not.toHaveProperty("cancelAnim");

    const malformed = compileControllerIr(
      controller(1000, "ModifyProjectile", [], { projhitanim: "Parent," }),
    );
    expect(malformed.operation).toBeUndefined();
  });

  it("retains dynamic ModifyProjectile pause budgets and rejects malformed scalars", () => {
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      pausemovetime: "var(0) + 1",
      supermovetime: "fvar(1) - 2",
    })).operation).toMatchObject({
      kind: "modifyprojectile",
      pauseMoveTimeExpression: "var(0) + 1",
      superMoveTimeExpression: "fvar(1) - 2",
    });
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      pausemovetime: "6",
      supermovetime: "8",
    })).operation).toMatchObject({
      kind: "modifyprojectile",
      pauseMoveTime: 6,
      superMoveTime: 8,
    });
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      pausemovetime: "var(0),1",
    })).operation).toBeUndefined();
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      supermovetime: "var(",
    })).operation).toBeUndefined();
  });

  it("preserves Projectile depth offset, velocity, acceleration, and attack depth", () => {
    const projectile = compileControllerIr(
      controller(1000, "Projectile", [], {
        offset: "12,-24,6",
        pos: "4,-8,2",
        velocity: "9,-1,1.5",
        accel: "0.25,0,-0.1",
        projdepthbound: "12",
        "attack.depth": "7,9",
      }),
    );

    expect(projectile.operation).toMatchObject({
      kind: "projectile",
      offset: [12, -24, 6],
      pos: [4, -8, 2],
      velocity: [9, -1, 1.5],
      acceleration: [0.25, 0, -0.1],
      depthBound: 12,
      attackDepth: [7, 9],
    });
  });

  it("compiles ModifyProjectile attack.depth with its official zero second default", () => {
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      "attack.depth": "7.5,9.25",
    })).operation).toMatchObject({
      kind: "modifyprojectile",
      attackDepth: [7.5, 9.25],
    });
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      "attack.depth": "6.5",
    })).operation).toMatchObject({
      kind: "modifyprojectile",
      attackDepth: [6.5, 0],
    });
  });

  it("compiles ModifyProjectile down.velocity with official zero defaults", () => {
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      "down.velocity": "-3.5,-8.25,2.5",
    })).operation).toMatchObject({ downVelocity: [-3.5, -8.25, 2.5] });
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      "down.velocity": "-4.5,-7.25",
    })).operation).toMatchObject({ downVelocity: [-4.5, -7.25, 0] });
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      "down.velocity": "-6.5",
    })).operation).toMatchObject({ downVelocity: [-6.5, 0, 0] });
  });

  it("retains dynamic ModifyProjectile down.velocity expressions", () => {
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      "down.velocity": "var(0),fvar(1),var(2)",
    })).operation).toMatchObject({
      kind: "modifyprojectile",
      downVelocityExpressions: ["var(0)", "fvar(1)"],
      downVelocityZExpression: "var(2)",
    });
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      "down.velocity": "var(0),fvar(1)",
    })).operation).toMatchObject({
      kind: "modifyprojectile",
      downVelocityExpressions: ["var(0)", "fvar(1)"],
    });
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      "down.velocity": "var(0)",
    })).operation).toMatchObject({
      kind: "modifyprojectile",
      downVelocityExpressions: ["var(0)"],
    });
  });

  it("rejects malformed dynamic ModifyProjectile down.velocity expressions", () => {
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      "down.velocity": "var(0),",
    })).operation).toBeUndefined();
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      "down.velocity": "var(0),fvar(1),var(2),4",
    })).operation).toBeUndefined();
  });

  it("retains dynamic ModifyProjectile airguard.velocity expressions", () => {
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      "airguard.velocity": "var(0),fvar(1),var(2)",
    })).operation).toMatchObject({
      kind: "modifyprojectile",
      airGuardVelocityExpressions: ["var(0)", "fvar(1)"],
      airGuardVelocityZExpression: "var(2)",
    });
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      "airguard.velocity": "var(0),fvar(1)",
    })).operation).toMatchObject({
      kind: "modifyprojectile",
      airGuardVelocityExpressions: ["var(0)", "fvar(1)"],
    });
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      "airguard.velocity": "var(0)",
    })).operation).toMatchObject({
      kind: "modifyprojectile",
      airGuardVelocityExpressions: ["var(0)"],
    });
  });

  it("rejects malformed dynamic ModifyProjectile airguard.velocity expressions", () => {
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      "airguard.velocity": "var(0),",
    })).operation).toBeUndefined();
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      "airguard.velocity": "var(0),fvar(1),var(2),4",
    })).operation).toBeUndefined();
  });

  it("retains dynamic ModifyProjectile air.velocity expressions", () => {
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      "air.velocity": "var(0),fvar(1),var(2)",
    })).operation).toMatchObject({
      kind: "modifyprojectile",
      airVelocityExpressions: ["var(0)", "fvar(1)"],
      airVelocityZExpression: "var(2)",
    });
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      "air.velocity": "var(0),fvar(1)",
    })).operation).toMatchObject({
      kind: "modifyprojectile",
      airVelocityExpressions: ["var(0)", "fvar(1)"],
    });
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      "air.velocity": "var(0)",
    })).operation).toMatchObject({
      kind: "modifyprojectile",
      airVelocityExpressions: ["var(0)"],
    });
  });

  it("rejects malformed dynamic ModifyProjectile air.velocity expressions", () => {
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      "air.velocity": "var(0),",
    })).operation).toBeUndefined();
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      "air.velocity": "var(0),fvar(1),var(2),4",
    })).operation).toBeUndefined();
  });

  it("retains dynamic ModifyProjectile guard.velocity expressions", () => {
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      "guard.velocity": "var(0),fvar(1),var(2)",
    })).operation).toMatchObject({
      kind: "modifyprojectile",
      guardVelocityExpressions: ["var(0)", "fvar(1)"],
      guardVelocityZExpression: "var(2)",
    });
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      "guard.velocity": "var(0),fvar(1)",
    })).operation).toMatchObject({
      kind: "modifyprojectile",
      guardVelocityExpressions: ["var(0)", "fvar(1)"],
    });
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      "guard.velocity": "var(0)",
    })).operation).toMatchObject({
      kind: "modifyprojectile",
      guardVelocityExpressions: ["var(0)"],
    });
  });

  it("rejects malformed dynamic ModifyProjectile guard.velocity expressions", () => {
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      "guard.velocity": "var(0),",
    })).operation).toBeUndefined();
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      "guard.velocity": "var(0),fvar(1),var(2),4",
    })).operation).toBeUndefined();
  });

  it("retains dynamic ModifyProjectile ground.velocity expressions", () => {
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      "ground.velocity": "var(0),fvar(1),var(2)",
    })).operation).toMatchObject({
      kind: "modifyprojectile",
      groundVelocityExpressions: ["var(0)", "fvar(1)"],
      groundVelocityZExpression: "var(2)",
    });
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      "ground.velocity": "var(0),fvar(1)",
    })).operation).toMatchObject({
      kind: "modifyprojectile",
      groundVelocityExpressions: ["var(0)", "fvar(1)"],
    });
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      "ground.velocity": "var(0)",
    })).operation).toMatchObject({
      kind: "modifyprojectile",
      groundVelocityExpressions: ["var(0)"],
    });
  });

  it("rejects malformed dynamic ModifyProjectile ground.velocity expressions", () => {
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      "ground.velocity": "var(0),",
    })).operation).toBeUndefined();
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      "ground.velocity": "var(0),fvar(1),var(2),4",
    })).operation).toBeUndefined();
  });

  it("compiles ModifyProjectile guard velocities with official zero defaults", () => {
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      "guard.velocity": "-4.5,-1.25,1.5",
      "airguard.velocity": "-7.5,-2.25,2.5",
    })).operation).toMatchObject({
      guardVelocity: [-4.5, -1.25, 1.5],
      airGuardVelocity: [-7.5, -2.25, 2.5],
    });
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      "guard.velocity": "-5.5",
      "airguard.velocity": "-8.5,-3.25",
    })).operation).toMatchObject({
      guardVelocity: [-5.5, 0, 0],
      airGuardVelocity: [-8.5, -3.25, 0],
    });
  });

  it("compiles ModifyProjectile air.velocity with official zero defaults", () => {
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      "air.velocity": "-6.5,-9.25,3.5",
    })).operation).toMatchObject({ airVelocity: [-6.5, -9.25, 3.5] });
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      "air.velocity": "-7.5,-10.25",
    })).operation).toMatchObject({ airVelocity: [-7.5, -10.25, 0] });
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      "air.velocity": "-8.5",
    })).operation).toMatchObject({ airVelocity: [-8.5, 0, 0] });
  });

  it("compiles ModifyProjectile ground.velocity as component-wise replacements", () => {
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      "ground.velocity": "-5.5,n,1.75",
    })).operation).toMatchObject({ groundVelocity: { x: -5.5, z: 1.75 } });
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      "ground.velocity": "n,-4.25,n",
    })).operation).toMatchObject({ groundVelocity: { y: -4.25 } });
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      "ground.velocity": "n,n,n",
    })).operation).toMatchObject({ groundVelocity: {} });
  });

  it("compiles ModifyProjectile ground.slidetime", () => {
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      "ground.slidetime": "37",
    })).operation).toMatchObject({ groundSlideTime: 37 });
  });

  it("compiles Projectile pause pairs with dynamic caller expressions and guard inheritance", () => {
    const projectile = compileControllerIr(controller(1000, "Projectile", [], {
      pausetime: "2,7",
      "guard.pausetime": "3",
    })).operation;
    expect(projectile).toMatchObject({
      hitPause: 2,
      hitShakeTime: 7,
      guardPauseTime: 3,
    });
    expect(projectile?.kind).toBe("projectile");
    if (projectile?.kind === "projectile") {
      expect(projectile.guardShakeTime).toBeUndefined();
    }
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      pausetime: "var(0),fvar(1)",
      "guard.pausetime": "var(2)",
    })).operation).toMatchObject({
      pauseTimeExpressions: ["var(0)", "fvar(1)"],
      guardPauseTimeExpressions: ["var(2)"],
    });
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      pausetime: "var(0),fvar(",
    })).operation).toBeUndefined();
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      pausetime: "var(0),fvar(1),3",
    })).operation).toBeUndefined();
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      pausetime: "4",
      "guard.pausetime": "5,9",
    })).operation).toMatchObject({
      pauseTime: [4, 0],
      guardPauseTime: [5, 9],
    });
  });

  it("compiles typed Projectile unhittabletime expressions with the official omitted receiver default", () => {
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      unhittabletime: "3,8",
    })).operation).toMatchObject({ unhittableTime: [3, 8] });
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      unhittabletime: "5",
    })).operation).toMatchObject({ unhittableTime: [5] });
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      unhittabletime: "var(0),8",
    })).operation).toMatchObject({ unhittableTime: ["var(0)", 8] });
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      unhittabletime: "var(0),8,9",
    })).operation).toBeUndefined();
  });

  it("compiles typed HitDef and Projectile grounded friction and spark-scale expressions", () => {
    expect(compileControllerIr(controller(1000, "HitDef", [], {
      "stand.friction": "0.45",
      "crouch.friction": "var(1) * 0.1",
      sparkscale: "2",
      "guard.sparkscale": "var(2),-0.5",
    })).operation).toMatchObject({
      standFriction: 0.45,
      crouchFriction: "var(1) * 0.1",
      hitSparkScale: [2],
      guardSparkScale: ["var(2)", -0.5],
    });
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      "stand.friction": "fvar(0)",
      "crouch.friction": "0.35",
      sparkscale: "var(3)",
      "guard.sparkscale": "0,-1",
    })).operation).toMatchObject({
      standFriction: "fvar(0)",
      crouchFriction: 0.35,
      hitSparkScale: ["var(3)"],
      guardSparkScale: [0, -1],
    });
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      "stand.friction": "var(",
    })).operation).toBeUndefined();
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      sparkscale: "1,2,3",
    })).operation).toBeUndefined();
    expect(compileControllerIr(controller(1000, "HitDef", [], {
      sparkscale: "Parent,var(0)",
    })).operation).toMatchObject({
      hitSparkScale: ["Parent,var(0)"],
    });
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      "guard.sparkscale": "Parent,var(0),2",
    })).operation).toMatchObject({
      guardSparkScale: ["Parent,var(0)", 2],
    });
    expect(compileControllerIr(controller(1000, "ModifyHitDef", [], {
      sparkscale: "var(0),Parent,var(1)",
      redirectid: "57",
    })).operation).toMatchObject({
      hitSparkScale: ["var(0)", "Parent,var(1)"],
    });
  });

  it("compiles Projectile guard-distance bounds and prefers the explicit width key", () => {
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      "guard.dist": "96",
      "guard.dist.height": "80,70",
      "guard.dist.depth": "8",
    })).operation).toMatchObject({
      guardDistanceBounds: {
        width: [96, 0],
        height: [80, 70],
        depth: [8, 0],
      },
    });
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      "guard.dist": "40,30",
      "guard.dist.width": "90,12",
      "guard.dist.height": "75",
      "guard.dist.depth": "10,9",
    })).operation).toMatchObject({
      guardDistanceBounds: {
        width: [90, 12],
        height: [75, 0],
        depth: [10, 9],
      },
    });
  });

  it("compiles Projectile and ModifyProjectile spark presentation payloads", () => {
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      sparkno: "S7001",
      sparkangle: "0.25",
      "guard.sparkno": "F7002",
      "guard.sparkangle": "-0.5",
      sparkxy: "18",
    })).operation).toMatchObject({
      hitSpark: "S7001",
      hitSparkAngle: 0.25,
      guardSpark: "F7002",
      guardSparkAngle: -0.5,
      sparkXy: [18, 0],
    });
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      sparkno: "F7101",
      sparkangle: "1.25",
      "guard.sparkno": "S7100",
      "guard.sparkangle": "-1.5",
      sparkxy: "24,-60",
    })).operation).toMatchObject({
      hitSpark: "F7101",
      hitSparkAngle: 1.25,
      guardSpark: "S7100",
      guardSparkAngle: -1.5,
      sparkXy: [24, -60],
    });
  });

  it("compiles Projectile target-distance bounds and ModifyProjectile zero defaults", () => {
    expect(compileControllerIr(controller(1000, "Projectile", [], {
      mindist: "24",
      maxdist: "80,30,12",
    })).operation).toMatchObject({
      minDistance: [24],
      maxDistance: [80, 30, 12],
    });
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      mindist: "26",
      maxdist: "72,18",
    })).operation).toMatchObject({
      minDistance: [26, 0, 0],
      maxDistance: [72, 18, 0],
    });
  });

  it("compiles ModifyProjectile hit acceleration metadata", () => {
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      xaccel: "-0.125",
      yaccel: "0.375",
      zaccel: "0.625",
    })).operation).toMatchObject({
      xAccel: -0.125,
      yAccel: 0.375,
      zAccel: 0.625,
    });
  });

  it("compiles ModifyProjectile contact EnvShake metadata", () => {
    expect(compileControllerIr(controller(1000, "ModifyProjectile", [], {
      "envshake.time": "24",
      "envshake.freq": "120.5",
      "envshake.ampl": "-8",
      "envshake.phase": "45.25",
      "envshake.mul": "1.75",
      "envshake.dir": "90",
    })).operation).toMatchObject({
      envShakeTime: 24,
      envShakeFrequency: 120.5,
      envShakeAmplitude: -8,
      envShakePhase: 45.25,
      envShakeMultiplier: 1.75,
      envShakeDirection: 90,
    });
  });

  it("rejects invalid static Projectile TeamSide values at compile time", () => {
    const projectile = compileControllerIr(
      controller(1000, "Projectile", [], { teamside: "3" }),
    );
    const modifyProjectile = compileControllerIr(
      controller(1000, "ModifyProjectile", [], { teamside: "0" }),
    );

    expect(projectile.operation).not.toHaveProperty("teamSide");
    expect(modifyProjectile.operation).not.toHaveProperty("teamSide");
  });

  it("rejects malformed ModifyProjectile RedirectID expressions at compile time", () => {
    const modifyProjectile = compileControllerIr(
      controller(1000, "ModifyProjectile", [], { projid: "77", redirectid: "57, 0" }),
    );

    expect(modifyProjectile.operation).toBeUndefined();
  });

  it("keeps dynamic projectile HitFlag expressions outside the static typed path", () => {
    const projectile = compileControllerIr(
      controller(1000, "Projectile", [], { hitflag: "var(0)" }),
    );
    const modifyProjectile = compileControllerIr(
      controller(1000, "ModifyProjectile", [], { hitflag: "var(0)" }),
    );

    expect(projectile.operation).not.toHaveProperty("hitFlag");
    expect(modifyProjectile.operation).not.toHaveProperty("hitFlag");
  });

  it("rejects malformed Projectile RedirectID expressions at compile time", () => {
    const projectile = compileControllerIr(
      controller(1000, "Projectile", [], { projanim: "910", redirectid: "57, 0" }),
    );

    expect(projectile.operation).toBeUndefined();
  });

  it("compiles Helper controllers into typed helper operations", () => {
    const helper = compileControllerIr(
      controller(200, "Helper", [], {
        id: "42",
        name: '"Buddy"',
        stateno: "1200",
        anim: "920",
        pos: "-44,-28,6",
        velset: "3,-1",
        "size.xscale": "1.5",
        "size.yscale": "0.75",
        ignorehitpause: "1",
        pausemovetime: "2",
        supermovetime: "4",
        postype: "p1",
        facing: "1",
        helpertype: "player",
        keyctrl: "1",
        standby: "-2",
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
      keyCtrl: true,
      pos: [-44, -28, 6],
      velocity: [3, -1],
      scale: [1.5, 0.75],
      ignoreHitPause: true,
      pauseMoveTime: 2,
      superMoveTime: 4,
      postype: "p1",
      facing: 1,
      helperType: 2,
      standby: true,
      removeTime: 30,
      spritePriority: 8,
    });
  });

  it("compiles Helper standby as one bounded boolean expression", () => {
    expect(compileControllerIr(controller(200, "Helper", [], { standby: "0" })).operation).toMatchObject({
      kind: "helper",
      standby: false,
    });
    expect(compileControllerIr(controller(200, "Helper", [], { standby: "var(3)" })).operation).toMatchObject({
      kind: "helper",
      standbyExpression: "var(3)",
    });

    for (const standby of ["", "(", "1, 0"]) {
      expect(compileControllerIr(controller(200, "Helper", [], { standby })).operation).toBeUndefined();
    }
  });

  it("compiles normal and player HelperType while rejecting unsupported variants", () => {
    expect(compileControllerIr(controller(200, "Helper", [], { helpertype: "normal" })).operation).toMatchObject({
      kind: "helper",
      helperType: 1,
    });
    expect(compileControllerIr(controller(200, "Helper", [], { helpertype: "player" })).operation).toMatchObject({
      kind: "helper",
      helperType: 2,
    });

    for (const helpertype of ["", "projectile", "var(0)"]) {
      expect(compileControllerIr(controller(200, "Helper", [], { helpertype })).operation).toBeUndefined();
    }
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
        zvel: "1.25",
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
      zVelocity: 1.25,
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

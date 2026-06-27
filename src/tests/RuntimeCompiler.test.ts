import { describe, expect, it } from "vitest";
import { compileCommandIr } from "../mugen/compiler/CommandCompiler";
import { compileExpression } from "../mugen/compiler/ExpressionCompiler";
import { compileControllerIr, compileRuntimeProgram, getControllerSupport, isRuntimeExecutableController } from "../mugen/compiler/StateControllerCompiler";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
import type { MugenStateController, MugenStateDef } from "../mugen/model/MugenState";
import { parseCmd } from "../mugen/parsers/CmdParser";

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
    const clean = compileExpression("P2BodyDist X < 40 && SelfAnimExist(anim + 3)");
    const contact = compileExpression("MoveGuarded || ProjHit(77) || ProjGuarded(77) || NumTarget(77) > 0");
    const actorCounts = compileExpression("NumExplod(9000) || NumHelper(42) > 0 || NumProj || NumProjID(77)");
    const unsupported = compileExpression("enemynear, stateno = 5000");

    expect(clean.normalized).toBe("p2bodydistx < 40 && SelfAnimExist(anim + 3)");
    expect(clean.supportLevel).toBe("executable");
    expect(clean.functions).toEqual(["SelfAnimExist"]);
    expect(contact.supportLevel).toBe("executable");
    expect(contact.functions).toEqual(["NumTarget", "ProjGuarded", "ProjHit"]);
    expect(contact.identifiers).toEqual(["MoveGuarded"]);
    expect(actorCounts.supportLevel).toBe("executable");
    expect(actorCounts.functions).toEqual(["NumExplod", "NumHelper", "NumProjID"]);
    expect(actorCounts.identifiers).toEqual(["NumProj"]);
    expect(unsupported.supportLevel).toBe("unsupported");
    expect(unsupported.unsupportedFeatures).toEqual(["enemynear"]);
  });

  it("summarizes controller and State -1 routability as compiler output", () => {
    const program = compileRuntimeProgram({
      commands: [],
      animations: new Map<number, MugenAnimationAction>([[1000, action(1000)]]),
      states: [
        state(1000, 1000, [
          controller(1000, "VelSet", ["time = 0"], { x: "2" }),
          controller(1000, "MysteryController", ["enemynear, stateno = 5000"]),
        ]),
      ],
      stateEntryControllers: [controller(-1, "ChangeState", ['command = "qcf_x"', "ctrl"], { value: "1000" })],
    });

    expect(program.report.states.compiled).toBe(1);
    expect(program.report.states.runtimeRoutableStateTargets).toEqual([1000]);
    expect(program.report.controllers.compiled).toBe(2);
    expect(program.report.controllers.unsupported).toBe(1);
    expect(program.report.controllers.unsupportedByType).toEqual({ MysteryController: 1 });
    expect(program.report.triggers.unsupportedFeatures).toEqual({ enemynear: 1 });
  });

  it("keeps controller support metadata in one registry", () => {
    expect(isRuntimeExecutableController("HitDef")).toBe(true);
    expect(isRuntimeExecutableController("ForceFeedback")).toBe(true);
    expect(getControllerSupport("ForceFeedback").level).toBe("noop");
    expect(isRuntimeExecutableController("Trans")).toBe(false);
    expect(getControllerSupport("Trans").level).toBe("unsupported");
  });

  it("compiles HitDef params into a typed controller operation", () => {
    const compiled = compileControllerIr(
      controller(200, "HitDef", ["AnimElem = 3"], {
        id: "7",
        attr: "S, NA",
        damage: "42,5",
        kill: "0",
        "guard.kill": "0",
        priority: "6, Hit",
        pausetime: "8,9",
        guardflag: "MA",
        "ground.hittime": "17",
        "ground.velocity": "-4,-6",
        "guard.dist": "96",
        "guard.pausetime": "4,5",
        "guard.hittime": "11",
        "guard.slidetime": "6",
        "guard.ctrltime": "8",
        "guard.velocity": "-2",
        p1stateno: "210",
        p2stateno: "5100",
        p2getp1state: "0",
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
      attr: "S, NA",
      damage: 42,
      guardDamage: 5,
      kill: false,
      guardKill: false,
      priority: 6,
      pauseTime: 8,
      groundHitTime: 17,
      groundVelocity: [-4, -6],
      guardDistance: 96,
      guardFlag: "MA",
      guardPauseTime: 4,
      guardHitTime: 11,
      guardSlideTime: 6,
      guardControlTime: 8,
      guardVelocity: [-2],
      p1StateNo: 210,
      p2StateNo: 5100,
      p2GetP1State: false,
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

  it("compiles Pause and SuperPause controllers into typed pause operations", () => {
    const pause = compileControllerIr(controller(200, "Pause", [], { time: "8", movetime: "2", poweradd: "999" }));
    const superPause = compileControllerIr(controller(200, "SuperPause", [], { time: "12", movetime: "4", darken: "0", poweradd: "100" }));

    expect(pause.operation).toMatchObject({
      kind: "pause",
      controllerType: "pause",
      time: 8,
      moveTime: 2,
      darken: false,
      powerAdd: 0,
    });
    expect(superPause.operation).toMatchObject({
      kind: "pause",
      controllerType: "superpause",
      time: 12,
      moveTime: 4,
      darken: false,
      powerAdd: 100,
    });
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

  it("compiles static resource and variable controllers into typed operations", () => {
    const ctrl = compileControllerIr(controller(200, "CtrlSet", [], { value: "1" }));
    const life = compileControllerIr(controller(200, "LifeAdd", [], { value: "-25", kill: "0" }));
    const power = compileControllerIr(controller(200, "PowerSet", [], { value: "1000" }));
    const varSet = compileControllerIr(controller(200, "VarSet", [], { v: "3", value: "8" }));
    const varAdd = compileControllerIr(controller(200, "VarAdd", [], { "var(1)": "7" }));
    const fvarSet = compileControllerIr(controller(200, "VarSet", [], { fv: "2", value: "1.5" }));
    const sysvarSet = compileControllerIr(controller(200, "VarSet", [], { "sysvar(0)": "1" }));
    const sysvarAdd = compileControllerIr(controller(200, "VarAdd", [], { "sysvar(0)": "2" }));
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

  it("compiles Projectile controllers into typed projectile operations", () => {
    const projectile = compileControllerIr(
      controller(1000, "Projectile", [], {
        projid: "77",
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
        attr: "S, SP",
        pausetime: "4,4",
        "ground.hittime": "13",
        "ground.velocity": "-5,-2",
        sprpriority: "7",
        trans: "add",
        projremove: "0",
      }),
    );

    expect(projectile.operation).toMatchObject({
      kind: "projectile",
      projectileId: 77,
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
      attr: "S, SP",
      hitPause: 4,
      hitStun: 13,
      groundVelocity: [-5, -2],
      spritePriority: 7,
      trans: "add",
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
      postype: "p1",
      facing: 1,
      removeTime: 30,
      spritePriority: 8,
    });
  });

  it("compiles Explod and RemoveExplod controllers into typed effect operations", () => {
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

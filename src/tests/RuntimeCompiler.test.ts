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
    const unsupported = compileExpression("enemynear, stateno = 5000");

    expect(clean.normalized).toBe("p2bodydistx < 40 && SelfAnimExist(anim + 3)");
    expect(clean.supportLevel).toBe("executable");
    expect(clean.functions).toEqual(["SelfAnimExist"]);
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
    const state = compileControllerIr(controller(200, "TargetState", [], { id: "3", value: "5300" }));

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
    expect(state.operation).toMatchObject({
      kind: "target",
      controllerType: "targetstate",
      requestedId: 3,
      stateNo: 5300,
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

  it("compiles Projectile controllers into typed projectile operations", () => {
    const projectile = compileControllerIr(
      controller(1000, "Projectile", [], {
        projid: "77",
        projanim: "910",
        offset: "62,-45",
        postype: "p1",
        velocity: "12,0",
        facing: "-1",
        projremovetime: "60",
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
      facing: -1,
      removeTime: 60,
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
        facing: "-1",
        removetime: "18",
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
      facing: -1,
      removeTime: 18,
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

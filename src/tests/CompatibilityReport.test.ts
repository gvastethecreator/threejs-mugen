import { describe, expect, it } from "vitest";
import {
  analyzeControllerTriggers,
  createCompatibilityReport,
  isRuntimeSupportedController,
} from "../mugen/compatibility/CompatibilityReport";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
import type { MugenStateController, MugenStateDef } from "../mugen/model/MugenState";

describe("createCompatibilityReport", () => {
  it("separates parsed, trigger-supported, and runtime-routable CNS coverage", () => {
    const report = createCompatibilityReport({
      name: "Report Karate",
      loaded: true,
      files: { states: [], commonStates: [], palettes: [], missing: [], def: "k.def", anim: "k.air", cmd: "k.cmd", cns: "k.cns" },
      animations: new Map<number, MugenAnimationAction>([[1000, action(1000)]]),
      states: [
        state(1000, 1000, [
          controller(1000, "VelSet", ["AnimElem = 2"]),
          controller(1000, "Helper", ["Time = 0"]),
        ]),
      ],
      stateEntryControllers: [
        controller(-1, "ChangeState", ['command = "qcf_x"', "power >= 0"], { value: "1000" }),
        controller(-1, "ChangeState", ["enemynear(1), stateno = 5000"], { value: "2000" }),
      ],
      diagnostics: [],
      unsupported: [],
    });

    expect(report.states.parsed).toBe(1);
    expect(report.states.compiled).toBe(1);
    expect(report.states.triggerSupported).toBe(1);
    expect(report.states.runtimeRoutable).toBe(1);
    expect(report.compiler.states.runtimeRoutableStateTargets).toEqual([1000]);
    expect(report.compiler.controllers.partial).toBe(4);
    expect(report.states.executed).toBe(0);
    expect(report.triggers.total).toBe(5);
    expect(report.triggers.supported).toBe(4);
    expect(report.triggers.unsupported).toBe(1);
    expect(report.triggers.unsupportedFeatures["enemynear(index)"]).toBe(1);
    expect(report.controllers.UnsupportedTrigger).toEqual({ "enemynear(index)": 1 });
  });

  it("treats supported MUGEN trigger syntax as trigger-clean", () => {
    const report = createCompatibilityReport({
      name: "Axis Karate",
      loaded: true,
      files: { states: [], commonStates: [], palettes: [], missing: [], def: "k.def", anim: "k.air", cmd: "k.cmd", cns: "k.cns" },
      animations: new Map<number, MugenAnimationAction>([[300, action(300)]]),
      states: [
        state(300, 300, [
          controller(300, "VelSet", [
            "Vel Y > 0",
            "Pos Y >= 0",
            "abs(vel x) < Const(movement.stand.friction.threshold)",
            "GetHitVar(animtype) = [3,5]",
            "P2BodyDist X < 40",
            "SelfAnimExist(anim + 3)",
          ]),
        ]),
      ],
      stateEntryControllers: [
        controller(-1, "ChangeState", ['command = "axis"', "P2BodyDist X < 40", "EnemyNear, StateNo = 0"], { value: "300" }),
      ],
      diagnostics: [],
      unsupported: [],
    });

    expect(report.triggers.total).toBe(9);
    expect(report.triggers.supported).toBe(9);
    expect(report.triggers.unsupported).toBe(0);
    expect(report.triggers.unsupportedFeatures).toEqual({});
    expect(report.states.triggerSupported).toBe(1);
    expect(report.states.runtimeRoutable).toBe(1);
  });

  it("exposes the same controller and trigger classifiers used by the State Browser", () => {
    expect(isRuntimeSupportedController("HitDef")).toBe(true);
    expect(isRuntimeSupportedController("EnvShake")).toBe(true);
    expect(isRuntimeSupportedController("PalFX")).toBe(true);
    expect(isRuntimeSupportedController("AfterImage")).toBe(true);
    expect(isRuntimeSupportedController("AfterImageTime")).toBe(true);
    expect(isRuntimeSupportedController("Explod")).toBe(true);
    expect(isRuntimeSupportedController("RemoveExplod")).toBe(true);
    expect(isRuntimeSupportedController("Projectile")).toBe(true);
    expect(isRuntimeSupportedController("Helper")).toBe(true);
    expect(isRuntimeSupportedController("Pause")).toBe(true);
    expect(isRuntimeSupportedController("SuperPause")).toBe(true);
    expect(isRuntimeSupportedController("AssertSpecial")).toBe(true);
    expect(isRuntimeSupportedController("ChangeAnim2")).toBe(true);
    expect(isRuntimeSupportedController("HitFallVel")).toBe(true);
    expect(isRuntimeSupportedController("HitFallDamage")).toBe(true);
    expect(isRuntimeSupportedController("HitFallSet")).toBe(true);
    expect(isRuntimeSupportedController("FallEnvShake")).toBe(true);
    expect(isRuntimeSupportedController("AttackMulSet")).toBe(true);
    expect(isRuntimeSupportedController("RemapPal")).toBe(true);
    expect(isRuntimeSupportedController("ForceFeedback")).toBe(true);
    expect(isRuntimeSupportedController("HitOverride")).toBe(true);
    expect(isRuntimeSupportedController("ReversalDef")).toBe(true);
    expect(isRuntimeSupportedController("MoveHitReset")).toBe(true);

    const analysis = analyzeControllerTriggers(
      controller(200, "HitDef", ["AnimElem = 3", "enemynear(1), stateno = 5000", "P2BodyDist X < 40"]),
    );

    expect(analysis.total).toBe(3);
    expect(analysis.supported).toBe(2);
    expect(analysis.unsupported).toBe(1);
    expect(analysis.unsupportedFeatures["enemynear(index)"]).toBe(1);
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

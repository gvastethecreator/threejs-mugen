import { describe, expect, it } from "vitest";
import { compileControllerIr } from "../mugen/compiler/StateControllerCompiler";
import type { MugenStateController } from "../mugen/model/MugenState";
import { dispatchStateProgramController, isStateEntrySetupDispatch } from "../mugen/runtime/StateProgramExecutor";

describe("StateProgramExecutor dispatch", () => {
  it("classifies ChangeState with state, ctrl, and animation metadata", () => {
    const dispatch = dispatchStateProgramController(
      compileControllerIr(controller("ChangeState", { value: "200", ctrl: "1", anim: "205" })),
    );

    expect(dispatch).toMatchObject({
      kind: "change-state",
      stateId: 200,
      clearStateOwner: false,
      animOverride: 205,
      ctrl: true,
    });
  });

  it("classifies ChangeAnim2 as a state-owner animation dispatch", () => {
    const dispatch = dispatchStateProgramController(
      compileControllerIr(controller("ChangeAnim2", { value: "5000", elem: "3", elemtime: "2" })),
    );

    expect(dispatch).toMatchObject({
      kind: "change-anim",
      actionId: 5000,
      animationSource: "state-owner",
      elem: 3,
      elemTime: 2,
    });
  });

  it("preserves dynamic ChangeState and ChangeAnim expressions for runtime evaluation", () => {
    const changeState = dispatchStateProgramController(
      compileControllerIr(controller("ChangeState", { value: '151 + 2*(command = "holddown")', anim: "140 + (statetype = C)" })),
    );
    const changeAnim = dispatchStateProgramController(
      compileControllerIr(controller("ChangeAnim", { value: "140 + (statetype = C)", elem: "1 + 1" })),
    );

    expect(changeState).toMatchObject({
      kind: "change-state",
      stateExpression: '151 + 2*(command = "holddown")',
      animExpression: "140 + (statetype = C)",
    });
    expect(changeAnim).toMatchObject({
      kind: "change-anim",
      actionExpression: "140 + (statetype = C)",
      elemExpression: "1 + 1",
    });
  });

  it("separates shared runtime controllers from side-effect systems", () => {
    const vel = dispatchStateProgramController(compileControllerIr(controller("VelSet", { x: "2" })));
    const hit = dispatchStateProgramController(compileControllerIr(controller("HitDef", { damage: "30" })));
    const target = dispatchStateProgramController(compileControllerIr(controller("TargetLifeAdd", { value: "-20" })));
    const reset = dispatchStateProgramController(compileControllerIr(controller("MoveHitReset", {})));
    const hitAdd = dispatchStateProgramController(compileControllerIr(controller("HitAdd", { value: "2" })));

    expect(vel.kind).toBe("runtime-controller");
    expect(isStateEntrySetupDispatch(vel)).toBe(false);
    expect(hit).toMatchObject({ kind: "side-effect", effect: "hitdef" });
    expect(target).toMatchObject({ kind: "side-effect", effect: "target" });
    expect(reset).toMatchObject({ kind: "side-effect", effect: "contact" });
    expect(hitAdd).toMatchObject({ kind: "side-effect", effect: "contact" });
  });

  it("marks State -1 setup controllers explicitly", () => {
    const setup = dispatchStateProgramController(compileControllerIr(controller("VarSet", { v: "1", value: "3" })));
    const randomSetup = dispatchStateProgramController(compileControllerIr(controller("VarRandom", { v: "2", range: "4,6" })));
    const movement = dispatchStateProgramController(compileControllerIr(controller("VelAdd", { x: "1" })));

    expect(isStateEntrySetupDispatch(setup)).toBe(true);
    expect(isStateEntrySetupDispatch(randomSetup)).toBe(true);
    expect(isStateEntrySetupDispatch(movement)).toBe(false);
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

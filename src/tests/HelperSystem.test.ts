import { describe, expect, it } from "vitest";
import type { ControllerIr, StateProgramIr } from "../mugen/compiler/RuntimeIr";
import { compileControllerIr } from "../mugen/compiler/StateControllerCompiler";
import type { DemoMove } from "../mugen/runtime/demoFighters";
import type { HelperControllerOp, PauseControllerOp, TeamStandbyControllerOp } from "../mugen/compiler/ControllerOps";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
import type { MugenCommand } from "../mugen/model/MugenCommand";
import type { MugenStateController, MugenStateDef } from "../mugen/model/MugenState";
import type { MugenStageDefinition } from "../mugen/model/MugenStage";
import {
  advanceRuntimeHelpers,
  applyRuntimeStateToHelper,
  createRuntimeHelper,
  helperRuntimeState,
  runtimeHelperCanDirectlyInteract,
  runtimeHelpersToSnapshots,
  runtimeHelperTargetActor,
  syncRuntimeHelperTargetActor,
  type RuntimeHelper,
} from "../mugen/runtime/HelperSystem";
import { RUNTIME_CURRENT_STATE_TRANSITION_BUDGET } from "../mugen/runtime/RuntimeStateTransitionSystem";
import {
  createRuntimeContactMemory,
  markRuntimeMoveContact,
  markRuntimeMoveReversed,
  runtimeMoveContactValue,
  runtimeMoveHitCountValue,
  runtimeMoveReversedValue,
} from "../mugen/runtime/ContactMemorySystem";

const stage: Pick<MugenStageDefinition, "bounds"> = {
  bounds: {
    left: -160,
    right: 160,
  },
};

const depthStage: Pick<MugenStageDefinition, "bounds" | "depthBounds" | "localCoord"> = {
  ...stage,
  depthBounds: { top: -20, bottom: 30 },
  localCoord: { width: 320, height: 240 },
};

const action: MugenAnimationAction = {
  id: 6100,
  loopStart: 0,
  rawLines: [],
  frames: [
    {
      spriteGroup: 6100,
      spriteIndex: 0,
      offsetX: 0,
      offsetY: 0,
      duration: 2,
      clsn1: [{ x1: 1, y1: 2, x2: 3, y2: 4 }],
      clsn2: [{ x1: -4, y1: -3, x2: 4, y2: 5 }],
      raw: "6100,0,0,0,2",
      line: 1,
    },
    {
      spriteGroup: 6100,
      spriteIndex: 1,
      offsetX: 2,
      offsetY: -1,
      duration: 1,
      clsn1: [],
      clsn2: [],
      raw: "6100,1,2,-1,1",
      line: 2,
    },
  ],
};

const helperCommand: MugenCommand = {
  name: "helper_tick",
  sequence: [{ raw: "x", type: "button" }],
  rawCommand: "x",
  resolvedCommand: "x",
  time: 15,
  stepTime: 1,
  bufferTime: 1,
  bufferHitPause: false,
  remapped: false,
  rawParams: {},
  line: 1,
};

function controller(params: Record<string, string>): MugenStateController {
  return {
    stateId: 6000,
    type: "Helper",
    params,
    triggers: [],
    line: 1,
    rawHeader: "[State 6000, Helper]",
  };
}

function stateDef(id: number, overrides: Partial<MugenStateDef> = {}): MugenStateDef {
  return {
    id,
    type: "S",
    moveType: "I",
    physics: "N",
    anim: 6100,
    line: 1,
    controllers: [],
    rawParams: {},
    ...overrides,
  };
}

function controllerIr(stateId: number, type: string, params: Record<string, string> = {}): ControllerIr {
  const source: MugenStateController = {
    stateId,
    type,
    params,
    triggers: [],
    line: 1,
    rawHeader: `[State ${stateId}, ${type}]`,
  };
  return {
    source,
    stateId,
    type,
    normalizedType: type.toLowerCase(),
    supportLevel: "executable",
    triggers: [],
    params,
    line: 1,
    unsupportedFeatures: [],
  };
}

function compiledControllerIr(
  stateId: number,
  type: string,
  triggers: string[],
  params: Record<string, string> = {},
): ControllerIr {
  return compileControllerIr({
    stateId,
    type,
    params,
    triggers: triggers.map((expression, index) => ({
      index: index + 1,
      expression,
      raw: `trigger${index + 1} = ${expression}`,
      line: index + 1,
    })),
    line: 1,
    rawHeader: `[State ${stateId}, ${type}]`,
  });
}

function stateProgram(source: MugenStateDef, controllers: ControllerIr[] = []): StateProgramIr {
  return {
    source,
    id: source.id,
    ...(source.special ? { special: source.special } : {}),
    supportLevel: "executable",
    controllers,
    compiledControllers: controllers.length,
  };
}

function activeMove(overrides: Partial<DemoMove> = {}): DemoMove {
  return {
    actionId: 1200,
    startup: 0,
    activeStart: 0,
    activeEnd: 8,
    recovery: 20,
    damage: 33,
    priority: 4,
    requiresHitDef: false,
    hitPause: 3,
    hitStun: 8,
    push: 2,
    hitbox: { x1: 10, y1: -45, x2: 36, y2: -18 },
    ...overrides,
  };
}

function helper(overrides: Partial<RuntimeHelper> = {}): RuntimeHelper {
  return {
    serialId: "p1-helper-0",
    runOrderId: 3,
    helperId: 200,
    helperType: 1,
    name: "Burst",
    actorKind: "helper",
    ownerId: "p1",
    rootId: "p1",
    parentId: "p1",
    spriteOwnerId: "p1",
    spriteOwnerDefinitionId: "demo",
    spriteOwnerLabel: "Demo",
    action,
    stateNo: 6000,
    animNo: 6100,
    moveTick: 0,
    hasHit: false,
    firedHitDefs: new Set(),
    contact: createRuntimeContactMemory(),
    targets: [],
    targetBindings: [],
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
    scale: { x: 1, y: 1 },
    facing: 1,
    ctrl: false,
    stateType: "S",
    moveType: "I",
    physics: "N",
    lifeMax: 1000,
    life: 1000,
    powerMax: 3000,
    power: 0,
    vars: Array.from({ length: 60 }, () => 0),
    sysvars: [],
    fvars: Array.from({ length: 40 }, () => 0),
    frameIndex: 0,
    frameElapsed: 0,
    age: 0,
    animTime: 0,
    stateTime: 0,
    hitPause: 0,
    removeTime: 10,
    ignoreHitPause: false,
    pauseMoveTime: 0,
    superMoveTime: 0,
    spritePriority: 3,
    soundEvents: [],
    hitEffectEvents: [],
    ...overrides,
  };
}

describe("HelperSystem", () => {
  it("resolves Helper EnvColor time = -1 in Parent caller context and rejects zero", () => {
    const parent = helperRuntimeState(helper());
    parent.vars[0] = 32;
    parent.vars[1] = 128;
    parent.vars[2] = 240;
    parent.vars[3] = -1;
    parent.vars[4] = 1;
    const active = helper({
      runtimeProgram: {
        states: [stateProgram(stateDef(6000), [
          compiledControllerIr(6000, "EnvColor", ["1"], {
            value: "Parent,Var(0),Parent,Var(1),Parent,Var(2)",
            time: "Parent,Var(3)",
            under: "Parent,Var(4)",
          }),
          compiledControllerIr(6000, "EnvColor", ["1"], { value: "1,2,3", time: "0" }),
        ])],
      },
    });
    const operations: Array<{ color: [number, number, number]; time: number; under: boolean }> = [];

    advanceRuntimeHelpers([active], stage, {
      parentState: parent,
      rootState: parent,
      onEnvColorController: (_helper, _controller, operation) => {
        operations.push({ color: operation.color, time: operation.time, under: operation.under });
        return true;
      },
    });

    expect(operations).toEqual([{ color: [32, 128, 240], time: -1, under: true }]);
  });

  it("projects Helper BGPalFX and AllPalFX into match-owned callbacks", () => {
    const bgOps: Array<{ time: number; add: [number, number, number] }> = [];
    const allOps: Array<{ time: number; add: [number, number, number] }> = [];
    const active = helper({
      runtimeProgram: {
        states: [stateProgram(stateDef(6000), [
          compiledControllerIr(6000, "BGPalFX", ["1"], { time: "4", add: "80,0,0", mul: "256,256,256", color: "256" }),
          compiledControllerIr(6000, "AllPalFX", ["1"], { time: "3", add: "0,40,0", mul: "256,256,256", color: "256" }),
        ])],
      },
    });
    advanceRuntimeHelpers([active], stage, {
      onBgPalFxController: (_helper, _controller, operation) => {
        bgOps.push({ time: operation.time, add: operation.add });
        return true;
      },
      onAllPalFxController: (_helper, _controller, operation) => {
        allOps.push({ time: operation.time, add: operation.add });
        return true;
      },
    });
    expect(bgOps).toEqual([{ time: 4, add: [80, 0, 0] }]);
    expect(allOps).toEqual([{ time: 3, add: [0, 40, 0] }]);
  });

  it("writes ParentVarSet and ParentVarAdd to the direct parent helper, not the root", () => {
    const root = helperRuntimeState(helper({ vars: [10, 0], fvars: [0, 0] }));
    const parent = helper({
      serialId: "helper-a",
      parentId: "p1",
      vars: [20, 0],
      fvars: [1.5, 0],
    });
    const child = helper({
      serialId: "helper-b",
      parentId: "helper-a",
      vars: [30, 0],
      fvars: [0, 0],
      runtimeProgram: {
        states: [stateProgram(stateDef(6000), [
          compiledControllerIr(6000, "ParentVarSet", [], { v: "0", value: "var(0)" }),
          compiledControllerIr(6000, "ParentVarAdd", [], { fv: "0", value: "0.25" }),
        ])],
      },
    });
    advanceRuntimeHelpers([parent, child], stage, { parentState: root, rootState: root });

    expect(parent.vars[0]).toBe(30);
    expect(child.vars[0]).toBe(30);
    expect(root.vars[0]).toBe(10);
    expect(parent.fvars[0]).toBe(1.75);
  });

  it("does not write ParentVarSet onto root when the parent helper is missing", () => {
    const root = helperRuntimeState(helper({ vars: [10] }));
    const child = helper({
      serialId: "helper-b",
      parentId: "helper-a",
      vars: [30],
      runtimeProgram: {
        states: [stateProgram(stateDef(6000), [
          compiledControllerIr(6000, "ParentVarSet", [], { v: "0", value: "99" }),
        ])],
      },
    });

    advanceRuntimeHelpers([child], stage, { parentState: root, rootState: root });

    expect(root.vars[0]).toBe(10);
    expect(child.vars[0]).toBe(30);
  });

  it("projects match TeamMode and settled Win/Lose into Helper controllers", () => {
    const winning = helper({
      ownerId: "p1",
      rootId: "p1",
      parentId: "p1",
      runtimeProgram: {
        states: [stateProgram(stateDef(6000), [
          compiledControllerIr(6000, "VarSet", [], { v: "0", value: "TeamMode = Turns" }),
          compiledControllerIr(6000, "VarSet", [], { v: "1", value: "Win" }),
          compiledControllerIr(6000, "VarSet", [], { v: "2", value: "Lose" }),
        ])],
      },
    });
    const losing = helper({
      serialId: "p2-helper-0",
      ownerId: "p2",
      rootId: "p2",
      parentId: "p2",
      runtimeProgram: winning.runtimeProgram,
    });
    const nested = helper({
      serialId: "p1-helper-1",
      ownerId: "p1",
      rootId: "p1",
      parentId: "p1-helper-0",
      runtimeProgram: winning.runtimeProgram,
    });
    const roundDecision = (candidate: RuntimeHelper) =>
      candidate.ownerId === "p1"
        ? { settled: true as const, win: true, lose: false }
        : { settled: true as const, win: false, lose: true };
    advanceRuntimeHelpers([winning, losing, nested], stage, { teamMode: "turns", roundDecision });
    expect(winning.vars[0]).toBe(1);
    expect(winning.vars[1]).toBe(1);
    expect(winning.vars[2]).toBe(0);
    expect(losing.vars[0]).toBe(1);
    expect(losing.vars[1]).toBe(0);
    expect(losing.vars[2]).toBe(1);
    expect(nested.vars[1]).toBe(1);
    expect(nested.vars[2]).toBe(0);

    const unsettled = helper({
      runtimeProgram: winning.runtimeProgram,
    });
    advanceRuntimeHelpers([unsettled], stage, { teamMode: "turns", roundDecision: { settled: false } });
    expect(unsettled.vars[0]).toBe(1);
    expect(unsettled.vars[1]).toBe(0);
    expect(unsettled.vars[2]).toBe(0);
  });

  it("uses Helper action time and borrowed AIR tables for animation queries", () => {
    const shortAction: MugenAnimationAction = {
      ...action,
      id: 7000,
      frames: [
        { ...action.frames[0]!, duration: 1, spriteIndex: 0 },
        { ...action.frames[1]!, duration: 1, spriteIndex: 1 },
      ],
    };
    const own = new Map<number, MugenAnimationAction>([
      [6100, action],
      [7000, shortAction],
      [902, action],
    ]);
    const borrowed = new Map<number, MugenAnimationAction>([
      [6100, action],
      [901, action],
    ]);
    const active = helper({
      age: 100,
      animTime: 100,
      animations: own,
      runtimeProgram: {
        states: [stateProgram(stateDef(6000), [
          compiledControllerIr(6000, "VarSet", [], { v: "0", value: "AnimExist(901)" }),
          compiledControllerIr(6000, "VarSet", [], { v: "1", value: "SelfAnimExist(902)" }),
          compiledControllerIr(6000, "VarSet", [], { v: "2", value: "SelfAnimExist(901)" }),
          compiledControllerIr(6000, "VarSet", [], { v: "3", value: "AnimExist(902)" }),
        ])],
      },
    });
    advanceRuntimeHelpers([active], stage, { ownerAnimations: borrowed });
    expect(active.vars[0]).toBe(1);
    expect(active.vars[1]).toBe(1);
    expect(active.vars[2]).toBe(0);
    expect(active.vars[3]).toBe(0);

    const switching = helper({
      age: 100,
      animTime: 100,
      animations: own,
      runtimeProgram: {
        states: [stateProgram(stateDef(6000), [
          compiledControllerIr(6000, "ChangeAnim", [], { value: "7000" }),
          compiledControllerIr(6000, "VarSet", [], { v: "4", value: "AnimElemNo(-50)" }),
        ])],
      },
    });
    advanceRuntimeHelpers([switching], stage);
    advanceRuntimeHelpers([switching], stage);
    expect(switching.age).toBeGreaterThan(100);
    expect(switching.animTime).toBe(2);
    expect(switching.vars[4]).toBe(0);
  });

  it("resolves Helper ChangeAnim2 from the owner AIR when the helper table lacks that action", () => {
    const borrowedAction: MugenAnimationAction = { ...action, id: 930 };
    const own = new Map<number, MugenAnimationAction>([[6100, action]]);
    const borrowed = new Map<number, MugenAnimationAction>([[930, borrowedAction]]);
    const active = helper({
      animations: own,
      runtimeProgram: {
        states: [stateProgram(stateDef(6000), [
          compiledControllerIr(6000, "ChangeAnim2", [], { value: "930" }),
          compiledControllerIr(6000, "ChangeAnim", [], { value: "930" }),
        ])],
      },
    });
    advanceRuntimeHelpers([active], stage, { ownerAnimations: borrowed });
    expect(active.animNo).toBe(930);
    expect(active.action.id).toBe(930);
    expect(own.has(930)).toBe(false);
  });

  it("truncates ParentVar index toward zero and refuses invalid index or value writes", () => {
    const root = helperRuntimeState(helper({ vars: [10, 11, 12], fvars: [1, 2] }));
    const parent = helper({
      serialId: "helper-a",
      parentId: "p1",
      vars: [20, 21, 22],
      fvars: [1.5, 2.5],
    });
    const child = helper({
      serialId: "helper-b",
      parentId: "helper-a",
      vars: [30, 31, 32],
      runtimeProgram: {
        states: [stateProgram(stateDef(6000), [
          compiledControllerIr(6000, "ParentVarSet", [], { v: "1.9", value: "99" }),
          compiledControllerIr(6000, "ParentVarSet", [], { v: "-1", value: "7" }),
          compiledControllerIr(6000, "ParentVarSet", [], { v: "60", value: "8" }),
          compiledControllerIr(6000, "ParentVarSet", [], { v: "0", value: "1 + * 2" }),
        ])],
      },
    });
    const sibling = helper({
      serialId: "helper-c",
      parentId: "helper-a",
      vars: [40, 41, 42],
    });
    advanceRuntimeHelpers([parent, child, sibling], stage, { parentState: root, rootState: root });

    expect(parent.vars).toEqual([20, 99, 22]);
    expect(child.vars).toEqual([30, 31, 32]);
    expect(sibling.vars).toEqual([40, 41, 42]);
    expect(root.vars).toEqual([10, 11, 12]);
  });

  it("preserves Helper EnvColor finite time above the former local ceiling", () => {
    const parent = helperRuntimeState(helper());
    parent.vars[3] = 241;
    const active = helper({
      runtimeProgram: {
        states: [stateProgram(stateDef(6000), [
          compiledControllerIr(6000, "EnvColor", ["1"], {
            value: "1,2,3",
            time: "Parent,Var(3)",
            under: "0",
          }),
        ])],
      },
    });
    const operations: Array<{ color: [number, number, number]; time: number; under: boolean }> = [];

    advanceRuntimeHelpers([active], stage, {
      parentState: parent,
      rootState: parent,
      onEnvColorController: (_helper, _controller, operation) => {
        operations.push({ color: operation.color, time: operation.time, under: operation.under });
        return true;
      },
    });

    expect(operations).toEqual([{ color: [1, 2, 3], time: 241, under: false }]);
  });

  it("preserves Helper active EnvShake finite time above the former local ceiling", () => {
    const parent = helperRuntimeState(helper());
    parent.vars[3] = 241;
    const active = helper({
      runtimeProgram: {
        states: [stateProgram(stateDef(6000), [
          compiledControllerIr(6000, "EnvShake", ["1"], {
            time: "Parent,Var(3)",
            freq: "30",
            ampl: "-7",
            phase: "0",
          }),
        ])],
      },
    });
    const operations: Array<{ time: number; freq: number; ampl: number; phase: number }> = [];

    advanceRuntimeHelpers([active], stage, {
      parentState: parent,
      rootState: parent,
      onEnvShakeController: (_helper, _controller, operation) => {
        operations.push({ time: operation.time, freq: operation.freq, ampl: operation.ampl, phase: operation.phase });
        return true;
      },
    });

    expect(operations).toEqual([{ time: 241, freq: 30, ampl: -7, phase: 0 }]);
  });

  it("routes opt-in shared resource writes without mutating the helper locally", () => {
    const active = helper({
      life: 500,
      power: 100,
      runtimeProgram: {
        states: [stateProgram(stateDef(6000), [
          compiledControllerIr(6000, "LifeAdd", ["1"], { value: "75" }),
          compiledControllerIr(6000, "PowerAdd", ["1"], { value: "125" }),
        ])],
      },
    });
    const sharedWrites: string[] = [];
    advanceRuntimeHelpers([active], stage, {
      runtimeProfile: "ikemen-go",
      applySharedResourceWrite: (_helper, operation) => {
        sharedWrites.push(`${operation.controllerType}:${operation.value}`);
        return true;
      },
    });
    expect(sharedWrites).toEqual(["lifeadd:75", "poweradd:125"]);
    expect(active.life).toBe(500);
    expect(active.power).toBe(100);
  });

  it("exposes accepted shared resource values to subsequent Helper triggers", () => {
    const active = helper({
      life: 500,
      power: 100,
      runtimeProgram: {
        states: [stateProgram(stateDef(6000), [
          compiledControllerIr(6000, "LifeAdd", ["1"], { value: "75" }),
          compiledControllerIr(6000, "LifeSet", ["Life = 575"], { value: "650" }),
          compiledControllerIr(6000, "PowerAdd", ["Life = 650"], { value: "125" }),
          compiledControllerIr(6000, "PowerSet", ["Power = 225"], { value: "900" }),
        ])],
      },
    });
    const sharedWrites: string[] = [];
    advanceRuntimeHelpers([active], stage, {
      runtimeProfile: "ikemen-go",
      applySharedResourceWrite: (_helper, operation) => {
        sharedWrites.push(`${operation.controllerType}:${operation.value}`);
        return true;
      },
    });
    expect(sharedWrites).toEqual(["lifeadd:75", "lifeset:650", "poweradd:125", "powerset:900"]);
    expect(active.life).toBe(500);
    expect(active.power).toBe(100);
  });

  it("exposes accepted shared red-life values while preserving the Helper-local pool", () => {
    const active = helper({
      redLife: 25,
      runtimeProgram: {
        states: [stateProgram(stateDef(6000), [
          compiledControllerIr(6000, "RedLifeAdd", ["1"], { value: "50", absolute: "1" }),
          compiledControllerIr(6000, "RedLifeSet", ["RedLife = 75"], { value: "125" }),
        ])],
      },
    });
    const sharedWrites: string[] = [];
    advanceRuntimeHelpers([active], stage, {
      runtimeProfile: "ikemen-go",
      applySharedResourceWrite: (_helper, operation) => {
        sharedWrites.push(`${operation.controllerType}:${operation.value}`);
        return true;
      },
    });
    expect(sharedWrites).toEqual(["redlifeadd:50", "redlifeset:125"]);
    expect(active.redLife).toBe(25);
    expect(active.sharedResourceShadow?.redLife).toBe(125);
  });

  it("fails closed before invoking the shared resource sink when admission is denied", () => {
    const active = helper({
      life: 500,
      power: 100,
      runtimeProgram: {
        states: [stateProgram(stateDef(6000), [
          compiledControllerIr(6000, "LifeAdd", ["1"], { value: "75" }),
          compiledControllerIr(6000, "PowerAdd", ["1"], { value: "125" }),
        ])],
      },
    });
    let sinkCalls = 0;

    advanceRuntimeHelpers([active], stage, {
      runtimeProfile: "ikemen-go",
      admitResourceWrite: () => false,
      applySharedResourceWrite: () => {
        sinkCalls += 1;
        return true;
      },
    });

    expect(sinkCalls).toBe(0);
    expect(active.life).toBe(500);
    expect(active.power).toBe(100);
  });

  it("continues helper ChangeState destinations in the same tick and bounds cycles", () => {
    const calls: string[] = [];
    const active = helper({
      stateNo: 1200,
      animations: new Map([[920, action]]),
      runtimeProgram: {
        states: [
          stateProgram(stateDef(1200), [controllerIr(1200, "ChangeState", { value: "1300" }), controllerIr(1200, "VarAdd")]),
          stateProgram(stateDef(1300), [controllerIr(1300, "ChangeState", { value: "1400" }), controllerIr(1300, "VarAdd")]),
          stateProgram(stateDef(1400), [controllerIr(1400, "ChangeAnim", { value: "920" })]),
        ],
      },
    });

    advanceRuntimeHelpers([active], stage, {
      onController: (_helper, controllerInput) => calls.push(controllerInput.normalizedType),
    });

    expect(active.stateNo).toBe(1400);
    expect(active.animNo).toBe(920);
    expect(calls).toEqual(["changestate", "changestate", "changeanim"]);

    const cycle = helper({
      stateNo: 1200,
      runtimeProgram: {
        states: [
          stateProgram(stateDef(1200), [controllerIr(1200, "ChangeState", { value: "1300" })]),
          stateProgram(stateDef(1300), [controllerIr(1300, "ChangeState", { value: "1200" })]),
        ],
      },
    });
    const cycleCalls: string[] = [];
    const diagnostics: Array<{ fromState: number; toState: number; budget: number }> = [];

    advanceRuntimeHelpers([cycle], stage, {
      onController: (_helper, controllerInput) => cycleCalls.push(controllerInput.normalizedType),
      onStateTransitionCycle: (_helper, transition, budget) =>
        diagnostics.push({ fromState: transition.fromState, toState: transition.toState, budget }),
    });

    expect(cycle.stateNo).toBe(1200);
    expect(cycleCalls).toHaveLength(RUNTIME_CURRENT_STATE_TRANSITION_BUDGET);
    expect(diagnostics).toEqual([{ fromState: 1300, toState: 1200, budget: RUNTIME_CURRENT_STATE_TRANSITION_BUDGET }]);
  });

  it("resets explicit IKEMEN player Helper PlayerPush state before controllers", () => {
    const player = helper({
      helperType: 2,
      playerPush: false,
      pushPriority: 8,
      pushAffectTeam: -1,
      runtimeProgram: {
        states: [stateProgram(stateDef(-4), [
          compiledControllerIr(-4, "PlayerPush", ["Time = 0"], {
            value: "0",
            priority: "3",
            affectteam: "B",
          }),
        ])],
      },
    });

    advanceRuntimeHelpers([player], stage, { runtimeProfile: "ikemen-go" });
    expect(player).toMatchObject({ playerPush: false, pushPriority: 3, pushAffectTeam: 0 });

    advanceRuntimeHelpers([player], stage, { runtimeProfile: "ikemen-go" });
    expect(player).toMatchObject({ playerPush: true, pushPriority: 0, pushAffectTeam: 1 });
  });

  it("lets an explicit IKEMEN normal Helper opt into PlayerPush for its current frame", () => {
    const normal = helper({
      helperType: 1,
      runtimeProgram: {
        states: [stateProgram(stateDef(6000), [
          compiledControllerIr(6000, "PlayerPush", ["Time = 0"], {
            value: "1",
            priority: "4",
            affectteam: "F",
          }),
        ])],
      },
    });

    advanceRuntimeHelpers([normal], stage, { runtimeProfile: "ikemen-go" });
    expect(normal).toMatchObject({ playerPush: true, pushPriority: 4, pushAffectTeam: -1 });

    advanceRuntimeHelpers([normal], stage, { runtimeProfile: "ikemen-go" });
    expect(normal.playerPush).toBeUndefined();
    expect(normal.pushPriority).toBeUndefined();
    expect(normal.pushAffectTeam).toBeUndefined();
  });

  it("runs IKEMEN helper States -4, -3, and -2 before State -1, then +1 after current", () => {
    const runtimeProgram = {
      states: [
        stateProgram(stateDef(-4), [compiledControllerIr(-4, "VarAdd", [], { v: "0", value: "4" })]),
        stateProgram(stateDef(-3), [compiledControllerIr(-3, "VarAdd", [], { v: "0", value: "3" })]),
        stateProgram(stateDef(-2), [compiledControllerIr(-2, "VarAdd", [], { v: "0", value: "20" })]),
        stateProgram(stateDef(6000), [controllerIr(6000, "VarAdd", { v: "1", value: "1" })]),
        stateProgram(stateDef(1, { special: "plus-one" }), [compiledControllerIr(1, "VarAdd", [], { v: "0", value: "7" })]),
      ],
      stateEntries: [compiledControllerIr(-1, "VarAdd", [], { v: "0", value: "100" })],
    };

    const ikemen = helper({ keyCtrl: true, vars: [0, 0], runtimeProgram });
    advanceRuntimeHelpers([ikemen], stage, { runtimeProfile: "ikemen-go" });
    expect(ikemen.vars.slice(0, 2)).toEqual([134, 1]);

    const mugen = helper({ keyCtrl: true, vars: [0, 0], runtimeProgram });
    advanceRuntimeHelpers([mugen], stage, { runtimeProfile: "mugen-1.1" });
    expect(mugen.vars.slice(0, 2)).toEqual([100, 1]);

    const keyCtrlOff = helper({ keyCtrl: false, vars: [0, 0], runtimeProgram });
    advanceRuntimeHelpers([keyCtrlOff], stage, { runtimeProfile: "ikemen-go" });
    expect(keyCtrlOff.vars.slice(0, 2)).toEqual([11, 1]);

    const paused = helper({ keyCtrl: false, vars: [0, 0], runtimeProgram });
    advanceRuntimeHelpers([paused], stage, { runtimeProfile: "ikemen-go", pauseKind: "Pause" });
    expect(paused.vars.slice(0, 2)).toEqual([11, 0]);
    expect(paused.age).toBe(0);
  });

  it("runs helper State -1 only with keyctrl, owner command input, and outside pause", () => {
    const stateEntry = compiledControllerIr(-1, "VarAdd", ['command = "helper_tick"'], { v: "0", value: "10" });
    const currentState = controllerIr(6000, "VarAdd", { v: "1", value: "1" });
    const runtimeProgram = {
      states: [stateProgram(stateDef(6000), [currentState])],
      stateEntries: [stateEntry],
    };

    const enabled = helper({ keyCtrl: true, vars: [0, 0], runtimeProgram });
    advanceRuntimeHelpers([enabled], stage, { commandActive: (name) => name === "helper_tick" });
    expect(enabled.vars.slice(0, 2)).toEqual([10, 1]);
    expect(enabled.age).toBe(1);

    const commandMiss = helper({ keyCtrl: true, vars: [0, 0], runtimeProgram });
    advanceRuntimeHelpers([commandMiss], stage, { commandActive: () => false });
    expect(commandMiss.vars.slice(0, 2)).toEqual([0, 1]);

    const keyCtrlOff = helper({ keyCtrl: false, vars: [0, 0], runtimeProgram });
    advanceRuntimeHelpers([keyCtrlOff], stage, { commandActive: () => true });
    expect(keyCtrlOff.vars.slice(0, 2)).toEqual([0, 1]);

    const paused = helper({ keyCtrl: true, vars: [0, 0], runtimeProgram, pauseMoveTime: 0 });
    advanceRuntimeHelpers([paused], stage, { pauseKind: "Pause", commandActive: () => true });
    expect(paused.vars.slice(0, 2)).toEqual([0, 0]);
    expect(paused.age).toBe(0);
  });

  it("exposes profile-scoped HelperVar fields through the IKEMEN micro-VM", () => {
    const runtimeProgram = {
      states: [
        stateProgram(
          stateDef(6000),
          [compiledControllerIr(6000, "VarSet", ["HelperVar(helpertype) = 1 && HelperVar(id) = 200 && HelperVar(keyctrl) = 1 && HelperVar(ownpal) = 1 && HelperVar(ownprojectile) = 1 && HelperVar(preserve) = 1 && HelperVar(ownclsnscale) = 1 && HelperVar(clsnproxy) = 1"], { v: "0", value: "1" })],
        ),
      ],
    };

    const owned = helper({ keyCtrl: true, ownPalette: true, ownProjectile: true, preserve: true, ownClsnScale: true, clsnProxy: true, runtimeProgram, vars: [0] });
    const rootOwned = helper({ ownPalette: false, ownProjectile: false, preserve: false, ownClsnScale: false, clsnProxy: false, runtimeProgram, vars: [0] });
    const legacy = helper({ ownPalette: true, ownProjectile: true, preserve: true, ownClsnScale: true, clsnProxy: true, runtimeProgram, vars: [0] });
    advanceRuntimeHelpers([owned], stage, { runtimeProfile: "ikemen-go" });
    advanceRuntimeHelpers([rootOwned], stage, { runtimeProfile: "ikemen-go" });
    advanceRuntimeHelpers([legacy], stage, { runtimeProfile: "mugen-1.1" });

    expect(owned.vars[0]).toBe(1);
    expect(rootOwned.vars[0]).toBe(0);
    expect(legacy.vars[0]).toBe(0);
  });

  it("applies dynamic local Helper Width and Height constraints for one frame", () => {
    const width = compiledControllerIr(6000, "Width", ["Time = 0"], { player: "var(0), var(1)" });
    const height = compiledControllerIr(6000, "Height", ["Time = 0"], { value: "fvar(0), fvar(1)" });
    const actor = helper({
      vars: [18, 44],
      fvars: [12.5, 2.25],
      runtimeProgram: { states: [stateProgram(stateDef(6000), [width, height])] },
    });
    const operations: string[] = [];

    advanceRuntimeHelpers([actor], stage, {
      runtimeProfile: "ikemen-go",
      onOperation: (_helper, operation) => {
        if (operation.kind === "collision" && "front" in operation) {
          operations.push(`${operation.controllerType}:${operation.front},${operation.back}`);
        } else if (operation.kind === "collision" && "top" in operation) {
          operations.push(`${operation.controllerType}:${operation.top},${operation.bottom}`);
        }
      },
    });

    expect(actor.bodyWidth).toEqual({ front: 18, back: 44 });
    expect(actor.bodyWidthDelta).toEqual({ front: 18, back: 44 });
    expect(actor.bodyHeightDelta).toEqual({ top: 12.5, bottom: 2.25 });
    expect(operations).toEqual(["width:18,44", "height:12.5,2.25"]);
    const [snapshot] = runtimeHelpersToSnapshots([actor], 6000);
    expect(snapshot?.runtime.bodyWidthDelta).toEqual({ front: 18, back: 44 });
    expect(snapshot?.runtime.bodyHeightDelta).toEqual({ top: 12.5, bottom: 2.25 });

    advanceRuntimeHelpers([actor], stage, { runtimeProfile: "ikemen-go" });

    expect(actor.bodyWidth).toBeUndefined();
    expect(actor.bodyWidthDelta).toBeUndefined();
    expect(actor.bodyHeightDelta).toBeUndefined();
  });

  it("applies dynamic IKEMEN Helper Depth value state for one frame and clamps current Z bounds", () => {
    const depth = compiledControllerIr(6000, "Depth", ["Time = 0"], { value: "var(0), fvar(0)" });
    const actor = helper({
      pos: { x: 0, y: 0, z: 100 },
      combatDepth: { position: 100, velocity: 0, size: [3, 4], attack: [4, 4] },
      vars: [6],
      fvars: [8.5],
      runtimeProgram: { states: [stateProgram(stateDef(6000), [depth])] },
    });
    const operations: string[] = [];

    advanceRuntimeHelpers([actor], depthStage, {
      runtimeProfile: "ikemen-go",
      onOperation: (_helper, operation) => {
        if (operation.kind === "collision" && operation.controllerType === "depth") {
          operations.push(`${operation.controllerType}:${operation.mode}:${operation.top},${operation.bottom}`);
        }
      },
    });

    expect(actor.combatDepth).toMatchObject({ size: [9, 12.5], baseSize: [3, 4], edge: [6, 8.5], position: 21.5 });
    expect(actor.pos.z).toBe(21.5);
    expect(operations).toEqual(["depth:value:6,8.5"]);
    const [snapshot] = runtimeHelpersToSnapshots([actor], 6000);
    expect(snapshot?.runtime.combatDepth).toMatchObject({ size: [9, 12.5], edge: [6, 8.5], position: 21.5 });

    advanceRuntimeHelpers([actor], depthStage, { runtimeProfile: "ikemen-go" });

    expect(actor.combatDepth).toMatchObject({ size: [3, 4], position: 21.5 });
    expect(actor.combatDepth?.baseSize).toBeUndefined();
    expect(actor.combatDepth?.edge).toBeUndefined();

    const legacy = helper({
      combatDepth: { position: 0, velocity: 0, size: [3, 4], attack: [4, 4] },
      runtimeProgram: { states: [stateProgram(stateDef(6000), [depth])] },
    });
    const unsupported: string[] = [];
    advanceRuntimeHelpers([legacy], depthStage, {
      runtimeProfile: "mugen-1.1",
      onUnsupportedController: (_helper, controller) => unsupported.push(controller.type),
    });
    expect(legacy.combatDepth).toMatchObject({ size: [3, 4] });
    expect(unsupported).toEqual(["Depth"]);
  });

  it("applies one-frame Helper Width edge state and keeps unresolved RedirectID fail-closed", () => {
    const widthEdge = compiledControllerIr(6000, "Width", ["Time = 0"], { edge: "30,20" });
    const heightRedirect = compiledControllerIr(6000, "Height", ["Time = 0"], { value: "12,4", redirectid: "57" });
    const actor = helper({
      pos: { x: 80, y: 0 },
      runtimeProgram: { states: [stateProgram(stateDef(6000), [widthEdge, heightRedirect])] },
    });
    const unsupported: string[] = [];

    advanceRuntimeHelpers([actor], { bounds: { left: -40, right: 40 } }, {
      runtimeProfile: "ikemen-go",
      onUnsupportedController: (_helper, controller) => unsupported.push(controller.type),
    });

    expect(actor.bodyWidthDelta).toBeUndefined();
    expect(actor.edgeWidth).toEqual({ front: 30, back: 20 });
    expect(actor.pos.x).toBe(10);
    expect(actor.bodyHeightDelta).toBeUndefined();
    expect(unsupported).toEqual(["Height"]);

    advanceRuntimeHelpers([actor], { bounds: { left: -40, right: 40 } }, { runtimeProfile: "ikemen-go" });
    expect(actor.edgeWidth).toBeUndefined();
  });

  it("applies dynamic Helper PosFreeze for one tick and carries a redirected freeze into a later Helper", () => {
    const posFreeze = compiledControllerIr(6000, "PosFreeze", ["Time = 0"], { value: "var(0)" });
    const actor = helper({
      pos: { x: 18, y: -9, z: 4 },
      vel: { x: 7, y: -3 },
      combatDepth: { position: 4, velocity: 2, size: [3, 4], attack: [4, 4] },
      vars: [1],
      runtimeProgram: { states: [stateProgram(stateDef(6000), [posFreeze])] },
    });

    advanceRuntimeHelpers([actor], depthStage, { runtimeProfile: "ikemen-go", runtimeTick: 40 });

    expect(actor.pos).toEqual({ x: 18, y: -9, z: 4 });
    expect(actor.posFreeze).toEqual({ x: true, y: true, z: true });
    expect(runtimeHelpersToSnapshots([actor], 6000)[0]?.runtime.posFreeze).toEqual({ x: true, y: true, z: true });

    advanceRuntimeHelpers([actor], depthStage, { runtimeProfile: "ikemen-go", runtimeTick: 41 });

    expect(actor.pos).toEqual({ x: 25, y: -12, z: 4 });
    expect(actor.posFreeze).toBeUndefined();

    const unfrozen = helper({
      pos: { x: -12, y: 3 },
      vel: { x: 4, y: -1 },
      vars: [0],
      runtimeProgram: { states: [stateProgram(stateDef(6000), [posFreeze])] },
    });
    advanceRuntimeHelpers([unfrozen], stage, { runtimeProfile: "ikemen-go", runtimeTick: 42 });
    expect(unfrozen.pos).toEqual({ x: -8, y: 2 });
    expect(unfrozen.posFreeze).toEqual({ x: false, y: false, z: false });

    const redirected = compiledControllerIr(6000, "PosFreeze", ["Time = 0"], {
      value: "var(0)",
      redirectid: "57",
    });
    const destinationHelper = helper({
      serialId: "p2-helper-posfreeze-destination",
      pos: { x: 30, y: -6 },
      vel: { x: 5, y: -2 },
    });
    const destinationActor = runtimeHelperTargetActor(destinationHelper);
    const caller = helper({
      serialId: "p1-helper-posfreeze-caller",
      vars: [1],
      runtimeProgram: { states: [stateProgram(stateDef(6000), [redirected])] },
    });

    advanceRuntimeHelpers([caller, destinationHelper], stage, {
      runtimeProfile: "ikemen-go",
      runtimeTick: 43,
      resolveResourceRedirect: (_helper, playerId) =>
        playerId === 57
          ? {
              actor: destinationActor,
              candidateTargets: [],
              onPosFreezeApplied: () => {
                destinationHelper.posFreezeAppliedTick = 43;
              },
              commitActor: (target) => {
                applyRuntimeStateToHelper(destinationHelper, target.runtime);
                syncRuntimeHelperTargetActor(destinationHelper, target);
              },
            }
          : undefined,
    });

    expect(caller.posFreeze).toBeUndefined();
    expect(destinationHelper.pos).toEqual({ x: 30, y: -6 });
    expect(destinationHelper.posFreeze).toEqual({ x: true, y: true, z: true });
    expect(destinationHelper.posFreezeAppliedTick).toBeUndefined();
  });

  it("materializes dynamic Helper PlayerPush RedirectID in the caller and retains it through a later Helper reset", () => {
    const redirected = compiledControllerIr(6000, "PlayerPush", ["Time = 0"], {
      value: "var(0)",
      priority: "var(1)",
      affectteam: "B",
      redirectid: "57",
    });
    const destinationHelper = helper({
      serialId: "p2-helper-playerpush-destination",
      helperType: 2,
      vars: [1, 99],
      playerPush: true,
      pushPriority: 0,
      pushAffectTeam: 1,
    });
    const destinationActor = runtimeHelperTargetActor(destinationHelper);
    const caller = helper({
      serialId: "p1-helper-playerpush-caller",
      vars: [0, 4],
      runtimeProgram: { states: [stateProgram(stateDef(6000), [redirected])] },
    });

    advanceRuntimeHelpers([caller, destinationHelper], stage, {
      runtimeProfile: "ikemen-go",
      runtimeTick: 44,
      resolveResourceRedirect: (_helper, playerId) =>
        playerId === 57
          ? {
              actor: destinationActor,
              candidateTargets: [],
              onPlayerPushApplied: () => {
                destinationHelper.playerPushAppliedTick = 44;
              },
              commitActor: (target) => {
                applyRuntimeStateToHelper(destinationHelper, target.runtime);
                syncRuntimeHelperTargetActor(destinationHelper, target);
              },
            }
          : undefined,
    });

    expect(caller.playerPush).toBeUndefined();
    expect(destinationHelper).toMatchObject({ playerPush: false, pushPriority: 4, pushAffectTeam: 0 });
    expect(destinationHelper.playerPushAppliedTick).toBeUndefined();
  });

  it("applies dynamic Helper ScreenBound state, projects current bounds, snapshots it, and resets next frame", () => {
    const screenBound = compiledControllerIr(6000, "ScreenBound", ["Time = 0"], {
      value: "var(0)",
      movecamera: "var(1),var(2)",
      stagebound: "var(3)",
    });
    const actor = helper({
      pos: { x: 80, y: 0, z: 100 },
      combatDepth: { position: 100, velocity: 0, size: [3, 4], attack: [4, 4] },
      vars: [1, 1, 0, 0],
      runtimeProgram: { states: [stateProgram(stateDef(6000), [screenBound])] },
    });
    const operations: string[] = [];
    const boundedStage = {
      bounds: { left: -40, right: 40 },
      depthBounds: { top: -10, bottom: 10 },
    };

    advanceRuntimeHelpers([actor], boundedStage, {
      runtimeProfile: "ikemen-go",
      onOperation: (_helper, operation) => {
        if (operation.kind === "bounds" && operation.controllerType === "screenbound") {
          operations.push(
            String(operation.bound) +
              ":" +
              String(operation.moveCameraX) +
              ":" +
              String(operation.moveCameraY) +
              ":" +
              String(operation.stageBound),
          );
        }
      },
    });

    expect(actor.pos.x).toBe(40);
    expect(actor.combatDepth?.position).toBe(100);
    expect(actor.screenBound).toEqual({ bound: true, moveCameraX: true, moveCameraY: false });
    expect(actor.stageBound).toBe(false);
    expect(operations).toEqual(["true:true:false:false"]);
    const [snapshot] = runtimeHelpersToSnapshots([actor], 6000);
    expect(snapshot?.runtime.screenBound).toEqual({ bound: true, moveCameraX: true, moveCameraY: false });
    expect(snapshot?.runtime.stageBound).toBe(false);

    advanceRuntimeHelpers([actor], boundedStage, { runtimeProfile: "ikemen-go" });

    expect(actor.screenBound).toBeUndefined();
    expect(actor.stageBound).toBeUndefined();
    expect(actor.combatDepth?.position).toBe(10);
  });

  it("routes Helper ScreenBound RedirectID through a verified destination with caller values", () => {
    const screenBound = compiledControllerIr(6000, "ScreenBound", ["Time = 0"], {
      value: "var(0)",
      movecamera: "var(1),var(2)",
      stagebound: "var(3)",
      redirectid: "57",
    });
    const destinationHelper = helper({ serialId: "p2-helper-screenbound-destination" });
    const destinationActor = runtimeHelperTargetActor(destinationHelper);
    const caller = helper({
      serialId: "p1-helper-screenbound-caller",
      vars: [0, 1, 1, 0],
      runtimeProgram: { states: [stateProgram(stateDef(6000), [screenBound])] },
    });
    const committed: string[] = [];
    const operations: string[] = [];

    advanceRuntimeHelpers([caller], stage, {
      runtimeProfile: "ikemen-go",
      resolveResourceRedirect: (_helper, playerId) =>
        playerId === 57
          ? {
              actor: destinationActor,
              candidateTargets: [],
              commitActor: (target) => {
                committed.push(target.id);
                applyRuntimeStateToHelper(destinationHelper, target.runtime);
                syncRuntimeHelperTargetActor(destinationHelper, target);
              },
            }
          : undefined,
      onRedirectedOperation: (_helper, target, operation) => {
        if (operation.kind === "bounds" && operation.controllerType === "screenbound") {
          operations.push(
            target.id +
              ":" +
              String(operation.bound) +
              ":" +
              String(operation.moveCameraX) +
              ":" +
              String(operation.moveCameraY) +
              ":" +
              String(operation.stageBound),
          );
        }
      },
    });

    expect(caller.screenBound).toBeUndefined();
    expect(caller.stageBound).toBeUndefined();
    expect(destinationHelper.screenBound).toEqual({ bound: false, moveCameraX: true, moveCameraY: true });
    expect(destinationHelper.stageBound).toBe(false);
    expect(committed).toEqual(["p2-helper-screenbound-destination"]);
    expect(operations).toEqual(["p2-helper-screenbound-destination:false:true:true:false"]);

    const invalid = helper({
      runtimeProgram: {
        states: [
          stateProgram(
            stateDef(6000),
            [
              compiledControllerIr(6000, "ScreenBound", ["Time = 0"], {
                value: "1",
                redirectid: "999",
              }),
            ],
          ),
        ],
      },
    });
    const unsupported: string[] = [];
    advanceRuntimeHelpers([invalid], stage, {
      runtimeProfile: "ikemen-go",
      onUnsupportedController: (_helper, controller) => unsupported.push(controller.type),
    });

    expect(invalid.screenBound).toBeUndefined();
    expect(unsupported).toEqual(["ScreenBound"]);
  });

  it("routes Helper Width and Height RedirectID through destination state with localcoord scale", () => {
    const width = compiledControllerIr(6000, "Width", ["Time = 0"], {
      value: "var(0), var(1)",
      redirectid: "57",
    });
    const height = compiledControllerIr(6000, "Height", ["Time = 0"], {
      value: "fvar(0), fvar(1)",
      redirectid: "57",
    });
    const depth = compiledControllerIr(6000, "Depth", ["Time = 0"], {
      value: "var(0), fvar(0)",
      redirectid: "57",
    });
    const destinationHelper = helper({
      serialId: "p2-helper-destination",
      localCoord: [640, 480],
      combatDepth: { position: 0, velocity: 0, size: [3, 4], attack: [4, 4] },
    });
    const destinationActor = runtimeHelperTargetActor(destinationHelper);
    const caller = helper({
      serialId: "p1-helper-caller",
      localCoord: [320, 240],
      vars: [18, 9],
      fvars: [12.5, 2.25],
      runtimeProgram: { states: [stateProgram(stateDef(6000), [width, height, depth])] },
    });
    const committed: string[] = [];
    const redirectedControllers: string[] = [];
    const redirectedOperations: string[] = [];

    advanceRuntimeHelpers([caller], stage, {
      runtimeProfile: "ikemen-go",
      resolveResourceRedirect: (_helper, playerId) =>
        playerId === 57
          ? {
              actor: destinationActor,
              candidateTargets: [],
              commitActor: (target) => {
                committed.push(target.id);
                applyRuntimeStateToHelper(destinationHelper, target.runtime);
                syncRuntimeHelperTargetActor(destinationHelper, target);
              },
            }
          : undefined,
      onRedirectedController: (_helper, target, controller) => redirectedControllers.push(`${target.id}:${controller.type}`),
      onRedirectedOperation: (_helper, target, operation) => {
        if (operation.kind === "collision" && "front" in operation) {
          redirectedOperations.push(`${target.id}:${operation.controllerType}:${operation.front},${operation.back}`);
        } else if (operation.kind === "collision" && "top" in operation) {
          redirectedOperations.push(`${target.id}:${operation.controllerType}:${operation.top},${operation.bottom}`);
        }
      },
    });

    expect(caller.bodyWidthDelta).toBeUndefined();
    expect(caller.bodyHeightDelta).toBeUndefined();
    expect(destinationHelper.bodyWidth).toEqual({ front: 36, back: 18 });
    expect(destinationHelper.bodyWidthDelta).toEqual({ front: 36, back: 18 });
    expect(destinationHelper.edgeWidth).toEqual({ front: 36, back: 18 });
    expect(destinationHelper.bodyHeightDelta).toEqual({ top: 25, bottom: 4.5 });
    expect(destinationHelper.combatDepth).toMatchObject({ size: [39, 29], edge: [36, 25] });
    expect(committed).toEqual(["p2-helper-destination", "p2-helper-destination", "p2-helper-destination"]);
    expect(redirectedControllers).toEqual([
      "p2-helper-destination:Width",
      "p2-helper-destination:Height",
      "p2-helper-destination:Depth",
    ]);
    expect(redirectedOperations).toEqual([
      "p2-helper-destination:width:36,18",
      "p2-helper-destination:height:25,4.5",
      "p2-helper-destination:depth:36,25",
    ]);
  });

  it("runs local Helper OverrideClsn with dynamic values, snapshots it, and resets it per frame", () => {
    const override = compiledControllerIr(6000, "OverrideClsn", ["Time = 0"], {
      group: "var(0)",
      index: "var(1)",
      rect: "var(2), fvar(0), var(3), 4",
    });
    const actor = helper({
      vars: [2, -1, 8, -4],
      fvars: [-8.5],
      runtimeProgram: { states: [stateProgram(stateDef(6000), [override])] },
    });
    const operations: string[] = [];

    advanceRuntimeHelpers([actor], stage, {
      onOperation: (_helper, operation) => {
        if (operation.kind === "collision" && operation.controllerType === "overrideclsn") {
          operations.push(`${operation.group}:${operation.index}:${operation.rect.join(",")}`);
        }
      },
    });

    expect(actor.clsnOverrides).toEqual([
      { group: 2, index: -1, rect: { x1: -4, y1: -8.5, x2: 8, y2: 4 } },
    ]);
    expect(operations).toEqual(["2:-1:-4,-8.5,8,4"]);
    const [snapshot] = runtimeHelpersToSnapshots([actor], 6000);
    expect(snapshot?.clsn2).toEqual([{ x1: -4, y1: -8.5, x2: 8, y2: 4 }]);
    expect(snapshot?.runtime.clsnOverrides).toEqual(actor.clsnOverrides);
    expect(snapshot?.runtime.clsnOverrides).not.toBe(actor.clsnOverrides);

    advanceRuntimeHelpers([actor], stage);

    expect(actor.clsnOverrides).toBeUndefined();
  });

  it("uses local Helper OverrideClsn Size for P2BodyDist", () => {
    const override = compiledControllerIr(6000, "OverrideClsn", ["Time = 0"], {
      group: "Size",
      index: "-1",
      rect: "-4,-80,30,-20",
    });
    const probeX = compiledControllerIr(6000, "VarSet", ["Time = 0"], { v: "0", value: "P2BodyDist X" });
    const probeY = compiledControllerIr(6000, "VarSet", ["Time = 0"], { v: "1", value: "P2BodyDist Y" });
    const actor = helper({
      localCoord: [320, 240],
      runtimeProgram: { states: [stateProgram(stateDef(6000), [override, probeX, probeY])] },
    });
    const opponent = helper({
      serialId: "p2-helper-opponent",
      pos: { x: 128, y: 300 },
      facing: -1,
    });

    advanceRuntimeHelpers([actor], stage, {
      constants: { "size.ground.back": 8, "size.ground.front": 10, "size.height": 60 },
      opponentConstants: { "size.ground.back": 12, "size.ground.front": 20, "size.height": 120 },
      opponentId: "p2",
      opponentState: helperRuntimeState(opponent),
      opponentLocalCoord: [640, 480],
      p2BodyDistYUsesSizeBoxes: true,
    });

    expect(actor.clsnOverrides).toEqual([
      { group: 3, index: -1, rect: { x1: -4, y1: -80, x2: 30, y2: -20 } },
    ]);
    expect(actor.vars.slice(0, 2)).toEqual([24, 110]);
  });

  it("reports unsupported Helper OverrideClsn RedirectID without a live resource target", () => {
    const blocked = helper({
      runtimeProgram: {
        states: [stateProgram(stateDef(6000), [compiledControllerIr(6000, "OverrideClsn", [], {
          group: "Clsn2",
          index: "-1",
          rect: "-4,-8,8,4",
          redirectid: "57",
        })])],
      },
    });
    const unsupported: string[] = [];

    advanceRuntimeHelpers([blocked], stage, {
      onUnsupportedController: (_helper, controller) => unsupported.push(controller.type),
    });

    expect(blocked.clsnOverrides).toBeUndefined();
    expect(unsupported).toEqual(["OverrideClsn"]);
  });

  it("routes Helper OverrideClsn RedirectID through destination state with localcoord scale", () => {
    const override = compiledControllerIr(6000, "OverrideClsn", ["Time = 0"], {
      group: "var(0)",
      index: "var(1)",
      rect: "var(2), fvar(0), var(3), 4",
      redirectid: "57",
    });
    const destinationHelper = helper({ serialId: "p2-helper-destination", localCoord: [640, 480] });
    const destinationActor = runtimeHelperTargetActor(destinationHelper);
    const caller = helper({
      serialId: "p1-helper-caller",
      localCoord: [320, 240],
      vars: [2, -1, 8, -4],
      fvars: [-8.5],
      runtimeProgram: { states: [stateProgram(stateDef(6000), [override])] },
    });
    const committed: string[] = [];
    const redirectedControllers: string[] = [];
    const redirectedOperations: string[] = [];

    advanceRuntimeHelpers([caller], stage, {
      resolveResourceRedirect: (_helper, playerId) =>
        playerId === 57
          ? {
              actor: destinationActor,
              candidateTargets: [],
              commitActor: (target) => {
                committed.push(target.id);
                applyRuntimeStateToHelper(destinationHelper, target.runtime);
                syncRuntimeHelperTargetActor(destinationHelper, target);
              },
            }
          : undefined,
      onRedirectedController: (_helper, target, controller) => redirectedControllers.push(`${target.id}:${controller.type}`),
      onRedirectedOperation: (_helper, target, operation) => {
        if (operation.kind === "collision" && operation.controllerType === "overrideclsn") {
          redirectedOperations.push(`${target.id}:${operation.group}:${operation.index}:${operation.rect.join(",")}`);
        }
      },
    });

    expect(destinationActor.definition).toEqual({ localCoord: [640, 480] });
    expect(caller.clsnOverrides).toBeUndefined();
    expect(destinationHelper.clsnOverrides).toEqual([
      { group: 2, index: -1, rect: { x1: -8, y1: -17, x2: 16, y2: 8 } },
    ]);
    expect(committed).toEqual(["p2-helper-destination"]);
    expect(redirectedControllers).toEqual(["p2-helper-destination:OverrideClsn"]);
    expect(redirectedOperations).toEqual(["p2-helper-destination:2:-1:-8,-17,16,8"]);
  });

  it("uses a RedirectID Helper OverrideClsn Size on the primary P2BodyDist target", () => {
    const redirect = compiledControllerIr(6000, "OverrideClsn", ["Time = 0"], {
      group: "Size",
      index: "-1",
      rect: "-10,-50,4,0",
      redirectid: "57",
    });
    const probeX = compiledControllerIr(6000, "VarSet", ["Time = 0"], { v: "0", value: "P2BodyDist X" });
    const probeY = compiledControllerIr(6000, "VarSet", ["Time = 0"], { v: "1", value: "P2BodyDist Y" });
    const caller = helper({
      serialId: "p1-helper-caller",
      localCoord: [320, 240],
      runtimeProgram: { states: [stateProgram(stateDef(6000), [redirect, probeX, probeY])] },
    });
    const opponent = helper({
      serialId: "p2-helper-opponent",
      pos: { x: 128, y: 300 },
      facing: -1,
    });
    const destinationActor = {
      id: "p2",
      definition: { localCoord: [640, 480] as [number, number] },
      runtime: helperRuntimeState(opponent),
      targets: [],
      targetBindings: [],
    };

    advanceRuntimeHelpers([caller], stage, {
      constants: { "size.ground.back": 8, "size.ground.front": 10, "size.height": 60 },
      opponentConstants: { "size.ground.back": 12, "size.ground.front": 20, "size.height": 120 },
      opponentId: "p2",
      opponentState: destinationActor.runtime,
      opponentLocalCoord: [640, 480],
      p2BodyDistYUsesSizeBoxes: true,
      resolveResourceRedirect: (_helper, playerId) => playerId === 57
        ? { actor: destinationActor, candidateTargets: [destinationActor] }
        : undefined,
    });

    expect(destinationActor.runtime.clsnOverrides).toEqual([
      { group: 3, index: -1, rect: { x1: -20, y1: -100, x2: 8, y2: 0 } },
    ]);
    expect(caller.vars.slice(0, 2)).toEqual([50, 100]);
  });

  it("carries a source-scoped default HitFlag into Helper HitDef execution", () => {
    const hitDef = compiledControllerIr(6000, "HitDef", [], { damage: "20" });
    const imported = helper({
      runtimeProgram: { states: [stateProgram(stateDef(6000), [hitDef])] },
    });
    const legacy = helper({
      runtimeProgram: { states: [stateProgram(stateDef(6000), [hitDef])] },
    });

    advanceRuntimeHelpers([imported], stage, { defaultHitFlag: "MAF" });
    advanceRuntimeHelpers([legacy], stage);

    expect(imported.currentMove?.hitFlag).toBe("MAF");
    expect(legacy.currentMove?.hitFlag).toBeUndefined();
  });

  it("isolates keyctrl command history while keeping keyctrl-off commands closed", () => {
    const stateEntry = compiledControllerIr(-1, "VarAdd", ['command = "helper_tick"'], { v: "0", value: "10" });
    const runtimeProgram = {
      states: [stateProgram(stateDef(6000), [])],
      stateEntries: [stateEntry],
    };

    const local = createRuntimeHelper({
      serialId: "p1-helper-local-command",
      controller: controller({ id: "440", keyctrl: "1" }),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      runtimeProgram,
      commandDefinitions: [helperCommand],
      action,
      stateNo: 6000,
      animNo: 6100,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
    });
    const closed = createRuntimeHelper({
      serialId: "p1-helper-closed-command",
      controller: controller({ id: "441" }),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      runtimeProgram,
      commandDefinitions: [helperCommand],
      action,
      stateNo: 6000,
      animNo: 6100,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
    });

    expect(local.commandBuffer).toBeDefined();
    advanceRuntimeHelpers([local], stage, {
      runtimeProfile: "ikemen-go",
      commandInput: new Set(["x"]),
      runtimeTick: 1,
      commandActive: () => false,
    });
    advanceRuntimeHelpers([closed], stage, {
      commandInput: new Set(["x"]),
      runtimeTick: 1,
      commandActive: () => true,
    });

    expect(local.vars[0]).toBe(10);
    expect(closed.vars[0]).toBe(0);
  });

  it("routes Helper TargetPowerAdd RedirectID through a live root target memory", () => {
    const redirectedTarget = {
      id: "p2",
      runtime: helperRuntimeState(helper({ serialId: "p2", power: 35 })),
      targets: [{ actorId: "p1", targetId: 77, age: 0 }],
      targetBindings: [],
    };
    const rememberedTarget = {
      id: "p1",
      runtime: helperRuntimeState(helper({ serialId: "p1", power: 10 })),
      targets: [],
      targetBindings: [],
    };
    const controller = {
      ...controllerIr(6000, "TargetPowerAdd", { id: "77", value: "40", redirectid: "57" }),
      operation: {
        kind: "target",
        controllerType: "targetpoweradd",
        requestedId: 77,
        value: 40,
        redirectPlayerIdExpression: "57",
      },
    } satisfies ControllerIr;
    const redirectedControllers: string[] = [];
    const redirectedOperations: string[] = [];
    const actor = helper({
      runtimeProgram: { states: [stateProgram(stateDef(6000), [controller])] },
      stateNo: 6000,
      animNo: 6100,
    });

    advanceRuntimeHelpers([actor], stage, {
      resolveTargetRedirect: (_helper, playerId) =>
        playerId === 57 ? { actor: redirectedTarget, candidateTargets: [rememberedTarget] } : undefined,
      onRedirectedController: (_helper, target, item) => redirectedControllers.push(`${target.id}:${item.type}`),
      onRedirectedOperation: (_helper, target, operation) => {
        if (operation.kind === "target") redirectedOperations.push(`${target.id}:${operation.controllerType}`);
      },
    });

    expect(actor.targets).toEqual([]);
    expect(redirectedTarget.runtime.power).toBe(35);
    expect(rememberedTarget.runtime.power).toBe(50);
    expect(redirectedControllers).toEqual(["p2:TargetPowerAdd"]);
    expect(redirectedOperations).toEqual(["p2:targetpoweradd"]);
  });

  it("routes Helper TargetPowerAdd RedirectID through a live helper destination and commits helper state", () => {
    const destinationHelper = helper({
      serialId: "p2-helper-0",
      power: 35,
      targets: [{ actorId: "p1-helper-target", targetId: 77, age: 0 }],
    });
    const targetHelper = helper({ serialId: "p1-helper-target", power: 10 });
    const unselectedHelper = helper({ serialId: "p3-helper-unselected", power: 17 });
    const destinationActor = runtimeHelperTargetActor(destinationHelper);
    const targetActor = runtimeHelperTargetActor(targetHelper);
    const unselectedActor = runtimeHelperTargetActor(unselectedHelper);
    const unselectedBefore = JSON.stringify({
      life: unselectedHelper.life,
      power: unselectedHelper.power,
      pos: unselectedHelper.pos,
      targets: unselectedHelper.targets,
      targetBindings: unselectedHelper.targetBindings,
      bindToTarget: unselectedHelper.bindToTarget,
    });
    const committedIds: string[] = [];
    const controller = {
      ...controllerIr(6000, "TargetPowerAdd", { id: "77", value: "40", redirectid: "57" }),
      operation: {
        kind: "target",
        controllerType: "targetpoweradd",
        requestedId: 77,
        value: 40,
        redirectPlayerIdExpression: "57",
      },
    } satisfies ControllerIr;
    const actor = helper({
      serialId: "p1-helper-caller",
      runtimeProgram: { states: [stateProgram(stateDef(6000), [controller])] },
      stateNo: 6000,
      animNo: 6100,
    });
    const helperById = new Map([
      [destinationHelper.serialId, destinationHelper],
      [targetHelper.serialId, targetHelper],
      [unselectedHelper.serialId, unselectedHelper],
    ]);

    advanceRuntimeHelpers([actor], stage, {
      resolveTargetRedirect: (_helper, playerId) =>
        playerId === 57
          ? {
              actor: destinationActor,
              candidateTargets: [targetActor, unselectedActor],
              commitActor: (target) => {
                committedIds.push(target.id);
                const helper = helperById.get(target.id);
                if (!helper) return;
                applyRuntimeStateToHelper(helper, target.runtime);
                syncRuntimeHelperTargetActor(helper, target);
              },
            }
          : undefined,
    });

    expect(actor.targets).toEqual([]);
    expect(destinationHelper.power).toBe(35);
    expect(targetHelper.power).toBe(50);
    expect(committedIds).toEqual(["p1-helper-target"]);
    expect(JSON.stringify({
      life: unselectedHelper.life,
      power: unselectedHelper.power,
      pos: unselectedHelper.pos,
      targets: unselectedHelper.targets,
      targetBindings: unselectedHelper.targetBindings,
      bindToTarget: unselectedHelper.bindToTarget,
    })).toBe(unselectedBefore);
  });

  it("routes Helper BindToTarget RedirectID through a live helper destination and commits binding", () => {
    const destinationHelper = helper({
      serialId: "p2-helper-0",
      targets: [{ actorId: "p1-helper-target", targetId: 77, age: 0 }],
    });
    const targetHelper = helper({ serialId: "p1-helper-target" });
    const destinationActor = runtimeHelperTargetActor(destinationHelper);
    const targetActor = runtimeHelperTargetActor(targetHelper);
    const controller = {
      ...controllerIr(6000, "BindToTarget", { id: "77", pos: "20,-8,Mid", posz: "6", time: "4", redirectid: "57" }),
      operation: {
        kind: "bindtotarget",
        requestedId: 77,
        pos: [20, -8] as [number, number],
        posZ: 6,
        postype: "mid",
        time: 4,
        redirectPlayerIdExpression: "57",
      },
    } satisfies ControllerIr;
    const actor = helper({
      serialId: "p1-helper-caller",
      runtimeProgram: { states: [stateProgram(stateDef(6000), [controller])] },
      stateNo: 6000,
      animNo: 6100,
    });
    const helperById = new Map([
      [destinationHelper.serialId, destinationHelper],
      [targetHelper.serialId, targetHelper],
    ]);

    advanceRuntimeHelpers([actor], stage, {
      resolveTargetRedirect: (_helper, playerId) =>
        playerId === 57
          ? {
              actor: destinationActor,
              candidateTargets: [targetActor],
              commitActor: (target) => {
                const helper = helperById.get(target.id);
                if (!helper) return;
                applyRuntimeStateToHelper(helper, target.runtime);
                syncRuntimeHelperTargetActor(helper, target);
              },
            }
          : undefined,
    });

    expect(actor.bindToTarget).toBeUndefined();
    expect(destinationHelper.bindToTarget).toMatchObject({
      actorId: "p1-helper-target",
      targetId: 77,
      remaining: 4,
      offset: { x: 20, y: -8, z: 6 },
    });
    expect(targetHelper.bindToTarget).toBeUndefined();
  });

  it("routes Helper BindToTarget RedirectID through a live root target memory", () => {
    const redirectedTarget = {
      id: "p2",
      runtime: helperRuntimeState(helper({ serialId: "p2" })),
      targets: [{ actorId: "p1", targetId: 77, age: 0 }],
      targetBindings: [],
      bindToTarget: undefined,
    };
    const rememberedTarget = {
      id: "p1",
      runtime: helperRuntimeState(helper({ serialId: "p1" })),
      targets: [],
      targetBindings: [],
      bindToTarget: undefined,
    };
    const controller = {
      ...controllerIr(6000, "BindToTarget", { id: "77", pos: "20,-8,Mid", posz: "6", time: "4", redirectid: "57" }),
      operation: {
        kind: "bindtotarget",
        requestedId: 77,
        pos: [20, -8] as [number, number],
        posZ: 6,
        postype: "mid",
        time: 4,
        redirectPlayerIdExpression: "57",
      },
    } satisfies ControllerIr;
    const actor = helper({
      runtimeProgram: { states: [stateProgram(stateDef(6000), [controller])] },
      stateNo: 6000,
      animNo: 6100,
    });

    advanceRuntimeHelpers([actor], stage, {
      resolveTargetRedirect: (_helper, playerId) =>
        playerId === 57 ? { actor: redirectedTarget, candidateTargets: [rememberedTarget] } : undefined,
    });

    expect(actor.bindToTarget).toBeUndefined();
    expect(redirectedTarget.bindToTarget).toMatchObject({
      actorId: "p1",
      targetId: 77,
      remaining: 4,
      offset: { x: 20, y: -8, z: 6 },
    });
    expect(rememberedTarget.bindToTarget).toBeUndefined();
  });

  it("fails closed for an invalid Helper BindToTarget RedirectID", () => {
    const controller = {
      ...controllerIr(6000, "BindToTarget", { id: "77", pos: "20,-8,Foot", time: "4", redirectid: "999" }),
      operation: {
        kind: "bindtotarget",
        requestedId: 77,
        pos: [20, -8] as [number, number],
        postype: "foot",
        time: 4,
        redirectPlayerIdExpression: "999",
      },
    } satisfies ControllerIr;
    const actor = helper({
      runtimeProgram: { states: [stateProgram(stateDef(6000), [controller])] },
      stateNo: 6000,
      animNo: 6100,
    });
    const blocked: Array<number | "invalid"> = [];

    advanceRuntimeHelpers([actor], stage, {
      resolveTargetRedirect: () => undefined,
      onTargetRedirectBlocked: (_helper, _controller, playerId) => blocked.push(playerId),
    });

    expect(actor.bindToTarget).toBeUndefined();
    expect(blocked).toEqual([999]);
  });

  it("fails closed for an invalid Helper TargetState RedirectID", () => {
    const controller = {
      ...controllerIr(6000, "TargetState", { id: "77", value: "888", redirectid: "999" }),
      operation: {
        kind: "target",
        controllerType: "targetstate",
        requestedId: 77,
        stateNo: 888,
        redirectPlayerIdExpression: "999",
      },
    } satisfies ControllerIr;
    const actor = helper({
      runtimeProgram: { states: [stateProgram(stateDef(6000), [controller])] },
      stateNo: 6000,
      animNo: 6100,
    });
    const blocked: Array<number | "invalid"> = [];
    const entered: number[] = [];

    advanceRuntimeHelpers([actor], stage, {
      resolveTargetRedirect: () => undefined,
      onTargetRedirectBlocked: (_helper, _controller, playerId) => blocked.push(playerId),
      enterRedirectedTargetState: (_helper, _stateOwner, _target, stateId) => entered.push(stateId),
    });

    expect(entered).toEqual([]);
    expect(blocked).toEqual([999]);
  });

  it("keeps standby Helper CNS and projectile dispatch active while projecting Ctrl as false", () => {
    const standby = helper({
      ctrl: true,
      teamState: { disabled: false, standby: true, overKo: false, playerType: false },
      runtimeProgram: {
        states: [
          stateProgram(stateDef(6000), [
            controllerIr(6000, "VarAdd", { v: "0", value: "1" }),
            controllerIr(6000, "VarSet", { v: "1", value: "Ctrl" }),
            controllerIr(6000, "Projectile", { projid: "71", projanim: "6100" }),
          ]),
        ],
      },
    });
    let projectileSpawns = 0;

    advanceRuntimeHelpers([standby], stage, {
      onSpawnProjectile: () => {
        projectileSpawns += 1;
        return true;
      },
    });

    expect(standby.vars.slice(0, 2)).toEqual([1, 0]);
    expect(standby.ctrl).toBe(true);
    expect(standby.stateTime).toBe(1);
    expect(projectileSpawns).toBe(1);
    expect(runtimeHelpersToSnapshots([standby], 100)[0]?.runtime.teamState?.standby).toBe(true);
    expect(runtimeHelperCanDirectlyInteract(standby)).toBe(false);

    standby.teamState!.standby = false;
    advanceRuntimeHelpers([standby], stage);

    expect(standby.vars.slice(0, 2)).toEqual([2, 1]);
    expect(standby.ctrl).toBe(true);
    expect(runtimeHelperCanDirectlyInteract(standby)).toBe(true);
    standby.clsnProxy = true;
    expect(runtimeHelperCanDirectlyInteract(standby)).toBe(false);
    standby.clsnProxy = false;
    expect(runtimeHelperCanDirectlyInteract(standby)).toBe(true);
    standby.teamState!.disabled = true;
    expect(runtimeHelperCanDirectlyInteract(standby)).toBe(false);
    standby.teamState!.disabled = false;
    standby.destroyed = true;
    expect(runtimeHelperCanDirectlyInteract(standby)).toBe(false);
  });

  it("resolves Helper-owned deferred self Tag in the Helper context before the match hook", () => {
    const tagOut = teamStandbyController(6000, "TagOut", {
      standby: true,
      self: false,
      selfExpression: "var(0)",
    });
    const active = helper({
      vars: [2],
      teamState: { disabled: false, standby: false, overKo: false, playerType: false },
      runtimeProgram: { states: [stateProgram(stateDef(6000), [tagOut])] },
    });
    const calls: string[] = [];

    advanceRuntimeHelpers([active], stage, {
      onTeamStandby: (current, operation) => {
        expect(current).toBe(active);
        expect(operation).toEqual({
          kind: "team-standby",
          controllerType: "tagout",
          standby: true,
          self: true,
        });
        current.teamState = { ...current.teamState!, standby: operation.standby };
        calls.push("tag");
        return operation;
      },
      onController: (_helper, controller) => calls.push(`controller:${controller.normalizedType}`),
      onOperation: (_helper, operation) => calls.push(`operation:${operation.kind}`),
    });

    expect(active.teamState?.standby).toBe(true);
    expect(calls).toEqual(["tag", "controller:tagout", "operation:team-standby"]);
  });

  it.each([
    ["aggregate", { partnerOrdinal: 0 }, false, false],
    ["disabled", {}, true, false],
    ["destroyed", {}, false, true],
  ] as const)("rejects %s Helper-owned self Tag before the match hook", (_case, extra, disabled, destroyed) => {
    const tagOut = teamStandbyController(6000, "TagOut", { standby: true, self: true, ...extra });
    const active = helper({
      destroyed,
      teamState: { disabled, standby: false, overKo: false, playerType: false },
      runtimeProgram: { states: [stateProgram(stateDef(6000), [tagOut])] },
    });
    const calls: string[] = [];

    advanceRuntimeHelpers([active], stage, {
      onTeamStandby: () => {
        calls.push("tag");
        return tagOut.operation as TeamStandbyControllerOp;
      },
      onUnsupportedController: (_helper, controller) => calls.push(`unsupported:${controller.normalizedType}`),
    });

    expect(active.teamState?.standby).toBe(false);
    expect(calls).toEqual(["unsupported:tagout"]);
  });

  it("creates a bounded visual helper from controller params", () => {
    const created = createRuntimeHelper({
      serialId: "p1-helper-1",
      controller: controller({
        id: "440",
        name: '"spark helper"',
        facing: "-1",
        velset: "2,-1",
        "size.xscale": "1.5",
        "size.yscale": "0.75",
        ignorehitpause: "1",
        pausemovetime: "2",
        supermovetime: "3",
        removetime: "9999",
        sprpriority: "25",
      }),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      stateNo: 6000,
      animNo: 6100,
      pos: { x: 24, y: -12 },
      fallbackFacing: 1,
    });

    expect(created).toMatchObject({
      serialId: "p1-helper-1",
      helperId: 440,
      helperType: 1,
      name: "spark helper",
      actorKind: "helper",
      ownerId: "p1",
      rootId: "p1",
      parentId: "p1",
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      stateNo: 6000,
      animNo: 6100,
      pos: { x: 24, y: -12 },
      vel: { x: 2, y: -1 },
      scale: { x: 1.5, y: 0.75 },
      ignoreHitPause: true,
      pauseMoveTime: 2,
      superMoveTime: 3,
      facing: -1,
      removeTime: 1200,
      spritePriority: 10,
    });
  });

  it("seeds initial standby and StateDef control before the first Helper tick", () => {
    const omittedControl = createRuntimeHelper({
      serialId: "p1-helper-standby",
      controller: controller({ id: "440" }),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      runtimeProgram: { states: [stateProgram(stateDef(6000))] },
      action,
      stateNo: 6000,
      animNo: 6100,
      initialStandby: true,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
    });
    const authoredNoControl = createRuntimeHelper({
      serialId: "p1-helper-no-control",
      controller: controller({ id: "441" }),
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      runtimeProgram: { states: [stateProgram(stateDef(6000, { ctrl: 0 }))] },
      action,
      stateNo: 6000,
      animNo: 6100,
      pos: { x: 0, y: 0 },
      fallbackFacing: 1,
    });

    expect(omittedControl).toMatchObject({
      ctrl: true,
      teamState: { standby: true },
    });
    expect(runtimeHelperCanDirectlyInteract(omittedControl)).toBe(false);
    expect(authoredNoControl).toMatchObject({
      ctrl: false,
      teamState: { standby: false },
    });
  });

  it("prefers typed helper operations over raw controller params", () => {
    const operation: HelperControllerOp = {
      kind: "helper",
      helperId: 91,
      name: "Typed Buddy",
      stateNo: 6101,
      animNo: 6102,
      pos: [12, -4],
      velocity: [3, -2],
      scale: [2, 0.5],
      ignoreHitPause: true,
      pauseMoveTime: 4,
      superMoveTime: 5,
      postype: "p1",
      facing: 1,
      removeTime: 25,
      spritePriority: 6,
    };
    const created = createRuntimeHelper({
      serialId: "p1-helper-typed",
      controller: controller({
        id: "440",
        name: '"raw buddy"',
        facing: "-1",
        removetime: "9999",
        sprpriority: "-5",
      }),
      operation,
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "kfm",
      spriteOwnerLabel: "Kung Fu Man",
      action,
      stateNo: operation.stateNo,
      animNo: operation.animNo ?? 6100,
      pos: { x: 12, y: -4 },
      fallbackFacing: -1,
    });

    expect(created).toMatchObject({
      helperId: 91,
      name: "Typed Buddy",
      stateNo: 6101,
      animNo: 6102,
      vel: { x: 3, y: -2 },
      scale: { x: 2, y: 0.5 },
      ignoreHitPause: true,
      pauseMoveTime: 4,
      superMoveTime: 5,
      facing: 1,
      removeTime: 25,
      spritePriority: 6,
    });
  });

  it("advances animation frames and removes expired or out-of-bounds helpers", () => {
    const active = helper({ serialId: "active", removeTime: 8 });
    const expired = helper({ serialId: "expired", age: 4, removeTime: 5 });
    const outside = helper({ serialId: "outside", pos: { x: 999, y: 0 } });

    const remaining = advanceRuntimeHelpers([active, expired, outside], stage);
    expect(remaining.map((entry) => entry.serialId)).toEqual(["active"]);
    expect(active.age).toBe(1);
    expect(active.pos).toEqual({ x: 0, y: 0 });
    expect(active.frameIndex).toBe(0);

    active.vel = { x: 2, y: -1 };
    advanceRuntimeHelpers([active], stage);
    expect(active.pos).toEqual({ x: 2, y: -1 });
    expect(active.frameIndex).toBe(1);

    advanceRuntimeHelpers([active], stage);
    expect(active.frameIndex).toBe(0);
  });

  it("honors bounded helper pause movement flags", () => {
    const frozen = helper({ serialId: "frozen", vel: { x: 3, y: 0 } });
    const hitPauseImmune = helper({ serialId: "hitpause-immune", vel: { x: 4, y: 0 }, ignoreHitPause: true });
    const pauseMover = helper({ serialId: "pause-mover", vel: { x: 5, y: 0 }, pauseMoveTime: 2 });
    const superMover = helper({ serialId: "super-mover", vel: { x: 6, y: 0 }, superMoveTime: 2 });

    advanceRuntimeHelpers([frozen, hitPauseImmune, pauseMover, superMover], stage, { pauseKind: "hitpause" });
    expect(frozen).toMatchObject({ age: 0, pos: { x: 0, y: 0 } });
    expect(hitPauseImmune).toMatchObject({ age: 1, pos: { x: 4, y: 0 } });
    expect(pauseMover).toMatchObject({ age: 0, pos: { x: 0, y: 0 }, pauseMoveTime: 2 });

    advanceRuntimeHelpers([frozen, pauseMover, superMover], stage, { pauseKind: "Pause" });
    advanceRuntimeHelpers([frozen, pauseMover, superMover], stage, { pauseKind: "Pause" });
    advanceRuntimeHelpers([frozen, pauseMover, superMover], stage, { pauseKind: "Pause" });
    expect(pauseMover).toMatchObject({ age: 2, pos: { x: 10, y: 0 }, pauseMoveTime: 0 });
    expect(superMover).toMatchObject({ age: 0, pos: { x: 0, y: 0 }, superMoveTime: 2 });

    advanceRuntimeHelpers([frozen, superMover], stage, { pauseKind: "SuperPause" });
    advanceRuntimeHelpers([frozen, superMover], stage, { pauseKind: "SuperPause" });
    advanceRuntimeHelpers([frozen, superMover], stage, { pauseKind: "SuperPause" });
    expect(superMover).toMatchObject({ age: 2, pos: { x: 12, y: 0 }, superMoveTime: 0 });
    expect(frozen).toMatchObject({ age: 0, pos: { x: 0, y: 0 } });

    const localHitPause = helper({ serialId: "local-hitpause", hitPause: 2, vel: { x: 7, y: 0 } });
    advanceRuntimeHelpers([localHitPause], stage);
    expect(localHitPause).toMatchObject({ hitPause: 1, age: 0, pos: { x: 0, y: 0 } });
    advanceRuntimeHelpers([localHitPause], stage);
    expect(localHitPause).toMatchObject({ hitPause: 0, age: 0, pos: { x: 0, y: 0 } });
    advanceRuntimeHelpers([localHitPause], stage);
    expect(localHitPause).toMatchObject({ hitPause: 0, age: 1, pos: { x: 7, y: 0 } });
  });

  it("preserves active helper HitDef moves when destination state declares hitdefpersist", () => {
    const active = helper({
      stateNo: 1200,
      currentMove: activeMove(),
      currentMoveLabel: "HitDef",
      moveTick: 3,
      hasHit: false,
      firedHitDefs: new Set(["1200:1:0"]),
      runtimeProgram: {
        states: [
          stateProgram(stateDef(1200, { moveType: "A" }), [controllerIr(1200, "ChangeState", { value: "1224" })]),
          stateProgram(stateDef(1224, { moveType: "A", hitDefPersist: true })),
        ],
      },
    });

    advanceRuntimeHelpers([active], stage);

    expect(active.stateNo).toBe(1224);
    expect(active.currentMove).toMatchObject({ actionId: 1200, damage: 33 });
    expect(active.currentMoveLabel).toBe("HitDef");
    expect(active.moveTick).toBe(4);
    expect(active.firedHitDefs.size).toBe(0);
    expect(active.moveType).toBe("A");
  });

  it("resolves helper-local dynamic HitDef sound values into the active move", () => {
    const active = helper({
      vars: [5, 7],
      runtimeProgram: {
        states: [
          stateProgram(stateDef(6000, { moveType: "A" }), [
            controllerIr(6000, "HitDef", {
              attr: "S,NA",
              damage: "20",
              hitsound: "Svar(0),var(1)",
              guardsound: "S6,var(1)",
            }),
          ]),
        ],
      },
    });

    advanceRuntimeHelpers([active], stage);

    expect(active.currentMove).toMatchObject({
      hitSound: "Svar(0),var(1)",
      hitSoundValue: { rawPrefix: "S", group: 5, index: 7 },
      guardSound: "S6,var(1)",
      guardSoundValue: { rawPrefix: "S", group: 6, index: 7 },
    });
  });

  it("resolves helper-local dynamic HitDef NoChainID lists into the active move", () => {
    const active = helper({
      vars: [3],
      runtimeProgram: {
        states: [
          stateProgram(stateDef(6000, { moveType: "A" }), [
            controllerIr(6000, "HitDef", {
              attr: "S,NA",
              damage: "20",
              nochainid: "var(0) + 40,var(0) + 41",
            }),
          ]),
        ],
      },
    });

    advanceRuntimeHelpers([active], stage);

    expect(active.currentMove?.noChainIds).toEqual([43, 44]);
  });

  it("resolves helper-local dynamic HitDef down.hittime in the helper caller context", () => {
    const active = helper({
      vars: [17.9],
      currentMove: activeMove({ downHitTime: 99 }),
      runtimeProgram: {
        states: [
          stateProgram(stateDef(6000, { moveType: "A" }), [
            controllerIr(6000, "HitDef", {
              attr: "S,NA",
              damage: "20",
              "down.hittime": "var(0)",
            }),
          ]),
        ],
      },
    });

    advanceRuntimeHelpers([active], stage);

    expect(active.currentMove?.downHitTime).toBe(17);
  });

  it("resolves helper-local dynamic HitDef unhittabletime and ticks its own receiver timer", () => {
    const active = helper({
      vars: [3, 7],
      unhittableTime: 2,
      runtimeProgram: {
        states: [
          stateProgram(stateDef(6000, { moveType: "A" }), [
            controllerIr(6000, "HitDef", {
              attr: "S,NA",
              damage: "var(0) * 10,var(1)",
              pausetime: "var(0) + 1,var(1) + 2",
              "guard.pausetime": "var(0),var(1)",
              id: "var(0) + 40",
              chainid: "var(1) + 36",
              unhittabletime: "var(0) + 1,var(1) + 2",
              "stand.friction": "var(0) * 0.1",
              "crouch.friction": "var(1) * 0.05",
              sparkscale: "var(0) * 0.5",
              "guard.sparkscale": "-var(1) * 0.25,var(0) * 0.1",
              p1facing: "-var(0)",
              p1getp2facing: "var(1) - 6",
              p2facing: "var(0) - 4",
              getpower: "var(0) * 10,var(1) * 5",
              givepower: "var(0) * 8,var(1) * 4",
              "palfx.time": "var(0) + 2",
              "palfx.add": "var(0),-var(1),2",
              "palfx.mul": "200,var(1) * 20,240",
              "palfx.color": "var(1) * 30",
              "palfx.invertall": "var(0) - 3",
              "envshake.time": "var(1) + 4",
              "envshake.freq": "var(0) * 20",
              "envshake.ampl": "-var(1)",
              "envshake.phase": "var(0) * 15",
              "envshake.mul": "1.25",
              "envshake.dir": "-30",
              "fall.envshake.time": "var(1) + 8",
              "fall.envshake.freq": "var(0) * 24",
              "fall.envshake.ampl": "-var(1) - 2",
              "fall.envshake.phase": "var(0) * 10",
              "fall.envshake.mul": ".75",
              "fall.envshake.dir": "67.5",
              "fall.damage": "var(1) * 3",
              "fall.xvelocity": "var(0) + .5",
              "fall.yvelocity": "-var(1)",
              "fall.zvelocity": "var(0) - .25",
              fall: "(var(0) - 2) / 2.0",
              "air.fall": "var(1) - 7",
              "fall.kill": "var(0) - 3",
              "fall.recover": "var(0) - 3",
              "fall.recovertime": "var(1) + 12",
              "down.recover": "var(0) - 2",
              "down.recovertime": "var(1) + 38",
              "down.bounce": "var(0) - 2",
              "air.juggle": "var(1) - 4",
              numhits: "var(0) + 2",
              sprpriority: "var(0) + 3",
              p2sprpriority: "-var(1)",
              priority: "var(1) + 2, Dodge",
              forcenofall: "(var(0) - 2) / 2.0",
              forcestand: "(var(0) - 2) / 2.0",
              forcecrouch: "var(1) - 7",
              kill: "var(0) - 3",
              "guard.kill": "var(0) - 2",
              hitonce: "var(1) - 7",
            }),
          ]),
        ],
      },
    });

    advanceRuntimeHelpers([active], stage, { runtimeProfile: "ikemen-go" });

    expect(active.currentMove?.unhittableTime).toEqual([4, 9]);
    expect(active.currentMove?.hitVars?.standFriction).toBeCloseTo(0.3);
    expect(active.currentMove?.hitVars?.crouchFriction).toBeCloseTo(0.35);
    expect(active.currentMove?.hitSparkScale).toEqual([1.5, 1]);
    expect(active.currentMove?.guardSparkScale?.[0]).toBeCloseTo(-1.75);
    expect(active.currentMove?.guardSparkScale?.[1]).toBeCloseTo(0.3);
    expect(active.currentMove).toMatchObject({
      damage: 30,
      guardDamage: 7,
      hitPause: 4,
      hitShakeTime: 9,
      guardPause: 3,
      guardShakeTime: 7,
      p1Facing: -3,
      p1GetP2Facing: 1,
      p2Facing: -1,
      targetId: 43,
      attackerHitPower: 30,
      attackerGuardPower: 35,
      hitPower: 24,
      guardPower: 28,
      airJuggle: 3,
      p1SpritePriority: 6,
      p2SpritePriority: -7,
      priority: 9,
      priorityType: "dodge",
      forceNoFall: true,
      forceStand: true,
      forceCrouch: false,
      downBounce: true,
      kill: false,
      guardKill: true,
      hitOnce: false,
      paletteFx: {
        time: 5,
        add: [3, -7, 2],
        mul: [200, 140, 240],
        color: 210,
        invert: false,
      },
      envShake: {
        time: 11,
        freq: 60,
        ampl: -7,
        phase: 45,
        mul: 1.25,
        dir: -30,
      },
      fall: {
        enabled: true,
        airFall: false,
        kill: false,
        damage: 21,
        velocity: { x: 3.5, y: -7, z: 2.75 },
        recover: false,
        recoverTime: 19,
        downRecover: true,
        downRecoverTime: 45,
        envShake: {
          time: 15,
          freq: 72,
          ampl: -9,
          phase: 30,
          mul: 0.75,
          dir: 67.5,
        },
      },
    });
    expect(active.currentMove?.hitVars?.hitCount).toBe(5);
    expect(active.currentMove?.hitVars).toMatchObject({ hitId: 43, chainId: 43 });
    expect(active.juggle).toBe(3);
    expect(active.juggleOrigin).toBe("hitdef");
    expect(active.unhittableTime).toBe(1);
    advanceRuntimeHelpers([active], stage, { runtimeProfile: "ikemen-go" });
    expect(active.unhittableTime).toBe(0);
  });

  it("defaults fresh helper HitDef omitted damage to zero without losing its target id", () => {
    const active = helper({
      currentMove: activeMove({
        push: 9,
        hitVelocityY: -7,
        hitVelocityZ: 5,
        hitVelocities: { ground: { x: 9, y: -7, z: 5 } },
      }),
      runtimeProgram: {
        states: [
          stateProgram(stateDef(6000, { moveType: "A" }), [
            controllerIr(6000, "HitDef", { attr: "S,NA", id: "77" }),
          ]),
        ],
      },
    });

    advanceRuntimeHelpers([active], stage);

    expect(active.currentMove).toMatchObject({
      damage: 0,
      guardDamage: 0,
      targetId: 77,
      push: 0,
      hitVelocityY: 0,
      hitVelocityZ: 0,
      hitVelocities: { ground: { x: 0, y: 0, z: 0 } },
    });
  });

  it("resolves Helper-owned fresh HitDef guardpoints in the helper caller context", () => {
    const active = helper({
      vars: [14.9],
      currentMove: activeMove({ guardPoints: 37 }),
      runtimeProgram: {
        states: [
          stateProgram(stateDef(6000, { moveType: "A" }), [
            compiledControllerIr(6000, "HitDef", [], {
              attr: "S,NA",
              guardpoints: "var(0)",
            }),
          ]),
        ],
      },
    });

    advanceRuntimeHelpers([active], stage);

    expect(active.currentMove?.guardPoints).toBe(14);
  });

  it("resolves Helper-owned fresh HitDef snap X/Y/Z in the helper caller context", () => {
    const active = helper({
      vars: [7, -5, 11, 4],
      currentMove: activeMove({ hitVars: { hitOffset: { x: 99, y: -99 } } }),
      runtimeProgram: {
        states: [
          stateProgram(stateDef(6000, { moveType: "A" }), [
            compiledControllerIr(6000, "HitDef", [], {
              attr: "S,NA",
              damage: "20",
              snap: "var(0),var(1),var(2),var(3)",
            }),
          ]),
        ],
      },
    });

    advanceRuntimeHelpers([active], stage);

    expect(active.currentMove?.hitVars).toMatchObject({ hitOffset: { x: 7, y: -5, z: 11 }, snapTime: 4 });
  });

  it("applies Helper-owned ModifyHitDef down.velocity in caller context and preserves omitted components", () => {
    const active = helper({
      vars: [3, -5, 7.25],
      runtimeProgram: {
        states: [
          stateProgram(stateDef(6000, { moveType: "A" }), [
            controllerIr(6000, "HitDef", {
              attr: "S,NA",
              damage: "20",
              "down.velocity": "-2,-8,2",
            }),
            compiledControllerIr(6000, "ModifyHitDef", [], {
              redirectid: "0",
              "down.velocity": "var(0),var(1),var(2)",
            }),
            compiledControllerIr(6000, "ModifyHitDef", [], {
              redirectid: "0",
              "down.velocity": "-11",
            }),
            compiledControllerIr(6000, "ModifyHitDef", [], { redirectid: "0", damage: "21" }),
          ]),
        ],
      },
    });
    const operations: string[] = [];

    advanceRuntimeHelpers([active], stage, {
      onOperation: (_helper, operation) => operations.push(operation.kind),
    });

    expect(active.currentMove).toMatchObject({
      downVelocityX: -11,
      downVelocityY: -5,
      downVelocityZ: 7.25,
      damage: 21,
      hitVelocities: { down: { x: -11, y: -5, z: 7.25 } },
    });
    expect(operations).toEqual(["modifyhitdef", "modifyhitdef", "modifyhitdef"]);
  });

  it("applies Helper-owned HitDef and ModifyHitDef attack.depth in caller context", () => {
    const active = helper({
      vars: [4.5, 8.25],
      runtimeProgram: {
        states: [
          stateProgram(stateDef(6000, { moveType: "A" }), [
            controllerIr(6000, "HitDef", {
              attr: "S,NA",
              damage: "20",
              "attack.depth": "var(0),var(1)",
            }),
            compiledControllerIr(6000, "ModifyHitDef", [], {
              redirectid: "0",
              "attack.depth": "var(0) + 2",
            }),
            compiledControllerIr(6000, "ModifyHitDef", [], { redirectid: "0", damage: "21" }),
          ]),
        ],
      },
    });

    advanceRuntimeHelpers([active], stage);

    expect(active.currentMove).toMatchObject({
      attackDepth: [6.5, 8.25],
      damage: 21,
    });
  });

  it("applies Helper-owned ModifyHitDef pause pairs in caller context and preserves omitted siblings", () => {
    const active = helper({
      vars: [12.9, 13.8, 14.7],
      runtimeProgram: {
        states: [
          stateProgram(stateDef(6000, { moveType: "A" }), [
            controllerIr(6000, "HitDef", {
              attr: "S,NA",
              damage: "20",
              pausetime: "21,22",
              "guard.pausetime": "31,32",
            }),
            compiledControllerIr(6000, "ModifyHitDef", [], {
              redirectid: "0",
              pausetime: "var(0),var(1)",
              "guard.pausetime": "var(2)",
            }),
            compiledControllerIr(6000, "ModifyHitDef", [], {
              redirectid: "0",
              pausetime: "var(0)",
            }),
          ]),
        ],
      },
    });

    advanceRuntimeHelpers([active], stage);

    expect(active.currentMove).toMatchObject({
      hitPause: 12,
      hitShakeTime: 13,
      guardPause: 14,
      guardShakeTime: 32,
    });
  });

  it("applies Helper-owned ModifyHitDef guardpoints in caller context and preserves omission", () => {
    const active = helper({
      vars: [15.8],
      runtimeProgram: {
        states: [
          stateProgram(stateDef(6000, { moveType: "A" }), [
            controllerIr(6000, "HitDef", {
              attr: "S,NA",
              damage: "20",
              guardpoints: "7",
            }),
            compiledControllerIr(6000, "ModifyHitDef", [], {
              redirectid: "0",
              guardpoints: "var(0)",
            }),
            compiledControllerIr(6000, "ModifyHitDef", [], { redirectid: "0", damage: "21" }),
          ]),
        ],
      },
    });

    advanceRuntimeHelpers([active], stage);

    expect(active.currentMove).toMatchObject({ guardPoints: 15 });
  });

  it("applies Helper-owned ModifyHitDef snap in caller context and preserves omitted axes", () => {
    const active = helper({
      vars: [24.5],
      fvars: [-72.25],
      currentMove: activeMove({ hitVars: { hitOffset: { x: 10, y: -40, z: 3 } } }),
      runtimeProgram: {
        states: [
          stateProgram(stateDef(6000, { moveType: "A" }), [
            compiledControllerIr(6000, "HitDef", [], {
              attr: "S,NA",
              damage: "20",
              snap: "10,-40",
            }),
            compiledControllerIr(6000, "ModifyHitDef", [], {
              redirectid: "0",
              snap: "var(0)",
            }),
            compiledControllerIr(6000, "ModifyHitDef", [], {
              redirectid: "0",
              snap: "var(0),fvar(0)",
            }),
            compiledControllerIr(6000, "ModifyHitDef", [], { redirectid: "0", damage: "21" }),
          ]),
        ],
      },
    });

    advanceRuntimeHelpers([active], stage);

    expect(active.currentMove).toMatchObject({
      damage: 21,
      hitVars: { hitOffset: { x: 24.5, y: -72.25 } },
    });
  });

  it("applies Helper-owned ModifyHitDef sparkxy in caller context and preserves omitted axes", () => {
    const active = helper({
      vars: [24.5],
      fvars: [-72.25],
      runtimeProgram: {
        states: [
          stateProgram(stateDef(6000, { moveType: "A" }), [
            controllerIr(6000, "HitDef", {
              attr: "S,NA",
              damage: "20",
              sparkno: "S7001",
              sparkxy: "10,-40",
            }),
            compiledControllerIr(6000, "ModifyHitDef", [], {
              redirectid: "0",
              sparkxy: "var(0)",
            }),
            compiledControllerIr(6000, "ModifyHitDef", [], {
              redirectid: "0",
              sparkxy: "var(0),fvar(0)",
            }),
          ]),
        ],
      },
    });

    advanceRuntimeHelpers([active], stage);

    expect(active.currentMove?.sparkXy).toEqual([24.5, -72.25]);
  });

  it("applies Helper-owned ModifyHitDef sparkangle in caller context", () => {
    const active = helper({
      vars: [31.25],
      runtimeProgram: {
        states: [
          stateProgram(stateDef(6000, { moveType: "A" }), [
            controllerIr(6000, "HitDef", {
              attr: "S,NA",
              damage: "20",
              sparkno: "S7001",
              sparkangle: "-5",
              "guard.sparkno": "S7000",
              "guard.sparkangle": "-7",
            }),
            compiledControllerIr(6000, "ModifyHitDef", [], {
              redirectid: "0",
              sparkangle: "var(0)",
              "guard.sparkangle": "var(0) + 2",
            }),
          ]),
        ],
      },
    });

    advanceRuntimeHelpers([active], stage);

    expect(active.currentMove?.hitSparkAngle).toBe(31.25);
    expect(active.currentMove?.guardSparkAngle).toBe(33.25);
  });

  it("applies Helper-owned ModifyHitDef guard.sparkno in caller context and preserves omission", () => {
    const active = helper({
      vars: [19],
      runtimeProgram: {
        states: [
          stateProgram(stateDef(6000, { moveType: "A" }), [
            controllerIr(6000, "HitDef", {
              attr: "S,NA",
              damage: "20",
              "guard.sparkno": "S7000",
              "guard.sparkangle": "-7",
            }),
            compiledControllerIr(6000, "ModifyHitDef", [], {
              redirectid: "0",
              "guard.sparkno": "Fvar(0)",
            }),
            compiledControllerIr(6000, "ModifyHitDef", [], { redirectid: "0", forcenofall: "1" }),
          ]),
        ],
      },
    });

    advanceRuntimeHelpers([active], stage);

    expect(active.currentMove?.guardSpark).toBe("F19");
    expect(active.currentMove?.guardSparkAngle).toBe(-7);
  });

  it("applies Helper-owned ModifyHitDef guardsound in caller context and preserves unresolved values", () => {
    const active = helper({
      vars: [9, 4],
      runtimeProgram: {
        states: [
          stateProgram(stateDef(6000, { moveType: "A" }), [
            controllerIr(6000, "HitDef", {
              attr: "S,NA",
              damage: "20",
              guardsound: "S6,0",
            }),
            compiledControllerIr(6000, "ModifyHitDef", [], {
              redirectid: "0",
              guardsound: "Fvar(0),var(1)",
              "guardsound.channel": "var(0)",
            }),
            compiledControllerIr(6000, "ModifyHitDef", [], { redirectid: "0" }),
          ]),
        ],
      },
    });

    advanceRuntimeHelpers([active], stage);

    expect(active.currentMove).toMatchObject({
      guardSound: "Fvar(0),var(1)",
      guardSoundValue: { rawPrefix: "F", group: 9, index: 4 },
      guardSoundChannel: 9,
    });
  });

  it("applies Helper-owned ModifyHitDef hitsound in caller context and preserves unresolved values", () => {
    const active = helper({
      vars: [9, 4],
      runtimeProgram: {
        states: [
          stateProgram(stateDef(6000, { moveType: "A" }), [
            controllerIr(6000, "HitDef", {
              attr: "S,NA",
              damage: "20",
              hitsound: "S5,0",
            }),
            compiledControllerIr(6000, "ModifyHitDef", [], {
              redirectid: "0",
              hitsound: "Fvar(0),var(1)",
              "hitsound.channel": "var(0)",
            }),
            compiledControllerIr(6000, "ModifyHitDef", [], { redirectid: "0" }),
          ]),
        ],
      },
    });

    advanceRuntimeHelpers([active], stage);

    expect(active.currentMove).toMatchObject({
      hitSound: "Fvar(0),var(1)",
      hitSoundValue: { rawPrefix: "F", group: 9, index: 4 },
      hitSoundChannel: 9,
    });
  });

  it("applies Helper-owned ModifyHitDef down.hittime in caller context", () => {
    const active = helper({
      vars: [17.9],
      runtimeProgram: {
        states: [
          stateProgram(stateDef(6000, { moveType: "A" }), [
            controllerIr(6000, "HitDef", {
              attr: "S,NA",
              damage: "20",
              "down.velocity": "0,0",
              "down.hittime": "8",
            }),
            compiledControllerIr(6000, "ModifyHitDef", [], {
              redirectid: "0",
              "down.hittime": "var(0)",
            }),
          ]),
        ],
      },
    });

    advanceRuntimeHelpers([active], stage);

    expect(active.currentMove).toMatchObject({
      downHitTime: 17,
      downVelocityY: 0,
    });
  });

  it("applies Helper-owned ModifyHitDef air.velocity in caller context and preserves omitted components", () => {
    const active = helper({
      vars: [-7, -5],
      runtimeProgram: {
        states: [
          stateProgram(stateDef(6000, { moveType: "A" }), [
            controllerIr(6000, "HitDef", {
              attr: "S,NA",
              damage: "20",
              "air.velocity": "-2,-3,4",
            }),
            compiledControllerIr(6000, "ModifyHitDef", [], {
              redirectid: "0",
              "air.velocity": "var(0),var(1)",
            }),
            compiledControllerIr(6000, "ModifyHitDef", [], {
              redirectid: "0",
              "air.velocity": "-11",
            }),
            compiledControllerIr(6000, "ModifyHitDef", [], { redirectid: "0", damage: "20" }),
          ]),
        ],
      },
    });
    const operations: string[] = [];

    advanceRuntimeHelpers([active], stage, {
      onOperation: (_helper, operation) => operations.push(operation.kind),
    });

    expect(active.currentMove).toMatchObject({
      airVelocityZ: 4,
      hitVelocities: { air: { x: -11, y: -5, z: 4 } },
    });
    expect(operations).toEqual(["modifyhitdef", "modifyhitdef", "modifyhitdef"]);
  });

  it("applies Helper-owned ModifyHitDef airguard.velocity in caller context and preserves omitted components", () => {
    const active = helper({
      vars: [-7, -5, 6],
      runtimeProgram: {
        states: [
          stateProgram(stateDef(6000, { moveType: "A" }), [
            controllerIr(6000, "HitDef", {
              attr: "S,NA",
              damage: "20",
              "airguard.velocity": "-2,-3,4",
            }),
            compiledControllerIr(6000, "ModifyHitDef", [], {
              redirectid: "0",
              "airguard.velocity": "var(0),var(1),var(2)",
            }),
            compiledControllerIr(6000, "ModifyHitDef", [], {
              redirectid: "0",
              "airguard.velocity": "-11",
            }),
            compiledControllerIr(6000, "ModifyHitDef", [], { redirectid: "0", damage: "20" }),
          ]),
        ],
      },
    });
    const operations: string[] = [];

    advanceRuntimeHelpers([active], stage, {
      onOperation: (_helper, operation) => operations.push(operation.kind),
    });

    expect(active.currentMove).toMatchObject({
      airGuardVelocityZ: 6,
      hitVelocities: { airGuard: { x: -11, y: -5, z: 6 } },
    });
    expect(operations).toEqual(["modifyhitdef", "modifyhitdef", "modifyhitdef"]);
  });

  it("applies Helper-owned ModifyHitDef airguard.cornerpush.veloff in caller context and preserves omission", () => {
    const active = helper({
      vars: [4.75],
      runtimeProgram: {
        states: [
          stateProgram(stateDef(6000, { moveType: "A" }), [
            controllerIr(6000, "HitDef", {
              attr: "S,NA",
              guardflag: "MA",
              "airguard.cornerpush.veloff": "7",
            }),
            compiledControllerIr(6000, "ModifyHitDef", [], {
              redirectid: "0",
              "airguard.cornerpush.veloff": "var(0)",
            }),
            compiledControllerIr(6000, "ModifyHitDef", [], { redirectid: "0", damage: "20" }),
          ]),
        ],
      },
    });
    const operations: string[] = [];

    advanceRuntimeHelpers([active], stage, {
      onOperation: (_helper, operation) => operations.push(operation.kind),
    });

    expect(active.currentMove?.airGuardCornerPush).toBeCloseTo(4.75);
    expect(operations).toEqual(["modifyhitdef", "modifyhitdef"]);
  });

  it("applies Helper-owned remaining ModifyHitDef cornerpush offsets in caller context", () => {
    const active = helper({
      vars: [4.75, 5.5, 6.25, 7.125],
      runtimeProgram: {
        states: [
          stateProgram(stateDef(6000, { moveType: "A" }), [
            controllerIr(6000, "HitDef", {
              attr: "S,NA",
              guardflag: "MA",
              "ground.cornerpush.veloff": "1",
              "air.cornerpush.veloff": "2",
              "down.cornerpush.veloff": "3",
              "guard.cornerpush.veloff": "4",
            }),
            compiledControllerIr(6000, "ModifyHitDef", [], {
              redirectid: "0",
              "ground.cornerpush.veloff": "var(0)",
              "air.cornerpush.veloff": "var(1)",
              "down.cornerpush.veloff": "var(2)",
              "guard.cornerpush.veloff": "var(3)",
            }),
            compiledControllerIr(6000, "ModifyHitDef", [], { redirectid: "0", damage: "20" }),
          ]),
        ],
      },
    });
    advanceRuntimeHelpers([active], stage);
    expect(active.currentMove).toMatchObject({
      cornerPush: 4.75,
      airCornerPush: 5.5,
      downCornerPush: 6.25,
      guardCornerPush: 7.125,
    });
  });

  it("applies Helper-owned ModifyHitDef guard.velocity Y/Z in caller context and preserves omitted components", () => {
    const active = helper({
      vars: [-8, -4, 6],
      runtimeProgram: {
        states: [
          stateProgram(stateDef(6000, { moveType: "A" }), [
            controllerIr(6000, "HitDef", {
              attr: "S,NA",
              damage: "20",
              "guard.velocity": "-2,-1,2.5",
            }),
            compiledControllerIr(6000, "ModifyHitDef", [], {
              redirectid: "0",
              "guard.velocity": "var(0),var(1),var(2)",
            }),
            compiledControllerIr(6000, "ModifyHitDef", [], {
              redirectid: "0",
              "guard.velocity": "-11",
            }),
            compiledControllerIr(6000, "ModifyHitDef", [], { redirectid: "0", forcenofall: "1" }),
          ]),
        ],
      },
    });
    const operations: string[] = [];

    advanceRuntimeHelpers([active], stage, {
      onOperation: (_helper, operation) => operations.push(operation.kind),
    });

    expect(active.currentMove).toMatchObject({
      guardPush: 11,
      guardVelocityY: -4,
      guardVelocityZ: 6,
      hitVelocities: { guard: { x: -11, y: -4, z: 6 } },
    });
    expect(operations).toEqual(["modifyhitdef", "modifyhitdef", "modifyhitdef"]);
  });

  it("derives omitted helper HitDef getpower from the owner constants profile", () => {
    const active = helper({
      runtimeProgram: {
        states: [
          stateProgram(stateDef(6000, { moveType: "A" }), [
            controllerIr(6000, "HitDef", { attr: "S,NA", damage: "40" }),
          ]),
        ],
      },
    });

    advanceRuntimeHelpers([active], stage, {
      constants: { "default.attack.lifetopowermul": 0.8 },
    });

    expect(active.currentMove).toMatchObject({
      attackerHitPower: 32,
      attackerGuardPower: 16,
      hitPower: 24,
      guardPower: 12,
    });
  });

  it("derives omitted helper throw HitDef unhittabletime from attacker pausetime", () => {
    const active = helper({
      runtimeProgram: {
        states: [
          stateProgram(stateDef(6000, { moveType: "A" }), [
            controllerIr(6000, "HitDef", {
              attr: "S,HT",
              damage: "20",
              pausetime: "7,3",
            }),
          ]),
        ],
      },
    });

    advanceRuntimeHelpers([active], stage);

    expect(active.currentMove?.unhittableTime).toEqual([8, 8]);
  });

  it("routes dynamic helper SuperPause params through the match callback", () => {
    const operation: PauseControllerOp = {
      kind: "pause",
      controllerType: "superpause",
      time: 0,
      moveTime: 0,
      pauseBg: true,
      darken: true,
      powerAdd: 0,
    };
    const pauseController = {
      ...controllerIr(6000, "SuperPause", {
        time: "var(0)",
        movetime: "var(1)",
        poweradd: "var(2)",
        sound: "Svar(3),var(4)",
        p2defmul: "fvar(0)",
      }),
      operation,
    };
    const active = helper({
      vars: [7, 3, 125, 9, 4],
      fvars: [0.5],
      runtimeProgram: { states: [stateProgram(stateDef(6000), [pauseController])] },
    });
    const calls: string[] = [];

    advanceRuntimeHelpers([active], stage, {
      onPauseController: (current, controller, currentOperation, resolveSound, resolveParams) => {
        expect(current).toBe(active);
        expect(controller).toBe(pauseController);
        expect(currentOperation).toBe(operation);
        expect(resolveSound()).toEqual({ rawPrefix: "S", group: 9, index: 4 });
        expect(resolveParams.time?.()).toBe(7);
        expect(resolveParams.moveTime?.()).toBe(3);
        expect(resolveParams.powerAdd?.()).toBe(125);
        expect(resolveParams.p2DefMul?.()).toBe(0.5);
        calls.push("pause");
        return {
          pause: {
            type: "SuperPause",
            actorId: active.serialId,
            remaining: 7,
            moveTime: 3,
            darken: true,
            sourceStateNo: 6000,
            startedAt: 12,
          },
          powerDelta: 125,
        };
      },
      onController: (_helper, controller) => calls.push(`controller:${controller.normalizedType}`),
      onOperation: (_helper, operation) => calls.push(`operation:${operation.kind}`),
    });

    expect(calls).toEqual(["pause", "controller:superpause", "operation:pause"]);
  });

  it("clears active helper reversal moves even when destination state declares hitdefpersist", () => {
    const active = helper({
      stateNo: 1200,
      currentMove: activeMove({ isReversal: true }),
      currentMoveLabel: "ReversalDef",
      moveTick: 3,
      firedHitDefs: new Set(["1200:1:0"]),
      runtimeProgram: {
        states: [
          stateProgram(stateDef(1200, { moveType: "A" }), [controllerIr(1200, "ChangeState", { value: "1224" })]),
          stateProgram(stateDef(1224, { moveType: "A", hitDefPersist: true })),
        ],
      },
    });

    advanceRuntimeHelpers([active], stage);

    expect(active.stateNo).toBe(1224);
    expect(active.currentMove).toBeUndefined();
    expect(active.currentMoveLabel).toBeUndefined();
    expect(active.moveTick).toBe(0);
    expect(active.firedHitDefs.size).toBe(0);
  });

  it("preserves helper-local MoveContact and MoveHit when destination state declares movehitpersist", () => {
    const contact = createRuntimeContactMemory();
    markRuntimeMoveContact(contact, 1200, "hit", "p2");
    const active = helper({
      stateNo: 1200,
      contact,
      runtimeProgram: {
        states: [
          stateProgram(stateDef(1200, { moveType: "A" }), [controllerIr(1200, "ChangeState", { value: "1228" })]),
          stateProgram(stateDef(1228, { moveType: "A", moveHitPersist: true })),
        ],
      },
    });

    advanceRuntimeHelpers([active], stage);

    expect(active.stateNo).toBe(1228);
    expect(runtimeMoveContactValue(active.contact, 1228, "contact")).toBe(1);
    expect(runtimeMoveContactValue(active.contact, 1228, "hit")).toBe(1);
    expect(runtimeMoveHitCountValue(active.contact, 1228, false)).toBe(0);
    expect(runtimeMoveHitCountValue(active.contact, 1228, true)).toBe(0);
  });

  it("preserves helper-local MoveGuarded when destination state declares movehitpersist", () => {
    const contact = createRuntimeContactMemory();
    markRuntimeMoveContact(contact, 1200, "guard", "p2");
    const active = helper({
      stateNo: 1200,
      contact,
      runtimeProgram: {
        states: [
          stateProgram(stateDef(1200, { moveType: "A" }), [controllerIr(1200, "ChangeState", { value: "1230" })]),
          stateProgram(stateDef(1230, { moveType: "A", moveHitPersist: true })),
        ],
      },
    });

    advanceRuntimeHelpers([active], stage);

    expect(active.stateNo).toBe(1230);
    expect(runtimeMoveContactValue(active.contact, 1230, "contact")).toBe(1);
    expect(runtimeMoveContactValue(active.contact, 1230, "guard")).toBe(1);
    expect(runtimeMoveContactValue(active.contact, 1230, "hit")).toBe(0);
    expect(runtimeMoveHitCountValue(active.contact, 1230, false)).toBe(0);
    expect(runtimeMoveHitCountValue(active.contact, 1230, true)).toBe(0);
  });

  it("preserves helper-local MoveReversed when destination state declares movehitpersist", () => {
    const contact = createRuntimeContactMemory();
    markRuntimeMoveReversed(contact, 1200);
    const active = helper({
      stateNo: 1200,
      contact,
      runtimeProgram: {
        states: [
          stateProgram(stateDef(1200, { moveType: "A" }), [controllerIr(1200, "ChangeState", { value: "1232" })]),
          stateProgram(stateDef(1232, { moveType: "A", moveHitPersist: true })),
        ],
      },
    });

    advanceRuntimeHelpers([active], stage);

    expect(active.stateNo).toBe(1232);
    expect(runtimeMoveReversedValue(active.contact, 1232)).toBe(1);
    expect(runtimeMoveContactValue(active.contact, 1232, "contact")).toBe(0);
    expect(runtimeMoveContactValue(active.contact, 1232, "hit")).toBe(0);
    expect(runtimeMoveContactValue(active.contact, 1232, "guard")).toBe(0);
    expect(runtimeMoveHitCountValue(active.contact, 1232, false)).toBe(0);
    expect(runtimeMoveHitCountValue(active.contact, 1232, true)).toBe(0);
  });

  it("resets helper-local MoveContact and MoveHit when destination state omits movehitpersist", () => {
    const contact = createRuntimeContactMemory();
    markRuntimeMoveContact(contact, 1200, "hit", "p2");
    const active = helper({
      stateNo: 1200,
      contact,
      runtimeProgram: {
        states: [
          stateProgram(stateDef(1200, { moveType: "A" }), [controllerIr(1200, "ChangeState", { value: "1228" })]),
          stateProgram(stateDef(1228, { moveType: "A" })),
        ],
      },
    });

    advanceRuntimeHelpers([active], stage);

    expect(active.stateNo).toBe(1228);
    expect(runtimeMoveContactValue(active.contact, 1228, "contact")).toBe(0);
    expect(runtimeMoveContactValue(active.contact, 1228, "hit")).toBe(0);
  });

  it("preserves helper-local hit counters when destination state declares hitcountpersist", () => {
    const contact = createRuntimeContactMemory();
    markRuntimeMoveContact(contact, 1200, "hit", "p2");
    const active = helper({
      stateNo: 1200,
      contact,
      runtimeProgram: {
        states: [
          stateProgram(stateDef(1200, { moveType: "A" }), [controllerIr(1200, "ChangeState", { value: "1226" })]),
          stateProgram(stateDef(1226, { moveType: "A", hitCountPersist: true })),
        ],
      },
    });

    advanceRuntimeHelpers([active], stage);

    expect(active.stateNo).toBe(1226);
    expect(runtimeMoveHitCountValue(active.contact, 1226, false)).toBe(1);
    expect(runtimeMoveHitCountValue(active.contact, 1226, true)).toBe(1);
    expect(runtimeMoveContactValue(active.contact, 1226, "hit")).toBe(0);
  });

  it("resets helper-local hit counters when destination state omits hitcountpersist", () => {
    const contact = createRuntimeContactMemory();
    markRuntimeMoveContact(contact, 1200, "hit", "p2");
    const active = helper({
      stateNo: 1200,
      contact,
      runtimeProgram: {
        states: [
          stateProgram(stateDef(1200, { moveType: "A" }), [controllerIr(1200, "ChangeState", { value: "1226" })]),
          stateProgram(stateDef(1226, { moveType: "A" })),
        ],
      },
    });

    advanceRuntimeHelpers([active], stage);

    expect(active.stateNo).toBe(1226);
    expect(runtimeMoveHitCountValue(active.contact, 1226, false)).toBe(0);
    expect(runtimeMoveHitCountValue(active.contact, 1226, true)).toBe(0);
  });

  it("projects helpers into effect actor snapshots with cloned collision boxes", () => {
    const [snapshot] = runtimeHelpersToSnapshots([helper({ frameIndex: 0, scale: { x: 2, y: 0.5 } })], 100);

    expect(snapshot).toMatchObject({
      id: "p1-helper-0",
      label: "Helper Burst",
      actorKind: "helper",
      ownerId: "p1",
      rootId: "p1",
      parentId: "p1",
      source: "effect",
      spriteOwnerId: "p1",
      spriteOwnerDefinitionId: "demo",
      spriteOwnerLabel: "Demo",
      runtime: {
        teamState: {
          disabled: false,
          standby: false,
          overKo: false,
          playerType: false,
        },
        pos: { x: 0, y: 0 },
        vel: { x: 0, y: 0 },
        facing: 1,
        spritePriority: 3,
        stateNo: 6000,
        animNo: 6100,
        frameIndex: 0,
        ctrl: false,
        stateType: "S",
        moveType: "I",
        physics: "N",
        renderScale: { x: 2, y: 0.5 },
      },
      effect: {
        kind: "helper",
          scale: { x: 2, y: 0.5 },
          ignoreHitPause: false,
          pauseMoveTime: 0,
          superMoveTime: 0,
        },
      clsn1: [{ x1: 1, y1: 2, x2: 3, y2: 4 }],
      clsn2: [{ x1: -4, y1: -3, x2: 4, y2: 5 }],
    });

    const [playerTypeSnapshot] = runtimeHelpersToSnapshots([
      helper({
        frameIndex: 0,
        teamState: { disabled: false, standby: true, overKo: true, playerType: true },
      }),
    ], 100);
    expect(playerTypeSnapshot?.runtime.teamState).toEqual({
      disabled: false,
      standby: true,
      overKo: true,
      playerType: true,
    });

    const roundTripHelper = helper({ frameIndex: 0 });
    const runtime = helperRuntimeState(roundTripHelper);
    runtime.teamState = { disabled: true, standby: true, overKo: true, playerType: true };
    applyRuntimeStateToHelper(roundTripHelper, runtime);
    runtime.teamState.standby = false;
    expect(roundTripHelper.teamState).toEqual({
      disabled: true,
      standby: true,
      overKo: true,
      playerType: true,
    });
    expect(runtimeHelpersToSnapshots([roundTripHelper], 100)[0]?.runtime.teamState).toEqual(roundTripHelper.teamState);

    expect(snapshot?.clsn1[0]).not.toBe(action.frames[0]?.clsn1[0]);
    expect(snapshot?.clsn2[0]).not.toBe(action.frames[0]?.clsn2[0]);
  });
});

function teamStandbyController(
  stateId: number,
  type: "TagIn" | "TagOut",
  operation: Omit<TeamStandbyControllerOp, "kind" | "controllerType">,
): ControllerIr {
  return {
    ...controllerIr(stateId, type),
    operation: {
      kind: "team-standby",
      controllerType: type.toLowerCase() as TeamStandbyControllerOp["controllerType"],
      ...operation,
    },
  };
}

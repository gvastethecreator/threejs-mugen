import { describe, expect, it } from "vitest";
import type { ControllerIr, StateProgramIr } from "../mugen/compiler/RuntimeIr";
import type { DemoMove } from "../mugen/runtime/demoFighters";
import type { HelperControllerOp, PauseControllerOp, TeamStandbyControllerOp } from "../mugen/compiler/ControllerOps";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
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

function stateProgram(source: MugenStateDef, controllers: ControllerIr[] = []): StateProgramIr {
  return {
    source,
    id: source.id,
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
    stateTime: 0,
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
    const destinationActor = runtimeHelperTargetActor(destinationHelper);
    const targetActor = runtimeHelperTargetActor(targetHelper);
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

    expect(actor.targets).toEqual([]);
    expect(destinationHelper.power).toBe(35);
    expect(targetHelper.power).toBe(50);
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

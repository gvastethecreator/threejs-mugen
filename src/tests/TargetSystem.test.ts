import { describe, expect, it } from "vitest";
import {
  addRuntimeTargetBinding,
  advanceRuntimeTargetMemory,
  applyRuntimeTargetController,
  clampRuntimeTargetDuration,
  createRuntimeTargetBinding,
  dropRuntimeTargets,
  findRuntimeTargetId,
  hasRuntimeTarget,
  matchesRuntimeTargetId,
  rememberRuntimeTarget,
  resolveRuntimeTargetBindingPosition,
  type RuntimeTarget,
  type RuntimeTargetBinding,
  type RuntimeTargetControllerActor,
} from "../mugen/runtime/TargetSystem";
import type { CharacterRuntimeState } from "../mugen/runtime/types";

describe("TargetSystem", () => {
  it("remembers recent targets, refreshes existing entries, and enforces a bounded history", () => {
    const targets: RuntimeTarget[] = [];

    rememberRuntimeTarget(targets, "p2", 10, 3);
    rememberRuntimeTarget(targets, "helper", 20, 3);
    rememberRuntimeTarget(targets, "projectile", 30, 3);
    rememberRuntimeTarget(targets, "overflow", 40, 3);

    expect(targets.map((target) => target.actorId)).toEqual(["overflow", "projectile", "helper"]);

    targets[1]!.age = 12;
    rememberRuntimeTarget(targets, "projectile", 30, 3);
    expect(targets[1]).toMatchObject({ actorId: "projectile", targetId: 30, age: 0 });
  });

  it("matches target ids using MUGEN-style wildcard ids", () => {
    const targets: RuntimeTarget[] = [
      { actorId: "p2", targetId: 7, age: 0 },
      { actorId: "helper", targetId: 2, age: 0 },
    ];

    expect(hasRuntimeTarget(targets, "p2", 7)).toBe(true);
    expect(hasRuntimeTarget(targets, "p2", undefined)).toBe(true);
    expect(hasRuntimeTarget(targets, "p2", -1)).toBe(true);
    expect(hasRuntimeTarget(targets, "p2", 99)).toBe(false);
    expect(matchesRuntimeTargetId({ targetId: 5 }, -1)).toBe(true);
    expect(findRuntimeTargetId(targets, "helper")).toBe(2);
  });

  it("advances target memory and target bindings with expiry", () => {
    const finiteBinding = binding({ actorId: "p2", targetId: 1, remaining: 1 });
    const infiniteBinding = binding({ actorId: "helper", targetId: 2, remaining: Number.POSITIVE_INFINITY });
    const next = advanceRuntimeTargetMemory(
      {
        targets: [
          { actorId: "fresh", targetId: 1, age: 0 },
          { actorId: "old", targetId: 2, age: 2 },
        ],
        bindings: [finiteBinding, infiniteBinding],
      },
      2,
    );

    expect(next.targets).toEqual([{ actorId: "fresh", targetId: 1, age: 1 }]);
    expect(next.bindings).toEqual([infiniteBinding]);
  });

  it("drops matching target ids and preserves current bounded keep-one behavior", () => {
    const memory = {
      targets: [
        { actorId: "p2", targetId: 1, age: 0 },
        { actorId: "helper", targetId: 2, age: 0 },
        { actorId: "projectile", targetId: 3, age: 0 },
      ],
      bindings: [binding({ actorId: "p2", targetId: 1 }), binding({ actorId: "helper", targetId: 2 })],
    };

    expect(dropRuntimeTargets(memory, 1, false)).toMatchObject({
      targets: [
        { actorId: "helper", targetId: 2 },
        { actorId: "projectile", targetId: 3 },
      ],
      bindings: [{ actorId: "helper", targetId: 2 }],
    });

    expect(dropRuntimeTargets(memory, 1, true)).toMatchObject({
      targets: [{ actorId: "helper", targetId: 2 }],
      bindings: [{ actorId: "helper", targetId: 2 }],
    });
  });

  it("creates and resolves target bindings with duration clamping", () => {
    const bindings: RuntimeTargetBinding[] = [];
    const created = createRuntimeTargetBinding({
      actorId: "p2",
      targetId: 4,
      remaining: 9999,
      offset: { x: 24, y: -8 },
    });

    addRuntimeTargetBinding(bindings, created, 1);
    addRuntimeTargetBinding(bindings, binding({ actorId: "extra", targetId: 5 }), 1);

    expect(created).toMatchObject({ actorId: "p2", targetId: 4, remaining: 3600, offset: { x: 24, y: -8 } });
    expect(bindings).toEqual([binding({ actorId: "extra", targetId: 5 })]);
    expect(clampRuntimeTargetDuration(-1)).toBe(Number.POSITIVE_INFINITY);
    expect(resolveRuntimeTargetBindingPosition({ x: 100, y: -20 }, -1, created)).toEqual({ x: 76, y: -28 });
  });

  it("applies Target* side effects through the runtime target controller system", () => {
    const actor = targetActor("p1", {
      runtime: { pos: { x: 100, y: 0 }, facing: 1 },
      targets: [{ actorId: "p2", targetId: 77, age: 0 }],
    });
    const target = targetActor("p2", {
      runtime: {
        life: 120,
        power: 30,
        facing: -1,
        vel: { x: 1, y: 2 },
      },
    });
    const operations: string[] = [];

    applyRuntimeTargetController({
      actor,
      candidateTargets: [target],
      controller: controller("TargetLifeAdd", { id: "77", value: "-20" }),
      operation: { kind: "target", controllerType: "targetlifeadd", requestedId: 77, value: -20, absolute: false, kill: true },
      onOperation: (operation) => operations.push(operation.controllerType),
      scaleIncomingDamage: (_runtime, damage) => damage + 5,
    });
    applyRuntimeTargetController({
      actor,
      candidateTargets: [target],
      controller: controller("TargetPowerAdd", { id: "77", value: "40" }),
      operation: { kind: "target", controllerType: "targetpoweradd", requestedId: 77, value: 40 },
    });
    applyRuntimeTargetController({
      actor,
      candidateTargets: [target],
      controller: controller("TargetVelSet", { id: "77", x: "3", y: "-4" }),
      operation: { kind: "target", controllerType: "targetvelset", requestedId: 77, x: 3, y: -4 },
    });
    applyRuntimeTargetController({
      actor,
      candidateTargets: [target],
      controller: controller("TargetVelAdd", { id: "77", x: "2", y: "1" }),
      operation: { kind: "target", controllerType: "targetveladd", requestedId: 77, x: 2, y: 1 },
    });
    applyRuntimeTargetController({
      actor,
      candidateTargets: [target],
      controller: controller("TargetFacing", { id: "77", value: "1" }),
      operation: { kind: "target", controllerType: "targetfacing", requestedId: 77, value: 1 },
    });
    applyRuntimeTargetController({
      actor,
      candidateTargets: [target],
      controller: controller("TargetBind", { id: "77", pos: "36,-12", time: "4" }),
      operation: { kind: "target", controllerType: "targetbind", requestedId: 77, pos: [36, -12], time: 4 },
    });

    expect(operations).toEqual(["targetlifeadd"]);
    expect(target.runtime.life).toBe(95);
    expect(target.runtime.power).toBe(70);
    expect(target.runtime.vel).toEqual({ x: 1, y: -3 });
    expect(target.runtime.facing).toBe(1);
    expect(target.runtime.pos).toEqual({ x: 136, y: -12 });
    expect(actor.targetBindings).toMatchObject([{ actorId: "p2", targetId: 77, remaining: 4, offset: { x: 36, y: -12 } }]);
  });

  it("routes TargetState through a callback and TargetDrop through target memory", () => {
    const actor = targetActor("p1", {
      targets: [
        { actorId: "p2", targetId: 77, age: 0 },
        { actorId: "helper", targetId: 88, age: 0 },
      ],
      targetBindings: [binding({ actorId: "p2", targetId: 77 }), binding({ actorId: "helper", targetId: 88 })],
    });
    const target = targetActor("p2");
    const entered: Array<{ actorId: string; stateId: number }> = [];

    applyRuntimeTargetController({
      actor,
      candidateTargets: [target],
      controller: controller("TargetState", { id: "77", value: "5300" }),
      operation: { kind: "target", controllerType: "targetstate", requestedId: 77, stateNo: 5300 },
      enterTargetState: (targetActor, stateId) => entered.push({ actorId: targetActor.id, stateId }),
    });
    applyRuntimeTargetController({
      actor,
      candidateTargets: [target],
      controller: controller("TargetDrop", { id: "77", keepone: "0" }),
      operation: { kind: "target", controllerType: "targetdrop", requestedId: 77, keepOne: false },
    });

    expect(entered).toEqual([{ actorId: "p2", stateId: 5300 }]);
    expect(actor.targets).toEqual([{ actorId: "helper", targetId: 88, age: 0 }]);
    expect(actor.targetBindings).toEqual([binding({ actorId: "helper", targetId: 88 })]);
    expect(actor.runtime.targetCount).toBe(1);
  });
});

function binding(overrides: Partial<RuntimeTargetBinding> = {}): RuntimeTargetBinding {
  return {
    actorId: "p2",
    targetId: 1,
    remaining: 3,
    offset: { x: 10, y: -5 },
    ...overrides,
  };
}

function controller(type: string, params: Record<string, string> = {}) {
  return {
    stateId: 200,
    type,
    triggers: [],
    params,
    line: 1,
    rawHeader: `[State 200, ${type}]`,
  };
}

function targetActor(
  id: string,
  overrides: {
    runtime?: Partial<CharacterRuntimeState>;
    targets?: RuntimeTarget[];
    targetBindings?: RuntimeTargetBinding[];
  } = {},
): RuntimeTargetControllerActor {
  return {
    id,
    runtime: runtime(overrides.runtime),
    targets: overrides.targets ?? [],
    targetBindings: overrides.targetBindings ?? [],
  };
}

function runtime(overrides: Partial<CharacterRuntimeState> = {}): CharacterRuntimeState {
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

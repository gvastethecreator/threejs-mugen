import { describe, expect, it } from "vitest";
import { compileControllerIr } from "../mugen/compiler/StateControllerCompiler";
import {
  addRuntimeTargetBinding,
  advanceRuntimeTargetMemory,
  applyRuntimeBindToTarget,
  applyRuntimeBindToTargetController,
  applyRuntimeTargetController,
  applyRuntimeTargetBindings,
  clampRuntimeTargetDuration,
  createRuntimeTargetBinding,
  dropRuntimeTargets,
  findRuntimeTargetId,
  hasRuntimeTarget,
  matchesRuntimeTargetId,
  rememberRuntimeTarget,
  resolveRuntimeTargetAnchor,
  resolveRuntimeTargetBindingPosition,
  RuntimeTargetControllerDispatchWorld,
  RuntimeTargetWorld,
  type RuntimeTarget,
  type RuntimeTargetBinding,
  type RuntimeTargetWorldActor,
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

  it("resolves concrete target candidates through RuntimeTargetWorld target memory", () => {
    const world = new RuntimeTargetWorld();
    const actor = targetActor("p1", {
      targets: [
        { actorId: "p2", targetId: 77, age: 0 },
        { actorId: "helper", targetId: 88, age: 0 },
      ],
    });
    const p2 = targetActor("p2", { runtime: { life: 120 } });
    const helper = targetActor("helper", { runtime: { life: 120 } });
    const stranger = targetActor("stranger", { runtime: { life: 120 } });

    expect(world.resolveCandidates(actor, [stranger, p2, helper]).map((target) => target.id)).toEqual(["p2", "helper"]);
    expect(world.resolveCandidates(actor, [p2, helper], 88).map((target) => target.id)).toEqual(["helper"]);

    const result = world.applyController({
      actor,
      candidateTargets: [helper, p2, stranger],
      controller: controller("TargetLifeAdd", { id: "77", value: "-20" }),
      operation: { kind: "target", controllerType: "targetlifeadd", requestedId: 77, value: -20, absolute: false, kill: true },
    });

    expect(result).toEqual({ controllerType: "targetlifeadd", matchedTargets: 1, operationExecuted: true });
    expect(p2.runtime.life).toBe(100);
    expect(helper.runtime.life).toBe(120);
    expect(stranger.runtime.life).toBe(120);
  });

  it("wraps target memory mutation behind RuntimeTargetWorld", () => {
    const world = new RuntimeTargetWorld();
    const actor = targetActor("p1", {
      targets: [{ actorId: "old", targetId: 1, age: 600 }],
      targetBindings: [binding({ actorId: "p2", targetId: 77, remaining: 2 })],
    });
    actor.bindToTarget = binding({ actorId: "p2", targetId: 77, remaining: 2 });

    world.remember(actor, "p2", 77);

    expect(world.count(actor, 77)).toBe(1);
    expect(world.find(actor, "p2", 77)).toMatchObject({ actorId: "p2", targetId: 77, age: 0 });
    expect(actor.runtime.targetCount).toBe(2);

    world.advance(actor);
    const snapshot = world.snapshot(actor);

    expect(actor.targets).toEqual([{ actorId: "p2", targetId: 77, age: 1 }]);
    expect(actor.targetBindings).toEqual([binding({ actorId: "p2", targetId: 77, remaining: 1 })]);
    expect(actor.bindToTarget).toEqual(binding({ actorId: "p2", targetId: 77, remaining: 1 }));
    expect(actor.runtime.targetCount).toBe(1);
    expect(snapshot.targets).toEqual([{ actorId: "p2", targetId: 77, age: 1 }]);
    expect(snapshot.bindings).toEqual([{ actorId: "p2", targetId: 77, remaining: 1, offset: { x: 10, y: -5 } }]);
    expect(
      world.snapshotLinks({
        ownerId: actor.id,
        targets: snapshot.targets,
        bindings: snapshot.bindings,
        bindToTarget: { actorId: "p2", targetId: 77, remaining: 1, offset: { x: 26, y: -80 } },
      }),
    ).toEqual([
      {
        ownerId: "p1",
        actorId: "p2",
        targetId: 77,
        age: 1,
        binding: { actorId: "p2", targetId: 77, remaining: 1, offset: { x: 10, y: -5 } },
      },
      {
        ownerId: "p1",
        actorId: "p2",
        targetId: 77,
        age: 1,
        binding: { actorId: "p2", targetId: 77, remaining: 1, offset: { x: 26, y: -80 } },
      },
    ]);
  });

  it("clears stale target-binding subject telemetry for an excluded actor", () => {
    const world = new RuntimeTargetWorld();
    const actor = targetActor("p4");
    actor.runtime.hitVars = { isBound: true };

    world.clearBindingSubject(actor);

    expect(actor.runtime.hitVars?.isBound).toBe(false);
  });

  it("builds unbound target-link snapshots from target memory snapshots", () => {
    const world = new RuntimeTargetWorld();

    expect(
      world.snapshotLinks({
        ownerId: "p1",
        targets: [{ actorId: "p2", targetId: 77, age: 4 }],
        bindings: [],
      }),
    ).toEqual([{ ownerId: "p1", actorId: "p2", targetId: 77, age: 4 }]);
  });

  it("snapshots target refs from runtime state without leaking mutable arrays", () => {
    const world = new RuntimeTargetWorld();
    const state = runtime({
      targetRefs: [{ actorId: "p2", targetId: 77, age: 4 }],
      targetBindings: [{ actorId: "p2", targetId: 77, remaining: 6, offset: { x: 12, y: -4 } }],
      bindToTarget: { actorId: "p2", targetId: 77, remaining: 3, offset: { x: 26, y: -80 } },
    });

    const snapshot = world.snapshotRuntimeState(state);
    state.targetRefs![0]!.age = 99;
    state.targetBindings![0]!.offset.x = 999;
    state.bindToTarget!.offset.y = -999;

    expect(snapshot.targetCount).toBe(1);
    expect(snapshot.targets).toEqual([{ actorId: "p2", targetId: 77, age: 4 }]);
    expect(snapshot.bindings).toEqual([{ actorId: "p2", targetId: 77, remaining: 6, offset: { x: 12, y: -4 } }]);
    expect(snapshot.bindToTarget).toEqual({ actorId: "p2", targetId: 77, remaining: 3, offset: { x: 26, y: -80 } });
  });

  it("advances target memory and target bindings with expiry", () => {
    const finiteBinding = binding({ actorId: "p2", targetId: 1, remaining: 1 });
    const infiniteBinding = binding({ actorId: "helper", targetId: 2, remaining: Number.POSITIVE_INFINITY });
    const staleBinding = binding({ actorId: "old", targetId: 3, remaining: 9 });
    const next = advanceRuntimeTargetMemory(
      {
        targets: [
          { actorId: "helper", targetId: 2, age: 0 },
          { actorId: "old", targetId: 3, age: 2 },
        ],
        bindings: [finiteBinding, infiniteBinding, staleBinding],
      },
      2,
    );

    expect(next.targets).toEqual([{ actorId: "helper", targetId: 2, age: 1 }]);
    expect(next.bindings).toEqual([infiniteBinding]);
  });

  it("drops all targets except excludeID and preserves bounded keepone behavior", () => {
    const memory = {
      targets: [
        { actorId: "p2", targetId: 1, age: 0 },
        { actorId: "helper", targetId: 1, age: 0 },
        { actorId: "projectile", targetId: 3, age: 0 },
      ],
      bindings: [binding({ actorId: "p2", targetId: 1 }), binding({ actorId: "helper", targetId: 1 }), binding({ actorId: "projectile", targetId: 3 })],
    };

    expect(dropRuntimeTargets(memory, 1, false)).toMatchObject({
      targets: [
        { actorId: "p2", targetId: 1 },
        { actorId: "helper", targetId: 1 },
      ],
      bindings: [
        { actorId: "p2", targetId: 1 },
        { actorId: "helper", targetId: 1 },
      ],
    });

    expect(dropRuntimeTargets(memory, 1, true)).toMatchObject({
      targets: [{ actorId: "p2", targetId: 1 }],
      bindings: [{ actorId: "p2", targetId: 1 }],
    });

    expect(dropRuntimeTargets(memory, -1, false)).toEqual({
      targets: [],
      bindings: [],
    });

    expect(dropRuntimeTargets(memory, 99, false)).toEqual({
      targets: [],
      bindings: [],
    });
  });

  it("defaults TargetDrop keepone to one when keepone is omitted", () => {
    const actor = targetActor("p1", {
      targets: [
        { actorId: "p2", targetId: 1, age: 0 },
        { actorId: "helper", targetId: 1, age: 0 },
        { actorId: "projectile", targetId: 3, age: 0 },
      ],
      targetBindings: [binding({ actorId: "p2", targetId: 1 }), binding({ actorId: "helper", targetId: 1 }), binding({ actorId: "projectile", targetId: 3 })],
    });

    applyRuntimeTargetController({
      actor,
      candidateTargets: [],
      controller: controller("TargetDrop", { excludeID: "1" }),
    });

    expect(actor.targets).toEqual([{ actorId: "p2", targetId: 1, age: 0 }]);
    expect(actor.targetBindings).toEqual([binding({ actorId: "p2", targetId: 1 })]);
    expect(actor.runtime.targetCount).toBe(1);
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
        powerMax: 60,
        facing: -1,
        vel: { x: 1, y: 2 },
        hitVars: { isBound: false },
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
    expect(target.runtime.power).toBe(60);
    expect(target.runtime.vel).toEqual({ x: 1, y: -3 });
    expect(target.runtime.facing).toBe(1);
    expect(target.runtime.pos).toEqual({ x: 136, y: -12 });
    expect(target.runtime.hitVars?.isBound).toBe(true);
    expect(actor.targetBindings).toMatchObject([{ actorId: "p2", targetId: 77, remaining: 4, offset: { x: 36, y: -12 } }]);
  });

  it("dispatches active Target controllers with telemetry hooks", () => {
    const world = new RuntimeTargetControllerDispatchWorld();
    const targetWorld = new RuntimeTargetWorld();
    const actor = targetActor("p1", {
      targets: [{ actorId: "p2", targetId: 77, age: 0 }],
    });
    const target = targetActor("p2", {
      runtime: { life: 120 },
    });
    const ir = compileControllerIr(controller("TargetLifeAdd", { id: "77", value: "-20" }));
    const recordedControllers: string[] = [];
    const recordedOperations: string[] = [];

    const result = world.apply({
      actor,
      candidateTargets: [target],
      controller: ir,
      effect: "target",
      targetWorld,
      recordController: (_actor, source) => recordedControllers.push(source.type),
      recordOperation: (_actor, operation) =>
        recordedOperations.push(`${operation.kind}:${"controllerType" in operation ? operation.controllerType : operation.postype}`),
      scaleIncomingDamage: (_runtime, damage) => damage + 5,
    });

    expect(target.runtime.life).toBe(95);
    expect(recordedControllers).toEqual(["TargetLifeAdd"]);
    expect(recordedOperations).toEqual(["target:targetlifeadd"]);
    expect(result).toEqual({
      controllerType: "targetlifeadd",
      matchedTargets: 1,
      operationExecuted: true,
      recordedController: true,
      recordedOperation: true,
    });
  });

  it("dispatches active BindToTarget controllers with telemetry hooks", () => {
    const world = new RuntimeTargetControllerDispatchWorld();
    const targetWorld = new RuntimeTargetWorld();
    const actor = targetActor("p1", {
      targets: [{ actorId: "p2", targetId: 77, age: 0 }],
    });
    const target = targetActor("p2", {
      runtime: { pos: { x: 100, y: -20 }, facing: -1 },
    });
    const ir = compileControllerIr(controller("BindToTarget", { id: "77", pos: "12,-8,Head", time: "5" }));
    const recordedOperations: string[] = [];

    const result = world.apply({
      actor,
      candidateTargets: [target],
      controller: ir,
      effect: "bindtotarget",
      targetWorld,
      recordOperation: (_actor, operation) =>
        recordedOperations.push(
          `${operation.kind}:${"controllerType" in operation ? operation.controllerType : operation.postype}:${"time" in operation ? operation.time : "none"}`,
        ),
      getTargetConst: (_target, name) => ({ "size.head.pos.x": 6, "size.head.pos.y": -70 })[name],
    });

    expect(actor.bindToTarget).toMatchObject({ actorId: "p2", targetId: 77, remaining: 5, offset: { x: 18, y: -78 } });
    expect(actor.runtime.pos).toEqual({ x: 82, y: -98 });
    expect(recordedOperations).toEqual(["bindtotarget:head:5"]);
    expect(result).toEqual({
      controllerType: "bindtotarget",
      matchedTargets: 1,
      operationExecuted: true,
      recordedController: false,
      recordedOperation: true,
    });
  });

  it("respects target NoKO when TargetLifeAdd would kill", () => {
    const actor = targetActor("p1", { targets: [{ actorId: "p2", targetId: 77, age: 0 }] });
    const target = targetActor("p2", {
      runtime: {
        life: 12,
        assertSpecial: { flags: ["noko"], globalFlags: [], noKo: true },
      },
    });

    applyRuntimeTargetController({
      actor,
      candidateTargets: [target],
      controller: controller("TargetLifeAdd", { id: "77", value: "-40" }),
      operation: { kind: "target", controllerType: "targetlifeadd", requestedId: 77, value: -40, absolute: false, kill: true },
    });

    expect(target.runtime.life).toBe(1);
  });

  it("routes TargetState through a callback and TargetDrop through target memory", () => {
    const actor = targetActor("p1", {
      targets: [
        { actorId: "p2", targetId: 77, age: 0 },
        { actorId: "helper", targetId: 88, age: 0 },
      ],
      targetBindings: [binding({ actorId: "p2", targetId: 77 }), binding({ actorId: "helper", targetId: 88 })],
    });
    const target = targetActor("p2", {
      runtime: { hitVars: { isBound: true } },
    });
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
      controller: controller("TargetDrop", { excludeID: "88", keepone: "0" }),
      operation: { kind: "target", controllerType: "targetdrop", excludeId: 88, keepOne: false },
    });

    expect(entered).toEqual([{ actorId: "p2", stateId: 5300 }]);
    expect(actor.targets).toEqual([{ actorId: "helper", targetId: 88, age: 0 }]);
    expect(actor.targetBindings).toEqual([binding({ actorId: "helper", targetId: 88 })]);
    expect(target.runtime.hitVars?.isBound).toBe(false);
    expect(actor.runtime.targetCount).toBe(1);
  });

  it("applies raw BindToTarget through target memory, postype anchors, and facing-aware binding position", () => {
    const actor = targetActor("p1", {
      targets: [{ actorId: "p2", targetId: 77, age: 0 }],
    });
    const target = targetActor("p2", {
      runtime: { pos: { x: 100, y: -20 }, facing: -1 },
    });
    const operations: string[] = [];

    const result = applyRuntimeBindToTargetController({
      actor,
      candidateTargets: [target],
      controller: controller("BindToTarget", { id: "77", pos: "12,-8,Head", time: "5" }),
      getTargetConst: (_target, name) => ({ "size.head.pos.x": 6, "size.head.pos.y": -70 })[name],
      onOperation: (operation) => operations.push(`${operation.kind}:${operation.postype}:${operation.time}`),
    });

    expect(result).toEqual({ controllerType: "bindtotarget", matchedTargets: 1, operationExecuted: true });
    expect(actor.bindToTarget).toMatchObject({ actorId: "p2", targetId: 77, remaining: 5, offset: { x: 18, y: -78 } });
    expect(actor.runtime.pos).toEqual({ x: 82, y: -98 });
    expect(operations).toEqual(["bindtotarget:head:5"]);
  });

  it("resolves BindToTarget postype anchors from MUGEN size constants", () => {
    const target = targetActor("p2");
    const constants: Record<string, number> = {
      "size.head.pos.x": 6,
      "size.head.pos.y": -70,
      "size.mid.pos": 4,
      "size.mid.pos.y": -38,
    };
    const getConst = (_target: RuntimeTargetWorldActor, name: string) => constants[name];

    expect(resolveRuntimeTargetAnchor(target, "foot", getConst)).toEqual({ x: 0, y: 0 });
    expect(resolveRuntimeTargetAnchor(target, "head", getConst)).toEqual({ x: 6, y: -70 });
    expect(resolveRuntimeTargetAnchor(target, "mid", getConst)).toEqual({ x: 4, y: -38 });
  });

  it("applies typed BindToTarget ops and reports misses without mutation", () => {
    const actor = targetActor("p1", {
      targets: [{ actorId: "p2", targetId: 77, age: 0 }],
    });
    const target = targetActor("p2", {
      runtime: { pos: { x: 20, y: 10 }, facing: 1 },
    });

    applyRuntimeBindToTargetController({
      actor,
      candidateTargets: [target],
      controller: controller("BindToTarget", {}),
      operation: { kind: "bindtotarget", requestedId: 77, pos: [4, -6], postype: "foot", time: 3 },
    });

    expect(actor.bindToTarget).toMatchObject({ actorId: "p2", targetId: 77, remaining: 3, offset: { x: 4, y: -6 } });
    expect(actor.runtime.pos).toEqual({ x: 24, y: 4 });

    const before = actor.bindToTarget;
    const result = applyRuntimeBindToTargetController({
      actor,
      candidateTargets: [target],
      controller: controller("BindToTarget", {}),
      operation: { kind: "bindtotarget", requestedId: 88, pos: [40, -60], postype: "foot", time: 1 },
    });

    expect(result).toEqual({ controllerType: "bindtotarget", matchedTargets: 0, operationExecuted: false });
    expect(actor.bindToTarget).toBe(before);
    expect(actor.runtime.pos).toEqual({ x: 24, y: 4 });
  });

  it("applies active TargetBind positions through the target world boundary", () => {
    const actor = targetActor("p1", {
      runtime: { pos: { x: 120, y: -16 }, facing: -1 },
      targets: [{ actorId: "p2", targetId: 77, age: 0 }],
      targetBindings: [binding({ actorId: "p2", targetId: 77, remaining: 4, offset: { x: 36, y: -12 } })],
    });
    const target = targetActor("p2", {
      runtime: { pos: { x: 0, y: 0 }, hitVars: { isBound: false } },
    });

    const result = applyRuntimeTargetBindings(actor, [target]);

    expect(result).toEqual({ appliedBindings: 1 });
    expect(target.runtime.pos).toEqual({ x: 84, y: -28 });
    expect(target.runtime.hitVars?.isBound).toBe(true);

    actor.targets = [];
    target.runtime.pos = { x: 0, y: 0 };
    expect(applyRuntimeTargetBindings(actor, [target])).toEqual({ appliedBindings: 0 });
    expect(target.runtime.pos).toEqual({ x: 0, y: 0 });
    expect(target.runtime.hitVars?.isBound).toBe(false);
  });

  it("applies active BindToTarget positions and ignores missing targets without mutation", () => {
    const actor = targetActor("p1", {
      runtime: { pos: { x: 0, y: 0 } },
      targets: [{ actorId: "p2", targetId: 77, age: 0 }],
    });
    actor.bindToTarget = binding({ actorId: "p2", targetId: 77, remaining: 4, offset: { x: 18, y: -78 } });
    const target = targetActor("p2", {
      runtime: { pos: { x: 100, y: -20 }, facing: -1 },
    });

    expect(applyRuntimeBindToTarget(actor, [target])).toEqual({ appliedBindings: 1 });
    expect(actor.runtime.pos).toEqual({ x: 82, y: -98 });

    actor.runtime.pos = { x: 10, y: 20 };
    expect(applyRuntimeBindToTarget(actor, [targetActor("helper")])).toEqual({ appliedBindings: 0 });
    expect(actor.runtime.pos).toEqual({ x: 10, y: 20 });

    actor.targets = [];
    expect(applyRuntimeBindToTarget(actor, [target])).toEqual({ appliedBindings: 0 });
    expect(actor.runtime.pos).toEqual({ x: 10, y: 20 });
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
): RuntimeTargetWorldActor {
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

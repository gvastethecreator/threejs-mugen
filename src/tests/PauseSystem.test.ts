import { describe, expect, it } from "vitest";
import { compileControllerIr } from "../mugen/compiler/StateControllerCompiler";
import type { MugenStateController } from "../mugen/model/MugenState";
import {
  canActorMoveDuringPause,
  createMatchPauseFromController,
  RuntimeMatchPauseControllerWorld,
  RuntimePausedMatchWorld,
  RuntimePauseControllerDispatchWorld,
  RuntimePauseWorld,
  tickMatchPause,
  toMatchPauseSnapshot,
  type RuntimeMatchPause,
  type RuntimePausedMatchRuntimeActor,
} from "../mugen/runtime/PauseSystem";

describe("PauseSystem", () => {
  it("creates a bounded Pause snapshot from a CNS controller", () => {
    const result = createMatchPauseFromController(actor("p1", 200), controller("Pause", { time: "6", movetime: "2" }), 18);

    expect(result.powerDelta).toBe(0);
    expect(result.pause).toMatchObject({
      type: "Pause",
      remaining: 6,
      moveTime: 2,
      actorId: "p1",
      darken: false,
      sourceStateNo: 200,
      startedAt: 18,
    });
    expect(toMatchPauseSnapshot(result.pause!)).toEqual({
      type: "Pause",
      remaining: 6,
      moveTime: 2,
      actorId: "p1",
      darken: false,
      sourceStateNo: 200,
    });
  });

  it("creates SuperPause darken telemetry and power delta without mutating the actor", () => {
    const source = actor("p2", 3000);
    const result = createMatchPauseFromController(
      source,
      controller("SuperPause", { time: "7", movetime: "1", darken: "1", poweradd: "100" }),
      44,
    );

    expect(result.powerDelta).toBe(100);
    expect(source.runtime.stateNo).toBe(3000);
    expect(result.pause).toMatchObject({
      type: "SuperPause",
      remaining: 7,
      moveTime: 1,
      actorId: "p2",
      darken: true,
      sourceStateNo: 3000,
      startedAt: 44,
    });
  });

  it("captures SuperPause pausebg telemetry", () => {
    const result = createMatchPauseFromController(
      actor("p1", 200),
      controller("SuperPause", { time: "7", movetime: "1", pausebg: "0" }),
      10,
    );

    expect(result.pause).toMatchObject({
      type: "SuperPause",
      pauseBg: false,
      darken: true,
    });
    expect(toMatchPauseSnapshot(result.pause!)).toMatchObject({ pauseBg: false });
  });

  it("captures explicit SuperPause player animation metadata and offset", () => {
    const result = createMatchPauseFromController(
      actor("p1", 200),
      controller("SuperPause", { time: "7", movetime: "1", anim: "S200", pos: "24,-48" }),
      10,
    );

    expect(result.pause?.superAnim).toEqual({
      raw: "S200",
      source: "player",
      actionNo: 200,
      offset: { x: 24, y: -48 },
    });
    expect(toMatchPauseSnapshot(result.pause!)).toMatchObject({
      superAnim: {
        raw: "S200",
        source: "player",
        actionNo: 200,
        offset: { x: 24, y: -48 },
      },
    });
  });

  it("uses FightFX action 30 metadata when SuperPause anim is omitted", () => {
    const result = createMatchPauseFromController(
      actor("p1", 200),
      controller("SuperPause", { time: "7", movetime: "1" }),
      10,
    );

    expect(result.pause?.superAnim).toEqual({
      raw: "30",
      source: "fightfx",
      actionNo: 30,
      offset: { x: 0, y: 0 },
    });
  });

  it("omits SuperPause animation metadata when anim disables the route", () => {
    const result = createMatchPauseFromController(
      actor("p1", 200),
      controller("SuperPause", { time: "7", movetime: "1", anim: "-1", pos: "24,-48" }),
      10,
    );

    expect(result.pause?.superAnim).toBeUndefined();
  });

  it("prefers typed pause operations over raw controller params", () => {
    const result = createMatchPauseFromController(
      actor("p1", 400),
      controller("SuperPause", { time: "1", movetime: "1", darken: "1", poweradd: "10" }),
      12,
      {
        kind: "pause",
        controllerType: "superpause",
        time: 9,
        moveTime: 3,
        pauseBg: true,
        darken: false,
        powerAdd: 75,
      },
    );

    expect(result.powerDelta).toBe(75);
    expect(result.pause).toMatchObject({
      type: "SuperPause",
      remaining: 9,
      moveTime: 3,
      darken: false,
      sourceStateNo: 400,
    });
  });

  it("ignores zero-length typed pause operations", () => {
    const result = createMatchPauseFromController(actor("p1", 200), controller("Pause", { time: "10", movetime: "2" }), 0, {
      kind: "pause",
      controllerType: "pause",
      time: 0,
      moveTime: 2,
      pauseBg: true,
      darken: false,
      powerAdd: 0,
    });

    expect(result).toEqual({ powerDelta: 0 });
  });

  it("clamps pause duration and movetime to the supported sandbox range", () => {
    const result = createMatchPauseFromController(actor("p1", 1000), controller("Pause", { time: "9999", movetime: "9999" }), 0);

    expect(result.pause).toMatchObject({ remaining: 600, moveTime: 600 });
  });

  it("advances remaining frames and source movetime deterministically", () => {
    const pause = createMatchPauseFromController(actor("p1", 200), controller("Pause", { time: "2", movetime: "1" }), 0).pause!;

    const next = tickMatchPause(pause);
    expect(next).toMatchObject({ remaining: 1, moveTime: 0 });
    expect(tickMatchPause(next!)).toBeUndefined();
  });

  it("only lets the source actor move while movetime remains", () => {
    const active = createMatchPauseFromController(actor("p1", 200), controller("Pause", { time: "3", movetime: "1" }), 0).pause!;
    const expiredMoveTime = { ...active, moveTime: 0 };

    expect(canActorMoveDuringPause(active, "p1")).toBe(true);
    expect(canActorMoveDuringPause(active, "p2")).toBe(false);
    expect(canActorMoveDuringPause(expiredMoveTime, "p1")).toBe(false);
    expect(canActorMoveDuringPause(undefined, "p1")).toBe(false);
  });

  it("ignores zero-length pause controllers", () => {
    const result = createMatchPauseFromController(actor("p1", 200), controller("Pause", { time: "0", movetime: "2" }), 0);

    expect(result).toEqual({ powerDelta: 0 });
  });

  it("wraps current pause state behind RuntimePauseWorld", () => {
    const world = new RuntimePauseWorld();
    const result = world.applyController(actor("p1", 200), controller("SuperPause", { time: "3", movetime: "1", darken: "1", poweradd: "25" }), 8);

    expect(result.powerDelta).toBe(25);
    expect(world.current()).toMatchObject({ type: "SuperPause", remaining: 3, moveTime: 1, startedAt: 8 });
    expect(world.snapshot()).toEqual({
      type: "SuperPause",
      remaining: 3,
      moveTime: 1,
      actorId: "p1",
      darken: true,
      sourceStateNo: 200,
      superAnim: {
        raw: "30",
        source: "fightfx",
        actionNo: 30,
        offset: { x: 0, y: 0 },
      },
    });
    expect(world.canActorMove("p1")).toBe(true);
    expect(world.canActorMove("p2")).toBe(false);

    world.tick();
    expect(world.snapshot()).toMatchObject({ remaining: 2, moveTime: 0 });
    world.reset();
    expect(world.current()).toBeUndefined();
    expect(world.snapshot()).toBeUndefined();
  });

  it("owns match Pause/SuperPause result side effects", () => {
    const world = new RuntimeMatchPauseControllerWorld();
    const calls: string[] = [];
    const fighter = { ...actor("p1", 300), label: "P1" };
    const source = controller("SuperPause", { time: "1", movetime: "1", darken: "1", poweradd: "10" });
    const operation = {
      kind: "pause" as const,
      controllerType: "superpause" as const,
      time: 12,
      moveTime: 4,
      pauseBg: true,
      darken: true,
      powerAdd: 25,
    };

    const result = world.apply({
      actor: fighter,
      controller: source,
      operation,
      runtimeTick: 99,
      pauseWorld: {
        applyController: (activeActor, activeController, tick, activeOperation) => {
          calls.push(`apply:${activeActor.id}:${activeController.type}:${tick}:${activeOperation?.controllerType}`);
          return createMatchPauseFromController(activeActor, activeController, tick, activeOperation);
        },
      },
      applyPowerDelta: (activeActor, powerDelta) => calls.push(`power:${activeActor.id}:${powerDelta}`),
      log: (message) => calls.push(`log:${message}`),
    });

    expect(result.pause).toMatchObject({ type: "SuperPause", remaining: 12, moveTime: 4, startedAt: 99 });
    expect(result.powerDelta).toBe(25);
    expect(calls).toEqual([
      "apply:p1:SuperPause:99:superpause",
      "power:p1:25",
      "log:P1 triggered SuperPause for 12f (4f movetime)",
    ]);
  });

  it("does not run match pause side effects when a controller creates no pause", () => {
    const world = new RuntimeMatchPauseControllerWorld();
    const calls: string[] = [];
    const result = world.apply({
      actor: { ...actor("p1", 200), label: "P1" },
      controller: controller("Pause", { time: "0", movetime: "2" }),
      runtimeTick: 4,
      pauseWorld: {
        applyController: (activeActor, activeController, tick, operation) => {
          calls.push(`apply:${activeActor.id}:${activeController.type}:${tick}:${operation?.controllerType ?? "raw"}`);
          return createMatchPauseFromController(activeActor, activeController, tick, operation);
        },
      },
      applyPowerDelta: () => calls.push("power"),
      log: () => calls.push("log"),
    });

    expect(result).toEqual({ powerDelta: 0 });
    expect(calls).toEqual(["apply:p1:Pause:4:raw"]);
  });

  it("emits SuperPause sound telemetry when a sound ref is present", () => {
    const world = new RuntimeMatchPauseControllerWorld();
    const calls: string[] = [];
    const result = world.apply({
      actor: { ...actor("p1", 3000), label: "P1" },
      controller: controller("SuperPause", { time: "7", movetime: "1", sound: "Svar(0),var(1)" }),
      runtimeTick: 44,
      pauseWorld: {
        applyController: (activeActor, activeController, tick, operation) => {
          calls.push(`apply:${activeActor.id}:${activeController.type}:${tick}:${operation?.controllerType ?? "raw"}`);
          return createMatchPauseFromController(activeActor, activeController, tick, operation);
        },
      },
      applyPowerDelta: () => calls.push("power"),
      emitSound: (_activeActor, sound, runtimeTick, resolvedSound) => {
        calls.push(`sound:${sound}:${resolvedSound?.group}:${resolvedSound?.index}:${runtimeTick}`);
        return { type: "PlaySnd", group: resolvedSound?.group, index: resolvedSound?.index, raw: sound, stateNo: 3000, tick: 0, runtimeTick };
      },
      resolveSoundValue: () => ({ rawPrefix: "S", group: 10, index: 0 }),
      log: (message) => calls.push(`log:${message}`),
    });

    expect(result.pause).toMatchObject({ type: "SuperPause", remaining: 7, moveTime: 1 });
    expect(result.soundEvent).toMatchObject({ type: "PlaySnd", group: 10, index: 0, raw: "Svar(0),var(1)" });
    expect(calls).toEqual([
      "apply:p1:SuperPause:44:raw",
      "sound:Svar(0),var(1):10:0:44",
      "log:P1 triggered SuperPause for 7f (1f movetime)",
    ]);
  });

  it("applies bounded SuperPause p2defmul damage scaling to current targets", () => {
    const world = new RuntimeMatchPauseControllerWorld();
    const calls: string[] = [];
    const result = world.apply({
      actor: { ...actor("p1", 3000), label: "P1" },
      controller: controller("SuperPause", { time: "7", movetime: "1", p2defmul: "var(0)" }),
      runtimeTick: 44,
      pauseWorld: {
        applyController: (activeActor, activeController, tick, operation) => {
          calls.push(`apply:${activeActor.id}:${activeController.type}:${tick}:${operation?.controllerType ?? "raw"}`);
          return createMatchPauseFromController(activeActor, activeController, tick, operation);
        },
      },
      applyPowerDelta: () => calls.push("power"),
      resolveParams: { p2DefMul: () => 2 },
      applyTargetDefenseMultiplier: (_activeActor, multiplier) => {
        calls.push(`def:${multiplier}`);
        return 1;
      },
      log: (message) => calls.push(`log:${message}`),
    });

    expect(result.pause).toMatchObject({ type: "SuperPause", remaining: 7, moveTime: 1 });
    expect(result.targetDefenseMultiplier).toBe(0.5);
    expect(result.targetDefenseTargets).toBe(1);
    expect(calls).toEqual([
      "apply:p1:SuperPause:44:raw",
      "def:0.5",
      "log:P1 triggered SuperPause for 7f (1f movetime)",
    ]);
  });

  it("resolves dynamic SuperPause numeric params through active controller context", () => {
    const world = new RuntimeMatchPauseControllerWorld();
    const calls: string[] = [];
    const source = controller("SuperPause", {
      time: "var(2)",
      movetime: "var(3)",
      darken: "var(4)",
      poweradd: "var(5)",
    });
    const result = world.apply({
      actor: { ...actor("p1", 3000), label: "P1" },
      controller: source,
      operation: {
        kind: "pause",
        controllerType: "superpause",
        time: 0,
        moveTime: 0,
        pauseBg: true,
        darken: true,
        powerAdd: 0,
      },
      runtimeTick: 44,
      pauseWorld: {
        applyController: (activeActor, activeController, tick, operation, resolveParams) => {
          calls.push(`apply:${activeActor.id}:${activeController.type}:${tick}:${operation?.controllerType ?? "raw"}`);
          return createMatchPauseFromController(activeActor, activeController, tick, operation, resolveParams);
        },
      },
      applyPowerDelta: (activeActor, powerDelta) => calls.push(`power:${activeActor.id}:${powerDelta}`),
      resolveParams: {
        time: () => 9,
        moveTime: () => 2,
        pauseBg: () => 0,
        darken: () => 0,
        powerAdd: () => 75,
      },
      log: (message) => calls.push(`log:${message}`),
    });

    expect(result.pause).toMatchObject({ type: "SuperPause", remaining: 9, moveTime: 2, pauseBg: false, darken: false });
    expect(result.powerDelta).toBe(75);
    expect(calls).toEqual([
      "apply:p1:SuperPause:44:superpause",
      "power:p1:75",
      "log:P1 triggered SuperPause for 9f (2f movetime)",
    ]);
  });

  it("resolves dynamic SuperPause anim and pos through active controller context", () => {
    const world = new RuntimeMatchPauseControllerWorld();
    const source = controller("SuperPause", {
      time: "7",
      movetime: "1",
      anim: "var(6)",
      pos: "var(7),var(8)",
    });
    const result = world.apply({
      actor: { ...actor("p1", 3000), label: "P1" },
      controller: source,
      operation: {
        kind: "pause",
        controllerType: "superpause",
        time: 7,
        moveTime: 1,
        pauseBg: true,
        darken: true,
        powerAdd: 0,
        anim: "var(6)",
      },
      runtimeTick: 44,
      pauseWorld: {
        applyController: (activeActor, activeController, tick, operation, resolveParams) =>
          createMatchPauseFromController(activeActor, activeController, tick, operation, resolveParams),
      },
      applyPowerDelta: () => undefined,
      resolveParams: {
        animActionNo: () => 7001,
        posX: () => 18,
        posY: () => -36,
      },
      log: () => undefined,
    });

    expect(result.pause?.superAnim).toEqual({
      raw: "var(6)",
      source: "fightfx",
      actionNo: 7001,
      offset: { x: 18, y: -36 },
    });
  });

  it("dispatches active Pause controllers with telemetry hooks", () => {
    const dispatchWorld = new RuntimePauseControllerDispatchWorld();
    const source = controller("SuperPause", { time: "9", movetime: "3", darken: "0", poweradd: "75" });
    const ir = compileControllerIr(source);
    const fighter = actor("p1", 400);
    const appliedControllers: string[] = [];
    const recordedControllers: string[] = [];
    const recordedOperations: string[] = [];

    const result = dispatchWorld.apply({
      actor: fighter,
      controller: ir,
      applyController: (activeActor, activeController, operation) => {
        appliedControllers.push(`${activeController.type}:${operation?.controllerType}:${operation?.time}`);
        return createMatchPauseFromController(activeActor, activeController, 12, operation);
      },
      recordController: (_actor, activeController) => recordedControllers.push(activeController.type),
      recordOperation: (_actor, operation) => recordedOperations.push(`${operation.controllerType}:${operation.time}`),
    });

    expect(result.result?.pause).toMatchObject({
      type: "SuperPause",
      remaining: 9,
      moveTime: 3,
      darken: false,
      sourceStateNo: 400,
    });
    expect(result.result?.powerDelta).toBe(75);
    expect(appliedControllers).toEqual(["SuperPause:superpause:9"]);
    expect(recordedControllers).toEqual(["SuperPause"]);
    expect(recordedOperations).toEqual(["superpause:9"]);
    expect(result).toMatchObject({ recordedController: true, recordedOperation: true });
  });

  it("owns paused-match source movetime ordering and freezes the non-moving actor", () => {
    const world = new RuntimePausedMatchWorld();
    const calls: string[] = [];
    const pause = runtimePause("p1", { remaining: 3, moveTime: 1 });
    const p1 = pausedActor("p1");
    const p2 = pausedActor("p2");

    const result = world.advance({
      p1,
      p2,
      p1Input: new Set(["F"]),
      p2Input: new Set(["B"]),
      p2Controlled: false,
      currentPause: () => pause,
      canActorMove: (actorId) => actorId === "p1",
      pushCommandBuffer: (actor, input) => calls.push(`buffer:${actor.id}:${[...input].join("+")}`),
      handlePlayerInput: (actor, _input, opponent) => calls.push(`player:${actor.id}:${opponent.id}`),
      handleAi: (actor, opponent) => calls.push(`ai:${actor.id}:${opponent.id}`),
      advanceFighter: (actor, opponent) => calls.push(`fighter:${actor.id}:${opponent.id}`),
      advanceTargetMemory: (actor) => calls.push(`target-memory:${actor.id}`),
      advanceActiveEffects: (actor) => calls.push(`active-effects:${actor.id}`),
      advancePresentationEffects: (actor) => calls.push(`presentation:${actor.id}`),
      applyTargetBindings: (actor, opponent) => calls.push(`target-bind:${actor.id}:${opponent.id}`),
      applyBindToTarget: (actor, opponent) => calls.push(`bind-to-target:${actor.id}:${opponent.id}`),
      clampToStage: (actor) => calls.push(`clamp:${actor.id}`),
      advancePausedPresentation: (actor, activePause) => calls.push(`paused-presentation:${actor.id}:${activePause.type}`),
      tickPause: () => {
        calls.push("tick-pause");
        return undefined;
      },
    });

    expect(result).toEqual({ paused: true, sourceActorId: "p1", actorMoved: true, interrupted: false, ticked: true });
    expect(calls).toEqual([
      "buffer:p1:F",
      "buffer:p2:B",
      "player:p1:p2",
      "fighter:p1:p2",
      "target-memory:p1",
      "active-effects:p1",
      "presentation:p1",
      "target-bind:p1:p2",
      "bind-to-target:p1:p2",
      "clamp:p1",
      "paused-presentation:p2:Pause",
      "tick-pause",
    ]);
  });

  it("ticks paused presentation for both actors when source movetime is spent", () => {
    const world = new RuntimePausedMatchWorld();
    const calls: string[] = [];
    const pause = runtimePause("p2", { remaining: 2, moveTime: 0 });
    const p1 = pausedActor("p1");
    const p2 = pausedActor("p2");

    const result = world.advance({
      p1,
      p2,
      p1Input: new Set(),
      p2Input: new Set(["x"]),
      p2Controlled: true,
      currentPause: () => pause,
      canActorMove: () => false,
      pushCommandBuffer: (actor) => calls.push(`buffer:${actor.id}`),
      handlePlayerInput: (actor) => calls.push(`player:${actor.id}`),
      handleAi: (actor) => calls.push(`ai:${actor.id}`),
      advanceFighter: (actor) => calls.push(`fighter:${actor.id}`),
      advanceTargetMemory: (actor) => calls.push(`target-memory:${actor.id}`),
      advanceActiveEffects: (actor) => calls.push(`active-effects:${actor.id}`),
      advancePresentationEffects: (actor) => calls.push(`presentation:${actor.id}`),
      applyTargetBindings: (actor) => calls.push(`target-bind:${actor.id}`),
      applyBindToTarget: (actor) => calls.push(`bind-to-target:${actor.id}`),
      clampToStage: (actor) => calls.push(`clamp:${actor.id}`),
      advancePausedPresentation: (actor) => calls.push(`paused-presentation:${actor.id}`),
      tickPause: () => {
        calls.push("tick-pause");
        return undefined;
      },
    });

    expect(result).toEqual({ paused: true, sourceActorId: "p2", actorMoved: false, interrupted: false, ticked: true });
    expect(calls).toEqual(["buffer:p1", "buffer:p2", "paused-presentation:p1", "paused-presentation:p2", "tick-pause"]);
  });

  it("wires paused runtime target, effect lifecycle, and constraint systems", () => {
    const world = new RuntimePausedMatchWorld();
    const calls: string[] = [];
    const activeLifecycleOptions: Array<{
      actorId: string;
      opponentId?: string;
      opponents: string[];
      stageTime?: number;
      runtimeTick?: number;
    }> = [];
    const pausedLifecycleOptions: Array<{
      actorId: string;
      pauseKind: string;
      opponentId?: string;
      opponents: string[];
      stageTime?: number;
      runtimeTick?: number;
    }> = [];
    const pause = runtimePause("p1", { remaining: 3, moveTime: 1 });
    const p1 = runtimePausedActor("p1", 1, calls);
    const p2 = runtimePausedActor("p2", 2, calls);
    const runtimeLabels = new Map<object, string>([
      [p1.runtime, p1.id],
      [p2.runtime, p2.id],
    ]);
    const runtimeLabel = (runtime: object) => runtimeLabels.get(runtime) ?? "unknown";

    const result = world.advanceRuntime({
      p1,
      p2,
      p1Input: new Set(["F"]),
      p2Input: new Set(["B"]),
      p2Controlled: false,
      stage: { bounds: { left: -160, right: 160 } },
      stageTime: 111,
      runtimeTick: 222,
      actorConstraintWorld: {
        clampToStage: (runtime) => calls.push(`clamp:${runtimeLabel(runtime)}`),
      },
      effectLifecycleWorld: {
        advanceActive: (actor, _stage, opponent, options) => {
          calls.push(`active-effects:${actor.id}`);
          activeLifecycleOptions.push({
            actorId: actor.id,
            opponentId: opponent?.id,
            opponents: options?.opponents?.map((entry) => entry.id ?? "none") ?? [],
            stageTime: options?.stageTime,
            runtimeTick: options?.runtimeTick,
          });
        },
        advancePresentation: (actor) => calls.push(`presentation:${actor.id}`),
        advancePausedPresentation: (actor, pauseKind, _stage, opponent, options) => {
          calls.push(`paused-presentation:${actor.id}:${pauseKind}`);
          pausedLifecycleOptions.push({
            actorId: actor.id,
            pauseKind,
            opponentId: opponent?.id,
            opponents: options?.opponents?.map((entry) => entry.id ?? "none") ?? [],
            stageTime: options?.stageTime,
            runtimeTick: options?.runtimeTick,
          });
        },
      },
      currentPause: () => pause,
      canActorMove: (actorId) => actorId === "p1",
      pushCommandBuffer: (actor, input) => calls.push(`buffer:${actor.id}:${[...input].join("+")}`),
      handlePlayerInput: (actor, _input, opponent) => calls.push(`player:${actor.id}:${opponent.id}`),
      handleAi: (actor, opponent) => calls.push(`ai:${actor.id}:${opponent.id}`),
      advanceFighter: (actor, opponent) => calls.push(`fighter:${actor.id}:${opponent.id}`),
      tickPause: () => {
        calls.push("tick-pause");
        return undefined;
      },
    });

    expect(result).toEqual({ paused: true, sourceActorId: "p1", actorMoved: true, interrupted: false, ticked: true });
    expect(calls).toEqual([
      "buffer:p1:F",
      "buffer:p2:B",
      "player:p1:p2",
      "fighter:p1:p2",
      "target-memory:p1",
      "active-effects:p1",
      "presentation:p1",
      "target-bind:p1:p2",
      "bind-to-target:p1:p2",
      "clamp:p1",
      "paused-presentation:p2:Pause",
      "tick-pause",
    ]);
    expect(activeLifecycleOptions).toEqual([
      { actorId: "p1", opponentId: "p2", opponents: ["p2"], stageTime: 111, runtimeTick: 222 },
    ]);
    expect(pausedLifecycleOptions).toEqual([
      { actorId: "p2", pauseKind: "Pause", opponentId: "p1", opponents: ["p1"], stageTime: 111, runtimeTick: 222 },
    ]);
  });

  it("stops paused-match presentation ticking when callbacks replace the active pause", () => {
    const world = new RuntimePausedMatchWorld();
    const calls: string[] = [];
    const firstPause = runtimePause("p1", { remaining: 4, moveTime: 2 });
    let currentPause: RuntimeMatchPause | undefined = firstPause;
    const p1 = pausedActor("p1");
    const p2 = pausedActor("p2");

    const result = world.advance({
      p1,
      p2,
      p1Input: new Set(),
      p2Input: new Set(),
      p2Controlled: false,
      currentPause: () => currentPause,
      canActorMove: () => true,
      pushCommandBuffer: (actor) => calls.push(`buffer:${actor.id}`),
      handlePlayerInput: (actor) => calls.push(`player:${actor.id}`),
      handleAi: (actor) => calls.push(`ai:${actor.id}`),
      advanceFighter: (actor) => {
        calls.push(`fighter:${actor.id}`);
        currentPause = runtimePause("p2", { remaining: 6, moveTime: 0 });
      },
      advanceTargetMemory: (actor) => calls.push(`target-memory:${actor.id}`),
      advanceActiveEffects: (actor) => calls.push(`active-effects:${actor.id}`),
      advancePresentationEffects: (actor) => calls.push(`presentation:${actor.id}`),
      applyTargetBindings: (actor) => calls.push(`target-bind:${actor.id}`),
      applyBindToTarget: (actor) => calls.push(`bind-to-target:${actor.id}`),
      clampToStage: (actor) => calls.push(`clamp:${actor.id}`),
      advancePausedPresentation: (actor) => calls.push(`paused-presentation:${actor.id}`),
      tickPause: () => {
        calls.push("tick-pause");
        return currentPause;
      },
    });

    expect(result).toEqual({ paused: true, sourceActorId: "p1", actorMoved: true, interrupted: true, ticked: false });
    expect(calls).toEqual([
      "buffer:p1",
      "buffer:p2",
      "player:p1",
      "fighter:p1",
      "target-memory:p1",
      "active-effects:p1",
      "presentation:p1",
      "target-bind:p1",
      "bind-to-target:p1",
      "clamp:p1",
    ]);
  });
});

function actor(id: string, stateNo: number) {
  return { id, runtime: { stateNo } };
}

function pausedActor(id: string) {
  return { id };
}

function runtimePausedActor(id: string, x: number, calls: string[]): RuntimePausedMatchRuntimeActor {
  const runtime = {
    pos: { x, y: 0 },
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
  };
  return {
    id,
    runtime,
    targets: [],
    targetBindings: [],
    targetWorld: {
      advance: (actor) => calls.push(`target-memory:${actor.id}`),
      applyTargetBindings: (actor, candidates) => {
        calls.push(`target-bind:${actor.id}:${candidates[0]?.id ?? "none"}`);
        return { appliedBindings: 1 };
      },
      applyBindToTarget: (actor, candidates) => {
        calls.push(`bind-to-target:${actor.id}:${candidates[0]?.id ?? "none"}`);
        return { appliedBindings: 1 };
      },
    },
    effectActorWorld: {
      advanceActiveEffects: () => undefined,
      advancePresentationEffects: () => undefined,
      explodSnapshots: () => [],
      helperSnapshots: () => [],
      projectileSnapshots: () => [],
      removeExplodsOnGetHit: () => undefined,
    },
  } as RuntimePausedMatchRuntimeActor;
}

function runtimePause(actorId: string, overrides: Partial<RuntimeMatchPause> = {}): RuntimeMatchPause {
  return {
    type: "Pause",
    remaining: 3,
    moveTime: 0,
    actorId,
    darken: false,
    sourceStateNo: 200,
    startedAt: 10,
    ...overrides,
  };
}

function controller(type: string, params: Record<string, string>): MugenStateController {
  return {
    stateId: 200,
    type,
    params,
    triggers: [],
    line: 1,
    rawHeader: `[State 200, ${type}]`,
  };
}

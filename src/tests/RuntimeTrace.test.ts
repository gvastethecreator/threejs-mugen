import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
import { MugenCharacterLoader } from "../mugen/loader/MugenCharacterLoader";
import { ZipCharacterSource } from "../mugen/loader/ZipCharacterSource";
import { parseCmd } from "../mugen/parsers/CmdParser";
import { parseCns } from "../mugen/parsers/CnsParser";
import { demoFighters } from "../mugen/runtime/demoFighters";
import type { DemoFighterDefinition, DemoMove } from "../mugen/runtime/demoFighters";
import { trainingStage } from "../mugen/runtime/demoStage";
import { createImportedFighterDefinition } from "../mugen/runtime/importedFighter";
import { PlayableMatchRuntime } from "../mugen/runtime/PlayableMatchRuntime";
import {
  evaluateRuntimeTraceGate,
  expandRuntimeTraceScript,
  runRuntimeTrace,
  type RuntimeTraceInputFrame,
} from "../mugen/runtime/RuntimeTrace";

const closeStage = {
  ...trainingStage,
  playerStart: {
    p1: { x: -20, y: 0, facing: 1 as const },
    p2: { x: 35, y: 0, facing: -1 as const },
  },
};

const kfmFixturePath = resolve(process.cwd(), ".scratch/fixtures/kfm-official.zip");
const itWithKfmFixture = existsSync(kfmFixturePath) ? it : it.skip;

describe("RuntimeTrace", () => {
  it("expands compact replay script segments into frame inputs", () => {
    expect(
      expandRuntimeTraceScript([
        { label: "walk", frames: 2, p1: ["F"], p2: [] },
        { label: "attack", frames: 3, p1: ["a"], p2: [], force: true },
      ]),
    ).toEqual([
      { label: "walk", p1: ["F"], p2: [], force: undefined },
      { label: undefined, p1: ["F"], p2: [], force: undefined },
      { label: "attack", p1: ["a"], p2: [], force: true },
      { label: undefined, p1: ["a"], p2: [], force: true },
      { label: undefined, p1: ["a"], p2: [], force: true },
    ]);
  });

  it("records deterministic frame checksums for the same replay inputs", () => {
    const script = traceAttackScript();
    const first = runRuntimeTrace(new PlayableMatchRuntime(demoFighters[0]!, demoFighters[1]!, closeStage), script, {
      label: "native-close-kick",
    });
    const second = runRuntimeTrace(new PlayableMatchRuntime(demoFighters[0]!, demoFighters[1]!, closeStage), script, {
      label: "native-close-kick",
    });

    expect(first.checksum).toBe(second.checksum);
    expect(first.frames.map((frame) => frame.checksum)).toEqual(second.frames.map((frame) => frame.checksum));
    expect(first.final.actors[0]).toMatchObject({
      actorKind: "player",
      ownerId: "p1",
      rootId: "p1",
      parentId: "p1",
    });
    expect(first.final.actors[1]?.life).toBeLessThan(1000);
    expect(first.events.some((event) => event.category === "hit")).toBe(true);
    expect(first.events.some((event) => event.line.includes("Nova Boxer hit Mira Volt"))).toBe(true);
    expect(
      evaluateRuntimeTraceGate(first, {
        label: "native-hit-gate",
        requiredActorSources: ["demo"],
        requiredActorKinds: ["player"],
        requiredEventCategories: ["hit"],
      }),
    ).toMatchObject({ passed: true, failures: [] });
  });

  it("carries schedule diagnostics without changing behavior checksums", () => {
    const script = expandRuntimeTraceScript([{ label: "idle", frames: 2, p1: [], p2: [] }]);
    const baseline = runRuntimeTrace(new PlayableMatchRuntime(demoFighters[0]!, demoFighters[1]!, closeStage), script, {
      label: "schedule-checksum-projection",
    });
    const diagnosticVariant = runRuntimeTrace(
      runtimeWithoutRecordedSchedulePhases(new PlayableMatchRuntime(demoFighters[0]!, demoFighters[1]!, closeStage)),
      script,
      { label: "schedule-checksum-projection" },
    );

    expect(baseline.frames[0]?.tickSchedule?.phases.length).toBeGreaterThan(0);
    expect(diagnosticVariant.frames[0]?.tickSchedule?.phases).toEqual([]);
    expect(diagnosticVariant.frames.map((frame) => frame.checksum)).toEqual(
      baseline.frames.map((frame) => frame.checksum),
    );
    expect(diagnosticVariant.checksum).toBe(baseline.checksum);
  });

  it("changes the trace checksum when the replay input path changes", () => {
    const kickTrace = runRuntimeTrace(new PlayableMatchRuntime(demoFighters[0]!, demoFighters[1]!, closeStage), traceAttackScript(), {
      label: "native-close-kick",
    });
    const crouchTrace = runRuntimeTrace(
      new PlayableMatchRuntime(demoFighters[0]!, demoFighters[1]!, closeStage),
      expandRuntimeTraceScript([{ label: "hold-crouch", frames: 16, p1: ["D"], p2: [] }]),
      { label: "native-close-crouch" },
    );

    expect(crouchTrace.checksum).not.toBe(kickTrace.checksum);
    expect(crouchTrace.final.actors[0]?.stateNo).toBe(10);
    expect(crouchTrace.events).toEqual([]);

    const finalStateGate = evaluateRuntimeTraceGate(crouchTrace, {
      label: "native-final-crouch-gate",
      requiredFinalActors: [{ actorId: "p1", source: "demo", actorKind: "player", stateNo: 10, animNo: 10 }],
    });
    const failingFinalStateGate = evaluateRuntimeTraceGate(crouchTrace, {
      label: "native-final-idle-gate",
      requiredFinalActors: [{ actorId: "p1", source: "demo", actorKind: "player", stateNo: 0 }],
    });

    expect(finalStateGate.failures).toEqual([]);
    expect(finalStateGate.evidence.finalActors[0]).toMatchObject({ id: "p1", source: "demo", stateNo: 10 });
    expect(failingFinalStateGate.failures).toContain("Final actor p1 stateNo expected 0 (actual 10)");
  });

  it("evaluates imported CMD/CNS execution as a trace gate", () => {
    const imported = createTraceImportedFixture();
    const trace = runRuntimeTrace(
      new PlayableMatchRuntime(imported, demoFighters[1]!, closeStage),
      expandRuntimeTraceScript([{ label: "imported-x", frames: 8, p1: ["x"], p2: [] }]),
      { label: "imported-fixture-x" },
    );

    const gate = evaluateRuntimeTraceGate(trace, {
      label: "imported-fixture-gate",
      requiredActorSources: ["imported"],
      requiredActorKinds: ["player"],
      requiredRoutedStates: [200],
      requiredExecutedStates: [200],
      requiredExecutedControllers: ["ChangeState", "HitDef"],
      requiredExecutedOperations: ["hitdef"],
      requiredControllerEventSequences: [
        {
          label: "imported-x-controller-order",
          actorId: "p1",
          allowSameTick: true,
          steps: [
            { controller: "ChangeState", name: "Stand Light Punch" },
            { stateNo: 200, controller: "HitDef", name: "HitDef" },
            { stateNo: 200, operation: "hitdef" },
          ],
        },
      ],
      requiredActiveCommands: ["x"],
      requiredEventCategories: ["hit"],
    });

    expect(gate.failures).toEqual([]);
    expect(gate.evidence).toMatchObject({
      actorSources: ["demo", "imported"],
      routedStates: [200],
      activeCommands: ["x"],
    });
    expect(gate.evidence.executedControllers.HitDef).toBeGreaterThanOrEqual(1);
    expect(gate.evidence.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(gate.evidence.controllerEvents.map((event) => event.controller)).toContain("ChangeState");
    expect(gate.evidence.controllerEvents.map((event) => event.operation).filter(Boolean)).toContain("hitdef");
    expect(trace.final.actors[1]?.life).toBeLessThan(1000);

    const forbiddenGate = evaluateRuntimeTraceGate(trace, {
      label: "imported-fixture-forbidden-state-gate",
      forbiddenExecutedStates: [200],
    });
    expect(forbiddenGate.failures).toContain("Forbidden executed state: 200");
  });

  itWithKfmFixture("evaluates optional official KFM imported runtime trace when the local fixture is present", async () => {
    const imported = await loadImportedFighterFromZip(kfmFixturePath);
    const trace = runRuntimeTrace(
      new PlayableMatchRuntime(imported, demoFighters[1]!, closeStage),
      expandRuntimeTraceScript([{ label: "kfm-x", frames: 12, p1: ["x"], p2: [] }]),
      { label: "kfm-official-x" },
    );

    const gate = evaluateRuntimeTraceGate(trace, {
      label: "kfm-official-x-gate",
      requiredActorSources: ["imported"],
      requiredActorKinds: ["player"],
      requiredRoutedStates: [200],
      requiredExecutedStates: [200],
      requiredExecutedControllers: ["ChangeState", "HitDef"],
      requiredActiveCommands: ["x"],
      requiredEventCategories: ["hit"],
      requiredFinalActors: [{ actorId: "p2", actorKind: "player", source: "demo", animNo: 500, moveType: "H" }],
    });

    expect(gate.failures).toEqual([]);
    expect(trace.final.actors[0]).toMatchObject({
      source: "imported",
      actorKind: "player",
      ownerId: "p1",
    });
  });

  itWithKfmFixture("evaluates optional official KFM QCF special trace when the local fixture is present", async () => {
    const imported = await loadImportedFighterFromZip(kfmFixturePath);
    const trace = runRuntimeTrace(new PlayableMatchRuntime(imported, demoFighters[1]!, closeStage), kfmQcfXScript(), {
      label: "kfm-official-qcf-x",
    });

    const gate = evaluateRuntimeTraceGate(trace, {
      label: "kfm-official-qcf-x-gate",
      requiredActorSources: ["imported"],
      requiredActorKinds: ["player"],
      requiredRoutedStates: [1000],
      requiredExecutedStates: [1000],
      requiredExecutedControllers: ["ChangeState", { type: "PosAdd", minCount: 1 }],
      requiredActiveCommands: ["QCF_x", "x"],
    });

    expect(gate.failures).toEqual([]);
    expect(trace.final.actors[0]).toMatchObject({
      source: "imported",
      stateNo: 1000,
      animNo: 1000,
    });
  });

  itWithKfmFixture("evaluates optional official KFM x recovery back to idle when the local fixture is present", async () => {
    const imported = await loadImportedFighterFromZip(kfmFixturePath);
    const trace = runRuntimeTrace(new PlayableMatchRuntime(imported, demoFighters[1]!, closeStage), kfmXStateExitScript(), {
      label: "kfm-official-x-state-exit",
    });

    const gate = evaluateRuntimeTraceGate(trace, {
      label: "kfm-official-x-state-exit-gate",
      requiredActorSources: ["imported"],
      requiredActorKinds: ["player"],
      requiredRoutedStates: [200],
      requiredExecutedStates: [200],
      requiredExecutedControllers: ["ChangeState", "HitDef"],
      requiredActiveCommands: ["x"],
      requiredEventCategories: ["hit"],
      requiredFinalActors: [
        {
          actorId: "p1",
          source: "imported",
          actorKind: "player",
          stateNo: 0,
          animNo: 0,
          ctrl: true,
          moveType: "I",
        },
      ],
    });

    expect(gate.failures).toEqual([]);
    expect(trace.final.actors[0]).toMatchObject({
      source: "imported",
      stateNo: 0,
      animNo: 0,
      ctrl: true,
      moveType: "I",
    });
  });
});

function traceAttackScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([{ label: "hold-kick", frames: 16, p1: ["a"], p2: [] }]);
}

function runtimeWithoutRecordedSchedulePhases(runtime: PlayableMatchRuntime) {
  const withoutPhases = (snapshot: ReturnType<PlayableMatchRuntime["getSnapshot"]>) => {
    if (snapshot.tickSchedule) {
      snapshot.tickSchedule.phases = [];
    }
    return snapshot;
  };

  return {
    getSnapshot: () => withoutPhases(runtime.getSnapshot()),
    step: (...args: Parameters<PlayableMatchRuntime["step"]>) => withoutPhases(runtime.step(...args)),
  };
}

function kfmQcfXScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "qcf-d", frames: 2, p1: ["D"], p2: [] },
    { label: "qcf-df", frames: 2, p1: ["D", "F"], p2: [] },
    { label: "qcf-f", frames: 2, p1: ["F"], p2: [] },
    { label: "qcf-x", frames: 1, p1: ["x"], p2: [] },
    { label: "settle", frames: 2, p1: [], p2: [] },
  ]);
}

function kfmXStateExitScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "kfm-x", frames: 12, p1: ["x"], p2: [] },
    { label: "state-exit-settle", frames: 24, p1: [], p2: [] },
  ]);
}

function createTraceImportedFixture(): DemoFighterDefinition {
  const commands = parseCmd(`
[Command]
name = "x"
command = x
time = 5
`).commands;
  const stateEntryControllers = parseCns(`
[State -1, Stand Light Punch]
type = ChangeState
value = 200
triggerall = command = "x"
trigger1 = ctrl
`).controllers;
  const stateFile = parseCns(`
[Statedef 0]
type = S
movetype = I
physics = S
anim = 0
ctrl = 1

[Statedef 200]
type = S
movetype = A
physics = S
anim = 200
ctrl = 0

[State 200, HitDef]
type = HitDef
trigger1 = Time = 1
attr = S, NA
damage = 37
pausetime = 4,4
ground.hittime = 9
ground.velocity = -3
`);
  const move: DemoMove = {
    actionId: 200,
    startup: 1,
    activeStart: 1,
    activeEnd: 4,
    recovery: 18,
    damage: 37,
    hitPause: 4,
    hitStun: 9,
    push: 3,
    hitbox: { x1: 12, y1: -70, x2: 76, y2: -35 },
  };

  return {
    id: "imported-trace-fixture",
    source: "imported",
    displayName: "Imported Trace Fixture",
    palette: "#fff",
    spriteGroupBase: 0,
    speed: 3,
    jumpVelocity: -9,
    idleAction: 0,
    walkAction: 20,
    crouchAction: 10,
    jumpAction: 40,
    hitstunAction: 500,
    moves: { punch: move, kick: { ...move, actionId: 230 } },
    stateMoves: new Map([[200, move]]),
    states: stateFile.states,
    stateEntryControllers,
    commands,
    animations: new Map([
      [0, traceAction(0)],
      [10, traceAction(10)],
      [20, traceAction(20)],
      [40, traceAction(40)],
      [200, traceAction(200)],
      [230, traceAction(230)],
      [500, traceAction(500)],
    ]),
  };
}

function traceAction(id: number): MugenAnimationAction {
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
        clsn1: id === 200 ? [{ x1: 12, y1: -70, x2: 76, y2: -35 }] : [],
        clsn2: [{ x1: -20, y1: -80, x2: 20, y2: 0 }],
        raw: `${id},0,0,0,4`,
        line: 1,
      },
    ],
  };
}

async function loadImportedFighterFromZip(path: string): Promise<DemoFighterDefinition> {
  const bytes = readFileSync(path);
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  const file = new File([buffer], path.split(/[\\/]/).at(-1) ?? "character.zip");
  const vfs = await new ZipCharacterSource(file).load();
  const character = await new MugenCharacterLoader().load(file.name, vfs);
  const imported = createImportedFighterDefinition(character);
  if (!imported) {
    throw new Error(`Fixture did not produce an imported runtime fighter: ${path}`);
  }
  return imported;
}

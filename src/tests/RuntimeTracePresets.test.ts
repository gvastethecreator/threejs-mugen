import { describe, expect, it } from "vitest";
import type { MugenAnimationAction } from "../mugen/model/MugenAnimation";
import { parseCmd } from "../mugen/parsers/CmdParser";
import { parseCns } from "../mugen/parsers/CnsParser";
import { demoFighters, type DemoFighterDefinition, type DemoMove } from "../mugen/runtime/demoFighters";
import { trainingStage } from "../mugen/runtime/demoStage";
import { createMatchSmokeTraceArtifact } from "../mugen/runtime/RuntimeTracePresets";

describe("RuntimeTracePresets", () => {
  it("creates a passed native match smoke trace artifact", () => {
    const artifact = createMatchSmokeTraceArtifact({
      p1: demoFighters[0]!,
      p2: demoFighters[1]!,
      stage: trainingStage,
      generatedAt: "2026-06-25T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      schemaVersion: "runtime-trace-artifact/v0",
      status: "passed",
      target: {
        source: "native",
      },
      gates: [
        {
          label: "native-runtime-smoke",
          passed: true,
          failures: [],
        },
      ],
    });
    expect(artifact.script?.map((frame) => frame.label).filter(Boolean)).toEqual([
      "native-idle",
      "native-step-forward",
      "native-neutral",
    ]);
  });

  it("creates a passed imported x-route smoke trace artifact when the imported command routes", () => {
    const imported = importedTraceFighter();
    const artifact = createMatchSmokeTraceArtifact({
      p1: imported,
      p2: demoFighters[1]!,
      stage: trainingStage,
      generatedAt: "2026-06-25T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        source: "mixed",
      },
      gates: [
        {
          label: "imported-x-route-smoke",
          passed: true,
          failures: [],
        },
      ],
    });
    expect(artifact.gates[0]?.evidence.actorSources).toEqual(["demo", "imported"]);
    expect(artifact.gates[0]?.evidence.activeCommands).toContain("x");
  });
});

function importedTraceFighter(): DemoFighterDefinition {
  const commands = parseCmd(`
[Command]
name = "x"
command = x
time = 5
`).commands;
  const stateEntryControllers = parseCns(`
[State -1, Trace Punch]
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
`);
  const move: DemoMove = {
    actionId: 200,
    startup: 1,
    activeStart: 1,
    activeEnd: 4,
    recovery: 16,
    damage: 20,
    hitPause: 4,
    hitStun: 8,
    push: 3,
    hitbox: { x1: 12, y1: -70, x2: 76, y2: -35 },
  };

  return {
    id: "imported-trace-preset",
    source: "imported",
    displayName: "Imported Trace Preset",
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
      [0, action(0)],
      [20, action(20)],
      [200, action(200)],
      [230, action(230)],
      [500, action(500)],
    ]),
  };
}

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
        clsn1: id === 200 ? [{ x1: 12, y1: -70, x2: 76, y2: -35 }] : [],
        clsn2: [{ x1: -20, y1: -80, x2: 20, y2: 0 }],
        raw: `${id},0,0,0,4`,
        line: 1,
      },
    ],
  };
}

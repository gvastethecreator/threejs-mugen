import { describe, expect, it } from "vitest";
import type { ControllerOp } from "../mugen/compiler/ControllerOps";
import type { MugenCommand } from "../mugen/model/MugenCommand";
import type { MugenStateController } from "../mugen/model/MugenState";
import {
  RuntimeCompatibilityTelemetryWorld,
  type RuntimeCompatibilityTelemetryActor,
} from "../mugen/runtime/RuntimeCompatibilityTelemetrySystem";

describe("RuntimeCompatibilityTelemetryWorld", () => {
  it("records controller and operation telemetry only for imported actors or imported state owners", () => {
    const world = new RuntimeCompatibilityTelemetryWorld();
    const localActor = actor("demo");
    const ownedByImported = actor("demo", { stateOwnerSource: "imported" });
    const controller = stateController("VelSet", "Apply Velocity");

    world.recordController(localActor, controller);
    world.recordController(ownedByImported, controller);
    world.recordOperation(ownedByImported, { kind: "kinematic", controllerType: "velset", x: 3 } as ControllerOp);

    expect(localActor.executedControllerCounts).toEqual({});
    expect(ownedByImported.executedControllerCounts.VelSet).toBe(1);
    expect(ownedByImported.executedOperationCounts["kinematic:velset"]).toBe(1);
    expect(ownedByImported.controllerEvents).toEqual([
      expect.objectContaining({ controller: "VelSet", name: "Apply Velocity", stateNo: 200 }),
      expect.objectContaining({ controller: "kinematic:velset", operation: "kinematic:velset", stateNo: 200 }),
    ]);
  });

  it("owns state-entry routing and compatibility session projection", () => {
    const world = new RuntimeCompatibilityTelemetryWorld();
    const actorWithCommands = actor("imported", { activeCommand: "hadouken" });
    const controller = stateController("ChangeState", "Route Hadouken");

    world.recordStateExecution(actorWithCommands, 0);
    world.recordStateExecution(actorWithCommands, 200);
    world.recordStateEntryRoute(actorWithCommands, controller, 200);

    const session = world.buildSession([actorWithCommands]);

    expect(session?.actors).toHaveLength(1);
    expect(session?.actors[0]).toMatchObject({
      actorId: "p1",
      source: "imported",
      executedStates: [0, 200],
      routedStateEntries: 1,
      routedStates: [200],
      activeCommands: ["hadouken"],
      lastRoutedState: { stateId: 200, name: "Route Hadouken" },
      lastExecutedState: 200,
      executedControllers: { ChangeState: 1 },
    });
    expect(session?.actors[0]?.commandHistory).toEqual([{ frame: 12, values: ["D", "F", "x"], hitPause: false }]);
  });

  it("caps controller-event history while preserving the newest events", () => {
    const world = new RuntimeCompatibilityTelemetryWorld();
    const importedActor = actor("imported");

    for (let index = 0; index < 165; index += 1) {
      importedActor.compatibilityTick = index;
      importedActor.runtime.stateNo = index;
      world.recordController(importedActor, stateController(`Ctrl${index}`));
    }

    expect(importedActor.controllerEvents).toHaveLength(160);
    expect(importedActor.controllerEvents[0]).toMatchObject({ controller: "Ctrl5", tick: 5, sequence: 5 });
    expect(importedActor.controllerEvents.at(-1)).toMatchObject({ controller: "Ctrl164", tick: 164, sequence: 164 });
  });

  it("keeps controller operation keys stable for trace/session consumers", () => {
    const world = new RuntimeCompatibilityTelemetryWorld();

    expect(world.operationKey({ kind: "target", controllerType: "targetstate" } as ControllerOp)).toBe("target:targetstate");
    expect(world.operationKey({ kind: "bindtotarget", pos: [0, 0], postype: "foot", time: 1 } as ControllerOp)).toBe(
      "bindtotarget",
    );
    expect(world.operationKey({ kind: "pause", controllerType: "superpause", time: 10, moveTime: 2, darken: true, powerAdd: 0 })).toBe(
      "pause:superpause",
    );
    expect(world.operationKey({ kind: "audio", controllerType: "playsnd", value: "S5,0", channel: 2 })).toBe("audio:playsnd");
    expect(world.operationKey({ kind: "envshake", time: 16, freq: 30, ampl: -7, phase: 0.5 })).toBe("envshake");
    expect(world.operationKey({ kind: "assertspecial", flags: ["nowalk"], globalFlags: [] })).toBe("assertspecial");
    expect(world.operationKey({ kind: "eligibility", controllerType: "hitby", mode: "allow", slots: [] })).toBe(
      "eligibility:hitby",
    );
    expect(world.operationKey({ kind: "reversaldef", attr: "S,NA", hitPause: 5 })).toBe("reversaldef");
  });
});

function actor(
  source: string,
  options: { stateOwnerSource?: string; activeCommand?: string } = {},
): RuntimeCompatibilityTelemetryActor {
  const commands: MugenCommand[] = [
    command("hadouken"),
    command("hadouken"),
    command("unused"),
  ];
  return {
    id: "p1",
    label: "Kung Fu Man",
    definition: { source, commands },
    ...(options.stateOwnerSource ? { stateOwner: { definition: { source: options.stateOwnerSource } } } : {}),
    runtime: { stateNo: 200 },
    commandBuffer: {
      isCommandActive: (commandName) => commandName === options.activeCommand,
      getHistory: () => [{ frame: 12, values: ["D", "F", "x"], hitPause: false }],
    },
    executedStateIds: new Set<number>(),
    routedStateEntries: 0,
    routedStateIds: [],
    executedControllerCounts: {},
    executedOperationCounts: {},
    controllerEvents: [],
    nextControllerEventSequence: 0,
    compatibilityTick: 0,
  };
}

function stateController(type: string, name?: string): MugenStateController {
  return {
    stateId: 200,
    type,
    params: {},
    triggers: [],
    line: 1,
    rawHeader: `[State 200, ${type}]`,
    ...(name ? { name } : {}),
  };
}

function command(name: string): MugenCommand {
  return {
    name,
    sequence: [],
    rawCommand: name,
    resolvedCommand: name,
    time: 15,
    stepTime: 4,
    bufferTime: 1,
    bufferHitPause: false,
    remapped: false,
    rawParams: {},
    line: 1,
  };
}

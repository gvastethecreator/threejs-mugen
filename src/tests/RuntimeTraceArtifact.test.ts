import { describe, expect, it } from "vitest";
import { demoFighters } from "../mugen/runtime/demoFighters";
import { trainingStage } from "../mugen/runtime/demoStage";
import { PlayableMatchRuntime } from "../mugen/runtime/PlayableMatchRuntime";
import { createRuntimeTraceArtifact, serializeRuntimeTraceArtifact } from "../mugen/runtime/RuntimeTraceArtifact";
import { expandRuntimeTraceScript, runRuntimeTrace } from "../mugen/runtime/RuntimeTrace";

const closeStage = {
  ...trainingStage,
  playerStart: {
    p1: { x: -20, y: 0, facing: 1 as const },
    p2: { x: 35, y: 0, facing: -1 as const },
  },
};

describe("RuntimeTraceArtifact", () => {
  it("exports a passed runtime trace gate as a stable evidence artifact", () => {
    const script = expandRuntimeTraceScript([{ label: "punch", frames: 12, p1: ["a"], p2: [] }]);
    const trace = runRuntimeTrace(new PlayableMatchRuntime(demoFighters[0]!, demoFighters[1]!, closeStage), script, {
      label: "artifact-native-hit",
    });

    const artifact = createRuntimeTraceArtifact({
      trace,
      script,
      generatedAt: "2026-06-25T00:00:00.000Z",
      target: {
        id: "native-nova-hit",
        label: "Native Nova hit trace",
        source: "native",
      },
      gates: [
        {
          label: "native-hit",
          requiredActorSources: ["demo"],
          requiredActorKinds: ["player"],
          requiredEventCategories: ["hit"],
        },
      ],
    });

    expect(artifact).toMatchObject({
      schemaVersion: "runtime-trace-artifact/v0",
      generatedAt: "2026-06-25T00:00:00.000Z",
      status: "passed",
      target: {
        id: "native-nova-hit",
        source: "native",
      },
      trace: {
        label: "artifact-native-hit",
        frameCount: script.length,
        eventCount: 1,
      },
      gates: [
        {
          label: "native-hit",
          passed: true,
          requirements: {
            requiredActorSources: ["demo"],
            requiredActorKinds: ["player"],
            requiredEventCategories: ["hit"],
          },
          failures: [],
        },
      ],
    });
    expect(artifact.trace.frameChecksums).toHaveLength(script.length);
    expect(artifact.trace.frames).toHaveLength(script.length);
    expect(artifact.trace.frames[0]).toMatchObject({
      frameIndex: 0,
      input: { p1: ["a"], p2: [], force: false },
      actorCount: 2,
      delta: {
        checksumChanged: true,
        inputChanged: true,
        actorCountDelta: 2,
        effectCountDelta: 0,
      },
    });
    expect(artifact.trace.frames[0]?.delta?.actorChanges.map((change) => change.changes)).toEqual([["spawned"], ["spawned"]]);
    expect(artifact.trace.frames.some((frame) => frame.eventCategories.includes("hit"))).toBe(true);
    expect(artifact.trace.frames.find((frame) => frame.eventCategories.includes("hit"))?.delta?.eventCount).toBeGreaterThan(0);
    expect(artifact.trace.combatReasonCount).toBeGreaterThanOrEqual(1);
    expect(artifact.trace.combatReasons.map((reason) => reason.reason)).toContain("hit");
    expect(artifact.gates[0]?.evidence.combatReasons).toContain("hit");
    expect(artifact.trace.finalActors.map((actor) => actor.actorKind)).toEqual(["player", "player"]);
    expect(serializeRuntimeTraceArtifact(artifact)).toContain('"schemaVersion": "runtime-trace-artifact/v0"');
    expect(serializeRuntimeTraceArtifact(artifact).endsWith("\n")).toBe(true);
  });

  it("records failed gate reasons without hiding trace evidence", () => {
    const script = expandRuntimeTraceScript([{ label: "idle", frames: 2, p1: [], p2: [] }]);
    const trace = runRuntimeTrace(new PlayableMatchRuntime(demoFighters[0]!, demoFighters[1]!, closeStage), script, {
      label: "artifact-native-idle",
    });

    const artifact = createRuntimeTraceArtifact({
      trace,
      script,
      generatedAt: "2026-06-25T00:00:00.000Z",
      target: {
        id: "missing-imported-hit",
        label: "Missing imported hit trace",
        source: "native",
      },
      gates: [
        {
          label: "requires-imported-hit",
          requiredActorSources: ["imported"],
          requiredEventCategories: ["hit"],
          requiredCombatReasons: ["hit"],
          requiredExecutedOperations: ["hitdef"],
          requiredWorldLifecycleEvents: [{ type: "spawn", kind: "projectile", ownerId: "p1" }],
          requiredEffectStores: [{ ownerId: "p1", minProjectiles: 1 }],
          requiredMatchPauses: [{ type: "SuperPause", minFrames: 1 }],
          requiredMatchPauseFreezes: [{ type: "SuperPause", actorId: "p2", minFrozenFrames: 1 }],
          requiredMatchPauseAdvances: [{ type: "SuperPause", actorKind: "projectile", ownerId: "p1", minAdvancedFrames: 1 }],
          requiredTargetLinks: [{ ownerId: "p1", actorId: "p2", targetId: 77 }],
        },
      ],
    });

    expect(artifact.status).toBe("failed");
    expect(artifact.gates[0]?.requirements).toMatchObject({
      requiredActorSources: ["imported"],
      requiredEventCategories: ["hit"],
      requiredCombatReasons: ["hit"],
      requiredExecutedOperations: ["hitdef"],
      requiredWorldLifecycleEvents: [{ type: "spawn", kind: "projectile", ownerId: "p1" }],
      requiredEffectStores: [{ ownerId: "p1", minProjectiles: 1 }],
      requiredMatchPauses: [{ type: "SuperPause", minFrames: 1 }],
      requiredMatchPauseFreezes: [{ type: "SuperPause", actorId: "p2", minFrozenFrames: 1 }],
      requiredMatchPauseAdvances: [{ type: "SuperPause", actorKind: "projectile", ownerId: "p1", minAdvancedFrames: 1 }],
      requiredTargetLinks: [{ ownerId: "p1", actorId: "p2", targetId: 77 }],
    });
    expect(artifact.gates[0]?.failures).toEqual([
      "Missing actor source: imported",
      "Missing executed operation: hitdef >= 1 (actual 0)",
      "Missing event category: hit",
      "Missing combat reason: hit",
      "Missing world lifecycle event: type=spawn, kind=projectile, ownerId=p1",
      "Missing effect store: ownerId=p1, minProjectiles=1",
      "Missing match pause: type=SuperPause, minFrames=1",
      "Missing match pause freeze: type=SuperPause, actorId=p2, minFrozenFrames=1",
      "Missing match pause advance: type=SuperPause, actorKind=projectile, ownerId=p1, minAdvancedFrames=1",
      "Missing target link: ownerId=p1, actorId=p2, targetId=77",
    ]);
    expect(artifact.trace.finalActors).toHaveLength(2);
  });
});

import { describe, expect, it } from "vitest";
import { demoFighters } from "../mugen/runtime/demoFighters";
import { trainingStage } from "../mugen/runtime/demoStage";
import { PlayableMatchRuntime } from "../mugen/runtime/PlayableMatchRuntime";
import { createRuntimeTraceArtifact, serializeRuntimeTraceArtifact } from "../mugen/runtime/RuntimeTraceArtifact";
import { expandRuntimeTraceScript, runRuntimeTrace } from "../mugen/runtime/RuntimeTrace";
import type { RuntimeTrace, RuntimeTraceFrame } from "../mugen/runtime/RuntimeTrace";

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
          requiredEffectPayloads: [{ kind: "projectile", ownerId: "p1", effectId: 77, hasHit: true }],
          requiredMatchPauses: [{ type: "SuperPause", minFrames: 1 }],
          requiredMatchPauseFreezes: [{ type: "SuperPause", actorId: "p2", minFrozenFrames: 1 }],
          requiredMatchPauseAdvances: [{ type: "SuperPause", actorKind: "projectile", ownerId: "p1", minAdvancedFrames: 1 }],
          requiredTargetLinks: [
            {
              ownerId: "p1",
              actorId: "p2",
              targetId: 77,
              hasBinding: true,
              minFrames: 2,
              bindingOffsetX: 36,
              bindingOffsetY: -12,
            },
          ],
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
      requiredTargetLinks: [
        {
          ownerId: "p1",
          actorId: "p2",
          targetId: 77,
          hasBinding: true,
          minFrames: 2,
          bindingOffsetX: 36,
          bindingOffsetY: -12,
        },
      ],
    });
    expect(artifact.gates[0]?.failures).toEqual([
      "Missing actor source: imported",
      "Missing executed operation: hitdef >= 1 (actual 0)",
      "Missing event category: hit",
      "Missing combat reason: hit",
      "Missing world lifecycle event: type=spawn, kind=projectile, ownerId=p1",
      "Missing effect store: ownerId=p1, minProjectiles=1",
      "Missing effect payload: kind=projectile, ownerId=p1, effectId=77, hasHit=true",
      "Missing match pause: type=SuperPause, minFrames=1",
      "Missing match pause freeze: type=SuperPause, actorId=p2, minFrozenFrames=1",
      "Missing match pause advance: type=SuperPause, actorKind=projectile, ownerId=p1, minAdvancedFrames=1",
      "Missing target link: ownerId=p1, actorId=p2, targetId=77, hasBinding=true, minFrames=2, bindingOffsetX=36, bindingOffsetY=-12",
    ]);
    expect(artifact.trace.finalActors).toHaveLength(2);
  });

  it("gates ordered actor-frame sequences from summarized evidence", () => {
    const fall = playerActor({ animNo: 5050, moveType: "H", hitFallRecoverTime: 1 });
    const recovery = playerActor({ animNo: 5210, moveType: "I", hitFallRecoverTime: 0 });
    const trace = traceFromFrames([
      traceFrame({ frameIndex: 0, tick: 1, checksum: "fall", actors: [fall], effects: [] }),
      traceFrame({ frameIndex: 1, tick: 2, checksum: "recovery", actors: [recovery], effects: [] }),
    ]);

    const artifact = createRuntimeTraceArtifact({
      trace,
      generatedAt: "2026-06-25T00:00:00.000Z",
      target: {
        id: "synthetic-actor-frame-sequence",
        label: "Synthetic actor-frame sequence",
        source: "imported",
      },
      gates: [
        {
          label: "actor-frame-sequence",
          requiredActorFrameSequences: [
            {
              label: "5050 before 5210",
              steps: [
                { actorId: "p2", source: "imported", actorKind: "player", animNo: 5050, moveType: "H", minFrames: 1 },
                { actorId: "p2", source: "imported", actorKind: "player", animNo: 5210, moveType: "I", minFrames: 1 },
              ],
            },
          ],
        },
      ],
    });

    expect(artifact.status).toBe("passed");
    expect(artifact.gates[0]?.requirements.requiredActorFrameSequences).toEqual([
      {
        label: "5050 before 5210",
        steps: [
          { actorId: "p2", source: "imported", actorKind: "player", animNo: 5050, moveType: "H", minFrames: 1 },
          { actorId: "p2", source: "imported", actorKind: "player", animNo: 5210, moveType: "I", minFrames: 1 },
        ],
      },
    ]);
    expect(artifact.gates[0]?.failures).toEqual([]);
  });

  it("gates actor-frame down-recovery timer evidence", () => {
    const lieDown = playerActor({ animNo: 5110, moveType: "H", hitFallDownRecoverTime: 2 });
    const lieDownCountdown = playerActor({ animNo: 5110, moveType: "H", hitFallDownRecoverTime: 1 });
    const getUp = playerActor({ animNo: 5120, moveType: "I", hitFallDownRecoverTime: 0 });
    const trace = traceFromFrames([
      traceFrame({ frameIndex: 0, tick: 1, checksum: "liedown", actors: [lieDown], effects: [] }),
      traceFrame({ frameIndex: 1, tick: 2, checksum: "liedown-countdown", actors: [lieDownCountdown], effects: [] }),
      traceFrame({ frameIndex: 2, tick: 3, checksum: "get-up", actors: [getUp], effects: [] }),
    ]);

    const artifact = createRuntimeTraceArtifact({
      trace,
      generatedAt: "2026-06-25T00:00:00.000Z",
      target: {
        id: "synthetic-down-recovery-timer",
        label: "Synthetic down recovery timer",
        source: "imported",
      },
      gates: [
        {
          label: "down-recovery-timer",
          requiredActorFrames: [
            {
              actorId: "p2",
              source: "imported",
              actorKind: "player",
              animNo: 5110,
              moveType: "H",
              observedHitFallDownRecoverTimeAtLeast: 2,
              observedHitFallDownRecoverTimeAtMost: 1,
              observedHitFallDownRecoverTimeDropAtLeast: 1,
              minFrames: 2,
            },
            {
              actorId: "p2",
              source: "imported",
              actorKind: "player",
              animNo: 5120,
              moveType: "I",
              observedHitFallDownRecoverTimeAtMost: 0,
            },
          ],
        },
      ],
    });

    expect(artifact.status).toBe("passed");
    const lieDownEvidence = artifact.gates[0]?.evidence.actorFrames.find((frame) => frame.animNo === 5110);
    const getUpEvidence = artifact.gates[0]?.evidence.actorFrames.find((frame) => frame.animNo === 5120);
    expect(lieDownEvidence?.maxHitFallDownRecoverTime).toBe(2);
    expect(lieDownEvidence?.minHitFallDownRecoverTime).toBe(1);
    expect(lieDownEvidence?.firstHitFallDownRecoverTime).toBe(2);
    expect(lieDownEvidence?.lastHitFallDownRecoverTime).toBe(1);
    expect(lieDownEvidence?.frames).toBeGreaterThanOrEqual(2);
    expect(getUpEvidence?.minHitFallDownRecoverTime).toBe(0);
    expect(artifact.gates[0]?.failures).toEqual([]);
  });

  it("gates actor-frame recovery timer drop evidence", () => {
    const fall = playerActor({ animNo: 5050, moveType: "H", hitFallRecoverTime: 2 });
    const fallCountdown = playerActor({ animNo: 5050, moveType: "H", hitFallRecoverTime: 0 });
    const recovery = playerActor({ animNo: 5210, moveType: "I", hitFallRecoverTime: 0 });
    const trace = traceFromFrames([
      traceFrame({ frameIndex: 0, tick: 1, checksum: "fall", actors: [fall], effects: [] }),
      traceFrame({ frameIndex: 1, tick: 2, checksum: "fall-countdown", actors: [fallCountdown], effects: [] }),
      traceFrame({ frameIndex: 2, tick: 3, checksum: "recovery", actors: [recovery], effects: [] }),
    ]);

    const artifact = createRuntimeTraceArtifact({
      trace,
      generatedAt: "2026-06-25T00:00:00.000Z",
      target: {
        id: "synthetic-recovery-timer",
        label: "Synthetic recovery timer",
        source: "imported",
      },
      gates: [
        {
          label: "recovery-timer",
          requiredActorFrames: [
            {
              actorId: "p2",
              source: "imported",
              actorKind: "player",
              animNo: 5050,
              moveType: "H",
              observedHitFallRecoverTimeAtLeast: 2,
              observedHitFallRecoverTimeAtMost: 0,
              observedHitFallRecoverTimeDropAtLeast: 2,
              minFrames: 2,
            },
            {
              actorId: "p2",
              source: "imported",
              actorKind: "player",
              animNo: 5210,
              moveType: "I",
              observedHitFallRecoverTimeAtMost: 0,
            },
          ],
        },
      ],
    });

    expect(artifact.status).toBe("passed");
    const fallEvidence = artifact.gates[0]?.evidence.actorFrames.find((frame) => frame.animNo === 5050);
    const recoveryEvidence = artifact.gates[0]?.evidence.actorFrames.find((frame) => frame.animNo === 5210);
    expect(fallEvidence?.maxHitFallRecoverTime).toBe(2);
    expect(fallEvidence?.minHitFallRecoverTime).toBe(0);
    expect(fallEvidence?.firstHitFallRecoverTime).toBe(2);
    expect(fallEvidence?.lastHitFallRecoverTime).toBe(0);
    expect(fallEvidence?.frames).toBeGreaterThanOrEqual(2);
    expect(recoveryEvidence?.minHitFallRecoverTime).toBe(0);
    expect(artifact.gates[0]?.failures).toEqual([]);
  });

  it("gates actor-frame recovery timer still-positive minimum evidence", () => {
    const fall = playerActor({ animNo: 5050, moveType: "H", hitFallRecoverTime: 3 });
    const fallCountdown = playerActor({ animNo: 5050, moveType: "H", hitFallRecoverTime: 2 });
    const trace = traceFromFrames([
      traceFrame({ frameIndex: 0, tick: 1, checksum: "fall", actors: [fall], effects: [] }),
      traceFrame({ frameIndex: 1, tick: 2, checksum: "fall-countdown", actors: [fallCountdown], effects: [] }),
    ]);

    const artifact = createRuntimeTraceArtifact({
      trace,
      generatedAt: "2026-06-30T00:00:00.000Z",
      target: {
        id: "synthetic-recovery-timer-positive-window",
        label: "Synthetic recovery timer positive window",
        source: "imported",
      },
      gates: [
        {
          label: "recovery-timer-positive-window",
          requiredActorFrames: [
            {
              actorId: "p2",
              source: "imported",
              actorKind: "player",
              animNo: 5050,
              moveType: "H",
              observedHitFallRecoverTimeAtLeast: 3,
              observedHitFallRecoverTimeMinAtLeast: 2,
              observedHitFallRecoverTimeDropAtLeast: 1,
              minFrames: 2,
            },
          ],
        },
      ],
    });

    expect(artifact.status).toBe("passed");
    const fallEvidence = artifact.gates[0]?.evidence.actorFrames.find((frame) => frame.animNo === 5050);
    expect(fallEvidence?.maxHitFallRecoverTime).toBe(3);
    expect(fallEvidence?.minHitFallRecoverTime).toBe(2);
    expect(fallEvidence?.firstHitFallRecoverTime).toBe(3);
    expect(fallEvidence?.lastHitFallRecoverTime).toBe(2);
    expect(artifact.gates[0]?.failures).toEqual([]);
  });

  it("fails actor-frame sequence gates when frames appear out of order", () => {
    const fall = playerActor({ animNo: 5050, moveType: "H", hitFallRecoverTime: 1 });
    const recovery = playerActor({ animNo: 5210, moveType: "I", hitFallRecoverTime: 0 });
    const trace = traceFromFrames([
      traceFrame({ frameIndex: 0, tick: 1, checksum: "recovery", actors: [recovery], effects: [] }),
      traceFrame({ frameIndex: 1, tick: 2, checksum: "fall", actors: [fall], effects: [] }),
    ]);

    const artifact = createRuntimeTraceArtifact({
      trace,
      generatedAt: "2026-06-25T00:00:00.000Z",
      target: {
        id: "synthetic-actor-frame-sequence-failure",
        label: "Synthetic actor-frame sequence failure",
        source: "imported",
      },
      gates: [
        {
          label: "actor-frame-sequence",
          requiredActorFrameSequences: [
            {
              label: "5050 before 5210",
              steps: [
                { actorId: "p2", source: "imported", actorKind: "player", animNo: 5050, moveType: "H", minFrames: 1 },
                { actorId: "p2", source: "imported", actorKind: "player", animNo: 5210, moveType: "I", minFrames: 1 },
              ],
            },
          ],
        },
      ],
    });

    expect(artifact.status).toBe("failed");
    expect(artifact.gates[0]?.failures[0]).toContain("Missing actor frame sequence: 5050 before 5210");
    expect(artifact.gates[0]?.failures[0]).toContain("step 2 not after tick 2");
  });

  it("gates round snapshots from trace frame evidence", () => {
    const trace = traceFromFrames([
      traceFrame({
        frameIndex: 0,
        tick: 1,
        checksum: "fight",
        effects: [],
        round: { state: "fight", timer: 99, message: "Fight" },
      }),
      traceFrame({
        frameIndex: 1,
        tick: 2,
        checksum: "ko",
        effects: [],
        round: { state: "ko", timer: 98, winner: "P1", message: "P1 wins" },
      }),
    ]);

    const artifact = createRuntimeTraceArtifact({
      trace,
      generatedAt: "2026-06-25T00:00:00.000Z",
      target: {
        id: "synthetic-round-snapshot",
        label: "Synthetic round snapshot",
        source: "native",
      },
      gates: [
        {
          label: "round-ko",
          requiredRoundFrames: [{ state: "ko", winner: "P1", message: "P1 wins", observedTimerAtMost: 98 }],
        },
      ],
    });

    expect(artifact.status).toBe("passed");
    expect(artifact.trace.frames[1]?.round).toEqual({ state: "ko", timer: 98, winner: "P1", message: "P1 wins" });
    expect(artifact.gates[0]?.requirements.requiredRoundFrames).toEqual([
      { state: "ko", winner: "P1", message: "P1 wins", observedTimerAtMost: 98 },
    ]);
    expect(artifact.gates[0]?.evidence.roundFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          state: "ko",
          winner: "P1",
          message: "P1 wins",
          minTimer: 98,
          maxTimer: 98,
        }),
      ]),
    );
  });

  it("fails round snapshot gates when state evidence is absent", () => {
    const trace = traceFromFrames([
      traceFrame({
        frameIndex: 0,
        tick: 1,
        checksum: "fight",
        effects: [],
        round: { state: "fight", timer: 99, message: "Fight" },
      }),
    ]);

    const artifact = createRuntimeTraceArtifact({
      trace,
      generatedAt: "2026-06-25T00:00:00.000Z",
      target: {
        id: "synthetic-round-snapshot-failure",
        label: "Synthetic round snapshot failure",
        source: "native",
      },
      gates: [
        {
          label: "round-ko",
          requiredRoundFrames: [{ state: "ko", winner: "P1" }],
        },
      ],
    });

    expect(artifact.status).toBe("failed");
    expect(artifact.gates[0]?.failures).toEqual(["Missing round frame: state=ko, winner=P1"]);
  });

  it("exports effect payloads and effect field deltas without hiding actor evidence", () => {
    const projectile0 = effectActor("fx-p1-proj-1", "Nova fireball", projectileEffect({ hitsRemaining: 2, missTimeRemaining: 5 }));
    const projectile1 = effectActor(
      "fx-p1-proj-1",
      "Nova fireball",
      projectileEffect({
        hitsRemaining: 1,
        missTimeRemaining: 4,
        hasHit: true,
        removalReason: "hit",
        terminalReason: "hit",
        terminalAge: 1,
      }),
    );
    const explod0 = effectActor("fx-p1-explod-1", "Nova flash", explodEffect());
    const explod1 = effectActor(
      "fx-p1-explod-1",
      "Nova flash",
      explodEffect({
        opacity: 0.5,
        scale: { x: 1.5, y: 0.75 },
        bindRemaining: 4,
        bindOffset: { x: 12, y: -3 },
      }),
    );
    const frame0 = traceFrame({ frameIndex: 0, tick: 1, checksum: "stable-0", effects: [projectile0, explod0] });
    const frame1 = traceFrame({ frameIndex: 1, tick: 2, checksum: "stable-1", effects: [projectile1, explod1] });
    const trace = traceFromFrames([frame0, frame1]);

    const artifact = createRuntimeTraceArtifact({
      trace,
      generatedAt: "2026-06-25T00:00:00.000Z",
      target: {
        id: "synthetic-effect-payload",
        label: "Synthetic effect payload trace",
        source: "native",
      },
      gates: [],
    });

    const projectileDelta = artifact.trace.frames[1]?.delta?.actorChanges.find((change) => change.id === "fx-p1-proj-1");
    expect(projectileDelta).toMatchObject({
      layer: "effect",
      actorKind: "projectile",
    });
    expect(projectileDelta?.changes).toEqual(
      expect.arrayContaining([
        "effect hits 2->1",
        "effect miss 5->4",
        "effect hasHit false->true",
        "effect removal none->hit",
        "effect terminal none->hit",
      ]),
    );

    const explodDelta = artifact.trace.frames[1]?.delta?.actorChanges.find((change) => change.id === "fx-p1-explod-1");
    expect(explodDelta?.changes).toEqual(
      expect.arrayContaining(["effect opacity 1->0.5", "effect scale 1,1->1.5,0.75", "effect bindRemaining 8->4"]),
    );
    expect(artifact.trace.finalEffects.find((actor) => actor.id === "fx-p1-proj-1")?.effect).toMatchObject({
      kind: "projectile",
      hitsRemaining: 1,
      hasHit: true,
      removalReason: "hit",
      terminalReason: "hit",
    });

    const sourceExplod = frame1.effects.find((actor) => actor.id === "fx-p1-explod-1")?.effect;
    const exportedExplod = artifact.trace.finalEffects.find((actor) => actor.id === "fx-p1-explod-1")?.effect;
    expect(exportedExplod).toMatchObject({
      kind: "explod",
      opacity: 0.5,
      scale: { x: 1.5, y: 0.75 },
      bindOffset: { x: 12, y: -3 },
    });
    if (sourceExplod?.kind === "explod" && exportedExplod?.kind === "explod") {
      expect(exportedExplod).not.toBe(sourceExplod);
      expect(exportedExplod.scale).not.toBe(sourceExplod.scale);
      expect(exportedExplod.bindOffset).not.toBe(sourceExplod.bindOffset);
    }
  });

  it("gates typed effect payload samples across projectile, explod, and helper traces", () => {
    const projectile = effectActor(
      "fx-p1-proj-1",
      "Nova fireball",
      projectileEffect({ hitsRemaining: 0, hasHit: true, removalReason: "hit", terminalReason: "hit", terminalAge: 2 }),
    );
    const explod = effectActor(
      "fx-p1-explod-1",
      "Nova flash",
      explodEffect({
        scale: { x: 1.5, y: 0.75 },
        bindRemaining: 3,
        ignoreHitPause: true,
        pauseMoveTime: 4,
      }),
    );
    const helper = effectActor(
      "fx-p1-helper-1",
      "Nova helper",
      helperEffect({
        ownerBind: { target: "root", offset: { x: -36, y: -16 }, remaining: 2 },
      }),
    );
    const frame = traceFrame({ frameIndex: 0, tick: 1, checksum: "stable-payload", effects: [projectile, explod, helper] });
    const trace = traceFromFrames([frame]);

    const artifact = createRuntimeTraceArtifact({
      trace,
      generatedAt: "2026-06-25T00:00:00.000Z",
      target: {
        id: "synthetic-effect-payload-gate",
        label: "Synthetic effect payload gate",
        source: "native",
      },
      gates: [
        {
          label: "effect-payloads",
          requiredEffectPayloads: [
            { kind: "projectile", ownerId: "p1", effectId: 77, hasHit: true, removalReason: "hit", terminalReason: "hit", minTerminalAge: 1 },
            { kind: "explod", ownerId: "p1", effectId: 8, ignoreHitPause: true, minPauseMoveTime: 4, maxBindRemaining: 3, scaleX: 1.5, scaleY: 0.75 },
            {
              kind: "helper",
              ownerId: "p1",
              effectId: 42,
              name: "Nova helper",
              helperStateNo: 1204,
              ownerBindTarget: "root",
              ownerBindOffsetX: -36,
              ownerBindOffsetY: -16,
              minOwnerBindRemaining: 1,
              maxOwnerBindRemaining: 2,
            },
          ],
        },
      ],
    });

    expect(artifact.status).toBe("passed");
    expect(artifact.gates[0]?.requirements.requiredEffectPayloads).toEqual([
      { kind: "projectile", ownerId: "p1", effectId: 77, hasHit: true, removalReason: "hit", terminalReason: "hit", minTerminalAge: 1 },
      { kind: "explod", ownerId: "p1", effectId: 8, ignoreHitPause: true, minPauseMoveTime: 4, maxBindRemaining: 3, scaleX: 1.5, scaleY: 0.75 },
      {
        kind: "helper",
        ownerId: "p1",
        effectId: 42,
        name: "Nova helper",
        helperStateNo: 1204,
        ownerBindTarget: "root",
        ownerBindOffsetX: -36,
        ownerBindOffsetY: -16,
        minOwnerBindRemaining: 1,
        maxOwnerBindRemaining: 2,
      },
    ]);
    expect(artifact.gates[0]?.evidence.effectPayloads.map((payload) => payload.effect.kind)).toEqual(["explod", "helper", "projectile"]);
    expect(artifact.gates[0]?.failures).toEqual([]);
  });

  it("fails helper ownerBind payload gates when target or offset does not match", () => {
    const helper = effectActor(
      "fx-p1-helper-1",
      "Nova helper",
      helperEffect({
        ownerBind: { target: "parent", offset: { x: 40, y: -18 }, remaining: 2 },
      }),
    );
    const trace = traceFromFrames([traceFrame({ frameIndex: 0, tick: 1, checksum: "stable-helper-bind", effects: [helper] })]);

    const artifact = createRuntimeTraceArtifact({
      trace,
      generatedAt: "2026-06-25T00:00:00.000Z",
      target: {
        id: "synthetic-helper-ownerbind-mismatch",
        label: "Synthetic helper ownerBind mismatch",
        source: "native",
      },
      gates: [
        {
          label: "helper-ownerbind",
          requiredEffectPayloads: [
            { kind: "helper", ownerId: "p1", effectId: 42, ownerBindTarget: "root", ownerBindOffsetX: 40, ownerBindOffsetY: -18 },
          ],
        },
      ],
    });

    expect(artifact.status).toBe("failed");
    expect(artifact.gates[0]?.failures).toEqual([
      "Missing effect payload: kind=helper, ownerId=p1, effectId=42, ownerBindTarget=root, ownerBindOffsetX=40, ownerBindOffsetY=-18",
    ]);
  });
});

function traceFromFrames(frames: RuntimeTraceFrame[]): RuntimeTrace {
  const initialFrame = frames[0];
  const finalFrame = frames.at(-1);
  if (!initialFrame || !finalFrame) {
    throw new Error("traceFromFrames requires at least one frame");
  }
  const { input: _input, events: _events, ...initial } = initialFrame;
  return {
    label: "synthetic-effect-payload",
    frameCount: frames.length,
    initial,
    frames,
    events: frames.flatMap((frame) => frame.events),
    combatReasons: frames.flatMap((frame) => frame.combatReasons),
    final: finalFrame,
    checksum: "synthetic-checksum",
  };
}

function traceFrame(
  input: Pick<RuntimeTraceFrame, "frameIndex" | "tick" | "checksum" | "effects"> & Partial<RuntimeTraceFrame>,
): RuntimeTraceFrame {
  const frame: RuntimeTraceFrame = {
    frameIndex: input.frameIndex,
    tick: input.tick,
    input: input.input ?? { p1: [], p2: [], force: false },
    actors: input.actors ?? [],
    effects: input.effects,
    events: input.events ?? [],
    combatReasons: input.combatReasons ?? [],
    checksum: input.checksum,
  };
  if (input.label !== undefined) {
    frame.label = input.label;
  }
  if (input.world !== undefined) {
    frame.world = input.world;
  }
  if (input.round !== undefined) {
    frame.round = input.round;
  }
  if (input.stage !== undefined) {
    frame.stage = input.stage;
  }
  return frame;
}

function effectActor(
  id: string,
  label: string,
  effect: NonNullable<RuntimeTraceFrame["effects"][number]["effect"]>,
): RuntimeTraceFrame["effects"][number] {
  return {
    id,
    label,
    actorKind: effect.kind,
    ownerId: "p1",
    rootId: "p1",
    parentId: "p1",
    source: "effect",
    stateNo: 0,
    animNo: effect.kind === "projectile" ? 910 : 920,
    animTime: 0,
    frameIndex: 0,
    life: 1000,
    power: 0,
    ctrl: false,
    stateType: "S",
    moveType: effect.kind === "projectile" ? "A" : "I",
    physics: "N",
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
    facing: 1,
    hitPause: 0,
    guarding: false,
    guardStun: 0,
    targetCount: 0,
    clsn1Count: effect.kind === "projectile" ? 1 : 0,
    clsn2Count: 1,
    effect,
  };
}

function playerActor(input: {
  animNo: number;
  moveType: string;
  hitFallRecoverTime?: number;
  hitFallDownRecoverTime?: number;
}): RuntimeTraceFrame["actors"][number] {
  return {
    id: "p2",
    label: "Imported Defender",
    actorKind: "player",
    ownerId: "p2",
    rootId: "p2",
    parentId: "p2",
    source: "imported",
    stateNo: input.animNo,
    animNo: input.animNo,
    animTime: 0,
    frameIndex: 0,
    life: 1000,
    power: 0,
    ctrl: input.moveType === "I",
    stateType: input.moveType === "H" ? "A" : "S",
    moveType: input.moveType,
    physics: input.moveType === "H" ? "A" : "S",
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: input.moveType === "H" ? -2 : 0 },
    facing: -1,
    hitPause: 0,
    guarding: false,
    guardStun: 0,
    hitFall:
      input.hitFallRecoverTime === undefined && input.hitFallDownRecoverTime === undefined
        ? undefined
        : {
            falling: true,
            damage: 20,
            velocity: { x: 3, y: -6 },
            recover: true,
            recoverTime: input.hitFallRecoverTime,
            downRecover: true,
            downRecoverTime: input.hitFallDownRecoverTime,
          },
    targetCount: 0,
    clsn1Count: 0,
    clsn2Count: 1,
  };
}

function projectileEffect(
  overrides: Partial<Extract<NonNullable<RuntimeTraceFrame["effects"][number]["effect"]>, { kind: "projectile" }>> = {},
): Extract<NonNullable<RuntimeTraceFrame["effects"][number]["effect"]>, { kind: "projectile" }> {
  return {
    kind: "projectile",
    id: 77,
    age: 4,
    removeTime: 30,
    spritePriority: 4,
    priority: 2,
    hitsRemaining: 1,
    missTime: 6,
    missTimeRemaining: 0,
    damage: 35,
    hitPause: 8,
    hitStun: 14,
    guardDamage: 6,
    guardPause: 6,
    guardStun: 10,
    guardDistance: 28,
    guardFlag: "MA",
    removeOnHit: true,
    hasHit: false,
    ...overrides,
  };
}

function explodEffect(
  overrides: Partial<Extract<NonNullable<RuntimeTraceFrame["effects"][number]["effect"]>, { kind: "explod" }>> = {},
): Extract<NonNullable<RuntimeTraceFrame["effects"][number]["effect"]>, { kind: "explod" }> {
  return {
    kind: "explod",
    id: 8,
    age: 2,
    removeTime: 18,
    spritePriority: 3,
    opacity: 1,
    scale: { x: 1, y: 1 },
    removeOnGetHit: false,
    ignoreHitPause: true,
    pauseMoveTime: 2,
    superMoveTime: 0,
    bindRemaining: 8,
    bindOffset: { x: 0, y: 0 },
    ...overrides,
  };
}

function helperEffect(
  overrides: Partial<Extract<NonNullable<RuntimeTraceFrame["effects"][number]["effect"]>, { kind: "helper" }>> = {},
): Extract<NonNullable<RuntimeTraceFrame["effects"][number]["effect"]>, { kind: "helper" }> {
  return {
    kind: "helper",
    id: 42,
    name: "Nova helper",
    stateNo: 1204,
    age: 2,
    stateTime: 1,
    removeTime: 30,
    spritePriority: 3,
    scale: { x: 1, y: 1 },
    ignoreHitPause: false,
    pauseMoveTime: 0,
    superMoveTime: 0,
    ...overrides,
  };
}

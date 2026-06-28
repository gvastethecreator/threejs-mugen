import { describe, expect, it } from "vitest";
import {
  createNativeHitTraceArtifact,
  createNativeWhiffTraceArtifact,
  createSyntheticImportedCommonGetHitTraceArtifact,
  createSyntheticImportedCustomStateTraceArtifact,
  createSyntheticImportedDefaultFallAirRecoveryVelocityTraceArtifact,
  createSyntheticImportedDefaultFallGroundRecoveryTraceArtifact,
  createSyntheticImportedDefaultFallRecoveryInputTraceArtifact,
  createSyntheticImportedDefaultFallRecoveryThresholdTraceArtifact,
  createSyntheticImportedDefaultFallRecoveryTickOrderTraceArtifact,
  createSyntheticImportedDefaultFallRecoveryTooEarlyTraceArtifact,
  createSyntheticImportedDefaultFallRecoveryTraceArtifact,
  createSyntheticImportedFallTraceArtifact,
  createSyntheticImportedFallDefenceUpTraceArtifact,
  createSyntheticImportedGetHitVarAnimTypeTraceArtifact,
  createSyntheticImportedGetHitVarFallDefenceUpTraceArtifact,
  createImportedDefaultFallGroundRecoveryTraceArtifact,
  createImportedDefaultFallRecoveryInputTraceArtifact,
  createImportedDefaultFallRecoveryThresholdTraceArtifact,
  createImportedDefaultFallRecoveryTooEarlyTraceArtifact,
  createImportedDefaultFallRecoveryTraceArtifact,
  createImportedDefaultGetHitTraceArtifact,
  createImportedDefaultFallGetHitTraceArtifact,
  createImportedDefaultGetHitProgressionTraceArtifact,
  createImportedDefaultGuardStateTraceArtifact,
  createImportedGuardTraceArtifact,
  createSyntheticImportedHitstunTraceArtifact,
  createSyntheticImportedAutoGuardEndTraceArtifact,
  createSyntheticImportedAutoGuardStartTraceArtifact,
  createSyntheticImportedAssertSpecialAirGuardDenyTraceArtifact,
  createSyntheticImportedAssertSpecialControlTraceArtifact,
  createSyntheticImportedAssertSpecialCrouchGuardDenyTraceArtifact,
  createSyntheticImportedAssertSpecialGuardDenyTraceArtifact,
  createSyntheticImportedAssertSpecialLifetimeTraceArtifact,
  createSyntheticImportedAssertSpecialUnguardableTraceArtifact,
  createSyntheticImportedAssertSpecialNoKoTraceArtifact,
  createSyntheticImportedAirGuardStateTraceArtifact,
  createSyntheticImportedAliveTraceArtifact,
  createSyntheticImportedInGuardDistTraceArtifact,
  createSyntheticImportedInGuardDistFarTraceArtifact,
  createSyntheticImportedStateExitTraceArtifact,
  createSyntheticImportedCrouchGuardStateTraceArtifact,
  createSyntheticImportedDiagonalCrouchGuardStateTraceArtifact,
  createSyntheticImportedGuardTraceArtifact,
  createSyntheticImportedDefaultGuardStateTraceArtifact,
  createSyntheticImportedExplodBindTraceArtifact,
  createSyntheticImportedExplodRemoveOnGetHitTraceArtifact,
  createSyntheticImportedExplodRemoveOnProjectileGuardTraceArtifact,
  createSyntheticImportedExplodRemoveOnProjectileHitTraceArtifact,
  createSyntheticImportedExplodScaleTraceArtifact,
  createSyntheticImportedExplodIgnoreHitPauseTraceArtifact,
  createSyntheticImportedExplodPauseMoveTimeTraceArtifact,
  createSyntheticImportedExplodSuperMoveTimeTraceArtifact,
  createSyntheticImportedExplodVelocityTraceArtifact,
  createSyntheticImportedHelperTraceArtifact,
  createSyntheticImportedHelperScaleTraceArtifact,
  createSyntheticImportedHelperIgnoreHitPauseTraceArtifact,
  createSyntheticImportedHelperPauseMoveTimeTraceArtifact,
  createSyntheticImportedHelperSuperMoveTimeTraceArtifact,
  createSyntheticImportedHelperVelocityTraceArtifact,
  createSyntheticImportedExplodTraceArtifact,
  createSyntheticImportedHitOverrideTraceArtifact,
  createSyntheticImportedRejectTraceArtifact,
  createSyntheticImportedReversalTraceArtifact,
  createSyntheticImportedDamageScaleTraceArtifact,
  createSyntheticImportedDataDamageScaleTraceArtifact,
  createSyntheticImportedBoundsTraceArtifact,
  createSyntheticImportedScreenBoundCameraTraceArtifact,
  createSyntheticImportedGravityTraceArtifact,
  createSyntheticImportedKinematicTraceArtifact,
  createSyntheticImportedWidthTraceArtifact,
  createSyntheticImportedStateTypeSetTraceArtifact,
  createSyntheticImportedPlayerPushTraceArtifact,
  createSyntheticImportedTurnTraceArtifact,
  createSyntheticImportedSprPriorityTraceArtifact,
  createSyntheticImportedPalFxTraceArtifact,
  createSyntheticImportedTransTraceArtifact,
  createSyntheticImportedAngleTraceArtifact,
  createSyntheticImportedEnvColorTraceArtifact,
  createSyntheticImportedEnvShakeTraceArtifact,
  createSyntheticImportedRemapPalTraceArtifact,
  createSyntheticImportedAfterImageTraceArtifact,
  createSyntheticImportedHitDefPriorityTraceArtifact,
  createSyntheticImportedHitDefGuardKillTraceArtifact,
  createSyntheticImportedHitDefKillTraceArtifact,
  createSyntheticImportedProjectileClashTraceArtifact,
  createSyntheticImportedProjectileContactTraceArtifact,
  createSyntheticImportedProjectileMotionTraceArtifact,
  createSyntheticImportedModifyProjectileTraceArtifact,
  createSyntheticImportedProjectileReceivedDamageTraceArtifact,
  createSyntheticImportedProjectileTimeTraceArtifact,
  createSyntheticImportedProjectileVelMulTraceArtifact,
  createSyntheticImportedResourceTraceArtifact,
  createSyntheticImportedControlTraceArtifact,
  createSyntheticImportedAnimationTraceArtifact,
  createSyntheticImportedResourceMaxTraceArtifact,
  createSyntheticImportedSoundTraceArtifact,
  createSyntheticImportedProjectileMultiHitTraceArtifact,
  createSyntheticImportedProjectilePriorityCancelTraceArtifact,
  createSyntheticImportedProjectileGuardTraceArtifact,
  createSyntheticImportedProjectileTraceArtifact,
  createSyntheticImportedSuperPauseEffectFreezeTraceArtifact,
  createSyntheticImportedSuperPauseProjectileFreezeTraceArtifact,
  createSyntheticImportedSuperPauseTraceArtifact,
  createSyntheticImportedTargetBindPauseTraceArtifact,
  createSyntheticImportedBindToTargetHeadTraceArtifact,
  createSyntheticImportedBindToTargetMidTraceArtifact,
  createSyntheticImportedTargetStateCustomTraceArtifact,
  createSyntheticImportedTargetTraceArtifact,
  createSyntheticImportedHitCountTraceArtifact,
  createSyntheticImportedHitAddTraceArtifact,
  createSyntheticImportedVariableTraceArtifact,
  createSyntheticImportedReceivedDamageTraceArtifact,
  createSyntheticImportedRoundKoTraceArtifact,
  createSyntheticImportedRoundTimeOverTraceArtifact,
  createSyntheticImportedRoundTriggerTraceArtifact,
  createSyntheticImportedHitDefAttrTraceArtifact,
  createSyntheticImportedMoveHitCounterTraceArtifact,
  createSyntheticImportedMoveHitResetTraceArtifact,
  createSyntheticImportedMatchContextTraceArtifact,
  createSyntheticImportedMoveContactTraceArtifact,
  createSyntheticImportedNumExplodTraceArtifact,
  createSyntheticImportedEnemyNearTraceArtifact,
  createSyntheticImportedNumHelperTraceArtifact,
  createSyntheticImportedNumProjTraceArtifact,
  createSyntheticImportedNumTargetTraceArtifact,
  createSyntheticImportedP2MetricsTraceArtifact,
  createSyntheticImportedPrevAnimTraceArtifact,
  createSyntheticImportedPrevMoveTypeTraceArtifact,
  createSyntheticImportedPrevStateTypeTraceArtifact,
  createSyntheticImportedPrevStateTraceArtifact,
  createSyntheticImportedRemoveExplodTraceArtifact,
  createSyntheticImportedSelfCommandTraceArtifact,
  createSyntheticImportedSelfStateNoExistTraceArtifact,
  createSyntheticImportedStageTimeTraceArtifact,
  createSyntheticImportedXTraceArtifact,
  createSyntheticImportedTraceFighter,
  importedDelayedXScript,
  importedGuardScript,
  importedCommonGetHitScript,
  importedCustomStateScript,
  importedDefaultGetHitScript,
  importedDefaultFallGetHitScript,
  importedDefaultFallRecoveryInputScript,
  importedDefaultFallOfficialGroundRecoveryScript,
  importedDefaultFallOfficialRecoveryInputScript,
  importedDefaultFallOfficialRecoveryTooEarlyScript,
  importedDefaultFallOfficialRecoveryScript,
  importedDefaultFallRecoveryScript,
  importedDefaultCrouchGuardStateScript,
  importedDefaultDiagonalCrouchGuardStateScript,
  importedDefaultGuardStateScript,
  importedDefaultGetHitProgressionScript,
  importedHitDefGuardKillScript,
  importedHitDefKillScript,
  importedHitDefPriorityScript,
  importedAutoGuardEndScript,
  importedAutoGuardStartScript,
  importedInGuardDistScript,
  importedExplodScript,
  importedRemoveOnGetHitExplodScript,
  importedProjectileGuardRemoveOnGetHitExplodScript,
  importedProjectileRemoveOnGetHitExplodScript,
  importedHelperScript,
  importedProjectileClashScript,
  importedProjectileMotionScript,
  importedProjectileVelMulScript,
  importedProjectileMultiHitScript,
  importedProjectilePriorityCancelScript,
  importedProjectileScript,
  importedProjectileGuardScript,
  importedSuperPauseEffectScript,
  importedSuperPauseProjectileScript,
  importedSuperPauseScript,
  importedTargetBindPauseScript,
  importedXHitstunScript,
  importedXStateExitScript,
  importedTargetScript,
  nativeHitScript,
  nativeWhiffScript,
  qcfXScript,
} from "../mugen/runtime/RuntimeTraceGatePresets";

describe("RuntimeTraceGatePresets", () => {
  it("creates a native golden hit artifact with hit evidence", () => {
    const artifact = createNativeHitTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      schemaVersion: "runtime-trace-artifact/v0",
      generatedAt: "2026-06-25T00:00:00.000Z",
      status: "passed",
      target: {
        id: "native-nova-hit-golden",
        source: "native",
      },
      gates: [
        {
          label: "native-hit-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    expect(artifact.trace.eventCount).toBeGreaterThanOrEqual(1);
    expect(artifact.trace.combatReasonCount).toBeGreaterThanOrEqual(1);
    expect(artifact.gates[0]?.evidence.eventCategories).toContain("hit");
    expect(artifact.gates[0]?.evidence.combatReasons).toContain("hit");
  });

  it("creates a native golden whiff artifact with inferred whiff evidence", () => {
    const artifact = createNativeWhiffTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "native-nova-whiff-golden",
        source: "native",
      },
      gates: [
        {
          label: "native-whiff-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    expect(artifact.trace.eventCount).toBe(0);
    expect(artifact.trace.combatReasonCount).toBeGreaterThanOrEqual(1);
    expect(artifact.trace.combatReasons.some((reason) => reason.reason === "whiff" && reason.source === "inferred")).toBe(true);
    expect(artifact.gates[0]?.evidence.combatReasons).toContain("whiff");
  });

  it("creates a synthetic imported golden x artifact with route, controller, command, and hit evidence", () => {
    const artifact = createSyntheticImportedXTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-x-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "imported-x-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    expect(artifact.gates[0]?.evidence.actorSources).toEqual(["demo", "imported"]);
    expect(artifact.gates[0]?.evidence.routedStates).toContain(200);
    expect(artifact.gates[0]?.evidence.executedStates).toContain(200);
    expect(artifact.gates[0]?.evidence.executedStates).toContain(261);
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([200, 261]);
    expect(artifact.gates[0]?.evidence.executedControllers.HitDef).toBeGreaterThanOrEqual(1);
    expect(artifact.gates[0]?.evidence.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(artifact.gates[0]?.evidence.activeCommands).toContain("x");
    expect(artifact.gates[0]?.evidence.eventCategories).toContain("hit");
    expect(artifact.gates[0]?.evidence.combatReasons).toContain("hit");
  });

  it("creates a synthetic imported MoveContact artifact with contact branch evidence", () => {
    const artifact = createSyntheticImportedMoveContactTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-movecontact-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "imported-x-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toContain(262);
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([200, 262]);
    expect(evidence?.eventCategories).toContain("hit");
    expect(evidence?.combatReasons).toContain("hit");
  });

  it("creates a synthetic imported MoveHit counter artifact with contact timing evidence", () => {
    const artifact = createSyntheticImportedMoveHitCounterTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-movehit-counter-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "imported-x-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toContain(263);
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([200, 263]);
    expect(evidence?.eventCategories).toContain("hit");
    expect(evidence?.combatReasons).toContain("hit");
  });

  it("creates a synthetic imported MoveHitReset artifact with reset evidence", () => {
    const artifact = createSyntheticImportedMoveHitResetTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-movehitreset-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "imported-x-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([200]);
    expect(artifact.gates[0]?.requirements.requiredExecutedControllers).toEqual(["ChangeState", "HitDef", "MoveHitReset"]);
    expect(artifact.gates[0]?.requirements.requiredExecutedOperations).toEqual(["hitdef", "contact:movehitreset"]);
    expect(evidence?.executedStates).toContain(200);
    expect(evidence?.executedStates).not.toContain(263);
    expect(evidence?.executedControllers.MoveHitReset).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["contact:movehitreset"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toContain("hit");
    expect(evidence?.combatReasons).toContain("hit");
    expect(artifact.trace.finalActors.find((actor) => actor.id === "p1")).toMatchObject({ stateNo: 200, animNo: 200 });
  });

  it("creates a synthetic imported HitCount artifact with direct hit count evidence", () => {
    const artifact = createSyntheticImportedHitCountTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-hitcount-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "imported-x-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toContain(264);
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([200, 264]);
    expect(evidence?.eventCategories).toContain("hit");
    expect(evidence?.combatReasons).toContain("hit");
  });

  it("creates a synthetic imported HitAdd artifact with bounded hit-count evidence", () => {
    const artifact = createSyntheticImportedHitAddTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-hitadd-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "imported-x-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toContain(265);
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([200, 265]);
    expect(evidence?.executedControllers.HitAdd).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["contact:hitadd"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toContain("hit");
    expect(evidence?.combatReasons).toContain("hit");
  });

  it("creates a synthetic imported variable artifact with typed variable operation evidence", () => {
    const artifact = createSyntheticImportedVariableTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-variable-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "imported-x-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([200, 288]);
    expect(artifact.gates[0]?.requirements.requiredExecutedControllers).toEqual(["ChangeState", "HitDef", "VarSet", "VarAdd", "VarRangeSet"]);
    expect(artifact.gates[0]?.requirements.requiredExecutedOperations).toEqual(["hitdef", "variable:varset", "variable:varadd", "variable:varrangeset"]);
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 288]));
    expect(evidence?.executedControllers.VarSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.VarAdd).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.VarRangeSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["variable:varset"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["variable:varadd"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["variable:varrangeset"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toContain("hit");
    expect(evidence?.combatReasons).toContain("hit");
    expect(artifact.trace.finalActors.find((actor) => actor.id === "p1")).toMatchObject({ stateNo: 288, animNo: 288 });
  });

  it("creates a synthetic imported resource artifact with typed resource operation evidence", () => {
    const artifact = createSyntheticImportedResourceTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-resource-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "imported-x-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([200, 289]);
    expect(artifact.gates[0]?.requirements.requiredExecutedControllers).toEqual([
      "ChangeState",
      "HitDef",
      "LifeAdd",
      "LifeSet",
      "PowerAdd",
      "PowerSet",
    ]);
    expect(artifact.gates[0]?.requirements.requiredExecutedOperations).toEqual([
      "hitdef",
      "resource:lifeadd",
      "resource:lifeset",
      "resource:poweradd",
      "resource:powerset",
    ]);
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 289]));
    expect(evidence?.executedControllers.LifeAdd).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.LifeSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.PowerAdd).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.PowerSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["resource:lifeadd"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["resource:lifeset"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["resource:poweradd"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["resource:powerset"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toContain("hit");
    expect(evidence?.combatReasons).toContain("hit");
    expect(artifact.trace.finalActors.find((actor) => actor.id === "p1")).toMatchObject({
      stateNo: 289,
      animNo: 289,
      life: 750,
      power: 900,
    });
  });

  it("creates a synthetic imported control artifact with typed CtrlSet operation evidence", () => {
    const artifact = createSyntheticImportedControlTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-control-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "imported-x-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedControllers.CtrlSet).toBeGreaterThanOrEqual(2);
    expect(evidence?.executedOperations["resource:ctrlset"]).toBeGreaterThanOrEqual(2);
    expect(evidence?.finalActors.find((actor) => actor.id === "p1")).toMatchObject({
      source: "imported",
      stateNo: 200,
      animNo: 200,
      ctrl: true,
    });
    expect(artifact.gates[0]?.requirements.requiredExecutedControllers).toEqual(
      expect.arrayContaining([{ type: "CtrlSet", minCount: 2 }]),
    );
    expect(artifact.gates[0]?.requirements.requiredExecutedOperations).toEqual(
      expect.arrayContaining([{ operation: "resource:ctrlset", minCount: 2 }]),
    );
    expect(artifact.gates[0]?.requirements.requiredFinalActors).toEqual([
      {
        actorId: "p1",
        source: "imported",
        actorKind: "player",
        stateNo: 200,
        animNo: 200,
        ctrl: true,
      },
    ]);
  });

  it("creates a synthetic imported animation artifact with ChangeAnim and ChangeAnim2 evidence", () => {
    const artifact = createSyntheticImportedAnimationTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-animation-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "imported-x-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedControllers.ChangeAnim).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.ChangeAnim2).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ actorId: "p1", source: "imported", actorKind: "player", animNo: 205 }),
        expect.objectContaining({ actorId: "p1", source: "imported", actorKind: "player", animNo: 206 }),
      ]),
    );
    expect(evidence?.finalActors.find((actor) => actor.id === "p1")).toMatchObject({
      source: "imported",
      stateNo: 200,
      animNo: 206,
    });
    expect(artifact.gates[0]?.requirements.requiredExecutedControllers).toEqual(
      expect.arrayContaining(["ChangeAnim", "ChangeAnim2"]),
    );
    expect(artifact.gates[0]?.requirements.requiredActorFrames).toEqual([
      { actorId: "p1", source: "imported", actorKind: "player", animNo: 205, minFrames: 1 },
      { actorId: "p1", source: "imported", actorKind: "player", animNo: 206, minFrames: 1 },
    ]);
  });

  it("creates a synthetic imported sound artifact with PlaySnd and StopSnd event evidence", () => {
    const artifact = createSyntheticImportedSoundTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-sound-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "imported-x-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([200]);
    expect(artifact.gates[0]?.requirements.requiredExecutedControllers).toEqual(["ChangeState", "HitDef", "PlaySnd", "StopSnd"]);
    expect(artifact.gates[0]?.requirements.requiredSoundEvents).toEqual([
      { actorId: "p1", type: "PlaySnd", group: 5, index: 0, channel: 2, stateNo: 200 },
      { actorId: "p1", type: "StopSnd", channel: 2, stateNo: 200 },
    ]);
    expect(evidence?.executedControllers.PlaySnd).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.StopSnd).toBeGreaterThanOrEqual(1);
    expect(evidence?.soundEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ actorId: "p1", type: "PlaySnd", group: 5, index: 0, channel: 2, stateNo: 200 }),
        expect.objectContaining({ actorId: "p1", type: "StopSnd", channel: 2, stateNo: 200 }),
      ]),
    );
    expect(artifact.trace.finalActors.find((actor) => actor.id === "p1")?.soundEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "PlaySnd", group: 5, index: 0, channel: 2, stateNo: 200 }),
        expect.objectContaining({ type: "StopSnd", channel: 2, stateNo: 200 }),
      ]),
    );
  });

  it("creates a synthetic imported ReceivedDamage artifact with defender-local branch evidence", () => {
    const artifact = createSyntheticImportedReceivedDamageTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-receiveddamage-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-receiveddamage-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 5000, 280]));
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([200, 5000, 280]);
    expect(evidence?.executedControllers.HitDef).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.ChangeState).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toContain("hit");
    expect(evidence?.combatReasons).toContain("hit");
    expect(artifact.trace.finalActors.some((actor) => actor.id === "p2" && actor.stateNo === 280)).toBe(true);
  });

  it("creates a synthetic imported HitDefAttr artifact with attr-filter branch evidence", () => {
    const artifact = createSyntheticImportedHitDefAttrTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-hitdefattr-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "imported-x-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toContain(266);
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([200, 266]);
    expect(evidence?.eventCategories).toContain("hit");
    expect(evidence?.combatReasons).toContain("hit");
  });

  it("creates a synthetic imported PrevStateNo artifact with branch evidence", () => {
    const artifact = createSyntheticImportedPrevStateTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-prevstateno-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "imported-x-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 267, 268]));
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([200, 267, 268]);
    expect(
      artifact.trace.frames.some((frame) =>
        frame.delta?.actorChanges.some((actor) => actor.id === "p1" && actor.changes.includes("state 267->268")),
      ),
    ).toBe(true);
    expect(artifact.trace.finalActors.some((actor) => actor.id === "p1" && actor.stateNo === 0 && actor.prevStateNo === 268)).toBe(true);
  });

  it("creates a synthetic imported PrevMoveType artifact with branch evidence", () => {
    const artifact = createSyntheticImportedPrevMoveTypeTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-prevmovetype-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "imported-x-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 269, 270]));
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([200, 269, 270]);
    expect(
      artifact.trace.frames.some((frame) =>
        frame.delta?.actorChanges.some((actor) => actor.id === "p1" && actor.changes.includes("state 269->270")),
      ),
    ).toBe(true);
    expect(artifact.trace.finalActors.some((actor) => actor.id === "p1" && actor.stateNo === 0 && actor.prevMoveType === "I")).toBe(true);
  });

  it("creates a synthetic imported PrevAnim artifact with branch evidence", () => {
    const artifact = createSyntheticImportedPrevAnimTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-prevanim-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "imported-x-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 275, 276]));
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([200, 275, 276]);
    expect(
      artifact.trace.frames.some((frame) =>
        frame.delta?.actorChanges.some((actor) => actor.id === "p1" && actor.changes.includes("state 275->276")),
      ),
    ).toBe(true);
    expect(
      artifact.trace.frames.some((frame) =>
        frame.delta?.actorChanges.some((actor) => actor.id === "p1" && actor.changes.includes("anim 205->275")),
      ),
    ).toBe(true);
  });

  it("creates a synthetic imported PrevStateType artifact with branch evidence", () => {
    const artifact = createSyntheticImportedPrevStateTypeTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-prevstatetype-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "imported-x-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 271, 272]));
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([200, 271, 272]);
    expect(
      artifact.trace.frames.some((frame) =>
        frame.delta?.actorChanges.some((actor) => actor.id === "p1" && actor.changes.includes("state 271->272")),
      ),
    ).toBe(true);
    expect(artifact.trace.finalActors.some((actor) => actor.id === "p1" && actor.stateNo === 0 && actor.prevStateType === "S")).toBe(true);
  });

  it("creates a synthetic imported EnemyNear artifact with redirect branch evidence", () => {
    const artifact = createSyntheticImportedEnemyNearTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-enemynear-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "imported-x-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.routedStates).toContain(269);
    expect(evidence?.executedStates).toContain(269);
    expect(artifact.gates[0]?.requirements.requiredRoutedStates).toEqual([269]);
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([269]);
    expect(artifact.trace.finalActors.some((actor) => actor.id === "p1" && actor.stateNo === 269)).toBe(true);
  });

  it("creates a synthetic imported P2 metric artifact with trigger evidence", () => {
    const artifact = createSyntheticImportedP2MetricsTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-p2metrics-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "imported-x-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.routedStates).toContain(275);
    expect(evidence?.executedStates).toContain(275);
    expect(artifact.gates[0]?.requirements.requiredRoutedStates).toEqual([275]);
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([275]);
    expect(artifact.trace.finalActors.some((actor) => actor.id === "p1" && actor.stateNo === 275)).toBe(true);
  });

  it("creates a synthetic imported SelfStateNoExist artifact with state-existence branch evidence", () => {
    const artifact = createSyntheticImportedSelfStateNoExistTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-selfstatenoexist-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "imported-x-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.routedStates).toContain(277);
    expect(evidence?.executedStates).toContain(277);
    expect(artifact.gates[0]?.requirements.requiredRoutedStates).toEqual([277]);
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([277]);
    expect(artifact.trace.finalActors.some((actor) => actor.id === "p1" && actor.stateNo === 277)).toBe(true);
  });

  it("creates a synthetic imported SelfCommand artifact with owner command branch evidence", () => {
    const artifact = createSyntheticImportedSelfCommandTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-selfcommand-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "imported-x-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.activeCommands).toContain("x");
    expect(evidence?.routedStates).toContain(278);
    expect(evidence?.executedStates).toContain(278);
    expect(artifact.gates[0]?.requirements.requiredRoutedStates).toEqual([278]);
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([278]);
    expect(artifact.trace.finalActors.some((actor) => actor.id === "p1" && actor.stateNo === 278)).toBe(true);
  });

  it("creates a synthetic imported StageTime artifact with match-tick branch evidence", () => {
    const artifact = createSyntheticImportedStageTimeTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-stagetime-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "imported-x-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.activeCommands).toContain("x");
    expect(evidence?.routedStates).toContain(279);
    expect(evidence?.executedStates).toContain(279);
    expect(artifact.gates[0]?.requirements.requiredRoutedStates).toEqual([279]);
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([279]);
    expect(artifact.trace.frames.some((frame) => frame.tick >= 3)).toBe(true);
    expect(artifact.trace.finalActors.some((actor) => actor.id === "p1" && actor.stateNo === 279)).toBe(true);
  });

  it("creates a synthetic imported Alive artifact with owner-life branch evidence", () => {
    const artifact = createSyntheticImportedAliveTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-alive-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "imported-x-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.activeCommands).toContain("x");
    expect(evidence?.routedStates).toContain(280);
    expect(evidence?.executedStates).toContain(280);
    expect(artifact.gates[0]?.requirements.requiredRoutedStates).toEqual([280]);
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([280]);
    expect(artifact.trace.finalActors.some((actor) => actor.id === "p1" && actor.stateNo === 280 && actor.life > 0)).toBe(true);
  });

  it("creates a synthetic imported RoundNo/RoundState artifact with single-round branch evidence", () => {
    const artifact = createSyntheticImportedRoundTriggerTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-round-trigger-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "imported-x-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.activeCommands).toContain("x");
    expect(evidence?.routedStates).toContain(281);
    expect(evidence?.executedStates).toContain(281);
    expect(artifact.gates[0]?.requirements.requiredRoutedStates).toEqual([281]);
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([281]);
    expect(artifact.trace.finalActors.some((actor) => actor.id === "p1" && actor.stateNo === 281)).toBe(true);
  });

  it("creates a synthetic imported round KO artifact with RoundSnapshot evidence", () => {
    const artifact = createSyntheticImportedRoundKoTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-round-ko-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "imported-x-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.activeCommands).toContain("x");
    expect(evidence?.executedStates).toContain(200);
    expect(evidence?.eventCategories).toContain("hit");
    expect(evidence?.combatReasons).toContain("hit");
    expect(evidence?.roundFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          state: "ko",
          winner: "Synthetic Imported Round KO",
          message: "Synthetic Imported Round KO wins",
        }),
      ]),
    );
    expect(artifact.gates[0]?.requirements.requiredRoundFrames).toEqual([
      { state: "ko", winner: "Synthetic Imported Round KO", message: "Synthetic Imported Round KO wins" },
    ]);
    expect(artifact.trace.finalActors.find((actor) => actor.id === "p2")?.life).toBe(0);
  });

  it("creates a synthetic imported round time-over artifact with RoundSnapshot evidence", () => {
    const artifact = createSyntheticImportedRoundTimeOverTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-round-timeover-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-round-timeover-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.actorSources).toEqual(expect.arrayContaining(["imported", "demo"]));
    expect(evidence?.roundFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          state: "timeover",
          winner: "Draw",
          message: "Time over - draw",
          minTimer: 0,
          maxTimer: 0,
        }),
      ]),
    );
    expect(artifact.gates[0]?.requirements.requiredRoundFrames).toEqual([
      { state: "timeover", winner: "Draw", message: "Time over - draw", observedTimerAtMost: 0 },
    ]);
  });

  it("creates a synthetic imported RoundsExisted/MatchOver artifact with match-context branch evidence", () => {
    const artifact = createSyntheticImportedMatchContextTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-match-context-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "imported-x-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.activeCommands).toContain("x");
    expect(evidence?.routedStates).toContain(282);
    expect(evidence?.executedStates).toContain(282);
    expect(artifact.gates[0]?.requirements.requiredRoutedStates).toEqual([282]);
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([282]);
    expect(artifact.trace.finalActors.some((actor) => actor.id === "p1" && actor.stateNo === 282)).toBe(true);
  });

  it("creates a synthetic imported LifeMax/PowerMax artifact with resource-cap branch evidence", () => {
    const artifact = createSyntheticImportedResourceMaxTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-resource-max-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "imported-x-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.activeCommands).toContain("x");
    expect(evidence?.routedStates).toContain(283);
    expect(evidence?.executedStates).toContain(283);
    expect(artifact.gates[0]?.requirements.requiredRoutedStates).toEqual([283]);
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([283]);
    expect(artifact.gates[0]?.requirements.requiredFinalActors).toEqual([
      expect.objectContaining({ actorId: "p1", stateNo: 283, life: 750 }),
    ]);
    expect(artifact.trace.finalActors.some((actor) => actor.id === "p1" && actor.stateNo === 283 && actor.life === 750)).toBe(true);
  });

  it("creates a synthetic imported NumTarget artifact with target-memory branch evidence", () => {
    const artifact = createSyntheticImportedNumTargetTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-numtarget-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "imported-x-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toContain(263);
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([200, 263]);
    expect(evidence?.eventCategories).toContain("hit");
    expect(evidence?.combatReasons).toContain("hit");
  });

  it("creates a synthetic imported NumHelper artifact with helper-count branch evidence", () => {
    const artifact = createSyntheticImportedNumHelperTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-numhelper-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-numhelper-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toContain(264);
    expect(evidence?.effectKinds).toContain("helper");
    expect(evidence?.executedControllers.Helper).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.helper).toBeGreaterThanOrEqual(1);
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([200, 264]);
  });

  it("creates a synthetic imported NumProj artifact with projectile-count branch evidence", () => {
    const artifact = createSyntheticImportedNumProjTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-numproj-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-numproj-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toContain(273);
    expect(evidence?.effectKinds).toContain("projectile");
    expect(evidence?.executedControllers.Projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.projectile).toBeGreaterThanOrEqual(1);
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([200, 273]);
  });

  it("creates a synthetic imported NumExplod artifact with explod-count branch evidence", () => {
    const artifact = createSyntheticImportedNumExplodTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-numexplod-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-numexplod-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toContain(274);
    expect(evidence?.effectKinds).toContain("explod");
    expect(evidence?.executedControllers.Explod).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.explod).toBeGreaterThanOrEqual(1);
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([200, 274]);
  });

  it("creates a synthetic imported RemoveExplod artifact with explod remove evidence", () => {
    const artifact = createSyntheticImportedRemoveExplodTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-removeexplod-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-removeexplod-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.effectKinds).toContain("explod");
    expect(evidence?.executedControllers.Explod).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.RemoveExplod).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.explod).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.removeexplod).toBeGreaterThanOrEqual(1);
    expect(evidence?.worldLifecycleEvents.some((event) => event.kind === "explod" && event.type === "remove")).toBe(true);
    const finalStore = artifact.trace.frames.at(-1)?.world?.effectStores.find((store) => store.ownerId === "p1");
    expect(finalStore?.explods).toEqual([]);
  });

  it("creates a synthetic imported reject artifact with HitBy/NotHitBy reason evidence", () => {
    const artifact = createSyntheticImportedRejectTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-reject-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-reject-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    expect(artifact.gates[0]?.evidence.actorSources).toEqual(["imported"]);
    expect(artifact.gates[0]?.evidence.executedControllers.HitDef).toBeGreaterThanOrEqual(1);
    expect(artifact.gates[0]?.evidence.executedControllers.NotHitBy).toBeGreaterThanOrEqual(1);
    expect(artifact.gates[0]?.evidence.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(artifact.gates[0]?.evidence.executedOperations["eligibility:nothitby"]).toBeGreaterThanOrEqual(1);
    expect(artifact.gates[0]?.evidence.eventCategories).toContain("reject");
    expect(artifact.gates[0]?.evidence.combatReasons).toContain("reject");
  });

  it("creates a synthetic imported HitOverride artifact with redirect reason evidence", () => {
    const artifact = createSyntheticImportedHitOverrideTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-hitoverride-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-hitoverride-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    expect(artifact.gates[0]?.requirements.requiredExecutedControllers).toEqual(["ChangeState", "HitDef", "HitOverride"]);
    expect(artifact.gates[0]?.requirements.requiredExecutedOperations).toEqual(["hitdef", "hitoverride"]);
    expect(artifact.gates[0]?.requirements.requiredFinalActors).toEqual([
      {
        actorId: "p2",
        source: "imported",
        actorKind: "player",
        stateNo: 777,
        animNo: 777,
        life: 1000,
        moveType: "I",
      },
    ]);
    expect(artifact.gates[0]?.evidence.actorSources).toEqual(["imported"]);
    expect(artifact.gates[0]?.evidence.executedStates).toEqual(expect.arrayContaining([200, 777]));
    expect(artifact.gates[0]?.evidence.executedControllers.HitDef).toBeGreaterThanOrEqual(1);
    expect(artifact.gates[0]?.evidence.executedControllers.HitOverride).toBeGreaterThanOrEqual(1);
    expect(artifact.gates[0]?.evidence.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(artifact.gates[0]?.evidence.executedOperations.hitoverride).toBeGreaterThanOrEqual(1);
    expect(artifact.gates[0]?.evidence.eventCategories).toContain("override");
    expect(artifact.gates[0]?.evidence.combatReasons).toContain("override");
    expect(artifact.trace.finalActors.find((actor) => actor.id === "p2")).toMatchObject({ stateNo: 777, life: 1000 });
    expect(artifact.trace.events.some((event) => event.category === "override" && event.line.includes("HitOverride slot 1"))).toBe(true);
  });

  it("creates a synthetic imported ReversalDef artifact with counter reason evidence", () => {
    const artifact = createSyntheticImportedReversalTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-reversal-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-reversal-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    expect(artifact.gates[0]?.evidence.actorSources).toEqual(["imported"]);
    expect(artifact.gates[0]?.evidence.executedStates).toEqual(expect.arrayContaining([200, 777, 778]));
    expect(artifact.gates[0]?.evidence.executedControllers.HitDef).toBeGreaterThanOrEqual(1);
    expect(artifact.gates[0]?.evidence.executedControllers.ReversalDef).toBeGreaterThanOrEqual(1);
    expect(artifact.gates[0]?.evidence.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(artifact.gates[0]?.evidence.executedOperations.reversaldef).toBeGreaterThanOrEqual(1);
    expect(artifact.gates[0]?.evidence.eventCategories).toContain("reversal");
    expect(artifact.gates[0]?.evidence.combatReasons).toContain("reversal");
    expect(artifact.trace.events.some((event) => event.category === "reversal" && event.line.includes("reversed"))).toBe(true);
  });

  it("creates a synthetic imported damage-scale artifact with typed multiplier evidence", () => {
    const artifact = createSyntheticImportedDamageScaleTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-damage-scale-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-damage-scale-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.actorSources).toEqual(["imported"]);
    expect(evidence?.executedControllers.AttackMulSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.DefenceMulSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["damage-scale:attackmulset"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["damage-scale:defencemulset"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toContain("hit");
    expect(evidence?.combatReasons).toContain("hit");
    expect(evidence?.eventLines.some((line) => line.includes("for 30"))).toBe(true);
    expect(evidence?.finalActors).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "p2", source: "imported", life: 970, moveType: "H" })]),
    );
  });

  it("creates a synthetic imported data damage-scale artifact from CNS Data constants", () => {
    const artifact = createSyntheticImportedDataDamageScaleTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-data-damage-scale-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-data-damage-scale-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.actorSources).toEqual(["imported"]);
    expect(evidence?.executedControllers.AttackMulSet ?? 0).toBe(0);
    expect(evidence?.executedControllers.DefenceMulSet ?? 0).toBe(0);
    expect(evidence?.executedOperations["damage-scale:attackmulset"] ?? 0).toBe(0);
    expect(evidence?.executedOperations["damage-scale:defencemulset"] ?? 0).toBe(0);
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventLines.some((line) => line.includes("for 30"))).toBe(true);
    expect(evidence?.finalActors).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "p2", source: "imported", life: 970, moveType: "H" })]),
    );
  });

  it("creates a synthetic imported bounds artifact with typed PosFreeze and ScreenBound evidence", () => {
    const artifact = createSyntheticImportedBoundsTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-bounds-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-bounds-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.actorSources).toContain("imported");
    expect(evidence?.executedControllers.PosFreeze).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.ScreenBound).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["bounds:posfreeze"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["bounds:screenbound"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1",
          source: "imported",
          animNo: 200,
          posFreezeX: true,
          posFreezeY: false,
          screenBound: false,
          moveCameraX: false,
          moveCameraY: true,
        }),
      ]),
    );
  });

  it("creates a synthetic imported ScreenBound camera artifact with clamp and camera evidence", () => {
    const artifact = createSyntheticImportedScreenBoundCameraTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-screenbound-camera-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-screenbound-camera-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedControllers.ScreenBound).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.PosAdd).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["bounds:screenbound"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["kinematic:posadd"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.stageFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          stageId: "trace-screenbound-camera-grid",
          bounds: { left: -320, right: 320 },
          minCamera: expect.objectContaining({ x: 0 }),
          maxCamera: expect.objectContaining({ x: 155 }),
        }),
      ]),
    );
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1",
          source: "imported",
          animNo: 200,
          screenBound: false,
          moveCameraX: false,
          maxPos: expect.objectContaining({ x: 375 }),
        }),
      ]),
    );
    expect(artifact.trace.frames.some((frame) => frame.stage?.camera.x === 0)).toBe(true);
  });

  it("creates a synthetic imported Gravity artifact with typed vertical velocity evidence", () => {
    const artifact = createSyntheticImportedGravityTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-gravity-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "imported-x-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedControllers.Gravity).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["kinematic:gravity"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1",
          source: "imported",
          stateType: "A",
          animNo: 200,
          maxVel: expect.objectContaining({ y: expect.any(Number) }),
        }),
      ]),
    );
    const airborneFrame = evidence?.actorFrames.find((frame) => frame.actorId === "p1" && frame.source === "imported" && frame.animNo === 200);
    expect(airborneFrame?.maxVel.y).toBeGreaterThanOrEqual(0.55);
    expect(artifact.gates[0]?.requirements.requiredActorFrames).toEqual([
      {
        actorId: "p1",
        source: "imported",
        actorKind: "player",
        animNo: 200,
        stateType: "A",
        observedVelYAtLeast: 0.55,
        minFrames: 1,
      },
    ]);
  });

  it("creates a synthetic imported kinematic artifact with typed position and velocity evidence", () => {
    const artifact = createSyntheticImportedKinematicTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-kinematic-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "imported-x-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedControllers.VelSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.VelAdd).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.VelMul).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.PosSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.PosAdd).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["kinematic:velset"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["kinematic:veladd"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["kinematic:velmul"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["kinematic:posset"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["kinematic:posadd"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1",
          source: "imported",
          animNo: 200,
          maxPos: expect.objectContaining({ x: expect.any(Number) }),
          maxVel: expect.objectContaining({ x: expect.any(Number) }),
          minVel: expect.objectContaining({ y: expect.any(Number) }),
        }),
      ]),
    );
    const kinematicFrame = evidence?.actorFrames.find((frame) => frame.actorId === "p1" && frame.source === "imported" && frame.animNo === 200);
    expect(kinematicFrame?.maxPos.x).toBeGreaterThanOrEqual(-14);
    expect(kinematicFrame?.minPos.y).toBeLessThanOrEqual(-10);
    expect(kinematicFrame?.maxVel.x).toBeGreaterThanOrEqual(6);
    expect(kinematicFrame?.minVel.y).toBeLessThanOrEqual(-1);
    expect(artifact.gates[0]?.requirements.requiredActorFrames).toEqual([
      {
        actorId: "p1",
        source: "imported",
        actorKind: "player",
        animNo: 200,
        observedPosXAtLeast: -14,
        observedPosYAtMost: -10,
        observedVelXAtLeast: 6,
        observedVelYAtMost: -1,
        minFrames: 1,
      },
    ]);
  });

  it("creates a synthetic imported Width artifact with typed collision evidence", () => {
    const artifact = createSyntheticImportedWidthTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-width-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-width-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedControllers.Width).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["collision:width"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1",
          source: "imported",
          animNo: 200,
          bodyWidthFront: 18,
          bodyWidthBack: 44,
        }),
      ]),
    );
    expect(artifact.trace.finalActors.some((actor) => actor.bodyWidth?.front === 18 && actor.bodyWidth.back === 44)).toBe(true);
  });

  it("creates a synthetic imported StateTypeSet artifact with typed metadata evidence", () => {
    const artifact = createSyntheticImportedStateTypeSetTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-statetypeset-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-statetypeset-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedControllers.StateTypeSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["metadata:statetypeset"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1",
          source: "imported",
          animNo: 200,
          stateType: "C",
          moveType: "A",
          physics: "N",
        }),
      ]),
    );
    expect(
      artifact.trace.finalActors.some((actor) => actor.stateType === "C" && actor.moveType === "A" && actor.physics === "N"),
    ).toBe(true);
  });

  it("creates a synthetic imported PlayerPush artifact with typed collision evidence", () => {
    const artifact = createSyntheticImportedPlayerPushTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-playerpush-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-playerpush-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedControllers.PlayerPush).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["collision:playerpush"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1",
          source: "imported",
          animNo: 200,
          playerPush: false,
        }),
      ]),
    );
    expect(artifact.trace.finalActors.some((actor) => actor.playerPush === false)).toBe(true);
  });

  it("creates a synthetic imported Turn artifact with typed orientation evidence", () => {
    const artifact = createSyntheticImportedTurnTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-turn-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-turn-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedControllers.Turn).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["orientation:turn"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1",
          source: "imported",
          animNo: 200,
          facing: -1,
        }),
      ]),
    );
    expect(artifact.trace.finalActors.some((actor) => actor.id === "p1" && actor.facing === -1)).toBe(true);
  });

  it("creates a synthetic imported SprPriority artifact with typed sprite-effect evidence", () => {
    const artifact = createSyntheticImportedSprPriorityTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-sprpriority-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-sprpriority-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedControllers.SprPriority).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["sprite-effect:sprpriority"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1",
          source: "imported",
          animNo: 200,
          spritePriority: 5,
        }),
      ]),
    );
    expect(artifact.trace.finalActors.some((actor) => actor.id === "p1" && actor.spritePriority === 5)).toBe(true);
  });

  it("creates a synthetic imported PalFX artifact with typed sprite-effect evidence", () => {
    const artifact = createSyntheticImportedPalFxTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-palfx-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-palfx-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedControllers.PalFX).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["sprite-effect:palfx"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1",
          source: "imported",
          animNo: 200,
          paletteFxTime: 18,
          paletteFxAddR: 80,
          paletteFxAddG: -10,
          paletteFxAddB: 255,
          paletteFxMulG: 160,
          paletteFxColor: 256,
          paletteFxInvert: true,
        }),
      ]),
    );
    expect(
      artifact.trace.finalActors.some(
        (actor) => actor.id === "p1" && actor.paletteFx?.time === 18 && actor.paletteFx.add[2] === 255 && actor.paletteFx.invert,
      ),
    ).toBe(true);
  });

  it("creates a synthetic imported Trans artifact with typed sprite opacity evidence", () => {
    const artifact = createSyntheticImportedTransTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-trans-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-trans-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedControllers.Trans).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["sprite-effect:trans"]).toBeGreaterThanOrEqual(1);
    expect(artifact.gates[0]?.requirements.requiredActorFrames).toEqual([
      {
        actorId: "p1",
        source: "imported",
        actorKind: "player",
        animNo: 200,
        observedOpacityAtMost: 0.5,
        minFrames: 1,
      },
    ]);
  });

  it("creates a synthetic imported AngleDraw artifact with typed sprite rotation evidence", () => {
    const artifact = createSyntheticImportedAngleTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-angle-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-angle-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedControllers.AngleSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.AngleAdd).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.AngleDraw).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["sprite-effect:angleset"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["sprite-effect:angleadd"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["sprite-effect:angledraw"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1",
          animNo: 200,
          minAngle: 55,
          maxAngle: 55,
        }),
      ]),
    );
    expect(artifact.gates[0]?.requirements.requiredActorFrames).toEqual([
      {
        actorId: "p1",
        source: "imported",
        actorKind: "player",
        animNo: 200,
        observedAngleAtLeast: 55,
        observedAngleAtMost: 55,
        minFrames: 1,
      },
    ]);
  });

  it("creates a synthetic imported EnvColor artifact with typed stage-flash evidence", () => {
    const artifact = createSyntheticImportedEnvColorTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-envcolor-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-envcolor-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedControllers.EnvColor).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.envcolor).toBeGreaterThanOrEqual(1);
    expect(artifact.gates[0]?.requirements.requiredStageFrames).toEqual([
      {
        stageId: "trace-close-training-grid",
        envColorR: 16,
        envColorG: 96,
        envColorB: 255,
        envColorUnder: false,
        observedEnvColorOpacityAtLeast: 0.2,
        minFrames: 1,
      },
    ]);
    expect(evidence?.stageFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          stageId: "trace-close-training-grid",
          envColor: expect.objectContaining({
            color: [16, 96, 255],
            under: false,
          }),
        }),
      ]),
    );
  });

  it("creates a synthetic imported EnvShake artifact with runtime camera event evidence", () => {
    const artifact = createSyntheticImportedEnvShakeTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-envshake-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "imported-x-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(artifact.gates[0]?.requirements.requiredExecutedControllers).toEqual(["ChangeState", "EnvShake", "HitDef"]);
    expect(artifact.gates[0]?.requirements.requiredEnvShakeEvents).toEqual([
      {
        actorId: "p1",
        source: "imported",
        actorKind: "player",
        time: 16,
        freq: 30,
        ampl: -7,
        phase: 0.5,
        stateNo: 200,
      },
    ]);
    expect(evidence?.executedControllers.EnvShake).toBeGreaterThanOrEqual(1);
    expect(evidence?.envShakeEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ actorId: "p1", time: 16, freq: 30, ampl: -7, phase: 0.5, stateNo: 200 }),
      ]),
    );
    expect(artifact.trace.finalActors.find((actor) => actor.id === "p1")?.envShakeEvents).toEqual(
      expect.arrayContaining([expect.objectContaining({ time: 16, freq: 30, ampl: -7, phase: 0.5, stateNo: 200 })]),
    );
  });

  it("creates a synthetic imported RemapPal artifact with typed sprite-effect evidence", () => {
    const artifact = createSyntheticImportedRemapPalTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-remappal-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-remappal-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedControllers.RemapPal).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["sprite-effect:remappal"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1",
          source: "imported",
          animNo: 200,
          paletteRemapSourceGroup: 1,
          paletteRemapSourceIndex: 1,
          paletteRemapDestGroup: 2,
          paletteRemapDestIndex: 3,
        }),
      ]),
    );
    expect(
      artifact.trace.finalActors.some(
        (actor) => actor.id === "p1" && actor.paletteRemap?.source[0] === 1 && actor.paletteRemap.dest[1] === 3,
      ),
    ).toBe(true);
  });

  it("creates a synthetic imported AfterImage artifact with typed sprite-effect evidence", () => {
    const artifact = createSyntheticImportedAfterImageTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-afterimage-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-afterimage-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedControllers.AfterImage).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.AfterImageTime).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["sprite-effect:afterimage"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["sprite-effect:afterimagetime"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1",
          source: "imported",
          animNo: 200,
          afterImageTime: 20,
          afterImageLength: 4,
          afterImageTimeGap: 2,
          afterImageFrameGap: 1,
          afterImageSampleCount: 1,
          afterImageOpacity: 0.34,
        }),
      ]),
    );
    expect(
      artifact.trace.finalActors.some(
        (actor) => actor.id === "p1" && actor.afterImage?.length === 4 && actor.afterImage.sampleCount >= 1,
      ),
    ).toBe(true);
  });

  it("creates a synthetic imported HitDef priority artifact with bounded direct-clash evidence", () => {
    const artifact = createSyntheticImportedHitDefPriorityTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-hitdef-priority-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-hitdef-priority-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.actorSources).toEqual(["imported"]);
    expect(evidence?.executedControllers.HitDef).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toEqual(expect.arrayContaining(["hit", "runtime"]));
    expect(evidence?.combatReasons).toContain("hit");
    expect(evidence?.eventLines.some((line) => line.includes("HitDef priority clash") && line.includes("priority 6 beat"))).toBe(true);
    expect(evidence?.eventLines.some((line) => line.includes("hit Synthetic Imported HitDef Priority P2 for 31"))).toBe(true);
    expect(evidence?.finalActors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "p1", source: "imported", life: 1000 }),
        expect.objectContaining({ id: "p2", source: "imported", life: 969, moveType: "H" }),
      ]),
    );
  });

  it("creates a synthetic imported HitDef kill artifact with nonlethal final-life evidence", () => {
    const artifact = createSyntheticImportedHitDefKillTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-hitdef-kill-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-hitdef-kill-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toContain("hit");
    expect(evidence?.eventLines.some((line) => line.includes("hit Mira Volt for 2000"))).toBe(true);
    expect(evidence?.finalActors).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "p2", source: "demo", life: 1, moveType: "H" })]),
    );
  });

  it("creates a synthetic imported HitDef guard.kill artifact with nonlethal guard evidence", () => {
    const artifact = createSyntheticImportedHitDefGuardKillTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-hitdef-guard-kill-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-hitdef-guard-kill-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toContain("guard");
    expect(evidence?.combatReasons).toContain("guard");
    expect(evidence?.eventLines.some((line) => line.includes("guarded Synthetic Imported HitDef Guard Kill Attacker for 2000"))).toBe(true);
    expect(evidence?.finalActors).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "p2", source: "demo", life: 1 })]),
    );
  });

  it("creates a synthetic imported guard artifact with held-back guard reason evidence", () => {
    const artifact = createSyntheticImportedGuardTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-guard-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "imported-guard-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const defenderFrames = artifact.trace.combatReasons.filter((reason) => reason.reason === "guard");
    expect(defenderFrames.length).toBeGreaterThanOrEqual(1);
    expect(artifact.gates[0]?.evidence.actorSources).toEqual(["demo", "imported"]);
    expect(artifact.gates[0]?.evidence.executedControllers.HitDef).toBeGreaterThanOrEqual(1);
    expect(artifact.gates[0]?.evidence.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(artifact.gates[0]?.evidence.executedStates).toContain(260);
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([200, 260]);
    expect(artifact.gates[0]?.evidence.eventCategories).toContain("guard");
    expect(artifact.gates[0]?.evidence.combatReasons).toContain("guard");
    expect(artifact.trace.events.some((event) => event.category === "guard" && event.line.includes("guarded"))).toBe(true);
  });

  it("creates a generic imported guard artifact for imported fighters", () => {
    const imported = createSyntheticImportedTraceFighter({
      id: "custom-imported-guard",
      displayName: "Custom Imported Guard",
      guardDamage: 3,
      guardFlag: "MA",
    });

    const artifact = createImportedGuardTraceArtifact(imported, {
      generatedAt: "2026-06-25T00:00:00.000Z",
      targetId: "custom-imported-guard-golden",
      targetLabel: "Custom Imported Guard Route",
    });
    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "custom-imported-guard-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "imported-guard-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    expect(artifact.gates[0]?.evidence.eventCategories).toContain("guard");
    expect(artifact.gates[0]?.evidence.combatReasons).toContain("guard");
  });

  it("creates a synthetic imported AssertSpecial unguardable artifact with hit evidence despite held-back input", () => {
    const artifact = createSyntheticImportedAssertSpecialUnguardableTraceArtifact({
      generatedAt: "2026-06-25T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-assertspecial-unguardable-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-assertspecial-unguardable-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedControllers.AssertSpecial).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.HitDef).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toContain("hit");
    expect(evidence?.eventCategories).not.toContain("guard");
    expect(evidence?.combatReasons).toContain("hit");
    expect(evidence?.combatReasons).not.toContain("guard");
    expect(artifact.trace.events.some((event) => event.category === "hit" && event.line.includes("hit"))).toBe(true);
    expect(artifact.trace.events.some((event) => event.category === "guard")).toBe(false);
  });

  it("creates a synthetic imported AssertSpecial guard-deny artifact with NoStandGuard hit evidence", () => {
    const artifact = createSyntheticImportedAssertSpecialGuardDenyTraceArtifact({
      generatedAt: "2026-06-25T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-assertspecial-guarddeny-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-assertspecial-guarddeny-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedControllers.AssertSpecial).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.HitDef).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toContain("hit");
    expect(evidence?.eventCategories).not.toContain("guard");
    expect(evidence?.combatReasons).toContain("hit");
    expect(evidence?.combatReasons).not.toContain("guard");
    expect(evidence?.finalActors.find((actor) => actor.id === "p1")).toMatchObject({
      source: "imported",
      life: 963,
    });
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([expect.objectContaining({ actorId: "p1", source: "imported", moveType: "H" })]),
    );
    expect(artifact.trace.events.some((event) => event.category === "guard")).toBe(false);
  });

  it("creates a synthetic imported AssertSpecial crouch guard-deny artifact with NoCrouchGuard hit evidence", () => {
    const artifact = createSyntheticImportedAssertSpecialCrouchGuardDenyTraceArtifact({
      generatedAt: "2026-06-25T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-assertspecial-crouch-guarddeny-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-assertspecial-crouch-guarddeny-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedControllers.AssertSpecial).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.HitDef).toBeGreaterThanOrEqual(1);
    expect(evidence?.activeCommands).toEqual(expect.arrayContaining(["holdback", "holddown", "x"]));
    expect(evidence?.eventCategories).toContain("hit");
    expect(evidence?.eventCategories).not.toContain("guard");
    expect(evidence?.combatReasons).toContain("hit");
    expect(evidence?.combatReasons).not.toContain("guard");
    expect(evidence?.finalActors.find((actor) => actor.id === "p1")).toMatchObject({
      source: "imported",
      life: 963,
    });
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([expect.objectContaining({ actorId: "p1", source: "imported", stateType: "C", moveType: "H" })]),
    );
    expect(artifact.trace.events.some((event) => event.category === "guard")).toBe(false);
  });

  it("creates a synthetic imported AssertSpecial air guard-deny artifact with NoAirGuard hit evidence", () => {
    const artifact = createSyntheticImportedAssertSpecialAirGuardDenyTraceArtifact({
      generatedAt: "2026-06-25T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-assertspecial-air-guarddeny-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-assertspecial-air-guarddeny-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedControllers.AssertSpecial).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.HitDef).toBeGreaterThanOrEqual(1);
    expect(evidence?.activeCommands).toEqual(expect.arrayContaining(["holdback", "x"]));
    expect(evidence?.eventCategories).toContain("hit");
    expect(evidence?.eventCategories).not.toContain("guard");
    expect(evidence?.combatReasons).toContain("hit");
    expect(evidence?.combatReasons).not.toContain("guard");
    expect(evidence?.finalActors.find((actor) => actor.id === "p1")).toMatchObject({
      source: "imported",
      life: 963,
    });
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([expect.objectContaining({ actorId: "p1", source: "imported", stateType: "A", moveType: "H" })]),
    );
    expect(artifact.trace.events.some((event) => event.category === "guard")).toBe(false);
  });

  it("creates a synthetic imported AssertSpecial lifetime artifact where expired NoStandGuard allows later guard", () => {
    const artifact = createSyntheticImportedAssertSpecialLifetimeTraceArtifact({
      generatedAt: "2026-06-25T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-assertspecial-lifetime-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-assertspecial-lifetime-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedControllers.AssertSpecial).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.HitDef).toBeGreaterThanOrEqual(1);
    expect(evidence?.activeCommands).toEqual(expect.arrayContaining(["holdback", "x"]));
    expect(evidence?.eventCategories).toContain("guard");
    expect(evidence?.eventCategories).not.toContain("hit");
    expect(evidence?.combatReasons).toContain("guard");
    expect(evidence?.combatReasons).not.toContain("hit");
    expect(evidence?.finalActors.find((actor) => actor.id === "p1")).toMatchObject({
      source: "imported",
      life: 995,
    });
    expect(artifact.trace.events.some((event) => event.category === "guard")).toBe(true);
    expect(artifact.trace.events.some((event) => event.category === "hit")).toBe(false);
  });

  it("creates a synthetic imported AssertSpecial control artifact with facing, walk, and invisible evidence", () => {
    const artifact = createSyntheticImportedAssertSpecialControlTraceArtifact({
      generatedAt: "2026-06-25T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-assertspecial-control-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-assertspecial-control-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedControllers.AssertSpecial).toBeGreaterThanOrEqual(1);
    const actorFrame = evidence?.actorFrames.find((actor) => actor.actorId === "p1" && actor.source === "imported" && actor.animNo === 0);
    expect(actorFrame).toMatchObject({
      animNo: 0,
      facing: 1,
      maxOpacity: 0,
      minOpacity: 0,
    });
    expect(actorFrame?.minVel.x).toBe(0);
    expect(actorFrame?.maxVel.x).toBe(0);
    expect(actorFrame?.minPos.x).toBe(30);
    expect(actorFrame?.maxPos.x).toBe(30);
    expect(evidence?.finalActors.find((actor) => actor.id === "p1")).toMatchObject({
      stateNo: 0,
      ctrl: true,
    });
  });

  it("creates a synthetic imported AssertSpecial NoKO artifact with nonlethal hit evidence", () => {
    const artifact = createSyntheticImportedAssertSpecialNoKoTraceArtifact({
      generatedAt: "2026-06-25T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-assertspecial-noko-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-assertspecial-noko-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedControllers.AssertSpecial).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.HitDef).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventLines.some((line) => line.includes("hit Synthetic Imported AssertSpecial NoKO Defender for 2000"))).toBe(
      true,
    );
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")?.life).toBe(1);
  });

  it("creates a synthetic imported default Common1 guard-state artifact", () => {
    const artifact = createSyntheticImportedDefaultGuardStateTraceArtifact({
      generatedAt: "2026-06-25T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-default-guard-state-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-default-guard-state-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([130, 150, 151, 200]));
    expect(evidence?.executedControllers.HitDef).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.HitVelSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["resource:ctrlset"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["kinematic:hitvelset"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toContain("guard");
    expect(evidence?.combatReasons).toContain("guard");
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      source: "imported",
      moveType: "I",
      ctrl: true,
    });
    expect(artifact.trace.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      guardSlideTime: 5,
      guardControlTime: 7,
    });
  });

  it("creates a reusable imported default guard-state artifact for imported fighters", () => {
    const imported = createSyntheticImportedTraceFighter({
      id: "custom-imported-default-guard-state",
      displayName: "Custom Imported Default Guard State",
      defaultGuardHit: { shakeStateNo: 150, slideStateNo: 151, guardStateNo: 130 },
    });

    const artifact = createImportedDefaultGuardStateTraceArtifact(imported, {
      generatedAt: "2026-06-25T00:00:00.000Z",
      targetId: "custom-imported-default-guard-state-golden",
      targetLabel: "Custom Imported Default Guard State",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "custom-imported-default-guard-state-golden",
        source: "imported",
      },
      gates: [
        {
          label: "custom-imported-default-guard-state-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    expect(artifact.gates[0]?.evidence.executedStates).toEqual(expect.arrayContaining([150, 151]));
    expect(artifact.gates[0]?.evidence.executedControllers.HitVelSet).toBeGreaterThanOrEqual(1);
    expect(artifact.gates[0]?.evidence.executedOperations["resource:ctrlset"]).toBeGreaterThanOrEqual(1);
  });

  it("creates a synthetic imported crouch guard-state artifact from command expressions", () => {
    const artifact = createSyntheticImportedCrouchGuardStateTraceArtifact({
      generatedAt: "2026-06-25T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-crouch-guard-state-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-crouch-guard-state-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.activeCommands).toEqual(expect.arrayContaining(["holddown", "x"]));
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([152, 153, 200]));
    expect(evidence?.executedControllers.HitVelSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["kinematic:hitvelset"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toContain("guard");
  });

  it("creates a synthetic imported atomic DB crouch guard-state artifact", () => {
    const artifact = createSyntheticImportedDiagonalCrouchGuardStateTraceArtifact({
      generatedAt: "2026-06-25T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-diagonal-crouch-guard-state-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-diagonal-crouch-guard-state-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.activeCommands).toEqual(expect.arrayContaining(["holdback", "holddown", "x"]));
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([152, 153, 200]));
    expect(evidence?.executedOperations["kinematic:hitvelset"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toContain("guard");
  });

  it("creates a synthetic imported air guard-state artifact", () => {
    const artifact = createSyntheticImportedAirGuardStateTraceArtifact({
      generatedAt: "2026-06-25T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-air-guard-state-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-air-guard-state-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(artifact.gates[0]?.requirements.requiredExecutedControllers).toEqual(
      expect.arrayContaining(["ChangeState", "CtrlSet", "HitDef", "HitVelSet", "VelAdd"]),
    );
    expect(artifact.gates[0]?.requirements.requiredFinalActors).toEqual([
      expect.objectContaining({
        actorId: "p2",
        source: "imported",
        life: 995,
        ctrl: true,
        stateType: "S",
        moveType: "I",
        physics: "S",
      }),
    ]);
    expect(evidence?.activeCommands).toEqual(expect.arrayContaining(["holdback", "x"]));
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([154, 155, 200]));
    expect(evidence?.executedControllers.HitVelSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["kinematic:hitvelset"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.CtrlSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.VelAdd).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toContain("guard");
    expect(evidence?.combatReasons).toContain("guard");
  });

  it("creates a synthetic imported InGuardDist artifact without contact", () => {
    const artifact = createSyntheticImportedInGuardDistTraceArtifact({
      generatedAt: "2026-06-25T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-inguarddist-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-inguarddist-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([130, 200]));
    expect(evidence?.executedControllers.ChangeState).toBeGreaterThanOrEqual(1);
    expect(evidence?.combatReasons).toContain("whiff");
    expect(evidence?.combatReasons).not.toContain("guard");
    expect(evidence?.combatReasons).not.toContain("hit");
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      stateNo: 130,
      animNo: 130,
      ctrl: false,
      source: "imported",
    });
  });

  it("creates a synthetic imported InGuardDist far artifact that stays idle", () => {
    const artifact = createSyntheticImportedInGuardDistFarTraceArtifact({
      generatedAt: "2026-06-25T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-inguarddist-far-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-inguarddist-far-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200]));
    expect(evidence?.executedStates).not.toContain(130);
    expect(evidence?.executedControllers.HitDef).toBeGreaterThanOrEqual(1);
    expect(evidence?.combatReasons).toContain("whiff");
    expect(evidence?.combatReasons).not.toContain("guard");
    expect(evidence?.combatReasons).not.toContain("hit");
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      stateNo: 0,
      animNo: 0,
      ctrl: true,
      source: "imported",
    });
  });

  it("creates a synthetic imported automatic guard-start artifact without contact", () => {
    const artifact = createSyntheticImportedAutoGuardStartTraceArtifact({
      generatedAt: "2026-06-25T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-auto-guard-start-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-auto-guard-start-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.activeCommands).toEqual(expect.arrayContaining(["holdback", "x"]));
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([120, 130, 200]));
    expect(evidence?.executedControllers.ChangeState).toBeGreaterThanOrEqual(1);
    expect(evidence?.combatReasons).toContain("whiff");
    expect(evidence?.combatReasons).not.toContain("guard");
    expect(evidence?.combatReasons).not.toContain("hit");
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      stateNo: 130,
      animNo: 130,
      ctrl: false,
      source: "imported",
    });
  });

  it("creates a synthetic imported automatic guard-end artifact without contact", () => {
    const artifact = createSyntheticImportedAutoGuardEndTraceArtifact({
      generatedAt: "2026-06-25T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-auto-guard-end-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-auto-guard-end-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([120, 130, 140, 200]));
    expect(evidence?.executedControllers.ChangeState).toBeGreaterThanOrEqual(2);
    expect(evidence?.combatReasons).toContain("whiff");
    expect(evidence?.combatReasons).not.toContain("guard");
    expect(evidence?.combatReasons).not.toContain("hit");
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      stateNo: 0,
      animNo: 0,
      ctrl: true,
      source: "imported",
    });
  });

  it("creates a synthetic imported hitstun artifact with target get-hit evidence", () => {
    const artifact = createSyntheticImportedHitstunTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-hitstun-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "imported-hitstun-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const targetActor = artifact.gates[0]?.evidence.finalActors.find((actor) => actor.id === "p2");
    expect(targetActor).toMatchObject({
      actorKind: "player",
      source: "demo",
      animNo: 500,
      moveType: "H",
    });
    expect(artifact.gates[0]?.evidence.eventCategories).toContain("hit");
    expect(artifact.gates[0]?.evidence.combatReasons).toContain("hit");
  });

  it("creates a synthetic imported fall artifact with partial hitFall evidence", () => {
    const artifact = createSyntheticImportedFallTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-fall-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-fall-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const targetActor = artifact.gates[0]?.evidence.finalActors.find((actor) => actor.id === "p2");
    expect(targetActor).toMatchObject({
      source: "demo",
      animNo: 500,
      moveType: "H",
      hitFall: {
        falling: true,
        damage: 70,
        velocity: { x: 3, y: -6 },
        recover: false,
        recoverTime: 30,
        envShake: { time: 15, freq: 178, ampl: 6, phase: 0 },
      },
    });
    expect(artifact.trace.finalActors[1]?.hitFall).toMatchObject({
      falling: true,
      damage: 70,
      velocity: { x: 3, y: -6 },
    });
  });

  it("creates a synthetic imported common get-hit artifact with fall controller execution evidence", () => {
    const artifact = createSyntheticImportedCommonGetHitTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-common-gethit-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-common-gethit-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 5100]));
    expect(evidence?.executedControllers.HitFallVel).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.HitFallDamage).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.HitFallSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.FallEnvShake).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["hitfall:hitfallvel"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["hitfall:hitfalldamage"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["hitfall:hitfallset"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.fallenvshake).toBeGreaterThanOrEqual(1);
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      stateNo: 5100,
      hitFall: {
        falling: false,
        damage: 0,
        velocity: { x: 2, y: -7 },
        recover: false,
        recoverTime: 30,
      },
    });
  });

  it("creates a synthetic imported fall.defence_up artifact with scaled HitFallDamage evidence", () => {
    const artifact = createSyntheticImportedFallDefenceUpTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-fall-defence-up-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-fall-defence-up-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 5100]));
    expect(evidence?.executedControllers.HitFallDamage).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["hitfall:hitfalldamage"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      source: "demo",
      stateNo: 5100,
      life: 858,
      hitFall: {
        falling: false,
        damage: 0,
      },
    });
  });

  it("creates a synthetic imported GetHitVar fall.defence_up artifact with route evidence", () => {
    const artifact = createSyntheticImportedGetHitVarFallDefenceUpTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-gethitvar-fall-defence-up-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-gethitvar-fall-defence-up-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 5100, 286]));
    expect(evidence?.executedControllers.HitFallVel).toBeGreaterThanOrEqual(1);
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      source: "demo",
      stateNo: 286,
      customOwnerId: "p1",
      hitFall: {
        falling: true,
        damage: 70,
      },
    });
  });

  it("creates a synthetic imported GetHitVar anim/type artifact with route evidence", () => {
    const artifact = createSyntheticImportedGetHitVarAnimTypeTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-gethitvar-animtype-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-gethitvar-animtype-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 5100, 287]));
    expect(evidence?.executedControllers.HitFallVel).toBeGreaterThanOrEqual(1);
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      source: "demo",
      stateNo: 287,
      customOwnerId: "p1",
      hitFall: {
        falling: true,
        damage: 0,
      },
    });
  });

  it("creates a synthetic imported custom-state artifact with owner-backed SelfState evidence", () => {
    const artifact = createSyntheticImportedCustomStateTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-custom-state-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-custom-state-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 888, 889]));
    expect(evidence?.executedControllers.HitDef).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.ChangeState).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.SelfState).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ actorId: "p2", customOwnerId: "p1", animNo: 888, moveType: "H" }),
        expect.objectContaining({ actorId: "p2", customOwnerId: "p1", animNo: 889, moveType: "H" }),
      ]),
    );
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      customOwnerId: undefined,
      stateNo: 0,
      animNo: 0,
      ctrl: true,
      moveType: "I",
    });
  });

  it("creates an imported default Common1 get-hit artifact without p2stateno", () => {
    const imported = createSyntheticImportedTraceFighter({
      id: "synthetic-imported-default-gethit",
      displayName: "Synthetic Imported Default GetHit",
      defaultGetHitState: { stateNo: 5000, animNo: 5000 },
    });
    const artifact = createImportedDefaultGetHitTraceArtifact(imported, {
      generatedAt: "2026-06-25T00:00:00.000Z",
      targetId: "synthetic-imported-default-gethit-golden",
      targetLabel: "Synthetic Imported Default GetHit",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-default-gethit-golden",
        source: "imported",
      },
      gates: [
        {
          label: "imported-default-gethit-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.actorSources).toEqual(["imported"]);
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 5000]));
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      source: "imported",
      stateNo: 5000,
      moveType: "H",
    });
  });

  it("creates an imported default Common1 progression artifact with HitShakeOver and HitOver", () => {
    const imported = createSyntheticImportedTraceFighter({
      id: "synthetic-imported-default-gethit-progression",
      displayName: "Synthetic Imported Default GetHit Progression",
      defaultGetHitProgression: { shakeStateNo: 5000, slideStateNo: 5001 },
    });
    const artifact = createImportedDefaultGetHitProgressionTraceArtifact(imported, {
      generatedAt: "2026-06-25T00:00:00.000Z",
      targetId: "synthetic-imported-default-gethit-progression-golden",
      targetLabel: "Synthetic Imported Default GetHit Progression",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-default-gethit-progression-golden",
        source: "imported",
      },
      gates: [
        {
          label: "imported-default-gethit-progression-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([0, 200, 5000, 5001]));
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      source: "imported",
      stateNo: 0,
      moveType: "I",
      ctrl: true,
    });
  });

  it("creates an imported default Common1 airborne fall artifact through 5030 and 5050", () => {
    const imported = createSyntheticImportedTraceFighter({
      id: "synthetic-imported-default-fall-gethit",
      displayName: "Synthetic Imported Default Fall GetHit",
      defaultGetHitFall: { shakeStateNo: 5000, slideStateNo: 5001, airStateNo: 5030, fallStateNo: 5050 },
    });
    const attacker = createSyntheticImportedTraceFighter({
      id: "synthetic-imported-default-fall-attacker",
      displayName: "Synthetic Imported Default Fall Attacker",
      groundVelocity: [-3, -6],
      fall: { enabled: true, damage: 20, velocity: { x: 3, y: -6 }, recover: false, recoverTime: 30 },
    });
    const artifact = createImportedDefaultFallGetHitTraceArtifact(imported, {
      generatedAt: "2026-06-25T00:00:00.000Z",
      targetId: "synthetic-imported-default-fall-gethit-golden",
      targetLabel: "Synthetic Imported Default Fall GetHit",
      attacker,
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-default-fall-gethit-golden",
        source: "imported",
      },
      gates: [
        {
          label: "imported-default-fall-gethit-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 5000, 5030, 5050]));
    expect(evidence?.executedControllers.HitDef).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.HitVelSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.VelAdd).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      source: "imported",
      hitFall: {
        falling: true,
        velocity: { y: -6 },
        recover: false,
      },
    });
  });

  it("creates a synthetic imported default Common1 fall recovery chain artifact", () => {
    const artifact = createSyntheticImportedDefaultFallRecoveryTraceArtifact({
      generatedAt: "2026-06-25T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-default-fall-recovery-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-default-fall-recovery-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 5000, 5030, 5050, 5100, 5101, 5110, 5120]));
    expect(evidence?.executedControllers.HitDef).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.HitVelSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.HitFallDamage).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.HitFallSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.VelAdd).toBeGreaterThanOrEqual(1);
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      source: "imported",
      stateNo: 0,
      moveType: "I",
      ctrl: true,
    });
  });

  it("creates a synthetic imported default Common1 recovery-input artifact", () => {
    const artifact = createSyntheticImportedDefaultFallRecoveryInputTraceArtifact({
      generatedAt: "2026-06-25T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-default-fall-recovery-input-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-default-fall-recovery-input-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 5000, 5030, 5050, 5210]));
    expect(evidence?.activeCommands).toEqual(expect.arrayContaining(["x", "recovery"]));
    expect(evidence?.executedControllers.HitFallSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      source: "imported",
      stateNo: 0,
      moveType: "I",
      ctrl: true,
    });
  });

  it("creates a synthetic imported default Common1 air-recovery velocity artifact", () => {
    const artifact = createSyntheticImportedDefaultFallAirRecoveryVelocityTraceArtifact({
      generatedAt: "2026-06-25T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-default-fall-air-recovery-velocity-golden",
        source: "imported",
      },
      gates: [
        {
          label: "imported-default-fall-recovery-input-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 5000, 5030, 5050, 5210]));
    expect(evidence?.activeCommands).toEqual(expect.arrayContaining(["x", "recovery"]));
    expect(evidence?.executedControllers.VelSet).toBeGreaterThanOrEqual(1);
    const airRecoveryFrame = evidence?.actorFrames.find(
      (frame) => frame.actorId === "p2" && frame.source === "imported" && frame.animNo === 5210,
    );
    expect(airRecoveryFrame?.minVel.x).toBeLessThanOrEqual(0);
    expect(airRecoveryFrame?.maxVel.x).toBeGreaterThanOrEqual(0);
    expect(airRecoveryFrame?.minVel.y).toBeLessThanOrEqual(-2);
    expect(artifact.gates[0]?.requirements.requiredActorFrames).toEqual([
      {
        actorId: "p2",
        source: "imported",
        actorKind: "player",
        animNo: 5210,
        moveType: "I",
        observedVelXAtLeast: 0,
        observedVelXAtMost: 0,
        observedVelYAtMost: -2,
        minFrames: 1,
      },
    ]);
  });

  it("creates a synthetic imported default Common1 recovery-threshold artifact", () => {
    const artifact = createSyntheticImportedDefaultFallRecoveryThresholdTraceArtifact({
      generatedAt: "2026-06-25T00:00:00.000Z",
    });
    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-default-fall-recovery-threshold-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-default-fall-recovery-threshold-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 5000, 5030, 5050, 5210]));
    expect(evidence?.activeCommands).toEqual(expect.arrayContaining(["x", "recovery"]));
    const fallFrame = evidence?.actorFrames.find((frame) => frame.actorId === "p2" && frame.source === "imported" && frame.animNo === 5050);
    expect(fallFrame).toMatchObject({
      actorId: "p2",
      source: "imported",
      animNo: 5050,
    });
    expect(fallFrame?.maxHitFallRecoverTime).toBeGreaterThanOrEqual(1);
    const recoveryFrame = evidence?.actorFrames.find((frame) => frame.actorId === "p2" && frame.source === "imported" && frame.animNo === 5210);
    expect(recoveryFrame).toMatchObject({
      actorId: "p2",
      source: "imported",
      animNo: 5210,
      minHitFallRecoverTime: 0,
    });
    expect(artifact.gates[0]?.requirements.requiredActorFrames).toEqual([
      {
        actorId: "p2",
        source: "imported",
        actorKind: "player",
        animNo: 5050,
        moveType: "H",
        observedHitFallRecoverTimeAtLeast: 1,
        minFrames: 1,
      },
      {
        actorId: "p2",
        source: "imported",
        actorKind: "player",
        animNo: 5210,
        moveType: "I",
        observedHitFallRecoverTimeAtMost: 0,
        minFrames: 1,
      },
    ]);
  });

  it("creates a synthetic imported default Common1 recovery tick-order artifact", () => {
    const artifact = createSyntheticImportedDefaultFallRecoveryTickOrderTraceArtifact({
      generatedAt: "2026-06-25T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-default-fall-recovery-tick-order-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-default-fall-recovery-tick-order-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 5000, 5030, 5050, 5210]));
    expect(evidence?.activeCommands).toEqual(expect.arrayContaining(["x", "recovery"]));
    const fallFrame = evidence?.actorFrames.find(
      (frame) => frame.actorId === "p2" && frame.source === "imported" && frame.animNo === 5050 && frame.moveType === "H",
    );
    const recoveryFrame = evidence?.actorFrames.find(
      (frame) => frame.actorId === "p2" && frame.source === "imported" && frame.animNo === 5210 && frame.moveType === "I",
    );
    expect(fallFrame?.maxHitFallRecoverTime).toBeGreaterThanOrEqual(1);
    expect(recoveryFrame?.minHitFallRecoverTime).toBeLessThanOrEqual(0);
    expect(fallFrame?.lastTick).toBeLessThan(recoveryFrame?.firstTick ?? 0);
    expect(artifact.gates[0]?.requirements.requiredActorFrameSequences).toEqual([
      {
        label: "5050 positive recoverTime before 5210 recovery",
        steps: [
          {
            actorId: "p2",
            source: "imported",
            actorKind: "player",
            animNo: 5050,
            moveType: "H",
            observedHitFallRecoverTimeAtLeast: 1,
            minFrames: 1,
          },
          {
            actorId: "p2",
            source: "imported",
            actorKind: "player",
            animNo: 5210,
            moveType: "I",
            observedHitFallRecoverTimeAtMost: 0,
            minFrames: 1,
          },
        ],
      },
    ]);
  });

  it("creates a synthetic imported default Common1 ground-recovery artifact", () => {
    const artifact = createSyntheticImportedDefaultFallGroundRecoveryTraceArtifact({
      generatedAt: "2026-06-25T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-default-fall-ground-recovery-golden",
        source: "imported",
      },
      gates: [
        {
          label: "imported-default-fall-ground-recovery-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 5000, 5030, 5050, 5200, 5201, 52]));
    expect(evidence?.activeCommands).toEqual(expect.arrayContaining(["x", "recovery"]));
    expect(evidence?.executedControllers.SelfState).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.VelSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.PosSet).toBeGreaterThanOrEqual(1);
    const groundRecoveryFrame = evidence?.actorFrames.find(
      (frame) => frame.actorId === "p2" && frame.source === "imported" && frame.animNo === 5201,
    );
    expect(groundRecoveryFrame?.minVel.x).toBeLessThanOrEqual(-0.15);
    expect(groundRecoveryFrame?.minVel.y).toBeLessThanOrEqual(-3.5);
    expect(groundRecoveryFrame?.minPos.y).toBeLessThanOrEqual(0);
    expect(artifact.gates[0]?.requirements.requiredActorFrames).toEqual([
      {
        actorId: "p2",
        source: "imported",
        actorKind: "player",
        animNo: 5200,
        moveType: "H",
        minFrames: 1,
      },
      {
        actorId: "p2",
        source: "imported",
        actorKind: "player",
        animNo: 5201,
        moveType: "H",
        observedVelXAtMost: -0.15,
        observedVelYAtMost: -3.5,
        observedPosYAtMost: 0,
        minFrames: 1,
      },
    ]);
  });

  it("creates a synthetic imported default Common1 recovery-input too-early reject artifact", () => {
    const artifact = createSyntheticImportedDefaultFallRecoveryTooEarlyTraceArtifact({
      generatedAt: "2026-06-25T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-default-fall-recovery-too-early-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-default-fall-recovery-too-early-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 5000, 5030, 5050]));
    expect(evidence?.executedStates).not.toContain(5210);
    expect(evidence?.activeCommands).toEqual(expect.arrayContaining(["x", "recovery"]));
    expect(evidence?.executedControllers.HitVelSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      source: "imported",
      stateNo: 5050,
      moveType: "H",
      ctrl: false,
    });
  });

  it("creates an imported default Common1 fall recovery artifact for official-style fixtures", () => {
    const imported = createSyntheticImportedTraceFighter({
      id: "synthetic-imported-default-fall-official-recovery",
      displayName: "Synthetic Imported Default Fall Official Recovery",
      defaultGetHitFall: {
        shakeStateNo: 5000,
        slideStateNo: 5001,
        airStateNo: 5030,
        fallStateNo: 5050,
        groundStateNo: 5100,
        bounceStateNo: 5101,
        liedownStateNo: 5110,
        recoverStateNo: 5120,
        includeRecoveryChain: true,
      },
    });
    const artifact = createImportedDefaultFallRecoveryTraceArtifact(imported, {
      generatedAt: "2026-06-25T00:00:00.000Z",
      targetId: "synthetic-imported-default-fall-official-recovery-golden",
      targetLabel: "Synthetic imported official-style fall recovery route",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-default-fall-official-recovery-golden",
        source: "imported",
      },
      gates: [
        {
          label: "imported-default-fall-recovery-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 5000, 5030, 5050, 5100, 5101, 5110, 5120]));
    expect(evidence?.executedControllers.HitFallSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      source: "imported",
      stateNo: 0,
      moveType: "I",
      ctrl: true,
    });
  });

  it("creates an imported default Common1 recovery-input artifact for official-style fixtures", () => {
    const imported = createSyntheticImportedTraceFighter({
      id: "synthetic-imported-default-fall-official-recovery-input",
      displayName: "Synthetic Imported Default Fall Official Recovery Input",
      defaultGetHitFall: {
        shakeStateNo: 5000,
        slideStateNo: 5001,
        airStateNo: 5030,
        fallStateNo: 5050,
        recoveryInputStateNo: 5210,
        includeRecoveryInput: true,
      },
    });
    const artifact = createImportedDefaultFallRecoveryInputTraceArtifact(imported, {
      generatedAt: "2026-06-25T00:00:00.000Z",
      targetId: "synthetic-imported-default-fall-official-recovery-input-golden",
      targetLabel: "Synthetic imported official-style recovery input route",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-default-fall-official-recovery-input-golden",
        source: "imported",
      },
      gates: [
        {
          label: "imported-default-fall-recovery-input-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 5000, 5030, 5050, 5210]));
    expect(evidence?.activeCommands).toEqual(expect.arrayContaining(["x", "recovery"]));
    expect(evidence?.executedControllers.VelAdd).toBeGreaterThanOrEqual(1);
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      source: "imported",
      stateNo: 0,
      moveType: "I",
      ctrl: true,
    });
  });

  it("creates an imported default Common1 recovery-threshold artifact for official-style fixtures", () => {
    const imported = createSyntheticImportedTraceFighter({
      id: "synthetic-imported-default-fall-official-recovery-threshold",
      displayName: "Synthetic Imported Default Fall Official Recovery Threshold",
      defaultGetHitFall: {
        shakeStateNo: 5000,
        slideStateNo: 5001,
        airStateNo: 5030,
        fallStateNo: 5050,
        recoveryInputStateNo: 5200,
        groundRecoveryStateNo: 5200,
        groundRecoveryLandStateNo: 5201,
        landStateNo: 52,
        includeGroundRecovery: true,
      },
    });
    const artifact = createImportedDefaultFallRecoveryThresholdTraceArtifact(imported, {
      generatedAt: "2026-06-25T00:00:00.000Z",
      targetId: "synthetic-imported-default-fall-official-recovery-threshold-golden",
      targetLabel: "Synthetic imported official-style recovery threshold route",
      attacker: createSyntheticImportedTraceFighter({
        id: "synthetic-imported-default-fall-official-recovery-threshold-attacker",
        displayName: "Synthetic Imported Default Fall Official Recovery Threshold Attacker",
        groundVelocity: [-3, -6],
        fall: { enabled: true, damage: 20, velocity: { x: 3, y: -6 }, recover: true, recoverTime: 10 },
      }),
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-default-fall-official-recovery-threshold-golden",
        source: "imported",
      },
      gates: [
        {
          label: "imported-default-fall-ground-recovery-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 5000, 5030, 5050, 5200, 5201, 52]));
    const fallFrame = evidence?.actorFrames.find((frame) => frame.actorId === "p2" && frame.source === "imported" && frame.stateNo === 5050);
    const recoveryFrame = evidence?.actorFrames.find((frame) => frame.actorId === "p2" && frame.source === "imported" && frame.stateNo === 5200);
    expect(fallFrame).toBeDefined();
    expect(recoveryFrame).toBeDefined();
    if (!fallFrame || !recoveryFrame) {
      throw new Error("expected recovery-threshold actor-frame evidence");
    }
    expect(fallFrame?.maxHitFallRecoverTime).toBeGreaterThanOrEqual(1);
    expect(recoveryFrame?.minHitFallRecoverTime).toBeLessThanOrEqual(0);
    expect(fallFrame.lastTick).toBeLessThan(recoveryFrame.firstTick);
    expect(artifact.gates[0]?.requirements.requiredActorFrames).toEqual([
      {
        actorId: "p2",
        source: "imported",
        actorKind: "player",
        stateNo: 5050,
        moveType: "H",
        observedHitFallRecoverTimeAtLeast: 1,
        minFrames: 1,
      },
      {
        actorId: "p2",
        source: "imported",
        actorKind: "player",
        stateNo: 5200,
        moveType: "H",
        observedHitFallRecoverTimeAtMost: 0,
        minFrames: 1,
      },
    ]);
    expect(artifact.gates[0]?.requirements.requiredActorFrameSequences).toEqual([
      {
        label: "5050 positive recoverTime before 5200 ground recovery",
        steps: [
          {
            actorId: "p2",
            source: "imported",
            actorKind: "player",
            stateNo: 5050,
            moveType: "H",
            observedHitFallRecoverTimeAtLeast: 1,
            minFrames: 1,
          },
          {
            actorId: "p2",
            source: "imported",
            actorKind: "player",
            stateNo: 5200,
            moveType: "H",
            observedHitFallRecoverTimeAtMost: 0,
            minFrames: 1,
          },
        ],
      },
    ]);
  });

  it("creates an imported default Common1 recovery-input too-early reject artifact for official-style fixtures", () => {
    const imported = createSyntheticImportedTraceFighter({
      id: "synthetic-imported-default-fall-official-recovery-too-early",
      displayName: "Synthetic Imported Default Fall Official Recovery Too Early",
      defaultGetHitFall: {
        shakeStateNo: 5000,
        slideStateNo: 5001,
        airStateNo: 5030,
        fallStateNo: 5050,
        recoveryInputStateNo: 5210,
        includeRecoveryInput: true,
      },
    });
    const artifact = createImportedDefaultFallRecoveryTooEarlyTraceArtifact(imported, {
      generatedAt: "2026-06-25T00:00:00.000Z",
      targetId: "synthetic-imported-default-fall-official-recovery-too-early-golden",
      targetLabel: "Synthetic imported official-style recovery input too-early reject route",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-default-fall-official-recovery-too-early-golden",
        source: "imported",
      },
      gates: [
        {
          label: "imported-default-fall-recovery-too-early-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 5000, 5030, 5050]));
    expect(evidence?.executedStates).not.toContain(5210);
    expect(evidence?.executedStates).not.toContain(5200);
    expect(evidence?.executedStates).not.toContain(5201);
    expect(evidence?.activeCommands).toEqual(expect.arrayContaining(["x", "recovery"]));
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      source: "imported",
      stateNo: 5050,
      moveType: "H",
      ctrl: false,
    });
  });

  it("creates an imported default Common1 ground-recovery artifact for official-style fixtures", () => {
    const imported = createSyntheticImportedTraceFighter({
      id: "synthetic-imported-default-fall-official-ground-recovery",
      displayName: "Synthetic Imported Default Fall Official Ground Recovery",
      defaultGetHitFall: {
        shakeStateNo: 5000,
        slideStateNo: 5001,
        airStateNo: 5030,
        fallStateNo: 5050,
        groundRecoveryStateNo: 5200,
        groundRecoveryLandStateNo: 5201,
        landStateNo: 52,
        includeGroundRecovery: true,
      },
    });
    const artifact = createImportedDefaultFallGroundRecoveryTraceArtifact(imported, {
      generatedAt: "2026-06-25T00:00:00.000Z",
      targetId: "synthetic-imported-default-fall-official-ground-recovery-golden",
      targetLabel: "Synthetic imported official-style ground recovery route",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-default-fall-official-ground-recovery-golden",
        source: "imported",
      },
      gates: [
        {
          label: "imported-default-fall-ground-recovery-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 5000, 5030, 5050, 5200, 5201, 52]));
    expect(evidence?.activeCommands).toEqual(expect.arrayContaining(["x", "recovery"]));
    expect(evidence?.executedControllers.SelfState).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.VelSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.PosSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      source: "imported",
      stateNo: 0,
      moveType: "I",
      ctrl: true,
    });
  });

  it("creates a synthetic imported state-exit artifact with final idle/control evidence", () => {
    const artifact = createSyntheticImportedStateExitTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-state-exit-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "imported-state-exit-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const finalActor = artifact.gates[0]?.evidence.finalActors.find((actor) => actor.id === "p1");
    expect(finalActor).toMatchObject({
      source: "imported",
      stateNo: 0,
      animNo: 0,
      ctrl: true,
      moveType: "I",
    });
    expect(artifact.trace.finalActors[0]).toMatchObject({
      source: "imported",
      stateNo: 0,
      animNo: 0,
      ctrl: true,
    });
    expect(artifact.gates[0]?.evidence.eventCategories).toContain("hit");
    expect(artifact.gates[0]?.evidence.combatReasons).toContain("hit");
  });

  it("creates a synthetic imported target artifact with typed Target* operation evidence", () => {
    const artifact = createSyntheticImportedTargetTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-target-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-target-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedControllers.TargetLifeAdd).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.TargetDrop).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["target:targetlifeadd"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["target:targetpoweradd"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["target:targetvelset"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["target:targetveladd"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["target:targetfacing"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["target:targetbind"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["target:targetdrop"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.targetLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ownerId: "p1", actorId: "p2", targetId: 77 }),
        expect.objectContaining({
          ownerId: "p1",
          actorId: "p2",
          targetId: 77,
          hasBinding: true,
          minBindingRemaining: 3,
          maxBindingRemaining: 3,
          bindingOffset: { x: 36, y: -12 },
        }),
      ]),
    );
    expect(evidence?.finalActors.find((actor) => actor.id === "p1")).toMatchObject({
      actorKind: "player",
      source: "imported",
      targetCount: 0,
    });
    expect(artifact.trace.finalActors[0]?.actorKind).toBe("player");
  });

  it("creates a synthetic imported TargetState artifact with owner-backed SelfState evidence", () => {
    const artifact = createSyntheticImportedTargetStateCustomTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-targetstate-custom-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-targetstate-custom-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 888, 889]));
    expect(evidence?.executedControllers.HitDef).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.TargetState).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.ChangeState).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.SelfState).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["target:targetstate"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.targetLinks).toEqual(expect.arrayContaining([expect.objectContaining({ ownerId: "p1", actorId: "p2", targetId: 77 })]));
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ actorId: "p2", customOwnerId: "p1", animNo: 888, moveType: "H" }),
        expect.objectContaining({ actorId: "p2", customOwnerId: "p1", animNo: 889, moveType: "H" }),
      ]),
    );
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      customOwnerId: undefined,
      stateNo: 0,
      animNo: 0,
      ctrl: true,
      moveType: "I",
    });
  });

  it("creates a synthetic imported BindToTarget Head artifact with parsed Size anchor evidence", () => {
    const artifact = createSyntheticImportedBindToTargetHeadTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-bindtotarget-head-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-bindtotarget-head-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedControllers.BindToTarget).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.bindtotarget).toBeGreaterThanOrEqual(1);
    expect(evidence?.targetLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ownerId: "p1",
          actorId: "p2",
          targetId: 77,
          hasBinding: true,
          minBindingRemaining: 1,
          maxBindingRemaining: 3,
          bindingOffset: { x: 26, y: -80 },
        }),
      ]),
    );
  });

  it("creates a synthetic imported BindToTarget Mid artifact with parsed Size anchor evidence", () => {
    const artifact = createSyntheticImportedBindToTargetMidTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-bindtotarget-mid-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-bindtotarget-mid-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedControllers.BindToTarget).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.bindtotarget).toBeGreaterThanOrEqual(1);
    expect(evidence?.targetLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ownerId: "p1",
          actorId: "p2",
          targetId: 77,
          hasBinding: true,
          minBindingRemaining: 1,
          maxBindingRemaining: 3,
          bindingOffset: { x: 24, y: -50 },
        }),
      ]),
    );
  });

  it("creates a synthetic imported TargetBind pause artifact with movetime evidence", () => {
    const artifact = createSyntheticImportedTargetBindPauseTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-targetbind-pause-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-targetbind-pause-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedControllers.TargetBind).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.SuperPause).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.PosAdd).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["target:targetbind"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["pause:superpause"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["kinematic:posadd"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.targetLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ownerId: "p1",
          actorId: "p2",
          targetId: 77,
          hasBinding: true,
          frames: expect.any(Number),
          minBindingRemaining: 1,
          maxBindingRemaining: 3,
          bindingOffset: { x: 36, y: -12 },
        }),
      ]),
    );
    expect(evidence?.targetLinks.find((link) => link.hasBinding)?.frames).toBeGreaterThanOrEqual(2);
    expect(evidence?.matchPauseAdvances).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: "SuperPause", actorId: "p1" })]),
    );
  });

  it("creates a synthetic imported SuperPause artifact with typed pause operation evidence", () => {
    const artifact = createSyntheticImportedSuperPauseTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-superpause-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-superpause-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedControllers.SuperPause).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["pause:superpause"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toContain("pause");
    expect(artifact.gates[0]?.requirements.requiredMatchPauses).toEqual([
      { type: "SuperPause", actorId: "p1", sourceStateNo: 200, darken: true, minFrames: 2, minRemaining: 7, minMoveTime: 1 },
    ]);
    expect(artifact.gates[0]?.requirements.requiredMatchPauseFreezes).toEqual([
      { type: "SuperPause", actorId: "p2", minFrozenFrames: 6 },
    ]);
    expect(evidence?.matchPauses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "SuperPause",
          actorId: "p1",
          sourceStateNo: 200,
          darken: true,
          maxRemaining: 7,
          maxMoveTime: 1,
        }),
      ]),
    );
    expect(evidence?.matchPauses[0]?.frames).toBeGreaterThanOrEqual(2);
    expect(evidence?.matchPauseFreezes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "SuperPause",
          actorId: "p2",
          actorKind: "player",
          ownerId: "p2",
          frozenFrames: expect.any(Number),
        }),
      ]),
    );
    expect(evidence?.matchPauseFreezes.find((freeze) => freeze.actorId === "p2")?.frozenFrames).toBeGreaterThanOrEqual(6);
  });

  it("creates a synthetic imported SuperPause artifact that proves projectile freeze evidence", () => {
    const artifact = createSyntheticImportedSuperPauseProjectileFreezeTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-superpause-projectile-freeze-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-superpause-projectile-freeze-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(gate?.requirements.requiredEffectKinds).toEqual(["projectile"]);
    expect(gate?.requirements.requiredMatchPauseFreezes).toEqual([
      { type: "SuperPause", actorKind: "player", ownerId: "p2", minFrozenFrames: 6 },
      { type: "SuperPause", actorKind: "projectile", ownerId: "p1", minFrozenFrames: 5 },
    ]);
    expect(gate?.requirements.requiredMatchPauseAdvances).toEqual([
      { type: "SuperPause", actorKind: "projectile", ownerId: "p1", minAdvancedFrames: 1, minPreviousMoveTime: 1 },
    ]);
    expect(evidence?.effectKinds).toContain("projectile");
    expect(evidence?.executedOperations.projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["pause:superpause"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.matchPauseFreezes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "SuperPause",
          actorKind: "projectile",
          ownerId: "p1",
          frozenFrames: expect.any(Number),
        }),
      ]),
    );
    expect(evidence?.matchPauseFreezes.find((freeze) => freeze.actorKind === "projectile" && freeze.ownerId === "p1")?.frozenFrames).toBeGreaterThanOrEqual(5);
    expect(evidence?.matchPauseAdvances).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "SuperPause",
          actorKind: "projectile",
          ownerId: "p1",
          advancedFrames: expect.any(Number),
          maxPreviousMoveTime: 1,
          changedFields: expect.arrayContaining(["animTime", "pos"]),
        }),
      ]),
    );
    expect(evidence?.matchPauseAdvances.find((advance) => advance.actorKind === "projectile" && advance.ownerId === "p1")?.advancedFrames).toBeGreaterThanOrEqual(1);
  });

  it("creates a synthetic imported SuperPause artifact that proves helper and explod freeze evidence", () => {
    const artifact = createSyntheticImportedSuperPauseEffectFreezeTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-superpause-effect-freeze-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-superpause-effect-freeze-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(gate?.requirements.requiredEffectKinds).toEqual(["helper", "explod"]);
    expect(gate?.requirements.requiredMatchPauseFreezes).toEqual([
      { type: "SuperPause", actorKind: "player", ownerId: "p2", minFrozenFrames: 6 },
      { type: "SuperPause", actorKind: "helper", ownerId: "p1", minFrozenFrames: 5 },
      { type: "SuperPause", actorKind: "explod", ownerId: "p1", minFrozenFrames: 5 },
    ]);
    expect(gate?.requirements.requiredMatchPauseAdvances).toEqual([
      { type: "SuperPause", actorKind: "helper", ownerId: "p1", minAdvancedFrames: 1, minPreviousMoveTime: 1 },
      { type: "SuperPause", actorKind: "explod", ownerId: "p1", minAdvancedFrames: 1, minPreviousMoveTime: 1 },
    ]);
    expect(evidence?.effectKinds).toEqual(expect.arrayContaining(["helper", "explod"]));
    expect(evidence?.executedOperations.helper).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.explod).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["pause:superpause"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.matchPauseFreezes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "SuperPause", actorKind: "helper", ownerId: "p1" }),
        expect.objectContaining({ type: "SuperPause", actorKind: "explod", ownerId: "p1" }),
      ]),
    );
    expect(evidence?.matchPauseAdvances).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "SuperPause",
          actorKind: "helper",
          ownerId: "p1",
          changedFields: expect.arrayContaining(["animTime"]),
        }),
        expect.objectContaining({
          type: "SuperPause",
          actorKind: "explod",
          ownerId: "p1",
          changedFields: expect.arrayContaining(["animTime"]),
        }),
      ]),
    );
  });

  it("creates a synthetic imported Explod supermovetime artifact with freeze and advance evidence", () => {
    const artifact = createSyntheticImportedExplodSuperMoveTimeTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-explod-supermovetime-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-explod-supermovetime-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(gate?.requirements.requiredExecutedControllers).toEqual(["ChangeState", "HitDef", "SuperPause", { type: "Explod", minCount: 2 }]);
    expect(gate?.requirements.requiredMatchPauseFreezes).toEqual([
      { type: "SuperPause", actorId: "p1-explod-0", actorKind: "explod", ownerId: "p1", minFrozenFrames: 5 },
    ]);
    expect(gate?.requirements.requiredMatchPauseAdvances).toEqual([
      { type: "SuperPause", actorId: "p1-explod-1", actorKind: "explod", ownerId: "p1", minAdvancedFrames: 3, minPreviousMoveTime: 0 },
    ]);
    expect(evidence?.effectKinds).toContain("explod");
    expect(evidence?.executedControllers.Explod).toBeGreaterThanOrEqual(2);
    expect(evidence?.executedOperations.explod).toBeGreaterThanOrEqual(2);
    expect(evidence?.matchPauseFreezes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "SuperPause", actorId: "p1-explod-0", actorKind: "explod", ownerId: "p1" }),
      ]),
    );
    expect(evidence?.matchPauseAdvances).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "SuperPause",
          actorId: "p1-explod-1",
          actorKind: "explod",
          ownerId: "p1",
          changedFields: expect.arrayContaining(["animTime", "pos"]),
        }),
      ]),
    );
  });

  it("creates a synthetic imported Explod pausemovetime artifact with freeze and advance evidence", () => {
    const artifact = createSyntheticImportedExplodPauseMoveTimeTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-explod-pausemovetime-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-explod-pausemovetime-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(gate?.requirements.requiredExecutedControllers).toEqual(["ChangeState", "HitDef", "Pause", { type: "Explod", minCount: 2 }]);
    expect(gate?.requirements.requiredExecutedOperations).toEqual(["hitdef", "pause:pause", { operation: "explod", minCount: 2 }]);
    expect(gate?.requirements.requiredMatchPauses).toEqual([
      { type: "Pause", actorId: "p1", sourceStateNo: 200, darken: false, minFrames: 2, minRemaining: 7, minMoveTime: 1 },
    ]);
    expect(gate?.requirements.requiredMatchPauseFreezes).toEqual([
      { type: "Pause", actorId: "p1-explod-0", actorKind: "explod", ownerId: "p1", minFrozenFrames: 5 },
    ]);
    expect(gate?.requirements.requiredMatchPauseAdvances).toEqual([
      { type: "Pause", actorId: "p1-explod-1", actorKind: "explod", ownerId: "p1", minAdvancedFrames: 3, minPreviousMoveTime: 0 },
    ]);
    expect(evidence?.effectKinds).toContain("explod");
    expect(evidence?.executedControllers.Pause).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.Explod).toBeGreaterThanOrEqual(2);
    expect(evidence?.executedOperations["pause:pause"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.explod).toBeGreaterThanOrEqual(2);
    expect(evidence?.matchPauseFreezes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "Pause", actorId: "p1-explod-0", actorKind: "explod", ownerId: "p1" }),
      ]),
    );
    expect(evidence?.matchPauseAdvances).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "Pause",
          actorId: "p1-explod-1",
          actorKind: "explod",
          ownerId: "p1",
          changedFields: expect.arrayContaining(["animTime", "pos"]),
        }),
      ]),
    );
  });

  it("creates a synthetic imported Explod ignorehitpause artifact with hitpause freeze and advance evidence", () => {
    const artifact = createSyntheticImportedExplodIgnoreHitPauseTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-explod-ignorehitpause-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-explod-ignorehitpause-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(gate?.requirements.requiredExecutedControllers).toEqual(["ChangeState", "HitDef", { type: "Explod", minCount: 2 }]);
    expect(gate?.requirements.requiredExecutedOperations).toEqual(["hitdef", { operation: "explod", minCount: 2 }]);
    expect(gate?.requirements.requiredMatchPauseFreezes).toEqual([
      { type: "HitPause", actorId: "p1-explod-0", actorKind: "explod", ownerId: "p1", minFrozenFrames: 3 },
    ]);
    expect(gate?.requirements.requiredMatchPauseAdvances).toEqual([
      {
        type: "HitPause",
        actorId: "p1-explod-1",
        actorKind: "explod",
        ownerId: "p1",
        minAdvancedFrames: 3,
        minPreviousMoveTime: 1,
      },
    ]);
    expect(evidence?.eventCategories).toContain("hit");
    expect(evidence?.combatReasons).toContain("hit");
    expect(evidence?.executedControllers.Explod).toBeGreaterThanOrEqual(2);
    expect(evidence?.executedOperations.explod).toBeGreaterThanOrEqual(2);
    expect(evidence?.matchPauseFreezes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "HitPause", actorId: "p1-explod-0", actorKind: "explod", ownerId: "p1" }),
      ]),
    );
    expect(evidence?.matchPauseAdvances).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "HitPause",
          actorId: "p1-explod-1",
          actorKind: "explod",
          ownerId: "p1",
          changedFields: expect.arrayContaining(["animTime", "pos"]),
        }),
      ]),
    );
  });

  it("creates a synthetic imported Projectile artifact with typed projectile operation evidence", () => {
    const artifact = createSyntheticImportedProjectileTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-projectile-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-projectile-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.effectKinds).toContain("projectile");
    expect(evidence?.executedStates).toContain(270);
    expect(evidence?.executedControllers.Projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toContain("hit");
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "effect", actorKind: "projectile", ownerId: "p1", animNo: 911, moveType: "I", clsn1Count: 0 }),
      ]),
    );
    expect(artifact.gates[0]?.requirements.requiredActorFrames).toEqual([
      { source: "effect", actorKind: "projectile", ownerId: "p1", animNo: 911, moveType: "I", clsn1Count: 0 },
    ]);
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([200, 270]);
    expect(evidence?.worldLifecycleEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "spawn", kind: "projectile", ownerId: "p1", rootId: "p1", parentId: "p1" }),
        expect.objectContaining({ type: "remove", kind: "projectile", ownerId: "p1", rootId: "p1", parentId: "p1" }),
      ]),
    );
    expect(artifact.gates[0]?.requirements.requiredEffectStores).toEqual([
      { ownerId: "p1", minTotal: 1, minProjectiles: 1, minNextProjectileSerial: 1 },
    ]);
    expect(evidence?.effectStores).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ownerId: "p1",
          total: 1,
          projectiles: [expect.stringContaining("projectile")],
          nextSerials: expect.objectContaining({ projectile: 1 }),
        }),
      ]),
    );
    expect(evidence?.targetLinks).toEqual(
      expect.arrayContaining([expect.objectContaining({ ownerId: "p1", actorId: "p2", targetId: 77 })]),
    );
  });

  it("creates a synthetic imported Projectile ReceivedDamage artifact with defender-local branch evidence", () => {
    const artifact = createSyntheticImportedProjectileReceivedDamageTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-projectile-receiveddamage-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-projectile-receiveddamage-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 5000, 280]));
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([200, 5000, 280]);
    expect(evidence?.executedControllers.Projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toContain("hit");
    expect(evidence?.combatReasons).toContain("hit");
    expect(evidence?.effectKinds).toContain("projectile");
    expect(evidence?.targetLinks.some((link) => link.ownerId === "p1" && link.actorId === "p2" && link.targetId === 77)).toBe(true);
    expect(artifact.trace.finalActors.some((actor) => actor.id === "p2" && actor.stateNo === 280)).toBe(true);
  });

  it("creates a synthetic imported Projectile time artifact with ProjHitTime branch evidence", () => {
    const artifact = createSyntheticImportedProjectileTimeTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-projectile-time-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-projectile-time-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.effectKinds).toContain("projectile");
    expect(evidence?.executedStates).toContain(276);
    expect(evidence?.executedControllers.Projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toContain("hit");
    expect(evidence?.combatReasons).toContain("hit");
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([200, 276]);
    expect(evidence?.targetLinks).toEqual(
      expect.arrayContaining([expect.objectContaining({ ownerId: "p1", actorId: "p2", targetId: 77 })]),
    );
  });

  it("creates a synthetic imported Projectile motion artifact with accel and scale evidence", () => {
    const artifact = createSyntheticImportedProjectileMotionTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-projectile-motion-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-projectile-motion-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.effectKinds).toContain("projectile");
    expect(evidence?.executedControllers.Projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "effect",
          actorKind: "projectile",
          ownerId: "p1",
          animNo: 910,
          maxVel: expect.objectContaining({ x: expect.any(Number) }),
          minScale: { x: 1.75, y: 0.5 },
          maxScale: { x: 1.75, y: 0.5 },
        }),
      ]),
    );
    const projectileFrame = evidence?.actorFrames.find(
      (frame) => frame.source === "effect" && frame.actorKind === "projectile" && frame.ownerId === "p1" && frame.animNo === 910,
    );
    expect(projectileFrame?.maxVel.x).toBeGreaterThanOrEqual(5);
    expect(artifact.gates[0]?.requirements.requiredActorFrames).toEqual([
      {
        source: "effect",
        actorKind: "projectile",
        ownerId: "p1",
        animNo: 910,
        moveType: "A",
        minFrames: 3,
        observedVelXAtLeast: 5,
        observedScaleXAtLeast: 1.75,
        observedScaleXAtMost: 1.75,
        observedScaleYAtLeast: 0.5,
        observedScaleYAtMost: 0.5,
      },
    ]);
    expect(artifact.gates[0]?.requirements.requiredEffectPayloads).toEqual([
      { kind: "projectile", ownerId: "p1", effectId: 77, minAge: 2 },
    ]);
  });

  it("creates a synthetic imported Projectile velmul artifact with velocity decay evidence", () => {
    const artifact = createSyntheticImportedProjectileVelMulTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-projectile-velmul-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-projectile-velmul-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    const projectileFrame = evidence?.actorFrames.find(
      (frame) => frame.source === "effect" && frame.actorKind === "projectile" && frame.ownerId === "p1" && frame.animNo === 910,
    );
    expect(projectileFrame?.maxVel.x).toBeGreaterThanOrEqual(8);
    expect(projectileFrame?.minVel.x).toBeLessThanOrEqual(2);
    expect(artifact.gates[0]?.requirements.requiredActorFrames).toEqual([
      {
        source: "effect",
        actorKind: "projectile",
        ownerId: "p1",
        animNo: 910,
        moveType: "A",
        minFrames: 3,
        observedVelXAtLeast: 8,
        observedVelXAtMost: 2,
      },
    ]);
  });

  it("creates a synthetic imported ModifyProjectile artifact with live projectile mutation evidence", () => {
    const artifact = createSyntheticImportedModifyProjectileTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-modifyprojectile-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-modifyprojectile-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedControllers.ModifyProjectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.modifyprojectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "effect",
          actorKind: "projectile",
          ownerId: "p1",
          animNo: 910,
          maxScale: expect.objectContaining({ x: 2 }),
          minScale: expect.objectContaining({ y: 0.5 }),
        }),
      ]),
    );
    expect(artifact.gates[0]?.requirements.requiredExecutedControllers).toEqual([
      "ChangeState",
      "HitDef",
      "Projectile",
      "ModifyProjectile",
    ]);
    expect(artifact.gates[0]?.requirements.requiredExecutedOperations).toEqual([
      "hitdef",
      "projectile",
      "modifyprojectile",
    ]);
  });

  it("creates a synthetic imported Projectile contact artifact with ProjContact branch evidence", () => {
    const artifact = createSyntheticImportedProjectileContactTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-projectile-contact-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-projectile-contact-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.effectKinds).toContain("projectile");
    expect(evidence?.executedStates).toContain(272);
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([200, 272]);
    expect(evidence?.eventCategories).toContain("hit");
    expect(evidence?.combatReasons).toContain("hit");
    expect(evidence?.targetLinks).toEqual(
      expect.arrayContaining([expect.objectContaining({ ownerId: "p1", actorId: "p2", targetId: 77 })]),
    );
  });

  it("creates a synthetic imported Projectile multi-hit artifact with projhits and projmisstime evidence", () => {
    const artifact = createSyntheticImportedProjectileMultiHitTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-projectile-multihit-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-projectile-multihit-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.effectKinds).toContain("projectile");
    expect(evidence?.executedControllers.Projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toContain("hit");
    expect(evidence?.eventLines.filter((line) => line.includes("projectile hit") && line.includes("Mira Volt"))).toHaveLength(2);
    expect(evidence?.eventLines.some((line) => line.includes("hits remaining 1") && line.includes("miss 3"))).toBe(true);
    expect(evidence?.eventLines.some((line) => line.includes("hits remaining 0") && line.includes("miss 0"))).toBe(true);
    expect(artifact.gates[0]?.requirements.requiredEventSubstrings).toEqual([
      "projectile hit",
      "hits remaining 1",
      "miss 3",
      "hits remaining 0",
    ]);
    expect(evidence?.worldLifecycleEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "spawn", kind: "projectile", ownerId: "p1", rootId: "p1", parentId: "p1" }),
        expect.objectContaining({ type: "active", kind: "projectile", ownerId: "p1", rootId: "p1", parentId: "p1" }),
        expect.objectContaining({ type: "remove", kind: "projectile", ownerId: "p1", rootId: "p1", parentId: "p1" }),
      ]),
    );
    expect(evidence?.targetLinks).toEqual(
      expect.arrayContaining([expect.objectContaining({ ownerId: "p1", actorId: "p2", targetId: 77 })]),
    );
  });

  it("creates a synthetic imported Projectile guard artifact with shared guard evidence", () => {
    const artifact = createSyntheticImportedProjectileGuardTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-projectile-guard-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-projectile-guard-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.effectKinds).toContain("projectile");
    expect(evidence?.executedControllers.Projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedStates).toContain(271);
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([200, 271]);
    expect(evidence?.eventCategories).toContain("guard");
    expect(evidence?.combatReasons).toContain("guard");
    expect(evidence?.targetLinks).toEqual(
      expect.arrayContaining([expect.objectContaining({ ownerId: "p1", actorId: "p2", targetId: 77 })]),
    );
    expect(artifact.trace.events.some((event) => event.category === "guard" && event.line.includes("projectile"))).toBe(true);
  });

  it("creates a synthetic imported Projectile clash artifact with runtime event evidence", () => {
    const artifact = createSyntheticImportedProjectileClashTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-projectile-clash-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-projectile-clash-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.effectKinds).toContain("projectile");
    expect(evidence?.executedControllers.Projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toContain("runtime");
    expect(evidence?.eventLines.some((line) => line.includes("Projectile clash"))).toBe(true);
    expect(evidence?.eventLines.some((line) => line.includes("p1-projectile-0 cancel removal anim 913"))).toBe(true);
    expect(evidence?.eventLines.some((line) => line.includes("p2-projectile-0 cancel removal anim 914"))).toBe(true);
    expect(artifact.gates[0]?.requirements.requiredEventSubstrings).toEqual([
      "Projectile clash",
      "p1-projectile-0 cancel removal anim 913",
      "p2-projectile-0 cancel removal anim 914",
    ]);
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "effect", actorKind: "projectile", ownerId: "p1", animNo: 913, moveType: "I", clsn1Count: 0 }),
        expect.objectContaining({ source: "effect", actorKind: "projectile", ownerId: "p2", animNo: 914, moveType: "I", clsn1Count: 0 }),
      ]),
    );
    expect(evidence?.worldLifecycleEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "spawn", kind: "projectile", ownerId: "p1", rootId: "p1", parentId: "p1" }),
        expect.objectContaining({ type: "spawn", kind: "projectile", ownerId: "p2", rootId: "p2", parentId: "p2" }),
        expect.objectContaining({ type: "remove", kind: "projectile", ownerId: "p1", rootId: "p1", parentId: "p1" }),
        expect.objectContaining({ type: "remove", kind: "projectile", ownerId: "p2", rootId: "p2", parentId: "p2" }),
      ]),
    );
  });

  it("creates a synthetic imported Projectile priority-cancel artifact with winner-store evidence", () => {
    const artifact = createSyntheticImportedProjectilePriorityCancelTraceArtifact({
      generatedAt: "2026-06-25T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-projectile-priority-cancel-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-projectile-priority-cancel-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.effectKinds).toContain("projectile");
    expect(evidence?.executedControllers.Projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toContain("runtime");
    expect(
      evidence?.eventLines.some(
        (line) =>
          line.includes("canceled") &&
          line.includes("3 > 1") &&
          line.includes("winner priority 3 -> 2") &&
          line.includes("p2-projectile-0 cancel removal anim 915"),
      ),
    ).toBe(true);
    expect(artifact.gates[0]?.requirements.requiredEventSubstrings).toEqual([
      "Projectile clash",
      "canceled",
      "3 > 1",
      "winner priority 3 -> 2",
      "p2-projectile-0 cancel removal anim 915",
    ]);
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "effect", actorKind: "projectile", ownerId: "p2", animNo: 915, moveType: "I", clsn1Count: 0 }),
      ]),
    );
    expect(evidence?.worldLifecycleEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "spawn", kind: "projectile", ownerId: "p1", rootId: "p1", parentId: "p1" }),
        expect.objectContaining({ type: "spawn", kind: "projectile", ownerId: "p2", rootId: "p2", parentId: "p2" }),
        expect.objectContaining({ type: "remove", kind: "projectile", ownerId: "p2", rootId: "p2", parentId: "p2" }),
        expect.objectContaining({ type: "active", kind: "projectile", ownerId: "p1", rootId: "p1", parentId: "p1" }),
      ]),
    );
    expect(evidence?.effectStores).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ownerId: "p1",
          total: expect.any(Number),
          projectiles: expect.arrayContaining([expect.stringContaining("p1-projectile")]),
        }),
        expect.objectContaining({
          ownerId: "p2",
          nextSerials: expect.objectContaining({ projectile: 1 }),
        }),
      ]),
    );
  });

  it("creates a synthetic imported Helper artifact with typed helper operation evidence", () => {
    const artifact = createSyntheticImportedHelperTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-helper-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-helper-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.effectKinds).toContain("helper");
    expect(evidence?.executedControllers.Helper).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.helper).toBeGreaterThanOrEqual(1);
    expect(artifact.gates[0]?.requirements.requiredWorldLifecycleEvents).toEqual([
      { type: "spawn", kind: "helper", ownerId: "p1", rootId: "p1", parentId: "p1" },
      { type: "active", kind: "helper", ownerId: "p1", rootId: "p1", parentId: "p1" },
    ]);
    expect(artifact.gates[0]?.requirements.requiredEffectStores).toEqual([
      { ownerId: "p1", minTotal: 1, minHelpers: 1, minNextHelperSerial: 1 },
    ]);
    expect(evidence?.worldLifecycleEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "spawn", kind: "helper", ownerId: "p1", rootId: "p1", parentId: "p1" }),
        expect.objectContaining({ type: "active", kind: "helper", ownerId: "p1", rootId: "p1", parentId: "p1" }),
      ]),
    );
    expect(evidence?.effectStores).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ownerId: "p1",
          total: 1,
          helpers: [expect.stringContaining("helper")],
          nextSerials: expect.objectContaining({ helper: 1 }),
        }),
      ]),
    );
    const helperFrame = artifact.trace.frames.find((frame) =>
      frame.world?.lifecycle.some((actor) => actor.kind === "helper" && actor.status === "spawned"),
    );
    expect(helperFrame?.world?.spawnedThisTick.some((id) => id.includes("helper"))).toBe(true);
    expect(helperFrame?.world?.eventsThisTick).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "spawn", kind: "helper", layer: "effect", ownerId: "p1" }),
      ]),
    );
    expect(helperFrame?.world?.effectStores.find((store) => store.ownerId === "p1")).toMatchObject({
      total: 1,
      helpers: [expect.stringContaining("helper")],
      nextSerials: {
        helper: 1,
      },
    });
    expect(helperFrame?.world?.lifecycle.find((actor) => actor.kind === "helper")).toMatchObject({
      ownerId: "p1",
      rootId: "p1",
      parentId: "p1",
      layer: "effect",
    });
  });

  it("creates a synthetic imported Helper velocity artifact with moving helper evidence", () => {
    const artifact = createSyntheticImportedHelperVelocityTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-helper-velocity-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-helper-velocity-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.effectKinds).toContain("helper");
    expect(evidence?.executedControllers.Helper).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.helper).toBeGreaterThanOrEqual(1);
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "effect",
          actorKind: "helper",
          ownerId: "p1",
          animNo: 920,
          maxVel: expect.objectContaining({ x: 3 }),
          minVel: expect.objectContaining({ y: -1 }),
        }),
      ]),
    );
    expect(artifact.gates[0]?.requirements.requiredActorFrames).toEqual([
      {
        source: "effect",
        actorKind: "helper",
        ownerId: "p1",
        animNo: 920,
        observedVelXAtLeast: 3,
        observedVelYAtMost: -1,
        observedPosXAtLeast: -180,
        observedPosYAtMost: -36,
        minFrames: 2,
      },
    ]);
  });

  it("creates a synthetic imported Helper scale artifact with render-scale evidence", () => {
    const artifact = createSyntheticImportedHelperScaleTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-helper-scale-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-helper-scale-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    const scaledFrame = evidence?.actorFrames.find((frame) => frame.actorKind === "helper" && frame.animNo === 920);
    expect(scaledFrame?.maxScale.x).toBeGreaterThanOrEqual(2);
    expect(scaledFrame?.minScale.y).toBeLessThanOrEqual(0.5);
    expect(artifact.gates[0]?.requirements.requiredActorFrames).toEqual([
      {
        source: "effect",
        actorKind: "helper",
        ownerId: "p1",
        animNo: 920,
        observedScaleXAtLeast: 2,
        observedScaleYAtMost: 0.5,
        minFrames: 1,
      },
    ]);
    expect(artifact.gates[0]?.requirements.requiredEffectPayloads).toEqual([
      { kind: "helper", ownerId: "p1", effectId: 42, name: "Buddy", helperStateNo: 1200, scaleX: 2, scaleY: 0.5 },
    ]);
  });

  it("creates a synthetic imported Helper supermovetime artifact with pause-budget advance evidence", () => {
    const artifact = createSyntheticImportedHelperSuperMoveTimeTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-helper-supermovetime-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-helper-supermovetime-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(gate?.requirements.requiredEffectPayloads).toEqual([
      { kind: "helper", ownerId: "p1", effectId: 42, name: "Buddy", helperStateNo: 1200, minSuperMoveTime: 1 },
    ]);
    expect(gate?.requirements.requiredMatchPauseFreezes).toEqual([
      { type: "SuperPause", actorKind: "player", ownerId: "p2", minFrozenFrames: 6 },
      { type: "SuperPause", actorKind: "explod", ownerId: "p1", minFrozenFrames: 5 },
    ]);
    expect(gate?.requirements.requiredMatchPauseAdvances).toEqual([
      { type: "SuperPause", actorKind: "helper", ownerId: "p1", minAdvancedFrames: 3, minPreviousMoveTime: 0 },
    ]);
    expect(evidence?.matchPauseAdvances).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "SuperPause",
          actorKind: "helper",
          ownerId: "p1",
          changedFields: expect.arrayContaining(["animTime"]),
        }),
      ]),
    );
  });

  it("creates a synthetic imported Helper pausemovetime artifact with pause-budget advance evidence", () => {
    const artifact = createSyntheticImportedHelperPauseMoveTimeTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-helper-pausemovetime-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-helper-pausemovetime-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(gate?.requirements.requiredEffectPayloads).toEqual([
      { kind: "helper", ownerId: "p1", effectId: 42, name: "Buddy", helperStateNo: 1200, minPauseMoveTime: 1 },
    ]);
    expect(gate?.requirements.requiredMatchPauseAdvances).toEqual([
      { type: "Pause", actorKind: "helper", ownerId: "p1", minAdvancedFrames: 3, minPreviousMoveTime: 0 },
    ]);
    expect(evidence?.matchPauseAdvances).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "Pause",
          actorKind: "helper",
          ownerId: "p1",
          changedFields: expect.arrayContaining(["animTime"]),
        }),
      ]),
    );
    expect(evidence?.matchPauseFreezes).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: "Pause", actorKind: "explod", ownerId: "p1" })]),
    );
  });

  it("creates a synthetic imported Helper ignorehitpause artifact with hitpause advance evidence", () => {
    const artifact = createSyntheticImportedHelperIgnoreHitPauseTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-helper-ignorehitpause-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-helper-ignorehitpause-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(gate?.requirements.requiredEffectPayloads).toEqual([
      { kind: "helper", ownerId: "p1", effectId: 42, name: "Buddy", helperStateNo: 1200, ignoreHitPause: true },
    ]);
    expect(gate?.requirements.requiredMatchPauseAdvances).toEqual([
      { type: "HitPause", actorKind: "helper", ownerId: "p1", minAdvancedFrames: 3, minPreviousMoveTime: 1 },
    ]);
    expect(evidence?.matchPauseAdvances).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "HitPause",
          actorKind: "helper",
          ownerId: "p1",
          changedFields: expect.arrayContaining(["animTime"]),
        }),
      ]),
    );
    expect(evidence?.matchPauseFreezes).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: "HitPause", actorKind: "explod", ownerId: "p1" })]),
    );
  });

  it("creates a synthetic imported Explod artifact with typed explod operation evidence", () => {
    const artifact = createSyntheticImportedExplodTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-explod-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-explod-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.effectKinds).toContain("explod");
    expect(evidence?.executedControllers.Explod).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.explod).toBeGreaterThanOrEqual(1);
    expect(artifact.gates[0]?.requirements.requiredWorldLifecycleEvents).toEqual([
      { type: "spawn", kind: "explod", ownerId: "p1", rootId: "p1", parentId: "p1" },
      { type: "active", kind: "explod", ownerId: "p1", rootId: "p1", parentId: "p1" },
    ]);
    expect(artifact.gates[0]?.requirements.requiredEffectStores).toEqual([
      { ownerId: "p1", minTotal: 1, minExplods: 1, minNextExplodSerial: 1 },
    ]);
    expect(evidence?.worldLifecycleEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "spawn", kind: "explod", ownerId: "p1", rootId: "p1", parentId: "p1" }),
        expect.objectContaining({ type: "active", kind: "explod", ownerId: "p1", rootId: "p1", parentId: "p1" }),
      ]),
    );
    expect(evidence?.effectStores).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ownerId: "p1",
          total: 1,
          explods: [expect.stringContaining("explod")],
          nextSerials: expect.objectContaining({ explod: 1 }),
        }),
      ]),
    );
    const explodFrame = artifact.trace.frames.find((frame) =>
      frame.world?.lifecycle.some((actor) => actor.kind === "explod" && actor.status === "spawned"),
    );
    expect(explodFrame?.world?.spawnedThisTick.some((id) => id.includes("explod"))).toBe(true);
    expect(explodFrame?.world?.eventsThisTick).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "spawn", kind: "explod", layer: "effect", ownerId: "p1" }),
      ]),
    );
    expect(explodFrame?.world?.effectStores.find((store) => store.ownerId === "p1")).toMatchObject({
      total: 1,
      explods: [expect.stringContaining("explod")],
      nextSerials: {
        explod: 1,
      },
    });
    expect(explodFrame?.world?.lifecycle.find((actor) => actor.kind === "explod")).toMatchObject({
      ownerId: "p1",
      rootId: "p1",
      parentId: "p1",
      layer: "effect",
    });
  });

  it("creates a synthetic imported moving Explod artifact with velocity evidence", () => {
    const artifact = createSyntheticImportedExplodVelocityTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-explod-velocity-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-explod-velocity-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.effectKinds).toContain("explod");
    expect(evidence?.executedControllers.Explod).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.explod).toBeGreaterThanOrEqual(1);
    const movingFrame = evidence?.actorFrames.find((frame) => frame.actorKind === "explod" && frame.animNo === 931);
    expect(movingFrame?.minPos.x).toBeLessThanOrEqual(-110);
    expect(movingFrame?.maxPos.x).toBeGreaterThanOrEqual(-60);
    expect(movingFrame?.maxVel.x).toBeGreaterThanOrEqual(7);
    expect(movingFrame?.maxVel.y).toBeGreaterThanOrEqual(0);
    expect(artifact.gates[0]?.requirements.requiredActorFrames).toEqual([
      {
        actorKind: "explod",
        ownerId: "p1",
        animNo: 931,
        minFrames: 3,
        observedPosXAtMost: -110,
        observedPosXAtLeast: -60,
        observedVelXAtLeast: 7,
        observedVelYAtLeast: 0,
      },
    ]);
  });

  it("creates a synthetic imported bound Explod artifact with owner movement evidence", () => {
    const artifact = createSyntheticImportedExplodBindTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-explod-bind-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-explod-bind-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.effectKinds).toContain("explod");
    expect(evidence?.executedControllers.Explod).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.PosAdd).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.explod).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["kinematic:posadd"]).toBeGreaterThanOrEqual(1);
    const boundFrame = evidence?.actorFrames.find((frame) => frame.actorKind === "explod" && frame.animNo === 932);
    expect(boundFrame?.minPos.x).toBeLessThanOrEqual(-120);
    expect(boundFrame?.maxPos.x).toBeGreaterThanOrEqual(-80);
    expect(artifact.gates[0]?.requirements.requiredActorFrames).toEqual([
      {
        actorKind: "explod",
        ownerId: "p1",
        animNo: 932,
        minFrames: 3,
        observedPosXAtMost: -120,
        observedPosXAtLeast: -80,
      },
    ]);
  });

  it("creates a synthetic imported scaled Explod artifact with renderer scale evidence", () => {
    const artifact = createSyntheticImportedExplodScaleTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-explod-scale-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-explod-scale-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.effectKinds).toContain("explod");
    expect(evidence?.executedControllers.Explod).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.explod).toBeGreaterThanOrEqual(1);
    const scaledFrame = evidence?.actorFrames.find((frame) => frame.actorKind === "explod" && frame.animNo === 933);
    expect(scaledFrame?.maxScale.x).toBeGreaterThanOrEqual(2);
    expect(scaledFrame?.minScale.y).toBeLessThanOrEqual(0.5);
    expect(artifact.gates[0]?.requirements.requiredActorFrames).toEqual([
      {
        actorKind: "explod",
        ownerId: "p1",
        animNo: 933,
        minFrames: 3,
        observedScaleXAtLeast: 2,
        observedScaleYAtMost: 0.5,
      },
    ]);
  });

  it("creates a synthetic imported Explod removeongethit artifact with lifecycle evidence", () => {
    const artifact = createSyntheticImportedExplodRemoveOnGetHitTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-explod-removeongethit-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-explod-removeongethit-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.effectKinds).toContain("explod");
    expect(evidence?.eventCategories).toContain("hit");
    expect(evidence?.combatReasons).toContain("hit");
    expect(evidence?.executedControllers.Explod).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.explod).toBeGreaterThanOrEqual(1);
    expect(evidence?.worldLifecycleEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "spawn", kind: "explod", ownerId: "p2" }),
        expect.objectContaining({ type: "remove", kind: "explod", ownerId: "p2" }),
      ]),
    );
    expect(evidence?.effectStores).toEqual(
      expect.arrayContaining([expect.objectContaining({ ownerId: "p2", explods: ["p2-explod-0"], nextSerials: { explod: 1, helper: 0, projectile: 0 } })]),
    );
  });

  it("creates a synthetic imported Explod projectile removeongethit artifact with lifecycle evidence", () => {
    const artifact = createSyntheticImportedExplodRemoveOnProjectileHitTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-explod-removeonprojectilehit-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-explod-removeonprojectilehit-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.effectKinds).toEqual(expect.arrayContaining(["projectile", "explod"]));
    expect(evidence?.eventCategories).toContain("hit");
    expect(evidence?.combatReasons).toContain("hit");
    expect(evidence?.executedControllers.Projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.Explod).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.explod).toBeGreaterThanOrEqual(1);
    expect(evidence?.worldLifecycleEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "spawn", kind: "projectile", ownerId: "p1" }),
        expect.objectContaining({ type: "remove", kind: "projectile", ownerId: "p1" }),
        expect.objectContaining({ type: "spawn", kind: "explod", ownerId: "p2" }),
        expect.objectContaining({ type: "remove", kind: "explod", ownerId: "p2" }),
      ]),
    );
    expect(evidence?.effectStores).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ownerId: "p1", projectiles: ["p1-projectile-0"], nextSerials: { explod: 0, helper: 0, projectile: 1 } }),
        expect.objectContaining({ ownerId: "p2", explods: ["p2-explod-0"], nextSerials: { explod: 1, helper: 0, projectile: 0 } }),
      ]),
    );
  });

  it("creates a synthetic imported Explod projectile guard removeongethit artifact with lifecycle evidence", () => {
    const artifact = createSyntheticImportedExplodRemoveOnProjectileGuardTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-explod-removeonprojectileguard-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-explod-removeonprojectileguard-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.effectKinds).toEqual(expect.arrayContaining(["projectile", "explod"]));
    expect(evidence?.eventCategories).toContain("guard");
    expect(evidence?.combatReasons).toContain("guard");
    expect(evidence?.executedControllers.Projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.Explod).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.explod).toBeGreaterThanOrEqual(1);
    expect(evidence?.worldLifecycleEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "spawn", kind: "projectile", ownerId: "p1" }),
        expect.objectContaining({ type: "remove", kind: "projectile", ownerId: "p1" }),
        expect.objectContaining({ type: "spawn", kind: "explod", ownerId: "p2" }),
        expect.objectContaining({ type: "remove", kind: "explod", ownerId: "p2" }),
      ]),
    );
    expect(evidence?.effectStores).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ownerId: "p1", projectiles: ["p1-projectile-0"], nextSerials: { explod: 0, helper: 0, projectile: 1 } }),
        expect.objectContaining({ ownerId: "p2", explods: ["p2-explod-0"], nextSerials: { explod: 1, helper: 0, projectile: 0 } }),
      ]),
    );
  });

  it("keeps golden trace scripts explicit and labeled", () => {
    expect(nativeHitScript().at(0)?.label).toBe("native-hold-punch");
    expect(nativeWhiffScript().at(0)?.label).toBe("native-whiff-punch");
    expect(importedGuardScript().map((frame) => frame.label).filter(Boolean)).toEqual(["imported-guard-x", "guard-settle"]);
    expect(importedDefaultGuardStateScript().map((frame) => frame.label).filter(Boolean)).toEqual([
      "imported-default-guard-state-x",
      "default-guard-state-settle",
    ]);
    expect(importedDefaultCrouchGuardStateScript().map((frame) => frame.label).filter(Boolean)).toEqual([
      "imported-default-crouch-guard-state-x",
      "default-crouch-guard-state-settle",
    ]);
    expect(importedDefaultDiagonalCrouchGuardStateScript().map((frame) => frame.label).filter(Boolean)).toEqual([
      "imported-default-diagonal-crouch-guard-state-x",
      "default-diagonal-crouch-guard-state-settle",
    ]);
    expect(importedInGuardDistScript().map((frame) => frame.label).filter(Boolean)).toEqual([
      "imported-inguarddist-near-x",
      "imported-inguarddist-hold",
    ]);
    expect(importedAutoGuardStartScript().map((frame) => frame.label).filter(Boolean)).toEqual([
      "imported-auto-guard-start-x",
    ]);
    expect(importedAutoGuardEndScript().map((frame) => frame.label).filter(Boolean)).toEqual([
      "imported-auto-guard-end-start",
      "imported-auto-guard-end-release",
    ]);
    expect(importedDelayedXScript().map((frame) => frame.label).filter(Boolean)).toEqual([
      "stage-time-wait",
      "stage-time-x",
      "stage-time-settle",
    ]);
    expect(importedCommonGetHitScript().map((frame) => frame.label).filter(Boolean)).toEqual([
      "imported-common-gethit-x",
      "common-gethit-settle",
    ]);
    expect(importedCustomStateScript().map((frame) => frame.label).filter(Boolean)).toEqual([
      "imported-custom-state-x",
      "custom-state-return-settle",
    ]);
    expect(importedDefaultGetHitScript().map((frame) => frame.label).filter(Boolean)).toEqual(["imported-default-gethit-x"]);
    expect(importedDefaultGetHitProgressionScript().map((frame) => frame.label).filter(Boolean)).toEqual([
      "imported-default-gethit-progress-x",
      "default-gethit-progress-settle",
    ]);
    expect(importedDefaultFallGetHitScript().map((frame) => frame.label).filter(Boolean)).toEqual([
      "imported-default-fall-gethit-x",
      "default-fall-gethit-settle",
    ]);
    expect(importedDefaultFallRecoveryScript().map((frame) => frame.label).filter(Boolean)).toEqual([
      "imported-default-fall-recovery-x",
      "default-fall-recovery-chain",
    ]);
    expect(importedDefaultFallRecoveryInputScript().map((frame) => frame.label).filter(Boolean)).toEqual([
      "imported-default-fall-recovery-input-x",
      "default-fall-recovery-input-window",
      "default-fall-recovery-input",
      "default-fall-recovery-input-settle",
    ]);
    expect(importedDefaultFallOfficialRecoveryInputScript().map((frame) => frame.label).filter(Boolean)).toEqual([
      "imported-default-fall-official-recovery-input-x",
      "default-fall-official-recovery-input-window",
      "default-fall-official-recovery-input",
      "default-fall-official-recovery-input-settle",
    ]);
    expect(importedDefaultFallOfficialRecoveryTooEarlyScript().map((frame) => frame.label).filter(Boolean)).toEqual([
      "imported-default-fall-official-recovery-too-early-x",
      "default-fall-official-recovery-too-early-window",
      "default-fall-official-recovery-too-early-input",
      "default-fall-official-recovery-too-early-settle",
    ]);
    expect(importedDefaultFallOfficialGroundRecoveryScript().map((frame) => frame.label).filter(Boolean)).toEqual([
      "imported-default-fall-official-ground-recovery-x",
      "default-fall-official-ground-recovery-window",
      "default-fall-official-ground-recovery-input",
      "default-fall-official-ground-recovery-settle",
    ]);
    expect(importedDefaultFallOfficialRecoveryScript().map((frame) => frame.label).filter(Boolean)).toEqual([
      "imported-default-fall-official-recovery-x",
      "default-fall-official-recovery-chain",
    ]);
    expect(importedXHitstunScript().map((frame) => frame.label).filter(Boolean)).toEqual(["imported-hitstun-x"]);
    expect(importedXStateExitScript().map((frame) => frame.label).filter(Boolean)).toEqual([
      "imported-state-exit-x",
      "state-exit-settle",
    ]);
    expect(importedHitDefPriorityScript().map((frame) => frame.label).filter(Boolean)).toEqual([
      "imported-hitdef-priority-x",
      "hitdef-priority-settle",
    ]);
    expect(importedHitDefKillScript().map((frame) => frame.label).filter(Boolean)).toEqual(["imported-hitdef-kill-x"]);
    expect(importedHitDefGuardKillScript().map((frame) => frame.label).filter(Boolean)).toEqual([
      "imported-hitdef-guard-kill-x",
      "hitdef-guard-kill-settle",
    ]);
    expect(importedTargetScript().map((frame) => frame.label).filter(Boolean)).toEqual(["imported-target-x", "target-settle"]);
    expect(importedTargetBindPauseScript().map((frame) => frame.label).filter(Boolean)).toEqual([
      "imported-targetbind-pause-x",
      "targetbind-pause-settle",
    ]);
    expect(importedSuperPauseScript().map((frame) => frame.label).filter(Boolean)).toEqual(["imported-superpause-x", "superpause-settle"]);
    expect(importedSuperPauseProjectileScript().map((frame) => frame.label).filter(Boolean)).toEqual([
      "imported-superpause-projectile-x",
      "superpause-projectile-settle",
    ]);
    expect(importedSuperPauseEffectScript().map((frame) => frame.label).filter(Boolean)).toEqual([
      "imported-superpause-effect-x",
      "superpause-effect-settle",
    ]);
    expect(importedProjectileScript().map((frame) => frame.label).filter(Boolean)).toEqual(["imported-projectile-x", "projectile-settle"]);
    expect(importedProjectileMotionScript().map((frame) => frame.label).filter(Boolean)).toEqual([
      "imported-projectile-motion-x",
      "projectile-motion-settle",
    ]);
    expect(importedProjectileVelMulScript().map((frame) => frame.label).filter(Boolean)).toEqual([
      "imported-projectile-velmul-x",
      "projectile-velmul-settle",
    ]);
    expect(importedProjectileGuardScript().map((frame) => frame.label).filter(Boolean)).toEqual([
      "imported-projectile-guard-x",
      "projectile-guard-settle",
    ]);
    expect(importedProjectileMultiHitScript().map((frame) => frame.label).filter(Boolean)).toEqual([
      "imported-projectile-multihit-x",
      "projectile-multihit-settle",
    ]);
    expect(importedProjectileClashScript().map((frame) => frame.label).filter(Boolean)).toEqual([
      "imported-projectile-clash-x",
      "projectile-clash-settle",
    ]);
    expect(importedProjectilePriorityCancelScript().map((frame) => frame.label).filter(Boolean)).toEqual([
      "imported-projectile-priority-cancel-x",
      "projectile-priority-cancel-settle",
    ]);
    expect(importedHelperScript().map((frame) => frame.label).filter(Boolean)).toEqual(["imported-helper-x", "helper-settle"]);
    expect(importedExplodScript().map((frame) => frame.label).filter(Boolean)).toEqual(["imported-explod-x", "explod-settle"]);
    expect(importedRemoveOnGetHitExplodScript().map((frame) => frame.label).filter(Boolean)).toEqual([
      "seed-removeongethit-explod",
      "hit-removeongethit-owner",
      "removeongethit-settle",
    ]);
    expect(importedProjectileRemoveOnGetHitExplodScript().map((frame) => frame.label).filter(Boolean)).toEqual([
      "seed-projectile-removeongethit-explod",
      "projectile-hit-removeongethit-owner",
      "projectile-removeongethit-settle",
    ]);
    expect(importedProjectileGuardRemoveOnGetHitExplodScript().map((frame) => frame.label).filter(Boolean)).toEqual([
      "seed-projectile-guard-removeongethit-explod",
      "projectile-guard-removeongethit-owner",
      "projectile-guard-removeongethit-settle",
    ]);
    expect(qcfXScript().map((frame) => frame.label).filter(Boolean)).toEqual(["qcf-d", "qcf-df", "qcf-f", "qcf-x", "settle"]);
  });
});

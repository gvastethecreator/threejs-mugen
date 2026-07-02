import { describe, expect, it } from "vitest";
import {
  createNativeHitTraceArtifact,
  createNativeWhiffTraceArtifact,
  createSyntheticImportedCommonGetHitTraceArtifact,
  createSyntheticImportedCustomStateTraceArtifact,
  createSyntheticImportedTargetOwnedCustomStateTraceArtifact,
  createSyntheticImportedDefaultFallAirRecoveryVelocityTraceArtifact,
  createSyntheticImportedDefaultFallGroundRecoveryTraceArtifact,
  createSyntheticImportedDefaultFallRecoveryInputTraceArtifact,
  createSyntheticImportedDefaultFallRecoveryThresholdTraceArtifact,
  createSyntheticImportedDefaultFallRecoveryTickOrderTraceArtifact,
  createSyntheticImportedDefaultFallRecoveryTooEarlyTraceArtifact,
  createSyntheticImportedDefaultFallRecoveryTraceArtifact,
  createSyntheticImportedDefaultFallOfficialAirRecoveryTraceArtifact,
  createSyntheticImportedDefaultFallOfficialGroundRecoveryTraceArtifact,
  createSyntheticImportedFallTraceArtifact,
  createSyntheticImportedFallDefenceUpTraceArtifact,
  createSyntheticImportedGetHitVarAnimTypeTraceArtifact,
  createSyntheticImportedGetHitVarDownRecoverTraceArtifact,
  createSyntheticImportedGetHitVarFallDefenceUpTraceArtifact,
  createSyntheticImportedGetHitVarFallEnvShakeTraceArtifact,
  createSyntheticImportedGetHitVarFallMetadataTraceArtifact,
  createSyntheticImportedGetHitVarFallRecoverTraceArtifact,
  createSyntheticImportedGetHitVarAirGuardHitShakeTimeTraceArtifact,
  createSyntheticImportedGetHitVarCrouchGuardHitShakeTimeTraceArtifact,
  createSyntheticImportedGetHitVarGuardHitShakeTimeTraceArtifact,
  createSyntheticImportedGetHitVarGuardTimingTraceArtifact,
  createSyntheticImportedGetHitVarGuardedTraceArtifact,
  createSyntheticImportedGetHitVarHitShakeTimeTraceArtifact,
  createSyntheticImportedGetHitVarHitTimeTraceArtifact,
  createImportedDefaultFallGroundRecoveryTraceArtifact,
  createImportedDefaultFallRecoveryInputTraceArtifact,
  createImportedDefaultFallRecoveryThresholdTraceArtifact,
  createImportedDefaultFallRecoveryTooEarlyTraceArtifact,
  createImportedDefaultFallRecoveryTraceArtifact,
  createSyntheticImportedDefaultAirFallRecoveryInputTraceArtifact,
  createSyntheticImportedDefaultAirFallRecoveryTooEarlyTraceArtifact,
  createSyntheticImportedDefaultAirGroundImpactTraceArtifact,
  createSyntheticImportedDefaultAirLieDownRecoveryTraceArtifact,
  createSyntheticImportedDefaultAirFallGetHitTraceArtifact,
  createSyntheticImportedDefaultAirGetHitTraceArtifact,
  createSyntheticImportedDefaultCrouchGetHitTraceArtifact,
  createSyntheticImportedDefaultCrouchGetHitProgressionTraceArtifact,
  createImportedDefaultGetHitTraceArtifact,
  createImportedDefaultFallGetHitTraceArtifact,
  createImportedDefaultGetHitProgressionTraceArtifact,
  defaultCrouchGetHitProgressionPhysicsFrames,
  defaultAirFallRecoveryInputActorFrameSequence,
  defaultAirFallRecoveryInputControllerSequence,
  defaultAirFallRecoveryTooEarlyActorFrameSequence,
  defaultAirFallRecoveryTooEarlyControllerSequence,
  defaultFallBounceLieDownControllerSequence,
  defaultFallGetHitActorFrameSequence,
  defaultFallGetHitControllerSequence,
  defaultFallGroundImpactControllerSequence,
  defaultFallLieDownGetUpActorFrameSequence,
  defaultFallLieDownGetUpControllerSequence,
  defaultGetHitProgressionActorFrameSequence,
  defaultGetHitProgressionControllerSequence,
  defaultGetHitProgressionPhysicsFrames,
  createImportedDefaultGuardStateTraceArtifact,
  createImportedGuardTraceArtifact,
  createSyntheticImportedHitstunTraceArtifact,
  officialKfmAirGuardHitControllerSequence,
  officialKfmAirGuardHitPhysicsFrames,
  officialKfmAirRecoveryActorFrameSequence,
  officialKfmAirRecoveryControllerSequence,
  officialKfmAutoGuardEndControllerSequence,
  officialKfmAutoGuardStartControllerSequence,
  officialKfmDefaultCrouchGetHitProgressionPhysicsFrames,
  officialKfmDefaultGetHitProgressionPhysicsFrames,
  officialKfmFallGetHitControllerSequence,
  officialKfmCrouchGuardHitControllerSequence,
  officialKfmFallLieDownGetUpControllerSequence,
  officialKfmQcfXActorFrameSequence,
  officialKfmQcfXControllerSequence,
  defaultAirRecoveryLandControllerSequence,
  officialKfmGroundRecoveryActorFrameSequence,
  officialKfmGroundRecoveryControllerSequence,
  officialKfmCrouchGuardHitPhysicsFrames,
  officialKfmStandGuardHitControllerSequence,
  officialKfmStandGuardHitPhysicsFrames,
  syntheticAirGuardHitPhysicsFrames,
  syntheticAutoGuardEndControllerSequence,
  syntheticAutoGuardEndActorFrameSequence,
  syntheticAutoGuardStartControllerSequence,
  syntheticAutoGuardStartActorFrameSequence,
  syntheticCrouchGuardHitPhysicsFrames,
  syntheticStandGuardHitPhysicsFrames,
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
  createSyntheticImportedHitDefCommonSparkTraceArtifact,
  createSyntheticImportedHitDefCommonGuardSparkTraceArtifact,
  createSyntheticImportedHitDefDataGuardSparkTraceArtifact,
  createSyntheticImportedHitDefDataSparkTraceArtifact,
  createSyntheticImportedHitDefFightFxGuardSparkTraceArtifact,
  createSyntheticImportedHitDefFightFxSparkTraceArtifact,
  createSyntheticImportedHitDefHitEffectPackageTraceArtifact,
  createSyntheticImportedHitDefGuardEffectPackageTraceArtifact,
  createSyntheticImportedHitDefHitSoundTraceArtifact,
  createSyntheticImportedHitDefHitSparkTraceArtifact,
  createSyntheticImportedHitDefGuardSparkTraceArtifact,
  createSyntheticImportedHitDefGuardSoundTraceArtifact,
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
  createSyntheticImportedHitPauseTimeIgnoreHitPauseTraceArtifact,
  createSyntheticImportedHelperTraceArtifact,
  createSyntheticImportedHelperIsHelperTraceArtifact,
  createSyntheticImportedHelperEnemyNearTraceArtifact,
  createSyntheticImportedHelperExplodTraceArtifact,
  createSyntheticImportedHelperProjectileTraceArtifact,
  createSyntheticImportedHelperRemoveExplodTraceArtifact,
  createSyntheticImportedHelperModifyExplodTraceArtifact,
  createSyntheticImportedHelperModifyProjectileTraceArtifact,
  createSyntheticImportedHelperProjHitTraceArtifact,
  createSyntheticImportedHelperProjHitTimeAnyTraceArtifact,
  createSyntheticImportedHelperProjectileTargetTraceArtifact,
  createSyntheticImportedHelperProjectileBareTargetTraceArtifact,
  createSyntheticImportedHelperProjectileTargetControllersTraceArtifact,
  createSyntheticImportedHelperProjectileTargetStateTraceArtifact,
  createSyntheticImportedHelperProjectileDefaultTargetStateTraceArtifact,
  createSyntheticImportedHelperProjectileDefaultTargetControllersTraceArtifact,
  createSyntheticImportedHelperProjectileDefaultTargetTraceArtifact,
  createSyntheticImportedHelperProjGuardTraceArtifact,
  createSyntheticImportedHelperProjGuardedTimeAnyTraceArtifact,
  createSyntheticImportedHelperProjectileGetHitVarGuardedTraceArtifact,
  createSyntheticImportedHelperProjectileGetHitVarGuardHitShakeTimeTraceArtifact,
  createSyntheticImportedHelperProjectileGetHitVarAirGuardHitShakeTimeTraceArtifact,
  createSyntheticImportedHelperProjContactTraceArtifact,
  createSyntheticImportedHelperProjContactTimeAnyTraceArtifact,
  createSyntheticImportedHelperProjCancelTimeAnyTraceArtifact,
  createSyntheticImportedHelperProjCancelTimeIdTraceArtifact,
  createSyntheticImportedHelperProjCancelTimeDynamicTraceArtifact,
  createSyntheticImportedHelperHitDefTraceArtifact,
  createSyntheticImportedHelperTargetTraceArtifact,
  createSyntheticImportedHelperDefaultTargetTraceArtifact,
  createSyntheticImportedHelperBareTargetTraceArtifact,
  createSyntheticImportedHelperTargetControllersTraceArtifact,
  createSyntheticImportedHelperTargetStateTraceArtifact,
  createSyntheticImportedHelperNumExplodTraceArtifact,
  createSyntheticImportedHelperNumHelperTraceArtifact,
  createSyntheticImportedHelperNumProjTraceArtifact,
  createSyntheticImportedHelperBindToParentTraceArtifact,
  createSyntheticImportedHelperBindToRootTraceArtifact,
  createSyntheticImportedHelperScaleTraceArtifact,
  createSyntheticImportedHelperIgnoreHitPauseTraceArtifact,
  createSyntheticImportedHelperPauseMoveTimeTraceArtifact,
  createSyntheticImportedHelperSuperMoveTimeTraceArtifact,
  createSyntheticImportedHelperVelocityTraceArtifact,
  createSyntheticImportedExplodTraceArtifact,
  createSyntheticImportedHitOverrideTraceArtifact,
  createSyntheticImportedHitByAllowTraceArtifact,
  createSyntheticImportedHitByRejectTraceArtifact,
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
  createSyntheticImportedProjectileDefaultTargetControllersTraceArtifact,
  createSyntheticImportedProjectileDefaultTargetStateTraceArtifact,
  createSyntheticImportedProjectileMotionTraceArtifact,
  createSyntheticImportedModifyExplodTraceArtifact,
  createSyntheticImportedModifyProjectileTraceArtifact,
  createSyntheticImportedProjectileReceivedDamageTraceArtifact,
  createSyntheticImportedProjectileHitTimeAnyTraceArtifact,
  createSyntheticImportedProjectileContactTimeTraceArtifact,
  createSyntheticImportedProjectileContactTimeAnyTraceArtifact,
  createSyntheticImportedProjectileGuardedTimeTraceArtifact,
  createSyntheticImportedProjectileGuardedTimeAnyTraceArtifact,
  createSyntheticImportedProjectileTimeTraceArtifact,
  createSyntheticImportedProjectileVelMulTraceArtifact,
  createSyntheticImportedResourceTraceArtifact,
  createSyntheticImportedControlTraceArtifact,
  createSyntheticImportedAnimationTraceArtifact,
  createSyntheticImportedChangeAnim2ElemTraceArtifact,
  createSyntheticImportedAnimElemOffsetTraceArtifact,
  createSyntheticImportedAnimElemTraceArtifact,
  createSyntheticImportedAnimElemTimeTraceArtifact,
  createSyntheticImportedAnimTimeTraceArtifact,
  createSyntheticImportedEdgeDistanceTraceArtifact,
  createSyntheticImportedResourceMaxTraceArtifact,
  createSyntheticImportedNoOpTraceArtifact,
  createSyntheticImportedSoundTraceArtifact,
  createSyntheticImportedProjectileMultiHitTraceArtifact,
  createSyntheticImportedProjectilePriorityCancelTraceArtifact,
  createSyntheticImportedProjectileCancelTimeTraceArtifact,
  createSyntheticImportedProjectileCancelTimeDynamicTraceArtifact,
  createSyntheticImportedProjectileCancelTimeAnyTraceArtifact,
  createSyntheticImportedProjectileCancelTimeVarTraceArtifact,
  createSyntheticImportedProjectileGetHitVarAirGuardHitShakeTimeTraceArtifact,
  createSyntheticImportedProjectileGetHitVarGuardHitShakeTimeTraceArtifact,
  createSyntheticImportedProjectileGetHitVarGuardedTraceArtifact,
  createSyntheticImportedProjectileGuardTraceArtifact,
  createSyntheticImportedHitDefProjectileTargetMixTraceArtifact,
  createSyntheticImportedProjectileTraceArtifact,
  createSyntheticImportedProjectileTargetControllersTraceArtifact,
  createSyntheticImportedProjectileTargetRedirectTraceArtifact,
  createSyntheticImportedProjectileTargetStateTraceArtifact,
  createSyntheticImportedSuperPauseEffectFreezeTraceArtifact,
  createSyntheticImportedSuperPauseProjectileFreezeTraceArtifact,
  createSyntheticImportedSuperPauseTraceArtifact,
  createSyntheticImportedTargetBindPauseTraceArtifact,
  createSyntheticImportedBindToTargetHeadTraceArtifact,
  createSyntheticImportedBindToTargetMidTraceArtifact,
  createSyntheticImportedTargetStateCustomTraceArtifact,
  createSyntheticImportedTargetNoKoTraceArtifact,
  createSyntheticImportedTargetDynamicRedirectTraceArtifact,
  createSyntheticImportedTargetRedirectTraceArtifact,
  createSyntheticImportedBareTargetRedirectTraceArtifact,
  createSyntheticImportedDefaultTargetRedirectTraceArtifact,
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
  createSyntheticImportedEnemyNearIndexTraceArtifact,
  createSyntheticImportedNumHelperTraceArtifact,
  createSyntheticImportedNumProjTraceArtifact,
  createSyntheticImportedNumTargetTraceArtifact,
  createSyntheticImportedDefaultNumTargetTraceArtifact,
  createSyntheticImportedP2MetricsTraceArtifact,
  createSyntheticImportedTeamSideTraceArtifact,
  createSyntheticImportedP2StateContextTraceArtifact,
  createSyntheticImportedP2DistanceTraceArtifact,
  createSyntheticImportedOwnerMetricsTraceArtifact,
  createSyntheticImportedIdentityTraceArtifact,
  createSyntheticImportedPrevAnimTraceArtifact,
  createSyntheticImportedPrevMoveTypeTraceArtifact,
  createSyntheticImportedPrevStateTypeTraceArtifact,
  createSyntheticImportedPrevStateTraceArtifact,
  createSyntheticImportedRemoveExplodTraceArtifact,
  createSyntheticImportedSelfAnimExistTraceArtifact,
  createSyntheticImportedSelfCommandTraceArtifact,
  createSyntheticImportedSelfStateNoExistTraceArtifact,
  createSyntheticImportedGameTimeTraceArtifact,
  createSyntheticImportedStageTimeTraceArtifact,
  createSyntheticImportedStateContextTraceArtifact,
  createSyntheticImportedXTraceArtifact,
  createSyntheticImportedTraceFighter,
  importedDelayedXScript,
  importedGuardScript,
  importedCommonGetHitScript,
  importedCustomStateScript,
  importedDefaultAirFallGetHitScript,
  importedDefaultAirGetHitScript,
  importedDefaultCrouchGetHitScript,
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
  qcfXContactScript,
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

  it("creates a synthetic imported no-op artifact for Null, ForceFeedback, debug clipboard, MakeDust, and DestroySelf controllers", () => {
    const artifact = createSyntheticImportedNoOpTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-noop-golden",
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
    expect(artifact.gates[0]?.requirements.requiredExecutedControllers).toEqual([
      "ChangeState",
      "Null",
      "ForceFeedback",
      "DisplayToClipboard",
      "AppendToClipboard",
      "ClearClipboard",
      "MakeDust",
      "DestroySelf",
      "HitDef",
    ]);
    expect(artifact.gates[0]?.requirements.requiredExecutedOperations).toEqual([
      "noop:null",
      "noop:forcefeedback",
      "noop:displaytoclipboard",
      "noop:appendtoclipboard",
      "noop:clearclipboard",
      "noop:makedust",
      "noop:destroyself",
      "hitdef",
    ]);
    expect(evidence?.executedControllers.Null).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.ForceFeedback).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.DisplayToClipboard).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.AppendToClipboard).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.ClearClipboard).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.MakeDust).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.DestroySelf).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.HitDef).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["noop:null"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["noop:forcefeedback"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["noop:displaytoclipboard"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["noop:appendtoclipboard"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["noop:clearclipboard"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["noop:makedust"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["noop:destroyself"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
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
    expect(artifact.gates[0]?.requirements.requiredExecutedControllers).toEqual([
      "ChangeState",
      "HitDef",
      "VarSet",
      "VarAdd",
      "VarRandom",
      "VarRangeSet",
    ]);
    expect(artifact.gates[0]?.requirements.requiredExecutedOperations).toEqual([
      "hitdef",
      "variable:varset",
      "variable:varadd",
      "variable:varrandom",
      "variable:varrangeset",
    ]);
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 288]));
    expect(evidence?.executedControllers.VarSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.VarAdd).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.VarRandom).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.VarRangeSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["variable:varset"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["variable:varadd"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["variable:varrandom"]).toBeGreaterThanOrEqual(1);
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
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1",
          source: "imported",
          stateNo: 289,
          animNo: 289,
          minLife: 750,
          maxLife: 750,
          minPower: 900,
          maxPower: 900,
        }),
      ]),
    );
    expect(artifact.gates[0]?.requirements.requiredActorFrames).toEqual([
      {
        actorId: "p1",
        source: "imported",
        actorKind: "player",
        stateNo: 289,
        animNo: 289,
        observedLifeAtLeast: 750,
        observedLifeAtMost: 750,
        observedPowerAtLeast: 900,
        observedPowerAtMost: 900,
        minFrames: 1,
      },
    ]);
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

  it("creates a synthetic imported ChangeAnim2 elem/elemtime artifact with active-state frame seeding evidence", () => {
    const artifact = createSyntheticImportedChangeAnim2ElemTraceArtifact({ generatedAt: "2026-07-01T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-changeanim2-elem-golden",
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
    expect(evidence?.executedControllers.ChangeAnim2).toBeGreaterThanOrEqual(1);
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ actorId: "p1", source: "imported", actorKind: "player", stateNo: 200, animNo: 207 }),
      ]),
    );
    expect(artifact.trace.finalActors.find((actor) => actor.id === "p1")).toMatchObject({
      id: "p1",
      source: "imported",
      stateNo: 200,
      animNo: 207,
      frameIndex: 2,
      animTime: 20,
    });
    expect(artifact.gates[0]?.requirements.requiredExecutedControllers).toEqual(expect.arrayContaining(["ChangeAnim2"]));
    expect(artifact.gates[0]?.requirements.requiredExecutedOperations).toEqual([]);
    expect(artifact.gates[0]?.requirements.requiredActorFrames).toEqual([
      { actorId: "p1", source: "imported", actorKind: "player", stateNo: 200, animNo: 207, minFrames: 1 },
    ]);
  });

  it("creates a synthetic imported AnimTime artifact with animation-end route evidence", () => {
    const artifact = createSyntheticImportedAnimTimeTraceArtifact({ generatedAt: "2026-07-01T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-animtime-golden",
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
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 291]));
    expect(evidence?.executedControllers.ChangeState).toBeGreaterThanOrEqual(2);
    expect(evidence?.executedOperations.hitdef).toBeUndefined();
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([200, 291]);
    expect(artifact.gates[0]?.requirements.requiredExecutedControllers).toEqual(["ChangeState"]);
    expect(artifact.gates[0]?.requirements.requiredExecutedOperations).toEqual([]);
    expect(artifact.gates[0]?.requirements.requiredActorFrames).toEqual([
      { actorId: "p1", source: "imported", actorKind: "player", stateNo: 200, animNo: 200, minFrames: 3 },
      { actorId: "p1", source: "imported", actorKind: "player", stateNo: 291, animNo: 291, minFrames: 1 },
    ]);
    expect(artifact.trace.finalActors.find((actor) => actor.id === "p1")).toMatchObject({
      source: "imported",
      stateNo: 291,
      animNo: 291,
    });
  });

  it("creates a synthetic imported AnimElemTime artifact with animation-element timing route evidence", () => {
    const artifact = createSyntheticImportedAnimElemTimeTraceArtifact({ generatedAt: "2026-07-01T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-animelemtime-golden",
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
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 292]));
    expect(evidence?.executedControllers.ChangeState).toBeGreaterThanOrEqual(2);
    expect(evidence?.executedOperations.hitdef).toBeUndefined();
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([200, 292]);
    expect(artifact.gates[0]?.requirements.requiredExecutedControllers).toEqual(["ChangeState"]);
    expect(artifact.gates[0]?.requirements.requiredExecutedOperations).toEqual([]);
    expect(artifact.gates[0]?.requirements.requiredActorFrames).toEqual([
      { actorId: "p1", source: "imported", actorKind: "player", stateNo: 200, animNo: 200, minFrames: 3 },
      { actorId: "p1", source: "imported", actorKind: "player", stateNo: 292, animNo: 292, minFrames: 1 },
    ]);
    expect(artifact.trace.finalActors.find((actor) => actor.id === "p1")).toMatchObject({
      source: "imported",
      stateNo: 292,
      animNo: 292,
    });
  });

  it("creates a synthetic imported AnimElem artifact with current element route evidence", () => {
    const artifact = createSyntheticImportedAnimElemTraceArtifact({ generatedAt: "2026-07-01T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-animelem-golden",
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
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 299]));
    expect(evidence?.executedControllers.ChangeState).toBeGreaterThanOrEqual(2);
    expect(evidence?.executedOperations.hitdef).toBeUndefined();
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([200, 299]);
    expect(artifact.gates[0]?.requirements.requiredExecutedControllers).toEqual(["ChangeState"]);
    expect(artifact.gates[0]?.requirements.requiredExecutedOperations).toEqual([]);
    expect(artifact.gates[0]?.requirements.requiredActorFrames).toEqual([
      { actorId: "p1", source: "imported", actorKind: "player", stateNo: 200, animNo: 200, minFrames: 1 },
      { actorId: "p1", source: "imported", actorKind: "player", stateNo: 299, animNo: 299, minFrames: 1 },
    ]);
    expect(artifact.trace.finalActors.find((actor) => actor.id === "p1")).toMatchObject({
      source: "imported",
      stateNo: 299,
      animNo: 299,
    });
  });

  it("creates a synthetic imported AnimElem offset artifact with elapsed element route evidence", () => {
    const artifact = createSyntheticImportedAnimElemOffsetTraceArtifact({ generatedAt: "2026-07-01T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-animelem-offset-golden",
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
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 300]));
    expect(evidence?.executedControllers.ChangeState).toBeGreaterThanOrEqual(2);
    expect(evidence?.executedOperations.hitdef).toBeUndefined();
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([200, 300]);
    expect(artifact.gates[0]?.requirements.requiredExecutedControllers).toEqual(["ChangeState"]);
    expect(artifact.gates[0]?.requirements.requiredExecutedOperations).toEqual([]);
    expect(artifact.gates[0]?.requirements.requiredActorFrames).toEqual([
      { actorId: "p1", source: "imported", actorKind: "player", stateNo: 200, animNo: 200, minFrames: 5 },
      { actorId: "p1", source: "imported", actorKind: "player", stateNo: 300, animNo: 300, minFrames: 1 },
    ]);
    expect(artifact.trace.finalActors.find((actor) => actor.id === "p1")).toMatchObject({
      source: "imported",
      stateNo: 300,
      animNo: 300,
    });
  });

  it("creates a synthetic imported edge-distance artifact with stage-bound trigger evidence", () => {
    const artifact = createSyntheticImportedEdgeDistanceTraceArtifact({ generatedAt: "2026-07-01T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-edge-distance-golden",
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
    expect(evidence?.routedStates).toContain(293);
    expect(evidence?.executedStates).toContain(293);
    expect(evidence?.executedOperations.hitdef).toBeUndefined();
    expect(artifact.gates[0]?.requirements.requiredRoutedStates).toEqual([293]);
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([293]);
    expect(artifact.gates[0]?.requirements.requiredExecutedControllers).toEqual(["ChangeState"]);
    expect(artifact.gates[0]?.requirements.requiredExecutedOperations).toEqual([]);
    expect(artifact.gates[0]?.requirements.requiredActorFrames).toEqual([
      { actorId: "p1", source: "imported", actorKind: "player", stateNo: 293, animNo: 293, minFrames: 1 },
    ]);
    expect(artifact.trace.finalActors.find((actor) => actor.id === "p1")).toMatchObject({
      source: "imported",
      stateNo: 293,
      animNo: 293,
    });
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
    expect(evidence?.executedOperations["audio:playsnd"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["audio:stopsnd"]).toBeGreaterThanOrEqual(1);
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

  it("creates a synthetic imported EnemyNear indexed artifact with fail-closed evidence", () => {
    const artifact = createSyntheticImportedEnemyNearIndexTraceArtifact({ generatedAt: "2026-07-01T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-enemynear-index-golden",
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
    expect(evidence?.routedStates).toContain(284);
    expect(evidence?.routedStates).not.toContain(285);
    expect(evidence?.executedStates).toContain(284);
    expect(evidence?.executedStates).not.toContain(285);
    expect(artifact.gates[0]?.requirements.requiredRoutedStates).toEqual([284]);
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([284]);
    expect(artifact.gates[0]?.requirements.forbiddenExecutedStates).toEqual([285]);
    expect(artifact.trace.finalActors.some((actor) => actor.id === "p1" && actor.stateNo === 284)).toBe(true);
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

  it("creates a synthetic imported TeamSide artifact with owner and EnemyNear side evidence", () => {
    const artifact = createSyntheticImportedTeamSideTraceArtifact({ generatedAt: "2026-07-01T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-teamside-golden",
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
    expect(evidence?.routedStates).toContain(299);
    expect(evidence?.executedStates).toContain(299);
    expect(artifact.gates[0]?.requirements.requiredRoutedStates).toEqual([299]);
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([299]);
    expect(artifact.gates[0]?.requirements.requiredFinalActors).toEqual([
      expect.objectContaining({ actorId: "p1", stateNo: 299, animNo: 299 }),
    ]);
    expect(artifact.trace.finalActors.some((actor) => actor.id === "p1" && actor.stateNo === 299 && actor.animNo === 299)).toBe(true);
  });

  it("creates a synthetic imported P2 state-context artifact with opponent metadata evidence", () => {
    const artifact = createSyntheticImportedP2StateContextTraceArtifact({ generatedAt: "2026-07-01T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-p2-state-context-golden",
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
    expect(evidence?.routedStates).toContain(296);
    expect(evidence?.executedStates).toContain(296);
    expect(artifact.gates[0]?.requirements.requiredRoutedStates).toEqual([296]);
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([296]);
    expect(artifact.trace.finalActors.some((actor) => actor.id === "p1" && actor.stateNo === 296)).toBe(true);
    expect(artifact.trace.finalActors.some((actor) => actor.id === "p2" && actor.stateType === "S" && actor.moveType === "I")).toBe(
      true,
    );
  });

  it("creates a synthetic imported P2 distance artifact with spacing evidence", () => {
    const artifact = createSyntheticImportedP2DistanceTraceArtifact({ generatedAt: "2026-07-01T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-p2-distance-golden",
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
    expect(evidence?.routedStates).toContain(297);
    expect(evidence?.executedStates).toContain(297);
    expect(artifact.gates[0]?.requirements.requiredRoutedStates).toEqual([297]);
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([297]);
    expect(artifact.trace.finalActors.some((actor) => actor.id === "p1" && actor.stateNo === 297)).toBe(true);
  });

  it("creates a synthetic imported owner metrics artifact with state and position evidence", () => {
    const artifact = createSyntheticImportedOwnerMetricsTraceArtifact({ generatedAt: "2026-07-01T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-owner-metrics-golden",
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
    expect(evidence?.routedStates).toContain(298);
    expect(evidence?.executedStates).toContain(298);
    expect(artifact.gates[0]?.requirements.requiredRoutedStates).toEqual([298]);
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([298]);
    expect(artifact.trace.finalActors.some((actor) => actor.id === "p1" && actor.stateNo === 298)).toBe(true);
  });

  it("creates a synthetic imported identity artifact with name trigger evidence", () => {
    const artifact = createSyntheticImportedIdentityTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-identity-golden",
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
    expect(evidence?.routedStates).toContain(276);
    expect(evidence?.executedStates).toContain(276);
    expect(artifact.gates[0]?.requirements.requiredRoutedStates).toEqual([276]);
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([276]);
    expect(artifact.trace.finalActors.some((actor) => actor.id === "p1" && actor.stateNo === 276)).toBe(true);
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

  it("creates a synthetic imported SelfAnimExist artifact with action-existence branch evidence", () => {
    const artifact = createSyntheticImportedSelfAnimExistTraceArtifact({ generatedAt: "2026-07-01T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-selfanimexist-golden",
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
    expect(evidence?.routedStates).toContain(290);
    expect(evidence?.executedStates).toContain(290);
    expect(evidence?.executedStates).not.toContain(9999);
    expect(artifact.gates[0]?.requirements.requiredRoutedStates).toEqual([290]);
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([290]);
    expect(artifact.trace.finalActors.some((actor) => actor.id === "p1" && actor.stateNo === 290)).toBe(true);
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

  it("creates a synthetic imported GameTime artifact with global tick branch evidence", () => {
    const artifact = createSyntheticImportedGameTimeTraceArtifact({ generatedAt: "2026-07-01T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-gametime-golden",
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
    expect(evidence?.routedStates).toContain(294);
    expect(evidence?.executedStates).toContain(294);
    expect(artifact.gates[0]?.requirements.requiredRoutedStates).toEqual([294]);
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([294]);
    expect(artifact.trace.frames.some((frame) => frame.tick >= 4)).toBe(true);
    expect(artifact.trace.finalActors.some((actor) => actor.id === "p1" && actor.stateNo === 294)).toBe(true);
  });

  it("creates a synthetic imported state-context artifact with ctrl and metadata branch evidence", () => {
    const artifact = createSyntheticImportedStateContextTraceArtifact({ generatedAt: "2026-07-01T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-state-context-golden",
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
    expect(evidence?.routedStates).toContain(295);
    expect(evidence?.executedStates).toContain(295);
    expect(artifact.gates[0]?.requirements.requiredRoutedStates).toEqual([295]);
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([295]);
    expect(
      artifact.trace.finalActors.some(
        (actor) =>
          actor.id === "p1" &&
          actor.stateNo === 295 &&
          actor.prevStateType === "S" &&
          actor.prevMoveType === "I" &&
          actor.physics === "S",
      ),
    ).toBe(true);
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

  it("creates a synthetic imported default NumTarget artifact with target id 0 evidence", () => {
    const artifact = createSyntheticImportedDefaultNumTargetTraceArtifact({ generatedAt: "2026-06-30T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-default-numtarget-golden",
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
    expect(evidence?.executedStates).toContain(268);
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([200, 268]);
    expect(evidence?.eventCategories).toContain("hit");
    expect(evidence?.combatReasons).toContain("hit");
    expect(evidence?.targetLinks).toEqual(
      expect.arrayContaining([expect.objectContaining({ ownerId: "p1", actorId: "p2", targetId: 0 })]),
    );
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

  it("creates a synthetic imported Helper IsHelper artifact with helper-local branch evidence", () => {
    const artifact = createSyntheticImportedHelperIsHelperTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-helper-ishelper-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-helper-ishelper-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200]));
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1201, animNo: 921 })]),
    );
    expect(gate?.requirements.requiredActorFrames).toEqual([
      { source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1201, animNo: 921, minFrames: 1 },
    ]);
  });

  it("creates a synthetic imported Helper EnemyNear artifact with helper-local opponent branch evidence", () => {
    const artifact = createSyntheticImportedHelperEnemyNearTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-helper-enemynear-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-helper-enemynear-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200]));
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1202, animNo: 922 })]),
    );
    expect(gate?.requirements.requiredActorFrames).toEqual([
      { source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1202, animNo: 922, minFrames: 1 },
    ]);
  });

  it("creates a synthetic imported Helper Explod artifact with helper-parented visual effect evidence", () => {
    const artifact = createSyntheticImportedHelperExplodTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-helper-explod-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-helper-explod-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(evidence?.effectKinds).toEqual(expect.arrayContaining(["helper", "explod"]));
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1205, animNo: 925 }),
        expect.objectContaining({ source: "effect", actorKind: "explod", ownerId: "p1", animNo: 939 }),
      ]),
    );
    expect(gate?.requirements.requiredWorldLifecycleEvents).toEqual([
      { type: "spawn", kind: "helper", ownerId: "p1", rootId: "p1", parentId: "p1" },
      { type: "active", kind: "helper", ownerId: "p1", rootId: "p1", parentId: "p1" },
      { type: "spawn", kind: "explod", ownerId: "p1", rootId: "p1", parentId: "p1-helper-0" },
      { type: "active", kind: "explod", ownerId: "p1", rootId: "p1", parentId: "p1-helper-0" },
    ]);
    expect(gate?.requirements.requiredEffectPayloads).toEqual([
      { kind: "helper", ownerId: "p1", effectId: 42, name: "Buddy", helperStateNo: 1205, minAge: 1 },
      { actorId: "p1-explod-0", kind: "explod", ownerId: "p1", effectId: 8800, minAge: 1, minRemoveTime: 24, minSpritePriority: 7 },
    ]);
    expect(evidence?.effectPayloads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1-explod-0",
          parentId: "p1-helper-0",
          effect: expect.objectContaining({ kind: "explod", id: 8800, spritePriority: 7 }),
        }),
      ]),
    );
  });

  it("creates a synthetic imported Helper Projectile artifact with helper-parented projectile evidence", () => {
    const artifact = createSyntheticImportedHelperProjectileTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-helper-projectile-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-helper-projectile-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(evidence?.effectKinds).toEqual(expect.arrayContaining(["helper", "projectile"]));
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1212, animNo: 932 }),
        expect.objectContaining({ source: "effect", actorKind: "projectile", ownerId: "p1", animNo: 943 }),
      ]),
    );
    expect(gate?.requirements.requiredWorldLifecycleEvents).toEqual([
      { type: "spawn", kind: "helper", ownerId: "p1", rootId: "p1", parentId: "p1" },
      { type: "active", kind: "helper", ownerId: "p1", rootId: "p1", parentId: "p1" },
      { type: "spawn", kind: "projectile", ownerId: "p1", rootId: "p1", parentId: "p1-helper-0" },
      { type: "active", kind: "projectile", ownerId: "p1", rootId: "p1", parentId: "p1-helper-0" },
    ]);
    expect(gate?.requirements.requiredEffectPayloads).toEqual([
      { kind: "helper", ownerId: "p1", effectId: 42, name: "Buddy", helperStateNo: 1212, minAge: 1 },
      { actorId: "p1-projectile-0", kind: "projectile", ownerId: "p1", effectId: 8850, minAge: 1, minPriority: 2 },
    ]);
    expect(evidence?.effectPayloads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1-projectile-0",
          parentId: "p1-helper-0",
          effect: expect.objectContaining({ kind: "projectile", id: 8850, priority: 2 }),
        }),
      ]),
    );
  });

  it("creates a synthetic imported Helper RemoveExplod artifact with helper-local cleanup evidence", () => {
    const artifact = createSyntheticImportedHelperRemoveExplodTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-helper-removeexplod-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-helper-removeexplod-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(evidence?.worldLifecycleEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "spawn", kind: "explod", ownerId: "p1", parentId: "p1-helper-0" }),
        expect.objectContaining({ type: "remove", kind: "explod", ownerId: "p1", parentId: "p1-helper-0" }),
      ]),
    );
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1206, animNo: 926 }),
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1207, animNo: 927 }),
        expect.objectContaining({ source: "effect", actorKind: "explod", ownerId: "p1", animNo: 940 }),
      ]),
    );
    expect(gate?.requirements.requiredWorldLifecycleEvents).toEqual([
      { type: "spawn", kind: "helper", ownerId: "p1", rootId: "p1", parentId: "p1" },
      { type: "active", kind: "helper", ownerId: "p1", rootId: "p1", parentId: "p1" },
      { type: "spawn", kind: "explod", ownerId: "p1", rootId: "p1", parentId: "p1-helper-0" },
      { type: "active", kind: "explod", ownerId: "p1", rootId: "p1", parentId: "p1-helper-0" },
      { type: "remove", kind: "explod", ownerId: "p1", rootId: "p1", parentId: "p1-helper-0" },
    ]);
    expect(gate?.requirements.requiredEffectPayloads).toEqual([
      { kind: "helper", ownerId: "p1", effectId: 42, name: "Buddy", helperStateNo: 1207, minAge: 2 },
      { actorId: "p1-explod-0", kind: "explod", ownerId: "p1", effectId: 8810, minAge: 1, minRemoveTime: 80, minSpritePriority: 7 },
    ]);
  });

  it("creates a synthetic imported Helper ModifyExplod artifact with helper-local mutation evidence", () => {
    const artifact = createSyntheticImportedHelperModifyExplodTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-helper-modifyexplod-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-helper-modifyexplod-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(evidence?.worldLifecycleEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "spawn", kind: "explod", ownerId: "p1", parentId: "p1-helper-0" }),
        expect.objectContaining({ type: "active", kind: "explod", ownerId: "p1", parentId: "p1-helper-0" }),
      ]),
    );
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1208, animNo: 928 }),
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1209, animNo: 929 }),
        expect.objectContaining({ source: "effect", actorKind: "explod", ownerId: "p1", animNo: 941 }),
      ]),
    );
    expect(gate?.requirements.requiredEffectPayloads).toEqual([
      { kind: "helper", ownerId: "p1", effectId: 42, name: "Buddy", helperStateNo: 1209, minAge: 2 },
      {
        actorId: "p1-explod-0",
        kind: "explod",
        ownerId: "p1",
        effectId: 8820,
        minAge: 3,
        minRemoveTime: 90,
        minSpritePriority: 8,
        removeOnGetHit: true,
        ignoreHitPause: true,
        minPauseMoveTime: 3,
        minSuperMoveTime: 4,
        scaleX: 2,
        scaleY: 0.5,
      },
    ]);
  });

  it("creates a synthetic imported Helper ModifyProjectile artifact with helper-local mutation evidence", () => {
    const artifact = createSyntheticImportedHelperModifyProjectileTraceArtifact({ generatedAt: "2026-06-30T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-helper-modifyprojectile-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-helper-modifyprojectile-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(evidence?.worldLifecycleEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "spawn", kind: "projectile", ownerId: "p1", parentId: "p1-helper-0" }),
        expect.objectContaining({ type: "active", kind: "projectile", ownerId: "p1", parentId: "p1-helper-0" }),
      ]),
    );
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1214, animNo: 934 }),
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1215, animNo: 935 }),
        expect.objectContaining({ source: "effect", actorKind: "projectile", ownerId: "p1", animNo: 945 }),
      ]),
    );
    expect(gate?.requirements.requiredEffectPayloads).toEqual([
      { kind: "helper", ownerId: "p1", effectId: 42, name: "Buddy", helperStateNo: 1215, minAge: 2 },
      {
        actorId: "p1-projectile-0",
        kind: "projectile",
        ownerId: "p1",
        effectId: 8852,
        minAge: 3,
        minRemoveTime: 52,
        minSpritePriority: 8,
        minPriority: 4,
        minHitsRemaining: 3,
        maxHitsRemaining: 3,
        hasHit: false,
        scaleX: 2,
        scaleY: 0.5,
      },
    ]);
    expect(evidence?.effectPayloads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1-projectile-0",
          parentId: "p1-helper-0",
          effect: expect.objectContaining({ kind: "projectile", id: 8852, priority: 4, hitsRemaining: 3 }),
        }),
      ]),
    );
  });

  it("creates a synthetic imported Helper ProjHit artifact with helper-local projectile contact evidence", () => {
    const artifact = createSyntheticImportedHelperProjHitTraceArtifact({ generatedAt: "2026-06-30T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-helper-projhit-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-helper-projhit-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(evidence?.eventCategories).toContain("hit");
    expect(evidence?.combatReasons).toContain("hit");
    expect(evidence?.worldLifecycleEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "spawn", kind: "projectile", ownerId: "p1", parentId: "p1-helper-0" }),
        expect.objectContaining({ type: "active", kind: "projectile", ownerId: "p1", parentId: "p1-helper-0" }),
      ]),
    );
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1216, animNo: 936 }),
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1217, animNo: 937 }),
        expect.objectContaining({ source: "effect", actorKind: "projectile", ownerId: "p1", animNo: 946 }),
      ]),
    );
    expect(gate?.requirements.requiredEffectPayloads).toEqual([
      { kind: "helper", ownerId: "p1", effectId: 42, name: "Buddy", helperStateNo: 1217, minAge: 2 },
      {
        actorId: "p1-projectile-0",
        kind: "projectile",
        ownerId: "p1",
        parentId: "p1-helper-0",
        effectId: 8853,
        minAge: 1,
        minPriority: 2,
        maxHitsRemaining: 0,
        hasHit: true,
      },
    ]);
    expect(gate?.requirements.requiredTargetLinks).toEqual([{ ownerId: "p1", actorId: "p2", targetId: 8853 }]);
    expect(evidence?.targetLinks).toEqual(
      expect.arrayContaining([expect.objectContaining({ ownerId: "p1", actorId: "p2", targetId: 8853 })]),
    );
    expect(evidence?.contactEffectPackages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1",
          source: "imported",
          actorKind: "player",
          contactKind: "hit",
          sound: expect.objectContaining({ type: "PlaySnd", group: 5, index: 0, contactKind: "hit" }),
          hitEffect: expect.objectContaining({
            kind: "hit",
            sparkNo: 7002,
            raw: "F7002",
            rawPrefix: "F",
            assetSource: "fightfx",
            assetActionId: 7002,
            assetFrameCount: 2,
            assetTotalDuration: 11,
            offset: { x: 18, y: -68 },
          }),
        }),
      ]),
    );
    expect(gate?.requirements.requiredContactEffectPackages).toEqual([
      expect.objectContaining({
        contactKind: "hit",
        hitEffect: expect.objectContaining({ kind: "hit", sparkNo: 7002, offsetX: 18, offsetY: -68 }),
      }),
    ]);
    expect(evidence?.effectPayloads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1-projectile-0",
          parentId: "p1-helper-0",
          effect: expect.objectContaining({ kind: "projectile", id: 8853, hitsRemaining: 0, hasHit: true }),
        }),
      ]),
    );
  });

  it("creates a synthetic imported Helper ProjHitTime any artifact with helper-local any-projectile evidence", () => {
    const artifact = createSyntheticImportedHelperProjHitTimeAnyTraceArtifact({ generatedAt: "2026-07-01T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-helper-projhittime-any-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-helper-projhittime-any-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(evidence?.eventCategories).toContain("hit");
    expect(evidence?.combatReasons).toContain("hit");
    expect(evidence?.worldLifecycleEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "spawn", kind: "projectile", ownerId: "p1", parentId: "p1-helper-0" }),
        expect.objectContaining({ type: "active", kind: "projectile", ownerId: "p1", parentId: "p1-helper-0" }),
      ]),
    );
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1260, animNo: 986 }),
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1261, animNo: 987 }),
        expect.objectContaining({ source: "effect", actorKind: "projectile", ownerId: "p1", animNo: 988 }),
      ]),
    );
    expect(gate?.requirements.requiredEffectPayloads).toEqual([
      { kind: "helper", ownerId: "p1", effectId: 42, name: "Buddy", helperStateNo: 1261, minAge: 2 },
      {
        actorId: "p1-projectile-0",
        kind: "projectile",
        ownerId: "p1",
        parentId: "p1-helper-0",
        effectId: 8864,
        minAge: 1,
        minPriority: 2,
        maxHitsRemaining: 0,
        hasHit: true,
      },
    ]);
    expect(gate?.requirements.requiredTargetLinks).toEqual([{ ownerId: "p1", actorId: "p2", targetId: 8864 }]);
    expect(evidence?.targetLinks).toEqual(
      expect.arrayContaining([expect.objectContaining({ ownerId: "p1", actorId: "p2", targetId: 8864 })]),
    );
    expect(evidence?.contactEffectPackages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1",
          source: "imported",
          actorKind: "player",
          contactKind: "hit",
          sound: expect.objectContaining({ type: "PlaySnd", group: 5, index: 12, contactKind: "hit" }),
          hitEffect: expect.objectContaining({
            kind: "hit",
            sparkNo: 7018,
            raw: "F7018",
            rawPrefix: "F",
            assetSource: "fightfx",
            assetActionId: 7018,
            assetFrameCount: 2,
            assetTotalDuration: 11,
            offset: { x: 19, y: -62 },
          }),
        }),
      ]),
    );
    expect(evidence?.effectPayloads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1-projectile-0",
          parentId: "p1-helper-0",
          effect: expect.objectContaining({ kind: "projectile", id: 8864, hitsRemaining: 0, hasHit: true }),
        }),
      ]),
    );
  });

  it("creates a synthetic imported Helper Projectile Target artifact with helper-owned target redirect evidence", () => {
    const artifact = createSyntheticImportedHelperProjectileTargetTraceArtifact({ generatedAt: "2026-06-30T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-helper-projectile-target-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-helper-projectile-target-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(evidence?.eventCategories).toContain("hit");
    expect(evidence?.combatReasons).toContain("hit");
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1224, animNo: 954 }),
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1225, animNo: 955 }),
        expect.objectContaining({ source: "effect", actorKind: "projectile", ownerId: "p1", animNo: 956 }),
        expect.objectContaining({ actorId: "p2", actorKind: "player", minLife: 982, maxLife: 982 }),
      ]),
    );
    expect(gate?.requirements.requiredTargetLinks).toEqual([
      { ownerId: "p1", actorId: "p2", targetId: 8860 },
      { ownerId: "p1-helper-0", actorId: "p2", targetId: 8860, hasBinding: false, minFrames: 1 },
    ]);
    expect(evidence?.targetLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ownerId: "p1", actorId: "p2", targetId: 8860 }),
        expect.objectContaining({ ownerId: "p1-helper-0", actorId: "p2", targetId: 8860 }),
      ]),
    );
    expect(evidence?.finalActors).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "p2", actorKind: "player", life: 982 })]),
    );
    expect(evidence?.contactEffectPackages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1",
          source: "imported",
          actorKind: "player",
          contactKind: "hit",
          sound: expect.objectContaining({ type: "PlaySnd", group: 5, index: 2, contactKind: "hit" }),
          hitEffect: expect.objectContaining({
            kind: "hit",
            sparkNo: 7008,
            raw: "F7008",
            rawPrefix: "F",
            assetSource: "fightfx",
            assetActionId: 7008,
            assetFrameCount: 2,
            assetTotalDuration: 11,
            offset: { x: 13, y: -54 },
          }),
        }),
      ]),
    );
    expect(evidence?.effectPayloads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1-projectile-0",
          parentId: "p1-helper-0",
          effect: expect.objectContaining({ kind: "projectile", id: 8860, hitsRemaining: 0, hasHit: true }),
        }),
      ]),
    );
  });

  it("creates a synthetic imported Helper Projectile bare Target artifact with helper-owned current-target redirect evidence", () => {
    const artifact = createSyntheticImportedHelperProjectileBareTargetTraceArtifact({ generatedAt: "2026-07-01T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-helper-projectile-bare-target-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-helper-projectile-bare-target-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(evidence?.eventCategories).toContain("hit");
    expect(evidence?.combatReasons).toContain("hit");
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1241, animNo: 977 }),
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1242, animNo: 978 }),
        expect.objectContaining({ source: "effect", actorKind: "projectile", ownerId: "p1", animNo: 979 }),
        expect.objectContaining({ actorId: "p2", actorKind: "player", minLife: 982, maxLife: 982 }),
      ]),
    );
    expect(gate?.requirements.requiredTargetLinks).toEqual([
      { ownerId: "p1", actorId: "p2", targetId: 8863 },
      { ownerId: "p1-helper-0", actorId: "p2", targetId: 8863, hasBinding: false, minFrames: 1 },
    ]);
    expect(evidence?.targetLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ownerId: "p1", actorId: "p2", targetId: 8863 }),
        expect.objectContaining({ ownerId: "p1-helper-0", actorId: "p2", targetId: 8863 }),
      ]),
    );
    expect(evidence?.finalActors).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "p2", actorKind: "player", life: 982 })]),
    );
    expect(evidence?.contactEffectPackages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1",
          source: "imported",
          actorKind: "player",
          contactKind: "hit",
          sound: expect.objectContaining({ type: "PlaySnd", group: 5, index: 11, contactKind: "hit" }),
          hitEffect: expect.objectContaining({
            kind: "hit",
            sparkNo: 7017,
            raw: "F7017",
            rawPrefix: "F",
            assetSource: "fightfx",
            assetActionId: 7017,
            assetFrameCount: 2,
            assetTotalDuration: 11,
            offset: { x: 21, y: -49 },
          }),
        }),
      ]),
    );
    expect(evidence?.effectPayloads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1-helper-0",
          effect: expect.objectContaining({ kind: "helper", stateNo: 1242, targetCount: 1 }),
        }),
        expect.objectContaining({
          actorId: "p1-projectile-0",
          parentId: "p1-helper-0",
          effect: expect.objectContaining({ kind: "projectile", id: 8863, hitsRemaining: 0, hasHit: true }),
        }),
      ]),
    );
  });

  it("creates a synthetic imported Helper Projectile Target controllers artifact with target side-effect evidence", () => {
    const artifact = createSyntheticImportedHelperProjectileTargetControllersTraceArtifact({ generatedAt: "2026-07-01T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-helper-projectile-target-controllers-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-helper-projectile-target-controllers-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1233, animNo: 965 }),
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1234, animNo: 966 }),
        expect.objectContaining({ source: "effect", actorKind: "projectile", ownerId: "p1", animNo: 967 }),
        expect.objectContaining({ actorId: "p2", actorKind: "player", facing: 1, minLife: 958, maxLife: 958 }),
      ]),
    );
    expect(gate?.requirements.requiredTargetLinks).toEqual([
      { ownerId: "p1", actorId: "p2", targetId: 8861 },
      { ownerId: "p1-helper-0", actorId: "p2", targetId: 8861, hasBinding: false, minFrames: 1 },
      {
        ownerId: "p1-helper-0",
        actorId: "p2",
        targetId: 8861,
        hasBinding: true,
        minFrames: 1,
        minAge: 1,
        minBindingRemaining: 1,
        maxBindingRemaining: 3,
        bindingOffsetX: 36,
        bindingOffsetY: -12,
      },
    ]);
    expect(evidence?.targetLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ownerId: "p1", actorId: "p2", targetId: 8861 }),
        expect.objectContaining({ ownerId: "p1-helper-0", actorId: "p2", targetId: 8861, hasBinding: false }),
        expect.objectContaining({ ownerId: "p1-helper-0", actorId: "p2", targetId: 8861, hasBinding: true }),
      ]),
    );
    expect(evidence?.finalActors).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "p2", actorKind: "player", life: 958, power: 40 })]),
    );
    expect(evidence?.effectPayloads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1-helper-0",
          effect: expect.objectContaining({ kind: "helper", stateNo: 1234, targetCount: 0 }),
        }),
        expect.objectContaining({
          actorId: "p1-projectile-0",
          parentId: "p1-helper-0",
          effect: expect.objectContaining({ kind: "projectile", id: 8861, hitsRemaining: 0, hasHit: true }),
        }),
      ]),
    );
    expect(evidence?.contactEffectPackages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1",
          source: "imported",
          actorKind: "player",
          contactKind: "hit",
          sound: expect.objectContaining({ type: "PlaySnd", group: 5, index: 7, contactKind: "hit" }),
          hitEffect: expect.objectContaining({
            kind: "hit",
            sparkNo: 7013,
            raw: "F7013",
            rawPrefix: "F",
            assetSource: "fightfx",
            assetActionId: 7013,
            assetFrameCount: 2,
            assetTotalDuration: 11,
            offset: { x: 17, y: -51 },
          }),
        }),
      ]),
    );
  });

  it("creates a synthetic imported Helper Projectile TargetState artifact with owner-backed custom-state evidence", () => {
    const artifact = createSyntheticImportedHelperProjectileTargetStateTraceArtifact({ generatedAt: "2026-07-01T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-helper-projectile-targetstate-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-helper-projectile-targetstate-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1237, animNo: 971 }),
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1238, animNo: 972 }),
        expect.objectContaining({ source: "effect", actorKind: "projectile", ownerId: "p1", animNo: 973 }),
        expect.objectContaining({ actorId: "p2", source: "imported", actorKind: "player", customOwnerId: "p1", animNo: 888 }),
        expect.objectContaining({ actorId: "p2", source: "imported", actorKind: "player", customOwnerId: "p1", animNo: 889 }),
      ]),
    );
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 888, 889]));
    expect(evidence?.executedControllers.SelfState).toBeGreaterThanOrEqual(1);
    expect(gate?.requirements.requiredTargetLinks).toEqual([
      { ownerId: "p1", actorId: "p2", targetId: 8862 },
      { ownerId: "p1-helper-0", actorId: "p2", targetId: 8862, hasBinding: false, minFrames: 1 },
    ]);
    expect(evidence?.targetLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ownerId: "p1", actorId: "p2", targetId: 8862 }),
        expect.objectContaining({ ownerId: "p1-helper-0", actorId: "p2", targetId: 8862 }),
      ]),
    );
    expect(evidence?.finalActors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "p2", source: "imported", actorKind: "player", customOwnerId: undefined, stateNo: 0, ctrl: true }),
      ]),
    );
    expect(evidence?.effectPayloads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1-helper-0",
          effect: expect.objectContaining({ kind: "helper", stateNo: 1238, targetCount: 1 }),
        }),
        expect.objectContaining({
          actorId: "p1-projectile-0",
          parentId: "p1-helper-0",
          effect: expect.objectContaining({ kind: "projectile", id: 8862, hitsRemaining: 0, hasHit: true }),
        }),
      ]),
    );
    expect(evidence?.contactEffectPackages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1",
          source: "imported",
          actorKind: "player",
          contactKind: "hit",
          sound: expect.objectContaining({ type: "PlaySnd", group: 5, index: 9, contactKind: "hit" }),
          hitEffect: expect.objectContaining({
            kind: "hit",
            sparkNo: 7015,
            raw: "F7015",
            rawPrefix: "F",
            assetSource: "fightfx",
            assetActionId: 7015,
            assetFrameCount: 2,
            assetTotalDuration: 11,
            offset: { x: 19, y: -49 },
          }),
        }),
      ]),
    );
  });

  it("creates a synthetic imported Helper Projectile default TargetState artifact with owner-backed custom-state evidence", () => {
    const artifact = createSyntheticImportedHelperProjectileDefaultTargetStateTraceArtifact({ generatedAt: "2026-07-01T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-helper-projectile-default-targetstate-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-helper-projectile-default-targetstate-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1239, animNo: 974 }),
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1240, animNo: 975 }),
        expect.objectContaining({ source: "effect", actorKind: "projectile", ownerId: "p1", animNo: 976 }),
        expect.objectContaining({ actorId: "p2", source: "imported", actorKind: "player", customOwnerId: "p1", animNo: 888 }),
        expect.objectContaining({ actorId: "p2", source: "imported", actorKind: "player", customOwnerId: "p1", animNo: 889 }),
      ]),
    );
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 888, 889]));
    expect(evidence?.executedControllers.SelfState).toBeGreaterThanOrEqual(1);
    expect(gate?.requirements.requiredTargetLinks).toEqual([
      { ownerId: "p1", actorId: "p2", targetId: 0 },
      { ownerId: "p1-helper-0", actorId: "p2", targetId: 0, hasBinding: false, minFrames: 1 },
    ]);
    expect(evidence?.targetLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ownerId: "p1", actorId: "p2", targetId: 0 }),
        expect.objectContaining({ ownerId: "p1-helper-0", actorId: "p2", targetId: 0 }),
      ]),
    );
    expect(evidence?.finalActors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "p2", source: "imported", actorKind: "player", customOwnerId: undefined, stateNo: 0, ctrl: true }),
      ]),
    );
    expect(evidence?.effectPayloads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1-helper-0",
          effect: expect.objectContaining({ kind: "helper", stateNo: 1240, targetCount: 1 }),
        }),
        expect.objectContaining({
          actorId: "p1-projectile-0",
          parentId: "p1-helper-0",
          effect: expect.objectContaining({ kind: "projectile", id: 0, hitsRemaining: 0, hasHit: true }),
        }),
      ]),
    );
    expect(evidence?.contactEffectPackages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1",
          source: "imported",
          actorKind: "player",
          contactKind: "hit",
          sound: expect.objectContaining({ type: "PlaySnd", group: 5, index: 10, contactKind: "hit" }),
          hitEffect: expect.objectContaining({
            kind: "hit",
            sparkNo: 7016,
            raw: "F7016",
            rawPrefix: "F",
            assetSource: "fightfx",
            assetActionId: 7016,
            assetFrameCount: 2,
            assetTotalDuration: 11,
            offset: { x: 20, y: -48 },
          }),
        }),
      ]),
    );
  });

  it("creates a synthetic imported Helper Projectile default Target controllers artifact with target side-effect evidence", () => {
    const artifact = createSyntheticImportedHelperProjectileDefaultTargetControllersTraceArtifact({
      generatedAt: "2026-07-01T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-helper-projectile-default-target-controllers-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-helper-projectile-default-target-controllers-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1235, animNo: 968 }),
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1236, animNo: 969 }),
        expect.objectContaining({ source: "effect", actorKind: "projectile", ownerId: "p1", animNo: 970 }),
        expect.objectContaining({ actorId: "p2", actorKind: "player", facing: 1, minLife: 958, maxLife: 958 }),
      ]),
    );
    expect(gate?.requirements.requiredTargetLinks).toEqual([
      { ownerId: "p1", actorId: "p2", targetId: 0 },
      { ownerId: "p1-helper-0", actorId: "p2", targetId: 0, hasBinding: false, minFrames: 1 },
      {
        ownerId: "p1-helper-0",
        actorId: "p2",
        targetId: 0,
        hasBinding: true,
        minFrames: 1,
        minAge: 1,
        minBindingRemaining: 1,
        maxBindingRemaining: 3,
        bindingOffsetX: 36,
        bindingOffsetY: -12,
      },
    ]);
    expect(evidence?.targetLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ownerId: "p1", actorId: "p2", targetId: 0 }),
        expect.objectContaining({ ownerId: "p1-helper-0", actorId: "p2", targetId: 0, hasBinding: false }),
        expect.objectContaining({ ownerId: "p1-helper-0", actorId: "p2", targetId: 0, hasBinding: true }),
      ]),
    );
    expect(evidence?.finalActors).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "p2", actorKind: "player", life: 958, power: 40 })]),
    );
    expect(evidence?.effectPayloads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1-helper-0",
          effect: expect.objectContaining({ kind: "helper", stateNo: 1236, targetCount: 0 }),
        }),
        expect.objectContaining({
          actorId: "p1-projectile-0",
          parentId: "p1-helper-0",
          effect: expect.objectContaining({ kind: "projectile", id: 0, hitsRemaining: 0, hasHit: true }),
        }),
      ]),
    );
    expect(evidence?.contactEffectPackages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1",
          source: "imported",
          actorKind: "player",
          contactKind: "hit",
          sound: expect.objectContaining({ type: "PlaySnd", group: 5, index: 8, contactKind: "hit" }),
          hitEffect: expect.objectContaining({
            kind: "hit",
            sparkNo: 7014,
            raw: "F7014",
            rawPrefix: "F",
            assetSource: "fightfx",
            assetActionId: 7014,
            assetFrameCount: 2,
            assetTotalDuration: 11,
            offset: { x: 18, y: -50 },
          }),
        }),
      ]),
    );
  });

  it("creates a synthetic imported Helper Projectile default Target artifact with target id 0 evidence", () => {
    const artifact = createSyntheticImportedHelperProjectileDefaultTargetTraceArtifact({ generatedAt: "2026-06-30T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-helper-projectile-default-target-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-helper-projectile-default-target-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1226, animNo: 957 }),
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1227, animNo: 958 }),
        expect.objectContaining({ source: "effect", actorKind: "projectile", ownerId: "p1", animNo: 959 }),
      ]),
    );
    expect(gate?.requirements.requiredTargetLinks).toEqual([
      { ownerId: "p1", actorId: "p2", targetId: 0 },
      { ownerId: "p1-helper-0", actorId: "p2", targetId: 0, hasBinding: false, minFrames: 1 },
    ]);
    expect(evidence?.targetLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ownerId: "p1", actorId: "p2", targetId: 0 }),
        expect.objectContaining({ ownerId: "p1-helper-0", actorId: "p2", targetId: 0 }),
      ]),
    );
    expect(evidence?.effectPayloads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1-projectile-0",
          parentId: "p1-helper-0",
          effect: expect.objectContaining({ kind: "projectile", id: 0, hitsRemaining: 0, hasHit: true }),
        }),
      ]),
    );
    expect(evidence?.contactEffectPackages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1",
          source: "imported",
          actorKind: "player",
          contactKind: "hit",
          sound: expect.objectContaining({ type: "PlaySnd", group: 5, index: 3, contactKind: "hit" }),
          hitEffect: expect.objectContaining({
            kind: "hit",
            sparkNo: 7009,
            raw: "F7009",
            rawPrefix: "F",
            assetSource: "fightfx",
            assetActionId: 7009,
            assetFrameCount: 2,
            assetTotalDuration: 11,
            offset: { x: 14, y: -52 },
          }),
        }),
      ]),
    );
  });

  it("creates a synthetic imported Helper ProjGuarded artifact with helper-local projectile guard evidence", () => {
    const artifact = createSyntheticImportedHelperProjGuardTraceArtifact({ generatedAt: "2026-06-30T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-helper-projguard-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-helper-projguard-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(evidence?.eventCategories).toContain("guard");
    expect(evidence?.combatReasons).toContain("guard");
    expect(evidence?.activeCommands).toEqual(expect.arrayContaining(["x"]));
    expect(evidence?.worldLifecycleEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "spawn", kind: "projectile", ownerId: "p1", parentId: "p1-helper-0" }),
        expect.objectContaining({ type: "active", kind: "projectile", ownerId: "p1", parentId: "p1-helper-0" }),
      ]),
    );
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1218, animNo: 938 }),
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1219, animNo: 947 }),
        expect.objectContaining({ source: "effect", actorKind: "projectile", ownerId: "p1", animNo: 948 }),
      ]),
    );
    expect(gate?.requirements.requiredEffectPayloads).toEqual([
      { kind: "helper", ownerId: "p1", effectId: 42, name: "Buddy", helperStateNo: 1219, minAge: 2 },
      {
        actorId: "p1-projectile-0",
        kind: "projectile",
        ownerId: "p1",
        parentId: "p1-helper-0",
        effectId: 8854,
        minAge: 1,
        minPriority: 2,
        maxHitsRemaining: 0,
        hasHit: true,
      },
    ]);
    expect(gate?.requirements.requiredTargetLinks).toEqual([{ ownerId: "p1", actorId: "p2", targetId: 8854 }]);
    expect(evidence?.targetLinks).toEqual(
      expect.arrayContaining([expect.objectContaining({ ownerId: "p1", actorId: "p2", targetId: 8854 })]),
    );
    expect(evidence?.contactEffectPackages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1",
          source: "imported",
          actorKind: "player",
          contactKind: "guard",
          sound: expect.objectContaining({ type: "PlaySnd", group: 6, index: 0, contactKind: "guard" }),
          hitEffect: expect.objectContaining({
            kind: "guard",
            sparkNo: 7004,
            raw: "F7004",
            rawPrefix: "F",
            assetSource: "fightfx",
            assetActionId: 7004,
            assetFrameCount: 2,
            assetTotalDuration: 11,
            offset: { x: 15, y: -63 },
          }),
        }),
      ]),
    );
    expect(gate?.requirements.requiredContactEffectPackages).toEqual([
      expect.objectContaining({
        contactKind: "guard",
        hitEffect: expect.objectContaining({ kind: "guard", sparkNo: 7004, offsetX: 15, offsetY: -63 }),
      }),
    ]);
    expect(evidence?.effectPayloads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1-projectile-0",
          parentId: "p1-helper-0",
          effect: expect.objectContaining({ kind: "projectile", id: 8854, hitsRemaining: 0, hasHit: true }),
        }),
      ]),
    );
  });

  it("creates a synthetic imported Helper ProjGuardedTime any artifact with helper-local any-projectile guard evidence", () => {
    const artifact = createSyntheticImportedHelperProjGuardedTimeAnyTraceArtifact({ generatedAt: "2026-07-01T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-helper-projguardedtime-any-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-helper-projguardedtime-any-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(evidence?.eventCategories).toContain("guard");
    expect(evidence?.combatReasons).toContain("guard");
    expect(evidence?.worldLifecycleEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "spawn", kind: "projectile", ownerId: "p1", parentId: "p1-helper-0" }),
        expect.objectContaining({ type: "active", kind: "projectile", ownerId: "p1", parentId: "p1-helper-0" }),
      ]),
    );
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1262, animNo: 989 }),
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1263, animNo: 990 }),
        expect.objectContaining({ source: "effect", actorKind: "projectile", ownerId: "p1", animNo: 991 }),
      ]),
    );
    expect(gate?.requirements.requiredEffectPayloads).toEqual([
      { kind: "helper", ownerId: "p1", effectId: 42, name: "Buddy", helperStateNo: 1263, minAge: 2 },
      {
        actorId: "p1-projectile-0",
        kind: "projectile",
        ownerId: "p1",
        parentId: "p1-helper-0",
        effectId: 8865,
        minAge: 1,
        minPriority: 2,
        maxHitsRemaining: 0,
        hasHit: true,
      },
    ]);
    expect(gate?.requirements.requiredTargetLinks).toEqual([{ ownerId: "p1", actorId: "p2", targetId: 8865 }]);
    expect(evidence?.targetLinks).toEqual(
      expect.arrayContaining([expect.objectContaining({ ownerId: "p1", actorId: "p2", targetId: 8865 })]),
    );
    expect(evidence?.contactEffectPackages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1",
          source: "imported",
          actorKind: "player",
          contactKind: "guard",
          sound: expect.objectContaining({ type: "PlaySnd", group: 6, index: 12, contactKind: "guard" }),
          hitEffect: expect.objectContaining({
            kind: "guard",
            sparkNo: 7019,
            raw: "F7019",
            rawPrefix: "F",
            assetSource: "fightfx",
            assetActionId: 7019,
            assetFrameCount: 2,
            assetTotalDuration: 11,
            offset: { x: 16, y: -60 },
          }),
        }),
      ]),
    );
    expect(evidence?.effectPayloads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1-projectile-0",
          parentId: "p1-helper-0",
          effect: expect.objectContaining({ kind: "projectile", id: 8865, hitsRemaining: 0, hasHit: true }),
        }),
      ]),
    );
  });

  it("creates a synthetic imported Helper ProjContact artifact with helper-local generic projectile contact evidence", () => {
    const artifact = createSyntheticImportedHelperProjContactTraceArtifact({ generatedAt: "2026-06-30T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-helper-projcontact-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-helper-projcontact-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(evidence?.eventCategories).toContain("guard");
    expect(evidence?.combatReasons).toContain("guard");
    expect(evidence?.activeCommands).toEqual(expect.arrayContaining(["x"]));
    expect(evidence?.worldLifecycleEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "spawn", kind: "projectile", ownerId: "p1", parentId: "p1-helper-0" }),
        expect.objectContaining({ type: "active", kind: "projectile", ownerId: "p1", parentId: "p1-helper-0" }),
      ]),
    );
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1220, animNo: 949 }),
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1221, animNo: 950 }),
        expect.objectContaining({ source: "effect", actorKind: "projectile", ownerId: "p1", animNo: 951 }),
      ]),
    );
    expect(gate?.requirements.requiredEffectPayloads).toEqual([
      { kind: "helper", ownerId: "p1", effectId: 42, name: "Buddy", helperStateNo: 1221, minAge: 2 },
      {
        actorId: "p1-projectile-0",
        kind: "projectile",
        ownerId: "p1",
        parentId: "p1-helper-0",
        effectId: 8855,
        minAge: 1,
        minPriority: 2,
        maxHitsRemaining: 0,
        hasHit: true,
      },
    ]);
    expect(gate?.requirements.requiredTargetLinks).toEqual([{ ownerId: "p1", actorId: "p2", targetId: 8855 }]);
    expect(evidence?.targetLinks).toEqual(
      expect.arrayContaining([expect.objectContaining({ ownerId: "p1", actorId: "p2", targetId: 8855 })]),
    );
    expect(evidence?.contactEffectPackages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1",
          source: "imported",
          actorKind: "player",
          contactKind: "guard",
          sound: expect.objectContaining({ type: "PlaySnd", group: 6, index: 0, contactKind: "guard" }),
          hitEffect: expect.objectContaining({
            kind: "guard",
            sparkNo: 7004,
            raw: "F7004",
            rawPrefix: "F",
            assetSource: "fightfx",
            assetActionId: 7004,
            assetFrameCount: 2,
            assetTotalDuration: 11,
            offset: { x: 15, y: -63 },
          }),
        }),
      ]),
    );
    expect(gate?.requirements.requiredContactEffectPackages).toEqual([
      expect.objectContaining({
        contactKind: "guard",
        hitEffect: expect.objectContaining({ kind: "guard", sparkNo: 7004, offsetX: 15, offsetY: -63 }),
      }),
    ]);
    expect(evidence?.effectPayloads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1-projectile-0",
          parentId: "p1-helper-0",
          effect: expect.objectContaining({ kind: "projectile", id: 8855, hitsRemaining: 0, hasHit: true }),
        }),
      ]),
    );
  });

  it("creates a synthetic imported Helper ProjContactTime any artifact with helper-local any-projectile contact evidence", () => {
    const artifact = createSyntheticImportedHelperProjContactTimeAnyTraceArtifact({ generatedAt: "2026-07-01T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-helper-projcontacttime-any-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-helper-projcontacttime-any-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(evidence?.eventCategories).toContain("guard");
    expect(evidence?.combatReasons).toContain("guard");
    expect(evidence?.worldLifecycleEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "spawn", kind: "projectile", ownerId: "p1", parentId: "p1-helper-0" }),
        expect.objectContaining({ type: "active", kind: "projectile", ownerId: "p1", parentId: "p1-helper-0" }),
      ]),
    );
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1264, animNo: 992 }),
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1265, animNo: 993 }),
        expect.objectContaining({ source: "effect", actorKind: "projectile", ownerId: "p1", animNo: 994 }),
      ]),
    );
    expect(gate?.requirements.requiredEffectPayloads).toEqual([
      { kind: "helper", ownerId: "p1", effectId: 42, name: "Buddy", helperStateNo: 1265, minAge: 2 },
      {
        actorId: "p1-projectile-0",
        kind: "projectile",
        ownerId: "p1",
        parentId: "p1-helper-0",
        effectId: 8866,
        minAge: 1,
        minPriority: 2,
        maxHitsRemaining: 0,
        hasHit: true,
      },
    ]);
    expect(gate?.requirements.requiredTargetLinks).toEqual([{ ownerId: "p1", actorId: "p2", targetId: 8866 }]);
    expect(evidence?.targetLinks).toEqual(
      expect.arrayContaining([expect.objectContaining({ ownerId: "p1", actorId: "p2", targetId: 8866 })]),
    );
    expect(evidence?.contactEffectPackages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1",
          source: "imported",
          actorKind: "player",
          contactKind: "guard",
          sound: expect.objectContaining({ type: "PlaySnd", group: 6, index: 13, contactKind: "guard" }),
          hitEffect: expect.objectContaining({
            kind: "guard",
            sparkNo: 7020,
            raw: "F7020",
            rawPrefix: "F",
            assetSource: "fightfx",
            assetActionId: 7020,
            assetFrameCount: 2,
            assetTotalDuration: 11,
            offset: { x: 17, y: -58 },
          }),
        }),
      ]),
    );
    expect(evidence?.effectPayloads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1-projectile-0",
          parentId: "p1-helper-0",
          effect: expect.objectContaining({ kind: "projectile", id: 8866, hitsRemaining: 0, hasHit: true }),
        }),
      ]),
    );
  });

  it("creates a synthetic imported Helper HitDef artifact with helper-owned direct combat evidence", () => {
    const artifact = createSyntheticImportedHelperHitDefTraceArtifact({ generatedAt: "2026-06-30T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-helper-hitdef-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-helper-hitdef-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(evidence?.eventCategories).toContain("hit");
    expect(evidence?.combatReasons).toContain("hit");
    expect(evidence?.worldLifecycleEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "spawn", kind: "helper", ownerId: "p1", parentId: "p1" }),
        expect.objectContaining({ type: "active", kind: "helper", ownerId: "p1", parentId: "p1" }),
      ]),
    );
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1200, animNo: 920 }),
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1222, animNo: 952 }),
      ]),
    );
    expect(evidence?.finalActors).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "p2", actorKind: "player", life: 971 })]),
    );
    expect(gate?.requirements.requiredEffectPayloads).toEqual([
      { actorId: "p1-helper-0", kind: "helper", ownerId: "p1", effectId: 42, name: "Buddy", helperStateNo: 1222, minAge: 2 },
    ]);
    expect(evidence?.soundEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1-helper-0",
          source: "effect",
          actorKind: "helper",
          type: "PlaySnd",
          group: 5,
          index: 0,
          contactKind: "hit",
        }),
      ]),
    );
    expect(evidence?.hitEffectEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1-helper-0",
          source: "effect",
          actorKind: "helper",
          kind: "hit",
          sparkNo: 7006,
          raw: "F7006",
          rawPrefix: "F",
          assetSource: "fightfx",
          assetActionId: 7006,
          assetFrameCount: 2,
          assetTotalDuration: 11,
          offset: { x: 9, y: -58 },
        }),
      ]),
    );
    expect(evidence?.contactEffectPackages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1-helper-0",
          source: "effect",
          actorKind: "helper",
          contactKind: "hit",
          sound: expect.objectContaining({ type: "PlaySnd", group: 5, index: 0, contactKind: "hit" }),
          hitEffect: expect.objectContaining({
            kind: "hit",
            sparkNo: 7006,
            raw: "F7006",
            rawPrefix: "F",
            assetSource: "fightfx",
            assetActionId: 7006,
            assetFrameCount: 2,
            assetTotalDuration: 11,
            offset: { x: 9, y: -58 },
          }),
        }),
      ]),
    );
    expect(gate?.requirements.requiredContactEffectPackages).toEqual([
      expect.objectContaining({
        actorId: "p1-helper-0",
        contactKind: "hit",
        hitEffect: expect.objectContaining({ kind: "hit", sparkNo: 7006, offsetX: 9, offsetY: -58 }),
      }),
    ]);
  });

  it("creates a synthetic imported Helper Target artifact with helper-owned target redirect evidence", () => {
    const artifact = createSyntheticImportedHelperTargetTraceArtifact({ generatedAt: "2026-06-30T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-helper-target-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-helper-target-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(evidence?.eventCategories).toContain("hit");
    expect(evidence?.combatReasons).toContain("hit");
    expect(evidence?.targetLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ownerId: "p1-helper-0",
          actorId: "p2",
          targetId: 8877,
          hasBinding: false,
        }),
      ]),
    );
    expect(gate?.requirements.requiredTargetLinks).toEqual([
      { ownerId: "p1-helper-0", actorId: "p2", targetId: 8877, hasBinding: false, minFrames: 1 },
    ]);
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1200, animNo: 920 }),
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1223, animNo: 953 }),
      ]),
    );
    expect(evidence?.finalActors).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "p2", actorKind: "player", life: 969 })]),
    );
    expect(gate?.requirements.requiredEffectPayloads).toEqual([
      { actorId: "p1-helper-0", kind: "helper", ownerId: "p1", effectId: 42, name: "Buddy", helperStateNo: 1223, minAge: 2 },
    ]);
    expect(evidence?.soundEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1-helper-0",
          source: "effect",
          actorKind: "helper",
          type: "PlaySnd",
          group: 5,
          index: 1,
          contactKind: "hit",
        }),
      ]),
    );
    expect(evidence?.hitEffectEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1-helper-0",
          source: "effect",
          actorKind: "helper",
          kind: "hit",
          sparkNo: 7007,
          raw: "F7007",
          rawPrefix: "F",
          assetSource: "fightfx",
          assetActionId: 7007,
          assetFrameCount: 2,
          assetTotalDuration: 11,
          offset: { x: 11, y: -56 },
        }),
      ]),
    );
    expect(evidence?.contactEffectPackages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1-helper-0",
          source: "effect",
          actorKind: "helper",
          contactKind: "hit",
          sound: expect.objectContaining({ type: "PlaySnd", group: 5, index: 1, contactKind: "hit" }),
          hitEffect: expect.objectContaining({
            kind: "hit",
            sparkNo: 7007,
            raw: "F7007",
            rawPrefix: "F",
            assetSource: "fightfx",
            assetActionId: 7007,
            assetFrameCount: 2,
            assetTotalDuration: 11,
            offset: { x: 11, y: -56 },
          }),
        }),
      ]),
    );
    expect(gate?.requirements.requiredContactEffectPackages).toEqual([
      expect.objectContaining({
        actorId: "p1-helper-0",
        contactKind: "hit",
        hitEffect: expect.objectContaining({ kind: "hit", sparkNo: 7007, offsetX: 11, offsetY: -56 }),
      }),
    ]);
  });

  it("creates a synthetic imported Helper default Target artifact with target id 0 evidence", () => {
    const artifact = createSyntheticImportedHelperDefaultTargetTraceArtifact({ generatedAt: "2026-06-30T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-helper-default-target-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-helper-default-target-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(gate?.requirements.requiredTargetLinks).toEqual([
      { ownerId: "p1-helper-0", actorId: "p2", targetId: 0, hasBinding: false, minFrames: 1 },
    ]);
    expect(evidence?.targetLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ownerId: "p1-helper-0",
          actorId: "p2",
          targetId: 0,
          hasBinding: false,
        }),
      ]),
    );
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1200, animNo: 920 }),
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1229, animNo: 961 }),
      ]),
    );
    expect(evidence?.finalActors).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "p2", actorKind: "player", life: 967 })]),
    );
    expect(evidence?.contactEffectPackages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1-helper-0",
          source: "effect",
          actorKind: "helper",
          contactKind: "hit",
          sound: expect.objectContaining({ type: "PlaySnd", group: 5, index: 4, contactKind: "hit" }),
          hitEffect: expect.objectContaining({
            kind: "hit",
            sparkNo: 7010,
            raw: "F7010",
            rawPrefix: "F",
            assetSource: "fightfx",
            assetActionId: 7010,
            assetFrameCount: 2,
            assetTotalDuration: 11,
            offset: { x: 13, y: -54 },
          }),
        }),
      ]),
    );
  });

  it("creates a synthetic imported Helper bare Target artifact with helper-owned target redirect evidence", () => {
    const artifact = createSyntheticImportedHelperBareTargetTraceArtifact({ generatedAt: "2026-06-30T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-helper-bare-target-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-helper-bare-target-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(gate?.requirements.requiredTargetLinks).toEqual([
      { ownerId: "p1-helper-0", actorId: "p2", targetId: 8878, hasBinding: false, minFrames: 1 },
    ]);
    expect(evidence?.targetLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ownerId: "p1-helper-0",
          actorId: "p2",
          targetId: 8878,
          hasBinding: false,
        }),
      ]),
    );
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1200, animNo: 920 }),
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1230, animNo: 962 }),
      ]),
    );
    expect(evidence?.finalActors).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "p2", actorKind: "player", life: 965 })]),
    );
    expect(evidence?.soundEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1-helper-0",
          source: "effect",
          actorKind: "helper",
          type: "PlaySnd",
          group: 5,
          index: 5,
          contactKind: "hit",
        }),
      ]),
    );
    expect(evidence?.hitEffectEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1-helper-0",
          source: "effect",
          actorKind: "helper",
          kind: "hit",
          sparkNo: 7011,
          raw: "F7011",
          rawPrefix: "F",
          assetSource: "fightfx",
          assetActionId: 7011,
          assetFrameCount: 2,
          assetTotalDuration: 11,
          offset: { x: 14, y: -53 },
        }),
      ]),
    );
    expect(evidence?.contactEffectPackages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1-helper-0",
          source: "effect",
          actorKind: "helper",
          contactKind: "hit",
          sound: expect.objectContaining({ type: "PlaySnd", group: 5, index: 5, contactKind: "hit" }),
          hitEffect: expect.objectContaining({
            kind: "hit",
            sparkNo: 7011,
            raw: "F7011",
            rawPrefix: "F",
            assetSource: "fightfx",
            assetActionId: 7011,
            assetFrameCount: 2,
            assetTotalDuration: 11,
            offset: { x: 14, y: -53 },
          }),
        }),
      ]),
    );
    expect(gate?.requirements.requiredEffectPayloads).toEqual([
      { actorId: "p1-helper-0", kind: "helper", ownerId: "p1", effectId: 42, name: "Buddy", helperStateNo: 1230, minAge: 2 },
    ]);
  });

  it("creates a synthetic imported Helper Target controllers artifact with helper-owned mutation evidence", () => {
    const artifact = createSyntheticImportedHelperTargetControllersTraceArtifact({ generatedAt: "2026-06-30T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-helper-target-controllers-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-helper-target-controllers-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(gate?.requirements.requiredTargetLinks).toEqual([
      { ownerId: "p1-helper-0", actorId: "p2", targetId: 8879, hasBinding: false, minFrames: 1 },
      {
        ownerId: "p1-helper-0",
        actorId: "p2",
        targetId: 8879,
        hasBinding: true,
        minFrames: 1,
        minAge: 1,
        minBindingRemaining: 1,
        maxBindingRemaining: 3,
        bindingOffsetX: 36,
        bindingOffsetY: -12,
      },
    ]);
    expect(evidence?.targetLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ownerId: "p1-helper-0", actorId: "p2", targetId: 8879, hasBinding: false }),
        expect.objectContaining({
          ownerId: "p1-helper-0",
          actorId: "p2",
          targetId: 8879,
          hasBinding: true,
          bindingOffset: { x: 36, y: -12 },
        }),
      ]),
    );
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1200, animNo: 920 }),
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1231, animNo: 963 }),
        expect.objectContaining({ actorId: "p2", actorKind: "player", facing: 1 }),
      ]),
    );
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      actorKind: "player",
      life: 944,
      power: 40,
    });
    expect(gate?.requirements.requiredEffectPayloads).toEqual([
      {
        actorId: "p1-helper-0",
        kind: "helper",
        ownerId: "p1",
        effectId: 42,
        name: "Buddy",
        helperStateNo: 1231,
        targetCount: 0,
        minAge: 3,
      },
    ]);
    expect(evidence?.effectPayloads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1-helper-0",
          actorKind: "helper",
          effect: expect.objectContaining({ kind: "helper", stateNo: 1231, targetCount: 0 }),
        }),
      ]),
    );
    expect(evidence?.contactEffectPackages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1-helper-0",
          source: "effect",
          actorKind: "helper",
          contactKind: "hit",
          sound: expect.objectContaining({ type: "PlaySnd", group: 5, index: 6, contactKind: "hit" }),
          hitEffect: expect.objectContaining({
            kind: "hit",
            sparkNo: 7012,
            raw: "F7012",
            rawPrefix: "F",
            assetSource: "fightfx",
            assetActionId: 7012,
            assetFrameCount: 2,
            assetTotalDuration: 11,
            offset: { x: 16, y: -52 },
          }),
        }),
      ]),
    );
  });

  it("creates a synthetic imported Helper TargetState artifact with owner-backed custom-state evidence", () => {
    const artifact = createSyntheticImportedHelperTargetStateTraceArtifact({ generatedAt: "2026-06-30T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-helper-targetstate-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-helper-targetstate-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 888, 889]));
    expect(evidence?.executedControllers.HitDef).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.Helper).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.SelfState).toBeGreaterThanOrEqual(1);
    expect(evidence?.targetLinks).toEqual(
      expect.arrayContaining([expect.objectContaining({ ownerId: "p1-helper-0", actorId: "p2", targetId: 8880 })]),
    );
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1200, animNo: 920 }),
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1232, animNo: 964 }),
        expect.objectContaining({ actorId: "p2", customOwnerId: "p1", animNo: 888, moveType: "H" }),
        expect.objectContaining({ actorId: "p2", customOwnerId: "p1", animNo: 889, moveType: "H" }),
      ]),
    );
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      customOwnerId: undefined,
      stateNo: 0,
      ctrl: true,
      moveType: "I",
    });
    expect(gate?.requirements.requiredEffectPayloads).toEqual([
      {
        actorId: "p1-helper-0",
        kind: "helper",
        ownerId: "p1",
        effectId: 42,
        name: "Buddy",
        helperStateNo: 1232,
        targetCount: 1,
        minAge: 3,
      },
    ]);
  });

  it("creates a synthetic imported Helper NumExplod artifact with helper-local count evidence", () => {
    const artifact = createSyntheticImportedHelperNumExplodTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-helper-numexplod-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-helper-numexplod-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(evidence?.worldLifecycleEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "spawn", kind: "explod", ownerId: "p1", parentId: "p1-helper-0" }),
        expect.objectContaining({ type: "active", kind: "explod", ownerId: "p1", parentId: "p1-helper-0" }),
      ]),
    );
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1210, animNo: 930 }),
        expect.objectContaining({ source: "effect", actorKind: "explod", ownerId: "p1", animNo: 942 }),
      ]),
    );
    expect(gate?.requirements.requiredEffectPayloads).toEqual([
      { kind: "helper", ownerId: "p1", effectId: 42, name: "Buddy", helperStateNo: 1210, minAge: 1 },
      { actorId: "p1-explod-0", kind: "explod", ownerId: "p1", effectId: 8830, minAge: 1 },
    ]);
  });

  it("creates a synthetic imported Helper NumHelper artifact with helper-local count evidence", () => {
    const artifact = createSyntheticImportedHelperNumHelperTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-helper-numhelper-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-helper-numhelper-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(evidence?.worldLifecycleEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "spawn", kind: "helper", ownerId: "p1", parentId: "p1" }),
        expect.objectContaining({ type: "active", kind: "helper", ownerId: "p1", parentId: "p1" }),
      ]),
    );
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1211, animNo: 931 }),
      ]),
    );
    expect(gate?.requirements.requiredEffectPayloads).toEqual([
      { kind: "helper", ownerId: "p1", effectId: 42, name: "Buddy", helperStateNo: 1211, minAge: 1 },
    ]);
  });

  it("creates a synthetic imported Helper NumProj artifact with helper-local projectile count evidence", () => {
    const artifact = createSyntheticImportedHelperNumProjTraceArtifact({ generatedAt: "2026-06-30T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-helper-numproj-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-helper-numproj-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(evidence?.worldLifecycleEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "spawn", kind: "projectile", ownerId: "p1", parentId: "p1-helper-0" }),
        expect.objectContaining({ type: "active", kind: "projectile", ownerId: "p1", parentId: "p1-helper-0" }),
      ]),
    );
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1213, animNo: 933 }),
        expect.objectContaining({ source: "effect", actorKind: "projectile", ownerId: "p1", animNo: 944 }),
      ]),
    );
    expect(gate?.requirements.requiredEffectPayloads).toEqual([
      { kind: "helper", ownerId: "p1", effectId: 42, name: "Buddy", helperStateNo: 1213, minAge: 1 },
      { actorId: "p1-projectile-0", kind: "projectile", ownerId: "p1", effectId: 8851, minAge: 1, minPriority: 2 },
    ]);
  });

  it("creates a synthetic imported Helper BindToParent artifact with helper-local owner bind evidence", () => {
    const artifact = createSyntheticImportedHelperBindToParentTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-helper-bindtoparent-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-helper-bindtoparent-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "effect",
          actorKind: "helper",
          ownerId: "p1",
          stateNo: 1203,
          animNo: 923,
        }),
      ]),
    );
    expect(gate?.requirements.requiredActorFrames).toEqual([
      {
        source: "effect",
        actorKind: "helper",
        ownerId: "p1",
        stateNo: 1203,
        animNo: 923,
        observedPosYAtLeast: -24,
        observedPosYAtMost: -12,
        minFrames: 1,
      },
    ]);
    expect(gate?.requirements.requiredEffectPayloads).toEqual([
      {
        kind: "helper",
        ownerId: "p1",
        effectId: 42,
        name: "Buddy",
        helperStateNo: 1203,
        minAge: 1,
        ownerBindTarget: "parent",
        ownerBindOffsetX: 40,
        ownerBindOffsetY: -18,
      },
    ]);
    expect(evidence?.effectPayloads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          effect: expect.objectContaining({
            kind: "helper",
            ownerBind: expect.objectContaining({ target: "parent", offset: { x: 40, y: -18 } }),
          }),
        }),
      ]),
    );
  });

  it("creates a synthetic imported Helper BindToRoot artifact with helper-local owner bind evidence", () => {
    const artifact = createSyntheticImportedHelperBindToRootTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-helper-bindtoroot-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-helper-bindtoroot-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "effect",
          actorKind: "helper",
          ownerId: "p1",
          stateNo: 1204,
          animNo: 924,
        }),
      ]),
    );
    expect(gate?.requirements.requiredActorFrames).toEqual([
      {
        source: "effect",
        actorKind: "helper",
        ownerId: "p1",
        stateNo: 1204,
        animNo: 924,
        observedPosYAtLeast: -22,
        observedPosYAtMost: -10,
        minFrames: 1,
      },
    ]);
    expect(gate?.requirements.requiredEffectPayloads).toEqual([
      {
        kind: "helper",
        ownerId: "p1",
        effectId: 42,
        name: "Buddy",
        helperStateNo: 1204,
        minAge: 1,
        ownerBindTarget: "root",
        ownerBindOffsetX: -36,
        ownerBindOffsetY: -16,
      },
    ]);
    expect(evidence?.effectPayloads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          effect: expect.objectContaining({
            kind: "helper",
            ownerBind: expect.objectContaining({ target: "root", offset: { x: -36, y: -16 } }),
          }),
        }),
      ]),
    );
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

  it("creates a synthetic imported HitBy allow artifact with accepted hit evidence", () => {
    const artifact = createSyntheticImportedHitByAllowTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-hitby-allow-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-hitby-allow-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    expect(artifact.gates[0]?.requirements.requiredExecutedControllers).toEqual(["ChangeState", "HitDef", "HitBy"]);
    expect(artifact.gates[0]?.requirements.requiredExecutedOperations).toEqual(["hitdef", "eligibility:hitby"]);
    expect(artifact.gates[0]?.requirements.requiredFinalActors).toEqual([
      {
        actorId: "p2",
        source: "imported",
        actorKind: "player",
        life: 963,
        moveType: "H",
      },
    ]);
    expect(artifact.gates[0]?.evidence.executedControllers.HitBy).toBeGreaterThanOrEqual(1);
    expect(artifact.gates[0]?.evidence.executedOperations["eligibility:hitby"]).toBeGreaterThanOrEqual(1);
    expect(artifact.gates[0]?.evidence.eventCategories).toContain("hit");
    expect(artifact.gates[0]?.evidence.combatReasons).toContain("hit");
    expect(artifact.trace.events.some((event) => event.category === "reject")).toBe(false);
  });

  it("creates a synthetic imported HitBy reject artifact with mismatched attr evidence", () => {
    const artifact = createSyntheticImportedHitByRejectTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-hitby-reject-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-hitby-reject-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    expect(artifact.gates[0]?.requirements.requiredExecutedControllers).toEqual(["ChangeState", "HitDef", "HitBy"]);
    expect(artifact.gates[0]?.requirements.requiredExecutedOperations).toEqual(["hitdef", "eligibility:hitby"]);
    expect(artifact.gates[0]?.requirements.requiredFinalActors).toEqual([
      {
        actorId: "p2",
        source: "imported",
        actorKind: "player",
        life: 1000,
        moveType: "I",
      },
    ]);
    expect(artifact.gates[0]?.evidence.executedControllers.HitBy).toBeGreaterThanOrEqual(1);
    expect(artifact.gates[0]?.evidence.executedOperations["eligibility:hitby"]).toBeGreaterThanOrEqual(1);
    expect(artifact.gates[0]?.evidence.eventCategories).toContain("reject");
    expect(artifact.gates[0]?.evidence.combatReasons).toContain("reject");
    expect(artifact.trace.events.some((event) => event.category === "hit")).toBe(false);
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
    expect(evidence?.executedOperations.envshake).toBeGreaterThanOrEqual(1);
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

  it("creates a synthetic imported HitDef guard-sound artifact", () => {
    const artifact = createSyntheticImportedHitDefGuardSoundTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-hitdef-guard-sound-golden",
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
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toContain("guard");
    expect(evidence?.soundEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1",
          source: "imported",
          actorKind: "player",
          type: "PlaySnd",
          group: 6,
          index: 0,
          stateNo: 200,
        }),
      ]),
    );
  });

  it("creates a synthetic imported HitDef hit-sound artifact", () => {
    const artifact = createSyntheticImportedHitDefHitSoundTraceArtifact({ generatedAt: "2026-06-28T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-hitdef-hit-sound-golden",
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
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toContain("hit");
    expect(evidence?.soundEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1",
          source: "imported",
          actorKind: "player",
          type: "PlaySnd",
          group: 5,
          index: 0,
          stateNo: 200,
        }),
      ]),
    );
  });

  it("creates a synthetic imported HitDef hit-spark artifact", () => {
    const artifact = createSyntheticImportedHitDefHitSparkTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-hitdef-hit-spark-golden",
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
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toContain("hit");
    expect(evidence?.hitEffectEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1",
          source: "imported",
          actorKind: "player",
          kind: "hit",
          sparkNo: 7001,
          raw: "S7001",
          rawPrefix: "S",
          offset: { x: 10, y: -72 },
          stateNo: 200,
        }),
      ]),
    );
    expect(artifact.gates[0]?.requirements.requiredHitEffectEvents).toEqual([
      expect.objectContaining({
        kind: "hit",
        raw: "S7001",
        offsetX: 10,
        offsetY: -72,
      }),
    ]);
  });

  it("creates a synthetic imported HitDef data-spark fallback artifact", () => {
    const artifact = createSyntheticImportedHitDefDataSparkTraceArtifact({ generatedAt: "2026-07-01T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-hitdef-data-spark-golden",
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
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toContain("hit");
    expect(evidence?.hitEffectEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1",
          source: "imported",
          actorKind: "player",
          kind: "hit",
          sparkNo: 2,
          raw: "2",
          rawPrefix: undefined,
          offset: { x: -8, y: -54 },
          stateNo: 200,
        }),
      ]),
    );
    expect(artifact.gates[0]?.requirements.requiredHitEffectEvents).toEqual([
      expect.objectContaining({
        kind: "hit",
        raw: "2",
        offsetX: -8,
        offsetY: -54,
      }),
    ]);
  });

  it("creates a synthetic imported HitDef common-spark artifact with asset-frame evidence", () => {
    const artifact = createSyntheticImportedHitDefCommonSparkTraceArtifact({ generatedAt: "2026-06-29T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-hitdef-common-spark-golden",
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
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(evidence?.hitEffectEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1",
          source: "imported",
          actorKind: "player",
          kind: "hit",
          sparkNo: 7001,
          raw: "7001",
          rawPrefix: undefined,
          assetSource: "common",
          assetActionId: 7001,
          assetFrameIndex: 0,
          assetFrameOffsetX: 3,
          assetFrameOffsetY: -4,
          assetFrameDuration: 5,
          assetSpriteGroup: 7101,
          assetSpriteIndex: 0,
          assetFrameCount: 2,
          assetTotalDuration: 11,
          assetFrameIndices: [0, 1],
          offset: { x: 16, y: -66 },
          stateNo: 200,
        }),
      ]),
    );
    expect(artifact.gates[0]?.requirements.requiredHitEffectEvents).toEqual([
      expect.objectContaining({
        assetSource: "common",
        assetFrameOffsetX: 3,
        assetFrameOffsetY: -4,
        assetFrameDuration: 5,
        offsetX: 16,
        offsetY: -66,
        minAssetFrameCount: 2,
        minAssetTotalDuration: 11,
        requiredAssetFrameIndices: [0, 1],
      }),
    ]);
  });

  it("creates a synthetic imported HitDef FightFX-spark artifact with asset-frame evidence", () => {
    const artifact = createSyntheticImportedHitDefFightFxSparkTraceArtifact({ generatedAt: "2026-06-29T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-hitdef-fightfx-spark-golden",
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
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(evidence?.hitEffectEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1",
          source: "imported",
          actorKind: "player",
          kind: "hit",
          sparkNo: 7002,
          raw: "F7002",
          rawPrefix: "F",
          assetSource: "fightfx",
          assetActionId: 7002,
          assetFrameIndex: 0,
          assetFrameOffsetX: 3,
          assetFrameOffsetY: -4,
          assetFrameDuration: 5,
          assetSpriteGroup: 8102,
          assetSpriteIndex: 0,
          assetFrameCount: 2,
          assetTotalDuration: 11,
          assetFrameIndices: [0, 1],
          offset: { x: 18, y: -68 },
          stateNo: 200,
        }),
      ]),
    );
    expect(artifact.gates[0]?.requirements.requiredHitEffectEvents).toEqual([
      expect.objectContaining({
        assetSource: "fightfx",
        assetFrameOffsetX: 3,
        assetFrameOffsetY: -4,
        assetFrameDuration: 5,
        offsetX: 18,
        offsetY: -68,
        minAssetFrameCount: 2,
        minAssetTotalDuration: 11,
        requiredAssetFrameIndices: [0, 1],
      }),
    ]);
  });

  it("creates a synthetic imported HitDef hit-effect package artifact with sound and FightFX spark evidence", () => {
    const artifact = createSyntheticImportedHitDefHitEffectPackageTraceArtifact({ generatedAt: "2026-06-29T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-hitdef-hit-effect-package-golden",
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
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toContain("hit");
    expect(evidence?.soundEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1",
          source: "imported",
          actorKind: "player",
          type: "PlaySnd",
          group: 5,
          index: 0,
          stateNo: 200,
        }),
      ]),
    );
    expect(evidence?.hitEffectEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1",
          source: "imported",
          actorKind: "player",
          kind: "hit",
          sparkNo: 7002,
          raw: "F7002",
          rawPrefix: "F",
          assetSource: "fightfx",
          assetActionId: 7002,
          assetFrameIndex: 0,
          assetFrameOffsetX: 3,
          assetFrameOffsetY: -4,
          assetFrameDuration: 5,
          assetSpriteGroup: 8102,
          assetSpriteIndex: 0,
          assetFrameCount: 2,
          assetTotalDuration: 11,
          assetFrameIndices: [0, 1],
          offset: { x: 18, y: -68 },
          stateNo: 200,
        }),
      ]),
    );
    const contactPackage = evidence?.contactEffectPackages.find((entry) => entry.contactKind === "hit");
    expect(contactPackage).toMatchObject({
      actorId: "p1",
      source: "imported",
      actorKind: "player",
      contactKind: "hit",
      sound: expect.objectContaining({ type: "PlaySnd", group: 5, index: 0, contactKind: "hit" }),
      hitEffect: expect.objectContaining({
        kind: "hit",
        sparkNo: 7002,
        assetSource: "fightfx",
        offset: { x: 18, y: -68 },
        contactKind: "hit",
      }),
    });
    expect(contactPackage?.contactId).toBe(contactPackage?.sound.contactId);
    expect(contactPackage?.contactId).toBe(contactPackage?.hitEffect.contactId);
    expect(contactPackage?.contactTick).toBe(contactPackage?.sound.contactTick);
    expect(contactPackage?.contactTick).toBe(contactPackage?.hitEffect.contactTick);
    expect(artifact.gates[0]?.requirements.requiredSoundEvents).toEqual([
      expect.objectContaining({
        type: "PlaySnd",
        group: 5,
        index: 0,
      }),
    ]);
    expect(artifact.gates[0]?.requirements.requiredHitEffectEvents).toEqual([
      expect.objectContaining({
        kind: "hit",
        assetSource: "fightfx",
        offsetX: 18,
        offsetY: -68,
        minAssetFrameCount: 2,
        minAssetTotalDuration: 11,
        requiredAssetFrameIndices: [0, 1],
      }),
    ]);
    expect(artifact.gates[0]?.requirements.requiredContactEffectPackages).toEqual([
      expect.objectContaining({
        actorId: "p1",
        source: "imported",
        actorKind: "player",
        contactKind: "hit",
        sound: expect.objectContaining({ type: "PlaySnd", group: 5, index: 0, requireContactId: true }),
        hitEffect: expect.objectContaining({
          kind: "hit",
          sparkNo: 7002,
          assetSource: "fightfx",
          offsetX: 18,
          offsetY: -68,
          requiredAssetFrameIndices: [0, 1],
          requireContactId: true,
        }),
      }),
    ]);
  });

  it("creates a synthetic imported HitDef guard-spark artifact", () => {
    const artifact = createSyntheticImportedHitDefGuardSparkTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-hitdef-guard-spark-golden",
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
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toContain("guard");
    expect(evidence?.hitEffectEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1",
          source: "imported",
          actorKind: "player",
          kind: "guard",
          sparkNo: 7000,
          raw: "S7000",
          rawPrefix: "S",
          offset: { x: 12, y: -64 },
          stateNo: 200,
        }),
      ]),
    );
    expect(artifact.gates[0]?.requirements.requiredHitEffectEvents).toEqual([
      expect.objectContaining({
        kind: "guard",
        raw: "S7000",
        offsetX: 12,
        offsetY: -64,
      }),
    ]);
  });

  it("creates a synthetic imported HitDef data guard-spark fallback artifact", () => {
    const artifact = createSyntheticImportedHitDefDataGuardSparkTraceArtifact({ generatedAt: "2026-07-01T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-hitdef-data-guard-spark-golden",
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
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toContain("guard");
    expect(evidence?.hitEffectEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1",
          source: "imported",
          actorKind: "player",
          kind: "guard",
          sparkNo: 40,
          raw: "40",
          rawPrefix: undefined,
          offset: { x: 13, y: -57 },
          stateNo: 200,
        }),
      ]),
    );
    expect(artifact.gates[0]?.requirements.requiredHitEffectEvents).toEqual([
      expect.objectContaining({
        kind: "guard",
        raw: "40",
        offsetX: 13,
        offsetY: -57,
      }),
    ]);
  });

  it("creates a synthetic imported HitDef common guard-spark artifact with asset-frame evidence", () => {
    const artifact = createSyntheticImportedHitDefCommonGuardSparkTraceArtifact({ generatedAt: "2026-06-29T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-hitdef-common-guard-spark-golden",
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
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toContain("guard");
    expect(evidence?.hitEffectEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1",
          source: "imported",
          actorKind: "player",
          kind: "guard",
          sparkNo: 7003,
          raw: "7003",
          rawPrefix: undefined,
          assetSource: "common",
          assetActionId: 7003,
          assetFrameIndex: 0,
          assetFrameOffsetX: 3,
          assetFrameOffsetY: -4,
          assetFrameDuration: 5,
          assetSpriteGroup: 7103,
          assetSpriteIndex: 0,
          assetFrameCount: 2,
          assetTotalDuration: 11,
          assetFrameIndices: [0, 1],
          offset: { x: 14, y: -62 },
          stateNo: 200,
        }),
      ]),
    );
    expect(artifact.gates[0]?.requirements.requiredHitEffectEvents).toEqual([
      expect.objectContaining({
        kind: "guard",
        assetSource: "common",
        assetFrameOffsetX: 3,
        assetFrameOffsetY: -4,
        assetFrameDuration: 5,
        offsetX: 14,
        offsetY: -62,
        minAssetFrameCount: 2,
        minAssetTotalDuration: 11,
        requiredAssetFrameIndices: [0, 1],
      }),
    ]);
  });

  it("creates a synthetic imported HitDef FightFX guard-spark artifact with asset-frame evidence", () => {
    const artifact = createSyntheticImportedHitDefFightFxGuardSparkTraceArtifact({ generatedAt: "2026-06-29T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-hitdef-fightfx-guard-spark-golden",
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
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toContain("guard");
    expect(evidence?.hitEffectEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1",
          source: "imported",
          actorKind: "player",
          kind: "guard",
          sparkNo: 7004,
          raw: "F7004",
          rawPrefix: "F",
          assetSource: "fightfx",
          assetActionId: 7004,
          assetFrameIndex: 0,
          assetFrameOffsetX: 3,
          assetFrameOffsetY: -4,
          assetFrameDuration: 5,
          assetSpriteGroup: 8104,
          assetSpriteIndex: 0,
          assetFrameCount: 2,
          assetTotalDuration: 11,
          assetFrameIndices: [0, 1],
          offset: { x: 15, y: -63 },
          stateNo: 200,
        }),
      ]),
    );
    expect(artifact.gates[0]?.requirements.requiredHitEffectEvents).toEqual([
      expect.objectContaining({
        kind: "guard",
        assetSource: "fightfx",
        assetFrameOffsetX: 3,
        assetFrameOffsetY: -4,
        assetFrameDuration: 5,
        offsetX: 15,
        offsetY: -63,
        minAssetFrameCount: 2,
        minAssetTotalDuration: 11,
        requiredAssetFrameIndices: [0, 1],
      }),
    ]);
  });

  it("creates a synthetic imported HitDef guard-effect package artifact with sound and FightFX spark evidence", () => {
    const artifact = createSyntheticImportedHitDefGuardEffectPackageTraceArtifact({ generatedAt: "2026-06-29T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-hitdef-guard-effect-package-golden",
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
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toContain("guard");
    expect(evidence?.soundEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1",
          source: "imported",
          actorKind: "player",
          type: "PlaySnd",
          group: 6,
          index: 0,
          stateNo: 200,
        }),
      ]),
    );
    expect(evidence?.hitEffectEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1",
          source: "imported",
          actorKind: "player",
          kind: "guard",
          sparkNo: 7004,
          raw: "F7004",
          rawPrefix: "F",
          assetSource: "fightfx",
          assetActionId: 7004,
          assetFrameIndex: 0,
          assetFrameOffsetX: 3,
          assetFrameOffsetY: -4,
          assetFrameDuration: 5,
          assetSpriteGroup: 8104,
          assetSpriteIndex: 0,
          assetFrameCount: 2,
          assetTotalDuration: 11,
          assetFrameIndices: [0, 1],
          offset: { x: 15, y: -63 },
          stateNo: 200,
        }),
      ]),
    );
    const contactPackage = evidence?.contactEffectPackages.find((entry) => entry.contactKind === "guard");
    expect(contactPackage).toMatchObject({
      actorId: "p1",
      source: "imported",
      actorKind: "player",
      contactKind: "guard",
      sound: expect.objectContaining({ type: "PlaySnd", group: 6, index: 0, contactKind: "guard" }),
      hitEffect: expect.objectContaining({
        kind: "guard",
        sparkNo: 7004,
        assetSource: "fightfx",
        offset: { x: 15, y: -63 },
        contactKind: "guard",
      }),
    });
    expect(contactPackage?.contactId).toBe(contactPackage?.sound.contactId);
    expect(contactPackage?.contactId).toBe(contactPackage?.hitEffect.contactId);
    expect(contactPackage?.contactTick).toBe(contactPackage?.sound.contactTick);
    expect(contactPackage?.contactTick).toBe(contactPackage?.hitEffect.contactTick);
    expect(artifact.gates[0]?.requirements.requiredSoundEvents).toEqual([
      expect.objectContaining({
        type: "PlaySnd",
        group: 6,
        index: 0,
      }),
    ]);
    expect(artifact.gates[0]?.requirements.requiredHitEffectEvents).toEqual([
      expect.objectContaining({
        kind: "guard",
        assetSource: "fightfx",
        offsetX: 15,
        offsetY: -63,
        minAssetFrameCount: 2,
        minAssetTotalDuration: 11,
        requiredAssetFrameIndices: [0, 1],
      }),
    ]);
    expect(artifact.gates[0]?.requirements.requiredContactEffectPackages).toEqual([
      expect.objectContaining({
        actorId: "p1",
        source: "imported",
        actorKind: "player",
        contactKind: "guard",
        sound: expect.objectContaining({ type: "PlaySnd", group: 6, index: 0, requireContactId: true }),
        hitEffect: expect.objectContaining({
          kind: "guard",
          sparkNo: 7004,
          assetSource: "fightfx",
          offsetX: 15,
          offsetY: -63,
          requiredAssetFrameIndices: [0, 1],
          requireContactId: true,
        }),
      }),
    ]);
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
    expect(artifact.gates[0]?.requirements.requiredControllerEventSequences).toEqual([
      {
        label: "NoStandGuard defender AssertSpecial before guardable HitDef",
        allowSameTick: true,
        steps: [
          { actorId: "p1", stateNo: 0, controller: "AssertSpecial", name: "Passive AssertSpecial" },
          { actorId: "p2", stateNo: 200, controller: "HitDef" },
        ],
      },
    ]);
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
    expect(artifact.gates[0]?.requirements.requiredControllerEventSequences).toEqual([
      {
        label: "NoCrouchGuard defender AssertSpecial before guardable HitDef",
        allowSameTick: true,
        steps: [
          { actorId: "p1", stateNo: 10, controller: "AssertSpecial", name: "AssertSpecial Control Flags" },
          { actorId: "p2", stateNo: 200, controller: "HitDef" },
        ],
      },
    ]);
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
    expect(artifact.gates[0]?.requirements.requiredControllerEventSequences).toEqual([
      {
        label: "NoAirGuard defender AssertSpecial before guardable HitDef",
        allowSameTick: true,
        steps: [
          { actorId: "p1", stateNo: 40, controller: "AssertSpecial", name: "AssertSpecial Control Flags" },
          { actorId: "p2", stateNo: 200, controller: "HitDef" },
        ],
      },
    ]);
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
    expect(evidence?.executedOperations.assertspecial).toBeGreaterThanOrEqual(1);
    expect(artifact.gates[0]?.requirements.requiredExecutedOperations).toEqual(["assertspecial"]);
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
    expect(artifact.gates[0]?.requirements.requiredControllerEventSequences).toEqual([
      {
        label: "NoKO defender AssertSpecial before lethal HitDef",
        allowSameTick: true,
        steps: [
          { actorId: "p2", stateNo: 0, controller: "AssertSpecial", name: "Passive AssertSpecial" },
          { actorId: "p1", stateNo: 200, controller: "HitDef" },
        ],
      },
    ]);
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
    expect(evidence?.controllerEvents.map((event) => event.controller)).toEqual(
      expect.arrayContaining(["ChangeAnim", "ChangeState", "HitVelSet", "CtrlSet"]),
    );
    expect(evidence?.controllerEvents.map((event) => event.operation).filter(Boolean)).toEqual(
      expect.arrayContaining(["kinematic:hitvelset", "resource:ctrlset"]),
    );
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
    expect(artifact.gates[0]?.requirements.requiredControllerEventSequences).toEqual([
      {
        label: "150/151 named guard-hit controller and typed operation order",
        actorId: "p2",
        allowSameTick: true,
        steps: [
          { stateNo: 150, controller: "ChangeAnim", name: "Guard Shake Anim" },
          { stateNo: 150, controller: "ChangeState", name: "Guard Shake Over" },
          { stateNo: 151, controller: "HitVelSet", name: "Apply Guard Velocity" },
          { stateNo: 151, operation: "kinematic:hitvelset" },
          { stateNo: 151, controller: "CtrlSet", name: "Regain Guard Control" },
          { stateNo: 151, operation: "resource:ctrlset" },
          { stateNo: 151, controller: "ChangeState", name: "Guard Hit Over" },
        ],
      },
    ]);
    expect(artifact.gates[0]?.requirements.requiredActorFrames).toEqual(syntheticStandGuardHitPhysicsFrames());
  });

  it("creates a synthetic imported GetHitVar guard timing artifact with branch evidence", () => {
    const artifact = createSyntheticImportedGetHitVarGuardTimingTraceArtifact({ generatedAt: "2026-07-01T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-gethitvar-guard-timing-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-gethitvar-guard-timing-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([150, 151, 308]));
    expect(evidence?.executedControllers.HitVelSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["kinematic:hitvelset"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ actorId: "p2", source: "imported", actorKind: "player", stateNo: 308, animNo: 308 }),
      ]),
    );
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      source: "imported",
      ctrl: true,
    });
    expect(artifact.gates[0]?.requirements.requiredActorFrames).toEqual([
      syntheticStandGuardHitPhysicsFrames()[0],
      {
        actorId: "p2",
        source: "imported",
        actorKind: "player",
        stateNo: 151,
        animNo: 150,
        stateType: "S",
        moveType: "H",
        physics: "S",
        minFrames: 2,
        observedPosYAtLeast: 0,
        observedPosYAtMost: 0,
        bodyWidthFront: 39,
        bodyWidthBack: 39,
        playerPush: true,
      },
      {
        actorId: "p2",
        source: "imported",
        actorKind: "player",
        stateNo: 308,
        animNo: 308,
        stateType: "S",
        moveType: "I",
        physics: "S",
        minFrames: 1,
      },
    ]);
  });

  it("creates a synthetic imported GetHitVar guard hitshaketime artifact with branch evidence", () => {
    const artifact = createSyntheticImportedGetHitVarGuardHitShakeTimeTraceArtifact({
      generatedAt: "2026-07-01T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-gethitvar-guard-hitshaketime-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-gethitvar-guard-hitshaketime-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([150, 151, 311]));
    expect(evidence?.executedControllers.HitVelSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["kinematic:hitvelset"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ actorId: "p2", source: "imported", actorKind: "player", stateNo: 311, animNo: 311 }),
      ]),
    );
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      source: "imported",
      ctrl: true,
    });
    expect(artifact.gates[0]?.requirements.requiredControllerEventSequences).toEqual([
      {
        label: "150/151 guard GetHitVar(hitshaketime) branch order",
        actorId: "p2",
        allowSameTick: true,
        steps: [
          { stateNo: 150, controller: "ChangeAnim", name: "Guard Shake Anim" },
          { stateNo: 150, controller: "ChangeState", name: "Guard Shake Over" },
          { stateNo: 151, controller: "HitVelSet", name: "Apply Guard Velocity" },
          { stateNo: 151, operation: "kinematic:hitvelset" },
          { stateNo: 151, controller: "ChangeState", name: "Guarded HitVar Branch" },
        ],
      },
    ]);
  });

  it("creates a synthetic imported GetHitVar crouch guard hitshaketime artifact with branch evidence", () => {
    const artifact = createSyntheticImportedGetHitVarCrouchGuardHitShakeTimeTraceArtifact({
      generatedAt: "2026-07-01T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-gethitvar-crouch-guard-hitshaketime-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-gethitvar-crouch-guard-hitshaketime-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.activeCommands).toEqual(expect.arrayContaining(["holddown", "x"]));
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([152, 153, 314]));
    expect(evidence?.executedControllers.HitVelSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["kinematic:hitvelset"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toContain("guard");
    expect(evidence?.combatReasons).toContain("guard");
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ actorId: "p2", source: "imported", actorKind: "player", stateNo: 314, animNo: 314 }),
      ]),
    );
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      source: "imported",
      ctrl: true,
    });
    expect(artifact.gates[0]?.requirements.requiredControllerEventSequences).toEqual([
      {
        label: "152/153 crouch guard GetHitVar(hitshaketime) branch order",
        actorId: "p2",
        allowSameTick: true,
        steps: [
          { stateNo: 152, controller: "ChangeAnim", name: "Guard Shake Anim" },
          { stateNo: 152, controller: "ChangeState", name: "Guard Shake Over" },
          { stateNo: 153, controller: "HitVelSet", name: "Apply Crouch Guard Velocity" },
          { stateNo: 153, operation: "kinematic:hitvelset" },
          { stateNo: 153, controller: "ChangeState", name: "Crouch Guarded HitVar Branch" },
        ],
      },
    ]);
  });

  it("creates a synthetic imported GetHitVar air guard hitshaketime artifact with branch evidence", () => {
    const artifact = createSyntheticImportedGetHitVarAirGuardHitShakeTimeTraceArtifact({
      generatedAt: "2026-07-01T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-gethitvar-air-guard-hitshaketime-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-gethitvar-air-guard-hitshaketime-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.activeCommands).toEqual(expect.arrayContaining(["holdback", "x"]));
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([154, 155, 315]));
    expect(evidence?.executedControllers.HitVelSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.VelAdd).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["kinematic:hitvelset"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toContain("guard");
    expect(evidence?.combatReasons).toContain("guard");
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ actorId: "p2", source: "imported", actorKind: "player", stateNo: 315, animNo: 315 }),
      ]),
    );
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      source: "imported",
      ctrl: true,
    });
    expect(artifact.gates[0]?.requirements.requiredControllerEventSequences).toEqual([
      {
        label: "154/155 air guard GetHitVar(hitshaketime) branch order",
        actorId: "p2",
        allowSameTick: true,
        steps: [
          { stateNo: 154, controller: "ChangeAnim", name: "Air Guard Shake Anim" },
          { stateNo: 154, controller: "ChangeState", name: "Air Guard Shake Over" },
          { stateNo: 155, controller: "HitVelSet", name: "Apply Air Guard Velocity" },
          { stateNo: 155, operation: "kinematic:hitvelset" },
          { stateNo: 155, controller: "VelAdd", name: "Apply Air Guard Gravity" },
          { stateNo: 155, controller: "ChangeState", name: "Air Guarded HitVar Branch" },
        ],
      },
    ]);
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

  it("exports official KFM guard controller-order requirements for optional fixture QA", () => {
    expect(officialKfmStandGuardHitControllerSequence()).toMatchObject({
      label: "Official KFM 150/151 guard-hit controller and typed operation order",
      actorId: "p2",
      allowSameTick: true,
      steps: [
        { stateNo: 150, controller: "ChangeAnim" },
        { stateNo: 150, controller: "ChangeState" },
        { stateNo: 151, controller: "HitVelSet" },
        { stateNo: 151, operation: "kinematic:hitvelset" },
        { stateNo: 151, controller: "CtrlSet" },
        { stateNo: 151, operation: "resource:ctrlset" },
        { stateNo: 151, controller: "ChangeState" },
      ],
    });
    expect(officialKfmCrouchGuardHitControllerSequence().steps).toEqual([
      { stateNo: 152, controller: "ChangeAnim" },
      { stateNo: 152, controller: "ChangeState" },
      { stateNo: 153, controller: "HitVelSet" },
      { stateNo: 153, operation: "kinematic:hitvelset" },
      { stateNo: 153, controller: "CtrlSet" },
      { stateNo: 153, operation: "resource:ctrlset" },
      { stateNo: 153, controller: "ChangeState" },
    ]);
    expect(officialKfmAirGuardHitControllerSequence().steps).toEqual([
      { stateNo: 154, controller: "ChangeAnim" },
      { stateNo: 154, controller: "ChangeState" },
      { stateNo: 155, controller: "HitVelSet" },
      { stateNo: 155, operation: "kinematic:hitvelset" },
      { stateNo: 155, controller: "VelAdd" },
      { stateNo: 155, controller: "CtrlSet" },
      { stateNo: 155, operation: "resource:ctrlset" },
      { stateNo: 155, controller: "VelSet" },
      { stateNo: 155, operation: "kinematic:velset" },
      { stateNo: 155, controller: "PosSet" },
      { stateNo: 155, operation: "kinematic:posset" },
      { stateNo: 155, controller: "ChangeState" },
      { stateNo: 52, controller: "ChangeState" },
    ]);
  });

  it("exports official KFM auto guard-start and guard-end controller-order requirements", () => {
    expect(officialKfmAutoGuardStartControllerSequence()).toMatchObject({
      label: "Official KFM 120/130 auto guard-start controller and typed operation order",
      actorId: "p2",
      allowSameTick: true,
      steps: [
        { stateNo: 120, controller: "ChangeAnim" },
        { stateNo: 120, controller: "StateTypeSet" },
        { stateNo: 120, operation: "metadata:statetypeset" },
        { stateNo: 120, controller: "ChangeState" },
        { stateNo: 130, controller: "ChangeAnim" },
      ],
    });
    expect(officialKfmAutoGuardEndControllerSequence().steps).toEqual([
      { stateNo: 120, controller: "ChangeAnim" },
      { stateNo: 120, controller: "StateTypeSet" },
      { stateNo: 120, operation: "metadata:statetypeset" },
      { stateNo: 120, controller: "ChangeState" },
      { stateNo: 130, controller: "ChangeAnim" },
      { stateNo: 130, controller: "ChangeState" },
      { stateNo: 0, controller: "VelSet" },
      { stateNo: 0, operation: "kinematic:velset" },
    ]);
  });

  it("exports synthetic auto guard-start and guard-end controller-order requirements", () => {
    expect(syntheticAutoGuardStartControllerSequence()).toEqual({
      label: "Synthetic 120/130 auto guard-start controller order",
      actorId: "p2",
      allowSameTick: true,
      steps: [{ stateNo: 120, controller: "ChangeState", name: "Guard Start Done" }],
    });
    expect(syntheticAutoGuardEndControllerSequence()).toEqual({
      label: "Synthetic 120/130/140 auto guard-end controller order",
      actorId: "p2",
      allowSameTick: true,
      steps: [
        { stateNo: 120, controller: "ChangeState", name: "Guard Start Done" },
        { stateNo: 130, controller: "ChangeState", name: "Stop Guarding" },
      ],
    });
  });

  it("exports official KFM ground-recovery controller and actor-frame requirements", () => {
    expect(officialKfmGroundRecoveryControllerSequence()).toEqual({
      label: "Official KFM 5050/5200/52 ground-recovery controller and typed operation order",
      actorId: "p2",
      allowSameTick: true,
      steps: [
        { stateNo: 5050, controller: "VelAdd" },
        { stateNo: 5050, controller: "ChangeState" },
        { stateNo: 5200, controller: "VelAdd" },
        { stateNo: 5200, controller: "SelfState" },
        { stateNo: 52, controller: "VelSet" },
        { stateNo: 52, operation: "kinematic:velset" },
        { stateNo: 52, controller: "PosSet" },
        { stateNo: 52, operation: "kinematic:posset" },
        { stateNo: 52, controller: "ChangeState" },
      ],
    });
    expect(officialKfmGroundRecoveryActorFrameSequence()).toEqual({
      label: "Official KFM 5050/5200/52 ground-recovery actor-frame order",
      steps: [
        expect.objectContaining({
          actorId: "p2",
          stateNo: 5050,
          animNo: 5035,
          stateType: "A",
          moveType: "H",
          physics: "N",
          observedPosYAtMost: -6,
          observedVelXAtLeast: 1,
          observedVelYAtLeast: 5,
          minFrames: 6,
        }),
        expect.objectContaining({
          actorId: "p2",
          stateNo: 5200,
          animNo: 5035,
          stateType: "A",
          moveType: "H",
          physics: "N",
          observedPosYAtMost: 0,
          observedVelXAtLeast: 1,
          observedVelYAtLeast: 7,
          minFrames: 2,
        }),
        expect.objectContaining({
          actorId: "p2",
          stateNo: 52,
          animNo: 47,
          stateType: "S",
          moveType: "I",
          physics: "S",
          observedPosYAtLeast: 0,
          observedPosYAtMost: 0,
          observedVelXAtLeast: 0,
          observedVelXAtMost: 0,
          observedVelYAtLeast: 0,
          observedVelYAtMost: 0,
          minFrames: 1,
        }),
      ],
    });
  });

  it("exports official KFM air-recovery controller and actor-frame requirements", () => {
    expect(officialKfmAirRecoveryControllerSequence()).toEqual({
      label: "Official KFM 5050/5210/52 air-recovery controller and typed operation order",
      actorId: "p2",
      allowSameTick: true,
      steps: [
        { stateNo: 5050, controller: "VelAdd" },
        { stateNo: 5050, controller: "ChangeState" },
        { stateNo: 5210, controller: "PalFX" },
        { stateNo: 5210, operation: "sprite-effect:palfx" },
        { stateNo: 5210, controller: "PosFreeze" },
        { stateNo: 5210, operation: "bounds:posfreeze" },
        { stateNo: 5210, controller: "Turn" },
        { stateNo: 5210, operation: "orientation:turn" },
        { stateNo: 5210, controller: "NotHitBy" },
        { stateNo: 5210, operation: "eligibility:nothitby" },
        { stateNo: 5210, controller: "VelMul" },
        { stateNo: 5210, controller: "VelAdd" },
        { stateNo: 5210, controller: "ChangeState" },
        { stateNo: 52, controller: "VarSet" },
        { stateNo: 0, controller: "VelSet" },
        { stateNo: 0, operation: "kinematic:velset" },
      ],
    });
    expect(officialKfmAirRecoveryActorFrameSequence()).toEqual({
      label: "Official KFM 5050/5210/52 air-recovery actor-frame order",
      steps: [
        expect.objectContaining({
          actorId: "p2",
          stateNo: 5050,
          animNo: 5035,
          stateType: "A",
          moveType: "H",
          physics: "N",
          minFrames: 1,
        }),
        expect.objectContaining({
          actorId: "p2",
          stateNo: 5210,
          animNo: 5210,
          stateType: "A",
          moveType: "I",
          physics: "N",
          observedVelXAtLeast: 0.6,
          observedVelYAtMost: -3,
          minFrames: 8,
        }),
        expect.objectContaining({
          actorId: "p2",
          stateNo: 52,
          animNo: 47,
          stateType: "S",
          moveType: "I",
          physics: "S",
          minFrames: 1,
        }),
      ],
    });
  });

  it("exports official KFM guard-hit actor-frame physics requirements", () => {
    expect(officialKfmStandGuardHitPhysicsFrames()).toEqual([
      expect.objectContaining({ actorId: "p2", stateNo: 150, animNo: 150, stateType: "S", moveType: "H", physics: "N", minFrames: 5 }),
      expect.objectContaining({ actorId: "p2", stateNo: 151, animNo: 150, stateType: "S", moveType: "H", physics: "S", minFrames: 8 }),
    ]);
    expect(officialKfmCrouchGuardHitPhysicsFrames()).toEqual([
      expect.objectContaining({ actorId: "p2", stateNo: 152, animNo: 152, stateType: "C", moveType: "H", physics: "N", minFrames: 5 }),
      expect.objectContaining({ actorId: "p2", stateNo: 153, animNo: 151, stateType: "C", moveType: "H", physics: "C", minFrames: 8 }),
    ]);
    expect(officialKfmAirGuardHitPhysicsFrames()).toEqual([
      expect.objectContaining({ actorId: "p2", stateNo: 154, animNo: 132, stateType: "A", moveType: "H", physics: "N", minFrames: 5 }),
      expect.objectContaining({
        actorId: "p2",
        stateNo: 155,
        animNo: 152,
        stateType: "A",
        moveType: "H",
        physics: "N",
        minFrames: 10,
        observedVelXAtLeast: 2,
        observedVelYAtLeast: 8,
      }),
      expect.objectContaining({ actorId: "p2", stateNo: 52, animNo: 47, stateType: "S", physics: "S", minFrames: 1 }),
    ]);
  });

  it("exports synthetic guard-hit actor-frame physics requirements", () => {
    expect(syntheticStandGuardHitPhysicsFrames()).toEqual([
      expect.objectContaining({ actorId: "p2", stateNo: 150, animNo: 150, stateType: "S", moveType: "H", physics: "N", minFrames: 5 }),
      expect.objectContaining({
        actorId: "p2",
        stateNo: 151,
        animNo: 150,
        stateType: "S",
        moveType: "H",
        physics: "S",
        minFrames: 8,
        observedVelXAtLeast: 2,
      }),
    ]);
    expect(syntheticCrouchGuardHitPhysicsFrames()).toEqual([
      expect.objectContaining({ actorId: "p2", stateNo: 152, animNo: 10, stateType: "C", moveType: "H", physics: "N", minFrames: 5 }),
      expect.objectContaining({ actorId: "p2", stateNo: 153, animNo: 150, stateType: "C", moveType: "H", physics: "C", minFrames: 8 }),
    ]);
    expect(syntheticAirGuardHitPhysicsFrames()).toEqual([
      expect.objectContaining({ actorId: "p2", stateNo: 154, animNo: 40, stateType: "A", moveType: "H", physics: "N", minFrames: 5 }),
      expect.objectContaining({
        actorId: "p2",
        stateNo: 155,
        animNo: 150,
        stateType: "A",
        moveType: "H",
        physics: "N",
        minFrames: 8,
        observedVelXAtLeast: 2,
        observedVelYAtLeast: 6,
      }),
    ]);
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
    expect(evidence?.controllerEvents.map((event) => event.controller)).toEqual(
      expect.arrayContaining(["ChangeAnim", "ChangeState", "HitVelSet", "CtrlSet"]),
    );
    expect(evidence?.controllerEvents.map((event) => event.operation).filter(Boolean)).toEqual(
      expect.arrayContaining(["kinematic:hitvelset", "resource:ctrlset"]),
    );
    expect(evidence?.eventCategories).toContain("guard");
    expect(artifact.gates[0]?.requirements.requiredControllerEventSequences).toEqual([
      {
        label: "152/153 named crouch guard-hit controller and typed operation order",
        actorId: "p2",
        allowSameTick: true,
        steps: [
          { stateNo: 152, controller: "ChangeAnim", name: "Guard Shake Anim" },
          { stateNo: 152, controller: "ChangeState", name: "Guard Shake Over" },
          { stateNo: 153, controller: "HitVelSet", name: "Apply Crouch Guard Velocity" },
          { stateNo: 153, operation: "kinematic:hitvelset" },
          { stateNo: 153, controller: "CtrlSet", name: "Regain Crouch Guard Control" },
          { stateNo: 153, operation: "resource:ctrlset" },
          { stateNo: 153, controller: "ChangeState", name: "Crouch Guard Hit Over" },
        ],
      },
    ]);
    expect(artifact.gates[0]?.requirements.requiredActorFrames).toEqual(syntheticCrouchGuardHitPhysicsFrames());
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
    expect(artifact.gates[0]?.requirements.requiredControllerEventSequences).toEqual([
      {
        label: "152/153 named crouch guard-hit controller and typed operation order",
        actorId: "p2",
        allowSameTick: true,
        steps: [
          { stateNo: 152, controller: "ChangeAnim", name: "Guard Shake Anim" },
          { stateNo: 152, controller: "ChangeState", name: "Guard Shake Over" },
          { stateNo: 153, controller: "HitVelSet", name: "Apply Crouch Guard Velocity" },
          { stateNo: 153, operation: "kinematic:hitvelset" },
          { stateNo: 153, controller: "CtrlSet", name: "Regain Crouch Guard Control" },
          { stateNo: 153, operation: "resource:ctrlset" },
          { stateNo: 153, controller: "ChangeState", name: "Crouch Guard Hit Over" },
        ],
      },
    ]);
    expect(artifact.gates[0]?.requirements.requiredActorFrames).toEqual(syntheticCrouchGuardHitPhysicsFrames());
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
    expect(evidence?.controllerEvents.map((event) => event.controller)).toEqual(
      expect.arrayContaining(["ChangeAnim", "ChangeState", "HitVelSet", "VelAdd", "CtrlSet"]),
    );
    expect(evidence?.controllerEvents.map((event) => event.operation).filter(Boolean)).toEqual(
      expect.arrayContaining(["kinematic:hitvelset", "resource:ctrlset"]),
    );
    expect(evidence?.eventCategories).toContain("guard");
    expect(evidence?.combatReasons).toContain("guard");
    expect(artifact.gates[0]?.requirements.requiredControllerEventSequences).toEqual([
      {
        label: "154/155 named air guard-hit controller and typed operation order",
        actorId: "p2",
        allowSameTick: true,
        steps: [
          { stateNo: 154, controller: "ChangeAnim", name: "Air Guard Shake Anim" },
          { stateNo: 154, controller: "ChangeState", name: "Air Guard Shake Over" },
          { stateNo: 155, controller: "HitVelSet", name: "Apply Air Guard Velocity" },
          { stateNo: 155, operation: "kinematic:hitvelset" },
          { stateNo: 155, controller: "VelAdd", name: "Apply Air Guard Gravity" },
          { stateNo: 155, controller: "CtrlSet", name: "Regain Air Guard Control" },
          { stateNo: 155, operation: "resource:ctrlset" },
          { stateNo: 155, controller: "ChangeState", name: "Air Guard Hit Over" },
        ],
      },
    ]);
    expect(artifact.gates[0]?.requirements.requiredActorFrames).toEqual(syntheticAirGuardHitPhysicsFrames());
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
    const startFrame = evidence?.actorFrames.find((frame) => frame.actorId === "p2" && frame.stateNo === 120);
    const holdFrame = evidence?.actorFrames.find((frame) => frame.actorId === "p2" && frame.stateNo === 130);
    expect(startFrame?.lastTick).toBeLessThan(holdFrame?.firstTick ?? 0);
    expect(artifact.gates[0]?.requirements.requiredControllerEventSequences).toEqual([syntheticAutoGuardStartControllerSequence()]);
    expect(artifact.gates[0]?.requirements.requiredActorFrameSequences).toEqual([syntheticAutoGuardStartActorFrameSequence()]);
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
    const startFrame = evidence?.actorFrames.find((frame) => frame.actorId === "p2" && frame.stateNo === 120);
    const holdFrame = evidence?.actorFrames.find((frame) => frame.actorId === "p2" && frame.stateNo === 130);
    const endFrame = evidence?.actorFrames.find((frame) => frame.actorId === "p2" && frame.stateNo === 140);
    expect(startFrame?.lastTick).toBeLessThan(holdFrame?.firstTick ?? 0);
    expect(holdFrame?.lastTick).toBeLessThan(endFrame?.firstTick ?? 0);
    expect(artifact.gates[0]?.requirements.requiredControllerEventSequences).toEqual([syntheticAutoGuardEndControllerSequence()]);
    expect(artifact.gates[0]?.requirements.requiredActorFrameSequences).toEqual([syntheticAutoGuardEndActorFrameSequence()]);
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
    expect(artifact.gates[0]?.requirements.requiredControllerEventSequences).toEqual([
      {
        label: "5100 named custom get-hit controller and typed operation order",
        actorId: "p2",
        allowSameTick: true,
        steps: [
          { stateNo: 5100, controller: "HitFallVel", name: "Apply Fall Velocity" },
          { stateNo: 5100, operation: "hitfall:hitfallvel" },
          { stateNo: 5100, controller: "HitFallDamage", name: "Apply Fall Damage" },
          { stateNo: 5100, operation: "hitfall:hitfalldamage" },
          { stateNo: 5100, controller: "HitFallSet", name: "Mark Fall Resolved" },
          { stateNo: 5100, operation: "hitfall:hitfallset" },
          { stateNo: 5100, controller: "FallEnvShake", name: "Fall Camera Shake" },
          { stateNo: 5100, operation: "fallenvshake" },
        ],
      },
    ]);
    expect(artifact.gates[0]?.requirements.requiredEnvShakeEvents).toEqual([
      {
        actorId: "p2",
        source: "demo",
        actorKind: "player",
        time: 15,
        freq: 178,
        ampl: 6,
        phase: 0,
        stateNo: 5100,
      },
    ]);
    expect(evidence?.envShakeEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p2",
          source: "demo",
          actorKind: "player",
          time: 15,
          freq: 178,
          ampl: 6,
          phase: 0,
          stateNo: 5100,
        }),
      ]),
    );
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

  it("creates a synthetic imported GetHitVar fall.recover artifact with CanRecover distinction evidence", () => {
    const artifact = createSyntheticImportedGetHitVarFallRecoverTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-gethitvar-fall-recover-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-gethitvar-fall-recover-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 5100, 301]));
    expect(evidence?.executedControllers.HitFallVel).toBeGreaterThanOrEqual(1);
    expect(evidence?.actorFrames.find((actor) => actor.actorId === "p2" && actor.stateNo === 5100)?.minHitFallRecoverTime).toBeGreaterThanOrEqual(1);
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      source: "demo",
      stateNo: 301,
      customOwnerId: "p1",
      hitFall: {
        falling: true,
        damage: 70,
        recover: true,
      },
    });
  });

  it("creates a synthetic imported GetHitVar fall metadata artifact with route evidence", () => {
    const artifact = createSyntheticImportedGetHitVarFallMetadataTraceArtifact({ generatedAt: "2026-07-01T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-gethitvar-fall-metadata-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-gethitvar-fall-metadata-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 5100, 305]));
    expect(evidence?.executedControllers.HitFallVel).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["hitfall:hitfallvel"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      source: "demo",
      stateNo: 305,
      customOwnerId: "p1",
      hitFall: {
        falling: true,
        damage: 70,
        kill: false,
        velocity: { x: 3, y: -6 },
      },
    });
    expect(artifact.gates[0]?.requirements.requiredFinalActors).toEqual([
      {
        actorId: "p2",
        actorKind: "player",
        source: "demo",
        stateNo: 305,
        customOwnerId: "p1",
        hitFall: {
          falling: true,
          damage: 70,
          kill: false,
          velocityX: 3,
          velocityY: -6,
        },
      },
    ]);
  });

  it("creates a synthetic imported GetHitVar fall.envshake artifact with route evidence", () => {
    const artifact = createSyntheticImportedGetHitVarFallEnvShakeTraceArtifact({ generatedAt: "2026-07-01T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-gethitvar-fall-envshake-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-gethitvar-fall-envshake-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 5100, 306]));
    expect(evidence?.executedControllers.HitFallVel).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["hitfall:hitfallvel"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      source: "demo",
      stateNo: 306,
      customOwnerId: "p1",
      hitFall: {
        falling: true,
        damage: 70,
        velocity: { x: 3, y: -6 },
        envShake: {
          time: 15,
          freq: 178,
          ampl: 6,
          phase: 0,
        },
      },
    });
    expect(artifact.gates[0]?.requirements.requiredFinalActors).toEqual([
      {
        actorId: "p2",
        actorKind: "player",
        source: "demo",
        stateNo: 306,
        customOwnerId: "p1",
        hitFall: {
          falling: true,
          damage: 70,
          velocityX: 3,
          velocityY: -6,
          envShakeTime: 15,
          envShakeFreq: 178,
          envShakeAmpl: 6,
          envShakePhase: 0,
        },
      },
    ]);
  });

  it("creates a synthetic imported GetHitVar down.recover artifact with alias route evidence", () => {
    const artifact = createSyntheticImportedGetHitVarDownRecoverTraceArtifact({ generatedAt: "2026-07-01T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-gethitvar-down-recover-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-gethitvar-down-recover-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 5100, 307]));
    expect(evidence?.executedControllers.HitFallVel).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["hitfall:hitfallvel"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      source: "demo",
      stateNo: 307,
      customOwnerId: "p1",
      hitFall: {
        falling: true,
        damage: 70,
        velocity: { x: 3, y: -6 },
        downRecover: true,
        downRecoverTime: 45,
      },
    });
    expect(artifact.gates[0]?.requirements.requiredFinalActors).toEqual([
      {
        actorId: "p2",
        actorKind: "player",
        source: "demo",
        stateNo: 307,
        customOwnerId: "p1",
        hitFall: {
          falling: true,
          damage: 70,
          velocityX: 3,
          velocityY: -6,
          downRecover: true,
          downRecoverTime: 45,
        },
      },
    ]);
  });

  it("creates a synthetic imported GetHitVar guarded artifact with defender guard-state branch evidence", () => {
    const artifact = createSyntheticImportedGetHitVarGuardedTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-gethitvar-guarded-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-gethitvar-guarded-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 150, 151, 302]));
    expect(evidence?.executedControllers.HitVelSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.CtrlSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["kinematic:hitvelset"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.actorFrames.find((actor) => actor.actorId === "p2" && actor.stateNo === 302)).toMatchObject({
      animNo: 302,
      source: "imported",
      actorKind: "player",
    });
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      source: "imported",
      stateNo: 0,
      ctrl: true,
    });
  });

  it("creates a synthetic imported Projectile GetHitVar guarded artifact with defender guard-state branch evidence", () => {
    const artifact = createSyntheticImportedProjectileGetHitVarGuardedTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-projectile-gethitvar-guarded-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-projectile-gethitvar-guarded-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 150, 151, 303]));
    expect(evidence?.executedControllers.Projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.HitVelSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.CtrlSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["kinematic:hitvelset"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["resource:ctrlset"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toContain("guard");
    expect(evidence?.combatReasons).toContain("guard");
    expect(evidence?.actorFrames.find((actor) => actor.actorId === "p2" && actor.stateNo === 303)).toMatchObject({
      animNo: 303,
      source: "imported",
      actorKind: "player",
    });
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      source: "imported",
      stateNo: 0,
      ctrl: true,
    });
    expect(artifact.gates[0]?.requirements.requiredExecutedControllers).toEqual(["ChangeState", "Projectile", "HitVelSet", "CtrlSet"]);
    expect(artifact.gates[0]?.requirements.requiredExecutedOperations).toEqual(["projectile", "kinematic:hitvelset", "resource:ctrlset"]);
  });

  it("creates a synthetic imported Projectile GetHitVar guard hitshaketime artifact with defender branch evidence", () => {
    const artifact = createSyntheticImportedProjectileGetHitVarGuardHitShakeTimeTraceArtifact({
      generatedAt: "2026-07-01T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-projectile-gethitvar-guard-hitshaketime-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-projectile-gethitvar-guard-hitshaketime-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 150, 151, 312]));
    expect(evidence?.executedControllers.Projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.HitVelSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.CtrlSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["kinematic:hitvelset"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["resource:ctrlset"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toContain("guard");
    expect(evidence?.combatReasons).toContain("guard");
    expect(evidence?.actorFrames.find((actor) => actor.actorId === "p2" && actor.stateNo === 312)).toMatchObject({
      animNo: 312,
      source: "imported",
      actorKind: "player",
    });
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      source: "imported",
      stateNo: 0,
      ctrl: true,
    });
    expect(artifact.gates[0]?.requirements.requiredControllerEventSequences).toEqual([
      {
        label: "150/151 projectile GetHitVar(hitshaketime) branch",
        actorId: "p2",
        allowSameTick: true,
        steps: [
          { stateNo: 150, controller: "ChangeAnim", name: "Guard Shake Anim" },
          { stateNo: 150, controller: "ChangeState", name: "Guard Shake Over" },
          { stateNo: 151, controller: "HitVelSet", name: "Apply Guard Velocity" },
          { stateNo: 151, operation: "kinematic:hitvelset" },
          { stateNo: 151, controller: "CtrlSet", name: "Regain Guard Control" },
          { stateNo: 151, operation: "resource:ctrlset" },
          { stateNo: 151, controller: "ChangeState", name: "Guarded HitVar Branch" },
        ],
      },
    ]);
  });

  it("creates a synthetic imported Projectile GetHitVar air guard hitshaketime artifact with defender branch evidence", () => {
    const artifact = createSyntheticImportedProjectileGetHitVarAirGuardHitShakeTimeTraceArtifact({
      generatedAt: "2026-07-01T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-projectile-gethitvar-air-guard-hitshaketime-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-projectile-gethitvar-air-guard-hitshaketime-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.activeCommands).toEqual(expect.arrayContaining(["holdback", "x"]));
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 154, 155, 316]));
    expect(evidence?.executedControllers.Projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.HitVelSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.VelAdd).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["kinematic:hitvelset"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toContain("guard");
    expect(evidence?.combatReasons).toContain("guard");
    expect(evidence?.actorFrames.find((actor) => actor.actorId === "p2" && actor.stateNo === 316)).toMatchObject({
      animNo: 316,
      source: "imported",
      actorKind: "player",
    });
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      source: "imported",
      ctrl: true,
    });
    expect(artifact.gates[0]?.requirements.requiredControllerEventSequences).toEqual([
      {
        label: "154/155 projectile air guard GetHitVar(hitshaketime) branch",
        actorId: "p2",
        allowSameTick: true,
        steps: [
          { stateNo: 154, controller: "ChangeAnim", name: "Air Guard Shake Anim" },
          { stateNo: 154, controller: "ChangeState", name: "Air Guard Shake Over" },
          { stateNo: 155, controller: "HitVelSet", name: "Apply Air Guard Velocity" },
          { stateNo: 155, operation: "kinematic:hitvelset" },
          { stateNo: 155, controller: "VelAdd", name: "Apply Air Guard Gravity" },
          { stateNo: 155, controller: "ChangeState", name: "Air Guarded HitVar Branch" },
        ],
      },
    ]);
  });

  it("creates a synthetic imported Helper Projectile GetHitVar guarded artifact with defender guard-state branch evidence", () => {
    const artifact = createSyntheticImportedHelperProjectileGetHitVarGuardedTraceArtifact({
      generatedAt: "2026-06-25T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-helper-projectile-gethitvar-guarded-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-helper-projectile-gethitvar-guarded-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 150, 151, 304]));
    expect(evidence?.executedControllers.Helper).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.Projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.HitVelSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.CtrlSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.helper).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["kinematic:hitvelset"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["resource:ctrlset"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toContain("guard");
    expect(evidence?.combatReasons).toContain("guard");
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ actorId: "p2", source: "imported", actorKind: "player", stateNo: 304, animNo: 304 }),
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1243, animNo: 980 }),
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1244, animNo: 981 }),
        expect.objectContaining({ source: "effect", actorKind: "projectile", ownerId: "p1", animNo: 982 }),
      ]),
    );
    expect(evidence?.worldLifecycleEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "spawn", kind: "projectile", ownerId: "p1", parentId: "p1-helper-0" }),
        expect.objectContaining({ type: "active", kind: "projectile", ownerId: "p1", parentId: "p1-helper-0" }),
      ]),
    );
    expect(evidence?.targetLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ownerId: "p1", actorId: "p2", targetId: 8856 }),
        expect.objectContaining({ ownerId: "p1-helper-0", actorId: "p2", targetId: 8856 }),
      ]),
    );
    expect(evidence?.controllerEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ actorId: "p1", stateNo: 1200, controller: "Projectile", name: "Helper ProjGuard Spawn" }),
        expect.objectContaining({ actorId: "p1", stateNo: 1200, operation: "projectile" }),
      ]),
    );
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      source: "imported",
      stateNo: 0,
      ctrl: true,
    });
    expect(gate?.requirements.requiredExecutedControllers).toEqual(["ChangeState", "Helper", "Projectile", "HitVelSet", "CtrlSet"]);
    expect(gate?.requirements.requiredExecutedOperations).toEqual(["helper", "projectile", "kinematic:hitvelset", "resource:ctrlset"]);
    expect(gate?.requirements.requiredControllerEventSequences).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "helper-local Projectile spawn telemetry",
          actorId: "p1",
          steps: [
            { stateNo: 1200, controller: "Projectile", name: "Helper ProjGuard Spawn" },
            { stateNo: 1200, operation: "projectile" },
          ],
        }),
      ]),
    );
  });

  it("creates a synthetic imported Helper Projectile GetHitVar guard hitshaketime artifact with defender branch evidence", () => {
    const artifact = createSyntheticImportedHelperProjectileGetHitVarGuardHitShakeTimeTraceArtifact({
      generatedAt: "2026-07-01T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-helper-projectile-gethitvar-guard-hitshaketime-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-helper-projectile-gethitvar-guard-hitshaketime-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 150, 151, 313]));
    expect(evidence?.executedControllers.Helper).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.Projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.HitVelSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.CtrlSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.helper).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["kinematic:hitvelset"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["resource:ctrlset"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toContain("guard");
    expect(evidence?.combatReasons).toContain("guard");
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ actorId: "p2", source: "imported", actorKind: "player", stateNo: 313, animNo: 313 }),
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1243, animNo: 980 }),
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1244, animNo: 981 }),
        expect.objectContaining({ source: "effect", actorKind: "projectile", ownerId: "p1", animNo: 982 }),
      ]),
    );
    expect(evidence?.worldLifecycleEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "spawn", kind: "projectile", ownerId: "p1", parentId: "p1-helper-0" }),
        expect.objectContaining({ type: "active", kind: "projectile", ownerId: "p1", parentId: "p1-helper-0" }),
      ]),
    );
    expect(evidence?.targetLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ownerId: "p1", actorId: "p2", targetId: 8856 }),
        expect.objectContaining({ ownerId: "p1-helper-0", actorId: "p2", targetId: 8856 }),
      ]),
    );
    expect(evidence?.controllerEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ actorId: "p1", stateNo: 1200, controller: "Projectile", name: "Helper ProjGuard Spawn" }),
        expect.objectContaining({ actorId: "p1", stateNo: 1200, operation: "projectile" }),
      ]),
    );
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      source: "imported",
      stateNo: 0,
      ctrl: true,
    });
    expect(gate?.requirements.requiredExecutedControllers).toEqual(["ChangeState", "Helper", "Projectile", "HitVelSet", "CtrlSet"]);
    expect(gate?.requirements.requiredExecutedOperations).toEqual(["helper", "projectile", "kinematic:hitvelset", "resource:ctrlset"]);
    expect(gate?.requirements.requiredControllerEventSequences).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "helper-local Projectile spawn telemetry",
          actorId: "p1",
          steps: [
            { stateNo: 1200, controller: "Projectile", name: "Helper ProjGuard Spawn" },
            { stateNo: 1200, operation: "projectile" },
          ],
        }),
        expect.objectContaining({
          label: "150/151 helper projectile GetHitVar(hitshaketime) branch",
          actorId: "p2",
        }),
      ]),
    );
  });

  it("creates a synthetic imported Helper Projectile GetHitVar air guard hitshaketime artifact with defender branch evidence", () => {
    const artifact = createSyntheticImportedHelperProjectileGetHitVarAirGuardHitShakeTimeTraceArtifact({
      generatedAt: "2026-07-01T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-helper-projectile-gethitvar-air-guard-hitshaketime-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-helper-projectile-gethitvar-air-guard-hitshaketime-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(evidence?.activeCommands).toEqual(expect.arrayContaining(["holdback", "x"]));
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 154, 155, 317]));
    expect(evidence?.executedControllers.Helper).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.Projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.HitVelSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.VelAdd).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.helper).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["kinematic:hitvelset"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toContain("guard");
    expect(evidence?.combatReasons).toContain("guard");
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ actorId: "p2", source: "imported", actorKind: "player", stateNo: 317, animNo: 317 }),
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1243, animNo: 980 }),
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1244, animNo: 981 }),
        expect.objectContaining({ source: "effect", actorKind: "projectile", ownerId: "p1", animNo: 982 }),
      ]),
    );
    expect(evidence?.worldLifecycleEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "spawn", kind: "projectile", ownerId: "p1", parentId: "p1-helper-0" }),
        expect.objectContaining({ type: "active", kind: "projectile", ownerId: "p1", parentId: "p1-helper-0" }),
      ]),
    );
    expect(evidence?.targetLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ownerId: "p1", actorId: "p2", targetId: 8856 }),
        expect.objectContaining({ ownerId: "p1-helper-0", actorId: "p2", targetId: 8856 }),
      ]),
    );
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      source: "imported",
      ctrl: true,
    });
    expect(gate?.requirements.requiredExecutedControllers).toEqual(["ChangeState", "Helper", "Projectile", "HitVelSet", "VelAdd"]);
    expect(gate?.requirements.requiredExecutedOperations).toEqual(["helper", "projectile", "kinematic:hitvelset"]);
    expect(gate?.requirements.requiredControllerEventSequences).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "helper-local Projectile spawn telemetry",
          actorId: "p1",
          steps: [
            { stateNo: 1200, controller: "Projectile", name: "Helper ProjGuard Spawn" },
            { stateNo: 1200, operation: "projectile" },
          ],
        }),
        expect.objectContaining({
          label: "154/155 helper projectile air guard GetHitVar(hitshaketime) branch",
          actorId: "p2",
        }),
      ]),
    );
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

  it("creates a synthetic imported target-owned custom-state artifact for p2getp1state zero", () => {
    const artifact = createSyntheticImportedTargetOwnedCustomStateTraceArtifact({ generatedAt: "2026-06-28T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-target-owned-custom-state-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-target-owned-custom-state-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 888]));
    expect(evidence?.executedControllers.HitDef).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.SelfState).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ actorId: "p2", customOwnerId: undefined, stateNo: 888, animNo: 888, moveType: "H" }),
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

  it("creates an imported default crouch Common1 get-hit artifact without p2stateno", () => {
    const artifact = createSyntheticImportedDefaultCrouchGetHitTraceArtifact({ generatedAt: "2026-07-01T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-default-crouch-gethit-golden",
        source: "imported",
      },
      gates: [
        {
          label: "imported-default-crouch-gethit-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.actorSources).toEqual(["imported"]);
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 5010]));
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([200, 5010]);
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      source: "imported",
      stateNo: 5010,
      moveType: "H",
    });
  });

  it("creates an imported default air Common1 get-hit artifact without p2stateno", () => {
    const artifact = createSyntheticImportedDefaultAirGetHitTraceArtifact({ generatedAt: "2026-07-01T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-default-air-gethit-golden",
        source: "imported",
      },
      gates: [
        {
          label: "imported-default-air-gethit-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.actorSources).toEqual(["imported"]);
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 5020]));
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([200, 5020]);
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      source: "imported",
      stateNo: 5020,
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
    expect(artifact.gates[0]?.requirements.requiredControllerEventSequences).toEqual([
      defaultGetHitProgressionControllerSequence(),
    ]);
    expect(artifact.gates[0]?.requirements.requiredActorFrames).toEqual(defaultGetHitProgressionPhysicsFrames());
    expect(artifact.gates[0]?.requirements.requiredActorFrameSequences).toEqual([
      defaultGetHitProgressionActorFrameSequence(),
    ]);
    expect(
      evidence?.controllerEvents.filter((event) => event.actorId === "p2").map((event) => `${event.stateNo}:${event.controller}`),
    ).toEqual(expect.arrayContaining(["5000:ChangeState", "5001:ChangeState"]));
    const shakeFrame = evidence?.actorFrames.find((frame) => frame.actorId === "p2" && frame.stateNo === 5000);
    const slideFrame = evidence?.actorFrames.find((frame) => frame.actorId === "p2" && frame.stateNo === 5001);
    expect(shakeFrame).toMatchObject({
      animNo: 5000,
      stateType: "S",
      moveType: "H",
      physics: "N",
      clsn1Count: 0,
      clsn2Count: 1,
      frames: 5,
    });
    expect(slideFrame).toMatchObject({
      animNo: 5001,
      stateType: "S",
      moveType: "H",
      physics: "S",
      clsn1Count: 0,
      clsn2Count: 1,
      frames: 8,
    });
    expect(shakeFrame?.lastTick ?? 0).toBeLessThan(slideFrame?.firstTick ?? 0);
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      source: "imported",
      stateNo: 0,
      moveType: "I",
      ctrl: true,
    });
  });

  it("creates an imported default crouch Common1 progression artifact with HitShakeOver and HitOver", () => {
    const artifact = createSyntheticImportedDefaultCrouchGetHitProgressionTraceArtifact({
      generatedAt: "2026-07-02T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-default-crouch-gethit-progression-golden",
        source: "imported",
      },
      gates: [
        {
          label: "imported-default-crouch-gethit-progression-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([0, 200, 5010, 5011]));
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(artifact.gates[0]?.requirements.requiredControllerEventSequences).toEqual([
      defaultGetHitProgressionControllerSequence(5010, 5011),
    ]);
    expect(artifact.gates[0]?.requirements.requiredActorFrames).toEqual(defaultCrouchGetHitProgressionPhysicsFrames());
    expect(artifact.gates[0]?.requirements.requiredActorFrameSequences).toEqual([
      defaultGetHitProgressionActorFrameSequence(5010, 5011),
    ]);
    const shakeFrame = evidence?.actorFrames.find((frame) => frame.actorId === "p2" && frame.stateNo === 5010);
    const slideFrame = evidence?.actorFrames.find((frame) => frame.actorId === "p2" && frame.stateNo === 5011);
    expect(shakeFrame).toMatchObject({
      animNo: 5010,
      stateType: "C",
      moveType: "H",
      physics: "N",
      clsn1Count: 0,
      clsn2Count: 1,
      frames: 5,
    });
    expect(slideFrame).toMatchObject({
      animNo: 5011,
      stateType: "C",
      moveType: "H",
      physics: "C",
      clsn1Count: 0,
      clsn2Count: 1,
      frames: 8,
    });
    expect(shakeFrame?.lastTick ?? 0).toBeLessThan(slideFrame?.firstTick ?? 0);
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      source: "imported",
      stateNo: 0,
      moveType: "I",
      ctrl: true,
    });
  });

  it("creates a synthetic imported GetHitVar hittime artifact for normal get-hit CNS", () => {
    const artifact = createSyntheticImportedGetHitVarHitTimeTraceArtifact({ generatedAt: "2026-07-01T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-gethitvar-hittime-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-gethitvar-hittime-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 5000, 309]));
    expect(evidence?.executedControllers.HitDef).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ actorId: "p2", source: "imported", actorKind: "player", stateNo: 309, animNo: 309 }),
      ]),
    );
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      source: "imported",
      stateNo: 309,
      moveType: "H",
    });
    expect(artifact.gates[0]?.requirements.requiredControllerEventSequences).toEqual([
      {
        label: "5000 normal hit GetHitVar(hittime) branch order",
        actorId: "p2",
        allowSameTick: true,
        steps: [{ stateNo: 5000, controller: "ChangeState", name: "Normal HitTime Branch" }],
      },
    ]);
  });

  it("creates a synthetic imported GetHitVar hitshaketime artifact for normal get-hit CNS", () => {
    const artifact = createSyntheticImportedGetHitVarHitShakeTimeTraceArtifact({ generatedAt: "2026-07-01T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-gethitvar-hitshaketime-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-gethitvar-hitshaketime-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 5000, 310]));
    expect(evidence?.executedControllers.HitDef).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ actorId: "p2", source: "imported", actorKind: "player", stateNo: 310, animNo: 310 }),
      ]),
    );
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      source: "imported",
      stateNo: 310,
      moveType: "H",
    });
    expect(artifact.gates[0]?.requirements.requiredControllerEventSequences).toEqual([
      {
        label: "5000 normal hit GetHitVar(hitshaketime) branch order",
        actorId: "p2",
        allowSameTick: true,
        steps: [{ stateNo: 5000, controller: "ChangeState", name: "Normal HitTime Branch" }],
      },
    ]);
  });

  it("describes official KFM default Common1 progression physics-frame evidence separately from synthetic traces", () => {
    expect(officialKfmDefaultGetHitProgressionPhysicsFrames()).toEqual([
      {
        actorId: "p2",
        source: "imported",
        actorKind: "player",
        stateNo: 5000,
        animNo: 5000,
        stateType: "S",
        moveType: "H",
        physics: "N",
        clsn1Count: 0,
        clsn2Count: 2,
        minFrames: 5,
        observedPosYAtLeast: 0,
        observedPosYAtMost: 0,
        observedVelXAtLeast: 0,
        observedVelXAtMost: 0,
        observedVelYAtLeast: 0,
        observedVelYAtMost: 0,
        bodyWidthFront: 39,
        bodyWidthBack: 39,
      },
      {
        actorId: "p2",
        source: "imported",
        actorKind: "player",
        stateNo: 5001,
        stateType: "S",
        moveType: "H",
        physics: "S",
        clsn1Count: 0,
        clsn2Count: 2,
        minFrames: 6,
        observedPosYAtLeast: 0,
        observedPosYAtMost: 0,
        observedVelXAtLeast: 1,
        observedVelXAtMost: 0,
        observedVelYAtLeast: 0,
        observedVelYAtMost: 0,
        bodyWidthFront: 39,
        bodyWidthBack: 39,
      },
    ]);
  });

  it("describes official KFM crouch Common1 progression physics-frame evidence separately from synthetic traces", () => {
    expect(officialKfmDefaultCrouchGetHitProgressionPhysicsFrames()).toEqual([
      {
        actorId: "p2",
        source: "imported",
        actorKind: "player",
        stateNo: 5010,
        animNo: 5010,
        stateType: "C",
        moveType: "H",
        physics: "N",
        clsn1Count: 0,
        clsn2Count: 2,
        minFrames: 5,
        observedPosYAtLeast: 0,
        observedPosYAtMost: 0,
        observedVelXAtLeast: 0,
        observedVelXAtMost: 0,
        observedVelYAtLeast: 0,
        observedVelYAtMost: 0,
        bodyWidthFront: 39,
        bodyWidthBack: 39,
      },
      {
        actorId: "p2",
        source: "imported",
        actorKind: "player",
        stateNo: 5011,
        animNo: 5020,
        stateType: "C",
        moveType: "H",
        physics: "C",
        clsn1Count: 0,
        clsn2Count: 3,
        minFrames: 8,
        observedPosYAtLeast: 0,
        observedPosYAtMost: 0,
        observedVelXAtLeast: 1,
        observedVelXAtMost: 0,
        observedVelYAtLeast: 0,
        observedVelYAtMost: 0,
        bodyWidthFront: 39,
        bodyWidthBack: 39,
      },
    ]);
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
      requiredControllerEventSequences: [defaultFallGetHitControllerSequence()],
      requiredActorFrameSequences: [defaultFallGetHitActorFrameSequence()],
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
    expect(artifact.gates[0]?.requirements.requiredControllerEventSequences).toEqual([
      defaultFallGetHitControllerSequence(),
    ]);
    expect(artifact.gates[0]?.requirements.requiredActorFrameSequences).toEqual([defaultFallGetHitActorFrameSequence()]);
    const shakeFrame = evidence?.actorFrames.find((frame) => frame.actorId === "p2" && frame.stateNo === 5000);
    const airFrame = evidence?.actorFrames.find((frame) => frame.actorId === "p2" && frame.stateNo === 5030);
    const fallFrame = evidence?.actorFrames.find((frame) => frame.actorId === "p2" && frame.stateNo === 5050);
    expect(shakeFrame?.moveType).toBe("H");
    expect(airFrame?.moveType).toBe("H");
    expect(fallFrame?.moveType).toBe("H");
    expect(shakeFrame?.lastTick ?? 0).toBeLessThan(airFrame?.firstTick ?? 0);
    expect(airFrame?.lastTick ?? 0).toBeLessThan(fallFrame?.firstTick ?? 0);
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      source: "imported",
      hitFall: {
        falling: true,
        velocity: { y: -6 },
        recover: false,
      },
    });
  });

  it("creates an imported default air Common1 fall artifact through 5020, 5030, and 5050", () => {
    const artifact = createSyntheticImportedDefaultAirFallGetHitTraceArtifact({ generatedAt: "2026-07-02T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-default-air-fall-gethit-golden",
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
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 5020, 5030, 5050]));
    expect(evidence?.executedControllers.HitDef).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.HitVelSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.VelAdd).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(artifact.gates[0]?.requirements.requiredControllerEventSequences).toEqual([
      defaultFallGetHitControllerSequence(5020),
    ]);
    expect(artifact.gates[0]?.requirements.requiredActorFrameSequences).toEqual([
      defaultFallGetHitActorFrameSequence([5020, 5030, 5050]),
    ]);
    const shakeFrame = evidence?.actorFrames.find((frame) => frame.actorId === "p2" && frame.stateNo === 5020);
    const airFrame = evidence?.actorFrames.find((frame) => frame.actorId === "p2" && frame.stateNo === 5030);
    const fallFrame = evidence?.actorFrames.find((frame) => frame.actorId === "p2" && frame.stateNo === 5050);
    expect(shakeFrame).toMatchObject({ moveType: "H", stateType: "A", physics: "N" });
    expect(airFrame?.moveType).toBe("H");
    expect(fallFrame?.moveType).toBe("H");
    expect(shakeFrame?.lastTick ?? 0).toBeLessThan(airFrame?.firstTick ?? 0);
    expect(airFrame?.lastTick ?? 0).toBeLessThan(fallFrame?.firstTick ?? 0);
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      source: "imported",
      hitFall: {
        falling: true,
        velocity: { y: -6 },
        recover: false,
      },
    });
  });

  it("creates an imported default air Common1 ground-impact artifact through 5020, 5030, 5050, and 5100", () => {
    const artifact = createSyntheticImportedDefaultAirGroundImpactTraceArtifact({
      generatedAt: "2026-07-02T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-default-air-ground-impact-golden",
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
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 5020, 5030, 5050, 5100]));
    expect(evidence?.executedControllers.HitDef).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.HitVelSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.HitFallDamage).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["hitfall:hitfalldamage"]).toBeGreaterThanOrEqual(1);
    expect(artifact.gates[0]?.requirements.requiredControllerEventSequences).toEqual([
      defaultFallGroundImpactControllerSequence(5020),
    ]);
    expect(artifact.gates[0]?.requirements.requiredActorFrameSequences).toEqual([
      defaultFallGetHitActorFrameSequence([5020, 5030, 5050, 5100]),
    ]);
    expect(artifact.gates[0]?.requirements.requiredActorFrames).toEqual([
      {
        actorId: "p2",
        source: "imported",
        actorKind: "player",
        stateNo: 5100,
        stateType: "L",
        moveType: "H",
        physics: "N",
        minFrames: 1,
      },
    ]);
    const shakeFrame = evidence?.actorFrames.find((frame) => frame.actorId === "p2" && frame.stateNo === 5020);
    const airFrame = evidence?.actorFrames.find((frame) => frame.actorId === "p2" && frame.stateNo === 5030);
    const fallFrame = evidence?.actorFrames.find((frame) => frame.actorId === "p2" && frame.stateNo === 5050);
    const groundFrame = evidence?.actorFrames.find((frame) => frame.actorId === "p2" && frame.stateNo === 5100);
    expect(shakeFrame).toMatchObject({ moveType: "H", stateType: "A", physics: "N" });
    expect(airFrame?.moveType).toBe("H");
    expect(fallFrame?.moveType).toBe("H");
    expect(groundFrame).toMatchObject({ moveType: "H", stateType: "L", physics: "N" });
    expect(shakeFrame?.lastTick ?? 0).toBeLessThan(airFrame?.firstTick ?? 0);
    expect(airFrame?.lastTick ?? 0).toBeLessThan(fallFrame?.firstTick ?? 0);
    expect(fallFrame?.lastTick ?? 0).toBeLessThan(groundFrame?.firstTick ?? 0);
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      source: "imported",
      stateNo: 0,
      moveType: "I",
      ctrl: true,
    });
  });

  it("creates an imported default air Common1 lie-down recovery artifact through 5020, 5030, 5050, 5100, 5101, 5110, and 5120", () => {
    const artifact = createSyntheticImportedDefaultAirLieDownRecoveryTraceArtifact({
      generatedAt: "2026-07-02T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-default-air-liedown-recovery-golden",
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
    expect(evidence?.executedStates).toEqual(
      expect.arrayContaining([0, 200, 5020, 5030, 5050, 5100, 5101, 5110, 5120]),
    );
    expect(evidence?.executedControllers.HitDef).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.HitVelSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.HitFallDamage).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.HitFallVel).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.HitFallSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["hitfall:hitfallvel"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["hitfall:hitfalldamage"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["hitfall:hitfallset"]).toBeGreaterThanOrEqual(1);
    expect(artifact.gates[0]?.requirements.requiredControllerEventSequences).toEqual([
      defaultFallGroundImpactControllerSequence(5020),
      defaultFallBounceLieDownControllerSequence(),
      defaultFallLieDownGetUpControllerSequence(),
    ]);
    expect(artifact.gates[0]?.requirements.requiredActorFrameSequences).toEqual([
      defaultFallGetHitActorFrameSequence([5020, 5030, 5050, 5100, 5101, 5110]),
      defaultFallLieDownGetUpActorFrameSequence(),
    ]);
    expect(artifact.gates[0]?.requirements.requiredActorFrames).toEqual([
      {
        actorId: "p2",
        source: "imported",
        actorKind: "player",
        animNo: 5110,
        moveType: "H",
        observedHitFallDownRecoverTimeAtLeast: 58,
        observedHitFallDownRecoverTimeAtMost: 54,
        observedHitFallDownRecoverTimeDropAtLeast: 1,
        minFrames: 2,
      },
    ]);
    const frames = new Map(
      [5020, 5030, 5050, 5100, 5101, 5110, 5120].map((stateNo) => [
        stateNo,
        evidence?.actorFrames.find((frame) => frame.actorId === "p2" && frame.stateNo === stateNo),
      ]),
    );
    expect(frames.get(5020)).toMatchObject({ moveType: "H", stateType: "A", physics: "N" });
    expect(frames.get(5100)).toMatchObject({ moveType: "H", stateType: "L", physics: "N" });
    expect(frames.get(5101)).toMatchObject({ moveType: "H", stateType: "L", physics: "N" });
    expect(frames.get(5110)).toMatchObject({ moveType: "H", stateType: "L", physics: "N" });
    expect(frames.get(5120)).toMatchObject({ moveType: "I", stateType: "L", physics: "N" });
    expect(frames.get(5020)?.lastTick ?? 0).toBeLessThan(frames.get(5030)?.firstTick ?? 0);
    expect(frames.get(5030)?.lastTick ?? 0).toBeLessThan(frames.get(5050)?.firstTick ?? 0);
    expect(frames.get(5050)?.lastTick ?? 0).toBeLessThan(frames.get(5100)?.firstTick ?? 0);
    expect(frames.get(5100)?.lastTick ?? 0).toBeLessThan(frames.get(5101)?.firstTick ?? 0);
    expect(frames.get(5101)?.lastTick ?? 0).toBeLessThan(frames.get(5110)?.firstTick ?? 0);
    expect(frames.get(5110)?.lastTick ?? 0).toBeLessThan(frames.get(5120)?.firstTick ?? 0);
    const lieDownFrame = frames.get(5110);
    expect(lieDownFrame?.frames).toBeGreaterThanOrEqual(2);
    expect(lieDownFrame?.maxHitFallDownRecoverTime).toBeGreaterThanOrEqual(58);
    expect(lieDownFrame?.minHitFallDownRecoverTime).toBeLessThanOrEqual(54);
    expect(lieDownFrame?.firstHitFallDownRecoverTime).toBeGreaterThanOrEqual(58);
    expect(lieDownFrame?.lastHitFallDownRecoverTime).toBeLessThanOrEqual(54);
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      source: "imported",
      stateNo: 0,
      moveType: "I",
      ctrl: true,
    });
  });

  it("describes official KFM fall get-hit controller evidence without relying on numeric controller names", () => {
    expect(officialKfmFallGetHitControllerSequence()).toEqual({
      label: "Official KFM 5000/5030/5050/5100/5101/5110 fall get-hit controller and typed operation order",
      actorId: "p2",
      allowSameTick: true,
      steps: [
        { stateNo: 5000, controller: "ChangeState" },
        { stateNo: 5030, controller: "VelAdd" },
        { stateNo: 5030, controller: "HitVelSet" },
        { stateNo: 5030, operation: "kinematic:hitvelset" },
        { stateNo: 5030, controller: "ChangeState" },
        { stateNo: 5050, controller: "VelAdd" },
        { stateNo: 5050, controller: "ChangeState" },
        { stateNo: 5100, controller: "VelSet" },
        { stateNo: 5100, operation: "kinematic:velset" },
        { stateNo: 5100, controller: "ChangeState" },
        { stateNo: 5101, controller: "HitFallVel" },
        { stateNo: 5101, operation: "hitfall:hitfallvel" },
        { stateNo: 5101, controller: "VelAdd" },
        { stateNo: 5101, controller: "ChangeState" },
        { stateNo: 5110, controller: "HitFallDamage" },
        { stateNo: 5110, operation: "hitfall:hitfalldamage" },
        { stateNo: 5110, controller: "VelSet" },
        { stateNo: 5110, operation: "kinematic:velset" },
      ],
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
    expect(artifact.gates[0]?.requirements.requiredControllerEventSequences).toEqual([
      defaultFallGetHitControllerSequence(),
      defaultFallLieDownGetUpControllerSequence(),
    ]);
    expect(artifact.gates[0]?.requirements.requiredActorFrameSequences).toEqual([
      defaultFallGetHitActorFrameSequence([5000, 5030, 5050, 5100, 5101, 5110]),
      defaultFallLieDownGetUpActorFrameSequence(),
    ]);
    const shakeFrame = evidence?.actorFrames.find((frame) => frame.actorId === "p2" && frame.stateNo === 5000);
    const airFrame = evidence?.actorFrames.find((frame) => frame.actorId === "p2" && frame.stateNo === 5030);
    const fallFrame = evidence?.actorFrames.find((frame) => frame.actorId === "p2" && frame.stateNo === 5050);
    const groundFrame = evidence?.actorFrames.find((frame) => frame.actorId === "p2" && frame.stateNo === 5100);
    const bounceFrame = evidence?.actorFrames.find((frame) => frame.actorId === "p2" && frame.stateNo === 5101);
    const lieDownFrame = evidence?.actorFrames.find((frame) => frame.actorId === "p2" && frame.stateNo === 5110);
    const getUpFrame = evidence?.actorFrames.find((frame) => frame.actorId === "p2" && frame.stateNo === 5120);
    expect(shakeFrame?.moveType).toBe("H");
    expect(airFrame?.moveType).toBe("H");
    expect(fallFrame?.moveType).toBe("H");
    expect(groundFrame?.moveType).toBe("H");
    expect(bounceFrame?.moveType).toBe("H");
    expect(lieDownFrame?.moveType).toBe("H");
    expect(getUpFrame?.moveType).toBe("I");
    expect(shakeFrame?.lastTick ?? 0).toBeLessThan(airFrame?.firstTick ?? 0);
    expect(airFrame?.lastTick ?? 0).toBeLessThan(fallFrame?.firstTick ?? 0);
    expect(fallFrame?.lastTick ?? 0).toBeLessThan(groundFrame?.firstTick ?? 0);
    expect(groundFrame?.lastTick ?? 0).toBeLessThan(bounceFrame?.firstTick ?? 0);
    expect(bounceFrame?.lastTick ?? 0).toBeLessThan(lieDownFrame?.firstTick ?? 0);
    expect(lieDownFrame?.frames).toBeGreaterThanOrEqual(2);
    expect(lieDownFrame?.maxHitFallDownRecoverTime).toBeGreaterThanOrEqual(58);
    expect(lieDownFrame?.minHitFallDownRecoverTime).toBeLessThanOrEqual(54);
    expect(lieDownFrame?.firstHitFallDownRecoverTime).toBeGreaterThanOrEqual(58);
    expect(lieDownFrame?.lastHitFallDownRecoverTime).toBeLessThanOrEqual(54);
    expect(lieDownFrame?.lastTick ?? 0).toBeLessThan(getUpFrame?.firstTick ?? 0);
    expect(artifact.gates[0]?.requirements.requiredActorFrames).toEqual([
      {
        actorId: "p2",
        source: "imported",
        actorKind: "player",
        animNo: 5110,
        moveType: "H",
        observedHitFallDownRecoverTimeAtLeast: 58,
        observedHitFallDownRecoverTimeAtMost: 54,
        observedHitFallDownRecoverTimeDropAtLeast: 1,
        minFrames: 2,
      },
    ]);
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

  it("creates a required synthetic imported official-style Common1 air-recovery landing artifact", () => {
    const artifact = createSyntheticImportedDefaultFallOfficialAirRecoveryTraceArtifact({
      generatedAt: "2026-06-25T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-default-fall-official-air-recovery-golden",
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
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 5000, 5030, 5050, 5210, 52]));
    expect(evidence?.activeCommands).toEqual(expect.arrayContaining(["x", "recovery"]));
    const fallFrame = evidence?.actorFrames.find(
      (frame) => frame.actorId === "p2" && frame.source === "imported" && frame.stateNo === 5050,
    );
    const airRecoveryFrame = evidence?.actorFrames.find(
      (frame) => frame.actorId === "p2" && frame.source === "imported" && frame.stateNo === 5210,
    );
    const landFrame = evidence?.actorFrames.find(
      (frame) => frame.actorId === "p2" && frame.source === "imported" && frame.stateNo === 52,
    );
    expect(fallFrame?.firstHitFallRecoverTime).toBeGreaterThanOrEqual(1);
    expect(fallFrame?.lastHitFallRecoverTime).toBeLessThanOrEqual(0);
    expect(airRecoveryFrame?.minVel.x).toBeLessThanOrEqual(0);
    expect(airRecoveryFrame?.maxVel.x).toBeGreaterThanOrEqual(0);
    expect(airRecoveryFrame?.minVel.y).toBeLessThanOrEqual(-2);
    expect(landFrame?.maxPos.y).toBe(0);
    expect(artifact.gates[0]?.requirements.requiredActorFrameSequences).toEqual([
      {
        label: "5050 recoverTime countdown before 5210/52 air recovery",
        steps: [
          {
            actorId: "p2",
            source: "imported",
            actorKind: "player",
            stateNo: 5050,
            moveType: "H",
            observedHitFallRecoverTimeAtLeast: 1,
            observedHitFallRecoverTimeAtMost: 0,
            observedHitFallRecoverTimeDropAtLeast: 1,
            minFrames: 2,
          },
          {
            actorId: "p2",
            source: "imported",
            actorKind: "player",
            stateNo: 5210,
            moveType: "I",
            observedHitFallRecoverTimeAtMost: 0,
            observedVelXAtLeast: 0,
            observedVelXAtMost: 0,
            observedVelYAtMost: -2,
            minFrames: 1,
          },
          {
            actorId: "p2",
            source: "imported",
            actorKind: "player",
            stateNo: 52,
            moveType: "I",
            observedPosYAtLeast: 0,
            observedPosYAtMost: 0,
            minFrames: 1,
          },
        ],
      },
    ]);
    expect(artifact.gates[0]?.requirements.requiredControllerEventSequences).toEqual([
      defaultAirRecoveryLandControllerSequence(),
    ]);
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      source: "imported",
      stateNo: 0,
      moveType: "I",
      ctrl: true,
    });
  });

  it("creates a required synthetic imported air-entry Common1 recovery-input artifact from 5020", () => {
    const artifact = createSyntheticImportedDefaultAirFallRecoveryInputTraceArtifact({
      generatedAt: "2026-07-02T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-default-air-fall-recovery-input-golden",
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
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 5020, 5030, 5050, 5210, 52]));
    expect(evidence?.activeCommands).toEqual(expect.arrayContaining(["x", "recovery"]));
    expect(evidence?.executedControllers.HitDef).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.HitVelSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.HitFallSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["kinematic:hitvelset"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["kinematic:velset"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["hitfall:hitfallset"]).toBeGreaterThanOrEqual(1);
    expect(artifact.gates[0]?.requirements.requiredActorFrameSequences).toEqual([
      defaultAirFallRecoveryInputActorFrameSequence(),
    ]);
    expect(artifact.gates[0]?.requirements.requiredControllerEventSequences).toEqual([
      defaultAirFallRecoveryInputControllerSequence(),
    ]);
    const frames = new Map(
      [5020, 5030, 5050, 5210, 52].map((stateNo) => [
        stateNo,
        evidence?.actorFrames.find((frame) => frame.actorId === "p2" && frame.stateNo === stateNo),
      ]),
    );
    expect(frames.get(5020)).toMatchObject({ moveType: "H", stateType: "A", physics: "N" });
    expect(frames.get(5030)).toMatchObject({ moveType: "H" });
    expect(frames.get(5050)).toMatchObject({ moveType: "H" });
    expect(frames.get(5210)).toMatchObject({ moveType: "I" });
    expect(frames.get(52)).toMatchObject({ moveType: "I" });
    expect(frames.get(5020)?.lastTick ?? 0).toBeLessThan(frames.get(5030)?.firstTick ?? 0);
    expect(frames.get(5030)?.lastTick ?? 0).toBeLessThan(frames.get(5050)?.firstTick ?? 0);
    expect(frames.get(5050)?.lastTick ?? 0).toBeLessThan(frames.get(5210)?.firstTick ?? 0);
    expect(frames.get(5210)?.lastTick ?? 0).toBeLessThan(frames.get(52)?.firstTick ?? 0);
    expect(frames.get(5050)?.firstHitFallRecoverTime).toBeGreaterThanOrEqual(1);
    expect(frames.get(5050)?.lastHitFallRecoverTime).toBeLessThanOrEqual(0);
    expect(frames.get(5210)?.minVel.y).toBeLessThanOrEqual(-2);
    expect(frames.get(52)?.maxPos.y).toBe(0);
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      source: "imported",
      stateNo: 0,
      moveType: "I",
      ctrl: true,
    });
  });

  it("creates a required synthetic imported air-entry Common1 recovery-input too-early reject artifact from 5020", () => {
    const artifact = createSyntheticImportedDefaultAirFallRecoveryTooEarlyTraceArtifact({
      generatedAt: "2026-07-02T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-default-air-fall-recovery-too-early-golden",
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
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 5020, 5030, 5050]));
    for (const stateNo of [5210, 5200, 5201, 52, 5100]) {
      expect(evidence?.executedStates).not.toContain(stateNo);
    }
    expect(evidence?.activeCommands).toEqual(expect.arrayContaining(["x", "recovery"]));
    expect(evidence?.executedControllers.HitDef).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.HitVelSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["kinematic:hitvelset"]).toBeGreaterThanOrEqual(1);
    expect(artifact.gates[0]?.requirements.requiredActorFrameSequences).toEqual([
      defaultAirFallRecoveryTooEarlyActorFrameSequence(),
    ]);
    expect(artifact.gates[0]?.requirements.requiredControllerEventSequences).toEqual([
      defaultAirFallRecoveryTooEarlyControllerSequence(),
    ]);
    const frames = new Map(
      [5020, 5030, 5050].map((stateNo) => [
        stateNo,
        evidence?.actorFrames.find((frame) => frame.actorId === "p2" && frame.stateNo === stateNo),
      ]),
    );
    expect(frames.get(5020)).toMatchObject({ moveType: "H", stateType: "A", physics: "N" });
    expect(frames.get(5030)).toMatchObject({ moveType: "H" });
    expect(frames.get(5050)).toMatchObject({ moveType: "H" });
    expect(frames.get(5020)?.lastTick ?? 0).toBeLessThan(frames.get(5030)?.firstTick ?? 0);
    expect(frames.get(5030)?.lastTick ?? 0).toBeLessThan(frames.get(5050)?.firstTick ?? 0);
    expect(frames.get(5050)?.minHitFallRecoverTime).toBeGreaterThanOrEqual(1);
    expect(frames.get(5050)?.firstHitFallRecoverTime).toBeGreaterThan(
      frames.get(5050)?.lastHitFallRecoverTime ?? Number.POSITIVE_INFINITY,
    );
    expect(frames.get(5050)?.frames).toBeGreaterThanOrEqual(2);
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      source: "imported",
      stateNo: 5050,
      moveType: "H",
      ctrl: false,
    });
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
    expect(fallFrame?.minHitFallRecoverTime).toBeLessThanOrEqual(0);
    expect(fallFrame?.firstHitFallRecoverTime).toBeGreaterThanOrEqual(1);
    expect(fallFrame?.lastHitFallRecoverTime).toBeLessThanOrEqual(0);
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
        observedHitFallRecoverTimeAtMost: 0,
        observedHitFallRecoverTimeDropAtLeast: 1,
        minFrames: 2,
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
    expect(fallFrame?.minHitFallRecoverTime).toBeLessThanOrEqual(0);
    expect(fallFrame?.firstHitFallRecoverTime).toBeGreaterThanOrEqual(1);
    expect(fallFrame?.lastHitFallRecoverTime).toBeLessThanOrEqual(0);
    expect(recoveryFrame?.minHitFallRecoverTime).toBeLessThanOrEqual(0);
    expect(fallFrame?.lastTick).toBeLessThan(recoveryFrame?.firstTick ?? 0);
    expect(evidence?.controllerEvents.map((event) => event.controller)).toEqual(
      expect.arrayContaining(["VelAdd", "ChangeState", "VelSet", "HitFallSet"]),
    );
    const fallControllerEvents = evidence?.controllerEvents
      .filter((event) => event.actorId === "p2" && event.stateNo === 5050)
      .map((event) => event.controller);
    expect(fallControllerEvents).toEqual(expect.arrayContaining(["VelAdd", "ChangeState"]));
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
            observedHitFallRecoverTimeAtMost: 0,
            observedHitFallRecoverTimeDropAtLeast: 1,
            minFrames: 2,
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
    expect(artifact.gates[0]?.requirements.requiredControllerEventSequences).toEqual([
      {
        label: "5050 named recovery controller and typed operation order into 5210 settle",
        actorId: "p2",
        allowSameTick: true,
        steps: [
          { stateNo: 5050, controller: "VelAdd", name: "Gravity" },
          { stateNo: 5050, controller: "ChangeState", name: "Recovery Input" },
          { stateNo: 5210, controller: "VelSet", name: "Air Recovery Velocity" },
          { stateNo: 5210, operation: "kinematic:velset" },
          { stateNo: 5210, controller: "HitFallSet", name: "Fall Recovery Settled" },
          { stateNo: 5210, operation: "hitfall:hitfallset" },
          { stateNo: 5210, controller: "ChangeState", name: "Stand" },
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
    expect(artifact.gates[0]?.requirements.requiredControllerEventSequences).toEqual([
      {
        label: "5050/5200/5201/52 named ground-recovery controller and typed operation order",
        actorId: "p2",
        allowSameTick: true,
        steps: [
          { stateNo: 5050, controller: "VelAdd", name: "Gravity" },
          { stateNo: 5050, controller: "ChangeState", name: "Ground Recovery Input" },
          { stateNo: 5200, controller: "VelAdd", name: "Gravity" },
          { stateNo: 5200, controller: "SelfState", name: "Self Land" },
          { stateNo: 5201, controller: "VelSet", name: "Ground Recovery Velocity" },
          { stateNo: 5201, controller: "PosSet", name: "Ground Recovery Position" },
          { stateNo: 5201, operation: "kinematic:posset" },
          { stateNo: 5201, controller: "NotHitBy", name: "Safe Recovery" },
          { stateNo: 5201, operation: "eligibility:nothitby" },
          { stateNo: 5201, controller: "ChangeState", name: "Land" },
          { stateNo: 52, controller: "VelSet", name: "Land Velocity" },
          { stateNo: 52, operation: "kinematic:velset" },
          { stateNo: 52, controller: "PosSet", name: "Land Position" },
          { stateNo: 52, operation: "kinematic:posset" },
          { stateNo: 52, controller: "CtrlSet", name: "Land Ctrl" },
          { stateNo: 52, operation: "resource:ctrlset" },
        ],
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
    const fallFrame = evidence?.actorFrames.find((frame) => frame.actorId === "p2" && frame.stateNo === 5050);
    expect(fallFrame?.minHitFallRecoverTime).toBeGreaterThanOrEqual(1);
    expect(fallFrame?.firstHitFallRecoverTime).toBeGreaterThan(fallFrame?.lastHitFallRecoverTime ?? Number.POSITIVE_INFINITY);
    expect(fallFrame?.frames).toBeGreaterThanOrEqual(2);
    expect(artifact.gates[0]?.requirements.requiredActorFrames).toEqual([
      {
        actorId: "p2",
        source: "imported",
        actorKind: "player",
        stateNo: 5050,
        moveType: "H",
        observedHitFallRecoverTimeAtLeast: 1,
        observedHitFallRecoverTimeMinAtLeast: 1,
        observedHitFallRecoverTimeDropAtLeast: 1,
        minFrames: 2,
      },
    ]);
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
      requiredControllerEventSequences: [defaultFallLieDownGetUpControllerSequence()],
      requiredActorFrameSequences: [defaultFallLieDownGetUpActorFrameSequence()],
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
    expect(artifact.gates[0]?.requirements.requiredControllerEventSequences).toEqual([
      defaultFallLieDownGetUpControllerSequence(),
    ]);
    expect(artifact.gates[0]?.requirements.requiredActorFrameSequences).toEqual([
      defaultFallLieDownGetUpActorFrameSequence(),
    ]);
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      source: "imported",
      stateNo: 0,
      moveType: "I",
      ctrl: true,
    });
  });

  it("describes official KFM fall lie-down get-up controller evidence without relying on numeric controller names", () => {
    expect(officialKfmFallLieDownGetUpControllerSequence()).toEqual({
      label: "Official KFM 5110/5120 lie-down get-up controller and typed operation order",
      actorId: "p2",
      allowSameTick: true,
      steps: [
        { stateNo: 5110, controller: "HitFallDamage" },
        { stateNo: 5110, operation: "hitfall:hitfalldamage" },
        { stateNo: 5110, controller: "VelSet" },
        { stateNo: 5110, operation: "kinematic:velset" },
        { stateNo: 5120, controller: "VelSet" },
        { stateNo: 5120, operation: "kinematic:velset" },
        { stateNo: 5120, controller: "HitFallSet" },
        { stateNo: 5120, operation: "hitfall:hitfallset" },
        { stateNo: 5120, controller: "ChangeState" },
      ],
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
    expect(fallFrame?.minHitFallRecoverTime).toBeLessThanOrEqual(0);
    expect(fallFrame?.firstHitFallRecoverTime).toBeGreaterThanOrEqual(1);
    expect(fallFrame?.lastHitFallRecoverTime).toBeLessThanOrEqual(0);
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
        observedHitFallRecoverTimeAtMost: 0,
        observedHitFallRecoverTimeDropAtLeast: 1,
        minFrames: 2,
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
            observedHitFallRecoverTimeAtMost: 0,
            observedHitFallRecoverTimeDropAtLeast: 1,
            minFrames: 2,
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
    const fallFrame = evidence?.actorFrames.find((frame) => frame.actorId === "p2" && frame.stateNo === 5050);
    expect(fallFrame?.minHitFallRecoverTime).toBeGreaterThanOrEqual(1);
    expect(fallFrame?.firstHitFallRecoverTime).toBeGreaterThan(fallFrame?.lastHitFallRecoverTime ?? Number.POSITIVE_INFINITY);
    expect(fallFrame?.frames).toBeGreaterThanOrEqual(2);
    expect(artifact.gates[0]?.requirements.requiredActorFrames).toEqual([
      {
        actorId: "p2",
        source: "imported",
        actorKind: "player",
        stateNo: 5050,
        moveType: "H",
        observedHitFallRecoverTimeAtLeast: 1,
        observedHitFallRecoverTimeMinAtLeast: 1,
        observedHitFallRecoverTimeDropAtLeast: 1,
        minFrames: 2,
      },
    ]);
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

  it("creates a required synthetic imported official-style Common1 ground-recovery sequence artifact", () => {
    const artifact = createSyntheticImportedDefaultFallOfficialGroundRecoveryTraceArtifact({
      generatedAt: "2026-06-25T00:00:00.000Z",
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
    const fallFrame = evidence?.actorFrames.find(
      (frame) => frame.actorId === "p2" && frame.source === "imported" && frame.stateNo === 5050,
    );
    const groundFrame = evidence?.actorFrames.find(
      (frame) => frame.actorId === "p2" && frame.source === "imported" && frame.stateNo === 5201,
    );
    const landFrame = evidence?.actorFrames.find(
      (frame) => frame.actorId === "p2" && frame.source === "imported" && frame.stateNo === 52,
    );
    expect(fallFrame?.firstHitFallRecoverTime).toBeGreaterThanOrEqual(1);
    expect(fallFrame?.lastHitFallRecoverTime).toBeLessThanOrEqual(0);
    expect(groundFrame?.minVel.x).toBeLessThanOrEqual(-0.15);
    expect(groundFrame?.minVel.y).toBeLessThanOrEqual(-3.5);
    expect(landFrame?.maxPos.y).toBe(0);
    expect(artifact.gates[0]?.requirements.requiredActorFrameSequences).toEqual([
      {
        label: "5050 recoverTime countdown before 5200/5201/52 ground recovery",
        steps: [
          {
            actorId: "p2",
            source: "imported",
            actorKind: "player",
            stateNo: 5050,
            moveType: "H",
            observedHitFallRecoverTimeAtLeast: 1,
            observedHitFallRecoverTimeAtMost: 0,
            observedHitFallRecoverTimeDropAtLeast: 1,
            minFrames: 2,
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
          {
            actorId: "p2",
            source: "imported",
            actorKind: "player",
            stateNo: 5201,
            moveType: "H",
            observedVelXAtMost: -0.15,
            observedVelYAtMost: -3.5,
            observedPosYAtMost: 0,
            minFrames: 1,
          },
          {
            actorId: "p2",
            source: "imported",
            actorKind: "player",
            stateNo: 52,
            moveType: "I",
            observedPosYAtLeast: 0,
            observedPosYAtMost: 0,
            minFrames: 1,
          },
        ],
      },
    ]);
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
    expect(artifact.gates[0]?.requirements.requiredActorFrames).toEqual([
      { actorId: "p2", actorKind: "player", facing: 1, observedVelXAtLeast: 0.8, observedVelYAtMost: -3 },
    ]);
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p2",
          actorKind: "player",
          facing: 1,
          minVel: expect.objectContaining({ y: expect.any(Number) }),
          maxVel: expect.objectContaining({ x: expect.any(Number) }),
        }),
      ]),
    );
    expect(evidence?.finalActors.find((actor) => actor.id === "p1")).toMatchObject({
      actorKind: "player",
      source: "imported",
      targetCount: 0,
    });
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      actorKind: "player",
      life: 943,
      power: 40,
    });
    expect(artifact.trace.finalActors[0]?.actorKind).toBe("player");
  });

  it("creates a synthetic imported Target redirect artifact with target-memory trigger evidence", () => {
    const artifact = createSyntheticImportedTargetRedirectTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-target-redirect-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-target-redirect-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 286]));
    expect(evidence?.executedControllers.HitDef).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(evidence?.targetLinks).toEqual(
      expect.arrayContaining([expect.objectContaining({ ownerId: "p1", actorId: "p2", targetId: 77 })]),
    );
    expect(evidence?.finalActors.find((actor) => actor.id === "p1")).toMatchObject({
      actorKind: "player",
      source: "imported",
      stateNo: 286,
      animNo: 286,
    });
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      actorKind: "player",
      life: 963,
    });
  });

  it("creates a synthetic imported default Target redirect artifact with target id 0 evidence", () => {
    const artifact = createSyntheticImportedDefaultTargetRedirectTraceArtifact({ generatedAt: "2026-06-30T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-default-target-redirect-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-default-target-redirect-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(gate?.requirements.requiredExecutedStates).toEqual([200, 269]);
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 269]));
    expect(evidence?.executedControllers.HitDef).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(evidence?.targetLinks).toEqual(
      expect.arrayContaining([expect.objectContaining({ ownerId: "p1", actorId: "p2", targetId: 0 })]),
    );
    expect(evidence?.finalActors.find((actor) => actor.id === "p1")).toMatchObject({
      actorKind: "player",
      source: "imported",
      stateNo: 269,
      animNo: 269,
    });
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      actorKind: "player",
      life: 963,
    });
  });

  it("creates a synthetic imported bare Target redirect artifact with current target evidence", () => {
    const artifact = createSyntheticImportedBareTargetRedirectTraceArtifact({ generatedAt: "2026-06-30T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-bare-target-redirect-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-bare-target-redirect-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(gate?.requirements.requiredExecutedStates).toEqual([200, 270]);
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 270]));
    expect(evidence?.executedControllers.HitDef).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(evidence?.targetLinks).toEqual(
      expect.arrayContaining([expect.objectContaining({ ownerId: "p1", actorId: "p2", targetId: 77 })]),
    );
    expect(evidence?.finalActors.find((actor) => actor.id === "p1")).toMatchObject({
      actorKind: "player",
      source: "imported",
      stateNo: 270,
      animNo: 270,
    });
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      actorKind: "player",
      life: 963,
    });
  });

  it("creates a synthetic imported dynamic Target redirect artifact with variable-index trigger evidence", () => {
    const artifact = createSyntheticImportedTargetDynamicRedirectTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-target-dynamic-redirect-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-target-dynamic-redirect-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 287]));
    expect(evidence?.executedControllers.HitDef).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.VarSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["variable:varset"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.targetLinks).toEqual(
      expect.arrayContaining([expect.objectContaining({ ownerId: "p1", actorId: "p2", targetId: 77 })]),
    );
    expect(evidence?.finalActors.find((actor) => actor.id === "p1")).toMatchObject({
      actorKind: "player",
      source: "imported",
      stateNo: 287,
      animNo: 287,
    });
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      actorKind: "player",
      life: 963,
    });
  });

  it("creates a synthetic imported TargetLifeAdd NoKO artifact", () => {
    const artifact = createSyntheticImportedTargetNoKoTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-target-noko-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-target-noko-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedControllers.AssertSpecial).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.TargetLifeAdd).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["target:targetlifeadd"]).toBeGreaterThanOrEqual(1);
    expect(artifact.gates[0]?.requirements.requiredControllerEventSequences).toEqual([
      {
        label: "NoKO defender AssertSpecial before lethal TargetLifeAdd",
        allowSameTick: true,
        steps: [
          { actorId: "p2", stateNo: 0, controller: "AssertSpecial", name: "Passive AssertSpecial" },
          { actorId: "p1", stateNo: 200, controller: "HitDef" },
          { actorId: "p1", stateNo: 200, controller: "TargetLifeAdd", name: "Target Damage" },
        ],
      },
    ]);
    expect(evidence?.targetLinks).toEqual(
      expect.arrayContaining([expect.objectContaining({ ownerId: "p1", actorId: "p2", targetId: 77 })]),
    );
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      actorKind: "player",
      source: "imported",
      life: 1,
    });
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

  it("creates a synthetic imported HitPauseTime ignorehitpause artifact with active-state branch evidence", () => {
    const artifact = createSyntheticImportedHitPauseTimeIgnoreHitPauseTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-hitpausetime-ignorehitpause-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-hitpausetime-ignorehitpause-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(gate?.requirements.requiredExecutedControllers).toEqual([{ type: "ChangeState", minCount: 2 }, "HitDef"]);
    expect(gate?.requirements.requiredExecutedStates).toEqual([200, 220]);
    expect(gate?.requirements.requiredMatchPauseAdvances).toEqual([
      { type: "HitPause", actorId: "p1", actorKind: "player", ownerId: "p1", minAdvancedFrames: 1, minPreviousMoveTime: 1 },
    ]);
    expect(evidence?.executedControllers.ChangeState).toBeGreaterThanOrEqual(2);
    expect(evidence?.executedControllers.HitDef).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 220]));
    expect(evidence?.matchPauseAdvances).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "HitPause",
          actorId: "p1",
          actorKind: "player",
          ownerId: "p1",
          changedFields: expect.arrayContaining(["stateNo", "animNo"]),
        }),
      ]),
    );
    expect(evidence?.matchPauseFreezes).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: "HitPause", actorId: "p2", actorKind: "player", ownerId: "p2" })]),
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

  it("creates a synthetic imported Projectile Target redirect artifact with owner target-memory branch evidence", () => {
    const artifact = createSyntheticImportedProjectileTargetRedirectTraceArtifact({ generatedAt: "2026-07-01T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-projectile-target-redirect-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-projectile-target-redirect-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(evidence?.eventCategories).toContain("hit");
    expect(evidence?.combatReasons).toContain("hit");
    expect(evidence?.effectKinds).toContain("projectile");
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 277]));
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ actorId: "p1", source: "imported", actorKind: "player", stateNo: 277, animNo: 277 }),
        expect.objectContaining({ source: "effect", actorKind: "projectile", ownerId: "p1", animNo: 911 }),
        expect.objectContaining({ actorId: "p2", actorKind: "player", minLife: 969, maxLife: 969 }),
      ]),
    );
    expect(gate?.requirements.requiredTargetLinks).toEqual([{ ownerId: "p1", actorId: "p2", targetId: 77 }]);
    expect(evidence?.targetLinks).toEqual(
      expect.arrayContaining([expect.objectContaining({ ownerId: "p1", actorId: "p2", targetId: 77 })]),
    );
    expect(evidence?.finalActors).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "p2", actorKind: "player", life: 969 })]),
    );
    expect(evidence?.effectPayloads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1-projectile-0",
          effect: expect.objectContaining({ kind: "projectile", id: 77, hasHit: true, removalReason: "hit", terminalReason: "hit" }),
        }),
      ]),
    );
  });

  it("creates a synthetic imported HitDef plus Projectile target mix artifact with distinct target ids", () => {
    const artifact = createSyntheticImportedHitDefProjectileTargetMixTraceArtifact({ generatedAt: "2026-07-01T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-hitdef-projectile-target-mix-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-hitdef-projectile-target-mix-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(gate?.requirements.requiredExecutedStates).toEqual([200, 278]);
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 278]));
    expect(evidence?.executedControllers.HitDef).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.Projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.targetLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ownerId: "p1", actorId: "p2", targetId: 77 }),
        expect.objectContaining({ ownerId: "p1", actorId: "p2", targetId: 78 }),
      ]),
    );
    expect(evidence?.effectPayloads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          effect: expect.objectContaining({
            kind: "projectile",
            id: 78,
            hasHit: true,
            removalReason: "hit",
            terminalReason: "hit",
          }),
        }),
      ]),
    );
    expect(evidence?.finalActors.find((actor) => actor.id === "p1")).toMatchObject({
      actorKind: "player",
      source: "imported",
      stateNo: 278,
      animNo: 278,
    });
    expect(evidence?.finalActors.find((actor) => actor.id === "p2")).toMatchObject({
      actorKind: "player",
      life: 932,
    });
  });

  it("creates a synthetic imported Projectile Target controllers artifact with owner target side-effect evidence", () => {
    const artifact = createSyntheticImportedProjectileTargetControllersTraceArtifact({ generatedAt: "2026-07-01T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-projectile-target-controllers-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-projectile-target-controllers-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedControllers.Projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.HitDef ?? 0).toBe(0);
    expect(evidence?.executedControllers.TargetLifeAdd).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.TargetDrop).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["target:targetlifeadd"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["target:targetpoweradd"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["target:targetvelset"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["target:targetveladd"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["target:targetfacing"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["target:targetbind"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["target:targetdrop"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "effect", actorKind: "projectile", ownerId: "p1", animNo: 912 }),
        expect.objectContaining({ actorId: "p2", actorKind: "player", facing: 1, minLife: 949, maxLife: 949 }),
      ]),
    );
    expect(evidence?.targetLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ownerId: "p1", actorId: "p2", targetId: 77, hasBinding: false }),
        expect.objectContaining({
          ownerId: "p1",
          actorId: "p2",
          targetId: 77,
          hasBinding: true,
          bindingOffset: { x: 36, y: -12 },
        }),
      ]),
    );
    expect(evidence?.finalActors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "p1", actorKind: "player", source: "imported", targetCount: 0 }),
        expect.objectContaining({ id: "p2", actorKind: "player", life: 949, power: 40 }),
      ]),
    );
    expect(evidence?.effectPayloads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1-projectile-0",
          parentId: "p1",
          effect: expect.objectContaining({ kind: "projectile", id: 77, hitsRemaining: 0, hasHit: true }),
        }),
      ]),
    );
  });

  it("creates a synthetic imported Projectile default Target controllers artifact with target id zero side-effect evidence", () => {
    const artifact = createSyntheticImportedProjectileDefaultTargetControllersTraceArtifact({ generatedAt: "2026-07-01T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-projectile-default-target-controllers-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-projectile-default-target-controllers-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedControllers.Projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.HitDef ?? 0).toBe(0);
    expect(evidence?.executedControllers.TargetLifeAdd).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.TargetDrop).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["target:targetlifeadd"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["target:targetpoweradd"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["target:targetvelset"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["target:targetveladd"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["target:targetfacing"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["target:targetbind"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["target:targetdrop"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "effect", actorKind: "projectile", ownerId: "p1", animNo: 915 }),
        expect.objectContaining({ actorId: "p2", actorKind: "player", facing: 1, minLife: 949, maxLife: 949 }),
      ]),
    );
    expect(evidence?.targetLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ownerId: "p1", actorId: "p2", targetId: 0, hasBinding: false }),
        expect.objectContaining({
          ownerId: "p1",
          actorId: "p2",
          targetId: 0,
          hasBinding: true,
          bindingOffset: { x: 36, y: -12 },
        }),
      ]),
    );
    expect(evidence?.finalActors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "p1", actorKind: "player", source: "imported", targetCount: 0 }),
        expect.objectContaining({ id: "p2", actorKind: "player", life: 949, power: 40 }),
      ]),
    );
    expect(evidence?.effectPayloads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1-projectile-0",
          parentId: "p1",
          effect: expect.objectContaining({ kind: "projectile", id: 0, hitsRemaining: 0, hasHit: true }),
        }),
      ]),
    );
  });

  it("creates a synthetic imported Projectile TargetState artifact with owner-backed custom-state evidence", () => {
    const artifact = createSyntheticImportedProjectileTargetStateTraceArtifact({ generatedAt: "2026-07-01T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-projectile-targetstate-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-projectile-targetstate-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 888, 889]));
    expect(evidence?.executedControllers.Projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.HitDef ?? 0).toBe(0);
    expect(evidence?.executedControllers.TargetState).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.ChangeState).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.SelfState).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["target:targetstate"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.targetLinks).toEqual(expect.arrayContaining([expect.objectContaining({ ownerId: "p1", actorId: "p2", targetId: 77 })]));
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "effect", actorKind: "projectile", ownerId: "p1", animNo: 913 }),
        expect.objectContaining({ actorId: "p2", customOwnerId: "p1", animNo: 888, moveType: "H" }),
        expect.objectContaining({ actorId: "p2", customOwnerId: "p1", animNo: 889, moveType: "H" }),
      ]),
    );
    expect(evidence?.finalActors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "p2", customOwnerId: undefined, stateNo: 0, ctrl: true, moveType: "I", life: 969 }),
      ]),
    );
    expect(evidence?.effectPayloads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1-projectile-0",
          parentId: "p1",
          effect: expect.objectContaining({ kind: "projectile", id: 77, hitsRemaining: 0, hasHit: true }),
        }),
      ]),
    );
  });

  it("creates a synthetic imported Projectile default TargetState artifact with target id zero evidence", () => {
    const artifact = createSyntheticImportedProjectileDefaultTargetStateTraceArtifact({ generatedAt: "2026-07-01T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-projectile-default-targetstate-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-projectile-default-targetstate-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 888, 889]));
    expect(evidence?.executedControllers.Projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.HitDef ?? 0).toBe(0);
    expect(evidence?.executedControllers.TargetState).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["target:targetstate"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.targetLinks).toEqual(expect.arrayContaining([expect.objectContaining({ ownerId: "p1", actorId: "p2", targetId: 0 })]));
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "effect", actorKind: "projectile", ownerId: "p1", animNo: 914 }),
        expect.objectContaining({ actorId: "p2", customOwnerId: "p1", animNo: 888, moveType: "H" }),
        expect.objectContaining({ actorId: "p2", customOwnerId: "p1", animNo: 889, moveType: "H" }),
      ]),
    );
    expect(evidence?.finalActors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "p2", customOwnerId: undefined, stateNo: 0, ctrl: true, moveType: "I", life: 969 }),
      ]),
    );
    expect(evidence?.effectPayloads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1-projectile-0",
          parentId: "p1",
          effect: expect.objectContaining({ kind: "projectile", id: 0, hitsRemaining: 0, hasHit: true }),
        }),
      ]),
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

  it("creates a synthetic imported Projectile hit-time artifact with any-projectile branch evidence", () => {
    const artifact = createSyntheticImportedProjectileHitTimeAnyTraceArtifact({ generatedAt: "2026-07-01T00:00:00.000Z" });
    const evidence = artifact.gates[0]?.evidence;

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-projectile-hittime-any-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-projectile-hittime-any-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    expect(evidence?.effectKinds).toContain("projectile");
    expect(evidence?.executedStates).toContain(282);
    expect(evidence?.executedControllers.Projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toContain("hit");
    expect(evidence?.combatReasons).toContain("hit");
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([200, 282]);
    expect(evidence?.targetLinks).toEqual(
      expect.arrayContaining([expect.objectContaining({ ownerId: "p1", actorId: "p2", targetId: 77 })]),
    );
  });

  it("creates a synthetic imported Projectile contact-time artifact with any-projectile branch evidence", () => {
    const artifact = createSyntheticImportedProjectileContactTimeAnyTraceArtifact({ generatedAt: "2026-07-01T00:00:00.000Z" });
    const evidence = artifact.gates[0]?.evidence;

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-projectile-contacttime-any-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-projectile-contacttime-any-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    expect(evidence?.effectKinds).toContain("projectile");
    expect(evidence?.executedStates).toContain(281);
    expect(evidence?.executedControllers.Projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toContain("hit");
    expect(evidence?.combatReasons).toContain("hit");
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([200, 281]);
    expect(evidence?.targetLinks).toEqual(
      expect.arrayContaining([expect.objectContaining({ ownerId: "p1", actorId: "p2", targetId: 77 })]),
    );
  });

  it("creates a synthetic imported Projectile contact-time artifact with fixed-id branch evidence", () => {
    const artifact = createSyntheticImportedProjectileContactTimeTraceArtifact({ generatedAt: "2026-07-01T00:00:00.000Z" });
    const evidence = artifact.gates[0]?.evidence;

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-projectile-contacttime-id-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-projectile-contacttime-id-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    expect(evidence?.effectKinds).toContain("projectile");
    expect(evidence?.executedStates).toContain(321);
    expect(evidence?.executedControllers.Projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toContain("hit");
    expect(evidence?.combatReasons).toContain("hit");
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([200, 321]);
    expect(evidence?.targetLinks).toEqual(
      expect.arrayContaining([expect.objectContaining({ ownerId: "p1", actorId: "p2", targetId: 77 })]),
    );
  });

  it("creates a synthetic imported Projectile guarded-time artifact with any-projectile branch evidence", () => {
    const artifact = createSyntheticImportedProjectileGuardedTimeAnyTraceArtifact({ generatedAt: "2026-07-01T00:00:00.000Z" });
    const evidence = artifact.gates[0]?.evidence;

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-projectile-guardedtime-any-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-projectile-guardedtime-any-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    expect(evidence?.effectKinds).toContain("projectile");
    expect(evidence?.executedStates).toContain(279);
    expect(evidence?.executedControllers.Projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toContain("guard");
    expect(evidence?.combatReasons).toContain("guard");
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([200, 279]);
    expect(evidence?.targetLinks).toEqual(
      expect.arrayContaining([expect.objectContaining({ ownerId: "p1", actorId: "p2", targetId: 77 })]),
    );
  });

  it("creates a synthetic imported Projectile guarded-time artifact with fixed-id branch evidence", () => {
    const artifact = createSyntheticImportedProjectileGuardedTimeTraceArtifact({ generatedAt: "2026-07-01T00:00:00.000Z" });
    const evidence = artifact.gates[0]?.evidence;

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-projectile-guardedtime-id-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-projectile-guardedtime-id-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    expect(evidence?.effectKinds).toContain("projectile");
    expect(evidence?.executedStates).toContain(322);
    expect(evidence?.executedControllers.Projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toContain("guard");
    expect(evidence?.combatReasons).toContain("guard");
    expect(artifact.gates[0]?.requirements.requiredExecutedStates).toEqual([200, 322]);
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

  it("creates a synthetic imported ModifyExplod artifact with live visual explod mutation evidence", () => {
    const artifact = createSyntheticImportedModifyExplodTraceArtifact({ generatedAt: "2026-06-25T00:00:00.000Z" });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-modifyexplod-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-modifyexplod-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedControllers.ModifyExplod).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.modifyexplod).toBeGreaterThanOrEqual(1);
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "effect",
          actorKind: "explod",
          ownerId: "p1",
          animNo: 931,
          maxScale: expect.objectContaining({ x: 2 }),
          minScale: expect.objectContaining({ y: 0.5 }),
        }),
      ]),
    );
    expect(artifact.gates[0]?.requirements.requiredExecutedControllers).toEqual([
      "ChangeState",
      "HitDef",
      "Explod",
      "ModifyExplod",
    ]);
    expect(artifact.gates[0]?.requirements.requiredExecutedOperations).toEqual([
      "hitdef",
      "explod",
      "modifyexplod",
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
    expect(evidence?.contactEffectPackages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1",
          source: "imported",
          actorKind: "player",
          contactKind: "hit",
          sound: expect.objectContaining({ type: "PlaySnd", group: 5, index: 0, contactKind: "hit" }),
          hitEffect: expect.objectContaining({
            kind: "hit",
            sparkNo: 7002,
            raw: "F7002",
            rawPrefix: "F",
            assetSource: "fightfx",
            assetActionId: 7002,
            assetFrameCount: 2,
            assetTotalDuration: 11,
            offset: { x: 18, y: -68 },
          }),
        }),
      ]),
    );
    expect(artifact.gates[0]?.requirements.requiredContactEffectPackages).toEqual([
      expect.objectContaining({
        contactKind: "hit",
        hitEffect: expect.objectContaining({ kind: "hit", sparkNo: 7002, offsetX: 18, offsetY: -68 }),
      }),
    ]);
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
    expect(evidence?.contactEffectPackages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          actorId: "p1",
          source: "imported",
          actorKind: "player",
          contactKind: "guard",
          sound: expect.objectContaining({ type: "PlaySnd", group: 6, index: 0, contactKind: "guard" }),
          hitEffect: expect.objectContaining({
            kind: "guard",
            sparkNo: 7004,
            raw: "F7004",
            rawPrefix: "F",
            assetSource: "fightfx",
            assetActionId: 7004,
            assetFrameCount: 2,
            assetTotalDuration: 11,
            offset: { x: 15, y: -63 },
          }),
        }),
      ]),
    );
    expect(artifact.gates[0]?.requirements.requiredContactEffectPackages).toEqual([
      expect.objectContaining({
        contactKind: "guard",
        hitEffect: expect.objectContaining({ kind: "guard", sparkNo: 7004, offsetX: 15, offsetY: -63 }),
      }),
    ]);
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

  it("creates a synthetic imported Projectile cancel-time artifact with owner-state branch evidence", () => {
    const artifact = createSyntheticImportedProjectileCancelTimeTraceArtifact({
      generatedAt: "2026-07-01T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-projectile-canceltime-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-projectile-canceltime-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedControllers.ChangeState).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.Projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 283]));
    expect(evidence?.eventLines.some((line) => line.includes("p2-projectile-0 cancel removal anim 915"))).toBe(true);
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "effect", actorKind: "projectile", ownerId: "p2", animNo: 915, moveType: "I", clsn1Count: 0 }),
      ]),
    );
    expect(evidence?.effectPayloads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ownerId: "p2",
          effect: expect.objectContaining({ kind: "projectile", id: 77, hasHit: true, removalReason: "cancel", terminalReason: "cancel" }),
        }),
      ]),
    );
  });

  it("creates a synthetic imported Projectile cancel-time dynamic-id artifact with owner-state branch evidence", () => {
    const artifact = createSyntheticImportedProjectileCancelTimeDynamicTraceArtifact({
      generatedAt: "2026-07-01T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-projectile-canceltime-dynamic-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-projectile-canceltime-dynamic-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedControllers.ChangeState).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.Projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 318]));
    expect(evidence?.eventLines.some((line) => line.includes("p2-projectile-0 cancel removal anim 916"))).toBe(true);
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "effect", actorKind: "projectile", ownerId: "p2", animNo: 916, moveType: "I", clsn1Count: 0 }),
      ]),
    );
    expect(evidence?.effectPayloads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ownerId: "p2",
          effect: expect.objectContaining({ kind: "projectile", id: 77, hasHit: true, removalReason: "cancel", terminalReason: "cancel" }),
        }),
      ]),
    );
  });

  it("creates a synthetic imported Projectile cancel-time any-id artifact with owner-state branch evidence", () => {
    const artifact = createSyntheticImportedProjectileCancelTimeAnyTraceArtifact({
      generatedAt: "2026-07-01T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-projectile-canceltime-any-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-projectile-canceltime-any-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedControllers.ChangeState).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.Projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 320]));
    expect(evidence?.eventLines.some((line) => line.includes("p2-projectile-0 cancel removal anim 918"))).toBe(true);
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "effect", actorKind: "projectile", ownerId: "p2", animNo: 918, moveType: "I", clsn1Count: 0 }),
      ]),
    );
    expect(evidence?.effectPayloads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ownerId: "p2",
          effect: expect.objectContaining({ kind: "projectile", id: 77, hasHit: true, removalReason: "cancel", terminalReason: "cancel" }),
        }),
      ]),
    );
  });

  it("creates a synthetic imported Projectile cancel-time var-id artifact with owner-state branch evidence", () => {
    const artifact = createSyntheticImportedProjectileCancelTimeVarTraceArtifact({
      generatedAt: "2026-07-01T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-projectile-canceltime-var-golden",
        source: "imported",
      },
      gates: [
        {
          label: "synthetic-imported-projectile-canceltime-var-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const evidence = artifact.gates[0]?.evidence;
    expect(evidence?.executedControllers.ChangeState).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.Projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.VarSet).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations["variable:varset"]).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedStates).toEqual(expect.arrayContaining([200, 319]));
    expect(evidence?.eventLines.some((line) => line.includes("p2-projectile-0 cancel removal anim 917"))).toBe(true);
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "effect", actorKind: "projectile", ownerId: "p2", animNo: 917, moveType: "I", clsn1Count: 0 }),
      ]),
    );
    expect(evidence?.effectPayloads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ownerId: "p2",
          effect: expect.objectContaining({ kind: "projectile", id: 77, hasHit: true, removalReason: "cancel", terminalReason: "cancel" }),
        }),
      ]),
    );
  });

  it("creates a synthetic imported Helper ProjCancelTime any artifact with helper-local cancel evidence", () => {
    const artifact = createSyntheticImportedHelperProjCancelTimeAnyTraceArtifact({
      generatedAt: "2026-07-01T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-helper-projcanceltime-any-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-helper-projcanceltime-any-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(evidence?.executedControllers.Helper).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.Projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.helper).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventLines.some((line) => line.includes("p1-projectile-0 cancel removal anim 998"))).toBe(true);
    expect(gate?.requirements.requiredEventSubstrings).toEqual([
      "Projectile clash",
      "canceled",
      "3 > 1",
      "p1-projectile-0 cancel removal anim 998",
    ]);
    expect(evidence?.worldLifecycleEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "spawn", kind: "helper", ownerId: "p1", rootId: "p1", parentId: "p1" }),
        expect.objectContaining({ type: "spawn", kind: "projectile", ownerId: "p1", rootId: "p1", parentId: "p1-helper-0" }),
        expect.objectContaining({ type: "spawn", kind: "projectile", ownerId: "p2", rootId: "p2", parentId: "p2" }),
        expect.objectContaining({ type: "remove", kind: "projectile", ownerId: "p1", rootId: "p1", parentId: "p1-helper-0" }),
      ]),
    );
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1266, animNo: 995 }),
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1267, animNo: 996 }),
        expect.objectContaining({ source: "effect", actorKind: "projectile", ownerId: "p1", animNo: 998, moveType: "I", clsn1Count: 0 }),
      ]),
    );
    expect(evidence?.effectPayloads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ownerId: "p1",
          parentId: "p1-helper-0",
          effect: expect.objectContaining({ kind: "projectile", id: 8867, hasHit: true, removalReason: "cancel", terminalReason: "cancel" }),
        }),
        expect.objectContaining({
          ownerId: "p1",
          effect: expect.objectContaining({ kind: "helper", id: 42, stateNo: 1267 }),
        }),
      ]),
    );
  });

  it("creates a synthetic imported Helper ProjCancelTime fixed-id artifact with helper-local cancel evidence", () => {
    const artifact = createSyntheticImportedHelperProjCancelTimeIdTraceArtifact({
      generatedAt: "2026-07-01T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-helper-projcanceltime-id-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-helper-projcanceltime-id-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(evidence?.executedControllers.Helper).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.Projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.helper).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventLines.some((line) => line.includes("p1-projectile-0 cancel removal anim 1008"))).toBe(true);
    expect(gate?.requirements.requiredEventSubstrings).toEqual([
      "Projectile clash",
      "canceled",
      "3 > 1",
      "p1-projectile-0 cancel removal anim 1008",
    ]);
    expect(evidence?.worldLifecycleEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "spawn", kind: "helper", ownerId: "p1", rootId: "p1", parentId: "p1" }),
        expect.objectContaining({ type: "spawn", kind: "projectile", ownerId: "p1", rootId: "p1", parentId: "p1-helper-0" }),
        expect.objectContaining({ type: "spawn", kind: "projectile", ownerId: "p2", rootId: "p2", parentId: "p2" }),
        expect.objectContaining({ type: "remove", kind: "projectile", ownerId: "p1", rootId: "p1", parentId: "p1-helper-0" }),
      ]),
    );
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1268, animNo: 1005 }),
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1269, animNo: 1006 }),
        expect.objectContaining({ source: "effect", actorKind: "projectile", ownerId: "p1", animNo: 1008, moveType: "I", clsn1Count: 0 }),
      ]),
    );
    expect(evidence?.effectPayloads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ownerId: "p1",
          effect: expect.objectContaining({ kind: "helper", id: 42, stateNo: 1269 }),
        }),
        expect.objectContaining({
          ownerId: "p1",
          effect: expect.objectContaining({ kind: "projectile", id: 8868, removalReason: "cancel", terminalReason: "cancel" }),
        }),
      ]),
    );
  });

  it("creates a synthetic imported Helper ProjCancelTime dynamic-id artifact with helper-local cancel evidence", () => {
    const artifact = createSyntheticImportedHelperProjCancelTimeDynamicTraceArtifact({
      generatedAt: "2026-07-01T00:00:00.000Z",
    });

    expect(artifact).toMatchObject({
      status: "passed",
      target: {
        id: "synthetic-imported-helper-projcanceltime-dynamic-golden",
        source: "mixed",
      },
      gates: [
        {
          label: "synthetic-imported-helper-projcanceltime-dynamic-golden",
          passed: true,
          failures: [],
        },
      ],
    });
    const gate = artifact.gates[0];
    const evidence = gate?.evidence;
    expect(evidence?.executedControllers.Helper).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedControllers.Projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.helper).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventLines.some((line) => line.includes("p1-projectile-0 cancel removal anim 1018"))).toBe(true);
    expect(gate?.requirements.requiredEventSubstrings).toEqual([
      "Projectile clash",
      "canceled",
      "3 > 1",
      "p1-projectile-0 cancel removal anim 1018",
    ]);
    expect(evidence?.actorFrames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1270, animNo: 1015 }),
        expect.objectContaining({ source: "effect", actorKind: "helper", ownerId: "p1", stateNo: 1271, animNo: 1016 }),
        expect.objectContaining({ source: "effect", actorKind: "projectile", ownerId: "p1", animNo: 1018, moveType: "I", clsn1Count: 0 }),
      ]),
    );
    expect(evidence?.effectPayloads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ownerId: "p1",
          parentId: "p1-helper-0",
          effect: expect.objectContaining({ kind: "projectile", id: 8869, hasHit: true, removalReason: "cancel", terminalReason: "cancel" }),
        }),
        expect.objectContaining({
          ownerId: "p1",
          effect: expect.objectContaining({ kind: "helper", id: 42, stateNo: 1271 }),
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
    expect(importedDefaultCrouchGetHitScript().map((frame) => frame.label).filter(Boolean)).toEqual([
      "imported-default-crouch-gethit-prep",
      "imported-default-crouch-gethit-x",
    ]);
    expect(importedDefaultAirGetHitScript().map((frame) => frame.label).filter(Boolean)).toEqual([
      "imported-default-air-gethit-jump",
      "imported-default-air-gethit-x",
    ]);
    expect(importedDefaultGetHitProgressionScript().map((frame) => frame.label).filter(Boolean)).toEqual([
      "imported-default-gethit-progress-x",
      "default-gethit-progress-settle",
    ]);
    expect(importedDefaultFallGetHitScript().map((frame) => frame.label).filter(Boolean)).toEqual([
      "imported-default-fall-gethit-x",
      "default-fall-gethit-settle",
    ]);
    expect(importedDefaultAirFallGetHitScript().map((frame) => frame.label).filter(Boolean)).toEqual([
      "imported-default-air-fall-gethit-jump",
      "imported-default-air-fall-gethit-x",
      "default-air-fall-gethit-settle",
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
    expect(qcfXContactScript().map((frame) => frame.label).filter(Boolean)).toEqual([
      "qcf-d",
      "qcf-df",
      "qcf-f",
      "qcf-x",
      "qcf-contact-settle",
    ]);
    expect(qcfXContactScript()).toHaveLength(31);
  });

  it("describes official KFM QCF x contact trace sequence requirements", () => {
    expect(officialKfmQcfXControllerSequence().steps).toEqual([
      { stateNo: 20, controller: "ChangeState" },
      { stateNo: 1000, controller: "PosAdd" },
      { stateNo: 1000, operation: "kinematic:posadd" },
      { stateNo: 1000, controller: "HitDef" },
      { stateNo: 1000, operation: "hitdef" },
    ]);

    expect(officialKfmQcfXActorFrameSequence().steps).toEqual([
      expect.objectContaining({
        actorId: "p1",
        source: "imported",
        actorKind: "player",
        stateNo: 11,
        animNo: 11,
        minFrames: 4,
      }),
      expect.objectContaining({
        actorId: "p1",
        source: "imported",
        actorKind: "player",
        stateNo: 20,
        animNo: 20,
        minFrames: 2,
      }),
      expect.objectContaining({
        actorId: "p1",
        source: "imported",
        actorKind: "player",
        stateNo: 1000,
        animNo: 1000,
        minFrames: 8,
      }),
    ]);
  });
});

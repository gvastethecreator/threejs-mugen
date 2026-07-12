const fs = require("fs");
const path = require("path");

function mergeScheduleCatalog(entries) {
  const byId = new Map();
  const definitions = new Map();
  const conflicts = [];
  for (const entry of entries) {
    const definition = JSON.stringify(entry);
    const previous = definitions.get(entry.id);
    if (previous !== undefined && previous !== definition) {
      conflicts.push(`conflicting definition for ${entry.id}`);
      continue;
    }
    definitions.set(entry.id, definition);
    if (!byId.has(entry.id)) {
      byId.set(entry.id, entry);
    }
  }
  return { values: [...byId.values()], conflicts };
}
const { File } = require("node:buffer");

const DEFAULT_OUT_DIR = ".scratch/qa/trace-gates";
const DEFAULT_KFM_FIXTURE = ".scratch/fixtures/kfm-official.zip";

async function main() {
  const outDir = path.resolve(process.cwd(), process.env.QA_TRACE_OUT_DIR ?? DEFAULT_OUT_DIR);
  fs.mkdirSync(outDir, { recursive: true });

  const vite = await createViteLoader();
  const artifacts = [];
  const skipped = [];

  try {
    const presets = await vite.ssrLoadModule("/src/mugen/runtime/RuntimeTraceGatePresets.ts");
    artifacts.push({
      name: "native-hit",
      required: true,
      artifact: presets.createNativeHitTraceArtifact(),
    });
    artifacts.push({
      name: "native-whiff",
      required: true,
      artifact: presets.createNativeWhiffTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-x",
      required: true,
      artifact: presets.createSyntheticImportedXTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-basic-movement",
      required: true,
      artifact: presets.createSyntheticImportedBasicMovementTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-movecontact",
      required: true,
      artifact: presets.createSyntheticImportedMoveContactTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-movehit-counter",
      required: true,
      artifact: presets.createSyntheticImportedMoveHitCounterTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-movehitreset",
      required: true,
      artifact: presets.createSyntheticImportedMoveHitResetTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-movehitpersist",
      required: true,
      artifact: presets.createSyntheticImportedMoveHitPersistTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitdefpersist",
      required: true,
      artifact: presets.createSyntheticImportedHitDefPersistTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitcount",
      required: true,
      artifact: presets.createSyntheticImportedHitCountTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitcountpersist",
      required: true,
      artifact: presets.createSyntheticImportedHitCountPersistTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitadd",
      required: true,
      artifact: presets.createSyntheticImportedHitAddTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-variable",
      required: true,
      artifact: presets.createSyntheticImportedVariableTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-resource",
      required: true,
      artifact: presets.createSyntheticImportedResourceTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-control",
      required: true,
      artifact: presets.createSyntheticImportedControlTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-control-dynamic",
      required: true,
      artifact: presets.createSyntheticImportedDynamicControlTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-lifeadd-dynamic",
      required: true,
      artifact: presets.createSyntheticImportedDynamicLifeAddTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-resourceset-dynamic",
      required: true,
      artifact: presets.createSyntheticImportedDynamicResourceSetTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-animation",
      required: true,
      artifact: presets.createSyntheticImportedAnimationTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-changeanim2-elem",
      required: true,
      artifact: presets.createSyntheticImportedChangeAnim2ElemTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-animtime",
      required: true,
      artifact: presets.createSyntheticImportedAnimTimeTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-animelemtime",
      required: true,
      artifact: presets.createSyntheticImportedAnimElemTimeTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-animelem",
      required: true,
      artifact: presets.createSyntheticImportedAnimElemTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-animelem-offset",
      required: true,
      artifact: presets.createSyntheticImportedAnimElemOffsetTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-edge-distance",
      required: true,
      artifact: presets.createSyntheticImportedEdgeDistanceTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-sound",
      required: true,
      artifact: presets.createSyntheticImportedSoundTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-sound-dynamic-pan",
      required: true,
      artifact: presets.createSyntheticImportedDynamicSoundPanTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-sound-dynamic-value",
      required: true,
      artifact: presets.createSyntheticImportedDynamicSoundValueTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-noop",
      required: true,
      artifact: presets.createSyntheticImportedNoOpTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-envshake",
      required: true,
      artifact: presets.createSyntheticImportedEnvShakeTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-receiveddamage",
      required: true,
      artifact: presets.createSyntheticImportedReceivedDamageTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitdefattr",
      required: true,
      artifact: presets.createSyntheticImportedHitDefAttrTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-prevstateno",
      required: true,
      artifact: presets.createSyntheticImportedPrevStateTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-prevmovetype",
      required: true,
      artifact: presets.createSyntheticImportedPrevMoveTypeTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-prevanim",
      required: true,
      artifact: presets.createSyntheticImportedPrevAnimTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-prevstatetype",
      required: true,
      artifact: presets.createSyntheticImportedPrevStateTypeTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-enemynear",
      required: true,
      artifact: presets.createSyntheticImportedEnemyNearTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-enemynear-index",
      required: true,
      artifact: presets.createSyntheticImportedEnemyNearIndexTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-p2metrics",
      required: true,
      artifact: presets.createSyntheticImportedP2MetricsTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-teamside",
      required: true,
      artifact: presets.createSyntheticImportedTeamSideTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-p2-state-context",
      required: true,
      artifact: presets.createSyntheticImportedP2StateContextTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-p2-distance",
      required: true,
      artifact: presets.createSyntheticImportedP2DistanceTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-owner-metrics",
      required: true,
      artifact: presets.createSyntheticImportedOwnerMetricsTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-identity",
      required: true,
      artifact: presets.createSyntheticImportedIdentityTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-selfstatenoexist",
      required: true,
      artifact: presets.createSyntheticImportedSelfStateNoExistTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-selfanimexist",
      required: true,
      artifact: presets.createSyntheticImportedSelfAnimExistTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-selfcommand",
      required: true,
      artifact: presets.createSyntheticImportedSelfCommandTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-stagetime",
      required: true,
      artifact: presets.createSyntheticImportedStageTimeTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-gametime",
      required: true,
      artifact: presets.createSyntheticImportedGameTimeTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-gamespace",
      required: true,
      artifact: presets.createSyntheticImportedGameSpaceTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-screenspace",
      required: true,
      artifact: presets.createSyntheticImportedScreenSpaceTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-config-gamespace",
      required: true,
      artifact: presets.createSyntheticImportedConfigGameSpaceTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-const-coordinate",
      required: true,
      artifact: presets.createSyntheticImportedConstCoordinateTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-const-controller-param",
      required: true,
      artifact: presets.createSyntheticImportedConstControllerParamTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-state-context",
      required: true,
      artifact: presets.createSyntheticImportedStateContextTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-alive",
      required: true,
      artifact: presets.createSyntheticImportedAliveTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-round-trigger",
      required: true,
      artifact: presets.createSyntheticImportedRoundTriggerTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-round-ko",
      required: true,
      artifact: presets.createSyntheticImportedRoundKoTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-round-timeover",
      required: true,
      artifact: presets.createSyntheticImportedRoundTimeOverTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-match-context",
      required: true,
      artifact: presets.createSyntheticImportedMatchContextTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-resource-max",
      required: true,
      artifact: presets.createSyntheticImportedResourceMaxTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-numtarget",
      required: true,
      artifact: presets.createSyntheticImportedNumTargetTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-default-numtarget",
      required: true,
      artifact: presets.createSyntheticImportedDefaultNumTargetTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-default-target-redirect",
      required: true,
      artifact: presets.createSyntheticImportedDefaultTargetRedirectTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-bare-target-redirect",
      required: true,
      artifact: presets.createSyntheticImportedBareTargetRedirectTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-numhelper",
      required: true,
      artifact: presets.createSyntheticImportedNumHelperTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-numproj",
      required: true,
      artifact: presets.createSyntheticImportedNumProjTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-numexplod",
      required: true,
      artifact: presets.createSyntheticImportedNumExplodTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-removeexplod",
      required: true,
      artifact: presets.createSyntheticImportedRemoveExplodTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-reject",
      required: true,
      artifact: presets.createSyntheticImportedRejectTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitby-allow",
      required: true,
      artifact: presets.createSyntheticImportedHitByAllowTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitby-reject",
      required: true,
      artifact: presets.createSyntheticImportedHitByRejectTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitoverride",
      required: true,
      artifact: presets.createSyntheticImportedHitOverrideTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitoverride-slot-priority",
      required: true,
      artifact: presets.createSyntheticImportedHitOverrideSlotPriorityTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitoverride-guardflag-filter",
      required: true,
      artifact: presets.createSyntheticImportedHitOverrideGuardFlagFilterTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitoverride-forceair-forceguard-keepstate",
      required: true,
      artifact: presets.createSyntheticImportedHitOverrideForceAirGuardKeepStateTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitoverride-guardflag-forceair-forceguard-keepstate",
      required: true,
      artifact: presets.createSyntheticImportedHitOverrideGuardFlagForceAirGuardKeepStateTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitoverride-p2stateno-miss",
      required: true,
      artifact: presets.createSyntheticImportedHitOverrideP2StateNoMissTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitoverride-p2getp1state-zero-miss",
      required: true,
      artifact: presets.createSyntheticImportedHitOverrideP2GetP1StateZeroMissTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitoverride-missonoverride-zero",
      required: true,
      artifact: presets.createSyntheticImportedHitOverrideMissOnOverrideZeroTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitoverride-missonoverride-zero-forceair-forceguard-keepstate",
      required: true,
      artifact: presets.createSyntheticImportedHitOverrideMissOnOverrideZeroForceAirGuardKeepStateTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitoverride-missonoverride-default-forceair-forceguard-keepstate",
      required: true,
      artifact: presets.createSyntheticImportedHitOverrideDefaultMissOnOverrideForceAirGuardKeepStateTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitoverride-missonoverride-default-guardflag-filter",
      required: true,
      artifact: presets.createSyntheticImportedHitOverrideDefaultMissOnOverrideGuardFlagFilterTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitoverride-missonoverride-zero-slot-priority",
      required: true,
      artifact: presets.createSyntheticImportedHitOverrideMissOnOverrideZeroSlotPriorityTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitoverride-missonoverride-zero-guardflag-filter",
      required: true,
      artifact: presets.createSyntheticImportedHitOverrideMissOnOverrideZeroGuardFlagFilterTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitoverride-missonoverride-one",
      required: true,
      artifact: presets.createSyntheticImportedHitOverrideMissOnOverrideOneTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-hitoverride-p2stateno",
      required: true,
      artifact: presets.createSyntheticImportedProjectileHitOverrideP2StateNoTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-hitoverride-slot-priority",
      required: true,
      artifact: presets.createSyntheticImportedProjectileHitOverrideSlotPriorityTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-hitoverride-missonoverride-zero-slot-priority",
      required: true,
      artifact: presets.createSyntheticImportedProjectileHitOverrideMissOnOverrideZeroSlotPriorityTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-hitoverride-missonoverride-zero-guardflag-filter",
      required: true,
      artifact: presets.createSyntheticImportedProjectileHitOverrideMissOnOverrideZeroGuardFlagFilterTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-hitoverride-guardflag-filter",
      required: true,
      artifact: presets.createSyntheticImportedProjectileHitOverrideGuardFlagFilterTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-hitoverride-forceair-forceguard-keepstate",
      required: true,
      artifact: presets.createSyntheticImportedProjectileHitOverrideForceAirGuardKeepStateTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-hitoverride-guardflag-forceair-forceguard-keepstate",
      required: true,
      artifact: presets.createSyntheticImportedProjectileHitOverrideGuardFlagForceAirGuardKeepStateTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-hitoverride-missonoverride-zero",
      required: true,
      artifact: presets.createSyntheticImportedProjectileHitOverrideMissOnOverrideZeroTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-hitoverride-missonoverride-zero-forceair-forceguard-keepstate",
      required: true,
      artifact: presets.createSyntheticImportedProjectileHitOverrideMissOnOverrideZeroForceAirGuardKeepStateTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-hitoverride-missonoverride-default-forceair-forceguard-keepstate",
      required: true,
      artifact: presets.createSyntheticImportedProjectileHitOverrideDefaultMissOnOverrideForceAirGuardKeepStateTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-hitoverride-missonoverride-default-guardflag-filter",
      required: true,
      artifact: presets.createSyntheticImportedProjectileHitOverrideDefaultMissOnOverrideGuardFlagFilterTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-hitoverride-missonoverride-one",
      required: true,
      artifact: presets.createSyntheticImportedProjectileHitOverrideMissOnOverrideOneTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-reversal",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileReversalTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-reversal",
      required: true,
      artifact: presets.createSyntheticImportedProjectileReversalTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-custom-state-reversal",
      required: true,
      artifact: presets.createSyntheticImportedCustomStateReversalTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-guard-reversal",
      required: true,
      artifact: presets.createSyntheticImportedGuardReversalTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-walkback-guard-reversal",
      required: true,
      artifact: presets.createSyntheticImportedWalkBackGuardReversalTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-crouch-guard-reversal",
      required: true,
      artifact: presets.createSyntheticImportedCrouchGuardReversalTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-air-guard-reversal",
      required: true,
      artifact: presets.createSyntheticImportedAirGuardReversalTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-reversal",
      required: true,
      artifact: presets.createSyntheticImportedReversalTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-damage-scale",
      required: true,
      artifact: presets.createSyntheticImportedDamageScaleTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-damage-scale-dynamic",
      required: true,
      artifact: presets.createSyntheticImportedDynamicDamageScaleTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-data-damage-scale",
      required: true,
      artifact: presets.createSyntheticImportedDataDamageScaleTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-fall-defence-up",
      required: true,
      artifact: presets.createSyntheticImportedFallDefenceUpTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-gethitvar-fall-defence-up",
      required: true,
      artifact: presets.createSyntheticImportedGetHitVarFallDefenceUpTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-gethitvar-fall-recover",
      required: true,
      artifact: presets.createSyntheticImportedGetHitVarFallRecoverTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-gethitvar-fall-metadata",
      required: true,
      artifact: presets.createSyntheticImportedGetHitVarFallMetadataTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-gethitvar-fallcount",
      required: true,
      artifact: presets.createSyntheticImportedGetHitVarFallCountTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-gethitvar-fall-envshake",
      required: true,
      artifact: presets.createSyntheticImportedGetHitVarFallEnvShakeTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-gethitvar-down-recover",
      required: true,
      artifact: presets.createSyntheticImportedGetHitVarDownRecoverTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-gethitvar-hittime",
      required: true,
      artifact: presets.createSyntheticImportedGetHitVarHitTimeTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-gethitvar-hitshaketime",
      required: true,
      artifact: presets.createSyntheticImportedGetHitVarHitShakeTimeTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-gethitvar-damage",
      required: true,
      artifact: presets.createSyntheticImportedGetHitVarDamageTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-gethitvar-kill",
      required: true,
      artifact: presets.createSyntheticImportedGetHitVarKillTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-gethitvar-guard-kill",
      required: true,
      artifact: presets.createSyntheticImportedGetHitVarGuardKillTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-gethitvar-crouch-guard-kill",
      required: true,
      artifact: presets.createSyntheticImportedGetHitVarCrouchGuardKillTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-gethitvar-air-guard-kill",
      required: true,
      artifact: presets.createSyntheticImportedGetHitVarAirGuardKillTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-gethitvar-hitid-chainid",
      required: true,
      artifact: presets.createSyntheticImportedGetHitVarHitIdChainIdTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-gethitvar-hitcount",
      required: true,
      artifact: presets.createSyntheticImportedGetHitVarHitCountTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-gethitvar-velocity",
      required: true,
      artifact: presets.createSyntheticImportedGetHitVarVelocityTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-gethitvar-guard-timing",
      required: true,
      artifact: presets.createSyntheticImportedGetHitVarGuardTimingTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-gethitvar-guard-hitshaketime",
      required: true,
      artifact: presets.createSyntheticImportedGetHitVarGuardHitShakeTimeTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-gethitvar-crouch-guard-hitshaketime",
      required: true,
      artifact: presets.createSyntheticImportedGetHitVarCrouchGuardHitShakeTimeTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-gethitvar-air-guard-hitshaketime",
      required: true,
      artifact: presets.createSyntheticImportedGetHitVarAirGuardHitShakeTimeTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-gethitvar-guarded",
      required: true,
      artifact: presets.createSyntheticImportedGetHitVarGuardedTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-gethitvar-hit-metadata",
      required: true,
      artifact: presets.createSyntheticImportedProjectileGetHitVarHitMetadataTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-gethitvar-hitid-chainid",
      required: true,
      artifact: presets.createSyntheticImportedProjectileGetHitVarHitIdChainIdTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-gethitvar-hitcount",
      required: true,
      artifact: presets.createSyntheticImportedProjectileGetHitVarHitCountTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-hitcount",
      required: true,
      artifact: presets.createSyntheticImportedProjectileHitCountTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-gethitvar-guarded",
      required: true,
      artifact: presets.createSyntheticImportedProjectileGetHitVarGuardedTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-gethitvar-guard-kill",
      required: true,
      artifact: presets.createSyntheticImportedProjectileGetHitVarGuardKillTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-gethitvar-guard-hitshaketime",
      required: true,
      artifact: presets.createSyntheticImportedProjectileGetHitVarGuardHitShakeTimeTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-gethitvar-air-guard-hitshaketime",
      required: true,
      artifact: presets.createSyntheticImportedProjectileGetHitVarAirGuardHitShakeTimeTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-air-guard-velocity",
      required: true,
      artifact: presets.createSyntheticImportedProjectileAirGuardVelocityTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-air-guard-velocity-default",
      required: true,
      artifact: presets.createSyntheticImportedProjectileAirGuardVelocityDefaultTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-guard-velocity-default",
      required: true,
      artifact: presets.createSyntheticImportedProjectileGuardVelocityDefaultTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-guard-timing-default",
      required: true,
      artifact: presets.createSyntheticImportedProjectileGuardTimingDefaultTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-guard-slide-stop",
      required: true,
      artifact: presets.createSyntheticImportedProjectileGuardSlideStopTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-air-guard-cornerpush",
      required: true,
      artifact: presets.createSyntheticImportedProjectileAirGuardCornerPushTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-air-guard-cornerpush-default",
      required: true,
      artifact: presets.createSyntheticImportedProjectileAirGuardCornerPushDefaultTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-guard-cornerpush-default",
      required: true,
      artifact: presets.createSyntheticImportedProjectileGuardCornerPushDefaultTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-air-hit-cornerpush-default",
      required: true,
      artifact: presets.createSyntheticImportedProjectileAirHitCornerPushDefaultTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-down-hit-cornerpush",
      required: true,
      artifact: presets.createSyntheticImportedProjectileDownHitCornerPushTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-down-hit-cornerpush-default",
      required: true,
      artifact: presets.createSyntheticImportedProjectileDownHitCornerPushDefaultTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-gethitvar-guarded",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileGetHitVarGuardedTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-gethitvar-guard-kill",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileGetHitVarGuardKillTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-gethitvar-guard-hitshaketime",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileGetHitVarGuardHitShakeTimeTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-gethitvar-air-guard-hitshaketime",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileGetHitVarAirGuardHitShakeTimeTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-gethitvar-hit-metadata",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileGetHitVarHitMetadataTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-gethitvar-hitid-chainid",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileGetHitVarHitIdChainIdTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-gethitvar-hitcount",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileGetHitVarHitCountTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-hitcount",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileHitCountTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-air-guard-velocity",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileAirGuardVelocityTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-air-guard-velocity-default",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileAirGuardVelocityDefaultTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-guard-velocity-default",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileGuardVelocityDefaultTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-guard-timing-default",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileGuardTimingDefaultTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-guard-slide-stop",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileGuardSlideStopTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-air-guard-cornerpush",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileAirGuardCornerPushTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-air-guard-cornerpush-default",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileAirGuardCornerPushDefaultTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-guard-cornerpush-default",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileGuardCornerPushDefaultTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-air-hit-cornerpush-default",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileAirHitCornerPushDefaultTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-down-hit-cornerpush",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileDownHitCornerPushTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-down-hit-cornerpush-default",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileDownHitCornerPushDefaultTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-gethitvar-animtype",
      required: true,
      artifact: presets.createSyntheticImportedGetHitVarAnimTypeTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-gethitvar-snap",
      required: true,
      artifact: presets.createSyntheticImportedGetHitVarSnapTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-bounds",
      required: true,
      artifact: presets.createSyntheticImportedBoundsTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-posfreeze-dynamic",
      required: true,
      artifact: presets.createSyntheticImportedDynamicPosFreezeTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-screenbound-camera",
      required: true,
      artifact: presets.createSyntheticImportedScreenBoundCameraTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-screenbound-dynamic",
      required: true,
      artifact: presets.createSyntheticImportedDynamicScreenBoundTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-gravity",
      required: true,
      artifact: presets.createSyntheticImportedGravityTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-kinematic",
      required: true,
      artifact: presets.createSyntheticImportedKinematicTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-dynamic-veladd",
      required: true,
      artifact: presets.createSyntheticImportedDynamicVelAddTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-dynamic-velmul",
      required: true,
      artifact: presets.createSyntheticImportedDynamicVelMulTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-dynamic-posset",
      required: true,
      artifact: presets.createSyntheticImportedDynamicPosSetTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-dynamic-posadd",
      required: true,
      artifact: presets.createSyntheticImportedDynamicPosAddTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-controller-param-bottom",
      required: true,
      artifact: presets.createSyntheticImportedControllerParamBottomTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-controller-param-target-redirect",
      required: true,
      artifact: presets.createSyntheticImportedControllerParamTargetRedirectTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-controller-param-root-redirect",
      required: true,
      artifact: presets.createSyntheticImportedControllerParamRootRedirectTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-width",
      required: true,
      artifact: presets.createSyntheticImportedWidthTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-width-dynamic",
      required: true,
      artifact: presets.createSyntheticImportedDynamicWidthTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-statetypeset",
      required: true,
      artifact: presets.createSyntheticImportedStateTypeSetTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-statetypeset-dynamic",
      required: true,
      artifact: presets.createSyntheticImportedDynamicStateTypeSetTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-playerpush",
      required: true,
      artifact: presets.createSyntheticImportedPlayerPushTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-playerpush-dynamic",
      required: true,
      artifact: presets.createSyntheticImportedDynamicPlayerPushTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-turn",
      required: true,
      artifact: presets.createSyntheticImportedTurnTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-sprpriority",
      required: true,
      artifact: presets.createSyntheticImportedSprPriorityTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-sprpriority-dynamic",
      required: true,
      artifact: presets.createSyntheticImportedDynamicSprPriorityTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-palfx",
      required: true,
      artifact: presets.createSyntheticImportedPalFxTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-palfx-dynamic",
      required: true,
      artifact: presets.createSyntheticImportedDynamicPalFxTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-trans",
      required: true,
      artifact: presets.createSyntheticImportedTransTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-trans-dynamic",
      required: true,
      artifact: presets.createSyntheticImportedDynamicTransTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-angle",
      required: true,
      artifact: presets.createSyntheticImportedAngleTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-anglemul",
      required: true,
      artifact: presets.createSyntheticImportedAngleMulTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-anglemul-dynamic",
      required: true,
      artifact: presets.createSyntheticImportedDynamicAngleMulTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-angle-dynamic",
      required: true,
      artifact: presets.createSyntheticImportedDynamicAngleTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-envcolor",
      required: true,
      artifact: presets.createSyntheticImportedEnvColorTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-envcolor-under",
      required: true,
      artifact: presets.createSyntheticImportedEnvColorUnderTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-envcolor-dynamic",
      required: true,
      artifact: presets.createSyntheticImportedDynamicEnvColorTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-envshake",
      required: true,
      artifact: presets.createSyntheticImportedEnvShakeTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-envshake-dynamic",
      required: true,
      artifact: presets.createSyntheticImportedDynamicEnvShakeTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-remappal",
      required: true,
      artifact: presets.createSyntheticImportedRemapPalTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-remappal-dynamic",
      required: true,
      artifact: presets.createSyntheticImportedDynamicRemapPalTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-palfx-remappal",
      required: true,
      artifact: presets.createSyntheticImportedPalFxRemapPalTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-afterimage",
      required: true,
      artifact: presets.createSyntheticImportedAfterImageTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-afterimage-dynamic",
      required: true,
      artifact: presets.createSyntheticImportedDynamicAfterImageTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-afterimagetime-dynamic",
      required: true,
      artifact: presets.createSyntheticImportedDynamicAfterImageTimeTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitdef-priority",
      required: true,
      artifact: presets.createSyntheticImportedHitDefPriorityTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitdef-sprite-priority",
      required: true,
      artifact: presets.createSyntheticImportedHitDefSpritePriorityTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitdef-kill",
      required: true,
      artifact: presets.createSyntheticImportedHitDefKillTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitdef-guard-kill",
      required: true,
      artifact: presets.createSyntheticImportedHitDefGuardKillTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitdef-guard-ko",
      required: true,
      artifact: presets.createSyntheticImportedHitDefGuardKoTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-guard",
      required: true,
      artifact: presets.createSyntheticImportedGuardTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitdef-guard-sound",
      required: true,
      artifact: presets.createSyntheticImportedHitDefGuardSoundTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitdef-hit-sound",
      required: true,
      artifact: presets.createSyntheticImportedHitDefHitSoundTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitdef-dynamic-hitsound",
      required: true,
      artifact: presets.createSyntheticImportedHitDefDynamicHitSoundTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitdef-dynamic-guardsound",
      required: true,
      artifact: presets.createSyntheticImportedHitDefDynamicGuardSoundTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitdef-hit-spark",
      required: true,
      artifact: presets.createSyntheticImportedHitDefHitSparkTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitdef-data-spark",
      required: true,
      artifact: presets.createSyntheticImportedHitDefDataSparkTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitdef-common-spark",
      required: true,
      artifact: presets.createSyntheticImportedHitDefCommonSparkTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitdef-fightfx-spark",
      required: true,
      artifact: presets.createSyntheticImportedHitDefFightFxSparkTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitdef-hit-effect-package",
      required: true,
      artifact: presets.createSyntheticImportedHitDefHitEffectPackageTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitdef-guard-spark",
      required: true,
      artifact: presets.createSyntheticImportedHitDefGuardSparkTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitdef-data-guard-spark",
      required: true,
      artifact: presets.createSyntheticImportedHitDefDataGuardSparkTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitdef-common-guard-spark",
      required: true,
      artifact: presets.createSyntheticImportedHitDefCommonGuardSparkTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitdef-fightfx-guard-spark",
      required: true,
      artifact: presets.createSyntheticImportedHitDefFightFxGuardSparkTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitdef-guard-effect-package",
      required: true,
      artifact: presets.createSyntheticImportedHitDefGuardEffectPackageTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-assertspecial-unguardable",
      required: true,
      artifact: presets.createSyntheticImportedAssertSpecialUnguardableTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-assertspecial-guarddeny",
      required: true,
      artifact: presets.createSyntheticImportedAssertSpecialGuardDenyTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-assertspecial-crouch-guarddeny",
      required: true,
      artifact: presets.createSyntheticImportedAssertSpecialCrouchGuardDenyTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-assertspecial-air-guarddeny",
      required: true,
      artifact: presets.createSyntheticImportedAssertSpecialAirGuardDenyTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-assertspecial-lifetime",
      required: true,
      artifact: presets.createSyntheticImportedAssertSpecialLifetimeTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-assertspecial-control",
      required: true,
      artifact: presets.createSyntheticImportedAssertSpecialControlTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-ikemen-runfirst",
      required: true,
      artifact: presets.createSyntheticImportedIkemenRunFirstTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-ikemen-runorder",
      required: true,
      artifact: presets.createSyntheticImportedIkemenRunOrderTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-ikemen-helper-runorder",
      required: true,
      artifact: presets.createSyntheticImportedIkemenHelperRunOrderTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-ikemen-helper-self-tag",
      required: true,
      artifact: presets.createSyntheticImportedIkemenHelperSelfTagTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-ikemen-tag-side-command",
      required: true,
      artifact: presets.createSyntheticImportedIkemenTagSideCommandTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-ikemen-active-root-motion",
      required: true,
      artifact: presets.createSyntheticImportedIkemenActiveRootMotionTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-ikemen-active-root-direct-hit",
      required: true,
      artifact: presets.createSyntheticImportedIkemenActiveRootDirectHitTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-ikemen-active-root-depth-miss",
      required: true,
      artifact: presets.createSyntheticImportedIkemenActiveRootDepthMissTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-ikemen-active-root-depth-velocity",
      required: true,
      artifact: presets.createSyntheticImportedIkemenActiveRootDepthVelocityTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-ikemen-active-root-posfreeze-depth",
      required: true,
      artifact: presets.createSyntheticImportedIkemenActiveRootPosFreezeDepthTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-ikemen-active-root-priority",
      required: true,
      artifact: presets.createSyntheticImportedIkemenActiveRootPriorityTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-ikemen-active-root-equal-priority",
      required: true,
      artifact: presets.createSyntheticImportedIkemenActiveRootEqualPriorityTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-ikemen-active-root-hit-miss-priority",
      required: true,
      artifact: presets.createSyntheticImportedIkemenActiveRootHitMissPriorityTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-ikemen-active-root-hit-dodge-priority",
      required: true,
      artifact: presets.createSyntheticImportedIkemenActiveRootHitDodgePriorityTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-pair-miss-hit-priority",
      required: true,
      artifact: presets.createSyntheticImportedPairMissHitPriorityTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-pair-hit-dodge-priority",
      required: true,
      artifact: presets.createSyntheticImportedPairHitDodgePriorityTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-ikemen-active-root-reversal-order",
      required: true,
      artifact: presets.createSyntheticImportedIkemenActiveRootReversalOrderTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-ikemen-reversal-clash",
      required: true,
      artifact: presets.createSyntheticImportedIkemenReversalClashTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-ikemen-active-root-presentation",
      required: true,
      artifact: presets.createSyntheticImportedIkemenActiveRootPresentationTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-ikemen-active-root-constraint",
      required: true,
      artifact: presets.createSyntheticImportedIkemenActiveRootConstraintTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-ikemen-pause-buffer",
      required: true,
      artifact: presets.createSyntheticImportedIkemenPauseBufferTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-ikemen-actor-pausemove",
      required: true,
      artifact: presets.createSyntheticImportedIkemenActorPauseMoveTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-ikemen-deferred-pause-activation",
      required: true,
      artifact: presets.createSyntheticImportedIkemenDeferredPauseActivationTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-ikemen-helper-superpause",
      required: true,
      artifact: presets.createSyntheticImportedIkemenHelperSuperPauseTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-ikemen-superpause-p2defmul-stack",
      required: true,
      artifact: presets.createSyntheticImportedIkemenSuperPauseP2DefMulStackTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-ikemen-superpause-team-defense",
      required: true,
      artifact: presets.createSyntheticImportedIkemenSuperPauseTeamDefenseTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-assertspecial-global-telemetry",
      required: true,
      artifact: presets.createSyntheticImportedAssertSpecialGlobalTelemetryTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-assertspecial-round-flow-telemetry",
      required: true,
      artifact: presets.createSyntheticImportedAssertSpecialRoundFlowTelemetryTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-assertspecial-juggle-telemetry",
      required: true,
      artifact: presets.createSyntheticImportedAssertSpecialJuggleTelemetryTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-assertspecial-shadow-telemetry",
      required: true,
      artifact: presets.createSyntheticImportedAssertSpecialShadowTelemetryTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-assertspecial-helper-explod-shadow",
      required: true,
      artifact: presets.createSyntheticImportedAssertSpecialHelperExplodShadowTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-assertspecial-timerfreeze",
      required: true,
      artifact: presets.createSyntheticImportedAssertSpecialTimerFreezeTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-assertspecial-roundnotover",
      required: true,
      artifact: presets.createSyntheticImportedAssertSpecialRoundNotOverTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-assertspecial-noko",
      required: true,
      artifact: presets.createSyntheticImportedAssertSpecialNoKoTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-assertspecial-nogetupfromliedown",
      required: true,
      artifact: presets.createSyntheticImportedAssertSpecialNoGetUpFromLieDownTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-assertspecial-nofastrecoverfromliedown",
      required: true,
      artifact: presets.createSyntheticImportedAssertSpecialNoFastRecoverFromLieDownTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-default-liedown-fast-recovery",
      required: true,
      artifact: presets.createSyntheticImportedDefaultLieDownFastRecoveryTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-default-guard-state",
      required: true,
      artifact: presets.createSyntheticImportedDefaultGuardStateTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-default-guard-slide-stop",
      required: true,
      artifact: presets.createSyntheticImportedDefaultGuardSlideStopTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-default-guard-hold-walk-return",
      required: true,
      artifact: presets.createSyntheticImportedDefaultGuardHoldWalkReturnTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-crouch-guard-slide-stop",
      required: true,
      artifact: presets.createSyntheticImportedCrouchGuardSlideStopTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-crouch-guard-hold-crouch-return",
      required: true,
      artifact: presets.createSyntheticImportedCrouchGuardHoldCrouchReturnTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-crouch-guard-state",
      required: true,
      artifact: presets.createSyntheticImportedCrouchGuardStateTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-diagonal-crouch-guard-state",
      required: true,
      artifact: presets.createSyntheticImportedDiagonalCrouchGuardStateTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-air-guard-state",
      required: true,
      artifact: presets.createSyntheticImportedAirGuardStateTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-air-guard-velocity",
      required: true,
      artifact: presets.createSyntheticImportedAirGuardVelocityTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-air-guard-velocity-default",
      required: true,
      artifact: presets.createSyntheticImportedAirGuardVelocityDefaultTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-guard-velocity-default",
      required: true,
      artifact: presets.createSyntheticImportedGuardVelocityDefaultTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-guard-timing-default",
      required: true,
      artifact: presets.createSyntheticImportedGuardTimingDefaultTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-air-guard-cornerpush",
      required: true,
      artifact: presets.createSyntheticImportedAirGuardCornerPushTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-air-guard-cornerpush-default",
      required: true,
      artifact: presets.createSyntheticImportedAirGuardCornerPushDefaultTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-guard-cornerpush-default",
      required: true,
      artifact: presets.createSyntheticImportedGuardCornerPushDefaultTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-air-hit-cornerpush-default",
      required: true,
      artifact: presets.createSyntheticImportedAirHitCornerPushDefaultTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-down-hit-cornerpush",
      required: true,
      artifact: presets.createSyntheticImportedDownHitCornerPushTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-down-hit-cornerpush-default",
      required: true,
      artifact: presets.createSyntheticImportedDownHitCornerPushDefaultTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-air-guard-landing",
      required: true,
      artifact: presets.createSyntheticImportedAirGuardLandingTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-inguarddist",
      required: true,
      artifact: presets.createSyntheticImportedInGuardDistTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-inguarddist-far",
      required: true,
      artifact: presets.createSyntheticImportedInGuardDistFarTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-guarddist-reversal-no-contact",
      required: true,
      artifact: presets.createSyntheticImportedGuardDistReversalNoContactTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-auto-guard-start",
      required: true,
      artifact: presets.createSyntheticImportedAutoGuardStartTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-common1-state-source-override",
      required: true,
      artifact: presets.createSyntheticImportedCommon1StateOverrideTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-common1-state-source-fallback",
      required: true,
      artifact: presets.createSyntheticImportedCommon1StateFallbackTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-auto-guard-end",
      required: true,
      artifact: presets.createSyntheticImportedAutoGuardEndTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitstun",
      required: true,
      artifact: presets.createSyntheticImportedHitstunTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-fall",
      required: true,
      artifact: presets.createSyntheticImportedFallTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-common-gethit",
      required: true,
      artifact: presets.createSyntheticImportedCommonGetHitTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-default-gethit",
      required: true,
      artifact: presets.createImportedDefaultGetHitTraceArtifact(
        presets.createSyntheticImportedTraceFighter({
          id: "synthetic-imported-default-gethit",
          displayName: "Synthetic Imported Default GetHit",
          defaultGetHitState: { stateNo: 5000, animNo: 5000 },
        }),
        {
          targetId: "synthetic-imported-default-gethit-golden",
          targetLabel: "Synthetic imported default Common1 get-hit route",
          notes: [
            "Synthetic imported default get-hit trace proves the runtime can route a HitDef without p2stateno into a defender-owned Common1-style state 5000 when that state exists.",
          ],
        },
      ),
    });
    artifacts.push({
      name: "synthetic-imported-default-crouch-gethit",
      required: true,
      artifact: presets.createSyntheticImportedDefaultCrouchGetHitTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-default-crouch-gethit-progression",
      required: true,
      artifact: presets.createSyntheticImportedDefaultCrouchGetHitProgressionTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-default-air-gethit",
      required: true,
      artifact: presets.createSyntheticImportedDefaultAirGetHitTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-default-air-fall-gethit",
      required: true,
      artifact: presets.createSyntheticImportedDefaultAirFallGetHitTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-default-air-ground-impact",
      required: true,
      artifact: presets.createSyntheticImportedDefaultAirGroundImpactTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-default-air-liedown-recovery",
      required: true,
      artifact: presets.createSyntheticImportedDefaultAirLieDownRecoveryTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-default-air-fall-recovery-input",
      required: true,
      artifact: presets.createSyntheticImportedDefaultAirFallRecoveryInputTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-default-air-fall-recovery-too-early",
      required: true,
      artifact: presets.createSyntheticImportedDefaultAirFallRecoveryTooEarlyTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-default-gethit-progression",
      required: true,
      artifact: presets.createImportedDefaultGetHitProgressionTraceArtifact(
        presets.createSyntheticImportedTraceFighter({
          id: "synthetic-imported-default-gethit-progression",
          displayName: "Synthetic Imported Default GetHit Progression",
          defaultGetHitProgression: { shakeStateNo: 5000, slideStateNo: 5001 },
        }),
        {
          targetId: "synthetic-imported-default-gethit-progression-golden",
          targetLabel: "Synthetic imported Common1 HitShakeOver/HitOver progression",
          notes: [
            "Synthetic imported progression trace proves HitShakeOver can advance a defender-owned state 5000 into 5001 and HitOver can return it to state 0.",
          ],
        },
      ),
    });
    artifacts.push({
      name: "synthetic-imported-default-fall-gethit",
      required: true,
      artifact: presets.createImportedDefaultFallGetHitTraceArtifact(
        presets.createSyntheticImportedTraceFighter({
          id: "synthetic-imported-default-fall-gethit",
          displayName: "Synthetic Imported Default Fall GetHit",
          defaultGetHitFall: { shakeStateNo: 5000, slideStateNo: 5001, airStateNo: 5030, fallStateNo: 5050 },
        }),
        {
          targetId: "synthetic-imported-default-fall-gethit-golden",
          targetLabel: "Synthetic imported Common1 airborne fall get-hit route",
          attacker: presets.createSyntheticImportedTraceFighter({
            id: "synthetic-imported-default-fall-attacker",
            displayName: "Synthetic Imported Default Fall Attacker",
            groundVelocity: [-3, -6],
            fall: { enabled: true, damage: 20, velocity: { x: 3, y: -6 }, recover: false, recoverTime: 30 },
          }),
          requiredControllerEventSequences: [presets.defaultFallGetHitControllerSequence()],
          requiredActorFrameSequences: [presets.defaultFallGetHitActorFrameSequence()],
          notes: [
            "Synthetic imported fall get-hit trace proves a default defender-owned Common1-style route can branch from 5000 into 5030 and 5050 when fall/y velocity metadata exists, with ordered controller/typed-operation and actor-frame evidence. It does not claim ground impact 5100, bounce, liedown, recovery input, or guard-state parity.",
          ],
        },
      ),
    });
    artifacts.push({
      name: "synthetic-imported-default-fall-recovery",
      required: true,
      artifact: presets.createSyntheticImportedDefaultFallRecoveryTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-default-fall-recovery-input",
      required: true,
      artifact: presets.createSyntheticImportedDefaultFallRecoveryInputTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-default-fall-recovery-threshold",
      required: true,
      artifact: presets.createSyntheticImportedDefaultFallRecoveryThresholdTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-default-fall-official-recovery-threshold",
      required: true,
      artifact: presets.createImportedDefaultFallRecoveryThresholdTraceArtifact(
        presets.createSyntheticImportedTraceFighter({
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
        }),
        {
          targetId: "synthetic-imported-default-fall-official-recovery-threshold-golden",
          targetLabel: "Synthetic imported official-style recovery threshold route",
          attacker: presets.createSyntheticImportedTraceFighter({
            id: "synthetic-imported-default-fall-official-recovery-threshold-attacker",
            displayName: "Synthetic Imported Default Fall Official Recovery Threshold Attacker",
            groundVelocity: [-3, -6],
            fall: { enabled: true, damage: 20, velocity: { x: 3, y: -6 }, recover: true, recoverTime: 10 },
          }),
          notes: [
            "Synthetic imported official-style recovery-threshold trace proves the bounded runtime can count down fall.recovertime in 5050 and choose the 5200/5201 ground-recovery branch once the timer reaches 0. It does not claim exact MUGEN/IKEMEN threshold tables, velocity math, controller tick order, public KFM support, or full recovery parity.",
          ],
        },
      ),
    });
    artifacts.push({
      name: "synthetic-imported-default-fall-recovery-tick-order",
      required: true,
      artifact: presets.createSyntheticImportedDefaultFallRecoveryTickOrderTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-default-fall-air-recovery-velocity",
      required: true,
      artifact: presets.createSyntheticImportedDefaultFallAirRecoveryVelocityTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-default-fall-official-air-recovery",
      required: true,
      artifact: presets.createSyntheticImportedDefaultFallOfficialAirRecoveryTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-default-fall-ground-recovery",
      required: true,
      artifact: presets.createSyntheticImportedDefaultFallGroundRecoveryTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-default-fall-ground-recovery-priority",
      required: true,
      artifact: presets.createSyntheticImportedDefaultFallGroundRecoveryPriorityTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-default-fall-official-ground-recovery",
      required: true,
      artifact: presets.createSyntheticImportedDefaultFallOfficialGroundRecoveryTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-default-fall-recovery-too-early",
      required: true,
      artifact: presets.createSyntheticImportedDefaultFallRecoveryTooEarlyTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitfall-canrecover",
      required: true,
      artifact: presets.createSyntheticImportedHitFallCanRecoverTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitfall-canrecover-ready",
      required: true,
      artifact: presets.createSyntheticImportedHitFallCanRecoverReadyTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitfall-recovery-input-priority",
      required: false,
      artifact: presets.createSyntheticImportedHitFallRecoveryInputPriorityTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-default-fall-recovery-input-priority",
      required: true,
      artifact: presets.createSyntheticImportedDefaultFallRecoveryInputPriorityTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitfall-recover-true",
      required: true,
      artifact: presets.createSyntheticImportedHitFallRecoverTrueTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitfall-recover-false",
      required: true,
      artifact: presets.createSyntheticImportedHitFallRecoverFalseTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitfall-false",
      required: true,
      artifact: presets.createSyntheticImportedHitFallFalseTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-default-fall-official-recovery-too-early",
      required: true,
      artifact: presets.createImportedDefaultFallRecoveryTooEarlyTraceArtifact(
        presets.createSyntheticImportedTraceFighter({
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
        }),
        {
          targetId: "synthetic-imported-default-fall-official-recovery-too-early-golden",
          targetLabel: "Synthetic imported official-style recovery input too-early reject route",
          notes: [
            "Synthetic imported official-style recovery-input negative trace proves the bounded runtime keeps the defender in 5050 when recovery is pressed before fall.recovertime reaches 0. It does not claim exact recovery threshold tables, velocity math, public KFM support, or full tick-order parity.",
          ],
        },
      ),
    });
    artifacts.push({
      name: "synthetic-imported-state-exit",
      required: true,
      artifact: presets.createSyntheticImportedStateExitTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-custom-state",
      required: true,
      artifact: presets.createSyntheticImportedCustomStateTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-custom-state-gethitvar",
      required: true,
      artifact: presets.createSyntheticImportedCustomStateGetHitVarTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-custom-state-gethitvar-animtype",
      required: true,
      artifact: presets.createSyntheticImportedCustomStateGetHitVarAnimTypeTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-custom-state-gethitvar-type",
      required: true,
      artifact: presets.createSyntheticImportedCustomStateGetHitVarTypeTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-custom-state-gethitvar-yaccel",
      required: true,
      artifact: presets.createSyntheticImportedCustomStateGetHitVarYAccelTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-custom-state-gethitvar-snap",
      required: true,
      artifact: presets.createSyntheticImportedCustomStateGetHitVarSnapTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-custom-state-gethitvar-hitcount-hitid-chainid",
      required: true,
      artifact: presets.createSyntheticImportedCustomStateGetHitVarHitCountHitIdChainIdTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-custom-state-gethitvar-fall",
      required: true,
      artifact: presets.createSyntheticImportedCustomStateGetHitVarFallTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-custom-state-gethitvar-fall-metadata",
      required: true,
      artifact: presets.createSyntheticImportedCustomStateGetHitVarFallMetadataTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-custom-state-gethitvar-fall-envshake",
      required: true,
      artifact: presets.createSyntheticImportedCustomStateGetHitVarFallEnvShakeTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-custom-state-gethitvar-down-recover",
      required: true,
      artifact: presets.createSyntheticImportedCustomStateGetHitVarDownRecoverTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-custom-state-gethitvar-velocity",
      required: true,
      artifact: presets.createSyntheticImportedCustomStateGetHitVarVelocityTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-custom-state-gethitvar-guarded",
      required: true,
      artifact: presets.createSyntheticImportedCustomStateGetHitVarGuardedTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-custom-state-gethitvar-guard-kill",
      required: true,
      artifact: presets.createSyntheticImportedCustomStateGetHitVarGuardKillTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-p2stateno-guard-ignored",
      required: true,
      artifact: presets.createSyntheticImportedP2StateNoGuardIgnoredTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-custom-state-gethitvar-guard-timing",
      required: true,
      artifact: presets.createSyntheticImportedCustomStateGetHitVarGuardTimingTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-custom-state-gethitvar-isbound",
      required: true,
      artifact: presets.createSyntheticImportedCustomStateGetHitVarIsBoundTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-target-owned-custom-state",
      required: true,
      artifact: presets.createSyntheticImportedTargetOwnedCustomStateTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-targetstate-custom",
      required: true,
      artifact: presets.createSyntheticImportedTargetStateCustomTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-target",
      required: true,
      artifact: presets.createSyntheticImportedTargetTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-target-redirect",
      required: true,
      artifact: presets.createSyntheticImportedTargetRedirectTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-target-redirect-bottom",
      required: true,
      artifact: presets.createSyntheticImportedTargetRedirectBottomTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-target-cond-bottom",
      required: true,
      artifact: presets.createSyntheticImportedTargetCondBottomTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-target-ifelse-bottom",
      required: true,
      artifact: presets.createSyntheticImportedTargetIfElseBottomTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-target-dynamic-redirect",
      required: true,
      artifact: presets.createSyntheticImportedTargetDynamicRedirectTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-target-noko",
      required: true,
      artifact: presets.createSyntheticImportedTargetNoKoTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-bindtotarget-head",
      required: true,
      artifact: presets.createSyntheticImportedBindToTargetHeadTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-bindtotarget-mid",
      required: true,
      artifact: presets.createSyntheticImportedBindToTargetMidTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-bindtotarget-depth",
      required: true,
      artifact: presets.createSyntheticImportedBindToTargetDepthTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-targetbind-depth",
      required: true,
      artifact: presets.createSyntheticImportedTargetBindDepthTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-targetbind-pause",
      required: true,
      artifact: presets.createSyntheticImportedTargetBindPauseTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-superpause",
      required: true,
      artifact: presets.createSyntheticImportedSuperPauseTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-superpause-default-anim",
      required: true,
      artifact: presets.createSyntheticImportedSuperPauseDefaultAnimTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-superpause-anim-disabled",
      required: true,
      artifact: presets.createSyntheticImportedSuperPauseAnimDisabledTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-superpause-pausebg",
      required: true,
      artifact: presets.createSyntheticImportedSuperPausePauseBgTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-superpause-unhittable",
      required: true,
      artifact: presets.createSyntheticImportedSuperPauseUnhittableTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-superpause-sound",
      required: true,
      artifact: presets.createSyntheticImportedSuperPauseSoundTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-superpause-dynamic-params",
      required: true,
      artifact: presets.createSyntheticImportedSuperPauseDynamicParamsTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-superpause-anim-pos",
      required: true,
      artifact: presets.createSyntheticImportedSuperPauseAnimPosTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-superpause-dynamic-anim-pos",
      required: true,
      artifact: presets.createSyntheticImportedSuperPauseDynamicAnimPosTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-superpause-p2defmul",
      required: true,
      artifact: presets.createSyntheticImportedSuperPauseP2DefMulTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-superpause-projectile-freeze",
      required: true,
      artifact: presets.createSyntheticImportedSuperPauseProjectileFreezeTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-superpause-effect-freeze",
      required: true,
      artifact: presets.createSyntheticImportedSuperPauseEffectFreezeTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-explod-supermovetime",
      required: true,
      artifact: presets.createSyntheticImportedExplodSuperMoveTimeTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-explod-pausemovetime",
      required: true,
      artifact: presets.createSyntheticImportedExplodPauseMoveTimeTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-explod-ignorehitpause",
      required: true,
      artifact: presets.createSyntheticImportedExplodIgnoreHitPauseTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitpausetime-ignorehitpause",
      required: true,
      artifact: presets.createSyntheticImportedHitPauseTimeIgnoreHitPauseTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile",
      required: true,
      artifact: presets.createSyntheticImportedProjectileTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-target-redirect",
      required: true,
      artifact: presets.createSyntheticImportedProjectileTargetRedirectTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitdef-projectile-target-mix",
      required: true,
      artifact: presets.createSyntheticImportedHitDefProjectileTargetMixTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-target-controllers",
      required: true,
      artifact: presets.createSyntheticImportedProjectileTargetControllersTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-default-target-controllers",
      required: true,
      artifact: presets.createSyntheticImportedProjectileDefaultTargetControllersTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-targetstate",
      required: true,
      artifact: presets.createSyntheticImportedProjectileTargetStateTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-default-targetstate",
      required: true,
      artifact: presets.createSyntheticImportedProjectileDefaultTargetStateTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-receiveddamage",
      required: true,
      artifact: presets.createSyntheticImportedProjectileReceivedDamageTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-time",
      required: true,
      artifact: presets.createSyntheticImportedProjectileTimeTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-hittime-any",
      required: true,
      artifact: presets.createSyntheticImportedProjectileHitTimeAnyTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-contacttime-any",
      required: true,
      artifact: presets.createSyntheticImportedProjectileContactTimeAnyTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-contacttime-id",
      required: true,
      artifact: presets.createSyntheticImportedProjectileContactTimeTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-projcontactpersist",
      required: true,
      artifact: presets.createSyntheticImportedProjectileContactPersistTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-projcontact-suffix",
      required: true,
      artifact: presets.createSyntheticImportedProjectileContactSuffixTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-projcontact-suffix-any",
      required: true,
      artifact: presets.createSyntheticImportedProjectileContactSuffixAnyTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-projcontact-multi-id",
      required: true,
      artifact: presets.createSyntheticImportedProjectileContactMultiIdTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-projhit-multi-id",
      required: true,
      artifact: presets.createSyntheticImportedProjectileHitMultiIdTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-projguarded-multi-id",
      required: true,
      artifact: presets.createSyntheticImportedProjectileGuardedMultiIdTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-projhittime-multi-id",
      required: true,
      artifact: presets.createSyntheticImportedProjectileHitTimeMultiIdTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-projcontacttime-multi-id",
      required: true,
      artifact: presets.createSyntheticImportedProjectileContactTimeMultiIdTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-projguardedtime-multi-id",
      required: true,
      artifact: presets.createSyntheticImportedProjectileGuardedTimeMultiIdTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-projtime-same-id-last-contact",
      required: true,
      artifact: presets.createSyntheticImportedProjectileTimeSameIdLastContactTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-projtime-same-id-hit-then-guard",
      required: true,
      artifact: presets.createSyntheticImportedProjectileTimeSameIdHitThenGuardTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-projhit-suffix",
      required: true,
      artifact: presets.createSyntheticImportedProjectileHitSuffixTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-projhit-suffix-any",
      required: true,
      artifact: presets.createSyntheticImportedProjectileHitSuffixAnyTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-projguarded-suffix",
      required: true,
      artifact: presets.createSyntheticImportedProjectileGuardedSuffixTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-projguarded-suffix-any",
      required: true,
      artifact: presets.createSyntheticImportedProjectileGuardedSuffixAnyTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-guardedtime-any",
      required: true,
      artifact: presets.createSyntheticImportedProjectileGuardedTimeAnyTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-guardedtime-id",
      required: true,
      artifact: presets.createSyntheticImportedProjectileGuardedTimeTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-motion",
      required: true,
      artifact: presets.createSyntheticImportedProjectileMotionTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-guard-distance-latch",
      required: true,
      artifact: presets.createSyntheticImportedProjectileGuardDistanceLatchTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-velmul",
      required: true,
      artifact: presets.createSyntheticImportedProjectileVelMulTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-modifyprojectile",
      required: true,
      artifact: presets.createSyntheticImportedModifyProjectileTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-modifyprojectile-dynamic-bounds",
      required: true,
      artifact: presets.createSyntheticImportedModifyProjectileDynamicBoundsTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-modifyprojectile-omitted-bounds",
      required: true,
      artifact: presets.createSyntheticImportedModifyProjectileOmittedBoundsTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-modifyprojectile-dynamic-params",
      required: true,
      artifact: presets.createSyntheticImportedModifyProjectileDynamicParamsTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-contact",
      required: true,
      artifact: presets.createSyntheticImportedProjectileContactTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-guard",
      required: true,
      artifact: presets.createSyntheticImportedProjectileGuardTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-guard-ko",
      required: true,
      artifact: presets.createSyntheticImportedProjectileGuardKoTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-guard-kill",
      required: true,
      artifact: presets.createSyntheticImportedProjectileGuardKillTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-guard-terminal",
      required: true,
      artifact: presets.createSyntheticImportedProjectileGuardTerminalTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-remove-terminal",
      required: true,
      artifact: presets.createSyntheticImportedProjectileRemoveTerminalTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-remove-hit-fallback-terminal",
      required: true,
      artifact: presets.createSyntheticImportedProjectileRemoveHitFallbackTerminalTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-bounds-remove-terminal",
      required: true,
      artifact: presets.createSyntheticImportedProjectileBoundsRemoveTerminalTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-default-bounds-terminal",
      required: true,
      artifact: presets.createSyntheticImportedProjectileDefaultBoundsTerminalTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-localcoord-default-bounds-terminal",
      required: true,
      artifact: presets.createSyntheticImportedProjectileLocalCoordDefaultBoundsTerminalTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-stagebound-terminal",
      required: true,
      artifact: presets.createSyntheticImportedProjectileStageBoundTerminalTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-edgebound-terminal",
      required: true,
      artifact: presets.createSyntheticImportedProjectileEdgeBoundTerminalTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-heightbound-terminal",
      required: true,
      artifact: presets.createSyntheticImportedProjectileHeightBoundTerminalTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-multihit",
      required: true,
      artifact: presets.createSyntheticImportedProjectileMultiHitTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-clash",
      required: true,
      artifact: presets.createSyntheticImportedProjectileClashTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-priority-cancel",
      required: true,
      artifact: presets.createSyntheticImportedProjectilePriorityCancelTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-cancel-remove-fallback-terminal",
      required: true,
      artifact: presets.createSyntheticImportedProjectileCancelRemoveFallbackTerminalTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-canceltime",
      required: true,
      artifact: presets.createSyntheticImportedProjectileCancelTimeTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-canceltime-any",
      required: true,
      artifact: presets.createSyntheticImportedProjectileCancelTimeAnyTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-canceltime-dynamic",
      required: true,
      artifact: presets.createSyntheticImportedProjectileCancelTimeDynamicTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-canceltime-var",
      required: true,
      artifact: presets.createSyntheticImportedProjectileCancelTimeVarTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper",
      required: true,
      artifact: presets.createSyntheticImportedHelperTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-velocity",
      required: true,
      artifact: presets.createSyntheticImportedHelperVelocityTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-ishelper",
      required: true,
      artifact: presets.createSyntheticImportedHelperIsHelperTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-enemynear",
      required: true,
      artifact: presets.createSyntheticImportedHelperEnemyNearTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-parentroot",
      required: true,
      artifact: presets.createSyntheticImportedHelperParentRootTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-controller-param-parentroot",
      required: true,
      artifact: presets.createSyntheticImportedHelperControllerParamParentRootTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-dynamic-veladd",
      required: true,
      artifact: presets.createSyntheticImportedHelperDynamicVelAddTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-dynamic-velmul",
      required: true,
      artifact: presets.createSyntheticImportedHelperDynamicVelMulTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-dynamic-posset",
      required: true,
      artifact: presets.createSyntheticImportedHelperDynamicPosSetTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-dynamic-posadd",
      required: true,
      artifact: presets.createSyntheticImportedHelperDynamicPosAddTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-explod",
      required: true,
      artifact: presets.createSyntheticImportedHelperExplodTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-removeexplod",
      required: true,
      artifact: presets.createSyntheticImportedHelperRemoveExplodTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-modifyexplod",
      required: true,
      artifact: presets.createSyntheticImportedHelperModifyExplodTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-modifyprojectile",
      required: true,
      artifact: presets.createSyntheticImportedHelperModifyProjectileTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-modifyprojectile-dynamic-bounds",
      required: true,
      artifact: presets.createSyntheticImportedHelperModifyProjectileDynamicBoundsTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-modifyprojectile-omitted-bounds",
      required: true,
      artifact: presets.createSyntheticImportedHelperModifyProjectileOmittedBoundsTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-modifyprojectile-dynamic-params",
      required: true,
      artifact: presets.createSyntheticImportedHelperModifyProjectileDynamicParamsTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projhit",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjHitTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projhittime-any",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjHitTimeAnyTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-hitoverride-p2stateno",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileHitOverrideP2StateNoTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-hitoverride-slot-priority",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileHitOverrideSlotPriorityTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-hitoverride-missonoverride-zero-slot-priority",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileHitOverrideMissOnOverrideZeroSlotPriorityTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-hitoverride-missonoverride-zero-guardflag-filter",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileHitOverrideMissOnOverrideZeroGuardFlagFilterTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-hitoverride-guardflag-filter",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileHitOverrideGuardFlagFilterTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-hitoverride-forceair-forceguard-keepstate",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileHitOverrideForceAirGuardKeepStateTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-hitoverride-guardflag-forceair-forceguard-keepstate",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileHitOverrideGuardFlagForceAirGuardKeepStateTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-hitoverride-missonoverride-one",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileHitOverrideMissOnOverrideOneTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-hitoverride-missonoverride-zero",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileHitOverrideMissOnOverrideZeroTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-hitoverride-missonoverride-zero-forceair-forceguard-keepstate",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileHitOverrideMissOnOverrideZeroForceAirGuardKeepStateTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-hitoverride-missonoverride-default-forceair-forceguard-keepstate",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileHitOverrideDefaultMissOnOverrideForceAirGuardKeepStateTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-hitoverride-missonoverride-default-guardflag-filter",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileHitOverrideDefaultMissOnOverrideGuardFlagFilterTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-target",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileTargetTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-bare-target",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileBareTargetTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-target-controllers",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileTargetControllersTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-targetstate",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileTargetStateTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-default-targetstate",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileDefaultTargetStateTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-default-target-controllers",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileDefaultTargetControllersTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-default-target",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileDefaultTargetTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projguard",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjGuardTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-guard-ko",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileGuardKoTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-guard-kill",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileGuardKillTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-guard-terminal",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileGuardTerminalTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-cancel-remove-fallback-terminal",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileCancelRemoveFallbackTerminalTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-remove-hit-fallback-terminal",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileRemoveHitFallbackTerminalTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-default-bounds-terminal",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileDefaultBoundsTerminalTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-localcoord-default-bounds-terminal",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileLocalCoordDefaultBoundsTerminalTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-heightbound-terminal",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileHeightBoundTerminalTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-edgebound-terminal",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileEdgeBoundTerminalTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projectile-stagebound-terminal",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjectileStageBoundTerminalTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projguardedtime-any",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjGuardedTimeAnyTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projcontact",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjContactTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projcontacttime-any",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjContactTimeAnyTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projcontactpersist",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjContactPersistTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projtime-same-id-last-contact",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjTimeSameIdLastContactTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projtime-same-id-hit-then-guard",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjTimeSameIdHitThenGuardTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projcanceltime-any",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjCancelTimeAnyTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projcanceltime-id",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjCancelTimeIdTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-projcanceltime-dynamic",
      required: true,
      artifact: presets.createSyntheticImportedHelperProjCancelTimeDynamicTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-hitdef",
      required: true,
      artifact: presets.createSyntheticImportedHelperHitDefTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-hitdef-sprite-priority",
      required: true,
      artifact: presets.createSyntheticImportedHelperHitDefSpritePriorityTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-hitdefpersist",
      required: true,
      artifact: presets.createSyntheticImportedHelperHitDefPersistTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-hitcountpersist",
      required: true,
      artifact: presets.createSyntheticImportedHelperHitCountPersistTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-movehitpersist",
      required: true,
      artifact: presets.createSyntheticImportedHelperMoveHitPersistTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-moveguardedpersist",
      required: true,
      artifact: presets.createSyntheticImportedHelperMoveGuardedPersistTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-movereversedpersist",
      required: true,
      artifact: presets.createSyntheticImportedHelperMoveReversedPersistTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-target",
      required: true,
      artifact: presets.createSyntheticImportedHelperTargetTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-default-target",
      required: true,
      artifact: presets.createSyntheticImportedHelperDefaultTargetTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-bare-target",
      required: true,
      artifact: presets.createSyntheticImportedHelperBareTargetTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-target-controllers",
      required: true,
      artifact: presets.createSyntheticImportedHelperTargetControllersTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-targetstate",
      required: true,
      artifact: presets.createSyntheticImportedHelperTargetStateTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-numexplod",
      required: true,
      artifact: presets.createSyntheticImportedHelperNumExplodTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-numhelper",
      required: true,
      artifact: presets.createSyntheticImportedHelperNumHelperTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-numproj",
      required: true,
      artifact: presets.createSyntheticImportedHelperNumProjTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-bindtoparent",
      required: true,
      artifact: presets.createSyntheticImportedHelperBindToParentTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-bindtoroot",
      required: true,
      artifact: presets.createSyntheticImportedHelperBindToRootTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-scale",
      required: true,
      artifact: presets.createSyntheticImportedHelperScaleTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-supermovetime",
      required: true,
      artifact: presets.createSyntheticImportedHelperSuperMoveTimeTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-pausemovetime",
      required: true,
      artifact: presets.createSyntheticImportedHelperPauseMoveTimeTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper-ignorehitpause",
      required: true,
      artifact: presets.createSyntheticImportedHelperIgnoreHitPauseTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-explod",
      required: true,
      artifact: presets.createSyntheticImportedExplodTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-explod-velocity",
      required: true,
      artifact: presets.createSyntheticImportedExplodVelocityTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-modifyexplod",
      required: true,
      artifact: presets.createSyntheticImportedModifyExplodTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-explod-bind",
      required: true,
      artifact: presets.createSyntheticImportedExplodBindTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-explod-scale",
      required: true,
      artifact: presets.createSyntheticImportedExplodScaleTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-explod-removeongethit",
      required: true,
      artifact: presets.createSyntheticImportedExplodRemoveOnGetHitTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-explod-removeonprojectilehit",
      required: true,
      artifact: presets.createSyntheticImportedExplodRemoveOnProjectileHitTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-explod-removeonprojectileguard",
      required: true,
      artifact: presets.createSyntheticImportedExplodRemoveOnProjectileGuardTraceArtifact(),
    });

    const kfmFixturePath = path.resolve(process.cwd(), process.env.KFM_FIXTURE_PATH ?? DEFAULT_KFM_FIXTURE);
    if (fs.existsSync(kfmFixturePath)) {
      const imported = await loadImportedFighter(vite, kfmFixturePath);
      artifacts.push({
        name: "kfm-official-x",
        required: false,
        artifact: presets.createImportedXTraceArtifact(imported, {
          targetId: "kfm-official-x-golden",
          targetLabel: "Official KFM x route",
          notes: [
            `Optional local fixture trace from ${path.relative(process.cwd(), kfmFixturePath)}. Requires private fixture presence and verifies only the current partial route.`,
          ],
        }),
      });
      artifacts.push({
        name: "kfm-official-basic-movement",
        required: false,
        artifact: presets.createImportedBasicMovementTraceArtifact(imported, {
          targetId: "kfm-official-basic-movement-golden",
          targetLabel: "Official KFM basic movement route",
          requiredActorFrames: [
            { actorId: "p1", source: "imported", actorKind: "player", stateNo: 0, animNo: 0, stateType: "S", physics: "S", minFrames: 3 },
            { actorId: "p1", source: "imported", actorKind: "player", stateNo: 20, animNo: 20, stateType: "S", physics: "S", observedPosXAtLeast: -150, minFrames: 4 },
            { actorId: "p1", source: "imported", actorKind: "player", stateNo: 11, animNo: 11, stateType: "C", physics: "C", minFrames: 4 },
            {
              actorId: "p1",
              source: "imported",
              actorKind: "player",
              stateNo: 41,
              animNo: 41,
              stateType: "A",
              physics: "A",
              observedPosYAtMost: -1,
              observedVelYAtMost: -1,
              minFrames: 5,
            },
          ],
          requiredActorFrameSequences: [presets.officialKfmBasicMovementActorFrameSequence()],
          requiredFinalActors: [
            { actorId: "p1", source: "imported", actorKind: "player", stateNo: 0, animNo: 0, ctrl: true, stateType: "S", moveType: "I", physics: "S" },
          ],
          notes: [
            `Optional local fixture trace from ${path.relative(process.cwd(), kfmFixturePath)}. Requires private fixture presence and verifies that real KFM can enter walk state 20, crouch prep state 11, jump state 41, and return to state 0/control from the same scripted F/D/U input used by the synthetic movement oracle. This does not prove public KFM support, exact Common1 movement tables, CMD priority, landing/collision parity, AI behavior, renderer parity, or full MUGEN/IKEMEN movement parity.`,
          ],
        }),
      });
      artifacts.push({
        name: "kfm-official-x-hit-sound",
        required: false,
        artifact: presets.createImportedXTraceArtifact(imported, {
          targetId: "kfm-official-x-hit-sound-golden",
          targetLabel: "Official KFM x hit sound route",
          requireHitEvent: true,
          requiredExecutedControllers: ["ChangeState", "HitDef", "PlaySnd"],
          requiredSoundEvents: [
            {
              actorId: "p1",
              source: "imported",
              actorKind: "player",
              type: "PlaySnd",
              group: 5,
              index: 0,
              stateNo: 200,
            },
          ],
          notes: [
            `Optional local fixture trace from ${path.relative(process.cwd(), kfmFixturePath)}. Requires private fixture presence and verifies that the real KFM x route emits bounded HitDef hit sound telemetry (S5,0) after contact. This does not prove SND decode/playback, channel priority, mixing, timing, or full MUGEN/IKEMEN audio parity.`,
          ],
        }),
      });
      artifacts.push({
        name: "kfm-official-x-hit-spark",
        required: false,
        artifact: presets.createImportedXTraceArtifact(imported, {
          targetId: "kfm-official-x-hit-spark-golden",
          targetLabel: "Official KFM x hit spark route",
          requireHitEvent: true,
          requiredHitEffectEvents: [
            {
              actorId: "p1",
              source: "imported",
              actorKind: "player",
              kind: "hit",
              sparkNo: 0,
              raw: "0",
              stateNo: 200,
            },
          ],
          notes: [
            `Optional local fixture trace from ${path.relative(process.cwd(), kfmFixturePath)}. Requires private fixture presence and verifies that the real KFM x route emits bounded HitSpark telemetry from its authored sparkno 0 and sparkxy offset after contact. This does not prove exact FightFX/common lookup, layering, scale, palette, render timing, or full MUGEN/IKEMEN hit-effect parity.`,
          ],
        }),
      });
      artifacts.push({
        name: "kfm-official-qcf-x",
        required: false,
        artifact: presets.createImportedQcfXTraceArtifact(imported, {
          script: presets.qcfXContactScript(),
          requireHitEvent: true,
          requiredExecutedControllers: ["ChangeState", { type: "PosAdd", minCount: 1 }, "HitDef", "PlaySnd"],
          requiredExecutedOperations: ["kinematic:posadd", "hitdef", "audio:playsnd"],
          requiredSoundEvents: [
            { actorId: "p1", source: "imported", actorKind: "player", type: "PlaySnd", group: 0, index: 3, raw: "0, 3", stateNo: 1000 },
            {
              actorId: "p1",
              source: "imported",
              actorKind: "player",
              type: "PlaySnd",
              group: 5,
              index: 4,
              raw: "5,4",
              stateNo: 1000,
              contactKind: "hit",
              requireContactId: true,
            },
          ],
          requiredHitEffectEvents: [
            {
              actorId: "p1",
              source: "imported",
              actorKind: "player",
              kind: "hit",
              sparkNo: 2,
              raw: "2",
              offsetX: -10,
              offsetY: -60,
              stateNo: 1000,
              contactKind: "hit",
              requireContactId: true,
            },
          ],
          requiredContactEffectPackages: [
            {
              actorId: "p1",
              source: "imported",
              actorKind: "player",
              contactKind: "hit",
              sound: {
                type: "PlaySnd",
                group: 5,
                index: 4,
                raw: "5,4",
                stateNo: 1000,
                contactKind: "hit",
                requireContactId: true,
              },
              hitEffect: {
                kind: "hit",
                sparkNo: 2,
                raw: "2",
                offsetX: -10,
                offsetY: -60,
                stateNo: 1000,
                contactKind: "hit",
                requireContactId: true,
              },
            },
          ],
          requiredTargetLinks: [{ ownerId: "p1", actorId: "p2", targetId: 0 }],
          requiredActorFrameSequences: [presets.officialKfmQcfXActorFrameSequence()],
          requiredControllerEventSequences: [presets.officialKfmQcfXControllerSequence()],
          requiredFinalActors: [
            {
              actorId: "p1",
              source: "imported",
              actorKind: "player",
              stateNo: 1000,
              animNo: 1000,
              power: 35,
              ctrl: false,
              stateType: "S",
              moveType: "A",
              physics: "S",
              targetCount: 1,
            },
            {
              actorId: "p2",
              source: "demo",
              actorKind: "player",
              life: 910,
              ctrl: true,
              stateType: "S",
              moveType: "H",
              physics: "S",
              hitFall: { falling: true, kill: true, velocityY: -3.5, downRecover: true },
            },
          ],
          targetId: "kfm-official-qcf-x-golden",
          targetLabel: "Official KFM QCF x route",
          notes: [
            `Optional local fixture trace from ${path.relative(process.cwd(), kfmFixturePath)}. Requires private fixture presence and verifies that the real KFM QCF_x route buffers command input, enters state 1000, advances to authored HitDef contact, emits S5,4 hit-sound telemetry, and emits inherited [Data] sparkno 2 telemetry with authored sparkxy offset. This does not prove exact Kung Fu Palm timing, pushback, renderer/audio playback, full controller-loop parity, or broad special-move compatibility.`,
          ],
        }),
      });
      artifacts.push({
        name: "kfm-official-x-guard",
        required: false,
        artifact: presets.createImportedGuardTraceArtifact(imported, {
          targetId: "kfm-official-x-guard-golden",
          targetLabel: "Official KFM x guard route",
          notes: [
            `Optional local fixture trace from ${path.relative(process.cwd(), kfmFixturePath)}. Requires private fixture presence and verifies the current partial held-back guard route.`,
          ],
        }),
      });
      artifacts.push({
        name: "kfm-official-default-guard-state",
        required: false,
        artifact: presets.createImportedDefaultGuardStateTraceArtifact(imported, {
          requiredExecutedOperations: ["hitdef", "kinematic:hitvelset"],
          requiredControllerEventSequences: [presets.officialKfmStandGuardHitControllerSequence()],
          requiredActorFrames: presets.officialKfmStandGuardHitPhysicsFrames(),
          requiredFinalActors: [
            {
              actorId: "p2",
              source: "imported",
              actorKind: "player",
              life: 995,
              ctrl: true,
              stateType: "S",
              moveType: "I",
              physics: "S",
            },
          ],
          targetId: "kfm-official-default-guard-state-golden",
          targetLabel: "Official KFM Common1 guard-hit route",
          notes: [
            `Optional local fixture trace from ${path.relative(process.cwd(), kfmFixturePath)}. Requires private fixture presence and verifies that the real KFM defender can enter Common1 guard-hit states 150 and 151 after blocking a HitDef without p2stateno, with bounded controller/operation order plus actor-frame state/physics/body telemetry. Guard-distance, guard-start, guard-end, sparks, sounds, and exact push/effect parity remain future work.`,
          ],
        }),
      });
      artifacts.push({
        name: "kfm-official-default-guard-slide-stop",
        required: false,
        artifact: presets.createImportedDefaultGuardStateTraceArtifact(imported, {
          requiredExecutedStates: [200, 150, 151, 130],
          requiredExecutedControllers: ["ChangeState", "HitDef", "HitVelSet", "VelSet"],
          requiredExecutedOperations: ["hitdef", "kinematic:hitvelset", "kinematic:velset"],
          requiredControllerEventSequences: [presets.officialKfmStandGuardSlideStopControllerSequence()],
          requiredActorFrames: presets.officialKfmStandGuardHitPhysicsFrames(),
          requiredFinalActors: [
            {
              actorId: "p2",
              source: "imported",
              actorKind: "player",
              life: 995,
              ctrl: true,
              stateType: "S",
              moveType: "I",
              physics: "S",
            },
          ],
          targetId: "kfm-official-default-guard-slide-stop-golden",
          targetLabel: "Official KFM Common1 guard slide-stop route",
          notes: [
            `Optional local fixture trace from ${path.relative(process.cwd(), kfmFixturePath)}. Requires private fixture presence and verifies that real KFM/Common1 stand guard-hit state 151 executes HitVelSet, VelSet, and final ChangeState in order after direct guarded contact, with bounded actor-frame state/physics/body telemetry. This does not prove public KFM support, exact guard control timing, proximity guard, guard effects, crouch/air parity, visual/audio parity, or full MUGEN/IKEMEN guard parity.`,
          ],
        }),
      });
      artifacts.push({
        name: "kfm-official-default-guard-hold-return",
        required: false,
        artifact: presets.createImportedDefaultGuardStateTraceArtifact(imported, {
          requiredExecutedStates: [200, 150, 151, 130],
          requiredExecutedControllers: ["ChangeState", "HitDef", "HitVelSet", "VelSet"],
          requiredExecutedOperations: ["hitdef", "kinematic:hitvelset", "kinematic:velset"],
          requiredControllerEventSequences: [presets.officialKfmStandGuardSlideStopControllerSequence()],
          requiredActorFrames: presets.officialKfmStandGuardHitPhysicsFrames(),
          requiredActorFrameSequences: [presets.officialKfmStandGuardHoldReturnActorFrameSequence()],
          requiredFinalActors: [
            {
              actorId: "p2",
              source: "imported",
              actorKind: "player",
              life: 995,
              ctrl: true,
              stateType: "S",
              moveType: "I",
              physics: "S",
            },
          ],
          targetId: "kfm-official-default-guard-hold-return-golden",
          targetLabel: "Official KFM Common1 guard-hold return route",
          notes: [
            `Optional local fixture trace from ${path.relative(process.cwd(), kfmFixturePath)}. Requires private fixture presence and verifies that real KFM/Common1 stand guard-hit state 151 returns through an observable guard-hold state 130 actor-frame bucket before walking/control resumes, while preserving the existing slide-stop and HitOver controller/typed-operation order. This is private-fixture confidence only; it does not prove public KFM support, exact guard-hold duration, proximity guard control timing, guard effects, crouch/air guard parity, visual/audio parity, or full MUGEN/IKEMEN guard parity.`,
          ],
        }),
      });
      artifacts.push({
        name: "kfm-official-default-guard-hold-walk-return",
        required: false,
        artifact: presets.createImportedDefaultGuardStateTraceArtifact(imported, {
          requiredExecutedStates: [200, 150, 151, 130],
          requiredExecutedControllers: ["ChangeState", "HitDef", "HitVelSet", "VelSet"],
          requiredExecutedOperations: ["hitdef", "kinematic:hitvelset", "kinematic:velset"],
          requiredControllerEventSequences: [presets.officialKfmStandGuardSlideStopControllerSequence()],
          requiredActorFrames: presets.officialKfmStandGuardHitPhysicsFrames(),
          requiredActorFrameSequences: [presets.officialKfmStandGuardHoldWalkReturnActorFrameSequence()],
          requiredActiveCommands: ["holdback", "x"],
          requiredFinalActors: [
            {
              actorId: "p2",
              source: "imported",
              actorKind: "player",
              stateNo: 20,
              animNo: 20,
              life: 995,
              ctrl: true,
              stateType: "S",
              moveType: "I",
              physics: "S",
            },
          ],
          targetId: "kfm-official-default-guard-hold-walk-return-golden",
          targetLabel: "Official KFM Common1 guard-hold walk-control route",
          notes: [
            `Optional local fixture trace from ${path.relative(process.cwd(), kfmFixturePath)}. Requires private fixture presence and verifies that real KFM/Common1 stand guard-hit state 151 returns through observable guard-hold state 130 and then resumes held-back walking state/action 20 with control, while preserving the existing slide-stop and HitOver controller/typed-operation order. This is private-fixture confidence only; it does not prove public KFM support, exact guard-hold duration, exact guard control timing, proximity guard behavior, guard effects, crouch/air guard parity, visual/audio parity, or full MUGEN/IKEMEN guard parity.`,
          ],
        }),
      });
      artifacts.push({
        name: "kfm-official-default-crouch-guard-state",
        required: false,
        artifact: presets.createImportedDefaultGuardStateTraceArtifact(imported, {
          script: presets.importedDefaultCrouchGuardStateScript(),
          requiredExecutedStates: [200, 153],
          requiredExecutedOperations: ["hitdef", "kinematic:hitvelset"],
          requiredControllerEventSequences: [presets.officialKfmCrouchGuardHitControllerSequence()],
          requiredActorFrames: presets.officialKfmCrouchGuardHitPhysicsFrames(),
          requiredActiveCommands: ["holddown", "x"],
          requiredFinalActors: [
            {
              actorId: "p2",
              source: "imported",
              actorKind: "player",
              life: 995,
              ctrl: true,
              stateType: "C",
              moveType: "I",
              physics: "C",
            },
          ],
          targetId: "kfm-official-default-crouch-guard-state-golden",
          targetLabel: "Official KFM Common1 crouch guard-hit route",
          notes: [
            `Optional local fixture trace from ${path.relative(process.cwd(), kfmFixturePath)}. Requires private fixture presence and verifies that the real KFM defender can evaluate Common1 command expressions and enter crouch guard-hit state 153 after blocking a HitDef while holding down-back, with bounded controller/operation order plus actor-frame crouch state/physics/body telemetry. Guard-distance, guard-start, guard-end, sparks, sounds, and exact crouch/air guard parity remain future work.`,
          ],
        }),
      });
      artifacts.push({
        name: "kfm-official-default-crouch-guard-slide-stop",
        required: false,
        artifact: presets.createImportedDefaultGuardStateTraceArtifact(imported, {
          script: presets.importedDefaultCrouchGuardStateScript(),
          requiredExecutedStates: [200, 152, 153],
          requiredExecutedControllers: ["ChangeState", "HitDef", "HitVelSet", "VelSet"],
          requiredExecutedOperations: ["hitdef", "kinematic:hitvelset", "kinematic:velset"],
          requiredControllerEventSequences: [presets.officialKfmCrouchGuardSlideStopControllerSequence()],
          requiredActorFrames: presets.officialKfmCrouchGuardHitPhysicsFrames(),
          requiredActiveCommands: ["holddown", "x"],
          requiredFinalActors: [
            {
              actorId: "p2",
              source: "imported",
              actorKind: "player",
              life: 995,
              ctrl: true,
              stateType: "C",
              moveType: "I",
              physics: "C",
            },
          ],
          targetId: "kfm-official-default-crouch-guard-slide-stop-golden",
          targetLabel: "Official KFM Common1 crouch guard slide-stop route",
          notes: [
            `Optional local fixture trace from ${path.relative(process.cwd(), kfmFixturePath)}. Requires private fixture presence and verifies that real KFM/Common1 crouch guard-hit state 153 executes HitVelSet, VelSet, and final ChangeState in order after direct guarded contact while holding down-back, with bounded actor-frame crouch state/physics/body telemetry. The observed KFM route returns toward crouch/control rather than being claimed as a public 130 guard-hold route. This does not prove public KFM support, exact guard control timing, proximity guard, guard effects, air parity, visual/audio parity, or full MUGEN/IKEMEN guard parity.`,
          ],
        }),
      });
      artifacts.push({
        name: "kfm-official-default-crouch-guard-hold-crouch-return",
        required: false,
        artifact: presets.createImportedDefaultGuardStateTraceArtifact(imported, {
          script: presets.importedDefaultCrouchGuardStateScript(),
          requiredExecutedStates: [200, 131, 152, 153],
          requiredExecutedControllers: ["ChangeState", "HitDef", "HitVelSet", "VelSet"],
          requiredExecutedOperations: ["hitdef", "kinematic:hitvelset", "kinematic:velset"],
          requiredControllerEventSequences: [presets.officialKfmCrouchGuardSlideStopControllerSequence()],
          requiredActorFrames: presets.officialKfmCrouchGuardHitPhysicsFrames(),
          requiredActorFrameSequences: [presets.officialKfmCrouchGuardHoldCrouchReturnActorFrameSequence()],
          requiredActiveCommands: ["holdback", "holddown", "x"],
          requiredFinalActors: [
            {
              actorId: "p2",
              source: "imported",
              actorKind: "player",
              stateNo: 11,
              animNo: 11,
              life: 995,
              ctrl: true,
              stateType: "C",
              moveType: "I",
              physics: "C",
            },
          ],
          targetId: "kfm-official-default-crouch-guard-hold-crouch-return-golden",
          targetLabel: "Official KFM Common1 crouch guard-hold crouch-control route",
          notes: [
            `Optional local fixture trace from ${path.relative(process.cwd(), kfmFixturePath)}. Requires private fixture presence and verifies that real KFM/Common1 crouch guard-hit state 153 returns through observable crouch guard-hold state 131 and then resumes held-down crouch state/action 11 with control, while preserving the existing slide-stop and HitOver controller/typed-operation order. This is private-fixture confidence only; it does not prove public KFM support, exact guard-hold duration, exact guard control timing, proximity guard behavior, guard effects, air guard parity, visual/audio parity, or full MUGEN/IKEMEN guard parity.`,
          ],
        }),
      });
      artifacts.push({
        name: "kfm-official-default-air-guard-state",
        required: false,
        artifact: presets.createImportedDefaultGuardStateTraceArtifact(imported, {
          attacker: presets.createSyntheticImportedTraceFighter({
            id: "kfm-official-default-air-guard-attacker",
            displayName: "Official KFM Air Guard Hit Probe",
            guardDamage: 5,
            guardFlag: "A",
            guardSlideTime: 5,
            guardControlTime: 7,
          }),
          script: presets.importedDefaultAirGuardStateScript(),
          requiredExecutedStates: [200, 154, 155, 52],
          requiredExecutedControllers: ["ChangeState", "CtrlSet", "HitDef", "HitVelSet", "PosSet", "VarSet", "VelAdd", "VelSet"],
          requiredExecutedOperations: ["hitdef", "resource:ctrlset", "kinematic:hitvelset", "kinematic:posset", "kinematic:velset"],
          requiredControllerEventSequences: [presets.officialKfmAirGuardHitControllerSequence()],
          requiredActorFrames: presets.officialKfmAirGuardHitPhysicsFrames(),
          requiredActorFrameSequences: [presets.officialKfmAirGuardLandingWalkReturnActorFrameSequence()],
          requiredActiveCommands: ["holdback", "x"],
          requiredFinalActors: [
            {
              actorId: "p2",
              source: "imported",
              actorKind: "player",
              stateNo: 20,
              animNo: 20,
              life: 995,
              ctrl: true,
              stateType: "S",
              moveType: "I",
              physics: "S",
            },
          ],
          targetId: "kfm-official-default-air-guard-state-golden",
          targetLabel: "Official KFM Common1 air guard-hit route",
          notes: [
            `Optional local fixture trace from ${path.relative(process.cwd(), kfmFixturePath)}. Requires private fixture presence and verifies that the real KFM defender can enter Common1 air guard-hit states 154 and 155 after blocking an A-guardable HitDef while airborne and holding back, land through state 52, and then resume held-back walk state/action 20 with control, using bounded controller/operation order plus actor-frame air velocity/body/landing telemetry. Exact air guard physics, landing parity, guard-distance, guard-start, guard-end, sparks, sounds, and IKEMEN parity remain future work.`,
          ],
        }),
      });
      artifacts.push({
        name: "kfm-official-auto-guard-start",
        required: false,
        artifact: presets.createImportedAutoGuardStartTraceArtifact(imported, {
          attacker: presets.createSyntheticImportedTraceFighter({
            id: "kfm-official-auto-guard-start-attacker",
            displayName: "Official KFM Auto Guard Start Probe",
            guardDamage: 5,
            guardFlag: "MA",
            guardDistance: 180,
          }),
          requiredExecutedControllers: ["ChangeAnim", "ChangeState", "HitDef", "StateTypeSet"],
          requiredExecutedOperations: ["hitdef", "metadata:statetypeset"],
          requiredControllerEventSequences: [presets.officialKfmAutoGuardStartControllerSequence()],
          targetId: "kfm-official-auto-guard-start-golden",
          targetLabel: "Official KFM Common1 automatic guard-start route",
          notes: [
            `Optional local fixture trace from ${path.relative(process.cwd(), kfmFixturePath)}. Requires private fixture presence and verifies that the real KFM defender can enter its Common1 guard-start route from held-back input plus bounded InGuardDist before contact, including ordered ChangeAnim, StateTypeSet, typed metadata, and ChangeState evidence through 120 -> 130. Exact proximity guard, guard end, air guard, sparks, sounds, and IKEMEN parity remain future work.`,
          ],
        }),
      });
      artifacts.push({
        name: "kfm-official-auto-guard-end",
        required: false,
        artifact: presets.createImportedAutoGuardEndTraceArtifact(imported, {
          attacker: presets.createSyntheticImportedTraceFighter({
            id: "kfm-official-auto-guard-end-attacker",
            displayName: "Official KFM Auto Guard End Probe",
            guardDamage: 5,
            guardFlag: "MA",
            guardDistance: 180,
          }),
          requiredExecutedControllers: ["ChangeAnim", "ChangeState", "HitDef", "StateTypeSet", "VelSet"],
          requiredExecutedOperations: ["hitdef", "kinematic:velset", "metadata:statetypeset"],
          requiredControllerEventSequences: [presets.officialKfmAutoGuardEndControllerSequence()],
          targetId: "kfm-official-auto-guard-end-golden",
          targetLabel: "Official KFM Common1 automatic guard-end route",
          notes: [
            `Optional local fixture trace from ${path.relative(process.cwd(), kfmFixturePath)}. Requires private fixture presence and verifies that the real KFM defender can leave its Common1 guard route through state 140 and return to idle/control after bounded InGuardDist is no longer true, including ordered 120 -> 130 guard-start evidence, 130 stop-guarding ChangeState, and idle VelSet typed operation evidence. Exact guard-end timing, proximity guard, air guard, sparks, sounds, and IKEMEN parity remain future work.`,
          ],
        }),
      });
      artifacts.push({
        name: "kfm-official-x-hitstun",
        required: false,
        artifact: presets.createImportedHitstunTraceArtifact(imported, {
          targetId: "kfm-official-x-hitstun-golden",
          targetLabel: "Official KFM x hitstun route",
          notes: [
            `Optional local fixture trace from ${path.relative(process.cwd(), kfmFixturePath)}. Requires private fixture presence and verifies the current partial get-hit snapshot after the x route connects.`,
          ],
        }),
      });
      artifacts.push({
        name: "kfm-official-default-gethit",
        required: false,
        artifact: presets.createImportedDefaultGetHitTraceArtifact(imported, {
          targetId: "kfm-official-default-gethit-golden",
          targetLabel: "Official KFM default Common1 get-hit route",
          notes: [
            `Optional local fixture trace from ${path.relative(process.cwd(), kfmFixturePath)}. Requires private fixture presence and verifies the current partial default Common1 state 5000 entry on the real KFM defender after a HitDef without p2stateno. The separate KFM x gate covers KFM's own state 200 HitDef route.`,
          ],
        }),
      });
      artifacts.push({
        name: "kfm-official-default-gethit-progression",
        required: false,
        artifact: presets.createImportedDefaultGetHitProgressionTraceArtifact(imported, {
          targetId: "kfm-official-default-gethit-progression-golden",
          targetLabel: "Official KFM Common1 HitShakeOver/HitOver progression",
          requiredActorFrames: presets.officialKfmDefaultGetHitProgressionPhysicsFrames(),
          notes: [
            `Optional local fixture trace from ${path.relative(process.cwd(), kfmFixturePath)}. Requires private fixture presence and verifies that the real KFM defender can enter Common1 state 5000, progress to 5001 through HitShakeOver, and return to state 0 through HitOver after a HitDef without p2stateno.`,
          ],
        }),
      });
      artifacts.push({
        name: "kfm-official-default-crouch-gethit-progression",
        required: false,
        artifact: presets.createImportedDefaultGetHitProgressionTraceArtifact(imported, {
          targetId: "kfm-official-default-crouch-gethit-progression-golden",
          targetLabel: "Official KFM crouch Common1 HitShakeOver/HitOver progression",
          gateLabel: "imported-default-crouch-gethit-progression-golden",
          script: presets.importedDefaultCrouchGetHitProgressionScript(),
          shakeStateNo: 5010,
          slideStateNo: 5011,
          requiredExecutedStates: [11, 200, 5010, 5011],
          requiredControllerEventSequences: [presets.officialKfmDefaultCrouchGetHitProgressionControllerSequence()],
          requiredActorFrames: presets.officialKfmDefaultCrouchGetHitProgressionPhysicsFrames(),
          notes: [
            `Optional local fixture trace from ${path.relative(process.cwd(), kfmFixturePath)}. Requires private fixture presence and verifies that the real KFM defender can hold crouch, enter Common1 state 5010, progress to 5011 through HitShakeOver, apply KFM's crouch slide HitVelSet / VelMul / VelSet / DefenceMulSet controller and typed-operation order, and return to state 0/control through HitOver after a HitDef without p2stateno. KFM's crouch route executes state 11 before contact, so the gate requires the executed crouch prep state plus final actor state 0 instead of requiring state 0 as an executed controller state; exact crouch get-hit timing, full slide tables, fall routing, custom-state/helper/team breadth, and visual/audio parity remain future work.`,
          ],
        }),
      });
      artifacts.push({
        name: "kfm-official-default-fall-gethit",
        required: false,
        artifact: presets.createImportedDefaultFallGetHitTraceArtifact(imported, {
          targetId: "kfm-official-default-fall-gethit-golden",
          targetLabel: "Official KFM Common1 airborne fall get-hit route",
          requiredExecutedStates: [200, 5000, 5030, 5050, 5100, 5101, 5110],
          requiredControllerEventSequences: [presets.officialKfmFallGetHitControllerSequence()],
          requiredActorFrameSequences: [presets.defaultFallGetHitActorFrameSequence([5000, 5030, 5050, 5100, 5101, 5110])],
          notes: [
            `Optional local fixture trace from ${path.relative(process.cwd(), kfmFixturePath)}. Requires private fixture presence and verifies that the real KFM defender can enter Common1 state 5000, branch to 5030, reach 5050, hit ground in 5100, enter the first bounce state 5101, and settle into lie-down state 5110 after a fall HitDef without p2stateno, with required actor-frame order plus bounded controller/typed-operation order evidence. Separate recovery artifacts cover the bounded 5110 -> 5120 -> 0 get-up route, the air recovery-input 5050 -> 5210 -> 52 -> 0 branch, and the ground recovery-input 5050 -> 5200 -> 5201 -> 52 -> 0 branch; exact recovery thresholds/velocities, tick-order, and guard-state parity remain future work.`,
          ],
        }),
      });
      artifacts.push({
        name: "kfm-official-default-fall-recovery",
        required: false,
        artifact: presets.createImportedDefaultFallRecoveryTraceArtifact(imported, {
          targetId: "kfm-official-default-fall-recovery-golden",
          targetLabel: "Official KFM Common1 lie-down get-up route",
          requiredControllerEventSequences: [presets.officialKfmFallLieDownGetUpControllerSequence()],
          requiredActorFrameSequences: [presets.defaultFallLieDownGetUpActorFrameSequence()],
          notes: [
            `Optional local fixture trace from ${path.relative(process.cwd(), kfmFixturePath)}. Requires private fixture presence and verifies that the real KFM defender can continue from lie-down state 5110 into get-up state 5120 and return to state 0/control after a fall HitDef without p2stateno, with required actor-frame order plus bounded 5110/5120 controller/typed-operation order evidence. Separate KFM artifacts cover air recovery-input 5050 -> 5210 -> 52 -> 0 and ground recovery-input 5050 -> 5200 -> 5201 -> 52 -> 0; this artifact does not prove exact tick-order parity, recovery thresholds/velocities, or guard-state parity.`,
          ],
        }),
      });
      artifacts.push({
        name: "kfm-official-default-fall-recovery-input",
        required: false,
        artifact: presets.createImportedDefaultFallRecoveryInputTraceArtifact(imported, {
          targetId: "kfm-official-default-fall-recovery-input-golden",
          targetLabel: "Official KFM Common1 air recovery input route",
          requiredControllerEventSequences: [presets.officialKfmAirRecoveryControllerSequence()],
          requiredActorFrameSequences: [presets.officialKfmAirRecoveryActorFrameSequence()],
          notes: [
            `Optional local fixture trace from ${path.relative(process.cwd(), kfmFixturePath)}. Requires private fixture presence and verifies that the real KFM defender can leave Common1 fall state 5050 through CanRecover plus command = "recovery", enter air recovery state 5210, land through state 52, and return to state 0/control after a fall HitDef without p2stateno. The gate now also requires bounded official KFM controller/typed-operation order through 5050 VelAdd/ChangeState, 5210 PalFX/PosFreeze/Turn/NotHitBy/VelMul/VelAdd/ChangeState, 52 landing evidence, and state 0 landing VelSet. A separate KFM artifact covers the bounded ground recovery-input route 5050 -> 5200 -> 5201 -> 52 -> 0. This artifact does not yet prove exact recovery thresholds/velocities, full tick-order parity, or guard-state parity.`,
          ],
        }),
      });
      artifacts.push({
        name: "kfm-official-default-air-fall-recovery-input",
        required: false,
        artifact: presets.createImportedDefaultFallRecoveryInputTraceArtifact(imported, {
          targetId: "kfm-official-default-air-fall-recovery-input-golden",
          targetLabel: "Official KFM air-entry Common1 recovery input route",
          script: presets.importedDefaultAirFallRecoveryInputScript(),
          requiredExecutedStates: [200, 5020, 5030, 5035, 5050, 5210, 52],
          requiredControllerEventSequences: [presets.officialKfmAirEntryRecoveryInputControllerSequence()],
          requiredActorFrameSequences: [presets.officialKfmAirEntryRecoveryInputActorFrameSequence()],
          notes: [
            `Optional local fixture trace from ${path.relative(process.cwd(), kfmFixturePath)}. Requires private fixture presence and verifies that the real KFM defender can start in airborne Common1 state 5020 after a fall HitDef without p2stateno, route through 5030, KFM's intermediate 5035, and 5050, accept command = "recovery" after the bounded 5030 fall.recovertime countdown reaches 0, enter 5210, land through state 52, and return to state 0/control. The gate also requires bounded official KFM 5020/5030/5035/5050/5210/52 controller/typed-operation order. This is private-fixture confidence only; it does not prove exact recovery threshold tables, velocity math, controller-loop tick order, public bundled KFM support, or full MUGEN/IKEMEN recovery parity.`,
          ],
        }),
      });
      artifacts.push({
        name: "kfm-official-default-fall-recovery-threshold",
        required: false,
        artifact: presets.createImportedDefaultFallRecoveryThresholdTraceArtifact(imported, {
          targetId: "kfm-official-default-fall-recovery-threshold-golden",
          targetLabel: "Official KFM Common1 recovery threshold route",
          notes: [
            `Optional local fixture trace from ${path.relative(process.cwd(), kfmFixturePath)}. Requires private fixture presence and verifies that real KFM Common1 exposes actor-frame recovery-threshold evidence: state 5050 while fall.recovertime is still positive, then ground recovery state 5200 with recoverTime = 0 after CanRecover plus command = "recovery". This artifact does not yet prove exact recovery threshold tables, velocity math, controller tick order, air-recovery selection, or full recovery parity.`,
          ],
        }),
      });
      artifacts.push({
        name: "kfm-official-default-fall-recovery-too-early",
        required: false,
        artifact: presets.createImportedDefaultFallRecoveryTooEarlyTraceArtifact(imported, {
          targetId: "kfm-official-default-fall-recovery-too-early-golden",
          targetLabel: "Official KFM Common1 recovery input too-early reject route",
          notes: [
            `Optional local fixture trace from ${path.relative(process.cwd(), kfmFixturePath)}. Requires private fixture presence and verifies that the real KFM defender does not leave Common1 fall state 5050 through command = "recovery" before the bounded recovery timer permits it. Exact recovery thresholds/velocities, tick-order parity, and official oracle breadth remain future work.`,
          ],
        }),
      });
      artifacts.push({
        name: "kfm-official-default-air-fall-recovery-too-early",
        required: false,
        artifact: presets.createImportedDefaultFallRecoveryTooEarlyTraceArtifact(imported, {
          targetId: "kfm-official-default-air-fall-recovery-too-early-golden",
          targetLabel: "Official KFM air-entry Common1 recovery input too-early reject route",
          script: presets.importedDefaultAirFallRecoveryTooEarlyScript(),
          requiredExecutedStates: [200, 5020, 5030, 5035, 5050],
          forbiddenExecutedStates: [5210, 5200, 5201, 52, 5100, 5101, 5110, 5120],
          requiredControllerEventSequences: [presets.officialKfmAirEntryRecoveryTooEarlyControllerSequence()],
          requiredActorFrameSequences: [presets.officialKfmAirEntryRecoveryTooEarlyActorFrameSequence()],
          notes: [
            `Optional local fixture trace from ${path.relative(process.cwd(), kfmFixturePath)}. Requires private fixture presence and verifies that the real KFM defender can start in airborne Common1 state 5020 after a fall HitDef without p2stateno, route through 5030 and KFM's intermediate 5035 into 5050, keep command = "recovery" active too early, and remain in 5050 while the bounded fall.recovertime window is still positive. Recovery, landing, ground-impact, bounce, and lie-down states stay forbidden for this negative route. This is private-fixture confidence only; it does not prove exact recovery threshold tables, velocity math, controller-loop tick order, public bundled KFM support, or full MUGEN/IKEMEN recovery parity.`,
          ],
        }),
      });
      artifacts.push({
        name: "kfm-official-default-fall-ground-recovery",
        required: false,
        artifact: presets.createImportedDefaultFallGroundRecoveryTraceArtifact(imported, {
          targetId: "kfm-official-default-fall-ground-recovery-golden",
          targetLabel: "Official KFM Common1 ground recovery input route",
          requiredControllerEventSequences: [presets.officialKfmGroundRecoveryControllerSequence()],
          requiredActorFrameSequences: [presets.officialKfmGroundRecoveryActorFrameSequence()],
          notes: [
            `Optional local fixture trace from ${path.relative(process.cwd(), kfmFixturePath)}. Requires private fixture presence and verifies that the real KFM defender can leave Common1 fall state 5050 through CanRecover plus command = "recovery" near the ground, enter 5200, self-return into 5201/land through 52, and return to state 0/control after a fall HitDef without p2stateno. The gate now also requires bounded official KFM actor-frame order for 5050 -> 5200 -> 52 plus controller/typed-operation order through 5050 VelAdd/ChangeState, 5200 VelAdd/SelfState, and 52 landing operations. It does not yet prove exact recovery thresholds/velocities, full tick-order parity, or guard-state parity.`,
          ],
        }),
      });
      artifacts.push({
        name: "kfm-official-default-fall-ground-recovery-priority",
        required: false,
        artifact: presets.createImportedDefaultFallGroundRecoveryTraceArtifact(imported, {
          targetId: "kfm-official-default-fall-ground-recovery-priority-golden",
          targetLabel: "Official KFM Common1 ground recovery priority over air recovery route",
          requiredControllerEventSequences: [presets.officialKfmGroundRecoveryControllerSequence()],
          requiredActorFrameSequences: [presets.officialKfmGroundRecoveryActorFrameSequence()],
          forbiddenExecutedStates: [5210, 5100, 5101, 5110, 5120],
          requiredExecutedOperations: ["hitdef", "kinematic:hitvelset", "kinematic:velset", "kinematic:posset"],
          notes: [
            `Optional local fixture trace from ${path.relative(process.cwd(), kfmFixturePath)}. Requires private fixture presence and verifies that the real KFM defender chooses the near-ground Common1 5200/5201/52 recovery route while generic air-recovery state 5210 and the lie-down chain stay forbidden. The gate also requires bounded official KFM actor-frame order and typed hit/landing kinematic operation evidence. This is private-fixture priority confidence only; it does not prove exact ground/air recovery arbitration constants, recovery threshold tables, velocity math, controller-loop tick order, public bundled KFM support, or full MUGEN/IKEMEN recovery parity.`,
          ],
        }),
      });
      artifacts.push({
        name: "kfm-official-x-state-exit",
        required: false,
        artifact: presets.createImportedStateExitTraceArtifact(imported, {
          targetId: "kfm-official-x-state-exit-golden",
          targetLabel: "Official KFM x state-exit route",
          notes: [
            `Optional local fixture trace from ${path.relative(process.cwd(), kfmFixturePath)}. Requires private fixture presence and verifies the current partial x-hit recovery route returns to idle/control.`,
          ],
        }),
      });
    } else {
      skipped.push({
        name: "kfm-official",
        reason: `Optional fixture not found at ${path.relative(process.cwd(), kfmFixturePath)}`,
      });
    }

    const failures = [];
    for (const entry of artifacts) {
      const filename = `${entry.name}.json`;
      const artifactPath = path.join(outDir, filename);
      fs.writeFileSync(artifactPath, `${JSON.stringify(entry.artifact, null, 2)}\n`);
      if (entry.artifact.status !== "passed") {
        failures.push(`${entry.name}: ${entry.artifact.gates.flatMap((gate) => gate.failures).join("; ")}`);
      }
    }

    const scheduleArtifacts = artifacts.map((entry) => {
      const schedule = entry.artifact.diagnostics?.matchTickSchedule;
      return {
        name: entry.name,
        required: entry.required,
        status: schedule?.status ?? "unavailable",
        observedBranches: schedule?.observedBranches ?? [],
        architectureStatuses: schedule?.architectureStatuses ?? [],
        frameCount: schedule?.frameCount ?? 0,
        failures: schedule?.failures ?? ["Artifact omitted MatchTickSchedule/v0 diagnostics"],
      };
    });
    const scheduleDiagnostics = artifacts.flatMap((entry) =>
      entry.artifact.diagnostics?.matchTickSchedule ? [entry.artifact.diagnostics.matchTickSchedule] : [],
    );
    const phaseCatalog = mergeScheduleCatalog(scheduleDiagnostics.flatMap((schedule) => schedule.phaseCatalog));
    const snapshotPhaseCatalog = mergeScheduleCatalog(
      scheduleDiagnostics.flatMap((schedule) => schedule.snapshotPhaseCatalog),
    );
    const architectureChecks = mergeScheduleCatalog(
      scheduleDiagnostics.flatMap((schedule) => schedule.architectureChecks.map((check) => ({
        id: check.id,
        expectedBefore: check.expectedBefore,
        expectedAfter: check.expectedAfter,
      }))),
    );
    const catalogConflicts = [...phaseCatalog.conflicts, ...snapshotPhaseCatalog.conflicts, ...architectureChecks.conflicts];
    const requiredScheduleFailures = scheduleArtifacts.filter(
      (entry) => entry.required && entry.status !== "passed",
    );
    const diagnostics = {
      generatedAt: new Date().toISOString(),
      outDir,
      artifacts: artifacts.map((entry) => ({
        name: entry.name,
        required: entry.required,
        status: entry.artifact.status,
        target: entry.artifact.target,
        checksum: entry.artifact.trace.checksum,
        finalChecksum: entry.artifact.trace.finalChecksum,
        gateLabels: entry.artifact.gates.map((gate) => gate.label),
        failures: entry.artifact.gates.flatMap((gate) => gate.failures),
        path: path.join(outDir, `${entry.name}.json`),
      })),
      coverage: createTraceCoverage(artifacts, skipped),
      matchTickSchedule: {
        schema: "MatchTickSchedule/v0",
        status: requiredScheduleFailures.length || catalogConflicts.length ? "failed" : "passed",
        requiredArtifacts: scheduleArtifacts.filter((entry) => entry.required).length,
        observedBranches: [...new Set(scheduleArtifacts.flatMap((entry) => entry.observedBranches))],
        architectureStatuses: [...new Set(scheduleArtifacts.flatMap((entry) => entry.architectureStatuses))],
        phaseCatalog: phaseCatalog.values,
        snapshotPhaseCatalog: snapshotPhaseCatalog.values,
        architectureChecks: architectureChecks.values,
        catalogConflicts,
        artifacts: scheduleArtifacts,
      },
      skipped,
    };
    if (requiredScheduleFailures.length) {
      failures.push(
        ...requiredScheduleFailures.map(
          (entry) => `${entry.name}: MatchTickSchedule/v0 ${entry.status} (${entry.failures.join("; ")})`,
        ),
      );
    }
    if (catalogConflicts.length) {
      failures.push(...catalogConflicts.map((conflict) => `MatchTickSchedule/v0 catalog: ${conflict}`));
    }
    const coverageFailures = validateTraceCoverage(diagnostics.coverage);
    if (coverageFailures.length) {
      diagnostics.coverage.failures = coverageFailures;
      failures.push(...coverageFailures.map((failure) => `coverage: ${failure}`));
    }
    fs.writeFileSync(path.join(outDir, "diagnostics.json"), `${JSON.stringify(diagnostics, null, 2)}\n`);

    if (failures.length) {
      throw new Error(`Trace gates failed:\n${failures.join("\n")}`);
    }

    console.log(
      JSON.stringify(
        {
          status: "passed",
          outDir,
          artifacts: diagnostics.artifacts.map((artifact) => ({
            name: artifact.name,
            required: artifact.required,
            status: artifact.status,
            checksum: artifact.checksum,
            gates: artifact.gateLabels,
          })),
          coverage: diagnostics.coverage.summary,
          skipped,
        },
        null,
        2,
      ),
    );
  } finally {
    await vite.close();
  }
}

async function createViteLoader() {
  const { createServer } = await import("vite");
  return createServer({
    root: process.cwd(),
    logLevel: "error",
    server: { middlewareMode: true },
    appType: "custom",
  });
}

async function loadImportedFighter(vite, fixturePath) {
  const { MugenCharacterLoader } = await vite.ssrLoadModule("/src/mugen/loader/MugenCharacterLoader.ts");
  const { ZipCharacterSource } = await vite.ssrLoadModule("/src/mugen/loader/ZipCharacterSource.ts");
  const { createImportedFighterDefinition } = await vite.ssrLoadModule("/src/mugen/runtime/importedFighter.ts");

  const bytes = fs.readFileSync(fixturePath);
  const file = new File([bytes], path.basename(fixturePath));
  const vfs = await new ZipCharacterSource(file).load();
  const character = await new MugenCharacterLoader().load(file.name, vfs);
  const imported = createImportedFighterDefinition(character);
  if (!imported) {
    throw new Error(`Fixture did not produce an imported runtime fighter: ${fixturePath}`);
  }
  return imported;
}

function createTraceCoverage(entries, skipped) {
  const coverage = {
    summary: {
      totalArtifacts: entries.length,
      requiredArtifacts: entries.filter((entry) => entry.required).length,
      optionalArtifacts: entries.filter((entry) => !entry.required).length,
      passedArtifacts: entries.filter((entry) => entry.artifact.status === "passed").length,
      failedArtifacts: entries.filter((entry) => entry.artifact.status !== "passed").length,
      skippedOptionalFixtures: skipped.length,
      controllerFamilies: 0,
      operationFamilies: 0,
      effectKinds: 0,
      combatReasons: 0,
      matchPauseRoutes: 0,
      soundEventTypes: 0,
      hitEffectEventKinds: 0,
      envShakeEventRoutes: 0,
      worldLifecycleRoutes: 0,
      roundFrameRoutes: 0,
      targetLinkRoutes: 0,
      effectStoreRoutes: 0,
      effectPayloadKinds: 0,
      effectPayloadDeltaRoutes: 0,
    },
    controllers: {},
    operations: {},
    effectKinds: {},
    combatReasons: {},
    eventCategories: {},
    soundEvents: {},
    hitEffects: {},
    envShakeEvents: {},
    matchPauses: {},
    matchPauseFreezes: {},
    matchPauseAdvances: {},
    worldLifecycle: {},
    roundFrames: {},
    targetLinks: {
      artifacts: [],
      requiredArtifacts: [],
      totalEvidenceRows: 0,
    },
    effectStores: {
      artifacts: [],
      requiredArtifacts: [],
      totalEvidenceRows: 0,
      owners: [],
    },
    effectPayloads: {},
    effectPayloadDeltas: {},
  };

  const effectStoreOwners = new Set();

  for (const entry of entries) {
    const artifact = entry.artifact;
    for (const gate of artifact.gates ?? []) {
      const evidence = gate.evidence ?? {};
      const context = { name: entry.name, required: entry.required, gate: gate.label };

      addCountRecordCoverage(coverage.controllers, evidence.executedControllers, context);
      addCountRecordCoverage(coverage.operations, evidence.executedOperations, context);
      addArrayCoverage(coverage.effectKinds, evidence.effectKinds, context);
      addArrayCoverage(coverage.combatReasons, evidence.combatReasons, context);
      addArrayCoverage(coverage.eventCategories, evidence.eventCategories, context);

      for (const pause of evidence.matchPauses ?? []) {
        addCoverageEntry(coverage.matchPauses, pause.type, context, { frames: pause.frames });
      }
      for (const freeze of evidence.matchPauseFreezes ?? []) {
        addCoverageEntry(coverage.matchPauseFreezes, `${freeze.type}:${freeze.actorKind ?? freeze.actorId ?? "actor"}`, context, {
          frames: freeze.frozenFrames,
        });
      }
      for (const advance of evidence.matchPauseAdvances ?? []) {
        addCoverageEntry(coverage.matchPauseAdvances, `${advance.type}:${advance.actorKind ?? advance.actorId ?? "actor"}`, context, {
          frames: advance.advancedFrames,
        });
      }
      for (const event of evidence.soundEvents ?? []) {
        addCoverageEntry(coverage.soundEvents, event.type, context, { count: event.count });
      }
      for (const event of evidence.hitEffectEvents ?? []) {
        addCoverageEntry(coverage.hitEffects, `${event.type}:${event.kind}`, context, { count: event.count });
      }
      for (const event of evidence.envShakeEvents ?? []) {
        addCoverageEntry(coverage.envShakeEvents, "EnvShake", context, { count: event.count });
      }
      for (const event of evidence.worldLifecycleEvents ?? []) {
        addCoverageEntry(coverage.worldLifecycle, `${event.kind}:${event.type}`, context);
      }
      for (const round of evidence.roundFrames ?? []) {
        addCoverageEntry(coverage.roundFrames, round.state, context, { frames: round.frames });
      }

      if (evidence.targetLinks?.length) {
        addArtifactName(coverage.targetLinks.artifacts, entry.name);
        if (entry.required) {
          addArtifactName(coverage.targetLinks.requiredArtifacts, entry.name);
        }
        coverage.targetLinks.totalEvidenceRows += evidence.targetLinks.length;
      }
      if (evidence.effectStores?.length) {
        addArtifactName(coverage.effectStores.artifacts, entry.name);
        if (entry.required) {
          addArtifactName(coverage.effectStores.requiredArtifacts, entry.name);
        }
        coverage.effectStores.totalEvidenceRows += evidence.effectStores.length;
        for (const store of evidence.effectStores) {
          effectStoreOwners.add(store.ownerId);
        }
      }
    }

    for (const effect of artifact.trace?.finalEffects ?? []) {
      if (effect.effect?.kind) {
        addCoverageEntry(coverage.effectPayloads, effect.effect.kind, { name: entry.name, required: entry.required, gate: "finalEffects" });
      }
    }
    for (const frame of artifact.trace?.frames ?? []) {
      for (const change of frame.delta?.actorChanges ?? []) {
        if (change.layer !== "effect") {
          continue;
        }
        for (const field of effectDeltaFields(change.changes)) {
          addCoverageEntry(coverage.effectPayloadDeltas, `${change.actorKind}:${field}`, {
            name: entry.name,
            required: entry.required,
            gate: "frameDelta",
          });
        }
      }
    }
  }

  coverage.effectStores.owners = [...effectStoreOwners].sort();
  coverage.summary.controllerFamilies = Object.keys(coverage.controllers).length;
  coverage.summary.operationFamilies = Object.keys(coverage.operations).length;
  coverage.summary.effectKinds = Object.keys(coverage.effectKinds).length;
  coverage.summary.combatReasons = Object.keys(coverage.combatReasons).length;
  coverage.summary.matchPauseRoutes =
    Object.keys(coverage.matchPauses).length +
    Object.keys(coverage.matchPauseFreezes).length +
    Object.keys(coverage.matchPauseAdvances).length;
  coverage.summary.soundEventTypes = Object.keys(coverage.soundEvents).length;
  coverage.summary.hitEffectEventKinds = Object.keys(coverage.hitEffects).length;
  coverage.summary.envShakeEventRoutes = Object.keys(coverage.envShakeEvents).length;
  coverage.summary.worldLifecycleRoutes = Object.keys(coverage.worldLifecycle).length;
  coverage.summary.roundFrameRoutes = Object.keys(coverage.roundFrames).length;
  coverage.summary.targetLinkRoutes = coverage.targetLinks.artifacts.length;
  coverage.summary.effectStoreRoutes = coverage.effectStores.artifacts.length;
  coverage.summary.effectPayloadKinds = Object.keys(coverage.effectPayloads).length;
  coverage.summary.effectPayloadDeltaRoutes = Object.keys(coverage.effectPayloadDeltas).length;

  return coverage;
}

function validateTraceCoverage(coverage) {
  const failures = [];
  const requiredOperations = [
    "hitdef",
    "target:targetbind",
    "bindtotarget",
    "pause:pause",
    "pause:superpause",
    "projectile",
    "modifyprojectile",
    "helper",
    "explod",
    "modifyexplod",
    "removeexplod",
    "kinematic:velset",
    "kinematic:veladd",
    "kinematic:velmul",
    "kinematic:posset",
    "kinematic:posadd",
    "kinematic:gravity",
    "kinematic:hitvelset",
    "bounds:posfreeze",
    "bounds:screenbound",
    "collision:width",
    "collision:playerpush",
    "metadata:statetypeset",
    "orientation:turn",
    "sprite-effect:sprpriority",
    "sprite-effect:palfx",
    "sprite-effect:trans",
    "sprite-effect:angleset",
    "sprite-effect:angleadd",
    "sprite-effect:anglemul",
    "sprite-effect:angledraw",
    "envcolor",
    "sprite-effect:remappal",
    "sprite-effect:afterimage",
    "sprite-effect:afterimagetime",
    "eligibility:hitby",
    "eligibility:nothitby",
    "hitoverride",
    "reversaldef",
    "damage-scale:attackmulset",
    "damage-scale:defencemulset",
    "contact:movehitreset",
    "contact:hitadd",
    "resource:ctrlset",
    "resource:lifeadd",
    "resource:lifeset",
    "resource:poweradd",
    "resource:powerset",
    "variable:varset",
    "variable:varadd",
    "variable:varrangeset",
  ];
  const requiredEffectKinds = ["projectile", "helper", "explod"];
  const requiredEffectPayloadKinds = ["projectile", "helper", "explod"];
  const requiredEffectPayloadDeltas = ["projectile:hits", "projectile:removal", "projectile:terminal", "explod:bindRemaining"];
  const requiredPauseAdvanceRoutes = [
    "HitPause:player",
    "HitPause:explod",
    "Pause:explod",
    "SuperPause:player",
    "SuperPause:projectile",
    "SuperPause:helper",
    "SuperPause:explod",
  ];
  const requiredPauseFreezeRoutes = [
    "HitPause:player",
    "HitPause:explod",
    "Pause:explod",
    "SuperPause:player",
    "SuperPause:projectile",
    "SuperPause:helper",
    "SuperPause:explod",
  ];
  const requiredSoundEventTypes = ["PlaySnd", "StopSnd"];
  const requiredHitEffectEventKinds = ["HitSpark:hit", "HitSpark:guard"];
  const requiredEnvShakeEventTypes = ["EnvShake"];
  const requiredArtifactNames = [
    "synthetic-imported-custom-state",
    "synthetic-imported-custom-state-gethitvar",
    "synthetic-imported-custom-state-gethitvar-animtype",
    "synthetic-imported-custom-state-gethitvar-type",
    "synthetic-imported-custom-state-gethitvar-yaccel",
    "synthetic-imported-custom-state-gethitvar-snap",
    "synthetic-imported-custom-state-gethitvar-hitcount-hitid-chainid",
    "synthetic-imported-custom-state-gethitvar-fall",
    "synthetic-imported-custom-state-gethitvar-fall-metadata",
    "synthetic-imported-custom-state-gethitvar-fall-envshake",
    "synthetic-imported-custom-state-gethitvar-down-recover",
    "synthetic-imported-custom-state-gethitvar-velocity",
    "synthetic-imported-custom-state-gethitvar-guarded",
    "synthetic-imported-custom-state-gethitvar-guard-kill",
    "synthetic-imported-p2stateno-guard-ignored",
    "synthetic-imported-hitoverride-slot-priority",
    "synthetic-imported-hitoverride-guardflag-filter",
    "synthetic-imported-hitoverride-forceair-forceguard-keepstate",
    "synthetic-imported-hitoverride-p2stateno-miss",
    "synthetic-imported-hitoverride-p2getp1state-zero-miss",
    "synthetic-imported-hitoverride-missonoverride-zero",
    "synthetic-imported-hitoverride-missonoverride-zero-forceair-forceguard-keepstate",
    "synthetic-imported-hitoverride-missonoverride-default-forceair-forceguard-keepstate",
    "synthetic-imported-hitoverride-missonoverride-default-guardflag-filter",
    "synthetic-imported-hitoverride-missonoverride-zero-slot-priority",
    "synthetic-imported-hitoverride-missonoverride-zero-guardflag-filter",
    "synthetic-imported-hitoverride-missonoverride-one",
    "synthetic-imported-projectile-hitoverride-p2stateno",
    "synthetic-imported-projectile-hitoverride-slot-priority",
    "synthetic-imported-projectile-hitoverride-missonoverride-zero-slot-priority",
    "synthetic-imported-projectile-hitoverride-missonoverride-zero-guardflag-filter",
    "synthetic-imported-projectile-hitoverride-guardflag-filter",
    "synthetic-imported-projectile-hitoverride-forceair-forceguard-keepstate",
    "synthetic-imported-projectile-hitoverride-missonoverride-zero",
    "synthetic-imported-projectile-hitoverride-missonoverride-zero-forceair-forceguard-keepstate",
    "synthetic-imported-projectile-hitoverride-missonoverride-default-forceair-forceguard-keepstate",
    "synthetic-imported-projectile-hitoverride-missonoverride-default-guardflag-filter",
    "synthetic-imported-projectile-hitoverride-missonoverride-one",
    "synthetic-imported-custom-state-gethitvar-guard-timing",
    "synthetic-imported-custom-state-gethitvar-isbound",
    "synthetic-imported-target-owned-custom-state",
    "synthetic-imported-targetstate-custom",
    "synthetic-imported-target-redirect",
    "synthetic-imported-target-redirect-bottom",
    "synthetic-imported-target-cond-bottom",
    "synthetic-imported-target-ifelse-bottom",
    "synthetic-imported-controller-param-bottom",
    "synthetic-imported-controller-param-target-redirect",
    "synthetic-imported-controller-param-root-redirect",
    "synthetic-imported-target-noko",
    "synthetic-imported-default-numtarget",
    "synthetic-imported-default-target-redirect",
    "synthetic-imported-bare-target-redirect",
    "synthetic-imported-bindtotarget-head",
    "synthetic-imported-bindtotarget-mid",
    "synthetic-imported-targetbind-pause",
    "synthetic-imported-superpause-default-anim",
    "synthetic-imported-superpause-anim-disabled",
    "synthetic-imported-superpause-pausebg",
    "synthetic-imported-superpause-unhittable",
    "synthetic-imported-superpause-sound",
    "synthetic-imported-superpause-dynamic-params",
    "synthetic-imported-superpause-anim-pos",
    "synthetic-imported-superpause-dynamic-anim-pos",
    "synthetic-imported-superpause-p2defmul",
    "synthetic-imported-ikemen-superpause-team-defense",
    "synthetic-imported-superpause-projectile-freeze",
    "synthetic-imported-superpause-effect-freeze",
    "synthetic-imported-movehitpersist",
    "synthetic-imported-hitdefpersist",
    "synthetic-imported-hitcountpersist",
    "synthetic-imported-projectile-target-redirect",
    "synthetic-imported-projectile-hitcount",
    "synthetic-imported-hitdef-projectile-target-mix",
    "synthetic-imported-projectile-target-controllers",
    "synthetic-imported-projectile-default-target-controllers",
    "synthetic-imported-projectile-targetstate",
    "synthetic-imported-projectile-default-targetstate",
    "synthetic-imported-projectile-hittime-any",
    "synthetic-imported-projectile-contacttime-any",
    "synthetic-imported-projectile-contacttime-id",
    "synthetic-imported-projectile-projcontactpersist",
    "synthetic-imported-projectile-projcontact-suffix",
    "synthetic-imported-projectile-projcontact-suffix-any",
    "synthetic-imported-projectile-projcontact-multi-id",
    "synthetic-imported-projectile-projhit-multi-id",
    "synthetic-imported-projectile-projguarded-multi-id",
    "synthetic-imported-projectile-projhittime-multi-id",
    "synthetic-imported-projectile-projcontacttime-multi-id",
    "synthetic-imported-projectile-projguardedtime-multi-id",
    "synthetic-imported-projectile-projtime-same-id-last-contact",
    "synthetic-imported-projectile-projtime-same-id-hit-then-guard",
    "synthetic-imported-projectile-projhit-suffix",
    "synthetic-imported-projectile-projhit-suffix-any",
    "synthetic-imported-projectile-projguarded-suffix",
    "synthetic-imported-projectile-projguarded-suffix-any",
    "synthetic-imported-projectile-guardedtime-any",
    "synthetic-imported-projectile-guardedtime-id",
    "synthetic-imported-projectile-motion",
    "synthetic-imported-projectile-guard-distance-latch",
    "synthetic-imported-projectile-velmul",
    "synthetic-imported-modifyprojectile",
    "synthetic-imported-modifyprojectile-dynamic-bounds",
    "synthetic-imported-projectile-multihit",
    "synthetic-imported-projectile-priority-cancel",
    "synthetic-imported-projectile-cancel-remove-fallback-terminal",
    "synthetic-imported-projectile-canceltime",
    "synthetic-imported-projectile-canceltime-any",
    "synthetic-imported-projectile-canceltime-dynamic",
    "synthetic-imported-projectile-canceltime-var",
    "synthetic-imported-helper-projtime-same-id-last-contact",
    "synthetic-imported-helper-projtime-same-id-hit-then-guard",
    "synthetic-imported-helper-projcanceltime-any",
    "synthetic-imported-helper-projcanceltime-id",
    "synthetic-imported-helper-projcanceltime-dynamic",
    "synthetic-imported-explod-velocity",
    "synthetic-imported-helper-ishelper",
    "synthetic-imported-helper-parentroot",
    "synthetic-imported-helper-controller-param-parentroot",
    "synthetic-imported-helper-dynamic-veladd",
    "synthetic-imported-helper-dynamic-velmul",
    "synthetic-imported-helper-dynamic-posset",
    "synthetic-imported-helper-dynamic-posadd",
    "synthetic-imported-helper-modifyprojectile-dynamic-bounds",
    "synthetic-imported-helper-modifyprojectile-dynamic-params",
    "synthetic-imported-helper-projhit",
    "synthetic-imported-helper-projhittime-any",
    "synthetic-imported-helper-projectile-hitcount",
    "synthetic-imported-helper-projectile-hitoverride-p2stateno",
    "synthetic-imported-helper-projectile-hitoverride-slot-priority",
    "synthetic-imported-helper-projectile-hitoverride-missonoverride-zero-slot-priority",
    "synthetic-imported-helper-projectile-hitoverride-missonoverride-zero-guardflag-filter",
    "synthetic-imported-helper-projectile-hitoverride-guardflag-filter",
    "synthetic-imported-helper-projectile-hitoverride-forceair-forceguard-keepstate",
    "synthetic-imported-helper-projectile-hitoverride-missonoverride-one",
    "synthetic-imported-helper-projectile-hitoverride-missonoverride-zero",
    "synthetic-imported-helper-projectile-hitoverride-missonoverride-zero-forceair-forceguard-keepstate",
    "synthetic-imported-helper-projectile-hitoverride-missonoverride-default-forceair-forceguard-keepstate",
    "synthetic-imported-helper-projectile-hitoverride-missonoverride-default-guardflag-filter",
    "synthetic-imported-helper-projectile-target",
    "synthetic-imported-helper-projectile-bare-target",
    "synthetic-imported-helper-projectile-target-controllers",
    "synthetic-imported-helper-projectile-targetstate",
    "synthetic-imported-helper-projectile-default-targetstate",
    "synthetic-imported-helper-projectile-default-target-controllers",
    "synthetic-imported-helper-projectile-default-target",
    "synthetic-imported-helper-projguard",
    "synthetic-imported-helper-projcontact",
    "synthetic-imported-helper-projcontactpersist",
    "synthetic-imported-helper-hitdef",
    "synthetic-imported-helper-hitdef-sprite-priority",
    "synthetic-imported-helper-hitdefpersist",
    "synthetic-imported-helper-hitcountpersist",
    "synthetic-imported-helper-movehitpersist",
    "synthetic-imported-helper-moveguardedpersist",
    "synthetic-imported-helper-movereversedpersist",
    "synthetic-imported-helper-target",
    "synthetic-imported-helper-default-target",
    "synthetic-imported-helper-bare-target",
    "synthetic-imported-helper-target-controllers",
    "synthetic-imported-helper-targetstate",
    "synthetic-imported-helper-numproj",
    "synthetic-imported-modifyexplod",
    "synthetic-imported-explod-bind",
    "synthetic-imported-explod-scale",
    "synthetic-imported-explod-pausemovetime",
    "synthetic-imported-explod-ignorehitpause",
    "synthetic-imported-hitpausetime-ignorehitpause",
    "synthetic-imported-explod-removeongethit",
    "synthetic-imported-explod-removeonprojectilehit",
    "synthetic-imported-explod-removeonprojectileguard",
    "synthetic-imported-removeexplod",
    "synthetic-imported-reversal",
    "synthetic-imported-hitoverride",
    "synthetic-imported-hitby-allow",
    "synthetic-imported-hitby-reject",
    "synthetic-imported-damage-scale",
    "synthetic-imported-damage-scale-dynamic",
    "synthetic-imported-data-damage-scale",
    "synthetic-imported-fall-defence-up",
    "synthetic-imported-gethitvar-fall-defence-up",
    "synthetic-imported-gethitvar-fall-recover",
    "synthetic-imported-gethitvar-fall-metadata",
    "synthetic-imported-gethitvar-fallcount",
    "synthetic-imported-gethitvar-fall-envshake",
    "synthetic-imported-gethitvar-down-recover",
    "synthetic-imported-gethitvar-hittime",
    "synthetic-imported-gethitvar-hitshaketime",
    "synthetic-imported-gethitvar-damage",
    "synthetic-imported-gethitvar-kill",
    "synthetic-imported-gethitvar-guard-kill",
    "synthetic-imported-gethitvar-crouch-guard-kill",
    "synthetic-imported-gethitvar-air-guard-kill",
    "synthetic-imported-gethitvar-hitid-chainid",
    "synthetic-imported-gethitvar-hitcount",
    "synthetic-imported-gethitvar-velocity",
    "synthetic-imported-gethitvar-guard-timing",
    "synthetic-imported-gethitvar-guard-hitshaketime",
    "synthetic-imported-gethitvar-crouch-guard-hitshaketime",
    "synthetic-imported-gethitvar-air-guard-hitshaketime",
    "synthetic-imported-gethitvar-guarded",
    "synthetic-imported-default-guard-slide-stop",
    "synthetic-imported-default-guard-hold-walk-return",
    "synthetic-imported-crouch-guard-hold-crouch-return",
    "synthetic-imported-projectile-gethitvar-hit-metadata",
    "synthetic-imported-projectile-gethitvar-hitid-chainid",
    "synthetic-imported-projectile-gethitvar-guarded",
    "synthetic-imported-projectile-gethitvar-guard-kill",
    "synthetic-imported-projectile-gethitvar-guard-hitshaketime",
    "synthetic-imported-projectile-gethitvar-air-guard-hitshaketime",
    "synthetic-imported-projectile-air-guard-velocity",
    "synthetic-imported-projectile-air-guard-velocity-default",
    "synthetic-imported-projectile-guard-velocity-default",
    "synthetic-imported-projectile-guard-timing-default",
    "synthetic-imported-projectile-guard-slide-stop",
    "synthetic-imported-projectile-guard-terminal",
    "synthetic-imported-projectile-remove-terminal",
    "synthetic-imported-projectile-remove-hit-fallback-terminal",
    "synthetic-imported-projectile-bounds-remove-terminal",
    "synthetic-imported-projectile-default-bounds-terminal",
    "synthetic-imported-projectile-localcoord-default-bounds-terminal",
    "synthetic-imported-projectile-stagebound-terminal",
    "synthetic-imported-projectile-edgebound-terminal",
    "synthetic-imported-projectile-heightbound-terminal",
    "synthetic-imported-projectile-air-guard-cornerpush",
    "synthetic-imported-projectile-air-guard-cornerpush-default",
    "synthetic-imported-projectile-guard-cornerpush-default",
    "synthetic-imported-projectile-air-hit-cornerpush-default",
    "synthetic-imported-projectile-down-hit-cornerpush",
    "synthetic-imported-projectile-down-hit-cornerpush-default",
    "synthetic-imported-helper-projectile-gethitvar-hit-metadata",
    "synthetic-imported-helper-projectile-gethitvar-hitid-chainid",
    "synthetic-imported-helper-projectile-gethitvar-guarded",
    "synthetic-imported-helper-projectile-gethitvar-guard-kill",
    "synthetic-imported-helper-projectile-gethitvar-guard-hitshaketime",
    "synthetic-imported-helper-projectile-gethitvar-air-guard-hitshaketime",
    "synthetic-imported-helper-projectile-air-guard-velocity",
    "synthetic-imported-helper-projectile-air-guard-velocity-default",
    "synthetic-imported-helper-projectile-guard-velocity-default",
    "synthetic-imported-helper-projectile-guard-timing-default",
    "synthetic-imported-helper-projectile-guard-slide-stop",
    "synthetic-imported-helper-projectile-guard-terminal",
    "synthetic-imported-helper-projectile-cancel-remove-fallback-terminal",
    "synthetic-imported-helper-projectile-remove-hit-fallback-terminal",
    "synthetic-imported-helper-projectile-default-bounds-terminal",
    "synthetic-imported-helper-projectile-localcoord-default-bounds-terminal",
    "synthetic-imported-helper-projectile-heightbound-terminal",
    "synthetic-imported-helper-projectile-edgebound-terminal",
    "synthetic-imported-helper-projectile-stagebound-terminal",
    "synthetic-imported-helper-projectile-air-guard-cornerpush",
    "synthetic-imported-helper-projectile-air-guard-cornerpush-default",
    "synthetic-imported-helper-projectile-guard-cornerpush-default",
    "synthetic-imported-helper-projectile-air-hit-cornerpush-default",
    "synthetic-imported-helper-projectile-down-hit-cornerpush",
    "synthetic-imported-helper-projectile-down-hit-cornerpush-default",
    "synthetic-imported-gethitvar-animtype",
    "synthetic-imported-gethitvar-snap",
    "synthetic-imported-default-crouch-gethit",
    "synthetic-imported-default-crouch-gethit-progression",
    "synthetic-imported-default-air-gethit",
    "synthetic-imported-default-air-fall-gethit",
    "synthetic-imported-default-air-ground-impact",
    "synthetic-imported-default-air-liedown-recovery",
    "synthetic-imported-default-air-fall-recovery-input",
    "synthetic-imported-default-air-fall-recovery-too-early",
    "synthetic-imported-default-fall-recovery-threshold",
    "synthetic-imported-default-fall-official-recovery-threshold",
    "synthetic-imported-default-fall-recovery-tick-order",
    "synthetic-imported-default-fall-air-recovery-velocity",
    "synthetic-imported-default-fall-official-air-recovery",
    "synthetic-imported-default-fall-ground-recovery",
    "synthetic-imported-default-fall-official-ground-recovery",
    "synthetic-imported-default-fall-recovery-too-early",
    "synthetic-imported-default-fall-ground-recovery-priority",
    "synthetic-imported-default-fall-recovery-input-priority",
    "synthetic-imported-hitfall-canrecover-ready",
    "synthetic-imported-hitfall-recover-true",
    "synthetic-imported-default-fall-official-recovery-too-early",
    "synthetic-imported-bounds",
    "synthetic-imported-posfreeze-dynamic",
    "synthetic-imported-screenbound-camera",
    "synthetic-imported-screenbound-dynamic",
    "synthetic-imported-gravity",
    "synthetic-imported-kinematic",
    "synthetic-imported-dynamic-veladd",
    "synthetic-imported-dynamic-velmul",
    "synthetic-imported-dynamic-posset",
    "synthetic-imported-dynamic-posadd",
    "synthetic-imported-width",
    "synthetic-imported-width-dynamic",
    "synthetic-imported-statetypeset",
    "synthetic-imported-statetypeset-dynamic",
    "synthetic-imported-playerpush",
    "synthetic-imported-playerpush-dynamic",
    "synthetic-imported-turn",
    "synthetic-imported-sprpriority",
    "synthetic-imported-sprpriority-dynamic",
    "synthetic-imported-palfx",
    "synthetic-imported-palfx-dynamic",
    "synthetic-imported-trans",
    "synthetic-imported-trans-dynamic",
    "synthetic-imported-angle",
    "synthetic-imported-anglemul",
    "synthetic-imported-anglemul-dynamic",
    "synthetic-imported-angle-dynamic",
    "synthetic-imported-envcolor",
    "synthetic-imported-envcolor-dynamic",
    "synthetic-imported-envshake",
    "synthetic-imported-envshake-dynamic",
    "synthetic-imported-remappal",
    "synthetic-imported-remappal-dynamic",
    "synthetic-imported-palfx-remappal",
    "synthetic-imported-afterimage",
    "synthetic-imported-afterimage-dynamic",
    "synthetic-imported-afterimagetime-dynamic",
    "synthetic-imported-movehitreset",
    "synthetic-imported-hitadd",
    "synthetic-imported-variable",
    "synthetic-imported-resource",
    "synthetic-imported-control",
    "synthetic-imported-control-dynamic",
    "synthetic-imported-lifeadd-dynamic",
    "synthetic-imported-resourceset-dynamic",
    "synthetic-imported-animation",
    "synthetic-imported-animtime",
    "synthetic-imported-animelemtime",
    "synthetic-imported-animelem",
    "synthetic-imported-animelem-offset",
    "synthetic-imported-edge-distance",
    "synthetic-imported-gametime",
    "synthetic-imported-state-context",
    "synthetic-imported-sound",
    "synthetic-imported-sound-dynamic-pan",
    "synthetic-imported-sound-dynamic-value",
    "synthetic-imported-noop",
    "synthetic-imported-enemynear-index",
    "synthetic-imported-p2-state-context",
    "synthetic-imported-p2-distance",
    "synthetic-imported-owner-metrics",
    "synthetic-imported-selfanimexist",
    "synthetic-imported-alive",
    "synthetic-imported-round-trigger",
    "synthetic-imported-round-ko",
    "synthetic-imported-round-timeover",
    "synthetic-imported-match-context",
    "synthetic-imported-resource-max",
    "synthetic-imported-hitdefattr",
    "synthetic-imported-hitdef-priority",
    "synthetic-imported-hitdef-sprite-priority",
    "synthetic-imported-hitdef-kill",
    "synthetic-imported-hitdef-guard-kill",
    "synthetic-imported-hitdef-guard-sound",
    "synthetic-imported-hitdef-hit-sound",
    "synthetic-imported-hitdef-dynamic-hitsound",
    "synthetic-imported-hitdef-dynamic-guardsound",
    "synthetic-imported-hitdef-hit-spark",
    "synthetic-imported-hitdef-data-spark",
    "synthetic-imported-hitdef-common-spark",
    "synthetic-imported-hitdef-fightfx-spark",
    "synthetic-imported-hitdef-hit-effect-package",
    "synthetic-imported-hitdef-guard-spark",
    "synthetic-imported-hitdef-data-guard-spark",
    "synthetic-imported-hitdef-common-guard-spark",
    "synthetic-imported-hitdef-fightfx-guard-spark",
    "synthetic-imported-hitdef-guard-effect-package",
    "synthetic-imported-assertspecial-unguardable",
    "synthetic-imported-assertspecial-control",
    "synthetic-imported-assertspecial-global-telemetry",
    "synthetic-imported-assertspecial-round-flow-telemetry",
    "synthetic-imported-assertspecial-shadow-telemetry",
    "synthetic-imported-assertspecial-helper-explod-shadow",
    "synthetic-imported-assertspecial-crouch-guarddeny",
    "synthetic-imported-assertspecial-air-guarddeny",
    "synthetic-imported-assertspecial-lifetime",
    "synthetic-imported-assertspecial-guarddeny",
    "synthetic-imported-assertspecial-timerfreeze",
    "synthetic-imported-assertspecial-roundnotover",
    "synthetic-imported-assertspecial-noko",
    "synthetic-imported-assertspecial-nogetupfromliedown",
    "synthetic-imported-assertspecial-nofastrecoverfromliedown",
    "synthetic-imported-default-liedown-fast-recovery",
    "synthetic-imported-air-guard-state",
    "synthetic-imported-air-guard-velocity",
    "synthetic-imported-air-guard-velocity-default",
    "synthetic-imported-guard-velocity-default",
    "synthetic-imported-guard-timing-default",
    "synthetic-imported-air-guard-cornerpush",
    "synthetic-imported-air-guard-cornerpush-default",
    "synthetic-imported-guard-cornerpush-default",
    "synthetic-imported-air-hit-cornerpush-default",
    "synthetic-imported-down-hit-cornerpush",
    "synthetic-imported-down-hit-cornerpush-default",
    "synthetic-imported-air-guard-landing",
    "synthetic-imported-inguarddist-far",
  ];

  for (const key of requiredOperations) {
    requireCoverageEntry(coverage.operations, key, "operation", failures);
  }
  for (const key of requiredEffectKinds) {
    requireCoverageEntry(coverage.effectKinds, key, "effect kind", failures);
  }
  for (const key of requiredEffectPayloadKinds) {
    requireCoverageEntry(coverage.effectPayloads, key, "effect payload kind", failures);
  }
  for (const key of requiredEffectPayloadDeltas) {
    requireCoverageEntry(coverage.effectPayloadDeltas, key, "effect payload delta", failures);
  }
  for (const key of requiredPauseAdvanceRoutes) {
    requireCoverageEntry(coverage.matchPauseAdvances, key, "match-pause advance", failures);
  }
  for (const key of requiredPauseFreezeRoutes) {
    requireCoverageEntry(coverage.matchPauseFreezes, key, "match-pause freeze", failures);
  }
  for (const key of requiredSoundEventTypes) {
    requireCoverageEntry(coverage.soundEvents, key, "sound event", failures);
  }
  for (const key of requiredHitEffectEventKinds) {
    requireCoverageEntry(coverage.hitEffects, key, "hit-effect event", failures);
  }
  for (const key of requiredEnvShakeEventTypes) {
    requireCoverageEntry(coverage.envShakeEvents, key, "env-shake event", failures);
  }
  for (const name of requiredArtifactNames) {
    const hasArtifact =
      Object.values(coverage.controllers).some((entry) => entry.requiredArtifacts.includes(name)) ||
      Object.values(coverage.operations).some((entry) => entry.requiredArtifacts.includes(name)) ||
      Object.values(coverage.effectKinds).some((entry) => entry.requiredArtifacts.includes(name)) ||
      Object.values(coverage.soundEvents).some((entry) => entry.requiredArtifacts.includes(name)) ||
      Object.values(coverage.hitEffects).some((entry) => entry.requiredArtifacts.includes(name)) ||
      Object.values(coverage.envShakeEvents).some((entry) => entry.requiredArtifacts.includes(name)) ||
      Object.values(coverage.roundFrames).some((entry) => entry.requiredArtifacts.includes(name)) ||
      Object.values(coverage.matchPauseAdvances).some((entry) => entry.requiredArtifacts.includes(name)) ||
      Object.values(coverage.matchPauseFreezes).some((entry) => entry.requiredArtifacts.includes(name));
    if (!hasArtifact) {
      failures.push(`missing required coverage artifact ${name}`);
    }
  }

  return failures;
}

function requireCoverageEntry(table, key, label, failures) {
  const entry = table[key];
  if (!entry || entry.requiredArtifacts.length === 0 || entry.totalCount <= 0) {
    failures.push(`missing required ${label} coverage for ${key}`);
  }
}

function addCountRecordCoverage(target, record, context) {
  for (const [key, count] of Object.entries(record ?? {})) {
    addCoverageEntry(target, key, context, { count: Number(count) || 0 });
  }
}

function addArrayCoverage(target, values, context) {
  for (const value of values ?? []) {
    addCoverageEntry(target, String(value), context);
  }
}

function effectDeltaFields(changes) {
  return (changes ?? [])
    .map((change) => /^effect\s+([^\s]+)/.exec(String(change))?.[1])
    .filter(Boolean);
}

function addCoverageEntry(target, key, context, values = {}) {
  if (!key) {
    return;
  }
  const item =
    target[key] ??
    (target[key] = {
      artifacts: [],
      requiredArtifacts: [],
      gateLabels: [],
      totalCount: 0,
      maxFrames: 0,
    });
  addArtifactName(item.artifacts, context.name);
  addArtifactName(item.gateLabels, context.gate);
  if (context.required) {
    addArtifactName(item.requiredArtifacts, context.name);
  }
  item.totalCount += values.count ?? 1;
  item.maxFrames = Math.max(item.maxFrames, values.frames ?? 0);
}

function addArtifactName(target, name) {
  if (name && !target.includes(name)) {
    target.push(name);
    target.sort();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

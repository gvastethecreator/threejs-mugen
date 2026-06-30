const fs = require("fs");
const path = require("path");
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
      name: "synthetic-imported-hitcount",
      required: true,
      artifact: presets.createSyntheticImportedHitCountTraceArtifact(),
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
      name: "synthetic-imported-animation",
      required: true,
      artifact: presets.createSyntheticImportedAnimationTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-sound",
      required: true,
      artifact: presets.createSyntheticImportedSoundTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-noop",
      required: true,
      artifact: presets.createSyntheticImportedNoOpTraceArtifact(),
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
      name: "synthetic-imported-p2metrics",
      required: true,
      artifact: presets.createSyntheticImportedP2MetricsTraceArtifact(),
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
      name: "synthetic-imported-gethitvar-animtype",
      required: true,
      artifact: presets.createSyntheticImportedGetHitVarAnimTypeTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-bounds",
      required: true,
      artifact: presets.createSyntheticImportedBoundsTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-screenbound-camera",
      required: true,
      artifact: presets.createSyntheticImportedScreenBoundCameraTraceArtifact(),
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
      name: "synthetic-imported-width",
      required: true,
      artifact: presets.createSyntheticImportedWidthTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-statetypeset",
      required: true,
      artifact: presets.createSyntheticImportedStateTypeSetTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-playerpush",
      required: true,
      artifact: presets.createSyntheticImportedPlayerPushTraceArtifact(),
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
      name: "synthetic-imported-palfx",
      required: true,
      artifact: presets.createSyntheticImportedPalFxTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-trans",
      required: true,
      artifact: presets.createSyntheticImportedTransTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-angle",
      required: true,
      artifact: presets.createSyntheticImportedAngleTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-envcolor",
      required: true,
      artifact: presets.createSyntheticImportedEnvColorTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-envshake",
      required: true,
      artifact: presets.createSyntheticImportedEnvShakeTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-remappal",
      required: true,
      artifact: presets.createSyntheticImportedRemapPalTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-afterimage",
      required: true,
      artifact: presets.createSyntheticImportedAfterImageTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-hitdef-priority",
      required: true,
      artifact: presets.createSyntheticImportedHitDefPriorityTraceArtifact(),
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
      name: "synthetic-imported-hitdef-hit-spark",
      required: true,
      artifact: presets.createSyntheticImportedHitDefHitSparkTraceArtifact(),
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
      name: "synthetic-imported-assertspecial-noko",
      required: true,
      artifact: presets.createSyntheticImportedAssertSpecialNoKoTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-default-guard-state",
      required: true,
      artifact: presets.createSyntheticImportedDefaultGuardStateTraceArtifact(),
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
      name: "synthetic-imported-auto-guard-start",
      required: true,
      artifact: presets.createSyntheticImportedAutoGuardStartTraceArtifact(),
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
      name: "synthetic-imported-default-fall-ground-recovery",
      required: true,
      artifact: presets.createSyntheticImportedDefaultFallGroundRecoveryTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-default-fall-recovery-too-early",
      required: true,
      artifact: presets.createSyntheticImportedDefaultFallRecoveryTooEarlyTraceArtifact(),
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
      name: "synthetic-imported-projectile-motion",
      required: true,
      artifact: presets.createSyntheticImportedProjectileMotionTraceArtifact(),
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
      name: "synthetic-imported-helper-explod",
      required: true,
      artifact: presets.createSyntheticImportedHelperExplodTraceArtifact(),
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
          targetId: "kfm-official-qcf-x-golden",
          targetLabel: "Official KFM QCF x route",
          notes: [
            `Optional local fixture trace from ${path.relative(process.cwd(), kfmFixturePath)}. Requires private fixture presence and verifies only the current partial route.`,
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
          requiredExecutedOperations: ["hitdef", "resource:ctrlset", "kinematic:hitvelset"],
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
        name: "kfm-official-default-crouch-guard-state",
        required: false,
        artifact: presets.createImportedDefaultGuardStateTraceArtifact(imported, {
          script: presets.importedDefaultCrouchGuardStateScript(),
          requiredExecutedStates: [200, 153],
          requiredExecutedOperations: ["hitdef", "resource:ctrlset", "kinematic:hitvelset"],
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
          requiredActiveCommands: ["holdback", "x"],
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
          targetId: "kfm-official-default-air-guard-state-golden",
          targetLabel: "Official KFM Common1 air guard-hit route",
          notes: [
            `Optional local fixture trace from ${path.relative(process.cwd(), kfmFixturePath)}. Requires private fixture presence and verifies that the real KFM defender can enter Common1 air guard-hit states 154 and 155 after blocking an A-guardable HitDef while airborne and holding back, then land through state 52 with bounded controller/operation order plus actor-frame air velocity/body/landing telemetry. Exact air guard physics, landing parity, guard-distance, guard-start, guard-end, sparks, sounds, and IKEMEN parity remain future work.`,
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
          notes: [
            `Optional local fixture trace from ${path.relative(process.cwd(), kfmFixturePath)}. Requires private fixture presence and verifies that the real KFM defender can leave Common1 fall state 5050 through CanRecover plus command = "recovery", enter air recovery state 5210, and return to state 0/control after a fall HitDef without p2stateno. A separate KFM artifact covers the bounded ground recovery-input route 5050 -> 5200 -> 5201 -> 52 -> 0. This artifact does not yet prove exact recovery thresholds/velocities, tick-order parity, or guard-state parity.`,
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
        name: "kfm-official-default-fall-ground-recovery",
        required: false,
        artifact: presets.createImportedDefaultFallGroundRecoveryTraceArtifact(imported, {
          targetId: "kfm-official-default-fall-ground-recovery-golden",
          targetLabel: "Official KFM Common1 ground recovery input route",
          requiredControllerEventSequences: [presets.officialKfmGroundRecoveryControllerSequence()],
          notes: [
            `Optional local fixture trace from ${path.relative(process.cwd(), kfmFixturePath)}. Requires private fixture presence and verifies that the real KFM defender can leave Common1 fall state 5050 through CanRecover plus command = "recovery" near the ground, enter 5200, self-return into 5201/land through 52, and return to state 0/control after a fall HitDef without p2stateno. The gate now also requires bounded official KFM controller/typed-operation order through 5050 VelAdd/ChangeState, 5200 VelAdd/SelfState, and 52 landing operations. It does not yet prove exact recovery thresholds/velocities, full tick-order parity, or guard-state parity.`,
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
      skipped,
    };
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
    "synthetic-imported-target-owned-custom-state",
    "synthetic-imported-targetstate-custom",
    "synthetic-imported-target-redirect",
    "synthetic-imported-target-noko",
    "synthetic-imported-bindtotarget-head",
    "synthetic-imported-bindtotarget-mid",
    "synthetic-imported-targetbind-pause",
    "synthetic-imported-superpause-projectile-freeze",
    "synthetic-imported-superpause-effect-freeze",
    "synthetic-imported-projectile-motion",
    "synthetic-imported-projectile-velmul",
    "synthetic-imported-modifyprojectile",
    "synthetic-imported-projectile-multihit",
    "synthetic-imported-projectile-priority-cancel",
    "synthetic-imported-explod-velocity",
    "synthetic-imported-helper-ishelper",
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
    "synthetic-imported-data-damage-scale",
    "synthetic-imported-fall-defence-up",
    "synthetic-imported-gethitvar-fall-defence-up",
    "synthetic-imported-gethitvar-animtype",
    "synthetic-imported-default-fall-recovery-threshold",
    "synthetic-imported-default-fall-recovery-tick-order",
    "synthetic-imported-default-fall-air-recovery-velocity",
    "synthetic-imported-default-fall-ground-recovery",
    "synthetic-imported-default-fall-recovery-too-early",
    "synthetic-imported-bounds",
    "synthetic-imported-screenbound-camera",
    "synthetic-imported-gravity",
    "synthetic-imported-kinematic",
    "synthetic-imported-width",
    "synthetic-imported-statetypeset",
    "synthetic-imported-playerpush",
    "synthetic-imported-turn",
    "synthetic-imported-sprpriority",
    "synthetic-imported-palfx",
    "synthetic-imported-trans",
    "synthetic-imported-angle",
    "synthetic-imported-envcolor",
    "synthetic-imported-envshake",
    "synthetic-imported-remappal",
    "synthetic-imported-afterimage",
    "synthetic-imported-movehitreset",
    "synthetic-imported-hitadd",
    "synthetic-imported-variable",
    "synthetic-imported-resource",
    "synthetic-imported-control",
    "synthetic-imported-animation",
    "synthetic-imported-sound",
    "synthetic-imported-noop",
    "synthetic-imported-alive",
    "synthetic-imported-round-trigger",
    "synthetic-imported-round-ko",
    "synthetic-imported-round-timeover",
    "synthetic-imported-match-context",
    "synthetic-imported-resource-max",
    "synthetic-imported-hitdefattr",
    "synthetic-imported-hitdef-priority",
    "synthetic-imported-hitdef-kill",
    "synthetic-imported-hitdef-guard-kill",
    "synthetic-imported-hitdef-guard-sound",
    "synthetic-imported-hitdef-hit-sound",
    "synthetic-imported-hitdef-hit-spark",
    "synthetic-imported-hitdef-common-spark",
    "synthetic-imported-hitdef-fightfx-spark",
    "synthetic-imported-hitdef-hit-effect-package",
    "synthetic-imported-hitdef-guard-spark",
    "synthetic-imported-hitdef-common-guard-spark",
    "synthetic-imported-hitdef-fightfx-guard-spark",
    "synthetic-imported-hitdef-guard-effect-package",
    "synthetic-imported-assertspecial-control",
    "synthetic-imported-assertspecial-crouch-guarddeny",
    "synthetic-imported-assertspecial-air-guarddeny",
    "synthetic-imported-assertspecial-lifetime",
    "synthetic-imported-assertspecial-guarddeny",
    "synthetic-imported-assertspecial-noko",
    "synthetic-imported-air-guard-state",
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

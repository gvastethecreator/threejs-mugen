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
      name: "synthetic-imported-reject",
      required: true,
      artifact: presets.createSyntheticImportedRejectTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-guard",
      required: true,
      artifact: presets.createSyntheticImportedGuardTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-assertspecial-unguardable",
      required: true,
      artifact: presets.createSyntheticImportedAssertSpecialUnguardableTraceArtifact(),
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
      name: "synthetic-imported-inguarddist",
      required: true,
      artifact: presets.createSyntheticImportedInGuardDistTraceArtifact(),
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
          notes: [
            "Synthetic imported fall get-hit trace proves a default defender-owned Common1-style route can branch from 5000 into 5030 and 5050 when fall/y velocity metadata exists. It does not claim ground impact 5100, bounce, liedown, recovery input, or guard-state parity.",
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
      name: "synthetic-imported-state-exit",
      required: true,
      artifact: presets.createSyntheticImportedStateExitTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-target",
      required: true,
      artifact: presets.createSyntheticImportedTargetTraceArtifact(),
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
      name: "synthetic-imported-projectile",
      required: true,
      artifact: presets.createSyntheticImportedProjectileTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-guard",
      required: true,
      artifact: presets.createSyntheticImportedProjectileGuardTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-projectile-clash",
      required: true,
      artifact: presets.createSyntheticImportedProjectileClashTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-helper",
      required: true,
      artifact: presets.createSyntheticImportedHelperTraceArtifact(),
    });
    artifacts.push({
      name: "synthetic-imported-explod",
      required: true,
      artifact: presets.createSyntheticImportedExplodTraceArtifact(),
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
          targetId: "kfm-official-default-guard-state-golden",
          targetLabel: "Official KFM Common1 guard-hit route",
          notes: [
            `Optional local fixture trace from ${path.relative(process.cwd(), kfmFixturePath)}. Requires private fixture presence and verifies that the real KFM defender can enter Common1 guard-hit states 150 and 151 after blocking a HitDef without p2stateno. Guard-distance, guard-start, and guard-end parity remain future work.`,
          ],
        }),
      });
      artifacts.push({
        name: "kfm-official-default-crouch-guard-state",
        required: false,
        artifact: presets.createImportedDefaultGuardStateTraceArtifact(imported, {
          script: presets.importedDefaultCrouchGuardStateScript(),
          requiredExecutedStates: [200, 153],
          requiredActiveCommands: ["holddown", "x"],
          targetId: "kfm-official-default-crouch-guard-state-golden",
          targetLabel: "Official KFM Common1 crouch guard-hit route",
          notes: [
            `Optional local fixture trace from ${path.relative(process.cwd(), kfmFixturePath)}. Requires private fixture presence and verifies that the real KFM defender can evaluate Common1 command expressions and enter crouch guard-hit state 153 after blocking a HitDef while holding down-back. Guard-distance, guard-start, guard-end, sparks, sounds, and exact crouch/air guard parity remain future work.`,
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
          targetId: "kfm-official-auto-guard-start-golden",
          targetLabel: "Official KFM Common1 automatic guard-start route",
          notes: [
            `Optional local fixture trace from ${path.relative(process.cwd(), kfmFixturePath)}. Requires private fixture presence and verifies that the real KFM defender can enter its Common1 guard-start route from held-back input plus bounded InGuardDist before contact. Exact proximity guard, guard end, air guard, sparks, sounds, and IKEMEN parity remain future work.`,
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
          targetId: "kfm-official-auto-guard-end-golden",
          targetLabel: "Official KFM Common1 automatic guard-end route",
          notes: [
            `Optional local fixture trace from ${path.relative(process.cwd(), kfmFixturePath)}. Requires private fixture presence and verifies that the real KFM defender can leave its Common1 guard route through state 140 and return to idle/control after bounded InGuardDist is no longer true. Exact guard-end timing, proximity guard, air guard, sparks, sounds, and IKEMEN parity remain future work.`,
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
          notes: [
            `Optional local fixture trace from ${path.relative(process.cwd(), kfmFixturePath)}. Requires private fixture presence and verifies that the real KFM defender can enter Common1 state 5000, branch to 5030, reach 5050, hit ground in 5100, enter the first bounce state 5101, and settle into lie-down state 5110 after a fall HitDef without p2stateno. Separate recovery artifacts cover the bounded 5110 -> 5120 -> 0 get-up route, the air recovery-input 5050 -> 5210 -> 52 -> 0 branch, and the ground recovery-input 5050 -> 5200 -> 5201 -> 52 -> 0 branch; exact recovery thresholds/velocities, tick-order, and guard-state parity remain future work.`,
          ],
        }),
      });
      artifacts.push({
        name: "kfm-official-default-fall-recovery",
        required: false,
        artifact: presets.createImportedDefaultFallRecoveryTraceArtifact(imported, {
          targetId: "kfm-official-default-fall-recovery-golden",
          targetLabel: "Official KFM Common1 lie-down get-up route",
          notes: [
            `Optional local fixture trace from ${path.relative(process.cwd(), kfmFixturePath)}. Requires private fixture presence and verifies that the real KFM defender can continue from lie-down state 5110 into get-up state 5120 and return to state 0/control after a fall HitDef without p2stateno. Separate KFM artifacts cover air recovery-input 5050 -> 5210 -> 52 -> 0 and ground recovery-input 5050 -> 5200 -> 5201 -> 52 -> 0; this artifact does not prove exact tick-order parity, recovery thresholds/velocities, or guard-state parity.`,
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
        name: "kfm-official-default-fall-ground-recovery",
        required: false,
        artifact: presets.createImportedDefaultFallGroundRecoveryTraceArtifact(imported, {
          targetId: "kfm-official-default-fall-ground-recovery-golden",
          targetLabel: "Official KFM Common1 ground recovery input route",
          notes: [
            `Optional local fixture trace from ${path.relative(process.cwd(), kfmFixturePath)}. Requires private fixture presence and verifies that the real KFM defender can leave Common1 fall state 5050 through CanRecover plus command = "recovery" near the ground, enter 5200, self-return into 5201, land through 52, and return to state 0/control after a fall HitDef without p2stateno. It does not yet prove exact recovery thresholds/velocities, tick-order parity, or guard-state parity.`,
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
      skipped,
    };
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

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import { describe, expect, it } from "vitest";
import {
  createNativeHitTraceArtifact,
  createNativeWhiffTraceArtifact,
  createSyntheticImportedCommonGetHitTraceArtifact,
  createSyntheticImportedDefaultFallRecoveryInputTraceArtifact,
  createSyntheticImportedDefaultFallRecoveryTraceArtifact,
  createSyntheticImportedFallTraceArtifact,
  createImportedDefaultFallGroundRecoveryTraceArtifact,
  createImportedDefaultFallRecoveryInputTraceArtifact,
  createImportedDefaultFallRecoveryTraceArtifact,
  createImportedDefaultGetHitTraceArtifact,
  createImportedDefaultFallGetHitTraceArtifact,
  createImportedDefaultGetHitProgressionTraceArtifact,
  createImportedDefaultGuardStateTraceArtifact,
  createImportedGuardTraceArtifact,
  createSyntheticImportedHitstunTraceArtifact,
  createSyntheticImportedAutoGuardEndTraceArtifact,
  createSyntheticImportedAutoGuardStartTraceArtifact,
  createSyntheticImportedAssertSpecialUnguardableTraceArtifact,
  createSyntheticImportedInGuardDistTraceArtifact,
  createSyntheticImportedStateExitTraceArtifact,
  createSyntheticImportedCrouchGuardStateTraceArtifact,
  createSyntheticImportedGuardTraceArtifact,
  createSyntheticImportedDefaultGuardStateTraceArtifact,
  createSyntheticImportedHelperTraceArtifact,
  createSyntheticImportedExplodTraceArtifact,
  createSyntheticImportedRejectTraceArtifact,
  createSyntheticImportedProjectileClashTraceArtifact,
  createSyntheticImportedProjectileGuardTraceArtifact,
  createSyntheticImportedProjectileTraceArtifact,
  createSyntheticImportedSuperPauseProjectileFreezeTraceArtifact,
  createSyntheticImportedSuperPauseTraceArtifact,
  createSyntheticImportedTargetTraceArtifact,
  createSyntheticImportedXTraceArtifact,
  createSyntheticImportedTraceFighter,
  importedGuardScript,
  importedCommonGetHitScript,
  importedDefaultGetHitScript,
  importedDefaultFallGetHitScript,
  importedDefaultFallRecoveryInputScript,
  importedDefaultFallOfficialGroundRecoveryScript,
  importedDefaultFallOfficialRecoveryInputScript,
  importedDefaultFallOfficialRecoveryScript,
  importedDefaultFallRecoveryScript,
  importedDefaultCrouchGuardStateScript,
  importedDefaultGuardStateScript,
  importedDefaultGetHitProgressionScript,
  importedAutoGuardEndScript,
  importedAutoGuardStartScript,
  importedInGuardDistScript,
  importedExplodScript,
  importedHelperScript,
  importedProjectileClashScript,
  importedProjectileScript,
  importedProjectileGuardScript,
  importedSuperPauseProjectileScript,
  importedSuperPauseScript,
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
    expect(artifact.gates[0]?.evidence.executedControllers.HitDef).toBeGreaterThanOrEqual(1);
    expect(artifact.gates[0]?.evidence.executedOperations.hitdef).toBeGreaterThanOrEqual(1);
    expect(artifact.gates[0]?.evidence.activeCommands).toContain("x");
    expect(artifact.gates[0]?.evidence.eventCategories).toContain("hit");
    expect(artifact.gates[0]?.evidence.combatReasons).toContain("hit");
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
    expect(artifact.gates[0]?.evidence.eventCategories).toContain("reject");
    expect(artifact.gates[0]?.evidence.combatReasons).toContain("reject");
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
    expect(evidence?.eventCategories).toContain("guard");
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
        expect.objectContaining({ ownerId: "p1", actorId: "p2", targetId: 77, hasBinding: true }),
      ]),
    );
    expect(artifact.trace.finalActors[0]?.actorKind).toBe("player");
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
    expect(evidence?.executedControllers.Projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.executedOperations.projectile).toBeGreaterThanOrEqual(1);
    expect(evidence?.eventCategories).toContain("hit");
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
    expect(artifact.gates[0]?.requirements.requiredEventSubstrings).toEqual(["Projectile clash"]);
    expect(evidence?.worldLifecycleEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "spawn", kind: "projectile", ownerId: "p1", rootId: "p1", parentId: "p1" }),
        expect.objectContaining({ type: "spawn", kind: "projectile", ownerId: "p2", rootId: "p2", parentId: "p2" }),
        expect.objectContaining({ type: "remove", kind: "projectile", ownerId: "p1", rootId: "p1", parentId: "p1" }),
        expect.objectContaining({ type: "remove", kind: "projectile", ownerId: "p2", rootId: "p2", parentId: "p2" }),
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
    expect(importedCommonGetHitScript().map((frame) => frame.label).filter(Boolean)).toEqual([
      "imported-common-gethit-x",
      "common-gethit-settle",
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
    expect(importedTargetScript().map((frame) => frame.label).filter(Boolean)).toEqual(["imported-target-x", "target-settle"]);
    expect(importedSuperPauseScript().map((frame) => frame.label).filter(Boolean)).toEqual(["imported-superpause-x", "superpause-settle"]);
    expect(importedSuperPauseProjectileScript().map((frame) => frame.label).filter(Boolean)).toEqual([
      "imported-superpause-projectile-x",
      "superpause-projectile-settle",
    ]);
    expect(importedProjectileScript().map((frame) => frame.label).filter(Boolean)).toEqual(["imported-projectile-x", "projectile-settle"]);
    expect(importedProjectileGuardScript().map((frame) => frame.label).filter(Boolean)).toEqual([
      "imported-projectile-guard-x",
      "projectile-guard-settle",
    ]);
    expect(importedProjectileClashScript().map((frame) => frame.label).filter(Boolean)).toEqual([
      "imported-projectile-clash-x",
      "projectile-clash-settle",
    ]);
    expect(importedHelperScript().map((frame) => frame.label).filter(Boolean)).toEqual(["imported-helper-x", "helper-settle"]);
    expect(importedExplodScript().map((frame) => frame.label).filter(Boolean)).toEqual(["imported-explod-x", "explod-settle"]);
    expect(qcfXScript().map((frame) => frame.label).filter(Boolean)).toEqual(["qcf-d", "qcf-df", "qcf-f", "qcf-x", "settle"]);
  });
});

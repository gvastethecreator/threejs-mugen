import type { MugenAnimationAction } from "../model/MugenAnimation";
import type { MugenStageDefinition } from "../model/MugenStage";
import { parseCmd } from "../parsers/CmdParser";
import { parseCns } from "../parsers/CnsParser";
import { demoFighters, type DemoFighterDefinition, type DemoMove } from "./demoFighters";
import { MatchWorld } from "./MatchWorld";
import type { RuntimeTraceInputFrame } from "./RuntimeTrace";
import { expandRuntimeTraceScript, runRuntimeTrace } from "./RuntimeTrace";
import type { RuntimeTraceArtifact } from "./RuntimeTraceArtifact";
import { createRuntimeTraceArtifact } from "./RuntimeTraceArtifact";
import { trainingStage } from "./demoStage";

export type RuntimeTraceGatePresetArtifact = RuntimeTraceArtifact & {
  presetId: string;
};

export type RuntimeTraceGatePresetOptions = {
  generatedAt?: string;
  stage?: MugenStageDefinition;
};

export function createNativeHitTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = nativeHitScript();
  const p1 = demoFighters[0]!;
  const p2 = demoFighters[1]!;
  const trace = runRuntimeTrace(new MatchWorld({ p1, p2, stage }), script, {
    label: "native-nova-hit-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "native-nova-hit-golden",
      label: "Native Nova Boxer hit route",
      source: "native",
      notes: [
        "Native golden trace keeps the generated roster combat route deterministic before deeper MatchWorld and ControllerOp migrations.",
      ],
    },
    gates: [
      {
        label: "native-hit-golden",
        requiredActorSources: ["demo"],
        requiredActorKinds: ["player"],
        requiredEventCategories: ["hit"],
        requiredCombatReasons: ["hit"],
      },
    ],
  });
}

export function createNativeWhiffTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? farCombatStage();
  const script = nativeWhiffScript();
  const p1 = demoFighters[0]!;
  const p2 = demoFighters[1]!;
  const trace = runRuntimeTrace(new MatchWorld({ p1, p2, stage }), script, {
    label: "native-nova-whiff-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "native-nova-whiff-golden",
      label: "Native Nova Boxer whiff route",
      source: "native",
      notes: [
        "Native whiff trace proves active Clsn1 frames can be classified when no hit, guard, reject, override, or reversal event is emitted.",
      ],
    },
    gates: [
      {
        label: "native-whiff-golden",
        requiredActorSources: ["demo"],
        requiredActorKinds: ["player"],
        requiredCombatReasons: ["whiff"],
      },
    ],
  });
}

export function createSyntheticImportedXTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  return createImportedXTraceArtifact(createSyntheticImportedTraceFighter(), {
    ...options,
    targetId: "synthetic-imported-x-golden",
    targetLabel: "Synthetic imported CMD/CNS x route",
    requireHitEvent: true,
    notes: [
      "Synthetic imported golden trace proves CMD State -1 routing, CNS state execution, HitDef execution, active command evidence, and hit event evidence without depending on private external fixtures.",
    ],
  });
}

export function createImportedXTraceArtifact(
  imported: DemoFighterDefinition,
  options: RuntimeTraceGatePresetOptions & { targetId?: string; targetLabel?: string; notes?: string[]; requireHitEvent?: boolean } = {},
): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedXScript();
  const trace = runRuntimeTrace(new MatchWorld({ p1: imported, p2: demoFighters[1]!, stage }), script, {
    label: `${imported.id}-x-golden`,
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: options.targetId ?? `${imported.id}-x-golden`,
      label: options.targetLabel ?? `${imported.displayName} x route`,
      source: "mixed",
      notes: options.notes ?? [
        "Imported x trace verifies the current MUGEN CMD/CNS bridge without claiming full authored character parity.",
      ],
    },
    gates: [
      {
        label: "imported-x-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "HitDef"],
        requiredExecutedOperations: ["hitdef"],
        requiredActiveCommands: ["x"],
        ...(options.requireHitEvent ? { requiredEventCategories: ["hit" as const] } : {}),
        ...(options.requireHitEvent ? { requiredCombatReasons: ["hit" as const] } : {}),
      },
    ],
  });
}

export function createSyntheticImportedRejectTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedXScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-reject-attacker",
    displayName: "Synthetic Imported Reject Attacker",
  });
  const defender = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-reject-defender",
    displayName: "Synthetic Imported Reject Defender",
    passiveNotHitBy: "SCA",
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: defender, stage }), script, {
    label: "synthetic-imported-reject-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-reject-golden",
      label: "Synthetic imported HitBy/NotHitBy reject route",
      source: "imported",
      notes: [
        "Synthetic imported reject trace proves a real contact can be rejected by HitBy/NotHitBy and exported as combat reason evidence.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-reject-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "HitDef", "NotHitBy"],
        requiredExecutedOperations: ["hitdef"],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["reject"],
        requiredCombatReasons: ["reject"],
      },
    ],
  });
}

export function createSyntheticImportedGuardTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-guard-attacker",
    displayName: "Synthetic Imported Guard Attacker",
    guardDamage: 5,
    guardFlag: "MA",
  });
  return createImportedGuardTraceArtifact(attacker, {
    ...options,
    targetId: "synthetic-imported-guard-golden",
    targetLabel: "Synthetic imported guard route",
    notes: [
      "Synthetic imported guard trace proves held-back defender input can turn a real imported HitDef contact into guard evidence.",
    ],
  });
}

export function createSyntheticImportedAssertSpecialUnguardableTraceArtifact(
  options: RuntimeTraceGatePresetOptions = {},
): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedGuardScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-assertspecial-unguardable-attacker",
    displayName: "Synthetic Imported AssertSpecial Unguardable Attacker",
    guardDamage: 5,
    guardFlag: "MA",
    assertSpecialFlags: ["Unguardable"],
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-assertspecial-unguardable-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-assertspecial-unguardable-golden",
      label: "Synthetic imported AssertSpecial Unguardable route",
      source: "mixed",
      notes: [
        "Synthetic imported AssertSpecial trace proves an attacker-owned Unguardable flag can turn a held-back defender contact into hit evidence instead of guard evidence. It does not claim exact AssertSpecial lifetime, priorities, or full guard parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-assertspecial-unguardable-golden",
        requiredActorSources: ["demo", "imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "AssertSpecial", "HitDef"],
        requiredExecutedOperations: ["hitdef"],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["hit"],
        requiredCombatReasons: ["hit"],
      },
    ],
  });
}

export function createSyntheticImportedDefaultGuardStateTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const defender = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-default-guard-state",
    displayName: "Synthetic Imported Default Guard State",
    defaultGuardHit: { shakeStateNo: 150, slideStateNo: 151, guardStateNo: 130 },
  });
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-default-guard-state-attacker",
    displayName: "Synthetic Imported Default Guard State Attacker",
    guardDamage: 5,
    guardFlag: "MA",
    guardSlideTime: 5,
    guardControlTime: 7,
  });
  return createImportedDefaultGuardStateTraceArtifact(defender, {
    ...options,
    attacker,
    targetId: "synthetic-imported-default-guard-state-golden",
    targetLabel: "Synthetic imported Common1 guard-hit route",
    notes: [
      "Synthetic imported guard-state trace proves a held-back defender can enter its own Common1-style guard-hit states 150 and 151 after blocking an imported HitDef, including runtime-backed guard.slidetime and guard.ctrltime exposure through GetHitVar. It does not claim full guard-distance, guard-start, or guard-end parity.",
    ],
  });
}

export function createSyntheticImportedCrouchGuardStateTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const defender = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-crouch-guard-state",
    displayName: "Synthetic Imported Crouch Guard State",
    defaultGuardHit: { shakeStateNo: 150, slideStateNo: 151, crouchShakeStateNo: 152, crouchSlideStateNo: 153, guardStateNo: 130 },
  });
  return createImportedDefaultGuardStateTraceArtifact(defender, {
    ...options,
    script: importedDefaultCrouchGuardStateScript(),
    requiredExecutedStates: [200, 152, 153],
    requiredActiveCommands: ["holddown", "x"],
    targetId: "synthetic-imported-crouch-guard-state-golden",
    targetLabel: "Synthetic imported Common1 crouch guard-hit route",
    notes: [
      "Synthetic imported crouch guard-state trace proves a held-down-back defender can evaluate a Common1-style command expression and branch from guard-hit state 152 into 153. It does not claim full proximity guard, guard-start, guard-end, sparks, or exact crouch/air guard parity.",
    ],
  });
}

export function createSyntheticImportedInGuardDistTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-inguarddist-attacker",
    displayName: "Synthetic Imported InGuardDist Attacker",
    guardDamage: 5,
    guardFlag: "MA",
    guardDistance: 96,
  });
  const defender = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-inguarddist-defender",
    displayName: "Synthetic Imported InGuardDist Defender",
    withInGuardDistGuardStart: true,
  });
  const stage = options.stage ?? guardDistanceOnlyStage();
  const script = importedInGuardDistScript();
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: defender, stage }), script, {
    label: "synthetic-imported-inguarddist-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-inguarddist-golden",
      label: "Synthetic imported InGuardDist guard-start route",
      source: "imported",
      notes: [
        "Synthetic imported InGuardDist trace proves a near-but-not-contacting attack can satisfy InGuardDist and route a defender through an explicit guard-start ChangeState. It does not itself prove automatic guard start, proximity guard, or guard-end parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-inguarddist-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [130, 200],
        requiredExecutedControllers: ["ChangeState", "HitDef"],
        requiredExecutedOperations: ["hitdef"],
        requiredActiveCommands: ["x"],
        requiredCombatReasons: ["whiff"],
        requiredFinalActors: [
          {
            actorId: "p2",
            source: "imported",
            actorKind: "player",
            stateNo: 130,
            animNo: 130,
            ctrl: false,
            stateType: "S",
            moveType: "I",
          },
        ],
      },
    ],
  });
}

export function createSyntheticImportedAutoGuardStartTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-auto-guard-start-attacker",
    displayName: "Synthetic Imported Auto Guard Start Attacker",
    guardDamage: 5,
    guardFlag: "MA",
    guardDistance: 96,
  });
  const defender = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-auto-guard-start-defender",
    displayName: "Synthetic Imported Auto Guard Start Defender",
    withAutoGuardStartStates: true,
  });
  return createImportedAutoGuardStartTraceArtifact(defender, {
    ...options,
    attacker,
    targetId: "synthetic-imported-auto-guard-start-golden",
    targetLabel: "Synthetic imported automatic guard-start route",
    notes: [
      "Synthetic imported auto guard-start trace proves the runtime can enter defender-owned Common1-style guard start state 120 and settle into 130 from held-back input plus bounded InGuardDist before contact. It does not claim exact MUGEN/IKEMEN proximity guard, guard end, guard sparks/sounds, or air guard parity.",
    ],
  });
}

export function createSyntheticImportedAutoGuardEndTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-auto-guard-end-attacker",
    displayName: "Synthetic Imported Auto Guard End Attacker",
    guardDamage: 5,
    guardFlag: "MA",
    guardDistance: 96,
  });
  const defender = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-auto-guard-end-defender",
    displayName: "Synthetic Imported Auto Guard End Defender",
    withAutoGuardStartStates: true,
  });
  return createImportedAutoGuardEndTraceArtifact(defender, {
    ...options,
    attacker,
    targetId: "synthetic-imported-auto-guard-end-golden",
    targetLabel: "Synthetic imported automatic guard-end route",
    notes: [
      "Synthetic imported auto guard-end trace proves the runtime can leave a bounded Common1-style auto guard-start route through state 140 and return to state 0/control after InGuardDist is no longer true. It does not claim exact MUGEN/IKEMEN guard end timing, proximity guard, guard effects, or air guard parity.",
    ],
  });
}

export function createSyntheticImportedHitstunTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  return createImportedHitstunTraceArtifact(createSyntheticImportedTraceFighter(), {
    ...options,
    targetId: "synthetic-imported-hitstun-golden",
    targetLabel: "Synthetic imported hitstun route",
    notes: [
      "Synthetic imported hitstun trace proves a CMD/CNS-routed HitDef can put the target into the sandbox's current partial get-hit snapshot.",
    ],
  });
}

export function createSyntheticImportedFallTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-fall-attacker",
    displayName: "Synthetic Imported Fall Attacker",
    fall: commonGetHitFallData(),
  });
  const stage = options.stage ?? closeCombatStage();
  const script = importedXHitstunScript();
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-fall-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-fall-golden",
      label: "Synthetic imported fall metadata route",
      source: "mixed",
      notes: [
        "Synthetic imported fall trace proves simple HitDef fall.* params survive into the target hitFall snapshot. It does not claim common get-hit state, bounce, liedown, or recovery parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-fall-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "HitDef"],
        requiredExecutedOperations: ["hitdef"],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["hit"],
        requiredCombatReasons: ["hit"],
        requiredFinalActors: [
          {
            actorId: "p2",
            actorKind: "player",
            source: "demo",
            animNo: 500,
            moveType: "H",
            hitFall: {
              falling: true,
              damage: 70,
              velocityX: 3,
              velocityY: -6,
              recover: false,
              recoverTime: 30,
              envShakeTime: 15,
              envShakeAmpl: 6,
            },
          },
        ],
      },
    ],
  });
}

export function createSyntheticImportedCommonGetHitTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-common-gethit-attacker",
    displayName: "Synthetic Imported Common GetHit Attacker",
    fall: commonGetHitFallData(),
    getHitState: { stateNo: 5100, animNo: 500 },
  });
  const stage = options.stage ?? closeCombatStage();
  const script = importedCommonGetHitScript();
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-common-gethit-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-common-gethit-golden",
      label: "Synthetic imported common get-hit controller route",
      source: "mixed",
      notes: [
        "Synthetic imported common get-hit trace proves p2stateno can route into an owner-backed get-hit state that executes HitFallVel, HitFallDamage, HitFallSet, and FallEnvShake. It is still not full MUGEN/IKEMEN fall, bounce, liedown, or recovery parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-common-gethit-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200, 5100],
        requiredExecutedControllers: ["ChangeState", "HitDef", "HitFallVel", "HitFallDamage", "HitFallSet", "FallEnvShake"],
        requiredExecutedOperations: ["hitdef", "hitfall:hitfallvel", "hitfall:hitfalldamage", "hitfall:hitfallset", "fallenvshake"],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["hit"],
        requiredCombatReasons: ["hit"],
        requiredFinalActors: [
          {
            actorId: "p2",
            actorKind: "player",
            source: "demo",
            stateNo: 5100,
            hitFall: {
              falling: false,
              damage: 0,
              velocityX: 2,
              velocityY: -7,
              recover: false,
              recoverTime: 30,
            },
          },
        ],
      },
    ],
  });
}

export function createImportedDefaultGetHitTraceArtifact(
  imported: DemoFighterDefinition,
  options: RuntimeTraceGatePresetOptions & {
    targetId?: string;
    targetLabel?: string;
    notes?: string[];
    attacker?: DemoFighterDefinition;
  } = {},
): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedDefaultGetHitScript();
  const attacker =
    options.attacker ??
    createSyntheticImportedTraceFighter({
      id: `${imported.id}-default-gethit-attacker`,
      displayName: `${imported.displayName} Default GetHit Probe`,
    });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: imported, stage }), script, {
    label: `${imported.id}-default-gethit-golden`,
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: options.targetId ?? `${imported.id}-default-gethit-golden`,
      label: options.targetLabel ?? `${imported.displayName} default Common1 get-hit route`,
      source: "imported",
      notes: options.notes ?? [
        "Imported default get-hit trace verifies that a real HitDef without p2stateno can route an imported defender into its own Common1-style state 5000. It does not claim HitShakeOver, HitOver, bounce, liedown, or recovery parity.",
      ],
    },
    gates: [
      {
        label: "imported-default-gethit-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200, 5000],
        requiredExecutedControllers: ["ChangeState", "HitDef"],
        requiredExecutedOperations: ["hitdef"],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["hit"],
        requiredCombatReasons: ["hit"],
        requiredFinalActors: [
          {
            actorId: "p2",
            source: "imported",
            actorKind: "player",
            stateNo: 5000,
            moveType: "H",
          },
        ],
      },
    ],
  });
}

export function createImportedDefaultGetHitProgressionTraceArtifact(
  imported: DemoFighterDefinition,
  options: RuntimeTraceGatePresetOptions & {
    targetId?: string;
    targetLabel?: string;
    notes?: string[];
    attacker?: DemoFighterDefinition;
  } = {},
): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedDefaultGetHitProgressionScript();
  const attacker =
    options.attacker ??
    createSyntheticImportedTraceFighter({
      id: `${imported.id}-common1-progression-attacker`,
      displayName: `${imported.displayName} Common1 Progression Probe`,
    });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: imported, stage }), script, {
    label: `${imported.id}-default-gethit-progression-golden`,
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: options.targetId ?? `${imported.id}-default-gethit-progression-golden`,
      label: options.targetLabel ?? `${imported.displayName} Common1 HitShakeOver/HitOver progression`,
      source: "imported",
      notes: options.notes ?? [
        "Imported Common1 progression trace verifies that a HitDef without p2stateno can route an imported defender through state 5000, advance through HitShakeOver to 5001, and return through HitOver to state 0. It does not claim fall, bounce, liedown, or guard-state parity.",
      ],
    },
    gates: [
      {
        label: "imported-default-gethit-progression-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [0, 200, 5000, 5001],
        requiredExecutedControllers: ["ChangeState", "HitDef"],
        requiredExecutedOperations: ["hitdef"],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["hit"],
        requiredCombatReasons: ["hit"],
        requiredFinalActors: [
          {
            actorId: "p2",
            source: "imported",
            actorKind: "player",
            stateNo: 0,
            moveType: "I",
            ctrl: true,
          },
        ],
      },
    ],
  });
}

export function createImportedDefaultFallGetHitTraceArtifact(
  imported: DemoFighterDefinition,
  options: RuntimeTraceGatePresetOptions & {
    targetId?: string;
    targetLabel?: string;
    notes?: string[];
    attacker?: DemoFighterDefinition;
    requiredExecutedStates?: number[];
  } = {},
): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedDefaultFallGetHitScript();
  const attacker =
    options.attacker ??
    createSyntheticImportedTraceFighter({
      id: `${imported.id}-common1-fall-attacker`,
      displayName: `${imported.displayName} Common1 Fall Probe`,
      groundVelocity: [-3, -6],
      fall: commonGetHitFallData(),
    });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: imported, stage }), script, {
    label: `${imported.id}-default-fall-gethit-golden`,
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: options.targetId ?? `${imported.id}-default-fall-gethit-golden`,
      label: options.targetLabel ?? `${imported.displayName} Common1 airborne fall get-hit route`,
      source: "imported",
      notes: options.notes ?? [
        "Imported Common1 fall trace verifies that a HitDef without p2stateno can route an imported defender through state 5000 into airborne get-hit states 5030 and 5050 when fall/y velocity metadata exists. It does not claim ground impact 5100, bounce, liedown, recovery input, or guard-state parity.",
      ],
    },
    gates: [
      {
        label: "imported-default-fall-gethit-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: options.requiredExecutedStates ?? [200, 5000, 5030, 5050],
        requiredExecutedControllers: ["ChangeState", "HitDef"],
        requiredExecutedOperations: ["hitdef"],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["hit"],
        requiredCombatReasons: ["hit"],
        requiredFinalActors: [
          {
            actorId: "p2",
            source: "imported",
            actorKind: "player",
            hitFall: {
              falling: true,
              velocityY: -6,
              recover: false,
            },
          },
        ],
      },
    ],
  });
}

export function createImportedDefaultFallRecoveryTraceArtifact(
  imported: DemoFighterDefinition,
  options: RuntimeTraceGatePresetOptions & {
    targetId?: string;
    targetLabel?: string;
    notes?: string[];
    attacker?: DemoFighterDefinition;
  } = {},
): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedDefaultFallOfficialRecoveryScript();
  const attacker =
    options.attacker ??
    createSyntheticImportedTraceFighter({
      id: `${imported.id}-common1-recovery-attacker`,
      displayName: `${imported.displayName} Common1 Recovery Probe`,
      groundVelocity: [-3, -6],
      fall: commonGetHitFallData(),
    });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: imported, stage }), script, {
    label: `${imported.id}-default-fall-recovery-golden`,
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: options.targetId ?? `${imported.id}-default-fall-recovery-golden`,
      label: options.targetLabel ?? `${imported.displayName} Common1 lie-down get-up route`,
      source: "imported",
      notes: options.notes ?? [
        "Imported Common1 fall recovery trace verifies that a real imported defender can progress from lie-down state 5110 into get-up state 5120 and return to idle/control when the fixture supplies those states and animations. It still does not claim exact tick-order parity, input recovery shortening, or full guard-state parity.",
      ],
    },
    gates: [
      {
        label: "imported-default-fall-recovery-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200, 5000, 5030, 5050, 5100, 5101, 5110, 5120],
        requiredExecutedControllers: ["ChangeState", "HitDef", "HitFallDamage", "HitFallSet"],
        requiredExecutedOperations: ["hitdef"],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["hit"],
        requiredCombatReasons: ["hit"],
        requiredFinalActors: [
          {
            actorId: "p2",
            source: "imported",
            actorKind: "player",
            stateNo: 0,
            moveType: "I",
            ctrl: true,
          },
        ],
      },
    ],
  });
}

export function createImportedDefaultFallRecoveryInputTraceArtifact(
  imported: DemoFighterDefinition,
  options: RuntimeTraceGatePresetOptions & {
    targetId?: string;
    targetLabel?: string;
    notes?: string[];
    attacker?: DemoFighterDefinition;
  } = {},
): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedDefaultFallOfficialRecoveryInputScript();
  const attacker =
    options.attacker ??
    createSyntheticImportedTraceFighter({
      id: `${imported.id}-common1-recovery-input-attacker`,
      displayName: `${imported.displayName} Common1 Recovery Input Probe`,
      groundVelocity: [-3, -9],
      fall: {
        ...commonGetHitFallData(),
        velocity: { x: 3, y: -9 },
        recover: true,
        recoverTime: 4,
      },
    });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: imported, stage }), script, {
    label: `${imported.id}-default-fall-recovery-input-golden`,
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: options.targetId ?? `${imported.id}-default-fall-recovery-input-golden`,
      label: options.targetLabel ?? `${imported.displayName} Common1 air recovery input route`,
      source: "imported",
      notes: options.notes ?? [
        "Imported Common1 recovery-input trace verifies that a real imported defender can leave fall state 5050 through CanRecover plus command = \"recovery\", enter air recovery state 5210, and return to idle/control when fixture data supplies those Common1 states. It still does not claim exact ground-recovery 5200/5201 parity, thresholds, velocities, or tick-order parity.",
      ],
    },
    gates: [
      {
        label: "imported-default-fall-recovery-input-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200, 5000, 5030, 5050, 5210],
        requiredExecutedControllers: ["ChangeState", "HitDef", "HitVelSet", "VelAdd"],
        requiredExecutedOperations: ["hitdef"],
        requiredActiveCommands: ["x", "recovery"],
        requiredEventCategories: ["hit"],
        requiredCombatReasons: ["hit"],
        requiredFinalActors: [
          {
            actorId: "p2",
            source: "imported",
            actorKind: "player",
            stateNo: 0,
            moveType: "I",
            ctrl: true,
          },
        ],
      },
    ],
  });
}

export function createImportedDefaultFallGroundRecoveryTraceArtifact(
  imported: DemoFighterDefinition,
  options: RuntimeTraceGatePresetOptions & {
    targetId?: string;
    targetLabel?: string;
    notes?: string[];
    attacker?: DemoFighterDefinition;
  } = {},
): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedDefaultFallOfficialGroundRecoveryScript();
  const attacker =
    options.attacker ??
    createSyntheticImportedTraceFighter({
      id: `${imported.id}-common1-ground-recovery-attacker`,
      displayName: `${imported.displayName} Common1 Ground Recovery Probe`,
      groundVelocity: [-3, -6],
      fall: {
        ...commonGetHitFallData(),
        velocity: { x: 3, y: -6 },
        recover: true,
        recoverTime: 4,
      },
    });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: imported, stage }), script, {
    label: `${imported.id}-default-fall-ground-recovery-golden`,
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: options.targetId ?? `${imported.id}-default-fall-ground-recovery-golden`,
      label: options.targetLabel ?? `${imported.displayName} Common1 ground recovery input route`,
      source: "imported",
      notes: options.notes ?? [
        "Imported Common1 ground-recovery trace verifies that a real imported defender can leave fall state 5050 through CanRecover plus command = \"recovery\" near the ground, enter 5200, self-return to 5201, land through state 52, and return to idle/control when fixture data supplies those Common1 states. It still does not claim exact recovery thresholds, velocities, or tick-order parity.",
      ],
    },
    gates: [
      {
        label: "imported-default-fall-ground-recovery-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200, 5000, 5030, 5050, 5200, 5201, 52],
        requiredExecutedControllers: ["ChangeState", "SelfState", "HitDef", "HitVelSet", "VelAdd", "VelSet", "PosSet"],
        requiredExecutedOperations: ["hitdef"],
        requiredActiveCommands: ["x", "recovery"],
        requiredEventCategories: ["hit"],
        requiredCombatReasons: ["hit"],
        requiredFinalActors: [
          {
            actorId: "p2",
            source: "imported",
            actorKind: "player",
            stateNo: 0,
            moveType: "I",
            ctrl: true,
          },
        ],
      },
    ],
  });
}

export function createSyntheticImportedDefaultFallRecoveryTraceArtifact(
  options: RuntimeTraceGatePresetOptions = {},
): RuntimeTraceArtifact {
  const imported = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-default-fall-recovery",
    displayName: "Synthetic Imported Default Fall Recovery",
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
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-default-fall-recovery-attacker",
    displayName: "Synthetic Imported Default Fall Recovery Attacker",
    groundVelocity: [-3, -6],
    fall: { enabled: true, damage: 20, velocity: { x: 3, y: -6 }, recover: false, recoverTime: 30 },
  });
  const stage = options.stage ?? closeCombatStage();
  const script = importedDefaultFallRecoveryScript();
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: imported, stage }), script, {
    label: "synthetic-imported-default-fall-recovery-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-default-fall-recovery-golden",
      label: "Synthetic imported Common1 fall bounce/lie-down/recovery route",
      source: "imported",
      notes: [
        "Synthetic imported recovery trace proves the bounded runtime can execute a defender-owned Common1-style fall chain through 5000, 5030, 5050, 5100, 5101, 5110, 5120, and back to 0. It is not official KFM parity and does not claim exact tick-order parity, input recovery, or engine-perfect bounce physics.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-default-fall-recovery-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [0, 200, 5000, 5030, 5050, 5100, 5101, 5110, 5120],
        requiredExecutedControllers: ["ChangeState", "HitDef", "HitVelSet", "VelAdd", "HitFallDamage"],
        requiredExecutedOperations: ["hitdef"],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["hit"],
        requiredCombatReasons: ["hit"],
        requiredFinalActors: [
          {
            actorId: "p2",
            source: "imported",
            actorKind: "player",
            stateNo: 0,
            moveType: "I",
            ctrl: true,
          },
        ],
      },
    ],
  });
}

export function createSyntheticImportedDefaultFallRecoveryInputTraceArtifact(
  options: RuntimeTraceGatePresetOptions = {},
): RuntimeTraceArtifact {
  const imported = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-default-fall-recovery-input",
    displayName: "Synthetic Imported Default Fall Recovery Input",
    defaultGetHitFall: {
      shakeStateNo: 5000,
      slideStateNo: 5001,
      airStateNo: 5030,
      fallStateNo: 5050,
      recoveryInputStateNo: 5210,
      includeRecoveryInput: true,
    },
  });
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-default-fall-recovery-input-attacker",
    displayName: "Synthetic Imported Default Fall Recovery Input Attacker",
    groundVelocity: [-3, -6],
    fall: { enabled: true, damage: 20, velocity: { x: 3, y: -6 }, recover: true, recoverTime: 4 },
  });
  const stage = options.stage ?? closeCombatStage();
  const script = importedDefaultFallRecoveryInputScript();
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: imported, stage }), script, {
    label: "synthetic-imported-default-fall-recovery-input-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-default-fall-recovery-input-golden",
      label: "Synthetic imported Common1 recovery input route",
      source: "imported",
      notes: [
        "Synthetic imported recovery-input trace proves a bounded defender-owned Common1-style fall route can leave 5050 through CanRecover plus command = \"recovery\" and enter 5210 before returning to idle/control. It does not claim exact MUGEN/IKEMEN ground/air recovery thresholds, velocities, or tick-order parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-default-fall-recovery-input-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [0, 200, 5000, 5030, 5050, 5210],
        requiredExecutedControllers: ["ChangeState", "HitDef", "HitVelSet", "VelAdd", "HitFallSet"],
        requiredExecutedOperations: ["hitdef"],
        requiredActiveCommands: ["x", "recovery"],
        requiredEventCategories: ["hit"],
        requiredCombatReasons: ["hit"],
        requiredFinalActors: [
          {
            actorId: "p2",
            source: "imported",
            actorKind: "player",
            stateNo: 0,
            moveType: "I",
            ctrl: true,
          },
        ],
      },
    ],
  });
}

export function createImportedHitstunTraceArtifact(
  imported: DemoFighterDefinition,
  options: RuntimeTraceGatePresetOptions & { targetId?: string; targetLabel?: string; notes?: string[] } = {},
): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedXHitstunScript();
  const trace = runRuntimeTrace(new MatchWorld({ p1: imported, p2: demoFighters[1]!, stage }), script, {
    label: `${imported.id}-hitstun-golden`,
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: options.targetId ?? `${imported.id}-hitstun-golden`,
      label: options.targetLabel ?? `${imported.displayName} hitstun route`,
      source: "mixed",
      notes: options.notes ?? [
        "Imported hitstun trace verifies the current partial get-hit snapshot after a CMD/CNS-routed HitDef without claiming full common-state/fall parity.",
      ],
    },
    gates: [
      {
        label: "imported-hitstun-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "HitDef"],
        requiredExecutedOperations: ["hitdef"],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["hit"],
        requiredCombatReasons: ["hit"],
        requiredFinalActors: [
          {
            actorId: "p2",
            actorKind: "player",
            source: "demo",
            animNo: 500,
            moveType: "H",
          },
        ],
      },
    ],
  });
}

export function createSyntheticImportedStateExitTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  return createImportedStateExitTraceArtifact(createSyntheticImportedTraceFighter(), {
    ...options,
    targetId: "synthetic-imported-state-exit-golden",
    targetLabel: "Synthetic imported attack recovery route",
    notes: [
      "Synthetic imported state-exit trace proves a CMD/CNS-routed attack can hit, finish recovery, and return the imported actor to idle with control restored.",
    ],
  });
}

export function createImportedStateExitTraceArtifact(
  imported: DemoFighterDefinition,
  options: RuntimeTraceGatePresetOptions & { targetId?: string; targetLabel?: string; notes?: string[] } = {},
): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedXStateExitScript();
  const trace = runRuntimeTrace(new MatchWorld({ p1: imported, p2: demoFighters[1]!, stage }), script, {
    label: `${imported.id}-state-exit-golden`,
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: options.targetId ?? `${imported.id}-state-exit-golden`,
      label: options.targetLabel ?? `${imported.displayName} attack recovery route`,
      source: "mixed",
      notes: options.notes ?? [
        "Imported state-exit trace verifies attack recovery returns to idle/control for the current partial CMD/CNS runtime.",
      ],
    },
    gates: [
      {
        label: "imported-state-exit-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "HitDef"],
        requiredExecutedOperations: ["hitdef"],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["hit"],
        requiredCombatReasons: ["hit"],
        requiredFinalActors: [
          {
            actorId: "p1",
            source: "imported",
            actorKind: "player",
            stateNo: 0,
            animNo: 0,
            ctrl: true,
            stateType: "S",
            moveType: "I",
            physics: "S",
            guarding: false,
          },
        ],
      },
    ],
  });
}

export function createImportedGuardTraceArtifact(
  imported: DemoFighterDefinition,
  options: RuntimeTraceGatePresetOptions & { targetId?: string; targetLabel?: string; notes?: string[] } = {},
): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedGuardScript();
  const trace = runRuntimeTrace(new MatchWorld({ p1: imported, p2: demoFighters[1]!, stage }), script, {
    label: `${imported.id}-guard-golden`,
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: options.targetId ?? `${imported.id}-guard-golden`,
      label: options.targetLabel ?? `${imported.displayName} guard route`,
      source: "mixed",
      notes: options.notes ?? [
        "Imported guard trace verifies the current held-back guard path for a CMD/CNS-routed HitDef without claiming full guard-state parity.",
      ],
    },
    gates: [
      {
        label: "imported-guard-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "HitDef"],
        requiredExecutedOperations: ["hitdef"],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["guard"],
        requiredCombatReasons: ["guard"],
      },
    ],
  });
}

export function createImportedDefaultGuardStateTraceArtifact(
  imported: DemoFighterDefinition,
  options: RuntimeTraceGatePresetOptions & {
    targetId?: string;
    targetLabel?: string;
    notes?: string[];
    attacker?: DemoFighterDefinition;
    script?: RuntimeTraceInputFrame[];
    requiredExecutedStates?: number[];
    requiredActiveCommands?: string[];
  } = {},
): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const attacker =
    options.attacker ??
    createSyntheticImportedTraceFighter({
      id: `${imported.id}-default-guard-attacker`,
      displayName: `${imported.displayName} Default Guard Attacker`,
      guardDamage: 5,
      guardFlag: "MA",
    });
  const script = options.script ?? importedDefaultGuardStateScript();
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: imported, stage }), script, {
    label: `${imported.id}-default-guard-state-golden`,
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: options.targetId ?? `${imported.id}-default-guard-state-golden`,
      label: options.targetLabel ?? `${imported.displayName} Common1 guard-hit route`,
      source: "imported",
      notes: options.notes ?? [
        "Imported guard-state trace verifies that a held-back imported defender can enter its own Common1-style guard-hit states after blocking a HitDef without claiming full guard-distance, guard-start, or guard-end parity.",
      ],
    },
    gates: [
      {
        label: options.targetId ?? `${imported.id}-default-guard-state-golden`,
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: options.requiredExecutedStates ?? [200, 150, 151],
        requiredExecutedControllers: ["ChangeState", "HitDef", "HitVelSet"],
        requiredExecutedOperations: ["hitdef"],
        requiredActiveCommands: options.requiredActiveCommands ?? ["x"],
        requiredEventCategories: ["guard"],
        requiredCombatReasons: ["guard"],
      },
    ],
  });
}

export function createImportedAutoGuardStartTraceArtifact(
  imported: DemoFighterDefinition,
  options: RuntimeTraceGatePresetOptions & {
    targetId?: string;
    targetLabel?: string;
    notes?: string[];
    attacker?: DemoFighterDefinition;
    requiredExecutedStates?: number[];
    requiredFinalStateNo?: number;
  } = {},
): RuntimeTraceArtifact {
  const stage = options.stage ?? guardDistanceOnlyStage();
  const attacker =
    options.attacker ??
    createSyntheticImportedTraceFighter({
      id: `${imported.id}-auto-guard-start-attacker`,
      displayName: `${imported.displayName} Auto Guard Start Probe`,
      guardDamage: 5,
      guardFlag: "MA",
      guardDistance: 96,
    });
  const script = importedAutoGuardStartScript();
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: imported, stage }), script, {
    label: `${imported.id}-auto-guard-start-golden`,
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: options.targetId ?? `${imported.id}-auto-guard-start-golden`,
      label: options.targetLabel ?? `${imported.displayName} automatic guard-start route`,
      source: "imported",
      notes: options.notes ?? [
        "Imported auto guard-start trace verifies the bounded runtime can enter a defender-owned Common1-style guard start route from held-back input plus InGuardDist before contact. It does not claim exact MUGEN/IKEMEN proximity guard, guard end, guard effects, or air guard parity.",
      ],
    },
    gates: [
      {
        label: options.targetId ?? `${imported.id}-auto-guard-start-golden`,
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: options.requiredExecutedStates ?? [120, 130, 200],
        requiredExecutedControllers: ["ChangeState", "HitDef"],
        requiredExecutedOperations: ["hitdef"],
        requiredActiveCommands: ["holdback", "x"],
        requiredCombatReasons: ["whiff"],
        requiredFinalActors: [
          {
            actorId: "p2",
            source: "imported",
            actorKind: "player",
            stateNo: options.requiredFinalStateNo ?? 130,
            animNo: options.requiredFinalStateNo ?? 130,
            ctrl: false,
            stateType: "S",
            moveType: "I",
          },
        ],
      },
    ],
  });
}

export function createImportedAutoGuardEndTraceArtifact(
  imported: DemoFighterDefinition,
  options: RuntimeTraceGatePresetOptions & {
    targetId?: string;
    targetLabel?: string;
    notes?: string[];
    attacker?: DemoFighterDefinition;
    requiredExecutedStates?: number[];
  } = {},
): RuntimeTraceArtifact {
  const stage = options.stage ?? guardDistanceOnlyStage();
  const attacker =
    options.attacker ??
    createSyntheticImportedTraceFighter({
      id: `${imported.id}-auto-guard-end-attacker`,
      displayName: `${imported.displayName} Auto Guard End Probe`,
      guardDamage: 5,
      guardFlag: "MA",
      guardDistance: 96,
    });
  const script = importedAutoGuardEndScript();
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: imported, stage }), script, {
    label: `${imported.id}-auto-guard-end-golden`,
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: options.targetId ?? `${imported.id}-auto-guard-end-golden`,
      label: options.targetLabel ?? `${imported.displayName} automatic guard-end route`,
      source: "imported",
      notes: options.notes ?? [
        "Imported auto guard-end trace verifies the bounded runtime can leave a defender-owned Common1-style guard route through state 140 and return to idle/control after InGuardDist is no longer true. It does not claim exact MUGEN/IKEMEN guard end timing, proximity guard, guard effects, or air guard parity.",
      ],
    },
    gates: [
      {
        label: options.targetId ?? `${imported.id}-auto-guard-end-golden`,
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: options.requiredExecutedStates ?? [120, 130, 140, 200],
        requiredExecutedControllers: ["ChangeState", "HitDef"],
        requiredExecutedOperations: ["hitdef"],
        requiredCombatReasons: ["whiff"],
        requiredFinalActors: [
          {
            actorId: "p2",
            source: "imported",
            actorKind: "player",
            stateNo: 0,
            animNo: 0,
            ctrl: true,
            stateType: "S",
            moveType: "I",
          },
        ],
      },
    ],
  });
}

export function createSyntheticImportedTargetTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedTargetScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-target-attacker",
    displayName: "Synthetic Imported Target Attacker",
    withTargetControllers: true,
    withTargetDrop: true,
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-target-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-target-golden",
      label: "Synthetic imported Target controller route",
      source: "mixed",
      notes: [
        "Synthetic imported target trace proves HitDef target memory can feed typed Target* ControllerOp execution without depending on private fixtures.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-target-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: [
          "ChangeState",
          "HitDef",
          "TargetLifeAdd",
          "TargetPowerAdd",
          "TargetVelSet",
          "TargetVelAdd",
          "TargetFacing",
          "TargetBind",
          "TargetDrop",
        ],
        requiredExecutedOperations: [
          "hitdef",
          "target:targetlifeadd",
          "target:targetpoweradd",
          "target:targetvelset",
          "target:targetveladd",
          "target:targetfacing",
          "target:targetbind",
          "target:targetdrop",
        ],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["hit"],
        requiredCombatReasons: ["hit"],
        requiredTargetLinks: [
          { ownerId: "p1", actorId: "p2", targetId: 77 },
          { ownerId: "p1", actorId: "p2", targetId: 77, hasBinding: true },
        ],
      },
    ],
  });
}

export function createSyntheticImportedSuperPauseTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? farCombatStage();
  const script = importedSuperPauseScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-superpause-attacker",
    displayName: "Synthetic Imported SuperPause Attacker",
    withSuperPause: true,
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-superpause-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-superpause-golden",
      label: "Synthetic imported SuperPause route",
      source: "mixed",
      notes: [
        "Synthetic imported SuperPause trace proves Pause/SuperPause controllers compile into typed pause operations and produce runtime pause evidence without depending on private fixtures.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-superpause-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "HitDef", "SuperPause"],
        requiredExecutedOperations: ["hitdef", "pause:superpause"],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["pause"],
        requiredMatchPauses: [{ type: "SuperPause", actorId: "p1", sourceStateNo: 200, darken: true, minFrames: 2, minRemaining: 7, minMoveTime: 1 }],
        requiredMatchPauseFreezes: [{ type: "SuperPause", actorId: "p2", minFrozenFrames: 6 }],
      },
    ],
  });
}

export function createSyntheticImportedSuperPauseProjectileFreezeTraceArtifact(
  options: RuntimeTraceGatePresetOptions = {},
): RuntimeTraceArtifact {
  const stage = options.stage ?? effectPauseStage();
  const script = importedSuperPauseProjectileScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-superpause-projectile-attacker",
    displayName: "Synthetic Imported SuperPause Projectile Attacker",
    withSuperPause: true,
    withProjectile: true,
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-superpause-projectile-freeze-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-superpause-projectile-freeze-golden",
      label: "Synthetic imported SuperPause projectile freeze route",
      source: "mixed",
      notes: [
        "Synthetic imported SuperPause projectile trace proves effect actors are included in match-pause freeze evidence. It does not claim full projectile pause, priority, cancel, trade, helper, or IKEMEN pause parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-superpause-projectile-freeze-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredEffectKinds: ["projectile"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "HitDef", "SuperPause", "Projectile"],
        requiredExecutedOperations: ["hitdef", "pause:superpause", "projectile"],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["pause"],
        requiredWorldLifecycleEvents: [{ type: "spawn", kind: "projectile", ownerId: "p1", rootId: "p1", parentId: "p1" }],
        requiredEffectStores: [{ ownerId: "p1", minTotal: 1, minProjectiles: 1, minNextProjectileSerial: 1 }],
        requiredMatchPauses: [{ type: "SuperPause", actorId: "p1", sourceStateNo: 200, darken: true, minFrames: 2, minRemaining: 7, minMoveTime: 1 }],
        requiredMatchPauseFreezes: [
          { type: "SuperPause", actorKind: "player", ownerId: "p2", minFrozenFrames: 6 },
          { type: "SuperPause", actorKind: "projectile", ownerId: "p1", minFrozenFrames: 5 },
        ],
        requiredMatchPauseAdvances: [
          { type: "SuperPause", actorKind: "projectile", ownerId: "p1", minAdvancedFrames: 1, minPreviousMoveTime: 1 },
        ],
      },
    ],
  });
}

export function createSyntheticImportedProjectileTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? projectileCombatStage();
  const script = importedProjectileScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-projectile-attacker",
    displayName: "Synthetic Imported Projectile Attacker",
    withProjectile: true,
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-projectile-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-projectile-golden",
      label: "Synthetic imported Projectile route",
      source: "mixed",
      notes: [
        "Synthetic imported Projectile trace proves Projectile controllers compile into typed projectile operations and spawn bounded colliding effect actors. Projectile-vs-projectile trade/cancel is covered by a separate bounded clash gate; exact priority classes, cancel animations, and remove animation parity remain future work.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-projectile-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredEffectKinds: ["projectile"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "HitDef", "Projectile"],
        requiredExecutedOperations: ["hitdef", "projectile"],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["hit"],
        requiredCombatReasons: ["hit"],
        requiredWorldLifecycleEvents: [
          { type: "spawn", kind: "projectile", ownerId: "p1", rootId: "p1", parentId: "p1" },
          { type: "remove", kind: "projectile", ownerId: "p1", rootId: "p1", parentId: "p1" },
        ],
        requiredEffectStores: [{ ownerId: "p1", minTotal: 1, minProjectiles: 1, minNextProjectileSerial: 1 }],
        requiredTargetLinks: [{ ownerId: "p1", actorId: "p2", targetId: 77 }],
      },
    ],
  });
}

export function createSyntheticImportedProjectileGuardTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? projectileCombatStage();
  const script = importedProjectileGuardScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-projectile-guard-attacker",
    displayName: "Synthetic Imported Projectile Guard Attacker",
    withProjectile: true,
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-projectile-guard-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-projectile-guard-golden",
      label: "Synthetic imported Projectile guard route",
      source: "mixed",
      notes: [
        "Synthetic imported Projectile guard trace verifies that Projectile controllers can carry typed guard params and resolve a held-back projectile block through the shared partial hit/guard combat path. Projectile-vs-projectile trade/cancel is covered by a separate bounded clash gate; exact guard-state timing, sparks, sounds, cancel animations, remove animations, and IKEMEN projectile parity remain future work.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-projectile-guard-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredEffectKinds: ["projectile"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "HitDef", "Projectile"],
        requiredExecutedOperations: ["hitdef", "projectile"],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["guard"],
        requiredCombatReasons: ["guard"],
        requiredWorldLifecycleEvents: [
          { type: "spawn", kind: "projectile", ownerId: "p1", rootId: "p1", parentId: "p1" },
          { type: "remove", kind: "projectile", ownerId: "p1", rootId: "p1", parentId: "p1" },
        ],
        requiredEffectStores: [{ ownerId: "p1", minTotal: 1, minProjectiles: 1, minNextProjectileSerial: 1 }],
        requiredTargetLinks: [{ ownerId: "p1", actorId: "p2", targetId: 77 }],
      },
    ],
  });
}

export function createSyntheticImportedProjectileClashTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? projectileClashStage();
  const script = importedProjectileClashScript();
  const p1 = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-projectile-clash-p1",
    displayName: "Synthetic Imported Projectile Clash P1",
    withProjectile: true,
    projectilePriority: 1,
    projectileOffset: [100, -45],
  });
  const p2 = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-projectile-clash-p2",
    displayName: "Synthetic Imported Projectile Clash P2",
    withProjectile: true,
    projectilePriority: 1,
    projectileOffset: [100, -45],
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1, p2, stage }), script, {
    label: "synthetic-imported-projectile-clash-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-projectile-clash-golden",
      label: "Synthetic imported Projectile clash route",
      source: "imported",
      notes: [
        "Synthetic imported Projectile clash trace verifies the bounded partial projectile-vs-projectile path: equal projpriority projectiles trade and are removed through the effect actor world. It does not claim exact MUGEN/IKEMEN projectile priority classes, cancel animations, remove animations, helpers, or projectile owner binding parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-projectile-clash-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredEffectKinds: ["projectile"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "HitDef", "Projectile"],
        requiredExecutedOperations: ["hitdef", "projectile"],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["runtime"],
        requiredEventSubstrings: ["Projectile clash"],
        requiredWorldLifecycleEvents: [
          { type: "spawn", kind: "projectile", ownerId: "p1", rootId: "p1", parentId: "p1" },
          { type: "spawn", kind: "projectile", ownerId: "p2", rootId: "p2", parentId: "p2" },
          { type: "remove", kind: "projectile", ownerId: "p1", rootId: "p1", parentId: "p1" },
          { type: "remove", kind: "projectile", ownerId: "p2", rootId: "p2", parentId: "p2" },
        ],
        requiredEffectStores: [
          { ownerId: "p1", minNextProjectileSerial: 1 },
          { ownerId: "p2", minNextProjectileSerial: 1 },
        ],
      },
    ],
  });
}

export function createSyntheticImportedHelperTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? farCombatStage();
  const script = importedHelperScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-helper-attacker",
    displayName: "Synthetic Imported Helper Attacker",
    withHelper: true,
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-helper-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-helper-golden",
      label: "Synthetic imported Helper route",
      source: "mixed",
      notes: [
        "Synthetic imported Helper trace proves Helper controllers compile into typed helper operations and spawn bounded visual helper effect actors. It does not claim helper VM, redirects, keyctrl, helper combat, parent/root binding, or DestroySelf parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-helper-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredEffectKinds: ["helper"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "HitDef", "Helper"],
        requiredExecutedOperations: ["hitdef", "helper"],
        requiredActiveCommands: ["x"],
        requiredWorldLifecycleEvents: [
          { type: "spawn", kind: "helper", ownerId: "p1", rootId: "p1", parentId: "p1" },
          { type: "active", kind: "helper", ownerId: "p1", rootId: "p1", parentId: "p1" },
        ],
        requiredEffectStores: [{ ownerId: "p1", minTotal: 1, minHelpers: 1, minNextHelperSerial: 1 }],
      },
    ],
  });
}

export function createSyntheticImportedExplodTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? farCombatStage();
  const script = importedExplodScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-explod-attacker",
    displayName: "Synthetic Imported Explod Attacker",
    withExplod: true,
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-explod-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-explod-golden",
      label: "Synthetic imported Explod route",
      source: "mixed",
      notes: [
        "Synthetic imported Explod trace proves Explod controllers compile into typed explod operations and spawn bounded visual effect actors. It does not claim bind, velocity, scale, ownpal, FightFX/common animation, or remove-trigger parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-explod-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredEffectKinds: ["explod"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "HitDef", "Explod"],
        requiredExecutedOperations: ["hitdef", "explod"],
        requiredActiveCommands: ["x"],
        requiredWorldLifecycleEvents: [
          { type: "spawn", kind: "explod", ownerId: "p1", rootId: "p1", parentId: "p1" },
          { type: "active", kind: "explod", ownerId: "p1", rootId: "p1", parentId: "p1" },
        ],
        requiredEffectStores: [{ ownerId: "p1", minTotal: 1, minExplods: 1, minNextExplodSerial: 1 }],
      },
    ],
  });
}

export function createImportedQcfXTraceArtifact(
  imported: DemoFighterDefinition,
  options: RuntimeTraceGatePresetOptions & { targetId?: string; targetLabel?: string; notes?: string[] } = {},
): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = qcfXScript();
  const trace = runRuntimeTrace(new MatchWorld({ p1: imported, p2: demoFighters[1]!, stage }), script, {
    label: `${imported.id}-qcf-x-golden`,
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: options.targetId ?? `${imported.id}-qcf-x-golden`,
      label: options.targetLabel ?? `${imported.displayName} QCF x route`,
      source: "mixed",
      notes: options.notes ?? [
        "Imported QCF trace verifies command sequence buffering and routed special-state execution for fixtures that expose QCF_x.",
      ],
    },
    gates: [
      {
        label: "imported-qcf-x-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [1000],
        requiredExecutedStates: [1000],
        requiredExecutedControllers: ["ChangeState", { type: "PosAdd", minCount: 1 }],
        requiredActiveCommands: ["QCF_x", "x"],
      },
    ],
  });
}

export function closeCombatStage(): MugenStageDefinition {
  return {
    ...trainingStage,
    id: "trace-close-training-grid",
    displayName: "Trace Close Training Grid",
    playerStart: {
      p1: { x: -20, y: 0, facing: 1 },
      p2: { x: 35, y: 0, facing: -1 },
    },
  };
}

export function farCombatStage(): MugenStageDefinition {
  return {
    ...trainingStage,
    id: "trace-far-training-grid",
    displayName: "Trace Far Training Grid",
    playerStart: {
      p1: { x: -160, y: 0, facing: 1 },
      p2: { x: 180, y: 0, facing: -1 },
    },
  };
}

export function guardDistanceOnlyStage(): MugenStageDefinition {
  return {
    ...trainingStage,
    id: "trace-guard-distance-only-grid",
    displayName: "Trace Guard Distance Only Grid",
    playerStart: {
      p1: { x: -95, y: 0, facing: 1 },
      p2: { x: 95, y: 0, facing: -1 },
    },
  };
}

export function projectileCombatStage(): MugenStageDefinition {
  return {
    ...trainingStage,
    id: "trace-projectile-training-grid",
    displayName: "Trace Projectile Training Grid",
    playerStart: {
      p1: { x: -160, y: 0, facing: 1 },
      p2: { x: 180, y: 0, facing: -1 },
    },
  };
}

export function projectileClashStage(): MugenStageDefinition {
  return {
    ...trainingStage,
    id: "trace-projectile-clash-training-grid",
    displayName: "Trace Projectile Clash Grid",
    playerStart: {
      p1: { x: -260, y: 0, facing: 1 },
      p2: { x: 260, y: 0, facing: -1 },
    },
  };
}

export function effectPauseStage(): MugenStageDefinition {
  return {
    ...trainingStage,
    id: "trace-effect-pause-training-grid",
    displayName: "Trace Effect Pause Training Grid",
    playerStart: {
      p1: { x: -160, y: 0, facing: 1 },
      p2: { x: 300, y: 0, facing: -1 },
    },
  };
}

export function nativeHitScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([{ label: "native-hold-punch", frames: 16, p1: ["a"], p2: [] }]);
}

export function nativeWhiffScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([{ label: "native-whiff-punch", frames: 16, p1: ["a"], p2: [] }]);
}

export function importedXScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "imported-x", frames: 12, p1: ["x"], p2: [] },
    { label: "settle", frames: 2, p1: [], p2: [] },
  ]);
}

export function importedXStateExitScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "imported-state-exit-x", frames: 12, p1: ["x"], p2: [] },
    { label: "state-exit-settle", frames: 24, p1: [], p2: [] },
  ]);
}

export function importedXHitstunScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([{ label: "imported-hitstun-x", frames: 12, p1: ["x"], p2: [] }]);
}

export function importedCommonGetHitScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "imported-common-gethit-x", frames: 12, p1: ["x"], p2: [] },
    { label: "common-gethit-settle", frames: 14, p1: [], p2: [] },
  ]);
}

export function importedDefaultGetHitScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([{ label: "imported-default-gethit-x", frames: 2, p1: ["x"], p2: [] }]);
}

export function importedDefaultGetHitProgressionScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "imported-default-gethit-progress-x", frames: 12, p1: ["x"], p2: [] },
    { label: "default-gethit-progress-settle", frames: 18, p1: [], p2: [] },
  ]);
}

export function importedDefaultFallGetHitScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "imported-default-fall-gethit-x", frames: 14, p1: ["x"], p2: [] },
    { label: "default-fall-gethit-settle", frames: 70, p1: [], p2: [] },
  ]);
}

export function importedDefaultFallRecoveryScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "imported-default-fall-recovery-x", frames: 14, p1: ["x"], p2: [] },
    { label: "default-fall-recovery-chain", frames: 52, p1: [], p2: [] },
  ]);
}

export function importedDefaultFallRecoveryInputScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "imported-default-fall-recovery-input-x", frames: 14, p1: ["x"], p2: [] },
    { label: "default-fall-recovery-input-window", frames: 5, p1: [], p2: [] },
    { label: "default-fall-recovery-input", frames: 4, p1: [], p2: ["x", "y"] },
    { label: "default-fall-recovery-input-settle", frames: 12, p1: [], p2: [] },
  ]);
}

export function importedDefaultFallOfficialRecoveryInputScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "imported-default-fall-official-recovery-input-x", frames: 14, p1: ["x"], p2: [] },
    { label: "default-fall-official-recovery-input-window", frames: 4, p1: [], p2: [] },
    { label: "default-fall-official-recovery-input", frames: 6, p1: [], p2: ["x", "y"] },
    { label: "default-fall-official-recovery-input-settle", frames: 24, p1: [], p2: [] },
  ]);
}

export function importedDefaultFallOfficialGroundRecoveryScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "imported-default-fall-official-ground-recovery-x", frames: 14, p1: ["x"], p2: [] },
    { label: "default-fall-official-ground-recovery-window", frames: 6, p1: [], p2: [] },
    { label: "default-fall-official-ground-recovery-input", frames: 8, p1: [], p2: ["x", "y"] },
    { label: "default-fall-official-ground-recovery-settle", frames: 72, p1: [], p2: [] },
  ]);
}

export function importedDefaultFallOfficialRecoveryScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "imported-default-fall-official-recovery-x", frames: 14, p1: ["x"], p2: [] },
    { label: "default-fall-official-recovery-chain", frames: 170, p1: [], p2: [] },
  ]);
}

export function importedTargetScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "imported-target-x", frames: 24, p1: ["x"], p2: [] },
    { label: "target-settle", frames: 4, p1: [], p2: [] },
  ]);
}

export function importedSuperPauseScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "imported-superpause-x", frames: 8, p1: ["x"], p2: [] },
    { label: "superpause-settle", frames: 3, p1: [], p2: [] },
  ]);
}

export function importedSuperPauseProjectileScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "imported-superpause-projectile-x", frames: 8, p1: ["x"], p2: [] },
    { label: "superpause-projectile-settle", frames: 3, p1: [], p2: [] },
  ]);
}

export function importedProjectileScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "imported-projectile-x", frames: 12, p1: ["x"], p2: [] },
    { label: "projectile-settle", frames: 2, p1: [], p2: [] },
  ]);
}

export function importedProjectileGuardScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "imported-projectile-guard-x", frames: 12, p1: ["x"], p2: ["B"] },
    { label: "projectile-guard-settle", frames: 2, p1: [], p2: ["B"] },
  ]);
}

export function importedProjectileClashScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "imported-projectile-clash-x", frames: 12, p1: ["x"], p2: ["x"] },
    { label: "projectile-clash-settle", frames: 2, p1: [], p2: [] },
  ]);
}

export function importedHelperScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "imported-helper-x", frames: 8, p1: ["x"], p2: [] },
    { label: "helper-settle", frames: 2, p1: [], p2: [] },
  ]);
}

export function importedExplodScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "imported-explod-x", frames: 8, p1: ["x"], p2: [] },
    { label: "explod-settle", frames: 2, p1: [], p2: [] },
  ]);
}

export function importedGuardScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "imported-guard-x", frames: 14, p1: ["x"], p2: ["B"] },
    { label: "guard-settle", frames: 4, p1: [], p2: ["B"] },
  ]);
}

export function importedDefaultGuardStateScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "imported-default-guard-state-x", frames: 14, p1: ["x"], p2: ["B"] },
    { label: "default-guard-state-settle", frames: 36, p1: [], p2: ["B"] },
  ]);
}

export function importedDefaultCrouchGuardStateScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "imported-default-crouch-guard-state-x", frames: 14, p1: ["x"], p2: ["B", "D"] },
    { label: "default-crouch-guard-state-settle", frames: 36, p1: [], p2: ["B", "D"] },
  ]);
}

export function importedInGuardDistScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "imported-inguarddist-near-x", frames: 8, p1: ["x"], p2: [] },
    { label: "imported-inguarddist-hold", frames: 2, p1: [], p2: [] },
  ]);
}

export function importedAutoGuardStartScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([{ label: "imported-auto-guard-start-x", frames: 4, p1: ["x"], p2: ["B"] }]);
}

export function importedAutoGuardEndScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "imported-auto-guard-end-start", frames: 4, p1: ["x"], p2: ["B"] },
    { label: "imported-auto-guard-end-release", frames: 8, p1: [], p2: [] },
  ]);
}

export function qcfXScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "qcf-d", frames: 2, p1: ["D"], p2: [] },
    { label: "qcf-df", frames: 2, p1: ["D", "F"], p2: [] },
    { label: "qcf-f", frames: 2, p1: ["F"], p2: [] },
    { label: "qcf-x", frames: 1, p1: ["x"], p2: [] },
    { label: "settle", frames: 2, p1: [], p2: [] },
  ]);
}

export type SyntheticImportedTraceFighterOptions = {
  id?: string;
  displayName?: string;
  hitDefAttr?: string;
  passiveNotHitBy?: string;
  passiveHitBy?: string;
  guardDamage?: number;
  guardFlag?: string;
  guardDistance?: number;
  guardSlideTime?: number;
  guardControlTime?: number;
  groundVelocity?: [number, number?];
  fall?: DemoMove["fall"];
  getHitState?: { stateNo: number; animNo?: number };
  defaultGetHitState?: { stateNo: number; animNo?: number };
  defaultGetHitProgression?: { shakeStateNo?: number; slideStateNo?: number; shakeAnimNo?: number; slideAnimNo?: number };
  defaultGuardHit?: {
    shakeStateNo?: number;
    slideStateNo?: number;
    crouchShakeStateNo?: number;
    crouchSlideStateNo?: number;
    guardStateNo?: number;
    shakeAnimNo?: number;
    guardAnimNo?: number;
  };
  defaultGetHitFall?: {
    shakeStateNo?: number;
    slideStateNo?: number;
    airStateNo?: number;
    fallStateNo?: number;
    groundStateNo?: number;
    bounceStateNo?: number;
    liedownStateNo?: number;
    recoverStateNo?: number;
    recoveryInputStateNo?: number;
    groundRecoveryStateNo?: number;
    groundRecoveryLandStateNo?: number;
    landStateNo?: number;
    shakeAnimNo?: number;
    slideAnimNo?: number;
    airAnimNo?: number;
    fallAnimNo?: number;
    groundAnimNo?: number;
    bounceAnimNo?: number;
    liedownAnimNo?: number;
    recoverAnimNo?: number;
    recoveryInputAnimNo?: number;
    groundRecoveryAnimNo?: number;
    groundRecoveryLandAnimNo?: number;
    landAnimNo?: number;
    includeRecoveryChain?: boolean;
    includeRecoveryInput?: boolean;
    includeGroundRecovery?: boolean;
  };
  withTargetControllers?: boolean;
  withTargetDrop?: boolean;
  withSuperPause?: boolean;
  withProjectile?: boolean;
  projectilePriority?: number;
  projectileOffset?: [number, number];
  withHelper?: boolean;
  withExplod?: boolean;
  withInGuardDistGuardStart?: boolean;
  withAutoGuardStartStates?: boolean;
  assertSpecialFlags?: string[];
};

export function createSyntheticImportedTraceFighter(options: SyntheticImportedTraceFighterOptions = {}): DemoFighterDefinition {
  const hitDefAttr = options.hitDefAttr ?? "S,NA";
  const damageLine = options.guardDamage === undefined ? "37" : `37,${options.guardDamage}`;
  const groundVelocity = options.groundVelocity ?? [-3];
  const guardLine =
    options.guardDamage === undefined &&
    options.guardFlag === undefined &&
    options.guardSlideTime === undefined &&
    options.guardControlTime === undefined
      ? ""
      : `
guardflag = ${options.guardFlag ?? "MA"}
guard.pausetime = 4,4
guard.hittime = 9
${options.guardSlideTime === undefined ? "" : `guard.slidetime = ${options.guardSlideTime}`}
${options.guardControlTime === undefined ? "" : `guard.ctrltime = ${options.guardControlTime}`}
guard.velocity = -2
`;
  const guardDistanceLine = options.guardDistance === undefined ? "" : `guard.dist = ${options.guardDistance}`;
  const fallLine = options.fall ? fallHitDefBlock(options.fall) : "";
  const getHitStateLine = options.getHitState
    ? `
p2stateno = ${options.getHitState.stateNo}
p2getp1state = 1
`
    : "";
  const assertSpecialLine = options.assertSpecialFlags?.length
    ? `
[State 200, Assert Runtime Guard Flags]
type = AssertSpecial
trigger1 = Time >= 0
flag = ${options.assertSpecialFlags.join(", ")}
`
    : "";
  const commands = parseCmd(`
[Command]
name = "x"
command = x
time = 5

[Command]
name = "holdback"
command = /$B
time = 1

[Command]
name = "holddown"
command = /$D
time = 1

[Command]
name = "recovery"
command = x+y
time = 5
`).commands;
  const stateEntryControllers = parseCns(`
[State -1, Stand Light Punch]
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
${options.withInGuardDistGuardStart ? inGuardDistGuardStartControllerBlock() : ""}
${options.passiveNotHitBy ? passiveHitByController("NotHitBy", "Reject Attrs", options.passiveNotHitBy) : ""}
${options.passiveHitBy ? passiveHitByController("HitBy", "Allow Attrs", options.passiveHitBy) : ""}

[Statedef 200]
type = S
movetype = A
physics = S
anim = 200
ctrl = 0

${assertSpecialLine}
[State 200, HitDef]
type = HitDef
trigger1 = Time = 1
attr = ${hitDefAttr}
damage = ${damageLine}
pausetime = 4,4
ground.hittime = 9
ground.velocity = ${groundVelocity.join(",")}
id = 77
${guardLine}
${guardDistanceLine}
${fallLine}
${getHitStateLine}
${options.withTargetControllers ? targetControllerBlock(77) : ""}
${options.withTargetDrop ? targetDropBlock(77) : ""}
${options.withSuperPause ? superPauseControllerBlock() : ""}
${options.withProjectile ? projectileControllerBlock(options.projectilePriority, options.projectileOffset) : ""}
${options.withHelper ? helperControllerBlock() : ""}
${options.withExplod ? explodControllerBlock() : ""}

${options.getHitState ? getHitStateBlock(options.getHitState) : ""}
${options.defaultGetHitState ? getHitStateBlock(options.defaultGetHitState) : ""}
${options.defaultGetHitProgression ? defaultGetHitProgressionBlock(options.defaultGetHitProgression) : ""}
${options.defaultGuardHit ? defaultGuardHitBlock(options.defaultGuardHit) : ""}
${options.withInGuardDistGuardStart ? inGuardDistGuardStartStateBlock() : ""}
${options.withAutoGuardStartStates ? autoGuardStartStateBlock() : ""}
${options.defaultGetHitFall ? defaultGetHitFallBlock(options.defaultGetHitFall) : ""}
`);
  const move: DemoMove = {
    actionId: 200,
    startup: 1,
    activeStart: 1,
    activeEnd: 4,
    recovery: 18,
    damage: 37,
    attr: hitDefAttr,
    targetId: 77,
    requiresHitDef: true,
    hitPause: 4,
    hitStun: 9,
    push: Math.abs(groundVelocity[0] ?? 3),
    hitVelocityY: groundVelocity[1],
    guardFlag: options.guardFlag,
    guardDistance: options.guardDistance,
    guardDamage: options.guardDamage,
    guardPause: options.guardDamage === undefined && options.guardFlag === undefined ? undefined : 4,
    guardStun: options.guardDamage === undefined && options.guardFlag === undefined ? undefined : 9,
    guardSlideTime: options.guardSlideTime,
    guardControlTime: options.guardControlTime,
    guardPush: options.guardDamage === undefined && options.guardFlag === undefined ? undefined : 2,
    fall: options.fall,
    hitbox: { x1: 12, y1: -70, x2: 76, y2: -35 },
  };

  return {
    id: options.id ?? "synthetic-imported-trace",
    source: "imported",
    displayName: options.displayName ?? "Synthetic Imported Trace",
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
      [0, traceAction(0)],
      [10, traceAction(10)],
      [20, traceAction(20)],
      [40, traceAction(40)],
      [200, traceAction(200)],
      [230, traceAction(230)],
      [500, traceAction(500)],
      ...(options.withInGuardDistGuardStart ? ([[130, traceAction(130)]] as Array<[number, MugenAnimationAction]>) : []),
      ...(options.withAutoGuardStartStates
        ? ([[120, traceAction(120)], [130, traceAction(130)], [140, traceAction(140)]] as Array<[number, MugenAnimationAction]>)
        : []),
      ...(options.withProjectile ? ([[910, projectileTraceAction(910)]] as Array<[number, MugenAnimationAction]>) : []),
      ...(options.withHelper ? ([[920, helperTraceAction(920)]] as Array<[number, MugenAnimationAction]>) : []),
      ...(options.withExplod ? ([[930, explodTraceAction(930)]] as Array<[number, MugenAnimationAction]>) : []),
      ...(options.getHitState?.stateNo === undefined ? [] : ([[options.getHitState.stateNo, traceAction(options.getHitState.animNo ?? options.getHitState.stateNo)]] as Array<[number, MugenAnimationAction]>)),
      ...(options.defaultGetHitState?.stateNo === undefined
        ? []
        : ([[options.defaultGetHitState.stateNo, traceAction(options.defaultGetHitState.animNo ?? options.defaultGetHitState.stateNo)]] as Array<
            [number, MugenAnimationAction]
          >)),
      ...(options.defaultGetHitProgression === undefined
        ? []
        : ([
            [
              options.defaultGetHitProgression.shakeStateNo ?? 5000,
              traceAction(options.defaultGetHitProgression.shakeAnimNo ?? options.defaultGetHitProgression.shakeStateNo ?? 5000),
            ],
            [
              options.defaultGetHitProgression.slideStateNo ?? 5001,
              traceAction(options.defaultGetHitProgression.slideAnimNo ?? options.defaultGetHitProgression.slideStateNo ?? 5001),
            ],
          ] as Array<[number, MugenAnimationAction]>)),
      ...(options.defaultGuardHit === undefined
        ? []
        : ([
            [
              options.defaultGuardHit.shakeAnimNo ?? options.defaultGuardHit.shakeStateNo ?? 150,
              traceAction(options.defaultGuardHit.shakeAnimNo ?? options.defaultGuardHit.shakeStateNo ?? 150),
            ],
            [
              options.defaultGuardHit.guardAnimNo ?? options.defaultGuardHit.guardStateNo ?? 130,
              traceAction(options.defaultGuardHit.guardAnimNo ?? options.defaultGuardHit.guardStateNo ?? 130),
            ],
          ] as Array<[number, MugenAnimationAction]>)),
      ...(options.defaultGetHitFall === undefined
        ? []
        : ([
            [
              options.defaultGetHitFall.shakeStateNo ?? 5000,
              traceAction(options.defaultGetHitFall.shakeAnimNo ?? options.defaultGetHitFall.shakeStateNo ?? 5000),
            ],
            [
              options.defaultGetHitFall.slideStateNo ?? 5001,
              traceAction(options.defaultGetHitFall.slideAnimNo ?? options.defaultGetHitFall.slideStateNo ?? 5001),
            ],
            [
              options.defaultGetHitFall.airStateNo ?? 5030,
              traceAction(options.defaultGetHitFall.airAnimNo ?? options.defaultGetHitFall.airStateNo ?? 5030),
            ],
            [
              options.defaultGetHitFall.fallStateNo ?? 5050,
              traceAction(options.defaultGetHitFall.fallAnimNo ?? options.defaultGetHitFall.fallStateNo ?? 5050),
            ],
            ...(options.defaultGetHitFall.includeRecoveryChain
              ? ([
                  [
                    options.defaultGetHitFall.groundStateNo ?? 5100,
                    traceAction(options.defaultGetHitFall.groundAnimNo ?? options.defaultGetHitFall.groundStateNo ?? 5100),
                  ],
                  [
                    options.defaultGetHitFall.bounceStateNo ?? 5101,
                    traceAction(options.defaultGetHitFall.bounceAnimNo ?? options.defaultGetHitFall.bounceStateNo ?? 5101),
                  ],
                  [
                    options.defaultGetHitFall.liedownStateNo ?? 5110,
                    traceAction(options.defaultGetHitFall.liedownAnimNo ?? options.defaultGetHitFall.liedownStateNo ?? 5110),
                  ],
                  [
                    options.defaultGetHitFall.recoverStateNo ?? 5120,
                    traceAction(options.defaultGetHitFall.recoverAnimNo ?? options.defaultGetHitFall.recoverStateNo ?? 5120),
                  ],
                ] as Array<[number, MugenAnimationAction]>)
              : []),
            ...(options.defaultGetHitFall.includeRecoveryInput
              ? ([[
                  options.defaultGetHitFall.recoveryInputStateNo ?? 5210,
                  traceAction(options.defaultGetHitFall.recoveryInputAnimNo ?? options.defaultGetHitFall.recoveryInputStateNo ?? 5210),
                ]] as Array<[number, MugenAnimationAction]>)
              : []),
            ...(options.defaultGetHitFall.includeGroundRecovery
              ? ([
                  [
                    options.defaultGetHitFall.groundRecoveryStateNo ?? 5200,
                    traceAction(options.defaultGetHitFall.groundRecoveryAnimNo ?? options.defaultGetHitFall.groundRecoveryStateNo ?? 5200),
                  ],
                  [
                    options.defaultGetHitFall.groundRecoveryLandStateNo ?? 5201,
                    traceAction(options.defaultGetHitFall.groundRecoveryLandAnimNo ?? options.defaultGetHitFall.groundRecoveryLandStateNo ?? 5201),
                  ],
                  [
                    options.defaultGetHitFall.landStateNo ?? 52,
                    traceAction(options.defaultGetHitFall.landAnimNo ?? options.defaultGetHitFall.landStateNo ?? 52),
                  ],
                ] as Array<[number, MugenAnimationAction]>)
              : []),
          ] as Array<[number, MugenAnimationAction]>)),
    ]),
    constants: {
      "velocity.air.gethit.groundrecover.x": -0.15,
      "velocity.air.gethit.groundrecover.y": -3.5,
    },
  };
}

function commonGetHitFallData(): NonNullable<DemoMove["fall"]> {
  return {
    enabled: true,
    damage: 70,
    velocity: { x: 3, y: -6 },
    recover: false,
    recoverTime: 30,
    downRecover: true,
    envShake: { time: 15, freq: 178, ampl: 6, phase: 0 },
  };
}

function passiveHitByController(type: "HitBy" | "NotHitBy", name: string, attr: string): string {
  return `
[State 0, ${name}]
type = ${type}
trigger1 = 1
value = ${attr}
time = 12
`;
}

function targetControllerBlock(targetId: number): string {
  return `
[State 200, Target Damage]
type = TargetLifeAdd
trigger1 = Time = 2
id = ${targetId}
value = -20

[State 200, Target Meter]
type = TargetPowerAdd
trigger1 = Time = 2
id = ${targetId}
value = 40

[State 200, Target Velocity Set]
type = TargetVelSet
trigger1 = Time = 2
id = ${targetId}
x = 3
y = -4

[State 200, Target Velocity Add]
type = TargetVelAdd
trigger1 = Time = 2
id = ${targetId}
x = 2
y = 1

[State 200, Target Face]
type = TargetFacing
trigger1 = Time = 2
id = ${targetId}
value = 1

[State 200, Target Bind]
type = TargetBind
trigger1 = Time = 2
id = ${targetId}
pos = 36,-12
time = 4
`;
}

function fallHitDefBlock(fall: NonNullable<DemoMove["fall"]>): string {
  return `
fall = ${fall.enabled ? 1 : 0}
${fall.damage === undefined ? "" : `fall.damage = ${fall.damage}`}
${fall.velocity?.x === undefined ? "" : `fall.xvelocity = ${fall.velocity.x}`}
${fall.velocity?.y === undefined ? "" : `fall.yvelocity = ${fall.velocity.y}`}
${fall.recover === undefined ? "" : `fall.recover = ${fall.recover ? 1 : 0}`}
${fall.recoverTime === undefined ? "" : `fall.recovertime = ${fall.recoverTime}`}
${fall.downRecover === undefined ? "" : `down.recover = ${fall.downRecover ? 1 : 0}`}
${fall.downRecoverTime === undefined ? "" : `down.recovertime = ${fall.downRecoverTime}`}
${fall.envShake?.time === undefined ? "" : `fall.envshake.time = ${fall.envShake.time}`}
${fall.envShake?.freq === undefined ? "" : `fall.envshake.freq = ${fall.envShake.freq}`}
${fall.envShake?.ampl === undefined ? "" : `fall.envshake.ampl = ${fall.envShake.ampl}`}
${fall.envShake?.phase === undefined ? "" : `fall.envshake.phase = ${fall.envShake.phase}`}
`;
}

function getHitStateBlock(state: { stateNo: number; animNo?: number }): string {
  const animNo = state.animNo ?? state.stateNo;
  return `
[Statedef ${state.stateNo}]
type = A
movetype = H
physics = A
anim = ${animNo}
ctrl = 0

[State ${state.stateNo}, Apply Fall Velocity]
type = HitFallVel
trigger1 = Time = 1

[State ${state.stateNo}, Apply Fall Damage]
type = HitFallDamage
trigger1 = Time = 2

[State ${state.stateNo}, Mark Fall Resolved]
type = HitFallSet
trigger1 = Time = 3
value = 0
xvel = 2
yvel = -7

[State ${state.stateNo}, Fall Camera Shake]
type = FallEnvShake
trigger1 = Time = 3
`;
}

function defaultGetHitProgressionBlock(state: {
  shakeStateNo?: number;
  slideStateNo?: number;
  shakeAnimNo?: number;
  slideAnimNo?: number;
}): string {
  const shakeStateNo = state.shakeStateNo ?? 5000;
  const slideStateNo = state.slideStateNo ?? 5001;
  const shakeAnimNo = state.shakeAnimNo ?? shakeStateNo;
  const slideAnimNo = state.slideAnimNo ?? slideStateNo;
  return `
[Statedef ${shakeStateNo}]
type = S
movetype = H
physics = N
anim = ${shakeAnimNo}
ctrl = 0

[State ${shakeStateNo}, Hit Shake Over]
type = ChangeState
trigger1 = HitShakeOver
value = ${slideStateNo}

[Statedef ${slideStateNo}]
type = S
movetype = H
physics = S
anim = ${slideAnimNo}
ctrl = 0

[State ${slideStateNo}, Hit Over]
type = ChangeState
trigger1 = HitOver
value = 0
ctrl = 1
`;
}

function inGuardDistGuardStartControllerBlock(): string {
  return `
[State 0, InGuardDist Guard Start]
type = ChangeState
trigger1 = InGuardDist
value = 130
ctrl = 0
`;
}

function inGuardDistGuardStartStateBlock(): string {
  return `
[Statedef 130]
type = S
movetype = I
physics = S
anim = 130
ctrl = 0

[State 130, Guard Anim]
type = ChangeAnim
trigger1 = Anim != 130
value = 130
`;
}

function autoGuardStartStateBlock(): string {
  return `
[Statedef 120]
type = U
physics = U
anim = 120
ctrl = 0

[State 120, Guard Start Done]
type = ChangeState
trigger1 = Time >= 1
value = 130

[Statedef 130]
type = S
movetype = I
physics = S
anim = 130
ctrl = 0

[State 130, Stop Guarding]
type = ChangeState
trigger1 = command != "holdback"
trigger2 = !InGuardDist
value = 140

[Statedef 140]
type = S
movetype = I
physics = S
anim = 140
ctrl = 1

[State 140, Return]
type = ChangeState
trigger1 = Time >= 1
value = 0
ctrl = 1
`;
}

function defaultGuardHitBlock(state: {
  shakeStateNo?: number;
  slideStateNo?: number;
  crouchShakeStateNo?: number;
  crouchSlideStateNo?: number;
  guardStateNo?: number;
  shakeAnimNo?: number;
  guardAnimNo?: number;
}): string {
  const shakeStateNo = state.shakeStateNo ?? 150;
  const slideStateNo = state.slideStateNo ?? 151;
  const crouchShakeStateNo = state.crouchShakeStateNo ?? 152;
  const crouchSlideStateNo = state.crouchSlideStateNo ?? 153;
  const guardStateNo = state.guardStateNo ?? 130;
  const shakeAnimNo = state.shakeAnimNo ?? shakeStateNo;
  const guardAnimNo = state.guardAnimNo ?? guardStateNo;
  const crouchBranchExpression = `${slideStateNo} + ${crouchSlideStateNo - slideStateNo}*(command = "holddown")`;
  return `
[Statedef ${shakeStateNo}]
type = S
movetype = H
physics = N
velset = 0,0
ctrl = 0

[State ${shakeStateNo}, Guard Shake Anim]
type = ChangeAnim
trigger1 = 1
value = ${shakeAnimNo}

[State ${shakeStateNo}, Guard Shake Over]
type = ChangeState
trigger1 = HitShakeOver
value = ${crouchBranchExpression}

[Statedef ${crouchShakeStateNo}]
type = C
movetype = H
physics = N
velset = 0,0
ctrl = 0

[State ${crouchShakeStateNo}, Guard Shake Anim]
type = ChangeAnim
trigger1 = 1
value = ${shakeAnimNo}

[State ${crouchShakeStateNo}, Guard Shake Over]
type = ChangeState
trigger1 = HitShakeOver
value = ${crouchBranchExpression}

[Statedef ${slideStateNo}]
type = S
movetype = H
physics = S
anim = ${shakeAnimNo}
ctrl = 0

[State ${slideStateNo}, Apply Guard Velocity]
type = HitVelSet
trigger1 = Time = 0
x = 1

[State ${slideStateNo}, Stop Guard Slide]
type = VelSet
trigger1 = Time = GetHitVar(slidetime)
trigger2 = HitOver
x = 0

[State ${slideStateNo}, Regain Guard Control]
type = CtrlSet
trigger1 = Time = GetHitVar(ctrltime)
value = 1

[State ${slideStateNo}, Guard Hit Over]
type = ChangeState
trigger1 = HitOver
value = ${guardStateNo}
ctrl = 1

[Statedef ${crouchSlideStateNo}]
type = C
movetype = H
physics = C
anim = ${shakeAnimNo}
ctrl = 0

[State ${crouchSlideStateNo}, Apply Crouch Guard Velocity]
type = HitVelSet
trigger1 = Time = 0
x = 1

[State ${crouchSlideStateNo}, Stop Crouch Guard Slide]
type = VelSet
trigger1 = Time = GetHitVar(slidetime)
trigger2 = HitOver
x = 0

[State ${crouchSlideStateNo}, Regain Crouch Guard Control]
type = CtrlSet
trigger1 = Time = GetHitVar(ctrltime)
value = 1

[State ${crouchSlideStateNo}, Crouch Guard Hit Over]
type = ChangeState
trigger1 = HitOver
value = ${guardStateNo}
ctrl = 1

[Statedef ${guardStateNo}]
type = S
movetype = I
physics = S
anim = ${guardAnimNo}
ctrl = 1

[State ${guardStateNo}, Bounded Guard Return]
type = ChangeState
trigger1 = Time >= 2
value = 0
ctrl = 1
`;
}

function defaultGetHitFallBlock(state: {
  shakeStateNo?: number;
  slideStateNo?: number;
  airStateNo?: number;
  fallStateNo?: number;
  groundStateNo?: number;
  bounceStateNo?: number;
  liedownStateNo?: number;
  recoverStateNo?: number;
  recoveryInputStateNo?: number;
  groundRecoveryStateNo?: number;
  groundRecoveryLandStateNo?: number;
  landStateNo?: number;
  shakeAnimNo?: number;
  slideAnimNo?: number;
  airAnimNo?: number;
  fallAnimNo?: number;
  groundAnimNo?: number;
  bounceAnimNo?: number;
  liedownAnimNo?: number;
  recoverAnimNo?: number;
  recoveryInputAnimNo?: number;
  groundRecoveryAnimNo?: number;
  groundRecoveryLandAnimNo?: number;
  landAnimNo?: number;
  includeRecoveryChain?: boolean;
  includeRecoveryInput?: boolean;
  includeGroundRecovery?: boolean;
}): string {
  const shakeStateNo = state.shakeStateNo ?? 5000;
  const slideStateNo = state.slideStateNo ?? 5001;
  const airStateNo = state.airStateNo ?? 5030;
  const fallStateNo = state.fallStateNo ?? 5050;
  const groundStateNo = state.groundStateNo ?? 5100;
  const bounceStateNo = state.bounceStateNo ?? 5101;
  const liedownStateNo = state.liedownStateNo ?? 5110;
  const recoverStateNo = state.recoverStateNo ?? 5120;
  const recoveryInputStateNo = state.recoveryInputStateNo ?? 5210;
  const groundRecoveryStateNo = state.groundRecoveryStateNo ?? 5200;
  const groundRecoveryLandStateNo = state.groundRecoveryLandStateNo ?? 5201;
  const landStateNo = state.landStateNo ?? 52;
  const shakeAnimNo = state.shakeAnimNo ?? shakeStateNo;
  const slideAnimNo = state.slideAnimNo ?? slideStateNo;
  const airAnimNo = state.airAnimNo ?? airStateNo;
  const fallAnimNo = state.fallAnimNo ?? fallStateNo;
  const groundAnimNo = state.groundAnimNo ?? groundStateNo;
  const bounceAnimNo = state.bounceAnimNo ?? bounceStateNo;
  const liedownAnimNo = state.liedownAnimNo ?? liedownStateNo;
  const recoverAnimNo = state.recoverAnimNo ?? recoverStateNo;
  const recoveryInputAnimNo = state.recoveryInputAnimNo ?? recoveryInputStateNo;
  const groundRecoveryAnimNo = state.groundRecoveryAnimNo ?? groundRecoveryStateNo;
  const groundRecoveryLandAnimNo = state.groundRecoveryLandAnimNo ?? groundRecoveryLandStateNo;
  const landAnimNo = state.landAnimNo ?? 0;
  const settleTarget = state.includeRecoveryChain ? groundStateNo : 0;
  const settleCtrl = state.includeRecoveryChain ? 0 : 1;
  const settleTime = state.includeGroundRecovery ? 60 : 6;
  return `
[Statedef ${shakeStateNo}]
type = S
movetype = H
physics = N
anim = ${shakeAnimNo}
ctrl = 0

[State ${shakeStateNo}, Stand Hit Shake Over]
type = ChangeState
trigger1 = HitShakeOver
trigger1 = GetHitVar(yvel) = 0 && !GetHitVar(fall)
value = ${slideStateNo}

[State ${shakeStateNo}, Fall Hit Shake Over]
type = ChangeState
trigger1 = HitShakeOver
value = ${airStateNo}

[Statedef ${slideStateNo}]
type = S
movetype = H
physics = S
anim = ${slideAnimNo}
ctrl = 0

[State ${slideStateNo}, Hit Over]
type = ChangeState
trigger1 = HitOver
value = 0
ctrl = 1

[Statedef ${airStateNo}]
type = A
movetype = H
physics = N
anim = ${airAnimNo}
ctrl = 0

[State ${airStateNo}, Apply Hit Velocity]
type = HitVelSet
trigger1 = Time = 1
x = 1
y = 1

[State ${airStateNo}, Gravity]
type = VelAdd
trigger1 = 1
y = GetHitVar(yaccel)

[State ${airStateNo}, Fall]
type = ChangeState
triggerall = HitFall
trigger1 = HitOver
value = ${fallStateNo}

[Statedef ${fallStateNo}]
type = A
movetype = H
physics = N
anim = ${fallAnimNo}
ctrl = 0

[State ${fallStateNo}, Gravity]
type = VelAdd
trigger1 = 1
y = GetHitVar(yaccel)

${state.includeGroundRecovery ? `[State ${fallStateNo}, Ground Recovery Input]
type = ChangeState
triggerall = Vel Y > 0
triggerall = Pos Y >= Const(movement.air.gethit.groundrecover.ground.threshold)
triggerall = Alive
triggerall = CanRecover
trigger1 = Command = "recovery"
value = ${groundRecoveryStateNo}
` : ""}
[State ${fallStateNo}, Recovery Input]
type = ChangeState
triggerall = CanRecover
trigger1 = Command = "recovery"
value = ${recoveryInputStateNo}

[State ${fallStateNo}, Bounded Settle]
type = ChangeState
trigger1 = Time = ${settleTime}
value = ${settleTarget}
ctrl = ${settleCtrl}
${state.includeRecoveryChain ? defaultFallRecoveryChainBlock({ groundStateNo, bounceStateNo, liedownStateNo, recoverStateNo, groundAnimNo, bounceAnimNo, liedownAnimNo, recoverAnimNo }) : ""}
${state.includeRecoveryInput ? defaultFallRecoveryInputBlock({ recoveryInputStateNo, recoveryInputAnimNo }) : ""}
${state.includeGroundRecovery ? defaultGroundRecoveryInputBlock({ groundRecoveryStateNo, groundRecoveryLandStateNo, landStateNo, groundRecoveryAnimNo, groundRecoveryLandAnimNo, landAnimNo }) : ""}
`;
}

function defaultGroundRecoveryInputBlock(state: {
  groundRecoveryStateNo: number;
  groundRecoveryLandStateNo: number;
  landStateNo: number;
  groundRecoveryAnimNo: number;
  groundRecoveryLandAnimNo: number;
  landAnimNo: number;
}): string {
  return `
[Statedef ${state.groundRecoveryStateNo}]
type = A
movetype = H
physics = N
anim = ${state.groundRecoveryAnimNo}
ctrl = 0

[State ${state.groundRecoveryStateNo}, Gravity]
type = VelAdd
trigger1 = 1
y = GetHitVar(yaccel)

[State ${state.groundRecoveryStateNo}, Self Land]
type = SelfState
trigger1 = Vel Y > 0
trigger1 = Pos Y >= Const(movement.air.gethit.groundrecover.groundlevel)
value = ${state.groundRecoveryLandStateNo}

[Statedef ${state.groundRecoveryLandStateNo}]
type = A
movetype = H
physics = A
anim = ${state.groundRecoveryLandAnimNo}
ctrl = 0

[State ${state.groundRecoveryLandStateNo}, Ground Recovery Velocity]
type = VelSet
trigger1 = Time = 0
x = Const(velocity.air.gethit.groundrecover.x)
y = Const(velocity.air.gethit.groundrecover.y)

[State ${state.groundRecoveryLandStateNo}, Ground Recovery Position]
type = PosSet
trigger1 = Time = 0
y = 0

[State ${state.groundRecoveryLandStateNo}, Safe Recovery]
type = NotHitBy
trigger1 = 1
value = SCA
time = 1

[Statedef ${state.landStateNo}]
type = S
movetype = I
physics = S
anim = ${state.landAnimNo}
ctrl = 0

[State ${state.landStateNo}, Land Velocity]
type = VelSet
trigger1 = Time = 0
y = 0

[State ${state.landStateNo}, Land Position]
type = PosSet
trigger1 = Time = 0
y = 0

[State ${state.landStateNo}, Land Ctrl]
type = CtrlSet
trigger1 = Time = 3
value = 1

[State ${state.landStateNo}, Stand]
type = ChangeState
trigger1 = Time = 5
value = 0
ctrl = 1
`;
}

function defaultFallRecoveryInputBlock(state: {
  recoveryInputStateNo: number;
  recoveryInputAnimNo: number;
}): string {
  return `
[Statedef ${state.recoveryInputStateNo}]
type = A
movetype = I
physics = N
anim = ${state.recoveryInputAnimNo}
ctrl = 0

[State ${state.recoveryInputStateNo}, Air Recovery Velocity]
type = VelSet
trigger1 = Time = 1
x = 0
y = -2

[State ${state.recoveryInputStateNo}, Fall Recovery Settled]
type = HitFallSet
trigger1 = Time = 2
value = 1

[State ${state.recoveryInputStateNo}, Stand]
type = ChangeState
trigger1 = Time = 3
value = 0
ctrl = 1
`;
}

function defaultFallRecoveryChainBlock(state: {
  groundStateNo: number;
  bounceStateNo: number;
  liedownStateNo: number;
  recoverStateNo: number;
  groundAnimNo: number;
  bounceAnimNo: number;
  liedownAnimNo: number;
  recoverAnimNo: number;
}): string {
  return `
[Statedef ${state.groundStateNo}]
type = L
movetype = H
physics = N
anim = ${state.groundAnimNo}
ctrl = 0

[State ${state.groundStateNo}, Ground Impact Damage]
type = HitFallDamage
trigger1 = Time = 1

[State ${state.groundStateNo}, Bounce]
type = ChangeState
trigger1 = Time = 3
value = ${state.bounceStateNo}

[Statedef ${state.bounceStateNo}]
type = L
movetype = H
physics = N
anim = ${state.bounceAnimNo}
ctrl = 0

[State ${state.bounceStateNo}, Bounce Velocity]
type = HitFallVel
trigger1 = Time = 1

[State ${state.bounceStateNo}, Gravity]
type = VelAdd
trigger1 = 1
y = GetHitVar(yaccel)

[State ${state.bounceStateNo}, Lie Down]
type = ChangeState
trigger1 = Time = 5
value = ${state.liedownStateNo}

[Statedef ${state.liedownStateNo}]
type = L
movetype = H
physics = N
anim = ${state.liedownAnimNo}
ctrl = 0

[State ${state.liedownStateNo}, Fall Damage Settled]
type = HitFallDamage
trigger1 = Time = 1

[State ${state.liedownStateNo}, Get Up]
type = ChangeState
trigger1 = Time = 6
value = ${state.recoverStateNo}

[Statedef ${state.recoverStateNo}]
type = L
movetype = I
physics = N
anim = ${state.recoverAnimNo}
ctrl = 0

[State ${state.recoverStateNo}, Clear Velocity]
type = VelSet
trigger1 = Time = 1
x = 0
y = 0

[State ${state.recoverStateNo}, Fall Recovery Settled]
type = HitFallSet
trigger1 = Time = 4
value = 1

[State ${state.recoverStateNo}, Stand]
type = ChangeState
trigger1 = Time = 4
value = 0
ctrl = 1
`;
}

function targetDropBlock(targetId: number): string {
  return `
[State 200, Target Drop]
type = TargetDrop
trigger1 = Time = 3
id = ${targetId}
keepone = 0
`;
}

function superPauseControllerBlock(): string {
  return `
[State 200, Super Pause]
type = SuperPause
trigger1 = Time = 2
time = 7
movetime = 1
darken = 1
poweradd = 100
`;
}

function projectileControllerBlock(priority = 1, offset: [number, number] = [62, -45]): string {
  return `
[State 200, Fast Projectile]
type = Projectile
trigger1 = Time = 2
projid = 77
projpriority = ${priority}
projanim = 910
offset = ${offset[0]},${offset[1]}
velocity = 36,0
projremovetime = 24
damage = 31,4
pausetime = 4,4
ground.hittime = 13
ground.velocity = -5
guardflag = MA
guard.pausetime = 3,3
guard.hittime = 8
guard.velocity = -2
guard.dist = 120
sprpriority = 7
`;
}

function helperControllerBlock(): string {
  return `
[State 200, Visual Helper]
type = Helper
trigger1 = Time = 2
id = 42
name = "Buddy"
stateno = 1200
anim = 920
pos = -44,-28
postype = p1
facing = 1
sprpriority = 8
removetime = 30
`;
}

function explodControllerBlock(): string {
  return `
[State 200, Visual Explod]
type = Explod
trigger1 = Time = 2
id = 9000
anim = 930
pos = 42,-58
postype = p1
facing = 1
sprpriority = 6
removetime = 30
trans = add
`;
}

function projectileTraceAction(id: number): MugenAnimationAction {
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
        clsn1: [{ x1: 6, y1: -18, x2: 34, y2: 6 }],
        clsn2: [{ x1: -8, y1: -24, x2: 36, y2: 8 }],
        raw: `${id},0,0,0,4`,
        line: 1,
      },
    ],
  };
}

function explodTraceAction(id: number): MugenAnimationAction {
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
        clsn1: [],
        clsn2: [{ x1: -20, y1: -52, x2: 20, y2: -12 }],
        raw: `${id},0,0,0,4`,
        line: 1,
      },
    ],
  };
}

function helperTraceAction(id: number): MugenAnimationAction {
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
        clsn1: [{ x1: 10, y1: -45, x2: 36, y2: -18 }],
        clsn2: [{ x1: -18, y1: -64, x2: 18, y2: 0 }],
        raw: `${id},0,0,0,4`,
        line: 1,
      },
    ],
  };
}

function traceAction(id: number): MugenAnimationAction {
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

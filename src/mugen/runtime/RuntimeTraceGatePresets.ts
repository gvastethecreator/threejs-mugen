import type { MugenAnimationAction } from "../model/MugenAnimation";
import type { MugenStageDefinition } from "../model/MugenStage";
import { parseCmd } from "../parsers/CmdParser";
import { parseCns } from "../parsers/CnsParser";
import { demoFighters, type DemoFighterDefinition, type DemoMove } from "./demoFighters";
import { MatchWorld } from "./MatchWorld";
import type {
  RuntimeTraceActorFrameRequirement,
  RuntimeTraceControllerEventSequenceRequirement,
  RuntimeTraceFinalActorRequirement,
  RuntimeTraceGate,
  RuntimeTraceInputFrame,
} from "./RuntimeTrace";
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
  return createImportedXTraceArtifact(createSyntheticImportedTraceFighter({ moveHitStateNo: 261 }), {
    ...options,
    targetId: "synthetic-imported-x-golden",
    targetLabel: "Synthetic imported CMD/CNS x route",
    requireHitEvent: true,
    requiredExecutedStates: [200, 261],
    notes: [
      "Synthetic imported golden trace proves CMD State -1 routing, CNS state execution, HitDef execution, active command evidence, hit event evidence, and a bounded MoveHit branch back in the owner state without depending on private external fixtures.",
    ],
  });
}

export function createSyntheticImportedMoveContactTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  return createImportedXTraceArtifact(
    createSyntheticImportedTraceFighter({
      id: "synthetic-imported-movecontact",
      displayName: "Synthetic Imported MoveContact",
      moveContactStateNo: 262,
    }),
    {
      ...options,
      targetId: "synthetic-imported-movecontact-golden",
      targetLabel: "Synthetic imported MoveContact route",
      requireHitEvent: true,
      requiredExecutedStates: [200, 262],
      notes: [
        "Synthetic imported MoveContact trace proves a direct HitDef contact can evaluate a bounded MoveContact branch back in the owner state without depending on private external fixtures. Exact first-tick timing and trigger lifetime remain future work.",
      ],
    },
  );
}

export function createSyntheticImportedMoveHitCounterTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  return createImportedXTraceArtifact(
    createSyntheticImportedTraceFighter({
      id: "synthetic-imported-movehit-counter",
      displayName: "Synthetic Imported MoveHit Counter",
      moveHitCounterStateNo: 263,
    }),
    {
      ...options,
      targetId: "synthetic-imported-movehit-counter-golden",
      targetLabel: "Synthetic imported MoveHit counter route",
      requireHitEvent: true,
      requiredExecutedStates: [200, 263],
      notes: [
        "Synthetic imported MoveHit counter trace proves direct HitDef contact can evaluate MoveHit as a bounded state-local frame counter through MoveHit >= 1. Exact first-tick timing and lifetime parity remain future work.",
      ],
    },
  );
}

export function createSyntheticImportedMoveHitResetTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  return createImportedXTraceArtifact(
    createSyntheticImportedTraceFighter({
      id: "synthetic-imported-movehitreset",
      displayName: "Synthetic Imported MoveHitReset",
      action200Duration: 30,
      withMoveHitReset: true,
      moveHitCounterStateNo: 263,
    }),
    {
      ...options,
      targetId: "synthetic-imported-movehitreset-golden",
      targetLabel: "Synthetic imported MoveHitReset route",
      requireHitEvent: true,
      requiredExecutedStates: [200],
      requiredExecutedControllers: ["ChangeState", "HitDef", "MoveHitReset"],
      requiredExecutedOperations: ["hitdef", "contact:movehitreset"],
      requiredFinalActors: [{ actorId: "p1", source: "imported", actorKind: "player", stateNo: 200, animNo: 200 }],
      notes: [
        "Synthetic imported MoveHitReset trace proves a direct HitDef contact can be cleared before a later MoveHit >= 1 branch fires in the same owner state. Exact first-tick timing, hitpause accounting, helper/redirect/team ownership, and full MUGEN/IKEMEN contact-memory parity remain future work.",
      ],
    },
  );
}

export function createSyntheticImportedHitCountTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  return createImportedXTraceArtifact(
    createSyntheticImportedTraceFighter({
      id: "synthetic-imported-hitcount",
      displayName: "Synthetic Imported HitCount",
      hitCountStateNo: 264,
    }),
    {
      ...options,
      targetId: "synthetic-imported-hitcount-golden",
      targetLabel: "Synthetic imported HitCount route",
      requireHitEvent: true,
      requiredExecutedStates: [200, 264],
      notes: [
        "Synthetic imported HitCount trace proves direct HitDef contact can evaluate bounded HitCount and UniqHitCount branches for the current two-actor owner state. Multi-target, helper-owned, and exact combo-count parity remain future work.",
      ],
    },
  );
}

export function createSyntheticImportedHitAddTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  return createImportedXTraceArtifact(
    createSyntheticImportedTraceFighter({
      id: "synthetic-imported-hitadd",
      displayName: "Synthetic Imported HitAdd",
      withHitAdd: 2,
      hitAddStateNo: 265,
    }),
    {
      ...options,
      targetId: "synthetic-imported-hitadd-golden",
      targetLabel: "Synthetic imported HitAdd route",
      requireHitEvent: true,
      requiredExecutedStates: [200, 265],
      requiredExecutedControllers: ["ChangeState", "HitDef", "HitAdd"],
      requiredExecutedOperations: ["hitdef", "contact:hitadd"],
      notes: [
        "Synthetic imported HitAdd trace proves static HitAdd can add bounded current-state direct HitCount after HitDef contact without changing UniqHitCount. Combo lifetime, helper/projectile/guard counts, redirects, teams, and exact parity remain future work.",
      ],
    },
  );
}

export function createSyntheticImportedVariableTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  return createImportedXTraceArtifact(
    createSyntheticImportedTraceFighter({
      id: "synthetic-imported-variable",
      displayName: "Synthetic Imported Variable Ops",
      action200Duration: 30,
      withVariableOps: { stateNo: 288 },
    }),
    {
      ...options,
      targetId: "synthetic-imported-variable-golden",
      targetLabel: "Synthetic imported variable controller route",
      requireHitEvent: true,
      requiredExecutedStates: [200, 288],
      requiredExecutedControllers: ["ChangeState", "HitDef", "VarSet", "VarAdd", "VarRangeSet"],
      requiredExecutedOperations: ["hitdef", "variable:varset", "variable:varadd", "variable:varrangeset"],
      requiredFinalActors: [{ actorId: "p1", source: "imported", actorKind: "player", stateNo: 288, animNo: 288 }],
      notes: [
        "Synthetic imported variable trace proves static VarSet, VarAdd, and VarRangeSet can execute as typed variable operations and drive a later var(...) ChangeState branch in the owner state. Dynamic variable expressions, helper/redirect variable scopes, sysvar/fvar parity, map vars, and exact MUGEN/IKEMEN VM semantics remain future work.",
      ],
    },
  );
}

export function createSyntheticImportedResourceTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  return createImportedXTraceArtifact(
    createSyntheticImportedTraceFighter({
      id: "synthetic-imported-resource",
      displayName: "Synthetic Imported Resource Ops",
      action200Duration: 30,
      withResourceOps: { stateNo: 289 },
    }),
    {
      ...options,
      targetId: "synthetic-imported-resource-golden",
      targetLabel: "Synthetic imported resource controller route",
      requireHitEvent: true,
      requiredExecutedStates: [200, 289],
      requiredExecutedControllers: ["ChangeState", "HitDef", "LifeAdd", "LifeSet", "PowerAdd", "PowerSet"],
      requiredExecutedOperations: ["hitdef", "resource:lifeadd", "resource:lifeset", "resource:poweradd", "resource:powerset"],
      requiredFinalActors: [
        { actorId: "p1", source: "imported", actorKind: "player", stateNo: 289, animNo: 289, life: 750, power: 900 },
      ],
      notes: [
        "Synthetic imported resource trace proves static LifeAdd, LifeSet, PowerAdd, and PowerSet can execute as typed resource operations and drive a later Life/Power ChangeState branch in the owner state. Scaling, redirects, round/KO flow, helpers, teams, and exact MUGEN/IKEMEN resource semantics remain future work.",
      ],
    },
  );
}

export function createSyntheticImportedControlTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  return createImportedXTraceArtifact(
    createSyntheticImportedTraceFighter({
      id: "synthetic-imported-control",
      displayName: "Synthetic Imported Control Ops",
      action200Duration: 30,
      withControlOps: true,
    }),
    {
      ...options,
      script: importedOneShotXScript(),
      targetId: "synthetic-imported-control-golden",
      targetLabel: "Synthetic imported CtrlSet route",
      requireHitEvent: true,
      requiredExecutedStates: [200],
      requiredExecutedControllers: ["ChangeState", "HitDef", { type: "CtrlSet", minCount: 2 }],
      requiredExecutedOperations: ["hitdef", { operation: "resource:ctrlset", minCount: 2 }],
      requiredFinalActors: [{ actorId: "p1", source: "imported", actorKind: "player", stateNo: 200, animNo: 200, ctrl: true }],
      notes: [
        "Synthetic imported control trace proves bounded static CtrlSet can execute as typed resource:ctrlset operation evidence and restore owner control in an imported state. Dynamic expressions, helper/redirect ownership, exact state-entry control timing, and full MUGEN/IKEMEN control semantics remain future work.",
      ],
    },
  );
}

export function createSyntheticImportedAnimationTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  return createImportedXTraceArtifact(
    createSyntheticImportedTraceFighter({
      id: "synthetic-imported-animation",
      displayName: "Synthetic Imported Animation Ops",
      action200Duration: 30,
      withAnimationOps: true,
    }),
    {
      ...options,
      script: importedOneShotXScript(),
      targetId: "synthetic-imported-animation-golden",
      targetLabel: "Synthetic imported ChangeAnim route",
      requiredExecutedStates: [200],
      requiredExecutedControllers: ["ChangeState", "HitDef", "ChangeAnim", "ChangeAnim2"],
      requiredExecutedOperations: ["hitdef"],
      requiredActorFrames: [
        { actorId: "p1", source: "imported", actorKind: "player", animNo: 205, minFrames: 1 },
        { actorId: "p1", source: "imported", actorKind: "player", animNo: 206, minFrames: 1 },
      ],
      requiredFinalActors: [{ actorId: "p1", source: "imported", actorKind: "player", stateNo: 200, animNo: 206 }],
      notes: [
        "Synthetic imported animation trace proves bounded ChangeAnim and ChangeAnim2 can retarget the active AIR action in an imported owner state, with actor-frame and final-animation evidence. Missing-action fallback, elem/elemtime edge cases, redirects, helper/custom-state ownership, multi-import SFF namespaces, and exact MUGEN/IKEMEN animation-source parity remain future work.",
      ],
    },
  );
}

export function createSyntheticImportedSoundTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  return createImportedXTraceArtifact(
    createSyntheticImportedTraceFighter({
      id: "synthetic-imported-sound",
      displayName: "Synthetic Imported Sound Events",
      action200Duration: 30,
      withSoundControllers: true,
    }),
    {
      ...options,
      targetId: "synthetic-imported-sound-golden",
      targetLabel: "Synthetic imported PlaySnd/StopSnd event route",
      requireHitEvent: true,
      requiredExecutedStates: [200],
      requiredExecutedControllers: ["ChangeState", "HitDef", "PlaySnd", "StopSnd"],
      requiredExecutedOperations: ["hitdef"],
      requiredSoundEvents: [
        { actorId: "p1", type: "PlaySnd", group: 5, index: 0, channel: 2, stateNo: 200 },
        { actorId: "p1", type: "StopSnd", channel: 2, stateNo: 200 },
      ],
      notes: [
        "Synthetic imported sound trace proves PlaySnd and StopSnd controllers emit bounded runtime sound events with parsed Sgroup,index/channel telemetry. It does not claim SND decode coverage, Web Audio timing/mixing, loops, pan, volume, priorities, or exact MUGEN/IKEMEN audio parity.",
      ],
    },
  );
}

export function createSyntheticImportedEnvShakeTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  return createImportedXTraceArtifact(
    createSyntheticImportedTraceFighter({
      id: "synthetic-imported-envshake",
      displayName: "Synthetic Imported EnvShake",
      action200Duration: 30,
      withEnvShake: {
        time: 16,
        freq: 30,
        ampl: -7,
        phase: 0.5,
      },
    }),
    {
      ...options,
      targetId: "synthetic-imported-envshake-golden",
      targetLabel: "Synthetic imported EnvShake event route",
      requireHitEvent: true,
      requiredExecutedStates: [200],
      requiredExecutedControllers: ["ChangeState", "EnvShake", "HitDef"],
      requiredExecutedOperations: ["hitdef"],
      requiredEnvShakeEvents: [
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
      ],
      notes: [
        "Synthetic imported EnvShake trace proves EnvShake controllers emit bounded runtime event telemetry for later Three.js camera shake consumption. It does not claim exact MUGEN/IKEMEN camera blend, pause timing, stage binding, helper ownership, or screen-pack parity.",
      ],
    },
  );
}

export function createSyntheticImportedReceivedDamageTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-receiveddamage-attacker",
    displayName: "Synthetic Imported ReceivedDamage Attacker",
  });
  const defender = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-receiveddamage-defender",
    displayName: "Synthetic Imported ReceivedDamage Defender",
    receivedDamageRoute: { sourceStateNo: 5000, finalStateNo: 280 },
  });
  const stage = options.stage ?? closeCombatStage();
  const script = importedXHitstunScript();
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: defender, stage }), script, {
    label: "synthetic-imported-receiveddamage-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-receiveddamage-golden",
      label: "Synthetic imported ReceivedDamage route",
      source: "mixed",
      notes: [
        "Synthetic imported ReceivedDamage trace proves a bounded direct HitDef can mark defender-local received damage and hits after default get-hit state entry, then branch through ReceivedDamage > 0 and ReceivedHits >= 1. Projectile, target-controller, guard-chip, helper, custom-state, and exact timing parity remain future work.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-receiveddamage-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200, 5000, 280],
        requiredExecutedControllers: ["ChangeState", "HitDef"],
        requiredExecutedOperations: ["hitdef"],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["hit"],
        requiredCombatReasons: ["hit"],
        requiredFinalActors: [{ actorId: "p2", source: "imported", actorKind: "player", stateNo: 280 }],
      },
    ],
  });
}

export function createSyntheticImportedHitDefAttrTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  return createImportedXTraceArtifact(
    createSyntheticImportedTraceFighter({
      id: "synthetic-imported-hitdefattr",
      displayName: "Synthetic Imported HitDefAttr",
      hitDefAttr: "S,NA",
      hitDefAttrStateNo: 266,
    }),
    {
      ...options,
      targetId: "synthetic-imported-hitdefattr-golden",
      targetLabel: "Synthetic imported HitDefAttr route",
      requireHitEvent: true,
      requiredExecutedStates: [200, 266],
      notes: [
        "Synthetic imported HitDefAttr trace proves a KFM-style HitDefAttr = SC, NA, SA, HA plus MoveContact branch can evaluate against the current active HitDef attr. Exact cancel timing, helper/projectile attrs, redirects, priority classes, and full MUGEN/IKEMEN attr parity remain future work.",
      ],
    },
  );
}

export function createSyntheticImportedPrevStateTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  return createImportedXTraceArtifact(
    createSyntheticImportedTraceFighter({
      id: "synthetic-imported-prevstateno",
      displayName: "Synthetic Imported PrevStateNo",
      prevStateRoute: { intermediateStateNo: 267, finalStateNo: 268 },
    }),
    {
      ...options,
      targetId: "synthetic-imported-prevstateno-golden",
      targetLabel: "Synthetic imported PrevStateNo route",
      script: importedOneShotXScript(),
      requiredExecutedStates: [200, 267, 268],
      notes: [
        "Synthetic imported PrevStateNo trace proves the runtime records previous state number across ChangeState and can branch from an intermediate state using PrevStateNo = 200. Exact MUGEN/IKEMEN tick-order parity and every state-owner edge case remain future work.",
      ],
    },
  );
}

export function createSyntheticImportedPrevMoveTypeTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  return createImportedXTraceArtifact(
    createSyntheticImportedTraceFighter({
      id: "synthetic-imported-prevmovetype",
      displayName: "Synthetic Imported PrevMoveType",
      prevMoveTypeRoute: { intermediateStateNo: 269, finalStateNo: 270 },
    }),
    {
      ...options,
      targetId: "synthetic-imported-prevmovetype-golden",
      targetLabel: "Synthetic imported PrevMoveType route",
      script: importedOneShotXScript(),
      requiredExecutedStates: [200, 269, 270],
      notes: [
        "Synthetic imported PrevMoveType trace proves the runtime records previous move type across ChangeState and can branch from an intermediate state using PrevMoveType = A. Exact MUGEN/IKEMEN tick-order parity and custom-state ownership edges remain future work.",
      ],
    },
  );
}

export function createSyntheticImportedPrevAnimTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  return createImportedXTraceArtifact(
    createSyntheticImportedTraceFighter({
      id: "synthetic-imported-prevanim",
      displayName: "Synthetic Imported PrevAnim",
      prevAnimRoute: { previousAnimNo: 205, intermediateStateNo: 275, finalStateNo: 276 },
    }),
    {
      ...options,
      targetId: "synthetic-imported-prevanim-golden",
      targetLabel: "Synthetic imported PrevAnim route",
      script: importedOneShotXScript(),
      requiredExecutedStates: [200, 275, 276],
      notes: [
        "Synthetic imported PrevAnim trace proves the runtime records previous animation across ChangeState after a state-local ChangeAnim and can branch from an intermediate state using PrevAnim = 205. Exact MUGEN/IKEMEN tick-order parity and custom-state ownership edges remain future work.",
      ],
    },
  );
}

export function createSyntheticImportedPrevStateTypeTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  return createImportedXTraceArtifact(
    createSyntheticImportedTraceFighter({
      id: "synthetic-imported-prevstatetype",
      displayName: "Synthetic Imported PrevStateType",
      attackStateType: "A",
      prevStateTypeRoute: { intermediateStateNo: 271, finalStateNo: 272 },
    }),
    {
      ...options,
      targetId: "synthetic-imported-prevstatetype-golden",
      targetLabel: "Synthetic imported PrevStateType route",
      script: importedOneShotXScript(),
      requiredExecutedStates: [200, 271, 272],
      notes: [
        "Synthetic imported PrevStateType trace proves the runtime records previous state type across ChangeState and can branch from an intermediate state using PrevStateType = A. Exact MUGEN/IKEMEN tick-order parity and custom-state ownership edges remain future work.",
      ],
    },
  );
}

export function createSyntheticImportedEnemyNearTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  return createImportedXTraceArtifact(
    createSyntheticImportedTraceFighter({
      id: "synthetic-imported-enemynear",
      displayName: "Synthetic Imported EnemyNear",
      enemyNearStateEntry: { opponentStateNo: 0, stateNo: 269 },
    }),
    {
      ...options,
      targetId: "synthetic-imported-enemynear-golden",
      targetLabel: "Synthetic imported EnemyNear redirect route",
      script: importedOneShotXScript(),
      requiredRoutedStates: [269],
      requiredExecutedStates: [269],
      requiredExecutedControllers: ["ChangeState"],
      requiredExecutedOperations: [],
      notes: [
        "Synthetic imported EnemyNear trace proves a bounded EnemyNear, StateNo redirect can evaluate against the current opponent in State -1 routing. EnemyNear(n), helpers, teams, redirects, and full MUGEN/IKEMEN redirect parity remain future work.",
      ],
    },
  );
}

export function createSyntheticImportedP2MetricsTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  return createImportedXTraceArtifact(
    createSyntheticImportedTraceFighter({
      id: "synthetic-imported-p2metrics",
      displayName: "Synthetic Imported P2 Metrics",
      p2MetricsStateEntry: { stateNo: 275 },
    }),
    {
      ...options,
      targetId: "synthetic-imported-p2metrics-golden",
      targetLabel: "Synthetic imported P2 metric trigger route",
      script: importedOneShotXScript(),
      requiredRoutedStates: [275],
      requiredExecutedStates: [275],
      requiredExecutedControllers: ["ChangeState"],
      requiredExecutedOperations: [],
      notes: [
        "Synthetic imported P2 metric trace proves bounded Facing, P2Facing, P2Life, P2Power, and NumEnemy trigger reads against the current two-actor opponent. Teams, helpers, simultaneous target selection, and full MUGEN/IKEMEN opponent-selection parity remain future work.",
      ],
    },
  );
}

export function createSyntheticImportedSelfStateNoExistTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  return createImportedXTraceArtifact(
    createSyntheticImportedTraceFighter({
      id: "synthetic-imported-selfstatenoexist",
      displayName: "Synthetic Imported SelfStateNoExist",
      selfStateNoExistEntry: { existingStateNo: 277, missingStateNo: 9999, stateNo: 277 },
    }),
    {
      ...options,
      targetId: "synthetic-imported-selfstatenoexist-golden",
      targetLabel: "Synthetic imported SelfStateNoExist route",
      script: importedOneShotXScript(),
      requiredRoutedStates: [277],
      requiredExecutedStates: [277],
      requiredExecutedControllers: ["ChangeState"],
      requiredExecutedOperations: [],
      notes: [
        "Synthetic imported SelfStateNoExist trace proves State -1 routing can branch on an existing own state and reject a missing own state in the current imported runtime. Redirect, helper, state-owner, and IKEMEN/MUGEN exact lookup parity remain future work.",
      ],
    },
  );
}

export function createSyntheticImportedSelfCommandTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  return createImportedXTraceArtifact(
    createSyntheticImportedTraceFighter({
      id: "synthetic-imported-selfcommand",
      displayName: "Synthetic Imported SelfCommand",
      selfCommandEntry: { commandName: "x", stateNo: 278 },
    }),
    {
      ...options,
      targetId: "synthetic-imported-selfcommand-golden",
      targetLabel: "Synthetic imported SelfCommand route",
      script: importedOneShotXScript(),
      requiredRoutedStates: [278],
      requiredExecutedStates: [278],
      requiredExecutedControllers: ["ChangeState"],
      requiredExecutedOperations: [],
      notes: [
        "Synthetic imported SelfCommand trace proves State -1 routing can branch on the current owner command buffer through a bounded SelfCommand alias. Helper/team/redirect command ownership and exact IKEMEN/MUGEN command lookup parity remain future work.",
      ],
    },
  );
}

export function createSyntheticImportedStageTimeTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  return createImportedXTraceArtifact(
    createSyntheticImportedTraceFighter({
      id: "synthetic-imported-stagetime",
      displayName: "Synthetic Imported StageTime",
      stageTimeEntry: { minStageTime: 3, stateNo: 279 },
    }),
    {
      ...options,
      targetId: "synthetic-imported-stagetime-golden",
      targetLabel: "Synthetic imported StageTime route",
      script: importedDelayedXScript(),
      requiredRoutedStates: [279],
      requiredExecutedStates: [279],
      requiredExecutedControllers: ["ChangeState"],
      requiredExecutedOperations: [],
      notes: [
        "Synthetic imported StageTime trace proves State -1 routing can branch on the current match tick through a bounded StageTime trigger. It does not claim IKEMEN round system, stage script, pause, replay, rollback, or exact timing parity.",
      ],
    },
  );
}

export function createSyntheticImportedAliveTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  return createImportedXTraceArtifact(
    createSyntheticImportedTraceFighter({
      id: "synthetic-imported-alive",
      displayName: "Synthetic Imported Alive",
      aliveStateEntry: { stateNo: 280 },
    }),
    {
      ...options,
      targetId: "synthetic-imported-alive-golden",
      targetLabel: "Synthetic imported Alive route",
      script: importedOneShotXScript(),
      requiredRoutedStates: [280],
      requiredExecutedStates: [280],
      requiredExecutedControllers: ["ChangeState"],
      requiredExecutedOperations: [],
      notes: [
        "Synthetic imported Alive trace proves State -1 routing can branch on current owner life > 0 through the bounded Alive trigger. KO, round-state transitions, lifebar edge cases, helpers, redirects, and exact IKEMEN/MUGEN round parity remain future work.",
      ],
    },
  );
}

export function createSyntheticImportedRoundTriggerTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  return createImportedXTraceArtifact(
    createSyntheticImportedTraceFighter({
      id: "synthetic-imported-round-trigger",
      displayName: "Synthetic Imported Round Trigger",
      roundStateEntry: { roundNo: 1, roundState: 2, stateNo: 281 },
    }),
    {
      ...options,
      targetId: "synthetic-imported-round-trigger-golden",
      targetLabel: "Synthetic imported RoundNo/RoundState route",
      script: importedOneShotXScript(),
      requiredRoutedStates: [281],
      requiredExecutedStates: [281],
      requiredExecutedControllers: ["ChangeState"],
      requiredExecutedOperations: [],
      notes: [
        "Synthetic imported RoundNo/RoundState trace proves State -1 routing can branch on the current bounded single-round match context. Multi-round sequencing, intro/KO states, team modes, round transitions, and exact IKEMEN/MUGEN round-system parity remain future work.",
      ],
    },
  );
}

export function createSyntheticImportedRoundKoTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  return createImportedXTraceArtifact(
    createSyntheticImportedTraceFighter({
      id: "synthetic-imported-round-ko",
      displayName: "Synthetic Imported Round KO",
      hitDefDamage: 1200,
    }),
    {
      ...options,
      targetId: "synthetic-imported-round-ko-golden",
      targetLabel: "Synthetic imported round KO snapshot route",
      script: importedOneShotXScript(),
      requireHitEvent: true,
      requiredExecutedStates: [200],
      requiredExecutedControllers: ["ChangeState", "HitDef"],
      requiredExecutedOperations: ["hitdef"],
      requiredRoundFrames: [{ state: "ko", winner: "Synthetic Imported Round KO", message: "Synthetic Imported Round KO wins" }],
      requiredFinalActors: [{ actorId: "p2", actorKind: "player", life: 0 }],
      notes: [
        "Synthetic imported round KO trace proves RuntimeTrace can gate bounded RoundSnapshot KO/winner/message evidence after a lethal imported HitDef. It does not claim exact MUGEN/IKEMEN KO slowdowns, lifebars, round transitions, intros/winposes, teams, or screenpack parity.",
      ],
    },
  );
}

export function createSyntheticImportedRoundTimeOverTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const imported = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-round-timeover",
    displayName: "Synthetic Imported Round Time Over",
  });
  const stage = options.stage ?? closeCombatStage();
  const script = importedRoundTimeOverScript();
  const trace = runRuntimeTrace(new MatchWorld({ p1: imported, p2: demoFighters[1]!, stage, roundTimerFrames: 1 }), script, {
    label: "synthetic-imported-round-timeover-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-round-timeover-golden",
      label: "Synthetic imported round time-over snapshot route",
      source: "mixed",
      notes: [
        "Synthetic imported round time-over trace proves RuntimeTrace can gate bounded RoundSnapshot time-over/draw evidence with a short timer. It does not claim exact MUGEN/IKEMEN round transitions, lifebars, intros/winposes, teams, timer speed, or screenpack parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-round-timeover-golden",
        requiredActorSources: ["imported", "demo"],
        requiredActorKinds: ["player"],
        requiredRoundFrames: [{ state: "timeover", winner: "Draw", message: "Time over - draw", observedTimerAtMost: 0 }],
      },
    ],
  });
}

export function createSyntheticImportedMatchContextTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  return createImportedXTraceArtifact(
    createSyntheticImportedTraceFighter({
      id: "synthetic-imported-match-context",
      displayName: "Synthetic Imported Match Context",
      matchContextEntry: { roundsExisted: 0, stateNo: 282 },
    }),
    {
      ...options,
      targetId: "synthetic-imported-match-context-golden",
      targetLabel: "Synthetic imported RoundsExisted/MatchOver route",
      script: importedOneShotXScript(),
      requiredRoutedStates: [282],
      requiredExecutedStates: [282],
      requiredExecutedControllers: ["ChangeState"],
      requiredExecutedOperations: [],
      notes: [
        "Synthetic imported RoundsExisted/MatchOver trace proves State -1 routing can branch on the current bounded single-round non-matchover context. Multi-round match accounting, win/loss bookkeeping, team modes, and exact IKEMEN/MUGEN match lifecycle parity remain future work.",
      ],
    },
  );
}

export function createSyntheticImportedResourceMaxTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  return createImportedXTraceArtifact(
    createSyntheticImportedTraceFighter({
      id: "synthetic-imported-resource-max",
      displayName: "Synthetic Imported Resource Max",
      resourceMaxEntry: { lifeMax: 750, powerMax: 1200, stateNo: 283 },
    }),
    {
      ...options,
      targetId: "synthetic-imported-resource-max-golden",
      targetLabel: "Synthetic imported LifeMax/PowerMax route",
      script: importedOneShotXScript(),
      requiredRoutedStates: [283],
      requiredExecutedStates: [283],
      requiredExecutedControllers: ["ChangeState"],
      requiredExecutedOperations: [],
      requiredFinalActors: [{ actorId: "p1", source: "imported", actorKind: "player", stateNo: 283, life: 750 }],
      notes: [
        "Synthetic imported LifeMax/PowerMax trace proves State -1 routing can branch on per-character [Data] life/power caps parsed from CNS and carried into runtime state. Lifebar scaling, team modes, and exact IKEMEN/MUGEN resource-cap semantics remain future work.",
      ],
    },
  );
}

export function createSyntheticImportedNumTargetTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  return createImportedXTraceArtifact(
    createSyntheticImportedTraceFighter({
      id: "synthetic-imported-numtarget",
      displayName: "Synthetic Imported NumTarget",
      action200Duration: 30,
      numTargetStateNo: 263,
    }),
    {
      ...options,
      targetId: "synthetic-imported-numtarget-golden",
      targetLabel: "Synthetic imported NumTarget route",
      requireHitEvent: true,
      requiredExecutedStates: [200, 263],
      notes: [
        "Synthetic imported NumTarget trace proves a direct HitDef target-memory record can evaluate a bounded NumTarget(77) branch back in the owner state. Exact redirect, helper ownership, multi-target teams, and target persistence parity remain future work.",
      ],
    },
  );
}

export function createSyntheticImportedNumHelperTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? farCombatStage();
  const script = importedHelperScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-numhelper",
    displayName: "Synthetic Imported NumHelper",
    withHelper: true,
    numHelperStateNo: 264,
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-numhelper-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-numhelper-golden",
      label: "Synthetic imported NumHelper route",
      source: "mixed",
      notes: [
        "Synthetic imported NumHelper trace proves a bounded Helper actor can be counted by NumHelper(42) and branch back in the owner state. It does not claim full Helper VM, redirects, parent/root ownership, or helper combat parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-numhelper-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredEffectKinds: ["helper"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200, 264],
        requiredExecutedControllers: ["ChangeState", "HitDef", "Helper"],
        requiredExecutedOperations: ["hitdef", "helper"],
        requiredActiveCommands: ["x"],
        requiredWorldLifecycleEvents: [{ type: "spawn", kind: "helper", ownerId: "p1", rootId: "p1", parentId: "p1" }],
        requiredEffectStores: [{ ownerId: "p1", minTotal: 1, minHelpers: 1, minNextHelperSerial: 1 }],
      },
    ],
  });
}

export function createSyntheticImportedNumProjTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? projectileCombatStage();
  const script = importedProjectileScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-numproj",
    displayName: "Synthetic Imported NumProj",
    withProjectile: true,
    numProjStateNo: 273,
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-numproj-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-numproj-golden",
      label: "Synthetic imported NumProj route",
      source: "mixed",
      notes: [
        "Synthetic imported NumProj trace proves a bounded Projectile actor can be counted by NumProjID(77) and branch back in the owner state. It does not claim exact projectile lifetime, helper-owned projectiles, redirect ownership, or full projectile parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-numproj-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredEffectKinds: ["projectile"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200, 273],
        requiredExecutedControllers: ["ChangeState", "HitDef", "Projectile"],
        requiredExecutedOperations: ["hitdef", "projectile"],
        requiredActiveCommands: ["x"],
        requiredWorldLifecycleEvents: [{ type: "spawn", kind: "projectile", ownerId: "p1", rootId: "p1", parentId: "p1" }],
        requiredEffectStores: [{ ownerId: "p1", minTotal: 1, minProjectiles: 1, minNextProjectileSerial: 1 }],
      },
    ],
  });
}

export function createSyntheticImportedNumExplodTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? farCombatStage();
  const script = importedExplodScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-numexplod",
    displayName: "Synthetic Imported NumExplod",
    withExplod: true,
    numExplodStateNo: 274,
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-numexplod-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-numexplod-golden",
      label: "Synthetic imported NumExplod route",
      source: "mixed",
      notes: [
        "Synthetic imported NumExplod trace proves a bounded Explod actor can be counted by NumExplod(9000) and branch back in the owner state. It does not claim exact Explod binding, remove-trigger, FightFX/common animation, or exact lifetime parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-numexplod-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredEffectKinds: ["explod"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200, 274],
        requiredExecutedControllers: ["ChangeState", "HitDef", "Explod"],
        requiredExecutedOperations: ["hitdef", "explod"],
        requiredActiveCommands: ["x"],
        requiredWorldLifecycleEvents: [{ type: "spawn", kind: "explod", ownerId: "p1", rootId: "p1", parentId: "p1" }],
        requiredEffectStores: [{ ownerId: "p1", minTotal: 1, minExplods: 1, minNextExplodSerial: 1 }],
      },
    ],
  });
}

export function createSyntheticImportedRemoveExplodTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? farCombatStage();
  const script = importedExplodScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-removeexplod",
    displayName: "Synthetic Imported RemoveExplod",
    withExplod: true,
    withRemoveExplod: true,
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-removeexplod-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-removeexplod-golden",
      label: "Synthetic imported RemoveExplod route",
      source: "mixed",
      notes: [
        "Synthetic imported RemoveExplod trace proves a bounded visual Explod actor can be spawned, removed by id, and reported through MatchWorld lifecycle evidence. It does not claim remove triggers, exact binding parity, FightFX/common animation, or exact lifetime parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-removeexplod-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredEffectKinds: ["explod"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "HitDef", "Explod", "RemoveExplod"],
        requiredExecutedOperations: ["hitdef", "explod", "removeexplod"],
        requiredActiveCommands: ["x"],
        requiredWorldLifecycleEvents: [
          { type: "spawn", kind: "explod", ownerId: "p1", rootId: "p1", parentId: "p1" },
          { type: "active", kind: "explod", ownerId: "p1", rootId: "p1", parentId: "p1" },
          { type: "remove", kind: "explod", ownerId: "p1", rootId: "p1", parentId: "p1" },
        ],
        requiredEffectStores: [{ ownerId: "p1", minNextExplodSerial: 1 }],
      },
    ],
  });
}

export function createImportedXTraceArtifact(
  imported: DemoFighterDefinition,
  options: RuntimeTraceGatePresetOptions & {
    targetId?: string;
    targetLabel?: string;
    notes?: string[];
    requireHitEvent?: boolean;
    requiredRoutedStates?: number[];
    requiredExecutedStates?: number[];
    requiredExecutedControllers?: RuntimeTraceGate["requiredExecutedControllers"];
    requiredExecutedOperations?: RuntimeTraceGate["requiredExecutedOperations"];
    requiredSoundEvents?: RuntimeTraceGate["requiredSoundEvents"];
    requiredEnvShakeEvents?: RuntimeTraceGate["requiredEnvShakeEvents"];
    requiredRoundFrames?: RuntimeTraceGate["requiredRoundFrames"];
    requiredActorFrames?: RuntimeTraceGate["requiredActorFrames"];
    requiredFinalActors?: RuntimeTraceFinalActorRequirement[];
    script?: RuntimeTraceInputFrame[];
  } = {},
): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = options.script ?? importedXScript();
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
        requiredRoutedStates: options.requiredRoutedStates ?? [200],
        requiredExecutedStates: options.requiredExecutedStates ?? [200],
        requiredExecutedControllers: options.requiredExecutedControllers ?? ["ChangeState", "HitDef"],
        requiredExecutedOperations: options.requiredExecutedOperations ?? ["hitdef"],
        requiredSoundEvents: options.requiredSoundEvents,
        requiredEnvShakeEvents: options.requiredEnvShakeEvents,
        requiredRoundFrames: options.requiredRoundFrames,
        requiredActorFrames: options.requiredActorFrames,
        requiredActiveCommands: ["x"],
        ...(options.requireHitEvent ? { requiredEventCategories: ["hit" as const] } : {}),
        ...(options.requireHitEvent ? { requiredCombatReasons: ["hit" as const] } : {}),
        requiredFinalActors: options.requiredFinalActors,
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
        requiredExecutedOperations: ["hitdef", "eligibility:nothitby"],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["reject"],
        requiredCombatReasons: ["reject"],
      },
    ],
  });
}

export function createSyntheticImportedHitOverrideTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedXScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-hitoverride-attacker",
    displayName: "Synthetic Imported HitOverride Attacker",
    hitDefAttr: "S,NA",
  });
  const defender = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-hitoverride-defender",
    displayName: "Synthetic Imported HitOverride Defender",
    passiveHitOverride: { attr: "S,NA", stateNo: 777, slot: 1, time: 30 },
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: defender, stage }), script, {
    label: "synthetic-imported-hitoverride-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-hitoverride-golden",
      label: "Synthetic imported HitOverride route",
      source: "imported",
      notes: [
        "Synthetic imported HitOverride trace proves a defender-side typed HitOverride slot can redirect a matching incoming HitDef into a known defender state without normal damage. It does not claim exact slot priority, helper/projectile/custom-state redirects, or full MUGEN/IKEMEN HitOverride parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-hitoverride-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200, 777],
        requiredExecutedControllers: ["ChangeState", "HitDef", "HitOverride"],
        requiredExecutedOperations: ["hitdef", "hitoverride"],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["override"],
        requiredCombatReasons: ["override"],
        requiredFinalActors: [
          {
            actorId: "p2",
            source: "imported",
            actorKind: "player",
            stateNo: 777,
            animNo: 777,
            life: 1000,
            moveType: "I",
          },
        ],
      },
    ],
  });
}

export function createSyntheticImportedReversalTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedXScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-reversal-attacker",
    displayName: "Synthetic Imported Reversal Attacker",
    hitDefAttr: "S,NA",
    moveReversedStateNo: 778,
  });
  const defender = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-reversal-defender",
    displayName: "Synthetic Imported Reversal Defender",
    passiveReversalDef: { attr: "SA,AA", p1StateNo: 777, hitPause: 3 },
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: defender, stage }), script, {
    label: "synthetic-imported-reversal-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-reversal-golden",
      label: "Synthetic imported ReversalDef route",
      source: "imported",
      notes: [
        "Synthetic imported ReversalDef trace proves a defender-side Clsn1 counter can reverse a matching imported HitDef, route the defender into a known p1stateno state, and let the attacker branch on bounded MoveReversed after hitpause. It does not claim exact priority, guard, custom-state, or IKEMEN ReversalDef parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-reversal-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200, 777, 778],
        requiredExecutedControllers: ["ChangeState", "HitDef", "ReversalDef"],
        requiredExecutedOperations: ["hitdef", "reversaldef"],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["reversal"],
        requiredCombatReasons: ["reversal"],
      },
    ],
  });
}

export function createSyntheticImportedDamageScaleTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedXScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-damage-scale-attacker",
    displayName: "Synthetic Imported Damage Scale Attacker",
    hitDefDamage: 40,
    attackMultiplier: 1.5,
  });
  const defender = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-damage-scale-defender",
    displayName: "Synthetic Imported Damage Scale Defender",
    defenseMultiplier: 0.5,
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: defender, stage }), script, {
    label: "synthetic-imported-damage-scale-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-damage-scale-golden",
      label: "Synthetic imported AttackMulSet/DefenceMulSet route",
      source: "imported",
      notes: [
        "Synthetic imported damage-scale trace proves typed AttackMulSet and DefenceMulSet operations feed bounded outgoing and incoming HitDef damage scaling. It does not claim exact MUGEN/IKEMEN scaling order for helpers, projectiles, custom states, guards, or round edge cases.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-damage-scale-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "AttackMulSet", "DefenceMulSet", "HitDef"],
        requiredExecutedOperations: ["damage-scale:attackmulset", "damage-scale:defencemulset", "hitdef"],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["hit"],
        requiredCombatReasons: ["hit"],
        requiredEventSubstrings: ["for 30"],
        requiredFinalActors: [
          {
            actorId: "p2",
            source: "imported",
            actorKind: "player",
            life: 970,
            moveType: "H",
          },
        ],
      },
    ],
  });
}

export function createSyntheticImportedDataDamageScaleTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedXScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-data-damage-scale-attacker",
    displayName: "Synthetic Imported Data Attack Attacker",
    hitDefDamage: 40,
    dataStats: { attack: 150 },
  });
  const defender = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-data-damage-scale-defender",
    displayName: "Synthetic Imported Data Defence Defender",
    dataStats: { defence: 200 },
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: defender, stage }), script, {
    label: "synthetic-imported-data-damage-scale-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-data-damage-scale-golden",
      label: "Synthetic imported CNS Data attack/defence route",
      source: "imported",
      notes: [
        "Synthetic imported data damage-scale trace proves parsed CNS [Data] attack and defence values feed bounded base outgoing and incoming HitDef damage scaling without requiring AttackMulSet or DefenceMulSet controllers. Exact stacking with controller multipliers, helpers, projectiles, guards, custom states, and round edge cases remains future work.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-data-damage-scale-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "HitDef"],
        requiredExecutedOperations: ["hitdef"],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["hit"],
        requiredCombatReasons: ["hit"],
        requiredEventSubstrings: ["for 30"],
        requiredFinalActors: [
          {
            actorId: "p2",
            source: "imported",
            actorKind: "player",
            life: 970,
            moveType: "H",
          },
        ],
      },
    ],
  });
}

export function createSyntheticImportedBoundsTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedXScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-bounds",
    displayName: "Synthetic Imported Bounds",
    withBoundsControllers: true,
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-bounds-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-bounds-golden",
      label: "Synthetic imported PosFreeze/ScreenBound route",
      source: "mixed",
      notes: [
        "Synthetic imported bounds trace proves static PosFreeze and ScreenBound lower into typed bounds operations and expose one-frame runtime clamp/camera flags. It does not claim exact MUGEN/IKEMEN camera, screen-edge, or tick-order parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-bounds-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "HitDef", "PosFreeze", "ScreenBound"],
        requiredExecutedOperations: ["hitdef", "bounds:posfreeze", "bounds:screenbound"],
        requiredActiveCommands: ["x"],
        requiredActorFrames: [
          {
            actorId: "p1",
            source: "imported",
            actorKind: "player",
            animNo: 200,
            posFreezeX: true,
            posFreezeY: false,
            screenBound: false,
            moveCameraX: false,
            moveCameraY: true,
            minFrames: 1,
          },
        ],
      },
    ],
  });
}

export function createSyntheticImportedScreenBoundCameraTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? screenBoundCameraStage();
  const script = importedXScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-screenbound-camera",
    displayName: "Synthetic Imported ScreenBound Camera",
    withScreenBoundCameraProbe: true,
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-screenbound-camera-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-screenbound-camera-golden",
      label: "Synthetic imported ScreenBound camera/clamp route",
      source: "mixed",
      notes: [
        "Synthetic imported ScreenBound camera trace proves the current bounded runtime can skip the X stage clamp and exclude the actor from X camera centering for the same tick. It does not claim exact MUGEN/IKEMEN camera, screen-edge, or tick-order parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-screenbound-camera-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "ScreenBound", "PosAdd"],
        requiredExecutedOperations: ["bounds:screenbound", "kinematic:posadd"],
        requiredActiveCommands: ["x"],
        requiredStageFrames: [
          {
            stageId: "trace-screenbound-camera-grid",
            boundRight: 320,
            observedCameraXAtLeast: 150,
            observedCameraXAtMost: 0,
            minFrames: 3,
          },
        ],
        requiredActorFrames: [
          {
            actorId: "p1",
            source: "imported",
            actorKind: "player",
            animNo: 200,
            observedPosXAtLeast: 321,
            screenBound: false,
            moveCameraX: false,
            moveCameraY: true,
            minFrames: 1,
          },
        ],
      },
    ],
  });
}

export function createSyntheticImportedGravityTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  return createImportedXTraceArtifact(
    createSyntheticImportedTraceFighter({
      id: "synthetic-imported-gravity",
      displayName: "Synthetic Imported Gravity",
      attackStateType: "A",
      action200Duration: 30,
      withGravity: true,
    }),
    {
      ...options,
      targetId: "synthetic-imported-gravity-golden",
      targetLabel: "Synthetic imported Gravity route",
      requireHitEvent: true,
      requiredExecutedStates: [200],
      requiredExecutedControllers: ["ChangeState", "Gravity", "HitDef"],
      requiredExecutedOperations: ["hitdef", "kinematic:gravity"],
      requiredActorFrames: [
        {
          actorId: "p1",
          source: "imported",
          actorKind: "player",
          animNo: 200,
          stateType: "A",
          observedVelYAtLeast: 0.55,
          minFrames: 1,
        },
      ],
      notes: [
        "Synthetic imported Gravity trace proves a bounded imported airborne state can execute the real Gravity controller through typed kinematic operation evidence and expose vertical-velocity telemetry. Exact physics integration, ground snap, yaccel constants, pause/tick order, and full MUGEN/IKEMEN air physics parity remain future work.",
      ],
    },
  );
}

export function createSyntheticImportedKinematicTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  return createImportedXTraceArtifact(
    createSyntheticImportedTraceFighter({
      id: "synthetic-imported-kinematic",
      displayName: "Synthetic Imported Kinematic Ops",
      action200Duration: 30,
      withKinematicControllers: true,
    }),
    {
      ...options,
      targetId: "synthetic-imported-kinematic-golden",
      targetLabel: "Synthetic imported kinematic controller route",
      requireHitEvent: true,
      requiredExecutedStates: [200],
      requiredExecutedControllers: ["ChangeState", "VelSet", "VelAdd", "VelMul", "PosSet", "PosAdd", "HitDef"],
      requiredExecutedOperations: [
        "hitdef",
        "kinematic:velset",
        "kinematic:veladd",
        "kinematic:velmul",
        "kinematic:posset",
        "kinematic:posadd",
      ],
      requiredActorFrames: [
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
      ],
      notes: [
        "Synthetic imported kinematic trace proves bounded static VelSet, VelAdd, VelMul, PosSet, and PosAdd controllers lower into typed kinematic operation evidence and affect actor position/velocity telemetry. Dynamic expressions, exact MUGEN physics, pause/tick order, floor snapping, and helper/custom-state ownership remain future work.",
      ],
    },
  );
}

export function createSyntheticImportedWidthTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedXScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-width",
    displayName: "Synthetic Imported Width",
    withWidthController: [18, 44],
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-width-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-width-golden",
      label: "Synthetic imported Width route",
      source: "mixed",
      notes: [
        "Synthetic imported Width trace proves static Width lowers into typed collision operation evidence and updates the current runtime body width used by bounded push/separation. It does not claim exact MUGEN/IKEMEN Width edge/player semantics or tick-order parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-width-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "Width", "HitDef"],
        requiredExecutedOperations: ["collision:width", "hitdef"],
        requiredActiveCommands: ["x"],
        requiredActorFrames: [
          {
            actorId: "p1",
            source: "imported",
            actorKind: "player",
            animNo: 200,
            bodyWidthFront: 18,
            bodyWidthBack: 44,
            minFrames: 1,
          },
        ],
      },
    ],
  });
}

export function createSyntheticImportedStateTypeSetTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedXScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-statetypeset",
    displayName: "Synthetic Imported StateTypeSet",
    withStateTypeSet: { stateType: "C", moveType: "A", physics: "N" },
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-statetypeset-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-statetypeset-golden",
      label: "Synthetic imported StateTypeSet route",
      source: "mixed",
      notes: [
        "Synthetic imported StateTypeSet trace proves static StateTypeSet lowers into typed metadata operation evidence and updates stateType/moveType/physics in the current runtime snapshot. It does not claim full MUGEN/IKEMEN metadata tick-order or physics parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-statetypeset-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "StateTypeSet", "HitDef"],
        requiredExecutedOperations: ["metadata:statetypeset", "hitdef"],
        requiredActiveCommands: ["x"],
        requiredActorFrames: [
          {
            actorId: "p1",
            source: "imported",
            actorKind: "player",
            animNo: 200,
            stateType: "C",
            moveType: "A",
            physics: "N",
            minFrames: 1,
          },
        ],
      },
    ],
  });
}

export function createSyntheticImportedPlayerPushTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedXScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-playerpush",
    displayName: "Synthetic Imported PlayerPush",
    withPlayerPush: false,
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-playerpush-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-playerpush-golden",
      label: "Synthetic imported PlayerPush route",
      source: "mixed",
      notes: [
        "Synthetic imported PlayerPush trace proves static PlayerPush value lowers into typed collision operation evidence and disables bounded body push for the current runtime snapshot. It does not claim exact MUGEN/IKEMEN push overlap, team, helper, or tick-order parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-playerpush-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "PlayerPush", "HitDef"],
        requiredExecutedOperations: ["collision:playerpush", "hitdef"],
        requiredActiveCommands: ["x"],
        requiredActorFrames: [
          {
            actorId: "p1",
            source: "imported",
            actorKind: "player",
            animNo: 200,
            playerPush: false,
            minFrames: 1,
          },
        ],
      },
    ],
  });
}

export function createSyntheticImportedTurnTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedXScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-turn",
    displayName: "Synthetic Imported Turn",
    withTurn: true,
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-turn-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-turn-golden",
      label: "Synthetic imported Turn route",
      source: "mixed",
      notes: [
        "Synthetic imported Turn trace proves static Turn lowers into typed orientation operation evidence and flips the current runtime facing for the bounded actor frame. It does not claim exact MUGEN/IKEMEN auto-facing, tick-order, team, helper, or target-facing parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-turn-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "Turn", "HitDef"],
        requiredExecutedOperations: ["orientation:turn", "hitdef"],
        requiredActiveCommands: ["x"],
        requiredActorFrames: [
          {
            actorId: "p1",
            source: "imported",
            actorKind: "player",
            animNo: 200,
            facing: -1,
            minFrames: 1,
          },
        ],
      },
    ],
  });
}

export function createSyntheticImportedSprPriorityTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedXScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-sprpriority",
    displayName: "Synthetic Imported SprPriority",
    withSprPriority: 5,
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-sprpriority-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-sprpriority-golden",
      label: "Synthetic imported SprPriority route",
      source: "mixed",
      notes: [
        "Synthetic imported SprPriority trace proves static SprPriority lowers into typed sprite-effect operation evidence and updates bounded renderer ordering telemetry. It does not claim exact MUGEN/IKEMEN layer, shadow, helper, Explod, or draw-order parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-sprpriority-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "SprPriority", "HitDef"],
        requiredExecutedOperations: ["sprite-effect:sprpriority", "hitdef"],
        requiredActiveCommands: ["x"],
        requiredActorFrames: [
          {
            actorId: "p1",
            source: "imported",
            actorKind: "player",
            animNo: 200,
            spritePriority: 5,
            minFrames: 1,
          },
        ],
      },
    ],
  });
}

export function createSyntheticImportedPalFxTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedXScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-palfx",
    displayName: "Synthetic Imported PalFX",
    withPalFx: {
      time: 18,
      add: [80, -10, 300],
      mul: [256, 160, 160],
      color: 999,
      invert: true,
    },
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-palfx-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-palfx-golden",
      label: "Synthetic imported PalFX route",
      source: "mixed",
      notes: [
        "Synthetic imported PalFX trace proves static PalFX lowers into typed sprite-effect operation evidence and reaches bounded material telemetry. It does not claim exact MUGEN/IKEMEN palette math, blending, remap, sinadd, or timing parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-palfx-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "PalFX", "HitDef"],
        requiredExecutedOperations: ["sprite-effect:palfx", "hitdef"],
        requiredActiveCommands: ["x"],
        requiredActorFrames: [
          {
            actorId: "p1",
            source: "imported",
            actorKind: "player",
            animNo: 200,
            paletteFxTime: 18,
            paletteFxAddR: 80,
            paletteFxAddG: -10,
            paletteFxAddB: 255,
            paletteFxMulG: 160,
            paletteFxColor: 256,
            paletteFxInvert: true,
            minFrames: 1,
          },
        ],
      },
    ],
  });
}

export function createSyntheticImportedTransTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedXScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-trans",
    displayName: "Synthetic Imported Trans",
    withTrans: "addalpha,128,128",
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-trans-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-trans-golden",
      label: "Synthetic imported Trans route",
      source: "mixed",
      notes: [
        "Synthetic imported Trans trace proves static Trans lowers into typed sprite-effect operation evidence and reaches bounded render opacity telemetry consumed by Three.js materials. It does not claim exact MUGEN/IKEMEN alpha blending modes, add/sub math, palette interaction, or draw-order parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-trans-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "Trans", "HitDef"],
        requiredExecutedOperations: ["sprite-effect:trans", "hitdef"],
        requiredActiveCommands: ["x"],
        requiredActorFrames: [
          {
            actorId: "p1",
            source: "imported",
            actorKind: "player",
            animNo: 200,
            observedOpacityAtMost: 0.5,
            minFrames: 1,
          },
        ],
      },
    ],
  });
}

export function createSyntheticImportedAngleTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedXScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-angle",
    displayName: "Synthetic Imported Angle",
    withAngle: {
      set: 45,
      add: 10,
    },
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-angle-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-angle-golden",
      label: "Synthetic imported AngleDraw route",
      source: "mixed",
      notes: [
        "Synthetic imported AngleSet/AngleAdd/AngleDraw trace proves static angle controllers lower into typed sprite-effect operation evidence and reach bounded render-angle telemetry consumed by Three.js. It does not claim exact MUGEN/IKEMEN axis pivot, collision rotation, draw-order interaction, or dynamic expression parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-angle-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "AngleSet", "AngleAdd", "AngleDraw", "HitDef"],
        requiredExecutedOperations: ["sprite-effect:angleset", "sprite-effect:angleadd", "sprite-effect:angledraw", "hitdef"],
        requiredActiveCommands: ["x"],
        requiredActorFrames: [
          {
            actorId: "p1",
            source: "imported",
            actorKind: "player",
            animNo: 200,
            observedAngleAtLeast: 55,
            observedAngleAtMost: 55,
            minFrames: 1,
          },
        ],
      },
    ],
  });
}

export function createSyntheticImportedEnvColorTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedXScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-envcolor",
    displayName: "Synthetic Imported EnvColor",
    withEnvColor: {
      value: [16, 96, 255],
      time: 12,
      under: false,
    },
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-envcolor-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-envcolor-golden",
      label: "Synthetic imported EnvColor route",
      source: "mixed",
      notes: [
        "Synthetic imported EnvColor trace proves static value/time/under lowers into typed envcolor operation evidence and reaches bounded stage-flash telemetry consumed by Three.js. It does not claim exact MUGEN/IKEMEN blend, layer, window, palette, or pause-timing parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-envcolor-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "EnvColor", "HitDef"],
        requiredExecutedOperations: ["envcolor", "hitdef"],
        requiredActiveCommands: ["x"],
        requiredStageFrames: [
          {
            stageId: stage.id,
            envColorR: 16,
            envColorG: 96,
            envColorB: 255,
            envColorUnder: false,
            observedEnvColorOpacityAtLeast: 0.2,
            minFrames: 1,
          },
        ],
      },
    ],
  });
}

export function createSyntheticImportedRemapPalTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedXScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-remappal",
    displayName: "Synthetic Imported RemapPal",
    withRemapPal: {
      source: [1, 1],
      dest: [2, 3],
    },
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-remappal-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-remappal-golden",
      label: "Synthetic imported RemapPal route",
      source: "mixed",
      notes: [
        "Synthetic imported RemapPal trace proves static RemapPal lowers into typed sprite-effect operation evidence and reaches bounded palette-remap telemetry. It does not claim ACT/SFF pixel remapping, palette application, PalFX interaction, or timing parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-remappal-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "RemapPal", "HitDef"],
        requiredExecutedOperations: ["sprite-effect:remappal", "hitdef"],
        requiredActiveCommands: ["x"],
        requiredActorFrames: [
          {
            actorId: "p1",
            source: "imported",
            actorKind: "player",
            animNo: 200,
            paletteRemapSourceGroup: 1,
            paletteRemapSourceIndex: 1,
            paletteRemapDestGroup: 2,
            paletteRemapDestIndex: 3,
            minFrames: 1,
          },
        ],
      },
    ],
  });
}

export function createSyntheticImportedAfterImageTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedXScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-afterimage",
    displayName: "Synthetic Imported AfterImage",
    withAfterImage: {
      time: 20,
      length: 4,
      timeGap: 2,
      frameGap: 1,
      palAdd: [0, 40, 90],
      palMul: [160, 160, 256],
      trans: "add",
    },
    withAfterImageTime: 11,
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-afterimage-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-afterimage-golden",
      label: "Synthetic imported AfterImage route",
      source: "mixed",
      notes: [
        "Synthetic imported AfterImage trace proves static AfterImage and AfterImageTime lower into typed sprite-effect operation evidence and reach bounded ghost-trail telemetry. It does not claim exact MUGEN/IKEMEN trail blending, palette math, sampling cadence, or timing parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-afterimage-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "AfterImage", "AfterImageTime", "HitDef"],
        requiredExecutedOperations: ["sprite-effect:afterimage", "sprite-effect:afterimagetime", "hitdef"],
        requiredActiveCommands: ["x"],
        requiredActorFrames: [
          {
            actorId: "p1",
            source: "imported",
            actorKind: "player",
            animNo: 200,
            afterImageTime: 20,
            afterImageLength: 4,
            afterImageTimeGap: 2,
            afterImageFrameGap: 1,
            afterImageSampleCountAtLeast: 1,
            afterImageOpacity: 0.34,
            minFrames: 1,
          },
        ],
      },
    ],
  });
}

export function createSyntheticImportedHitDefPriorityTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedHitDefPriorityScript();
  const p1 = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-hitdef-priority-p1",
    displayName: "Synthetic Imported HitDef Priority P1",
    hitDefDamage: 31,
    hitDefPriority: 6,
  });
  const p2 = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-hitdef-priority-p2",
    displayName: "Synthetic Imported HitDef Priority P2",
    hitDefDamage: 31,
    hitDefPriority: 3,
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1, p2, stage }), script, {
    label: "synthetic-imported-hitdef-priority-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-hitdef-priority-golden",
      label: "Synthetic imported HitDef priority route",
      source: "imported",
      notes: [
        "Synthetic imported HitDef priority trace proves a bounded direct-attack clash where a higher numeric priority suppresses the lower-priority direct hit before normal hit resolution. It does not claim exact MUGEN/IKEMEN priority classes, reversal priority, projectiles, multi-hit, or pause-order parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-hitdef-priority-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["HitDef"],
        requiredExecutedOperations: ["hitdef"],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["runtime", "hit"],
        requiredCombatReasons: ["hit"],
        requiredEventSubstrings: ["HitDef priority clash", "priority 6 beat", "hit Synthetic Imported HitDef Priority P2 for 31"],
        requiredFinalActors: [
          {
            actorId: "p1",
            source: "imported",
            actorKind: "player",
            life: 1000,
          },
          {
            actorId: "p2",
            source: "imported",
            actorKind: "player",
            life: 969,
            moveType: "H",
          },
        ],
      },
    ],
  });
}

export function createSyntheticImportedHitDefKillTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedHitDefKillScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-hitdef-kill-attacker",
    displayName: "Synthetic Imported HitDef Kill Attacker",
    hitDefDamage: 2000,
    hitDefKill: false,
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-hitdef-kill-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-hitdef-kill-golden",
      label: "Synthetic imported HitDef kill route",
      source: "mixed",
      notes: [
        "Synthetic imported HitDef kill trace proves a bounded direct hit with kill = 0 can reduce the defender to 1 life without KO. It does not claim exact round/KO, red-life, guard, projectile, helper, or custom-state kill semantics.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-hitdef-kill-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "HitDef"],
        requiredExecutedOperations: ["hitdef"],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["hit"],
        requiredCombatReasons: ["hit"],
        requiredEventSubstrings: ["hit Mira Volt for 2000"],
        requiredFinalActors: [
          {
            actorId: "p2",
            source: "demo",
            actorKind: "player",
            life: 1,
            moveType: "H",
          },
        ],
      },
    ],
  });
}

export function createSyntheticImportedHitDefGuardKillTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedHitDefGuardKillScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-hitdef-guard-kill-attacker",
    displayName: "Synthetic Imported HitDef Guard Kill Attacker",
    guardDamage: 2000,
    guardFlag: "MA",
    guardKill: false,
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-hitdef-guard-kill-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-hitdef-guard-kill-golden",
      label: "Synthetic imported HitDef guard.kill route",
      source: "mixed",
      notes: [
        "Synthetic imported HitDef guard.kill trace proves a bounded guarded hit with guard.kill = 0 can reduce the defender to 1 life without KO. It does not claim exact guard KO, chip KO, projectiles, helpers, or full MUGEN/IKEMEN guard semantics.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-hitdef-guard-kill-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "HitDef"],
        requiredExecutedOperations: ["hitdef"],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["guard"],
        requiredCombatReasons: ["guard"],
        requiredEventSubstrings: ["guarded Synthetic Imported HitDef Guard Kill Attacker for 2000"],
        requiredFinalActors: [
          {
            actorId: "p2",
            source: "demo",
            actorKind: "player",
            life: 1,
          },
        ],
      },
    ],
  });
}

export function createSyntheticImportedAssertSpecialNoKoTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedHitDefKillScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-assertspecial-noko-attacker",
    displayName: "Synthetic Imported AssertSpecial NoKO Attacker",
    hitDefDamage: 2000,
  });
  const defender = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-assertspecial-noko-defender",
    displayName: "Synthetic Imported AssertSpecial NoKO Defender",
    passiveAssertSpecialFlags: ["NoKO"],
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: defender, stage }), script, {
    label: "synthetic-imported-assertspecial-noko-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-assertspecial-noko-golden",
      label: "Synthetic imported AssertSpecial NoKO route",
      source: "imported",
      notes: [
        "Synthetic imported AssertSpecial NoKO trace proves a bounded defender-side NoKO flag can clamp lethal direct HitDef damage to 1 life. It does not claim exact global NoKO, round-flow, helper, projectile, custom-state, or IKEMEN/MUGEN KO parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-assertspecial-noko-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "AssertSpecial", "HitDef"],
        requiredExecutedOperations: ["hitdef"],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["hit"],
        requiredCombatReasons: ["hit"],
        requiredEventSubstrings: ["hit Synthetic Imported AssertSpecial NoKO Defender for 2000"],
        requiredFinalActors: [
          {
            actorId: "p2",
            source: "imported",
            actorKind: "player",
            life: 1,
            moveType: "H",
          },
        ],
      },
    ],
  });
}

export function createSyntheticImportedAssertSpecialControlTraceArtifact(
  options: RuntimeTraceGatePresetOptions = {},
): RuntimeTraceArtifact {
  const stage = options.stage ?? assertSpecialControlStage();
  const script = importedAssertSpecialControlScript();
  const p1 = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-assertspecial-control",
    displayName: "Synthetic Imported AssertSpecial Control",
    passiveAssertSpecialFlags: ["NoAutoTurn", "NoWalk", "Invisible"],
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-assertspecial-control-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-assertspecial-control-golden",
      label: "Synthetic imported AssertSpecial control flags",
      source: "mixed",
      notes: [
        "Synthetic imported AssertSpecial control trace proves bounded NoAutoTurn can hold facing before the automatic facing pass, NoWalk can suppress walk velocity without leaving a controlled imported state, and Invisible can expose render-opacity telemetry. It does not claim full AssertSpecial lifetime, global flag behavior, helper ownership, or full MUGEN/IKEMEN parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-assertspecial-control-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredExecutedControllers: ["AssertSpecial"],
        requiredActorFrames: [
          {
            actorId: "p1",
            source: "imported",
            actorKind: "player",
            animNo: 0,
            facing: 1,
            observedVelXAtLeast: 0,
            observedVelXAtMost: 0,
            observedPosXAtMost: 30,
            observedOpacityAtMost: 0,
            minFrames: 3,
          },
        ],
        requiredFinalActors: [
          {
            actorId: "p1",
            source: "imported",
            actorKind: "player",
            stateNo: 0,
            ctrl: true,
          },
        ],
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
    moveGuardStateNo: 260,
  });
  return createImportedGuardTraceArtifact(attacker, {
    ...options,
    targetId: "synthetic-imported-guard-golden",
    targetLabel: "Synthetic imported guard route",
    requiredExecutedStates: [200, 260],
    notes: [
      "Synthetic imported guard trace proves held-back defender input can turn a real imported HitDef contact into guard evidence and evaluate a bounded MoveGuarded branch back in the owner state.",
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

export function createSyntheticImportedAssertSpecialGuardDenyTraceArtifact(
  options: RuntimeTraceGatePresetOptions = {},
): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedP2GuardDenyScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-assertspecial-guarddeny-attacker",
    displayName: "Synthetic Imported AssertSpecial Guard-Deny Attacker",
    guardDamage: 5,
    guardFlag: "MA",
  });
  const defender = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-assertspecial-guarddeny-defender",
    displayName: "Synthetic Imported AssertSpecial Guard-Deny Defender",
    passiveAssertSpecialFlags: ["NoWalk", "NoStandGuard"],
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: defender, p2: attacker, stage }), script, {
    label: "synthetic-imported-assertspecial-guarddeny-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-assertspecial-guarddeny-golden",
      label: "Synthetic imported AssertSpecial NoStandGuard route",
      source: "imported",
      notes: [
        "Synthetic imported AssertSpecial guard-deny trace proves defender-owned NoWalk + NoStandGuard flags can keep a held-back standing defender in its owner state, deny standing guard, and resolve the same A-guardable HitDef as a hit. It does not claim exact guard priority, crouch/air variants, global lifetime, helper/custom-state ownership, or full MUGEN/IKEMEN guard parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-assertspecial-guarddeny-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "AssertSpecial", "HitDef"],
        requiredExecutedOperations: ["hitdef"],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["hit"],
        requiredCombatReasons: ["hit"],
        requiredActorFrames: [{ actorId: "p1", source: "imported", actorKind: "player", moveType: "H", minFrames: 1 }],
        requiredFinalActors: [
          {
            actorId: "p1",
            source: "imported",
            actorKind: "player",
            life: 963,
          },
        ],
      },
    ],
  });
}

export function createSyntheticImportedAssertSpecialCrouchGuardDenyTraceArtifact(
  options: RuntimeTraceGatePresetOptions = {},
): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedP2CrouchGuardDenyScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-assertspecial-crouch-guarddeny-attacker",
    displayName: "Synthetic Imported AssertSpecial Crouch Guard-Deny Attacker",
    guardDamage: 5,
    guardFlag: "MA",
  });
  const defender = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-assertspecial-crouch-guarddeny-defender",
    displayName: "Synthetic Imported AssertSpecial Crouch Guard-Deny Defender",
    assertSpecialControlState: { stateNo: 10, stateType: "C", physics: "C", flags: ["NoCrouchGuard"] },
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: defender, p2: attacker, stage }), script, {
    label: "synthetic-imported-assertspecial-crouch-guarddeny-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-assertspecial-crouch-guarddeny-golden",
      label: "Synthetic imported AssertSpecial NoCrouchGuard route",
      source: "imported",
      notes: [
        "Synthetic imported AssertSpecial crouch guard-deny trace proves defender-owned NoCrouchGuard in a crouch state can deny guard for a held down-back defender and resolve the same M-guardable HitDef as a hit. It does not claim exact guard priority, lifetime, global/helper ownership, or full MUGEN/IKEMEN guard parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-assertspecial-crouch-guarddeny-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "AssertSpecial", "HitDef"],
        requiredExecutedOperations: ["hitdef"],
        requiredActiveCommands: ["holdback", "holddown", "x"],
        requiredEventCategories: ["hit"],
        requiredCombatReasons: ["hit"],
        requiredActorFrames: [
          { actorId: "p1", source: "imported", actorKind: "player", stateType: "C", moveType: "H", minFrames: 1 },
        ],
        requiredFinalActors: [
          {
            actorId: "p1",
            source: "imported",
            actorKind: "player",
            life: 963,
          },
        ],
      },
    ],
  });
}

export function createSyntheticImportedAssertSpecialAirGuardDenyTraceArtifact(
  options: RuntimeTraceGatePresetOptions = {},
): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedP2AirGuardDenyScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-assertspecial-air-guarddeny-attacker",
    displayName: "Synthetic Imported AssertSpecial Air Guard-Deny Attacker",
    guardDamage: 5,
    guardFlag: "MA",
  });
  const defender = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-assertspecial-air-guarddeny-defender",
    displayName: "Synthetic Imported AssertSpecial Air Guard-Deny Defender",
    assertSpecialControlState: { stateNo: 40, stateType: "A", physics: "A", flags: ["NoWalk", "NoAirGuard"] },
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: defender, p2: attacker, stage }), script, {
    label: "synthetic-imported-assertspecial-air-guarddeny-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-assertspecial-air-guarddeny-golden",
      label: "Synthetic imported AssertSpecial NoAirGuard route",
      source: "imported",
      notes: [
        "Synthetic imported AssertSpecial air guard-deny trace proves defender-owned NoAirGuard in an airborne state can deny guard for a held-back defender and resolve the same A-guardable HitDef as a hit. It does not claim exact air-guard physics, landing, lifetime, global/helper ownership, or full MUGEN/IKEMEN guard parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-assertspecial-air-guarddeny-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "AssertSpecial", "HitDef"],
        requiredExecutedOperations: ["hitdef"],
        requiredActiveCommands: ["holdback", "x"],
        requiredEventCategories: ["hit"],
        requiredCombatReasons: ["hit"],
        requiredActorFrames: [
          { actorId: "p1", source: "imported", actorKind: "player", stateType: "A", moveType: "H", minFrames: 1 },
        ],
        requiredFinalActors: [
          {
            actorId: "p1",
            source: "imported",
            actorKind: "player",
            life: 963,
          },
        ],
      },
    ],
  });
}

export function createSyntheticImportedAssertSpecialLifetimeTraceArtifact(
  options: RuntimeTraceGatePresetOptions = {},
): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedP2AssertSpecialExpiredGuardScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-assertspecial-lifetime-attacker",
    displayName: "Synthetic Imported AssertSpecial Lifetime Attacker",
    guardDamage: 5,
    guardFlag: "MA",
  });
  const defender = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-assertspecial-lifetime-defender",
    displayName: "Synthetic Imported AssertSpecial Lifetime Defender",
    passiveAssertSpecialFlags: ["NoWalk", "NoStandGuard"],
    passiveAssertSpecialTrigger: "Time < 1",
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: defender, p2: attacker, stage }), script, {
    label: "synthetic-imported-assertspecial-lifetime-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-assertspecial-lifetime-golden",
      label: "Synthetic imported AssertSpecial one-frame lifetime route",
      source: "imported",
      notes: [
        "Synthetic imported AssertSpecial lifetime trace proves a defender-owned NoStandGuard flag gated by Time < 1 does not leak after its trigger stops passing: the later held-back contact resolves as a guard. It does not claim exact persistence layering, pause interaction, helper/global ownership, or full MUGEN/IKEMEN AssertSpecial parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-assertspecial-lifetime-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "AssertSpecial", "HitDef"],
        requiredExecutedOperations: ["hitdef"],
        requiredActiveCommands: ["holdback", "x"],
        requiredEventCategories: ["guard"],
        requiredCombatReasons: ["guard"],
        requiredFinalActors: [
          {
            actorId: "p1",
            source: "imported",
            actorKind: "player",
            life: 995,
          },
        ],
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
    requiredExecutedOperations: ["hitdef", "resource:ctrlset", "kinematic:hitvelset"],
    requiredControllerEventSequences: [defaultStandGuardHitControllerSequence()],
    notes: [
      "Synthetic imported guard-state trace proves a held-back defender can enter its own Common1-style guard-hit states 150 and 151 after blocking an imported HitDef, including runtime-backed guard.slidetime and guard.ctrltime exposure through GetHitVar. It does not claim full guard-distance, guard-start, or guard-end parity.",
    ],
  });
}

export function defaultStandGuardHitControllerSequence(): RuntimeTraceControllerEventSequenceRequirement {
  return {
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
  };
}

export function defaultCrouchGuardHitControllerSequence(): RuntimeTraceControllerEventSequenceRequirement {
  return {
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
  };
}

export function defaultAirGuardHitControllerSequence(): RuntimeTraceControllerEventSequenceRequirement {
  return {
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
  };
}

export function officialKfmStandGuardHitControllerSequence(): RuntimeTraceControllerEventSequenceRequirement {
  return {
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
  };
}

export function officialKfmCrouchGuardHitControllerSequence(): RuntimeTraceControllerEventSequenceRequirement {
  return {
    label: "Official KFM 152/153 crouch guard-hit controller and typed operation order",
    actorId: "p2",
    allowSameTick: true,
    steps: [
      { stateNo: 152, controller: "ChangeAnim" },
      { stateNo: 152, controller: "ChangeState" },
      { stateNo: 153, controller: "HitVelSet" },
      { stateNo: 153, operation: "kinematic:hitvelset" },
      { stateNo: 153, controller: "CtrlSet" },
      { stateNo: 153, operation: "resource:ctrlset" },
      { stateNo: 153, controller: "ChangeState" },
    ],
  };
}

export function officialKfmAirGuardHitControllerSequence(): RuntimeTraceControllerEventSequenceRequirement {
  return {
    label: "Official KFM 154/155 air guard-hit and landing controller order",
    actorId: "p2",
    allowSameTick: true,
    steps: [
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
    ],
  };
}

export function officialKfmAutoGuardStartControllerSequence(): RuntimeTraceControllerEventSequenceRequirement {
  return {
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
  };
}

export function officialKfmAutoGuardEndControllerSequence(): RuntimeTraceControllerEventSequenceRequirement {
  return {
    label: "Official KFM 120/130/140 auto guard-end controller and typed operation order",
    actorId: "p2",
    allowSameTick: true,
    steps: [
      { stateNo: 120, controller: "ChangeAnim" },
      { stateNo: 120, controller: "StateTypeSet" },
      { stateNo: 120, operation: "metadata:statetypeset" },
      { stateNo: 120, controller: "ChangeState" },
      { stateNo: 130, controller: "ChangeAnim" },
      { stateNo: 130, controller: "ChangeState" },
      { stateNo: 0, controller: "VelSet" },
      { stateNo: 0, operation: "kinematic:velset" },
    ],
  };
}

export function officialKfmStandGuardHitPhysicsFrames(): RuntimeTraceActorFrameRequirement[] {
  return [
    {
      actorId: "p2",
      source: "imported",
      actorKind: "player",
      stateNo: 150,
      animNo: 150,
      stateType: "S",
      moveType: "H",
      physics: "N",
      minFrames: 5,
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
      stateNo: 151,
      animNo: 150,
      stateType: "S",
      moveType: "H",
      physics: "S",
      minFrames: 8,
      observedPosYAtLeast: 0,
      observedPosYAtMost: 0,
      bodyWidthFront: 39,
      bodyWidthBack: 39,
      playerPush: true,
    },
  ];
}

export function officialKfmCrouchGuardHitPhysicsFrames(): RuntimeTraceActorFrameRequirement[] {
  return [
    {
      actorId: "p2",
      source: "imported",
      actorKind: "player",
      stateNo: 152,
      animNo: 152,
      stateType: "C",
      moveType: "H",
      physics: "N",
      minFrames: 5,
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
      stateNo: 153,
      animNo: 151,
      stateType: "C",
      moveType: "H",
      physics: "C",
      minFrames: 8,
      observedPosYAtLeast: 0,
      observedPosYAtMost: 0,
      bodyWidthFront: 39,
      bodyWidthBack: 39,
      playerPush: true,
    },
  ];
}

export function officialKfmAirGuardHitPhysicsFrames(): RuntimeTraceActorFrameRequirement[] {
  return [
    {
      actorId: "p2",
      source: "imported",
      actorKind: "player",
      stateNo: 154,
      animNo: 132,
      stateType: "A",
      moveType: "H",
      physics: "N",
      minFrames: 5,
      observedPosYAtMost: -35,
      bodyWidthFront: 39,
      bodyWidthBack: 39,
      playerPush: true,
    },
    {
      actorId: "p2",
      source: "imported",
      actorKind: "player",
      stateNo: 155,
      animNo: 152,
      stateType: "A",
      moveType: "H",
      physics: "N",
      minFrames: 10,
      observedPosYAtMost: -35,
      observedVelXAtLeast: 2,
      observedVelYAtLeast: 8,
      bodyWidthFront: 39,
      bodyWidthBack: 39,
      playerPush: true,
    },
    {
      actorId: "p2",
      source: "imported",
      actorKind: "player",
      stateNo: 52,
      animNo: 47,
      stateType: "S",
      physics: "S",
      minFrames: 1,
      observedPosYAtLeast: 0,
      observedPosYAtMost: 0,
      bodyWidthFront: 39,
      bodyWidthBack: 39,
      playerPush: true,
    },
  ];
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
    requiredExecutedOperations: ["hitdef", "resource:ctrlset", "kinematic:hitvelset"],
    requiredControllerEventSequences: [defaultCrouchGuardHitControllerSequence()],
    requiredActiveCommands: ["holddown", "x"],
    targetId: "synthetic-imported-crouch-guard-state-golden",
    targetLabel: "Synthetic imported Common1 crouch guard-hit route",
    notes: [
      "Synthetic imported crouch guard-state trace proves a held-down-back defender can evaluate a Common1-style command expression and branch from guard-hit state 152 into 153. It does not claim full proximity guard, guard-start, guard-end, sparks, or exact crouch/air guard parity.",
    ],
  });
}

export function createSyntheticImportedDiagonalCrouchGuardStateTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const defender = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-diagonal-crouch-guard-state",
    displayName: "Synthetic Imported Diagonal Crouch Guard State",
    defaultGuardHit: { shakeStateNo: 150, slideStateNo: 151, crouchShakeStateNo: 152, crouchSlideStateNo: 153, guardStateNo: 130 },
  });
  return createImportedDefaultGuardStateTraceArtifact(defender, {
    ...options,
    script: importedDefaultDiagonalCrouchGuardStateScript(),
    requiredExecutedStates: [200, 152, 153],
    requiredExecutedOperations: ["hitdef", "resource:ctrlset", "kinematic:hitvelset"],
    requiredControllerEventSequences: [defaultCrouchGuardHitControllerSequence()],
    requiredActiveCommands: ["holdback", "holddown", "x"],
    targetId: "synthetic-imported-diagonal-crouch-guard-state-golden",
    targetLabel: "Synthetic imported atomic DB crouch guard-hit route",
    notes: [
      "Synthetic imported atomic DB crouch guard-state trace proves a diagonal down-back input can satisfy both bounded held-back guard detection and Common1-style holdback/holddown command checks. It does not claim full proximity guard, guard-start, guard-end, sparks, or exact crouch/air guard parity.",
    ],
  });
}

export function createSyntheticImportedAirGuardStateTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const defender = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-air-guard-state",
    displayName: "Synthetic Imported Air Guard State",
    defaultGuardHit: {
      shakeStateNo: 150,
      slideStateNo: 151,
      crouchShakeStateNo: 152,
      crouchSlideStateNo: 153,
      airShakeStateNo: 154,
      airSlideStateNo: 155,
      guardStateNo: 130,
    },
  });
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-air-guard-state-attacker",
    displayName: "Synthetic Imported Air Guard State Attacker",
    guardDamage: 5,
    guardFlag: "A",
    guardSlideTime: 5,
    guardControlTime: 7,
  });
  return createImportedDefaultGuardStateTraceArtifact(defender, {
    ...options,
    attacker,
    script: importedDefaultAirGuardStateScript(),
    requiredExecutedStates: [200, 154, 155],
    requiredExecutedControllers: ["ChangeState", "CtrlSet", "HitDef", "HitVelSet", "VelAdd"],
    requiredExecutedOperations: ["hitdef", "resource:ctrlset", "kinematic:hitvelset"],
    requiredControllerEventSequences: [defaultAirGuardHitControllerSequence()],
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
    targetId: "synthetic-imported-air-guard-state-golden",
    targetLabel: "Synthetic imported Common1 air guard-hit route",
    notes: [
      "Synthetic imported air guard-state trace proves an airborne held-back defender can block an A-guardable HitDef and route through Common1-style air guard states 154 and 155. It does not claim exact MUGEN/IKEMEN air guard physics, landing, sparks, sounds, or guard-end parity.",
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

export function createSyntheticImportedInGuardDistFarTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-inguarddist-far-attacker",
    displayName: "Synthetic Imported InGuardDist Far Attacker",
    guardDamage: 5,
    guardFlag: "MA",
    guardDistance: 1,
  });
  const defender = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-inguarddist-far-defender",
    displayName: "Synthetic Imported InGuardDist Far Defender",
    withInGuardDistGuardStart: true,
  });
  const stage = options.stage ?? guardDistanceOnlyStage();
  const script = importedInGuardDistScript();
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: defender, stage }), script, {
    label: "synthetic-imported-inguarddist-far-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-inguarddist-far-golden",
      label: "Synthetic imported InGuardDist far reject route",
      source: "imported",
      notes: [
        "Synthetic imported InGuardDist far trace proves a whiff outside static guard.dist does not route the defender into the guard-start state. It does not claim exact MUGEN/IKEMEN proximity guard boxes, push timing, or guard-end parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-inguarddist-far-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["HitDef"],
        requiredExecutedOperations: ["hitdef"],
        requiredActiveCommands: ["x"],
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

export function createSyntheticImportedFallDefenceUpTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-fall-defence-up-attacker",
    displayName: "Synthetic Imported Fall Defence Up Attacker",
    fall: { ...commonGetHitFallData(), defenceUp: 150 },
    getHitState: { stateNo: 5100, animNo: 500 },
  });
  const stage = options.stage ?? closeCombatStage();
  const script = importedCommonGetHitScript();
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-fall-defence-up-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-fall-defence-up-golden",
      label: "Synthetic imported fall.defence_up route",
      source: "mixed",
      notes: [
        "Synthetic imported fall.defence_up trace proves a bounded HitDef fall.defence_up value scales deferred HitFallDamage. It does not claim exact MUGEN/IKEMEN fall-defense lifetime, stacking, rounding, helper, projectile, or custom-state parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-fall-defence-up-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200, 5100],
        requiredExecutedControllers: ["ChangeState", "HitDef", "HitFallVel", "HitFallDamage", "HitFallSet"],
        requiredExecutedOperations: ["hitdef", "hitfall:hitfallvel", "hitfall:hitfalldamage", "hitfall:hitfallset"],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["hit"],
        requiredCombatReasons: ["hit"],
        requiredFinalActors: [
          {
            actorId: "p2",
            actorKind: "player",
            source: "demo",
            stateNo: 5100,
            life: 858,
            hitFall: {
              falling: false,
              damage: 0,
              velocityX: 2,
              velocityY: -7,
            },
          },
        ],
      },
    ],
  });
}

export function createSyntheticImportedGetHitVarFallDefenceUpTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-gethitvar-fall-defence-up-attacker",
    displayName: "Synthetic Imported GetHitVar Fall Defence Up Attacker",
    fall: { ...commonGetHitFallData(), defenceUp: 150 },
    getHitState: { stateNo: 5100, animNo: 500 },
    fallDefenceUpBranchStateNo: 286,
  });
  const stage = options.stage ?? closeCombatStage();
  const script = importedCommonGetHitScript();
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-gethitvar-fall-defence-up-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-gethitvar-fall-defence-up-golden",
      label: "Synthetic imported GetHitVar fall.defence_up route",
      source: "mixed",
      notes: [
        "Synthetic imported GetHitVar fall.defence_up trace proves a bounded owner-backed get-hit state can route through GetHitVar(fall.defence_up). It does not claim exact MUGEN/IKEMEN fall-defense lifetime, redirects, helper/projectile inheritance, or tick-order parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-gethitvar-fall-defence-up-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200, 5100, 286],
        requiredExecutedControllers: ["ChangeState", "HitDef", "HitFallVel"],
        requiredExecutedOperations: ["hitdef", "hitfall:hitfallvel"],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["hit"],
        requiredCombatReasons: ["hit"],
        requiredFinalActors: [
          {
            actorId: "p2",
            actorKind: "player",
            source: "demo",
            stateNo: 286,
            customOwnerId: "p1",
            hitFall: {
              falling: true,
              damage: 70,
              velocityX: 3,
              velocityY: -6,
            },
          },
        ],
      },
    ],
  });
}

export function createSyntheticImportedGetHitVarAnimTypeTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-gethitvar-animtype-attacker",
    displayName: "Synthetic Imported GetHitVar AnimType Attacker",
    fall: { ...commonGetHitFallData(), damage: 0 },
    hitAnimType: "Medium",
    fallAnimType: "Up",
    hitGroundType: "Low",
    hitAirType: "Trip",
    getHitState: { stateNo: 5100, animNo: 500 },
    getHitVarBranch: {
      stateNo: 287,
      expression: "GetHitVar(animtype) = 4 && GetHitVar(groundtype) = 2 && GetHitVar(airtype) = 3 && !GetHitVar(isbound)",
    },
  });
  const stage = options.stage ?? closeCombatStage();
  const script = importedCommonGetHitScript();
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-gethitvar-animtype-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-gethitvar-animtype-golden",
      label: "Synthetic imported GetHitVar animtype route",
      source: "mixed",
      notes: [
        "Synthetic imported GetHitVar animtype trace proves bounded HitDef animtype, fall.animtype, ground.type, air.type, and isbound values can route an owner-backed get-hit state. It does not claim exact get-hit animation selection, custom-state binding, helper/projectile inheritance, or full Common1 parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-gethitvar-animtype-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200, 5100, 287],
        requiredExecutedControllers: ["ChangeState", "HitDef", "HitFallVel"],
        requiredExecutedOperations: ["hitdef", "hitfall:hitfallvel"],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["hit"],
        requiredCombatReasons: ["hit"],
        requiredFinalActors: [
          {
            actorId: "p2",
            actorKind: "player",
            source: "demo",
            stateNo: 287,
            customOwnerId: "p1",
            hitFall: {
              falling: true,
              damage: 0,
              velocityX: 3,
              velocityY: -6,
            },
          },
        ],
      },
    ],
  });
}

export function createSyntheticImportedCustomStateTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedCustomStateScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-custom-state-attacker",
    displayName: "Synthetic Imported Custom State Attacker",
    customStateRoute: {
      startStateNo: 888,
      chainStateNo: 889,
      changeStateAfter: 1,
      selfStateAfter: 2,
    },
  });
  const defender = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-custom-state-defender",
    displayName: "Synthetic Imported Custom State Defender",
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: defender, stage }), script, {
    label: "synthetic-imported-custom-state-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-custom-state-golden",
      label: "Synthetic imported owner-backed custom-state route",
      source: "imported",
      notes: [
        "Synthetic imported custom-state trace proves HitDef p2stateno can put an imported defender into attacker-owned state data, keep that ownership through ChangeState, and clear it through SelfState. It does not claim full throw, redirect, helper/root/parent, or exact MUGEN/IKEMEN custom-state parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-custom-state-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200, 888, 889],
        requiredExecutedControllers: ["ChangeState", "HitDef", "SelfState"],
        requiredExecutedOperations: ["hitdef"],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["hit"],
        requiredCombatReasons: ["hit"],
        requiredActorFrames: [
          { actorId: "p2", source: "imported", actorKind: "player", customOwnerId: "p1", animNo: 888, moveType: "H", minFrames: 1 },
          { actorId: "p2", source: "imported", actorKind: "player", customOwnerId: "p1", animNo: 889, moveType: "H", minFrames: 1 },
        ],
        requiredFinalActors: [
          { actorId: "p2", source: "imported", actorKind: "player", stateNo: 0, animNo: 0, ctrl: true, moveType: "I" },
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
    requiredActorFrames?: RuntimeTraceGate["requiredActorFrames"];
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
        requiredActorFrames: options.requiredActorFrames,
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

export function createImportedDefaultFallRecoveryThresholdTraceArtifact(
  imported: DemoFighterDefinition,
  options: RuntimeTraceGatePresetOptions & {
    targetId?: string;
    targetLabel?: string;
    notes?: string[];
    attacker?: DemoFighterDefinition;
  } = {},
): RuntimeTraceArtifact {
  const script = importedDefaultFallOfficialRecoveryInputScript();
  const attacker =
    options.attacker ??
    createSyntheticImportedTraceFighter({
      id: `${imported.id}-common1-recovery-threshold-attacker`,
      displayName: `${imported.displayName} Common1 Recovery Threshold Probe`,
      groundVelocity: [-3, -6],
      fall: {
        ...commonGetHitFallData(),
        velocity: { x: 3, y: -6 },
        recover: true,
        recoverTime: 10,
      },
    });
  return createImportedDefaultFallGroundRecoveryTraceArtifact(imported, {
    ...options,
    attacker,
    script,
    targetId: options.targetId ?? `${imported.id}-default-fall-recovery-threshold-golden`,
    targetLabel: options.targetLabel ?? `${imported.displayName} Common1 recovery threshold route`,
    notes: options.notes ?? [
      "Imported Common1 recovery-threshold trace verifies that a real imported defender reaches fall state 5050 while fall.recovertime is still positive, then routes into ground recovery state 5200 with recoverTime observed at 0 after CanRecover plus command = \"recovery\" near the ground. It still does not claim exact recovery threshold tables, velocities, controller tick order, air-recovery selection, or full MUGEN/IKEMEN recovery parity.",
    ],
    requiredActorFrames: [
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
    requiredActorFrameSequences: [
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
    ],
  });
}

export function createSyntheticImportedDefaultFallAirRecoveryVelocityTraceArtifact(
  options: RuntimeTraceGatePresetOptions = {},
): RuntimeTraceArtifact {
  const imported = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-default-fall-air-recovery-velocity",
    displayName: "Synthetic Imported Default Fall Air Recovery Velocity",
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
    id: "synthetic-imported-default-fall-air-recovery-velocity-attacker",
    displayName: "Synthetic Imported Default Fall Air Recovery Velocity Attacker",
    groundVelocity: [-3, -6],
    fall: { enabled: true, damage: 20, velocity: { x: 3, y: -6 }, recover: true, recoverTime: 4 },
  });
  return createImportedDefaultFallRecoveryInputTraceArtifact(imported, {
    ...options,
    attacker,
    targetId: "synthetic-imported-default-fall-air-recovery-velocity-golden",
    targetLabel: "Synthetic imported Common1 air recovery velocity route",
    notes: [
      "Synthetic imported air-recovery velocity trace proves a bounded Common1-style defender can enter 5210 after CanRecover plus command = \"recovery\" and expose air-recovery VelSet telemetry before returning to idle/control. It does not claim exact MUGEN/IKEMEN recovery velocity math, threshold tables, or tick-order parity.",
    ],
    requiredActorFrames: [
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
    ],
  });
}

export function createImportedDefaultFallRecoveryTooEarlyTraceArtifact(
  imported: DemoFighterDefinition,
  options: RuntimeTraceGatePresetOptions & {
    targetId?: string;
    targetLabel?: string;
    notes?: string[];
    attacker?: DemoFighterDefinition;
  } = {},
): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedDefaultFallOfficialRecoveryTooEarlyScript();
  const attacker =
    options.attacker ??
    createSyntheticImportedTraceFighter({
      id: `${imported.id}-common1-recovery-too-early-attacker`,
      displayName: `${imported.displayName} Common1 Recovery Too Early Probe`,
      groundVelocity: [-3, -6],
      fall: {
        ...commonGetHitFallData(),
        velocity: { x: 3, y: -6 },
        recover: true,
        recoverTime: 20,
      },
    });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: imported, stage }), script, {
    label: `${imported.id}-default-fall-recovery-too-early-golden`,
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: options.targetId ?? `${imported.id}-default-fall-recovery-too-early-golden`,
      label: options.targetLabel ?? `${imported.displayName} Common1 recovery input too-early reject route`,
      source: "imported",
      notes: options.notes ?? [
        "Imported Common1 recovery-input negative trace verifies that a real imported defender does not leave fall state 5050 through command = \"recovery\" while fall.recovertime is still positive. It still does not claim exact recovery thresholds, velocities, or tick-order parity.",
      ],
    },
    gates: [
      {
        label: "imported-default-fall-recovery-too-early-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200, 5000, 5030, 5050],
        forbiddenExecutedStates: [5210, 5200, 5201],
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
            stateNo: 5050,
            moveType: "H",
            ctrl: false,
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
    requiredActorFrames?: RuntimeTraceGate["requiredActorFrames"];
    requiredActorFrameSequences?: RuntimeTraceGate["requiredActorFrameSequences"];
    script?: RuntimeTraceInputFrame[];
  } = {},
): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = options.script ?? importedDefaultFallOfficialGroundRecoveryScript();
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
        requiredActorFrames: options.requiredActorFrames,
        requiredActorFrameSequences: options.requiredActorFrameSequences,
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

export function createSyntheticImportedDefaultFallGroundRecoveryTraceArtifact(
  options: RuntimeTraceGatePresetOptions = {},
): RuntimeTraceArtifact {
  const imported = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-default-fall-ground-recovery",
    displayName: "Synthetic Imported Default Fall Ground Recovery",
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
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-default-fall-ground-recovery-attacker",
    displayName: "Synthetic Imported Default Fall Ground Recovery Attacker",
    groundVelocity: [-3, -6],
    fall: {
      ...commonGetHitFallData(),
      velocity: { x: 3, y: -6 },
      recover: true,
      recoverTime: 4,
    },
  });
  return createImportedDefaultFallGroundRecoveryTraceArtifact(imported, {
    ...options,
    attacker,
    targetId: "synthetic-imported-default-fall-ground-recovery-golden",
    targetLabel: "Synthetic imported Common1 ground recovery input route",
    notes: [
      "Synthetic imported ground-recovery trace proves a bounded Common1-style defender can choose the 5200/5201 ground recovery branch near ground, apply configured ground-recovery velocity constants, land through state 52, and return to idle/control. It does not claim exact MUGEN/IKEMEN thresholds, velocity math, tick-order, or broad KFM parity.",
    ],
    requiredActorFrames: [
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

export function createSyntheticImportedDefaultFallRecoveryThresholdTraceArtifact(
  options: RuntimeTraceGatePresetOptions = {},
): RuntimeTraceArtifact {
  const defender = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-default-fall-recovery-threshold",
    displayName: "Synthetic Imported Default Fall Recovery Threshold",
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
    id: "synthetic-imported-default-fall-recovery-threshold-attacker",
    displayName: "Synthetic Imported Default Fall Recovery Threshold Attacker",
    groundVelocity: [-3, -6],
    fall: { enabled: true, damage: 20, velocity: { x: 3, y: -6 }, recover: true, recoverTime: 10 },
  });
  const script = importedDefaultFallRecoveryInputScript();
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: defender, stage: options.stage ?? closeCombatStage() }), script, {
    label: "synthetic-imported-default-fall-recovery-threshold-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-default-fall-recovery-threshold-golden",
      label: "Synthetic imported Common1 recovery threshold route",
      source: "mixed",
      notes: [
        "Synthetic imported recovery-threshold trace proves the defender stays in Common1-style fall state 5050 while hitFall.recoverTime is still positive, then reaches recovery state 5210 with recoverTime observed at 0 after CanRecover plus command = \"recovery\" routes. It does not claim exact MUGEN/IKEMEN thresholds, velocities, or tick-order parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-default-fall-recovery-threshold-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200, 5000, 5030, 5050, 5210],
        requiredExecutedControllers: ["ChangeState", "HitDef", "HitVelSet", "VelAdd", "HitFallSet"],
        requiredExecutedOperations: ["hitdef"],
        requiredActiveCommands: ["x", "recovery"],
        requiredEventCategories: ["hit"],
        requiredCombatReasons: ["hit"],
        requiredActorFrames: [
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

export function createSyntheticImportedDefaultFallRecoveryTickOrderTraceArtifact(
  options: RuntimeTraceGatePresetOptions = {},
): RuntimeTraceArtifact {
  const defender = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-default-fall-recovery-tick-order",
    displayName: "Synthetic Imported Default Fall Recovery Tick Order",
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
    id: "synthetic-imported-default-fall-recovery-tick-order-attacker",
    displayName: "Synthetic Imported Default Fall Recovery Tick Order Attacker",
    groundVelocity: [-3, -6],
    fall: { enabled: true, damage: 20, velocity: { x: 3, y: -6 }, recover: true, recoverTime: 10 },
  });
  const script = importedDefaultFallRecoveryInputScript();
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: defender, stage: options.stage ?? closeCombatStage() }), script, {
    label: "synthetic-imported-default-fall-recovery-tick-order-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-default-fall-recovery-tick-order-golden",
      label: "Synthetic imported Common1 recovery actor-frame tick-order route",
      source: "mixed",
      notes: [
        "Synthetic imported recovery tick-order trace proves summarized actor-frame evidence can require 5050 with positive fall.recovertime before 5210 with recoverTime = 0 on the bounded recovery-input route, and can require a bounded controller-event sequence for the same route. It does not claim exact MUGEN/IKEMEN VM tick order, full controller-loop ordering, or official KFM threshold tables.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-default-fall-recovery-tick-order-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200, 5000, 5030, 5050, 5210],
        requiredExecutedControllers: ["ChangeState", "HitDef", "HitVelSet", "VelAdd", "HitFallSet"],
        requiredExecutedOperations: ["hitdef"],
        requiredControllerEventSequences: [
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
        ],
        requiredActiveCommands: ["x", "recovery"],
        requiredEventCategories: ["hit"],
        requiredCombatReasons: ["hit"],
        requiredActorFrameSequences: [
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
        ],
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

export function createSyntheticImportedDefaultFallRecoveryTooEarlyTraceArtifact(
  options: RuntimeTraceGatePresetOptions = {},
): RuntimeTraceArtifact {
  const imported = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-default-fall-recovery-too-early",
    displayName: "Synthetic Imported Default Fall Recovery Too Early",
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
    id: "synthetic-imported-default-fall-recovery-too-early-attacker",
    displayName: "Synthetic Imported Default Fall Recovery Too Early Attacker",
    groundVelocity: [-3, -6],
    fall: { enabled: true, damage: 20, velocity: { x: 3, y: -6 }, recover: true, recoverTime: 20 },
  });
  const stage = options.stage ?? closeCombatStage();
  const script = importedDefaultFallRecoveryTooEarlyScript();
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: imported, stage }), script, {
    label: "synthetic-imported-default-fall-recovery-too-early-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-default-fall-recovery-too-early-golden",
      label: "Synthetic imported Common1 recovery input too-early reject route",
      source: "imported",
      notes: [
        "Synthetic imported recovery-input negative trace proves a bounded defender-owned Common1-style fall route does not leave 5050 through command = \"recovery\" while fall.recovertime is still positive. It does not claim exact MUGEN/IKEMEN recovery thresholds, velocities, or tick-order parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-default-fall-recovery-too-early-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200, 5000, 5030, 5050],
        forbiddenExecutedStates: [5210],
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
            stateNo: 5050,
            moveType: "H",
            ctrl: false,
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
  options: RuntimeTraceGatePresetOptions & {
    targetId?: string;
    targetLabel?: string;
    notes?: string[];
    requiredExecutedStates?: number[];
  } = {},
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
        requiredExecutedStates: options.requiredExecutedStates ?? [200],
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
    requiredExecutedControllers?: string[];
    requiredExecutedOperations?: string[];
    requiredControllerEventSequences?: RuntimeTraceControllerEventSequenceRequirement[];
    requiredActorFrames?: RuntimeTraceActorFrameRequirement[];
    requiredActiveCommands?: string[];
    requiredFinalActors?: RuntimeTraceFinalActorRequirement[];
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
        requiredExecutedControllers: options.requiredExecutedControllers ?? ["ChangeState", "HitDef", "HitVelSet"],
        requiredExecutedOperations: options.requiredExecutedOperations ?? ["hitdef", "resource:ctrlset"],
        requiredControllerEventSequences: options.requiredControllerEventSequences,
        requiredActorFrames: options.requiredActorFrames,
        requiredActiveCommands: options.requiredActiveCommands ?? ["x"],
        requiredEventCategories: ["guard"],
        requiredCombatReasons: ["guard"],
        requiredFinalActors: options.requiredFinalActors,
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
    requiredExecutedControllers?: string[];
    requiredExecutedOperations?: string[];
    requiredControllerEventSequences?: RuntimeTraceControllerEventSequenceRequirement[];
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
        requiredExecutedControllers: options.requiredExecutedControllers ?? ["ChangeState", "HitDef"],
        requiredExecutedOperations: options.requiredExecutedOperations ?? ["hitdef"],
        requiredControllerEventSequences: options.requiredControllerEventSequences,
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
    requiredExecutedControllers?: string[];
    requiredExecutedOperations?: string[];
    requiredControllerEventSequences?: RuntimeTraceControllerEventSequenceRequirement[];
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
        requiredExecutedControllers: options.requiredExecutedControllers ?? ["ChangeState", "HitDef"],
        requiredExecutedOperations: options.requiredExecutedOperations ?? ["hitdef"],
        requiredControllerEventSequences: options.requiredControllerEventSequences,
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
    withBindToTarget: true,
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
          "BindToTarget",
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
          "bindtotarget",
          "target:targetdrop",
        ],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["hit"],
        requiredCombatReasons: ["hit"],
        requiredTargetLinks: [
          { ownerId: "p1", actorId: "p2", targetId: 77 },
          {
            ownerId: "p1",
            actorId: "p2",
            targetId: 77,
            hasBinding: true,
            minFrames: 1,
            minAge: 1,
            minBindingRemaining: 1,
            maxBindingRemaining: 3,
            bindingOffsetX: 36,
            bindingOffsetY: -12,
          },
        ],
        requiredFinalActors: [{ actorId: "p1", source: "imported", actorKind: "player", targetCount: 0 }],
      },
    ],
  });
}

export function createSyntheticImportedTargetStateCustomTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedTargetScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-targetstate-custom-attacker",
    displayName: "Synthetic Imported TargetState Custom Attacker",
    targetStateRoute: {
      startStateNo: 888,
      chainStateNo: 889,
      changeStateAfter: 1,
      selfStateAfter: 2,
    },
  });
  const defender = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-targetstate-custom-defender",
    displayName: "Synthetic Imported TargetState Custom Defender",
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: defender, stage }), script, {
    label: "synthetic-imported-targetstate-custom-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-targetstate-custom-golden",
      label: "Synthetic imported TargetState owner-backed custom-state route",
      source: "imported",
      notes: [
        "Synthetic imported TargetState trace proves direct HitDef target memory can feed a typed TargetState controller that puts an imported defender into attacker-owned state data, keeps that ownership through ChangeState, and clears it through SelfState. It does not claim full throw, redirect, helper/root/parent, team, or exact MUGEN/IKEMEN custom-state parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-targetstate-custom-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200, 888, 889],
        requiredExecutedControllers: ["ChangeState", "HitDef", "TargetState", "SelfState"],
        requiredExecutedOperations: ["hitdef", "target:targetstate"],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["hit"],
        requiredCombatReasons: ["hit"],
        requiredTargetLinks: [{ ownerId: "p1", actorId: "p2", targetId: 77 }],
        requiredActorFrames: [
          { actorId: "p2", source: "imported", actorKind: "player", customOwnerId: "p1", animNo: 888, moveType: "H", minFrames: 1 },
          { actorId: "p2", source: "imported", actorKind: "player", customOwnerId: "p1", animNo: 889, moveType: "H", minFrames: 1 },
        ],
        requiredFinalActors: [
          { actorId: "p2", source: "imported", actorKind: "player", stateNo: 0, animNo: 0, ctrl: true, moveType: "I" },
        ],
      },
    ],
  });
}

export function createSyntheticImportedBindToTargetHeadTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedTargetScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-bindtotarget-head-attacker",
    displayName: "Synthetic Imported BindToTarget Head Attacker",
    withBindToTarget: true,
    bindToTargetPostype: "Head",
  });
  const target = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-bindtotarget-head-target",
    displayName: "Synthetic Imported BindToTarget Head Target",
    sizeConstants: {
      headPos: [6, -72],
    },
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: target, stage }), script, {
    label: "synthetic-imported-bindtotarget-head-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-bindtotarget-head-golden",
      label: "Synthetic imported BindToTarget Head anchor route",
      source: "imported",
      notes: [
        "Synthetic imported BindToTarget trace proves parsed target [Size] head.pos constants feed a bounded Head owner-to-target bind and expose the resolved offset in world target-link evidence.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-bindtotarget-head-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "HitDef", "BindToTarget"],
        requiredExecutedOperations: ["hitdef", "bindtotarget"],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["hit"],
        requiredCombatReasons: ["hit"],
        requiredTargetLinks: [
          { ownerId: "p1", actorId: "p2", targetId: 77 },
          {
            ownerId: "p1",
            actorId: "p2",
            targetId: 77,
            hasBinding: true,
            minFrames: 1,
            minAge: 1,
            minBindingRemaining: 1,
            maxBindingRemaining: 3,
            bindingOffsetX: 26,
            bindingOffsetY: -80,
          },
        ],
      },
    ],
  });
}

export function createSyntheticImportedBindToTargetMidTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedTargetScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-bindtotarget-mid-attacker",
    displayName: "Synthetic Imported BindToTarget Mid Attacker",
    withBindToTarget: true,
    bindToTargetPostype: "Mid",
  });
  const target = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-bindtotarget-mid-target",
    displayName: "Synthetic Imported BindToTarget Mid Target",
    sizeConstants: {
      midPos: [4, -42],
    },
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: target, stage }), script, {
    label: "synthetic-imported-bindtotarget-mid-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-bindtotarget-mid-golden",
      label: "Synthetic imported BindToTarget Mid anchor route",
      source: "imported",
      notes: [
        "Synthetic imported BindToTarget trace proves parsed target [Size] mid.pos constants feed a bounded Mid owner-to-target bind and expose the resolved offset in world target-link evidence.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-bindtotarget-mid-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "HitDef", "BindToTarget"],
        requiredExecutedOperations: ["hitdef", "bindtotarget"],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["hit"],
        requiredCombatReasons: ["hit"],
        requiredTargetLinks: [
          { ownerId: "p1", actorId: "p2", targetId: 77 },
          {
            ownerId: "p1",
            actorId: "p2",
            targetId: 77,
            hasBinding: true,
            minFrames: 1,
            minAge: 1,
            minBindingRemaining: 1,
            maxBindingRemaining: 3,
            bindingOffsetX: 24,
            bindingOffsetY: -50,
          },
        ],
      },
    ],
  });
}

export function createSyntheticImportedTargetBindPauseTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedTargetBindPauseScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-targetbind-pause-attacker",
    displayName: "Synthetic Imported TargetBind Pause Attacker",
    withPrePauseTargetBind: true,
    withDelayedSuperPause: true,
    pauseMovePosAdd: { x: 8, y: -2, time: 2 },
    action200Duration: 20,
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-targetbind-pause-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-targetbind-pause-golden",
      label: "Synthetic imported TargetBind during SuperPause route",
      source: "mixed",
      notes: [
        "Synthetic imported TargetBind pause trace proves a bound target remains linked while the source actor advances during SuperPause movetime. It does not claim full MUGEN/IKEMEN target ownership, throws, helper-owned targets, or pause-order parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-targetbind-pause-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "HitDef", "TargetBind", "SuperPause", { type: "PosAdd", minCount: 1 }],
        requiredExecutedOperations: ["hitdef", "target:targetbind", "pause:superpause", "kinematic:posadd"],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["hit", "pause"],
        requiredCombatReasons: ["hit"],
        requiredTargetLinks: [
          {
            ownerId: "p1",
            actorId: "p2",
            targetId: 77,
            hasBinding: true,
            minFrames: 2,
            minAge: 1,
            minBindingRemaining: 1,
            maxBindingRemaining: 3,
            bindingOffsetX: 36,
            bindingOffsetY: -12,
          },
        ],
        requiredMatchPauses: [{ type: "SuperPause", actorId: "p1", sourceStateNo: 200, darken: true, minFrames: 2, minRemaining: 6, minMoveTime: 0 }],
        requiredMatchPauseAdvances: [{ type: "SuperPause", actorId: "p1", minAdvancedFrames: 1, minPreviousMoveTime: 1 }],
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

export function createSyntheticImportedSuperPauseEffectFreezeTraceArtifact(
  options: RuntimeTraceGatePresetOptions = {},
): RuntimeTraceArtifact {
  const stage = options.stage ?? effectPauseStage();
  const script = importedSuperPauseEffectScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-superpause-effect-attacker",
    displayName: "Synthetic Imported SuperPause Effect Attacker",
    withSuperPause: true,
    withHelper: true,
    withExplod: true,
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-superpause-effect-freeze-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-superpause-effect-freeze-golden",
      label: "Synthetic imported SuperPause helper/explod freeze route",
      source: "mixed",
      notes: [
        "Synthetic imported SuperPause helper/explod trace proves visual effect actors participate in bounded source-movetime advance and freeze evidence. It does not claim full Helper VM, exact Explod binding parity, pause layering, or IKEMEN/MUGEN effect parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-superpause-effect-freeze-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredEffectKinds: ["helper", "explod"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "HitDef", "SuperPause", "Helper", "Explod"],
        requiredExecutedOperations: ["hitdef", "pause:superpause", "helper", "explod"],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["pause"],
        requiredWorldLifecycleEvents: [
          { type: "spawn", kind: "helper", ownerId: "p1", rootId: "p1", parentId: "p1" },
          { type: "spawn", kind: "explod", ownerId: "p1", rootId: "p1", parentId: "p1" },
        ],
        requiredEffectStores: [{ ownerId: "p1", minTotal: 2, minHelpers: 1, minExplods: 1, minNextHelperSerial: 1, minNextExplodSerial: 1 }],
        requiredMatchPauses: [{ type: "SuperPause", actorId: "p1", sourceStateNo: 200, darken: true, minFrames: 2, minRemaining: 7, minMoveTime: 1 }],
        requiredMatchPauseFreezes: [
          { type: "SuperPause", actorKind: "player", ownerId: "p2", minFrozenFrames: 6 },
          { type: "SuperPause", actorKind: "helper", ownerId: "p1", minFrozenFrames: 5 },
          { type: "SuperPause", actorKind: "explod", ownerId: "p1", minFrozenFrames: 5 },
        ],
        requiredMatchPauseAdvances: [
          { type: "SuperPause", actorKind: "helper", ownerId: "p1", minAdvancedFrames: 1, minPreviousMoveTime: 1 },
          { type: "SuperPause", actorKind: "explod", ownerId: "p1", minAdvancedFrames: 1, minPreviousMoveTime: 1 },
        ],
      },
    ],
  });
}

export function createSyntheticImportedExplodSuperMoveTimeTraceArtifact(
  options: RuntimeTraceGatePresetOptions = {},
): RuntimeTraceArtifact {
  const stage = options.stage ?? effectPauseStage();
  const script = importedSuperPauseEffectScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-explod-supermovetime-attacker",
    displayName: "Synthetic Imported Explod SuperMoveTime Attacker",
    withSuperPause: true,
    withExplod: true,
    withSuperMoveExplod: true,
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-explod-supermovetime-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-explod-supermovetime-golden",
      label: "Synthetic imported Explod supermovetime route",
      source: "mixed",
      notes: [
        "Synthetic imported Explod supermovetime trace proves one Explod freezes during SuperPause while another continues through its own supermovetime budget. It does not claim full pausemovetime, helper-owned Explod, binding, or IKEMEN pause layering parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-explod-supermovetime-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredEffectKinds: ["explod"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "HitDef", "SuperPause", { type: "Explod", minCount: 2 }],
        requiredExecutedOperations: ["hitdef", "pause:superpause", { operation: "explod", minCount: 2 }],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["pause"],
        requiredWorldLifecycleEvents: [{ type: "spawn", kind: "explod", ownerId: "p1", rootId: "p1", parentId: "p1" }],
        requiredEffectStores: [{ ownerId: "p1", minTotal: 2, minExplods: 2, minNextExplodSerial: 2 }],
        requiredMatchPauses: [{ type: "SuperPause", actorId: "p1", sourceStateNo: 200, darken: true, minFrames: 2, minRemaining: 7, minMoveTime: 1 }],
        requiredMatchPauseFreezes: [{ type: "SuperPause", actorId: "p1-explod-0", actorKind: "explod", ownerId: "p1", minFrozenFrames: 5 }],
        requiredMatchPauseAdvances: [
          { type: "SuperPause", actorId: "p1-explod-1", actorKind: "explod", ownerId: "p1", minAdvancedFrames: 3, minPreviousMoveTime: 0 },
        ],
      },
    ],
  });
}

export function createSyntheticImportedExplodPauseMoveTimeTraceArtifact(
  options: RuntimeTraceGatePresetOptions = {},
): RuntimeTraceArtifact {
  const stage = options.stage ?? effectPauseStage();
  const script = importedPauseEffectScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-explod-pausemovetime-attacker",
    displayName: "Synthetic Imported Explod PauseMoveTime Attacker",
    withPause: true,
    withExplod: true,
    withPauseMoveExplod: true,
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-explod-pausemovetime-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-explod-pausemovetime-golden",
      label: "Synthetic imported Explod pausemovetime route",
      source: "mixed",
      notes: [
        "Synthetic imported Explod pausemovetime trace proves one Explod freezes during Pause while another continues through its own pausemovetime budget. It does not claim SuperPause, helper-owned Explod, binding, or IKEMEN pause layering parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-explod-pausemovetime-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredEffectKinds: ["explod"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "HitDef", "Pause", { type: "Explod", minCount: 2 }],
        requiredExecutedOperations: ["hitdef", "pause:pause", { operation: "explod", minCount: 2 }],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["pause"],
        requiredWorldLifecycleEvents: [{ type: "spawn", kind: "explod", ownerId: "p1", rootId: "p1", parentId: "p1" }],
        requiredEffectStores: [{ ownerId: "p1", minTotal: 2, minExplods: 2, minNextExplodSerial: 2 }],
        requiredMatchPauses: [{ type: "Pause", actorId: "p1", sourceStateNo: 200, darken: false, minFrames: 2, minRemaining: 7, minMoveTime: 1 }],
        requiredMatchPauseFreezes: [{ type: "Pause", actorId: "p1-explod-0", actorKind: "explod", ownerId: "p1", minFrozenFrames: 5 }],
        requiredMatchPauseAdvances: [
          { type: "Pause", actorId: "p1-explod-1", actorKind: "explod", ownerId: "p1", minAdvancedFrames: 3, minPreviousMoveTime: 0 },
        ],
      },
    ],
  });
}

export function createSyntheticImportedExplodIgnoreHitPauseTraceArtifact(
  options: RuntimeTraceGatePresetOptions = {},
): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedExplodScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-explod-ignorehitpause-attacker",
    displayName: "Synthetic Imported Explod IgnoreHitPause Attacker",
    withHitPauseExplods: true,
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-explod-ignorehitpause-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-explod-ignorehitpause-golden",
      label: "Synthetic imported Explod ignorehitpause route",
      source: "mixed",
      notes: [
        "Synthetic imported Explod ignorehitpause trace proves one Explod freezes during hitpause while another continues through ignorehitpause = 1. It does not claim exact MUGEN/IKEMEN hitpause layering, helper-owned Explod, binding, or full pause controller parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-explod-ignorehitpause-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredEffectKinds: ["explod"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "HitDef", { type: "Explod", minCount: 2 }],
        requiredExecutedOperations: ["hitdef", { operation: "explod", minCount: 2 }],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["hit"],
        requiredCombatReasons: ["hit"],
        requiredWorldLifecycleEvents: [{ type: "spawn", kind: "explod", ownerId: "p1", rootId: "p1", parentId: "p1" }],
        requiredEffectStores: [{ ownerId: "p1", minTotal: 2, minExplods: 2, minNextExplodSerial: 2 }],
        requiredMatchPauseFreezes: [
          { type: "HitPause", actorId: "p1-explod-0", actorKind: "explod", ownerId: "p1", minFrozenFrames: 3 },
        ],
        requiredMatchPauseAdvances: [
          {
            type: "HitPause",
            actorId: "p1-explod-1",
            actorKind: "explod",
            ownerId: "p1",
            minAdvancedFrames: 3,
            minPreviousMoveTime: 1,
          },
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
    projectileHitAnim: 911,
    projHitStateNo: 270,
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
        "Synthetic imported Projectile trace proves Projectile controllers compile into typed projectile operations, spawn bounded colliding effect actors, evaluate a bounded ProjHit(77) branch back in the owner state, and play a bounded visible hit terminal animation when projhitanim resolves to an AIR action. Projectile-vs-projectile trade/cancel is covered by separate bounded clash gates; exact priority classes, exact trigger timing, exact terminal animation timing, and remove/cancel playback parity remain future work.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-projectile-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredEffectKinds: ["projectile"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200, 270],
        requiredExecutedControllers: ["ChangeState", "HitDef", "Projectile"],
        requiredExecutedOperations: ["hitdef", "projectile"],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["hit"],
        requiredCombatReasons: ["hit"],
        requiredActorFrames: [{ source: "effect", actorKind: "projectile", ownerId: "p1", animNo: 911, moveType: "I", clsn1Count: 0 }],
        requiredWorldLifecycleEvents: [
          { type: "spawn", kind: "projectile", ownerId: "p1", rootId: "p1", parentId: "p1" },
          { type: "remove", kind: "projectile", ownerId: "p1", rootId: "p1", parentId: "p1" },
        ],
        requiredEffectStores: [{ ownerId: "p1", minTotal: 1, minProjectiles: 1, minNextProjectileSerial: 1 }],
        requiredEffectPayloads: [
          { kind: "projectile", ownerId: "p1", effectId: 77, hasHit: true, removalReason: "hit", terminalReason: "hit" },
        ],
        requiredTargetLinks: [{ ownerId: "p1", actorId: "p2", targetId: 77 }],
      },
    ],
  });
}

export function createSyntheticImportedProjectileReceivedDamageTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? projectileCombatStage();
  const script = importedProjectileScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-projectile-receiveddamage-attacker",
    displayName: "Synthetic Imported Projectile ReceivedDamage Attacker",
    withProjectile: true,
    projectileHitAnim: 911,
  });
  const defender = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-projectile-receiveddamage-defender",
    displayName: "Synthetic Imported Projectile ReceivedDamage Defender",
    receivedDamageRoute: { sourceStateNo: 5000, finalStateNo: 280 },
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: defender, stage }), script, {
    label: "synthetic-imported-projectile-receiveddamage-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-projectile-receiveddamage-golden",
      label: "Synthetic imported Projectile ReceivedDamage route",
      source: "mixed",
      notes: [
        "Synthetic imported Projectile ReceivedDamage trace proves a bounded projectile hit can route an imported defender into its default get-hit state, mark defender-local received damage and hits, then branch through ReceivedDamage > 0 and ReceivedHits >= 1. Projectile guard, target-controller damage, helpers, custom states, and exact timing parity remain future work.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-projectile-receiveddamage-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredEffectKinds: ["projectile"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200, 5000, 280],
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
        requiredEffectPayloads: [
          { kind: "projectile", ownerId: "p1", effectId: 77, hasHit: true, removalReason: "hit", terminalReason: "hit" },
        ],
        requiredTargetLinks: [{ ownerId: "p1", actorId: "p2", targetId: 77 }],
        requiredFinalActors: [{ actorId: "p2", source: "imported", actorKind: "player", stateNo: 280 }],
      },
    ],
  });
}

export function createSyntheticImportedProjectileTimeTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? projectileCombatStage();
  const script = importedProjectileScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-projectile-time-attacker",
    displayName: "Synthetic Imported Projectile Time Attacker",
    withProjectile: true,
    projectileHitAnim: 911,
    projHitTimeStateNo: 276,
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-projectile-time-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-projectile-time-golden",
      label: "Synthetic imported Projectile time trigger route",
      source: "mixed",
      notes: [
        "Synthetic imported Projectile time trace proves bounded ProjHitTime(77) can branch after the current owner records a projectile hit. It does not claim exact MUGEN/IKEMEN pause/tick-order, multi-projectile, helper-owned projectile, or target-selection parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-projectile-time-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredEffectKinds: ["projectile"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200, 276],
        requiredExecutedControllers: ["ChangeState", "HitDef", "Projectile"],
        requiredExecutedOperations: ["hitdef", "projectile"],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["hit"],
        requiredCombatReasons: ["hit"],
        requiredWorldLifecycleEvents: [
          { type: "spawn", kind: "projectile", ownerId: "p1", rootId: "p1", parentId: "p1" },
          { type: "remove", kind: "projectile", ownerId: "p1", rootId: "p1", parentId: "p1" },
        ],
        requiredEffectStores: [{ ownerId: "p1", minNextProjectileSerial: 1 }],
        requiredTargetLinks: [{ ownerId: "p1", actorId: "p2", targetId: 77 }],
      },
    ],
  });
}

export function createSyntheticImportedProjectileMotionTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? effectPauseStage();
  const script = importedProjectileMotionScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-projectile-motion-attacker",
    displayName: "Synthetic Imported Projectile Motion Attacker",
    withProjectile: true,
    projectileOffset: [80, -45],
    projectileVelocity: [2, -1],
    projectileAccel: [1, 0.25],
    projectileScale: [1.75, 0.5],
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-projectile-motion-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-projectile-motion-golden",
      label: "Synthetic imported Projectile motion route",
      source: "mixed",
      notes: [
        "Synthetic imported Projectile motion trace proves bounded Projectile accel plus projscale survive typed/raw controller paths into effect actor motion and render-scale evidence. It does not claim exact MUGEN/IKEMEN projectile velmul, remove bounds, contact timing, hitbox scaling, or full projectile parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-projectile-motion-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredEffectKinds: ["projectile"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "HitDef", "Projectile"],
        requiredExecutedOperations: ["hitdef", "projectile"],
        requiredActiveCommands: ["x"],
        requiredWorldLifecycleEvents: [{ type: "spawn", kind: "projectile", ownerId: "p1", rootId: "p1", parentId: "p1" }],
        requiredEffectStores: [{ ownerId: "p1", minTotal: 1, minProjectiles: 1, minNextProjectileSerial: 1 }],
        requiredEffectPayloads: [{ kind: "projectile", ownerId: "p1", effectId: 77, minAge: 2 }],
        requiredActorFrames: [
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
        ],
      },
    ],
  });
}

export function createSyntheticImportedProjectileVelMulTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? effectPauseStage();
  const script = importedProjectileVelMulScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-projectile-velmul-attacker",
    displayName: "Synthetic Imported Projectile VelMul Attacker",
    withProjectile: true,
    projectileOffset: [80, -45],
    projectileVelocity: [16, 0],
    projectileVelocityMultiplier: [0.5, 1],
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-projectile-velmul-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-projectile-velmul-golden",
      label: "Synthetic imported Projectile velocity multiplier route",
      source: "mixed",
      notes: [
        "Synthetic imported Projectile velmul trace proves bounded Projectile velocity multipliers survive typed/raw controller paths and affect observed effect velocity. It does not claim exact MUGEN/IKEMEN projectile tick order, contact timing, hitbox scaling, or full projectile parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-projectile-velmul-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredEffectKinds: ["projectile"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "HitDef", "Projectile"],
        requiredExecutedOperations: ["hitdef", "projectile"],
        requiredActiveCommands: ["x"],
        requiredWorldLifecycleEvents: [{ type: "spawn", kind: "projectile", ownerId: "p1", rootId: "p1", parentId: "p1" }],
        requiredEffectStores: [{ ownerId: "p1", minTotal: 1, minProjectiles: 1, minNextProjectileSerial: 1 }],
        requiredEffectPayloads: [{ kind: "projectile", ownerId: "p1", effectId: 77, minAge: 2 }],
        requiredActorFrames: [
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
        ],
      },
    ],
  });
}

export function createSyntheticImportedModifyProjectileTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? effectPauseStage();
  const script = importedProjectileMotionScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-modifyprojectile-attacker",
    displayName: "Synthetic Imported ModifyProjectile Attacker",
    withProjectile: true,
    projectileOffset: [80, -45],
    projectileVelocity: [1, 0],
    withModifyProjectile: true,
    modifyProjectileTriggerTime: 3,
    modifyProjectileVelocity: [12, -1],
    modifyProjectileAccel: [0, 0.25],
    modifyProjectileVelocityMultiplier: [0.75, 1],
    modifyProjectileScale: [2, 0.5],
    modifyProjectileRemoveTime: 18,
    modifyProjectilePriority: 3,
    modifyProjectileHits: 4,
    modifyProjectileMissTime: 5,
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-modifyprojectile-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-modifyprojectile-golden",
      label: "Synthetic imported ModifyProjectile route",
      source: "mixed",
      notes: [
        "Synthetic imported ModifyProjectile trace proves a bounded owner-side ModifyProjectile controller can mutate a live projectile's static velocity, acceleration, velocity multiplier, scale, priority, hit budget, miss time, and remove time through the shared effect actor world. It does not claim exact MUGEN/IKEMEN tick order, dynamic expressions, helper-owned projectiles, redirects, multi-projectile selection parity, or full projectile lifecycle parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-modifyprojectile-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredEffectKinds: ["projectile"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "HitDef", "Projectile", "ModifyProjectile"],
        requiredExecutedOperations: ["hitdef", "projectile", "modifyprojectile"],
        requiredActiveCommands: ["x"],
        requiredWorldLifecycleEvents: [{ type: "spawn", kind: "projectile", ownerId: "p1", rootId: "p1", parentId: "p1" }],
        requiredEffectStores: [{ ownerId: "p1", minTotal: 1, minProjectiles: 1, minNextProjectileSerial: 1 }],
        requiredEffectPayloads: [
          { kind: "projectile", ownerId: "p1", effectId: 77, minAge: 3, minPriority: 3, minHitsRemaining: 4, scaleX: 2, scaleY: 0.5 },
        ],
        requiredActorFrames: [
          {
            source: "effect",
            actorKind: "projectile",
            ownerId: "p1",
            animNo: 910,
            moveType: "A",
            minFrames: 3,
            observedVelXAtLeast: 8,
            observedScaleXAtLeast: 2,
            observedScaleXAtMost: 2,
            observedScaleYAtLeast: 0.5,
            observedScaleYAtMost: 0.5,
          },
        ],
      },
    ],
  });
}

export function createSyntheticImportedProjectileContactTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? projectileCombatStage();
  const script = importedProjectileScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-projectile-contact-attacker",
    displayName: "Synthetic Imported Projectile Contact Attacker",
    withProjectile: true,
    projectileHitAnim: 911,
    projContactStateNo: 272,
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-projectile-contact-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-projectile-contact-golden",
      label: "Synthetic imported Projectile contact route",
      source: "mixed",
      notes: [
        "Synthetic imported Projectile contact trace proves a bounded Projectile contact can evaluate a ProjContact(77) branch back in the owner state. Exact trigger timing, multi-target lifetime, helper ownership, and IKEMEN projectile parity remain future work.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-projectile-contact-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredEffectKinds: ["projectile"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200, 272],
        requiredExecutedControllers: ["ChangeState", "HitDef", "Projectile"],
        requiredExecutedOperations: ["hitdef", "projectile"],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["hit"],
        requiredCombatReasons: ["hit"],
        requiredWorldLifecycleEvents: [
          { type: "spawn", kind: "projectile", ownerId: "p1", rootId: "p1", parentId: "p1" },
          { type: "active", kind: "projectile", ownerId: "p1", rootId: "p1", parentId: "p1" },
          { type: "remove", kind: "projectile", ownerId: "p1", rootId: "p1", parentId: "p1" },
        ],
        requiredEffectStores: [{ ownerId: "p1", minNextProjectileSerial: 1 }],
        requiredTargetLinks: [{ ownerId: "p1", actorId: "p2", targetId: 77 }],
      },
    ],
  });
}

export function createSyntheticImportedProjectileMultiHitTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? projectileCombatStage();
  const script = importedProjectileMultiHitScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-projectile-multihit-attacker",
    displayName: "Synthetic Imported Projectile Multi-Hit Attacker",
    withProjectile: true,
    projectileOffset: [300, -45],
    projectileVelocity: [0, 0],
    projectileGroundVelocity: [0],
    projectileHits: 2,
    projectileMissTime: 3,
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-projectile-multihit-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-projectile-multihit-golden",
      label: "Synthetic imported Projectile multi-hit route",
      source: "mixed",
      notes: [
        "Synthetic imported Projectile multi-hit trace verifies the bounded projhits/projmisstime path where one projectile can hit twice with a cooldown before removal. It does not claim exact MUGEN/IKEMEN projectile hitpause layering, cancel/remove animations, helper-owned projectiles, or full multi-target projectile parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-projectile-multihit-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredEffectKinds: ["projectile"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "HitDef", "Projectile"],
        requiredExecutedOperations: ["hitdef", "projectile"],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["hit"],
        requiredEventSubstrings: ["projectile hit", "hits remaining 1", "miss 3", "hits remaining 0"],
        requiredCombatReasons: ["hit"],
        requiredWorldLifecycleEvents: [
          { type: "spawn", kind: "projectile", ownerId: "p1", rootId: "p1", parentId: "p1" },
          { type: "active", kind: "projectile", ownerId: "p1", rootId: "p1", parentId: "p1" },
          { type: "remove", kind: "projectile", ownerId: "p1", rootId: "p1", parentId: "p1" },
        ],
        requiredEffectStores: [{ ownerId: "p1", minNextProjectileSerial: 1 }],
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
    projGuardStateNo: 271,
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
        "Synthetic imported Projectile guard trace verifies that Projectile controllers can carry typed guard params, resolve a held-back projectile block through the shared partial hit/guard combat path, and evaluate a bounded ProjGuarded(77) branch back in the owner state. Projectile-vs-projectile trade/cancel is covered by a separate bounded clash gate; exact trigger timing, guard-state timing, sparks, sounds, cancel animations, remove animations, and IKEMEN projectile parity remain future work.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-projectile-guard-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredEffectKinds: ["projectile"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200, 271],
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
    projectileCancelAnim: 913,
  });
  const p2 = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-projectile-clash-p2",
    displayName: "Synthetic Imported Projectile Clash P2",
    withProjectile: true,
    projectilePriority: 1,
    projectileOffset: [100, -45],
    projectileCancelAnim: 914,
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
        "Synthetic imported Projectile clash trace verifies the bounded partial projectile-vs-projectile path: equal projpriority projectiles trade, preserve projcancelanim metadata in runtime removal evidence, play bounded visible cancel terminal animations when the actions exist, and are removed through the effect actor world. It does not claim exact MUGEN/IKEMEN projectile priority classes, exact cancel timing, remove animations, helpers, or projectile owner binding parity.",
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
        requiredEventSubstrings: ["Projectile clash", "p1-projectile-0 cancel removal anim 913", "p2-projectile-0 cancel removal anim 914"],
        requiredActorFrames: [
          { source: "effect", actorKind: "projectile", ownerId: "p1", animNo: 913, moveType: "I", clsn1Count: 0 },
          { source: "effect", actorKind: "projectile", ownerId: "p2", animNo: 914, moveType: "I", clsn1Count: 0 },
        ],
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

export function createSyntheticImportedProjectilePriorityCancelTraceArtifact(
  options: RuntimeTraceGatePresetOptions = {},
): RuntimeTraceArtifact {
  const stage = options.stage ?? projectileClashStage();
  const script = importedProjectilePriorityCancelScript();
  const p1 = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-projectile-priority-cancel-p1",
    displayName: "Synthetic Imported Projectile Priority P1",
    withProjectile: true,
    projectilePriority: 3,
    projectileOffset: [100, -45],
  });
  const p2 = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-projectile-priority-cancel-p2",
    displayName: "Synthetic Imported Projectile Priority P2",
    withProjectile: true,
    projectilePriority: 1,
    projectileOffset: [100, -45],
    projectileCancelAnim: 915,
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1, p2, stage }), script, {
    label: "synthetic-imported-projectile-priority-cancel-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-projectile-priority-cancel-golden",
      label: "Synthetic imported Projectile priority cancel route",
      source: "imported",
      notes: [
        "Synthetic imported Projectile priority trace verifies the bounded partial projectile-vs-projectile path where the higher projpriority projectile cancels the lower priority projectile, preserves the loser's projcancelanim metadata in runtime removal evidence, plays bounded visible loser cancel terminal animation when the action exists, decrements the winner's remaining priority by 1, and keeps the winner in the effect store. It does not claim exact MUGEN/IKEMEN projectile priority classes, exact cancel timing, remove animations, helper-owned projectiles, or full timing parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-projectile-priority-cancel-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredEffectKinds: ["projectile"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "HitDef", "Projectile"],
        requiredExecutedOperations: ["hitdef", "projectile"],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["runtime"],
        requiredEventSubstrings: ["Projectile clash", "canceled", "3 > 1", "winner priority 3 -> 2", "p2-projectile-0 cancel removal anim 915"],
        requiredActorFrames: [{ source: "effect", actorKind: "projectile", ownerId: "p2", animNo: 915, moveType: "I", clsn1Count: 0 }],
        requiredWorldLifecycleEvents: [
          { type: "spawn", kind: "projectile", ownerId: "p1", rootId: "p1", parentId: "p1" },
          { type: "spawn", kind: "projectile", ownerId: "p2", rootId: "p2", parentId: "p2" },
          { type: "remove", kind: "projectile", ownerId: "p2", rootId: "p2", parentId: "p2" },
          { type: "active", kind: "projectile", ownerId: "p1", rootId: "p1", parentId: "p1" },
        ],
        requiredEffectStores: [
          { ownerId: "p1", minTotal: 1, minProjectiles: 1, minNextProjectileSerial: 1 },
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
        requiredEffectPayloads: [{ kind: "helper", ownerId: "p1", effectId: 42, name: "Buddy", helperStateNo: 1200, minAge: 1 }],
      },
    ],
  });
}

export function createSyntheticImportedHelperVelocityTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? farCombatStage();
  const script = importedHelperScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-helper-velocity-attacker",
    displayName: "Synthetic Imported Helper Velocity Attacker",
    withHelper: true,
    helperVelocity: [3, -1],
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-helper-velocity-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-helper-velocity-golden",
      label: "Synthetic imported Helper velocity route",
      source: "mixed",
      notes: [
        "Synthetic imported Helper velocity trace proves a bounded visual Helper can consume static velset params and expose moving position plus velocity in trace evidence. It does not claim helper VM, helper physics, redirects, helper combat, DestroySelf, or exact MUGEN/IKEMEN helper parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-helper-velocity-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredEffectKinds: ["helper"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "HitDef", "Helper"],
        requiredExecutedOperations: ["hitdef", "helper"],
        requiredActiveCommands: ["x"],
        requiredActorFrames: [
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
        ],
        requiredWorldLifecycleEvents: [
          { type: "spawn", kind: "helper", ownerId: "p1", rootId: "p1", parentId: "p1" },
          { type: "active", kind: "helper", ownerId: "p1", rootId: "p1", parentId: "p1" },
        ],
        requiredEffectStores: [{ ownerId: "p1", minTotal: 1, minHelpers: 1, minNextHelperSerial: 1 }],
        requiredEffectPayloads: [{ kind: "helper", ownerId: "p1", effectId: 42, name: "Buddy", helperStateNo: 1200, minAge: 1 }],
      },
    ],
  });
}

export function createSyntheticImportedHelperScaleTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? farCombatStage();
  const script = importedHelperScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-helper-scale-attacker",
    displayName: "Synthetic Imported Helper Scale Attacker",
    withHelper: true,
    helperScale: [2, 0.5],
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-helper-scale-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-helper-scale-golden",
      label: "Synthetic imported Helper scale route",
      source: "mixed",
      notes: [
        "Synthetic imported Helper scale trace proves a bounded visual Helper can consume static scale params and expose render-scale trace evidence. It does not claim helper VM, palette ownership, helper collision scale parity, helper physics, or exact MUGEN/IKEMEN helper parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-helper-scale-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredEffectKinds: ["helper"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "HitDef", "Helper"],
        requiredExecutedOperations: ["hitdef", "helper"],
        requiredActiveCommands: ["x"],
        requiredActorFrames: [
          {
            source: "effect",
            actorKind: "helper",
            ownerId: "p1",
            animNo: 920,
            observedScaleXAtLeast: 2,
            observedScaleYAtMost: 0.5,
            minFrames: 1,
          },
        ],
        requiredWorldLifecycleEvents: [
          { type: "spawn", kind: "helper", ownerId: "p1", rootId: "p1", parentId: "p1" },
          { type: "active", kind: "helper", ownerId: "p1", rootId: "p1", parentId: "p1" },
        ],
        requiredEffectStores: [{ ownerId: "p1", minTotal: 1, minHelpers: 1, minNextHelperSerial: 1 }],
        requiredEffectPayloads: [{ kind: "helper", ownerId: "p1", effectId: 42, name: "Buddy", helperStateNo: 1200, scaleX: 2, scaleY: 0.5 }],
      },
    ],
  });
}

export function createSyntheticImportedHelperSuperMoveTimeTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? effectPauseStage();
  const script = importedSuperPauseEffectScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-helper-supermovetime-attacker",
    displayName: "Synthetic Imported Helper SuperMoveTime Attacker",
    withSuperPause: true,
    withHelper: true,
    helperSuperMoveTime: 4,
    withExplod: true,
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-helper-supermovetime-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-helper-supermovetime-golden",
      label: "Synthetic imported Helper supermovetime route",
      source: "mixed",
      notes: [
        "Synthetic imported Helper supermovetime trace proves one visual Helper continues through its own bounded supermovetime budget after source SuperPause movetime expires. It does not claim helper VM, exact helper pause layering, helper combat, redirects, or full MUGEN/IKEMEN Helper parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-helper-supermovetime-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredEffectKinds: ["helper", "explod"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "HitDef", "SuperPause", "Helper", "Explod"],
        requiredExecutedOperations: ["hitdef", "pause:superpause", "helper", "explod"],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["pause"],
        requiredWorldLifecycleEvents: [
          { type: "spawn", kind: "helper", ownerId: "p1", rootId: "p1", parentId: "p1" },
          { type: "spawn", kind: "explod", ownerId: "p1", rootId: "p1", parentId: "p1" },
        ],
        requiredEffectStores: [{ ownerId: "p1", minTotal: 2, minHelpers: 1, minExplods: 1, minNextHelperSerial: 1, minNextExplodSerial: 1 }],
        requiredEffectPayloads: [
          { kind: "helper", ownerId: "p1", effectId: 42, name: "Buddy", helperStateNo: 1200, minSuperMoveTime: 1 },
        ],
        requiredMatchPauses: [{ type: "SuperPause", actorId: "p1", sourceStateNo: 200, darken: true, minFrames: 2, minRemaining: 7, minMoveTime: 1 }],
        requiredMatchPauseFreezes: [
          { type: "SuperPause", actorKind: "player", ownerId: "p2", minFrozenFrames: 6 },
          { type: "SuperPause", actorKind: "explod", ownerId: "p1", minFrozenFrames: 5 },
        ],
        requiredMatchPauseAdvances: [
          { type: "SuperPause", actorKind: "helper", ownerId: "p1", minAdvancedFrames: 3, minPreviousMoveTime: 0 },
        ],
      },
    ],
  });
}

export function createSyntheticImportedHelperPauseMoveTimeTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? effectPauseStage();
  const script = importedPauseEffectScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-helper-pausemovetime-attacker",
    displayName: "Synthetic Imported Helper PauseMoveTime Attacker",
    withPause: true,
    withHelper: true,
    helperPauseMoveTime: 4,
    withExplod: true,
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-helper-pausemovetime-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-helper-pausemovetime-golden",
      label: "Synthetic imported Helper pausemovetime route",
      source: "mixed",
      notes: [
        "Synthetic imported Helper pausemovetime trace proves one visual Helper continues through its own bounded pausemovetime budget after source Pause movetime expires. It does not claim helper VM, exact helper pause layering, helper combat, redirects, or full MUGEN/IKEMEN Helper parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-helper-pausemovetime-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredEffectKinds: ["helper", "explod"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "HitDef", "Pause", "Helper", "Explod"],
        requiredExecutedOperations: ["hitdef", "pause:pause", "helper", "explod"],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["pause"],
        requiredWorldLifecycleEvents: [
          { type: "spawn", kind: "helper", ownerId: "p1", rootId: "p1", parentId: "p1" },
          { type: "spawn", kind: "explod", ownerId: "p1", rootId: "p1", parentId: "p1" },
        ],
        requiredEffectStores: [{ ownerId: "p1", minTotal: 2, minHelpers: 1, minExplods: 1, minNextHelperSerial: 1, minNextExplodSerial: 1 }],
        requiredEffectPayloads: [
          { kind: "helper", ownerId: "p1", effectId: 42, name: "Buddy", helperStateNo: 1200, minPauseMoveTime: 1 },
        ],
        requiredMatchPauses: [{ type: "Pause", actorId: "p1", sourceStateNo: 200, darken: false, minFrames: 2, minRemaining: 7, minMoveTime: 1 }],
        requiredMatchPauseFreezes: [
          { type: "Pause", actorKind: "player", ownerId: "p2", minFrozenFrames: 6 },
          { type: "Pause", actorKind: "explod", ownerId: "p1", minFrozenFrames: 5 },
        ],
        requiredMatchPauseAdvances: [
          { type: "Pause", actorKind: "helper", ownerId: "p1", minAdvancedFrames: 3, minPreviousMoveTime: 0 },
        ],
      },
    ],
  });
}

export function createSyntheticImportedHelperIgnoreHitPauseTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedExplodScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-helper-ignorehitpause-attacker",
    displayName: "Synthetic Imported Helper IgnoreHitPause Attacker",
    withHelper: true,
    helperIgnoreHitPause: true,
    helperTriggerTime: 0,
    withHitPauseExplods: true,
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-helper-ignorehitpause-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-helper-ignorehitpause-golden",
      label: "Synthetic imported Helper ignorehitpause route",
      source: "mixed",
      notes: [
        "Synthetic imported Helper ignorehitpause trace proves one visual Helper advances through hitpause while a sibling visual Explod freezes. It does not claim helper VM, exact hitpause layering, helper combat, redirects, or full MUGEN/IKEMEN Helper parity.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-helper-ignorehitpause-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredEffectKinds: ["helper", "explod"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "HitDef", "Helper", { type: "Explod", minCount: 2 }],
        requiredExecutedOperations: ["hitdef", "helper", { operation: "explod", minCount: 2 }],
        requiredActiveCommands: ["x"],
        requiredEventCategories: ["hit"],
        requiredCombatReasons: ["hit"],
        requiredWorldLifecycleEvents: [
          { type: "spawn", kind: "helper", ownerId: "p1", rootId: "p1", parentId: "p1" },
          { type: "spawn", kind: "explod", ownerId: "p1", rootId: "p1", parentId: "p1" },
        ],
        requiredEffectStores: [{ ownerId: "p1", minTotal: 3, minHelpers: 1, minExplods: 2, minNextHelperSerial: 1, minNextExplodSerial: 2 }],
        requiredEffectPayloads: [
          { kind: "helper", ownerId: "p1", effectId: 42, name: "Buddy", helperStateNo: 1200, ignoreHitPause: true },
        ],
        requiredMatchPauseFreezes: [
          { type: "HitPause", actorKind: "explod", ownerId: "p1", minFrozenFrames: 3 },
        ],
        requiredMatchPauseAdvances: [
          { type: "HitPause", actorKind: "helper", ownerId: "p1", minAdvancedFrames: 3, minPreviousMoveTime: 1 },
        ],
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
        "Synthetic imported Explod trace proves Explod controllers compile into typed explod operations and spawn bounded visual effect actors. It does not claim exact binding, exact velocity, exact scaling parity, ownpal, FightFX/common animation, or remove-trigger parity; separate Explod bind, velocity, and scale traces cover bounded owner-side bindtime, vel/accel movement, and static render scale.",
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
        requiredEffectPayloads: [{ kind: "explod", ownerId: "p1", effectId: 9000, minAge: 1 }],
      },
    ],
  });
}

export function createSyntheticImportedExplodVelocityTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? farCombatStage();
  const script = importedExplodScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-explod-velocity",
    displayName: "Synthetic Imported Explod Velocity",
    withMovingExplod: true,
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-explod-velocity-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-explod-velocity-golden",
      label: "Synthetic imported Explod velocity route",
      source: "mixed",
      notes: [
        "Synthetic imported Explod velocity trace proves bounded visual Explod actors consume vel/accel params and expose moving positions/velocity in trace evidence. It does not claim exact bindtime parity, removetime parity, exact scaling parity, ownpal, or exact MUGEN/IKEMEN Explod physics.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-explod-velocity-golden",
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
        requiredEffectPayloads: [{ kind: "explod", ownerId: "p1", effectId: 9001, minAge: 1 }],
        requiredActorFrames: [
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
        ],
      },
    ],
  });
}

export function createSyntheticImportedExplodBindTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? farCombatStage();
  const script = importedExplodScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-explod-bind",
    displayName: "Synthetic Imported Explod Bind",
    withBoundExplod: true,
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-explod-bind-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-explod-bind-golden",
      label: "Synthetic imported Explod bindtime route",
      source: "mixed",
      notes: [
        "Synthetic imported Explod bind trace proves bounded owner-side bindtime follows p1/front/back anchors while the owner moves. It does not claim p2 binding, exact bind tick order, remove-trigger parity, exact scaling parity, ownpal, or FightFX/common animation routing.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-explod-bind-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredEffectKinds: ["explod"],
        requiredRoutedStates: [200],
        requiredExecutedStates: [200],
        requiredExecutedControllers: ["ChangeState", "HitDef", "Explod", "PosAdd"],
        requiredExecutedOperations: ["hitdef", "explod", "kinematic:posadd"],
        requiredActiveCommands: ["x"],
        requiredWorldLifecycleEvents: [
          { type: "spawn", kind: "explod", ownerId: "p1", rootId: "p1", parentId: "p1" },
          { type: "active", kind: "explod", ownerId: "p1", rootId: "p1", parentId: "p1" },
        ],
        requiredEffectStores: [{ ownerId: "p1", minTotal: 1, minExplods: 1, minNextExplodSerial: 1 }],
        requiredEffectPayloads: [{ kind: "explod", ownerId: "p1", effectId: 9002, maxBindRemaining: 7 }],
        requiredActorFrames: [
          {
            actorKind: "explod",
            ownerId: "p1",
            animNo: 932,
            minFrames: 3,
            observedPosXAtMost: -120,
            observedPosXAtLeast: -80,
          },
        ],
      },
    ],
  });
}

export function createSyntheticImportedExplodScaleTraceArtifact(options: RuntimeTraceGatePresetOptions = {}): RuntimeTraceArtifact {
  const stage = options.stage ?? farCombatStage();
  const script = importedExplodScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-explod-scale",
    displayName: "Synthetic Imported Explod Scale",
    withScaledExplod: true,
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: demoFighters[1]!, stage }), script, {
    label: "synthetic-imported-explod-scale-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-explod-scale-golden",
      label: "Synthetic imported Explod scale route",
      source: "mixed",
      notes: [
        "Synthetic imported Explod scale trace proves bounded visual Explod actors consume static scale params and expose renderer snapshot scale evidence. It does not claim exact MUGEN/IKEMEN Explod scaling parity, scale tick order, palette ownership, FightFX/common animation routing, or helper/projectile scaling behavior.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-explod-scale-golden",
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
        requiredEffectPayloads: [{ kind: "explod", ownerId: "p1", effectId: 9003, scaleX: 2, scaleY: 0.5 }],
        requiredActorFrames: [
          {
            actorKind: "explod",
            ownerId: "p1",
            animNo: 933,
            minFrames: 3,
            observedScaleXAtLeast: 2,
            observedScaleYAtMost: 0.5,
          },
        ],
      },
    ],
  });
}

export function createSyntheticImportedExplodRemoveOnGetHitTraceArtifact(
  options: RuntimeTraceGatePresetOptions = {},
): RuntimeTraceArtifact {
  const stage = options.stage ?? closeCombatStage();
  const script = importedRemoveOnGetHitExplodScript();
  const defender = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-explod-removeongethit",
    displayName: "Synthetic Imported Explod RemoveOnGetHit",
    passiveRemoveOnGetHitExplod: true,
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: demoFighters[0]!, p2: defender, stage }), script, {
    label: "synthetic-imported-explod-removeongethit-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-explod-removeongethit-golden",
      label: "Synthetic imported Explod removeongethit route",
      source: "mixed",
      notes: [
        "Synthetic imported Explod removeongethit trace proves a bounded owner-side Explod flagged removeongethit = 1 is removed when that owner enters the current direct get-hit route. It does not claim exact MUGEN/IKEMEN tick order, helper-owned Explods, or custom-state edge cases.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-explod-removeongethit-golden",
        requiredActorSources: ["demo", "imported"],
        requiredActorKinds: ["player"],
        requiredEffectKinds: ["explod"],
        requiredExecutedControllers: ["Explod"],
        requiredExecutedOperations: ["explod"],
        requiredEventCategories: ["hit"],
        requiredCombatReasons: ["hit"],
        requiredWorldLifecycleEvents: [
          { type: "spawn", kind: "explod", ownerId: "p2", rootId: "p2", parentId: "p2" },
          { type: "remove", kind: "explod", ownerId: "p2", rootId: "p2", parentId: "p2" },
        ],
        requiredEffectStores: [{ ownerId: "p2", minTotal: 1, minExplods: 1, minNextExplodSerial: 1 }],
        requiredActorFrames: [{ actorKind: "explod", ownerId: "p2", animNo: 934, minFrames: 1 }],
      },
    ],
  });
}

export function createSyntheticImportedExplodRemoveOnProjectileHitTraceArtifact(
  options: RuntimeTraceGatePresetOptions = {},
): RuntimeTraceArtifact {
  const stage = options.stage ?? projectileCombatStage();
  const script = importedProjectileRemoveOnGetHitExplodScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-explod-removeonprojectilehit-attacker",
    displayName: "Synthetic Imported RemoveOnProjectileHit Attacker",
    withProjectile: true,
    projectileHitAnim: 911,
  });
  const defender = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-explod-removeonprojectilehit-defender",
    displayName: "Synthetic Imported RemoveOnProjectileHit Defender",
    passiveRemoveOnGetHitExplod: true,
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: defender, stage }), script, {
    label: "synthetic-imported-explod-removeonprojectilehit-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-explod-removeonprojectilehit-golden",
      label: "Synthetic imported Explod projectile removeongethit route",
      source: "imported",
      notes: [
        "Synthetic imported Explod projectile removeongethit trace proves a bounded P2 owner-side Explod flagged removeongethit = 1 is removed when P2 enters the current projectile get-hit route. It does not claim exact MUGEN/IKEMEN projectile hitpause order, helper-owned Explods, projectile custom states, or full remove-trigger semantics.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-explod-removeonprojectilehit-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredEffectKinds: ["projectile", "explod"],
        requiredExecutedControllers: ["Projectile", "Explod"],
        requiredExecutedOperations: ["projectile", "explod"],
        requiredEventCategories: ["hit"],
        requiredCombatReasons: ["hit"],
        requiredWorldLifecycleEvents: [
          { type: "spawn", kind: "explod", ownerId: "p2", rootId: "p2", parentId: "p2" },
          { type: "remove", kind: "explod", ownerId: "p2", rootId: "p2", parentId: "p2" },
          { type: "spawn", kind: "projectile", ownerId: "p1", rootId: "p1", parentId: "p1" },
          { type: "remove", kind: "projectile", ownerId: "p1", rootId: "p1", parentId: "p1" },
        ],
        requiredEffectStores: [
          { ownerId: "p1", minTotal: 1, minProjectiles: 1, minNextProjectileSerial: 1 },
          { ownerId: "p2", minTotal: 1, minExplods: 1, minNextExplodSerial: 1 },
        ],
        requiredActorFrames: [
          { actorKind: "projectile", ownerId: "p1", animNo: 911, minFrames: 1 },
          { actorKind: "explod", ownerId: "p2", animNo: 934, minFrames: 1 },
        ],
      },
    ],
  });
}

export function createSyntheticImportedExplodRemoveOnProjectileGuardTraceArtifact(
  options: RuntimeTraceGatePresetOptions = {},
): RuntimeTraceArtifact {
  const stage = options.stage ?? projectileCombatStage();
  const script = importedProjectileGuardRemoveOnGetHitExplodScript();
  const attacker = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-explod-removeonprojectileguard-attacker",
    displayName: "Synthetic Imported RemoveOnProjectileGuard Attacker",
    withProjectile: true,
    projectileHitAnim: 911,
    projGuardStateNo: 271,
  });
  const defender = createSyntheticImportedTraceFighter({
    id: "synthetic-imported-explod-removeonprojectileguard-defender",
    displayName: "Synthetic Imported RemoveOnProjectileGuard Defender",
    passiveRemoveOnGetHitExplod: true,
  });
  const trace = runRuntimeTrace(new MatchWorld({ p1: attacker, p2: defender, stage }), script, {
    label: "synthetic-imported-explod-removeonprojectileguard-golden",
  });
  return createRuntimeTraceArtifact({
    trace,
    script,
    generatedAt: options.generatedAt,
    target: {
      id: "synthetic-imported-explod-removeonprojectileguard-golden",
      label: "Synthetic imported Explod projectile guard removeongethit route",
      source: "imported",
      notes: [
        "Synthetic imported Explod projectile guard removeongethit trace proves a bounded P2 owner-side Explod flagged removeongethit = 1 is removed when P2 blocks the current projectile route. It does not claim exact MUGEN/IKEMEN projectile guard hitpause order, guard-state tick timing, helper-owned Explods, projectile custom states, or full remove-trigger semantics.",
      ],
    },
    gates: [
      {
        label: "synthetic-imported-explod-removeonprojectileguard-golden",
        requiredActorSources: ["imported"],
        requiredActorKinds: ["player"],
        requiredEffectKinds: ["projectile", "explod"],
        requiredExecutedControllers: ["Projectile", "Explod"],
        requiredExecutedOperations: ["projectile", "explod"],
        requiredEventCategories: ["guard"],
        requiredCombatReasons: ["guard"],
        requiredWorldLifecycleEvents: [
          { type: "spawn", kind: "explod", ownerId: "p2", rootId: "p2", parentId: "p2" },
          { type: "remove", kind: "explod", ownerId: "p2", rootId: "p2", parentId: "p2" },
          { type: "spawn", kind: "projectile", ownerId: "p1", rootId: "p1", parentId: "p1" },
          { type: "remove", kind: "projectile", ownerId: "p1", rootId: "p1", parentId: "p1" },
        ],
        requiredEffectStores: [
          { ownerId: "p1", minTotal: 1, minProjectiles: 1, minNextProjectileSerial: 1 },
          { ownerId: "p2", minTotal: 1, minExplods: 1, minNextExplodSerial: 1 },
        ],
        requiredTargetLinks: [{ ownerId: "p1", actorId: "p2", targetId: 77 }],
        requiredActorFrames: [
          { actorKind: "projectile", ownerId: "p1", animNo: 911, minFrames: 1 },
          { actorKind: "explod", ownerId: "p2", animNo: 934, minFrames: 1 },
        ],
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

export function assertSpecialControlStage(): MugenStageDefinition {
  return {
    ...trainingStage,
    id: "trace-assertspecial-control-grid",
    displayName: "Trace AssertSpecial Control Grid",
    playerStart: {
      p1: { x: 30, y: 0, facing: 1 },
      p2: { x: -80, y: 0, facing: 1 },
    },
  };
}

export function screenBoundCameraStage(): MugenStageDefinition {
  return {
    ...trainingStage,
    id: "trace-screenbound-camera-grid",
    displayName: "Trace ScreenBound Camera Grid",
    playerStart: {
      p1: { x: 310, y: 0, facing: -1 },
      p2: { x: 0, y: 0, facing: 1 },
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

function importedOneShotXScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "imported-x-press", frames: 1, p1: ["x"], p2: [] },
    { label: "prevstateno-route", frames: 10, p1: [], p2: [] },
  ]);
}

export function importedHitDefPriorityScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "imported-hitdef-priority-x", frames: 8, p1: ["x"], p2: ["x"] },
    { label: "hitdef-priority-settle", frames: 1, p1: [], p2: [] },
  ]);
}

export function importedHitDefKillScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([{ label: "imported-hitdef-kill-x", frames: 8, p1: ["x"], p2: [] }]);
}

export function importedHitDefGuardKillScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "imported-hitdef-guard-kill-x", frames: 14, p1: ["x"], p2: ["B"] },
    { label: "hitdef-guard-kill-settle", frames: 1, p1: [], p2: ["B"] },
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

export function importedCustomStateScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "imported-custom-state-x", frames: 12, p1: ["x"], p2: [] },
    { label: "custom-state-return-settle", frames: 10, p1: [], p2: [] },
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

export function importedDefaultFallRecoveryTooEarlyScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "imported-default-fall-recovery-too-early-x", frames: 14, p1: ["x"], p2: [] },
    { label: "default-fall-recovery-too-early-window", frames: 1, p1: [], p2: [] },
    { label: "default-fall-recovery-too-early-input", frames: 3, p1: [], p2: ["x", "y"] },
    { label: "default-fall-recovery-too-early-settle", frames: 2, p1: [], p2: [] },
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

export function importedDefaultFallOfficialRecoveryTooEarlyScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "imported-default-fall-official-recovery-too-early-x", frames: 14, p1: ["x"], p2: [] },
    { label: "default-fall-official-recovery-too-early-window", frames: 1, p1: [], p2: [] },
    { label: "default-fall-official-recovery-too-early-input", frames: 3, p1: [], p2: ["x", "y"] },
    { label: "default-fall-official-recovery-too-early-settle", frames: 2, p1: [], p2: [] },
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

export function importedTargetBindPauseScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "imported-targetbind-pause-x", frames: 12, p1: ["x"], p2: [] },
    { label: "targetbind-pause-settle", frames: 3, p1: [], p2: [] },
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

export function importedSuperPauseEffectScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "imported-superpause-effect-x", frames: 8, p1: ["x"], p2: [] },
    { label: "superpause-effect-settle", frames: 3, p1: [], p2: [] },
  ]);
}

export function importedPauseEffectScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "imported-pause-effect-x", frames: 8, p1: ["x"], p2: [] },
    { label: "pause-effect-settle", frames: 3, p1: [], p2: [] },
  ]);
}

export function importedProjectileScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "imported-projectile-x", frames: 14, p1: ["x"], p2: [] },
    { label: "projectile-settle", frames: 6, p1: [], p2: [] },
  ]);
}

export function importedProjectileMotionScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "imported-projectile-motion-x", frames: 8, p1: ["x"], p2: [] },
    { label: "projectile-motion-settle", frames: 4, p1: [], p2: [] },
  ]);
}

export function importedProjectileVelMulScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "imported-projectile-velmul-x", frames: 8, p1: ["x"], p2: [] },
    { label: "projectile-velmul-settle", frames: 4, p1: [], p2: [] },
  ]);
}

export function importedProjectileMultiHitScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "imported-projectile-multihit-x", frames: 14, p1: ["x"], p2: [] },
    { label: "projectile-multihit-settle", frames: 2, p1: [], p2: [] },
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

export function importedProjectilePriorityCancelScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "imported-projectile-priority-cancel-x", frames: 8, p1: ["x"], p2: ["x"] },
    { label: "projectile-priority-cancel-settle", frames: 1, p1: [], p2: [] },
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

export function importedRemoveOnGetHitExplodScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "seed-removeongethit-explod", frames: 2, p1: [], p2: [] },
    { label: "hit-removeongethit-owner", frames: 18, p1: ["a"], p2: [] },
    { label: "removeongethit-settle", frames: 2, p1: [], p2: [] },
  ]);
}

export function importedProjectileRemoveOnGetHitExplodScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "seed-projectile-removeongethit-explod", frames: 2, p1: [], p2: [] },
    { label: "projectile-hit-removeongethit-owner", frames: 14, p1: ["x"], p2: [] },
    { label: "projectile-removeongethit-settle", frames: 2, p1: [], p2: [] },
  ]);
}

export function importedProjectileGuardRemoveOnGetHitExplodScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "seed-projectile-guard-removeongethit-explod", frames: 2, p1: [], p2: [] },
    { label: "projectile-guard-removeongethit-owner", frames: 14, p1: ["x"], p2: ["B"] },
    { label: "projectile-guard-removeongethit-settle", frames: 4, p1: [], p2: ["B"] },
  ]);
}

export function importedGuardScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "imported-guard-x", frames: 14, p1: ["x"], p2: ["B"] },
    { label: "guard-settle", frames: 4, p1: [], p2: ["B"] },
  ]);
}

export function importedP2GuardDenyScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "imported-guarddeny-x", frames: 14, p1: ["B"], p2: ["x"] },
    { label: "guarddeny-settle", frames: 4, p1: ["B"], p2: [] },
  ]);
}

export function importedP2CrouchGuardDenyScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "imported-crouch-guarddeny-prime", frames: 2, p1: ["B", "D"], p2: [] },
    { label: "imported-crouch-guarddeny-x", frames: 14, p1: ["B", "D"], p2: ["x"] },
    { label: "crouch-guarddeny-settle", frames: 4, p1: ["B", "D"], p2: [] },
  ]);
}

export function importedP2AirGuardDenyScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "imported-air-guarddeny-jump", frames: 2, p1: ["U"], p2: [] },
    { label: "imported-air-guarddeny-x", frames: 14, p1: ["B"], p2: ["x"] },
    { label: "air-guarddeny-settle", frames: 4, p1: ["B"], p2: [] },
  ]);
}

export function importedP2AssertSpecialExpiredGuardScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "assertspecial-lifetime-expire", frames: 3, p1: [], p2: [] },
    { label: "assertspecial-expired-guard-x", frames: 14, p1: ["B"], p2: ["x"] },
    { label: "assertspecial-expired-guard-settle", frames: 4, p1: ["B"], p2: [] },
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

export function importedDefaultDiagonalCrouchGuardStateScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "imported-default-diagonal-crouch-guard-state-x", frames: 14, p1: ["x"], p2: ["DB"] },
    { label: "default-diagonal-crouch-guard-state-settle", frames: 36, p1: [], p2: ["DB"] },
  ]);
}

export function importedDefaultAirGuardStateScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "imported-default-air-guard-jump", frames: 2, p1: [], p2: ["U"] },
    { label: "imported-default-air-guard-state-x", frames: 14, p1: ["x"], p2: ["B"] },
    { label: "default-air-guard-state-settle", frames: 36, p1: [], p2: ["B"] },
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

export function importedDelayedXScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "stage-time-wait", frames: 3, p1: [], p2: [] },
    { label: "stage-time-x", frames: 1, p1: ["x"], p2: [] },
    { label: "stage-time-settle", frames: 1, p1: [], p2: [] },
  ]);
}

export function importedRoundTimeOverScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([{ label: "round-timeover-wait", frames: 2, p1: [], p2: [] }]);
}

export function importedAssertSpecialControlScript(): RuntimeTraceInputFrame[] {
  return expandRuntimeTraceScript([
    { label: "hold-forward-under-assertspecial", frames: 4, p1: ["F"], p2: [] },
  ]);
}

export type SyntheticImportedTraceFighterOptions = {
  id?: string;
  displayName?: string;
  hitDefAttr?: string;
  attackStateType?: "S" | "C" | "A" | "L";
  hitDefDamage?: number;
  hitDefKill?: boolean;
  hitDefPriority?: number;
  hitAnimType?: string;
  hitGroundType?: string;
  hitAirType?: string;
  fallAnimType?: string;
  passiveNotHitBy?: string;
  passiveHitBy?: string;
  passiveHitOverride?: { attr: string; stateNo: number; slot?: number; time?: number; forceAir?: boolean; forceGuard?: boolean; keepState?: boolean };
  passiveReversalDef?: { attr: string; p1StateNo: number; p2StateNo?: number; hitPause?: number; targetId?: number };
  defenseMultiplier?: number;
  attackMultiplier?: number;
  guardDamage?: number;
  guardKill?: boolean;
  guardFlag?: string;
  guardDistance?: number;
  guardSlideTime?: number;
  guardControlTime?: number;
  groundVelocity?: [number, number?];
  fall?: DemoMove["fall"];
  getHitState?: { stateNo: number; animNo?: number };
  fallDefenceUpBranchStateNo?: number;
  getHitVarBranch?: { stateNo: number; expression: string; animNo?: number };
  defaultGetHitState?: { stateNo: number; animNo?: number };
  defaultGetHitProgression?: { shakeStateNo?: number; slideStateNo?: number; shakeAnimNo?: number; slideAnimNo?: number };
  defaultGuardHit?: {
    shakeStateNo?: number;
    slideStateNo?: number;
    crouchShakeStateNo?: number;
    crouchSlideStateNo?: number;
    airShakeStateNo?: number;
    airSlideStateNo?: number;
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
  withBindToTarget?: boolean;
  bindToTargetPostype?: "Foot" | "Mid" | "Head";
  withTargetDrop?: boolean;
  withPrePauseTargetBind?: boolean;
  withPause?: boolean;
  withDelayedSuperPause?: boolean;
  pauseMovePosAdd?: { x: number; y: number; time?: number };
  action200Duration?: number;
  withSuperPause?: boolean;
  withProjectile?: boolean;
  projectilePriority?: number;
  projectileOffset?: [number, number];
  projectileVelocity?: [number, number];
  projectileAccel?: [number, number];
  projectileVelocityMultiplier?: [number, number];
  projectileScale?: [number, number];
  withModifyProjectile?: boolean;
  modifyProjectileTriggerTime?: number;
  modifyProjectileVelocity?: [number, number];
  modifyProjectileAccel?: [number, number];
  modifyProjectileVelocityMultiplier?: [number, number];
  modifyProjectileScale?: [number, number];
  modifyProjectileRemoveTime?: number;
  modifyProjectilePriority?: number;
  modifyProjectileHits?: number;
  modifyProjectileMissTime?: number;
  projectileGroundVelocity?: [number, number?];
  projectileHits?: number;
  projectileMissTime?: number;
  projectileHitAnim?: number;
  projectileRemoveAnim?: number;
  projectileCancelAnim?: number;
  projContactStateNo?: number;
  projHitStateNo?: number;
  projHitTimeStateNo?: number;
  projGuardStateNo?: number;
  numProjStateNo?: number;
  numExplodStateNo?: number;
  moveContactStateNo?: number;
  moveHitStateNo?: number;
  moveHitCounterStateNo?: number;
  withMoveHitReset?: boolean;
  hitCountStateNo?: number;
  withHitAdd?: number;
  hitAddStateNo?: number;
  withControlOps?: boolean;
  withAnimationOps?: boolean;
  withVariableOps?: { stateNo: number };
  withResourceOps?: { stateNo: number };
  withSoundControllers?: boolean;
  receivedDamageRoute?: { sourceStateNo: number; finalStateNo: number };
  moveReversedStateNo?: number;
  moveGuardStateNo?: number;
  hitDefAttrStateNo?: number;
  numTargetStateNo?: number;
  numHelperStateNo?: number;
  prevStateRoute?: { intermediateStateNo: number; finalStateNo: number };
  prevAnimRoute?: { previousAnimNo: number; intermediateStateNo: number; finalStateNo: number };
  prevStateTypeRoute?: { intermediateStateNo: number; finalStateNo: number };
  prevMoveTypeRoute?: { intermediateStateNo: number; finalStateNo: number };
  enemyNearStateEntry?: { opponentStateNo: number; stateNo: number };
  p2MetricsStateEntry?: { stateNo: number };
  dataStats?: { attack?: number; defence?: number; life?: number; power?: number };
  selfStateNoExistEntry?: { existingStateNo: number; missingStateNo: number; stateNo: number };
  selfCommandEntry?: { commandName: string; stateNo: number };
  stageTimeEntry?: { minStageTime: number; stateNo: number };
  aliveStateEntry?: { stateNo: number };
  roundStateEntry?: { roundNo: number; roundState: number; stateNo: number };
  matchContextEntry?: { roundsExisted: number; stateNo: number };
  resourceMaxEntry?: { lifeMax: number; powerMax: number; stateNo: number };
  withHelper?: boolean;
  helperVelocity?: [number, number];
  helperScale?: [number, number];
  helperPauseMoveTime?: number;
  helperSuperMoveTime?: number;
  helperIgnoreHitPause?: boolean;
  helperTriggerTime?: number;
  withExplod?: boolean;
  withPauseMoveExplod?: boolean;
  withSuperMoveExplod?: boolean;
  withHitPauseExplods?: boolean;
  withMovingExplod?: boolean;
  withBoundExplod?: boolean;
  withScaledExplod?: boolean;
  withRemoveExplod?: boolean;
  passiveRemoveOnGetHitExplod?: boolean;
  withInGuardDistGuardStart?: boolean;
  withAutoGuardStartStates?: boolean;
  withBoundsControllers?: boolean;
  withScreenBoundCameraProbe?: boolean;
  withGravity?: boolean;
  withKinematicControllers?: boolean;
  withWidthController?: [number, number?];
  withStateTypeSet?: { stateType?: "S" | "C" | "A" | "L"; moveType?: "I" | "A" | "H"; physics?: "S" | "C" | "A" | "N" };
  withPlayerPush?: boolean;
  withTurn?: boolean;
  withSprPriority?: number;
  withPalFx?: {
    time: number;
    add?: [number, number, number];
    mul?: [number, number, number];
    color?: number;
    invert?: boolean;
  };
  withTrans?: string;
  withAngle?: {
    set?: number;
    add?: number;
  };
  withEnvShake?: {
    time?: number;
    freq?: number;
    ampl?: number;
    phase?: number;
  };
  withEnvColor?: {
    value?: [number, number, number];
    time?: number;
    under?: boolean;
  };
  withRemapPal?: {
    source: [number, number];
    dest: [number, number];
  };
  withAfterImage?: {
    time?: number;
    length?: number;
    timeGap?: number;
    frameGap?: number;
    palAdd?: [number, number, number];
    palMul?: [number, number, number];
    trans?: string;
  };
  withAfterImageTime?: number;
  assertSpecialFlags?: string[];
  passiveAssertSpecialFlags?: string[];
  passiveAssertSpecialTrigger?: string;
  assertSpecialControlState?: {
    stateNo: number;
    flags: string[];
    stateType?: "S" | "C" | "A" | "L";
    moveType?: "I" | "A" | "H";
    physics?: "S" | "C" | "A" | "N";
  };
  sizeConstants?: {
    headPos?: [number, number];
    midPos?: [number, number];
  };
  customStateRoute?: {
    startStateNo: number;
    chainStateNo?: number;
    changeStateAfter?: number;
    selfStateAfter?: number;
    animNo?: number;
    chainAnimNo?: number;
  };
  targetStateRoute?: {
    startStateNo: number;
    chainStateNo?: number;
    changeStateAfter?: number;
    selfStateAfter?: number;
    animNo?: number;
    chainAnimNo?: number;
  };
};

export function createSyntheticImportedTraceFighter(options: SyntheticImportedTraceFighterOptions = {}): DemoFighterDefinition {
  const hitDefAttr = options.hitDefAttr ?? "S,NA";
  const hitDefDamage = options.hitDefDamage ?? 37;
  const damageLine = options.guardDamage === undefined ? String(hitDefDamage) : `${hitDefDamage},${options.guardDamage}`;
  const hitDefKillLine = options.hitDefKill === undefined ? "" : `kill = ${options.hitDefKill ? 1 : 0}`;
  const hitVarLines = `
${options.hitAnimType === undefined ? "" : `animtype = ${options.hitAnimType}`}
${options.hitGroundType === undefined ? "" : `ground.type = ${options.hitGroundType}`}
${options.hitAirType === undefined ? "" : `air.type = ${options.hitAirType}`}
${options.fallAnimType === undefined ? "" : `fall.animtype = ${options.fallAnimType}`}
`;
  const groundVelocity = options.groundVelocity ?? [-3];
  const guardLine =
    options.guardDamage === undefined &&
    options.guardFlag === undefined &&
    options.guardKill === undefined &&
    options.guardSlideTime === undefined &&
    options.guardControlTime === undefined
      ? ""
      : `
guardflag = ${options.guardFlag ?? "MA"}
${options.guardKill === undefined ? "" : `guard.kill = ${options.guardKill ? 1 : 0}`}
guard.pausetime = 4,4
guard.hittime = 9
${options.guardSlideTime === undefined ? "" : `guard.slidetime = ${options.guardSlideTime}`}
${options.guardControlTime === undefined ? "" : `guard.ctrltime = ${options.guardControlTime}`}
guard.velocity = -2
`;
  const guardDistanceLine = options.guardDistance === undefined ? "" : `guard.dist = ${options.guardDistance}`;
  const fallLine = options.fall ? fallHitDefBlock(options.fall) : "";
  const customStateLine = options.customStateRoute
    ? `
p2stateno = ${options.customStateRoute.startStateNo}
p2getp1state = 1
`
    : "";
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
${options.enemyNearStateEntry === undefined ? "" : enemyNearStateEntryBlock(options.enemyNearStateEntry)}
${options.p2MetricsStateEntry === undefined ? "" : p2MetricsStateEntryBlock(options.p2MetricsStateEntry)}
${options.selfStateNoExistEntry === undefined ? "" : selfStateNoExistStateEntryBlock(options.selfStateNoExistEntry)}
${options.selfCommandEntry === undefined ? "" : selfCommandStateEntryBlock(options.selfCommandEntry)}
${options.stageTimeEntry === undefined ? "" : stageTimeStateEntryBlock(options.stageTimeEntry)}
${options.aliveStateEntry === undefined ? "" : aliveStateEntryBlock(options.aliveStateEntry)}
${options.roundStateEntry === undefined ? "" : roundStateEntryBlock(options.roundStateEntry)}
${options.matchContextEntry === undefined ? "" : matchContextEntryBlock(options.matchContextEntry)}
${options.resourceMaxEntry === undefined ? "" : resourceMaxEntryBlock(options.resourceMaxEntry)}
[State -1, Stand Light Punch]
type = ChangeState
value = 200
triggerall = command = "x"
trigger1 = ctrl
`).controllers;
  const stateFile = parseCns(`
${dataConstantsBlock(options)}
${sizeConstantsBlock(options.sizeConstants)}
[Statedef 0]
type = S
movetype = I
physics = S
anim = 0
ctrl = 1
${options.withInGuardDistGuardStart ? inGuardDistGuardStartControllerBlock() : ""}
${options.passiveNotHitBy ? passiveHitByController("NotHitBy", "Reject Attrs", options.passiveNotHitBy) : ""}
${options.passiveHitBy ? passiveHitByController("HitBy", "Allow Attrs", options.passiveHitBy) : ""}
${options.passiveHitOverride ? passiveHitOverrideController(options.passiveHitOverride) : ""}
${options.passiveReversalDef ? passiveReversalDefController(options.passiveReversalDef) : ""}
${options.passiveAssertSpecialFlags?.length ? passiveAssertSpecialController(options.passiveAssertSpecialFlags, options.passiveAssertSpecialTrigger) : ""}
${options.defenseMultiplier !== undefined ? defenseMultiplierController(options.defenseMultiplier) : ""}
${options.passiveRemoveOnGetHitExplod ? passiveRemoveOnGetHitExplodControllerBlock() : ""}

[Statedef 200]
type = ${options.attackStateType ?? "S"}
movetype = A
physics = S
anim = 200
ctrl = 0

${assertSpecialLine}
${options.attackMultiplier !== undefined ? attackMultiplierController(options.attackMultiplier) : ""}
${options.withBoundsControllers ? boundsControllerBlock() : ""}
${options.withScreenBoundCameraProbe ? screenBoundCameraProbeBlock() : ""}
${options.withGravity ? gravityControllerBlock() : ""}
${options.withKinematicControllers ? kinematicControllerBlock() : ""}
${options.withWidthController ? widthControllerBlock(options.withWidthController) : ""}
${options.withStateTypeSet ? stateTypeSetControllerBlock(options.withStateTypeSet) : ""}
${options.withPlayerPush === undefined ? "" : playerPushControllerBlock(options.withPlayerPush)}
${options.withTurn ? turnControllerBlock() : ""}
${options.withSprPriority === undefined ? "" : sprPriorityControllerBlock(options.withSprPriority)}
${options.withPalFx === undefined ? "" : palFxControllerBlock(options.withPalFx)}
${options.withTrans === undefined ? "" : transControllerBlock(options.withTrans)}
${options.withAngle === undefined ? "" : angleControllerBlock(options.withAngle)}
${options.withEnvShake === undefined ? "" : envShakeControllerBlock(options.withEnvShake)}
${options.withEnvColor === undefined ? "" : envColorControllerBlock(options.withEnvColor)}
${options.withRemapPal === undefined ? "" : remapPalControllerBlock(options.withRemapPal)}
${options.withAfterImage === undefined ? "" : afterImageControllerBlock(options.withAfterImage)}
${options.withAfterImageTime === undefined ? "" : afterImageTimeControllerBlock(options.withAfterImageTime)}
[State 200, HitDef]
type = HitDef
trigger1 = Time = 1
attr = ${hitDefAttr}
damage = ${damageLine}
${hitDefKillLine}
${hitVarLines}
pausetime = 4,4
ground.hittime = 9
ground.velocity = ${groundVelocity.join(",")}
id = 77
priority = ${options.hitDefPriority ?? 4}, Hit
${guardLine}
${guardDistanceLine}
${fallLine}
${customStateLine || getHitStateLine}
${options.prevStateRoute === undefined ? "" : prevStateEntryBlock(options.prevStateRoute.intermediateStateNo)}
${options.prevAnimRoute === undefined ? "" : prevAnimEntryBlock(options.prevAnimRoute)}
${options.prevStateTypeRoute === undefined ? "" : prevStateTypeEntryBlock(options.prevStateTypeRoute.intermediateStateNo)}
${options.prevMoveTypeRoute === undefined ? "" : prevMoveTypeEntryBlock(options.prevMoveTypeRoute.intermediateStateNo)}
${options.withTargetControllers ? targetControllerBlock(77) : ""}
${options.targetStateRoute ? targetStateControllerBlock(77, options.targetStateRoute.startStateNo) : ""}
${options.withBindToTarget ? bindToTargetBlock(77, options.bindToTargetPostype) : ""}
${options.withTargetDrop ? targetDropBlock() : ""}
${options.withPrePauseTargetBind ? prePauseTargetBindBlock(77) : ""}
${options.withPause ? pauseControllerBlock() : ""}
${options.withSuperPause ? superPauseControllerBlock() : ""}
${options.withDelayedSuperPause ? delayedSuperPauseControllerBlock() : ""}
${options.pauseMovePosAdd ? pauseMovePosAddBlock(options.pauseMovePosAdd) : ""}
${options.withProjectile ? projectileControllerBlock(options.projectilePriority, options.projectileOffset, options.projectileVelocity, options.projectileGroundVelocity, options.projectileHits, options.projectileMissTime, options.projectileHitAnim, options.projectileRemoveAnim, options.projectileCancelAnim, options.projectileAccel, options.projectileVelocityMultiplier, options.projectileScale) : ""}
${options.withModifyProjectile ? modifyProjectileControllerBlock({
  triggerTime: options.modifyProjectileTriggerTime,
  velocity: options.modifyProjectileVelocity,
  accel: options.modifyProjectileAccel,
  velocityMultiplier: options.modifyProjectileVelocityMultiplier,
  scale: options.modifyProjectileScale,
  removeTime: options.modifyProjectileRemoveTime,
  priority: options.modifyProjectilePriority,
  hits: options.modifyProjectileHits,
  missTime: options.modifyProjectileMissTime,
}) : ""}
${options.withHitAdd === undefined ? "" : hitAddControllerBlock(options.withHitAdd)}
${options.numProjStateNo === undefined ? "" : contactBranchBlock("NumProjID(77) > 0", options.numProjStateNo, "NumProj Branch")}
${options.projContactStateNo === undefined ? "" : contactBranchBlock("ProjContact(77)", options.projContactStateNo, "ProjContact Branch")}
${options.projHitStateNo === undefined ? "" : contactBranchBlock("ProjHit(77)", options.projHitStateNo, "ProjHit Branch")}
${options.projHitTimeStateNo === undefined ? "" : contactBranchBlock("ProjHitTime(77) >= 1", options.projHitTimeStateNo, "ProjHitTime Branch")}
${options.projGuardStateNo === undefined ? "" : contactBranchBlock("ProjGuarded(77)", options.projGuardStateNo, "ProjGuarded Branch")}
${options.moveContactStateNo === undefined ? "" : contactBranchBlock("MoveContact", options.moveContactStateNo, "MoveContact Branch")}
${options.moveHitStateNo === undefined ? "" : contactBranchBlock("MoveHit", options.moveHitStateNo, "MoveHit Branch")}
${options.withMoveHitReset ? moveHitResetControllerBlock() : ""}
${options.moveHitCounterStateNo === undefined ? "" : contactBranchBlock("MoveHit >= 1", options.moveHitCounterStateNo, "MoveHit Counter Branch")}
${options.hitCountStateNo === undefined ? "" : contactBranchBlock("HitCount >= 1 && UniqHitCount >= 1", options.hitCountStateNo, "HitCount Branch")}
${options.hitAddStateNo === undefined ? "" : contactBranchBlock("HitCount >= 3 && UniqHitCount = 1", options.hitAddStateNo, "HitAdd Branch")}
${options.withAnimationOps ? animationControllerBlock() : ""}
${options.withControlOps ? controlControllerBlock() : ""}
${options.withVariableOps === undefined ? "" : variableControllerBlock(options.withVariableOps.stateNo)}
${options.withResourceOps === undefined ? "" : resourceControllerBlock(options.withResourceOps.stateNo)}
${options.withSoundControllers ? soundControllerBlock() : ""}
${options.moveReversedStateNo === undefined ? "" : contactBranchBlock("MoveReversed >= 1", options.moveReversedStateNo, "MoveReversed Branch")}
${options.moveGuardStateNo === undefined ? "" : contactBranchBlock("MoveGuarded", options.moveGuardStateNo, "MoveGuarded Branch")}
${options.hitDefAttrStateNo === undefined ? "" : hitDefAttrBranchBlock(options.hitDefAttrStateNo)}
${options.numTargetStateNo === undefined ? "" : contactBranchBlock("NumTarget(77) > 0", options.numTargetStateNo, "NumTarget Branch")}
${options.withHelper ? helperControllerBlock(options.helperVelocity, options.helperScale, {
  pauseMoveTime: options.helperPauseMoveTime,
  superMoveTime: options.helperSuperMoveTime,
  ignoreHitPause: options.helperIgnoreHitPause,
  triggerTime: options.helperTriggerTime,
}) : ""}
${options.numHelperStateNo === undefined ? "" : contactBranchBlock("NumHelper(42) > 0", options.numHelperStateNo, "NumHelper Branch")}
${options.withExplod ? explodControllerBlock() : ""}
${options.withPauseMoveExplod ? pauseMoveExplodControllerBlock() : ""}
${options.withSuperMoveExplod ? superMoveExplodControllerBlock() : ""}
${options.withHitPauseExplods ? hitPauseExplodsControllerBlock() : ""}
${options.withMovingExplod ? movingExplodControllerBlock() : ""}
${options.withBoundExplod ? boundExplodControllerBlock() : ""}
${options.withScaledExplod ? scaledExplodControllerBlock() : ""}
${options.withRemoveExplod ? removeExplodControllerBlock() : ""}
${options.numExplodStateNo === undefined ? "" : contactBranchBlock("NumExplod(9000) > 0", options.numExplodStateNo, "NumExplod Branch")}

${options.getHitState ? getHitStateBlock(options.getHitState, options.fallDefenceUpBranchStateNo, options.getHitVarBranch) : ""}
${options.customStateRoute ? customStateRouteBlock(options.customStateRoute) : ""}
${options.targetStateRoute ? customStateRouteBlock(options.targetStateRoute) : ""}
${options.receivedDamageRoute ? receivedDamageRouteBlock(options.receivedDamageRoute) : ""}
${options.prevStateRoute ? prevStateRouteBlock(options.prevStateRoute) : ""}
${options.prevAnimRoute ? prevAnimRouteBlock(options.prevAnimRoute) : ""}
${options.prevStateTypeRoute ? prevStateTypeRouteBlock(options.prevStateTypeRoute) : ""}
${options.prevMoveTypeRoute ? prevMoveTypeRouteBlock(options.prevMoveTypeRoute) : ""}
${options.enemyNearStateEntry ? simpleStateBlock(options.enemyNearStateEntry.stateNo, "I") : ""}
${options.p2MetricsStateEntry ? simpleStateBlock(options.p2MetricsStateEntry.stateNo, "I") : ""}
${options.selfStateNoExistEntry ? simpleStateBlock(options.selfStateNoExistEntry.stateNo, "I") : ""}
${options.selfCommandEntry && options.selfCommandEntry.stateNo !== options.assertSpecialControlState?.stateNo ? simpleStateBlock(options.selfCommandEntry.stateNo, "I") : ""}
${options.stageTimeEntry ? simpleStateBlock(options.stageTimeEntry.stateNo, "I") : ""}
${options.aliveStateEntry ? simpleStateBlock(options.aliveStateEntry.stateNo, "I") : ""}
${options.roundStateEntry ? simpleStateBlock(options.roundStateEntry.stateNo, "I") : ""}
${options.matchContextEntry ? simpleStateBlock(options.matchContextEntry.stateNo, "I") : ""}
${options.resourceMaxEntry ? simpleStateBlock(options.resourceMaxEntry.stateNo, "I") : ""}
${options.assertSpecialControlState ? assertSpecialControlStateBlock(options.assertSpecialControlState) : ""}
${options.defaultGetHitState ? getHitStateBlock(options.defaultGetHitState) : ""}
${options.defaultGetHitProgression ? defaultGetHitProgressionBlock(options.defaultGetHitProgression) : ""}
${options.defaultGuardHit ? defaultGuardHitBlock(options.defaultGuardHit) : ""}
${options.withInGuardDistGuardStart ? inGuardDistGuardStartStateBlock() : ""}
${options.withAutoGuardStartStates ? autoGuardStartStateBlock() : ""}
${options.defaultGetHitFall ? defaultGetHitFallBlock(options.defaultGetHitFall) : ""}
${options.passiveReversalDef ? passiveReversalStateBlock(options.passiveReversalDef) : ""}
${options.passiveHitOverride ? simpleStateBlock(options.passiveHitOverride.stateNo, "I") : ""}
${options.withVariableOps ? simpleStateBlock(options.withVariableOps.stateNo, "I") : ""}
${options.withResourceOps ? simpleStateBlock(options.withResourceOps.stateNo, "I") : ""}
`);
  const move: DemoMove = {
    actionId: 200,
    startup: 1,
    activeStart: 1,
    activeEnd: 4,
    recovery: 18,
    damage: hitDefDamage,
    kill: options.hitDefKill,
    priority: options.hitDefPriority ?? 4,
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
    guardKill: options.guardKill,
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
      [0, options.passiveReversalDef ? reversalTraceAction(0) : traceAction(0)],
      [10, traceAction(10)],
      [20, traceAction(20)],
      [40, traceAction(40)],
      [200, traceAction(200, options.action200Duration)],
      [230, traceAction(230)],
      [500, traceAction(500)],
      ...(options.withInGuardDistGuardStart ? ([[130, traceAction(130)]] as Array<[number, MugenAnimationAction]>) : []),
      ...(options.passiveHitOverride === undefined
        ? []
        : ([[options.passiveHitOverride.stateNo, traceAction(options.passiveHitOverride.stateNo)]] as Array<[number, MugenAnimationAction]>)),
      ...(options.withAutoGuardStartStates
        ? ([[120, traceAction(120)], [130, traceAction(130)], [140, traceAction(140)]] as Array<[number, MugenAnimationAction]>)
        : []),
      ...(options.withProjectile
        ? ([[910, projectileTraceAction(910)], ...projectileTerminalTraceActions(options)] as Array<[number, MugenAnimationAction]>)
        : []),
      ...(options.projHitStateNo === undefined ? [] : ([[options.projHitStateNo, traceAction(options.projHitStateNo)]] as Array<[number, MugenAnimationAction]>)),
      ...(options.projHitTimeStateNo === undefined ? [] : ([[options.projHitTimeStateNo, traceAction(options.projHitTimeStateNo)]] as Array<[number, MugenAnimationAction]>)),
      ...(options.projGuardStateNo === undefined ? [] : ([[options.projGuardStateNo, traceAction(options.projGuardStateNo)]] as Array<[number, MugenAnimationAction]>)),
      ...(options.projContactStateNo === undefined ? [] : ([[options.projContactStateNo, traceAction(options.projContactStateNo)]] as Array<[number, MugenAnimationAction]>)),
      ...(options.numProjStateNo === undefined ? [] : ([[options.numProjStateNo, traceAction(options.numProjStateNo)]] as Array<[number, MugenAnimationAction]>)),
      ...(options.moveContactStateNo === undefined ? [] : ([[options.moveContactStateNo, traceAction(options.moveContactStateNo)]] as Array<[number, MugenAnimationAction]>)),
      ...(options.moveHitStateNo === undefined ? [] : ([[options.moveHitStateNo, traceAction(options.moveHitStateNo)]] as Array<[number, MugenAnimationAction]>)),
      ...(options.moveHitCounterStateNo === undefined ? [] : ([[options.moveHitCounterStateNo, traceAction(options.moveHitCounterStateNo)]] as Array<[number, MugenAnimationAction]>)),
      ...(options.hitCountStateNo === undefined ? [] : ([[options.hitCountStateNo, traceAction(options.hitCountStateNo)]] as Array<[number, MugenAnimationAction]>)),
      ...(options.hitAddStateNo === undefined ? [] : ([[options.hitAddStateNo, traceAction(options.hitAddStateNo)]] as Array<[number, MugenAnimationAction]>)),
      ...(options.withAnimationOps ? ([[205, traceAction(205)], [206, traceAction(206)]] as Array<[number, MugenAnimationAction]>) : []),
      ...(options.withVariableOps === undefined ? [] : ([[options.withVariableOps.stateNo, traceAction(options.withVariableOps.stateNo)]] as Array<[number, MugenAnimationAction]>)),
      ...(options.withResourceOps === undefined ? [] : ([[options.withResourceOps.stateNo, traceAction(options.withResourceOps.stateNo)]] as Array<[number, MugenAnimationAction]>)),
      ...(options.receivedDamageRoute === undefined
        ? []
        : ([
            [options.receivedDamageRoute.sourceStateNo, traceAction(options.receivedDamageRoute.sourceStateNo)],
            [options.receivedDamageRoute.finalStateNo, traceAction(options.receivedDamageRoute.finalStateNo)],
          ] as Array<[number, MugenAnimationAction]>)),
      ...(options.moveReversedStateNo === undefined ? [] : ([[options.moveReversedStateNo, traceAction(options.moveReversedStateNo)]] as Array<[number, MugenAnimationAction]>)),
      ...(options.moveGuardStateNo === undefined ? [] : ([[options.moveGuardStateNo, traceAction(options.moveGuardStateNo)]] as Array<[number, MugenAnimationAction]>)),
      ...(options.hitDefAttrStateNo === undefined ? [] : ([[options.hitDefAttrStateNo, traceAction(options.hitDefAttrStateNo)]] as Array<[number, MugenAnimationAction]>)),
      ...(options.numTargetStateNo === undefined ? [] : ([[options.numTargetStateNo, traceAction(options.numTargetStateNo)]] as Array<[number, MugenAnimationAction]>)),
      ...(options.numHelperStateNo === undefined ? [] : ([[options.numHelperStateNo, traceAction(options.numHelperStateNo)]] as Array<[number, MugenAnimationAction]>)),
      ...(options.prevStateRoute === undefined
        ? []
        : ([
            [options.prevStateRoute.intermediateStateNo, traceAction(options.prevStateRoute.intermediateStateNo)],
            [options.prevStateRoute.finalStateNo, traceAction(options.prevStateRoute.finalStateNo)],
          ] as Array<[number, MugenAnimationAction]>)),
      ...(options.prevAnimRoute === undefined
        ? []
        : ([
            [options.prevAnimRoute.previousAnimNo, traceAction(options.prevAnimRoute.previousAnimNo)],
            [options.prevAnimRoute.intermediateStateNo, traceAction(options.prevAnimRoute.intermediateStateNo)],
            [options.prevAnimRoute.finalStateNo, traceAction(options.prevAnimRoute.finalStateNo)],
          ] as Array<[number, MugenAnimationAction]>)),
      ...(options.prevMoveTypeRoute === undefined
        ? []
        : ([
            [options.prevMoveTypeRoute.intermediateStateNo, traceAction(options.prevMoveTypeRoute.intermediateStateNo)],
            [options.prevMoveTypeRoute.finalStateNo, traceAction(options.prevMoveTypeRoute.finalStateNo)],
          ] as Array<[number, MugenAnimationAction]>)),
      ...(options.prevStateTypeRoute === undefined
        ? []
        : ([
            [options.prevStateTypeRoute.intermediateStateNo, traceAction(options.prevStateTypeRoute.intermediateStateNo)],
            [options.prevStateTypeRoute.finalStateNo, traceAction(options.prevStateTypeRoute.finalStateNo)],
          ] as Array<[number, MugenAnimationAction]>)),
      ...(options.enemyNearStateEntry === undefined
        ? []
        : ([[options.enemyNearStateEntry.stateNo, traceAction(options.enemyNearStateEntry.stateNo)]] as Array<[number, MugenAnimationAction]>)),
      ...(options.p2MetricsStateEntry === undefined
        ? []
        : ([[options.p2MetricsStateEntry.stateNo, traceAction(options.p2MetricsStateEntry.stateNo)]] as Array<[number, MugenAnimationAction]>)),
      ...(options.selfStateNoExistEntry === undefined
        ? []
        : ([[options.selfStateNoExistEntry.stateNo, traceAction(options.selfStateNoExistEntry.stateNo)]] as Array<
            [number, MugenAnimationAction]
          >)),
      ...(options.selfCommandEntry === undefined
        ? []
        : ([[options.selfCommandEntry.stateNo, traceAction(options.selfCommandEntry.stateNo)]] as Array<[number, MugenAnimationAction]>)),
      ...(options.stageTimeEntry === undefined
        ? []
        : ([[options.stageTimeEntry.stateNo, traceAction(options.stageTimeEntry.stateNo)]] as Array<[number, MugenAnimationAction]>)),
      ...(options.aliveStateEntry === undefined
        ? []
        : ([[options.aliveStateEntry.stateNo, traceAction(options.aliveStateEntry.stateNo)]] as Array<[number, MugenAnimationAction]>)),
      ...(options.roundStateEntry === undefined
        ? []
        : ([[options.roundStateEntry.stateNo, traceAction(options.roundStateEntry.stateNo)]] as Array<
            [number, MugenAnimationAction]
          >)),
      ...(options.matchContextEntry === undefined
        ? []
        : ([[options.matchContextEntry.stateNo, traceAction(options.matchContextEntry.stateNo)]] as Array<
            [number, MugenAnimationAction]
          >)),
      ...(options.resourceMaxEntry === undefined
        ? []
        : ([[options.resourceMaxEntry.stateNo, traceAction(options.resourceMaxEntry.stateNo)]] as Array<
            [number, MugenAnimationAction]
          >)),
      ...(options.assertSpecialControlState === undefined
        ? []
        : ([[options.assertSpecialControlState.stateNo, traceAction(options.assertSpecialControlState.stateNo)]] as Array<
            [number, MugenAnimationAction]
          >)),
      ...(options.withHelper ? ([[920, helperTraceAction(920)]] as Array<[number, MugenAnimationAction]>) : []),
      ...(options.withExplod ? ([[930, explodTraceAction(930)]] as Array<[number, MugenAnimationAction]>) : []),
      ...(options.withPauseMoveExplod ? ([[936, explodTraceAction(936)]] as Array<[number, MugenAnimationAction]>) : []),
      ...(options.withSuperMoveExplod ? ([[935, explodTraceAction(935)]] as Array<[number, MugenAnimationAction]>) : []),
      ...(options.withHitPauseExplods ? ([[937, explodTraceAction(937)], [938, explodTraceAction(938)]] as Array<[number, MugenAnimationAction]>) : []),
      ...(options.withMovingExplod ? ([[931, explodTraceAction(931)]] as Array<[number, MugenAnimationAction]>) : []),
      ...(options.withBoundExplod ? ([[932, explodTraceAction(932)]] as Array<[number, MugenAnimationAction]>) : []),
      ...(options.withScaledExplod ? ([[933, explodTraceAction(933)]] as Array<[number, MugenAnimationAction]>) : []),
      ...(options.passiveRemoveOnGetHitExplod ? ([[934, explodTraceAction(934)]] as Array<[number, MugenAnimationAction]>) : []),
      ...(options.numExplodStateNo === undefined ? [] : ([[options.numExplodStateNo, traceAction(options.numExplodStateNo)]] as Array<[number, MugenAnimationAction]>)),
      ...(options.passiveReversalDef
        ? ([
            [options.passiveReversalDef.p1StateNo, traceAction(options.passiveReversalDef.p1StateNo)],
            ...(options.passiveReversalDef.p2StateNo === undefined
              ? []
              : ([[options.passiveReversalDef.p2StateNo, traceAction(options.passiveReversalDef.p2StateNo)]] as Array<
                  [number, MugenAnimationAction]
                >)),
          ] as Array<[number, MugenAnimationAction]>)
        : []),
      ...(options.getHitState?.stateNo === undefined
        ? []
        : ([
            [options.getHitState.stateNo, traceAction(options.getHitState.animNo ?? options.getHitState.stateNo)],
            ...(options.fallDefenceUpBranchStateNo === undefined
              ? []
              : ([[options.fallDefenceUpBranchStateNo, traceAction(options.fallDefenceUpBranchStateNo)]] as Array<[number, MugenAnimationAction]>)),
            ...(options.getHitVarBranch === undefined
              ? []
              : ([[options.getHitVarBranch.stateNo, traceAction(options.getHitVarBranch.animNo ?? options.getHitVarBranch.stateNo)]] as Array<
                  [number, MugenAnimationAction]
                >)),
          ] as Array<[number, MugenAnimationAction]>)),
      ...(options.customStateRoute === undefined
        ? []
        : ([
            [options.customStateRoute.startStateNo, traceAction(options.customStateRoute.animNo ?? options.customStateRoute.startStateNo)],
            ...(options.customStateRoute.chainStateNo === undefined
              ? []
              : ([[options.customStateRoute.chainStateNo, traceAction(options.customStateRoute.chainAnimNo ?? options.customStateRoute.chainStateNo)]] as Array<
                  [number, MugenAnimationAction]
                >)),
          ] as Array<[number, MugenAnimationAction]>)),
      ...(options.targetStateRoute === undefined
        ? []
        : ([
            [options.targetStateRoute.startStateNo, traceAction(options.targetStateRoute.animNo ?? options.targetStateRoute.startStateNo)],
            ...(options.targetStateRoute.chainStateNo === undefined
              ? []
              : ([[options.targetStateRoute.chainStateNo, traceAction(options.targetStateRoute.chainAnimNo ?? options.targetStateRoute.chainStateNo)]] as Array<
                  [number, MugenAnimationAction]
                >)),
          ] as Array<[number, MugenAnimationAction]>)),
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
      ...stateFile.constants,
      "velocity.air.gethit.groundrecover.x": -0.15,
      "velocity.air.gethit.groundrecover.y": -3.5,
    },
  };
}

function sizeConstantsBlock(size: SyntheticImportedTraceFighterOptions["sizeConstants"]): string {
  if (!size?.headPos && !size?.midPos) {
    return "";
  }
  return `
[Size]
${size.headPos ? `head.pos = ${size.headPos[0]},${size.headPos[1]}` : ""}
${size.midPos ? `mid.pos = ${size.midPos[0]},${size.midPos[1]}` : ""}
`;
}

function dataConstantsBlock(options: SyntheticImportedTraceFighterOptions): string {
  const data = {
    life: options.resourceMaxEntry?.lifeMax ?? options.dataStats?.life,
    power: options.resourceMaxEntry?.powerMax ?? options.dataStats?.power,
    attack: options.dataStats?.attack,
    defence: options.dataStats?.defence,
  };
  const lines = Object.entries(data)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key} = ${value}`);
  if (lines.length === 0) {
    return "";
  }
  return `
[Data]
${lines.join("\n")}
`;
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

function passiveHitOverrideController(config: NonNullable<SyntheticImportedTraceFighterOptions["passiveHitOverride"]>): string {
  return `
[State 0, Hit Override]
type = HitOverride
trigger1 = Time >= 0
slot = ${config.slot ?? 1}
attr = ${config.attr}
stateno = ${config.stateNo}
time = ${config.time ?? 30}
forceair = ${config.forceAir ? 1 : 0}
forceguard = ${config.forceGuard ? 1 : 0}
keepstate = ${config.keepState ? 1 : 0}
`;
}

function passiveReversalDefController(config: NonNullable<SyntheticImportedTraceFighterOptions["passiveReversalDef"]>): string {
  const hitPause = config.hitPause ?? 0;
  return `
[State 0, Passive ReversalDef]
type = ReversalDef
trigger1 = 1
reversal.attr = ${config.attr}
pausetime = ${hitPause},${hitPause}
p1stateno = ${config.p1StateNo}
${config.p2StateNo === undefined ? "" : `p2stateno = ${config.p2StateNo}`}
${config.targetId === undefined ? "" : `id = ${config.targetId}`}
`;
}

function passiveReversalStateBlock(config: NonNullable<SyntheticImportedTraceFighterOptions["passiveReversalDef"]>): string {
  const p2State = config.p2StateNo;
  return `
[Statedef ${config.p1StateNo}]
type = A
movetype = H
physics = N
anim = ${config.p1StateNo}
ctrl = 0
${p2State === undefined ? "" : `
[Statedef ${p2State}]
type = A
movetype = H
physics = N
anim = ${p2State}
ctrl = 0
`}
`;
}

function passiveAssertSpecialController(flags: string[], trigger = "1"): string {
  return `
[State 0, Passive AssertSpecial]
type = AssertSpecial
trigger1 = ${trigger}
flag = ${flags.join(", ")}
`;
}

function assertSpecialControlStateBlock(route: NonNullable<SyntheticImportedTraceFighterOptions["assertSpecialControlState"]>): string {
  return `
[Statedef ${route.stateNo}]
type = ${route.stateType ?? "S"}
movetype = ${route.moveType ?? "I"}
physics = ${route.physics ?? "S"}
anim = ${route.stateNo}
ctrl = 1

[State ${route.stateNo}, AssertSpecial Control Flags]
type = AssertSpecial
trigger1 = 1
flag = ${route.flags.join(", ")}
`;
}

function defenseMultiplierController(value: number): string {
  return `
[State 0, Defence Scale]
type = DefenceMulSet
trigger1 = 1
value = ${value}
`;
}

function attackMultiplierController(value: number): string {
  return `
[State 200, Attack Scale]
type = AttackMulSet
trigger1 = Time = 0
value = ${value}
`;
}

function boundsControllerBlock(): string {
  return `
[State 200, PosFreeze Bounds Probe]
type = PosFreeze
trigger1 = Time >= 0
x = 1
y = 0

[State 200, ScreenBound Bounds Probe]
type = ScreenBound
trigger1 = Time >= 0
value = 0
movecamera = 0,1
`;
}

function screenBoundCameraProbeBlock(): string {
  return `
[State 200, ScreenBound Camera Probe]
type = ScreenBound
trigger1 = Time >= 0
value = 0
movecamera = 0,1

[State 200, ScreenBound Offstage Probe]
type = PosAdd
trigger1 = Time = 0
x = 65
y = 0
`;
}

function widthControllerBlock(width: [number, number?]): string {
  return `
[State 200, Width Probe]
type = Width
trigger1 = Time >= 0
player = ${width[0]},${width[1] ?? width[0]}
`;
}

function gravityControllerBlock(): string {
  return `
[State 200, Gravity Probe]
type = Gravity
trigger1 = Time >= 0
`;
}

function kinematicControllerBlock(): string {
  return `
[State 200, Kinematic VelSet Probe]
type = VelSet
trigger1 = Time = 0
x = 2
y = -4

[State 200, Kinematic VelAdd Probe]
type = VelAdd
trigger1 = Time = 0
x = 1
y = 2

[State 200, Kinematic VelMul Probe]
type = VelMul
trigger1 = Time = 0
x = 2
y = 0.5

[State 200, Kinematic PosSet Probe]
type = PosSet
trigger1 = Time = 0
x = 10
y = -8

[State 200, Kinematic PosAdd Probe]
type = PosAdd
trigger1 = Time = 0
x = 6
y = -2
`;
}

function stateTypeSetControllerBlock(config: NonNullable<SyntheticImportedTraceFighterOptions["withStateTypeSet"]>): string {
  return `
[State 200, StateTypeSet Probe]
type = StateTypeSet
trigger1 = Time >= 0
${config.stateType ? `statetype = ${config.stateType}` : ""}
${config.moveType ? `movetype = ${config.moveType}` : ""}
${config.physics ? `physics = ${config.physics}` : ""}
`;
}

function playerPushControllerBlock(enabled: boolean): string {
  return `
[State 200, PlayerPush Probe]
type = PlayerPush
trigger1 = Time >= 0
value = ${enabled ? 1 : 0}
`;
}

function turnControllerBlock(): string {
  return `
[State 200, Turn Probe]
type = Turn
trigger1 = Time >= 0
`;
}

function sprPriorityControllerBlock(priority: number): string {
  return `
[State 200, SprPriority Probe]
type = SprPriority
trigger1 = Time >= 0
value = ${priority}
`;
}

function palFxControllerBlock(options: NonNullable<SyntheticImportedTraceFighterOptions["withPalFx"]>): string {
  return `
[State 200, PalFX Probe]
type = PalFX
trigger1 = Time >= 0
time = ${options.time}
add = ${(options.add ?? [0, 0, 0]).join(",")}
mul = ${(options.mul ?? [256, 256, 256]).join(",")}
color = ${options.color ?? 256}
invertall = ${options.invert ? 1 : 0}
`;
}

function transControllerBlock(trans: string): string {
  return `
[State 200, Trans Probe]
type = Trans
trigger1 = Time >= 0
trans = ${trans}
`;
}

function angleControllerBlock(options: NonNullable<SyntheticImportedTraceFighterOptions["withAngle"]>): string {
  return `
[State 200, AngleSet Probe]
type = AngleSet
trigger1 = Time >= 0
value = ${options.set ?? 0}

[State 200, AngleAdd Probe]
type = AngleAdd
trigger1 = Time >= 0
value = ${options.add ?? 0}

[State 200, AngleDraw Probe]
type = AngleDraw
trigger1 = Time >= 0
`;
}

function envColorControllerBlock(options: NonNullable<SyntheticImportedTraceFighterOptions["withEnvColor"]>): string {
  return `
[State 200, EnvColor Probe]
type = EnvColor
trigger1 = Time >= 0
value = ${(options.value ?? [255, 255, 255]).join(",")}
time = ${options.time ?? 1}
under = ${options.under ? 1 : 0}
`;
}

function envShakeControllerBlock(options: NonNullable<SyntheticImportedTraceFighterOptions["withEnvShake"]>): string {
  return `
[State 200, EnvShake Probe]
type = EnvShake
trigger1 = Time = 1
time = ${options.time ?? 16}
freq = ${options.freq ?? 30}
ampl = ${options.ampl ?? -7}
phase = ${options.phase ?? 0.5}
`;
}

function remapPalControllerBlock(options: NonNullable<SyntheticImportedTraceFighterOptions["withRemapPal"]>): string {
  return `
[State 200, RemapPal Probe]
type = RemapPal
trigger1 = Time >= 0
source = ${options.source.join(",")}
dest = ${options.dest.join(",")}
`;
}

function afterImageControllerBlock(options: NonNullable<SyntheticImportedTraceFighterOptions["withAfterImage"]>): string {
  return `
[State 200, AfterImage Probe]
type = AfterImage
trigger1 = Time >= 0
time = ${options.time ?? 20}
length = ${options.length ?? 6}
timegap = ${options.timeGap ?? 1}
framegap = ${options.frameGap ?? 1}
paladd = ${(options.palAdd ?? [0, 0, 0]).join(",")}
palmul = ${(options.palMul ?? [192, 192, 192]).join(",")}
trans = ${options.trans ?? "trans"}
`;
}

function afterImageTimeControllerBlock(time: number): string {
  return `
[State 200, AfterImageTime Probe]
type = AfterImageTime
trigger1 = Time >= 0
time = ${time}
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

function targetStateControllerBlock(targetId: number, stateNo: number): string {
  return `
[State 200, Target Custom State]
type = TargetState
trigger1 = Time = 2
id = ${targetId}
value = ${stateNo}
`;
}

function bindToTargetBlock(targetId: number, postype: "Foot" | "Mid" | "Head" = "Foot"): string {
  return `
[State 200, Bind Owner To Target]
type = BindToTarget
trigger1 = Time = 2
id = ${targetId}
pos = 20,-8,${postype}
time = 4
`;
}

function fallHitDefBlock(fall: NonNullable<DemoMove["fall"]>): string {
  return `
fall = ${fall.enabled ? 1 : 0}
${fall.damage === undefined ? "" : `fall.damage = ${fall.damage}`}
${fall.defenceUp === undefined ? "" : `fall.defence_up = ${fall.defenceUp}`}
${fall.kill === undefined ? "" : `fall.kill = ${fall.kill ? 1 : 0}`}
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

function getHitStateBlock(
  state: { stateNo: number; animNo?: number },
  fallDefenceUpBranchStateNo?: number,
  getHitVarBranch?: { stateNo: number; expression: string; animNo?: number },
): string {
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
${fallDefenceUpBranchStateNo === undefined ? "" : `
[State ${state.stateNo}, Fall Defence Up Branch]
type = ChangeState
trigger1 = Time = 1
trigger1 = GetHitVar(fall.defence_up) = 150
value = ${fallDefenceUpBranchStateNo}

[Statedef ${fallDefenceUpBranchStateNo}]
type = A
movetype = H
physics = A
anim = ${fallDefenceUpBranchStateNo}
ctrl = 0
`}
${getHitVarBranch === undefined ? "" : `
[State ${state.stateNo}, GetHitVar Branch]
type = ChangeState
trigger1 = Time = 1
trigger1 = ${getHitVarBranch.expression}
value = ${getHitVarBranch.stateNo}

[Statedef ${getHitVarBranch.stateNo}]
type = A
movetype = H
physics = A
anim = ${getHitVarBranch.animNo ?? getHitVarBranch.stateNo}
ctrl = 0
`}
`;
}

function customStateRouteBlock(route: NonNullable<SyntheticImportedTraceFighterOptions["customStateRoute"]>): string {
  const startAnim = route.animNo ?? route.startStateNo;
  const chainState = route.chainStateNo;
  const chainAnim = route.chainAnimNo ?? chainState;
  const selfStateDelay = route.selfStateAfter ?? 4;
  return `
[Statedef ${route.startStateNo}]
type = A
movetype = H
physics = N
anim = ${startAnim}
ctrl = 0
${chainState === undefined ? "" : `
[State ${route.startStateNo}, Chain Owner Custom State]
type = ChangeState
trigger1 = Time >= ${route.changeStateAfter ?? 1}
value = ${chainState}
`}
${chainState === undefined ? `
[State ${route.startStateNo}, Return To Self]
type = SelfState
trigger1 = Time >= ${selfStateDelay}
value = 0
ctrl = 1
` : ""}
${chainState === undefined ? "" : `
[Statedef ${chainState}]
type = A
movetype = H
physics = N
anim = ${chainAnim}
ctrl = 0

[State ${chainState}, Return To Self]
type = SelfState
trigger1 = Time >= ${selfStateDelay}
value = 0
ctrl = 1
`}
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
  airShakeStateNo?: number;
  airSlideStateNo?: number;
  guardStateNo?: number;
  shakeAnimNo?: number;
  guardAnimNo?: number;
}): string {
  const shakeStateNo = state.shakeStateNo ?? 150;
  const slideStateNo = state.slideStateNo ?? 151;
  const crouchShakeStateNo = state.crouchShakeStateNo ?? 152;
  const crouchSlideStateNo = state.crouchSlideStateNo ?? 153;
  const airShakeStateNo = state.airShakeStateNo ?? 154;
  const airSlideStateNo = state.airSlideStateNo ?? 155;
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

[Statedef ${airShakeStateNo}]
type = A
movetype = H
physics = N
velset = 0,0
ctrl = 0

[State ${airShakeStateNo}, Air Guard Shake Anim]
type = ChangeAnim
trigger1 = 1
value = ${shakeAnimNo}

[State ${airShakeStateNo}, Air Guard Shake Over]
type = ChangeState
trigger1 = HitShakeOver
value = ${airSlideStateNo}

[Statedef ${airSlideStateNo}]
type = A
movetype = H
physics = N
anim = ${shakeAnimNo}
ctrl = 0

[State ${airSlideStateNo}, Apply Air Guard Velocity]
type = HitVelSet
trigger1 = Time = 0
x = 1
y = 1

[State ${airSlideStateNo}, Apply Air Guard Gravity]
type = VelAdd
trigger1 = 1
y = Const(movement.yaccel)

[State ${airSlideStateNo}, Regain Air Guard Control]
type = CtrlSet
trigger1 = Time = GetHitVar(ctrltime)
value = 1

[State ${airSlideStateNo}, Air Guard Hit Over]
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
physics = N
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

[State ${state.groundRecoveryLandStateNo}, Land]
type = ChangeState
trigger1 = Time = 3
value = ${state.landStateNo}

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

function targetDropBlock(): string {
  return `
[State 200, Target Drop]
type = TargetDrop
trigger1 = Time = 3
excludeID = -1
keepone = 0
`;
}

function prePauseTargetBindBlock(targetId: number): string {
  return `
[State 200, Target Bind Before Pause]
type = TargetBind
trigger1 = Time = 2
id = ${targetId}
pos = 36,-12
time = 4
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

function pauseControllerBlock(): string {
  return `
[State 200, Pause]
type = Pause
trigger1 = Time = 2
time = 7
movetime = 1
`;
}

function delayedSuperPauseControllerBlock(): string {
  return `
[State 200, Delayed Super Pause]
type = SuperPause
trigger1 = Time = 1
time = 7
movetime = 1
darken = 1
poweradd = 100
`;
}

function pauseMovePosAddBlock(input: { x: number; y: number; time?: number }): string {
  return `
[State 200, Move During Pause]
type = PosAdd
trigger1 = Time = ${input.time ?? 1}
x = ${input.x}
y = ${input.y}
`;
}

function projectileControllerBlock(
  priority = 1,
  offset: [number, number] = [62, -45],
  velocity: [number, number] = [36, 0],
  groundVelocity: [number, number?] = [-5],
  hits = 1,
  missTime = 0,
  hitAnim?: number,
  removeAnim?: number,
  cancelAnim?: number,
  accel?: [number, number],
  velocityMultiplier?: [number, number],
  scale?: [number, number],
): string {
  const hitAnimLine = hitAnim === undefined ? "" : `projhitanim = ${hitAnim}`;
  const removeAnimLine = removeAnim === undefined ? "" : `projremanim = ${removeAnim}`;
  const cancelAnimLine = cancelAnim === undefined ? "" : `projcancelanim = ${cancelAnim}`;
  const accelLine = accel === undefined ? "" : `accel = ${accel[0]},${accel[1]}`;
  const velocityMultiplierLine = velocityMultiplier === undefined ? "" : `velmul = ${velocityMultiplier[0]},${velocityMultiplier[1]}`;
  const scaleLine = scale === undefined ? "" : `projscale = ${scale[0]},${scale[1]}`;
  return `
[State 200, Fast Projectile]
type = Projectile
trigger1 = Time = 2
projid = 77
projpriority = ${priority}
projhits = ${hits}
projmisstime = ${missTime}
projanim = 910
${hitAnimLine}
${removeAnimLine}
${cancelAnimLine}
offset = ${offset[0]},${offset[1]}
velocity = ${velocity[0]},${velocity[1]}
${accelLine}
${velocityMultiplierLine}
${scaleLine}
projremovetime = 24
damage = 31,4
pausetime = 4,4
ground.hittime = 13
ground.velocity = ${groundVelocity.join(",")}
guardflag = MA
guard.pausetime = 3,3
guard.hittime = 8
guard.velocity = -2
guard.dist = 120
sprpriority = 7
`;
}

function modifyProjectileControllerBlock(input: {
  triggerTime?: number;
  velocity?: [number, number];
  accel?: [number, number];
  velocityMultiplier?: [number, number];
  scale?: [number, number];
  removeTime?: number;
  priority?: number;
  hits?: number;
  missTime?: number;
}): string {
  const velocityLine = input.velocity === undefined ? "" : `velocity = ${input.velocity[0]},${input.velocity[1]}`;
  const accelLine = input.accel === undefined ? "" : `accel = ${input.accel[0]},${input.accel[1]}`;
  const velocityMultiplierLine =
    input.velocityMultiplier === undefined ? "" : `velmul = ${input.velocityMultiplier[0]},${input.velocityMultiplier[1]}`;
  const scaleLine = input.scale === undefined ? "" : `projscale = ${input.scale[0]},${input.scale[1]}`;
  const removeTimeLine = input.removeTime === undefined ? "" : `projremovetime = ${input.removeTime}`;
  const priorityLine = input.priority === undefined ? "" : `projpriority = ${input.priority}`;
  const hitsLine = input.hits === undefined ? "" : `projhits = ${input.hits}`;
  const missTimeLine = input.missTime === undefined ? "" : `projmisstime = ${input.missTime}`;
  return `
[State 200, Modify Fast Projectile]
type = ModifyProjectile
trigger1 = Time = ${input.triggerTime ?? 3}
projid = 77
${velocityLine}
${accelLine}
${velocityMultiplierLine}
${scaleLine}
${removeTimeLine}
${priorityLine}
${hitsLine}
${missTimeLine}
`;
}

function contactBranchBlock(trigger: string, stateNo: number, label: string): string {
  return `
[State 200, ${label}]
type = ChangeState
trigger1 = ${trigger}
value = ${stateNo}
ctrl = 0
`;
}

function hitAddControllerBlock(value: number): string {
  return `
[State 200, HitAdd Probe]
type = HitAdd
trigger1 = MoveHit
value = ${value}
`;
}

function moveHitResetControllerBlock(): string {
  return `
[State 200, Reset Direct Contact]
type = MoveHitReset
trigger1 = MoveHit >= 1
`;
}

function variableControllerBlock(stateNo: number): string {
  return `
[State 200, Var Set Seed]
type = VarSet
trigger1 = MoveHit >= 1
v = 7
value = 3

[State 200, Var Add Delta]
type = VarAdd
trigger1 = var(7) = 3
var(7) = 5

[State 200, Var Range Fill]
type = VarRangeSet
trigger1 = var(7) = 8
first = 2
last = 4
value = 9

[State 200, Variable Branch]
type = ChangeState
trigger1 = var(7) = 8
trigger1 = var(2) = 9
trigger1 = var(3) = 9
trigger1 = var(4) = 9
value = ${stateNo}
ctrl = 0
`;
}

function resourceControllerBlock(stateNo: number): string {
  return `
[State 200, Life Add Probe]
type = LifeAdd
trigger1 = MoveHit >= 1
value = -20
kill = 0

[State 200, Life Set Probe]
type = LifeSet
trigger1 = Life = 980
value = 750

[State 200, Power Add Probe]
type = PowerAdd
trigger1 = Life = 750
value = 200

[State 200, Power Set Probe]
type = PowerSet
trigger1 = Power >= 200
value = 900

[State 200, Resource Branch]
type = ChangeState
trigger1 = Life = 750
trigger1 = Power = 900
value = ${stateNo}
ctrl = 0
`;
}

function controlControllerBlock(): string {
  return `
[State 200, Ctrl Off Probe]
type = CtrlSet
trigger1 = Time = 0
value = 0

[State 200, Ctrl On Probe]
type = CtrlSet
trigger1 = Time = 2
value = 1
`;
}

function animationControllerBlock(): string {
  return `
[State 200, ChangeAnim Probe]
type = ChangeAnim
trigger1 = Time = 0
value = 205
elem = 1

[State 200, ChangeAnim2 Probe]
type = ChangeAnim2
trigger1 = Time = 2
value = 206
elem = 1
`;
}

function soundControllerBlock(): string {
  return `
[State 200, Play Sound Probe]
type = PlaySnd
trigger1 = Time = 1
value = S5,0
channel = 2

[State 200, Stop Sound Probe]
type = StopSnd
trigger1 = Time = 3
channel = 2
`;
}

function receivedDamageRouteBlock(route: { sourceStateNo: number; finalStateNo: number }): string {
  return `
[Statedef ${route.sourceStateNo}]
type = S
movetype = H
physics = N
anim = ${route.sourceStateNo}
ctrl = 0

[State ${route.sourceStateNo}, Received Damage Branch]
type = ChangeState
trigger1 = ReceivedDamage > 0
trigger1 = ReceivedHits >= 1
value = ${route.finalStateNo}
ctrl = 0

[Statedef ${route.finalStateNo}]
type = S
movetype = H
physics = N
anim = ${route.finalStateNo}
ctrl = 0
`;
}

function prevStateEntryBlock(stateNo: number): string {
  return `
[State 200, PrevState Entry]
type = ChangeState
trigger1 = Time = 2
value = ${stateNo}
ctrl = 0
`;
}

function prevMoveTypeEntryBlock(stateNo: number): string {
  return `
[State 200, PrevMoveType Entry]
type = ChangeState
trigger1 = Time = 2
value = ${stateNo}
ctrl = 0
`;
}

function prevAnimEntryBlock(route: { previousAnimNo: number; intermediateStateNo: number }): string {
  return `
[State 200, PrevAnim Probe]
type = ChangeAnim
trigger1 = Time = 1
value = ${route.previousAnimNo}

[State 200, PrevAnim Entry]
type = ChangeState
trigger1 = Time = 2
value = ${route.intermediateStateNo}
ctrl = 0
`;
}

function prevStateTypeEntryBlock(stateNo: number): string {
  return `
[State 200, PrevStateType Entry]
type = ChangeState
trigger1 = Time = 2
value = ${stateNo}
ctrl = 0
`;
}

function prevAnimRouteBlock(route: { previousAnimNo: number; intermediateStateNo: number; finalStateNo: number }): string {
  return `
[Statedef ${route.intermediateStateNo}]
type = S
movetype = I
physics = S
anim = ${route.intermediateStateNo}
ctrl = 0

[State ${route.intermediateStateNo}, PrevAnim Branch]
type = ChangeState
trigger1 = PrevAnim = ${route.previousAnimNo}
value = ${route.finalStateNo}
ctrl = 1

[Statedef ${route.finalStateNo}]
type = S
movetype = I
physics = S
anim = ${route.finalStateNo}
ctrl = 1
`;
}

function prevStateRouteBlock(route: { intermediateStateNo: number; finalStateNo: number }): string {
  return `
[Statedef ${route.intermediateStateNo}]
type = S
movetype = I
physics = S
anim = ${route.intermediateStateNo}
ctrl = 0

[State ${route.intermediateStateNo}, PrevState Branch]
type = ChangeState
trigger1 = PrevStateNo = 200
value = ${route.finalStateNo}
ctrl = 1

[Statedef ${route.finalStateNo}]
type = S
movetype = I
physics = S
anim = ${route.finalStateNo}
ctrl = 1
`;
}

function prevMoveTypeRouteBlock(route: { intermediateStateNo: number; finalStateNo: number }): string {
  return `
[Statedef ${route.intermediateStateNo}]
type = S
movetype = I
physics = S
anim = ${route.intermediateStateNo}
ctrl = 0

[State ${route.intermediateStateNo}, PrevMoveType Branch]
type = ChangeState
trigger1 = PrevMoveType = A
value = ${route.finalStateNo}
ctrl = 1

[Statedef ${route.finalStateNo}]
type = S
movetype = I
physics = S
anim = ${route.finalStateNo}
ctrl = 1
`;
}

function prevStateTypeRouteBlock(route: { intermediateStateNo: number; finalStateNo: number }): string {
  return `
[Statedef ${route.intermediateStateNo}]
type = S
movetype = I
physics = S
anim = ${route.intermediateStateNo}
ctrl = 0

[State ${route.intermediateStateNo}, PrevStateType Branch]
type = ChangeState
trigger1 = PrevStateType = A
value = ${route.finalStateNo}
ctrl = 1

[Statedef ${route.finalStateNo}]
type = S
movetype = I
physics = S
anim = ${route.finalStateNo}
ctrl = 1
`;
}

function enemyNearStateEntryBlock(route: { opponentStateNo: number; stateNo: number }): string {
  return `
[State -1, EnemyNear State Route]
type = ChangeState
value = ${route.stateNo}
triggerall = command = "x"
trigger1 = EnemyNear, StateNo = ${route.opponentStateNo}
`;
}

function p2MetricsStateEntryBlock(route: { stateNo: number }): string {
  return `
[State -1, P2 Metrics Route]
type = ChangeState
value = ${route.stateNo}
triggerall = command = "x"
trigger1 = NumEnemy
trigger1 = Facing = 1
trigger1 = P2Facing = -1
trigger1 = P2Life = 1000
trigger1 = P2Power = 0
`;
}

function selfStateNoExistStateEntryBlock(route: { existingStateNo: number; missingStateNo: number; stateNo: number }): string {
  return `
[State -1, SelfStateNoExist Route]
type = ChangeState
value = ${route.stateNo}
triggerall = command = "x"
trigger1 = ctrl
trigger1 = SelfStateNoExist(${route.existingStateNo})
trigger1 = !SelfStateNoExist(${route.missingStateNo})
`;
}

function selfCommandStateEntryBlock(route: { commandName: string; stateNo: number }): string {
  return `
[State -1, SelfCommand Route]
type = ChangeState
value = ${route.stateNo}
triggerall = command = "${route.commandName}"
trigger1 = ctrl
trigger1 = SelfCommand = "${route.commandName}"
`;
}

function stageTimeStateEntryBlock(route: { minStageTime: number; stateNo: number }): string {
  return `
[State -1, StageTime Route]
type = ChangeState
value = ${route.stateNo}
triggerall = command = "x"
trigger1 = ctrl
trigger1 = StageTime >= ${route.minStageTime}
`;
}

function aliveStateEntryBlock(route: { stateNo: number }): string {
  return `
[State -1, Alive Route]
type = ChangeState
value = ${route.stateNo}
triggerall = command = "x"
trigger1 = ctrl
trigger1 = Alive
`;
}

function roundStateEntryBlock(route: { roundNo: number; roundState: number; stateNo: number }): string {
  return `
[State -1, Round Trigger Route]
type = ChangeState
value = ${route.stateNo}
triggerall = command = "x"
trigger1 = ctrl
trigger1 = RoundNo = ${route.roundNo}
trigger1 = RoundState = ${route.roundState}
`;
}

function matchContextEntryBlock(route: { roundsExisted: number; stateNo: number }): string {
  return `
[State -1, Match Context Route]
type = ChangeState
value = ${route.stateNo}
triggerall = command = "x"
trigger1 = ctrl
trigger1 = RoundsExisted = ${route.roundsExisted}
trigger1 = !MatchOver
`;
}

function resourceMaxEntryBlock(route: { lifeMax: number; powerMax: number; stateNo: number }): string {
  return `
[State -1, Resource Max Route]
type = ChangeState
value = ${route.stateNo}
triggerall = command = "x"
trigger1 = ctrl
trigger1 = LifeMax = ${route.lifeMax}
trigger1 = PowerMax = ${route.powerMax}
`;
}

function simpleStateBlock(stateNo: number, moveType: "I" | "A" | "H" = "I"): string {
  return `
[Statedef ${stateNo}]
type = S
movetype = ${moveType}
physics = S
anim = ${stateNo}
ctrl = 0
`;
}

function hitDefAttrBranchBlock(stateNo: number): string {
  return `
[State 200, HitDefAttr Branch]
type = ChangeState
trigger1 = HitDefAttr = SC, NA, SA, HA
trigger1 = MoveContact
value = ${stateNo}
ctrl = 0
`;
}

function helperControllerBlock(
  velocity?: [number, number],
  scale?: [number, number],
  pause?: { pauseMoveTime?: number; superMoveTime?: number; ignoreHitPause?: boolean; triggerTime?: number },
): string {
  const velocityLine = velocity === undefined ? "" : `velset = ${velocity[0]},${velocity[1]}`;
  const scaleLine = scale === undefined ? "" : `scale = ${scale[0]},${scale[1]}`;
  const pauseMoveTimeLine = pause?.pauseMoveTime === undefined ? "" : `pausemovetime = ${pause.pauseMoveTime}`;
  const superMoveTimeLine = pause?.superMoveTime === undefined ? "" : `supermovetime = ${pause.superMoveTime}`;
  const ignoreHitPauseLine = pause?.ignoreHitPause ? "ignorehitpause = 1" : "";
  const triggerTime = pause?.triggerTime ?? 2;
  return `
[State 200, Visual Helper]
type = Helper
trigger1 = Time = ${triggerTime}
id = 42
name = "Buddy"
stateno = 1200
anim = 920
pos = -44,-28
postype = p1
facing = 1
sprpriority = 8
removetime = 30
${velocityLine}
${scaleLine}
${pauseMoveTimeLine}
${superMoveTimeLine}
${ignoreHitPauseLine}
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

function superMoveExplodControllerBlock(): string {
  return `
[State 200, SuperMove Visual Explod]
type = Explod
trigger1 = Time = 2
id = 9005
anim = 935
pos = 42,-42
postype = p1
vel = 5,0
facing = 1
sprpriority = 7
removetime = 30
supermovetime = 4
trans = add
`;
}

function pauseMoveExplodControllerBlock(): string {
  return `
[State 200, PauseMove Visual Explod]
type = Explod
trigger1 = Time = 2
id = 9006
anim = 936
pos = 42,-24
postype = p1
vel = 5,0
facing = 1
sprpriority = 7
removetime = 30
pausemovetime = 4
trans = add
`;
}

function hitPauseExplodsControllerBlock(): string {
  return `
[State 200, Frozen HitPause Visual Explod]
type = Explod
trigger1 = Time = 0
id = 9007
anim = 938
pos = 42,-58
postype = p1
vel = 5,0
facing = 1
sprpriority = 6
removetime = 30
trans = add

[State 200, IgnoreHitPause Visual Explod]
type = Explod
trigger1 = Time = 0
id = 9008
anim = 937
pos = 42,-24
postype = p1
vel = 5,0
facing = 1
sprpriority = 7
removetime = 30
ignorehitpause = 1
trans = add
`;
}

function movingExplodControllerBlock(): string {
  return `
[State 200, Moving Visual Explod]
type = Explod
trigger1 = Time = 2
id = 9001
anim = 931
pos = 42,-58
postype = p1
vel = 4,-2
accel = 1,0.5
facing = 1
sprpriority = 6
removetime = 30
trans = add
`;
}

function boundExplodControllerBlock(): string {
  return `
[State 200, Bound Visual Explod]
type = Explod
trigger1 = Time = 2
id = 9002
anim = 932
pos = 32,-54
postype = p1
bindtime = 8
facing = 1
sprpriority = 6
removetime = 30
trans = add

[State 200, Move During Bound Explod]
type = PosAdd
trigger1 = Time >= 3
x = 8
y = 0
`;
}

function scaledExplodControllerBlock(): string {
  return `
[State 200, Scaled Visual Explod]
type = Explod
trigger1 = Time = 2
id = 9003
anim = 933
pos = 42,-58
postype = p1
scale = 2,0.5
facing = 1
sprpriority = 6
removetime = 30
trans = add
`;
}

function passiveRemoveOnGetHitExplodControllerBlock(): string {
  return `
[State 0, Passive RemoveOnGetHit Explod]
type = Explod
trigger1 = Time = 0
id = 9004
anim = 934
pos = 18,-54
postype = p1
facing = 1
sprpriority = 6
removetime = -1
removeongethit = 1
trans = add
`;
}

function removeExplodControllerBlock(): string {
  return `
[State 200, Remove Visual Explod]
type = RemoveExplod
trigger1 = Time = 4
id = 9000
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

function projectileTerminalTraceActions(options: SyntheticImportedTraceFighterOptions): Array<[number, MugenAnimationAction]> {
  return [options.projectileHitAnim, options.projectileRemoveAnim, options.projectileCancelAnim]
    .filter((id): id is number => id !== undefined)
    .filter((id, index, ids) => ids.indexOf(id) === index)
    .map((id): [number, MugenAnimationAction] => [id, projectileTerminalTraceAction(id)]);
}

function projectileTerminalTraceAction(id: number): MugenAnimationAction {
  return {
    id,
    rawLines: [`[Begin Action ${id}]`],
    frames: [
      {
        spriteGroup: id,
        spriteIndex: 0,
        offsetX: 0,
        offsetY: 0,
        duration: 2,
        clsn1: [],
        clsn2: [],
        raw: `${id},0,0,0,2`,
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

function traceAction(id: number, duration = 4): MugenAnimationAction {
  return {
    id,
    rawLines: [`[Begin Action ${id}]`],
    frames: [
      {
        spriteGroup: id,
        spriteIndex: 0,
        offsetX: 0,
        offsetY: 0,
        duration,
        clsn1: id === 200 ? [{ x1: 12, y1: -70, x2: 76, y2: -35 }] : [],
        clsn2: [{ x1: -20, y1: -80, x2: 20, y2: 0 }],
        raw: `${id},0,0,0,${duration}`,
        line: 1,
      },
    ],
  };
}

function reversalTraceAction(id: number, duration = 4): MugenAnimationAction {
  const action = traceAction(id, duration);
  const frame = action.frames[0];
  if (frame) {
    frame.clsn1 = [{ x1: 10, y1: -45, x2: 36, y2: -18 }];
  }
  return action;
}

export const MATCH_TICK_SCHEDULE_SCHEMA = "MatchTickSchedule/v0" as const;

export type RuntimeMatchTickBranch = "idle" | "hitpause" | "pause" | "active";

export type RuntimeMatchTickPhaseId =
  | "tick:stamp-input"
  | "frame:start"
  | "branch:hitpause-advance"
  | "branch:pause-check"
  | "pause:advance"
  | "active:round-timer"
  | "active:command-buffer"
  | "active:input-control"
  | "active:fighter-advance"
  | "fighter:kinematics"
  | "fighter:animation"
  | "fighter:controllers"
  | "fighter:auto-guard-check:pre"
  | "fighter:auto-guard-check:post"
  | "active:post-fighter"
  | "post-fighter:combat"
  | "post-fighter:presentation-effects"
  | "active:round-finish"
  | "tick:guard-distance-latch"
  | "tick:restore-superpause-defense";

export type RuntimeMatchSnapshotPhaseId = "snapshot:presentation" | "snapshot:materialize";

export type RuntimeMatchTickPhase = {
  id: RuntimeMatchTickPhaseId;
  owner: string;
  actorId?: string;
  mutableStores: string[];
  sideEffects: string[];
};

export type RuntimeMatchSnapshotPhase = {
  id: RuntimeMatchSnapshotPhaseId;
  owner: string;
  mutableStores: string[];
  sideEffects: string[];
};

export type RuntimeMatchTickSchedule = {
  schema: typeof MATCH_TICK_SCHEDULE_SCHEMA;
  tick: number;
  branch: RuntimeMatchTickBranch;
  phases: RuntimeMatchTickPhase[];
  snapshotPhases: RuntimeMatchSnapshotPhase[];
  observationScope: "last-executed-tick-observed-phases";
  architectureComparison: RuntimeMatchTickArchitectureComparison;
  behaviorChecksumProjection: "excluded";
};

export type RuntimeMatchTickArchitectureComparison = {
  reference: "roadmap-target";
  status: "not-applicable" | "aligned" | "known-divergence";
  checks: RuntimeMatchTickOrderCheck[];
};

export type RuntimeMatchTickOrderCheck = {
  id: "controllers-before-kinematics" | "combat-before-animation";
  expectedBefore: RuntimeMatchTickPhaseId;
  expectedAfter: RuntimeMatchTickPhaseId;
  actualBefore: RuntimeMatchTickPhaseId;
  actualAfter: RuntimeMatchTickPhaseId;
  matches: boolean;
};

const TICK_PHASES: Record<RuntimeMatchTickPhaseId, RuntimeMatchTickPhase> = {
  "tick:stamp-input": phase(
    "tick:stamp-input",
    "RuntimeMatchTickInputWorld",
    ["fighter.compatibilityTick", "fighter.currentInput"],
    ["runtime tick and current input stamped"],
  ),
  "frame:start": phase(
    "frame:start",
    "RuntimeMatchFrameStartWorld",
    ["fighter.runtime"],
    ["transient flags reset", "pre-facing AssertSpecial applied", "auto-facing updated"],
  ),
  "branch:hitpause-advance": phase(
    "branch:hitpause-advance",
    "RuntimeMatchHitPauseWorld",
    ["fighter.runtime", "fighter.commandBuffer", "effects", "hitPauseWorld"],
    ["hitpause branch evaluated", "ignorehitpause controllers may run", "paused presentation may advance"],
  ),
  "branch:pause-check": phase(
    "branch:pause-check",
    "RuntimeMatchTickBranchWorld",
    [],
    ["Pause/SuperPause branch selected"],
  ),
  "pause:advance": phase(
    "pause:advance",
    "RuntimeMatchPausedBridgeWorld",
    ["fighter.runtime", "fighter.commandBuffer", "effects", "targetWorld", "pauseWorld"],
    ["pause movetime branch may advance", "pause timer decremented"],
  ),
  "active:round-timer": phase("active:round-timer", "RuntimeMatchRoundWorld", ["round"], ["round timer decremented"]),
  "active:command-buffer": phase(
    "active:command-buffer",
    "RuntimeMatchTickInputWorld",
    ["fighter.commandBuffer"],
    ["normal command buffers advanced"],
  ),
  "active:input-control": phase(
    "active:input-control",
    "RuntimeMatchInputControlWorld",
    ["fighter.runtime", "inputControlWorld"],
    ["player or AI intent applied"],
  ),
  "active:fighter-advance": phase(
    "active:fighter-advance",
    "RuntimeMatchFighterAdvanceWorld",
    ["fighter.runtime", "fighter.controllerState", "fighter.constraintState"],
    ["P1 then P2 fighter simulation advanced", "auto-guard checks applied"],
  ),
  "fighter:kinematics": phase(
    "fighter:kinematics",
    "RuntimeKinematicsWorld",
    ["fighter.runtime"],
    ["fighter position and velocity advanced"],
  ),
  "fighter:animation": phase("fighter:animation", "RuntimeAnimationWorld", ["fighter.runtime"], ["fighter animation clock advanced"]),
  "fighter:controllers": phase(
    "fighter:controllers",
    "RuntimeActiveControllerRunWorld",
    ["fighter.runtime", "fighter.controllerState", "effects", "targetWorld", "pauseWorld"],
    ["authored active-state controllers evaluated in source order"],
  ),
  "fighter:auto-guard-check:pre": phase(
    "fighter:auto-guard-check:pre",
    "RuntimeAutoGuardStartWorld",
    ["defender.runtime"],
    ["pre-controller automatic guard-start eligibility checked", "state 120 may be entered"],
  ),
  "fighter:auto-guard-check:post": phase(
    "fighter:auto-guard-check:post",
    "RuntimeAutoGuardStartWorld",
    ["defender.runtime"],
    ["post-controller automatic guard-start eligibility checked", "state 120 may be entered"],
  ),
  "active:post-fighter": phase(
    "active:post-fighter",
    "RuntimeMatchPostFighterWorld",
    ["targetWorld", "effects", "fighter.runtime", "contactMemory", "presentationEvents"],
    ["effects and bindings advanced", "combat resolved", "bounds applied"],
  ),
  "post-fighter:combat": phase(
    "post-fighter:combat",
    "RuntimeMatchInteractionWorld",
    ["fighter.runtime", "effects", "targetWorld", "contactMemory", "presentationEvents"],
    ["priority, direct, projectile, and helper combat resolved"],
  ),
  "post-fighter:presentation-effects": phase(
    "post-fighter:presentation-effects",
    "RuntimeMatchInteractionWorld",
    ["effects"],
    ["Explod presentation effects advanced"],
  ),
  "active:round-finish": phase(
    "active:round-finish",
    "RuntimeMatchRoundWorld",
    ["round", "audioWorld"],
    ["KO or time-over evaluated", "KO sound may emit"],
  ),
  "tick:guard-distance-latch": phase(
    "tick:guard-distance-latch",
    "RuntimeGuardDistanceWorld",
    ["fighter.runtime.inGuardDist"],
    ["direct and projectile guard-distance eligibility latched for the next tick"],
  ),
  "tick:restore-superpause-defense": {
    id: "tick:restore-superpause-defense",
    owner: "PlayableMatchRuntime",
    mutableStores: ["superPauseTargetDefenseOverrides", "fighter.runtime.defenseMultiplier"],
    sideEffects: ["expired SuperPause target defence restored"],
  },
};

const SNAPSHOT_PHASES: RuntimeMatchSnapshotPhase[] = [
  {
    id: "snapshot:presentation",
    owner: "RuntimeMatchPresentationSnapshotWorld",
    mutableStores: [],
    sideEffects: ["presentation actors and effects projected"],
  },
  {
    id: "snapshot:materialize",
    owner: "RuntimeSnapshotWorld",
    mutableStores: [],
    sideEffects: ["immutable external snapshot materialized"],
  },
];

export class RuntimeMatchTickScheduleRecorder {
  private readonly phases: RuntimeMatchTickPhase[] = [];

  constructor(private readonly tick: number) {}

  record(id: RuntimeMatchTickPhaseId, actorId?: string): void {
    this.phases.push({ ...clonePhase(TICK_PHASES[id]), ...(actorId ? { actorId } : {}) });
  }

  complete(branch: Exclude<RuntimeMatchTickBranch, "idle">): RuntimeMatchTickSchedule {
    return createSchedule(this.tick, branch, this.phases);
  }
}

export function createIdleMatchTickSchedule(tick = 0): RuntimeMatchTickSchedule {
  return createSchedule(tick, "idle", []);
}

function createSchedule(
  tick: number,
  branch: RuntimeMatchTickBranch,
  phases: RuntimeMatchTickPhase[],
): RuntimeMatchTickSchedule {
  return {
    schema: MATCH_TICK_SCHEDULE_SCHEMA,
    tick,
    branch,
    phases: phases.map(clonePhase),
    snapshotPhases: SNAPSHOT_PHASES.map(clonePhase),
    observationScope: "last-executed-tick-observed-phases",
    architectureComparison: compareArchitectureOrder(branch, phases),
    behaviorChecksumProjection: "excluded",
  };
}

function compareArchitectureOrder(
  branch: RuntimeMatchTickBranch,
  phases: RuntimeMatchTickPhase[],
): RuntimeMatchTickArchitectureComparison {
  if (branch !== "active") {
    return { reference: "roadmap-target", status: "not-applicable", checks: [] };
  }

  const checks = [
    orderCheck("controllers-before-kinematics", "fighter:controllers", "fighter:kinematics", phases),
    orderCheck("combat-before-animation", "post-fighter:combat", "fighter:animation", phases),
  ];
  return {
    reference: "roadmap-target",
    status: checks.every((check) => check.matches) ? "aligned" : "known-divergence",
    checks,
  };
}

function orderCheck(
  id: RuntimeMatchTickOrderCheck["id"],
  expectedBefore: RuntimeMatchTickPhaseId,
  expectedAfter: RuntimeMatchTickPhaseId,
  phases: RuntimeMatchTickPhase[],
): RuntimeMatchTickOrderCheck {
  const beforeIndex = phases.findIndex((phase) => phase.id === expectedBefore);
  const afterIndex = phases.findIndex((phase) => phase.id === expectedAfter);
  const matches = beforeIndex >= 0 && afterIndex >= 0 && beforeIndex < afterIndex;
  return {
    id,
    expectedBefore,
    expectedAfter,
    actualBefore: matches ? expectedBefore : expectedAfter,
    actualAfter: matches ? expectedAfter : expectedBefore,
    matches,
  };
}

function phase(
  id: RuntimeMatchTickPhaseId,
  owner: string,
  mutableStores: string[],
  sideEffects: string[],
): RuntimeMatchTickPhase {
  return { id, owner, mutableStores, sideEffects };
}

function clonePhase<T extends RuntimeMatchTickPhase | RuntimeMatchSnapshotPhase>(value: T): T {
  return {
    ...value,
    mutableStores: [...value.mutableStores],
    sideEffects: [...value.sideEffects],
  };
}

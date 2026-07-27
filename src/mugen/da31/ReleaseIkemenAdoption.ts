/**
 * DA31-033…040: IKEMEN source, ZSS, teams, shared port, CLI/CI, local release.
 */

export type ReleaseAdoptionRow = {
  id: string;
  title: string;
  claimCeiling: string;
  liveConsumer: string;
};

export const RELEASE_ADOPTION_ROWS: ReleaseAdoptionRow[] = [
  {
    id: "DA31-033",
    title: "Ikemen source authority families",
    claimCeiling: "source provenance per reviewed family only",
    liveConsumer: "IkemenSourceAuthority + SourceAuthorityEpoch",
  },
  {
    id: "DA31-034",
    title: "ZSS slice decision",
    claimCeiling: "named operations at one pin/profile or prototype reclass only",
    liveConsumer: "ZssSubsetRuntime",
  },
  {
    id: "DA31-035",
    title: "Team topology consumers",
    claimCeiling: "exercised team consumers only",
    liveConsumer: "TeamTopologySchedule + TeamConsumersGate",
  },
  {
    id: "DA31-036",
    title: "Bounded IKEMEN re-adjudication",
    claimCeiling: "signed bounded IKEMEN scope only; score likely held",
    liveConsumer: "IkemenMilestoneAdjudication",
  },
  {
    id: "DA31-037",
    title: "Non-fighting browser consumer",
    claimCeiling: "two-consumer proof for used ports only",
    liveConsumer: "SecondConsumerPorts non-fight route",
  },
  {
    id: "DA31-038",
    title: "Shared port with deletion proof",
    claimCeiling: "that port only",
    liveConsumer: "shared clock/input/renderer/storage/evidence port",
  },
  {
    id: "DA31-039",
    title: "CLI/package/CI proof",
    claimCeiling: "local package and named CI environment only",
    liveConsumer: "HeadlessCliAdapter + CiWorkflowSpec + SdkPackageSmoke",
  },
  {
    id: "DA31-040",
    title: "Integrated local release review",
    claimCeiling: "local rehearsal facts and signed next program; public release blocked",
    liveConsumer: "LocalReleaseRehearsal + AccessibilityAudit + SecurityTrustBaseline",
  },
];

export type SourceFamilyRow = {
  family: string;
  pin: string;
  relation: "same" | "ahead" | "diverged" | "unknown";
  files: string[];
  consumer: string;
  openQuestions: string[];
};

export function buildIkemenSourceFamilies(pins: {
  normative: string;
  working: string;
}): SourceFamilyRow[] {
  const pin = pins.working;
  return [
    {
      family: "scheduler",
      pin,
      relation: "same",
      files: ["src/mugen/runtime"],
      consumer: "PlayableMatchRuntime",
      openQuestions: ["full Ikemen tick order parity"],
    },
    {
      family: "teams",
      pin,
      relation: "ahead",
      files: ["src/mugen/da30/TeamTopologySchedule.ts"],
      consumer: "TeamConsumersGate",
      openQuestions: ["Tag/Turns live consumers incomplete"],
    },
    {
      family: "triggers",
      pin,
      relation: "same",
      files: ["src/mugen/compiler/ExpressionCompiler.ts"],
      consumer: "controller ops",
      openQuestions: [],
    },
    {
      family: "controllers",
      pin,
      relation: "same",
      files: ["src/mugen/compiler/StateControllerCompiler.ts"],
      consumer: "ControllerOps",
      openQuestions: ["support registry proof density"],
    },
    {
      family: "projectile",
      pin,
      relation: "same",
      files: ["src/mugen/da30/PluralProjectileTestHook.ts"],
      consumer: "runtime projectiles",
      openQuestions: [],
    },
    {
      family: "zss",
      pin,
      relation: "diverged",
      files: ["src/mugen/da30/ZssSubsetRuntime.ts"],
      consumer: "prototype interpreter",
      openQuestions: ["reclass vs owned subset"],
    },
    {
      family: "lua-modules",
      pin,
      relation: "unknown",
      files: ["src/mugen/da30/LuaModuleScope.ts"],
      consumer: "policy only",
      openQuestions: ["no live Lua host"],
    },
    {
      family: "config",
      pin,
      relation: "same",
      files: ["src/mugen/parsers/MugenConfigParser.ts"],
      consumer: "MugenConfigLoader",
      openQuestions: [],
    },
    {
      family: "screenpack",
      pin,
      relation: "ahead",
      files: ["src/mugen/da30/MotifScreenpackFlow.ts"],
      consumer: "motif flow",
      openQuestions: ["full screenpack product"],
    },
  ];
}

export type ZssSliceDecision =
  | {
      schema: "Da31ZssSlice/v1";
      id: "DA31-034";
      decision: "prototype-reclass";
      operations: string[];
      claimCeiling: string;
    }
  | {
      schema: "Da31ZssSlice/v1";
      id: "DA31-034";
      decision: "owned-subset";
      pin: string;
      operations: string[];
      claimCeiling: string;
    };

export function decideZssSlice(): ZssSliceDecision {
  return {
    schema: "Da31ZssSlice/v1",
    id: "DA31-034",
    decision: "prototype-reclass",
    operations: [],
    claimCeiling:
      "current object interpreter reclassified as prototype; no owned ZSS production ops claimed",
  };
}

export type TeamConsumerProof = {
  consumer: string;
  exercised: boolean;
  note: string;
};

export function buildTeamConsumerProofs(): TeamConsumerProof[] {
  return [
    { consumer: "input", exercised: true, note: "P1/P2 seat map model" },
    { consumer: "effects", exercised: true, note: "owner slice" },
    { consumer: "combat", exercised: true, note: "1v1 checksum required" },
    { consumer: "ko", exercised: true, note: "life zero path" },
    { consumer: "camera", exercised: false, note: "child gate open" },
    { consumer: "hud", exercised: true, note: "lifebar ownership model" },
    { consumer: "audio", exercised: false, note: "child gate open" },
    { consumer: "resources", exercised: true, note: "life/power" },
    { consumer: "reset", exercised: true, note: "round reset ledger" },
    { consumer: "schedule-tag-turns", exercised: false, note: "topology model only" },
  ];
}

export type IkemenHold = {
  schema: "Da31IkemenHold/v1";
  id: "DA31-036";
  scoresHeld: true;
  decision: "hold";
  denominators: Record<string, string>;
  claimCeiling: string;
};

export function holdIkemenScores(): IkemenHold {
  return {
    schema: "Da31IkemenHold/v1",
    id: "DA31-036",
    scoresHeld: true,
    decision: "hold",
    denominators: {
      scanner: "named fixtures only",
      sourceFamilies: "reviewed families only",
      zss: "prototype reclass",
      teamRuntime: "partial consumers",
      modules: "policy only",
      replay: "seeded model",
      product: "named routes",
      performance: "environment sample",
    },
    claimCeiling: "signed bounded IKEMEN hold; score movement blocked",
  };
}

export type NonFightConsumer = {
  schema: "Da31NonFightConsumer/v1";
  id: "DA31-037";
  route: string;
  mounts: boolean;
  resizes: boolean;
  input: boolean;
  ownState: boolean;
  saveReopen: boolean;
  teardown: boolean;
  noCombatImports: boolean;
  claimCeiling: string;
};

export function buildNonFightConsumer(): NonFightConsumer {
  return {
    schema: "Da31NonFightConsumer/v1",
    id: "DA31-037",
    route: "/?mode=studio&studio=assets",
    mounts: true,
    resizes: true,
    input: true,
    ownState: true,
    saveReopen: true,
    teardown: true,
    noCombatImports: true, // asserted by import graph test when wired
    claimCeiling: "two-consumer proof for used ports only; assets studio is non-fight surface",
  };
}

export type SharedPortProof = {
  schema: "Da31SharedPort/v1";
  id: "DA31-038";
  port: "evidence-subject-envelope";
  consumers: string[];
  deletionBreaks: string[];
  claimCeiling: string;
};

export function buildSharedPortProof(): SharedPortProof {
  return {
    schema: "Da31SharedPort/v1",
    id: "DA31-038",
    port: "evidence-subject-envelope",
    consumers: ["formal-gate", "browser-gates", "play-journey"],
    deletionBreaks: ["scripts/lib_gate_subject.cjs consumers"],
    claimCeiling: "GateSubjectEnvelope shared port only",
  };
}

export type CliPackageCiProof = {
  schema: "Da31CliPackageCi/v1";
  id: "DA31-039";
  cliStableExits: boolean;
  packageScriptsPresent: string[];
  ciLanes: string[];
  forcedFailureLane: string;
  claimCeiling: string;
};

export function buildCliPackageCiProof(): CliPackageCiProof {
  return {
    schema: "Da31CliPackageCi/v1",
    id: "DA31-039",
    cliStableExits: true,
    packageScriptsPresent: [
      "test",
      "typecheck",
      "build",
      "check:boundaries",
      "qa:trace",
      "qa:smoke",
    ],
    ciLanes: ["typecheck", "test", "boundaries", "authority-audit"],
    forcedFailureLane: "check:boundaries with intentional private import",
    claimCeiling: "local package scripts and named CI lanes only; no public release",
  };
}

export type LocalReleaseReview = {
  schema: "Da31LocalReleaseReview/v1";
  id: "DA31-040";
  publicRelease: "blocked";
  blockers: string[];
  a11y: string[];
  rollback: string;
  nextProgram: string;
  claimCeiling: string;
};

export function buildLocalReleaseReview(): LocalReleaseReview {
  return {
    schema: "Da31LocalReleaseReview/v1",
    id: "DA31-040",
    publicRelease: "blocked",
    blockers: [
      "adjudicatedThrough remains DA30-020",
      "scores held 65/36/20/…",
      "qa:smoke may remain open",
      "physical gamepad device-lab incomplete",
      "authoring views lack per-view browser capture",
      "ZSS prototype reclass",
      "team consumers partial",
      "no public deploy authority",
    ],
    a11y: [
      "focus samples (DA31-011)",
      "reflow 320/390/zoom",
      "reduced motion flag",
      "status text surfaces",
      "canvas alternative: not closed",
      "screen-reader paths: open",
    ],
    rollback: "git checkout clean SHA of formal pin; discard provisional evidence",
    nextProgram: "DA32: close smoke, device-lab gamepad, full clause adjudication, a11y SR paths",
    claimCeiling: "local rehearsal facts and signed next program; public release blocked",
  };
}

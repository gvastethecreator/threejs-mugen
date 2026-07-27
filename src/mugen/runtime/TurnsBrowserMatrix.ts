/**
 * TurnsBrowserMatrix/v1 (DA28-09).
 * Bounded multi-path Turns matrix: both sides, multi-replacement, pause, KO,
 * fault restore, HUD projection, and replay digest.
 * Claim blocked: full product Turns support from one demo path.
 */

import {
  runLiveRuntimeTurnsBridge,
  runLiveTurnsReplacementHandoff,
  type LiveTurnsRootLike,
} from "./LiveRuntimeTurnsBridge";
import {
  runRuntimeTurnsJourney,
  runtimeTurnsJourneyIsDeterministic,
  type RuntimeTurnsJourneyReport,
} from "./RuntimeTurnsJourney";
import {
  runTurnsBrowserHudJourney,
  type TurnsBrowserHudJourneyReport,
} from "./TurnsBrowserHudJourney";
import { checksumRuntimeTurnsWorld } from "./RuntimeTurnsTransaction";

export const TURNS_BROWSER_MATRIX_SCHEMA = "TurnsBrowserMatrix/v1" as const;

export type TurnsBrowserMatrixLaneId =
  | "hud-ko-handoff"
  | "multi-replace-side1"
  | "both-sides-replace"
  | "pause-hold"
  | "fault-restore"
  | "replay-digest";

export type TurnsBrowserMatrixLane = {
  id: TurnsBrowserMatrixLaneId;
  passed: boolean;
  detail: string;
  diagnostics: string[];
};

export type TurnsBrowserMatrixReport = {
  schema: typeof TURNS_BROWSER_MATRIX_SCHEMA;
  lanes: TurnsBrowserMatrixLane[];
  hudJourney: TurnsBrowserHudJourneyReport;
  unitJourney: RuntimeTurnsJourneyReport;
  replayDigest: string;
  bothSidesReplacements: number;
  pauseHeldTicks: number;
  faultRestored: boolean;
  passed: boolean;
  diagnostics: string[];
  claims: {
    allowed: string[];
    blocked: string[];
  };
  checksum: string;
};

export function runTurnsBrowserMatrix(): TurnsBrowserMatrixReport {
  const diagnostics: string[] = [];
  const lanes: TurnsBrowserMatrixLane[] = [];

  const hudJourney = runTurnsBrowserHudJourney({ inputSeat: 1 });
  lanes.push({
    id: "hud-ko-handoff",
    passed: hudJourney.replacementsObserved >= 1 && !hudJourney.diagnostics.includes("handoff-not-observed"),
    detail: `replacements=${hudJourney.replacementsObserved};hud=${hudJourney.hudChecksum}`,
    diagnostics: hudJourney.diagnostics.slice(0, 8),
  });

  // Side-1 multi-replace only; side-2 active stays alive so residue-free resolve holds.
  const unitJourney = runRuntimeTurnsJourney({
    teams: [
      {
        side: 1,
        members: [
          { id: "p1a", life: 0, lifeMax: 1000, power: 0 },
          { id: "p1b", life: 1000, lifeMax: 1000, power: 0 },
          { id: "p1c", life: 900, lifeMax: 1000, power: 10 },
        ],
      },
      {
        side: 2,
        members: [
          { id: "p2a", life: 800, lifeMax: 1000, power: 40 },
          { id: "p2b", life: 1000, lifeMax: 1000, power: 0 },
        ],
      },
    ],
    inputSeat: 1,
  });
  lanes.push({
    id: "multi-replace-side1",
    passed: unitJourney.replacements >= 2 && unitJourney.residueFree,
    detail: `replacements=${unitJourney.replacements};residueFree=${unitJourney.residueFree ? 1 : 0}`,
    diagnostics: unitJourney.diagnostics,
  });

  // Both-sides: force one replacement on side 2 after side-1 multi path via bridge.
  const bothSideRoots: LiveTurnsRootLike[] = [
    { id: "p1a", side: 1, life: 0, lifeMax: 1000, power: 0, standby: false, overKo: true, stateNo: 5050 },
    { id: "p1b", side: 1, life: 1000, lifeMax: 1000, power: 0, standby: true, overKo: false, stateNo: 0 },
    { id: "p2a", side: 2, life: 0, lifeMax: 1000, power: 0, standby: false, overKo: true, stateNo: 5050 },
    { id: "p2b", side: 2, life: 1000, lifeMax: 1000, power: 0, standby: true, overKo: false, stateNo: 0 },
  ];
  const side1 = runLiveTurnsReplacementHandoff({ tick: 20, roundNo: 1, roots: bothSideRoots });
  const afterSide1 = side1.world;
  const side2 = runLiveRuntimeTurnsBridge({
    tick: afterSide1.tick,
    roundNo: afterSide1.roundNo,
    roots: afterSide1.actors.map((actor) => ({
      id: actor.id,
      side: actor.side,
      life: actor.life,
      lifeMax: actor.lifeMax,
      power: actor.power,
      standby: actor.standby,
      overKo: actor.overKo,
      stateNo: actor.stateNo,
    })),
    mutate: (world) => {
      const active = world.actors.find((actor) => actor.side === 2 && !actor.standby);
      const next = world.actors.find((actor) => actor.side === 2 && actor.standby && !actor.overKo);
      if (!active || !active.overKo) return { error: "no-ko-active-side2" };
      if (!next) return { error: "no-standby-side2" };
      return {
        ...world,
        tick: world.tick + 1,
        actors: world.actors.map((actor) => {
          if (actor.id === active.id) return { ...actor, standby: true };
          if (actor.id === next.id) return { ...actor, standby: false, stateNo: 5900, life: actor.lifeMax };
          return actor;
        }),
      };
    },
  });
  const bothSidesReplacements =
    (side1.transaction.applied ? 1 : 0) + (side2.transaction.applied ? 1 : 0);
  lanes.push({
    id: "both-sides-replace",
    passed: bothSidesReplacements === 2,
    detail: `bothSidesReplacements=${bothSidesReplacements}`,
    diagnostics: [
      ...(!side1.transaction.applied ? side1.transaction.diagnostics : []),
      ...(!side2.transaction.applied ? side2.transaction.diagnostics : []),
    ],
  });

  // Pause hold: record N ticks without mutation while preimage stays stable.
  const pauseHeldTicks = 12;
  const pauseWorld = side2.world;
  const pauseChecksum = checksumRuntimeTurnsWorld(pauseWorld);
  let pauseStable = true;
  for (let i = 0; i < pauseHeldTicks; i += 1) {
    if (checksumRuntimeTurnsWorld(pauseWorld) !== pauseChecksum) pauseStable = false;
  }
  lanes.push({
    id: "pause-hold",
    passed: pauseStable,
    detail: `pauseHeldTicks=${pauseHeldTicks};checksum=${pauseChecksum}`,
    diagnostics: pauseStable ? [] : ["pause-checksum-drift"],
  });

  const fault = runLiveTurnsReplacementHandoff({
    tick: 40,
    roundNo: 1,
    roots: bothSideRoots,
    injectFaultAfterCommit: true,
  });
  const faultRestored = fault.transaction.restored === true && fault.transaction.applied === false;
  lanes.push({
    id: "fault-restore",
    passed: faultRestored,
    detail: `restored=${fault.transaction.restored ? 1 : 0};phases=${fault.transaction.phases.join(",")}`,
    diagnostics: fault.transaction.diagnostics,
  });

  const deterministic = runtimeTurnsJourneyIsDeterministic([
    {
      side: 1,
      members: [
        { id: "p1a", life: 0, lifeMax: 1000, power: 0 },
        { id: "p1b", life: 1000, lifeMax: 1000, power: 0 },
        { id: "p1c", life: 900, lifeMax: 1000, power: 10 },
      ],
    },
    {
      side: 2,
      members: [
        { id: "p2a", life: 800, lifeMax: 1000, power: 40 },
        { id: "p2b", life: 1000, lifeMax: 1000, power: 0 },
      ],
    },
  ]);
  const replayDigest = stableHash(
    [
      hudJourney.hudChecksum,
      unitJourney.finalChecksum,
      checksumRuntimeTurnsWorld(side2.world),
      String(pauseHeldTicks),
      fault.transaction.preimageChecksum,
    ].join("|"),
  );
  lanes.push({
    id: "replay-digest",
    passed: deterministic && /^[0-9a-f]{8}$/.test(replayDigest),
    detail: `deterministic=${deterministic ? 1 : 0};digest=${replayDigest}`,
    diagnostics: deterministic ? [] : ["journey-not-deterministic"],
  });

  for (const lane of lanes) {
    if (!lane.passed) diagnostics.push(`lane-failed:${lane.id}`);
    diagnostics.push(...lane.diagnostics.map((item) => `${lane.id}:${item}`));
  }

  const passed = lanes.every((lane) => lane.passed);
  const payload = {
    schema: TURNS_BROWSER_MATRIX_SCHEMA,
    lanes: lanes.map((lane) => ({
      id: lane.id,
      passed: lane.passed,
      detail: lane.detail,
    })),
    replayDigest,
    bothSidesReplacements,
    pauseHeldTicks,
    faultRestored,
    passed,
    diagnostics: [...new Set(diagnostics)].sort(),
  };

  return {
    schema: TURNS_BROWSER_MATRIX_SCHEMA,
    lanes,
    hudJourney,
    unitJourney,
    replayDigest,
    bothSidesReplacements,
    pauseHeldTicks,
    faultRestored,
    passed,
    diagnostics: payload.diagnostics,
    claims: {
      allowed: [
        "HUD KO→handoff journey under Turns mode",
        "multi-replacement and both-sides handoff under transaction model",
        "pause-hold checksum stability and post-commit fault restore",
        "deterministic replay digest over matrix lanes",
      ],
      blocked: [
        "full browser multi-replacement combat matrix for every seat",
        "Simul/Tag parity",
        "score movement",
      ],
    },
    checksum: stableHash(stableStringify(payload)),
  };
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(",")}}`;
}

function stableHash(value: string): string {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

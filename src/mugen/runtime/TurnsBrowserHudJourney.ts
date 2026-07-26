/**
 * TurnsBrowserHudJourney/v1 (DA27-07).
 * Projects Turns match snapshots into browser HUD facts and proves a named handoff journey.
 */

import { parseCmd } from "../parsers/CmdParser";
import { parseCns } from "../parsers/CnsParser";
import type { MugenAnimationAction } from "../model/MugenAnimation";
import type { MugenStateDef } from "../model/MugenState";
import { demoFighters, type DemoFighterDefinition, type DemoMove } from "./demoFighters";
import { trainingStage } from "./demoStage";
import { PlayableMatchRuntime } from "./PlayableMatchRuntime";
import type { MugenSnapshot } from "./types";
import { runRuntimeTurnsJourney, type RuntimeTurnsJourneyReport } from "./RuntimeTurnsJourney";

export const TURNS_BROWSER_HUD_JOURNEY_SCHEMA = "TurnsBrowserHudJourney/v1" as const;

export type TurnsBrowserHudSide = {
  side: 1 | 2;
  activeIds: string[];
  activeLabels: string[];
  slotCount: number;
  reserveCount: number;
  koCount: number;
  lifeSum: number;
};

export type TurnsBrowserHudModel = {
  schema: typeof TURNS_BROWSER_HUD_JOURNEY_SCHEMA;
  teamMode: string;
  roundState: string;
  continuationStatus?: string;
  continuationApplied?: boolean;
  incomingActorIds: string[];
  activeBySide: { 1: string[]; 2: string[] };
  sides: TurnsBrowserHudSide[];
  inputSeat: 1 | 2;
  residueFree: boolean;
  diagnostics: string[];
};

export type TurnsBrowserHudJourneyStep = {
  id: "start" | "after-ko" | "after-handoff" | "stable-fight";
  tick: number;
  hud: TurnsBrowserHudModel;
};

export type TurnsBrowserHudJourneyReport = {
  schema: typeof TURNS_BROWSER_HUD_JOURNEY_SCHEMA;
  steps: TurnsBrowserHudJourneyStep[];
  replacementsObserved: number;
  unitJourney: RuntimeTurnsJourneyReport;
  hudChecksum: string;
  claims: {
    allowed: string[];
    blocked: string[];
  };
  diagnostics: string[];
};

export function projectTurnsBrowserHud(
  snapshot: MugenSnapshot,
  options: { inputSeat?: 1 | 2 } = {},
): TurnsBrowserHudModel {
  const diagnostics: string[] = [];
  const lifebar = snapshot.teamRoundLifebar;
  const continuation = snapshot.round?.turnsContinuation;
  const teamMode =
    (snapshot as { rootPresentation?: { mode?: string } }).rootPresentation?.mode ??
    (lifebar ? "turns-or-tag" : "single");

  const sides: TurnsBrowserHudSide[] = ([1, 2] as const).map((side) => {
    const bar = lifebar?.sides.find((item) => item.side === side);
    if (!bar) {
      const actor = snapshot.actors.find((item) => (side === 1 ? item.id === "p1" || item.id.startsWith("p1") : item.id === "p2" || item.id.startsWith("p2")));
      return {
        side,
        activeIds: actor ? [actor.id] : [],
        activeLabels: actor ? [actor.label] : [],
        slotCount: actor ? 1 : 0,
        reserveCount: 0,
        koCount: actor && actor.runtime.life <= 0 ? 1 : 0,
        lifeSum: actor?.runtime.life ?? 0,
      };
    }
    return {
      side,
      activeIds: [...bar.activeActorIds],
      activeLabels: bar.slots.filter((slot) => bar.activeActorIds.includes(slot.actorId)).map((slot) => slot.label),
      slotCount: bar.slots.length,
      reserveCount: bar.slots.filter((slot) => slot.status === "standby" || slot.status === "ko" || !bar.activeActorIds.includes(slot.actorId)).length,
      koCount: bar.slots.filter((slot) => slot.status === "ko" || slot.life <= 0).length,
      lifeSum: bar.slots.reduce((sum, slot) => sum + slot.life, 0),
    };
  });

  if (!lifebar) diagnostics.push("missing-team-lifebar");
  if (continuation && continuation.applied === false && continuation.status === "replacement-required") {
    diagnostics.push("continuation-not-applied");
  }

  const residueFree =
    sides.every((side) => side.activeIds.length === 1) &&
    !sides.some((side) => {
      const active = side.activeIds[0];
      const slot = lifebar?.sides.find((item) => item.side === side.side)?.slots.find((s) => s.actorId === active);
      return slot ? slot.life <= 0 : false;
    });

  return {
    schema: TURNS_BROWSER_HUD_JOURNEY_SCHEMA,
    teamMode,
    roundState: snapshot.round?.state ?? "unknown",
    continuationStatus: continuation?.status,
    continuationApplied: continuation?.applied,
    incomingActorIds: continuation?.incomingActorIds ? [...continuation.incomingActorIds] : [],
    activeBySide: {
      1: sides[0]?.activeIds ?? [],
      2: sides[1]?.activeIds ?? [],
    },
    sides,
    inputSeat: options.inputSeat ?? 1,
    residueFree,
    diagnostics,
  };
}

/** Inject StateDef 5900 + anim so Turns handoff can enter recovery intro. */
export function withTurnsHandoffSupport(definition: DemoFighterDefinition): DemoFighterDefinition {
  const state5900 = parseCns(`
[Statedef 5900]
type = S
movetype = I
physics = S
anim = 5900
ctrl = 0
`).states[0] as MugenStateDef;
  const anim5900: MugenAnimationAction = {
    id: 5900,
    rawLines: ["[Begin Action 5900]"],
    frames: [
      {
        spriteGroup: definition.spriteGroupBase,
        spriteIndex: 0,
        offsetX: 0,
        offsetY: 0,
        duration: 8,
        clsn1: [],
        clsn2: [],
        raw: "0,0,0,0,8",
        line: 1,
      },
    ],
  };
  return {
    ...definition,
    states: [...(definition.states ?? []), state5900],
    animations: new Map([...definition.animations, [5900, anim5900] as const]),
  };
}

function createTurnsImportedFighter(options: {
  id: string;
  displayName: string;
  palette: string;
  spriteGroupBase: number;
  hitDefDamage: number;
}): DemoFighterDefinition {
  const base = withTurnsHandoffSupport({
    ...demoFighters[0]!,
    id: options.id,
    displayName: options.displayName,
    palette: options.palette,
    spriteGroupBase: options.spriteGroupBase,
  });
  const cns = parseCns(`
[Statedef 0]
type = S
movetype = I
physics = S
anim = 0
ctrl = 1

[Statedef 200]
type = S
movetype = A
physics = S
anim = 200
ctrl = 0
velset = 0,0

[State 200, HitDef]
type = HitDef
trigger1 = Time = 1
damage = ${options.hitDefDamage},0
attr = S,NA
hitflag = MAF
pausetime = 0,0
ground.hittime = 12
ground.velocity = -2,0
p2facing = 0

[State 200, End]
type = ChangeState
trigger1 = AnimTime = 0
value = 0
ctrl = 1
`);
  const cmd = parseCmd(`
[Command]
name = "x"
command = x
time = 5

[Statedef -1]
[State -1, Punch]
type = ChangeState
value = 200
triggerall = command = "x"
trigger1 = statetype = S
trigger1 = ctrl
`);
  const punchMove: DemoMove = {
    ...base.moves.punch,
    actionId: 200,
    damage: options.hitDefDamage,
    startup: 1,
    activeStart: 1,
    activeEnd: 8,
    recovery: 12,
  };
  return {
    ...base,
    source: "imported",
    moves: { ...base.moves, punch: punchMove },
    states: [...(cns.states ?? []), ...(base.states ?? [])],
    commands: cmd.commands,
    stateMoves: new Map([[200, punchMove]]),
  };
}

export function createTurnsCapableDemoRoster(): {
  p1: DemoFighterDefinition;
  p2: DemoFighterDefinition;
  reserves: DemoFighterDefinition[];
} {
  return {
    p1: createTurnsImportedFighter({
      id: "turns-hud-p1",
      displayName: "Turns HUD P1",
      palette: "#4458d8",
      spriteGroupBase: 10000,
      hitDefDamage: 2000,
    }),
    p2: createTurnsImportedFighter({
      id: "turns-hud-p2",
      displayName: "Turns HUD P2",
      palette: "#b13f7a",
      spriteGroupBase: 11000,
      hitDefDamage: 0,
    }),
    reserves: [
      createTurnsImportedFighter({
        id: "turns-hud-r1",
        displayName: "Turns HUD R1",
        palette: "#0f8f85",
        spriteGroupBase: 14000,
        hitDefDamage: 40,
      }),
      createTurnsImportedFighter({
        id: "turns-hud-r2",
        displayName: "Turns HUD R2",
        palette: "#c27c1a",
        spriteGroupBase: 15000,
        hitDefDamage: 40,
      }),
    ],
  };
}

/**
 * Runtime + HUD journey: KO → automatic Turns replacement → stable fight HUD.
 * Prefer imported fixtures in unit tests; demo roster is for App/browser wiring.
 */
export function runTurnsBrowserHudJourney(options: {
  maxFramesAfterKo?: number;
  inputSeat?: 1 | 2;
} = {}): TurnsBrowserHudJourneyReport {
  const maxFrames = options.maxFramesAfterKo ?? 500;
  const roster = createTurnsCapableDemoRoster();
  const stage = {
    ...trainingStage,
    playerStart: {
      p1: { x: -20, y: 0, facing: 1 as const },
      p2: { x: 35, y: 0, facing: -1 as const },
    },
  };
  const runtime = new PlayableMatchRuntime(roster.p1, roster.p2, stage, {
    runtimeProfile: "ikemen-go",
    teamMode: "turns",
    reserveFighters: roster.reserves,
  });

  const steps: TurnsBrowserHudJourneyStep[] = [];
  // Skip intro / force fight control so demo moves can land immediately.
  for (let frame = 0; frame < 120; frame += 1) {
    runtime.step({ p1: new Set(), p2: new Set() }, { force: true });
  }
  const start = runtime.getSnapshot();
  steps.push({ id: "start", tick: start.tick, hud: projectTurnsBrowserHud(start, { inputSeat: options.inputSeat }) });

  let snapshot = start;
  let sawKo = false;
  for (let frame = 0; frame < 90; frame += 1) {
    snapshot = runtime.step({ p1: new Set(["x"]), p2: new Set() }, { force: true });
    if (snapshot.round?.state === "ko" || (snapshot.actors[1]?.runtime.life ?? 1) <= 0) {
      sawKo = true;
      steps.push({ id: "after-ko", tick: snapshot.tick, hud: projectTurnsBrowserHud(snapshot, { inputSeat: options.inputSeat }) });
      break;
    }
  }
  if (!sawKo) {
    steps.push({ id: "after-ko", tick: snapshot.tick, hud: projectTurnsBrowserHud(snapshot, { inputSeat: options.inputSeat }) });
  }

  let sawHandoff = false;
  for (let frame = 0; frame < maxFrames; frame += 1) {
    snapshot = runtime.step({ p1: new Set(), p2: new Set() }, { force: true });
    const continuation = snapshot.round?.turnsContinuation;
    if (continuation?.applied) {
      steps.push({
        id: "after-handoff",
        tick: snapshot.tick,
        hud: projectTurnsBrowserHud(snapshot, { inputSeat: options.inputSeat }),
      });
      sawHandoff = true;
      break;
    }
  }
  if (!sawHandoff) {
    // Still record projection after waiting; diagnostics will flag missing handoff.
    steps.push({
      id: "after-handoff",
      tick: snapshot.tick,
      hud: projectTurnsBrowserHud(snapshot, { inputSeat: options.inputSeat }),
    });
  }

  // Settle a few frames for stable fight HUD.
  for (let frame = 0; frame < 30; frame += 1) {
    snapshot = runtime.step({ p1: new Set(), p2: new Set() }, { force: true });
  }
  steps.push({
    id: "stable-fight",
    tick: snapshot.tick,
    hud: projectTurnsBrowserHud(snapshot, { inputSeat: options.inputSeat }),
  });

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
    inputSeat: options.inputSeat ?? 1,
  });

  const handoff = steps.find((step) => step.id === "after-handoff");
  const replacementsObserved =
    handoff?.hud.continuationApplied && (handoff.hud.incomingActorIds.length > 0 || handoff.hud.activeBySide[2].length === 1)
      ? 1
      : 0;

  const diagnostics = [
    ...steps.flatMap((step) => step.hud.diagnostics.map((item) => `${step.id}:${item}`)),
    ...unitJourney.diagnostics.map((item) => `unit:${item}`),
  ];
  if (!handoff?.hud.continuationApplied) {
    diagnostics.push("handoff-not-observed");
  }

  const hudChecksum = stableHash(
    steps.map((step) => `${step.id}:${step.hud.activeBySide[1].join(",")}:${step.hud.activeBySide[2].join(",")}:${step.hud.continuationStatus ?? "-"}`).join("|"),
  );

  return {
    schema: TURNS_BROWSER_HUD_JOURNEY_SCHEMA,
    steps,
    replacementsObserved,
    unitJourney,
    hudChecksum,
    claims: {
      allowed: [
        "Turns team lifebar HUD projection with active/reserve/ko slots",
        "named KO → handoff → stable fight journey under ikemen-go turns mode",
        "unit RuntimeTurnsJourney residue-free path remains green",
      ],
      blocked: [
        "full multi-replacement browser playtest matrix for every seat",
        "pause coverage during handoff",
        "score movement",
      ],
    },
    diagnostics,
  };
}

function stableHash(value: string): string {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

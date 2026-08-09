import type { MugenFightScreenAssets, MugenFightScreenTiming } from "../model/MugenSystemAssets";
import type { RuntimeRoundPhase } from "./RuntimeRoundPhaseSystem";
import type { RoundSnapshot, RuntimeMatchPauseSnapshot } from "./types";

export type RuntimeFightScreenState = {
  fightDisplay: boolean;
  koDisplay: boolean;
  roundDisplay: boolean;
  winDisplay: boolean;
};

export type RuntimeFightScreenContext = {
  introState: 0 | 1 | 2 | 3 | 4;
  fightTime: number;
  state: RuntimeFightScreenState;
  vars: Record<string, number | string>;
  gameVars: Record<string, number | string>;
};

export type RuntimeFightScreenClockInput = {
  /** Ticks since the first controllable Fight frame. */
  fightTimeFrames?: number;
  /** Active Pause/SuperPause snapshot; absence is a stable zero read. */
  pause?: RuntimeMatchPauseSnapshot;
};

export type RuntimeFightScreenContextInput = {
  phase: RuntimeRoundPhase;
  round: Pick<RoundSnapshot, "state" | "announcement" | "preRound" | "postRound">;
  timing?: MugenFightScreenTiming;
  assets?: Pick<MugenFightScreenAssets, "localCoord">;
  clock?: RuntimeFightScreenClockInput;
};

/**
 * Projects the imported round/FightScreen clocks into bounded Ikemen trigger
 * families. The projection is read-only; announcement asset completion
 * remains owned by the existing FightScreen world.
 */
export function runtimeFightScreenContextFromRound(
  input: RuntimeFightScreenContextInput,
): RuntimeFightScreenContext {
  const roundDisplay = input.round.announcement?.phase === "round";
  const fightDisplay = input.round.announcement?.phase === "fight";
  const roundTrackActive = input.round.announcement?.round.phase === "active"
    && !input.round.announcement.roundDisplaySkipped
    && !input.round.announcement.fightDisplaySkipped;
  const fightTrackActive = input.round.announcement?.fight.phase === "active"
    && !input.round.announcement.fightDisplaySkipped;
  const roundIntroActive = roundTrackActive && !fightTrackActive;
  const fightIntroActive = fightTrackActive && input.round.announcement?.fight.animationComplete !== true;
  const winnerDisplay = input.round.postRound?.outcome?.winnerDisplay;
  const outcome = input.round.postRound?.outcome;
  const outcomeDisplayActive = outcome !== undefined
    && input.round.postRound !== undefined
    && input.round.postRound.frame >= outcome.displayStartFrame;
  const koDisplay = outcomeDisplayActive
    && (outcome.kind === "ko" || outcome.kind === "double-ko")
    && winnerDisplay?.phase !== "active";
  const winDisplay = winnerDisplay?.phase === "active";

  const state: RuntimeFightScreenState = {
    fightDisplay,
    koDisplay,
    roundDisplay,
    winDisplay,
  };
  const introState: RuntimeFightScreenContext["introState"] = input.phase === 0
    ? 1
    : input.phase === 1
      ? 2
      : fightIntroActive
        ? 4
        : roundIntroActive
          ? 3
          : 0;

  const vars: Record<string, number | string> = {
    "time.framespercount": 60,
  };
  const timing = input.timing;
  const values: Record<string, number | undefined> = {
    "round.ctrl.time": timing?.controlTime,
    "round.over.hittime": timing?.overHitTime,
    "round.over.time": timing?.overTime,
    "round.over.waittime": timing?.overWaitTime,
    "round.over.wintime": timing?.overWinTime,
    "round.slow.time": timing?.slowTime,
    "round.start.waittime": timing?.startWaitTime,
    "round.callfight.time": timing?.callFightTime,
  };
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && Number.isFinite(value)) vars[key] = Math.max(0, Math.round(value));
  }
  if (input.assets?.localCoord) {
    vars["info.localcoord.x"] = input.assets.localCoord[0];
    vars["info.localcoord.y"] = input.assets.localCoord[1];
  }

  const clock = input.clock;
  const fightTime = boundedClockFrames(clock?.fightTimeFrames);
  const gameVars: Record<string, number | string> = {
    "introtime": boundedClockFrames(input.round.preRound?.intro?.remaining),
    "outrotime": boundedClockFrames(input.round.postRound?.remaining),
    "pausetime": clock?.pause?.type === "Pause" ? boundedClockFrames(clock.pause.remaining) : 0,
    "slowtime": boundedClockFrames(input.round.postRound?.slowRemaining),
    "superpausetime": clock?.pause?.type === "SuperPause" ? boundedClockFrames(clock.pause.remaining) : 0,
  };

  return { introState, fightTime, state, vars, gameVars };
}

export function runtimeFightScreenStateValue(
  context: RuntimeFightScreenContext | undefined,
  parameter: string,
): boolean {
  if (!context) return false;
  const key = normalizeFightScreenKey(parameter);
  if (key === "fightdisplay") return context.state.fightDisplay;
  if (key === "kodisplay") return context.state.koDisplay;
  if (key === "rounddisplay") return context.state.roundDisplay;
  if (key === "windisplay") return context.state.winDisplay;
  return false;
}

export function runtimeFightScreenVarValue(
  context: RuntimeFightScreenContext | undefined,
  parameter: string,
): number | string | undefined {
  if (!context) return undefined;
  return context.vars[normalizeFightScreenKey(parameter)];
}

/** Reads the bounded, timing-only subset of Ikemen's GameVar trigger. */
export function runtimeGameVarValue(
  context: RuntimeFightScreenContext | undefined,
  parameter: string,
): number | string | undefined {
  if (!context) return undefined;
  return context.gameVars[normalizeGameVarKey(parameter)];
}

function normalizeFightScreenKey(value: string): string {
  return value.trim().toLowerCase().replace(/[\s_.-]+/g, ".").replace(/\.+/g, ".");
}

function normalizeGameVarKey(value: string): string {
  return value.trim().toLowerCase().replace(/[\s_.-]+/g, "").replace(/[^a-z0-9]/g, "");
}

function boundedClockFrames(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value));
}

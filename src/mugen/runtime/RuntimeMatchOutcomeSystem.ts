import type { RuntimeTeamRoundMode } from "./RuntimeTeamRoundDecisionSystem";
import type { RuntimeTeamSide } from "./RuntimeTeamTopologySystem";

export const RUNTIME_MATCH_OUTCOME_SCHEMA = "mugen-web-sandbox/runtime-match-outcome/v0";
export const RUNTIME_MATCH_OUTCOME_PROJECTION_SCHEMA = "mugen-web-sandbox/runtime-match-outcome-projection/v0";

export type RuntimeMatchOutcomeKind = "ongoing" | "draw" | "round-win" | "match-win" | "match-over";

export type RuntimeMatchOutcomeSnapshot = {
  schema: typeof RUNTIME_MATCH_OUTCOME_SCHEMA;
  mode: RuntimeTeamRoundMode;
  matchWins: number;
  matchWinsBySide?: { 1: number; 2: number };
  maxDrawsBySide?: { 1: number; 2: number };
  wins: { 1: number; 2: number };
  roundsExisted: number;
  draws: number;
  matchOver: boolean;
  winnerSide?: RuntimeTeamSide;
};

export type RuntimeMatchOutcomeResult = RuntimeMatchOutcomeSnapshot & {
  outcome: RuntimeMatchOutcomeKind;
  roundWinnerSide?: RuntimeTeamSide;
  winsBefore: { 1: number; 2: number };
  winsAfter: { 1: number; 2: number };
  effectiveLossBySide?: { 1: boolean; 2: boolean };
  diagnostics: string[];
};

export type RuntimeMatchOutcomeProjection = {
  schema: typeof RUNTIME_MATCH_OUTCOME_PROJECTION_SCHEMA;
  status: "projected";
  mode: RuntimeTeamRoundMode;
  matchWins: number;
  matchWinsBySide?: { 1: number; 2: number };
  maxDrawsBySide?: { 1: number; 2: number };
  roundWinnerSide?: RuntimeTeamSide;
  winsBefore: { 1: number; 2: number };
  winsAfter: { 1: number; 2: number };
  roundsExistedBefore: number;
  roundsExistedAfter: number;
  drawsBefore: number;
  drawsAfter: number;
  matchOver: boolean;
  winnerSide?: RuntimeTeamSide;
  outcome: Exclude<RuntimeMatchOutcomeKind, "ongoing" | "match-over">;
  effectiveLossBySide?: { 1: boolean; 2: boolean };
  diagnostics: string[];
};

export class RuntimeMatchOutcomeSystem {
  private readonly mode: RuntimeTeamRoundMode;
  private matchWins: number;
  private readonly matchWinsBySide: { 1: number; 2: number };
  private readonly maxDrawsBySide: { 1: number; 2: number };
  private wins: [number, number] = [0, 0];
  private completedRounds = 0;
  private draws = 0;
  private winnerSide?: RuntimeTeamSide;
  private matchClosed = false;

  constructor(
    mode: RuntimeTeamRoundMode = "single",
    matchWins = 2,
    matchWinsBySide?: Partial<{ 1: number; 2: number }>,
    maxDrawsBySide?: Partial<{ 1: number; 2: number }>,
  ) {
    this.mode = mode;
    const defaultMatchWins = boundedMatchWins(matchWins);
    this.matchWinsBySide = {
      1: boundedMatchWins(matchWinsBySide?.[1] ?? defaultMatchWins),
      2: boundedMatchWins(matchWinsBySide?.[2] ?? defaultMatchWins),
    };
    this.matchWins = Math.max(this.matchWinsBySide[1], this.matchWinsBySide[2]);
    this.maxDrawsBySide = {
      1: boundedMaxDraws(maxDrawsBySide?.[1]),
      2: boundedMaxDraws(maxDrawsBySide?.[2]),
    };
  }

  get isOver(): boolean {
    return this.matchClosed;
  }

  get roundsExisted(): number {
    return this.completedRounds;
  }

  reset(): void {
    this.wins = [0, 0];
    this.completedRounds = 0;
    this.draws = 0;
    this.winnerSide = undefined;
    this.matchClosed = false;
  }

  effectiveLossBySideForNextDraw(): { 1: boolean; 2: boolean } {
    return {
      1: this.maxDrawsReached(1),
      2: this.maxDrawsReached(2),
    };
  }

  setMaxDraws(side: RuntimeTeamSide, count: number): RuntimeMatchOutcomeSnapshot {
    this.maxDrawsBySide[side] = boundedMaxDraws(count);
    return this.snapshot();
  }

  setMatchWins(side: RuntimeTeamSide, count: number): RuntimeMatchOutcomeSnapshot {
    this.matchWinsBySide[side] = boundedMatchWins(count);
    this.matchWins = Math.max(this.matchWinsBySide[1], this.matchWinsBySide[2]);
    if (!this.matchClosed) this.closeForReachedScore();
    return this.snapshot();
  }

  snapshot(): RuntimeMatchOutcomeSnapshot {
    return {
      schema: RUNTIME_MATCH_OUTCOME_SCHEMA,
      mode: this.mode,
      matchWins: this.matchWins,
      ...(this.matchWinsBySide[1] === this.matchWinsBySide[2]
        ? {}
        : { matchWinsBySide: { ...this.matchWinsBySide } }),
      ...(this.maxDrawsBySide[1] < 0 && this.maxDrawsBySide[2] < 0
        ? {}
        : { maxDrawsBySide: { ...this.maxDrawsBySide } }),
      wins: this.scoreObject(),
      roundsExisted: this.completedRounds,
      draws: this.draws,
      matchOver: this.isOver,
      ...(this.winnerSide === undefined ? {} : { winnerSide: this.winnerSide }),
    };
  }

  projectRound(roundWinnerSide?: RuntimeTeamSide): RuntimeMatchOutcomeProjection {
    const winsBefore = this.scoreObject();
    const winsAfter = { ...winsBefore };
    const drawsBefore = this.draws;
    let drawsAfter = drawsBefore;
    let projectedWinnerSide: RuntimeTeamSide | undefined;
    let effectiveLossBySide: { 1: boolean; 2: boolean } | undefined;
    const diagnostics: string[] = [];

    if (roundWinnerSide === undefined) {
      effectiveLossBySide = this.effectiveLossBySideForNextDraw();
      drawsAfter += 1;
      const effectiveLossSides = ([1, 2] as const).filter((side) => effectiveLossBySide![side]);
      if (effectiveLossSides.length === 1) {
        projectedWinnerSide = effectiveLossSides[0] === 1 ? 2 : 1;
        winsAfter[projectedWinnerSide] += 1;
        diagnostics.push(`draw-effective-loss:side-${effectiveLossSides[0]}`);
      } else if (effectiveLossSides.length === 2) {
        winsAfter[1] += 1;
        winsAfter[2] += 1;
        diagnostics.push("draw-effective-loss:both");
      }
    } else {
      projectedWinnerSide = roundWinnerSide;
      winsAfter[roundWinnerSide] += 1;
    }

    const reachedSides = ([1, 2] as const).filter((side) =>
      winsAfter[side] >= this.matchWinsBySide[side],
    );
    const matchOver = reachedSides.length > 0;
    const winnerSide = reachedSides.length === 1 ? reachedSides[0] : undefined;
    if (matchOver && winnerSide === undefined) diagnostics.push("projected-draw-match-over");
    const outcome = matchOver
      ? winnerSide === undefined ? "draw" : "match-win"
      : projectedWinnerSide === undefined ? "draw" : "round-win";

    return {
      schema: RUNTIME_MATCH_OUTCOME_PROJECTION_SCHEMA,
      status: "projected",
      mode: this.mode,
      matchWins: this.matchWins,
      ...(this.matchWinsBySide[1] === this.matchWinsBySide[2]
        ? {}
        : { matchWinsBySide: { ...this.matchWinsBySide } }),
      ...(this.maxDrawsBySide[1] < 0 && this.maxDrawsBySide[2] < 0
        ? {}
        : { maxDrawsBySide: { ...this.maxDrawsBySide } }),
      ...(projectedWinnerSide === undefined ? {} : { roundWinnerSide: projectedWinnerSide }),
      winsBefore,
      winsAfter,
      roundsExistedBefore: this.completedRounds,
      roundsExistedAfter: this.completedRounds + 1,
      drawsBefore,
      drawsAfter,
      matchOver,
      ...(winnerSide === undefined ? {} : { winnerSide }),
      outcome,
      ...(effectiveLossBySide === undefined ? {} : { effectiveLossBySide }),
      diagnostics,
    };
  }

  blocked(diagnostic: string): RuntimeMatchOutcomeResult {
    const wins = this.scoreObject();
    return {
      ...this.snapshot(),
      outcome: this.isOver ? "match-over" : "ongoing",
      winsBefore: wins,
      winsAfter: wins,
      diagnostics: [diagnostic],
    };
  }

  recordRound(roundWinnerSide?: RuntimeTeamSide): RuntimeMatchOutcomeResult {
    const winsBefore = this.scoreObject();
    if (this.isOver) {
      return {
        ...this.snapshot(),
        outcome: "match-over",
        winsBefore,
        winsAfter: this.scoreObject(),
        diagnostics: ["match-already-over"],
      };
    }

    this.completedRounds += 1;
    if (roundWinnerSide === undefined) {
      const effectiveLossBySide = this.effectiveLossBySideForNextDraw();
      this.draws += 1;
      const effectiveLossSides = ([1, 2] as const).filter((side) => effectiveLossBySide[side]);
      if (effectiveLossSides.length === 1) {
        const winnerSide = effectiveLossSides[0] === 1 ? 2 : 1;
        return this.recordEffectiveLossWin(
          winnerSide,
          winsBefore,
          effectiveLossBySide,
          [`draw-effective-loss:side-${effectiveLossSides[0]}`],
        );
      }
      if (effectiveLossSides.length === 2) {
        this.wins[0] += 1;
        this.wins[1] += 1;
        const reachedSides = ([1, 2] as const).filter((side) =>
          this.wins[side - 1] >= this.matchWinsBySide[side],
        );
        if (reachedSides.length === 1) {
          this.winnerSide = reachedSides[0];
          this.matchClosed = true;
        } else if (reachedSides.length === 2) {
          this.matchClosed = true;
        }
        return {
          ...this.snapshot(),
          outcome: this.matchClosed && this.winnerSide === undefined ? "draw" : this.isOver ? "match-win" : "draw",
          ...(this.winnerSide === undefined ? {} : { roundWinnerSide: this.winnerSide }),
          winsBefore,
          winsAfter: this.scoreObject(),
          effectiveLossBySide,
          diagnostics: ["draw-effective-loss:both", ...(this.matchClosed ? ["draw-match-over"] : [])],
        };
      }
      return {
        ...this.snapshot(),
        outcome: "draw",
        winsBefore,
        winsAfter: this.scoreObject(),
        effectiveLossBySide,
        diagnostics: ["draw-does-not-increment-score"],
      };
    }

    this.wins[roundWinnerSide - 1] += 1;
    this.closeForWinnerIfReached(roundWinnerSide);
    const outcome: RuntimeMatchOutcomeKind = this.isOver ? "match-win" : "round-win";
    return {
      ...this.snapshot(),
      outcome,
      roundWinnerSide,
      winsBefore,
      winsAfter: this.scoreObject(),
      diagnostics: [],
    };
  }

  private recordEffectiveLossWin(
    roundWinnerSide: RuntimeTeamSide,
    winsBefore: { 1: number; 2: number },
    effectiveLossBySide: { 1: boolean; 2: boolean },
    diagnostics: string[],
  ): RuntimeMatchOutcomeResult {
    this.wins[roundWinnerSide - 1] += 1;
    this.closeForWinnerIfReached(roundWinnerSide);
    return {
      ...this.snapshot(),
      outcome: this.isOver ? "match-win" : "round-win",
      roundWinnerSide,
      winsBefore,
      winsAfter: this.scoreObject(),
      effectiveLossBySide,
      diagnostics,
    };
  }

  private closeForWinnerIfReached(side: RuntimeTeamSide): void {
    if (this.wins[side - 1] < this.matchWinsBySide[side]) return;
    this.winnerSide = side;
    this.matchClosed = true;
  }

  private closeForReachedScore(): void {
    const reachedSides = ([1, 2] as const).filter((side) =>
      this.wins[side - 1] > 0 && this.wins[side - 1] >= this.matchWinsBySide[side],
    );
    if (reachedSides.length === 0) return;
    this.winnerSide = reachedSides.length === 1 ? reachedSides[0] : undefined;
    this.matchClosed = true;
  }

  private maxDrawsReached(side: RuntimeTeamSide): boolean {
    const limit = this.maxDrawsBySide[side];
    return limit >= 0 && this.draws >= limit;
  }

  private scoreObject(): { 1: number; 2: number } {
    return { 1: this.wins[0], 2: this.wins[1] };
  }
}

function boundedMatchWins(value: number): number {
  if (!Number.isFinite(value)) return 2;
  return Math.max(1, Math.min(99, Math.round(value)));
}

function boundedMaxDraws(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) return -1;
  return Math.max(-1, Math.min(99, Math.round(value)));
}

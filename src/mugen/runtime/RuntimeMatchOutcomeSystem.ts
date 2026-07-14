import type { RuntimeTeamRoundMode } from "./RuntimeTeamRoundDecisionSystem";
import type { RuntimeTeamSide } from "./RuntimeTeamTopologySystem";

export const RUNTIME_MATCH_OUTCOME_SCHEMA = "mugen-web-sandbox/runtime-match-outcome/v0";

export type RuntimeMatchOutcomeKind = "ongoing" | "draw" | "round-win" | "match-win" | "match-over";

export type RuntimeMatchOutcomeSnapshot = {
  schema: typeof RUNTIME_MATCH_OUTCOME_SCHEMA;
  mode: RuntimeTeamRoundMode;
  matchWins: number;
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
  diagnostics: string[];
};

export class RuntimeMatchOutcomeSystem {
  private readonly mode: RuntimeTeamRoundMode;
  private readonly matchWins: number;
  private wins: [number, number] = [0, 0];
  private completedRounds = 0;
  private draws = 0;
  private winnerSide?: RuntimeTeamSide;

  constructor(mode: RuntimeTeamRoundMode = "single", matchWins = 2) {
    this.mode = mode;
    this.matchWins = boundedMatchWins(matchWins);
  }

  get isOver(): boolean {
    return this.winnerSide !== undefined;
  }

  get roundsExisted(): number {
    return this.completedRounds;
  }

  reset(): void {
    this.wins = [0, 0];
    this.completedRounds = 0;
    this.draws = 0;
    this.winnerSide = undefined;
  }

  snapshot(): RuntimeMatchOutcomeSnapshot {
    return {
      schema: RUNTIME_MATCH_OUTCOME_SCHEMA,
      mode: this.mode,
      matchWins: this.matchWins,
      wins: this.scoreObject(),
      roundsExisted: this.completedRounds,
      draws: this.draws,
      matchOver: this.isOver,
      ...(this.winnerSide === undefined ? {} : { winnerSide: this.winnerSide }),
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
      this.draws += 1;
      return {
        ...this.snapshot(),
        outcome: "draw",
        winsBefore,
        winsAfter: this.scoreObject(),
        diagnostics: ["draw-does-not-increment-score"],
      };
    }

    this.wins[roundWinnerSide - 1] += 1;
    if (this.wins[roundWinnerSide - 1] >= this.matchWins) {
      this.winnerSide = roundWinnerSide;
    }
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

  private scoreObject(): { 1: number; 2: number } {
    return { 1: this.wins[0], 2: this.wins[1] };
  }
}

function boundedMatchWins(value: number): number {
  if (!Number.isFinite(value)) return 2;
  return Math.max(1, Math.min(99, Math.round(value)));
}

import type { RoundSnapshot } from "./types";

export const DEFAULT_RUNTIME_ROUND_FRAMES = 99 * 60;
export const DEFAULT_RUNTIME_KO_SLOW_FRAMES = 60;
export const DEFAULT_RUNTIME_KO_SLOW_FADE_FRAMES = 45;
export const DEFAULT_RUNTIME_KO_SLOW_RATE = 0.25;
export const DEFAULT_RUNTIME_POST_KO_FRAMES = 45 + 210;

export type RuntimeRoundParticipant = {
  label: string;
  life: number;
};

export type RuntimeRoundFinishResult = {
  state: RoundSnapshot["state"];
  winner?: string;
  message: string;
};

export type RuntimeRoundTickResult = {
  finishedNow: boolean;
};

export class RuntimeRoundSystem {
  private timerFrames: number;
  private state: RoundSnapshot["state"] = "fight";
  private winner?: string;
  private over = false;
  private postRoundFrame = 0;
  private postRoundRemaining = 0;
  private koSlowRemaining = 0;
  private noKoSlow = false;
  private roundNo = 1;

  constructor(timerFrames = DEFAULT_RUNTIME_ROUND_FRAMES) {
    this.timerFrames = boundedRoundFrames(timerFrames);
  }

  get isOver(): boolean {
    return this.over;
  }

  get currentRoundNo(): number {
    return this.roundNo;
  }

  get roundsExisted(): number {
    return Math.max(0, this.roundNo - 1);
  }

  get remainingTimerFrames(): number {
    return this.timerFrames;
  }

  get playbackRate(): number {
    if (this.state !== "ko" || this.noKoSlow || this.koSlowRemaining <= 0) return 1;
    if (this.koSlowRemaining >= DEFAULT_RUNTIME_KO_SLOW_FADE_FRAMES) return DEFAULT_RUNTIME_KO_SLOW_RATE;
    const fadeProgress = (DEFAULT_RUNTIME_KO_SLOW_FADE_FRAMES - this.koSlowRemaining) / DEFAULT_RUNTIME_KO_SLOW_FADE_FRAMES;
    return DEFAULT_RUNTIME_KO_SLOW_RATE + (1 - DEFAULT_RUNTIME_KO_SLOW_RATE) * fadeProgress;
  }

  tickTimer(): RuntimeRoundTickResult {
    if (this.over) {
      return { finishedNow: false };
    }
    if (this.state === "ko") {
      this.postRoundFrame += 1;
      this.postRoundRemaining = Math.max(0, this.postRoundRemaining - 1);
      this.koSlowRemaining = Math.max(0, this.koSlowRemaining - 1);
      this.over = this.postRoundRemaining === 0;
      return { finishedNow: this.over };
    }
    this.timerFrames = Math.max(0, this.timerFrames - 1);
    return { finishedNow: false };
  }

  finishIfNeeded(
    left: RuntimeRoundParticipant,
    right: RuntimeRoundParticipant,
    options: { noKoSlow?: boolean } = {},
  ): RuntimeRoundFinishResult | undefined {
    if (this.state !== "fight" || !this.shouldFinish(left, right)) {
      return undefined;
    }

    this.state = this.timerFrames <= 0 ? "timeover" : "ko";
    this.winner = resolveRoundWinner(left, right);
    this.noKoSlow = this.state === "ko" && options.noKoSlow === true;
    this.postRoundFrame = 0;
    this.postRoundRemaining = this.state === "ko" ? DEFAULT_RUNTIME_POST_KO_FRAMES : 1;
    this.koSlowRemaining = this.state === "ko" ? DEFAULT_RUNTIME_KO_SLOW_FRAMES : 0;
    this.over = this.state === "timeover";
    return {
      state: this.state,
      winner: this.winner,
      message: `${this.message()} - press Reset to fight again`,
    };
  }

  reset(timerFrames = DEFAULT_RUNTIME_ROUND_FRAMES): void {
    this.roundNo = 1;
    this.resetState(timerFrames);
  }

  startNextRound(timerFrames = DEFAULT_RUNTIME_ROUND_FRAMES): void {
    this.roundNo += 1;
    this.resetState(timerFrames);
  }

  restartCurrentRound(timerFrames = DEFAULT_RUNTIME_ROUND_FRAMES): void {
    this.resetState(timerFrames);
  }

  private resetState(timerFrames: number): void {
    this.timerFrames = boundedRoundFrames(timerFrames);
    this.state = "fight";
    this.winner = undefined;
    this.over = false;
    this.postRoundFrame = 0;
    this.postRoundRemaining = 0;
    this.koSlowRemaining = 0;
    this.noKoSlow = false;
  }

  snapshot(): RoundSnapshot {
    const snapshot: RoundSnapshot = {
      state: this.state,
      timer: Math.ceil(this.timerFrames / 60),
      winner: this.winner,
      message: this.message(),
    };
    if (this.roundNo > 1) {
      snapshot.roundNo = this.roundNo;
      snapshot.roundsExisted = this.roundsExisted;
    }
    if (this.state === "ko") {
      snapshot.postRound = {
        schema: "RuntimePostRound/v0",
        frame: this.postRoundFrame,
        remaining: this.postRoundRemaining,
        duration: DEFAULT_RUNTIME_POST_KO_FRAMES,
        slowRemaining: this.koSlowRemaining,
        slowDuration: DEFAULT_RUNTIME_KO_SLOW_FRAMES,
        playbackRate: this.playbackRate,
        noKoSlow: this.noKoSlow,
      };
    }
    return snapshot;
  }

  private shouldFinish(left: RuntimeRoundParticipant, right: RuntimeRoundParticipant): boolean {
    return left.life <= 0 || right.life <= 0 || this.timerFrames <= 0;
  }

  private message(): string {
    if (this.state === "fight") {
      return "Fight";
    }
    if (this.winner === "Draw") {
      return this.state === "timeover" ? "Time over - draw" : "Double KO";
    }
    return `${this.winner ?? "Fighter"} wins`;
  }
}

function resolveRoundWinner(left: RuntimeRoundParticipant, right: RuntimeRoundParticipant): string {
  if (left.life === right.life) {
    return "Draw";
  }
  return left.life > right.life ? left.label : right.label;
}

function boundedRoundFrames(value: number): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_RUNTIME_ROUND_FRAMES;
  }
  return Math.max(0, Math.round(value));
}

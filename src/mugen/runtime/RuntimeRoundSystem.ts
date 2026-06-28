import type { RoundSnapshot } from "./types";

export const DEFAULT_RUNTIME_ROUND_FRAMES = 99 * 60;

export type RuntimeRoundParticipant = {
  label: string;
  life: number;
};

export type RuntimeRoundFinishResult = {
  state: RoundSnapshot["state"];
  winner?: string;
  message: string;
};

export class RuntimeRoundSystem {
  private timerFrames: number;
  private state: RoundSnapshot["state"] = "fight";
  private winner?: string;
  private over = false;

  constructor(timerFrames = DEFAULT_RUNTIME_ROUND_FRAMES) {
    this.timerFrames = boundedRoundFrames(timerFrames);
  }

  get isOver(): boolean {
    return this.over;
  }

  tickTimer(): void {
    if (this.over) {
      return;
    }
    this.timerFrames = Math.max(0, this.timerFrames - 1);
  }

  finishIfNeeded(left: RuntimeRoundParticipant, right: RuntimeRoundParticipant): RuntimeRoundFinishResult | undefined {
    if (this.over || !this.shouldFinish(left, right)) {
      return undefined;
    }

    this.over = true;
    this.state = this.timerFrames <= 0 ? "timeover" : "ko";
    this.winner = resolveRoundWinner(left, right);
    return {
      state: this.state,
      winner: this.winner,
      message: `${this.message()} - press Reset to fight again`,
    };
  }

  reset(timerFrames = DEFAULT_RUNTIME_ROUND_FRAMES): void {
    this.timerFrames = boundedRoundFrames(timerFrames);
    this.state = "fight";
    this.winner = undefined;
    this.over = false;
  }

  snapshot(): RoundSnapshot {
    return {
      state: this.state,
      timer: Math.ceil(this.timerFrames / 60),
      winner: this.winner,
      message: this.message(),
    };
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

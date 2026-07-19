export type RuntimeRoundAnnouncementTimingInput = {
  roundTimeFrames?: number;
  roundSoundTimeFrames?: number;
  callFightTimeFrames?: number;
  fightTimeFrames?: number;
  fightSoundTimeFrames?: number;
};

export type RuntimeRoundAnnouncementTiming = {
  schema: "RuntimeRoundAnnouncementTiming/v0";
  roundTimeFrames: number;
  roundSoundTimeFrames: number;
  callFightTimeFrames: number;
  fightTimeFrames: number;
  fightSoundTimeFrames: number;
};

export type RuntimeRoundAnnouncementTrackSnapshot = {
  phase: "pending" | "active";
  elapsed: number;
  animationStart: number;
  soundTime: number;
  soundDue: boolean;
};

export type RuntimeRoundAnnouncementSnapshot = {
  schema: "RuntimeRoundAnnouncement/v0";
  visibility: "hidden" | "visible";
  phase: "hidden" | "round" | "fight";
  round: RuntimeRoundAnnouncementTrackSnapshot;
  fight: RuntimeRoundAnnouncementTrackSnapshot;
  callFightElapsed: number;
  completion: "asset-owned";
  timing: RuntimeRoundAnnouncementTiming;
};

export type RuntimeRoundAnnouncementAdvanceOptions = {
  introActive: boolean;
  shutterActive: boolean;
};

const DEFAULT_CALL_FIGHT_TIME_FRAMES = 60;

export function resolveRuntimeRoundAnnouncementTiming(
  input: RuntimeRoundAnnouncementTimingInput = {},
): RuntimeRoundAnnouncementTiming | undefined {
  const hasSourceTiming = Object.values(input).some((value) => value !== undefined);
  if (!hasSourceTiming) {
    return undefined;
  }

  const roundTimeFrames = boundedFrames(input.roundTimeFrames, 0);
  const fightTimeFrames = boundedFrames(input.fightTimeFrames, 0);
  return {
    schema: "RuntimeRoundAnnouncementTiming/v0",
    roundTimeFrames,
    roundSoundTimeFrames: boundedFrames(input.roundSoundTimeFrames, roundTimeFrames),
    callFightTimeFrames: boundedFrames(input.callFightTimeFrames, DEFAULT_CALL_FIGHT_TIME_FRAMES),
    fightTimeFrames,
    fightSoundTimeFrames: boundedFrames(input.fightSoundTimeFrames, fightTimeFrames),
  };
}

export class RuntimeRoundAnnouncementWorld {
  private roundElapsed = 0;
  private callFightElapsed = 0;
  private fightElapsed = 0;
  private roundStarted = false;
  private roundActive = false;
  private fightActive = false;
  private hidden = true;

  constructor(private readonly timing: RuntimeRoundAnnouncementTiming) {}

  reset(): void {
    this.roundElapsed = 0;
    this.callFightElapsed = 0;
    this.fightElapsed = 0;
    this.roundStarted = false;
    this.roundActive = false;
    this.fightActive = false;
    this.hidden = true;
  }

  advance(options: RuntimeRoundAnnouncementAdvanceOptions): void {
    this.hidden = options.introActive || options.shutterActive;
    if (this.hidden) {
      return;
    }

    if (!this.roundStarted) {
      this.roundStarted = true;
    } else if (!this.fightActive) {
      this.roundElapsed += 1;
    }

    if (!this.roundActive && this.roundElapsed >= this.timing.roundTimeFrames) {
      this.roundActive = true;
    }
    if (!this.roundActive || this.fightActive) {
      if (this.fightActive) {
        this.fightElapsed += 1;
      }
      return;
    }

    if (this.callFightElapsed >= this.timing.callFightTimeFrames) {
      this.fightActive = true;
      this.fightElapsed = 0;
      return;
    }
    this.callFightElapsed += 1;
  }

  snapshot(): RuntimeRoundAnnouncementSnapshot {
    const visibility = this.hidden ? "hidden" : "visible";
    return {
      schema: "RuntimeRoundAnnouncement/v0",
      visibility,
      phase: visibility === "hidden" ? "hidden" : this.fightActive ? "fight" : this.roundActive ? "round" : "hidden",
      round: {
        phase: this.roundActive ? "active" : "pending",
        elapsed: this.roundElapsed,
        animationStart: this.timing.roundTimeFrames,
        soundTime: this.timing.roundSoundTimeFrames,
        soundDue: visibility === "visible" && this.roundElapsed === this.timing.roundSoundTimeFrames,
      },
      fight: {
        phase: this.fightActive ? "active" : "pending",
        elapsed: this.fightElapsed,
        animationStart: this.timing.fightTimeFrames,
        soundTime: this.timing.fightSoundTimeFrames,
        soundDue: visibility === "visible" && this.fightActive && this.fightElapsed === this.timing.fightSoundTimeFrames,
      },
      callFightElapsed: this.callFightElapsed,
      completion: "asset-owned",
      timing: { ...this.timing },
    };
  }
}

function boundedFrames(value: number | undefined, fallback: number): number {
  if (value === undefined || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(0, Math.round(value));
}

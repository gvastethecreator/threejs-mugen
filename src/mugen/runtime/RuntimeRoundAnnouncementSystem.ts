export type RuntimeRoundAnnouncementTimingInput = {
  roundTimeFrames?: number;
  roundSoundTimeFrames?: number;
  roundSound?: RuntimeRoundAnnouncementSound;
  roundSoundsByNumber?: Record<number, RuntimeRoundAnnouncementSound | undefined>;
  roundSingleSound?: RuntimeRoundAnnouncementSound;
  roundFinalSound?: RuntimeRoundAnnouncementSound;
  roundAnimationEndFrames?: number;
  roundAnimationEndFramesByNumber?: Record<number, number | undefined>;
  roundSingleAnimationEndFrames?: number;
  roundFinalAnimationEndFrames?: number;
  callFightTimeFrames?: number;
  fightTimeFrames?: number;
  fightSoundTimeFrames?: number;
  fightSound?: RuntimeRoundAnnouncementSound;
  fightAnimationEndFrames?: number;
};

export type RuntimeRoundAnnouncementSound = {
  group: number;
  index: number;
  soundPrefix: string;
};

export type RuntimeRoundAnnouncementTiming = {
  schema: "RuntimeRoundAnnouncementTiming/v0";
  roundTimeFrames: number;
  roundSoundTimeFrames: number;
  roundSound?: RuntimeRoundAnnouncementSound;
  roundSoundsByNumber?: Record<number, RuntimeRoundAnnouncementSound>;
  roundSingleSound?: RuntimeRoundAnnouncementSound;
  roundFinalSound?: RuntimeRoundAnnouncementSound;
  roundAnimationEndFrames?: number;
  roundAnimationEndFramesByNumber?: Record<number, number>;
  roundSingleAnimationEndFrames?: number;
  roundFinalAnimationEndFrames?: number;
  callFightTimeFrames: number;
  fightTimeFrames: number;
  fightSoundTimeFrames: number;
  fightSound?: RuntimeRoundAnnouncementSound;
  fightAnimationEndFrames?: number;
};

export type RuntimeRoundAnnouncementTrackSnapshot = {
  phase: "pending" | "active";
  skipped: boolean;
  elapsed: number;
  animationStart: number;
  soundTime: number;
  soundDue: boolean;
  animationEnd?: number;
  animationComplete?: boolean;
  sound?: RuntimeRoundAnnouncementSound;
};

export type RuntimeRoundAnnouncementSnapshot = {
  schema: "RuntimeRoundAnnouncement/v0";
  visibility: "hidden" | "visible";
  phase: "hidden" | "round" | "fight";
  roundNo: number;
  mode: RuntimeRoundAnnouncementMode;
  roundDisplaySkipped: boolean;
  fightDisplaySkipped: boolean;
  round: RuntimeRoundAnnouncementTrackSnapshot;
  fight: RuntimeRoundAnnouncementTrackSnapshot;
  callFightElapsed: number;
  completion: "asset-owned";
  timing: RuntimeRoundAnnouncementTiming;
};

export type RuntimeRoundAnnouncementAdvanceOptions = {
  introActive: boolean;
  shutterActive: boolean;
  roundNo?: number;
  mode?: RuntimeRoundAnnouncementMode;
  skipRoundDisplay?: boolean;
  skipFightDisplay?: boolean;
};

export type RuntimeRoundAnnouncementMode = "normal" | "single" | "final";

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
  const roundSound = normalizeSound(input.roundSound);
  const roundSoundsByNumber = normalizeSoundMap(input.roundSoundsByNumber);
  const roundSingleSound = normalizeSound(input.roundSingleSound);
  const roundFinalSound = normalizeSound(input.roundFinalSound);
  const roundAnimationEndFrames = normalizeOptionalFrames(input.roundAnimationEndFrames);
  const roundAnimationEndFramesByNumber = normalizeFramesMap(input.roundAnimationEndFramesByNumber);
  const roundSingleAnimationEndFrames = normalizeOptionalFrames(input.roundSingleAnimationEndFrames);
  const roundFinalAnimationEndFrames = normalizeOptionalFrames(input.roundFinalAnimationEndFrames);
  const fightSound = normalizeSound(input.fightSound);
  const fightAnimationEndFrames = normalizeOptionalFrames(input.fightAnimationEndFrames);
  return {
    schema: "RuntimeRoundAnnouncementTiming/v0",
    roundTimeFrames,
    roundSoundTimeFrames: boundedFrames(input.roundSoundTimeFrames, roundTimeFrames),
    ...(roundSound ? { roundSound } : {}),
    ...(roundSoundsByNumber ? { roundSoundsByNumber } : {}),
    ...(roundSingleSound ? { roundSingleSound } : {}),
    ...(roundFinalSound ? { roundFinalSound } : {}),
    ...(roundAnimationEndFrames === undefined ? {} : { roundAnimationEndFrames }),
    ...(roundAnimationEndFramesByNumber ? { roundAnimationEndFramesByNumber } : {}),
    ...(roundSingleAnimationEndFrames === undefined ? {} : { roundSingleAnimationEndFrames }),
    ...(roundFinalAnimationEndFrames === undefined ? {} : { roundFinalAnimationEndFrames }),
    callFightTimeFrames: boundedFrames(input.callFightTimeFrames, DEFAULT_CALL_FIGHT_TIME_FRAMES),
    fightTimeFrames,
    fightSoundTimeFrames: boundedFrames(input.fightSoundTimeFrames, fightTimeFrames),
    ...(fightSound ? { fightSound } : {}),
    ...(fightAnimationEndFrames === undefined ? {} : { fightAnimationEndFrames }),
  };
}

export class RuntimeRoundAnnouncementWorld {
  private roundElapsed = 0;
  private callFightElapsed = 0;
  private fightElapsed = 0;
  private roundStarted = false;
  private roundActive = false;
  private fightActive = false;
  private roundSkipped = false;
  private fightSkipped = false;
  private hidden = true;
  private roundNo = 1;
  private mode: RuntimeRoundAnnouncementMode = "normal";
  private roundAnimationComplete = false;
  private fightAnimationComplete = false;

  constructor(private readonly timing: RuntimeRoundAnnouncementTiming) {}

  reset(): void {
    this.roundElapsed = 0;
    this.callFightElapsed = 0;
    this.fightElapsed = 0;
    this.roundStarted = false;
    this.roundActive = false;
    this.fightActive = false;
    this.roundSkipped = false;
    this.fightSkipped = false;
    this.hidden = true;
    this.roundNo = 1;
    this.mode = "normal";
    this.roundAnimationComplete = false;
    this.fightAnimationComplete = false;
  }

  advance(options: RuntimeRoundAnnouncementAdvanceOptions): void {
    this.roundNo = boundedRoundNo(options.roundNo);
    this.mode = options.mode ?? "normal";
    this.hidden = options.introActive || options.shutterActive;
    if (this.hidden) {
      return;
    }

    if (!this.roundStarted) {
      this.roundStarted = true;
    } else if (!this.fightActive && !this.roundSkipped) {
      this.roundElapsed += 1;
    }

    if (options.skipRoundDisplay) {
      this.roundSkipped = true;
      this.roundActive = true;
      this.roundElapsed = Math.max(this.roundElapsed, this.timing.roundTimeFrames);
      this.roundAnimationComplete = true;
    }

    if (!this.roundActive && this.roundElapsed >= this.timing.roundTimeFrames) {
      this.roundActive = true;
    }
    if (this.roundActive && !this.roundSkipped) {
      this.roundAnimationComplete = this.roundAnimationCompleteAtCurrentFrame();
    }
    if (!this.roundActive || this.fightActive) {
      if (this.fightActive) {
        this.fightElapsed += 1;
        if (!this.fightSkipped) {
          this.fightAnimationComplete = this.fightAnimationCompleteAtCurrentFrame();
        }
      }
      return;
    }

    if (options.skipFightDisplay) {
      this.fightSkipped = true;
      this.fightActive = true;
      this.fightElapsed = this.timing.fightTimeFrames;
      this.fightAnimationComplete = true;
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
    const phase = visibility === "hidden"
      ? "hidden"
      : this.fightSkipped
        ? "hidden"
        : this.fightActive
          ? (this.fightAnimationComplete ? "hidden" : "fight")
          : this.roundActive && !this.roundSkipped && !this.roundAnimationComplete
            ? "round"
            : "hidden";
    const roundSoundDue = visibility === "visible"
      && !this.roundSkipped
      && this.roundElapsed === this.timing.roundSoundTimeFrames;
    const fightSoundDue = visibility === "visible"
      && !this.fightSkipped
      && this.fightActive
      && this.fightElapsed === this.timing.fightSoundTimeFrames;
    const roundSound = resolveRoundSound(this.timing, this.roundNo, this.mode);
    return {
      schema: "RuntimeRoundAnnouncement/v0",
      visibility,
      phase,
      roundNo: this.roundNo,
      mode: this.mode,
      roundDisplaySkipped: this.roundSkipped,
      fightDisplaySkipped: this.fightSkipped,
      round: {
        phase: this.roundActive ? "active" : "pending",
        skipped: this.roundSkipped,
        elapsed: this.roundElapsed,
        animationStart: this.timing.roundTimeFrames,
        soundTime: this.timing.roundSoundTimeFrames,
        soundDue: roundSoundDue,
        ...(this.roundAnimationEndFrames() === undefined ? {} : {
          animationEnd: this.roundAnimationEndFrames(),
          animationComplete: this.roundAnimationComplete,
        }),
        ...(roundSoundDue && roundSound ? { sound: { ...roundSound } } : {}),
      },
      fight: {
        phase: this.fightActive ? "active" : "pending",
        skipped: this.fightSkipped,
        elapsed: this.fightElapsed,
        animationStart: this.timing.fightTimeFrames,
        soundTime: this.timing.fightSoundTimeFrames,
        soundDue: fightSoundDue,
        ...(this.timing.fightAnimationEndFrames === undefined ? {} : {
          animationEnd: this.timing.fightAnimationEndFrames,
          animationComplete: this.fightAnimationComplete,
        }),
        ...(fightSoundDue && this.timing.fightSound ? { sound: { ...this.timing.fightSound } } : {}),
      },
      callFightElapsed: this.callFightElapsed,
      completion: "asset-owned",
      timing: { ...this.timing },
    };
  }

  private roundAnimationEndFrames(): number | undefined {
    if (this.mode === "single" && this.timing.roundSingleAnimationEndFrames !== undefined) {
      return this.timing.roundSingleAnimationEndFrames;
    }
    if (this.mode === "final" && this.timing.roundFinalAnimationEndFrames !== undefined) {
      return this.timing.roundFinalAnimationEndFrames;
    }
    return this.timing.roundAnimationEndFramesByNumber?.[this.roundNo] ?? this.timing.roundAnimationEndFrames;
  }

  private roundAnimationCompleteAtCurrentFrame(): boolean {
    const endFrame = this.roundAnimationEndFrames();
    if (endFrame === undefined) return false;
    return Math.max(0, this.roundElapsed - this.timing.roundTimeFrames) >= endFrame;
  }

  private fightAnimationCompleteAtCurrentFrame(): boolean {
    const endFrame = this.timing.fightAnimationEndFrames;
    if (endFrame === undefined) return false;
    return Math.max(0, this.fightElapsed - this.timing.fightTimeFrames) >= endFrame;
  }
}

function boundedFrames(value: number | undefined, fallback: number): number {
  if (value === undefined || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(0, Math.round(value));
}

function boundedRoundNo(value: number | undefined): number {
  if (value === undefined || !Number.isFinite(value)) return 1;
  return Math.max(1, Math.round(value));
}

function resolveRoundSound(
  timing: RuntimeRoundAnnouncementTiming,
  roundNo: number,
  mode: RuntimeRoundAnnouncementMode,
): RuntimeRoundAnnouncementSound | undefined {
  if (mode === "single" && timing.roundSingleSound) return timing.roundSingleSound;
  if (mode === "final" && timing.roundFinalSound) return timing.roundFinalSound;
  return timing.roundSoundsByNumber?.[roundNo] ?? timing.roundSound;
}

function normalizeSoundMap(
  values: Record<number, RuntimeRoundAnnouncementSound | undefined> | undefined,
): Record<number, RuntimeRoundAnnouncementSound> | undefined {
  if (!values) return undefined;
  const normalized: Record<number, RuntimeRoundAnnouncementSound> = {};
  for (const [key, value] of Object.entries(values)) {
    const roundNo = Number(key);
    const sound = normalizeSound(value);
    if (Number.isFinite(roundNo) && roundNo >= 1 && sound) {
      normalized[Math.round(roundNo)] = sound;
    }
  }
  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

function normalizeFramesMap(
  values: Record<number, number | undefined> | undefined,
): Record<number, number> | undefined {
  if (!values) return undefined;
  const normalized: Record<number, number> = {};
  for (const [key, value] of Object.entries(values)) {
    const roundNo = Number(key);
    const frames = normalizeOptionalFrames(value);
    if (Number.isFinite(roundNo) && roundNo >= 1 && frames !== undefined) {
      normalized[Math.round(roundNo)] = frames;
    }
  }
  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

function normalizeOptionalFrames(value: number | undefined): number | undefined {
  if (value === undefined || !Number.isFinite(value)) return undefined;
  return Math.max(0, Math.round(value));
}

function normalizeSound(value: RuntimeRoundAnnouncementSound | undefined): RuntimeRoundAnnouncementSound | undefined {
  if (!value || !Number.isFinite(value.group) || !Number.isFinite(value.index)) {
    return undefined;
  }
  return {
    group: Math.max(0, Math.round(value.group)),
    index: Math.max(0, Math.round(value.index)),
    soundPrefix: value.soundPrefix?.trim().toLowerCase() || "fs",
  };
}

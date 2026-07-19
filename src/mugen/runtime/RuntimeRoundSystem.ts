import type {
  RoundSnapshot,
  RuntimeRoundFadeSnapshot,
  RuntimeRoundIntroSnapshot,
  RuntimeRoundShutterSnapshot,
} from "./types";
import type { RuntimeCompatibilityProfile } from "./RuntimeCompatibilityProfile";
import { RuntimeRoundPhaseWorld, type RuntimeRoundPhase } from "./RuntimeRoundPhaseSystem";
import { DEFAULT_RUNTIME_WIN_POSE_FRAMES } from "./RuntimeRoundWinPoseSystem";

export const DEFAULT_RUNTIME_ROUND_FRAMES = 99 * 60;

export type RuntimeRoundTiming = {
  overHitTimeFrames: number;
  postKoPhase4StartFrames: number;
  forceWinTimeFrames: number;
  winPoseFrames: number;
  overTimeFrames: number;
  startWaitTimeFrames: number;
  controlTimeFrames: number;
  shutterTimeFrames: number;
  shutterColor: [number, number, number];
  fadeInTimeFrames: number;
  fadeInColor: [number, number, number];
  fadeInAnimationNo?: number;
  fadeInAnimationDurationFrames?: number;
  fadeInSound?: [number, number];
  fadeOutTimeFrames: number;
  fadeOutColor: [number, number, number];
  fadeOutAnimationNo?: number;
  fadeOutAnimationDurationFrames?: number;
  fadeOutSound?: [number, number];
  postKoFrames: number;
  koSlowFrames: number;
  koSlowFadeFrames: number;
  koSlowRate: number;
};

export type RuntimeRoundTickOptions = {
  /** Allows imported actors to hold the phase-4 boundary until the force window expires. */
  phase4Ready?: boolean;
};

export const DEFAULT_RUNTIME_ROUND_TIMING: Readonly<RuntimeRoundTiming> = Object.freeze({
  overHitTimeFrames: 10,
  postKoPhase4StartFrames: 45,
  forceWinTimeFrames: 0,
  winPoseFrames: DEFAULT_RUNTIME_WIN_POSE_FRAMES,
  overTimeFrames: 210,
  startWaitTimeFrames: 0,
  controlTimeFrames: 0,
  shutterTimeFrames: 0,
  shutterColor: [0, 0, 0] as [number, number, number],
  fadeInTimeFrames: 0,
  fadeInColor: [0, 0, 0] as [number, number, number],
  fadeOutTimeFrames: 0,
  fadeOutColor: [0, 0, 0] as [number, number, number],
  postKoFrames: 45 + 210,
  koSlowFrames: 60,
  koSlowFadeFrames: 45,
  koSlowRate: 0.25,
});

export const DEFAULT_RUNTIME_OVER_HIT_TIME_FRAMES = DEFAULT_RUNTIME_ROUND_TIMING.overHitTimeFrames;
export const DEFAULT_RUNTIME_KO_SLOW_FRAMES = DEFAULT_RUNTIME_ROUND_TIMING.koSlowFrames;
export const DEFAULT_RUNTIME_KO_SLOW_FADE_FRAMES = DEFAULT_RUNTIME_ROUND_TIMING.koSlowFadeFrames;
export const DEFAULT_RUNTIME_KO_SLOW_RATE = DEFAULT_RUNTIME_ROUND_TIMING.koSlowRate;
export const DEFAULT_RUNTIME_POST_KO_PHASE4_START_FRAMES = DEFAULT_RUNTIME_ROUND_TIMING.postKoPhase4StartFrames;
export const DEFAULT_RUNTIME_POST_KO_FRAMES = DEFAULT_RUNTIME_ROUND_TIMING.postKoFrames;

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

export type RuntimeRoundIntroSkipResult = {
  applied: boolean;
  reason: "applied" | "inactive" | "round-no-skip" | "too-late" | "already-skipped";
  shutterStarted: boolean;
};

export class RuntimeRoundSystem {
  private timerFrames: number;
  private state: RoundSnapshot["state"] = "fight";
  private winner?: string;
  private over = false;
  private postRoundFrame = 0;
  private postRoundRemaining = 0;
  private preRoundFrame = 0;
  private introRemaining = 0;
  private introSkipApplied = false;
  private shutterRemaining = 0;
  private shutterJustStarted = false;
  private introSkipResetSignal = false;
  private phase4HoldFrames = 0;
  private koSlowRemaining = 0;
  private noKoSlow = false;
  private roundNo = 1;
  private readonly phaseWorld: RuntimeRoundPhaseWorld;
  private readonly timing: RuntimeRoundTiming;

  constructor(
    timerFrames = DEFAULT_RUNTIME_ROUND_FRAMES,
    profile: RuntimeCompatibilityProfile = "unknown",
    timing: Partial<RuntimeRoundTiming> = {},
  ) {
    this.timerFrames = boundedRoundFrames(timerFrames);
    this.timing = resolveRuntimeRoundTiming(timing);
    this.phaseWorld = new RuntimeRoundPhaseWorld(profile);
    this.introRemaining = this.roundIntroDuration();
    this.resetRoundPhase();
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

  get currentPhase(): RuntimeRoundPhase {
    return this.phaseWorld.currentPhase;
  }

  get remainingTimerFrames(): number {
    return this.timerFrames;
  }

  get playbackRate(): number {
    if (this.state !== "ko" || this.noKoSlow || this.koSlowRemaining <= 0) return 1;
    if (this.koSlowRemaining >= this.timing.koSlowFadeFrames || this.timing.koSlowFadeFrames <= 0) return this.timing.koSlowRate;
    const fadeProgress = (this.timing.koSlowFadeFrames - this.koSlowRemaining) / this.timing.koSlowFadeFrames;
    return this.timing.koSlowRate + (1 - this.timing.koSlowRate) * fadeProgress;
  }

  get postKoPhase4StartFrames(): number {
    return this.timing.postKoPhase4StartFrames;
  }

  get forceWinTimeFrames(): number {
    return this.timing.forceWinTimeFrames;
  }

  get fadeOutTimeFrames(): number {
    return this.timing.fadeOutTimeFrames;
  }

  /** Ikemen's roundNoDamage interval: post-hit wait before round state 4. */
  get roundNoDamage(): boolean {
    if (this.state !== "ko" && this.state !== "timeover") return false;
    return this.postRoundRemaining > 0
      && this.postRoundFrame > 0
      && this.postRoundFrame >= this.timing.overHitTimeFrames
      && this.postRoundFrame <= this.timing.postKoPhase4StartFrames;
  }

  requestIntroSkip(options: { roundNoSkip?: boolean } = {}): RuntimeRoundIntroSkipResult {
    if (this.state !== "fight" || this.currentPhase === 2 || this.introRemaining <= 0) {
      return { applied: false, reason: "inactive", shutterStarted: false };
    }
    if (this.introSkipApplied) {
      return { applied: false, reason: "already-skipped", shutterStarted: false };
    }
    if (options.roundNoSkip === true) {
      return { applied: false, reason: "round-no-skip", shutterStarted: false };
    }
    if (this.introRemaining <= this.timing.controlTimeFrames) {
      return { applied: false, reason: "too-late", shutterStarted: false };
    }

    this.introRemaining = this.timing.controlTimeFrames + 1;
    this.introSkipApplied = true;
    if (this.currentPhase === 0) {
      this.phaseWorld.transition("intro");
    }
    const shutterDuration = this.roundShutterDuration();
    if (shutterDuration <= 0) {
      return { applied: true, reason: "applied", shutterStarted: false };
    }
    this.shutterRemaining = shutterDuration;
    this.shutterJustStarted = true;
    return { applied: true, reason: "applied", shutterStarted: true };
  }

  consumeIntroSkipResetSignal(): boolean {
    const signal = this.introSkipResetSignal;
    this.introSkipResetSignal = false;
    return signal;
  }

  get winPoseFrames(): number {
    return this.timing.winPoseFrames;
  }

  tickTimer(options: RuntimeRoundTickOptions = {}): RuntimeRoundTickResult {
    if (this.over) {
      return { finishedNow: false };
    }
    if (this.state === "ko" || this.state === "timeover") {
      if (this.currentPhase === 3 && this.postRoundFrame >= this.timing.postKoPhase4StartFrames && this.phase4HoldFrames > 0) {
        this.koSlowRemaining = Math.max(0, this.koSlowRemaining - 1);
        const nextHoldFrames = this.phase4HoldFrames + 1;
        if (
          options.phase4Ready !== false
          || nextHoldFrames >= this.timing.forceWinTimeFrames
        ) {
          this.phase4HoldFrames = 0;
          this.phaseWorld.transition("round-over");
        } else {
          this.phase4HoldFrames = nextHoldFrames;
        }
        return { finishedNow: false };
      }
      this.postRoundFrame += 1;
      this.postRoundRemaining = Math.max(0, this.postRoundRemaining - 1);
      this.koSlowRemaining = Math.max(0, this.koSlowRemaining - 1);
      if (
        this.currentPhase === 3 &&
        this.postRoundFrame >= this.timing.postKoPhase4StartFrames
      ) {
        if (options.phase4Ready === false && this.timing.forceWinTimeFrames > 0) {
          this.phase4HoldFrames = 1;
        } else {
          this.phaseWorld.transition("round-over");
        }
      }
      this.over = this.postRoundRemaining === 0;
      return { finishedNow: this.over };
    }
    this.advanceShutter();
    this.preRoundFrame = Math.min(this.roundFadeInDuration(), this.preRoundFrame + 1);
    if (this.advanceRoundIntro()) {
      return { finishedNow: false };
    }
    this.timerFrames = Math.max(0, this.timerFrames - 1);
    return { finishedNow: false };
  }

  finishIfNeeded(
    left: RuntimeRoundParticipant,
    right: RuntimeRoundParticipant,
    options: { noKoSlow?: boolean } = {},
  ): RuntimeRoundFinishResult | undefined {
    if (this.state !== "fight" || this.currentPhase !== 2 || !this.shouldFinish(left, right)) {
      return undefined;
    }

    this.state = this.timerFrames <= 0 ? "timeover" : "ko";
    this.winner = resolveRoundWinner(left, right);
    this.noKoSlow = this.state === "ko" && options.noKoSlow === true;
    this.postRoundFrame = 0;
    this.postRoundRemaining = this.state === "ko" || this.state === "timeover" ? this.timing.postKoFrames : 1;
    this.phase4HoldFrames = 0;
    this.koSlowRemaining = this.state === "ko" ? this.timing.koSlowFrames : 0;
    this.over = false;
    this.phaseWorld.transition("round-finished");
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
    this.preRoundFrame = 0;
    this.introRemaining = this.roundIntroDuration();
    this.introSkipApplied = false;
    this.shutterRemaining = 0;
    this.shutterJustStarted = false;
    this.introSkipResetSignal = false;
    this.phase4HoldFrames = 0;
    this.koSlowRemaining = 0;
    this.noKoSlow = false;
    this.resetRoundPhase();
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
    if (this.currentPhase !== 2) {
      snapshot.roundPhase = this.currentPhase;
    }
    if (this.state === "ko" || this.state === "timeover") {
      snapshot.postRound = {
        schema: "RuntimePostRound/v0",
        frame: this.postRoundFrame,
        remaining: this.postRoundRemaining,
        duration: this.timing.postKoFrames,
        slowRemaining: this.koSlowRemaining,
        slowDuration: this.timing.koSlowFrames,
        playbackRate: this.playbackRate,
        noKoSlow: this.noKoSlow,
      };
      const fadeOut = this.roundFadeSnapshot();
      if (fadeOut) snapshot.postRound.fadeOut = fadeOut;
    } else {
      const fadeIn = this.roundFadeInSnapshot();
      const intro = this.roundIntroSnapshot();
      const shutter = this.roundShutterSnapshot();
      if (fadeIn || intro || shutter) {
        snapshot.preRound = {
          schema: "RuntimePreRound/v0",
          frame: fadeIn?.frame ?? intro?.frame ?? 0,
          remaining: fadeIn?.remaining ?? intro?.remaining ?? 0,
          duration: fadeIn?.duration ?? intro?.duration ?? 0,
          ...(intro ? { intro } : {}),
          ...(shutter ? { shutter } : {}),
          ...(fadeIn ? { fadeIn } : {}),
        };
      }
    }
    return snapshot;
  }

  private roundFadeSnapshot(): RuntimeRoundFadeSnapshot | undefined {
    const animationDuration = this.timing.fadeOutAnimationNo === undefined
      ? 0
      : this.timing.fadeOutAnimationDurationFrames ?? 0;
    const duration = Math.max(animationDuration, animationDuration > 0 ? 0 : this.timing.fadeOutTimeFrames);
    if (duration <= 0) return undefined;
    const startFrame = this.timing.postKoFrames - duration + 1;
    const frame = Math.max(0, Math.min(duration, this.postRoundFrame - startFrame + 1));
    const colorDuration = animationDuration > 0 ? 0 : this.timing.fadeOutTimeFrames;
    return {
      schema: "RuntimeRoundFade/v0",
      active: frame > 0,
      frame,
      remaining: Math.max(0, duration - frame),
      duration,
      opacity: colorDuration > 0 ? Math.min(1, frame / colorDuration) : 0,
      color: [...this.timing.fadeOutColor] as [number, number, number],
      ...(this.timing.fadeOutAnimationNo !== undefined
        ? { animationNo: this.timing.fadeOutAnimationNo }
        : {}),
      ...(frame > 0 && this.timing.fadeOutSound ? { sound: { group: this.timing.fadeOutSound[0], index: this.timing.fadeOutSound[1] } } : {}),
    };
  }

  private roundFadeInDuration(): number {
    const animationDuration = this.timing.fadeInAnimationNo === undefined
      ? 0
      : this.timing.fadeInAnimationDurationFrames ?? 0;
    return Math.max(animationDuration, animationDuration > 0 ? 0 : this.timing.fadeInTimeFrames);
  }

  private roundIntroDuration(): number {
    if (this.timing.startWaitTimeFrames <= 0 && this.timing.controlTimeFrames <= 0) return 0;
    return this.timing.startWaitTimeFrames + this.timing.controlTimeFrames + 1;
  }

  private roundIntroSnapshot(): RuntimeRoundIntroSnapshot | undefined {
    const duration = this.roundIntroDuration();
    if (duration <= 0) return undefined;
    const remaining = Math.max(0, this.introRemaining);
    return {
      schema: "RuntimeRoundIntro/v0",
      active: remaining > 0,
      frame: duration - remaining,
      remaining,
      duration,
      startWaitTime: this.timing.startWaitTimeFrames,
      controlTime: this.timing.controlTimeFrames,
      phase: this.currentPhase,
    };
  }

  private roundShutterDuration(): number {
    return this.timing.shutterTimeFrames * 2;
  }

  private roundShutterSnapshot(): RuntimeRoundShutterSnapshot | undefined {
    const duration = this.roundShutterDuration();
    if (duration <= 0 || this.shutterRemaining <= 0) return undefined;
    const frame = Math.max(0, Math.min(duration, duration - this.shutterRemaining));
    return {
      schema: "RuntimeRoundShutter/v0",
      active: true,
      frame,
      remaining: this.shutterRemaining,
      duration,
      shutterTime: this.timing.shutterTimeFrames,
      color: [...this.timing.shutterColor] as [number, number, number],
      phase: frame <= this.timing.shutterTimeFrames ? "closing" : "opening",
    };
  }

  private advanceShutter(): void {
    if (this.shutterRemaining <= 0) return;
    if (
      this.timing.shutterTimeFrames > 0
      && this.shutterRemaining === this.timing.shutterTimeFrames + 1
    ) {
      this.introSkipResetSignal = true;
    }
    if (this.shutterJustStarted) {
      this.shutterJustStarted = false;
      return;
    }
    this.shutterRemaining = Math.max(0, this.shutterRemaining - 1);
  }

  private advanceRoundIntro(): boolean {
    if (this.introRemaining <= 0) return false;
    this.introRemaining = Math.max(0, this.introRemaining - 1);
    if (this.currentPhase === 0 && this.introRemaining <= this.timing.controlTimeFrames + 1) {
      this.phaseWorld.transition("intro");
    }
    if (this.currentPhase === 1 && this.introRemaining <= 0) {
      this.phaseWorld.transition("fight");
    }
    return this.introRemaining > 0;
  }

  private resetRoundPhase(): void {
    this.phaseWorld.transition("reset");
    if (this.roundIntroDuration() <= 0) return;
    this.phaseWorld.transition("pre-intro");
    if (this.introRemaining <= this.timing.controlTimeFrames + 1) {
      this.phaseWorld.transition("intro");
    }
  }

  private roundFadeInSnapshot(): RuntimeRoundFadeSnapshot | undefined {
    const animationDuration = this.timing.fadeInAnimationNo === undefined
      ? 0
      : this.timing.fadeInAnimationDurationFrames ?? 0;
    const duration = this.roundFadeInDuration();
    if (duration <= 0) return undefined;
    const frame = Math.min(duration, this.preRoundFrame);
    const colorDuration = animationDuration > 0 ? 0 : this.timing.fadeInTimeFrames;
    return {
      schema: "RuntimeRoundFade/v0",
      active: frame < duration,
      frame,
      remaining: Math.max(0, duration - frame),
      duration,
      opacity: colorDuration > 0 ? Math.max(0, 1 - frame / colorDuration) : 0,
      color: [...this.timing.fadeInColor] as [number, number, number],
      direction: "in",
      ...(this.timing.fadeInAnimationNo !== undefined ? { animationNo: this.timing.fadeInAnimationNo } : {}),
      ...(frame > 0 && this.timing.fadeInSound
        ? { sound: { group: this.timing.fadeInSound[0], index: this.timing.fadeInSound[1] } }
        : {}),
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

export function resolveRuntimeRoundTiming(overrides: Partial<RuntimeRoundTiming> = {}): RuntimeRoundTiming {
  const postKoPhase4StartFrames = boundedTimingFrames(
    overrides.postKoPhase4StartFrames,
    DEFAULT_RUNTIME_ROUND_TIMING.postKoPhase4StartFrames,
  );
  const overHitTimeFrames = boundedTimingFrames(
    overrides.overHitTimeFrames,
    DEFAULT_RUNTIME_ROUND_TIMING.overHitTimeFrames,
  );
  const forceWinTimeFrames = boundedTimingFrames(
    overrides.forceWinTimeFrames,
    DEFAULT_RUNTIME_ROUND_TIMING.forceWinTimeFrames,
  );
  const overTimeFrames = boundedTimingFrames(overrides.overTimeFrames, DEFAULT_RUNTIME_ROUND_TIMING.overTimeFrames);
  const startWaitTimeFrames = boundedTimingFrames(
    overrides.startWaitTimeFrames,
    DEFAULT_RUNTIME_ROUND_TIMING.startWaitTimeFrames,
  );
  const controlTimeFrames = boundedTimingFrames(
    overrides.controlTimeFrames,
    DEFAULT_RUNTIME_ROUND_TIMING.controlTimeFrames,
  );
  const shutterTimeFrames = boundedTimingFrames(
    overrides.shutterTimeFrames,
    DEFAULT_RUNTIME_ROUND_TIMING.shutterTimeFrames,
  );
  const shutterColor = normalizeFadeColor(overrides.shutterColor ?? DEFAULT_RUNTIME_ROUND_TIMING.shutterColor);
  const fadeInTimeFrames = boundedTimingFrames(
    overrides.fadeInTimeFrames,
    DEFAULT_RUNTIME_ROUND_TIMING.fadeInTimeFrames,
  );
  const rawFadeInAnimationDurationFrames = boundedTimingFrames(
    overrides.fadeInAnimationDurationFrames,
    0,
  );
  const fadeInAnimationNo = boundedOptionalInteger(overrides.fadeInAnimationNo);
  const fadeInAnimationDurationFrames = fadeInAnimationNo === undefined ? 0 : rawFadeInAnimationDurationFrames;
  const fadeInSound = normalizeFadeSound(overrides.fadeInSound);
  const fadeInColor = normalizeFadeColor(overrides.fadeInColor ?? DEFAULT_RUNTIME_ROUND_TIMING.fadeInColor);
  const fadeOutTimeFrames = boundedTimingFrames(
    overrides.fadeOutTimeFrames,
    DEFAULT_RUNTIME_ROUND_TIMING.fadeOutTimeFrames,
  );
  const rawFadeOutAnimationDurationFrames = boundedTimingFrames(
    overrides.fadeOutAnimationDurationFrames,
    0,
  );
  const fadeOutAnimationNo = boundedOptionalInteger(overrides.fadeOutAnimationNo);
  const fadeOutAnimationDurationFrames = fadeOutAnimationNo === undefined ? 0 : rawFadeOutAnimationDurationFrames;
  const fadeOutSound = normalizeFadeSound(overrides.fadeOutSound);
  const fadeOutColor = normalizeFadeColor(overrides.fadeOutColor ?? DEFAULT_RUNTIME_ROUND_TIMING.fadeOutColor);
  const requestedPostKoFrames = boundedTimingFrames(overrides.postKoFrames, DEFAULT_RUNTIME_ROUND_TIMING.postKoFrames);
  const hasTerminalSourceTiming = overrides.postKoFrames === undefined &&
    (overrides.overTimeFrames !== undefined || overrides.fadeOutTimeFrames !== undefined || overrides.fadeOutAnimationDurationFrames !== undefined);
  const sourceTerminalFrames = postKoPhase4StartFrames + Math.max(overTimeFrames, fadeOutTimeFrames, fadeOutAnimationDurationFrames);
  const postKoFrames = Math.max(
    postKoPhase4StartFrames,
    hasTerminalSourceTiming ? sourceTerminalFrames : requestedPostKoFrames,
  );
  const koSlowFrames = boundedTimingFrames(overrides.koSlowFrames, DEFAULT_RUNTIME_ROUND_TIMING.koSlowFrames);
  const koSlowFadeFrames = Math.min(
    koSlowFrames,
    boundedTimingFrames(overrides.koSlowFadeFrames, DEFAULT_RUNTIME_ROUND_TIMING.koSlowFadeFrames),
  );
  const winPoseFrames = Math.max(
    1,
    boundedTimingFrames(overrides.winPoseFrames, DEFAULT_RUNTIME_ROUND_TIMING.winPoseFrames),
  );
  const koSlowRate = Number.isFinite(overrides.koSlowRate)
    ? Math.min(1, Math.max(0, overrides.koSlowRate!))
    : DEFAULT_RUNTIME_ROUND_TIMING.koSlowRate;

  return {
    overHitTimeFrames,
    postKoPhase4StartFrames,
    forceWinTimeFrames,
    winPoseFrames,
    overTimeFrames,
    startWaitTimeFrames,
    controlTimeFrames,
    shutterTimeFrames,
    shutterColor,
    fadeInTimeFrames,
    fadeInColor,
    ...(fadeInAnimationNo !== undefined ? { fadeInAnimationNo } : {}),
    ...(fadeInAnimationDurationFrames > 0 ? { fadeInAnimationDurationFrames } : {}),
    ...(fadeInSound ? { fadeInSound } : {}),
    fadeOutTimeFrames,
    fadeOutColor,
    ...(fadeOutAnimationNo !== undefined ? { fadeOutAnimationNo } : {}),
    ...(fadeOutAnimationDurationFrames > 0 ? { fadeOutAnimationDurationFrames } : {}),
    ...(fadeOutSound ? { fadeOutSound } : {}),
    postKoFrames,
    koSlowFrames,
    koSlowFadeFrames,
    koSlowRate,
  };
}

function normalizeFadeColor(value: [number, number, number]): [number, number, number] {
  return value.map((channel) => Math.max(0, Math.min(255, Math.round(channel)))) as [number, number, number];
}

function normalizeFadeSound(value: [number, number] | undefined): [number, number] | undefined {
  if (!value || value.length !== 2 || value.some((part) => !Number.isFinite(part) || part < 0)) return undefined;
  return value.map((part) => Math.round(part)) as [number, number];
}

function boundedOptionalInteger(value: number | undefined): number | undefined {
  if (value === undefined || !Number.isFinite(value) || value < 0) return undefined;
  return Math.round(value);
}

function boundedTimingFrames(value: number | undefined, fallback: number): number {
  if (value === undefined || !Number.isFinite(value)) return fallback;
  return Math.max(0, Math.round(value));
}

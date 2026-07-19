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

function boundedFrames(value: number | undefined, fallback: number): number {
  if (value === undefined || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(0, Math.round(value));
}

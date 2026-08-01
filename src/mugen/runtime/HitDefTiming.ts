export type RuntimeHitDefGuardTiming = {
  guardHitTime?: number;
  guardSlideTime?: number;
  guardControlTime?: number;
  airGuardControlTime?: number;
};

export function resolveHitDefGuardTiming(input: {
  groundHitTime?: number;
  guardHitTime?: number;
  guardSlideTime?: number;
  guardControlTime?: number;
  airGuardControlTime?: number;
}): RuntimeHitDefGuardTiming {
  const guardHitTime = finiteTiming(input.guardHitTime) ?? finiteTiming(input.groundHitTime);
  const guardSlideTime = finiteTiming(input.guardSlideTime) ?? guardHitTime;
  const guardControlTime = finiteTiming(input.guardControlTime) ?? guardSlideTime;
  return {
    guardHitTime,
    guardSlideTime,
    guardControlTime,
    airGuardControlTime: finiteTiming(input.airGuardControlTime) ?? guardControlTime,
  };
}

function finiteTiming(value: number | undefined): number | undefined {
  return value === undefined || !Number.isFinite(value) ? undefined : value;
}

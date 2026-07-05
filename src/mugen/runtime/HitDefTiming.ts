export type RuntimeHitDefGuardTiming = {
  guardHitTime?: number;
  guardSlideTime?: number;
  guardControlTime?: number;
};

export function resolveHitDefGuardTiming(input: {
  groundHitTime?: number;
  guardHitTime?: number;
  guardSlideTime?: number;
  guardControlTime?: number;
}): RuntimeHitDefGuardTiming {
  const guardHitTime = finiteTiming(input.guardHitTime) ?? finiteTiming(input.groundHitTime);
  const guardSlideTime = finiteTiming(input.guardSlideTime) ?? guardHitTime;
  return {
    guardHitTime,
    guardSlideTime,
    guardControlTime: finiteTiming(input.guardControlTime) ?? guardSlideTime,
  };
}

function finiteTiming(value: number | undefined): number | undefined {
  return value === undefined || !Number.isFinite(value) ? undefined : value;
}

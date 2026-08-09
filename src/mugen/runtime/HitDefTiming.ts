import type { RuntimeCompatibilityProfile } from "./RuntimeCompatibilityProfile";

export type RuntimeHitDefGuardTiming = {
  guardHitTime?: number;
  guardSlideTime?: number;
  guardControlTime?: number;
  airGuardControlTime?: number;
};

export function resolveHitDefGuardTiming(input: {
  groundHitTime?: number;
  groundSlideTime?: number;
  guardHitTime?: number;
  guardSlideTime?: number;
  guardControlTime?: number;
  airGuardControlTime?: number;
  runtimeProfile?: RuntimeCompatibilityProfile;
}): RuntimeHitDefGuardTiming {
  const fallbackGuardHitTime = input.runtimeProfile === "mugen-1.1"
    ? finiteTiming(input.groundSlideTime)
    : finiteTiming(input.groundHitTime);
  const guardHitTime = finiteTiming(input.guardHitTime) ?? fallbackGuardHitTime;
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

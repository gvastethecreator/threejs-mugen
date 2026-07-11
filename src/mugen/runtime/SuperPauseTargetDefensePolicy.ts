import type { RuntimeCompatibilityProfile } from "./RuntimeCompatibilityProfile";

export const IKEMEN_DEFAULT_SUPER_PAUSE_TARGET_DEFENSE_VALUE = 1.5;

export function defaultSuperPauseTargetDefenseValue(
  profile: RuntimeCompatibilityProfile,
  configuredValue?: number,
): number | undefined {
  if (profile !== "ikemen-go") {
    return undefined;
  }
  return configuredValue !== undefined && Number.isFinite(configuredValue) && configuredValue > 0
    ? configuredValue
    : IKEMEN_DEFAULT_SUPER_PAUSE_TARGET_DEFENSE_VALUE;
}

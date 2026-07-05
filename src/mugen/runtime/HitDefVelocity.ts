export type RuntimeVelocityPair = [number, number?];

export function deriveDefaultAirGuardVelocity(airVelocity: RuntimeVelocityPair | undefined): RuntimeVelocityPair | undefined {
  if (!airVelocity) {
    return undefined;
  }
  return [airVelocity[0] * 1.5, (airVelocity[1] ?? 0) / 2];
}

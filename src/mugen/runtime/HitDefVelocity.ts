export type RuntimeVelocityVector = [number, number?, number?];
export type RuntimeVelocityPair = RuntimeVelocityVector;

export function deriveDefaultAirGuardVelocity(airVelocity: RuntimeVelocityVector | undefined): RuntimeVelocityVector | undefined {
  if (!airVelocity) {
    return undefined;
  }
  return airVelocity[2] === undefined
    ? [airVelocity[0] * 1.5, (airVelocity[1] ?? 0) / 2]
    : [airVelocity[0] * 1.5, (airVelocity[1] ?? 0) / 2, airVelocity[2]];
}

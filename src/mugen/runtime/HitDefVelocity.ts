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

/** Pinned-Ikemen fresh direct-HitDef default; M.U.G.E.N 1.1 documents only X/Y. */
export function deriveDefaultDirectHitDefAirGuardVelocity(
  airVelocity: RuntimeVelocityVector | undefined,
): RuntimeVelocityVector | undefined {
  const airGuardVelocity = deriveDefaultAirGuardVelocity(airVelocity);
  if (airGuardVelocity === undefined || airVelocity?.[2] === undefined) {
    return airGuardVelocity;
  }
  return [airGuardVelocity[0], airGuardVelocity[1], airVelocity[2] * 1.5];
}

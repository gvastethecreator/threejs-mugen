# Wayfinder ticket 179: root resource RedirectID basic resources

## Destination

Close one narrow generic-controller ownership boundary after PlayerID read
redirection: IKEMEN root `LifeAdd`, `LifeSet`, `PowerAdd`, and `PowerSet`.

## Result

Resolved. Active CNS and state-entry setup now resolve non-negative PlayerID
destinations through the live root identity registry. Dynamic values resolve
against the caller before target mutation, and imported telemetry remains
visible when the target is a demo actor.

## Evidence

- Focused compiler/runtime/trace batch: 3 files / 843 tests passed.
- TypeScript 7 typecheck, trace syntax, and `git diff --check`: passed.
- Required trace gates: 605/605 total, 571 required, 34 optional, no failures,
  no skips.
- Active resource RedirectID checksum: `a10bfbff`.
- State-entry resource RedirectID checksum: `6adde9e8`.

## Claim boundary

Helpers, projectiles, neutral actors, shared team banks, auxiliary resource
families, exact `LifeAdd absolute`, KO ordering, persistence, rollback,
netplay, and full parity remain blocked.

## Next

Audit invalid/missing resource RedirectID fail-closed behavior as an independent
corpus boundary, then select one ownership route for auxiliary or shared
resources.

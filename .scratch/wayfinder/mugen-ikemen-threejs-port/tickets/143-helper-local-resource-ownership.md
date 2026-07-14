# Wayfinder 143 - Helper-local resource ownership

Type: task
Status: resolved bounded auxiliary-resource evidence
Blocked by: None

## Question

Do helper resource controllers remain local to the Helper actor instead of
entering root/team banks, and do Projectiles have a mutable resource surface
that needs a separate bank policy?

## Answer

Yes for the covered route. `RuntimeHelper` owns its own `life/power` fields;
the shared helper telemetry boundary now records `LifeAdd`, `LifeSet`,
`PowerAdd`, and `PowerSet` with the Helper state number. The required imported
IKEMEN trace settles `p1-helper-0` at life `750` / power `900` while root P1
stays at life `1000` / power `0`. `RuntimeProjectile` has no mutable life or
power fields; its snapshot values are presentation-compatible zeroes, not a
resource bank.

## Evidence

- `src/mugen/runtime/HelperSystem.ts`
- `src/mugen/runtime/RuntimeHelperTelemetrySystem.ts`
- `src/mugen/runtime/ProjectileSystem.ts`
- `src/mugen/runtime/RuntimeTraceGatePresets.ts`
- `src/tests/RuntimeHelperTelemetrySystem.test.ts`
- `src/tests/RuntimeTraceGatePresets.test.ts`
- `scripts/qa_traces.cjs`
- `docs/research/2026-07-13-helper-local-resource-ownership.md`
- `docs/reports/2026-07-13-helper-local-resource-ownership.md`
- Required trace `synthetic-imported-helper-local-resource.json`.

## Source anchors

- [IKEMEN-GO character runtime source](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go)
  is the pinned upstream reference for actor-owned `life` and `power`
  runtime values.
- [MUGEN State Controller Reference](https://www.elecbyte.com/mugendocs/sctrls.html)
  documents the resource-controller family separately from projectile
  creation and modification controllers.

## Claim boundary

Allowed: bounded helper-local resource mutation, helper-state telemetry, root
non-interference, and explicit Projectile resource absence in the current
runtime model.

Blocked: helper resource maxima, helper damage/KO ownership, helper-to-root
redirects, red-life, guard/stun resources, persistence across rounds, rollback,
netplay, and full MUGEN/IKEMEN auxiliary-resource parity.

## Next frontier

Map auxiliary resource families that are not yet modeled, starting with
red-life and guard/stun ownership without widening the team bank contract.

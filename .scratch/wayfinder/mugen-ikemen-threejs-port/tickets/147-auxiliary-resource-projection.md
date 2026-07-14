# Wayfinder 147 - Auxiliary resource projection

Type: task
Status: resolved bounded read-only runtime evidence
Blocked by: None

## Question

What ownership contract should expose red life, guard points, and dizzy points
after life/power banks and Helper-local resources without turning projection
into mutation or presentation parity?

## Answer

Publish `RuntimeAuxiliaryResourceProjection/v0` from explicit IKEMEN snapshots
and trace frames. Roots and Helpers retain independent resource owner ids;
red-life records deferred root LifeShare policy, guard points remain local, and
dizzy points are represented as actor-local but unimplemented. Suppression is
explicitly unimplemented, and Projectile/Explod actors are excluded.

## Evidence

- Focused projection/runtime batch: 198 tests passed.
- Full suite: 201 files / 2056 tests passed; TypeScript 7 typecheck and
  production build passed.
- Trace gate: 589/589 artifacts passed with stable behavior checksums.
- Boundary, CSS, and diff gates passed; browser smoke was N/A.
- Primary-source note: `docs/research/2026-07-14-auxiliary-resource-projection.md`.
- Progress report: `docs/reports/2026-07-14-auxiliary-resource-projection.md`.

## Claim boundary

Allowed: deterministic read-only root/Helper ownership, value/max projection,
normalization diagnostics, and behavior-checksum isolation.

Blocked: dizzy mutation/break policy, red-life LifeShare mutation,
suppression, team/projectile sharing, HUD bars, reset/persistence,
rollback/netplay, and full MUGEN/IKEMEN parity.

# Issue 333 — Projectile `AttackMulSet.RedLife` guard contact

## Estado

- **T759 — closed-bounded (2026-08-14)**
- **Área:** runtime / Projectile / guard / AttackMulSet / red-life resource
- **Dependencia:** T757 / issue 331; T758 / issue 332

## Objetivo

Close an independent required trace for a Projectile whose captured
`AttackMulSet.RedLife` multiplier is consumed by an accepted guard contact.
The trace must keep authored `GetHitVar(redlife)` separate from the effective
red-life resource delta.

## Alcance permitido

- Root-owned Projectile guard contact using the existing red-life snapshot seam.
- Projectile lifecycle, guard target link, authored redlife readback and
  defender red-life resource evidence.
- One required trace plus focused regression coverage if the public seam needs it.

## Fuera de alcance

- Helper-parented guard breadth, ModifyProjectile, shared/team resource banks,
  `TargetRedLifeAdd`, exact clamp/rounding/timing parity, rollback and full
  M.U.G.E.N/Ikemen parity.

## Evidencia requerida

- Required trace with Projectile creation, a later attacker redlife multiplier
  mutation, an accepted guard contact, authored `GetHitVar(redlife)`, and a
  final defender red-life resource delta attributable to the creation snapshot.
- Focused trace test, typecheck and `git diff --check`.

## Cierre

Update this issue, the five roadmap authorities, and the execution backlog with
the evidence commit and trace/final checksums. Keep the inherited aggregate
helper-bind target-link blocker explicit if `pnpm qa:trace` still stops there.

## Evidencia de cierre

- Evidence commit: `953788b3`.
- Required artifact: `synthetic-imported-projectile-attack-redlife-guard`.
- Trace checksum `9051894a`, final checksum `7434fbdc`.
- Root Projectile lifecycle, target link, accepted guard reason,
  `GetHitVar(redlife)=20`, and final defender `life=20/redLife=20` pass.
- `pnpm exec vitest run src/tests/RuntimeTraceGatePresets.test.ts -t
  "Projectile AttackMulSet red-life guard snapshot"`, `pnpm run typecheck`,
  and `git diff --check` pass.
- Aggregate `pnpm qa:trace` still stops only on the inherited
  `synthetic-imported-helper-bind-to-target-redirect` target-link blocker.

## Cierre acotado

The root Projectile guard-contact snapshot is closed. Helper-parented guard
breadth, ModifyProjectile, shared banks, exact resource arithmetic/timing,
rollback and full M.U.G.E.N/Ikemen parity remain outside the claim.

# Issue 348 — Helper `ModifyProjectile` `airguard.velocity` component matrix

## Estado

- **T774 — closed-bounded (2026-08-15)**
- **Área:** runtime / Helper / Projectile / ModifyProjectile / air guard / velocity
- **Dependencia:** T773 / issue 347

## Objetivo

Close the next bounded Helper-owned live `ModifyProjectile airguard.velocity`
component matrix after the X/Y/Z component traces. Verify the pinned Ikemen
semantics: an omitted parameter is a no-op, while single-, pair-, and
triple-component writes replace the missing trailing components with zero
before an accepted airborne guard exposes the resulting vector.

## Alcance permitido

- One first-generation Helper and one root-owned Projectile selected by an
  explicit Helper-owned `ModifyProjectile`.
- Omitted, single-component, pair, and triple mutations against a seeded live
  airguard vector, with one accepted airborne guard and one focused runtime
  integration proving the final X/Y/Z vector.
- Reuse the T771/T772/T773 component traces as controls and keep the
  root-owned Projectile lifecycle and Helper caller context explicit.

## Fuera de alcance

- Fresh/default derivation, dynamic expression grammar beyond the existing
  scalar seam, ground guard, nested Helpers, multiple projectiles,
  RedirectID/custom-state ownership, shared/team topology, exact 3D
  localcoord/tick/rounding parity, rollback, and full M.U.G.E.N/Ikemen parity.
- Unrelated `ModifyProjectile` fields or a score movement claim.

## Evidencia requerida

- Focused EffectActor/Projectile regression covering omission/no-op and
  single/pair/triple zero-fill replacement.
- Public runtime evidence for the accepted airborne guard, final
  `GetHitVar(xvel/yvel/zvel)`, and lifecycle/ownership is already provided by
  T771/T772/T773; this cut extends the same seam with focused matrix proof.
- `pnpm run typecheck`, `git diff --check`, and aggregate QA recorded with
  inherited blockers preserved.

## Authority note

Ikemen GO pin `149402f` evaluates `ModifyProjectile airguard.velocity` once in
the caller context and assigns `v1`, `v2` (default `0`) and `v3` (default `0`)
to each selected Projectile. This differs from fresh HitDef default
derivation and from an omitted ModifyProjectile parameter, which leaves the
live vector unchanged.

## Evidencia de cierre

- Evidence commit: `ebfe451e`.
- Focused matrix coverage passes in `ProjectileSystem.test.ts` and
  `EffectActorSystem.test.ts`: omitted is a no-op; one component writes X and
  zero-fills Y/Z; two components write X/Y and zero-fill Z; three components
  replace all three values.
- `pnpm run typecheck` and `git diff --check` pass. The full
  `ProjectileSystem.test.ts` file passes `99/99`; the new Helper matrix test
  passes independently. The broader `EffectActorSystem.test.ts` suite still
  has one inherited `guardPoints` expectation failure (`44` expected, `0`
  received) outside this cut.
- `pnpm run qa:trace` still stops at the inherited
  `synthetic-imported-helper-bind-to-target-redirect` missing target-link
  blocker; no T774 trace claim is made because T771/T772/T773 already provide
  the accepted airborne-guard lifecycle/readback evidence.

## Siguiente corte

T775 is queued for the Helper-owned `ModifyProjectile guard.velocity` Y/Z
ground-guard extension, keeping the T770 X path and the Ikemen-only extension
separate from fresh defaults, nested topology, and full parity.

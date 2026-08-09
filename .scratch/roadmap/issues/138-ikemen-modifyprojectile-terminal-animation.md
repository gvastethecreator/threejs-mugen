# Issue 138 — Ikemen ModifyProjectile terminal animation mutation

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Align numeric ModifyProjectile `projhitanim`, `projremanim`, and
`projcancelanim` mutation with pinned Ikemen source so later hit, timeout,
bounds, or cancel removal uses refreshed terminal AIR metadata.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` evaluates all three terminal
animation parameters inside ModifyProjectile. It writes the selected
Projectile's animation namespace and number; `projremanim` clamps to at least
`-2`, while `projcancelanim` clamps to at least `-1`.

## Acceptance fixture

- Compile static numeric terminal animation parameters into the typed
  ModifyProjectile operation.
- Resolve dynamic numeric parameters through the bounded expression resolver.
- Refresh terminal animation numbers and owner AIR references for selected
  root-owned and helper-parented Projectiles.
- Prove later hit/remove/cancel terminal playback selects the updated AIR
  action and keeps T561 selection unchanged.

## Claim ceiling

Do not claim FightFX/common animation namespaces, string-prefix parity, exact
negative-sentinel behavior beyond the local playback seam, exact invalid AIR
destruction, tick order, rollback/netplay serialization, or complete
ModifyProjectile parity.

## Port ledger

| Disposition | Detail |
| --- | --- |
| Copied | ModifyProjectile writes hit, remove, and cancel animation identities for every selected live Projectile. |
| Adapted | Numeric local AIR actions refresh `terminalActions` so the existing hit/timeout/bounds/cancel playback seam consumes the mutation. |
| Replaced | Negative numeric sentinels clear the local action reference; exact upstream `-2`/`-1` distinctions remain outside the claim. |
| Omitted | FightFX/common namespaces, string prefixes, exact invalid-action destruction, tick order, and rollback serialization. |
| Local extension | One shared action resolver serves active and terminal ModifyProjectile animation mutations. |

## Closure evidence

- RuntimeCompiler, ProjectileSystem, EffectActorSystem, and EffectSpawnSystem:
  4 files / 192 tests pass.
- PlayableMatchRuntime focused dynamic ModifyProjectile gate: 1 test passes.
- Typecheck, build, boundaries, redirect boundaries, diff hygiene, and
  686/686 traces pass.
- The full suite retains the inherited 13 failed files / 58 failures with
  3383/3441 tests passing.

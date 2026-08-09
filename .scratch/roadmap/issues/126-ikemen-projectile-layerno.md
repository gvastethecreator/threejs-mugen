# Issue 126 — Ikemen Projectile layer number

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime presentation`
- Priority: `P1`

## Objective

Carry official Projectile `projlayerno` through typed spawn/modify operations,
live presentation ordering, snapshots, and numeric `ProjVar(projlayerno)`
reads.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` compiles `projlayerno` as one
integer, inherits the owner's layer when omitted, normalizes authored and
modified values by sign to `-1`, `0`, or `1`, stores that value on the live
Projectile, uses it in the sprite draw list, and exposes it through `ProjVar`.
The source is MIT licensed.

## Acceptance fixture

- Compile static `projlayerno` for Projectile and ModifyProjectile through the
  existing typed operation boundary and normalize it by sign.
- Store the layer on `RuntimeProjectile`, expose it in effect snapshots and
  numeric `ProjVar(projlayerno)` reads, including redirected contexts.
- Feed the normalized layer into the existing presentation-order contract so
  layer `-1`, `0`, and `1` occupy underlay, actor, and foreground bands.
- Prove spawn defaults and normalization, modify, snapshot presentation order,
  direct/redirected reads, and missing-projectile behavior.

## Claim ceiling

Do not claim exact Ikemen interleaving with every stage, FightScreen, motif,
Explod, shadow, or text layer; dynamic controller values; depth-derived
priority; rollback/netplay serialization; or complete draw-order parity.

## Implementation

- Projectile and ModifyProjectile compile static `projlayerno` through the
  typed operation boundary and normalize authored values by sign.
- `RuntimeProjectile` stores `-1`, `0`, or `1`; the spawn seam supports owner
  inheritance and the current root runtime defaults to layer zero.
- Numeric `ProjVar(projlayerno)` reads use the shared owner-relative selector
  and redirected expression contexts.
- Effect snapshots carry the normalized layer into the existing underlay,
  actor, and foreground presentation-order bands consumed by the renderer.

## Port ledger

- Source: Ikemen GO `develop` commit `149402f`, MIT.
- Local seam: `ControllerOps.ts` -> `ProjectileSystem.ts` ->
  `RuntimeSnapshotSystem.ts` -> `CharacterRenderer.ts`.
- Bounded claim: typed layer state, reads, and coarse live presentation bands;
  the exact interleaving ceiling above remains open.

## Verification

- Focused tests: 9 files / 290 tests passed.
- `pnpm typecheck`, `pnpm build`, `pnpm check:boundaries`, and
  `pnpm check:redirect-boundary` passed.
- `pnpm qa:trace`: 686/686 passed (652 required, 34 optional).
- `git diff --check` passed (line-ending warnings only).
- Full suite: 13 failed files / 58 failed tests / 3371 passed / 3429 total.
  Failures remain in the inherited retired-roster, Studio/project expectation,
  movement-expectation, and imported-log-label families; no T552 focal test
  failed.

# Ticket 255: Common.Fx FightFX packages

- Status: resolved bounded implementation; browser smoke residual
- Date: 2026-07-18
- Scope: load configured IKEMEN `[Common] Fx*` DEF packages
- Depends on: Ticket 250 / ADR 0017, existing FightFX library loading
- Research: [`docs/research/2026-07-18-common-fx-packages.md`](../../../docs/research/2026-07-18-common-fx-packages.md)
- Implementation: `750e888e`
- Closeout: [`docs/adr/0022-common-fx-packages.md`](../../../docs/adr/0022-common-fx-packages.md), [`docs/reports/2026-07-18-common-fx-closeout.md`](../../../docs/reports/2026-07-18-common-fx-closeout.md)

## Question

The loader supports the default fight.def package and character-declared FX
packages, but ignores config-driven `Common.Fx` DEF files. A character whose
`fightfx.prefix` points at a common package therefore falls back to the wrong
hit-spark library even though the package is present.

## Bounded contract

- Read `[Common]` keys matching `Fx` and `Fx<number>` in natural numeric order.
- Resolve root-style `data/...` and config-relative virtual paths.
- Load supported `.def` packages through the existing AIR/SFF/SND FightFX
  loader and retain their prefixes in `fightFxLibraries`.
- Load CommonFx before character FX packages; the first valid prefix owns the
  map entry, with duplicate-prefix diagnostics.
- Record resolved CommonFx paths and report missing/unsupported references.
- Reuse the existing imported-fighter prefix lookup; do not create another
  hit-spark asset contract.

## Out of scope

FightFX prefix collision parity beyond deterministic first-wins, external Lua
modules, CommonAir/command/constant behavior, screenpack caching, renderer or
audio parity, rollback/netplay, and complete MUGEN/IKEMEN parity.

## Acceptance evidence

- Focused system-assets coverage proves numeric ordering, config-relative
  resolution, common-before-character prefix ownership, and missing evidence.
- A common-only package is visible through the existing `fightFxLibraries` map.
- Batched tests, TypeScript 7 typecheck, build, repository boundary guards,
  and diff hygiene pass before closeout.

## Closeout

The loader now resolves `[Common] Fx` and `Fx<number>` in natural order,
loads supported FightFX DEF packages before character FX packages, records
their resolved paths, and keeps first-valid normalized prefix ownership
deterministic. Missing, ZSS, wrong-format, and duplicate-prefix evidence is
surfaced through the existing diagnostics boundary.

The full Playwright smoke harness was attempted in an isolated output
directory but timed out after `424.1s` before writing `diagnostics.json`; the
partial output reached the Studio debug inspector mobile capture. This is a
verification residual, not a browser-pass claim.

## Claim allowed

Bounded CommonFx package resolution and FightFX prefix-map integration are
implemented and covered by loader tests, full runtime tests, type/build gates,
trace gates, and boundary checks.

## Claim blocked

Exact upstream FightFX cache/promotion behavior, complete Common1/default
tables, ZSS/Lua, raw IKEMEN InputBuffer internals, AI/SOCD, rollback/netplay,
renderer/audio parity, score movement, and full MUGEN/IKEMEN parity remain
open. Browser smoke remains a residual until the harness completes and writes
its assertions.

# Ticket 254: Common.Air animation merge

- Status: resolved bounded implementation
- Date: 2026-07-18
- Scope: merge configured IKEMEN common AIR actions into character animations
- Depends on: Ticket 250 / ADR 0017, Ticket 253, character SFF/AIR loading
- Research: [`docs/research/2026-07-18-common-air-merge.md`](../../../docs/research/2026-07-18-common-air-merge.md)
- Implementation: `9fed3eda`
- Closeout: [`docs/reports/2026-07-18-common-config-loader-closeout.md`](../../../docs/reports/2026-07-18-common-config-loader-closeout.md)

## Question

IKEMEN's `[Common] Air*` sources provide animation actions that use the
character's local sprite archive. The loader currently parses only the DEF AIR
file, so valid common action IDs are invisible to imported states and the
playable fighter definition.

## Bounded contract

- Read `[Common]` keys matching `Air` and `Air<number>` in natural numeric
  order.
- Resolve root-style `data/...` references and config-relative references using
  the established virtual-file rules.
- Parse existing `.air` sources with the existing AIR parser and merge only
  action IDs absent from the character animation map.
- Preserve character AIR precedence and first-wins ordering across common AIR
  files; load CommonAir even when the DEF has no AIR file.
- Record resolved common animation sources and report missing references.
- Reject explicit non-AIR/ZSS sources as unsupported instead of treating them
  as animation data.

## Outcome

The loader now resolves ordered `[Common] Air*` entries, parses supported AIR
sources, and adds only action IDs absent from the character animation map.
Character AIR wins over duplicate common IDs; earlier common sources win over
later duplicates. Common AIR sources are retained for diagnostics and imported
fighters consume the merged map without a second animation contract.

## Out of scope

Sprite archive replacement, cross-character sprite ownership, full `Copy`
action resolution, CommonFx, ZSS/Lua, animation timing/render parity,
rollback/netplay, and complete MUGEN/IKEMEN parity.

## Acceptance evidence

- Focused loader coverage proves character action precedence, natural CommonAir
  order, no-character-AIR loading, and missing/unsupported evidence.
- Parsed common actions flow through the existing `MugenCharacter.animations`
  map without a second runtime animation contract.
- Batched runtime tests, TypeScript 7 typecheck, build, repository boundary
  guards, and diff hygiene pass before closeout.

## Verification

- Loader/config focus: `31/31` tests across four files.
- `pnpm typecheck`, `pnpm build`, `pnpm check:boundaries`,
  `pnpm check:redirect-boundary`, and `git diff --check` passed.

## Scope ceiling

This does not claim sprite archive replacement, full Copy-action resolution,
CommonFx, ZSS/Lua, exact animation timing/render parity, rollback/netplay, or
complete MUGEN/IKEMEN parity.

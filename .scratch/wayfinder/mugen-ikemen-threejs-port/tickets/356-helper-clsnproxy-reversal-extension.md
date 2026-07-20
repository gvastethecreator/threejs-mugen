# T356 Helper clsnproxy ReversalDef extension

Status: resolved at bounded root ReversalDef collision scope

Feature commit: `eff5cdb4`

## Source evidence

The pinned local Ikemen-GO source uses `clsnCheck(getter, 1, ...)` while
resolving ReversalDef interactions, including ReversalDef-versus-ReversalDef
clashes. The same `clsnCheck` path rejects proxy Helpers as independent actors
and flattens the root plus active proxy descendants before checking `clsn1`.

Official source: [Ikemen-GO `src/char.go` reversal priority and counter-check](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10497-L10530)
and [the flattened collision check](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10196-L10285)

## Delivered

- Extended `RuntimeReversalWorld.findActive` to accept one or many incoming
  world-space attack boxes.
- Routed every resolved root `clsn1` box through direct ReversalDef contact
  and equal-priority preparation.
- Passed the runtime collision accessor through the match combat bridge for
  ReversalDef-versus-ReversalDef clashes.
- Updated root team/tag ReversalDef admission to compare resolved root `clsn1`
  boxes on both sides.
- Kept Helper direct combat and projectile reversal paths on their existing
  bounded contracts.
- Added focused tests for multi-box reversal contact, direct root reversal,
  root reversal clash admission, and bridge-level reversal clash resolution.

## Verification

- Focused Vitest: `5` files, `350/350` tests passed.
- Full Vitest: `240/240` files, `2612/2612` tests passed.
- `pnpm typecheck` passed with the TypeScript 7 toolchain.
- `pnpm build` passed with `327` transformed modules; JS output was
  `2,086.75 kB` before gzip.
- `pnpm check:boundaries` passed.
- `pnpm qa:trace` passed: `634/634` artifacts, `600` required and `34`
  optional; `diagnostics.json` reports `0` failed and `0` skipped fixtures.
- `git diff --check` passed for the feature write-set.
- Browser smoke remains deferred because the change stays inside runtime
  collision resolution and has no new browser-facing surface.

## Claim ceiling

This ticket proves bounded root `clsn1` proxy extension for direct ReversalDef
contact and root ReversalDef clashes in the explicit IKEMEN runtime path. It
does not prove helper-owned ReversalDef interaction, projectile reversal
differentials, exact global scale or angle semantics, renderer overlays,
external-engine differential parity, compatibility-score movement, or complete
MUGEN/IKEMEN collision parity.

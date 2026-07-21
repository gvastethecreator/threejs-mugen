# T361 Helper clsnproxy OverrideClsn

Status: resolved at bounded Helper-local collision override scope

Feature commit: `53285457`

Validation checkpoint: [T362 checkpoint](../../../../docs/research/2026-07-21-global-checkpoint-after-t362.md)

## Source evidence

The normative source is Ikemen-GO revision
`05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`. `getClsn` first copies the
selected animation frame boxes, then applies every active override for that
group. A zero rectangle removes an indexed box or all boxes for index `-1`.
Each character clears collision modifiers and overrides on every tick.

Official sources:

- [Ikemen-GO getClsn override application](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10054-L10134)
- [Ikemen-GO per-tick collision reset](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L11678-L11682)

## Delivered

- Added Helper-owned `clsnOverrides` state with deep snapshot, redirect-state,
  and runtime-clone propagation.
- Clears that state at the same Helper frame boundary as `TransformClsn`.
- Applies the current Helper override list before Helper collision scale,
  facing, angle, and world-proxy projection.
- Uses one shared current-frame accessor for Helper HitDef and clsnproxy
  Clsn1/Clsn2 geometry, so both consumers read the same overridden boxes.
- Supports dynamic `group`, `index`, and comma-safe dynamic `rect` values in
  the caller Helper context.

## Verification

- Focused Vitest passed: `3/3` files and `328/328` tests in the T361/T362
  checkpoint.
- `pnpm typecheck` passed with TypeScript `7.0.2`.
- `pnpm qa:trace` passed: `636/636` artifacts, `602` required and `34`
  optional; no failed or skipped fixture.
- `pnpm build` passed with `328` transformed modules and `2,095.45 kB` JS
  before gzip.
- `pnpm check:boundaries`, `pnpm check:redirect-boundary`, and
  `git diff --check` passed.
- Full Vitest remains deferred. The latest full baseline is T356 with
  `240/240` files and `2612/2612` tests.
- Browser smoke remains deferred because this cut changes runtime collision
  state only.

## Claim ceiling

This ticket proves bounded Helper-local `OverrideClsn` state reaches active
Helper Clsn1/Clsn2 queries before Helper-local transform composition. It does
not prove RedirectID routing, which belongs to T362, group-3 size behavior,
complete local-coordinate or animation-scale order, helper offset/postype
parity, renderer proof, upstream differential parity, or full
MUGEN/IKEMEN collision parity.

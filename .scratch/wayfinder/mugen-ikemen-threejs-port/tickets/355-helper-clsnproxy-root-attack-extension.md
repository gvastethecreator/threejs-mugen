# T355 Helper clsnproxy root attack extension

Status: resolved at bounded root HitDef collision scope

Feature commit: `aaf262e8`

## Source evidence

The pinned local Ikemen-GO source rejects a `clsnproxy` Helper as an
independent actor, then flattens active proxy descendants into the parent's
`clsn1` and `clsn2` collision checks. Normal HitDef admission calls
`clsnCheck(getter, 1, ...)`, so the attack side uses the root's current `clsn1`
extension.

Official source: [Ikemen-GO `src/char.go` at the pinned revision](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10196-L10285)

## Delivered

- Added a typed root attack-box resolver that reads the existing `clsn1`
  collision bridge and falls back to the active move box when no accessor is
  present.
- Routed the resolved attack list through normal direct HitDef contact and
  equal-priority preparation.
- Routed the same list through root team/tag admission and priority-clash
  contact while preserving `p2clsncheck`, `p2clsnrequire`, and
  ProjTypeCollision branches.
- Kept `clsnproxy` Helpers out of direct Helper combat admission.
- Added regression coverage where the move box misses but a resolved root
  `clsn1` box admits the hit.

## Verification

- Focused Vitest: `4` files, `341/341` tests passed.
- `pnpm typecheck` passed with the TypeScript 7 toolchain.
- `pnpm build` passed with `327` transformed modules; JS output was
  `2,086.62 kB` before gzip.
- `pnpm check:boundaries` passed.
- `pnpm qa:trace` passed: `634/634` artifacts, `600` required and `34`
  optional; `diagnostics.json` reports `0` failed and `0` skipped fixtures.
- `git diff --check` passed for the feature write-set.
- Full Vitest remains deferred. The latest recorded full baseline is T351:
  `239/239` files and `2601/2601` tests.
- Browser smoke remains deferred because this change stays inside runtime
  collision resolution and has no new browser-facing surface.

## Claim ceiling

This ticket proves current root `clsn1` boxes, including the bounded active
proxy extension, participate in normal direct HitDef contact, team/tag
admission, and priority preparation in the runtime bridge. It does not prove
ReversalDef proxy extension, projectile differential behavior, exact global
scale or angle semantics, render overlays, helper-versus-helper breadth,
external-engine differential parity, compatibility-score movement, or complete
MUGEN/IKEMEN collision parity.

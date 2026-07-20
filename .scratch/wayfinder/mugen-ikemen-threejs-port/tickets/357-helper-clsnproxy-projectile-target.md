# T357 Helper clsnproxy projectile target collision

Status: resolved at bounded projectile-target collision scope

Feature commit: `5f17d948`

## Source evidence

The pinned local Ikemen-GO source sends projectile collision through
`projClsnCheck`, rejects a proxy as an independent actor, flattens the target
root and its active proxy descendants, and reads the selected target collision
group from that flattened set.

Official source: [Ikemen-GO `src/char.go` projectile collision check](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10089-L10172)

## Delivered

- Made `RuntimeCombatResolutionWorld.resolveProjectile` prefer the target's
  resolved `clsn2` collision accessor for projectile combat.
- Preserved the existing `getHurtBoxes` and default fallback for callers that
  do not provide the typed collision accessor.
- This same resolved target list now feeds projectile hit contact and the
  defender's `HitFlag P` projectile-cancel path.
- Added regression coverage where the base hurt box misses and only the
  resolved root `clsn2` box admits the projectile.

## Verification

- Focused Vitest: `3` files, `357/357` tests passed.
- `pnpm typecheck` passed with the TypeScript 7 toolchain.
- `pnpm build` passed with `327` transformed modules; JS output was
  `2,086.79 kB` before gzip.
- `pnpm check:boundaries` passed.
- `pnpm qa:trace` passed: `634/634` artifacts, `600` required and `34`
  optional; `diagnostics.json` reports `0` failed and `0` skipped fixtures.
- `git diff --check` passed for the feature write-set.
- The latest full-suite baseline remains T356: `240/240` files and
  `2612/2612` tests. Full Vitest is deferred until the next larger block.
- Browser smoke remains deferred because this change stays inside runtime
  projectile collision and has no new browser-facing surface.

## Claim ceiling

This ticket proves bounded root `clsn2` proxy extension for projectile target
contact and HitFlag-P cancellation in the runtime bridge. It does not prove
projectile-versus-projectile differentials, all `p2clsncheck` groups, helper
projectile ownership breadth, exact global scale or angle semantics,
external-engine differential parity, compatibility-score movement, or complete
MUGEN/IKEMEN projectile parity.

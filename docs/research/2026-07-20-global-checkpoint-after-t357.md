# Global checkpoint after T357

Date: 2026-07-20
Head: `e434c10e`
Feature commit: `5f17d948`
Documentation commit: `8a6c498d`
Status: green for the bounded Ikemen projectile target collision block

## Evidence

- Focused T357 projectile, combat-resolution, and PlayableMatchRuntime tests
  passed: `357/357` across `3` files.
- `pnpm typecheck` passed with the TypeScript 7 toolchain.
- `pnpm build` passed with `327` transformed modules; JS output was
  `2,086.79 kB` before gzip.
- `pnpm check:boundaries` passed.
- `pnpm qa:trace` passed: `634/634` artifacts, `600` required and `34`
  optional; `diagnostics.json` reports `0` failed and `0` skipped fixtures.
- `git diff --check` passed for the T357 feature and documentation write-sets.
- The latest full-suite baseline remains T356's `240/240` files and
  `2612/2612` tests. Full Vitest is deferred until the next larger
  implementation block.
- Browser smoke remains deferred because this slice changes runtime projectile
  collision and has no new browser-facing route or visual surface.

## Block covered

T357 makes the runtime resolve the defender's `clsn2` list through the typed
collision accessor before the legacy hurt-box fallback. The selected root
proxy extension therefore reaches projectile hit contact and the defender's
HitFlag-P projectile-cancel path while keeping ownership and projectile
source rules unchanged.

Feature commit: `5f17d948` (`feat(runtime): honor root collision boxes for projectiles`).
Documentation commit: `8a6c498d` (`docs: record clsnproxy projectile evidence`).

## Advisories

- Vite retains the existing post-minification large-chunk warning.
- Browser smoke remains outside this runtime-only checkpoint.
- The pre-existing roadmap and daily research changes remain outside the T357
  feature and documentation commits.

## Claim ceiling

This checkpoint confirms bounded root `clsn2` proxy extension for projectile
target contact and HitFlag-P cancellation in the explicit IKEMEN runtime. It
does not confirm projectile variants beyond the bounded `clsn2` path,
projectile clashes, helper-owned projectile breadth, full scale or angle
semantics, external-engine differential parity, compatibility-score movement,
or complete MUGEN/IKEMEN projectile parity.

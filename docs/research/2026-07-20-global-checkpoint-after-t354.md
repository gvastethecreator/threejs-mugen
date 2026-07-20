# Global checkpoint after T354

Date: 2026-07-20
Head: `3aec5e30`
Feature commit: `891d55f5`
Documentation commit: `3aec5e30`
Status: green for the bounded Ikemen `ownclsnscale` proxy-geometry block

## Evidence

- Focused T354 collision, helper-combat, combat-resolution, root-admission,
  and PlayableMatchRuntime tests passed: `350/350` across `5` files.
- `pnpm typecheck` passed with the TypeScript 7 toolchain.
- `pnpm build` passed with `327` transformed modules.
- `pnpm check:boundaries` passed.
- `pnpm qa:trace` passed: `634/634` artifacts, `600` required and `34`
  optional; `diagnostics.json` reports `0` failed and `0` skipped fixtures.
- `git diff --check` passed for the T354 feature and documentation write-sets.
- The latest full-suite baseline remains T351's `239/239` files and
  `2601/2601` tests. Full Vitest is deferred until the next larger
  implementation block.
- Browser smoke remains deferred because this slice changes runtime collision
  state and has no new browser-facing route or visual surface.

## Block covered

T354 adds bounded IKEMEN scale selection for active current-frame proxy boxes.
`ownclsnscale` selects the Helper's parsed `scale`; the inactive flag inherits
the root definition's finite `size.xscale` and `size.yscale`. The selected
scale applies before the existing position, facing, and root-local transform
for proxy `clsn1` and `clsn2` boxes. Legacy and unknown profiles keep the
existing route.

Feature commit: `891d55f5` (`feat(runtime): honor ownclsnscale for proxy boxes`).
Documentation commit: `3aec5e30` (`docs: record Helper ownclsnscale collision evidence`).

## Advisories

- Vite retains the existing post-minification large-chunk warning.
- Browser smoke remains outside this runtime-only checkpoint.
- The pre-existing roadmap and daily research changes remain outside the T354
  feature and documentation commits.

## Claim ceiling

This checkpoint confirms bounded `ownclsnscale` selection for current-frame
proxy collision boxes in the explicit IKEMEN path. It does not confirm global
`clsnScaleMul`, `animlocalscl`, localcoord, angle or rotation semantics, root
attack-box extension, size/push-box scaling, renderer overlays, projectile
differential parity, external-engine differential parity, compatibility-score
movement, or complete MUGEN/IKEMEN collision parity.

# Global checkpoint after T359

Date: 2026-07-20
Head: `be339861`
Feature commit: `38fb0f0a`
Documentation commit: `be339861`
Status: green for the bounded TransformClsn angle block

## Evidence

- Focused runtime run passed: `6` files and `8/8` selected tests.
- `pnpm typecheck` passed with the TypeScript 7 toolchain.
- `pnpm build` passed with `328` transformed modules; JS output was
  `2,093.19 kB` before gzip.
- `pnpm check:boundaries` passed.
- `pnpm qa:trace` passed: `636/636` artifacts, `602` required and `34`
  optional; diagnostics report `0` failed and `0` skipped fixtures.
- `git diff --check` passed for the feature write-set.
- The latest full-suite baseline remains T356: `240/240` files and
  `2612/2612` tests. Full Vitest remains deferred until the next larger
  implementation block.
- Browser smoke remains deferred because this block stays inside runtime
  collision state and trace evidence.

## Block covered

T359 adds typed `TransformClsn angle` state for static and expression-backed
values. The angle accumulates for the active tick, resets with fighter and
Helper frame advance, reaches rotated root collision intersection through an
inclusive SAT path, and leaves size boxes unrotated. Runtime trace actor-frame
evidence now gates the observed angle, and the required synthetic imported
artifact is part of `pnpm qa:trace`.

Feature commit: `38fb0f0a` (`feat(runtime): port TransformClsn angle collision`).
Documentation commit: `be339861` (`docs: record TransformClsn angle evidence`).

## Advisories

- Vite retains the existing post-minification large-chunk warning.
- Root Helper proxy-local angle composition remains open.
- The existing strict axis-aligned edge-touch behavior remains unchanged;
  only the rotated SAT path uses inclusive overlap as in Ikemen.
- Full browser proof and upstream/local differential traces remain outside
  this runtime-only checkpoint.
- The pre-existing roadmap and daily research changes remain outside the T359
  feature and documentation commits.

## Claim ceiling

This checkpoint confirms bounded per-tick `TransformClsn angle` state,
rotated root collision geometry, size-box exclusion, direct Helper state, and
required trace evidence. It does not confirm proxy-local angle composition,
size-box scaling, exact `animlocalscl` or `localcoord` composition, every
projectile/helper variant, renderer parity, external-engine differential
parity, compatibility-score movement, or complete MUGEN/IKEMEN collision
parity.

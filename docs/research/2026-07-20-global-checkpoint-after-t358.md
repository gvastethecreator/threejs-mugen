# Global checkpoint after T358

Date: 2026-07-20
Head: `9ea07987`
Feature commit: `edad5bb2`
Documentation commit: `5b14dc39`
Status: green for the bounded TransformClsn scale block

## Evidence

- Focused runtime tests passed: `5` files and `96/96` tests.
- The isolated production TransformClsn trace gate passed: `1/1` test.
- `pnpm typecheck` passed with the TypeScript 7 toolchain.
- `pnpm build` passed with `328` transformed modules; JS output was
  `2,091.00 kB` before gzip.
- `pnpm check:boundaries` passed.
- `pnpm qa:trace` passed: `635/635` artifacts, `601` required and `34`
  optional; diagnostics report `0` failed and `0` skipped fixtures.
- `git diff --check` passed for the T358 feature and documentation
  write-sets.
- The latest full-suite baseline remains T356: `240/240` files and
  `2612/2612` tests. Full Vitest is deferred until the next larger block.
- The combined focused run of the large RuntimeTrace preset file reached
  `715/716`; its one failure was the existing team round handoff test
  exceeding the 5-second timeout under file-wide load. The new TransformClsn
  test passed in isolation.
- Browser smoke remains deferred because this block stays inside runtime
  collision state and trace evidence.

## Block covered

T358 adds typed `TransformClsn scale` state for static and expression-backed
values. The multiplier accumulates for the active tick, resets with fighter
and Helper frame advance, reaches root Clsn1/Clsn2 consumers after collision
overrides, and composes with the current Helper/proxy collision path. Runtime
trace actor-frame evidence now gates the observed collision multiplier, and
the required synthetic imported artifact is part of `pnpm qa:trace`.

Feature commit: `edad5bb2` (`feat(runtime): port TransformClsn scale state`).
Documentation commit: `5b14dc39` (`docs: record TransformClsn scale evidence`).

## Advisories

- Vite retains the existing post-minification large-chunk warning.
- `TransformClsn angle` remains an explicit unsupported capability.
- Full browser proof and upstream/local differential traces remain outside
  this runtime-only checkpoint.
- The pre-existing roadmap and daily research changes remain outside the T358
  feature and documentation commits.

## Claim ceiling

This checkpoint confirms bounded per-tick `TransformClsn scale` state and its
reach through the current root and Helper collision consumers. It does not
confirm rotated collision geometry, size-box scaling, exact `animlocalscl` or
`localcoord` composition, every projectile/helper variant, renderer parity,
external-engine differential parity, compatibility-score movement, or complete
MUGEN/IKEMEN collision parity.

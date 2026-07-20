# Global checkpoint after T352

Date: 2026-07-20
Head: `5741293c`
Feature commit: `3d61ad92`
Documentation commit: `385d5700`
Status: green for the bounded Ikemen Helper preserve round-reset block

## Evidence

- Focused T352 effect-world, match-reset, and playable-runtime tests passed:
  `348/348` across `3` files.
- `pnpm typecheck` passed with the TypeScript 7 toolchain.
- `pnpm build` passed with `326` transformed modules.
- `pnpm qa:trace` passed: `634/634` artifacts, `600` required and `34`
  optional; existing trace checksums remained stable.
- `pnpm check:boundaries` passed.
- `git diff --check` passed for the T352 feature and documentation write-sets.
- The latest full-suite baseline before T352 passed: `239/239` files and
  `2601/2601` tests from T351. The full suite is deferred until the next
  implementation block to avoid repeating the same global run after each
  narrow runtime slice.
- Browser smoke remains deferred because T352 changes runtime reset state and
  has no new browser-facing route or visual surface.

## Block covered

T352 adds an explicit reset option that the `ikemen-go` round/Turns continuation
path uses to retain only Helpers with `preserve = true`. The reset clears
transient Explods and Projectiles, notifies removal only for discarded Helpers,
and keeps Helper serial allocation unique across the preserved world. The
explicit full reset and intro-skip paths remain destructive.

Feature commit: `3d61ad92` (`feat(runtime): preserve Ikemen helpers across round reset`).
Documentation commit: `385d5700` (`docs: record Helper preserve round reset evidence`).

## Advisories

- Vite retains the existing post-minification large-chunk warning.
- Browser smoke remains outside this runtime-only checkpoint.
- The pre-existing roadmap and daily research changes remain outside the T352
  feature and documentation commits.

## Claim ceiling

This checkpoint confirms only the bounded opt-in Ikemen round/Turns reset
retention path, transient effect cleanup, Helper removal notification, and
serial continuity. Exact `RoundStartBackup` capture and restore, F4/reload
behavior, child-effect ownership, nested or redirected Helpers, team-wide
reset choreography, renderer output, external-engine differential evidence,
compatibility-score movement, and complete MUGEN/IKEMEN parity remain open.

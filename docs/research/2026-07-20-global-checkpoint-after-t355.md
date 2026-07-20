# Global checkpoint after T355

Date: 2026-07-20
Head: `991e478b`
Feature commit: `aaf262e8`
Documentation commit: `991e478b`
Status: green for the bounded Ikemen root HitDef attack-box block

## Evidence

- Focused T355 runtime collision, root admission, Helper collision, and
  PlayableMatchRuntime tests passed: `341/341` across `4` files.
- `pnpm typecheck` passed with the TypeScript 7 toolchain.
- `pnpm build` passed with `327` transformed modules; JS output was
  `2,086.62 kB` before gzip.
- `pnpm check:boundaries` passed.
- `pnpm qa:trace` passed: `634/634` artifacts, `600` required and `34`
  optional; `diagnostics.json` reports `0` failed and `0` skipped fixtures.
- `git diff --check` passed for the T355 feature and documentation write-sets.
- The latest full-suite baseline remains T351's `239/239` files and
  `2601/2601` tests. Full Vitest is deferred until the next larger
  implementation block.
- Browser smoke remains deferred because this slice changes runtime collision
  state and has no new browser-facing route or visual surface.

## Block covered

T355 routes resolved root `clsn1` boxes, including the bounded active
`clsnproxy` extension, through normal direct HitDef contact, equal-priority
preparation, root team/tag admission, and priority-clash contact. The move-box
fallback remains for isolated callers. `p2clsncheck`, `p2clsnrequire`, and the
paired ProjTypeCollision branch keep their existing rules.

Feature commit: `aaf262e8` (`feat(runtime): extend root attacks through clsnproxy`).
Documentation commit: `991e478b` (`docs: record clsnproxy root attack evidence`).

## Advisories

- Vite retains the existing post-minification large-chunk warning.
- Browser smoke remains outside this runtime-only checkpoint.
- The pre-existing roadmap and daily research changes remain outside the T355
  feature and documentation commits.

## Claim ceiling

This checkpoint confirms bounded current root `clsn1` extension for normal
direct HitDef and team/tag priority paths in the explicit IKEMEN runtime. It
does not confirm ReversalDef proxy extension, projectile differential behavior,
global scale or angle semantics, renderer overlays, helper-versus-helper
breadth, external-engine differential parity, compatibility-score movement,
or complete MUGEN/IKEMEN collision parity.

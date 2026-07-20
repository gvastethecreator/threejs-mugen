# Global checkpoint after T353

Date: 2026-07-20
Head: `1649624f`
Feature commit: `37a9e8bc`
Documentation commit: `1649624f`
Status: green for the bounded Ikemen clsnproxy root-box block

## Evidence

- Focused T353 collision, helper-combat, combat-resolution, root-admission,
  and PlayableMatchRuntime tests passed: `349/349` across `5` files.
- `pnpm typecheck` passed with the TypeScript 7 toolchain.
- `pnpm build` passed with `327` transformed modules.
- `pnpm check:boundaries` passed.
- `pnpm qa:trace` passed: `634/634` artifacts, `600` required and `34`
  optional; existing trace checksums remained stable.
- `git diff --check` passed for the T353 feature and documentation write-sets.
- The latest full-suite baseline before T352 and T353 remains T351's
  `239/239` files and `2601/2601` tests. Full Vitest is deferred until the
  next larger implementation block.
- Browser smoke remains deferred because this slice changes runtime collision
  state and has no new browser-facing route or visual surface.

## Block covered

T353 adds an explicit IKEMEN-only resolver for current-frame `clsnproxy`
descendants. Active proxy boxes are transformed into the root's local space and
included in root `clsn2` defense plus selected `clsn1` queries. Root ownership,
destroyed/disabled/standby state, nested proxy traversal, and cycle guards are
bounded. Existing direct Helper combat admission continues to exclude proxy
Helpers as independent actors.

Feature commit: `37a9e8bc` (`feat(runtime): extend root collision boxes through clsnproxy`).
Documentation commit: `1649624f` (`docs: record clsnproxy root box extension evidence`).

## Advisories

- Vite retains the existing post-minification large-chunk warning.
- Browser smoke remains outside this runtime-only checkpoint.
- The pre-existing roadmap and daily research changes remain outside the T353
  feature and documentation commits.

## Claim ceiling

This checkpoint confirms bounded current-frame proxy extension in the explicit
IKEMEN root collision path. It does not confirm exact scale or angle behavior,
`ownclsnscale`, normal root attack-box extension, render overlays, full
projectile differential behavior, helper-versus-helper breadth, external-engine
differential parity, compatibility-score movement, or complete MUGEN/IKEMEN
collision parity.

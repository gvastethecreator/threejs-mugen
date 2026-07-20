# Global checkpoint after T356

Date: 2026-07-20
Head: `d21ff047`
Feature commit: `eff5cdb4`
Documentation commit: `7e47aaa7`
Status: green for the bounded Ikemen root ReversalDef collision block

## Evidence

- Focused T356 collision, reversal, root admission, Helper collision, and
  PlayableMatchRuntime tests passed: `350/350` across `5` files.
- Full Vitest passed: `240/240` files and `2612/2612` tests.
- `pnpm typecheck` passed with the TypeScript 7 toolchain.
- `pnpm build` passed with `327` transformed modules; JS output was
  `2,086.75 kB` before gzip.
- `pnpm check:boundaries` passed.
- `pnpm qa:trace` passed: `634/634` artifacts, `600` required and `34`
  optional; `diagnostics.json` reports `0` failed and `0` skipped fixtures.
- `git diff --check` passed for the T356 feature and documentation write-sets.
- Browser smoke remains deferred because this slice changes runtime collision
  state and has no new browser-facing route or visual surface.

## Block covered

T356 extends the resolved root `clsn1` list through direct ReversalDef
contact, equal-priority preparation, and root team/tag ReversalDef clash
admission. `RuntimeReversalWorld` accepts a single or multiple incoming
world-space boxes. The match bridge passes the collision accessor into root
ReversalDef clash resolution while the move-box fallback remains for isolated
callers.

Feature commit: `eff5cdb4` (`feat(runtime): extend reversal boxes through clsnproxy`).
Documentation commit: `7e47aaa7` (`docs: record clsnproxy reversal evidence`).

## Advisories

- Vite retains the existing post-minification large-chunk warning.
- Vitest retains the existing `HTMLCanvasElement.getContext()` warning from
  tests that do not install the optional canvas package.
- Browser smoke remains outside this runtime-only checkpoint.
- The pre-existing roadmap and daily research changes remain outside the T356
  feature and documentation commits.

## Claim ceiling

This checkpoint confirms bounded root `clsn1` proxy extension for direct and
root-clash ReversalDef paths in the explicit IKEMEN runtime. It does not
confirm helper-owned reversal, projectile reversal differentials, complete
scale or angle semantics, renderer overlays, external-engine differential
parity, compatibility-score movement, or complete MUGEN/IKEMEN collision
parity.

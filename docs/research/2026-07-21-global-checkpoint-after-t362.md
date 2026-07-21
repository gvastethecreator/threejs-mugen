# Global checkpoint after T362

Date: 2026-07-21
Head: `db19a5b9`
Feature chain: `53285457`, `a970816e`, `ba75b203`, `db19a5b9`
Status: green for the bounded Helper OverrideClsn local and RedirectID block

## Global status

- Runtime collision: T360 proxy transform isolation remains green. T361 adds
  Helper-local override state before proxy transforms. T362 adds verified
  RedirectID writes to root and Helper destinations.
- Redirect ownership: resource, target, and collision writes share one
  revalidating lease/writeback executor. The static redirect-boundary guard
  covers that ownership.
- Studio editor: unchanged in this checkpoint.
- Three.js presentation: unchanged in this checkpoint. Browser smoke remains
  deferred because no visible UI or renderer path changed.
- Compatibility scores: unchanged. This is bounded runtime evidence, not a
  full-port or release claim.

## Evidence

- Focused runtime run passed: `3/3` files and `328/328` tests.
- `pnpm typecheck` passed with TypeScript `7.0.2`.
- `pnpm qa:trace` passed: `636/636` artifacts, `602` required and `34`
  optional, with `0` failed and `0` skipped fixtures.
- `pnpm build` passed with `328` transformed modules; JS output was
  `2,095.45 kB` before gzip.
- `pnpm check:boundaries` and `pnpm check:redirect-boundary` passed.
- `git diff --check` passed for each committed write-set.
- The latest full-suite baseline remains T356: `240/240` files and
  `2612/2612` tests. Full Vitest remains deferred until a larger runtime
  batch.

## Block covered

Current Helpers can own per-frame `OverrideClsn` data. Active clsnproxy
Clsn1/Clsn2 geometry reads that data before Helper-local scale, facing, angle,
and world-space projection. A Helper controller can direct the same collision
write to a verified root or Helper through `RedirectID`; expressions stay in
the caller context, destination local-coordinate scale applies, lease
freshness gates writeback, and target telemetry records the operation.

## Advisories

- Vite retains the existing post-minification large-chunk warning.
- Direct focused tests cover OverrideClsn geometry and RedirectID leases. The
  trace corpus has no dedicated artifact for each new override route.
- Group-3 size overrides, exact actor-order persistence, coordinate and
  animation-scale composition, helper offset/postype, renderer proof, and
  upstream/local differential traces remain open.

## Claim ceiling

This checkpoint confirms bounded Helper OverrideClsn state and RedirectID
writeback through the current runtime. It does not confirm complete collision
semantics, exact scheduler parity for every actor set, full visual parity,
compatibility-score movement, or complete MUGEN/IKEMEN parity.

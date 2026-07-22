# Global checkpoint after T369

Date: 2026-07-22

Head: ac8283dc

Feature chain: 42e2fabe (T368), 0f420d44 (T369), and ac8283dc (partial
Helper-stage-coordinate type repair).

## Global status

Task state: completed for the T368-T369 constraint batch.

Artifact verdict: win against the two ticket contracts.

Verification state: verified for the bounded current runtime routes below.

- Current root and first-generation Helper Width handling retains separate edge
  and player pairs. Width value updates both, and current X projection uses
  facing-aware edge insets.
- Current first-generation Helpers execute ScreenBound with one-frame
  ScreenBound/StageBound state, snapshots, current X/Z projection, and
  verified RedirectID destination writeback.
- This runtime-only batch does not change Studio or Three.js renderer code.
  Compatibility scores remain unchanged.

## Evidence

- Focused T368-T369 batch: 4 files and 411 tests.
- Full Vitest: 241 files and 2661 tests.
- TypeScript 7 typecheck passes.
- Trace QA passes 636 artifacts: 602 required and 34 optional.
- Production build passes with 329 transformed modules, 2109.86 kB JavaScript
  before gzip, and 528.68 kB gzip output.
- Repository boundary, redirect-boundary, and diff-hygiene checks pass.

## Claim ceiling

Allowed: bounded current root and first-generation Helper Width
edge/player/value state, current facing-aware stage projection, and
first-generation Helper ScreenBound/StageBound state with verified RedirectID
writeback.

Blocked: camera tracking, exact screen/stage or source scheduling behavior,
PosFreeze Helper support, nested ownership, broad redirect recursion,
renderer or upstream differentials, rollback/netplay, score movement, and full
MUGEN/IKEMEN parity.

## Gate record

Browser smoke is N/A because this batch changes no renderer or Studio surface.
The production build keeps the existing large-chunk advisory.

Independent review: omitted. The focused tests, full suite, trace gate, and
static boundaries covered the bounded code path; no separate reviewer was
available for this runtime-only checkpoint.

## Next frontier

Helper PosFreeze is the nearest isolated controller boundary. It needs the
same state, current projection, redirect, and pause-order audit before any
compatibility claim.

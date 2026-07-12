# IKEMEN Helper-relative Tag Member Runtime Report

Date: 2026-07-11
Scope: Wayfinder 089
Runtime profile: explicit `ikemen-go` Tag mode

## Delivered

- Static and deferred TagIn/TagOut `memberno` execute against a live Helper RedirectID.
- Member expressions remain original-root-caller-owned, truncate toward zero, and reject results below one.
- The Helper's exact live root anchors team side without assigning the Helper a stable or mutable root slot.
- A dedicated Tag-order operation swaps mutable position one with the requested one-based position, matching the pinned zero-valued Helper `memberNo` quirk.
- Helper, root, optional partner, states, member position, leader, and mode prevalidate before mutation.
- Mutation order is Helper state, member swap, Helper control, leader rotation, Helper self standby, then partner-root standby/state/control.
- Existing stable root slots and deterministic reset ownership remain unchanged.

## Evidence

- Focused: 2 files / 180 tests.
- Full: 170 files / 1736 tests.
- TypeScript 7: `pnpm typecheck` passed.
- Production build: passed; known Vite warning remains at 1,591.64 kB for the main JS chunk.
- Trace compatibility: 538/538 passed, including 507 required and 31 optional artifacts.
- Architecture: `pnpm check:boundaries` passed.
- Diff: `git diff --check` passed before documentation closeout.
- Browser smoke: N/A; no renderer, Studio, CSS, sprite, or visible presentation path changed.

## Adversarial Audit

- Covered static and deferred TagIn/TagOut, original-caller dynamic values, a root moved away from mutable position one, full member/leader/partner composition, stable slots, reset, and telemetry.
- Covered out-of-range and below-one positions, non-Tag mode, missing root, state/partner/leader prevalidation, legacy rejection, and atomic rollback.
- The composition oracle distinguishes member-before-leader from leader-before-member and proves that the root's current position is not used as the Helper member source.
- Independent review was omitted because no authorized independent agent was available; hostile integration cases plus full gates provide the closing proof.

## Quality Record

Task state: completed
Artifact verdict: win against Wayfinder 089 acceptance
Verification state: verified
Deferred: exact incremental partial failure, Helper-originated Tag, incoming Helper gameplay breadth, tag/simul/turns round-resource-presentation ownership, trace promotion, score movement, and full parity

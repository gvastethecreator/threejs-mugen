# Ticket 249: IKEMEN negative-state merge

- Status: resolved bounded implementation
- Date: 2026-07-18
- Scope: imported character `st*` and `stcommon` CNS source resolution
- Depends on: Ticket 248 / ADR 0015
- Implementation: `0c42c770`
- Closeout: [`docs/reports/2026-07-18-ikemen-negative-state-merge-closeout.md`](../../../docs/reports/2026-07-18-ikemen-negative-state-merge-closeout.md)

## Question

When an IKEMEN character declares the same negative state in more than one
state source, should the loader keep one definition or preserve the ordered
controller blocks from each source?

## Bounded contract

- `mugenversion` and unknown profiles keep the existing first-identity-wins
  behavior for duplicate states.
- A character with an explicit `ikemenversion` uses ordered IKEMEN negative
  merging for `State -4`, `-3`, `-2`, `-1`, and literal `+1`.
- The first negative `StateDef` supplies the initial state; later matching
  definitions merge their explicitly supplied `StateDef` fields and append
  their controllers in source order.
- Character sources remain before `stcommon`; a matching common negative state
  appends after the character contribution under the IKEMEN policy.
- Normal numeric states remain first-listed and later duplicates remain
  shadowed evidence.
- The slice does not add CMD, global `Common.States`, ZSS/Lua, helper-local
  buffers, or exact full-engine parity claims.

## Evidence required

- resolver tests for normal first-wins, MUGEN negative first-wins, and IKEMEN
  negative append/field override;
- loader fixture proving `st`, numbered `st*`, and `stcommon` order plus source
  provenance on appended controllers;
- focused TypeScript 7/build and repository boundary checks;
- a closeout report with the pinned source revision and explicit remaining
  boundaries.

## Outcome

The resolver now exposes `first-wins` and `ikemen-append` policies. The loader
selects the latter only for an explicit `ikemenversion`; negative states and
literal `+1` preserve the first state identity, merge later authored fields,
append later controllers, and retain source provenance. Duplicate identities
inside one source file remain non-appending.

## Evidence

- Resolver/loader/compiler compatibility focus: `91/91`.
- Full suite after implementation: `230/230` files, `2371/2371` tests.
- `pnpm typecheck`, `pnpm build`, `pnpm check:boundaries`,
  `pnpm check:redirect-boundary`, and `git diff --check` passed.

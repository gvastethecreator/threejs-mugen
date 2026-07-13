# Progress Report - TeamRoundDecision/v0

Date: 2026-07-13
Area: IKEMEN bounded runtime / team round ownership
Status: bounded read-model cut complete

## Delivered

- Added `RuntimeTeamRoundDecisionWorld/v0`.
- Added explicit `single`, `simul`, `tag`, and `turns` policy inputs.
- Separated actor KO, `overKo`, side defeat, winner side, and replacement
  required state.
- Kept `RoundNotOver` as a blocking outcome while retaining side facts.
- Excluded Helpers and invalid/duplicate actors with deterministic diagnostics.
- Exposed the read model through `RuntimeMatchRoundWorld` without changing the
  pair-owned round mutation.

## Verification

Focused tests: 2 files / 17 tests, including single KO, Tag continuation and
`LoseOnKO`, Turns replacement/no-replacement, empty-current-slot handling,
`RoundNotOver`, deterministic ordering, and diagnostics. Full verification: 195
files / 2009 tests,
TypeScript 7 typecheck, production build (274 modules; JS 1,707.70 kB / gzip
429.63 kB; existing large-chunk advisory), `qa:trace` 581/581 artifacts (547
required, 34 optional), module boundaries, and `git diff --check` all passed.

## Claim boundary

Allowed: deterministic read-only team decision facts for explicitly supplied
roots and policies.

Blocked: actual KO/handoff traces, roster replacement mutation, exact
Simul/Tag/Turns timing, lifebars/resources, score promotion, rollback, and full
MUGEN/IKEMEN round parity.

Visual smoke: N/A; no renderer, Studio, CSS, sprite, or visible snapshot
surface changed.

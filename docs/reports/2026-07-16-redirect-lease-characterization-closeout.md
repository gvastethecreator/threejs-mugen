# Redirect lease characterization closeout

Date: 2026-07-16
Wayfinder ticket: 237 / T10
Implementation commits: `f2e9521f`, `5088f6b8`, `e894c10e`

## Global status

| Area | Status | Evidence |
| --- | --- | --- |
| Four route observations | passed | Root active, root State -1, helper-to-root, and helper-to-helper traces are asserted |
| Candidate projection | passed | TargetSystem records deduplicated candidate ids without widening selection |
| Mutation projection | passed | Existing selected/mutated TargetSystem result remains visible |
| Writeback characterization | passed | Root direct set and helper wrapper commit set are distinct and labeled |
| Ownership and freshness context | passed | Caller, destination, state owner, and destination revision are recorded |
| Telemetry identity | passed | Monotonic `redirect:<root>:<sequence>` identity is assigned centrally |
| Focused runtime tests | passed | 4 files, `279/279` tests |
| TypeScript 7 | passed | `pnpm run typecheck` |
| Production build | passed | `pnpm run build`; existing large-chunk advisory remains |
| Diff hygiene | passed | Scoped `git diff --check` |

## Observed route facts

- Root active: `p1 -> p2`, revision `57:p2`, candidate/selected/mutated/direct
  writeback `p1`.
- Root State -1: `p2 -> p1`, revision `56:p1`, candidate/selected/mutated/direct
  writeback `p2`.
- Helper-to-root: `p1-helper-0 -> p2`, revision `57:p2`; the trace preserves
  the root candidate and the existing helper wrapper commit set.
- Helper-to-helper: `p1-helper-0 -> p2-helper-0`, revision `59:p2-helper-0`,
  candidates `[p1, p2, p1-helper-0]`, and wrapper writeback
  `[p2-helper-0, p1, p2, p1-helper-0]`.

## Implementation

`RuntimeTargetControllerDispatchSelection` now exposes `candidateTargetIds`.
`RuntimeCompatibilityTelemetryWorld` owns the redirect sequence and clones
candidate, selected, mutated, and writeback arrays into both the actor history
and compatibility session. Root adapters label direct writeback; helper
dispatch emits its trace after the existing `commitActor` loop and labels the
wrapper set.

## Claim ceiling

This closes the T10 characterization contract only. It does not prove a single
commit owner, actor-generation invalidation, typed failure diagnostics, stale
same-id rejection, recursive redirect support, rollback/netplay, external
engine parity, or full MUGEN/IKEMEN parity. ADR 0006 remains proposed.

## Next

Advance to T11: define the typed lease result, actor generation/freshness,
operation class, and attribution while preserving these four route traces.

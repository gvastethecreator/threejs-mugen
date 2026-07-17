# Redirect lease v1.1 closeout

Date: 2026-07-16
Wayfinder ticket: 238 / T11
Implementation commit: `7a5d0075`

## Global status

| Area | Status | Evidence |
| --- | --- | --- |
| Typed resolution result | passed | `resolveResult()` discriminates resolved and rejected outcomes |
| Failure diagnostics | passed | Invalid, missing, stale, and unsupported codes carry route attribution |
| Actor freshness | passed | Destination reference and generation callback are rechecked while lease is open |
| Same-id stale case | passed | Generation drift with the same destination object fails `isFresh()` and resolve |
| Unsupported destination | passed | Explicit unsupported resolver path plus helper TargetState fail-closed route |
| Operation attribution | passed | Target selection classifies resource, motion, binding, state, bind, and fallback |
| Four route continuity | passed | Existing root/helper trace assertions remain green with operation class |
| Focused runtime tests | passed | 4 files, `280/280` tests |
| TypeScript 7 | passed | `pnpm run typecheck` |
| Production build | passed | `pnpm run build`; existing large-chunk advisory remains |
| Diff hygiene | passed | Scoped `git diff --check` |

## Implementation

`RuntimeRedirectedTargetDispatchWorld.resolveResult()` owns the discriminated
resolution contract. `resolve()` delegates to it for compatibility. Leases now
carry `destinationGeneration`; adapters provide a revision token and a current
generation resolver, so both reference replacement and same-reference token
drift fail closed. `TargetSystem` adds `operationClass` to the existing
candidate/selection/mutation projection, and root/helper Playable adapters use
the typed result directly.

## Claim ceiling

This closes T11 at bounded v1.1 scope. It does not prove a single commit owner,
typed execute-time mutation results, actor-registry-owned generation, duplicate
writeback deletion, rollback/netplay, external engine parity, or full
MUGEN/IKEMEN parity. ADR 0006 remains proposed.

## Next

Advance to T12: migrate the four adapters to one revalidating commit owner,
remove duplicate writeback and telemetry policy, and audit every ADR 0006
acceptance bullet with focused traces and deletion evidence.

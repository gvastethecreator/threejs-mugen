# Entry 543 Closeout: Identity and Roster Redirection v0

## Result

Closed a bounded runtime/compiler slice for `partner`, `enemy`, indexed roster
redirection, `NumPartner`, `P3Name`, and `P4Name`. `EnemyNear` remains nearest
ordered; `Enemy` uses stable root-selection order; explicit `P2` reads continue
to use `p2CandidateIds` and fail closed when that selection is empty.

## Changes

- Extended `ExpressionContext` and evaluator redirect parsing with partner and
  enemy callbacks, dynamic non-negative indices, typed negative/invalid-index
  diagnostics, and fail-closed missing destinations.
- Extended compiler support scanning for the new redirects and the three
  identity triggers without classifying redirect keywords as unsupported
  identifiers.
- Mapped `RuntimeExpressionContextWorld` to `RuntimeRootSelection/v0` for
  stable partner/enemy rosters and P3/P4 names; factored redirect target
  projection so target, EnemyNear, Enemy, and Partner share geometry/identity
  data.
- Added a synthetic imported `Enemy` trace to the required trace registry.

## Verification

| Gate | Result |
| --- | --- |
| Focused compiler/evaluator/context/root tests | 4 files, 95 passed |
| New `Enemy` trace test | 1 passed |
| `pnpm typecheck` | passed |
| `node --check scripts/qa_traces.cjs` | passed |
| `pnpm qa:trace` | 601/601, 567 required, 34 optional, 0 failed, 0 skipped |
| Browser smoke | not run; no frontend surface changed |

## Claim boundary

The route is evidence-backed at bounded root-roster scope only. Exact active
partner counting, Simul/Tag transition choreography, P3-P8 lifecycle, helper or
neutral redirection, playerid, recursive redirect chains, input/combat/effect
ownership, and full MUGEN/IKEMEN parity remain open. No score movement.

## Commit

Implementation commit: `7daf7b46 feat(runtime): add bounded partner and enemy redirects`.

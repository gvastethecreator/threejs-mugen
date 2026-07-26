# Runtime/control batch closeout (DA26-15/17/22/23/27/29)

Date: 2026-07-26
Type: multi-slice implementation
Status: closed-bounded

## Closed in this batch

| ID | Deliverable | Claim allowed | Claim blocked |
| --- | --- | --- | --- |
| DA26-15 | `RuntimeTurnsTransaction/v1` prepare/validate/commit/restore + checksums | fault-injected restore + successful commit under unit fixtures | full Turns browser journey (DA26-16) |
| DA26-17 | `GlobalProjectileSchedule/v1` gather/sort/resolve/commit | stable order under insertion reverse | full plural combat oracle (DA26-18) |
| DA26-22 | `EvidenceSubject` + `RealPlaytestReadiness` | missing/current/stale/failed/runnable; rejects fixed-green | browser Studio wiring |
| DA26-23 | `ProjectAssetClosure/v1` | transitive used set; unused catalog does not block | full Studio release UI |
| DA26-27 | `ScannerCapabilityVector/v1` | five phases; no inference; select.def negative execution | full scanner product matrix |
| DA26-29 | `BoundaryManifest/v1` | required missing / allowlist total / forbidden hits fail closed | replacing legacy `check_boundaries` skip-missing behavior without migration |

## Still open (live next)

- **DA26-13** browser gate (primary product proof)
- DA26-16 Turns journey browser
- DA26-18 projectile/reversal/juggle plural oracle
- DA26-19 corpus v1.2
- DA26-20 second character
- DA26-21 score adjudication
- DA26-24/25/26 Studio snapshot/diff/journal
- DA26-28 second asset policy
- DA26-30 two-consumer core extraction

## Evidence

Unit suites under `src/tests/` for each module above. Scores unchanged.

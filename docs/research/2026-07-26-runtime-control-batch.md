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

## Still open after this batch (historical note)

At batch close: DA26-13/16/18/19/20/21/24–26/28/30 were still open. Entry 594
later closed 18/24/25/26/28/30. Live next after Entry 594: **DA26-13** browser,
then 16/19/20/21. See `docs/research/2026-07-26-studio-oracle-core-batch.md`.

## Evidence

Unit suites under `src/tests/` for each module above. Scores unchanged.

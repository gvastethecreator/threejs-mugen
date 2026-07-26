# Studio / oracle / core batch closeout (DA26-18/24/25/26/28/30)

Date: 2026-07-26  
Type: multi-slice implementation  
Status: closed-bounded

## Closed in this batch

| ID | Deliverable | Claim allowed | Claim blocked |
| --- | --- | --- | --- |
| DA26-18 | `PluralCombatOracle/v1` multi-cell matrix | projectile order/cancel/tie, hitpause, reversal attr, juggle cost/reset with stable checksum | browser plural combat oracle, exact Ikemen timing parity |
| DA26-24 | `StudioProjectSnapshot/v1` | save/list/reopen identity, integrity, legacy migrate, damage fail-closed | full IndexedDB product UI / quota product path |
| DA26-25 | `PackageAnalysisRevision/v1` + diff | add/remove/change/downgrade/upgrade between two fixed analyses | full Studio ZIP reanalysis product |
| DA26-26 | `SourceWriteJournal/v1` | intent→preimage→write→verify→commit; rollback; permission fail; reopen replay | browser File System Access permission product path |
| DA26-28 | `AssetReleasePolicy/v1` dual chains | seven-phase policy; two independent named chains | full Studio release UI / real binary transforms |
| DA26-30 | `CommonEvidenceFacts/v1` | core without app/MUGEN; two consumers equal canonical bytes | full graph deletion suite in CI product |

## Still open (live next)

- **DA26-13** browser gate (primary product proof)
- DA26-16 Turns journey browser
- DA26-19 corpus v1.2 (depends on browser + journey refresh)
- DA26-20 second character legal package
- DA26-21 score adjudication

## Evidence

Unit suites:

- `src/tests/PluralCombatOracle.test.ts`
- `src/tests/StudioProjectSnapshot.test.ts`
- `src/tests/PackageAnalysisRevision.test.ts`
- `src/tests/SourceWriteJournal.test.ts`
- `src/tests/AssetReleasePolicyV1.test.ts`
- `src/tests/CommonEvidenceFacts.test.ts`

Scores unchanged.

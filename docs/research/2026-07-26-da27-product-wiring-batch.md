# DA27 product wiring batch (01–05)

Date: 2026-07-26  
Type: multi-slice product depth  
Status: closed-bounded

## Why this series

DA26 closed modules under unit claim ceilings. Many were not on the product path.
DA27 wires them into Studio/storage/loader flows and deepens blocked dual-character work.

## Closed

| ID | Deliverable | Claim allowed | Claim blocked |
| --- | --- | --- | --- |
| DA27-01 | `ProjectSnapshotBridge` + save hook | project save writes reopenable `StudioProjectSnapshot` | full IndexedDB quota product UI |
| DA27-02 | `SourceWriteJournalBridge` + App receipt hook | receipts journal to durable entries; reopen replay | FS Access permission product matrix |
| DA27-03 | `EvidenceEnvelopeFactsBridge` | Studio envelope → `CommonEvidenceFacts` | replacing all Studio evidence panels |
| DA27-04 | `DualCharacterLegalJourney` | Nova+Mira load through import/walk/jump/hit/guard/ko | full browser dual combat matrix / complete SFF decode |
| DA27-05 | `PackageAnalysisRevisionBridge` | real PackageAnalysis → revision + diff | full Studio ZIP reanalysis product |

## Still open

1. **DA27-06** — global re-gate on current HEAD (typecheck/test/traces/build/boundaries)
2. DA27-07 — Turns browser HUD journey
3. DA27-08 — full `qa:smoke` attack/canvas matrix refresh
4. DA27-09 — Common.Fx audible + FightScreen browser depth

## Evidence

- Unit tests under `src/tests/*Bridge*.test.ts`, `DualCharacterLegalJourney.test.ts`
- App wiring: `ProjectStorage.saveStoredProjectManifest` snapshot side-effect; `App.recordStudioSourceWriteReceipt` journal side-effect
- Mira LICENSE.txt (CC0) added for dual legal claim

Scores unchanged. formal/global pins remain `7d9b15f8` until DA27-06.

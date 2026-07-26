# DA28-03 / DA28-04 / DA28-05 closeout

Date: 2026-07-26  
Status: closed  
Depends on: DA28-02 formal/global pin `32466c6e`

## DA28-03 browser subcursors

`BrowserSubcursor/v1` records bounded routes under the T342 visual/product
parent cursor. It does not replace T342.

| Route | Evidence | Notes |
| --- | --- | --- |
| da27-07-turns-hud | report + desktop screenshot | 0 console errors |
| da27-08-qa-smoke | report + desktop/mobile/studio shots | 0 console/page errors |
| da27-09-fightscreen | report + desktop screenshot | package + shell; no audio output claim |
| da26-13-runtime-shell | report + desktop/tablet/mobile | reduced-motion + skip-link parent |

Artifact: `docs/evidence/browser-subcursors-da28-03-v1.json`  
Script: `scripts/materialize_browser_subcursors_da28_03.cjs`

## DA28-04 compatibility corpus v1.2

Materializes SHA-256 digests for required control, browser, source, and native
snapshot evidence. Optional imported-package breadth is excluded. Tip-ahead of
the formal pin is recorded and does not fail the corpus.

Artifact: `docs/evidence/compatibility-corpus-v1.2.json`  
Script: `scripts/materialize_compatibility_corpus_v12.cjs`

## DA28-05 score adjudication

Adjudicates all six lanes as **hold** against the frozen scorecard using corpus,
subcursors, gate report, smoke, and source epoch evidence.

| Lane | Score | Decision |
| --- | --- | --- |
| sandbox | 65 | hold |
| mugenLite | 36 | hold |
| mugenMvp | 20 | hold |
| mugenFull | 10-12 | hold |
| ikemen | 6-8 | hold |
| studio | 25 | hold |

`movement=none`. Artifact: `docs/evidence/score-adjudication-v1.json`  
Script: `scripts/materialize_score_adjudication_da28_05.cjs`

## Claims

Allowed:

- P0 DA28-03…05 closed with material artifacts and SHA-256 digests
- T342 remains the broad visual/product parent
- Frozen scores held

Blocked:

- Score movement
- Import coverage from native fixtures
- Live projectile/Turns/gamepad product claims (DA28-06+)
- Replacing T342 from subcursors alone

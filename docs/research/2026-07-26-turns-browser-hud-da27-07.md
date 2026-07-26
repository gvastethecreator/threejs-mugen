# DA27-07 Turns browser HUD journey

Date: 2026-07-26  
Type: product depth  
Status: closed-bounded

## Deliverable

- `TurnsBrowserHudJourney/v1`: projects Turns snapshots into HUD facts; runs KO → handoff → stable fight
- App Match Setup: **Team mode** selector (`single` / `turns` / `tag`)
- URL `?teamMode=turns` rebuilds MatchWorld with ikemen-go + reserves + StateDef 5900 inject
- Round HUD: `data-team-mode`, Turns continuation strip, team lifebar slots
- Browser gate script: `scripts/qa_browser_gate_da27_07_turns.cjs`

## Evidence

| Check | Result |
| --- | --- |
| Unit `TurnsBrowserHudJourney.test.ts` | 3/3 passed |
| Browser select `teamMode=turns` | value `turns` |
| Team lifebar nodes | 2 |
| HUD panel + TURNS badge | present |
| Console errors | 0 |
| Screenshot SHA | `docs/evidence/da27-07-turns-browser/` |

## Claim allowed

- Named Turns HUD journey under unit + desktop browser shell
- Product path exposes team mode and team lifebar when Turns is selected

## Claim blocked

- Full multi-replacement browser combat matrix for every seat
- Pause coverage during handoff
- Score movement

## Next

DA27-08 full `qa:smoke` attack/canvas matrix.

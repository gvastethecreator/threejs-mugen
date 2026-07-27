# DA28-09 Turns browser matrix

Date: 2026-07-26  
Status: closed-bounded  
Depends on: DA28-08, DA28-03

## What landed

- `TurnsBrowserMatrix/v1` unit lanes: HUD KO→handoff, multi-replace side-1,
  both-sides replace, pause-hold checksum, fault restore, replay digest.
- Browser gate `scripts/qa_browser_gate_da28_09_turns.cjs`: desktop + mobile
  Turns route, reduced motion, tab focus, pause toggle, 0 console errors.

## Evidence

| Gate | Result |
| --- | --- |
| Unit `TurnsBrowserMatrix.test.ts` | passed |
| Browser matrix | passed — `docs/evidence/da28-09-turns-browser/` |

## Claim ceiling

Allowed: bounded multi-path Turns matrix + desktop/mobile shell.  
Blocked: full multi-replacement combat for every seat; score movement.

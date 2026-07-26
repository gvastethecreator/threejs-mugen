# DA27-09 Common.Fx audible + FightScreen browser depth

Date: 2026-07-26  
Type: product depth  
Status: closed-bounded

## Deliverable

- `CommonFxFightScreenProof/v1`: loads Sandbox FightScreen package, proves Common.Fx + FightFX animation libraries, unlocks WebAudio (fake in unit), plays fight/ko/round SND edges from FightFX archive
- Browser gate: HTTP package reachability + fight.def sound edges + runtime shell, 0 console errors
- Script: `scripts/qa_browser_gate_da27_09_fightscreen.cjs`

## Evidence

| Check | Result |
| --- | --- |
| Unit `CommonFxFightScreenProof.test.ts` | passed (played ≥ 1, edges fight/ko/round) |
| Package HTTP (fight.def/air/sff/snd/zip) | all ok |
| fight.def surfaces `fight.snd` / `ko.snd` / `round.default.snd` | present |
| Runtime match shell | ok |
| Console errors | 0 |

Artifacts: `docs/evidence/da27-09-fightscreen-browser/`

## Claim allowed

- Sandbox FightScreen Common.Fx/FightFX libraries load
- FightScreen/FightFX SND edges are audible through MugenAudioSystem play path
- Public package is browser-reachable with named sound surfaces

## Claim blocked

- Elecbyte motif visual parity
- Hardware audio device metering outside WebAudio diagnostics
- Score movement

## Next

DA27 ladder drained (`nextQueue` empty). Follow-on needs a new audit series or global re-gate.

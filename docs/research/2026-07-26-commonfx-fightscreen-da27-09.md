# DA27-09 Common.Fx dispatch + FightScreen browser depth

Date: 2026-07-26  
Type: product depth  
Status: closed-bounded

## Deliverable

- `CommonFxFightScreenProof/v1`: loads Sandbox FightScreen package, proves Common.Fx + FightFX animation libraries, unlocks a fake WebAudio context in unit scope, and dispatches fight/ko/round SND edges from the FightFX archive
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
- FightScreen/FightFX SND edges reach the `MugenAudioSystem` play path in the fake unit context
- Public package is browser-reachable with named sound surfaces

## Claim blocked

- Elecbyte motif visual parity
- Nonzero rendered or post-mix browser signal
- Live `AudioContext` output state and hardware audio
- A claim that a human heard the sound
- Score movement

## Next

DA27 ladder drained (`nextQueue` empty). Follow-on needs a new audit series or global re-gate.

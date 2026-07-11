# Choose next gap after IKEMEN helper-owned Pause

Type: research
Status: resolved
Blocked by: None

## Question

How should SuperPause `p2defmul` project from the current 1v1 target-memory bridge to every opposing-team character, and what exact fallback should `p2defmul = 0` use from `Super.TargetDefenceMul` configuration?

## Candidate Inputs

- Pinned IKEMEN GO opposing-team `superDefenseMulBuffer` loop.
- IKEMEN config/default source for `Super.TargetDefenceMul` and zero-value fallback.
- Current root/helper target-memory scaling and session restoration ledger.
- Future team roster abstraction versus current bounded 1v1 roster.

## Answer

Pinned IKEMEN GO initializes SuperPause defense from game-level `Super.TargetDefenceMul` (`1.5`), replaces it only with a positive authored `p2defmul`, and multiplies every opposing-team character's buffer. The runtime now gates that policy behind explicit `ikemen-go`, accepts a match-level config override, keeps temporary SuperPause scale separate from base defense, and applies it to the represented opposing root plus existing helpers without target memory. Required trace `synthetic-imported-ikemen-superpause-team-defense.json` passes at checksum `76873f0d` / final `b4425c66`; P2 and `p2-helper-0` expose `0.6667`, final P2 life is `950`. Full simul/tag topology and global config loading move to ticket 041.

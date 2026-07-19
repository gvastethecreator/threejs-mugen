# T292: Carry FightScreen display-skip flags

- Type: task
- Status: resolved at presentation-clock scope
- Date: 2026-07-18
- Entry: 566
- Depends on: T291

## Question

How should imported `SkipRoundDisplay` and `SkipFightDisplay` affect the new
announcement path without resetting runtime actors or pretending that the
screenpack assets are rendered?

## Answer

Treat both flags as typed global AssertSpecial capabilities. The match-round
world forwards the current actor aggregate into the announcement clock. A
skipped Round or Fight display becomes a persistent hidden presentation state;
the round timer and the rest of the fight loop continue to be owned by the
existing runtime. The HUD leaves the center message empty while a display is
skipped and keeps its machine-readable phase attribute.

The flags survive the existing intro-skip reset because they are recomputed
from actor state on every match-round tick, matching the source requirement
that the flags are preserved across the shutter reset frame.

## Claim ceiling

This proves typed flag transport and fallback presentation suppression only. It
does not prove exact `AnimTextSnd` completion, AIR/FNT/SFF rendering, dialogue,
source audio, motif/localcoord transforms, pause persistence, teams/Turns,
rollback/netplay, or full MUGEN/IKEMEN parity.

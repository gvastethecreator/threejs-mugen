# T291: Consume FightScreen announcement phases in HUD

- Type: task
- Status: resolved at fallback presentation scope
- Date: 2026-07-18
- Entry: 565
- Depends on: T290

## Question

Where can the new Round/Fight phase snapshot become visible without claiming
that FightScreen AIR/FNT assets or source audio are ported?

## Answer

Use the existing runtime HUD center as a bounded fallback consumer. When the
round is live and the announcement snapshot is visible, render `Round N` during
the Round phase and `Fight!` during the Fight phase. Preserve the old `round`
message for hidden, KO, time-over, inspector, and unsupported paths.

Add a stable `data-round-announcement-phase` attribute for browser probes and
debugging. Do not add a second overlay, replace screenpack assets, or infer
animation/audio parity from the text fallback.

## Claim ceiling

This proves snapshot-to-HUD visibility only. It does not prove exact
FightScreen AIR/FNT rendering, source sound timing, `SkipRoundDisplay`,
`SkipFightDisplay`, dialogue, motif/localcoord transforms, Common1/ZSS,
teams/Turns, rollback/netplay, or full parity.

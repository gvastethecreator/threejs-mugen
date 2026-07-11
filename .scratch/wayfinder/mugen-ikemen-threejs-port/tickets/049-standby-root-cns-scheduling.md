# Schedule standby roots in explicit IKEMEN CNS

Type: research
Status: open
Blocked by: None

## Question

What smallest scheduler contract admits P3-P8 roots to CNS preparation/execution while keeping input, effects, combat, round, presentation, and resources isolated, and how should same-tick TagIn/TagOut state changes invalidate selection?

## Required sources

- Pinned IKEMEN complete character action loop.
- Pinned TagIn/TagOut bytecode and standby mutation order.
- Current `RuntimeActorRunOrderWorld`, `MatchTickSchedule/v0`, root participation and selection diagnostics.

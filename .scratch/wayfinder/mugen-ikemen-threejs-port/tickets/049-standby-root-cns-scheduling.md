# Schedule standby roots in explicit IKEMEN CNS

Type: research
Status: resolved
Blocked by: None

## Question

What smallest scheduler contract admits P3-P8 roots to CNS preparation/execution while keeping input, effects, combat, round, presentation, and resources isolated, and how should same-tick TagIn/TagOut state changes invalidate selection?

## Required sources

- Pinned IKEMEN complete character action loop.
- Pinned TagIn/TagOut bytecode and standby mutation order.
- Current `RuntimeActorRunOrderWorld`, `MatchTickSchedule/v0`, root participation and selection diagnostics.

## Answer

Do not append reserves directly to `actorRunOrderCandidates`. Current root execution calls monolithic `advanceFighter`, which combines state clock, stun/move lifecycle, kinematics, animation, active controllers, recovery, effects, hit eligibility, and combat-facing state. First extract a named CNS execution boundary with explicit per-consumer capabilities and schedule evidence. Then include P3-P8 in IKEMEN actor preparation/run order through that boundary while their input/combat/round/presentation/effect-store flags stay false. Compile TagIn/TagOut only after same-tick selection invalidation can be proven after each root controller phase.

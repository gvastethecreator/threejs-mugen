# IKEMEN inert root construction

## Question

How can P3/P4 enter runtime ownership before any playable team subsystem consumes them?

## Answer

Pinned IKEMEN GO assigns root player numbers in interleaved side order up to four roots per side. Roots whose team side is inactive enter standby and are excluded from camera, collision, and enemy selection. The browser runtime can therefore construct standby roots and expose them through a separate snapshot channel before activating scheduling or presentation.

## Primary sources

- [IKEMEN GO MaxSimul and player-number limits](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L29-L31)
- [IKEMEN GO interleaved root ID assignment](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L2031-L2043)
- [IKEMEN GO inactive-root standby initialization](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L3565-L3573)

## Implementation decision

- Accept reserves only for explicit `ikemen-go`, capped at P8.
- Construct P3-P8 using side-local starts and explicit standby team state.
- Publish under `MugenSnapshot.reserveActors`, not playable `actors`.
- Include reserves in public actor registry/lifecycle/topology only.
- Recreate reserves on reset while preserving object identity.

## Uncertainty

Tag activation, active-root selection, reserve input/controllers, scheduling, effects, combat, round ownership, lifebar/presentation, and shared resources remain unimplemented.

# Post-KO and NoKOSlow research

Date: 2026-07-12
Source revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`

## Official behavior

- [Ikemen-GO round defaults](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go#L3164-L3168) define `slow.time = 60`, `slow.fadetime = 45`, and `slow.speed = 0.25`.
- [Ikemen-GO speed adjustment](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L2726-L2741) applies the base rate during KO slowdown, fades toward normal speed, skips the slowdown while `NoKOSlow` is asserted, and still consumes the slow-time counter.
- [Ikemen-GO flag persistence](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L2649-L2658) records that MUGEN only needs `NoKOSlow` on the first slowdown frame.
- Elecbyte MUGEN 1.1 documents `AssertSpecial NoKOSlow` as preventing end-of-round slow motion while asserted.

## Port decision

`RuntimeRoundSystem` separates a bounded 255-tick post-round clock (`over.waittime` 45 + `over.time` 210) from the 60-tick slowdown clock. Normal KO exposes rate `0.25` for the initial segment and linearly fades during the final 45 slowdown ticks. `NoKOSlow` is captured on the KO frame, keeps playback at `1`, and does not shorten either clock. Time-over retains immediate stop behavior. `TimerFreeze` affects the fight timer only; the post-round clock advances independently.

`RuntimePostRound/v0` exposes frame, post-round remaining/duration, slowdown remaining/duration, playback rate, and captured policy. Match stepping multiplies user speed by round playback rate. KO sound remains emitted once when KO is first detected.

## Limits

Exact Elecbyte render-frame interpolation, motif overrides, over.hittime/waittime/wintime, winpose/continue flow, post-KO input policy, pause layering beyond current timer behavior, teams, lifebars, audio echo timing, and full round parity remain blocked.

# Research: FightScreen announcement HUD fallback

Date: 2026-07-18
Question: What existing visible surface can consume bounded Round/Fight phase
state while asset-backed FightScreen rendering remains open?

## Decision

The existing `renderRoundHud()` center is the correct narrow consumer. It
already owns the live round message and timer, updates on runtime snapshots,
and is present on the playable match path. Use the phase snapshot only while
the round is live and visibility is `visible`:

- phase `round` -> `Round N`;
- phase `fight` -> `Fight!`;
- hidden/KO/time-over/inspector -> existing message path.

The stable `data-round-announcement-phase` attribute gives browser proof a
machine-readable observation without adding a parallel visual layer.

## Local evidence

- `src/app/App.ts:12798-12840` owns the existing match HUD center.
- `src/mugen/runtime/types.ts` now exposes `RuntimeRoundAnnouncement/v0`.
- `src/mugen/runtime/RuntimeRoundAnnouncementSystem.ts` marks completion
  `asset-owned`, so the HUD must not imply asset completion.

## Claim ceiling

The fallback is presentation evidence only. Exact FightScreen AIR/FNT assets,
source sound playback, global display skip flags, dialogue, motif/localcoord,
Common1/ZSS, teams/Turns, rollback/netplay, and full parity remain open.

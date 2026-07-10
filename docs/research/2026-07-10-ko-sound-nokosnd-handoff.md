# KO Sound and NoKOSnd Handoff

Date: 2026-07-10

## Question

How should the playable runtime emit and suppress the default KO sound?

## Primary source

Elecbyte's official State Controller Reference says `AssertSpecial nokosnd` suppresses sound `11,0` for knocked-out players. It also states that echoing KO sounds require the flag for 50 or more ticks after KO. AssertSpecial flags are deasserted each tick unless continuously asserted.

Source: https://www.elecbyte.com/mugendocs/sctrls.html

## Decision

- The first `ko` round transition emits common-bank `f:11,0` for each player whose life is zero.
- A double KO emits once for each defeated player.
- Time-over emits no KO sound.
- Tick-active global `nokosnd` on either player suppresses all automatic KO emissions.
- `RuntimeRoundSystem.over` prevents duplicate transition emission; browser snapshot deduplication remains a second guard.

## Evidence

- Focused round tests cover normal KO, double KO, time-over, and global suppression.
- Audio-event coverage verifies common `f:11,0` metadata.
- Required `synthetic-imported-round-ko.json` trace/final checksums are `bfd5f073` / `33b91196`.
- Full trace aggregate passes 524/524, with 493 required and 31 optional artifacts.

## Blocked claims

The sandbox stops active simulation when the round closes, so it does not yet implement a 50+ tick post-KO echo-suppression timeline. Exact KO slowdown, `NoKOSlow`, motif-configurable sound ownership, team/simul behavior, perceptual parity, and full round/audio parity remain open. No completion-score movement is warranted.

# Legal NoKOSlow Browser Route Research

Date: 2026-07-12
Wayfinder ticket: 115

## Question

What must a legal MUGEN-lite browser fixture prove to make a bounded `AssertSpecial NoKOSlow` claim without duplicating the existing synthetic trace route?

## Primary Source

- Elecbyte, [State Controller Reference: AssertSpecial](https://www.elecbyte.com/mugendocs-11b1/sctrls.html#assertspecial).

Elecbyte states that `AssertSpecial` flags are deasserted every game tick and must be asserted on every tick they are active. Its `nokoslow` flag keeps MUGEN from presenting the end of the round in slow motion.

## Local Facts

- `RuntimeRoundSystem` already owns a bounded post-KO timeline and records `noKoSlow` plus playback rate in `RuntimePostRound/v0`.
- `createSyntheticImportedRoundNoKoSlowTraceArtifact` already gates a synthetic imported route at playback rate `1`.
- The legal ZIP fixture currently proves nonlethal attack, fall, recovery, guard, and multi-frame AIR rendering, but has no lethal `NoKOSlow` browser route.

## Decision

Add a separate legal fixture action/state and command rather than changing the existing action `200`. The state will assert `NoKOSlow` before its lethal `HitDef`, preserving the prior journey contract and giving the browser smoke an independent physical input route.

## Scope Boundary

This cut does not claim exact MUGEN slowdown timing, motif/lifebar behavior, KO sound echoes, team behavior, win/continue flow, or full round parity.

## Result

- The legal fixture now exposes `finisher` command `z`, state/action `210`, a dedicated visible SFF frame, and a lethal `HitDef` preceded by tick-active `AssertSpecial NoKOSlow`.
- Required `mugen-lite-journey-nokoslow` passes with checksum `ceac9f37`, final checksum `1d5b25e4`, and `141` trace frames. It proves routed/executed state `210`, `AssertSpecial` / `ChangeState` / `HitDef`, active `finisher`, KO, post-round progress, and playback rate `1`.
- Production browser smoke drives `d -> z` against the demo CPU, captures imported state `210` with P2 life `0`, `noKoSlow`, and normal playback on desktop and mobile, then proves Reset restores the fight/life baseline.

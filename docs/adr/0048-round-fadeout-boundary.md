# ADR 0048: Bounded Imported Round Fade-out

Status: accepted bounded slice
Date: 2026-07-18
Implementation: `55e4eeca`

## Context

The imported `[Round]` timing bridge carried `over.time` but not the
fight-screen `fadeout` contract. That allowed a package with a fade longer than
`over.time` to terminate its local post-round window before the visible fade
could complete.

## Decision

`MugenFightScreenTiming` carries optional `fadeOutTime` and `fadeOutColor`.
`resolveRuntimeRoundTiming` uses `waittime + max(overTime, fadeOutTime)` when a
source-derived terminal timing is being normalized. An already normalized
explicit `postKoFrames` remains authoritative. `RuntimeRoundSystem` exposes an
additive `RuntimeRoundFade/v0` snapshot record with active state, local frame,
remaining frames, duration, opacity, and RGB color. `ThreeMugenRenderer`
renders that record as a final viewport overlay.

## Rejected scope

This does not implement fight-screen fade animation/sound assets, motif
ownership, exact `intro`/`roundOver` ordering, skip input, match-end dialogue,
Common1/ZSS release, teams/Turns, or full MUGEN/IKEMEN parity.

## Consequences

Imported packages can keep a bounded terminal fade visible, and the state is
available to trace/debug consumers without coupling the engine core to Three.js.
The overlay is intentionally a color/opacity adapter until the asset-backed
fight-screen presentation path exists.

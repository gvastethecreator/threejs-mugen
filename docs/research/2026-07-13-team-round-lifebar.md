# Research - TeamRoundLifebar/v0

Date: 2026-07-13
Status: source-backed bounded contract

## Question

What should the first team lifebar boundary expose without coupling HUD
layout to combat ownership, power resources, or automatic Turns continuation?

## Primary evidence

- [Elecbyte CNS reference](https://elecbyte.com/mugendocs/cns.html) describes
  life as the player's life bar and power as a separate bar. The local
  contract therefore carries normalized life and life maximum only; it does
  not fold power into team slot state.
- [Elecbyte trigger reference](https://www.elecbyte.com/mugendocs-11b1/trigger.html)
  exposes `TeamMode` and `TeamSide` as match context. The runtime uses the
  existing side/member ordering rather than inferring team membership from
  visual order.
- [Elecbyte State Controller reference](https://www.elecbyte.com/mugendocs/sctrls.html)
  defines `nobardisplay` as suppressing life/super bar display. The snapshot
  carries an explicit `visible` bit so a renderer or Studio surface can obey
  that policy without deleting diagnostic slot state.
- [Elecbyte AIR reference](https://www.elecbyte.com/mugendocs/air.html)
  confirms that AIR animations are also used by lifebars. This is evidence
  that a future motif renderer needs an asset/timeline owner; it is not a
  reason to encode motif sprites in this runtime read model.
- [Ikemen-GO release notes](https://github.com/ikemen-engine/Ikemen-GO/releases)
  record fixes for team-side lifebar variants and top-element switching in
  Tag mode. That upstream history is a warning against treating a pair of
  rectangles as full IKEMEN lifebar parity.

## Decision

`RuntimeTeamRoundLifebarWorld/v0` is a renderer-independent read model:

1. Each side owns a stable ordered `slots` list. The first ordered member is
   the `leader`; every later slot is a `member`.
2. Each slot reports `active`, `standby`, `ko`, or `disabled`, plus finite
   `life`, `lifeMax`, and a clamped `ratio`.
3. Each side reports plural `activeActorIds`; this avoids assuming that
   Simul/Tag can have only one active root.
4. `visible` is independent from slot facts and is false when the current
   global AssertSpecial projection contains `nobardisplay`.
5. The read model is emitted only for the bounded IKEMEN non-Single team
   modes currently represented by the runtime. It does not promote the
   pair-owned round scheduler or replace actor/resource ownership.

## Local evidence

- `src/mugen/runtime/RuntimeTeamRoundLifebarSystem.ts` owns ordering,
  normalization, state classification, and diagnostics.
- `src/mugen/runtime/PlayableMatchRuntime.ts` supplies actual actor life/max
  values and global bar visibility at the snapshot boundary.
- `src/mugen/runtime/RuntimeTrace.ts` and
  `src/mugen/runtime/RuntimeTraceArtifact.ts` preserve lifebar diagnostics in
  frame summaries outside the behavior checksum projection.
- `src/app/DebugPanel.ts` renders real max-life ratios and team slots without
  mixing power into the team lifebar contract.
- `src/tests/RuntimeTeamRoundLifebarSystem.test.ts`, `MatchWorld.test.ts`,
  `DebugPanel.test.ts`, and the required team handoff trace test cover the
  contract and its visible/evidence boundaries.

## Claim boundary

Allowed: deterministic team slot ordering, leader/member identity, active /
standby / KO / disabled status, per-actor life normalization, and
`NoBarDisplay` visibility projection.

Blocked: motif asset loading, AIR lifebar animation, red-life interpolation,
power/stun bars, shared life/power, team damage/resource sharing, exact Tag or
Turns lifebar switching, KO/time-over/win timers, portraits, screenpack
layout, renderer parity, rollback/netplay, and full MUGEN/IKEMEN parity.

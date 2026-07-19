# Research: Round no-damage window

Date: 2026-07-18  
Ticket: [T279](../../.scratch/wayfinder/mugen-ikemen-threejs-port/tickets/279-round-no-damage-window.md)

## Question

What does the official post-round `over.hittime` interval protect, and where
should the local Three.js runtime enforce it without confusing it with pause
defense or terminal playback?

## Primary sources

- [Pinned IKEMEN-GO `roundEnded` and `roundNoDamage`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L1652-L1659): damage is disabled after the hit cutoff and through the wait boundary.
- [Pinned IKEMEN-GO `roundState`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L1666-L1693): the wait boundary and phase-4 transition are separate round-state decisions.
- [Pinned IKEMEN-GO `stepRoundState`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L3114-L3268): post-round counters advance independently of the active fight timer and win-pose entry follows the later phase boundary.
- [Pinned IKEMEN-GO resource guards](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L8569-L8575): `lifeSet` does not mutate a living character while `roundNoDamage` is active; adjacent `dizzyPoints`, `guardPoints`, and `redLife` paths use the same guard in the pinned source.
- [Pinned IKEMEN-GO fight-screen defaults](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go#L3160-L3174): the default `over.hittime = 10` is distinct from `over.waittime = 45`.

## Local findings

- The loader already parsed `overHitTime` into `MugenFightScreenTiming`, but
  `RuntimeRoundTiming` ignored it and the interaction world continued to admit
  direct, priority, reversal, projectile, and helper combat during the close.
- `canActorBeHit` is a pause-defense contract. Reusing it for round closure
  would mislabel source round rejection as `SuperPause unhittable` and would
  not cover priority or root admission callbacks.
- `RuntimeMatchInteractionWorld` already owns the post-fighter order. It can
  gate only the combat/admission block while preserving effect lifecycle,
  target maintenance, collision separation, clamps, and presentation.
- The local round phase currently opens phase 4 at the configured wait frame.
  The internal no-damage predicate still preserves the official inclusive wait
  boundary; exact phase-label and frame-start parity remains a separate claim.

## Decision

Add a typed `overHitTimeFrames` field and a `RuntimeRoundSystem.roundNoDamage`
read model. Keep the resolved source value instead of clamping it to
`over.waittime`, so an inverted source interval is empty. Thread the boolean
through `RuntimeMatchPostFighterWorld` into `RuntimeMatchInteractionWorld` and
skip all combat admission/mutation callbacks while it is active. Do not add a
new snapshot field or trace checksum input for this internal read model.

This is deliberately narrower than claiming that every CNS resource write is
blocked. The next work item can add source-backed resource-controller guards
with their own owner/redirect evidence instead of hiding that gap behind the
combat gate.

## Claim ceiling

The local port now proves the bounded imported/default timing map, internal
round no-damage predicate, direct HitDef rejection during a time-over close,
and preserved presentation/maintenance behavior. It does not prove complete
MUGEN/IKEMEN resource suppression, exact tick order, release choreography,
screenpack ownership, or full parity.

## Verification

- Implementation: `daf0996b`, `25137c29`.
- Focal runtime/playable tests pass, including the imported time-over HitDef
  regression and the wait-boundary/inverted-window unit cases.
- TypeScript 7 typecheck and the final checkpoint are recorded in the T279
  closeout report.

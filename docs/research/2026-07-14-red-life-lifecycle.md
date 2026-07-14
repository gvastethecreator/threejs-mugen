# Research: Red-life Lifecycle Rebind

## Question

How should the imported root red-life bank behave at the two lifecycle edges
that Entry 513 intentionally left open: typed team handoff and match reset?

## Official boundary

IKEMEN config exposes `TeamLifeShare` as a match-level option and applies the
same value to both sides in `main.go`:
[main.go](https://github.com/ikemen-engine/Ikemen-GO/blob/master/src/main.go?plain=1).
The system owns per-side life-sharing flags in `system.go`:
[system.go](https://github.com/ikemen-engine/Ikemen-GO/blob/master/src/system.go?plain=1).
The character resource implementation keeps red-life distinct from life,
clears red-life when life reaches zero, and clamps positive red-life to the
current-life/life-max interval in `char.go`:
[char.go](https://github.com/ikemen-engine/Ikemen-GO/blob/master/src/char.go?plain=1).

## Decision

The root-only adapter keeps the bank topology stable when a typed handoff only
changes `standby`/`overKo` state. `PlayableMatchRuntime.applyTeamRoundHandoff`
now reconciles the red-life bank before returning, so the snapshot immediately
after the handoff is authoritative. A match reset calls the existing runtime
reset path, which rebuilds the bank from the representative root and mirrors
the value to shared roots. KO zeroing remains authoritative; this is not a
claim that a KO round can continue with a shared life pool.

## Evidence

`RuntimeRedLifeShareSystem` tests prove shared-value preservation across a
standby handoff and representative-root rebind on reset. Existing typed team
handoff trace coverage exercises the runtime handoff branch. The focused
lifecycle, handoff, and trace suites pass 588/588 tests. Full corpus,
TypeScript 7, build, and repository gates remain batched.

## Blocked

Exact multi-round persistence and round transition policy, native red-life
triggers, projectile/Explod/team-helper sharing, HUD red-life bars,
rollback/netplay, and full MUGEN/IKEMEN parity remain separate gates.

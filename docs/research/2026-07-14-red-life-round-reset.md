# Research: Exact Red-life Reset Between Rounds

## Question

How should a completed imported round create the next round without leaking
recoverable life or resetting match-level state as if the roster had been
reselected?

## Official Boundary

IKEMEN's match loop increments the round counters, restores life for the next
round, clears `redLife`, and carries selected resources/variables through its
round reset path. The authoritative implementation is in
[IKEMEN-GO `system.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/master/src/system.go?plain=1);
the actor-owned resource fields and reset behavior live in
[IKEMEN-GO `char.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/master/src/char.go?plain=1).
The project keeps this implementation boundary explicit because exact
screenpack/motif and match-over presentation are separate compatibility lanes.

## Decision

- `RuntimeRoundResourceResetSystem/v0` prepares a typed, deterministic resource
  handoff before the next round.
- Non-Turns roots restore life to `lifeMax`. A Turns winner keeps bounded
  surviving life, with a KO winner receiving the minimum value of `1`; the
  other roots restore to `lifeMax`.
- Power, guard points, and dizzy points carry forward within their authored
  maxima. Red-life is transient and always becomes `0`.
- `PlayableMatchRuntime.startNextRound()` refuses to apply before the post-KO
  window is complete, preserves `vars`/`fvars` and the global match tick, then
  rebuilds fighter state and team resource banks for the new numbered round.
- `MatchWorld.nextRound()`, the Runtime toolbar, command palette, and
  `RoundSnapshot.roundNo/roundsExisted` expose the transition. Initial-round
  snapshots omit the new fields so existing round-1 golden checksums remain
  stable.
- The required trace uses a real imported lethal HitDef, writes red-life before
  KO, consumes the post-KO window, starts round 2, and asserts final red-life
  is zero plus continuous tick scheduling.

## Evidence

- Dedicated resource/reset and round/trace focal suites pass 592 tests.
- The Playable runtime and full trace-preset focal suites pass 778 tests.
- TypeScript 7 typecheck passes.
- `pnpm qa:trace` passes 598/598 artifacts: 564 required and 34 optional.
- Production build passes with 284 transformed modules; the existing large
  JavaScript chunk warning remains.
- Boundary and CSS budget gates pass.
- Playwright smoke passes on desktop/mobile runtime and Studio. Evidence:
  `.scratch/qa/qa-smoke-round-redlife/diagnostics.json`.

## Blocked

This closes only the typed red-life/resource transition. Match-over scoring,
round-win counters, intro/KO/winpose state 5900 sequencing, screenpack/motif
timing, exact `copyVar` coverage for maps/remaps/dialogue, rollback/netplay,
native round triggers, and full MUGEN/IKEMEN parity remain open.

# Runtime Win-Pose Readiness Closeout

Date: 2026-07-18  
Ticket: Wayfinder 275  
Implementation commit: `dbb13813`  
Golden refresh commit: `61c10442`

## Result

The active normal/tag runtime now preserves a bounded phase-4 interval before
requesting reserved win, lose, or draw states. Phase `4` still opens at local
post-KO frame `45`; `RuntimeRoundWinPose/v0` requests `180`, `170`, or `175`
only at post-KO frame `90`, using the pinned default `over.wintime = 45` as a
bounded adaptation. The state remains unavailable when the required action is
missing, and Turns remains outside this handoff.

The delay does not move ownership of score projection, next-round commit,
`RoundNotOver` hold, or state availability. It is intentionally a caller-side
readiness guard, not a change to CNS parsing or generic state entry.

## Evidence

- Focused runtime proof passed: the reserved-state handoff and the phase-4
  `RoundNotOver` hold route passed (`2` targeted tests).
- `pnpm typecheck` passed.
- `git diff --check` passed before the documentation closeout.
- `pnpm test` passed `233` test files / `2456` tests when run alone.
- `pnpm build` passed with Vite `8.0.16`; the production bundle is
  `dist/assets/index-DALtC8Dx.js` at about `1,982.77 kB` and retains the
  existing large-chunk warning.
- `pnpm check:boundaries` passed.
- `pnpm check:redirect-boundary` passed.
- `pnpm qa:trace` passed `633/633` artifacts: `599` required and `34`
  optional. Controller families remained `92`; operation families remained
  `87`. The legal journey aggregate is `1f3d95f3`, with
  `mugen-lite-journey-nokoslow` at `3013c0b8`.
- Browser smoke is not applicable to this slice: it changes renderer-
  independent round timing and snapshot handoff only. The production build
  provides compilation evidence.

## Claim ceiling

This closes a bounded local readiness adaptation, not exact MUGEN/IKEMEN
timing. Exact frame-start ordering, parsed per-round `over.wintime`, skip-input
and force-win behavior, `over.forcewintime`, Common1/ZSS execution, time-over
state `175` choreography, motif/fade ownership, lifebars, team/Turns release,
rollback/netplay, Studio editing, and complete parity remain open.

## Global status

The match-end lane now has evidence for phase progression, reserved state
availability, deferred readiness, and an authored `RoundNotOver` hold in active
normal/tag flow. The next high-value cut is to make the timing source data
configurable and audit the release boundary independently, then connect
Common1/ZSS only through dedicated fixtures and trace gates.

## Sources

- [Elecbyte `AssertSpecial`](https://www.elecbyte.com/mugendocs-11b1/sctrls.html)
- [Pinned IKEMEN-GO `roundState`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L1666-L1683)
- [Pinned IKEMEN-GO `stepRoundState`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L3110-L3268)
- [Pinned IKEMEN-GO default round values](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go#L3160-L3174)

# Imported Fight-Screen Timing Closeout

Date: 2026-07-18  
Ticket: Wayfinder 277  
Implementation commit: `93e1429a`

## Result

Resolved `fight.def` `[Round]` values now have a typed path into the playable
runtime. `MugenSystemAssetsLoader` parses the numeric timing fields and keeps
the source path. Imported fighter definitions carry that record, and
`PlayableMatchRuntime` uses P1/P2 imported timing only when an explicit
`roundTiming` option is absent.

The adapter maps `over.waittime` to phase-4 opening, `over.wintime` to
win-pose readiness, and `over.waittime + over.time` to the terminal post-KO
window. `over.hittime` and `over.forcewintime` remain metadata, so the change
does not claim exact damage cutoffs or release choreography.

## Evidence

- Focused loader/import/runtime proof passed: `4` tests.
- `pnpm typecheck` passed.
- `git diff --check` passed before documentation staging.
- `pnpm test` passed `233` test files / `2459` tests when run alone.
- `pnpm build` passed with Vite `8.0.16`; the production bundle is
  `dist/assets/index-DrdF7i04.js` at about `1,985.15 kB` and retains the
  existing large-chunk warning.
- `pnpm check:boundaries` passed.
- `pnpm check:redirect-boundary` passed.
- `pnpm qa:trace` passed `633/633` artifacts: `599` required and `34`
  optional. Controller families remained `92`; operation families remained
  `87`. No default golden changed; `mugen-lite-journey-nokoslow` remains
  `3013c0b8`.

## Claim ceiling

This closes imported timing provenance and bounded mapping only. Parsed release
ownership, `over.hittime` damage cutoff, `over.forcewintime`, skip-input
behavior, Common1/ZSS, motif/fade choreography, time-over release, team/Turns
choreography, rollback/netplay, Studio authoring, and complete parity remain
open.

## Global status

The round lane now has one timing authority for defaults, explicit fixtures,
and imported `fight.def` data. The next frontier is release/time-over ownership
or Common1/ZSS execution, each behind independent source-backed evidence. This
ticket does not move the global compatibility score.

## Sources

- [Pinned IKEMEN-GO `roundState`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L1666-L1683)
- [Pinned IKEMEN-GO `stepRoundState`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L3110-L3268)
- [Pinned IKEMEN-GO fight-screen defaults](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go#L3160-L3174)

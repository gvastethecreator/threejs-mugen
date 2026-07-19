# Ticket 277: Imported fight-screen timing source

- Status: resolved bounded
- Date: 2026-07-18
- Scope: connect resolved `fight.def` `[Round]` values to the bounded runtime
  timing contract without taking ownership of release choreography
- Depends on: [T276](276-runtime-round-timing-configuration.md)
- Research: [`docs/research/2026-07-18-imported-fight-screen-timing.md`](../../../../docs/research/2026-07-18-imported-fight-screen-timing.md)

## Contract

1. Parse numeric `over.waittime`, `over.hittime`, `over.wintime`,
   `over.forcewintime`, `over.time`, `slow.time`, `slow.fadetime`, and
   `slow.speed` from the resolved `fight.def` `[Round]` section.
2. Preserve the source path and values in `MugenSystemAssets`, carry them into
   imported fighter definitions, and use them as the runtime timing source when
   no explicit `PlayableMatchRuntimeOptions.roundTiming` override exists.
3. Map `over.waittime`, `over.wintime`, and `over.time` into the shared phase-4,
   readiness, and terminal timing contract; preserve `over.forcewintime` and
   `over.hittime` as source metadata only.
4. Keep demo/default fighters, explicit runtime overrides, `RoundNotOver`,
   score projection, Turns, and renderer ownership unchanged.

## Evidence

- Implementation commit: `93e1429a`.
- Focused loader/import/runtime proof: `4` tests passed; `pnpm typecheck` and
  `git diff --check` passed.
- Broad checkpoint: `233` test files / `2459` tests, build, typecheck, both
  boundary checks, and `633/633` trace artifacts passed without golden refresh.

## Claim ceiling

Blocked: `over.forcewintime` release ownership, exact `over.hittime` damage
cutoff, frame-start order, skip-input behavior, Common1/ZSS, motif/fade,
time-over release, team/Turns choreography, rollback/netplay, and full parity.

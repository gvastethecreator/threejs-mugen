# Ticket 279: Round no-damage window

- Status: resolved bounded
- Date: 2026-07-18
- Scope: map `fight.def` `over.hittime` into the round timing contract and
  prevent late combat admission during the source-defined no-damage interval
- Depends on: [T278](278-timeover-draw-window.md)
- Research: [`docs/research/2026-07-18-round-no-damage-window.md`](../../../../docs/research/2026-07-18-round-no-damage-window.md)

## Contract

1. `RuntimeRoundTiming` carries `overHitTimeFrames` with the pinned IKEMEN
   default of `10`; imported `MugenFightScreenTiming.overHitTime` populates it
   when no explicit runtime override exists.
2. `RuntimeRoundSystem.roundNoDamage` is true only for a non-terminal KO or
   time-over close after the hit cutoff and through the resolved wait boundary.
   Values larger than `over.waittime` remain larger, producing an empty
   interval rather than an invented cutoff.
3. `RuntimeMatchInteractionWorld` keeps target/effect maintenance, body push,
   bindings, guard-distance latches, stage clamping, and presentation alive,
   while skipping hit admission, reversals, priority outcomes, direct HitDef
   commits, projectile/helper combat, and HitDef target commits during the
   interval. Projectile-vs-projectile cancellation remains effect maintenance.
4. The public imported runtime proves that a newly started HitDef state can
   advance during time-over without changing the defender's life.

## Evidence

- Implementation commits: `daf0996b`, `25137c29`.
- Focused runtime coverage: RuntimeRoundSystem, interaction, post-fighter,
  imported timing, and playable-runtime tests pass; the expanded focal block
  passed `287/287` assertions, with the corrected no-damage boundary covered
  by an additional selected run.
- `pnpm typecheck` passed with TypeScript `7.0.2` after the final boundary-only
  correction.
- `git diff --check` passed for the implementation files before each commit.

## Claim ceiling

Allowed: bounded local source mapping, internal no-damage state, and direct
interaction-gate behavior for the covered normal/time-over runtime paths.

Blocked: exact MUGEN/IKEMEN frame-start ordering, resource-controller blocking
for every active/helper owner, `over.forcewintime`, skip input, fade/motif/
dialogue release, Common1/ZSS ownership, score movement, rollback/netplay, and
full MUGEN/IKEMEN parity.

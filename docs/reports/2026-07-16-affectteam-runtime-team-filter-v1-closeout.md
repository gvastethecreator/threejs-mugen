# Wayfinder 210 closeout: AffectTeam runtime team filtering

Date: 2026-07-16
Commits: `12285ed7` selection, `8de2bb3a` implementation, `9b3f434b` owner identity hardening, `80e69138` bridge fixture alignment

## Delivered

- Added shared typed `MugenAffectTeam` and `MugenTeamSide` normalization for
  compiler and runtime boundaries.
- Carried HitDef `affectteam` and `teamside` through static imported moves and
  active HitDef dispatch.
- Applied policy to direct combat, tag-root admission, priority contact, and
  playable priority scheduling.
- Applied projectile policy to player contact, HitFlag P cancellation, and
  projectile-vs-projectile clashes, including same-owner behavior.
- Preserved the separate PlayerPush AffectTeam implementation and hardened
  effect-actor spawn identity so owner/root/parent IDs are not lost.

## Source authority

The contract follows official IKEMEN GO `char.go`, `compiler_functions.go`, and
the changed-controller documentation: omitted AffectTeam defaults to enemies;
explicit `E`, `B`, and `F` map to `1`, `0`, and `-1`; explicit TeamSide
overrides the owner-derived side; projectile clashes require both policies;
and HitFlag P uses the defending HitDef policy.

## Evidence

- Focused runtime/compiler coverage: `165/165`.
- Full suite: `216/216` files, `2273/2273` tests.
- TypeScript 7: `pnpm typecheck` passed.
- Production build: `pnpm build` passed; the existing large-chunk warning remains.
- Boundaries: `pnpm check:boundaries` passed.
- Trace QA: `pnpm qa:trace` passed `633/633`, `0` skipped.

## Claim ceiling

This closes the bounded typed team-filter contract for known `p1`-`p8`
identities. It does not claim exact proxy/helper identity behavior, neutral or
platform actor policy, every legacy owner exception, depth/cancel ordering,
rollback/netplay, score, renderer/audio parity, or full MUGEN/IKEMEN parity.

## Next residual

Select one independent source-backed residual, prioritizing exact projectile
owner/proxy and depth/order semantics before widening the claim surface.

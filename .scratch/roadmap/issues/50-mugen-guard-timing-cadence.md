# 50 - T465 M.U.G.E.N guard timing cadence

Status: closed-bounded
Labels: mugen-runtime, common1, guard, hitdef, timing
Lane: R1 KFM/Common1 precision
Priority: P1
Depends on: T464 CMD State -1 ChangeState persistent cadence

## Objective

Close the smallest source-backed guard-timing gap after T464: preserve the
authored `GetHitVar(slidetime)` / `GetHitVar(ctrltime)` values while advancing
the default runtime's remaining slide and control windows once per active game
tick. The default route stops guard slide velocity at the end of the slide
window and restores control at the end of the control window; imported Common1
guard states remain authoritative for those presentation controllers.

## Official contract

Elecbyte's M.U.G.E.N 1.1 controller reference defines `guard.slidetime` as the
guarded P2 slide duration, with a default of `guard.hittime`, and
`guard.ctrltime` as the time before control returns, with a default of
`guard.slidetime`. `airguard.ctrltime` defaults to `guard.ctrltime`. The trigger
reference exposes these authored values through `GetHitVar(slidetime)` and
`GetHitVar(ctrltime)` for Common1 state controllers.

Sources:

- https://www.elecbyte.com/mugendocs-11b1/sctrls.html
- https://elecbyte.com/mugendocs-11b1/trigger.html

## Scope

Direct and projectile guard contacts, runtime stun scheduling, normal
non-pause ticks, and reset paths (normal hit, hit override, reversal, intro
skip). Out of scope: new Common1 state authoring, air-state selection,
hitpause scheduling changes, guard-distance policy, exact friction parity, and
full M.U.G.E.N/Ikemen compatibility.

## Acceptance

- Runtime state has separate remaining slide/control counters; authored
  `guardSlideTime` / `guardControlTime` remain stable for `GetHitVar`.
- Counters clamp at zero and are cleared by normal hit/override/reversal/intro
  reset paths.
- Default runtime stops horizontal guard slide when the remaining slide window
  expires and restores `ctrl` when the control window expires.
- Imported authored guard states keep Common1 in charge of velocity/control
  presentation.
- Focused stun/combat tests pass, typecheck/boundaries pass, and roadmap/docs
  record the bounded claim without changing compatibility scores.

## Final evidence (2026-08-01)

- Runtime boundary: `RuntimeStunSystem` counts down separate remaining
  windows, clamps at zero, stops default slide, restores default control, and
  preserves imported guard presentation. Direct/projectile contacts seed the
  windows; hit/override/reversal/intro reset paths clear them.
- Focused guard/stun/projectile/override/reversal suite: 5 files, 102 tests
  passed. Full suite: 324 files, 3289 tests passed.
- `pnpm typecheck`, `pnpm build`, `pnpm check:boundaries`, `git diff --check`,
  and `pnpm qa:trace` passed. Trace corpus remains 682/682 with existing
  checksums; no new trace checksum is claimed because remaining counters are
  intentionally omitted from the legacy trace snapshot contract.
- UI smoke is N/A: no visible surface changed.

Claim ceiling: this task does not claim exact Common1 state timing, air guard
parity, hitpause behavior, generic VM scheduling, or broad M.U.G.E.N/Ikemen
compatibility.

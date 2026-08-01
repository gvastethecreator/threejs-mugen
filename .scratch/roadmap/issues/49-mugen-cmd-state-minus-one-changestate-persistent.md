# 49 - T464 M.U.G.E.N CMD State -1 ChangeState persistent cadence

Status: closed-bounded
Labels: mugen-runtime, cns, cmd, state-entry, persistent, changestate
Lane: R1 shared controller VM
Priority: P1
Depends on: T463 imported CMD State -1 ChangeState persistent zero

## Objective

Extend the bounded imported CMD State -1 static `ChangeState` route to
`persistent = 2`: count trigger-passing scans rather than elapsed ticks and
preserve the counter through destination/current-state transitions.

## Scope

Imported raw CMD/CNS, State -1 static `ChangeState`, ordinary playable root,
normal non-pause scans, constant interval two. Out of scope: other intervals,
failed-value activation order, pause, helpers, custom owners, dynamic values,
ZSS, generic controller scheduling, and parity.

## Acceptance

- CC0 loader fixture with sparse `StageTime = 1, 3, 4` triggers.
- Routes on the first and third trigger-passing scans at ticks 1/4; tick 3 is
  skipped.
- Counter survives both `0 -> 200 -> 201 -> 0` state chains.
- Reuses the isolated T437 State -1 positive map only for static destinations.
- Focused test, required trace, full gates, docs, and bounded claim.

## Final evidence (2026-08-01)

- Fixture: `src/mugen/runtime/MugenCnsStateMinusOneChangeStatePersistentFixture.ts`.
- Focused regression: positive/zero ChangeState fixtures plus the named route
  boundary pass.
- Required trace: `mugen-cns-state-minus-one-changestate-persistent`, checksum
  `3681fafa`, in `pnpm qa:trace` 682/682 artifacts (648 required, 34 optional).
- Full gates: 324 files / 3287 tests, `pnpm typecheck`, `pnpm build`,
  `pnpm check:boundaries`, and `git diff --check` pass. The build retains the
  existing large-chunk advisory. UI smoke is N/A because no visible surface
  changed.

Claim ceiling remains imported CMD State -1 static `ChangeState` with
constant `persistent = 2` in an ordinary playable root. Other intervals,
failed destination resolution, pause, helpers, custom owners, dynamic values,
ZSS, exact scheduling, and general M.U.G.E.N/Ikemen compatibility remain
blocked.

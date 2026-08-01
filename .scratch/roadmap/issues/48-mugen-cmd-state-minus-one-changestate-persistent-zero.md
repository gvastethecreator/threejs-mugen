# 48 - T463 M.U.G.E.N CMD State -1 ChangeState persistent zero

Status: closed-bounded
Labels: mugen-runtime, cns, cmd, state-entry, persistent, changestate
Lane: R1 shared controller VM
Priority: P1
Depends on: T438 imported CMD State -1 persistent zero setup route

## Objective

Extend the bounded imported CMD State -1 route to raw `ChangeState` with
`persistent = 0`: the controller may route its ordinary playable root once,
and its marker must survive every resulting current-state transition.

## Scope

Imported raw CMD/CNS, State -1 `ChangeState`, ordinary playable root, normal
non-pause scans, static state value. Out of scope: positive intervals,
failed-value activation order, pause, helpers, custom owners, dynamic values,
ZSS, generic controller scheduling, and parity.

## Acceptance

- CC0 loader fixture with sparse `StageTime` triggers and `persistent = 0`.
- One State -1 route at tick 1 through the same-tick `0 -> 200 -> 201` chain.
- No State -1 reroute at later eligible ticks after the runtime returns to 0.
- T438's actor/controller-local State -1 zero marker is reused before value
  resolution; normal-state and other special-state maps remain separate.
- Focused test, required trace, full gates, docs, and bounded claim.

## Final evidence (2026-08-01)

- Fixture: `src/mugen/runtime/MugenCnsStateMinusOneChangeStatePersistentZeroFixture.ts`.
- Runtime boundary: `RuntimeStateEntryRouteWorld` admits an optional persistence
  hook after triggers and before destination resolution; `PlayableMatchRuntime`
  binds only raw, owner-local, non-custom State -1 zero controllers.
- Focused regression: 4 files / 12 tests pass across the new route, route
  ordering, and adjacent T437/T438 fixtures.
- Required trace: `mugen-cns-state-minus-one-changestate-persistent-zero`,
  checksum `88931500`, in `pnpm qa:trace` 681/681 artifacts (647 required,
  34 optional).
- Full gates: 323 files / 3285 tests, `pnpm typecheck`, `pnpm build`,
  `pnpm check:boundaries`, and `git diff --check` pass. The build retains the
  existing large-chunk advisory. UI smoke is N/A because no visible surface
  changed.

Claim ceiling remains the imported CMD State -1 static `ChangeState` raw
`persistent = 0` ordinary-root route. Positive intervals, failed destination
resolution, pause, helpers, custom owners, dynamic values, ZSS, exact tick
parity, and general M.U.G.E.N/Ikemen compatibility remain blocked.

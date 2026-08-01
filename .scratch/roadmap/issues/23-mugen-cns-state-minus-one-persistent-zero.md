# 23 - T438 M.U.G.E.N CNS State -1 persistent zero

Status: closed-bounded
Labels: mugen-runtime, cns, cmd, state-entry, persistent, controller-scheduler
Lane: R1 shared controller VM
Priority: P1
Depends on: T437 imported CMD State -1 persistent positive route

## Objective

Extend the bounded imported CMD State -1 setup seam to raw `persistent = 0`:
the named setup controller fires once per actor/controller lifecycle, survives
current-state changes, and does not alter the existing normal-root zero marker.

## Scope

Imported raw CMD/CNS, State -1 setup `VarSet`, ordinary playable root, normal
non-pause scans. Out of scope: State -1 ChangeState, pause, helpers, custom
owners, dynamic values, ZSS, and generic VM timing.

## Acceptance

- CC0 fixture with sparse StageTime triggers and `persistent = 0`.
- One VarSet at first eligible trigger only, including after `0 -> 200`.
- Separate actor/controller-local zero map; current-state entry does not clear it.
- Focused test, required trace, full gates, docs and bounded claim.

## Final evidence (2026-07-30)

- Fixture: `src/mugen/runtime/MugenCnsStateMinusOnePersistentZeroFixture.ts`.
- Focused regression: `MugenCnsStateMinusOnePersistentZeroFixture.test.ts`;
  13 selected tests pass with the adjacent State -1 routes.
- Required trace: `mugen-cns-state-minus-one-persistent-zero`, checksum
  `27e1ffb7`, in `pnpm qa:trace` 680/680 (646 required, 34 optional).
- Full gates: 321 files / 3280 tests, `pnpm typecheck`, `pnpm build`,
  `node scripts/check_boundaries.cjs` and `git diff --check` pass.

Claim ceiling remains the imported CMD State -1 setup `VarSet` raw
`persistent = 0` ordinary-scan route; State -1 ChangeState, pause, helpers,
custom owners, dynamic values, ZSS and generic VM timing remain blocked.

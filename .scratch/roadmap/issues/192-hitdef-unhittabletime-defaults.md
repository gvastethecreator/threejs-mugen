# Issue 192 — HitDef unhittabletime defaults

- Status: `closed-bounded`
- Lane: `R2 direct combat/runtime semantics`
- Priority: `P1`

## Objective

Derive the official omitted-`unhittabletime` values for root/Helper throw
HitDef and root ReversalDef without changing explicit authored pairs.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` computes `extra` as attacker pause
time plus one. An omitted ReversalDef assigns `extra` only to component one.
An omitted throw HitDef assigns `extra` to both components. Ordinary HitDef
keeps both components disabled at `-1`.

Source symbols:

- `src/compiler_functions.go`: `hitDefSub` `unhittabletime`
- `src/char.go`: `HitDef.reset`
- `src/char.go`: `HitDef.setDefaults`

## Port ledger

| Item | Decision |
| --- | --- |
| Ordinary omitted HitDef | keep `[-1, -1]` |
| Omitted throw HitDef | derive `[pausetime + 1, pausetime + 1]` |
| Omitted root ReversalDef | derive `[-1, pausetime + 1]` |
| Explicit authored pair | preserve authored values |
| Helper throw HitDef | resolve the same default in Helper-owned move state |

## Acceptance fixture

- Prove root and Helper throw HitDef derive both components.
- Prove root ReversalDef derives only the receiver component.
- Prove ordinary HitDef remains disabled.
- Prove explicit zero, negative, and positive pairs override the default.
- Prove derived values reach accepted-contact timers.

## Claim ceiling

Do not claim random same-priority throw arbitration, HitOverride redirects,
Helper ReversalDef, ModifyPlayer, Projectile breadth, exact pause tick order,
rollback, or full HitDef priority parity.

## Verification

- Focused HitDef, ReversalDef, and Helper coverage: `100/100`.
- Isolated required default-window trace check: pass.
- Full suite: `3469/3527`; the same 58 inherited character-package failures remain.
- Typecheck and production build pass; Vite transforms 361 modules.
- Runtime traces: `692/692` (`658` required, `34` optional).
- Required trace `synthetic-imported-hitdef-default-unhittabletime`: checksum `913ff8ea`.
- Boundary, redirect-boundary, and diff-hygiene checks pass.

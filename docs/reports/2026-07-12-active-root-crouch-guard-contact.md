# Active-root Crouch Guard Contact Report

Date: 2026-07-12
Area: IKEMEN active-root direct combat

## Delivered

- Added a fixture-only imported Common1-style guard-start block for `120`: held back plus down emits `StateTypeSet` C, then routes `120 -> 131`.
- The new required Tag trace keeps P2 guardable but out of contact, establishes P4 as P3's prior direct `InGuardDist` source, and delays P4 physical overlap until after the crouch guard-start route.
- Existing root admission and generic direct combat remain unchanged: they admit only `p4 -> p3`, classify the `MA` contact as `guard`, retain target/contact ownership, and choose P3's existing crouch guard-hit state `152`.
- P3 finishes C / `152` with `guarding = true` and life `1000`; P4 records target id `123`.

## Evidence

- Required trace: `synthetic-imported-ikemen-active-root-crouch-guard.json`.
- Trace checksum: `9aac9d7d`; final checksum: `82f0d463`.
- Three frames prove P3 first receives P4 direct guard distance, executes `StateTypeSet` C in `120`, completes `120 -> 131`, and only then receives P4's delayed direct contact.
- Ordered trace stamps prove P4's delayed `PosSet` and P3's `ChangeState` complete before post-fighter root admission. The trace records one `guard`, no `hit`, `override`, or `reversal`, and exact P4 target provenance.
- Full suite: `183` files / `1946` tests passed.
- Trace QA: `571/571` artifacts passed, `540` required.
- `pnpm typecheck` and `pnpm check:boundaries` passed.
- `pnpm build` passed; Vite retains the existing `1,661.99 kB` JavaScript chunk advisory.

## Claim Allowed

One normal-tick direct active-root crouch guard contact through the existing generic StateTypeSet, root admission, direct combat, target/contact memory, and default guard-state ownership.

## Claim Blocked

High/low rejection matrices, air guard, projectile/helper contact, target precedence, Pause/hitpause, guard sound/spark/renderer effects, custom-state or forceguard variants, team replacement/KO, HUD/resources, rollback, score movement, and full MUGEN/IKEMEN parity.

## Audit

- Independent runtime audit found no P1/P2 findings.
- The audit confirmed that `controllerEvents` sequence evidence is actor-local and therefore not used to establish cross-actor order; the required `tickSchedule` phase-stamp gate correctly proves `P4 fighter:controllers -> P3 fighter:controllers -> post-fighter:hit-admission`.
- P2 remains outside admitted contact decisions, while P3 starts C in `120` and resolves C guard state `152`.

## Global Status

- Playable sandbox: unchanged.
- MUGEN compatibility: unchanged.
- IKEMEN runtime: active-root guard coverage now has required standing and crouch direct-contact traces after the prior no-contact scheduling trace.
- Studio/editor: unchanged.
- Modular boundary: existing generic admission/combat ownership remains intact; fixture-only Common1-style state selection is the new proof seam.

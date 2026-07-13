# Active-root Direct Guard Contact Report

Date: 2026-07-12
Area: IKEMEN active-root direct combat

## Delivered

- Synthetic `activeRootHitDefRoute` can now move an active root on a later tick without changing runtime admission or combat ownership.
- The required fixture keeps P2 guardable but out of range, lets P4 establish P3's prior direct `InGuardDist` latch, and observes P3 in imported automatic guard state `120` before P4's delayed-overlap tick.
- Existing root admission selects only `p4 -> p3`; the existing generic direct resolver classifies the contact as `guard` and keeps current target/contact/default-guard ownership.
- P3 enters default guard state `150` with `guarding = true` and zero-chip life `1000`; P4 records target id `120` against P3.

## Evidence

- Required trace: `synthetic-imported-ikemen-active-root-direct-guard.json`.
- Trace checksum: `202b9838`; final checksum: `140ed77e`.
- Three frames prove P3 first observes P4 direct guard distance and is visible in state `120` before the delayed-overlap tick. On that tick P4's delayed `PosSet` runs before P3's `120 -> 130` controller, while deterministic phase stamps prove both controller phases finish before post-fighter admission and combat; P3 then blocks P4.
- Root admission records exactly `p4 -> p3`; trace reasons include one `guard` and no `hit`, `override`, or `reversal` outcome for the contact.
- Focused trace suite: `569/569` passed.
- Full suite: `183` files / `1945` tests passed.
- Trace QA: `570/570` artifacts passed, `539` required.
- `pnpm typecheck` and `pnpm check:boundaries` passed.
- `pnpm build` passed; Vite retains the existing `1,661.99 kB` JavaScript chunk advisory.

## Claim Allowed

One normal-tick direct active-root guarded HitDef contact through current generic root admission, direct combat, target/contact memory, and default guard-state ownership.

## Claim Blocked

Projectile/helper contact, plural target precedence, Pause/hitpause, guard sound/spark/renderer effects, custom-state or forceguard variants, team replacement/KO, HUD/resources, rollback, score movement, and full MUGEN/IKEMEN parity.

## Audit

- Self-audit corrected an over-strong ordering sentence: P4's position mutation precedes P3's `120 -> 130` controller on the delayed-overlap tick; admission and combat, not the raw position mutation, occur after both controllers.
- Independent runtime review initially found this as P2 evidence drift. The trace gate now requires tick-three controller evidence plus an ordered phase-stamp sequence `P4 fighter:controllers -> P3 fighter:controllers -> post-fighter:hit-admission`.
- Independent re-audit found no current P1/P2 findings after the repair; the focused trace suite passed `569/569`.

## Global Status

- Playable sandbox: unchanged.
- MUGEN compatibility: unchanged.
- IKEMEN runtime: active-root automatic guard now has one required direct guarded-contact trace after the prior no-contact scheduling trace.
- Studio/editor: unchanged.
- Modular boundary: existing admission/combat ownership remains intact; fixture-only delayed positioning is the new proof seam.

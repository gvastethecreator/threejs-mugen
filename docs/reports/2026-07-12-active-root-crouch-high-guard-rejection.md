# Active-root Crouch High Guard Rejection Report

Date: 2026-07-12
Area: IKEMEN active-root direct combat

## Delivered

- Added the fixture-only `activeRootHitDefRoute.guardFlag` parameter, preserving `MA` as its default and letting an active-root CNS HitDef author `H`.
- The required Tag trace keeps P2 guardable but out of contact, observes P4 as P3's direct latch while P3 is S, then drives held back plus down through imported `120` `StateTypeSet` C and `120 -> 131`.
- After P3 becomes C, P4 high-only eligibility is absent from the current guard-distance snapshot. Delayed P4 physical overlap still reaches existing root admission and generic direct combat.
- P4 -> P3 resolves as one `hit`, not guard; P4 records target id `126`; P3 remains C in state `131` with `moveType = H`, `guarding = false`, and life `963`.

## Evidence

- Required trace: `synthetic-imported-ikemen-active-root-crouch-high-guard-reject.json`.
- Trace checksum: `935e6e6d`; final checksum: `20bea107`.
- Three frames prove S latch -> C `StateTypeSet` -> `120 -> 131` -> delayed P4 `PosSet` -> post-fighter admission -> direct hit.
- Ordered phase stamps prove P4 controller phase precedes P3 on the contact tick and both complete before root admission. The trace records one `hit`, no `guard`, `override`, or `reversal`, and exact P4 target provenance.
- Full suite: `183` files / `1947` tests passed.
- Trace QA: `572/572` artifacts passed, `541` required.
- `pnpm typecheck` and `pnpm check:boundaries` passed.
- `pnpm build` passed; Vite retains the existing `1,661.99 kB` JavaScript chunk advisory.

## Claim Allowed

One normal-tick direct high-only active-root contact can reject a C defender through the existing fixture StateTypeSet, root admission, direct combat, and target/contact ownership.

## Claim Blocked

Low-only, standing, air, complete high/low matrix behavior, automatic-guard eligibility, projectile/helper contact, target precedence, Pause/hitpause, guard sound/spark/renderer effects, custom-state or forceguard variants, team replacement/KO, HUD/resources, rollback, score movement, and full MUGEN/IKEMEN parity.

## Audit

- Independent runtime audit found no P1/P2 findings.
- It verified that the fixture emits `guardflag = H` into imported CNS, and that P3 follows S direct latch -> `120` / `StateTypeSet` C -> `131` before P4 delayed `PosSet`, root admission, and one 37-damage hit.
- P2 is `no-contact` on all three trace frames; no guard, override, or reversal outcome appears.

## Global Status

- Playable sandbox: unchanged.
- MUGEN compatibility: unchanged.
- IKEMEN runtime: active-root guard coverage now includes direct standing guard, crouch guard, and one high-only rejection against C state.
- Studio/editor: unchanged.
- Modular boundary: generic root admission and combat remain intact; the fixture's authored guard flag is the new proof seam.

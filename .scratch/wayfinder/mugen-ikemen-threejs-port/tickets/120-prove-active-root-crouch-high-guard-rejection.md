# Prove Active-root Crouch High-guard Rejection

Type: implementation
Status: resolved
Blocked by: None

## Goal

Prove one explicit IKEMEN Tag active-motion root that holds back plus down and reaches imported C guard state cannot guard a delayed opposing active-root HitDef authored with high-only `guardflag = H`.

## Acceptance

- Preserve the closed active-root standing and crouch `MA` guard-contact traces, Pair/Single behavior, root admission ordering, priority, HitOverride, and reversal gates.
- Keep P2 guardable but out of range while P4 remains P3's only direct guard-distance source.
- Make P3's prior direct P4 latch observable while P3 is S, then route through imported `120` `StateTypeSet` C and `120 -> 131` before delayed P4 overlap.
- Make P4's active-root CNS author `guardflag = H`, admit only P4 -> P3, and prove generic direct combat resolves `hit`, not `guard`, `override`, or `reversal` despite held back plus down.
- Prove exact P4 target/contact provenance, P3 C-state hit metadata, and expected life loss without changing generic admission or combat logic.
- Keep low-only, air, standing counterpart, guard-start eligibility, high/low matrix breadth, projectiles/helpers, custom state, forceguard, target precedence, Pause/hitpause, presentation, team lifecycle, scores, rollback, and full MUGEN/IKEMEN parity outside this cut.

## Research Input

- `docs/research/2026-07-12-ikemen-active-root-crouch-high-guard-rejection.md`

## Claim Ceiling

Allowed: one normal-tick active-root C-state high-only direct HitDef rejection through the existing generic root admission and direct combat resolver.

Blocked: exhaustive high/low behavior, low-only, standing, air, automatic-guard eligibility, projectiles/helpers, custom state, target precedence, Pause/hitpause, presentation, team lifecycle, scores, rollback, and full MUGEN/IKEMEN parity.

## Outcome

`activeRootHitDefRoute.guardFlag` now writes an authored CNS guard flag and defaults to the established `MA`. The required fixture sets P4 to `H`, while P3 first observes P4 direct guard distance as S, then held back plus down reaches imported `120` `StateTypeSet` C and `120 -> 131`. The H threat is absent from the current C latch snapshot; P4 delayed `PosSet` and P3 controller nonetheless complete before existing root admission. Existing admission records only `p4 -> p3`, and existing direct combat records a normal hit rather than guard, P4 target id `126`, P3 C `131`, `moveType = H`, `guarding = false`, and life `963`.

Required `synthetic-imported-ikemen-active-root-crouch-high-guard-reject` passes with trace checksum `935e6e6d` / final checksum `20bea107`. Verification: full `183` files / `1947` tests, `pnpm qa:trace` `572/572` artifacts (`541` required), TypeScript typecheck, module boundaries, and production build. Browser smoke is N/A because no visual surface changed. Independent audit found no P1/P2 findings, confirmed H is emitted by the fixture and reaches imported CNS, and confirmed P2 is `no-contact` on all three frames.

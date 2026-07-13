# Prove Active-root Direct Guard Contact

Type: implementation
Status: resolved
Blocked by: None

## Goal

Prove one explicit IKEMEN Tag active-motion root can turn the existing prior direct `InGuardDist` observation into a real guarded direct HitDef contact against an opposing active root through the already actor-generic resolver.

## Acceptance

- Preserve Pair/Single direct guard behavior, root admission ordering, priority, HitOverride, and reversal gates.
- Keep P2 guardable but out of range while P4 supplies P3's first direct plural guard-distance latch.
- Move P4 into physical overlap only after P3 receives the prior latch; prove the following normal tick runs P4's delayed position and P3's imported guard-start controller before root admission.
- Prove P4 -> P3 is admitted, resolves as `guard`, records target/contact provenance, applies P3 guard state/metadata, and does not reduce P3 life for the default zero-chip fixture.
- Keep projectiles/helpers, custom-state guard variants, broad team contact ordering, Pause/hitpause, and renderer/audio parity outside this cut.

## Research Input

- `docs/research/2026-07-12-ikemen-active-root-direct-guard-contact.md`

## Claim Ceiling

Allowed: one normal-tick direct physical active-root guard contact through existing generic combat, target/contact, and default guard-state ownership.

Blocked: projectile/helper guard contact, guard effects/sounds/presentation parity, guard variant selection, custom-state/forceguard breadth, plural target precedence, pause/hitpause, team KO/replacement, HUD/resources, rollback, scores, and full MUGEN/IKEMEN parity.

## Outcome

`activeRootHitDefRoute` now supports a fixture-only delayed X `PosSet`. The required trace starts P2 guardable but far, keeps P4 in P3 direct guard distance without contact, and observes P3 in state `120` from the prior latch. On tick three P4's delayed position controller runs before P3's `120 -> 130` controller, but both complete before post-fighter admission; the direct physical overlap is therefore admitted only after the guard-start route. The existing root admission admits only `p4 -> p3`; the existing generic direct resolver records one `guard`, P4 target id `120`, P3 default guard state `150`, `guarding = true`, and P3 life `1000` with zero chip damage.

Required `synthetic-imported-ikemen-active-root-direct-guard` passes with trace checksum `202b9838` / final checksum `140ed77e`. Verification: focused trace `569/569`, full `183` files / `1945` tests, `pnpm qa:trace` `570/570` artifacts (`539` required), TypeScript typecheck, module boundaries, and production build. Browser smoke is N/A because no visual surface changed.

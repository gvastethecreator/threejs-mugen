# Prove Active-root Crouch Guard Contact

Type: implementation
Status: resolved
Blocked by: None

## Goal

Prove one explicit IKEMEN Tag active-motion root can carry its prior direct guard-distance latch through the imported crouch guard-start route and resolve one delayed opposing root HitDef as a crouch guard without widening root admission or direct combat ownership.

## Acceptance

- Preserve the closed active-root standing guard contact, Pair/Single behavior, root admission ordering, priority, HitOverride, and reversal gates.
- Keep P2 guardable but out of range while P4 is the only direct P3 guard-distance source.
- Route P3 side input through held back plus held down, enter imported state `120`, choose the Common1-style crouch guard state `131`, and only then admit the delayed P4 physical overlap.
- Prove P4 -> P3 resolves as `guard`, chooses P3's crouch default guard-hit state `152`, preserves zero-chip P3 life, and records current target/contact provenance.
- Keep air guard, high/low rejection variants, projectiles/helpers, custom states, forceguard, broad target precedence, Pause/hitpause, renderer/audio effects, team KO/replacement, HUD/resources, rollback, and full parity outside this cut.

## Research Input

- `docs/research/2026-07-12-ikemen-active-root-crouch-guard-contact.md`

## Claim Ceiling

Allowed: one normal-tick direct active-root crouch guard contact through the existing generic root admission, direct combat, Common1-style state selection, target/contact, and default guard-state ownership.

Blocked: high/low rejection breadth, air guard, forced guard variants, projectiles/helpers, custom state, target precedence, Pause/hitpause, presentation, team lifecycle, scores, rollback, and full MUGEN/IKEMEN parity.

## Outcome

The fixture introduces only a Common1-style `120` branch: held back plus down emits typed `StateTypeSet` C and changes to `131`. P2 remains guardable but far; P4 alone establishes P3's prior direct latch and moves into overlap at `Time >= 2`. On tick three P4 `PosSet` precedes P3 `120 -> 131`, while both controller phases finish before existing root admission. Existing admission records only `p4 -> p3`; existing direct combat accepts `guardflag = MA` against P3 C state, records P4 target id `123`, and selects P3 crouch guard-hit state `152` with `guarding = true` and zero-chip life `1000`.

Required `synthetic-imported-ikemen-active-root-crouch-guard` passes with trace checksum `9aac9d7d` / final checksum `82f0d463`. Verification: full `183` files / `1946` tests, `pnpm qa:trace` `571/571` artifacts (`540` required), TypeScript typecheck, module boundaries, and production build. Browser smoke is N/A because no visual surface changed. Independent audit found no P1/P2 findings and confirmed cross-actor order is correctly gated through `tickSchedule`, not actor-local controller-event order.

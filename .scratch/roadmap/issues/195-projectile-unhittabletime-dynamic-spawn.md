# Issue 195 — Dynamic Projectile unhittabletime spawn

- Status: `closed-bounded`
- Lane: `R2 projectile compiler/runtime semantics`
- Priority: `P1`

## Objective

Retain one- or two-component Projectile `unhittabletime` expressions in typed
IR and resolve them in the active root or Helper caller context at spawn.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` compiles Projectile HitDef
`unhittabletime` through the shared two-integer HitDef bytecode parameter. One
authored component changes component zero and leaves the default receiver
component unchanged. The current official `modifyProjectile.Run` switch has no
`hitDef_unhittabletime` case, so this slice does not invent live mutation.

Source symbols:

- `src/compiler_functions.go`: `projectileSub` and HitDef `unhittabletime`
- `src/bytecode.go`: `hitDef_unhittabletime` evaluation
- `src/bytecode.go`: `modifyProjectile.Run` supported mutation switch

## Port ledger

| Item | Decision |
| --- | --- |
| Typed Projectile IR | retain one or two static/dynamic integer expressions |
| Root spawn | evaluate in active root caller/opponent/state-owner context |
| Helper spawn | evaluate in Helper-local caller/parent/root/opponent context |
| One component | normalize to `[value, -1]` |
| Invalid expression | fail closed without inventing a timer pair |
| ModifyProjectile | remain unsupported for this field, matching pinned switch |

## Acceptance fixture

- Prove typed IR retains static and dynamic expressions.
- Prove root variables resolve the pair at spawn.
- Prove Helper-local variables resolve the pair at spawn.
- Prove one component preserves receiver default `-1`.
- Prove the resolved receiver component drives the existing T620 contact gate.

## Claim ceiling

Do not claim ModifyProjectile mutation, arbitrary Projectile dynamic fields,
cross-owner expression breadth, exact tick/pause order, rollback, or full
Projectile bytecode parity.

## Verification

- Focused compiler/runtime/trace coverage: 969/969 passed.
- Full suite: 3479/3537 passed; the same 58 inherited character-package failures remain.
- Typecheck and production build pass; Vite transforms 361 modules.
- Trace corpus: 695/695 passed, 661 required and 34 optional.
- Required trace: `synthetic-imported-projectile-dynamic-unhittabletime`, checksum `ec9bacaa`.
- Boundaries, redirected-dispatch boundary, and diff hygiene pass.

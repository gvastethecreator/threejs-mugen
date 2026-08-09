# Issue 197 — ModifyHitDef grounded friction

- Status: `closed-bounded`
- Lane: `R2 HitDef compiler/runtime semantics`
- Priority: `P1`

## Objective

Port `stand.friction` and `crouch.friction` through `ModifyHitDef` so an active
normal HitDef can replace either receiver get-hit friction value before
contact.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` compiles `ModifyHitDef` through the
shared `hitDefSub` parameter table. `hitDef.runSub` evaluates both scalar float
fields against the active caller and mutates the current HitDef. Accepted
contact later copies those values into the receiver get-hit state.

Source symbols:

- `src/compiler_functions.go`: `modifyHitDef` reuses `hitDefSub`
- `src/bytecode.go`: `hitDef_stand_friction` and `hitDef_crouch_friction`
- `src/char.go`: accepted-contact storage and grounded get-hit consumption

## Port ledger

| Item | Decision |
| --- | --- |
| Typed ModifyHitDef IR | retain optional static/dynamic scalar expressions |
| Root dispatch | resolve against the active caller or `RedirectID` target context |
| Live mutation | replace each supplied finite value independently |
| Omitted or invalid | leave the active HitDef unchanged |
| Contact consumer | reuse T622 receiver GetHitVar and grounded physics path |

## Acceptance fixture

- Prove typed IR accepts static and dynamic values and rejects malformed input.
- Prove root and redirected root contexts resolve their own variables.
- Prove each value mutates independently without clearing the other.
- Prove missing active HitDef remains fail closed.
- Prove later accepted contact and get-hit movement consume the changed value.

## Claim ceiling

Do not claim Helper-owned `ModifyHitDef`, Projectile or ModifyProjectile
mutation, air/lying friction, exact corner-push coupling, rollback, or full
HitDef physics parity.

## Verification

- Focused compiler/runtime coverage: 166/166 passing.
- Isolated real `RedirectID` consumer: 1/1 passing.
- Full suite: 3483/3541, with the same 58 inherited missing-package failures.
- Typecheck, 361-module production build, 696/696 traces, boundaries,
  redirect-boundary, and diff hygiene pass.

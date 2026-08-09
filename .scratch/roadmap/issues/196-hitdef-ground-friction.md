# Issue 196 — HitDef grounded friction

- Status: `closed-bounded`
- Lane: `R2 HitDef compiler/runtime semantics`
- Priority: `P1`

## Objective

Port HitDef `stand.friction` and `crouch.friction` through root and Helper
HitDef, Projectile spawn, accepted contact storage, and grounded get-hit
movement.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` compiles both fields as one float.
Accepted contact copies them into the receiver get-hit state. Grounded get-hit
movement uses the authored value when present and otherwise falls back to the
receiver character movement constant.

Source symbols:

- `src/compiler_functions.go`: HitDef `stand.friction` and `crouch.friction`
- `src/bytecode.go`: `hitDef_stand_friction` and `hitDef_crouch_friction`
- `src/char.go`: accepted-contact storage and `getStandFriction` / `getCrouchFriction`

## Port ledger

| Item | Decision |
| --- | --- |
| Typed HitDef IR | retain optional static/dynamic float expressions |
| Root and Helper HitDef | evaluate in the active caller context |
| Projectile spawn | evaluate in root or Helper caller context |
| Accepted hit storage | copy authored values to receiver get-hit metadata |
| Grounded movement | use authored stand/crouch friction only while in get-hit state |
| Omitted or invalid | preserve receiver character movement defaults |

## Acceptance fixture

- Prove typed IR retains static and dynamic values.
- Prove root and Helper HitDef resolve their own variables.
- Prove root and Helper Projectile spawn resolve their own variables.
- Prove accepted hit stores each value on the receiver.
- Prove stand and crouch get-hit movement consume the stored value.
- Prove omitted and invalid values use the existing character defaults.

## Claim ceiling

Do not claim ModifyHitDef or ModifyProjectile mutation, air/lying friction,
exact corner-push coupling, pause-order parity, rollback, or full HitDef
physics parity.

## Verification

- Focused compiler/runtime/trace coverage: `1114/1114`.
- Full suite: `3483/3541`; the same 58 inherited failures still reference the removed legacy character packages and stale roster expectations.
- `pnpm typecheck`: pass.
- `pnpm build`: pass, 361 modules.
- `pnpm qa:trace`: `696/696`, including `662` required and `34` optional artifacts.
- Required trace `synthetic-imported-projectile-ground-friction`: checksum `25618613`; final-frame checksum `8e1b2405`; 22 frames.
- Boundary, redirected-target boundary, and diff checks: pass.

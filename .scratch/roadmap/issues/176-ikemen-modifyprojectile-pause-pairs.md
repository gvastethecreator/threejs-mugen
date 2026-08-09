# Issue 176 — Ikemen ModifyProjectile pause pairs

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Port both values of `ModifyProjectile pausetime` and `guard.pausetime`.
The first value controls Projectile hit pause. The second value controls the
defender hit-shake time.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` compiles each parameter as one or
two integer expressions. `ModifyProjectile` writes zero to an omitted second
value. On contact, the Projectile consumes the first value and the defender
consumes the second value. A missing guard pair inherits the normal pause pair
during HitDef default resolution.

Source symbols:

- `src/compiler_functions.go`: `projectileSub`
- `src/bytecode.go`: `hitDef_pausetime` and `hitDef_guard_pausetime`
- `src/char.go`: `Projectile.hitpause` and get-hit variable assignment

## Port ledger

| Item | Decision |
| --- | --- |
| One-value and two-value integer compilation | copied |
| Omitted second ModifyProjectile value becomes zero | copied |
| Selected live Projectile pair replacement | copied |
| First value freezes the Projectile | adapted to the local effect world |
| Second value drives defender hit pause and `GetHitVar(hitshaketime)` | adapted to the local combat result |
| Projectile owner remains outside Projectile contact hit pause | copied |
| WinMugen one-frame Projectile correction | omitted from this cut |

## Acceptance fixture

- Compile one-value and two-value static pairs.
- Resolve bounded dynamic root and helper pairs.
- Mutate only selected live Projectiles.
- Freeze the Projectile for the first hit or guard value.
- Apply the second value to the defender and `GetHitVar(hitshaketime)`.
- Keep the Projectile owner outside the contact hit pause.

## Claim ceiling

Do not claim WinMugen one-frame correction, exact contact tick order,
HitOverride pause parity, rollback serialization, or full Projectile parity.

## Verification

- Focused runtime/compiler tests: `281/281` passed.
- Isolated Playable root consumer: `1/1` passed.
- Full suite: `3423/3481` passed with the same 58 inherited failures.
- `pnpm typecheck`, `pnpm build`, `pnpm qa:trace`, boundaries, and redirect
  boundary passed.
- Trace corpus: `686/686` artifacts passed (`652` required, `34` optional).

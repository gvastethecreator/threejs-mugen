# T696 — Projectile `guard.hittime` dinámico

Status: closed-bounded (2026-08-09)

## Scope

Cerrar la evaluación de `guard.hittime` en Projectiles frescos creados por un
controller root o por un Helper. La expresión se resuelve una vez en el
caller original y alimenta el timing de guardia ya existente. No se reabre
`ModifyProjectile` ni los timers hermanos.

## Upstream contract

- M.U.G.E.N 1.1 documenta `guard.hittime` como parámetro entero de HitDef y
  Projectile hereda todos los parámetros de HitDef.
- Ikemen GO pin `149402f` compila `guard.hittime` como expresión entera,
  evalúa el parámetro en el caller y finaliza el fallback desde
  `ground.hittime` cuando está omitido.
- El port adapta el contrato con `guardHitTimeExpression`, resolución root o
  Helper una vez por spawn y truncado finito antes de `guardStun`.

## Evidence

- Required root trace:
  `synthetic-imported-projectile-dynamic-guard-hittime` — trace checksum
  `8fcfa764`, final checksum `1217ab52`.
- Required Helper trace:
  `synthetic-imported-helper-projectile-dynamic-guard-hittime` — trace
  checksum `aa2462b7`, final checksum `a94faad0`.
- `pnpm qa:trace`: `773/773` artifacts (`739` required, `34` optional),
  `0` failures.
- Full `pnpm test`: `3802/3802` tests across `328` files.
- `pnpm run typecheck`, `pnpm build`, and both required trace tests pass;
  the build transforms `363` modules.

## Claim boundary

Included: fresh root/Helper Projectile `guard.hittime` expressions, caller
context, accepted guard contact, `GetHitVar(hittime)`, target/lifecycle and
Helper/root/parent ownership evidence.

Excluded: fresh-default policy changes, live `ModifyProjectile`, guard
slide/control and air/down timers, exact countdown/tick phase,
negative/overflow parity, teams, rollback, and full Projectile timing parity.

## Next queue

T697 maps the next unclaimed Projectile timing seam against the pinned source;
live mutation remains unsupported until its upstream switch and local seam are
proven independently.

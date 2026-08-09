# T695 — Projectile `ground.hittime` dinámico

Status: closed-bounded (2026-08-09)

## Scope

Cerrar la evaluación de `ground.hittime` en Projectiles frescos creados por un
controller root o por un Helper, conservando el contexto del caller original.
El contrato no cambia el fallback local cuando el parámetro está omitido ni
reabre la mutación de Projectiles vivos.

## Upstream contract

- M.U.G.E.N 1.1 documenta `ground.hittime` como parámetro entero de HitDef y
  Projectile hereda los parámetros de HitDef.
- Ikemen GO pin `149402f` compila `ground.hittime` como expresión entera,
  evalúa cada Projectile en el caller y lo expone al receptor mediante
  `GetHitVar(hittime)`.
- El port adapta ese contrato a una expresión typed, resolución root/Helper
  una vez al spawn y truncado finito antes del timer existente.

## Evidence

- Required root trace:
  `synthetic-imported-projectile-dynamic-ground-hittime` — trace checksum
  `0445dd30`, final checksum `b6489c11`.
- Required Helper trace:
  `synthetic-imported-helper-projectile-dynamic-ground-hittime` — trace
  checksum `bf4326b5`, final checksum `219a4ec4`.
- `pnpm qa:trace`: `771/771` artifacts (`737` required, `34` optional),
  `0` failures.
- Focused compiler/runtime/Helper coverage and both trace tests pass; final
  full-suite counts and build gates are recorded in the roadmap cursor.

## Claim boundary

Included: fresh root/Helper Projectile `ground.hittime` expressions, caller
context, accepted grounded contact, `GetHitVar(hittime)`, target/lifecycle and
Helper parent evidence.

Excluded: fresh default changes, live `ModifyProjectile`, air/guard/down
timers, exact countdown/tick phase, negative/overflow parity, teams, rollback,
and full Projectile timing parity.

## Next queue

T696 maps the next unclaimed Projectile timing seam against the pinned source;
live mutation remains unsupported until its upstream switch and local seam are
proven independently.

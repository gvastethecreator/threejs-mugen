# Issue 327 — `AttackMulSet guardpoints` dinámico

Status: closed-bounded  
Slice: T753  
Date: 2026-08-12

## Resultado

`AttackMulSet` conserva un multiplicador separado para `guardpoints`. Los
literales se tipan en IR y las expresiones finitas se resuelven una sola vez
en el contexto del actor caller. El contacto directo aceptado usa ese valor
para escalar el daño de guard-points sin mezclarlo con los multiplicadores de
daño o dizzy ya existentes.

## Fuente de paridad

- El pin local de Ikemen GO define un cuarto multiplicador de `attackmulset`
  para guard-points en `bytecode.go` y lo aplica al `HitDef guardpoints` en el
  contacto de guardia de `char.go`.
- El corte local mantiene el valor authored negativo como daño al recurso y
  limita la aplicación a la ruta de guardia directa ya existente.

## Evidencia

- Required trace: `synthetic-imported-dynamic-attack-guardpoints-golden`,
  trace checksum `5a4b2841`, final checksum `90fe9bf9`.
- La traza exige `VarSet -> AttackMulSet -> HitDef -> guard`,
  `GetHitVar(guardpoints)=-20`, multiplicador caller `var(0) * fvar(0)=0.5`,
  P2 life `995` y guard-points `990`.
- Focal compiler/runtime/combat coverage y `pnpm run typecheck` pasan.

## Claim permitido

`AttackMulSet guardpoints` static/dynamic para el actor root en un contacto
directo de guardia aceptado, con telemetría typed y expresión finita caller.

## Fuera de alcance

Projectile/Helper ownership de este multiplicador, valores omitidos y
defaults, `NoGuardPointsDamage`, clamp/rounding exacto del recurso, sentinela
int32/overflow, equipos, rollback, multi-target y paridad completa M.U.G.E.N /
Ikemen.

## Commits

- Producto: `1eb17d85`.
- Evidencia: `ee000f97`.
- Documentación/roadmap: commit posterior de T753.

## Gate agregado

La traza T753 pasa de forma independiente. El agregado `pnpm qa:trace` se
mantiene condicionado por el caso heredado
`synthetic-imported-helper-bind-to-target-redirect`, que carece del target
link `ownerId=p2, actorId=p1, targetId=77`; ese fallo no pertenece a T753.

# Issue 326 — Projectile `guardpoints` dinámico en contexto caller

Status: closed-bounded  
Slice: T752  
Date: 2026-08-12

## Resultado

`Projectile guardpoints` conserva el literal y la expresión tipada en IR. En
la creación del Projectile la expresión se evalúa una sola vez en el contexto
del caller original, tanto para un Projectile raíz como para el Projectile
creado por un Helper. El valor finito llega al contacto aceptado y a
`GetHitVar(guardpoints)` sin modificar el recurso de guardia del defensor.

## Fuente de paridad

- El pin local de Ikemen reutiliza `hitDefSub` para Projectile, por lo que
  `guardpoints` es un entero evaluado por el caller antes de materializar el
  HitDef del Projectile.
- M.U.G.E.N 1.1 define que Projectile hereda los parámetros de HitDef.

## Evidencia

- Root: `synthetic-imported-projectile-dynamic-guardpoints`, trace checksum
  `e369c409`, final checksum `90b185ad`.
- Helper-parented: `synthetic-imported-helper-projectile-dynamic-guardpoints`,
  trace checksum `76244e57`, final checksum `c5cb237b`.
- Ambas trazas exigen `VarSet -> Projectile -> contacto aceptado ->
  GetHitVar(guardpoints)=19`, lifecycle y enlaces de target.

## Claim permitido

Projectile fresco, root y Helper de primera generación, con expresión entera
finita en caller context y lectura de metadata tras contacto aceptado.

## Fuera de alcance

Defaults/reset omitidos, `ModifyProjectile`, sentinela/int32 y overflow,
clamp de recursos, equipos, rollback, todos los targets y paridad completa de
Projectile.

## Commits

- Producto: `025bd5a0`.
- Evidencia: `09282387`, `6f04259b`.
- Documentación/roadmap: commit posterior de T752.

## Gate agregado

`pnpm qa:trace` genera ambas trazas como `passed`, pero el proceso global
termina bloqueado por el caso heredado
`synthetic-imported-helper-bind-to-target-redirect` (falta el target link
`ownerId=p2, actorId=p1, targetId=77`). Ese fallo no pertenece a T752.

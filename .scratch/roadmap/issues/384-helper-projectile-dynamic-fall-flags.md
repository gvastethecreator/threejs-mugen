# Issue 384 — Helper Projectile dynamic fall flags

## Estado

- **T809 — active (2026-08-15)**
- **Área:** Projectile fresco creado por un Helper de primera generación,
  propiedad de root, política de caída y metadata de contacto
- **Dependencia:** T808 resuelve el mismo payload para Projectiles creados por
  root; T807 cierra recuperación dinámica del Projectile creado por Helper.

## Objetivo

Resolver `fall`, `air.fall` y `fall.kill` al crear un Projectile fresco desde
un Helper. Cada flag se evalúa una vez en el caller context del Helper; el
Projectile conserva la propiedad root y el contacto aceptado reutiliza
`HitFall` y sus consumidores existentes.

## Fuente y alcance

- M.U.G.E.N 1.1 documenta los tres parámetros en HitDef/Projectile; los
  Projectiles creados por Helper pasan a root.
- Ikemen-GO pin `149402f` compila los tres como booleanos de HitDef, los
  evalúa en caller context y reutiliza el sub-bloque HitDef al crear
  Projectiles.
- Este corte cubre sólo un Helper de primera generación con Projectile
  root-owned. Helpers anidados, `ownProjectile`, ModifyProjectile,
  ModifyHitDef, `forcenofall`, timing exacto de caída/KO, equipos, rollback y
  paridad total quedan fuera.

## Criterios de cierre

- El adaptador Helper entrega los tres flags typed al spawn ya cerrado por
  T808 sin afectar caminos root ni estáticos.
- Cada flag se resuelve finitamente e independientemente en caller context del
  Helper; un valor no finito no borra hermanos finitos.
- Una prueba de actor cubre la topología `owner/root = p1`,
  `parent = p1-helper-0` y la política resuelta.
- Una traza importada requerida cubre Helper → Projectile → contacto de caída
  y evidencia de ciclo de vida/target dual.
- El cierre actualiza roadmap, pasa los gates aplicables y queda en commits
  lógicos separados.

## Claim permitido

Un Projectile fresco creado por un Helper de primera generación resuelve
`fall`, `air.fall` y `fall.kill` finitos en caller context del Helper, conserva
root ownership y los consume sólo en su contacto de caída aceptado.

## Bloqueado

Helpers anidados, `ownProjectile`, selección aérea observable de `air.fall`,
ModifyProjectile, ModifyHitDef, `forcenofall`, sintaxis `n`, cálculo exacto de
caída/KO/recuperación, equipos, rollback y paridad M.U.G.E.N/Ikemen completa.

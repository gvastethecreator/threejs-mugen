# Issue 383 — Root Projectile dynamic fall flags

## Estado

- **T808 — active (2026-08-15)**
- **Área:** Projectile fresco creado por root, política de caída y metadata de
  contacto
- **Dependencia:** T806 materializa recuperación de caída dinámica para el
  mismo spawn; T807 cierra la variante Helper por separado.

## Objetivo

Resolver `fall`, `air.fall` y `fall.kill` al crear un Projectile fresco desde
root. Cada valor se evalúa una vez en caller context del Projectile. El
contacto aceptado debe conservar la política resuelta en `HitFall` y sus
consumidores existentes.

## Fuente y alcance

- M.U.G.E.N 1.1 documenta `fall`, `air.fall` y `fall.kill`; Projectile hereda
  los parámetros de HitDef.
- Ikemen-GO pin `149402f` compila los tres como booleanos de HitDef, los evalúa
  en el caller y comparte `hitDefSub` al crear Projectiles.
- Este corte cubre sólo un Projectile fresco creado por root. Helper, anidado,
  `ownProjectile`, ModifyProjectile, ModifyHitDef, `forcenofall`, timing
  exacto de caída/KO, equipos, rollback y paridad total quedan fuera.

## Criterios de cierre

- El spawn admite un resolver typed de flags sin modificar rutas estáticas.
- Cada flag se resuelve independientemente y se trunca de forma finita en
  caller context; un valor no finito no borra los hermanos finitos.
- Un contacto aceptado de suelo/aire expone la política efectiva al `HitFall`
  existente, incluyendo `fall.kill`.
- Hay prueba focal de spawn y una traza importada requerida root → Projectile.
- El cierre actualiza roadmap, pasa los gates aplicables y queda en commits
  lógicos separados.

## Claim permitido

Un Projectile fresco creado por root resuelve `fall`, `air.fall` y
`fall.kill` finitos en caller context y los consume sólo en su contacto de
caída aceptado.

## Bloqueado

Helper/nesting/`ownProjectile`, ModifyProjectile, ModifyHitDef, `forcenofall`,
sintaxis `n`, cálculo exacto de caída/KO/recuperación, equipos, rollback y
paridad M.U.G.E.N/Ikemen completa.

# Issue 383 — Root Projectile dynamic fall flags

## Estado

- **T808 — closed-bounded (2026-08-15)**
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
- Un contacto aceptado expone la política efectiva al `HitFall` existente,
  incluyendo `fall.kill`.
- Hay prueba focal de spawn y una traza importada requerida root → Projectile.
- El cierre actualiza roadmap, pasa los gates aplicables y queda en commits
  lógicos separados.

## Claim permitido

Un Projectile fresco creado por root resuelve `fall`, `air.fall` y
`fall.kill` finitos en caller context y los consume sólo en su contacto de
caída aceptado.

## Evidencia de cierre

- `a436e58f` resuelve los flags por componente desde IR, spawn y caller
  context root; los hermanos finitos sobreviven a un valor no finito.
- `ae111508` añade la traza requerida
  `synthetic-imported-projectile-dynamic-fall-flags`, que pasa con checksum
  `a39589d7` y final `fb879f83`.
- Pasan el foco `3/3`, `pnpm test`, `pnpm typecheck`, `pnpm build` y
  `pnpm qa:trace` `887/887` (`853` requeridas).

## Bloqueado

Helper/nesting/`ownProjectile`, selección aérea observable de `air.fall`,
ModifyProjectile, ModifyHitDef, `forcenofall`, sintaxis `n`, cálculo exacto de
caída/KO/recuperación, equipos, rollback y paridad M.U.G.E.N/Ikemen completa.

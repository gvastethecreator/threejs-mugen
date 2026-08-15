# Issue 379 — Projectile root dynamic fall impact

## Estado

- **T804 — closed-bounded (2026-08-15)**
- **Área:** Projectile fresco root, impacto de caída y metadata GetHitVar
- **Dependencia:** T802 cierra el paquete dinámico de `fall.envshake` para el
  mismo spawn root

## Objetivo

Resolver `fall.damage`, `fall.xvelocity`, `fall.yvelocity` y
`fall.zvelocity` al crear un Projectile root. Las expresiones se evalúan una
vez en el contexto del caller; el contacto de caída aceptado conserva los
valores en la reacción, la velocidad y los aliases GetHitVar existentes.

## Fuente y alcance

- M.U.G.E.N 1.1 documenta que Projectile hereda parámetros HitDef, incluidos
  `fall.damage` y las velocidades X/Y de caída.
- Ikemen-GO pin `149402f` reutiliza `hitDefSub` desde `projectileSub`, evalúa
  las componentes en el caller y conserva la velocidad Z adicional.
- Este corte cubre un Projectile fresco creado por root. Helper-parented,
  ModifyProjectile, banderas/recovery de caída, sintaxis `n`, orden exacto de
  ticks, equipos, rollback y paridad total quedan fuera.

## Criterios de cierre

- El IR conserva paquetes estáticos, mixtos o dinámicos de impacto de caída y
  rechaza expresiones malformadas.
- Root evalúa cada componente una vez; una componente authored no finita no
  sustituye su metadata estática/fallback.
- Un impacto de caída aceptado llega a la velocidad física y a los aliases
  GetHitVar ya existentes.
- Hay pruebas focales de compiler/runtime y una traza importada requerida.
- Cierre con typecheck, build, `pnpm test`, `pnpm qa:trace`, documentación y
  commits separados.

## Claim permitido

**Permitido:** un Projectile fresco de root resuelve el paquete finito
`fall.damage`/`fall.xvelocity`/`fall.yvelocity`/`fall.zvelocity` en caller
context y lo consume sólo en su contacto de caída aceptado.

**Bloqueado:** Projectile creado por Helper, ModifyProjectile, recovery/flags
de caída, sintaxis `n`, orden exacto de caída/cámara, equipos, rollback y
paridad M.U.G.E.N/Ikemen completa.

## Resultado

- Producto: `4604c101` conserva el paquete typed de impacto de caída y resuelve
  sus componentes finitas en caller context durante el spawn root.
- Evidencia: `ca0cfacc` añade la traza requerida
  `synthetic-imported-projectile-dynamic-fall-impact`, aprobada con checksum
  de traza/final `aa8ebc39` / `80ab5f78`.
- Verificación: compiler/spawn/runtime focal, `pnpm test` `328/4093`,
  typecheck, build y `pnpm qa:trace` `883/883` (`849` requeridas) aprobados.
- Siguiente seguro: resolver el mismo paquete para Projectile creado por
  Helper en un corte independiente; no ampliar este claim a esa topología.

# Issue 382 — Helper Projectile dynamic fall recovery

## Estado

- **T807 — active (2026-08-15)**
- **Área:** Helper de primera generación, Projectile root-owned, recuperación de
  caída y metadata `GetHitVar`
- **Dependencia:** T806 cierra el resolver equivalente para Projectile creado
  por root

## Objetivo

Resolver `fall.recover`, `fall.recovertime`, `down.recover` y
`down.recovertime` cuando un Helper crea un Projectile. Cada expresión se
evalúa una vez en caller context del Helper; una componente no finita no
elimina sus hermanas finitas. Un contacto de caída aceptado debe transferir el
paquete a los aliases `GetHitVar` y a la ventana de recuperación existente,
manteniendo `owner/root = p1` y `parent = p1-helper-0`.

## Fuente y alcance

- M.U.G.E.N 1.1 documenta `fall.recover` y `fall.recovertime`; los Projectiles
  heredan los parámetros de HitDef y los creados por Helper pasan al root.
- Ikemen-GO pin `149402f` compila Projectile mediante `projectileSub`, reutiliza
  `hitDefSub` y evalúa sus parámetros en caller context.
- Este corte cubre un Projectile fresco creado por Helper de primera
  generación. Helper anidado, `ownProjectile`, ModifyProjectile, ModifyHitDef,
  flags de caída, timing exacto de recuperación, equipos, rollback y paridad
  total quedan fuera.

## Criterios de cierre

- El spawn Helper recibe el resolver typed del paquete `fallRecovery` sin
  alterar valores estáticos actuales.
- Las cuatro componentes se resuelven por separado en caller context del
  Helper; valores no finitos fallan cerrados por campo.
- Un contacto de caída aceptado conserva los valores, metadata y la identidad
  owner/root/parent existente.
- Hay prueba focal Helper/spawn y traza importada requerida Helper → Projectile.
- Cierre con typecheck, build, `pnpm test`, `pnpm qa:trace`, documentación y
  commits separados.

## Claim previsto

**Permitido:** un Helper de primera generación resuelve el paquete finito
`fall.recover`/`fall.recovertime`/`down.recover`/`down.recovertime` de su
Projectile fresco en caller context y lo consume solo en su contacto de caída
aceptado.

**Bloqueado:** Helper anidado, `ownProjectile`, ModifyProjectile,
ModifyHitDef, flags, sintaxis `n`, orden exacto de caída/cámara, equipos,
rollback y paridad M.U.G.E.N/Ikemen completa.

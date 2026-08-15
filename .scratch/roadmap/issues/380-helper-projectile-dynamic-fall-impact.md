# Issue 380 — Helper Projectile dynamic fall impact

## Estado

- **T805 — active (2026-08-15)**
- **Área:** Helper de primera generación, Projectile root-owned, impacto de
  caída y metadata `GetHitVar`
- **Dependencia:** T804 cierra el resolver equivalente para Projectile creado
  por root

## Objetivo

Resolver `fall.damage`, `fall.xvelocity`, `fall.yvelocity` y
`fall.zvelocity` cuando un Helper crea un Projectile. Cada expresión se evalúa
una vez en el contexto del Helper; el Projectile conserva `owner/root = p1` y
`parent = p1-helper-0`. Un contacto de caída aceptado debe conservar los
valores en la reacción, la velocidad y los aliases `GetHitVar` existentes.

## Fuente y alcance

- M.U.G.E.N 1.1 documenta los parámetros de caída de HitDef/Projectile y que
  todo Projectile creado por Helper pasa inmediatamente a ser propiedad del
  root.
- Ikemen-GO pin `149402f` compila Projectile mediante `projectileSub`, reutiliza
  `hitDefSub` y evalúa sus parámetros en el caller; también conserva la
  velocidad Z adicional.
- Este corte cubre sólo un Projectile fresco creado por Helper de primera
  generación. Helper anidado, `ownProjectile`, ModifyProjectile,
  recovery/flags, sintaxis `n`, orden exacto de ticks, equipos, rollback y
  paridad total quedan fuera.

## Criterios de cierre

- El spawn Helper recibe el resolver typed del paquete `fallImpact` y conserva
  comportamiento estático actual.
- Las cuatro componentes se resuelven por separado en caller context del
  Helper; una componente authored no finita no elimina sus hermanas finitas.
- Un contacto de caída aceptado conserva valores, metadata y la identidad
  owner/root/parent existente.
- Hay prueba focal Helper/spawn y traza importada requerida Helper → Projectile.
- Cierre con typecheck, build, `pnpm test`, `pnpm qa:trace`, documentación y
  commits separados.

## Claim previsto

**Permitido:** un Helper de primera generación resuelve el paquete finito
`fall.damage`/`fall.xvelocity`/`fall.yvelocity`/`fall.zvelocity` de su
Projectile fresco en caller context y lo consume sólo en su contacto de caída
aceptado.

**Bloqueado:** Helper anidado, `ownProjectile`, ModifyProjectile,
recovery/flags, sintaxis `n`, orden exacto de caída/cámara, equipos, rollback y
paridad M.U.G.E.N/Ikemen completa.

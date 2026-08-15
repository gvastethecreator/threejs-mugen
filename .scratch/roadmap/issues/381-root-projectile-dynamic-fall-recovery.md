# Issue 381 — root Projectile dynamic fall recovery

## Estado

- **T806 — active (2026-08-15)**
- **Área:** Projectile root-owned, fall/down recovery y metadata `GetHitVar`
- **Dependencia:** T805 cierra el paquete dinámico de impacto de caída para el
  Projectile creado por Helper

## Objetivo

Resolver `fall.recover`, `fall.recovertime`, `down.recover` y
`down.recovertime` al crear un Projectile fresco desde root. Cada expresión se
evalúa una vez en caller context; una componente no finita no elimina sus
hermanas finitas. Un contacto de caída aceptado debe transferir el paquete a
los aliases `GetHitVar` y a la ventana de recuperación existente.

## Fuente y alcance

- M.U.G.E.N 1.1 documenta la política y temporizadores de recuperación de
  caída; Projectile reutiliza parámetros de HitDef.
- Ikemen-GO pin `149402f` compila Projectile mediante `projectileSub`, reutiliza
  `hitDefSub` y finaliza el HitDef recién creado en caller context.
- Este corte cubre un Projectile fresco root-owned. Helper, `ownProjectile`,
  ModifyProjectile, ModifyHitDef, flags de caída, recuperación exacta/timing,
  equipos, rollback y paridad total quedan fuera.

## Criterios de cierre

- `ProjectileControllerOp` conserva las cuatro expresiones typed sin romper
  valores estáticos actuales.
- El spawn root recibe un resolver de recovery por componente; valores finitos
  se materializan antes del contacto y los no finitos fallan cerrados por campo.
- El contacto de caída aceptado conserva `GetHitVar(fall.recover)`,
  `GetHitVar(fall.recovertime)` y aliases de down-recovery existentes.
- Hay prueba focal de spawn/root y traza importada requerida de Projectile.
- Cierre con typecheck, build, `pnpm test`, `pnpm qa:trace`, documentación y
  commits separados.

## Claim previsto

**Permitido:** un Projectile fresco creado por root resuelve el paquete finito
`fall.recover`/`fall.recovertime`/`down.recover`/`down.recovertime` en caller
context y lo consume sólo en su contacto de caída aceptado.

**Bloqueado:** Helper/nesting/`ownProjectile`, ModifyProjectile, ModifyHitDef,
flags de caída, recuperación exacta/cámara, equipos, rollback y paridad
M.U.G.E.N/Ikemen completa.

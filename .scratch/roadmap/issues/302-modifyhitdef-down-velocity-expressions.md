# Issue 302 — `ModifyHitDef` `down.velocity` expressions

Status: **queued** (T728, 2026-08-11)

## Objetivo

Cerrar el reemplazo vivo de `down.velocity` X/Y en `ModifyHitDef` para el
caller root/RedirectID, preservando los componentes no authored y el Z ya
soportado.

## Alcance propuesto

- `ModifyHitDef` root/RedirectID con par estático, mixto o dinámico X/Y;
- evaluación una vez en el caller y truncado/validación finita sólo donde
  corresponda al componente float;
- un componente reemplaza X y preserva Y/Z; dos reemplazan X/Y y preservan Z;
- omisión no muta el vector vivo; el contacto lying existente consume el
  resultado mediante `GetHitVar(xvel/yvel/zvel)`.

## Base oficial

M.U.G.E.N 1.1 documenta `down.velocity=x,y` y su herencia fresh desde
`air.velocity`; `ModifyHitDef` es compatibilidad Ikemen. El pin Ikemen-GO
reutiliza `hitDefSub` para la mutación viva y escribe sólo los componentes
authored, por lo que los hermanos omitidos permanecen activos.

## Bloqueado por diseño

Fresh `down.velocity` (T673), dynamic Z/`n`, Helpers-owned mutation,
Projectile/ModifyProjectile, defaults nuevos, landing/physics exactos,
localcoord/facing, equipos, rollback y paridad completa quedan fuera.

## Evidencia prevista

Añadir cobertura `RuntimeCompiler.test.ts`, `HitDefSystem.test.ts` y
`PlayableMatchRuntime.test.ts` para single/pair/mixed, preservación de Y/Z,
omisión y contacto aéreo/lying con `GetHitVar`. La traza sólo se promocionará
si la mutación RedirectID ocurre antes del contacto y queda observable.

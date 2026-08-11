# Issue 302 — `ModifyHitDef` `down.velocity` expressions

Status: **closed-bounded** (T728, 2026-08-11)

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

## Resultado

La IR conserva el par X/Y estático, mixto o dinámico. `HitDefSystem.modify`
evalúa una vez en el caller original: un componente reemplaza X y preserva
Y/Z, dos reemplazan X/Y y preservan Z, y la omisión no muta el HitDef vivo.
Root/RedirectID y Helper consumen el vector en contacto lying y exponen
`GetHitVar(xvel/yvel/zvel)`.

Evidencia requerida:

- root dynamic X: `synthetic-imported-modifyhitdef-dynamic-down-velocity.json`
  (`7b1f4341` trace checksum, `fc695cca` final checksum);
- root dynamic Z: `synthetic-imported-modifyhitdef-dynamic-down-velocity-z.json`
  (`1e84d540` trace checksum);
- Helper dynamic X/Y/Z:
  `synthetic-imported-helper-modifyhitdef-dynamic-down-velocity.json`
  (`d2a053cf` trace checksum).

Focused compiler/runtime/integration suites, typecheck, diff hygiene and
`pnpm qa:trace` pass. The claim remains bounded to direct/root, RedirectID and
Helper-owned live mutation; fresh defaults, Projectiles, exact landing timing,
teams, rollback and full MUGEN/IKEMEN parity remain blocked.

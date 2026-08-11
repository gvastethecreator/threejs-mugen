# Issue 303 — `ModifyHitDef` `sparkxy` expressions

Status: **closed-bounded** (T729, 2026-08-11)

## Objetivo

Cerrar la mutación viva de `sparkxy` X/Y de `ModifyHitDef` en la frontera
root/RedirectID y Helper, conservando los ejes no authored y entregando el
offset al evento de hit-effect ya existente.

## Alcance propuesto

- `ModifyHitDef` root/RedirectID y Helper con par estático, mixto o dinámico;
- evaluación una vez en el caller original;
- un componente reemplaza X y preserva Y; dos reemplazan X/Y;
- omisión no muta el offset vivo;
- hit/guard presentation consume el offset sin cambiar la resolución del
  spark, sonido, escala ni el timing de render.

## Base oficial

M.U.G.E.N 1.1 documenta `sparkxy=x,y` como offset relativo al frente de P2,
con default `0,0`. El pin Ikemen-GO compila `sparkxy` dentro de `hitDefSub`,
evalúa cada componente en el caller y escribe sólo los componentes authored
también cuando `ModifyHitDef` reutiliza el HitDef activo. `ModifyHitDef` no es
un controlador M.U.G.E.N 1.1; el soporte live es una compatibilidad Ikemen
acotada.

## Bloqueado por diseño

Fresh `sparkxy`, `hitsound`/`guardsound`, `sparkno`/`guard.sparkno`,
`sparkangle`, `ModifyProjectile`, Projectiles, exacta búsqueda FightFX/common,
layering, palette, escala, timing de render, localcoord, equipos, rollback y
paridad completa de efectos quedan fuera.

## Evidencia prevista

Añadir cobertura `RuntimeCompiler.test.ts`, `HitDefSystem.test.ts`,
`HelperSystem.test.ts` y `PlayableMatchRuntime.test.ts` para single/pair/mixed,
preservación del eje omitido y RedirectID caller context. La traza sólo se
promocionará si el `ModifyHitDef` ocurre antes del contacto aceptado y el evento
`HitEffect` expone el offset final.

## Resultado

La IR conserva `sparkxy` como par estático, mixto o dinámico. `HitDefSystem`
evalúa una vez en el caller original; un componente reemplaza X y preserva Y,
dos reemplazan X/Y y la omisión no muta el offset vivo. Root/RedirectID y
Helper consumen el valor en el evento `HitSpark` existente. La cobertura
enfocada de compilador, runtime y Helper pasa `289/289`; typecheck y diff
hygiene pasan.

Evidencia requerida:

- `synthetic-imported-modifyhitdef-dynamic-sparkxy.json`, trace checksum
  `11851197`, con `sparkxy = 24,-72`, contacto hit, target link y final P2
  life `963`.
- `pnpm qa:trace`: `816/816` artifacts (`782` required, `34` optional),
  `0` failed y `0` skipped.

Commits: `523b34c6` (runtime/compiler) y `13cbf49d` (tests/evidence). El
claim queda limitado a la mutación live y al offset de evento; la lista de
bloqueos propuesta arriba permanece vigente.

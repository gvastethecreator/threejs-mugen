# Issue 305 — `ModifyHitDef` `guard.sparkangle` expressions

Status: **closed-bounded** (T731, 2026-08-11)

## Objetivo

Cerrar la mutación viva del ángulo del guard-spark (`guard.sparkangle`) en
`ModifyHitDef`, con evaluación en el caller root/RedirectID y Helper, y
entrega del ángulo resuelto al evento de `HitSpark` de un guard aceptado.

## Alcance propuesto

- `ModifyHitDef` root/RedirectID y Helper con escalar estático o dinámico;
- evaluación una vez en el caller original y aceptación sólo de valores float
  finitos;
- omisión o expresión no resoluble preserva el ángulo guardado;
- el guard directo aceptado publica el ángulo en `RuntimeHitEffectEvent`;
- una traza requerida separa la ruta guard de la ruta hit y conserva la
  identidad del spark.

## Base oficial

El pin Ikemen-GO `149402f` compila `guard.sparkangle` como una expresión
`VT_Float` en `hitDefSub` (`compiler_functions.go:1953-1954`), la evalúa sobre
el caller (`bytecode.go:7673-7674`) y la consume al crear el guard-spark
(`char.go:11446-11450`). El parámetro live de `ModifyHitDef` es una
compatibilidad Ikemen; no se reclama como controlador M.U.G.E.N 1.1.

## Bloqueado por diseño

`sparkangle` de hit, identidad de spark, `sparkxy`, escala, palette, sonido,
Projectiles/ModifyProjectile, FightFX/common lookup exacto, renderer timing,
localcoord, equipos, rollback y paridad completa quedan fuera.

## Evidencia prevista

Añadir cobertura `RuntimeCompiler.test.ts`, `HitDefSystem.test.ts`,
`HelperSystem.test.ts`, `RuntimeContactPresentationSystem.test.ts` y
`PlayableMatchRuntime.test.ts` para estático, dinámico, omisión/preservación y
caller RedirectID. La traza sólo se promocionará si un guard aceptado publica
el ángulo guardado sin contaminar la ruta de hit.

## Resultado T731

Implementado en `ControllerOps`, `HitDefSystem`, `PlayableMatchRuntime`,
`HelperSystem`, `RuntimeContactPresentationSystem`, `importedFighter` y
`DemoMove`. El campo estático/dinámico llega a root, RedirectID y Helper; un
ModifyHitDef omitido o no resoluble conserva el valor vivo; un guard aceptado
publica el ángulo en `RuntimeHitEffectEvent` y mantiene identidad/offset.
La traza requerida
`synthetic-imported-modifyhitdef-dynamic-guard-sparkangle.json` prueba
`var(0)=19`, `ModifyHitDef`, contacto `guard` y ausencia de la ruta `hit`.
Los claims bloqueados originales permanecen fuera de alcance.

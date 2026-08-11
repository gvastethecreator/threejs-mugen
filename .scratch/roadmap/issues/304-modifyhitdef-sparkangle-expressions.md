# Issue 304 — `ModifyHitDef` `sparkangle` expressions

Status: **queued** (T730, 2026-08-11)

## Objetivo

Cerrar la mutación viva del ángulo del hit-spark (`sparkangle`) en
`ModifyHitDef`, con evaluación en el caller root/RedirectID y Helper, y
entrega del ángulo resuelto al evento de `HitSpark` de un hit aceptado.

## Alcance propuesto

- `ModifyHitDef` root/RedirectID y Helper con un escalar estático o dinámico;
- evaluación una vez en el caller original y aceptación sólo de valores float
  finitos;
- omisión o expresión no resoluble preserva el ángulo vivo;
- el hit directo aceptado publica el ángulo en `RuntimeHitEffectEvent`;
- una traza requerida prueba el valor final antes del renderer.

## Base oficial

El pin Ikemen-GO `149402f` compila `sparkangle` como una expresión `VT_Float`
en `hitDefSub` (`compiler_functions.go:1944-1945`), la evalúa sobre el caller
(`bytecode.go:7668-7669`) y reutiliza el mismo `runSub` para `ModifyHitDef`.
La presentación consume el valor al crear el hit-spark (`char.go:11358` y
`11431-11433`). El parámetro live de `ModifyHitDef` es una compatibilidad
Ikemen; no se reclama como controlador M.U.G.E.N 1.1.

## Bloqueado por diseño

`guard.sparkangle`, `sparkno`/`guard.sparkno`, `sparkxy`, escala, palette,
sonido, Projectiles/ModifyProjectile, FightFX/common lookup exacto, renderer
timing, localcoord, equipos, rollback y paridad completa quedan fuera.

## Evidencia prevista

Añadir cobertura `RuntimeCompiler.test.ts`, `HitDefSystem.test.ts`,
`HelperSystem.test.ts` y `PlayableMatchRuntime.test.ts` para estático,
dinámico, omisión/preservación y caller RedirectID. La traza sólo se
promocionará si un hit aceptado publica el ángulo en el `HitEffect` sin mutar
la identidad del spark.

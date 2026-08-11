# Issue 304 — `ModifyHitDef` `sparkangle` expressions

Status: **closed-bounded** (T730, 2026-08-11)

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

## Resultado T730

Implementado en `b7ca2d60` y cerrado con evidencia en `ab0114fd`. El IR y el
runtime aceptan el escalar estático/dinámico en HitDef fresco y
`ModifyHitDef`; root/RedirectID y Helper evalúan en caller-context, preservan
omisión/no-resolución en la mutación viva y el evento aceptado conserva el
ángulo junto con la identidad y `sparkxy`. La traza requerida
`synthetic-imported-modifyhitdef-dynamic-sparkangle.json` prueba `var(0)=27`;
la suite focal pasa `298/298` y `pnpm qa:trace` pasa `817/817`
(`783` required, `34` optional).

La clonación de snapshots de jugador, Helper y trace conserva ahora el campo
`angle`, evitando que la evidencia pierda un valor ya resuelto antes del gate.
`guard.sparkangle`, Projectiles, renderer exacto y paridad completa siguen
fuera del claim.

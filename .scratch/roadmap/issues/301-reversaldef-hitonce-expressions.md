# Issue 301 — ReversalDef `hitonce` expressions

Status: **closed-bounded** (T727, 2026-08-11)

## Objetivo

Cerrar `hitonce` en `ReversalDef` y `ModifyReversalDef` como un booleano
estático o expresión evaluada en el caller, conectándolo con la admisión de
contactos de reversa sin alterar el límite de `numhits` ya portado.

## Alcance propuesto

- direct/root fresh `ReversalDef` y root/RedirectID `ModifyReversalDef`;
- expresión booleana finita con `0`/no-cero normalizado;
- primer contacto aceptado consume el ReversalDef cuando `hitonce` está activo;
- modificación viva reemplaza el flag y omisión preserva el valor activo.

## Base oficial

El pin Ikemen-GO compila `hitonce` dentro del bloque compartido de parámetros
de HitDef como booleano y lo evalúa en el caller. Tras un contacto aceptado,
el pin neutraliza el flag activo y deja la admisión de objetivos posteriores
al estado de contacto; la ruta local conserva ese comportamiento acotado con
`hasHit` y la memoria de objetivos de ReversalDef.

## Bloqueado por diseño

Helper-owned `ModifyReversalDef`, Projectile/ModifyProjectile, prioridad,
`numhits`/combo exacto, orden de tick, overflow/int32, equipos, rollback y
paridad completa de ReversalDef quedan fuera.

## Evidencia prevista

Añadir cobertura `RuntimeCompiler.test.ts` y `ReversalSystem.test.ts` para
static/dynamic/malformed, caller RedirectID, consumo one-shot y preservación
en omisión. La traza root/RedirectID sólo se promocionará si separa el flag de
la programación de contactos normales.

## Resultado

`ReversalDef` y `ModifyReversalDef` ahora conservan `hitonce` estático o
dinámico (`number|string` en IR, booleano resuelto en runtime). Fresh y live
RedirectID evalúan el valor una vez en el caller; `0` desactiva el límite,
cualquier valor finito no-cero lo activa y una mutación omitida preserva el
valor vivo. El gate de contacto consume el ReversalDef activo cuando está
habilitado y, con memoria de objetivos explícita, permite objetivos distintos
cuando está deshabilitado sin repetir el mismo objetivo.

`RuntimeCompiler.test.ts` y `ReversalSystem.test.ts` pasan `184/184`; las
regresiones de resolución/helper pasan `78/78`; `pnpm exec tsc --noEmit
--pretty false` y `git diff --check` pasan. No se promociona una traza causal:
el claim queda acotado a IR/runtime, dispatch root/RedirectID y admisión
aislada. Helper-owned ModifyReversalDef, Projectile, prioridad, combo/tick,
equipos, rollback y paridad completa siguen fuera.

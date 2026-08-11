# Issue 301 — ReversalDef `hitonce` expressions

Status: **queued** (T727, 2026-08-11)

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
de HitDef y lo evalúa como booleano en el caller. La ruta local ya tiene
`hasHit` y el gate de contacto de ReversalDef, por lo que el corte debe limitar
la superficie al flag y su consumo de una sola aceptación.

## Bloqueado por diseño

Helper-owned `ModifyReversalDef`, Projectile/ModifyProjectile, prioridad,
`numhits`/combo exacto, orden de tick, overflow/int32, equipos, rollback y
paridad completa de ReversalDef quedan fuera.

## Evidencia prevista

Añadir cobertura `RuntimeCompiler.test.ts` y `ReversalSystem.test.ts` para
static/dynamic/malformed, caller RedirectID, consumo one-shot y preservación
en omisión. La traza root/RedirectID sólo se promocionará si separa el flag de
la programación de contactos normales.

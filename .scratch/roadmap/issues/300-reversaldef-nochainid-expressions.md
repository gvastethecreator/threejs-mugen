# Issue 300 — ReversalDef `nochainid` expressions

Status: **closed-bounded** (T726, 2026-08-11)

## Objetivo

Portar `nochainid` como una lista de hasta ocho expresiones enteras para
`ReversalDef` y `ModifyReversalDef`, manteniendo la evaluación única en el
caller y el rechazo de cadenas cuyo `HitDef` id esté bloqueado.

## Alcance propuesto

- direct/root fresh `ReversalDef` y root/RedirectID `ModifyReversalDef`;
- listas estáticas y dinámicas finitas con el límite oficial de ocho entradas;
- normalización entera y admisión contra el último `HitDef` id del defensor;
- modificación viva con reemplazo de la lista authored y omisión preservada.

## Base oficial

El pin Ikemen-GO `149402f` compila `nochainid` como una lista de hasta ocho
expresiones enteras dentro de `hitDefSub`, evalúa cada entrada en el caller y
aplica la lista durante la admisión de la reversión. M.U.G.E.N 1.1 no expone
`ModifyReversalDef` como controlador documentado; esa ruta se reclama sólo
como compatibilidad acotada con Ikemen.

## Bloqueado por diseño

Helper-owned `ModifyReversalDef`, Projectile/ModifyProjectile, prioridad,
`hitonce`, overflow/int32 exacto, orden de tick, equipos, rollback y paridad
completa de ReversalDef quedan fuera.

## Evidencia prevista

Añadir cobertura `RuntimeCompiler.test.ts` y `ReversalSystem.test.ts` para
listas de uno/ocho valores, expresiones del caller, límite y rechazo por id
bloqueado. La traza root/RedirectID sólo se promocionará si el fixture aísla
la modificación antes del contacto; de lo contrario el claim quedará en
IR/runtime y dispatch directo, como en T725.

## Resultado

El IR tipado conserva listas `nochainid` estáticas, dinámicas y mixtas de
hasta ocho entradas para `ReversalDef` y `ModifyReversalDef`. Fresh y live
RedirectID evalúan cada expresión una vez en el caller; los valores finitos se
truncan y la admisión rechaza el `HitDef` id entrante cuando coincide con una
entrada no negativa de la lista. La omisión live preserva la lista activa.

`RuntimeCompiler.test.ts` y `ReversalSystem.test.ts` pasan `181/181`;
`pnpm exec tsc --noEmit --pretty false` y `git diff --check` pasan. No se
promociona una traza end-to-end: el claim queda acotado a IR/runtime,
dispatch directo y la seam de admisión aislada.

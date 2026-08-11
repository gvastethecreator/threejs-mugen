# Issue 300 — ReversalDef `nochainid` expressions

Status: **queued** (T726, 2026-08-11)

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

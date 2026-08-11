# Issue 299 — ReversalDef `chainid` expressions

Status: **queued** (T725 candidate, 2026-08-11)

## Objetivo

Cerrar el siguiente campo independiente de `ReversalDef`/`ModifyReversalDef`:
`chainid` dinámico y su admisión contra el último `HitDef` id compatible,
manteniendo la evaluación única en el caller y el rechazo de cadenas que no
coincidan.

## Alcance propuesto

- direct/root fresh `ReversalDef` y root/RedirectID `ModifyReversalDef`;
- expresiones estáticas y dinámicas finitas, con `chainid=-1` explícito para
  desactivar el requisito;
- gate de contacto aceptado y rechazo por cadena incompatible.

## Bloqueado por diseño

`nochainid`, Helper-owned ModifyReversalDef, Projectile/ModifyProjectile,
priority/hitonce arbitration, overflow/int32 exacto, orden de tick, equipos,
rollback y paridad completa de ReversalDef quedan fuera hasta un corte propio.

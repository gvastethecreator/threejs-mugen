# Issue 299 — ReversalDef `chainid` expressions

Status: **closed-bounded** (T725, 2026-08-11)

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

## Resultado

El IR tipado conserva `chainid` estático y expresión finita en `ReversalDef`
y `ModifyReversalDef`. Fresh y live RedirectID evalúan una vez en el caller;
`chainid >= 0` se trunca y un valor negativo explícito desactiva el requisito.
La admisión compara el último `HitDef` id del receptor y rechaza cadenas
incompatibles. `RuntimeCompiler.test.ts` y `ReversalSystem.test.ts` pasan
`179/179`; `pnpm exec tsc --noEmit --pretty false` y `git diff --check` pasan.

La traza end-to-end queda deliberadamente fuera de este cierre: el fixture
actual mezcla el orden de contacto con `ModifyReversalDef` y no demuestra un
causal válido. El claim se limita a cobertura de IR/runtime y dispatch directo;
queda pendiente una traza root/RedirectID con scheduling aislado.

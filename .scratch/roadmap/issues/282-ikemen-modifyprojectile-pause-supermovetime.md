# T708 — ModifyProjectile pausemovetime/supermovetime dinámicos

Status: closed-bounded

## Objetivo

Completar el corte acotado de compatibilidad Ikemen para que `ModifyProjectile`
evalúe `pausemovetime` y `supermovetime` como expresiones en el contexto del
caller, actualice sólo los Projectiles seleccionados y conserve el contrato de
inicialización local (`>= 0` consume `value + 1`, negativos permanecen
negativos).

## Fuente fijada

- Ikemen-GO `149402fa`:
  `compiler_functions.go` compila ambos parámetros como `VT_Int` dentro de
  `projectileSub`; `bytecode.go` evalúa una vez en el caller y transmite el
  resultado a cada Projectile seleccionado, normalizando los valores no
  negativos con `+1`; `char.go` consume/decrementa los presupuestos durante
  Pause/SuperPause.
- MUGEN 1.1 no expone `ModifyProjectile`; el claim es Ikemen-only.

## Estado local y alcance

- `RuntimeProjectile` ya posee ambos presupuestos, snapshots, `ProjVar` y
  avance congelado/permitido.
- El hueco está en IR/compiler y en los resolvers root/Helper: hoy el runtime
  sólo lee el primer número estático.
- Se implementan expresiones dinámicas root + Helper, resolución una vez en el
  caller, selección existente por `id`/`index`/equipo, mutación estática y
  omisión sin regresión.

## Evidencia requerida

- Compiler: literal, expresión dinámica y malformed fail-closed.
- Runtime: root y Helper evalúan `var()` desde caller; el presupuesto muta sólo
  el Projectile seleccionado y `ProjVar(pausemovetime/supermovetime)` observa
  los valores normalizados.
- Trace required: lifecycle spawn → ModifyProjectile → active/remove,
  telemetría `VarSet`/`Projectile`/`ModifyProjectile`, ownership root y
  Helper-parented, con evidencia separada de Pause y SuperPause.

## Fuera de alcance

Overflow/int32 exacto del VM, invalid timing exhaustivo, broadcast de
namespaces, equipos complejos, rollback, orden total de capas Pause/SuperPause,
Projectile/Helper parity completa y otros campos de `ModifyProjectile`.

## Siguiente

T708 queda cerrado-bounded. El gate global produjo `794/794` artefactos
(`760` required, `34` optional). Las trazas requeridas son
`synthetic-imported-modifyprojectile-dynamic-movetime` (`5cd62713` /
`ba3572e4`) y
`synthetic-imported-helper-modifyprojectile-dynamic-movetime` (`6494c296` /
`39225ffb`). El foco cubre compiler, ProjectileSystem, Helper micro-VM,
caller root y matcher de payload; typecheck y diff hygiene pasan.

La afirmación queda limitada a expresiones VT_Int finitas, resolución una vez
en el caller y mutación de Projectiles seleccionados. No cubre overflow/int32
exacto, timing exhaustivo de Pause/SuperPause, broadcast de namespaces,
equipos complejos, rollback, ni paridad completa Projectile/Helper.

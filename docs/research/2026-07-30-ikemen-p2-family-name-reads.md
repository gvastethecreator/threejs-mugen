# IKEMEN P6Name/P8Name family reads — 2026-07-30 (T421)

## Fuente y delta

En el pin normativo de Ikemen-GO, `P6Name` llama a
`enemyNear(c, 2, true)` y `P8Name` llama a `enemyNear(c, 3, true)`. El
argumento `true` selecciona `p2EnemyList`, la misma lista que usan P2/P4; no
son índices de `EnemyNear`. Evidencia primaria:
[`bytecode.go` P2/P4/P6/P8](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L2714-L2735)
y [`char.go` enemyNear](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13903-L13975).

T420 ya materializaba `p2Roster` para P2/P4Name, pero el evaluador y el
compilador locales no exponían `P6Name` ni `P8Name`.

## Cambio local

`ExpressionContext` agrega `p6Name` y `p8Name`. En el contexto explícito
`rootSelection`, `RuntimeExpressionContextWorld` toma los índices 2 y 3 de la
misma lista P2 ordenada; la ruta sin selección explícita conserva el roster del
caller. `ExpressionEvaluator` y `ExpressionCompiler` reconocen ambos
identificadores. No se añaden P5/P7, Partner ni lecturas P6/P8 de vida/estado.

## Evidencia

```text
pnpm exec vitest run src/tests/RuntimeExpressionContextSystem.test.ts src/tests/RuntimeCompiler.test.ts src/tests/RuntimeCnsSubset.test.ts
3 files / 118 tests passed
```

La prueba de contexto verifica simultáneamente que P2/P4/P6/P8 siguen los
índices 0/1/2/3 del roster P2, mientras `EnemyNear(0/1)` permanece separado.

## Allowed / blocked

Permitido: `P6Name` y `P8Name` source-shaped, sólo en el contexto explícito ya
filtrado por 046b/T419.

Bloqueado: P5/P7 y Partner nuevos, P6/P8 de vida/estado, Helpers
`type=player`, cache frame-start exacto, `bindToId`/escala, Tag/Simul/Turns,
rollback/netplay, score movement y port completo MUGEN/IKEMEN.

No hay movimiento de score ni nueva autoridad.

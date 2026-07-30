# IKEMEN P2-family reads — 2026-07-30 (T420)

## Fuente y delta

El pin normativo de Ikemen-GO
`05b7d98af690c73c7bffe5cb4f4eeb6933fa2703` usa una lista separada
`p2EnemyList` para `P2`, `P4`, `P6` y `P8`. `EnemyNear` usa
`enemyNearList`; por eso sus índices no deben compartir orden ni cache.
La evidencia de implementación es [`p4name` en `bytecode.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L2714-L2732),
que resuelve `P4Name` con `enemyNear(c, 1, true)`. La construcción de ambas
listas y su separación está en [`enemyNear` de `char.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13903-L13975).

Antes de T420, `RuntimeExpressionContextWorld` elegía `P2` con la policy P2
de T419, pero tomaba `P4Name` desde el segundo elemento de `enemyRoster`.
Cuando la penalización behind o Z cambia el orden, esa lectura podía apuntar a
otro actor.

## Cambio local

El contexto explícito `rootSelection` ahora materializa una sola lista
`p2Roster` con `orderP2ByNearest` y usa sus índices 0 y 1 para `P2` y
`P4Name`. `EnemyNear` sigue consumiendo `opponentRoster`/`orderByNearest` y
`Enemy` sigue leyendo `enemyRoster` sin reordenar. La ruta sin `rootSelection`
conserva el comportamiento legacy del caller.

## Evidencia

Prueba de regresión y divergencia:

```text
pnpm exec vitest run src/tests/RuntimeExpressionContextSystem.test.ts src/tests/RuntimeOpponentSelectionSystem.test.ts
2 files / 36 tests passed

pnpm exec vitest run src/tests/RuntimeExpressionContextSystem.test.ts src/tests/RuntimeOpponentSelectionSystem.test.ts src/tests/RuntimeCompiler.test.ts src/tests/RuntimeCnsSubset.test.ts src/tests/MatchWorld.test.ts src/tests/PlayableMatchRuntime.test.ts
6 files / 464 tests passed
```

El caso prueba que `P2Name/P2Life` toma el candidato frontal, `P4Name` toma
el segundo candidato P2 detrás y `EnemyNear(0/1)` conserva el orden corporal
legacy.

## Allowed / blocked

Permitido: `P2` y `P4Name` comparten el roster P2 source-shaped en el contexto
explícito ya filtrado por 046b/T419.

Bloqueado: `P6/P8` no tienen todavía lectores en el evaluador local; Helpers
`type=player`, timing exacto de cache por frame, `bindToId`/escala, Tag/Simul/
Turns, rollback/netplay, score movement y port completo MUGEN/IKEMEN.

No hay movimiento de score ni nueva autoridad. Las puertas globales siguen
siendo las registradas en el ledger T419.

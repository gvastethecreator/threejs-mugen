# IKEMEN P5Name/P7Name partner reads — 2026-07-30 (T422)

## Fuente y delta

El pin normativo de Ikemen-GO resuelve `P5Name` con `c.partner(1, false)` y
`P7Name` con `c.partner(2, false)`. P3Name ya usa `c.partner(0, false)`;
estos nombres no usan la lista P2. Evidencia primaria:
[`bytecode.go` P3/P5/P7](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L2718-L2735).

Antes de T422, el sandbox tenía `partnerRoster` y `Partner(index)`, pero sólo
exponía `P3Name`; el compiler y evaluator no reconocían `P5Name`/`P7Name`.

## Cambio local

`ExpressionContext` ahora expone `p5Name` y `p7Name`. El contexto explícito
`rootSelection` toma los índices 1 y 2 de `partnerRoster`; `P3Name` permanece
en el índice 0. `ExpressionEvaluator` y `ExpressionCompiler` reconocen ambos
identificadores. `Partner(index)`, P2/P4/P6/P8, `EnemyNear` y callers legacy
no cambian.

## Evidencia

```text
pnpm exec vitest run src/tests/RuntimeExpressionContextSystem.test.ts src/tests/RuntimeCompiler.test.ts src/tests/RuntimeCnsSubset.test.ts
3 files / 118 tests passed
```

La prueba de contexto valida P3/P5/P7 y `Partner(1)` simultáneamente con
P2-family y EnemyNear.

## Allowed / blocked

Permitido: nombres P5/P7 source-shaped en el contexto explícito ya filtrado
por 046b/T419.

Bloqueado: Partner state/life completo, consumers live fuera de
`rootSelection`, Helpers `type=player`, cache frame-start exacto,
Tag/Simul/Turns, rollback/netplay, score movement y port completo MUGEN/IKEMEN.

No hay movimiento de score ni nueva autoridad.

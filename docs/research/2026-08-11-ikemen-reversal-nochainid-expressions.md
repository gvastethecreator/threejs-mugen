# IKEMEN ReversalDef `nochainid` expressions

Date: 2026-08-11

## Fuentes fijadas

- [Ikemen compiler `nochainid`](https://github.com/ikemen-engine/Ikemen-GO/blob/149402f/src/compiler_functions.go#L1770-L1777)
- [Ikemen chain and no-chain admission](https://github.com/ikemen-engine/Ikemen-GO/blob/149402f/src/char.go#L10499-L10513)

## Decisión de port

`nochainid` se conserva como una lista tipada de hasta ocho valores estáticos
o expresiones. `ReversalDef` fresh y `ModifyReversalDef` root/RedirectID
resuelven cada entrada una vez en el contexto del caller; los valores finitos
se truncan. La admisión compara el `HitDef` id entrante contra las entradas
no negativas y rechaza la cadena cuando coincide.

La omisión en una mutación viva preserva la lista actual. No se afirma todavía
la topología de Helpers, Projectiles, `hitonce`, prioridad, orden exacto de
tick, overflow/int32, equipos, rollback ni paridad completa de ReversalDef.

## Evidencia

- `RuntimeCompiler.test.ts` + `ReversalSystem.test.ts`: `181/181`.
- Typecheck y diff hygiene pass.
- No se promociona una traza durable: el claim está aislado a IR/runtime,
  dispatch directo y admisión de cadena.

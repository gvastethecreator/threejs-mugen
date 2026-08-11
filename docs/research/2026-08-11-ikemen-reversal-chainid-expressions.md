# IKEMEN ReversalDef `chainid` expressions

Date: 2026-08-11

## Fuentes fijadas

- [Ikemen compiler `chainid`](https://github.com/ikemen-engine/Ikemen-GO/blob/149402f/src/compiler_functions.go#L1770-L1775)
- [Ikemen bytecode evaluation](https://github.com/ikemen-engine/Ikemen-GO/blob/149402f/src/bytecode.go#L7580-L7585)
- [Ikemen ReversalDef admission](https://github.com/ikemen-engine/Ikemen-GO/blob/149402f/src/char.go#L10499-L10513)
- [Ikemen `GetHitVar(chainid)` semantics](https://github.com/ikemen-engine/Ikemen-GO/blob/149402f/src/char.go#L1198-L1203)

## Decisión de port

`chainid` se conserva como `number | string` en el IR. `ReversalDef` fresh y
`ModifyReversalDef` root/RedirectID resuelven la expresión una vez en el
contexto del caller. Los valores finitos se truncan; `-1` y otros negativos
desactivan la restricción. La admisión compara el último `HitDef` id del
receptor antes de aceptar la reversión.

No se amplía `nochainid`, Helper-owned `ModifyReversalDef`, Projectile,
priority/hitonce, overflow/int32 exacto, scheduling, equipos ni rollback.
`GetHitVar(chainid)` no se promete como metadata separada: el pin devuelve el
último `hitid`, mientras el requisito de cadena vive en la ReversalDef activa.

## Evidencia

- `RuntimeCompiler.test.ts` + `ReversalSystem.test.ts`: 179 tests pass.
- Typecheck y diff hygiene pass.
- La traza end-to-end root/RedirectID se difiere: el fixture exploratorio no
  aisló correctamente el orden contacto → modificación y no se promociona a
  evidencia durable.

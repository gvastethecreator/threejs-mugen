# IKEMEN ReversalDef `hitonce` expressions

Date: 2026-08-11

## Fuentes fijadas

- [Ikemen compiler `hitonce`](https://github.com/ikemen-engine/Ikemen-GO/blob/149402f/src/compiler_functions.go#L1794-L1796)
- [Ikemen boolean evaluation in HitDef params](https://github.com/ikemen-engine/Ikemen-GO/blob/149402f/src/bytecode.go#L7592-L7594)
- [Ikemen fresh sentinel/default](https://github.com/ikemen-engine/Ikemen-GO/blob/149402f/src/char.go#L777-L857)
- [Ikemen accepted-contact target policy](https://github.com/ikemen-engine/Ikemen-GO/blob/149402f/src/char.go#L11465-L11469)
- [Ikemen one-contact neutralization](https://github.com/ikemen-engine/Ikemen-GO/blob/149402f/src/char.go#L13499-L13502)

## Decisión de port

`ReversalDef` y `ModifyReversalDef` conservan `hitonce` como booleano estático
o expresión entera del caller. El valor se evalúa una vez, con `0` como
desactivado y cualquier valor finito no-cero como activo. Fresh omitido conserva
el default acotado local (`false`); una modificación viva omitida no muta el
flag activo.

El gate de ReversalDef marca el primer contacto aceptado mediante la memoria
de objetivos existente. Cuando `hitonce` está activo, `hasHit` consume el
ReversalDef completo; cuando está desactivado, la memoria explícita permite un
objetivo diferente, pero nunca repite un objetivo ya registrado. Actores sin
memoria explícita conservan el fallback escalar legacy para no ampliar el
alcance de esta entrega.

## Evidencia

- `RuntimeCompiler.test.ts` + `ReversalSystem.test.ts`: `184/184`.
- `RuntimeCombatResolutionSystem.test.ts` + `RuntimeHelperCombatSystem.test.ts`:
  `78/78`.
- `pnpm exec tsc --noEmit --pretty false` y `git diff --check`: pass.
- No se promociona una traza causal: el resultado está limitado a IR/runtime,
  dispatch root/RedirectID y admisión aislada.

## Fuera de alcance

Helper-owned `ModifyReversalDef`, Projectile/ModifyProjectile, prioridad,
`numhits`/combo exacto, orden de tick, overflow/int32, equipos, rollback y
paridad completa de ReversalDef.

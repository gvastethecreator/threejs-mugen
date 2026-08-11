# Issue 296 — ReversalDef `p1facing` / `p1getp2facing` expressions

Status: **closed-bounded** (T722, 2026-08-11)

## Resultado

El port ahora conserva y resuelve `p1facing` y `p1getp2facing` en
`ReversalDef` y `ModifyReversalDef`. Las formas estática y dinámica se
compilan como parámetros enteros tipados; las expresiones se evalúan una vez
en el contexto del caller, incluso cuando `ModifyReversalDef` muta el
ReversalDef activo mediante `RedirectID`.

En un contacto de reversa aceptado, `p1getp2facing != 0` tiene precedencia:
`+1` adopta el facing entrante y un valor negativo lo invierte. Si no hay
`p1getp2facing`, un `p1facing < 0` invierte el facing actual del reverser. Los
valores cero u omitidos no cambian el facing. El cambio se aplica junto con
la entrada de estados existente; no se afirma aquí la sincronización diferida
de cada tick del motor original.

## Base oficial

- Ikemen-GO pin `149402f`: `compiler_functions.go` compila ambos parámetros
  como enteros y `bytecode.go` los evalúa en el caller. La lógica de contacto
  aplica `p1getp2facing` antes que `p1facing` en el contacto no-Projectile.
- `ModifyReversalDef` reutiliza el evaluador de parámetros de HitDef del pin.
- Projectile y ModifyProjectile quedan fuera: el pin documenta que estos dos
  campos no funcionan para Projectiles.

## Evidencia

- Core: `8e3c6392` (`feat(mugen): support ReversalDef p1facing`).
- Gate: `672bbfe9` (`test(evidence): gate ReversalDef p1facing`).
- Trace requerida: `synthetic-imported-ikemen-reversaldef-p1facing-golden`;
  checksum `ef3cc6e6`, final `807d5ba2`.
- `pnpm qa:trace`: `813/813` artifacts (`779` required, `34` optional),
  `0` failures.
- `pnpm typecheck` y las suites focales de compiler/ReversalDef pasan.

## Alcance bloqueado

Helper-owned `ModifyReversalDef`, Projectile/ModifyProjectile, ReversalDef
guards, overflow/int32 exacto, tick diferido exacto, `noautoturn`, equipos,
rollback y paridad completa M.U.G.E.N/Ikemen requieren cortes independientes.

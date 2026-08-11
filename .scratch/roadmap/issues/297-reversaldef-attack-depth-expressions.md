# Issue 297 — ReversalDef `attack.depth` expressions

Status: **closed-bounded** (T723, 2026-08-11)

## Resultado

El port ahora conserva `attack.depth` como par estático, dinámico o mixto en
`ReversalDef` y `ModifyReversalDef`. La activación fresca y la modificación
viva `root/RedirectID` evalúan una vez en el contexto del caller; una forma de
un solo componente duplica el valor para la profundidad X/Y y una modificación
viva conserva el valor anterior cuando el parámetro se omite o no resuelve de
forma finita. La resolución alimenta la admisión de contacto de reversa y el
estado existente de `combatDepth`.

Es una compatibilidad acotada con el pin Ikemen-GO `149402f`, que reutiliza el
runner de parámetros de HitDef para `attack.depth`. No se afirma aquí paridad
completa de la sincronización de profundidad, ni una semántica autónoma de
M.U.G.E.N 1.1 para este parámetro de ReversalDef.

## Base oficial

- Ikemen-GO `149402f` compila `attack.depth` como uno o dos expresiones float,
  evalúa cada componente en el caller y reutiliza el runner para
  `ReversalDef`/`ModifyReversalDef`.
- La ruta local mantiene el límite de contacto directo/root y la mutación
  `RedirectID`; Helpers propietarios, Projectiles y `ModifyProjectile` quedan
  fuera de este corte.

## Evidencia

- Core: `be68351f` (`feat(mugen): support dynamic ReversalDef attack depth`).
- Gate: `faa728fd` (`test(evidence): gate dynamic ReversalDef attack depth`).
- Trace requerida:
  `synthetic-imported-ikemen-root-modifyreversaldef-dynamic-attack-depth-golden`;
  checksum `6de330e0`, final `18f6ef72`.
- `pnpm qa:trace`: `814/814` artifacts (`780` required, `34` optional),
  `0` failures.
- `pnpm typecheck`, `RuntimeCompiler`/`ReversalSystem` focales y la prueba
  de gate pasan.

## Alcance bloqueado

Helper-owned `ModifyReversalDef`, Projectile/ModifyProjectile, profundidad
dinámica en otras rutas, overflow/int32 exacto, sincronización de tick,
equipos, rollback y paridad completa M.U.G.E.N/Ikemen requieren cortes
independientes.

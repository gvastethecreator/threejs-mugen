# Issue 298 — ReversalDef `id` expressions

Status: **closed-bounded** (T724, 2026-08-11)

## Resultado

El port ahora conserva `id` como valor estático o expresión numérica en
`ReversalDef` y `ModifyReversalDef`. La activación fresca y la mutación viva
`root/RedirectID` evalúan una vez en el contexto del caller, clamped el valor a
un identificador no negativo. El contacto de reversa aceptado actualiza la
memoria de target y expone el identificador resuelto mediante `GetHitVar(hitid)`
en el atacante.

Es una compatibilidad acotada con el runner compartido de parámetros de
HitDef en el pin Ikemen-GO `149402f`; no se afirma que M.U.G.E.N 1.1 documente
un controlador `ModifyReversalDef`.

## Base oficial

- Ikemen-GO `149402f` compila y evalúa `id` con `evalI` en el caller,
  normaliza el valor no negativo y reutiliza el bloque para
  `ReversalDef`/`ModifyReversalDef`.
- La ruta local mantiene el límite directo/root y la mutación `RedirectID`.
  Helpers propietarios, Projectiles y `ModifyProjectile` quedan fuera.

## Evidencia

- Core: `aba5897c` (`feat(mugen): support dynamic ReversalDef id`).
- Gate: `6fc75eaa` (`test(evidence): gate dynamic ReversalDef id`).
- Trace requerida:
  `synthetic-imported-ikemen-root-modifyreversaldef-dynamic-id-golden`;
  checksum `27b44d26`, final `c0adb366`.
- `pnpm qa:trace`: `815/815` artifacts (`781` required, `34` optional),
  `0` failures.
- `pnpm typecheck`, compiler/runtime focales y el gate de trace pasan.

## Alcance bloqueado

`chainid`/`nochainid`, Helper-owned `ModifyReversalDef`, Projectile
reflection, priority/hitonce arbitration, overflow/int32 exacto,
sincronización de tick, equipos, rollback y paridad completa de ReversalDef
requieren cortes independientes.

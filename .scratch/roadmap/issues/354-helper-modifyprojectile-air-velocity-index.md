# Issue 354 — Helper `ModifyProjectile air.velocity` index selection

## Estado

- **T780 — queued (2026-08-15)**
- **Área:** runtime / Helper / Projectile / ModifyProjectile / selection
- **Dependencia:** T779 / issue 353

## Objetivo

Probar la selección explícita por `index` de `ModifyProjectile` emitido por un
Helper: con varios Projectiles vivos del mismo `projid`, un índice caller-
context selecciona el orden oldest-first, muta sólo ese elemento y deja los
hermanos y otros ids intactos.

## Alcance permitido

- Un Helper de primera generación y tres Projectiles root-owned.
- Dos Projectiles comparten id; un tercero es trap con id distinto.
- Índice estático y `var()` finita; write `air.velocity` de uno, dos y tres
  componentes con zero-fill `[x,0,0]`, `[x,y,0]`, `[x,y,z]`.
- Un contacto aéreo aceptado del Projectile seleccionado con
  `GetHitVar(xvel/yvel/zvel)`, física, lifecycle, target links y ownership.

## Fuera de alcance

Id cero/omitido, índices negativos o fuera de rango, fresh/default derivation,
dynamic `n`, nested Helpers, shared/team topology, multi-target contact, exact
timing/rounding, rollback, and full M.U.G.E.N/Ikemen parity.

## Autoridad

Ikemen GO `149402f` mantiene matches oldest-first y aplica `index` después del
selector de id; `ModifyProjectile` evalúa expresiones en el caller. La
mutación viva es Ikemen-only; M.U.G.E.N 1.1 sólo documenta `Projectile`.

## Evidencia requerida

- Focused Projectile/Helper tests for oldest-first index selection, caller
  one-shot evaluation, zero-fill, and sibling/trap isolation.
- Required Helper -> Projectile trace with same-id siblings, an indexed
  airborne hit, lifecycle/target/ownership evidence, and no mutation of the
  other same-id sibling or trap id.
- Typecheck, `git diff --check`, and aggregate QA recorded with inherited
  blockers preserved.

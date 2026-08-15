# Issue 354 — Helper `ModifyProjectile air.velocity` index selection

## Estado

- **T780 — closed-bounded (2026-08-15)**
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

## Cierre T780

- Evidence commits: `8e41ec21` (`test(runtime): cover Helper
  ModifyProjectile index selection`) and `d846fca3` (`test(evidence): add
  Helper ModifyProjectile index trace`).
- Required trace: `synthetic-imported-helper-modifyprojectile-air-velocity-index.json`.
- Trace checksum: `4c940f16`; final checksum: `97569603`; gate passed.
- Focused `ProjectileSystem` and `EffectActorSystem` regressions prove static
  and caller-context `var()` index resolution, oldest-first selection, one-shot
  evaluation, zero-fill `[x,y,z]`, and isolation of the older same-id sibling
  plus the different-id trap.
- Required Helper trace proves three Helper-parented Projectiles: ids `8915`,
  `8916`, `8915`; only the indexed newer `8915` reaches the accepted airborne
  hit with `GetHitVar`/`HitVelSet`, lifecycle, owner/root/parent and target-link
  evidence. Aggregate `pnpm run qa:trace` produced `862/863` artifacts
  (`829` required, `34` optional); the only failure remains the inherited
  `synthetic-imported-helper-bind-to-target-redirect` target-link blocker.
- `pnpm run typecheck`, focused tests, targeted trace, and `git diff --check`
  pass.

## Next cut

T781 will cover the same explicit oldest-first `index` selection seam for
Helper-owned live `ModifyProjectile down.velocity`, proving that the selected
lying-hit Projectile changes while same-id siblings and a different-id trap
remain unchanged. Keep id-zero/omitted selection, fresh/default derivation,
dynamic `n`, nested/shared topology, exact timing, rollback, and full parity
separate.

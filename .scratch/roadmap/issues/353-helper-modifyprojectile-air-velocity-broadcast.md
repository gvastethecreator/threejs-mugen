# Issue 353 — Helper `ModifyProjectile air.velocity` broadcast

## Estado

- **T779 — queued (2026-08-15)**
- **Área:** runtime / Helper / Projectile / ModifyProjectile / selection
- **Dependencia:** T778 / issue 352

## Objetivo

Probar el siguiente borde de selección: un `ModifyProjectile air.velocity`
emitido por un Helper debe evaluar sus expresiones una sola vez en el caller y
difundir el mismo vector cero-rellenado a todos los Projectiles vivos que
coincidan con el selector explícito, sin tocar otro `projid`.

## Alcance permitido

- Un Helper de primera generación y dos Projectiles root-owned con ids
  distintos, uno seleccionado y otro trampa.
- Escritura estática y `var()` finita de uno, dos y tres componentes con la
  semántica pinned `[x,0,0]`, `[x,y,0]`, `[x,y,z]`; omisión completa no-op.
- Un contacto aéreo aceptado del Projectile seleccionado con física,
  `GetHitVar(xvel/yvel/zvel)`, lifecycle, target links y ownership.

## Fuera de alcance

Fresh/default derivation, dynamic `n`, selección por id cero/omitido, nested
Helpers, shared/team topology, multi-target contact, exact timing/rounding,
rollback, and full M.U.G.E.N/Ikemen parity.

## Autoridad

Ikemen GO `149402f` evalúa el parámetro de `ModifyProjectile` en el caller y
aplica el resultado a cada Projectile seleccionado. `air.velocity` es un
parámetro heredado por Projectile en M.U.G.E.N 1.1; la mutación viva es
Ikemen-only.

## Evidencia requerida

- Focused Projectile/Helper tests for one-shot caller evaluation, selector
  broadcast, zero-fill and non-selected isolation.
- Required Helper -> Projectile trace with two live ids, one accepted
  airborne hit, and lifecycle/target/ownership evidence.
- Typecheck, `git diff --check`, and aggregate QA recorded with inherited
  blockers preserved.

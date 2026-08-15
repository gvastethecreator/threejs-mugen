# Issue 356 — Helper `ModifyProjectile ground.velocity` index selection

## Estado

- **T782 — closed-bounded (2026-08-15)**
- **Área:** runtime / Helper / Projectile / ModifyProjectile / selection
- **Dependencia:** T781 / issue 355

## Objetivo

Extender la selección explícita por `index` al vector `ground.velocity`: un
`ModifyProjectile` emitido por un Helper debe seleccionar el match oldest-first
entre Projectiles vivos del mismo `projid`, mutar sólo ese Projectile y dejar
intactos los hermanos y un id trampa.

## Alcance permitido

- Un Helper de primera generación y tres Projectiles root-owned: dos con el
  mismo id y uno con id distinto.
- Índice estático y `var()` finita evaluados una vez en el caller del Helper.
- `ground.velocity` de uno, dos y tres componentes con preservación viva por
  componente: `[x]` reemplaza X y conserva Y/Z, `[x,y]` reemplaza X/Y y
  conserva Z, `[x,y,z]` reemplaza el triple.
- Un grounded hit aceptado del Projectile seleccionado con
  `GetHitVar(xvel/yvel/zvel)`, física, lifecycle, target links y ownership.

## Fuera de alcance

Id cero/omitido, índices negativos o fuera de rango, fresh/default derivation,
dynamic `n`, nested Helpers, shared/team topology, multi-target contact, exact
timing/rounding, rollback, y full M.U.G.E.N/Ikemen parity.

## Autoridad

Ikemen GO `149402f` mantiene la selección oldest-first y aplica `index` después
del selector de id; `ModifyProjectile` evalúa la expresión en el caller y
`ground.velocity` es un parámetro heredado por Projectile. La mutación viva es
Ikemen-only; M.U.G.E.N 1.1 documenta el parámetro en `Projectile`, no el
controlador `ModifyProjectile`.

## Evidencia requerida

- Focused Projectile/Helper tests para resolución caller-context, selección
  oldest-first, preservación por componente y aislamiento de siblings/trap.
- Required Helper -> Projectile trace con grounded hit aceptado, lifecycle,
  target/ownership y payload seleccionado.
- Typecheck, `git diff --check`, y aggregate QA con los blockers heredados
  registrados sin ocultarlos.

## Cierre T782

- Runtime commit: `40738a8b`.
- Evidence commit: `754f0909`.
- Required trace: `synthetic-imported-helper-modifyprojectile-ground-velocity-index`.
- Trace checksum/final checksum: `b4b36888` / `bda09a12`.
- Focal Projectile/Helper and trace tests pass; `pnpm run typecheck` and
  `git diff --check` pass.
- Aggregate QA: `865` artifacts (`831` required, `34` optional), `864` pass,
  one inherited failure remains at
  `synthetic-imported-helper-bind-to-target-redirect` (target-link evidence).

The required trace proves Helper caller-context `ModifyProjectile` with
`id=8922`, `index=var(3)=1`: the newer same-id Projectile receives
`ground.velocity=-7,-5,0`, reaches a grounded hit, and exposes the vector via
`HitVelSet`/`GetHitVar`; the older same-id Projectile and id `8923` trap remain
unhit. The focused runtime matrix separately proves omitted Y/Z siblings are
preserved instead of zero-filled.

## Next bounded slice

T783 will cover the same explicit oldest-first `index` selector for Helper-owned
live `ModifyProjectile guard.velocity`, with a grounded guard and sibling/trap
isolation. Defaults, zero/omitted and out-of-range indices, nested/team
topology, dynamic `n`, exact timing, rollback and full parity remain excluded.

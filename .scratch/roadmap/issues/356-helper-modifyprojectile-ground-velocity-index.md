# Issue 356 — Helper `ModifyProjectile ground.velocity` index selection

## Estado

- **T782 — queued (2026-08-15)**
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
- `ground.velocity` de uno, dos y tres componentes con zero-fill
  `[x,0,0]`, `[x,y,0]`, `[x,y,z]`.
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
  oldest-first, zero-fill y aislamiento de siblings/trap.
- Required Helper -> Projectile trace con grounded hit aceptado, lifecycle,
  target/ownership y payload seleccionado.
- Typecheck, `git diff --check`, y aggregate QA con los blockers heredados
  registrados sin ocultarlos.

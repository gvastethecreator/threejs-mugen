# Issue 358 — Helper `ModifyProjectile airguard.velocity` index selection

## Estado

- **T784 — closed-bounded (2026-08-15)**
- **Área:** runtime / Helper / Projectile / ModifyProjectile / selection / air guard
- **Dependencia:** T783 / issue 357

## Objetivo

Extender la selección explícita por `index` al vector `airguard.velocity`: un
`ModifyProjectile` emitido por un Helper debe seleccionar el match oldest-first
entre Projectiles vivos del mismo `projid`, mutar sólo ese Projectile y dejar
intactos los hermanos y un id trampa. El Projectile seleccionado debe alcanzar
un guard aéreo real y exponer la velocidad guardada.

## Alcance permitido

- Un Helper de primera generación y tres Projectiles root-owned: dos con el
  mismo id y uno con id distinto.
- Índice estático y `var()` finita evaluados una vez en el caller del Helper.
- `airguard.velocity` explícito de uno, dos y tres componentes según el
  contrato live ya cubierto.
- Un guard airborne aceptado del Projectile seleccionado con
  `GetHitVar(xvel/yvel/zvel)`, física, lifecycle, target links y ownership.

## Fuera de alcance

Id cero/omitido, índices negativos o fuera de rango, defaults/fresh derivation,
dynamic `n`, grounded `guard.velocity`, nested Helpers, shared/team topology,
multi-target contact, exact timing/rounding, rollback y full M.U.G.E.N/Ikemen
parity.

## Autoridad

Ikemen GO `149402f` aplica `index` después del selector de id y evalúa el
controlador en el caller; la mutación viva de `ModifyProjectile` es
Ikemen-only. M.U.G.E.N 1.1 documenta `airguard.velocity` en Projectile, pero
no el controlador `ModifyProjectile`.

## Evidencia requerida

- Focused Projectile/Helper tests para resolución caller-context, selección
  oldest-first, reemplazo por componente e aislamiento de siblings/trap.
- Required Helper → Projectile trace con guard aéreo aceptado, lifecycle,
  target/ownership y payload seleccionado.
- Typecheck, `git diff --check`, y aggregate QA con blockers heredados
  registrados sin ocultarlos.

## Cierre T784

- Commits: `7cf9ec6` (Projectile/Helper selection tests) y `506b35dd`
  (required trace, preset y QA registry).
- Focused gate: 3 archivos, 39 tests pasan; `pnpm run typecheck` y
  `git diff --check` pasan.
- Required trace:
  `synthetic-imported-helper-modifyprojectile-airguard-velocity-index.json`;
  trace checksum `f00d561f`, final checksum `578f30d2`.
- La evidencia prueba Helper de primera generación, tres Projectiles
  root-owned, selección `index=1` sobre el segundo match del mismo id,
  aislamiento del hermano y del id trampa, guard aéreo aceptado,
  `GetHitVar(xvel/yvel/zvel)=7/-5/2`, física, lifecycle, ownership y target
  links.
- Aggregate QA: `867` artefactos (`833` required, `34` optional), `866`
  passed y `1` failed. El único fallo es heredado:
  `synthetic-imported-helper-bind-to-target-redirect` por target link faltante;
  no pertenece a T784.

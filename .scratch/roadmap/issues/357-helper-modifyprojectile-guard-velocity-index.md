# Issue 357 — Helper `ModifyProjectile guard.velocity` index selection

## Estado

- **T783 — closed-bounded (2026-08-15)**
- **Área:** runtime / Helper / Projectile / ModifyProjectile / selection
- **Dependencia:** T782 / issue 356

## Objetivo

Extender la selección explícita por `index` al vector `guard.velocity`: un
`ModifyProjectile` emitido por un Helper debe seleccionar el match oldest-first
entre Projectiles vivos del mismo `projid`, mutar sólo ese Projectile y dejar
intactos los hermanos y un id trampa. El Projectile seleccionado debe alcanzar
un guard real y exponer la velocidad guardada.

## Alcance permitido

- Un Helper de primera generación y tres Projectiles root-owned: dos con el
  mismo id y uno con id distinto.
- Índice estático y `var()` finita evaluados una vez en el caller del Helper.
- `guard.velocity` explícito de uno, dos y tres componentes con el zero-fill
  live ya cubierto por el contrato `ModifyProjectile`: `[x,0,0]`, `[x,y,0]`,
  `[x,y,z]`.
- Un guard grounded aceptado del Projectile seleccionado con
  `GetHitVar(xvel/yvel/zvel)`, física, lifecycle, target links y ownership.

## Fuera de alcance

Id cero/omitido, índices negativos o fuera de rango, defaults/fresh derivation,
dynamic `n`, airborne `airguard.velocity`, nested Helpers, shared/team
topology, multi-target contact, exact timing/rounding, rollback y full
M.U.G.E.N/Ikemen parity.

## Autoridad

Ikemen GO `149402f` aplica `index` después del selector de id y evalúa el
controlador en el caller; la mutación viva de `ModifyProjectile` es
Ikemen-only. M.U.G.E.N 1.1 documenta `guard.velocity` en Projectile, pero no
el controlador `ModifyProjectile`.

## Resultado y evidencia

- Commits `f6a8fb9f` y `d26a515d` añaden focused Projectile/Helper tests y la
  required trace `synthetic-imported-helper-modifyprojectile-guard-velocity-index`.
- Trace checksum `e4a518cc`, final checksum `a1b24816`: Helper caller-context,
  índice dinámico `var(3)=1`, oldest-first, dos Projectiles con el mismo id,
  trampa aislada, guard grounded aceptado, `GetHitVar(xvel/yvel/zvel)=7/-5/2`,
  física, lifecycle, ownership y target links.
- `pnpm run typecheck`, focused Vitest y `git diff --check` pasan. Aggregate
  QA: `866` artifacts (`832` required, `34` optional), `865` pasan; queda sólo
  el blocker heredado `synthetic-imported-helper-bind-to-target-redirect`.

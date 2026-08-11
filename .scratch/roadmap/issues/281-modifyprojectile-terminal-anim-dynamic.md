# T707 — `ModifyProjectile` terminal animations dinámicas

## Status

`closed-bounded` — implementado y verificado el 2026-08-11.

## Goal

Cerrar el reemplazo dinámico, en contexto del caller, de las animaciones
terminales `projhitanim`, `projremanim` y `projcancelanim` para
`ModifyProjectile`. El corte reutiliza la selección y el reset de AIR ya
cerrados por T705/T706 y no amplía la semántica FFX ni la paridad completa.

## Official reference

- Ikemen-GO pin `149402fa`:
  - `src/compiler_functions.go:2403-2422` compila los tres parámetros como
    expresiones enteras.
  - `src/bytecode.go:8494-8525` los evalúa una vez en el caller y los aplica
    a los Projectiles seleccionados.
  - `src/bytecode.go:3968-3989` expone las acciones mediante `ProjVar`.
- M.U.G.E.N 1.1 no documenta `ModifyProjectile`; el claim es Ikemen-only.

## Local contract

Allowed:

- IR typed estático/dinámico para los tres parámetros, con expresión finita
  truncada a entero.
- Resolución única en el caller root o Helper y broadcast sólo dentro de la
  selección/ownership existente.
- Reemplazo de las acciones terminales existentes, lookup AIR y reset de
  reproducción ya soportados.
- Omisión preserva la acción viva; un valor no resoluble falla cerrado sin
  mutar el Projectile.

Blocked:

- Prefijos FFX, warning/clamp exacto de valores negativos, overflow y timing
  de destrucción inválida.
- `ModifyProjectile` de otras propiedades, namespace broadcast, teams,
  rollback y paridad completa de Projectile.

## Evidence required

1. Compiler/runtime tests para cada terminal animation (estático, expresión,
   malformed y omisión).
2. Root y Helper caller-context tests que prueben la mutación seleccionada y
   preserven un Projectile fuera de ownership.
3. Required trace con operaciones `Projectile`/`ModifyProjectile`, lifecycle,
   target/ownership y al menos una acción terminal observada; las otras dos
   quedan cubiertas por tests focales si no comparten una ruta causal durable.
4. Closeout gates: focused tests, `pnpm typecheck`, `pnpm qa:trace`, full
   `pnpm test`, `pnpm build` y `git diff --check`.

## Acceptance / closeout

Los tres parámetros terminales aceptan expresiones typed, se resuelven una vez
en caller root/Helper y alimentan el reemplazo AIR existente sin mutaciones
fuera de selección. El gate dedicado
`synthetic-imported-modifyprojectile-dynamic-terminal-anim.json` pasa con
trace `67162459` y final `96ff2073`; la cobertura focal del corte y el
typecheck pasan. La ejecución completa de `pnpm qa:trace` también pasa:
`792/792` artefactos, `758` requeridos y `34` opcionales, sin fallos.

La claim sigue siendo Ikemen-only. FFX, warning/clamp exacto de negativos y
overflow, timing de acción inválida, broadcast entre namespaces, teams,
rollback y paridad completa de Projectile permanecen bloqueados.

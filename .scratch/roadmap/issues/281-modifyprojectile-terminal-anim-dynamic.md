# T707 — `ModifyProjectile` terminal animations dinámicas

## Status

`planned` — siguiente corte bounded después de T706.

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

## Acceptance

El corte sólo podrá cerrarse como bounded cuando los tres parámetros
terminales acepten expresiones typed, se resuelvan una vez en el caller y
alimenten el reemplazo AIR existente sin mutaciones fuera de selección. La
claim seguirá siendo Ikemen-only y conservará los bloqueos declarados.

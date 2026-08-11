# T706 — Helper-owned `ModifyProjectile projanim` dinámico

## Status

`closed-bounded` — implementado y verificado el 2026-08-11.

## Goal

Cerrar la variante Helper-local del `ModifyProjectile projanim` de Ikemen.
Un Helper debe poder resolver una expresión `projanim` una sola vez en su
contexto (`Parent`/`Root`/`Var`) y reemplazar el AIR action de los Projectiles
que él posee, manteniendo intacto un Projectile del jugador que no pertenece a
ese Helper.

## Official reference

- Ikemen-GO pin `149402fa`:
  - `src/compiler_functions.go:2513-2517` compila `projanim` como una
    expresión entera de un valor.
  - `src/bytecode.go:8650-8662` evalúa una vez en el caller y aplica el
    reemplazo a cada Projectile seleccionado; también actualiza la referencia
    AIR.
  - `src/bytecode.go:3960-3962` expone el action number mediante
    `ProjVar(projanim)`.
- M.U.G.E.N 1.1 no documenta `ModifyProjectile`; esta es una compatibilidad
  Ikemen acotada.

## Local contract

Allowed:

- `ModifyProjectile` ejecutado por el micro-VM de un Helper.
- Sólo Projectiles helper-parented seleccionados por la ownership filter ya
  existente (`parentId`/root del Helper).
- Expresión estática o dinámica de un valor, resuelta una vez en el caller
  Helper, con truncado entero finito y lookup AIR existente.
- Reset de reproducción, telemetría de operación y lifecycle/parent evidence
  existentes.
- Un Projectile player-owned paralelo no se modifica.

Blocked:

- FFX prefixes, invalid-action destruction timing y warning/overflow parity.
- Helper redirects que seleccionen Projectiles de otro namespace, broadcast
  global, nested teams/simul, terminal playback exacto y rollback.
- Full Helper/Projectile parity y `ModifyProjectile` params distintos de
  `projanim`.

## Evidence required

1. Compiler/runtime test: typed dynamic Helper expression resolves through the
   Helper caller and resets the selected action.
2. Ownership regression: helper-parented Projectile changes while a
   player-owned Projectile with the same id remains unchanged.
3. Required trace: Helper + Projectile + ModifyProjectile operations,
   parent/root ownership, action replacement/readback, and spawn/active/remove
   lifecycle.
4. Closeout gates: focused tests, `pnpm typecheck`, `pnpm qa:trace`, full
   `pnpm test`, `pnpm build`, and `git diff --check`.

## Acceptance / closeout

Closed bounded. The Helper-local typed `projanim` expression resolves once in
the Helper caller context, mutates only the helper-parented Projectile, resets
its AIR playback, and leaves a same-id player-owned Projectile unchanged.
Required trace `synthetic-imported-helper-modifyprojectile-dynamic-anim.json`
passes with trace checksum `705a96e0` / final checksum `f47441cf`; aggregate
`pnpm qa:trace` passes `791/791` artifacts (`757` required, `34` optional).
Focused Helper/runtime coverage passes `140/140`; typecheck, full tests,
build, and diff hygiene are recorded in the closeout commits. The trace
records Helper/Projectile/ModifyProjectile telemetry, parent/root ownership,
AIR action replacement, and spawn/active/remove lifecycle.

The bounded claim remains Ikemen-only. FFX prefixes, invalid-action timing,
cross-namespace broadcast, nested teams, terminal playback parity, rollback,
and full Helper/Projectile parity remain blocked.

# Issue 367 — Helper-owned active `EnvColor`

## Estado

- **T792 — closed-bounded (2026-08-15)**
- **Área:** presentation controller / Helper ownership / stage flash evidence
- **Dependencia:** T791 / issue 366

## Contrato cerrado

Un Helper puede ejecutar `EnvColor` activo con `value`, `time` y `under`
resueltos en su contexto caller/Parent. El evento entra una sola vez al mundo
global de color del escenario y conserva `sourceActorId`, `sourceRootId` y
`sourceParentId`. La traza puede exigir esos campos sin fusionar un flash de
igual color de otro origen.

La base primaria es M.U.G.E.N 1.1 `EnvColor` (`sctrls.html`, `value`, `time`,
`under`) y el pin Ikemen GO `149402f`: `compiler_functions.go` compila los tres
valores, `bytecode.go` los evalúa en caller-context y `system.go` conserva el
estado global mientras `time > 0`.

## Alcance probado

- Helper root-owned con `Parent,Var(...)` para RGB, duración positiva y
  `under`.
- Handoff único Helper -> root -> `RuntimeEnvColorWorld` con identidad de
  actor/root/parent.
- Telemetría de controller/operation de Helper y stage-frame con color,
  opacidad, `under` e identidad de origen.
- Artefacto requerido `synthetic-imported-helper-envcolor` con lifecycle,
  payload de Helper y frame de escenario observable.

## Fuera de alcance

`time = -1`, mezcla y orden exactos de capa/ventana, pausa/hitpause, redirects,
Helpers nested/team, rollback, screenpacks y paridad completa M.U.G.E.N/Ikemen.

## Evidencia de cierre

- **Producto:** `2c5ce0fe` (`feat(runtime): route Helper-owned EnvColor presentation`).
- **Traza requerida:** `synthetic-imported-helper-envcolor`.
- **Checksums:** trace `68d3329b`; final `1b28cd00`.
- **Gates:** pruebas focales EnvColor/Helper/traza, `pnpm typecheck`, build y
  `pnpm qa:trace` pasan; QA registra 871/871 artefactos y 837/837 requeridos.

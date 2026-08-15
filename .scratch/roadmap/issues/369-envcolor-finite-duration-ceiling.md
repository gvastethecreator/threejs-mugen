# Issue 369 — finite `EnvColor` duration without the local ceiling

## Estado

- **T794 — closed-bounded (2026-08-15)**
- **Área:** active EnvColor / finite lifetime / presentation evidence
- **Dependencia:** T793 / issue 368

## Objetivo

Eliminar el límite local de 240 ticks para una duración positiva finita de
`EnvColor`. M.U.G.E.N 1.1 documenta `time` como número de ticks sin un máximo
y el pin Ikemen GO `149402f` almacena el entero evaluado y lo decrementa
mientras sea positivo.

## Claim previsto

Un `EnvColor` root o Helper con duración positiva mayor que 240 conserva su
contador authored hasta expirar, sin convertirse en duración indefinida. La
evidencia distingue el contador finito de `time = -1`, del cero ignorado y de
una sustitución posterior.

## Criterios de cierre

- Documentación M.U.G.E.N 1.1 y pin Ikemen comparados antes de quitar el
  clamp local.
- Mundo root, compilación y resolución Helper prueban `time = 241`; el mundo
  conserva `remaining = 1` y expira en el tick siguiente.
- Traza requerida `synthetic-imported-envcolor-long-finite` prueba 241 frames
  visibles, expiración final y operación `envcolor` con checksum `6a60ee57` /
  final `58e50e4b`.
- `time = 0`, `time = -1`, reemplazo y reset de T793 siguen cubiertos.

## Cierre

- **Producto:** `1cab062e` (`feat(runtime): lift EnvColor finite duration cap`)
- **Gates:** EnvColor/Helper/compiler focal `258/258`, traza focal `1/1`,
  `pnpm typecheck`, `pnpm build` y `pnpm qa:trace` `873/873` (`839` required)
  pasan.
- **Claim permitido:** el compilador y runtime preservan una duración positiva
  finita authored mayor que 240; root y Helper resuelven ese valor, y una traza
  root requerida distingue su expiración de la ruta indefinida.
- **Claim bloqueado:** overflow/int32, límites de memoria para historiales
  largos, mezcla/capas/ventanas exactas, pausa/hitpause, nested/team ownership,
  renderer, rollback y paridad completa.

## Siguiente corte

T795 / issue 370 evalúa por separado el techo finito equivalente de
`EnvShake`; no amplía este cierre de `EnvColor`.

## Fuera de alcance

Overflow/int32, límites de memoria para historiales largos, mezcla/capas/
ventanas, pausa/hitpause, nested/team ownership, renderer exacto, rollback y
paridad completa no forman parte del corte.

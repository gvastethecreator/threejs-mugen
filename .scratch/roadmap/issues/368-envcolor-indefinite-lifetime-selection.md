# Issue 368 — `EnvColor time = -1` lifetime and replacement

## Estado

- **T793 — closed-bounded (2026-08-15)**
- **Área:** active EnvColor / lifetime semantics / presentation evidence
- **Dependencia:** T792 / issue 367

## Objetivo

Cerrar la duración infinita `EnvColor time = -1`. M.U.G.E.N 1.1 la documenta
como indefinida y el pin Ikemen GO conserva el contador mientras no sea
positivo.

## Claim previsto

Un flash `time = -1` puede permanecer activo hasta una sustitución o reset
explícito. Un `EnvColor` posterior reemplaza el anterior y, cuando expira, no
resucita el flash indefinido. Cero sigue sin emitir evento.

## Alcance probado

- `time = -1` estático compilado y resuelto desde el caller de Helper.
- Flash persistente con `remaining = -1` durante múltiples ticks.
- Sustitución por un nuevo `EnvColor`, expiración de la sustitución y reset.
- Artefacto requerido con telemetría de controller/operation y frames de
  escenario antes y después de la sustitución.

## Fuera de alcance

La duración finita positiva todavía conserva el límite local de 240 ticks y
queda en la siguiente selección. Mezcla exacta, orden de capa/ventana, pausa,
redirects, nested/team ownership, rollback y paridad completa quedan fuera.

## Evidencia de cierre

- **Producto:** `d98a5443` (`feat(runtime): persist indefinite EnvColor`).
- **Traza requerida:** `synthetic-imported-envcolor-indefinite`.
- **Checksums:** trace `7481ebbf`; final `2c8cedc7`.
- **Gates:** pruebas focales EnvColor/Helper/compiler/traza, `pnpm typecheck`,
  `pnpm build`, cinco suites de evidencia DA29/DA30 (`186/186`) y
  `pnpm qa:trace` (`872/872`, `838/838` requeridos) pasan.

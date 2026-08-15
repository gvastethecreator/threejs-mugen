# Issue 368 — next `EnvColor` lifetime selection

## Estado

- **T793 — queued (2026-08-15)**
- **Área:** active EnvColor / lifetime semantics / presentation evidence
- **Dependencia:** T792 / issue 367

## Objetivo

Seleccionar y, si el receptor local permite una prueba acotada, cerrar la
duración infinita `EnvColor time = -1`. M.U.G.E.N 1.1 la documenta como
indefinida y el pin Ikemen GO conserva el contador mientras no sea positivo.

## Claim previsto

Un único flash root o Helper puede permanecer activo hasta una sustitución o
reset explícito, con evidencia de duración y de reemplazo. No se incluirán
mezcla exacta, orden de capa/ventana, pausa, nested/team ownership, rollback ni
paridad completa sin una ruta observable separada.

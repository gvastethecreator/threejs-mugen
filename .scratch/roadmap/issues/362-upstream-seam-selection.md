# Issue 362 — next official/Ikemen seam selection

## Estado

- **T789 — closed-bounded (2026-08-15)**
- **Área:** roadmap / official parity / runtime seam selection
- **Dependencia:** T787 / issue 361

## Objetivo

Seleccionar el siguiente corte pequeño del port comparando la documentación
M.U.G.E.N 1.1 con el pin Ikemen GO `149402f` y el estado real del runtime. La
selección produjo el contrato T788 de `EnvShake` activo `mul`/`dir`; el trabajo
cerrado queda en [issue 363](363-active-envshake-mul-dir.md).

## Criterios de selección

T788 cerró el par active EnvShake mul/dir y T789 cerró diradd/decay. Los
detalles y la evidencia quedan en issues 363 y 364; la siguiente selección es
T790, ownership de EnvShake activo en Helpers, registrada en issue 365.

- El parámetro o controlador debe existir en una fuente oficial identificable.
- El hueco debe ser observable en una ruta existente de `ControllerOps` y un
  consumidor runtime concreto.
- El corte debe poder cerrarse con una prueba enfocada y una traza requerida,
  dejando explícitos los límites de ownership, timing y rollback.
- Antes de escribir producción, actualizar el mapa de callers, la matriz de
  soporte y este issue con la autoridad exacta y el contrato de omisión.

## Fuera de alcance

Paridad completa, todos los controladores restantes en un único ticket,
Projectile/ModifyProjectile/ReversalDef por arrastre, equipos/simul, rollback,
timing exacto y cambios de score sin evidencia runtime.

## Salida requerida

La selección concreta T790 (ownership de EnvShake activo en Helpers) se cerró
en [issue 365](365-active-envshake-helper-ownership.md). La siguiente revisión
queda registrada como T791 en [issue 366](366-upstream-seam-selection-after-envshake-helper.md).

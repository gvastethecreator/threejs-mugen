# Issue 362 — next official/Ikemen seam selection

## Estado

- **T788 — queued (2026-08-15)**
- **Área:** roadmap / official parity / runtime seam selection
- **Dependencia:** T787 / issue 361

## Objetivo

Seleccionar el siguiente corte pequeño del port comparando la documentación
M.U.G.E.N 1.1 con el pin Ikemen GO `149402f` y el estado real del runtime. La
selección debe producir un único contrato ejecutable, no una lista genérica de
paridad.

## Criterios de selección

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

Un issue sucesor concreto (campo, seam, autoridad, tests, trace y exclusiones)
reemplazará esta selección antes de comenzar el siguiente cambio de producto.

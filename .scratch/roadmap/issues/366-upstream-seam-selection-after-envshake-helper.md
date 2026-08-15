# Issue 366 — next upstream seam after Helper-owned EnvShake

## Estado

- **T791 — queued (2026-08-15)**
- **Área:** upstream seam selection / presentation ownership / evidence
- **Dependencia:** T790 / issue 365

## Objetivo

Comparar de nuevo la documentación oficial M.U.G.E.N 1.1 y el pin Ikemen GO
`149402f` después del cierre de ownership de EnvShake, elegir un único corte
pequeño y observable, y dejar su claim separado de waveform, pause/stage/layer,
topología nested/team y paridad completa.

## Candidatos priorizados

1. `EnvShake` pause/stage/layer handoff, sólo si el runtime puede observar una
   regla concreta sin introducir una cámara por Helper.
2. Ownership nested/team de un Helper activo, únicamente con identidad,
   lifecycle y un evento no duplicado.
3. Otro controlador de presentación con contrato oficial acotado y una traza
   reproducible.

## Criterios de selección

- Fuente primaria enlazada y semántica comparada antes de tocar código.
- Una ruta root y una ruta negativa/rechazo que puedan probarse en la suite
  focal.
- Una traza requerida con checksum/final checksum y exclusiones explícitas.
- No ampliar el claim a rollback, waveform exacta, screenpacks, equipos o
  paridad total.

## Fuera de alcance

No se implementa ningún candidato en este issue; la implementación será un
corte posterior con su propio commit de producto, evidencia y actualización de
roadmap.

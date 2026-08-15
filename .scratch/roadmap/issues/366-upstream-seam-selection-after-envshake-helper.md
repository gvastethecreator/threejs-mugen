# Issue 366 — next upstream seam after Helper-owned EnvShake

## Estado

- **T791 — closed-selection (2026-08-15)**
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

## Resultado de la selección

T791 seleccionó **T792: `EnvColor` activo propiedad de un Helper**. M.U.G.E.N
1.1 documenta el flash global `value`, `time` y `under`; el pin Ikemen GO
`149402f` compila los valores en el contexto del caller y los escribe en el
estado global de presentación. El runtime local ya tenía el receptor global,
pero el VM de Helper no podía despachar ni atribuir el controller. La
implementación y la evidencia quedan en [issue
367](367-helper-envcolor-presentation-ownership.md).

## Criterios de selección

- Fuente primaria enlazada y semántica comparada antes de tocar código.
- Una ruta root y una ruta negativa/rechazo que puedan probarse en la suite
  focal.
- Una traza requerida con checksum/final checksum y exclusiones explícitas.
- No ampliar el claim a rollback, waveform exacta, screenpacks, equipos o
  paridad total.

## Fuera de alcance

T791 no amplía `EnvColor` a duración infinita, mezcla/capas exactas, pausa,
redirects, Helpers nested/team, rollback ni paridad total. Esas decisiones
quedan fuera del corte T792 y de la siguiente selección.

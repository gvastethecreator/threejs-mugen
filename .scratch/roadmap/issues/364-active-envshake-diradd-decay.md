# Issue 364 — next official seam: active EnvShake `diradd` / `decay`

## Estado

- **T789 — queued (2026-08-15)**
- **Área:** active state controller / camera shake / Ikemen parity
- **Dependencia:** T788 / issue 363

## Objetivo

Comparar y cerrar, en un corte separado, `EnvShake.diradd` y `EnvShake.decay`
del pin Ikemen GO `149402f`. El pin los compila como floats y los aplica por
frame al ángulo y al factor de amplitud; M.U.G.E.N 1.1 no los documenta.

## Criterios de aceptación

- IR y fallback dinámico caller-context para ambos escalares.
- Evento de cámara conserva los valores y el cálculo demuestra dirección
  variable y decaimiento observable en dos ticks.
- Una traza requerida separa `diradd`/`decay` de `mul`/`dir` ya cerrado.

## Fuera de alcance

Helper activo, RedirectID, Projectile/ModifyProjectile, waveform exacta de
M.U.G.E.N, localcoord, pause/stage/layer, equipos, rollback y paridad completa.

# Issue 364 — next official seam: active EnvShake `diradd` / `decay`

## Estado

- **T789 — closed-bounded (2026-08-15)**
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

## Resultado

- Producto: commit 63ef2769.
- EnvShake conserva y resuelve diradd/decay finitos en contexto del actor; el
  evento y la evidencia de traza retienen ambos campos.
- La cámara aplica diradd por edad y decay por fracción de tiempo restante,
  manteniendo el camino legado sin extensiones Ikemen.
- Focal: 25 pruebas EnvShake/compiler/trace, typecheck y diff hygiene pasan.
- Traza requerida: synthetic-imported-envshake-diradd-decay pasa con
  dirAdd=20 y decay=1.25.

El gate agregado pnpm qa:trace conserva un bloqueo heredado y ajeno a T789 en
synthetic-imported-helper-bind-to-target-redirect (target link p1/p2 hacia 77).

## Siguiente selección

T790 queda abierto para evaluar EnvShake activo dentro de Helpers, con una
traza separada y sin arrastrar diradd/decay a contactos, caídas ni Projectiles.

# Issue 365 — next official seam: Helper-owned active EnvShake

## Estado

- **T790 — queued (2026-08-15)**
- **Área:** active state controller / Helper ownership / camera shake
- **Dependencia:** T789 / issue 364

## Objetivo

Comparar la semántica de EnvShake activo ejecutado por un Helper en el pin
Ikemen GO 149402f con el runtime local. El corte debe demostrar ownership
root/parent del evento y conservar mul, dir, diradd y decay sin crear una
cámara independiente para el Helper.

## Criterios de aceptación

- Un Helper ejecuta EnvShake con evaluación caller/parent-context y el evento
  queda asociado al root que presenta la cámara.
- La evidencia conserva actor/root/parent identity y los campos de shake sin
  duplicar el evento por Helper y root.
- Una traza requerida prueba Helper/EnvShake/lifecycle y una proyección de
  cámara observable; la suite focal cubre ausencia de Helper y cleanup.

## Fuera de alcance

ModifyHitDef, ModifyProjectile, env-shakes de contacto/caída, waveform exacta,
pause/stage/layer, screenpacks, nested/team ownership, rollback, localcoord y
paridad completa.

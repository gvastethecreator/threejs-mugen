# Issue 365 — next official seam: Helper-owned active EnvShake

## Estado

- **T790 — closed-bounded (2026-08-15)**
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

## Cierre

- **Producto:** `d5077de6` (`feat(runtime): route Helper-owned EnvShake presentation`)
- **Trace requerida:** `synthetic-imported-helper-envshake`
- **Trace checksum:** `f75a9af7`
- **Final checksum:** `0f9f927d`
- **Focused proof:** required trace gate 1/1, `pnpm run typecheck` y
  `git diff --check` pasan.

El Helper resuelve `Parent,Var(...)` en su contexto, emite una sola vez en el
buffer de presentación del actor raíz y conserva `ownerId`, `rootId` y
`parentId` en el evento. La proyección de cámara existente consume el evento
sin crear una cámara separada para el Helper. Nested/team ownership, waveform,
pause/stage/layer, contacto/caída, rollback y paridad completa siguen fuera de
este corte.

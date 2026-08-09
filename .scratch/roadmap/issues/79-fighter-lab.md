# T505 — Fighter Lab para animaciones, atlas, colisiones y VFX

Status: closed-bounded
Labels: product, runtime, spritesheets, browser-qa
Lane: content / product tooling
Priority: P0
Depends on: T503

## Objetivo

Agregar una vista directa para revisar cada personaje del roster sin iniciar
un combate. Debe permitir elegir luchador, acción y cuadro, controlar playback,
ver atlas, cajas de colisión y efectos compartidos.

## Contrato

- Ruta durable: `?mode=lab&fighter=<id>&action=<id>&frame=<index>`.
- Selector limitado al roster nativo actual: Rocco Vidal y Nadia Arce.
- 14 acciones de personaje y 3 previews VFX por luchador.
- Scrubber exacto por cuadro; un deep link con `frame` abre pausado.
- Controles de play, step, reset, speed, grid, axis, Clsn1 y Clsn2.
- Lente con sprite group/index, duración, offset, loop, flip, blend, cajas,
  atlas, manifest, mapa runtime, contacto y estado del motion QA.

## Implementación

- `src/app/App.ts`: modo `lab`, navegación, estado URL, runtime aislado,
  selector de acciones/cuadros y lente de evidencia.
- `src/mugen/runtime/CharacterInstance.ts`, `MugenRuntime.ts` y `types.ts`:
  comando acotado `select-frame` con clamp y `animTime` coherente.
- `src/styles/fighter-lab.css`: superficie de tres capas sobre el viewport.
- `scripts/qa_browser_gate_fighter_lab.cjs`: gate browser focalizado.
- El selector de modo ahora usa `button[data-mode]`; el atributo del shell ya
  no intercepta clicks de checkboxes u otros controles internos.

## Evidencia 2026-08-01

- `pnpm qa:browser:fighter-lab`: pass en 7.8 s.
- Rocco: Action 200, frame 3/4, pausado, 4 thumbnails, atlas cargado.
- Nadia: Action 220, frame 8/8, pausado, 8 thumbnails, atlas cargado.
- Hit spark: Action 7001, 3 cuadros.
- Dos luchadores, 17 controles de acción por luchador, drawers visibles,
  WebGL con más de 100 renders y sin errores de consola o página.
- Capturas y reporte en `.scratch/qa/fighter-lab-gate/`.
- Vitest focal: 3 archivos / 6 tests; typecheck, build y CSS budget verdes.
- El smoke completo llega a Runtime, Studio y exportación sin regresiones del
  roster/Fighter Lab; quedan sólo seis fallos visuales del fixture MUGEN-lite.

## Límite

Kung Fu Man sigue siendo fixture privado importable por Inspect. Fighter Lab no
publica KFM, no genera SFF y no mueve scores M.U.G.E.N/Ikemen.

## Extensión Gallery — evidencia 2026-08-02

La vista `?mode=lab&labView=gallery` amplía el selector nativo a todos los
luchadores cargados por `getAvailableFighters()`, incluidos paquetes
importados. Cada tarjeta muestra identidad, fuente, atlas, acciones, cuadros y
cajas; el panel derecho expone el índice completo de animaciones y abre la
línea temporal existente sin perder `mode`, `fighter`, `action` ni `frame`.

- `pnpm qa:browser:fighter-lab`: pass; 2 tarjetas, 34 acciones y 176 cuadros
  agregados; regreso Gallery -> Timeline verificado.
- Captura visual: `.scratch/qa/fighter-lab-gate/character-gallery.png`.
- La vista no cambia el contrato runtime ni publica Kung Fu Man; el smoke amplio
  quedó en timeout y no se usa como evidencia de pass.

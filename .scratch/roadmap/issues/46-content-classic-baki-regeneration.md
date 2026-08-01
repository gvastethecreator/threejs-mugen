# T461 — Regeneración v2 del roster clásico sobrio

Estado: en progreso
Prioridad: alta
Área: contenido original / spritesheet-expert / runtime

## Objetivo

Regenerar desde cero Mara Cinta, Toro Pixel, Nico Guante, Luna Codo, Sargento
Pila, Bruno Giro, Vera Patada y Rulo Viento con siluetas de artes marciales
exageradas tipo manga de combate, uniformes sobrios y paletas carbón, óxido,
oliva, pizarra, hueso y vino. Se conservan IDs, filas, contratos MUGEN-lite y
rutas del selector para no romper el runtime.

## Hecho

- Ocho identity anchors y ocho action grids originales de Imagegen.
- Runs reproducibles en `.scratch/content-pack/regeneration-v2/runs/*-v2`.
- Provenance, hashes, extracción, atlas PNG/WebP, manifest y source intake.
- Previews runtime de los 14 estados y preview workbench por personaje.
- Paquetes canónicos reemplazados bajo `public/characters/*`, con permisos y
  QA portable.

## Bloqueos explícitos

- `frame-alignment` pasa en los ocho.
- `animation-contracts` e `identity-consistency` siguen rojos: la fuente
  aceptada es una grilla 4×4 y varias filas son recomposición determinista;
  walk/guard/special y escalas extremas requieren nuevas filas provider o
  revisión visual independiente.
- `pnpm qa:content:spritesheets` ejecuta `validate_run.py --stage pre-package`
  sobre los ocho runs y deja el agregado en
  `.scratch/qa/content-pack-spritesheets.json`: provenance, alineación y
  playback runtime pasan en los ocho; animación/identidad fallan y la revisión
  visual queda registrada como `fail` en los ocho con evidencia hash-bound.
- SFF binario, paletas secundarias, colisiones por frame y trazas siguen fuera
  de esta promoción.

## Aceptación siguiente

1. Regenerar filas problemáticas desde provider, no duplicar celdas.
2. Repetir `validate_run.py --stage pre-package` en verde.
3. Ejecutar smoke del selector y ocho trazas antes de promover a "cerrada".

## Probe de remediación (2026-08-01)

Se generó una fila Imagegen `bruno-giro/walk-forward` 4×2 con el identity
anchor y se aisló en `.scratch/content-pack/regeneration-v2/imagegen-probe/`.
Tras extracción chroma neutral-gray, la fila pasó los gates oficiales
`check_animation_contracts.py` y `check_identity_consistency.py`. Es una
prueba, no contenido promovido: hay que repetir la ruta provider por estado y
por personaje antes de sustituir fuentes v2 o reconstruir evidencia hash-bound.

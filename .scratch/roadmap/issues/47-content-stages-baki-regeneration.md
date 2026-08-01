# T462 — Regeneración v2 de escenarios parallax sobrios

Estado: cerrada-bounded
Prioridad: alta
Área: contenido original / build-game-backgrounds / runtime

## Objetivo

Aplicar a los escenarios la misma dirección que al roster: pixel art de combate
severo tipo manga, contraste controlado y ropa/arquitectura sin colorinche. Las
escenas deben conservar zona segura central, horizonte, capas far/mid/near y
scroll parallax real.

## Hecho

- Regenerados con Imagegen los maestros 16:9 de `rooftop-dojo`,
  `patio-dojo-publicidad`, `terminal-supermercado-24h` y `azotea-wifi`.
- Capas v2 derivadas sólo por blur/atenuación/máscara alfa de los píxeles del
  proveedor; provenance y regeneration-map registran cada transformación.
- `background-pack.json`, hashes, composite y scroll GIF pasan
  `validate_background_pack.py` con `representative=true`.
- Se corrigió el renderer de QA de `build-game-backgrounds` para desplazar
  capas no repetibles sin envolverlas; los cuatro `background-scroll.gif`
  ahora contienen 4 frames y 3 pares con movimiento real.
- Runtime `demoStage.ts` usa las capas sobrias y el selector conserva los IDs.
- `pnpm qa:content:stages` valida los cuatro IDs en navegador: 3 capas por
  stage, `deltaX` `0.08/0.42/0.88`, `deltaY` `0.02/0.08/0.16`, offsets
  distintos y ordenados en ambos ejes, assets HTTP 200, dos actores y modo
  match.
- Se inspeccionaron los cuatro composites y los cuatro scroll proofs generados.

## Bloqueos explícitos

- No se declara todavía compatibilidad SFF/DEF de stages ni colisión de suelo;
  permanecen como trabajo separado de T446/T459.

## Cierre bounded

1. Smoke de navegador y assets de los cuatro IDs: `scripts/qa_content_pack_stages.cjs`.
2. QA técnico de los cuatro packs: `validate_background_pack.py` con hashes,
   provenance, composite y scroll de 4 frames.
3. Los bordes/repeat quedan sin cambios porque las capas son no repetibles y
   el preview ahora las desplaza con clipping seguro.

## Evidencia

- `.scratch/qa/content-pack-stages.json`
- `public/stages/{rooftop-dojo,patio-dojo-publicidad,terminal-supermercado-24h,azotea-wifi}/qa/background-pack-report.json`
- `X:/skills/spritesheet-expert-skill/SKILLS/build-game-backgrounds/scripts/background_pack/validation.py`

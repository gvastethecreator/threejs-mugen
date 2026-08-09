# T499-T504 — Recorte del roster y dos karatekas originales

Status: in_progress
Labels: content, generated-assets, spritesheet-expert, imagegen, roster
Lane: content / generated assets
Priority: P0
Supersedes: T439-T445, T447-T461, T470-T471 y el roster público de 17 personajes

## Objetivo

Retirar todos los paquetes públicos anteriores. Conservar Kung Fu Man sólo
como fixture local. Crear dos luchadores originales —un varón y una mujer— con
karate-gi normal, paleta sobria y anatomía extrema de manga marcial.

## Plan

1. **T499** — Retirar roster y referencias activas; archivar de forma recuperable.
2. **T500** — Crear y aceptar identidad/anchor de Rocco Vidal.
3. **T501** — Crear y aceptar identidad/anchor de Nadia Arce.
4. **T502** — Generar 28 filas con Imagegen y `spritesheet-expert`.
5. **T503** — Integrar atlas, roster, permisos y paquete MUGEN-lite.
6. **T504** — Validar sprites, runtime, smoke y revisión visual.

## Dirección de arte

- Vista lateral de lucha 2D y pixel art original de 16 bits.
- Anatomía extrema: cuello, trapecios, antebrazos y piernas potentes.
- Rocco: gi gris carbón, cinturón negro y vendas color hueso.
- Nadia: gi marfil gastado, cinturón negro, camiseta y vendas gris oscuro.
- Sin logos, marcas ni diseños identificables de franquicias.
- Fuentes sobre fondo gris neutral; VFX sólo contenido y conectado a la pose.

## Contrato de sprites

Cada luchador tiene 14 estados y 79 cuadros:

| Estado | Cuadros | FPS | Loop |
| --- | ---: | ---: | --- |
| `idle` | 4 | 6 | sí |
| `walk-forward` | 8 | 10 | sí |
| `walk-back` | 8 | 10 | sí |
| `crouch` | 4 | 8 | no |
| `jump` | 6 | 10 | no |
| `light-strike` | 4 | 12 | no |
| `heavy-strike` | 6 | 10 | no |
| `special` | 8 | 12 | no |
| `throw` | 6 | 10 | no |
| `guard` | 4 | 8 | sí |
| `hitstun` | 4 | 10 | no |
| `knockdown` | 6 | 10 | no |
| `ko` | 6 | 8 | no |
| `win` | 5 | 8 | no |

## Validación requerida

- Provenance, contratos de animación, alineación y variación pasan.
- Cada estado tiene preview runtime hash-bound y workbench completo.
- Revisión visual abre contactos, escala, matte y playback.
- `validate_run.py --stage pre-package` termina con código 0 por luchador.
- `pnpm qa:content:spritesheets` enumera sólo los dos paquetes.
- `pnpm qa:smoke` carga roster, atlas y combate visible.

## Ejecución 2026-08-01

- T499 cerrada: 17 paquetes movidos a
  `.scratch/removed-roster-2026-08-01/`; la operación es recuperable.
- T500-T501 cerradas: dos identidades originales, anchors y contratos.
- T502 cerrada: 28 fuentes Imagegen, 158 cuadros, dos atlas, provenance,
  contactos, onion skins, 28 previews y dos workbenches.
- T503 cerrada: dos paquetes públicos, 14 acciones runtime por luchador,
  permisos y DEF/CMD/CNS/AIR MUGEN-lite. No se publica SFF binario.
- T504 en progreso: provenance, animación, alineación, variación, playback y
  revisión visual pasan. El proxy de identidad conserva 13 alertas para Rocco
  y 21 para Nadia por escorzo, oclusión y poses horizontales. No se alteran
  umbrales ni se declara el pre-package verde. Build e higiene de assets pasan.
  `pnpm qa:smoke` ya recorre todo el producto: Rocco/Nadia pasan desktop y
  mobile con ambos atlas cargados y canvas no vacío. Daño, autoría/undo,
  escenario, bundle completo y las dos policies de release pasan. El gate
  global queda rojo sólo por seis fallos visuales MUGEN-lite/RemapPal previos
  al recorte: caída, recuperación y RemapPal en desktop/mobile.
- El cross-check solicitado con Grok Imagine ejecutó dos `image_edit`, pero el
  wrapper verificado rechazó la respuesta de Grok 0.2.118 porque devolvió
  `end_turn` en lugar de `EndTurn`. No se copiaron ni promovieron esas salidas;
  el fallo queda en `.scratch/agent-cli-delegation/grok-imagine/runs/`.

## Límites

- Kung Fu Man permanece como fixture local opcional y no se redistribuye.
- Los stages y el runtime existentes se conservan.
- Los dos luchadores son contenido nativo; el atlas no equivale a SFF nativo.
- Este recorte no aumenta el score de compatibilidad M.U.G.E.N/Ikemen.
- La vista de prueba de personajes continúa como T505/issue 79; no cambia el
  contrato de compatibilidad ni resuelve el proxy de identidad de T504.

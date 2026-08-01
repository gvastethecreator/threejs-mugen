# Roadmap de contenido original — seis luchadores satíricos + ocho clásicos

Estado: plan activo, separado de la paridad M.U.G.E.N/Ikemen.
Fecha: 2026-08-01.

Objetivo: incorporar seis personajes originales, satíricos y ocho luchadores
de uniforme clásico recoloreado, todos originales y no derivados de personajes
o marcas concretas de Street Fighter. El tono combina humor ácido y
absurdo de dibujos de culto, expresiones incómodas y energía de manga de
combate exagerada, sin copiar diseños, nombres, poses o frases existentes.
Cada personaje tendrá paquete
jugable completo: DEF, CMD, CNS, AIR, SFF/atlas, paletas, retrato, hitboxes,
animaciones de combate, VFX propios y pruebas de runtime.

Checkpoint real T449-T456: provenance, extracción, composición de atlas,
previews y QA de identidad/alineación/contrato están registrados. El agregado
`validate_run.py --stage pre-package` todavía queda rojo porque faltan revisión
visual independiente y playback runtime, y algunos heurísticos marcan cambios
de silueta/guardia; por eso estos ocho siguen en progreso.

Checkpoint v2 (T461-T462): los ocho clásicos fueron regenerados con anatomía
exagerada de manga de combate, uniformes sobrios y paletas apagadas; los cuatro
escenarios fueron regenerados con maestros Imagegen 16:9 y capas far/mid/near.
Atlas, provenance, previews runtime de estados y validación técnica de
background packs están presentes. T462 queda cerrada-bounded: los cuatro
stages pasan smoke browser con `deltaX` distintos y sus scroll proofs tienen
4 frames con movimiento real. La promoción de los ocho fighters sigue
bloqueada por gates de animación/identidad y revisión visual; el playback
runtime ya tiene evidencia manifest-driven válida para los 14 estados de cada
run. Los stages aún requieren SFF/DEF y colisión completa fuera de este corte.

Verificación spritesheet-expert (2026-08-01): `pnpm qa:content:spritesheets`
recorrió individualmente los 8 runs v2 (`bruno-giro`, `luna-codo`, `mara-cinta`,
`nico-guante`, `rulo-viento`, `sargento-pila`, `toro-pixel`, `vera-patada`).
Los 8/8 pasan provenance, alineación y playback runtime (14 evidencias GIF
`.evidence.json` por run); Bruno ya pasa el contrato de animación de sus 14
estados y los otros 7/8 siguen rojos en contratos de animación. Identity sigue
rojo en los 8/8. La revisión visual independiente quedó registrada como `fail` con
hallazgos concretos de anatomía/escala/fases. La salida agregada permanece
roja por política y no se promociona como atlas jugable.

La misma auditoría enumera los 17 directorios públicos: 11 paquetes con atlas
y 6 que todavía sólo tienen identity anchor. Los 3 atlas fuera de los runs v2
quedan marcados con `missing-source-provenance` y los 6 anchors con
`action-rows-not-generated`; por tanto “verificado” aquí significa recorrido y
diagnóstico individual, no aprobación automática. No se ocultan esos bloqueos
ni se cuentan como arte final aprobado.

Verificación de escenarios (2026-08-01): `pnpm qa:content:stages` pasa los
4 IDs en navegador. Cada stage carga tres capas `far/mid/near` por HTTP 200,
con `deltaX` ordenados y distintos (`0.08`, `0.42`, `0.88`), selección live y
con `deltaY` ordenados y distintos (`0.02`, `0.08`, `0.16`), selección live y
dos actores en Match. El gate confirma parallax horizontal y vertical real;
SFF/DEF de stage y colisión de suelo siguen fuera de este corte.
El validador oficial `build-game-backgrounds/scripts/validate_background_pack.py`
también pasa los cuatro packs, con provenance Imagegen verificada, composite y
scroll preview hash-bound.

Checkpoint T470 (2026-08-01): la auditoría ahora enumera todos los directorios
de `public/characters`, no sólo los ocho runs v2. Hay 17 paquetes: 11 con
atlas y 6 que todavía son sólo identity anchors. `pnpm qa:content:spritesheets`
mantiene la validación individual de los ocho v2 y añade cobertura de
`regeneration-map.json` (filas incompletas y celdas provider repetidas) más el
inventario público. El agregado sigue rojo de forma intencional: los ocho v2
conservan provenance/alineación/playback verdes; Bruno pasa animation-contracts,
pero identity-consistency/visual-review y los contratos de los otros siete
siguen bloqueando promoción. No se usa
repetición de celdas ni arte procedural como arreglo.

Checkpoint T471-Bruno (2026-08-01): `bruno-giro-v2` ya no recicla las celdas de
`idle`, `walk-forward`, `walk-back`, `guard`, `special`, `throw`, `light-strike`,
`heavy-strike`, `win`, `hitstun`, `knockdown` ni `ko`. Las doce filas fueron generadas con Imagegen
y el identity anchor; `light-strike` aporta cuatro fases de startup/contact/recovery,
`throw` seis fases de agarre, `heavy-strike` seis fases de anticipación/contacto/
recuperación, `hitstun` cuatro fases de recoil/drag/settle, `knockdown` y `ko`
seis fases de caída/colapso/recuperación y `win` seis fases de celebración contenida. La
primera salida de
`heavy-strike` se rechazó por invadir la celda vecina y la segunda pasó la
revisión de contaminación; `win` quedó sin gutters blancos tras dos iteraciones y
`hitstun` descartó una primera iteración por deformación de identidad antes de
aceptar una segunda salida de escala estable; `knockdown` descartó una primera
iteración por anchura horizontal y aceptó una segunda caída compacta.
El contrato automatizado ahora inspecciona los 14 estados y pasa sin errores;
identity-consistency continúa rojo por filas legacy, collapse, escala residual
de special, variación de anchura en heavy-strike y un borde de cabeza en win; la
fila hitstun ya no añade errores al proxy, mientras `knockdown` conserva
variación de cabeza/upper-body pendiente; `ko` ya tiene seis fases reproducibles
pero conserva deriva de volumen en el proxy. El mapa de Bruno registra 86 celdas
source auditables y doce overrides provider
explícitos. La fila `idle` usa un grid 2x2 dedicado y quedó verde en extracción,
alineación y playback; cuatro candidatos de `crouch` fueron rechazados por el
gate de pose/escala y esa fila conserva de forma explícita el action-grid legacy.
No se promueve todavía el atlas.

Checkpoint T471-Luna (2026-08-01): `luna-codo-v2` ya no recicla las celdas de
`walk-forward`, `walk-back`, `guard` ni `special`. Las cuatro filas fueron generadas con Imagegen y
el identity anchor; la primera salida de `walk-forward` fue rechazada por
líneas de división que rompían la matte y se aceptó una iteración posterior
con fondo gris continuo. Las filas seleccionadas tienen 8 fases distintas,
intake/provenance con SHA-256, extracción neutral, atlas, alineación y
playback runtime fresco para los 14 estados. `walk-back` deja de disparar la
duplicación de contacto opuesto; `guard` tiene cuatro fases con VFX y `special`
ocho fases de codo con shockwave. El agregado sigue rojo por identity proxy,
filas legacy y revisión visual; el contrato semántico de esas cuatro filas ya
no reporta fallos de fase. El mapa de Luna registra 44 celdas source
auditables, sin filas incompletas. No se promueve todavía ningún atlas v2.

Checkpoint T471 perfiles delegados (2026-08-01): Mara dejó una candidata
`guard-v3` con provenance/hash válidos, pero animation/identity/visual siguen
rojos (35 blockers); Rulo conserva el rechazo por clipping de pies en dos
celdas y 27 blockers. Nova y Rook recompusieron atlas/manifests desde sus
anchors idle, con provenance, alineación y playback 7/7 verdes por personaje;
hitstun de tres frames, identity drift y revisión visual mantienen ambos runs
rojos. Los tres anchors `don-rayo`, `la-jefa-del-combo` y `monje-wifi` sólo
avanzaron a motion references Imagegen hash-bound y preflight 3/3: todavía no
hay filas de personaje ni atlas. Ningún paquete fue promovido.

La higiene de artefactos quedó cerrada en este corte: se eliminaron rutas
absolutas de los seis reportes `run-validation-report.json` afectados, se
recalcularon los digests de Bruno/Luna y `pnpm qa:assets:hygiene` pasa sin
violaciones. Esto no altera los gates de promoción.

## Cola de tareas

| Tarea | Personaje/paquete | Estado | Salida principal |
| --- | --- | --- | --- |
| T438 | CNS State -1 `persistent = 0` | cerrada-bounded | Una activación por controlador CMD y ciclo de actor; traza `27e1ffb7` |
| T439 | Don Rayo | en progreso | Anchor Imagegen y entrada de roster; faltan filas de acción, VFX propio y paquete MUGEN |
| T440 | La Jefa del Combo | en progreso | Anchor Imagegen y entrada de roster; faltan filas de acción, VFX propio y paquete MUGEN |
| T441 | Turbo Abuela | en progreso | Anchor Imagegen y entrada de roster; faltan filas de acción, VFX propio y paquete MUGEN |
| T442 | Tanque de Cartón | en progreso | Anchor Imagegen y entrada de roster; faltan filas de acción, VFX propio y paquete MUGEN |
| T443 | Monje Wi‑Fi | en progreso | Anchor Imagegen y entrada de roster; faltan filas de acción, VFX propio y paquete MUGEN |
| T444 | Sombra del Súper | en progreso | Anchor Imagegen y entrada de roster; faltan filas de acción, VFX propio y paquete MUGEN |
| T445 | Paquete VFX/FightFX satírico | en progreso | Atlas 8 slots aceptado; hit/guard ya resuelven `F7300`/`F7301`/`F7306`; falta special y prueba visual final |
| T446 | Escenarios parallax originales | en progreso | Cuatro packs Imagegen validados e integrados al selector; falta colisión y paridad SFF/DEF |
| T447 | Integración de roster y runtime | en progreso | 14 entradas seleccionables y 3 stages registrados; faltan DEF/CMD/CNS/AIR y trazas por paquete |
| T448 | Variantes de vestuario homenaje | planificada | Seis disfraces/parodias de tropos de torneos clásicos, ninjas y manga de fuerza |
| T449 | Roster clásico — Mara Cinta | en progreso | Atlas Imagegen 4x4, 14 estados, QA, selector, permisos y MUGEN-lite; faltan paletas/SFF nativo y colisiones por frame |
| T450 | Roster clásico — Toro Pixel | en progreso | Atlas Imagegen 4x4, 14 estados, QA, selector, permisos y MUGEN-lite; faltan paletas/SFF nativo y colisiones por frame |
| T451 | Roster clásico — Nico Guante | en progreso | Atlas Imagegen 4x4, 14 estados, QA, selector, permisos y MUGEN-lite; faltan paletas/SFF nativo y colisiones por frame |
| T452 | Roster clásico — Luna Codo | en progreso | Atlas Imagegen 4x4, 14 estados, QA, selector, permisos y MUGEN-lite; faltan paletas/SFF nativo y colisiones por frame |
| T453 | Roster clásico — Sargento Pila | en progreso | Atlas Imagegen 4x4, 14 estados, QA, selector, permisos y MUGEN-lite; faltan paletas/SFF nativo y colisiones por frame |
| T454 | Roster clásico — Bruno Giro | en progreso | Atlas Imagegen 4x4, 14 estados, QA, selector, permisos y MUGEN-lite; faltan paletas/SFF nativo y colisiones por frame |
| T455 | Roster clásico — Vera Patada | en progreso | Atlas Imagegen 4x4, 14 estados, QA, selector, permisos y MUGEN-lite; faltan paletas/SFF nativo y colisiones por frame |
| T456 | Roster clásico — Rulo Viento | en progreso | Atlas Imagegen 4x4, 14 estados, QA, selector, permisos y MUGEN-lite; faltan paletas/SFF nativo y colisiones por frame |
| T461 | Regeneración v2 — ocho clásicos sobrios tipo Baki | en progreso | Fuentes Imagegen, atlas, previews y provenance bajo `.scratch/content-pack/regeneration-v2`; 8/8 provenance/alineación/playback pasan, Bruno ya pasa animación, 7/8 siguen rojos en animación e identidad y la revisión visual continúa roja |
| T462 | Regeneración v2 — cuatro escenarios parallax sobrios | cerrada-bounded | Cuatro packs far/mid/near, composites y scroll GIF de 4 frames; `pnpm qa:content:stages` pasa los cuatro IDs |
| T470 | Auditoría de cobertura de spritesheets | cerrada-bounded | Inventario de 17 paquetes públicos, 11 atlas y 6 anchors; cobertura source-grid y estados de cada run v2 en `.scratch/qa/content-pack-spritesheets.json` |
| T471 | Regeneración provider de filas bloqueadas | en progreso | Bruno tiene doce filas provider y 86 celdas; Luna conserva cuatro filas aceptadas y rechazó `knockdown`; Mara/Rulo dejaron `guard-v3` auditado sin promoción; Nova/Rook recompusieron atlas con provenance/alineación/playback, pero gates de contrato/identity/visual siguen rojos; tres anchors sólo tienen motion references; intake/contratos/identity/visual siguen bloqueando promoción |
| T457 | Paletas clásicas recoloreadas | planificada | Seis paletas por personaje, previews y persistencia; depende de T449-T456 |
| T458 | Puente SFF binario clásico | planificada | Export SFF reproducible desde atlas, alpha/ejes/grupos; depende de T457 |
| T459 | Colisiones e hitboxes clásicas | planificada | Clsn1/Clsn2 por frame, preview de contacto y hit/guard/whiff; depende de T458 |
| T460 | Trazas y smoke del roster clásico | planificada | Ocho trazas requeridas y selector sin fallback; depende de T457-T459 |

## Contrato de arte

### Checkpoint T471 (2026-08-01)

El primer run activo es `bruno-giro-v2`. Doce filas regeneradas usan el
identity anchor aceptado y no reciclan celdas del action-grid:
`idle`, `walk-forward`, `walk-back`, `guard`, `special`, `throw`, `light-strike`,
`heavy-strike`, `win`, `hitstun`, `knockdown` y `ko`.
Todas pasan extracción, composición, alineación y playback; `guard` conserva
cuatro fases de buildup/peak/decay con VFX defensivo, `special` ocho poses con
shockwave legible, `throw` seis fases de agarre/liberación, `light-strike`
cuatro fases de startup/contact/recovery, `heavy-strike` seis fases de
anticipación/contacto/recuperación, `hitstun` cuatro fases de recoil/drag/settle,
`knockdown` y `ko` seis fases de caída/colapso/recuperación y `win` seis fases
de celebración contenida.
El contrato automatizado de
animación ya pasa para los 14 estados de Bruno; la validación agregada
permanece roja por identity drift heredado y revisión visual. El inventario QA
registra en Bruno 86 celdas auditables, sin filas incompletas, y deja visibles
sólo las repeticiones heredadas fuera de esas doce filas (crouch/jump).

En `luna-codo-v2`, `walk-forward` y `walk-back` ya son filas provider
independientes, cada una con 8 fases y fondo neutral continuo. Se verificaron
intake, provenance, extracción, atlas, alineación y 14 previews runtime; la
primera iteración de `walk-forward` se descartó por contaminación de matte y
la seleccionada quedó sin líneas de división. `walk-back` ya no repite el
contacto opuesto, pero identity-consistency sigue señalando `walk-forward` y
las filas heredadas, por lo que la revisión visual/validación pre-package
continúan en rojo.

Checkpoint de delegación luna-max (2026-08-01): se ejecutaron tres perfiles
aislados con `gpt-5.6-luna` y razonamiento `max`, sin commits ni cambios
cruzados. Luna probó una fila `knockdown`; provenance, extracción neutral,
atlas, alineación, contrato y playback pasaron, pero identity-consistency la
rechazó por `head_width` 0.39x–2.12x y `upper_width` hasta 2.27x. El rechazo
quedó registrado y no se sincronizó a `public/characters/luna-codo`.
Mara probó una fila `guard`; su contrato de animación pasó, pero identity la
rechazó por cabeza 1.91x y variación 0.68x, dejando `guard-acceptance.json`
como rechazo auditable sin promover `public/characters/mara-cinta`. Nico no
generó arte nuevo: reparó la proyección pública de `nico-guante` a 14 estados
y 79 PNG con manifest de frames sin rutas absolutas y hashes de permisos
alineados; provenance, extracción, atlas, alineación y 14/14 previews pasan,
pero intake/contratos/identity/visual siguen rojos por deuda heredada. Ningún
perfil se promociona automáticamente mientras el gate agregado siga rojo.

- Perfil `pixel-art` con vista lateral de juego de lucha.
- Dirección tonal: comedia grotesca, silencios incómodos, poses demasiado
  musculosas y deformación breve en impactos; el absurdo siempre debe seguir
  siendo legible como gameplay.
- Cada personaje: identity anchor, idle, walk 8f, back-walk, crouch, jump,
  light/medium/heavy strike, special, throw, guard, hitstun, knockdown, KO,
  win/lose, portrait y seis paletas.
- T448 añade al menos una variante de vestuario por personaje: karate de
  torneo, ninja de máscara, militar exagerado, luchador de sumo o manga de
  fuerza. Son homenajes visuales originales; no se copian nombres, logos,
  emblemas, frases ni trajes identificables de franquicias.
- Cada fila nace como raw compact-grid; atlas final usa
  `manifest.json.frame_layout` y pivote de pies.
- Fuentes de arte: `imagegen` por defecto; `grok-imagine` solo tras dry-run,
  revisión y ejecución aprobada. No se aceptan dibujos procedurales como arte
  final.
- Cada run debe conservar provenance, source hashes, matte review, extraction,
  registration, identity, alignment, animation-contract, preview workbench y
  `validate_run.py --stage pre-package` en verde.
- Cada stage debe conservar `background-pack.json`, `source-provenance.json`,
  `regeneration-map.json`, composite y scroll GIF; además,
  `pnpm qa:content:stages` debe verificar selección, assets HTTP y offsets
  parallax en navegador.

## Comandos de verificación reproducibles

- `pnpm qa:content:spritesheets` audita los ocho runs v2 con
  `spritesheet-expert/scripts/validate_run.py --stage pre-package`, registra
  cobertura source-grid e inventaría todos los paquetes públicos, y escribe
  `.scratch/qa/content-pack-spritesheets.json`; su salida roja es intencional
  mientras fallen animation/identity/visual-review. `runtime-preview` debe
  permanecer verde y hash-bound por estado.
- `pnpm qa:content:stages` prueba en navegador los cuatro IDs y escribe
  `.scratch/qa/content-pack-stages.json`.
- `python X:/skills/spritesheet-expert-skill/SKILLS/build-game-backgrounds/scripts/validate_background_pack.py`
  se ejecuta por pack y actualiza los reportes `qa/background-pack-report.json`.

## Contrato de runtime

- Paquetes viven bajo `assets/content-pack/characters/<id>/` y
  `assets/content-pack/stages/<id>/`.
- El loader consume DEF/CMD/CNS/AIR/SFF/SND mediante VFS existente; no se
  crea un segundo formato paralelo.
- El roster mantiene fallback demo si el paquete falla; errores quedan
  localizados en compatibilidad.
- Cada personaje y stage requiere fixture CC0, prueba enfocada, traza requerida,
  typecheck, suite, build, boundaries y diff hygiene.
- La integración de stages debe probar capas parallax, scroll, repeat, límites
  y selección desde `select.def`; browser smoke solo aplica al selector/UI.

## Orden de ejecución

1. Cerrar T438 runtime.
2. Crear y revisar seis identity anchors; no generar filas de acción antes de
   aprobar identidad y escala.
3. Completar T439-T444 por personaje, uno a la vez, con QA completo.
4. Completar T445 VFX/FightFX: el atlas ya está conectado a hit/guard en el
   roster de contenido (`7300-7307`); queda conectar special y cerrar la
   prueba visual/runtime de las ocho filas.
5. Completar T446 stages parallax con atlas/manifest y colisión.
6. Completar T447 roster, selector, runtime, trazas y smoke.
7. Completar T448 variantes de vestuario y paletas, con revisión de
   originalidad antes de integrarlas al selector.
8. Completar T449-T456 como roster clásico adicional, uno por paquete, antes de
   promoverlos de fallback a atlas jugable. El checkpoint actual ya cubre
   atlas jugable y MUGEN-lite; la promoción final exige paletas, SFF binario,
   hitboxes auditadas y traza por personaje.
9. T462 queda cerrada-bounded tras smoke de cuatro stages. T470 cierra la
   cobertura del inventario, pero T461 sigue bloqueada hasta regenerar filas
   provider independientes; ejecutar T471 antes de promover los atlas.
10. Ejecutar T457-T460 en ese orden después de T471. Mantener cada bloqueo visible por
    personaje y no convertir warnings de QA en una promoción automática.

El paquete aumenta contenido jugable, no el score de paridad, hasta que exista
adjudicación independiente de evidencia. La paridad M.U.G.E.N/Ikemen sigue su
cola oficial en `docs/ROADMAP_EXECUTION_BOARD.md`.

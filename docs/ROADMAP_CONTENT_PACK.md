# Roadmap de contenido original — roster karate reset

Estado: T499-T505 activo, separado de la paridad M.U.G.E.N/Ikemen.
Fecha: 2026-08-01.

## Estado vigente

El roster público anterior fue retirado. Sólo se publican `rocco-vidal` y
`nadia-arce`; Kung Fu Man continúa únicamente como fixture local opcional.
Los 17 paquetes anteriores están preservados de forma recuperable en
`.scratch/removed-roster-2026-08-01/`. T499-T505 reemplazan T439-T445,
T447-T461 y T470-T471. T446/T462 conservan el trabajo de stages.

Rocco usa gi gris carbón y Nadia gi marfil gastado. Ambos son diseños
originales, sobrios y de anatomía extrema de manga marcial. Cada paquete tiene
14 estados, 79 cuadros, fuentes Imagegen por estado, atlas, provenance,
permisos, previews runtime, workbench y archivos MUGEN-lite. No se entrega SFF
binario en este corte.

Verificación actual: build, typecheck, pruebas enfocadas e higiene de assets
pasan. Provenance, animación, alineación, variación, playback y revisión visual
de `spritesheet-expert` pasan. El proxy de identidad conserva 13 alertas para
Rocco y 21 para Nadia por escorzo/oclusión/poses horizontales, así que el gate
pre-package permanece rojo sin relajar umbrales. El smoke completo confirma
Rocco/Nadia y ambos atlas en desktop/mobile; daño, autoría/undo, stage art,
bundle y dos policies de release pasan. Sólo quedan seis fallos visuales
MUGEN-lite/RemapPal previos. T505 agrega Fighter Lab con frame seek, atlas,
Clsn y VFX; su gate browser focalizado pasa.

Extensión vigente de T505: Gallery (`?mode=lab&labView=gallery`) lista todos
los luchadores cargados, resume acciones/cuadros/cajas y abre la línea temporal
existente. La evidencia dedicada pasa; no se agregan personajes ni se modifica
el contrato de spritesheets del roster.

T537 agrega el Testbench (`?mode=lab&labView=testbench`) sobre el mismo roster.
Lista todas las acciones, permite probar frames y muestra salud de sprites, AIR,
colisiones, VFX, enlaces runtime y motion QA. Es una vista de diagnóstico de
solo lectura y no altera el contrato de spritesheets.

T545 agrega Character Matrix (`?mode=lab&labView=matrix`) sobre el mismo
roster. Expone los 2 luchadores, sus 34 acciones y 12 comprobaciones de
componentes; cualquier acción usa el runtime aislado y el panel del Testbench.
No agrega contenido ni altera los atlas.

T562 agrega Character Compare (`?mode=lab&labView=compare`). La vista compara
una acción entre todos los luchadores cargados y muestra disponibilidad,
cuadros, duración, colisiones y estado de componentes. Cada tarjeta disponible
carga el luchador y la acción en el runtime aislado. No agrega contenido ni
altera los atlas.

T536 queda registrado en la cola de paridad, separado de este paquete de
contenido: `RoundState` ya proyecta de forma tipada los valores `0/1/2/3/4`
durante el ciclo de ronda. T538 agrega la lectura numérica de
`IntroState`/`FightScreenState`/`FightScreenVar`; T539 agrega el reloj
`FightTime` y las lecturas temporales acotadas de `GameVar`. T543 (`ClsnVar`)
ya cerró la lectura de coordenadas `clsn1`/`clsn2`/`size`; T544 ya cerró la
consulta transformada `ClsnOverlap`; T546 ya cerró `ProjClsnOverlap` sobre
proyectiles del actor; T547 ya cerró las lecturas numéricas `ProjVar` y la
T548 cerró las comparaciones tipadas de flags `ProjVar`; T549 cerró los
contadores `pausemovetime`/`supermovetime` de Projectile; T550 cerró
`remvelocity` y el movimiento terminal. T551 cerró `velmul` Z; T552 cerró
`projlayerno` y su orden de presentación; T553 cerró `projangle`; T554
cerró `projxangle`/`projyangle`; T555 cerró `projxshear`; T556 cerró
`projshadow`; T557 cerró `projreflection`; T558 cerró
`projprojection`/`projfocallength`; T559 cerró `projwindow`; T560 implementa
`ownpal`/`remappal` de Projectile. T542
(`AnimPlayerNo`) ya cerró el slice de
propiedad de la animación activa; T541 (`AnimLength`) ya cerró el slice de
duración total efectiva del AIR y T540 (`AnimElemVar`) cerró el slice de
metadata del frame activo. Ninguna agrega personajes ni modifica los
contratos de spritesheets.

## Historial superseded

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

Checkpoint T471 perfiles delegados (2026-08-01): Mara dejó `guard-v3` aislada
aceptada con provenance, animation, identity y visual en verde (0 blockers),
pero el paquete completo conserva 35 blockers y no se sobreescribió el atlas
público. Rulo conserva el rechazo histórico de `guard-v3`, pero su intento
hermano animado `guard-v4` pasa pre-package con 0 blockers: provenance,
animación, alineación, identity, runtime y visual quedan aplicados y verdes;
`head_width` permanece entre 0.95x y 1.10x. El paquete completo conserva 27
blockers y no se promovió ningún atlas. Nova y Rook aceptaron en aislamiento
filas `hitstun` provider de cuatro fases: intake, provenance, contrato de
animación, alineación, identity, playback y revisión visual de la fila pasan.
Los agregados siguen rojos sólo por filas retenidas y la revisión integral:
Nova conserva 4 blockers y Rook 7. Los tres anchors
`don-rayo`, `la-jefa-del-combo` y `monje-wifi` ya tienen una fila `idle`
Imagegen aislada: Don llegó a v4 tras rechazar dos iteraciones por `head_width`
1.55x/1.53x, La Jefa cambió fucsia por borgoña sin relajar thresholds y Monje
reemplazó el frame con cabeza 0.46x. Las tres filas pasan extracción,
animation, alignment, identity y visual; los preflights completos siguen rojos
porque faltan 13 filas por perfil. Ningún atlas público fue promovido.

La higiene de artefactos quedó cerrada en este corte: se eliminaron rutas
absolutas de los reportes JSON afectados y `pnpm qa:assets:hygiene` pasa sin
violaciones. Esto no altera los gates de promoción.

## Cola de tareas

| Tarea | Personaje/paquete | Estado | Salida principal |
| --- | --- | --- | --- |
| T499 | Retiro del roster anterior | cerrada-bounded | 17 paquetes archivados de forma recuperable; KFM privado preservado |
| T500 | Rocco Vidal | cerrada-bounded | Anchor, 14 estados, 79 cuadros, atlas y provenance |
| T501 | Nadia Arce | cerrada-bounded | Anchor, 14 estados, 79 cuadros, atlas y provenance |
| T502 | Producción completa de sprites | cerrada-bounded | 28 fuentes Imagegen, 158 cuadros, contactos, previews y workbenches |
| T503 | Integración roster/MUGEN-lite | cerrada-bounded | Dos paquetes públicos, acciones runtime, permisos y DEF/CMD/CNS/AIR |
| T504 | Cierre pre-package y browser | en progreso | Roster/Studio/ZIP verdes; proxy de identidad con 34 alertas; smoke rojo sólo por 6 visuales MUGEN-lite previos |
| T505 | Fighter Lab | cerrada-bounded | Dos luchadores, 14 acciones/79 cuadros por paquete, 3 VFX, atlas, Clsn y gate browser verde |
| T438 | CNS State -1 `persistent = 0` | cerrada-bounded | Una activación por controlador CMD y ciclo de actor; traza `27e1ffb7` |
| T439 | Don Rayo | superseded | Evidencia histórica preservada fuera del roster público |
| T440 | La Jefa del Combo | superseded | Evidencia histórica preservada fuera del roster público |
| T441 | Turbo Abuela | superseded | Evidencia histórica preservada fuera del roster público |
| T442 | Tanque de Cartón | superseded | Evidencia histórica preservada fuera del roster público |
| T443 | Monje Wi‑Fi | superseded | Evidencia histórica preservada fuera del roster público |
| T444 | Sombra del Súper | superseded | Evidencia histórica preservada fuera del roster público |
| T445 | Paquete VFX/FightFX satírico | superseded | Evidencia histórica preservada; runtime FightFX compartido no se elimina |
| T446 | Escenarios parallax originales | en progreso | Cuatro packs Imagegen validados e integrados al selector; falta colisión y paridad SFF/DEF |
| T447 | Integración de roster y runtime | superseded | Reemplazada por T503 |
| T448 | Variantes de vestuario homenaje | superseded | Fuera del roster reducido |
| T449 | Roster clásico — Mara Cinta | superseded | Paquete retirado y archivado |
| T450 | Roster clásico — Toro Pixel | superseded | Paquete retirado y archivado |
| T451 | Roster clásico — Nico Guante | superseded | Paquete retirado y archivado |
| T452 | Roster clásico — Luna Codo | superseded | Paquete retirado y archivado |
| T453 | Roster clásico — Sargento Pila | superseded | Paquete retirado y archivado |
| T454 | Roster clásico — Bruno Giro | superseded | Paquete retirado y archivado |
| T455 | Roster clásico — Vera Patada | superseded | Paquete retirado y archivado |
| T456 | Roster clásico — Rulo Viento | superseded | Paquete retirado y archivado |
| T461 | Regeneración v2 — ocho clásicos sobrios | superseded | Runs históricos archivados; no hay promoción pública |
| T462 | Regeneración v2 — cuatro escenarios parallax sobrios | cerrada-bounded | Cuatro packs far/mid/near, composites y scroll GIF de 4 frames; `pnpm qa:content:stages` pasa los cuatro IDs |
| T470 | Auditoría de cobertura de spritesheets | superseded | Reemplazada por la auditoría exacta de dos paquetes de T504 |
| T471 | Regeneración provider de filas bloqueadas | superseded | Evidencia histórica archivada; no se promociona |
| T457 | Paletas clásicas recoloreadas | superseded | Fuera del roster reducido |
| T458 | Puente SFF binario clásico | superseded | Fuera del roster reducido |
| T459 | Colisiones e hitboxes clásicas | superseded | Fuera del roster reducido |
| T460 | Trazas y smoke del roster clásico | superseded | Reemplazada por T504 |

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

Checkpoint de delegación de perfiles aislados (2026-08-01): se ejecutaron tres
perfiles sin commits ni cambios cruzados. Luna probó una fila `knockdown`;
provenance, extracción neutral,
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

- `pnpm qa:content:spritesheets` audita `rocco-vidal-v1` y `nadia-arce-v1`
  con `spritesheet-expert/scripts/validate_run.py --stage pre-package`, prueba
  cobertura directa de 14/14 estados e inventaría exactamente dos paquetes
  públicos. Escribe `.scratch/qa/content-pack-spritesheets.json`; la salida
  permanece roja mientras `identity-consistency` conserve alertas, aunque
  `runtime-preview` y `visual-review` estén verdes.
- `pnpm qa:content:stages` prueba en navegador los cuatro IDs y escribe
  `.scratch/qa/content-pack-stages.json`.
- `python X:/skills/spritesheet-expert-skill/SKILLS/build-game-backgrounds/scripts/validate_background_pack.py`
  se ejecuta por pack y actualiza los reportes `qa/background-pack-report.json`.

## Contrato de runtime

- Los luchadores nativos viven bajo `public/characters/<id>/`; los stages
  conservan su ubicación existente bajo `public/stages/<id>/`.
- El loader consume DEF/CMD/CNS/AIR/SFF/SND mediante VFS existente; no se
  crea un segundo formato paralelo.
- El roster mantiene fallback demo si el paquete falla; errores quedan
  localizados en compatibilidad.
- Cada personaje y stage requiere fixture CC0, prueba enfocada, traza requerida,
  typecheck, suite, build, boundaries y diff hygiene.
- La integración de stages debe probar capas parallax, scroll, repeat, límites
  y selección desde `select.def`; browser smoke solo aplica al selector/UI.

## Orden vigente

1. T499-T503 y T505 están cerradas-bounded.
2. Cerrar T504 sólo cuando el pre-package cuantitativo y `pnpm qa:smoke`
   terminen en verde; no convertir alertas en aprobación manual silenciosa.
3. Mantener Kung Fu Man privado y el roster público limitado a los dos IDs.
4. No iniciar más personajes hasta adjudicar este gate.

## Orden histórico superseded

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

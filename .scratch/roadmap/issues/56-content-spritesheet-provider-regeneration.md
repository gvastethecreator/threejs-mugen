# 56 - T471 provider regeneration of failing spritesheet rows

Status: superseded
Labels: generated-assets, spritesheet-expert, imagegen, visual-qa
Lane: content / generated assets
Priority: P1
Depends on: T470 coverage audit, accepted identity anchors for T461

Superseded on 2026-08-01 by issue 78 / T499-T504. The former runs remain as
historical evidence, but none of their fighter packages remains in the public
roster.

## Objective

Regenerate the failing provider rows for all eight v2 fighters while keeping
identity anchored to each accepted idle image. The first target rows are
`walk-forward`, `walk-back`, `guard`, `special`, and action/collapse rows that
fail identity proxies; each row must contain real provider phases rather than
reused action-grid cells.

## Required provider contract

- Use Imagegen as the default source on the declared neutral background, with
  the accepted identity anchor attached to every action-row request.
- Keep one row per state and preserve the requested frame budget and runtime
  `manifest.json.frame_layout` contract.
- Do not repair semantic phase gaps by repeating, mirroring, or procedurally
  drawing cells. Re-extract/registration is allowed only after provider art is
  accepted.

## Acceptance

- Each regenerated row has verified source provenance and current hashes.
- `check_animation_contracts.py`, `check_identity_consistency.py`,
  `check_frame_alignment.py`, runtime preview, and visual review pass for the
  affected row before the next row is started.
- Rebuilt aggregate `validate_run.py --stage pre-package` is green per fighter;
  the eight-fighter aggregate can be promoted only when all eight are green.
- Existing good rows and unrelated package files remain unchanged.

## Current blockers

The current v2 action grids repeat provider cells by design for several rows;
the audit records this as source coverage debt. Current visual review also
reports anatomy/identity drift. No deterministic atlas post-process can
honestly satisfy those semantic failures.

## Progress checkpoint (2026-08-01)

Bruno Giro (`bruno-giro-v2`) is the first active provider run. Twelve rows have
now been replaced from fresh Imagegen outputs bound to the accepted identity
anchor: `idle`, `walk-forward`, `walk-back`, `guard`, `special`, `throw`,
`light-strike`, `heavy-strike`, `win`, `hitstun`, `knockdown`, and `ko`. The
special row was iterated through four provider candidates; the selected v4
candidate keeps the lower-body phases distinct and clears its animation
contract. Each selected source has an intake record,
SHA-256 provenance, neutral-background extraction, composed atlas, frame
alignment, manifest playback, and fresh runtime GIF evidence. The regenerated
walk rows remove the previous duplicate opposite contact; guard now exposes
four buildup/peak/decay frames with a restrained defensive flash.

The idle row was then regenerated as a dedicated 2x2 Imagegen source. A
horizontal candidate was rejected because it violated the declared row layout;
the selected 1254x1254 candidate has four clean full-body poses on the neutral
matte, passes extraction, alignment, and runtime playback, and is bound in the
public source inventory as `bruno-giro-idle-imagegen-v2.png`.

A dedicated crouch attempt was reviewed through four Imagegen candidates and
kept out of the atlas: the official extraction gate still found a scale/pose
violation in the deep frame. `crouch` therefore remains explicitly mapped to
the accepted action-grid source alongside `jump`; the rejected candidate is
recorded as blocked in its intake rather than promoted through a failed gate.

The Bruno run currently passes provenance, extraction, atlas composition,
alignment, the animation-contract heuristic for all fourteen declared states,
all fourteen runtime previews, and has a fresh hash-bound visual-review record.
The
aggregate remains intentionally blocked: identity proxies still flag legacy
action/collapse rows, residual scale drift in special, upper-width variation in
the regenerated heavy-strike row, and a narrow win head-width edge. The new
hitstun row is visually legible and contributes no identity errors. Knockdown
and KO now have six distinct fall/recovery phases each; their compact collapse
still needs identity tuning, and KO was selected after matte/contact review as
the provider replacement for the legacy repeated row.
The light-strike row has four distinct startup/contact/recovery frames; the
throw row has six distinct readable phases and no alignment error. The first
heavy-strike candidate was rejected after visual review found a foot crossing
the neighboring cell; the regenerated six-frame candidate is clean through
contact, alignment, and runtime playback. The win row went through two
additional provider iterations to remove white gutters; the selected six-frame
row is clean through matte, contact, alignment, and runtime playback. Hitstun
discarded one oversized recoil candidate and selected a second four-frame row
with stable scale, clean matte, and no cell contamination. Knockdown discarded
one horizontally stretched candidate and selected a compact six-frame fall
row; matte, alignment and playback are green while identity remains red.
`validate_run.py --stage pre-package` therefore remains red until the
remaining identity rows are regenerated and reviewed. No atlas is promoted on
this checkpoint.

## Latest expert verification (2026-08-01)

`pnpm qa:content:spritesheets` reran the canonical
`X:\\skills\\spritesheet-expert-skill\\SKILLS\\spritesheet-expert\\scripts\\validate_run.py`
validator for all eight v2 production runs. All eight pass generation
provenance, frame alignment and runtime preview; Bruno now passes animation
contracts for all 14 states, while the other seven still fail animation
contracts. Identity consistency and visual review remain red across all eight.
The public inventory remains
17 character directories: 11 full-sheet packages and 6 identity-anchor-only
packages with action rows still unverified. Promotion stays blocked until the
provider rows, provenance/frames manifests and independent visual review are
green. The refreshed Bruno source map now records 86 auditable cells with no
incomplete rows; its twelve provider overrides are visible in `row_sources` and
its remaining duplicate cells belong only to untouched legacy states.

## Progress checkpoint: Luna Codo (2026-08-01)

`luna-codo-v2` ahora tiene `walk-forward`, `walk-back`, `guard` y `special`
reemplazados por salidas independientes de Imagegen ligadas al
`references/identity-anchor.png`.
La primera salida de `walk-forward` fue descartada por introducir líneas de
separación que contaminaban la matte; la tercera iteración dejó un fondo gris
continuo y fue la seleccionada. Ambas filas tienen intake seleccionado,
hashes de candidato, extracción neutral `auto`, atlas PNG/WebP, baseline
alineado y previews runtime hash-bound para los 14 estados. `walk-back` deja
de duplicar el contacto opuesto; `guard` aporta cuatro fases con flash
defensivo y `special` ocho fases de codo con shockwave y transiciones inferiores
distintas. El contrato de animación ya no reporta fallos semánticos en esas
filas; sólo queda el aviso de cobertura heurística de estados no inspeccionados.
Identity-consistency y revisión visual siguen en `fail` por las filas heredadas
y la escala de VFX, así que no se promociona el atlas todavía.
El `regeneration-map.json` de Luna registra ahora 44 celdas source auditables,
sin filas incompletas y con overrides explícitos en `row_sources`.

## Delegación de perfiles aislados — cierre (2026-08-01)

Tres perfiles aislados se ejecutaron sin commits ni cambios cruzados. Luna probó
`knockdown`, pero el gate de
identity rechazó la candidata (`head_width` 0.39x–2.12x, `upper_width` hasta
2.27x); el rechazo quedó auditado y la proyección pública no se tocó. Mara
probó `guard`: el contrato de animación pasó, pero identity falló (cabeza
1.91x, variación 0.68x), por lo que `guard-acceptance.json` conserva el
rechazo y no se promovió la fila. Nico reparó sólo la proyección pública
existente a 14 estados y 79 PNG, con manifest sin rutas absolutas y hashes de
permisos alineados; provenance, atlas, alineación y 14/14 previews pasan, pero
intake, contratos, identity y visual siguen rojos. El gate agregado permanece
bloqueado y no se relajan thresholds.

## Delegación de perfiles — checkpoint adicional (2026-08-01)

Se reabrieron tres paquetes aislados para ampliar cobertura sin falsear
promoción. `mara-cinta` dejó una candidata `guard-v3` aislada aceptada:
provenance, animation, identity y visual pasan con 0 blockers en el run
independiente, pero el paquete completo conserva 35 blockers y la fila no se
integró al atlas público. `rulo-viento` corrigió clipping, alineación, matte,
movimiento y runtime, pero el run aislado sigue rechazado por un único frame de
identidad (`head_width` 1.40x frente al máximo 1.28x); el paquete completo
conserva 27 blockers. Ninguna fila se integró al atlas público.

### Remediación aislada de Rulo `special-v5` (2026-08-01)

Se reconstruyó un run animado reproducible bajo
`.scratch/content-pack/t471-profile-remediation/rulo-viento-special-v4-run`
con el anchor aceptado de Rulo y una fila `special-v5` nueva de Imagegen. El
primer intento `special-v4` quedó conservado como rechazo: animación y
alineación pasaban, pero identity todavía medía cabeza entre 0.80x y 1.43x.
El segundo intento bloqueó cámara/escala y cerró el blocker: cabeza
0.8864x–1.25x dentro de 0.82x–1.28x, sin errores de upper/body mass, clipping
o matte.

El `validate_run.py --stage pre-package` final usa contrato
`frame_semantics=animation` y termina `pass`, exit 0, 0 blockers, fingerprint
`8bdae9aecce045c9e81a7c43303fbea451c388185d8ad17560f6580562d6252b`.
Provenance, animation-contracts, frame-alignment, identity-consistency,
runtime-preview y visual-review pasan; el aviso heurístico sobre el extent de
`special` quedó revisado contra contacto/onion/playback, donde sí se leen
startup, chamber, dos frames de contacto, retracción y recovery. La fuente
seleccionada está fijada por SHA-256
`2148f79fe0ec3af143854daecff069816a5c49d7f41ea6f75d9665cbb3f93e90`.
La decisión reproducible vive en `qa/special-v5-acceptance.json`.

Este PASS sólo acepta la fila aislada: no modifica ni promueve
`public/characters/rulo-viento`, y el paquete completo de Rulo conserva sus 27
blockers previos hasta integrar y revalidar todas las filas. Mara `guard-v3`
queda sin cambios en este carril; no se tocó su candidata ni su proyección
pública. No se añadió ni inventó ninguna licencia.

### Remediación aislada de Rulo `guard-v4` (2026-08-01)

La corrección de identidad de `guard-v3` continuó como intento hermano, sin
sobrescribir el rechazo anterior, bajo
`public/characters/rulo-viento/provider-attempts/guard-v4/run`. La nueva fuente
Imagegen queda fijada por SHA-256
`b05dbc50a0de54da5f0a24ec3567a824f42ea0cb453de87ee21496c2319c4ba2`;
el intake produjo `raw/guard.png` con SHA-256
`ba577d9c1ddec5aa2899649f83094d6bc589e7226d7f09535c8ea1c0049b2a26`.

`validate_run.py --stage pre-package` termina PASS, exit 0 y 0 blockers con
fingerprint
`06a7bc3eb1d087b31d8036c4aef2f720882c2ecd475fa48967b808853f1541b1`.
El contrato se declara animado: generation-provenance, animation-contracts,
frame-alignment, identity-consistency, runtime-preview y visual-review se
aplican y pasan. Los cuatro frames mantienen baseline Y=112, cero edge pixels y
`head_width_vs_reference` entre 0.95x y 1.10x. El warning heurístico del pico
VFX fue revisado contra contacto, onion, matte, playback y workbench ligados por
hash: el arco de antebrazo aparece en el tercer frame y desaparece al recuperar.

La fila queda aceptada sólo como intento aislado. No se sustituyeron atlas ni
manifests públicos; el baseline completo
`.scratch/content-pack/regeneration-v2/runs/rulo-viento-v2` continúa FAIL con 27
blockers y promoción `not-promoted`. Mara no fue modificada en este corte.

`nova-boxer/hitstun-v3` y `rook-apprentice/hitstun-v3` aceptaron en
aislamiento filas provider de cuatro fases. Intake hash-bound, provenance,
contrato de animación, alineación, identity, revisión visual de la fila y
playback runtime pasan en ambos intentos. El agregado de Nova queda rojo con
4 blockers exactos: `walk-forward` encoge cabeza a 0.81x, `punch` la amplía
a 1.33x, el reporte identity declara `false` y la revisión visual integral
sigue roja. Rook conserva 7 blockers: `walk-forward` 0.77x, spread superior
de `jump` 0.44x, `punch` 1.35x, `kick` 1.97x/spread 1.00x, reporte
identity `false` y visual integral roja. No se promocionan atlas públicos.
Nova tiene sus 13/13 digests de `asset-permission.json` actualizados; Rook no
declara ese contrato.

Los tres identity-anchor-only (`don-rayo`, `la-jefa-del-combo`, `monje-wifi`)
ya tienen motion references Imagegen hash-bound y preflight 3/3 por run. Don
Rayo rechazó su candidata `idle` porque cambió paleta, vincha y vocabulario de
props del anchor. La Jefa aceptó el intake de `idle`, pero la extracción quedó
roja por 206/200/164/151 píxeles magenta-adjacent en el vestuario rosa. Monje
Wi-Fi aceptó intake y extracción de `idle`; alineación y contrato de animación
pasan, pero identity falla porque `head_width_vs_reference` cae a 0.46x y varía
0.58x. La composición rechaza el atlas porque faltan las otras 13 filas. Los
tres `validate_run.py --stage preflight` terminan en exit 1: Don no tiene
provenance de filas aceptadas y los otros dos sólo cubren `idle`. La promoción
agregada permanece bloqueada y los thresholds no se relajan; blockers exactos
en `qa/profile-readiness.json` y `qa/run-validation-report.json` de cada run.

## Higiene de artefactos — cierre técnico (2026-08-01)

Se sanearon los reportes JSON que conservaban rutas absolutas en los
`stdout_tail` serializados. `pnpm qa:assets:hygiene` ahora
queda en `passed`, sin violaciones de rutas ni traversal. Este cierre sólo
repara metadata de QA; no cambia los gates de animación, identity o revisión
visual ni habilita promoción.

## Remediación de perfiles anchor — checkpoint idle (2026-08-01)

Los tres perfiles anchor tienen ahora una fila `idle` Imagegen aceptada dentro
de sus runs aislados. Don Rayo llegó a `idle-clearhead-v4.png`: la primera
reposición corrigió uniforme azul/naranja, vincha y teléfono, pero identity
marcó `head_width` 1.55x; la siguiente quedó en 1.53x porque la mano seguía
detrás de la cabeza. La v4 retiró esa oclusión y pasa intake, extracción,
animation-contract, frame-alignment, identity-consistency y revisión visual.
La Jefa sustituyó los acentos fucsia por borgoña oscuro; la extracción queda
verde sin cambiar thresholds y también pasan animation, alignment, identity y
visual. Monje Wi-Fi reemplazó el frame inclinado que reducía la cabeza a 0.46x;
su nueva fila mantiene el ancho de cabeza y pasa los mismos seis gates.

Los tres `validate_run.py --stage preflight` siguen en exit 1 por un único
blocker de paquete: provenance cubre `idle`, pero faltan las otras 13 filas
declaradas. `compose_sprite_atlas.py` continúa rechazando composición completa
por esas ausencias. `qa/profile-readiness.json`, `qa/run-validation-report.json`
y `qa/visual-review.json` dejan hashes y decisiones reproducibles por perfil.
Ningún atlas público fue creado, sobrescrito ni promovido.

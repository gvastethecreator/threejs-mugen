# 56 - T471 provider regeneration of failing spritesheet rows

Status: in_progress
Labels: generated-assets, spritesheet-expert, imagegen, visual-qa
Lane: content / generated assets
Priority: P1
Depends on: T470 coverage audit, accepted identity anchors for T461

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

## Delegación luna-max — cierre (2026-08-01)

Tres perfiles aislados se ejecutaron con `gpt-5.6-luna` y razonamiento `max`;
no hubo commits ni cambios cruzados. Luna probó `knockdown`, pero el gate de
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
promoción. `mara-cinta` dejó una candidata `guard-v3` con provenance y hashes
válidos, pero animation/identity/visual siguen rojos (35 blockers);
`rulo-viento` conserva el rechazo por clipping de pies en dos celdas y los
mismos gates rojos (27 blockers). Ninguna fila se integró al atlas.

`nova-boxer` y `rook-apprentice` recompusieron atlas/manifests desde sus anchors
idle y dejaron provenance, alineación y playback verdes (7/7 estados por
personaje). Sus contratos pre-package siguen rojos por hitstun de tres frames,
identity drift y revisión visual; no se promocionan. Nova tiene sus 13/13
digests de `asset-permission.json` actualizados; Rook no declara ese contrato.

Los tres identity-anchor-only (`don-rayo`, `la-jefa-del-combo`, `monje-wifi`)
ya tienen motion references Imagegen hash-bound y preflight 3/3 por run, pero
aún no tienen filas de personaje ni atlas. La promoción agregada permanece
bloqueada y los thresholds no se relajan.

## Higiene de artefactos — cierre técnico (2026-08-01)

Se sanearon las seis copias de `run-validation-report.json` que conservaban
rutas absolutas en los `stdout_tail` serializados y se recalcularon los hashes
de los reportes modificados de Bruno y Luna. `pnpm qa:assets:hygiene` ahora
queda en `passed`, sin violaciones de rutas ni traversal. Este cierre sólo
repara metadata de QA; no cambia los gates de animación, identity o revisión
visual ni habilita promoción.

# 30 - T445 original character VFX/FightFX pack

Status: in_progress
Labels: content-pack, vfx, fightfx, spritesheet, imagegen, grok-optional
Lane: C2 presentation
Priority: P1
Depends on: T439-T444 identity anchors

## Current evidence (2026-07-30)

Imagegen atlas accepted at `public/effects/satirical-fightfx/source/` and
processed through the spritesheet-expert run
`.scratch/content-pack/runs/satirical-fightfx-v1-prepared/`.
The 4×2 source yields eight labeled slots, an alpha atlas and runtime
manifest under `public/effects/satirical-fightfx/runtime/`. Provenance,
matte review, extraction, composition, strict slot QA, animation-contract,
alignment (warn-only for still-slot baseline), preview and workbench all pass.
Runtime hit/guard trigger wiring is now connected for the demo/content roster:
`F7300`/`F7301` resolve authored hit rows and `F7306` resolves the guard row;
the renderer registers the verified atlas at groups `7300-7307` and retains
fallback geometry if the HTTP asset is unavailable. Character-imported FightFX
still keeps its own SFF/AIR precedence.

Grok Imagine was dry-run only: the local CLI is unauthenticated, so no paid
provider media was executed or mixed into the pack.

## Acceptance

Provider-backed pixel VFX rows with buildup/peak/decay, stable emitter/contact
anchors, alpha-safe matte, hit/guard sparks, dust, trails and six character
special effects. Slot/atlas manifests, provenance, VFX animation-contract,
preview workbench and runtime event integration pass. The bounded integration
does not claim imported FightFX prefix breadth or full super-background parity.

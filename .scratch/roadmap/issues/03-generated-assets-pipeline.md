# 03 - Generated Assets Pipeline

Status: ready-for-agent
Labels: generated-assets, visual-qa, ready-for-agent

## Objective

Make imagegen and sprite-atlas-builder output repeatable, inspectable, and playable without pretending generated/native assets prove imported MUGEN compatibility.

## Next Useful Cuts

- Store prompt/source provenance for each generated character or stage.
- Validate walk cycles by motion, scale, foot placement, baseline, and frame ordering.
- Regenerate bad source sheets instead of fixing bad locomotion by atlas cropping.
- Connect generated assets to Studio evidence and Build readiness.

## Acceptance

- Source prompt, source image, atlas, manifest, QA report, collisions, and playtest evidence are linked.
- Scale and pose changes are visible in QA artifacts.
- Runtime match still passes visual smoke after asset changes.
- `docs/GENERATED_ASSET_QA_CONTRACT.md` and Studio evidence docs stay synchronized.

## Blocked Claims

- Commercial asset inclusion.
- Imported MUGEN compatibility credit.
- Procedural repair that hides bad source art without regenerating source sprites.

# 03 - Generated Assets Pipeline

Status: ready-for-agent
Labels: generated-assets, visual-qa, ready-for-agent

## Objective

Make imagegen and sprite-atlas-builder output repeatable, inspectable, and playable without pretending generated/native assets prove imported MUGEN compatibility.

## Next Useful Cuts

- 2026-07-10 next contract: define `AssetProvenance/v0` with origin, ownership/license, input digest, tool/version, prompt/config digest, ordered transforms, output hashes, QA/playtest links, and public-path redaction. Missing permission or digest must block export readiness; tags and absolute local paths are not provenance.
- Current queue label in `docs/ROADMAP_EXECUTION_BOARD.md`: A1 Generated asset provenance and QA.
- Store prompt/source provenance for each generated character or stage.
- Validate walk cycles by motion, scale, foot placement, baseline, and frame ordering.
- Regenerate bad source sheets instead of fixing bad locomotion by atlas cropping.
- Connect generated assets to Studio evidence and Build readiness.
- Add a single record shape that links prompt, source sheet, atlas manifest, QA report, collisions, runtime manifest entry, and trace/smoke evidence.

## Acceptance

- Origin/permission, source prompt/config, input/tool/transform/output hashes, atlas, manifest, QA report, collisions, and playtest evidence are linked.
- Missing ownership/license assertion or digest blocks export readiness, and public reports/bundles contain no absolute local source path.
- Scale and pose changes are visible in QA artifacts.
- Runtime match still passes visual smoke after asset changes.
- `docs/GENERATED_ASSET_QA_CONTRACT.md` and Studio evidence docs stay synchronized.

## Blocked Claims

- Commercial asset inclusion.
- Treating an unknown license, a tag, or an absolute path as provenance proof.
- Imported MUGEN compatibility credit.
- Procedural repair that hides bad source art without regenerating source sprites.

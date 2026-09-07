# Code map: mugen-web-sandbox

Generated: 2026-09-07T21:43:54Z | Commit: `f3cb353437e0` | Schema: 2
Generation: `3a6a66648ea5484918c2aecd0c25a26cc8cf6e4ff1e1745d32933e150393c2fe`
Scope: . | Inventory: working-tree
Nodes: 942 | Edges: 5246 | Flows: 2

## Coverage

- Analysis: **partial**; 903 analyzed of 907 included files.
- Configuration files: 1; omitted untracked files: 0.
- Unresolved references and analysis limits: 6327.
- Static references and call paths do not prove runtime execution or test coverage.

## Modules

- `external:javascript:` | external | External | callers: scripts/qa_browser_gate_da32_005_mugen_lite_visual.cjs, scripts/qa_browser_gate_t426_select_def.cjs, scripts/qa_repository_stage_compatibility.cjs, scripts/qa_smoke.cjs | callees: none | tests: 0 | entry: none
- `external:javascript:@tabler/icons` | external | External | callers: src/app/App.ts | callees: none | tests: 0 | entry: none
- `external:javascript:crypto` | external | External | callers: scripts/qa_asset_path_hygiene.cjs, scripts/qa_asset_path_hygiene.cjs, scripts/qa_smoke.cjs, scripts/qa_smoke.cjs | callees: none | tests: 0 | entry: none
- `external:javascript:fs` | external | External | callers: scripts/qa_asset_path_hygiene.cjs, scripts/qa_asset_path_hygiene.cjs, scripts/qa_repository_stage_compatibility.cjs, scripts/qa_repository_stage_compatibility.cjs | callees: none | tests: 0 | entry: none
- `external:javascript:jszip` | external | External | callers: scripts/qa_browser_gate_da32_024_source_intent_write_recovery.cjs, scripts/qa_browser_gate_da32_024_source_intent_write_recovery.cjs, scripts/qa_browser_gate_da32_028_source_write_observation_positive.cjs, scripts/qa_browser_gate_da32_028_source_write_observation_positive.cjs | callees: none | tests: 3 | entry: none
- `external:javascript:net` | external | External | callers: scripts/qa_repository_stage_compatibility.cjs, scripts/qa_repository_stage_compatibility.cjs, scripts/qa_smoke.cjs, scripts/qa_smoke.cjs | callees: none | tests: 0 | entry: none
- `external:javascript:node:buffer` | external | External | callers: scripts/qa_traces.cjs | callees: none | tests: 0 | entry: none
- `external:javascript:node:child_process` | external | External | callers: scripts/audit_authority_references.cjs, scripts/audit_authority_references.cjs, scripts/audit_da30_001_hold_references.cjs, scripts/close_da29_batch.cjs | callees: none | tests: 2 | entry: none
- `external:javascript:node:crypto` | external | External | callers: scripts/audit_da30_001_hold_references.cjs, scripts/audit_da30_001_hold_references.cjs, scripts/audit_da30_005_control_references.cjs, scripts/audit_da30_005_control_references.cjs | callees: none | tests: 15 | entry: none
- `external:javascript:node:fs` | external | External | callers: scripts/audit_authority_references.cjs, scripts/audit_authority_references.cjs, scripts/audit_css_duplication.cjs, scripts/audit_css_duplication.cjs | callees: none | tests: 32 | entry: none
- `external:javascript:node:http` | external | External | callers: scripts/qa_browser_gate_da32_023_source_write_intent.cjs, scripts/qa_browser_gate_da32_024_source_intent_write_recovery.cjs, scripts/qa_browser_gate_da32_025_source_write_phase_recovery.cjs, scripts/qa_browser_gate_da32_026_source_write_receipt_recovery.cjs | callees: none | tests: 0 | entry: none
- `external:javascript:node:module` | external | External | callers: src/tests/ControlAuthorityAudit.test.ts, src/tests/ControlAuthorityAudit.test.ts | callees: none | tests: 1 | entry: none
- `external:javascript:node:net` | external | External | callers: scripts/qa_browser_gate_da28_09_turns.cjs, scripts/qa_browser_gate_da28_09_turns.cjs, scripts/qa_browser_gate_da29_003.cjs, scripts/qa_browser_gate_da29_003.cjs | callees: none | tests: 0 | entry: none
- `external:javascript:node:os` | external | External | callers: src/tests/FightScreenFixture.test.ts, src/tests/FightScreenFixture.test.ts, src/tests/MaterializeControlProjections.test.ts, src/tests/MaterializeControlProjections.test.ts | callees: none | tests: 2 | entry: none
- `external:javascript:node:path` | external | External | callers: scripts/audit_authority_references.cjs, scripts/audit_authority_references.cjs, scripts/audit_css_duplication.cjs, scripts/audit_css_duplication.cjs | callees: none | tests: 32 | entry: none
- `external:javascript:node:url` | external | External | callers: scripts/materialize_sandbox_fightscreen.cjs, scripts/materialize_sandbox_fightscreen.cjs, scripts/qa_traces.cjs, scripts/qa_traces.cjs | callees: none | tests: 1 | entry: none
- `external:javascript:path` | external | External | callers: scripts/qa_asset_path_hygiene.cjs, scripts/qa_asset_path_hygiene.cjs, scripts/qa_repository_stage_compatibility.cjs, scripts/qa_repository_stage_compatibility.cjs | callees: none | tests: 0 | entry: none
- `external:javascript:playwright` | external | External | callers: scripts/qa_browser_gate_da26_13.cjs, scripts/qa_browser_gate_da27_07_turns.cjs, scripts/qa_browser_gate_da27_09_fightscreen.cjs, scripts/qa_browser_gate_da28_09_turns.cjs | callees: none | tests: 0 | entry: none
- `external:javascript:three` | external | External | callers: src/game/render/AxisRenderer.ts, src/game/render/CharacterRenderer.ts, src/game/render/CollisionBoxRenderer.ts, src/game/render/FightScreenAnnouncementRenderer.ts | callees: none | tests: 4 | entry: none
- `external:javascript:vite` | external | External | callers: scripts/qa_browser_gate_da28_09_turns.cjs, scripts/qa_browser_gate_fighter_lab.cjs, scripts/qa_content_pack_stages.cjs, scripts/qa_repository_stage_compatibility.cjs | callees: none | tests: 0 | entry: none
- Showing 20 of 942 nodes. Query `impact --module <path>` or open the HTML hierarchy for the rest.

## Edges

- `scripts/audit_authority_references.cjs` -> `external:javascript:node:child_process` | calls
- `scripts/audit_authority_references.cjs` -> `external:javascript:node:child_process` | imports
- `scripts/audit_authority_references.cjs` -> `external:javascript:node:fs` | calls
- `scripts/audit_authority_references.cjs` -> `external:javascript:node:fs` | imports
- `scripts/audit_authority_references.cjs` -> `external:javascript:node:path` | calls
- `scripts/audit_authority_references.cjs` -> `external:javascript:node:path` | imports
- `scripts/audit_authority_references.cjs` -> `scripts/lib_control_authority.cjs` | imports
- `scripts/audit_css_duplication.cjs` -> `external:javascript:node:fs` | calls
- `scripts/audit_css_duplication.cjs` -> `external:javascript:node:fs` | imports
- `scripts/audit_css_duplication.cjs` -> `external:javascript:node:path` | calls
- `scripts/audit_css_duplication.cjs` -> `external:javascript:node:path` | imports
- `scripts/audit_da30_001_hold_references.cjs` -> `external:javascript:node:child_process` | imports
- `scripts/audit_da30_001_hold_references.cjs` -> `external:javascript:node:crypto` | calls
- `scripts/audit_da30_001_hold_references.cjs` -> `external:javascript:node:crypto` | imports
- `scripts/audit_da30_001_hold_references.cjs` -> `external:javascript:node:fs` | calls
- `scripts/audit_da30_001_hold_references.cjs` -> `external:javascript:node:fs` | imports
- `scripts/audit_da30_001_hold_references.cjs` -> `external:javascript:node:path` | calls
- `scripts/audit_da30_001_hold_references.cjs` -> `external:javascript:node:path` | imports
- `scripts/audit_da30_005_control_references.cjs` -> `external:javascript:node:crypto` | calls
- `scripts/audit_da30_005_control_references.cjs` -> `external:javascript:node:crypto` | imports
- `scripts/audit_da30_005_control_references.cjs` -> `external:javascript:node:fs` | calls
- `scripts/audit_da30_005_control_references.cjs` -> `external:javascript:node:fs` | imports
- `scripts/audit_da30_005_control_references.cjs` -> `external:javascript:node:path` | calls
- `scripts/audit_da30_005_control_references.cjs` -> `external:javascript:node:path` | imports
- `scripts/build_character_from_imagegen_sheet.py` -> `external:python:PIL` | imports
- `scripts/build_character_from_imagegen_sheet.py` -> `external:python:__future__` | imports
- `scripts/build_character_from_imagegen_sheet.py` -> `external:python:argparse` | calls
- `scripts/build_character_from_imagegen_sheet.py` -> `external:python:argparse` | imports
- `scripts/build_character_from_imagegen_sheet.py` -> `external:python:collections` | calls
- `scripts/build_character_from_imagegen_sheet.py` -> `external:python:collections` | imports
- `scripts/build_character_from_imagegen_sheet.py` -> `external:python:io` | calls
- `scripts/build_character_from_imagegen_sheet.py` -> `external:python:io` | imports
- `scripts/build_character_from_imagegen_sheet.py` -> `external:python:json` | calls
- `scripts/build_character_from_imagegen_sheet.py` -> `external:python:json` | imports
- `scripts/build_character_from_imagegen_sheet.py` -> `external:python:pathlib` | calls
- `scripts/build_character_from_imagegen_sheet.py` -> `external:python:pathlib` | imports
- `scripts/build_character_from_imagegen_sheet.py` -> `external:python:shutil` | calls
- `scripts/build_character_from_imagegen_sheet.py` -> `external:python:shutil` | imports
- `scripts/build_character_from_imagegen_sheet.py` -> `external:python:statistics` | calls
- `scripts/build_character_from_imagegen_sheet.py` -> `external:python:statistics` | imports
- `scripts/build_da29_series_registry.cjs` -> `external:javascript:node:crypto` | calls
- `scripts/build_da29_series_registry.cjs` -> `external:javascript:node:crypto` | imports
- `scripts/build_da29_series_registry.cjs` -> `external:javascript:node:fs` | calls
- `scripts/build_da29_series_registry.cjs` -> `external:javascript:node:fs` | imports
- `scripts/build_da29_series_registry.cjs` -> `external:javascript:node:path` | calls
- `scripts/build_da29_series_registry.cjs` -> `external:javascript:node:path` | imports
- `scripts/build_da29_verdict_ledger.cjs` -> `external:javascript:node:crypto` | calls
- `scripts/build_da29_verdict_ledger.cjs` -> `external:javascript:node:crypto` | imports
- `scripts/build_da29_verdict_ledger.cjs` -> `external:javascript:node:fs` | calls
- `scripts/build_da29_verdict_ledger.cjs` -> `external:javascript:node:fs` | imports
- Showing 50 of 5246 edges; JSON contains every edge and its evidence.

## Unknown

- `scripts/audit_authority_references.cjs:74`: call-target-symbol-not-resolved (auditControlDocuments)
- `scripts/build_character_from_imagegen_sheet.py:58`: object-member-call-not-resolved (Image)
- `scripts/build_character_from_imagegen_sheet.py:77`: object-member-call-not-resolved (Image)
- `scripts/build_character_from_imagegen_sheet.py:91`: object-member-call-not-resolved (Image)
- `scripts/build_character_from_imagegen_sheet.py:225`: object-member-call-not-resolved (Image)
- `scripts/build_character_from_imagegen_sheet.py:333`: object-member-call-not-resolved (Image)
- `scripts/build_character_from_imagegen_sheet.py:394`: object-member-call-not-resolved (Image)
- `scripts/build_character_from_imagegen_sheet.py:395`: object-member-call-not-resolved (ImageDraw)
- `scripts/build_character_from_imagegen_sheet.py:404`: object-member-call-not-resolved (Image)
- `scripts/build_character_from_imagegen_sheet.py:405`: object-member-call-not-resolved (ImageDraw)
- `scripts/create_runtime_atlas_frames.py:85`: object-member-call-not-resolved (Image)
- `scripts/create_runtime_atlas_frames.py:104`: object-member-call-not-resolved (ImageDraw)

## Flows

- Python __main__: `scripts/package_external_mugen_fixtures.py` -> `external:python:json` | Static call path reaches external:python:json:dumps
- Python __main__: `scripts/package_external_mugen_fixtures.py` -> `external:python:zipfile` | Static call path reaches external:python:zipfile:ZipFile

## Architecture changes

- Nodes: +0 / -0; edges: +0 / -0.
- Boundary changes: 0; new cycles: 0.

## Read next

- Use `status` before relying on this generation.
- Use `impact --changed` for possible impact and related test evidence.
- Use `diff --before <model> --after <model>` for architecture changes.

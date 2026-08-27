# Code map · mugen-web-sandbox

generated: 2026-08-27T18:00:00Z
commit: f49350bac810
scope: .

counts: 10 nodes · 14 edges · 0 flows · 0 unknown

## Modules

- `external-dependencies` · `scripts/build_character_from_imagegen_sheet.py` · external · External
  callers: scripts (imports), src-app (imports), src-game (imports), src-mugen (imports), vitest-config (imports)
  callees: (none)
  tests: (none)
  entry: scripts/build_character_from_imagegen_sheet.py:__future__

- `repository` · `package.json` · module · Repository
  callers: (none)
  callees: scripts (calls)
  tests: (none)
  entry: package.json:{

- `scripts` · `scripts` · service · Scripts
  callers: repository (calls)
  callees: external-dependencies (imports), scripts-lib (imports), src-game (imports), src-mugen (imports)
  tests: src/tests/ControlAuthorityAudit.test.ts
  entry: scripts/audit_authority_references.cjs:extractCurrentBlocks

- `scripts-lib` · `scripts/lib` · service · Scripts
  callers: scripts (imports)
  callees: (none)
  tests: (none)
  entry: scripts/lib/assert_measured_matches_acceptance.cjs:anchorPaths

- `src` · `src` · module · Src
  callers: (none)
  callees: src-app (imports)
  tests: (none)
  entry: src/main.ts:root

- `src-app` · `src/app` · module · Src
  callers: src (imports)
  callees: external-dependencies (imports), src-engine (imports), src-game (imports), src-mugen (imports)
  tests: src/tests/AssetReleasePolicyV1.test.ts, src/tests/ContentPackStages.test.ts, src/tests/DebugPanel.test.ts, src/tests/DualCharacterLegalJourney.test.ts, src/tests/EvidenceEnvelope.test.ts
  entry: src/app/App.ts:tablerIcon

- `src-engine` · `src/engine` · service · Src
  callers: src-app (imports)
  callees: (none)
  tests: src/tests/CommonEvidenceFacts.test.ts, src/tests/ModuleContracts.test.ts
  entry: src/engine/CommonEvidenceFacts.ts:createCommonEvidenceFacts

- `src-game` · `src/game` · module · Src
  callers: scripts (imports), src-app (imports)
  callees: external-dependencies (imports), src-mugen (imports)
  tests: src/tests/AtlasSpriteProvider.test.ts, src/tests/CharacterRenderer.test.ts, src/tests/CommonFxFightScreenProof.test.ts, src/tests/CompositeSpriteProvider.test.ts, src/tests/FightScreenAnnouncementRenderer.font.test.ts
  entry: src/game/audio/MugenAudioSystem.ts:resolveRoundAnnouncementSound

- `src-mugen` · `src/mugen` · module · Src
  callers: scripts (imports), src-app (imports), src-game (imports)
  callees: external-dependencies (imports)
  tests: src/tests/ActParser.test.ts, src/tests/ActorConstraintSystem.test.ts, src/tests/AirParser.test.ts, src/tests/AnimationControllerSystem.test.ts, src/tests/AssertMeasuredMatchesAcceptance.test.ts
  entry: src/mugen/compatibility/AuthoritySelector.ts:createAuthoritySelectorDocument

- `vitest-config` · `vitest.config.ts` · module · Vitest.Config
  callers: (none)
  callees: external-dependencies (imports)
  tests: (none)
  entry: vitest.config.ts:import { defineConfig } from "vitest/config";

## Edges

- repository -> scripts · calls
- scripts -> external-dependencies · imports
- scripts -> scripts-lib · imports
- scripts -> src-game · imports
- scripts -> src-mugen · imports
- src -> src-app · imports
- src-app -> external-dependencies · imports
- src-app -> src-engine · imports
- src-app -> src-game · imports
- src-app -> src-mugen · imports
- src-game -> external-dependencies · imports
- src-game -> src-mugen · imports
- src-mugen -> external-dependencies · imports
- vitest-config -> external-dependencies · imports

## Unknown

- none

## Flows

- none

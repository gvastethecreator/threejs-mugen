# AssetProvenance/v2 closeout

Date: 2026-07-14

## Result

The bounded `AssetProvenance/v2` Studio gate is closed. Build, Assets, and the
browser package export now share deterministic, redacted provenance records
with explicit release-readiness blocking. The current fixture package remains
diagnostic-only because its six asset records have unknown license assertions.

## Evidence

- Code commit: `21e5db89 feat(studio): add asset provenance v2 transform chain`.
- `pnpm exec vitest run src/tests/StudioAssetProvenance.test.ts --testTimeout=30000`:
  1 file / 8 tests pass.
- `pnpm typecheck`: pass on TypeScript 7.0.2.
- `node --check scripts/qa_smoke.cjs`: pass.
- Focused Playwright plus ZIP inspection against the stable Vite server:
  Build reports `mugen-web-sandbox/asset-provenance/v2`, 6 records, 6 blocked,
  6 unknown licenses, 12 transforms, and zero absolute-path leaks.
- The Build trust row is `fail/blocked`, with six explicit
  `provenance:<asset-id>` blockers. Assets reports the same six records and a
  selected `blocked` provenance status.
- ZIP inspection finds `studio/asset-provenance.json`, v2 records, the manifest
  blocking count, the diagnostic-only warning, and zero absolute-path leaks.
  The focused screenshot is `.scratch/qa/qa-smoke/asset-provenance-focused.png`.
- The broad smoke wrapper was interrupted after reaching later Studio routes;
  it is not counted as a global smoke-green result. The bounded provenance
  gate itself has direct browser and package evidence.

## Claim ceiling

Allowed: versioned deterministic provenance, safe v1 migration, explicit SPDX
license state, ordered transform evidence, redacted paths, package embedding,
and release-readiness blocking.

Blocked: automatic license discovery, legal approval, release-ready status for
the current fixtures, full MUGEN/IKEMEN parity, and score movement.

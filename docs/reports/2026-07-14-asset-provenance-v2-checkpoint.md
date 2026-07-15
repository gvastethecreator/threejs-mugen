# AssetProvenance/v2 implementation checkpoint

Date: 2026-07-14

## Result

`AssetProvenance/v2` is implemented in the Studio asset path. The browser
bundle now carries a versioned provenance JSON file and the manifest exposes
record counts, release readiness, and blocking counts. Studio Build and Assets
surface the same records and block release readiness when legal, digest,
transform, or permission evidence is incomplete.

The diagnostic package remains downloadable when release readiness is blocked.
It is explicitly diagnostic-only and does not receive compatibility or score
credit.

## Evidence

- Code commit: `21e5db89 feat(studio): add asset provenance v2 transform chain`.
- `pnpm exec vitest run src/tests/StudioAssetProvenance.test.ts --testTimeout=30000`:
  1 file / 8 tests pass.
- `pnpm typecheck`: pass on TypeScript 7.0.2.
- `node --check scripts/qa_smoke.cjs`: pass.
- The broad smoke run reached Studio Build/Assets, source relink, evidence,
  debug, and asset views before the wrapper timeout. It did not produce a
  final green diagnostics artifact for this change, so the focused browser
  gate remains open and is not counted as green here.

## Current state

The KFM-derived records have complete technical transform metadata but no
explicit verified license assertion. `canExport` is therefore false, the
`asset-validation` Build check is blocked, and the ZIP manifest reports a
diagnostic-only package. This is the expected behavior of the new policy.

## Claim ceiling

Allowed: versioned deterministic provenance, v1 migration with unknown facts,
redacted paths, transform-chain evidence, and readiness blocking.

Blocked: legal approval, automatic license inference, a release-ready asset
package from the current fixtures, full MUGEN/IKEMEN parity, and score movement.

Next gate: run the focused Studio Build/Assets and package inspection browser
journey, then close `AssetProvenance/v2` only with a final diagnostics artifact.

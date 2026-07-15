# AssetProvenance/v2 research and implementation checkpoint

Date: 2026-07-14

## Official basis

- [SPDX `licenseExpression`](https://spdx.github.io/spdx-spec/v3.0.1/model/SimpleLicensing/Properties/licenseExpression/) defines the license assertion as an SPDX expression rather than an informal label.
- [SPDX license expressions](https://spdx.github.io/spdx-spec/v3.0.1/annexes/spdx-license-expressions/) define the expression vocabulary, including compound `AND`, `OR`, and `WITH` forms.
- [W3C PROV-DM](https://www.w3.org/TR/prov-dm/) models provenance through entities, activities, agents, and derivation. The transform-chain fields below are an implementation decision informed by that model, not a claim of full PROV serialization.

## Contract

`src/app/StudioAssetProvenance.ts` adds the versioned
`mugen-web-sandbox/asset-provenance/v2` record. Each record keeps:

- a declared and verified SPDX license assertion, or an explicit unknown state;
- aggregate and per-file input/output digests;
- stable entity/activity/agent identifiers;
- an ordered transform chain with transform kind, tool/version, config digest,
  input paths, output paths, and transform digest;
- QA, collision, and playtest links without inventing a passing result;
- redacted local paths, deterministic canonical JSON, and migration warnings.

The v1 migration keeps known digests and files but marks missing license,
activity, agent, transform version, and configuration facts as unknown. It never
infers a license or tool version from a filename or the old record shape.

## Readiness policy

Release readiness requires complete input/output evidence, a complete transform
chain, a declared and verified license assertion, and any required durable
permission. Missing legal or digest evidence makes `canExport` false and blocks
the Studio Build `asset-validation` release check. A ZIP snapshot may still be
downloaded as a diagnostic-only package and carries the blocking count in its
manifest.

The current imported assets deliberately provide no license assertion. Their
records therefore exercise the blocked path; this is an honest gate, not a
license inference.

## Evidence and ceiling

- `src/tests/StudioAssetProvenance.test.ts`: 1 file / 8 focused tests pass.
- `pnpm typecheck`: pass on TypeScript 7.0.2.
- `node --check scripts/qa_smoke.cjs`: pass.
- The full browser smoke was started and reached later Studio routes, but the
  long run was interrupted before final diagnostics. The bounded focused
  Studio browser/ZIP gate passes independently: Build and Assets expose v2,
  the release row is `fail/blocked`, and ZIP inspection finds the v2 file with
  a diagnostic-only warning and no absolute-path leaks.

Allowed: deterministic, redacted asset provenance records and release-readiness
blocking based on explicit evidence.

Blocked: automatic license discovery, legal approval, complete export readiness
for the current fixtures, full MUGEN/IKEMEN runtime parity, and score movement.

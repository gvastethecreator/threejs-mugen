# Implement CompatibilityCorpusSnapshot/v1

Type: task
Status: resolved
Blocked by: None

## Question

How should the current `CompatibilityCorpus/v0` and journey evidence become a
stable, materializable denominator with semantic identity separated from
observation metadata and freshness visible?

## Answer

Implement a separate `CompatibilityCorpusSnapshot/v1` contract. Normalize
package/license, journey, route, unsupported-feature, and artifact identities;
carry source revision plus tool/ruleset identity; validate a freshness policy;
compute stable `semanticDigest` without `observedAt`; and protect the complete
serialized envelope with `checksum`. Keep source payloads out of the snapshot.

First implementation slice: schema, nested parser, tamper cases, and a
repository-owned materializer over the existing MUGEN Lite and official-stage
journey records. No score movement and no new runtime compatibility claim.

## Evidence

- Research note: `docs/research/2026-07-16-compatibility-corpus-snapshot-v1.md`.
- Existing contracts: `src/mugen/compatibility/CompatibilityCorpus.ts`,
  `CompatibilityJourney.ts`, and `StageCompatibilityJourney.ts`.
- Acceptance: deterministic semantic digest, observed-time separation,
  fail-closed nested validation, exact artifact identity, deep freeze, and
  rebuild/freshness proof.

## Resolution

`CompatibilityCorpusSnapshot/v1` is implemented and materialized from the
current repository-owned MUGEN Lite journey. The checked artifact is
`docs/evidence/compatibility-corpus-snapshot-v1.json` with semantic digest
`b288c845` and transport checksum `63598806`. It contains one required legal
journey plus an explicit unavailable optional-private Training Room entry;
the external stage is not promoted from stale prose or ignored payloads.

Commits: `f8dc53b5`, `63768392`, `22addeef`.

Verification: focused `15/15`, TypeScript 7, materializer command, writer
syntax, and diff hygiene pass.

## Next

After schema and materialization close, characterize the four existing
RedirectID caller/destination paths before accepting ADR 0006 or widening
`TargetScoreAdd`.

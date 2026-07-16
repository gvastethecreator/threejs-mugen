# Implement CompatibilityCorpusSnapshot/v1

Type: task
Status: claimed
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

## Next

After schema and materialization close, characterize the four existing
RedirectID caller/destination paths before accepting ADR 0006 or widening
`TargetScoreAdd`.

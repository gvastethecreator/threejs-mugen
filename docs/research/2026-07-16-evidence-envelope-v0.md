# EvidenceEnvelope/v0 design

Date: 2026-07-16

## Question

How can Studio share revision-bound evidence facts across gate and package
analysis domains without turning a generic record into release policy or a
compatibility claim?

## Answer

Define a facts-only envelope with explicit subject, provenance, revisions,
derivation, observation, semantic digest, artifact SHA-256, and a digest over
deterministic canonical bytes. Keep domain decisions in adapters: a gate
adapter maps GateEvidence, and a package adapter maps PackageAnalysis/v1. The
envelope carries no `canRelease`, score, parity, or aggregate readiness field.

## Sources

- W3C, *PROV-O: The PROV Ontology*:
  https://www.w3.org/TR/prov-o/
- RFC Editor, *RFC 8785: JSON Canonicalization Scheme*:
  https://www.rfc-editor.org/rfc/rfc8785.html
- `src/app/GateEvidence.ts`: existing gate status, target, source revision,
  tool identity, observation time, freshness, and domain digest.
- `src/mugen/compatibility/PackageAnalysis.ts`: PackageAnalysis/v1 analyzer,
  ruleset, upstream revision, source package digest, semantic digest, and
  checksum.
- `src/app/StudioAssetReleasePolicy.ts`: explicit example of a domain release
  decision that must remain outside shared facts.

## Findings

1. GateEvidence already has a target, source revision, tool, observation,
   freshness limit, and domain digest, but it does not separate producer
   revision from source revision and its digest is a non-cryptographic FNV
   marker.
2. PackageAnalysis/v1 has analyzer/ruleset/upstream identity and SHA-256
   package/per-file facts, but its envelope is tied to scanner vocabulary and
   does not provide shared entity/activity/agent or derivation semantics.
3. PROV-O's entity/activity/agent distinction is a useful vocabulary boundary:
   an observed package or gate fact is an entity, the analysis/gate run is an
   activity, and the analyzer/tool is an agent. This project records the
   identifiers as facts; it does not claim PROV-O serialization conformance.
4. RFC 8785 defines a full JSON Canonicalization Scheme. The first project
   envelope should use an explicitly named `stable-json/v0` subset until JCS
   number/string edge cases are implemented and tested. It must still use a
   real cryptographic SHA-256 digest over its canonical bytes.
5. A release policy is a decision over evidence, not evidence itself. The
   asset adapter stays out of this first shared contract so `canRelease` cannot
   leak into generic consumers.

## Contract decision

Required envelope facts:

- `subject`: kind and stable ID.
- `provenance`: entity, activity, and agent IDs.
- `revisions`: source revision, producer ID/version/revision, optional project
  ID/revision.
- `derivation`: relation plus source envelope IDs.
- `observation`: status, observedAt, freshness, semantic digest, artifact
  SHA-256.
- `canonicalization`: `stable-json/v0`.
- `digest`: SHA-256 over the envelope payload without the digest field.

The parser rejects missing/deleted required facts, invalid digests, duplicate
derivation IDs, and digest tampering. Adapter callers must provide a producer
revision; inferring it from an observation timestamp is forbidden.

## Uncertainty

`stable-json/v0` is not RFC 8785/JCS conformance. The first adapter contract
also cannot infer a real project revision from a GateEvidence/v0 record that
does not carry one; callers must pass it or leave the optional project fact
absent. UI/export integration is a follow-up after the contract and adapters
prove deterministic parsing.

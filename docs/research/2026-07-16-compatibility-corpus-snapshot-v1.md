# Research: CompatibilityCorpusSnapshot/v1

Date: 2026-07-16
Lane: R1 compatibility evidence
Wayfinder ticket: 199

## Question

What contract can turn the existing `CompatibilityCorpus/v0` and journey
results into a reproducible snapshot without treating observation time as
compatibility identity or hiding missing/stale evidence?

## Answer

Add a separate `CompatibilityCorpusSnapshot/v1` contract. It keeps semantic
content in a normalized, immutable payload and computes `semanticDigest` from
that payload only. `observedAt` is retained as non-identity metadata. A
transport `checksum` protects the complete serialized envelope, so a changed
observation timestamp is detectable without changing the semantic identity.

The snapshot must carry source revision, tool/ruleset identity, package and
license identity, expected route ids, unsupported-feature ids, stable artifact
ids/paths/checksums, claims, and an explicit freshness policy. Missing required
journeys, unverified licenses, missing artifact identity, invalid freshness
policy, and digest/checksum drift fail closed.

## Sources

- Local audit: `docs/research/2026-07-15-daily-roadmap-architecture-audit-post-entry-554.md`, decisions G and tasks T04-T06. It identifies `generatedAt` as non-identity metadata and requires semantic digest, source/tool identity, nested validation, artifact identity, and freshness.
- Local implementation: `src/mugen/compatibility/CompatibilityCorpus.ts` and `src/mugen/compatibility/CompatibilityJourney.ts`. These are the existing v0/v1 input/result contracts; v1 currently hashes `generatedAt` inside its aggregate.
- [RFC 8785 JSON Canonicalization Scheme](https://www.rfc-editor.org/rfc/rfc8785.html). Canonical serialization is the external reference for deterministic hashed JSON; this project keeps its versioned stable serializer and does not claim JCS conformance.

## Decision boundary

- `CompatibilityCorpusSnapshot/v1` is an evidence/index contract, not a
  loader, trace runner, browser runner, or license adjudicator.
- Snapshot entries project package, journey, route, unsupported, and artifact
  identity; they do not copy ZIP/SFF/SND/browser payloads.
- `semanticDigest` excludes `observedAt`; `checksum` covers the serialized
  envelope including `observedAt`.
- Freshness is represented and validated by the contract. A later materializer
  must compare required artifact identities against current files/records.
- No score moves from this schema or its first materialization. Independent
  legal breadth and written readjudication remain separate gates.

## Acceptance

1. Equivalent entries in different order produce the same `semanticDigest`.
2. Changing only `observedAt` preserves `semanticDigest` and changes the
   transport `checksum`.
3. Parser rejects tampered digests/checksums, unsorted/non-normalized nested
   data, missing source/tool/freshness identity, and invalid required entries.
4. Output is deeply frozen and safe to serialize as a checked artifact.

## Remaining uncertainty

The first materialized snapshot still needs a source revision and artifact
freshness probe chosen by the repository's build environment. This note does
not authorize an independent third-party asset; the next breadth route must
remain repository-owned or independently legal.

# Studio EvidenceEnvelope integration research

Date: 2026-07-16

## Scope

This note records the source-backed boundary for wiring the shared
`EvidenceEnvelope/v0` facts contract into Studio Evidence, Build, and the
project ZIP. It intentionally does not promote a release decision.

## Sources and implications

- W3C, *PROV-O: The PROV Ontology*:
  https://www.w3.org/TR/prov-o/
  The Studio document keeps entity, activity, and agent identifiers as
  explicit facts. It uses the vocabulary boundary without claiming PROV-O
  serialization conformance.
- RFC Editor, *RFC 8785: JSON Canonicalization Scheme*:
  https://www.rfc-editor.org/rfc/rfc8785.html
  The project envelope remains explicitly `stable-json/v0`, not JCS. Its
  cryptographic digest is SHA-256 over the named stable serialization.
- `src/app/GateEvidence.ts` and `src/app/StudioGateEvidence.ts`: the static
  architecture gate supplies a source revision, tool identity, observed time,
  freshness limit, and domain digest.
- `src/mugen/compatibility/PackageAnalysis.ts`: PackageAnalysis/v1 supplies a
  source package SHA-256, analyzer/ruleset/upstream identity, observed time,
  semantic digest, and transport checksum.
- `src/app/ProjectStorage.ts`: a saved local project has a monotonic storage
  revision. An unsaved project must remain explicitly session-scoped; its
  revision cannot be inferred from `generatedAt`.

## Integration decision

`StudioEvidenceEnvelope.ts` is the producer boundary. It creates
`studio-evidence-envelope-document/v0` with:

- producer `mugen-web-sandbox/studio-evidence@1.0.0` and explicit adapter
  revision `evidence-envelope-adapter/v0`;
- saved project revision when available, otherwise `scope: session` plus a
  visible diagnostic;
- a GateEvidence envelope with SHA-256 over the stable gate result;
- a PackageAnalysis envelope whose source revision is the linked package
  digest and whose freshness becomes stale when the linked source digest does
  not match the report;
- a required ZIP path and Trust Chain row that identify the shared facts
  contract without importing release policy.

## Verification boundary

The focused contract batch passes 20/20 and TypeScript 7 typecheck passes.
The focused browser/export gate passes on desktop and mobile with zero
console/page errors and confirms the required ZIP path. The full imported
package smoke is still required before treating the PackageAnalysis producer
path as broadly closed.

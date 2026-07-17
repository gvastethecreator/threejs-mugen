# Integrate EvidenceEnvelope into Studio Evidence, Build, and export

Type: task
Status: resolved
Blocked by: Wayfinder 232
Date: 2026-07-16

## Question

How should Studio expose the shared `EvidenceEnvelope/v0` facts without
turning the bridge or project ZIP into a second release-policy system?

## Answer

Materialize `studio-evidence-envelope-document/v0` from the parsed static gate
document and the active `PackageAnalysis/v1` report. The document carries a
stable Studio producer identity, saved-project revision when local storage has
one, session scope when it does not, source/package revision matching, and
freshness counts. Surface it in the Evidence and Build panels, add a Trust
Chain contract row, expose it through the diagnostics bridge, and require
`studio/evidence-envelopes.json` in the project ZIP.

## Evidence

- `src/app/StudioEvidenceEnvelope.ts` materializes GateEvidence and
  PackageAnalysis adapters with cryptographic artifact digests.
- `src/app/App.ts` exposes the document in Evidence/Build, Trust Chain, bridge,
  and required export manifest.
- Focused Studio envelope tests pass 2/2; the combined contract batch passes
  20/20; TypeScript 7 typecheck passes.
- `pnpm run qa:studio:gate-evidence` passes with desktop/mobile UI checks,
  zero browser console/page errors, and ZIP assertions for schema, manifest,
  and envelope count.
- Full `pnpm run qa:smoke` passes in 459.5s; the imported package path exposes
  two current envelopes, including a current PackageAnalysis source match, and
  the required ZIP document is present.

## Claim ceiling

Envelopes are shared facts and freshness metadata. They do not approve assets,
replace `AssetReleasePolicy/v0`, execute IKEMEN scanner findings, or claim
MUGEN/IKEMEN runtime/rendering parity.

## Next

Keep the changed-source negative case as the next hardening slice; this
integration is promoted for the current Studio scope with the claim ceiling
above.

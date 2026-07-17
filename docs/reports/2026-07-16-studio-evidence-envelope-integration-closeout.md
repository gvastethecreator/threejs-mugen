# Studio EvidenceEnvelope integration closeout

Date: 2026-07-16
Scope: Wayfinder 233 / Studio EvidenceEnvelope integration

## Verdict

Bounded integration passed. Studio now materializes revision-bound evidence
facts from the static architecture gate and the active PackageAnalysis/v1
report, surfaces them in Evidence and Build, links them through Trust Chain,
and exports them as a required ZIP document.

## Implemented

- Added `src/app/StudioEvidenceEnvelope.ts` with the
  `studio-evidence-envelope-document/v0` producer boundary, saved/session
  project scope, package source-revision matching, freshness assessment, and
  no-release-policy rule.
- Added `App.ts` bridge, Evidence panel, Build panel, Build Readiness record,
  Trust Chain row, and required `studio/evidence-envelopes.json` export.
- Added focused tests for saved current facts, session scope, stale package
  source, parser preservation, and the existing envelope adapters.
- Extended browser QA to assert desktop/mobile visibility and ZIP manifest
  inclusion.

## Verification

- Focused Vitest batch: 4 files, 20 tests passed.
- TypeScript 7 typecheck: passed.
- Node syntax and diff checks: passed; existing CRLF warnings are limited to
  unrelated dirty roadmap files.
- `pnpm run qa:studio:gate-evidence`: passed in 50.8s.
- Browser evidence: Build and Evidence surfaces expose the document on
  desktop; Evidence remains within 390px mobile width; zero console issues and
  zero page errors.
- ZIP evidence: 63 files; `studio/evidence-envelopes.json` exists, is listed as
  required, has the expected schema, and contains one current gate envelope.

## Claim ceiling

The focused route does not prove imported PackageAnalysis freshness under a
full smoke. No release approval, JCS conformance, legal approval, or
MUGEN/IKEMEN parity claim is made.

## Next gate

Run the full imported ZIP smoke with the new envelope assertions, then add a
negative changed-source browser case if the broad route exposes a gap.

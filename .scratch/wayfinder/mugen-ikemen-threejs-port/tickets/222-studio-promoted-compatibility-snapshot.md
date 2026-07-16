# Surface promoted compatibility snapshot in Studio

Date: 2026-07-16
Status: resolved
Depends on: Wayfinder 221
Implementation commit: `abfa4c77`

## Outcome

The promoted `CompatibilityCorpusSnapshot/v1.1` is now a first-class Studio
Evidence/Build signal. The browser ships a validated source mirror of the
tracked evidence artifact, so the UI does not reconstruct or silently widen
the compatibility claim.

## Contract

- `StudioCompatibilitySnapshot.ts` parses the bundled JSON through the same
  snapshot parser used by materialization and fails closed on diagnostics.
- Evidence adds `compat:snapshot` with semantic digest, transport checksum,
  entry coverage, and the explicit claim ceiling.
- Build Readiness and the shared Trust Chain add
  `compatibility-snapshot`, marked exportable only when the promoted snapshot
  is valid and passed.
- Project ZIP export requires
  `qa/compatibility-corpus-snapshot-v1.json` and the package manifest lists it
  as a required QA file.
- The materializer synchronizes the canonical `docs/evidence` artifact into
  the source mirror after a successful write.

## Evidence

- Focused Studio snapshot tests: `2/2`.
- Companion ProjectCompiler tests in the batch: `5/5` total.
- TypeScript 7, production build, Node syntax, and `git diff --check`: passed.
- Focused browser QA: Build/Evidence status `passed`, Trust Chain state
  `exportable`, package snapshot `2/2` required entries and `8` artifacts,
  no page/console issues, and desktop/mobile horizontal overflow absent.
- Full `qa:smoke` reached the new Build/Evidence/package assertions, all of
  which passed; the command remains red on the pre-existing Workbench
  reopen assertion (`reopenedName` returned `Local Fighting Project`).

## Claim ceiling

This makes the existing repository-owned evidence inspectable and portable.
It does not claim external Ikemen-Go execution, complete MUGEN/IKEMEN parity,
third-party package breadth, or score movement.

## Next

Resolve the Workbench local-project reopen regression, then continue the
remaining editor/runtime contracts with the same evidence-backed Build gate.

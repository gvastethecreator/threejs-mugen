# Report: StudioSemanticDraft/v0 Closeout

Date: 2026-07-14

## Result

The bounded Studio source-editing slice is closed at its claim ceiling. One
existing folder-backed CNS/ST document now stays editable while a semantic
preflight runs, blocks invalid or stale drafts, revalidates the physical folder
before `createWritable()`, explicitly reimports, and verifies the edited text
digest after close.

## Evidence

- Focused browser route with the official KFM package: 58 states and 318
  controllers compiled; invalid paste produced one semantic error and a
  disabled Save; repair restored `ready`; explicit reimport was accepted with
  a clean draft and matched source identity.
- `pnpm vitest run src/tests/StudioSemanticDraft.test.ts`: 1 file / 5 tests
  passed.
- `pnpm test -- --maxWorkers=2 --testTimeout=20000`: 212 files / 2145 tests
  passed.
- `pnpm typecheck`: passed with TypeScript 7.0.2.
- `pnpm build`: passed, 290 modules; the existing large JavaScript chunk
  advisory remains.
- `pnpm check:boundaries`: passed.
- `pnpm qa:css:budget`: passed at 324085 bytes / 1519 rules.
- `pnpm qa:trace`: passed 600/600 artifacts, 566 required and 34 optional.
- `pnpm qa:stage`: passed desktop/mobile Training Room browser evidence.

## Smoke boundary

The complete `pnpm qa:smoke` run was attempted twice. Automatic server startup
timed out waiting for `networkidle`; a rerun against the stable Vite server
reached the pre-existing MUGEN Lite visual route but did not observe its attack
frame. That failure occurs before the Studio route. The focused Studio browser
route above passes, and the native/trace equivalents remain green. The global
smoke gate therefore stays open rather than being reported as green.

## Claim ceiling and next

Allowed: existing-file CNS/ST editing from a remembered folder with semantic
diagnostics, source identity protection, physical fingerprint revalidation,
explicit reimport, and final digest verification.

Blocked: ZIP rewrite, create/delete, watch/merge, post-close rollback, broad
state/controller/collision editors, and full MUGEN/IKEMEN authoring parity.

Next independent Studio candidates are `PackageAnalysis/v0` for source-located
recognized/unsupported/unknown findings or `AssetProvenance/v2` for stronger
source-to-runtime evidence links. Neither changes compatibility scores without
new executable compatibility evidence.

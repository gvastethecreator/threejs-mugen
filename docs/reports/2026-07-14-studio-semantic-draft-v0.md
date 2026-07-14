# Report: StudioSemanticDraft/v0

Date: 2026-07-14

## Result

Implemented the first side-effect-free Studio source draft preflight. Existing
folder source editing now parses and compiles one CNS/ST document in memory,
keeps source/revision identity on the draft, blocks invalid/stale saves, and
revalidates the physical source folder before opening a writable stream.

## Evidence

- `pnpm vitest run src/tests/StudioSemanticDraft.test.ts`: 1 file / 5 tests
  passed.
- `pnpm typecheck`: passed with TypeScript 7.0.2.
- Full regression, build, and browser smoke are part of the accumulated closeout
  after this documentation checkpoint.

## Changed behavior

- `.cns` and `.st` drafts receive parser diagnostics, Runtime IR compile counts,
  source/diagnostic digests, and explicit `ready` / `invalid` / `stale` state.
- `.def`, `.air`, `.cmd`, and other source paths remain readable but cannot be
  saved through this focused semantic editor.
- External folder changes are detected by a fresh directory fingerprint after
  permission and before `createWritable()`.
- The final reimport checks that the edited source digest survived the explicit
  write/reimport transaction.

## Claim ceiling

Allowed: bounded CNS/ST existing-file folder editing with semantic preflight and
source identity protection.

Blocked: ZIP rewrite, new-file creation, delete, watch/merge, atomic rollback
after a successful close, and broad MUGEN/IKEMEN authoring parity.


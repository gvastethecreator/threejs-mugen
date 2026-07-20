# T342 - Studio source semantic diagnostic navigation

Status: resolved at bounded source-authoring scope  
Date: 2026-07-20

## Question

What is the smallest editor improvement that turns semantic preflight output
into an actionable repair loop without replacing the active source textarea or
weakening the write gate?

## Delivered

- Studio renders every semantic error and warning with severity, location, and
  message inside the source editor.
- The diagnostics panel updates after debounced preflight without rebuilding
  the textarea, so the caret and unsaved text remain stable.
- Line-backed diagnostics are keyboard-focusable buttons that select the
  corresponding source line in the editor.
- Browser smoke covers malformed CNS, disabled save, diagnostic navigation,
  repaired CNS, explicit reimport, and package export.

## Verification

- `pnpm exec vitest run src/tests/StudioSourceDiagnostics.test.ts src/tests/StudioSemanticDraft.test.ts`
  passed: 2 files / 7 tests.
- Full Vitest passed: 239 files / 2589 tests.
- `pnpm typecheck` passed with TypeScript 7.
- `pnpm build` passed with 326 transformed modules.
- `pnpm qa:trace` passed: 633/633 artifacts, 599 required and 34 optional.
- `pnpm qa:css:budget` passed within all configured limits.
- `pnpm qa:smoke` passed with `status=passed`, real Vite server, Studio
  desktop/tablet captures, and zero reported page or console failures.
- Visual review covered `studio-source-folder-handle.png`, `studio-build.png`,
  and `studio-workbench-tablet.png`.

## Claim ceiling

This closes line-aware semantic feedback for the existing CNS/ST source
editor. It does not add structured controller/state authoring, ZIP rewriting,
file creation/deletion, watchers, merge conflict resolution, rollback beyond
the existing write transaction, or full MUGEN/IKEMEN parity.

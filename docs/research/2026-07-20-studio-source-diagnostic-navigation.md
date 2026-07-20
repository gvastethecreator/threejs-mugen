# Studio source diagnostic navigation

Date: 2026-07-20  
Ticket: T342  
Status: implemented at bounded source-authoring scope

## Question

How can the current Studio source editor turn semantic preflight into a repair
loop while preserving the active draft, write gate, and reimport contract?

## Findings

`StudioSemanticDraft/v0` already returns parser/compiler diagnostics with
optional source lines. The editor showed only a summary and diagnostic count.
Re-rendering the full Studio surface after every debounce would replace the
textarea and make long source edits hard to control.

## Decision

Add a bounded diagnostics panel beside the existing editor. The panel renders
from the current preflight, updates its own DOM after debounce, and keeps the
textarea instance alive. A diagnostic with a source line is a button; its
selection range is derived from the textarea value and the one-based parser
line. Diagnostics without a line remain visible as document-level records.

The save button still depends on `canWriteStudioSemanticDraft`. The panel adds
feedback and navigation only; it does not change semantic admission or source
write behavior.

## Evidence

- Range mapping covers CRLF lines, empty lines, first/last boundaries, and
  invalid line numbers in `StudioSourceDiagnostics.test.ts`.
- Browser smoke creates malformed CNS, waits for invalid preflight, verifies
  rendered diagnostics, focuses a line, repairs the document, saves, and
  confirms explicit reimport plus package export.
- Full verification: 239 test files / 2589 tests, TypeScript 7, 326-module
  build, 633/633 trace artifacts, CSS budget, and real Studio smoke pass.

## Limits

The editor still supports existing-file folder writes only. Structured state,
controller, collision, AIR, command, ZIP rewrite, file lifecycle, watcher,
merge, and full compatibility work remain separate roadmap items.

## Sources

- `src/app/StudioSemanticDraft.ts`
- `src/app/StudioSourceDocument.ts`
- `src/app/App.ts`
- `.scratch/wayfinder/mugen-ikemen-threejs-port/tickets/003-studio-editor-authoring-spine.md`

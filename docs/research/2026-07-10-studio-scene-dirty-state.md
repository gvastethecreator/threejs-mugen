# Studio Scene Dirty-State and Persistence

Date: 2026-07-10

## Question

Can the current Workbench matchup controls become a real bounded scene-authoring workflow instead of temporary playtest selectors?

## Existing standards foundation

The project index continues to use `window.localStorage`, whose origin-scoped data persists across browser sessions: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

## Decision

- Treat project name, P1, CPU, stage, stage-list selection, and asset replacement as authored manifest mutations.
- Set explicit dirty state and invalidate compiled manifest, trace artifact, and package outputs on mutation.
- Keep runtime rebuilding immediate so the authored scene remains directly playable.
- Save only through the existing explicit local-save command; successful save clears dirty state.
- Opening an imported or stored manifest establishes a clean baseline.
- Expose dirty state through an accessible `Saved`/`Unsaved` label, highlighted save icon, and diagnostics bridge.

## Evidence

- Browser smoke edits the scene to `Rook Apprentice` vs `Nova Boxer` on `Training Grid` and confirms `dirty = true` before save.
- It verifies the exact manifest entry in localStorage, reloads, reopens the project, and confirms the same name/entry with `dirty = false`.
- Visual artifact: `.scratch/qa/qa-smoke/studio-project-authoring.png`.
- Existing desktop/tablet no-overflow, build, runtime, and Studio smoke gates remain green.

## Blocked claims

No autosave, navigation prompt, undo/redo, conflict handling, multi-scene graph, collaborative merge, filesystem persistence, or source-file writeback is claimed. This is a persistent single-match scene authoring slice.

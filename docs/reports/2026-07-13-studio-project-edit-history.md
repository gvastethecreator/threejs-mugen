# Studio Project Edit History Report

Date: 2026-07-13
Status: closed at bounded identity-authoring scope

## Question

Can the current Studio project identity workflow gain reliable undo/redo without
letting stale runtime outputs or imported project identity drift out of sync?

## Scope

This slice covers the editable project identity already present in the
Workbench: project name, P1, CPU, and stage. It intentionally does not claim
undo/redo for CNS, CMD, AIR, collision, stage-layer, or source-file edits.

## Implementation

- `src/app/StudioEditHistory.ts` stores cloned before/after snapshots with a
  50-entry cap, no-op filtering, stale-current protection, and redo-branch
  invalidation.
- `App.ts` records project name, fighter, and stage edits; applies undo/redo by
  rebuilding the match runtime; invalidates compile, trace, and package
  outputs; updates the manifest name; and preserves the dirty marker.
- Opening a project manifest or importing a new character package resets the
  history boundary so edits cannot cross source/project identity changes.
- The Workbench exposes icon-only controls with tooltips and keyboard support:
  `Ctrl/Cmd+Z`, `Ctrl/Cmd+Shift+Z`, and `Ctrl/Cmd+Y`.
- The diagnostics bridge exposes history counts for browser QA without
  coupling the runtime contract to UI internals.

## Evidence

### Focused model tests

`src/tests/StudioEditHistory.test.ts`: `3/3` passed. Coverage includes ordered
undo/redo, stale-state rejection, redo clearing after a new branch, bounded
retention, and no-op edits.

### Browser smoke

`pnpm qa:smoke` passed. The Studio Workbench flow authored four edits, proved
button undo/redo and keyboard undo/redo, returned to the prior stage, restored
the final stage, preserved dirty state before save, and reopened the saved
manifest with the expected name and entry.

### Batch closure

- `pnpm test`: `186` files and `1967` tests passed.
- `pnpm typecheck`: passed through the production build.
- `pnpm check:boundaries`: passed.
- `pnpm build`: passed with the existing `1,667.41 kB` JavaScript chunk
  advisory.
- `pnpm qa:trace`: `581/581` artifacts passed (`547` required, `34` optional).

## Claim ceiling

Allowed: bounded identity-authoring history for the current Studio project
spine, with runtime rebuild, stale-output invalidation, dirty-state signaling,
and browser evidence.

Blocked: autosave and navigation guards, multi-scene graphs, state/controller/
collision authoring, filesystem persistence and conflict resolution,
migrations, source writes, broad editor undo semantics, and full
MUGEN/IKEMEN parity.

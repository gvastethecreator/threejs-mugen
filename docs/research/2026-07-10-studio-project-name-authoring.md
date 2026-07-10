# Studio Project Name Authoring

Date: 2026-07-10

## Question

What is the first persistent authoring field that can prove Studio is moving from an evidence viewer toward an editor?

## Standards references

- MDN documents that `window.localStorage` data is stored for an origin and persists across browser sessions: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
- MDN documents that text-input `change` fires when the value is committed by losing focus: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event
- MDN documents `maxlength` as the native maximum input-length constraint: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/maxlength

## Decision

- Add one compact project-name input to the existing Workbench project controls.
- Normalize outer/internal whitespace, reject empty names, and cap names at 80 characters in both model and HTML.
- Preserve imported project id while editing its display name; new projects derive their id when saved.
- Invalidate compiled manifest, trace, and package outputs on rename.
- Use the existing versioned project manifest and local project index instead of adding a parallel store.

## Evidence

- `StudioModel` unit coverage proves whitespace normalization, empty rejection, and the length cap.
- Project storage/compiler tests remain green.
- `qa:smoke` edits `QA Authored Fight Project`, saves it, reloads the browser, reopens the stored project, and verifies the name in both input and bridge manifest.
- Visual artifact: `.scratch/qa/qa-smoke/studio-project-authoring.png`.
- Desktop and 1024px Workbench overflow gates remain green.

## Blocked claims

This does not establish autosave, conflict handling, project-id rename semantics, migrations, file-system persistence, or scene/state/collision authoring. It is one real persistent field in the broader authoring spine, not a complete Studio editor.

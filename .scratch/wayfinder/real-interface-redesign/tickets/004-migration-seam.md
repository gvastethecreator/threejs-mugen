---
id: 004
title: Define the migration seam and proof matrix
type: research
status: resolved
claimed_by: /root
depends_on: [003]
---

# Question

How should the selected system replace the accumulated shell without discarding live behavior or overwriting unrelated dirty work?

# Answer

Direction 1 is implemented through the existing state and service seams. `App.ts` retains mode, Studio route, project, runtime, asset, evidence, source-handle, and build owners; the replacement shell only recomposes their rendered surfaces and explicit drawer/lens state.

# Ownership map

- Global chrome and drawer/lens state: `src/app/App.ts` (`renderStudioChrome`, shell data attributes, mode/route actions).
- Runtime scene and resolution boundary: `src/game/render/ThreeMugenRenderer.ts`.
- Base tokens/elements/accessibility: `src/styles/base.css` and its retained base imports.
- Active product composition: `src/styles/redesign.css`.
- Legacy visual modules: retained as source history but removed from the active imports in `src/styles/studio.css`; `src/styles/base/app-shell.css` is also no longer imported.

# Migration slices completed

1. Global Match/Inspect/Studio rail and explicit Workspace, lens, console, and command states.
2. Match scene-first HUD, contextual source/runtime lens, and bottom command rail.
3. Inspect source drawer plus local-package context lens.
4. Shared Studio shell across Workbench, Assets, Inspector, Stage, Debug, Evidence, Modules, and Build.
5. Narrow/mobile recomposition, long-content containment, renderer presentation-scale boundary, and QA contracts.

# Proof matrix

| State | Proof |
| --- | --- |
| Desktop default and live/busy runtime | `../proof/after.png` |
| Blocked/incomplete source | Match contextual lens in `../proof/after.png` |
| Inspect/source navigation | `../proof/inspect-desktop.png` |
| All eight Studio routes | `../proof/studio-*.png` |
| Long Evidence/Build data | `../proof/studio-evidence-polished.png`, `../proof/studio-build-polished.png` |
| Narrow Match and Studio | `../proof/mobile-first-pass.png`, `../proof/mobile-studio-workbench.png`, `../proof/mobile-studio-build.png` |
| Recovery/failure contracts | project `qa:smoke` source relink, conflict, recovery, console, and page-error gates |
| Reference fidelity | `../proof/design-qa-comparison.png`, `../proof/design-qa-detail-comparison.png`, root `design-qa.md` |

# Resolution

The seam is complete: stable public routes and data owners survived, the old imported visual cascade is retired, and the selected scene-first composition owns the active interface.

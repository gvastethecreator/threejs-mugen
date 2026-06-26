# Interface System

This project is a dense local engine tool, not a marketing site. The UI should help the user load, inspect, playtest, debug, compare evidence, and package projects without hiding partial support behind polish.

## Register

- Runtime is a product surface with game HUD cues. The canvas is primary; controls must stay compact and non-blocking.
- Inspector is a technical intake surface. It should foreground parsed files, selected animation/frame data, diagnostics, and unsupported features.
- Studio is a creator workbench. It should foreground project health, asset provenance, stage/character diagnostics, evidence, build readiness, and next actions.

Brand expression is allowed only as orientation between surfaces. Repeated controls, tables, logs, filters, and debug rows must stay product-like: dense, stable, readable, and keyboard accessible.

## Current UI Contract

- First screen remains usable Runtime Mode, not a landing page.
- The shell has three persistent zones: left navigation/workbench, center Three.js viewport, right inspector/debug panel, plus bottom console.
- Mode state is URL-backed through `mode`, Studio state is URL-backed through `studio`, and Studio Debug actor/lens selection is URL-backed through `actor` and `debug` when useful for support/review links.
- The workspace header exposes a command launcher. The command palette is the primary quick-jump surface for mode changes, Studio tabs, loading local content, compiling, exporting, evidence capture, and selected runtime actor inspection; it must keep keyboard focus stable while the runtime refreshes.
- The active surface has its own header copy and accent:
  - Runtime: playable sandbox.
  - Inspector: character intake.
  - Studio: project workbench.
- Studio keeps a persistent decision area in the focus panel: a current-decision hero plus a compact readiness rail. The rail must expose gate priority, asset attention, trace evidence, and build/manifest status as direct actions, not passive decoration.
- Studio left header includes a compact mission strip for the project flow: Intake, Assemble, Prove, Ship. Each step must be actionable and reflect real source/runtime/evidence/build state.
- Studio Workbench starts with a command center, not a passive summary. It must show project readiness lanes, the current operator priority, direct jumps to Assets/Evidence/Build/Debug, and primary actions for Playtest, MUGEN intake, trace export, and runtime compile.
- Inside non-Workbench Studio surfaces, the active task navigator appears before the general Studio surface grid, and the surface grid stays compact so diagnostics and next actions are not buried below global navigation.
- Changing Studio surfaces resets the left/right pane scroll positions; residual scroll from long Build/Assets/Debug panels should never hide the header of the newly selected task.
- Studio Workbench may summarize project state inline, but heavy project contract, recent-project, pipeline, and asset-library blocks should default to collapsible details so mobile and daily-use views stay scannable.
- Lists represent queues, records, or selectable objects. Selection and status use full-perimeter state, not decorative side stripes.
- Empty states are inline and task-facing. They should name the missing data and the next action.
- Console and diagnostics remain visible as honest project health, not hidden behind a modal. On narrow/mobile viewports the console should be compact and scroll internally so it does not steal the primary stage/workbench flow.
- On single-column/mobile layouts, the stage owns a complete row before navigation/debug panels begin, including Studio mode. No pane should visually overlap the runtime viewport or bury the playtest preview under long workbench panels.
- Evidence Trace Frame Scrubber should make frame-local trace data explainable. When `RuntimeTraceArtifact.world` exists, the selected frame must show compact world deltas for live actors, effect stores, target links, and lifecycle events instead of only checksum text.
- Stage Studio is a first-class diagnostic surface, not yet an editor. It must show selected stage source, floor/bounds/zoffset/camera/player starts, available stages, BG layer status, bounded/unsupported BG controller diagnostics, imported-stage file coverage, layer/controller fallback reasons, and unsupported stage features from `StageCompatibilityReport.backgrounds`.

## Component Direction

- Buttons: native `button`, visible focus, minimum 40px height in dense desktop UI, action-specific labels.
- Command palette: native dialog semantics, search input with preserved focus, bounded results, no dependency on modal-only workflows for core actions, and direct execution of existing app actions rather than duplicate one-off handlers.
- Tabs: native buttons with `role="tab"`, `aria-selected`, and compact labels. Long hints can collapse on narrow viewports.
- Badges: status and metadata only. Avoid turning every label into a pill if row hierarchy already explains it.
- Panels: structural sections use borders and spacing; nested cards are allowed only for focused next-action callouts or selectable records.
- Runtime Debug Studio: actor records and debug lenses are selectable native buttons. The selected actor detail must show ownership, lifecycle, state/animation, target links, owned actors, effect-store summary, runtime facts, imported CNS execution evidence, command-buffer history when available, and linked trace frames/gates without requiring users to read raw JSON. The lens panel must make target links, effects/stores, pause state, and audio/envshake events inspectable without scrolling through every actor block. Target/effect/pause lenses must show linked trace-world evidence when a trace artifact exists, with frame rows that can jump to the Evidence scrubber.
- Stage Studio: stage records, BG layers, and BG controllers are dense diagnostic rows. Use status badges, bounded/unsupported labels, and compact metadata rather than large cards; preserve native button semantics for stage selection and keep stage choices URL-backed through the existing `stage` parameter.
- Tables/records: use tabular numbers for frame/tick/state metrics.
- Motion: quiet CSS transitions for state feedback only. No page choreography for operational surfaces.
- Mobile: stage remains first, then workbench/debug surfaces stack below it. Touch controls must not overlap critical HUD/readout areas.

## Anti-Patterns To Avoid

- Landing-page hero treatment inside the tool.
- Generic gradient text, glass panels, huge rounded cards, and decorative icon tiles.
- Thick one-sided accent borders for status.
- Hiding unsupported MUGEN/IKEMEN behavior because it is visually messy.
- Making Studio actions available only in transient modals.
- Over-polishing demo/generated fighters while imported-character limitations are unclear.

## Verification Bar

Every frontend round that changes UI must finish with:

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm qa:smoke
```

`pnpm qa:smoke` must capture and pass Runtime desktop, Runtime mobile, Studio Workbench, Studio Build, Studio source-package relink, imported Studio Stage, native BGCtrl Lab Stage, Studio Assets, Studio Evidence, and Studio Debug screenshots. Studio Debug smoke coverage must include the overview plus targets/effects/pause/audio lenses. Visual review should inspect at least Runtime desktop, Studio Workbench, Studio Build, Studio source-package relink, Studio Stage, BGCtrl Lab, Studio Assets, Studio Debug lens shots, and Runtime mobile before claiming the interface round is done.

## Next Interface Cuts

- Expand command palette coverage with trace frame jumps and Stage Studio jumps for specific layer/report rows.
- Add persistent panel density controls once there is enough repeated daily use to justify them.
- Add deeper Runtime Debug drilldowns for helper/projectile/explod internals and state/controller watch lists. Actor selection, trace-frame jump, state-filter jump, controller/filter jump, execution-evidence rail, exact CNS state/controller row deep-link, command-buffer history, command-to-CMD Browser deep-link, targets/effects/pause/audio lenses, and first trace-world evidence rows already exist.
- Add persistent browser source handles/IndexedDB metadata after the first manual source-package relink flow proves stable.
- Add first-class Character Studio and Stage Studio editors after the current diagnostic previews are stable.
- Add a visual diff view for trace artifacts instead of only metric/gate rows.

# Interface audit — 2026-07-30

## Scope

Audited the running application at the real local route in a 1440×1024 desktop viewport and a 390×844 narrow viewport. Covered Runtime Match, empty Inspect intake, Studio Workbench, Assets, Inspector, Stage, Debug, Evidence, Modules, and Build. No production source was edited.

## Product journey and health

| Step | What the user needs | Current health | Evidence |
| --- | --- | --- | --- |
| Runtime Match | Play and read the fight | Functional artifact, overloaded shell | `01-runtime-desktop.png`, `12-runtime-mobile.png` |
| Inspect | Load a local ZIP/folder and understand compatibility | Clear empty state, visually isolated from the rest of the product | `10-inspect-desktop.png` |
| Workbench | See the next production move | Truthful but five regions compete for primacy | `02-studio-workbench-desktop.png`, `11-studio-workbench-mobile.png` |
| Assets | Select one asset and repair its provenance/QA | Real detail exists, pipeline and scene dilute the task | `03-assets-desktop.png` |
| Inspector | Read AIR/frame/collision/parser data | Useful facts, weak visual connection to the selected source | `04-inspector-desktop.png` |
| Stage | Inspect native/fallback layers and BG controls | Contract is present, stage diagnostics are compressed | `05-stage-desktop.png` |
| Debug | Relate an actor to runtime state | Strongest contextual detail, still trapped in the permanent shell | `06-debug-desktop.png` |
| Evidence | Understand why export is trusted or blocked | Truthful causal data, repeated in several summaries | `07-evidence-desktop.png` |
| Modules | Understand runtime contracts | Useful inventory, detached from the active blocker | `08-modules-desktop.png` |
| Build | Resolve blockers and produce outputs | Correctly blocked, visually near-identical to Evidence above the fold | `09-build-desktop.png` |

## What is worth preserving

- The live fight/stage is a credible, specific primary artifact.
- Project status is derived from real runtime, source, asset, evidence, and build facts.
- Blockers are not hidden and readiness is not faked.
- Modes and Studio views are URL-addressable.
- Inspect clearly says that local content stays local and begins with a real ZIP/folder action.
- The product already has meaningful keyboard/gamepad/touch entry points and semantic Studio tabs.

## Highest-impact findings

1. **No single primary region.** Top command/status strip, left pipeline, center stage, right inspector, and bottom console all claim persistent attention. This is the structural failure behind the accumulated redesigns.
2. **State is narrated repeatedly instead of causally.** Readiness, issue counts, pipeline gates, next action, evidence blockers, and console messages restate overlapping truth without showing one selected cause and its repair path.
3. **The artifact is squeezed or covered.** Runtime should foreground play; Studio should foreground the selected work object. Instead, the stage is always center but often functions as wallpaper behind unrelated work.
4. **Every job inherits the same cockpit.** Assets, frame inspection, stage authoring, actor debugging, evidence review, and packaging need different local geometries. Permanent panels erase those differences.
5. **Hierarchy relies on scaffolding.** Tiny uppercase monospace labels, pills, counters, one-sided borders, nested cards, and terminal-like chrome create density without clarifying priority.
6. **Mobile is a stacked desktop, not a designed mode.** There is no horizontal overflow in the sampled views, which is good, but Workbench becomes 2,708 px tall and the first viewport still stacks scene controls, overlay, mode switcher, command, and pipeline.
7. **Implementation ownership is accumulated.** A 15,736-line application owner and 12,087 lines of styles make local polish likely to collide with other routes and preserve old assumptions.

## Accessibility and resilience risks

- Repeated 10–11 px text and all-caps body fragments are difficult to scan.
- Dense adjacent controls create focus competition even where individual controls are semantic.
- Several content regions depend on truncation/no-wrap and fixed desktop widths; the detector recorded 60 nowrap and 36 fixed-width leads in UI sources.
- The narrow screenshots show no horizontal document overflow, but viewport height and reading order remain costly.
- Screenshot review cannot prove keyboard order, focus visibility, contrast ratios, reduced motion, screen-reader announcements, or canvas fallback behavior. Those require runtime checks after a direction is implemented.

## Root cause

The interface has been improved by adding layers to the same permanent three-zone-plus-console model. A real redesign must change the composition law: one dominant artifact, one current task, contextual detail, and evidence tethered to the selected cause.

## Audit limitations

- The empty Inspect state was audited without a user-owned external MUGEN ZIP/folder.
- Build and Evidence were inspected in the current blocked project state; no fake successful package was created.
- Static detector findings include contextual false positives and are used only when they agree with source/screenshot evidence.


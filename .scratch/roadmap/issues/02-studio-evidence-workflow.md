# 02 - Studio Evidence Workflow

Status: ready-for-agent
Labels: studio, visual-qa, docs, ready-for-agent

## Objective

Make Studio Mode the trusted operating surface for project state, assets, evidence, build/export readiness, and next actions.

## Next Useful Cuts

- Current queue label in `docs/ROADMAP_EXECUTION_BOARD.md`: S1 Studio Evidence/Build trust chain.
- Current visual checkpoint: Studio Evidence desktop surface now uses dense audit-ledger styling for trace summary, QA evidence, persisted trace history, frame deltas, world deltas, and compatibility rows. `pnpm qa:smoke` passed, and `.scratch/qa/qa-smoke/studio-evidence.png` was visually inspected.
- Current visual checkpoint: Studio Build and Modules desktop surfaces now use dense command-ledger styling for readiness, manifest, contract, and module rows. `pnpm qa:smoke` passed, and `.scratch/qa/qa-smoke/studio-build.png`, `.scratch/qa/qa-smoke/studio-modules.png`, and `.scratch/qa/qa-smoke/studio-modules-contracts.png` were visually inspected.
- Current visual checkpoint: Studio Assets desktop surface now uses dense asset-ledger styling for filters, selected asset detail, replacement flow, dependency sections, source/runtime map, provenance, playtest entries, and attention queue. `pnpm qa:smoke` passed, and `.scratch/qa/qa-smoke/studio-assets.png`, `.scratch/qa/qa-smoke/studio-assets-replacement.png`, and `.scratch/qa/qa-smoke/studio-workbench.png` were visually inspected.
- Current visual checkpoint: Studio command desk now uses icon-backed status metrics, a live Pause/HitPause viewport metric, and neutral desktop command-surface styling across Workbench, Build, Assets, and Debug. `pnpm qa:smoke` passed, and `.scratch/qa/qa-smoke/studio-workbench.png`, `.scratch/qa/qa-smoke/studio-workbench-tablet.png`, `.scratch/qa/qa-smoke/studio-debug-pause.png`, `.scratch/qa/qa-smoke/studio-build.png`, `.scratch/qa/qa-smoke/studio-assets.png`, and `.scratch/qa/qa-smoke/runtime-desktop.png` were visually inspected.
- Current visual checkpoint: Studio compact navigator, mode switch, workspace summary, mission-control rows, Build/Evidence route copy, stage toolbar placement, and replacement rows now use clearer vocabulary and dense ledger styling. `pnpm qa:smoke` passed in started-Vite mode after Chromium WebGL launch stabilization, and `.scratch/qa/qa-smoke/studio-workbench.png`, `.scratch/qa/qa-smoke/studio-workbench-tablet.png`, `.scratch/qa/qa-smoke/studio-modules-contracts.png`, `.scratch/qa/qa-smoke/studio-stage.png`, `.scratch/qa/qa-smoke/studio-evidence.png`, and `.scratch/qa/qa-smoke/studio-debug-evidence-mobile.png` were visually inspected.
- Current containment checkpoint: Studio chrome desktop CSS no longer uses a duplicate tail-end correction block for command/readout/actions. The merged block keeps Compile/Nav/Inspect/Focus visible; `pnpm qa:smoke` passed with Workbench desktop/tablet overflow disabled and Build export still producing trace checksum `9c9f205b`. Static interface detection still reports repeated P2/P3 patterns, so broader CSS primitive extraction remains open.
- Current CSS ownership checkpoint: Build/Evidence trust-ledger right rails live in `src/styles/studio-trust-ledgers.css`, Modules/Debug system-ledger rows live in `src/styles/studio-system-ledgers.css`, Command Palette desktop overlay lives in `src/styles/studio-command-palette.css`, Stage diagnostics live in `src/styles/studio-stage.css`, and Inspector desktop rows live in `src/styles/studio-inspector.css` instead of tail-end `src/style.css` blocks. The latest cleanup moved the app shell and remaining legacy Studio cascade out of `src/style.css` into `src/styles/app-shell.css`, `src/styles/studio-legacy-surfaces.css`, `src/styles/studio-editor-cascade.css`, `src/styles/studio-ui-hardening.css`, and `src/styles/studio-desktop-authority.css`; command-center ownership remains in `src/styles/studio-command-center.css`, Modules keep two-line rows and 40px system actions from `src/styles/studio-system-ledgers.css`, and mission rows plus compact Studio tabs expose textual status. `pnpm qa:css` reads CSS files in real `src/main.ts` import order and reports 2,622 scanned rules, 83 duplicate selector keys / 184 instances, 0 exact duplicate rules, 198 repeated declaration groups, 79 cross-file duplicate selectors, 0 selectors shared with `src/style.css`, and 0 legacy `style.css` rules fully shadowed by later imports.
- Current visual checkpoint: `pnpm qa:smoke` passed after the command-center overlap prune; `studio-workbench.png`, `studio-workbench-tablet.png`, `runtime-mobile.png`, and `studio-modules.png` were inspected for visible mission status text, no horizontal overflow, readable command-center rows, and intact runtime/stage framing.
- Current CSS hygiene checkpoint: `src/styles/studio-command-center.css` owns the active Studio desktop command-center shell after the legacy base stylesheet, `pnpm qa:css` exists for duplication metrics, and exact duplicate CSS rules remain zero. Remaining duplicate selector keys are cascade debt, so the next cleanup should extract shared row/status/action primitives rather than add more final overrides.
- Current visual readability checkpoint: Build/Evidence right rails now allow impact/next-action copy to expand inside ledger rows, Evidence next-action/actions render as horizontal command rows instead of squeezed nested cards, Build output actions are readable ledger rows, Assets keeps selected-asset impact and next action visible, and a mismatched `div`/`section` close in the Assets surface was repaired. Desktop Playwright captures live in `.scratch/qa/studio-professional-pass/05-final/`; final visual metrics show no horizontal overflow and the primary Build/Evidence clipping reduced to long-path/tag truncation only.
- Promote `docs/PORT_COMPLETION_SCORECARD.md` scores into Studio Evidence/Build as read-only status rows once the data can link to real gates.
- Make Evidence and Build surfaces point to the same source of truth.
- Expose stale, missing, partial, blocked, and exportable states with affected item, impact, evidence, and next action.
- Give each blocked item one primary next action and one linked evidence/source row.
- Improve Character/Stage/Debug panels only when they bind to real runtime, parser, or evidence data.
- Keep Workbench -> Assets -> Evidence -> Build as the main workflow.

## Acceptance

- UI uses real project/runtime/evidence data, not decorative status.
- Visible changes close with `pnpm qa:smoke` and screenshot/diagnostic inspection.
- `docs/INTERFACE_SYSTEM.md`, `docs/ENGINE_STUDIO_ROADMAP.md`, and `docs/PROGRESS_TRACKER.md` are updated when workflow meaning changes.

## Blocked Claims

- Full editor/authoring suite.
- Production export pipeline.
- Multi-project asset database.
- Any readiness badge that cannot link to evidence or a next action.

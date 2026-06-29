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
- Current CSS ownership checkpoint: Build/Evidence trust-ledger right rails moved from tail-end `src/style.css` blocks into `src/styles/studio-trust-ledgers.css`. `pnpm qa:css` reports 4,022 scanned rules, 390 duplicate selector keys, 0 exact duplicate rules, and 308 repeated declaration groups; `pnpm qa:smoke` passed, and `.scratch/qa/qa-smoke/studio-build.png`, `.scratch/qa/qa-smoke/studio-evidence.png`, and `.scratch/qa/qa-smoke/studio-evidence-world-delta.png` were visually inspected.
- Current CSS hygiene checkpoint: `src/styles/studio-command-center.css` owns the active Studio desktop command-center shell after the legacy base stylesheet, `pnpm qa:css` exists for duplication metrics, and exact duplicate CSS rules were reduced to zero. Remaining duplicate selector keys are cascade debt, so the next cleanup should extract shared row/status/action primitives rather than add more final overrides.
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

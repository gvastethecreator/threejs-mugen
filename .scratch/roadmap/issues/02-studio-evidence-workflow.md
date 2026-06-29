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
- Current CSS ownership checkpoint: Build/Evidence trust-ledger right rails live in `src/styles/workflows/studio-trust-ledgers.css`, Modules/Debug system-ledger rows live in `src/styles/workflows/studio-system-ledgers.css`, Command Palette desktop overlay lives in `src/styles/command/studio-command-palette.css`, Stage diagnostics live in `src/styles/workflows/studio-stage.css`, and Inspector desktop rows live in `src/styles/workflows/studio-inspector.css` instead of tail-end `src/style.css` blocks. The latest cleanup keeps `src/style.css` as a small base/reset stylesheet and moves the ordered Studio/app cascade behind `src/styles/studio.css`; active shell/command ownership lives in `src/styles/shell/*` and `src/styles/command/*`, Modules keep two-line rows and 40px system actions from `src/styles/workflows/studio-system-ledgers.css`, mission rows plus compact Studio tabs expose textual status, legacy Studio truncation/text-wrap rows share grouped CSS atoms, and status metric colors plus ok/warn summary/health/lane panel tints share base status atoms. The legacy split files now balance independently instead of relying on braces crossing file boundaries. `pnpm qa:css` now reads CSS files through the `src/main.ts` import list and nested local CSS `@import` graph and reports 2,618 scanned rules, 0 duplicate selector keys / 0 instances, 0 exact duplicate rules, 164 repeated declaration groups, 125 cross-file duplicate selectors, 0 selectors shared with `src/style.css`, 0 legacy `style.css` rules fully shadowed by later imports, and 0 cross-file rules fully shadowed by later imports.
- Current product checkpoint: Studio Build and Evidence now render the same Trust Chain rows from Build Readiness data for runtime manifest, QA evidence, project package, asset validation, source packages, compatibility gates, and architecture boundaries. Each row shows lane, status, state, proof detail, evidence, impact, blockers, freshness/delta, target kind/id, and the primary next action; compile, export package, trace filter/frame, asset attention selection, exact source-package relink, compile evidence, and gate evidence rows use direct action attributes where safe. The QA bridge exposes `studioTrustChain`, and `pnpm qa:smoke` now fails if Build/Evidence lose shared row ids, targets, deltas, or next-action binding.
- Current visual checkpoint: `pnpm qa:smoke` passed after the command-center overlap prune; `studio-workbench.png`, `studio-workbench-tablet.png`, `runtime-mobile.png`, and `studio-modules.png` were inspected for visible mission status text, no horizontal overflow, readable command-center rows, and intact runtime/stage framing.
- Current CSS hygiene checkpoint: `src/styles/command/*` owns the active Studio desktop command shell after the legacy base stylesheet, `pnpm qa:css:detail` exists for overlap plus repeated-declaration inspection, and exact duplicate CSS rules, same-file duplicate selector keys, and fully shadowed cross-file rules remain zero. Cross-file overlaps and repeated declaration groups are still cascade debt; the next cleanup should extract shared row/status/action primitives rather than add more final overrides.
- Current visual readability checkpoint: Build/Evidence right rails now allow impact/next-action copy to expand inside ledger rows, Evidence next-action/actions render as horizontal command rows instead of squeezed nested cards, Build output actions are readable ledger rows, Assets keeps selected-asset impact and next action visible, and a mismatched `div`/`section` close in the Assets surface was repaired. Desktop Playwright captures live in `.scratch/qa/studio-professional-pass/05-final/`; final visual metrics show no horizontal overflow and the primary Build/Evidence clipping reduced to long-path/tag truncation only.
- Promote `docs/PORT_COMPLETION_SCORECARD.md` scores into Studio Evidence/Build as read-only status rows once the data can link to real gates.
- Continue tightening Evidence and Build around the shared Trust Chain source of truth, especially visible selected-row focus after target-specific linking.
- Add package-file and source-file drilldowns to the same Trust Chain contract instead of reintroducing independent Build/Evidence status summaries.
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

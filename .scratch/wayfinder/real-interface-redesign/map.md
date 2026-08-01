# Wayfinder map — Real interface redesign

## Destination

Reach one selected, implementation-ready interface direction that replaces the current visual system across Runtime Match, Inspect, and all eight Studio routes while preserving live runtime data, project intake, evidence, build truth, URL-addressable state, and recovery safeguards.

The destination is not a reskin. It is a new composition model with one dominant artifact, contextual controls, explicit causal evidence, and a credible desktop-to-narrow strategy.

## Known terrain

- The product has three public modes: Runtime Match, Inspect, and Studio.
- Studio has eight stable URL-addressable views: Workbench, Assets, Inspector, Stage, Debug, Evidence, Modules, and Build.
- The operational spine is Workbench → Assets → Evidence → Build. Character inspection, Stage, Debug, and Modules support that spine.
- The live scene, real project/readiness facts, local-only intake, evidence artifacts, and package/export blockers are product truth and must survive.
- The working tree is already heavily modified. Existing changes are not redesign ownership and must be preserved.
- Production source stays untouched until the visual direction is selected.

## Fog boundary

- Visual target: resolved to `concepts/01-fight-first-context-lens.png`.
- Exact component/file migration sequence: resolved and implemented in ticket 004.
- External character-package states requiring a user-owned local ZIP/folder cannot be fabricated as proof.

## Decision path

1. Reconstruct the real product contract and surface inventory — ticket 001, resolved.
2. Audit current visual causality on desktop and narrow viewports — ticket 002, resolved.
3. Choose one of three incompatible visual directions — ticket 003, HITL, resolved to Fight First / Context Lens.
4. Convert the chosen direction into a migration seam and proof matrix — ticket 004, resolved.
5. Migrate all affected views in coherent slices, then prove the real path — completed across Match, Inspect, and all eight Studio routes.

## Tickets

| Ticket | Type | Status | Decision unlocked |
| --- | --- | --- | --- |
| [001](tickets/001-product-contract.md) | Research | Resolved | What must survive the redesign |
| [002](tickets/002-current-interface-audit.md) | Research | Resolved | What must be removed or recomposed |
| [003](tickets/003-select-direction.md) | HITL | Resolved | Which visual system can enter production |
| [004](tickets/004-migration-seam.md) | Research | Resolved | How to replace the shell without losing live behavior |

## Evidence index

- `audit/01-runtime-desktop.png`
- `audit/02-studio-workbench-desktop.png`
- `audit/03-assets-desktop.png` through `audit/09-build-desktop.png`
- `audit/10-inspect-desktop.png`
- `audit/11-studio-workbench-mobile.png`
- `audit/12-runtime-mobile.png`
- `audit/static-findings.json`
- `audit/report.md`
- `concepts/01-fight-first-context-lens.png`
- `concepts/02-evidence-split-cause-repair.png`
- `concepts/03-scene-desk-layered-workbench.png`
- `context-card.md`
- `kill-list.md`
- `direction-cards.md`
- `geometry-ledger.md`
- `geometry-ledger.json`
- `proof/before.png`
- `proof/after.png`
- `proof/design-qa-comparison.png`
- `proof/design-qa-detail-comparison.png`
- `finish-ledger.md`
- `finish-ledger.json`

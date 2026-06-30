# Roadmap Continuity Guide

Last updated: 2026-06-29

This guide exists so the project can keep moving without losing the thread. It does not replace the scorecard, execution board, or workplan. It explains how to continue the port in a way that produces usable software instead of scattered experiments.

## Current Horizon

The active horizon is:

```txt
MUGEN-lite playable MVP
  -> official/local KFM-style package runs common authored routes
  -> native/generated roster remains playable
  -> unsupported features are visible, classified, and non-crashing
  -> Studio can show what is loaded, stale, blocked, exportable, and proven
  -> every compatibility claim has a test, trace, fixture, screenshot, or build artifact
```

The project is not currently trying to claim full MUGEN or IKEMEN parity. It is building the engine shape that can eventually reach those horizons.

## Continuity Rules

1. Preserve the playable sandbox.
2. Prefer one score-moving gate over broad unfinished work.
3. Treat scanner support, parser support, runtime execution, and visual parity as separate claims.
4. Keep generated/native fighters separate from imported MUGEN compatibility.
5. Do not move scores from docs-only work.
6. Every runtime compatibility cut must name what is still blocked.
7. Every frontend/render cut must close with visual QA.
8. Every broad planning pass must leave a smaller next implementation slice.

## Workstream Ladder

| Order | Workstream | Goal | Evidence that counts |
| --- | --- | --- | --- |
| 1 | R1 Runtime compatibility | More KFM/Common1-style authored routes execute. | `pnpm qa:trace`, focused runtime tests, optional KFM fixture gates. |
| 2 | R2 MatchWorld ownership | Mutable runtime behavior moves behind named systems. | Focused system tests, stable or documented trace checksums. |
| 3 | S1 Studio trust chain | Evidence and Build agree on status and next action. | `pnpm qa:smoke`, screenshots, real evidence rows. |
| 4 | A1 Generated assets | Prompt/source/atlas/QA/playtest/collision records stay linked. | Asset QA records, Studio surfacing, visual smoke if UI changes. |
| 5 | I1 IKEMEN scanner | More IKEMEN source/docs signals are recognized and classified. | Scanner tests and blocked runtime wording. |
| 6 | M1 Modular engine | Shared contracts prove no fighting-specific leakage. | `pnpm check:boundaries`, contract tests, docs. |

## Next Useful Runtime Gates

These are good next implementation slices because they can be proven without pretending to finish the full VM:

- Add one missing Common1 guard/fall/recovery oracle that records exact controller/operation order.
- Promote one currently parser-only or scanner-only controller into a typed no-crash runtime operation when semantics are simple.
- Deepen `MatchWorld` ownership around helper lifecycle, target ownership, or presentation effects.
- Add one trace gate for a controller family that currently has only unit-level proof.
- Improve FightFX/common presentation only if the result can be seen in smoke diagnostics or trace metadata.

Avoid starting full helper VM, full ZSS/Lua, rollback, teams, or screenpack parity until the smaller routes above stay green.

The compact package ladder lives in `docs/ROADMAP_PACKAGE_MILESTONES.md`; the tactical next-10-slices queue lives in `docs/NEXT_BUILD_ROADMAP.md`. After docs/setup work, return to both before choosing code.

Latest closed implementation checkpoint: `RuntimeTargetControllerDispatchWorld` owns bounded active-state Target / BindToTarget side-effect dispatch into `RuntimeTargetWorld` while `PlayableMatchRuntime` still owns trigger filtering, active-state order, concrete state validation, and candidate target selection. Do not reselect `VarRandom`, `MakeDust`, `RuntimeContactMemoryWorld`, `RuntimeRandomSystem`, `HitSparkAssetSystem`, `RuntimeRecoverySystem`, `BindToTarget` target-system ownership, active target-binding position ownership, `RuntimeHitEligibilityWorld`, `RuntimeAssertSpecialWorld`, `RuntimeSnapshotWorld` stage/camera ownership, `RuntimeSnapshotWorld` player actor projection, `RuntimeCompatibilityTelemetryWorld`, `RuntimeOrientationWorld`, `RuntimeGuardWorld`, `RuntimeGetHitStateWorld`, `RuntimeHitStateTransitionWorld`, `RuntimeStateAvailabilityWorld`, `RuntimeStunWorld`, `RuntimeStateEntryWorld`, `RuntimeResourceWorld`, `RuntimeControllerDispatchWorld`, `RuntimeStateEntrySetupWorld`, `RuntimeSpriteEffectControllerWorld`, or `RuntimeTargetControllerDispatchWorld` ownership as the next cut; continue into R1 Common1/FightFX precision or a deeper R2 helper/effect/combat ownership seam.

## Next Useful Studio Gates

Studio should become a production workbench, not a static dashboard. Good next slices:

- One shared status contract consumed by Evidence and Build.
- One primary next action for each blocked/stale/missing/exportable row.
- Trace comparison rows that link to frame or actor evidence.
- Asset provenance record that joins source prompt, image sheet, atlas manifest, QA report, collision data, and playtest entry.
- Export readiness that refuses decorative success states when sources are missing.

## Documentation Update Matrix

Use this table when closing a slice:

| Slice type | Must update |
| --- | --- |
| Runtime support or controller semantics | `docs/SUPPORTED_FEATURES.md`, `docs/CONTROLLER_SUPPORT_REGISTRY.md`, `docs/WORKPLAN.md`, `docs/BUILD_EXECUTION_BACKLOG.md`, relevant `.scratch/roadmap/issues/` file. |
| Trace or fixture claim | `docs/QA_AND_ACCEPTANCE_GATES.md`, `docs/FIXTURE_GOLDENS.md` if golden policy changes, relevant issue. |
| Score change | `docs/PORT_COMPLETION_SCORECARD.md`, `docs/PROGRESS_TRACKER.md`, `docs/ROADMAP_EXECUTION_BOARD.md`. |
| Studio workflow | `docs/ENGINE_STUDIO_ROADMAP.md`, `docs/INTERFACE_SYSTEM.md`, `docs/PROGRESS_TRACKER.md`, relevant issue. |
| Generated asset pipeline | `docs/GENERATED_ASSET_QA_CONTRACT.md`, `docs/ENGINE_STUDIO_ROADMAP.md`, relevant issue. |
| IKEMEN scanner | `docs/IKEMEN_GO_REFERENCE.md`, `docs/COMPATIBILITY_PROFILES.md`, `docs/SUPPORTED_FEATURES.md`, relevant issue. |
| Modular boundary | `docs/MODULE_BOUNDARY_CONTRACT.md`, `docs/CREATOR_STUDIO_AND_MODULAR_ENGINE.md`, relevant issue. |
| Docs/setup only | `AGENTS.md`, `docs/agents/*`, `docs/ROADMAP_NAVIGATION.md`, `docs/PROGRESS_TRACKER.md` if the navigation model changes. |

## Closeout Template

Use this exact shape for meaningful progress:

```txt
Changed:
Evidence:
Claim allowed:
Claim blocked:
Next:
```

For docs-only work, say `No score movement`.

## Stop Conditions

Pause and ask the user only when:

- a fixture or asset is required and cannot be generated or downloaded safely,
- a product decision changes the horizon or public/private boundary,
- a third-party asset would need to be committed to the repo,
- the same blocker repeats across multiple attempts and no smaller route remains.

Otherwise keep making small, verified progress.

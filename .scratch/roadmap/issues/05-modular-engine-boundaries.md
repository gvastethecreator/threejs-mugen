# 05 - Modular Engine Boundaries

Status: ready-for-agent
Labels: docs, module-boundary, ready-for-agent

## Objective

Prepare the project to become a reusable browser game engine without extracting shared core too early from unstable fighting-specific behavior.

## Next Useful Cuts

- Current queue label in `docs/ROADMAP_EXECUTION_BOARD.md`: M1 Shared contract readiness.
- Keep parser/runtime/render/audio/UI boundaries clean.
- Identify shared candidates only after MatchWorld, Build, Evidence, input, snapshots, and asset contracts stabilize.
- Keep MUGEN-specific concepts out of future shared core interfaces.
- Plan platformer/other genre slices as contract consumers, not forks.
- Record any candidate shared contract with an explicit "no CNS/CMD/HitDef/round/helper/target leakage" check.
- Latest completed cut: `pnpm check:boundaries` now runs `scripts/check_boundaries.cjs` to guard future `src/core/**`, `src/platformer/**` / `src/modules/platformer/**`, and `src/engine/**` shared-contract leakage. `runtime-manifest/v0` exports this command as `contracts.verificationCommands.boundary`. This is a boundary safety net, not platformer/runtime support.

## Acceptance

- Boundary tests or docs explain what is fighting-specific vs. shared.
- `pnpm check:boundaries` passes when shared/core/platformer paths have no forbidden fighting imports or terminology.
- `docs/MODULE_BOUNDARY_CONTRACT.md` is updated when contracts move.
- Existing fighting runtime trace/smoke gates remain green.

## Blocked Claims

- Production multi-genre engine.
- Platformer runtime before fighting contracts stabilize.
- Moving CNS/CMD/HitDef/Common1 concepts into generic core.

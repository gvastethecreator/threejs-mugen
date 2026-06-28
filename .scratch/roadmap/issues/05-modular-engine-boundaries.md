# 05 - Modular Engine Boundaries

Status: ready-for-agent
Labels: docs, module-boundary, ready-for-agent

## Objective

Prepare the project to become a reusable browser game engine without extracting shared core too early from unstable fighting-specific behavior.

## Next Useful Cuts

- Keep parser/runtime/render/audio/UI boundaries clean.
- Identify shared candidates only after MatchWorld, Build, Evidence, input, snapshots, and asset contracts stabilize.
- Keep MUGEN-specific concepts out of future shared core interfaces.
- Plan platformer/other genre slices as contract consumers, not forks.

## Acceptance

- Boundary tests or docs explain what is fighting-specific vs. shared.
- `docs/MODULE_BOUNDARY_CONTRACT.md` is updated when contracts move.
- Existing fighting runtime trace/smoke gates remain green.

## Blocked Claims

- Production multi-genre engine.
- Platformer runtime before fighting contracts stabilize.
- Moving CNS/CMD/HitDef/Common1 concepts into generic core.

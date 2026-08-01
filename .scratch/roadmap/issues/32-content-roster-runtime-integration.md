# 32 - T447 content-pack roster and runtime integration

Status: in_progress
Labels: content-pack, roster, select-def, runtime, browser-smoke, qa
Lane: C4 integration
Priority: P0
Depends on: T439-T446

## Current evidence (2026-07-30)

The bounded demo roster now exposes the six satirical fighters plus the eight
classic-uniform recolors (14 selectable IDs) in `demoFighters.ts`, with an
explicit fallback status until their full action atlases are accepted. The
three verified parallax stages are available from `App.getAvailableStages()`.
DEF/CMD/CNS/AIR/SFF package assembly, selection manifest/VFS import and
required runtime traces remain open. The verified satirical FightFX atlas now
has a bounded runtime route: content-pack punch/kick/guard contacts emit
`F7300`/`F7301`/`F7306`, resolve eight atlas rows at groups `7300-7307`, and
fall back to the existing geometry path when the asset request fails.

## Acceptance

Register six characters and three stages through the existing VFS and
`select.def` manifest path, preserve demo fallback, expose selector entries,
load sprites/CMD/CNS/AIR/SND/FightFX, and trace one playable route per
character plus stage parallax. Run focused tests, `pnpm test`, typecheck,
build, boundaries, `pnpm qa:trace`, and browser smoke for the changed selector.

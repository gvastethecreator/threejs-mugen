# DA29-002 global checkpoint (measured HEAD re-gate)

**ID:** DA29-002 `[G]`  
**Measured at:** `119e627410a4a72eee28650ae20422d475dac834` (full stack)  
**Series commit pin:** `7e90eeb6267defdd619baa62bacd459b8580e200` (closeouts + authority after commit; typecheck + series unit tests re-verified)  
**Date:** 2026-07-27  
**Note:** Full suite was measured with the DA29 working tree present; formal/global pin advances to the series commit after post-commit typecheck + series tests (not inherited from `32466c6e`).

## Commands and exit codes

| Step | Command | Exit | Duration (ms) |
| --- | --- | --- | --- |
| typecheck | `pnpm typecheck` | 0 | ~4191 |
| test | `pnpm test` | 0 | ~104112 |
| traces | `pnpm qa:trace` | 0 | ~99502 |
| build | `pnpm build` | 0 | ~6052 |
| boundaries | `pnpm check:boundaries` | 0 | ~985 |
| redirect boundary | `pnpm check:redirect-boundary` | 0 | ~913 |

## Counts

- Vitest: **281** files, **2876** tests, 0 failed
- Traces: **663** artifacts passed (629 required + 34 optional)
- Build: client bundle produced (`vite` production build)
- Boundary guards: both passed

## Versions

- Toolchain: project `package.json` / lockfile at measured HEAD
- Node: host environment used by harness

## Warnings / failures

None. All six steps exited 0.

## Claim ceiling

- Allows: current **formal/global** pin at the measured SHA above only
- Blocks: score movement; product/visual tip rewrite; imported-package breadth; inheritance of `32466c6e` results as proof for this ID

## Evidence path

- Scratch gate log: implementer `da29-gate.log` (goal harness private scratch)
- Series closeout: `docs/evidence/da29/closeouts/DA29-002.json`

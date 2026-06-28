# Progress Tracker

Last updated: 2026-06-28

This document is the compact truth board for progress. It does not replace detailed docs; it points to the evidence that keeps claims honest.

## Current Score

| Horizon | Score | Meaning |
| --- | ---: | --- |
| Playable private sandbox | 65 / 100 | Local match is playable with generated/native fighters, imported KFM route, stages, debug panels, and Studio workflow. |
| Practical MUGEN compatibility by layers | 35 / 100 | DEF/AIR/CMD/CNS/SFF/SND pieces exist, many controllers/triggers have bounded gates, but broad character compatibility remains partial. |
| Full MUGEN/Ikemen-GO port | 10-12 / 100 | Foundation exists. Full VM parity, helpers, redirects, teams, lifebars/screenpacks, Lua/ZSS, exact tick order, rollback/netplay, and broad fixture matrix remain future work. |

## Evidence Snapshot

| Area | Current Proof | Still Weak |
| --- | --- | --- |
| Runtime | `pnpm qa:trace` required artifacts, native/generated roster, imported KFM optional fixtures. | Exact tick order, helpers as real VM actors, custom states/throws, teams, full guard/fall/recovery semantics. |
| Three.js rendering | `pnpm qa:smoke` screenshots and canvas checks. | Pixel-perfect MUGEN render parity, palette application, screenpack/lifebar parity. |
| Parsers/loaders | DEF/AIR/CMD/CNS/SFF/SND parsers with reports. | SFF v2 edge formats, full CNS expression language, all controller params, broader corpus. |
| Studio | Workbench, Assets, Evidence, Debug, Modules, Build surfaces. | True editing workflows, regenerate/relink automation, multi-artifact trace diff depth. |
| IKEMEN | Scanner-only profile for ZSS/Lua/config/screenpack/model-stage signals. | No ZSS/Lua execution, no rollback/netplay, no IKEMEN runtime extensions. |
| Modular engine | Shared contracts and boundary tests. | Platformer proof slice blocked until fighting contracts stay stable. |

## Next Required Cuts

1. **MatchWorld ownership**
   - Move more lifecycle/combat/pause/target behavior behind named systems.
   - Keep trace checksum drift intentional and documented.

2. **KFM/Common1 precision**
   - Tighten guard/fall/recovery timing and velocity semantics.
   - Optional official fixture gates cannot become public compatibility claims unless fixture is present and passing.

3. **Compatibility trace coverage**
   - Add missing required traces for controller families currently covered only by unit/runtime tests.
   - Current proof added: dedicated `synthetic-imported-hitoverride.json` trace artifact for bounded direct-hit redirect evidence.

4. **Studio trust workflow**
   - Improve Evidence/Build as the authority for current state, stale inputs, blocked exports, and next actions.

5. **Roadmap hygiene**
   - Keep `docs/BUILD_EXECUTION_BACKLOG.md` append-only enough to preserve history.
   - Keep `docs/WORKPLAN.md` as execution authority.
   - Keep this tracker short and updated after meaningful milestones.

## Closeout Contract

Every compatibility milestone should leave:

- focused code/test changes
- docs update with claim allowed / claim blocked
- `pnpm test`
- `pnpm typecheck`
- `pnpm build`
- `pnpm qa:trace` for runtime/compat changes
- `pnpm qa:smoke` plus visual inspection for frontend/render changes

## Not Done

- Full MUGEN VM
- Full Ikemen-GO runtime
- ZSS/Lua execution
- Full helper VM
- Full screenpack/lifebar engine
- Full teams/simul/tag/turns
- Rollback/netplay
- Exact palette/render parity
- Broad public fixture corpus

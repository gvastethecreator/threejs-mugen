# Two-checkpoint automatic guard order report

Date: 2026-07-10
Area: R1 runtime compatibility / match scheduling and guard entry

## Delivered

- Replaced the position-biased single automatic guard check with explicit pre-controller and post-controller checkpoints.
- Gives both players a pre-controller guard opportunity before either current-state pass.
- Gives each advanced player a post-controller guard opportunity after its own pass.
- Preserves the established P1-started Pause cutoff and the existing Pause/SuperPause and hitpause branch contracts.
- Added owner-backed schedule phases and exact unit/runtime order assertions.
- Strengthened the required automatic guard-start artifact oracle to prove both checkpoints around controller execution and before combat.

## Claim allowed

The active match branch now proves an unbiased two-checkpoint automatic guard schedule for the two root players: both pre checks precede authored controllers, and each completed player advance is followed by its own post check before contact resolution.

## Claim blocked

This does not prove exact IKEMEN all-character action batching, neutral same-tick Pause ordering, teams or more than two root players, helper scheduling, pause-time guard-state changes, rollback/netplay behavior, or full guard parity.

## Evidence

- `src/tests/RuntimeMatchFighterAdvanceSystem.test.ts`: normal and P1-started Pause cutoff order.
- `src/tests/PlayableMatchRuntime.test.ts`: complete active tick schedule and actor ownership.
- `src/tests/RuntimeTraceGatePresets.test.ts`: required automatic guard-start checkpoint oracle.
- `.scratch/qa/trace-gates/synthetic-imported-auto-guard-start.json`.
- Focused gate: 3/3 automatic guard schedule oracles passed.
- Trace gate: 529/529 passed (498 required, 31 optional).
- Full tests: 157 files / 1550 tests passed.
- TypeScript 7 typecheck, production build, and modular boundary check passed.

## Global status impact

- Runtime compatibility: removes root-player pre-check bias and exposes both guard checkpoints.
- Playable sandbox: automatic guard entry has a more engine-like active-tick schedule.
- Studio editor: unchanged.
- IKEMEN execution: two guard checkpoints represented; all-character preparation/execution batching remains open.
- Renderer/presentation: unchanged.
- Modular engine: schedule ownership remains explicit in `RuntimeMatchFighterAdvanceWorld` and `RuntimeAutoGuardStartWorld`; no score movement claimed.

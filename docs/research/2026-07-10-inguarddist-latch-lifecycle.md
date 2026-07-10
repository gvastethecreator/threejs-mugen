# InGuardDist latch lifecycle

Date: 2026-07-10
IKEMEN GO source revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`

## Question

How should the sandbox replace live `InGuardDist` queries with a source-backed latch that covers physical attacks, projectiles, Pause/SuperPause, and hitpause without prematurely implementing IKEMEN's two guard-start checkpoints?

## Primary sources

- Elecbyte `InGuardDist` trigger reference: <https://www.elecbyte.com/mugendocs-11b1/trigger.html>
- Elecbyte HitDef and `guard.dist` reference: <https://www.elecbyte.com/mugendocs/sctrls.html>
- IKEMEN GO action preparation, action execution, and latch reset: <https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L11544-L12013>
- IKEMEN GO player and projectile guard-distance writes during hit detection: <https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13145-L13525>

## Findings

- Elecbyte defines `InGuardDist` as false when no opponent attack is in guarding distance, but does not publish a complete subsystem schedule.
- IKEMEN GO clears `inguarddist` during `actionFinish`, then player and projectile hit-detection passes set it for eligible attacks. Character action logic consumes that stored flag on the following action pass.
- The previous sandbox queried the opponent's current move directly during each controller/auto-guard evaluation. It had no projectile path and no explicit lifecycle across active, pause, or hitpause branches.
- The current effect store contains both player-owned and helper-parented projectiles under the root owner, so one opponent-scoped refresh can include both without hardcoding one fixture.

## Decision

- Store optional `runtime.inGuardDist` with attacker id, source (`direct`, `projectile`, or `direct+projectile`), and observed tick.
- Refresh active ticks after active effects/bindings and before direct/projectile/helper contact resolution.
- Refresh Pause/SuperPause and hitpause ticks at branch end so stale eligibility is cleared or renewed even when active fighter simulation does not run.
- Make automatic guard-start and the authored `InGuardDist` trigger read only the stored latch.
- Include the latch in runtime snapshots, traces, actor-frame evidence, deltas, and behavior checksums.
- Add negative trace requirements so no-contact latch fixtures fail if `hit` or `guard` appears.

## Observable migration

- Direct guard-start now has one-tick eligibility latency.
- The synthetic auto-guard fixture uses `guard.dist = 112` instead of 96 so held-back movement remains inside a deliberate no-contact window after the latch refresh.
- Official KFM air guard reaches state 154 while retaining air guard-start animation 122 until its authored `ChangeAnim`/`ChangeState` transition. The official fixture now gates that behavior and direct latch provenance.
- Attack-route checksums change because the latch is behavior state, not excluded diagnostics.

## Blocked claims

Exact MUGEN/IKEMEN two-checkpoint guard-start ordering, pause-time state-120 entry, multi-opponent/team latch sets, projectile localcoord guard-distance scaling, rollback serialization, and full guard parity remain blocked.

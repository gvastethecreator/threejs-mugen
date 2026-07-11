# Choose next gap after live team state

Type: research
Status: resolved
Blocked by: None

## Question

What minimal inert P3/P4 root construction can enter `PlayableMatchRuntime` ownership and snapshots without joining input, scheduling, combat, round, effect-store, or presentation phases?

## Candidate Inputs

- `PlayableMatchRuntime` constructor/options, `RuntimeFighterStateWorld`, `RuntimeSnapshotWorld`, and public registry snapshot.
- Current `teamState` and `RuntimeTeamRoster/v0` contracts.
- IKEMEN root slot creation, initial standby state, and turns/simul limits.
- Stable P1/P2 trace checksums and lifecycle evidence.

## Answer

Under explicit `ikemen-go`, accept up to six reserve definitions and construct P3-P8 roots with interleaved side ids, side-local start positions, and `standby = true`. `PlayableMatchRuntime` owns and resets them in place. `RuntimeSnapshotWorld` publishes them under `reserveActors`; `MatchWorld` includes them in registry/lifecycle/topology. They remain absent from `actors`, presentation camera/shadows, tick schedule, input, compatibility-session execution, combat, round logic, helpers/effect stores, and behavior trace projection. Non-IKEMEN profiles ignore reserve definitions.

Evidence: focused runtime/MatchWorld/reset/snapshot tests, TypeScript 7 typecheck, and full gates recorded in the 2026-07-11 inert-root report.

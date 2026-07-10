# Choose next gap after same-tick Pause symmetry

Type: research
Status: resolved
Blocked by: None

## Question

What is the next smallest source-backed actor-scheduling package after root-player same-tick Pause symmetry: explicit prepare/run phase ownership, dynamic RunOrder parity, helper participation, or simultaneous Pause/SuperPause overwrite semantics?

## Candidate Inputs

- IKEMEN GO `CharList.updateRunOrder`, all-character `actionPrepare`, sequential `actionRun`, and appended-helper processing.
- Current two-root-player `MatchTickSchedule/v0` phase stamps and checksum exclusion.
- Existing Pause/SuperPause, helper, guard, and controller-order required traces.
- Runtime scope rule favoring one proof-producing compatibility cut over broad scheduler rewrite.

## Answer

Implement a profile-gated root-player RunOrder seam. IKEMEN GO sorts before command update and before all prepare/run passes using attacking (`A`) > idle (`I`) > remaining root players, then lower id. `RuntimeFighterRunOrderWorld` now implements that bounded two-root policy only when match-level `runtimeProfile` is `ikemen-go`; `mugen-1.1` and `unknown` preserve existing input order because no equivalent MUGEN source was established.

Focused policy, pair-scheduler, `PlayableMatchRuntime`, and public `MatchWorld` coverage proves previous-tick MoveType ordering and profile forwarding. Full gates pass 158 files / 1556 tests, TypeScript 7 build/typecheck, 529/529 traces, and boundary checks.

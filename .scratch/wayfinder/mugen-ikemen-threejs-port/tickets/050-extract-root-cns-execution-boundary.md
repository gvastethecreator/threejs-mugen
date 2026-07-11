# Extract root CNS execution boundary

Type: implementation
Status: resolved
Blocked by: None

## Question

How can `advanceFighter` expose a named CNS phase that preserves P1/P2 behavior exactly while allowing a later explicit-profile standby-root caller to execute CNS without inheriting input, combat, round, presentation, or effect-store ownership?

## Acceptance

- Existing P1/P2 phase order and 538 trace checksums stay stable.
- Controller execution has an explicit capability/participation input.
- Standby-root scheduling remains off until the extracted boundary is independently proven.

## Answer

`RuntimeRootCnsExecutionWorld` now owns playable versus standby controller capabilities. `RuntimeActiveControllerDispatchWorld` blocks disallowed state, individual runtime-controller type, side-effect route, or unsupported dispatch before any hook executes and reports the blocked route. Existing P1/P2 execution explicitly uses the full playable profile. The standby profile allows state transitions plus a narrow control/state-type/turn/variable/no-op set; life/power/position/combat/presentation-affecting runtime controllers and every side effect are blocked. It is not scheduled yet.

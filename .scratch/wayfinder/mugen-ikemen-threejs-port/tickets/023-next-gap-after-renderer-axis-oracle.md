# Choose next gap after renderer axis oracle

Type: research
Status: resolved
Blocked by: None

## Question

Which package should follow the renderer L2 player-axis oracle while maximizing progress toward full visual and gameplay parity?

## Candidate inputs

- AIR H/V flip and rotation-pivot parity through L2/L3.
- Character/effect `SprPriority` draw-order oracle and occlusion proof.
- L4 deterministic visual baselines for a fixture route.
- First source-bound Studio collision/state editor.
- IKEMEN screenpack/system ingestion or post-KO runtime timeline.

## Resolution

Selected player `SprPriority` draw-order parity. Corrected controller clamp from `-5..10` to official `-5..5`, preserved generic effect actor depth range, exposed effective priority/bias diagnostics, and added desktop/mobile z-order oracles plus focused static/dynamic tests.

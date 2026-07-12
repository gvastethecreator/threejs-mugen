# Model Tag Side Command Routing

Type: task
Status: open
Blocked by: None

## Question

Can explicit IKEMEN Tag mode route each side input stream into independent command state for every present same-side root, including standby roots, without granting P3-P8 direct input control or any effect/combat/round/presentation/resource ownership?

## Acceptance

- Add a versioned diagnostic separating side command mapping, direct control, AI, standby, and effective control.
- In normal active ticks, map P1 input to odd roots and P2 input to even roots only for explicit `ikemen-go` Tag mode; preserve legacy, unknown, and Single behavior.
- Clone input state and update each mapped root command buffer exactly once before actor execution; no cross-side aliasing.
- Keep direct `handlePlayerInput`/AI, full playable fighter phases, effects, combat, round, presentation, HUD/audio, and resources P1/P2-only.
- Extend trace evidence to observe reserve-root actor frames without changing traces that contain no reserves.
- Add a required imported trace proving a standby P3 can consume the mapped P1 command through allowed CNS while P2 input cannot trigger it.
- Cover reset, invalid/missing mappings, pause/hitpause non-claims, and unchanged `RuntimeRootParticipation/v0` executable-owner axes.
- Run focused tests, full tests, TypeScript 7 typecheck/build, `pnpm qa:trace`, boundaries, and diff check. Browser smoke is N/A until visible presentation changes.

## Answer

Pending implementation.

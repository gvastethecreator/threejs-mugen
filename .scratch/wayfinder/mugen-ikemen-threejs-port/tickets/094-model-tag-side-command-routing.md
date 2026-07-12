# Model Tag Side Command Routing

Type: task
Status: resolved
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

Explicit `ikemen-go` Tag mode now publishes `RuntimeRootInputRouting/v0` and clones P1 into odd-root command routes plus P2 into even-root routes during normal active ticks. Each mapped command buffer updates once before controller execution, while direct input/AI, full fighter phases, effects, combat, round, presentation, and resources remain P1/P2-only.

Required `synthetic-imported-ikemen-tag-side-command.json` pins checksum `dff92731` and frames `019f58ec`, `a855626a`, `db154ac1`; P2 cannot trigger P3, then P1 drives standby P3 from state `0` to `1284`. Pause/hitpause non-routing, reset, invalid roots, Single/legacy behavior, independent buffers, unchanged root participation, and reserve-blind legacy checksums are covered. Full evidence: `docs/reports/2026-07-11-ikemen-tag-side-command-routing.md`.

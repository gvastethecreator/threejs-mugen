# Map Active-root Gameplay Ownership

Type: research
Status: resolved
Blocked by: None

## Question

Which exact IKEMEN and local owners must change to promote structurally active P3-P8 roots from standby CNS scheduling into one bounded playable Tag handoff without silently widening combat, round, presentation, effects, or resources?

## Acceptance

- Pin relevant Ikemen-GO source/docs for active player/input selection and Tag participation at SHA `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.
- Inventory every local P1/P2-only consumer across input, opponent selection, direct/projectile combat, target/effect ownership, round/KO/timer, camera/presentation/HUD, audio, resources, snapshots, reset, and trace/smoke evidence.
- Separate structural activation, input ownership, combat ownership, round ownership, presentation ownership, and resource ownership; do not collapse them into one active flag.
- Select the smallest coherent executable slice and name required unit, trace, browser, and rollback/reset proof before implementation.
- Keep Helper-originated RedirectID/aggregate axes, incoming Helper breadth, exact incremental failure, Studio authoring, ZSS/Lua, rollback/netplay, and score movement unchanged.

## Answer

Pinned-source and local ownership research is complete. IKEMEN Tag maps the side controller to every same-side root command list; command update runs for every loaded character, effective control masks standby, and the default Tag program lets the team leader consume the switch command. The browser instead stamps and directly controls only P1/P2, classifies gameplay participation by primary/reserve storage, aliases every non-P2 effect owner into P1, and keeps combat, round, presentation, HUD/audio, resources, and behavior traces pair-only.

One broad active-root switch would therefore cross multiple unproven contracts. Wayfinder 094 first implements versioned side command routing plus reserve-root trace observability while direct input, full fighter advancement, effects, combat, round, presentation, and resources remain unchanged. Full findings and source links: `docs/research/2026-07-11-ikemen-active-root-gameplay-ownership.md`.

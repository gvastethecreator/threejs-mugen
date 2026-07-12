# IKEMEN Active-root Gameplay Ownership Report

Date: 2026-07-11
Scope: Wayfinder 093
Compatibility profile: explicit `ikemen-go`

## Result

- Pinned IKEMEN Tag source maps one physical side input to every same-side logical root while retaining an independent command list per character.
- Local structural roots, live standby, active ids, input ownership, combat ownership, presentation ownership, and resources are separate contracts.
- Full P3-P8 gameplay is blocked by storage-class scheduling, pair-only input/combat/round/presentation consumers, and effect ownership that aliases every non-P2 actor into P1.
- Wayfinder 094 is implementation-ready as the smallest bounded slice: side command routing plus reserve-root trace observability, with direct gameplay and all later phase owners unchanged.

## Source Basis

- Human Tag side remapping: [Ikemen-GO `start.lua` lines 250-307](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/external/script/start.lua#L250-L307).
- Per-character command update and pause/hitpause branches: [Ikemen-GO `char.go` lines 13014-13175](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13014-L13175).
- Effective control masked by standby: [Ikemen-GO `char.go` lines 5255-5337](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L5255-L5337).
- Default team-leader Tag command use and partner transitions: [Ikemen-GO `tag.zss` lines 239-327](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/data/tag.zss#L239-L327).
- Full source and local ownership inventory: [`docs/research/2026-07-11-ikemen-active-root-gameplay-ownership.md`](../research/2026-07-11-ikemen-active-root-gameplay-ownership.md).

## Verification

- Official sources were read at pinned revision `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.
- Local consumers were audited from root construction through scheduler, input, effects, combat, round, presentation, resources, reset, and trace evidence.
- Runtime tests, TypeScript, build, traces, and browser smoke: N/A because this checkpoint changes no executable or visible behavior.
- `git diff --check`: passed with line-ending normalization warnings only.

## Adversarial Audit

- Rejected one universal `active` boolean: it would silently grant unrelated phase ownership.
- Rejected moving one command buffer between roots: upstream intentionally updates independent same-side character command lists.
- Rejected calling full `advanceFighter` for P3: current effect stores can alias P3 side effects into P1 before combat and presentation are ready.
- Rejected a playable or visible Tag claim: behavior traces and renderer actors still expose the P1/P2 pair.
- Independent second-agent review: omitted because no independent authorized reviewer was available; compensated with pinned-source reconciliation and explicit claim ceiling.

## Quality Record

Task state: completed research ticket

Artifact verdict: win against Wayfinder 093 acceptance

Verification status: source-backed and locally audited; executable gates intentionally N/A

Deferred debt: phase-capability scheduling, next-tick direct control, root-key effects, multi-root combat, team round policy, presentation/browser proof, resources, lifebars, ZSS/Lua, rollback, and netplay

Claim allowed: the upstream Tag input policy and local active-root ownership blockers are mapped, and Wayfinder 094 is implementation-ready.

Claim blocked: P3-P8 direct gameplay, visible Tag handoff, root-key effects, multi-root combat/round/HUD/resources, default `tag.zss`, score movement, or full IKEMEN parity.

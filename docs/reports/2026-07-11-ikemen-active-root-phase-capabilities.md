# IKEMEN Active-root Phase Capabilities Report

Date: 2026-07-11
Scope: Wayfinder 095
Compatibility profile: explicit `ikemen-go`

## Delivered

- Added `RuntimeRootPhaseCapabilities/v0` to the public `MatchWorld` actor registry for explicit IKEMEN matches.
- The matrix separates command state, controller CNS profile, direct input, AI, kinematics, animation, effects, combat, round, presentation, and resources per root.
- P1/P2 project their existing playable owners. P3-P8 project only Tag command state when mapped plus `bounded-reserve` controller CNS; every later phase remains disabled.
- `available`, `standby`, `structurallyActive`, `scheduled`, and `effectiveCtrl` remain separate facts. A non-standby P3 therefore does not silently become playable.
- Tag/Single command differences and live P2 AI/direct-control ownership come from `RuntimeRootInputRouting/v0`; existing phase owners come from `RuntimeRootParticipation/v0` and effect/resource owners.
- Legacy/unknown registries publish no new schema. Invalid-side, disabled, and non-player roots fail closed.

## Source Basis

- Human Tag side remapping: [Ikemen-GO `start.lua` lines 250-307](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/external/script/start.lua#L250-L307).
- Effective control masked by standby: [Ikemen-GO `char.go` lines 5255-5337](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L5255-L5337).
- Source-backed local owner inventory: [`docs/research/2026-07-11-ikemen-active-root-gameplay-ownership.md`](../research/2026-07-11-ikemen-active-root-gameplay-ownership.md).

## Evidence

- Focused owner/integration suite: 5 files / 23 tests.
- Full suite: 172 files / 1769 tests.
- TypeScript 7: `pnpm typecheck` passed.
- Production build: passed; known Vite warning remains at 1,600.03 kB for the main JS chunk.
- Trace compatibility: unchanged at 540/540, including 509 required and 31 optional artifacts.
- Architecture: `pnpm check:boundaries` passed.
- Diff: `git diff --check` passed after documentation closeout.
- Browser smoke: N/A; no renderer, Studio, CSS, sprites, camera, or visible presentation consumer changed.

## Adversarial Audit

- Cross-diagnostic id, team-state, structural-activity, and side drift reject the entire matrix before partial publication.
- A pre-existing test mutated cloned reserve standby without regenerating input routing; the new invariant exposed and repaired that impossible fixture.
- A first integration expectation assumed P1 effective control stayed true after an authored attack entered a `ctrl = 0` state; the test now observes the neutral snapshot and separately verifies standby suppression.
- Registry snapshots remain detached: mutating returned phase data cannot alter the next read.
- The schema is diagnostic only and is not consumed by scheduler/runtime paths in this cut, preventing accidental behavior change.
- Independent second-agent review was omitted because no authorized independent reviewer was available; internal adversary, invariant, regression, and simplifier passes plus all gates provide current proof.

## Quality Record

Task state: completed

Artifact verdict: win against Wayfinder 095 acceptance

Verification state: verified

Deferred: source/order map for playable phase promotion, scheduler consumption, direct active-root control, kinematics, animation, root-key effects, combat, round, presentation, lifebars, resources, ZSS/Lua, rollback, and netplay

Claim allowed: explicit IKEMEN `MatchWorld` registries publish an internally reconciled per-root phase-capability matrix describing current command/CNS and P1/P2 gameplay ownership.

Claim blocked: the matrix itself does not schedule or execute any new P3-P8 phase, change visible Tag behavior, move scores, or prove full MUGEN/IKEMEN parity.

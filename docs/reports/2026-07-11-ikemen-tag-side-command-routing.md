# IKEMEN Tag Side Command Routing Report

Date: 2026-07-11
Scope: Wayfinder 094
Compatibility profile: explicit `ikemen-go`
Team mode: explicit `tag`

## Delivered

- Added `RuntimeRootInputRouting/v0`, separating command source/mapping, direct control, AI control, standby, and effective control for every present root.
- Normal active ticks clone P1 commands into independent odd-root buffers and P2 commands into independent even-root buffers. Every mapped buffer updates once before actor CNS execution.
- Standby P3-P8 can consume their side command through the already-admitted controller-only CNS path, while direct input, full fighter phases, effects, combat, round, presentation, HUD/audio, and resources remain P1/P2-owned.
- Legacy, unknown, and IKEMEN Single modes remain pair-only. Invalid, disabled, and non-player roots fail closed.
- Trace frames and artifacts can now observe reserve roots and reserve compatibility telemetry without adding reserve projections to historical behavior checksums.

## Source Basis

- Human Tag side remapping: [Ikemen-GO `start.lua` lines 250-307](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/external/script/start.lua#L250-L307).
- Per-character command updates and pause/hitpause branches: [Ikemen-GO `char.go` lines 13014-13175](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13014-L13175).
- Effective control masked by standby: [Ikemen-GO `char.go` lines 5255-5337](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L5255-L5337).
- Full ownership inventory: [`docs/research/2026-07-11-ikemen-active-root-gameplay-ownership.md`](../research/2026-07-11-ikemen-active-root-gameplay-ownership.md).

## Evidence

- Focused runtime/trace suite: 7 files / 763 tests.
- Full suite: 171 files / 1762 tests.
- TypeScript 7: `pnpm typecheck` passed.
- Production build: passed; known Vite warning remains at 1,597.61 kB for the main JS chunk.
- Trace compatibility: 540/540 passed, including 509 required and 31 optional artifacts.
- Required `synthetic-imported-ikemen-tag-side-command.json`: checksum `dff92731`; frame checksums `019f58ec`, `a855626a`, `db154ac1`.
- Architecture: `pnpm check:boundaries` passed.
- Diff: `git diff --check` passed after documentation closeout.
- Browser smoke: N/A; renderer, Studio, CSS, sprites, camera, and visible presentation are unchanged.

## Adversarial Audit

- Pause and global hitpause retain their existing pair-only command behavior; tests prove reserve command history does not advance in those branches and resumes on the next normal active tick.
- Duplicate route ids and one actor aliased under different ids fail before command-buffer or input mutation.
- The first pause/hitpause fixture listened for `y` in CNS without declaring it in CMD. The fixture was repaired before accepting evidence.
- Reserve frames are intentionally checksum-excluded, so the required gate pins literal P3/P4 frames, P3 controller telemetry, opposite-side isolation, and final reserve states instead of treating the legacy checksum as proof.
- Independent second-agent review was omitted because no authorized independent reviewer was available; internal adversary, trace-contract, regression, and simplifier passes plus all gates provide current proof.

## Quality Record

Task state: completed

Artifact verdict: win against Wayfinder 094 acceptance

Verification state: verified

Deferred: per-phase active-root capability ownership, direct input/AI, kinematics, animation, root-key effects, combat, round, presentation, lifebars, resources, ZSS/Lua, rollback, and netplay

Claim allowed: explicit IKEMEN Tag normal active ticks route independent same-side command state to present P1-P8 roots, and required trace evidence proves P2 isolation plus one P1-to-P3 standby CNS transition.

Claim blocked: playable or visible P3-P8, reserve Pause/hitpause command parity, direct reserve control/AI, full fighter advancement, root-key effects, multi-root combat/round/HUD/resources, score movement, or full MUGEN/IKEMEN parity.

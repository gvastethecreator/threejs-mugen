# Automatic guard-start phase order

Date: 2026-07-10
IKEMEN GO source revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`

## Question

What is the smallest source-backed package that can prove where the sandbox checks automatic guard start relative to active controllers, Pause/SuperPause, hitpause, and contact resolution?

## Primary sources

- Elecbyte CNS documentation: <https://elecbyte.com/mugendocs/cns.html>
- Elecbyte state-controller reference: <https://www.elecbyte.com/mugendocs/sctrls.html>
- Elecbyte trigger reference for `InGuardDist`: <https://www.elecbyte.com/mugendocs-11b1/trigger.html>
- IKEMEN GO `Char.actionPrepare`, `Char.actionRun`, and `Char.actionFinish`: <https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L11544-L12013>
- IKEMEN GO character action and hit-detection loops: <https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13145-L13270>

## Findings

- Elecbyte defines state 120, `guard.dist`, `InGuardDist`, controller source order, and `ignorehitpause`, but does not publish one complete global subsystem schedule.
- IKEMEN GO updates commands for all characters, runs `actionPrepare` for all, then `actionRun` for each character, then `actionFinish` for all.
- IKEMEN GO has two hardcoded state-120 checkpoints: a basic-action check in `actionPrepare` before current-state controllers, and another check in `actionRun` after current-state controllers.
- IKEMEN GO clears `inguarddist` in `actionFinish`; later hit detection repopulates it, so the flag consumed by the next action pass is latched from collision/guard-distance work.
- IKEMEN GO comments that MUGEN can change to guard states during pauses while IKEMEN can still block without changing state in that location. This is implementation evidence, not a complete normative MUGEN schedule.

## Current sandbox order

The active branch performs one automatic guard check per defender:

```txt
P1 kinematics -> animation -> controllers
  -> P2 auto-guard check
P2 kinematics -> animation -> controllers
  -> P1 auto-guard check
post-fighter contact resolution
```

If P1 starts Pause/SuperPause during its controller pass, the P2 auto-guard check still runs before P2 advance is skipped. Established pause and hitpause branches do not run this active-branch check.

## Decision

- Add owner-backed `fighter:auto-guard-check` stamps to `MatchTickSchedule/v0`.
- Require the phase in active trace diagnostics and preserve it outside behavior checksums.
- Prove exact current placement through the required synthetic auto-guard-start artifact and owner-level pause-cutoff tests.
- Do not reorder guard behavior in this slice. A later behavior package must model the two IKEMEN checkpoints and latched `InGuardDist` semantics explicitly.

## Blocked claims

Exact MUGEN/IKEMEN guard schedule parity, two-checkpoint execution, latched previous-hit-detection `InGuardDist`, pause-time state-120 entry, projectile guard-distance timing, and rollback/netplay ordering remain blocked.

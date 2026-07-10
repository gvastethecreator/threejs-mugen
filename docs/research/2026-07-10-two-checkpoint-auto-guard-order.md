# Two-checkpoint automatic guard order

Date: 2026-07-10
IKEMEN GO source revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`

## Question

What is the smallest source-backed schedule that represents IKEMEN's pre-controller and post-controller automatic guard-start checks without retaining the sandbox's previous P1/P2 guard-check bias?

## Primary sources

- Elecbyte CNS state and trigger execution reference: <https://www.elecbyte.com/mugendocs/cns.html>
- Elecbyte state-controller reference: <https://www.elecbyte.com/mugendocs/sctrls.html>
- IKEMEN GO `actionPrepare` and `actionRun` guard checks: <https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L11544-L11805>

## Findings

- IKEMEN performs a basic guard-start eligibility check during `actionPrepare`, before the current-state controller pass.
- IKEMEN performs another guard-start eligibility check in `actionRun`, after the current-state controller pass.
- Character preparation is separated from character action execution, so all active characters can observe a pre-controller guard checkpoint before sequential current-state execution begins.
- The sandbox previously checked P2 after P1 controllers and P1 after P2 controllers. That made the meaning of automatic guard eligibility depend on player position in the pair.
- The established sandbox contract stops P2 advancement when P1 starts match Pause. Removing that broader player-order behavior belongs to a separate scheduling package.

## Decision

- Run `fighter:auto-guard-check:pre` for P1 and P2 before either fighter advances.
- Advance P1, then run P1's `fighter:auto-guard-check:post`.
- Preserve the existing same-tick Pause cutoff: when P1 starts Pause, do not advance P2 or run P2's post checkpoint.
- Otherwise advance P2, then run P2's post checkpoint.
- Keep established Pause/SuperPause and hitpause branches free of automatic guard-state entry.
- Expose both checkpoints through `MatchTickSchedule/v0` and require their order in the automatic guard-start trace oracle.

## Observable migration

- Automatic guard-start can now occur at the pre-controller checkpoint from a previously refreshed `InGuardDist` latch.
- Both players receive the same pre-controller opportunity before authored controller execution.
- Trace schedules now distinguish `fighter:auto-guard-check:pre` from `fighter:auto-guard-check:post`.
- Existing behavior checksums remain focused on runtime behavior because schedule metadata is diagnostic and excluded from checksums.

## Blocked claims

Exact IKEMEN all-character `actionPrepare`/`actionRun` batching, same-tick Pause ownership across every player, team and multi-player ordering, helper action scheduling, pause-time guard-state entry, and full MUGEN/IKEMEN guard parity remain blocked.

# Root State -4/+1 Scheduling Closeout

Date: 2026-07-18

Feature commit: `9dac35d2`

Decision: [`docs/adr/0013-root-state-minus-four-plus-one-scheduling.md`](../adr/0013-root-state-minus-four-plus-one-scheduling.md)

Research: [`docs/research/2026-07-18-root-state-minus-four-plus-one-scheduling.md`](../research/2026-07-18-root-state-minus-four-plus-one-scheduling.md)

## Result

The IKEMEN root scheduler now executes `-4 -> -3 -> -2 -> normal -> +1`.
Literal `+1` remains distinct from normal State 1. State -4 and +1 bypass the
hitpause filter, and frozen roots receive both special-only passes during
regular IKEMEN Pause. MUGEN, `unknown`, and helper routes remain unchanged.

## Evidence

- Focal suite: `264/264` tests passed across four runtime files.
- Active scan proof selects `plus-one` separately from numeric State 1.
- PlayableMatchRuntime proof covers order and profile gating.
- PlayableMatchRuntime proof covers regular Pause freeze and global hitpause.
- Paused actor proof confirms the pause-immune hook does not advance normal
  state or consume move time.
- TypeScript 7/build: passed.
- `pnpm check:boundaries`: passed.
- `pnpm check:redirect-boundary`: passed.
- `git diff --check`: passed.

## Scope ceiling

This closeout does not claim State -1 command priority, exact Common1 or
multi-file append precedence, helper input buffers, rollback/netplay, or full
MUGEN/IKEMEN parity.

## Next frontier

The next highest-leverage frontier is exact source/priority behavior for
Common1, multi-file negative states, and State -1 command scheduling. It needs
official source precedence evidence before another scheduler expansion.

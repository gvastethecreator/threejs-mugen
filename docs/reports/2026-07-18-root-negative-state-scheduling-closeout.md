# Root States -3/-2 Scheduling Closeout

Date: 2026-07-18

Feature commit: `23bb0c23`

Decision: [`docs/adr/0012-root-negative-state-scheduling.md`](../adr/0012-root-negative-state-scheduling.md)

Research: [`docs/research/2026-07-18-root-negative-state-scheduling.md`](../research/2026-07-18-root-negative-state-scheduling.md)

## Result

The runtime now executes root-owned State -3 and State -2 before the current
state for explicit `mugen-1.1` and `ikemen-go` profiles. State -3 is skipped
while a fighter uses borrowed custom-state data, while State -2 remains bound
to the root program. `unknown` profiles and helper execution are unchanged.

## Evidence

- Focal suite: `353/353` tests passed across seven files.
- Active-controller scan proof covers explicit state number and owner
  selection.
- PlayableMatchRuntime proof covers `-3 -> -2 -> normal` ordering and profile
  gating for MUGEN, IKEMEN, and `unknown`.
- Existing controller gating preserves `onlyIgnoreHitPause` behavior.
- TypeScript 7/build: passed.
- `pnpm check:boundaries`: passed.
- `pnpm check:redirect-boundary`: passed.
- `git diff --check`: passed.

## Scope ceiling

This closeout does not claim root -4/+1 scheduling, State -1 command priority,
Common1 or multi-file merge precedence, helper input buffers, rollback/netplay,
or full MUGEN/IKEMEN parity.

## Next frontier

The next source-backed scheduling decision is root State -4/+1 or the exact
Common1/multi-file negative-state source merge. Both require separate evidence
because they affect ordering and source ownership beyond this bounded pass.

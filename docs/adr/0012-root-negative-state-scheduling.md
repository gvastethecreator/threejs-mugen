# ADR 0012: Bounded root States -3/-2 scheduling

Status: Accepted (bounded root global-state route)

Date: 2026-07-18

Last reviewed: 2026-07-18 at HEAD `23bb0c23`

Decision owners: runtime compatibility and MUGEN/IKEMEN bounded-runtime lanes

Related decisions: [`docs/adr/0008-helper-state-minus-one-keyctrl.md`](0008-helper-state-minus-one-keyctrl.md), [`docs/adr/0009-helper-negative-states-keyctrl.md`](0009-helper-negative-states-keyctrl.md), [`docs/adr/0010-helper-state-minus-four.md`](0010-helper-state-minus-four.md), [`docs/adr/0011-helper-state-plus-one.md`](0011-helper-state-plus-one.md)

Research: [`docs/research/2026-07-18-root-negative-state-scheduling.md`](../research/2026-07-18-root-negative-state-scheduling.md)

Closeout: [`docs/reports/2026-07-18-root-negative-state-scheduling-closeout.md`](../reports/2026-07-18-root-negative-state-scheduling-closeout.md)

## Context

The official [IKEMEN-GO Miscellaneous info](https://github.com/ikemen-engine/Ikemen-GO/wiki/Miscellaneous-info) describes MUGEN global States -3 and -2 as recurring passes before the normal state. State -3 is not run while an actor uses another player's state data; State -2 remains available. IKEMEN extends the global order with -4 and +1, but those passes require separate decisions.

The runtime already compiles negative StateDefs and already models borrowed
custom-state ownership. Before this change, `PlayableMatchRuntime` dispatched
only the current state through the active-controller path, so root global
States -3/-2 could not run without risking execution against a borrowed state
program.

## Decision

1. For explicit `mugen-1.1` and `ikemen-go` profiles, dispatch root State -3,
   then root State -2, then the current state for each playable actor tick.
2. Resolve both global states from the actor's own runtime program, regardless
   of the current state's `stateOwner`.
3. Skip State -3 when the actor has borrowed another actor's state data; keep
   State -2 available from the root program.
4. Reuse the existing participation capabilities, controller dispatch, and
   `onlyIgnoreHitPause` filtering for the global passes.
5. Keep `unknown` profiles and helper execution unchanged. Keep command-gated
   State -1, root -4/+1, and `stateEntries` outside this slice.

## Alternatives rejected

### Dispatch the current state program for global states

Rejected because a custom-state owner can contain a different negative-state
program and would violate the root ownership contract.

### Run State -3 during borrowed state data

Rejected because the official rule suppresses that pass while another player's
state data is active.

### Build a second scheduler or VM

Rejected for this bounded route. The existing active-controller scan/run path
already accepts the program and ownership context needed for the ordered pass.

## Consequences

Positive:

- root global mutation now has an explicit profile and ownership boundary;
- global order is visible in the same runtime trace path as normal controllers;
- the existing Pause/hitpause gate remains the single filtering contract.

Negative:

- root -4/+1 and State -1 command priority are still separate scheduling
  decisions;
- IKEMEN multi-file append precedence, helper input buffers, rollback/netplay,
  and full MUGEN/IKEMEN parity remain outside the claim.

## Evidence

- Implementation: `23bb0c23`.
- Focal: `353/353` tests passed across seven parser, resolver, compiler, active
  controller, helper, and PlayableMatchRuntime files.
- `pnpm build`: passed with TypeScript 7 and Vite production output. The
  existing large JavaScript chunk warning remains.
- `pnpm check:boundaries`: passed.
- `pnpm check:redirect-boundary`: passed.
- `git diff --check`: passed; existing CRLF normalization warnings remain in
  unrelated dirty documentation files.

## Claim boundary

Allowed:

- root State -3 then -2 scheduling for explicit MUGEN/IKEMEN profiles;
- root ownership during borrowed custom states;
- State -3 suppression during borrowed state data;
- existing Pause/hitpause filtering for the bounded passes.

Still blocked:

- root -4/+1 ordering, State -1 command scheduling, and exact global priority;
- Common1 multi-file merge order and helper input-buffer parity;
- rollback/netplay and complete MUGEN/IKEMEN compatibility.

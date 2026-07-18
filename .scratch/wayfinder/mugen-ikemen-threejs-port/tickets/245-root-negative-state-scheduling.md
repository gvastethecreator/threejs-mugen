# Implement bounded root States -3/-2 scheduling

Type: implementation
Status: resolved
Blocked by: None

Research: `docs/research/2026-07-18-root-negative-state-scheduling.md`

## Question

How can the port execute root States -3 and -2 before the current state for
explicit MUGEN/IKEMEN profiles while preserving custom-state ownership, Pause
filtering, and the existing command-gated State -1 route?

## Acceptance

- Run root `-3` then `-2` before the normal state for `mugen-1.1` and
  `ikemen-go`.
- Resolve those global states from the root actor's own runtime program, not a
  borrowed custom-state owner.
- Skip root `-3` while the actor is using another actor's state data; keep
  root `-2` available.
- Preserve existing `onlyIgnoreHitPause` filtering so ordinary global
  controllers halt during Pause/hitpause unless authored to ignore it.
- Leave `unknown` profiles and helper execution unchanged.
- Add unit and PlayableMatchRuntime proof, ADR, closeout, and claim ceiling.

## Claim ceiling

This ticket does not claim State -1 command scheduling, root -4/+1 execution,
IKEMEN multi-file negative-state append order, helper input-buffer parity,
rollback/netplay, or full MUGEN/IKEMEN compatibility.

## Resolution

Implemented in `23bb0c23`.

- `mugen-1.1` and `ikemen-go` execute root-owned State -3, then State -2,
  before the current state.
- Root global lookup stays on the fighter's own runtime program even when the
  current state borrows another actor's state data.
- State -3 is skipped for borrowed state data; State -2 remains available.
- Existing `onlyIgnoreHitPause` filtering and participation capabilities are
  reused for the global passes.
- `unknown` profiles and helper execution remain unchanged.

Evidence: the focal suite passes `353/353` across seven runtime/parser/compiler
files; TypeScript 7/build, repository boundaries, redirected-dispatch boundary,
and diff hygiene all pass.

Decision record: [`docs/adr/0012-root-negative-state-scheduling.md`](../../../../docs/adr/0012-root-negative-state-scheduling.md)

Closeout: [`docs/reports/2026-07-18-root-negative-state-scheduling-closeout.md`](../../../../docs/reports/2026-07-18-root-negative-state-scheduling-closeout.md)

# Implement bounded root State -4/+1 scheduling

Type: implementation
Status: resolved
Blocked by: None

Research: `docs/research/2026-07-18-root-state-minus-four-plus-one-scheduling.md`

## Question

How can the root scheduler execute IKEMEN State -4 before the existing global
passes and State +1 after the normal state, including Pause/SuperPause, without
colliding with normal State 1 or changing MUGEN/unknown profiles?

## Acceptance

- Run root `-4 -> -3 -> -2 -> normal -> +1` for `ikemen-go`.
- Resolve root `+1` through the existing `plus-one` identity, never numeric
  normal State 1.
- Keep root `-4` and `+1` available during hitpause and Pause/SuperPause even
  when the actor's normal state is frozen; preserve ordinary `ignorehitpause`
  filtering for `-3`, `-2`, and normal controllers.
- Keep root `-4/+1` closed for `mugen-1.1` and `unknown`; keep helper routes
  unchanged.
- Add scan, PlayableMatchRuntime, and pause-path proof plus ADR and closeout.

## Claim ceiling

This ticket does not claim exact IKEMEN multi-file negative-state append order,
State -1 command priority, Common1 merge precedence, helper input-buffer
parity, rollback/netplay, or full MUGEN/IKEMEN compatibility.

## Resolution

Implemented in `9dac35d2`.

- `ikemen-go` executes root State -4 before root States -3/-2, the normal
  state, and root State +1 after the normal state.
- Root +1 is selected through the existing `plus-one` identity, separate from
  numeric State 1.
- State -4/+1 bypass the normal hitpause filter. Frozen roots receive a
  special-only pause pass during regular IKEMEN Pause; State -3/-2 and normal
  controllers retain existing `ignorehitpause` behavior.
- `mugen-1.1`, `unknown`, and helper routes remain unchanged.

Evidence: focal `264/264` across four runtime test files; TypeScript 7/build,
repository boundaries, redirected-dispatch boundary, and diff hygiene pass.

Decision record: [`docs/adr/0013-root-state-minus-four-plus-one-scheduling.md`](../../../../docs/adr/0013-root-state-minus-four-plus-one-scheduling.md)

Closeout: [`docs/reports/2026-07-18-root-state-minus-four-plus-one-closeout.md`](../../../../docs/reports/2026-07-18-root-state-minus-four-plus-one-closeout.md)

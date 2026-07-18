# Implement bounded root State -4/+1 scheduling

Type: implementation
Status: in_progress
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

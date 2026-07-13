# Prove Active-root Standing High Guard Contact

Type: implementation
Status: open
Blocked by: None

## Goal

Prove one explicit IKEMEN Tag active-motion root can remain in an imported command-driven standing state while holding back, observe a direct high-only `guardflag = H` route, and resolve delayed opposing root contact as a guard.

## Acceptance

- Preserve closed MA standing/crouch contact, C-versus-H rejection, C-versus-L guard contact, S-versus-L rejection, Pair/Single behavior, root admission ordering, priority, HitOverride, and reversal gates.
- Keep P2 guardable but out of range while P4 is the only P3 contact source.
- Show P3 enters fixture state `20` S from held back, receives only direct P4 H guard-distance provenance before contact, and reaches the existing automatic guard route before delayed overlap.
- Make P4 author `guardflag = H`, admit only P4 -> P3, and prove generic direct combat resolves `guard`, selects the existing standing guard state, preserves zero-chip life, and records P4 target/contact provenance.
- Keep generic active-root standing movement, crouch/air/complete high-low behavior, automatic-guard breadth, projectiles/helpers, custom state, forceguard, target precedence, Pause/hitpause, presentation, team lifecycle, scores, rollback, and full MUGEN/IKEMEN parity outside this cut.

## Research Input

- `docs/research/2026-07-12-ikemen-active-root-standing-low-guard-rejection.md`

## Claim Ceiling

Allowed: one normal-tick direct high-only active-root contact against an imported standing fixture state through existing command entry, guard-distance, automatic guard, root admission, direct combat, target/contact, and default guard-state ownership.

Blocked: generic active-root movement, crouch/air/complete high-low behavior, automatic-guard policy breadth, projectiles/helpers, custom state, target precedence, Pause/hitpause, presentation, team lifecycle, scores, rollback, and full MUGEN/IKEMEN parity.

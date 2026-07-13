# Prove Active-root Air Guard Contact

Type: implementation
Status: open
Blocked by: None

## Goal

Prove one explicit IKEMEN Tag active-motion root can remain in an imported fixture state type A while holding back, observe a direct A-only `guardflag = A` route, and resolve delayed opposing root contact as an air guard.

## Acceptance

- Preserve the closed fixture-specific ground H/L matrix, Pair/Single behavior, root admission ordering, priority, HitOverride, and reversal gates.
- Keep P2 guardable but out of range while P4 is the only P3 contact source.
- Use a fixture-specific A start route whose available start state is `132`, not the existing ground `120 -> 130` helper; preserve state type A through direct latch and delayed overlap.
- Make P4 author `guardflag = A`, admit only P4 -> P3, and prove generic direct combat resolves `guard`, selects P3 air guard state `154`, preserves zero-chip life, and records P4 target/contact provenance.
- Keep generic jump/air movement, exact Common1 air-guard start timing, landing physics, complete high/low/air policy, automatic-guard breadth, projectiles/helpers, custom state, forceguard, target precedence, Pause/hitpause, presentation, team lifecycle, scores, rollback, and full MUGEN/IKEMEN parity outside this cut.

## Research Input

- `docs/research/2026-07-12-ikemen-active-root-air-guard-contact-map.md`

## Claim Ceiling

Allowed: one normal-tick direct A-only active-root guard against an imported A fixture state through existing command entry, guard-distance, automatic guard, root admission, direct combat, target/contact, and default air guard-state ownership.

Blocked: generic air movement, exact Common1 timing/landing, complete guard policy, projectiles/helpers, custom state, target precedence, Pause/hitpause, presentation, team lifecycle, scores, rollback, and full MUGEN/IKEMEN parity.

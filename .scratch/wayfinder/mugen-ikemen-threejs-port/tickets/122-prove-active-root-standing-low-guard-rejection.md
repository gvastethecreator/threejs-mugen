# Prove Active-root Standing Low-guard Rejection

Type: implementation
Status: resolved
Blocked by: None

## Goal

Prove one explicit IKEMEN Tag active-motion root can remain in an imported command-driven standing state while holding back, reject a direct low-only `guardflag = L` guard route, and resolve delayed opposing root contact as a hit.

## Acceptance

- Preserve closed direct `MA` contact, C `MA` contact, C-versus-H rejection, C-versus-L guard contact, Pair/Single behavior, root admission ordering, priority, HitOverride, and reversal gates.
- Keep P2 guardable but out of range while P4 is the only P3 contact source.
- Show P3 enters fixture state `20` S from held back, remains without an L direct guard-distance latch before contact, and stays standing through the delayed overlap.
- Make P4 author `guardflag = L`, admit only P4 -> P3, and prove generic direct combat resolves `hit`, not `guard`, preserving P4 target/contact provenance.
- Keep generic active-root walking, crouch movement, air state, complete high/low matrix, automatic-guard breadth, projectiles/helpers, custom state, forceguard, target precedence, Pause/hitpause, presentation, team lifecycle, scores, rollback, and full MUGEN/IKEMEN parity outside this cut.

## Research Input

- `docs/research/2026-07-12-ikemen-active-root-standing-low-guard-rejection.md`

## Claim Ceiling

Allowed: one normal-tick low-only direct active-root contact against an imported standing fixture state through existing command entry, root admission, direct combat, and target/contact ownership.

Blocked: generic active-root movement, crouch/air/complete high-low behavior, automatic-guard policy breadth, projectiles/helpers, custom state, target precedence, Pause/hitpause, presentation, team lifecycle, scores, rollback, and full MUGEN/IKEMEN parity.

## Outcome

- Resolved with required `synthetic-imported-ikemen-active-root-standing-low-guard-reject.json`, checksum `906e4751`, final checksum `1eaa402b`.
- Tick sequence: P3 `holdback -> state 20` S at x = `-220`; state-`20` `PosSet` to x = `-100` with no P4 L latch; delayed P4 overlap; exact `p4 -> p3` admission, target `132`, hit, P3 state `20` S, `guarding = false`, life `963`.
- This proves only an L-versus-S negative route. It does not add generic active-root standing movement or complete high/low behavior.

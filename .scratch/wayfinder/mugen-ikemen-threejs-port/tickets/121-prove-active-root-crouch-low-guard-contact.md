# Prove Active-root Crouch Low-guard Contact

Type: implementation
Status: resolved
Blocked by: None

## Goal

Prove one explicit IKEMEN Tag active-motion root can enter an imported command-driven C state, then receive a direct low-only `guardflag = L` latch and resolve delayed opposing root contact as a crouch guard.

## Acceptance

- Preserve closed standing and crouch `MA` guard contact, C-versus-H rejection, Pair/Single behavior, root admission ordering, priority, HitOverride, and reversal gates.
- Keep P2 guardable but out of range while P4 is the only direct P3 threat.
- Show that P3 begins S with no low-only latch, enters fixture state `10` C from held back plus down, and records P4 direct `InGuardDist` only after the fixture's state-local positioning establishes isolated C geometry.
- Route the later latch through imported `120` `StateTypeSet` C and `120 -> 131` before delayed P4 overlap.
- Make P4 author `guardflag = L`, admit only P4 -> P3, and prove generic direct combat resolves `guard`, selects P3 crouch guard-hit state `152`, preserves zero-chip life, and records P4 target/contact provenance.
- Keep standing/air/complete high-low matrix, automatic-guard breadth, projectiles/helpers, custom state, forceguard, target precedence, Pause/hitpause, presentation, team lifecycle, scores, rollback, and full MUGEN/IKEMEN parity outside this cut.

## Research Input

- `docs/research/2026-07-12-ikemen-active-root-crouch-low-guard-contact.md`

## Claim Ceiling

Allowed: one normal-tick direct low-only active-root contact through an imported command-driven C fixture state, guard-distance, StateTypeSet, root admission, direct combat, target/contact, and default guard-state ownership.

Blocked: standing/air/complete high-low behavior, automatic-guard policy breadth, projectiles/helpers, custom state, target precedence, Pause/hitpause, presentation, team lifecycle, scores, rollback, and full MUGEN/IKEMEN parity.

## Outcome

- Resolved with required `synthetic-imported-ikemen-active-root-crouch-low-guard.json`, checksum `748679c8`, final checksum `acec0c58`.
- Tick sequence: state `10` C/no latch at x = `-220`; state-`10` `PosSet` to x = `-100` and sole P4 L latch; `120` `StateTypeSet` C; delayed P4 overlap, exact `p4 -> p3` admission, target `129`, C guard state `152`, and zero-chip life `1000`.
- This does not claim generic active-root crouch movement or a complete high/low matrix.

# IKEMEN Active-root Air Guard Landing Result

Date: 2026-07-13
Question: What can the current active-motion root prove after an A-only guard contact without overstating generic aerial parity?

## Primary Sources

- [Elecbyte CNS reference](https://elecbyte.com/mugendocs/cns.html): state type `A` is airborne and positive Y moves downward.
- [Elecbyte State Controller reference](https://www.elecbyte.com/mugendocs/sctrls.html): `pausetime` and `guard.pausetime` are authored controller parameters with zero defaults, and controller execution order matters for observable state transitions.
- [Pinned IKEMEN-Go `char.go` landing path](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L11842-L11849): the generic airborne landing branch is tied to physics/contact conditions after the position update.

## Findings

- The existing Common1-style guard-hit route is authored as `154/A,N -> 155/A,N -> 52/S,S -> 20/S,S`; it relies on typed state controllers for the transition and landing behavior.
- Generic `physics = A` landing is a different ownership boundary. It is not demonstrated by a route whose landing is authored through `HitVelSet`, `VelAdd`, `CtrlSet`, `VelSet`, `PosSet`, and `ChangeState`.
- Active roots already schedule restricted CNS before local kinematics. The missing runtime behavior was guard-stun maintenance at the front of that active-root motion phase; adding that narrow tick lets the authored guard route reach its landing controllers without widening combat admission.
- Explicit `pausetime = 0` and `guard.pausetime = 0` keep this trace out of the Pause/hitpause claim. Exact pause timing remains a separate gate.

## Decision

Close only the fixture-owned authored route with required trace `synthetic-imported-ikemen-active-root-air-guard-landing.json`, checksum `fe532005`, final `8434e7f8`, and frame count `44`. Keep generic aerial physics, exact Common1/IKEMEN timing, and full guard parity blocked.

# Prove Active-root Air Guard Landing

Type: implementation
Status: resolved
Blocked by: None

## Goal

Prove one explicit IKEMEN Tag active-motion root can progress from the closed A-only guard contact through the existing fixture-owned Common1-style `154 -> 155 -> 52 -> 20` landing route without widening generic aerial physics or gameplay ownership.

## Acceptance

- Preserve Feature125 A-only contact, all closed ground guard evidence, Pair/Single behavior, root admission ordering, priority, HitOverride, and reversal gates.
- Keep P2 guardable but out of range; P4 is the only P3 direct contact source and produces exactly one zero-chip A guard.
- Route held-back P3 through fixture `40/A`, automatic `132/A`, direct guard `154/A`, bounded guard slide `155/A`, explicit landing `52/S`, and controlled standing/walk return `20/S`.
- Require active-root controller order for `HitVelSet`, `VelAdd`, `CtrlSet`, `VelSet`, `PosSet`, and `ChangeState`, plus controllers-before-kinematics schedule evidence.
- Keep generic `physics = A` landing, exact Common1/IKEMEN timing, generic jumping/movement, projectiles/helpers, custom state, forceguard, target precedence, Pause/hitpause, presentation, team lifecycle, scores, rollback, and full parity outside this cut.

## Research Input

- `docs/research/2026-07-12-ikemen-active-root-air-guard-exit-and-landing-map.md`

## Claim Ceiling

Allowed: one normal-tick direct A-only active-root guard can progress through a fixture-owned authored air guard exit and landing route under the current active-motion scheduler.

Blocked: generic aerial physics or landing, exact Common1/IKEMEN timing, complete guard policy, projectiles/helpers, custom state, target precedence, Pause/hitpause, presentation, team lifecycle, scores, rollback, and full MUGEN/IKEMEN parity.

## Outcome

- Required trace: `synthetic-imported-ikemen-active-root-air-guard-landing.json`.
- Trace checksum: `fe532005`; initial checksum: `912a2131`; final checksum: `8434e7f8`; frame count: `44`.
- P3 sequence: `40/A -> 132/A -> 154/A -> 155/A -> 52/S -> 20/S`; P4 is the only direct contact source and records target id `138`.
- Combat evidence: exactly one `p4 -> p3` zero-chip `guard`, P3 life remains `1000`, and the final P3 frame is `20/S/I` with `ctrl = true`.
- Controller evidence: `HitVelSet`, `VelAdd`, `CtrlSet`, `VelSet`, `PosSet`, and `ChangeState` execute before local kinematics in the active-root schedule.
- Verification: `pnpm qa:trace` passes `577/577` artifacts (`546` required); `pnpm test` passes `183` files / `1953` tests; `pnpm typecheck`, `pnpm check:boundaries`, and `pnpm build` pass. Browser smoke is N/A because no visual surface changed.

## Closure Audit

- Adversarial correction: the first trace draft stopped at `154/A` because active roots did not maintain guard stun; the narrow `RuntimeStunSystem` guard-stun tick was added before the active-root state-clock/CNS/kinematics phases.
- Scope correction: the fixture explicitly authors `physics = N` state controllers and zero pause values; this proves the authored route, not generic `physics = A` landing or Pause/hitpause parity.
- Strongest remaining objection: a successful `154 -> 155 -> 52 -> 20` fixture can be mistaken for Common1/IKEMEN timing or generic aerial movement. The claim ceiling above and the required trace notes keep those behaviors blocked.
- Independent review was not used for this narrow slice; the closure is a manual source, scheduler, fixture, and artifact audit.

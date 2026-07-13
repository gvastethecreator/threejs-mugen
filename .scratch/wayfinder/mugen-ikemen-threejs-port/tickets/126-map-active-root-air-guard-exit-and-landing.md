# Map Active-root Air Guard Exit And Landing

Type: research
Status: resolved
Blocked by: None

## Question

After the bounded active-root A-only contact enters `154/A`, what source-backed state, controller, physics, and scheduler ownership can define one honest post-guard exit or landing trace without claiming generic jumping or full air-guard parity?

## Required Mapping

- Identify MUGEN/IKEMEN source rules for air guard-state progression and landing-related transitions that are relevant to `154/155`.
- Locate current local ownership for state progression, vertical physics, ground detection, default guard-state exit, and active-root scheduling.
- Separate a fixture-only traceable route from any generic movement or Common1 timing claim.
- State the minimum deterministic trace, focused coverage, and explicitly blocked scope before implementation.

## Exit Criteria

- A primary-source research note and one precise implementation ticket, or an honest blocker.
- No generic runtime movement mutation, score change, or landing claim in this mapping ticket.

## Claim Ceiling

Allowed: a source-backed map for one future bounded post-contact A guard exit or landing slice.

Blocked: generic jumping, exact Common1 air movement and landing timing, complete guard policy, projectiles/helpers, custom state, target precedence, Pause/hitpause, presentation, team lifecycle, scores, rollback, and full MUGEN/IKEMEN parity.

## Answer

- Elecbyte distinguishes state type `A` from physics `A`: physics `A` applies downward acceleration and enters landing on ground contact, while physics `N` leaves acceleration and landing detection to authored CNS controllers.
- The pinned IKEMEN-GO loop checks a physics-A airborne root after position update and changes it to state `52` only when descending past ground level. This is source context, not behavior claimed by the selected fixture.
- The local synthetic Common1-style landing fixture already owns `154/A,N -> 155/A,N -> 52/S,S -> 20/S,S`: `155` applies `HitVelSet`, authored gravity, control restoration, then explicit `VelSet`, `PosSet`, and `ChangeState 52`; `52` restores control and returns to standing/walk. Its required P1/P2 trace proves this route separately.
- Explicit active roots can already execute `ChangeState`, `CtrlSet`, `VelSet`, `VelAdd`, `HitVelSet`, and `PosSet`, then run kinematics and animation through `RuntimeRootMotionAdvanceWorld`. Their order is controllers before kinematics, so the active proof must assert schedule order instead of borrowing pair tick timing.
- Imported active guard-hit states preserve their H move type through local kinematics, so this cut must use the existing authored `155` exit controller rather than claim generic automatic physics-A landing.

## Outcome

- Research note: `docs/research/2026-07-12-ikemen-active-root-air-guard-exit-and-landing-map.md`.
- Next implementation ticket: `127-prove-active-root-air-guard-landing.md`.
- The selected proof is one fixture-owned post-contact A route. Generic physics-A landing, exact IKEMEN/Common1 timing, external state ownership, and all stated blocked scope remain open.

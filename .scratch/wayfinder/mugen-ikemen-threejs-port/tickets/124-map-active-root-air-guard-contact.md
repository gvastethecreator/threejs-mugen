# Map Active-root Air Guard Contact

Type: research
Status: resolved
Blocked by: None

## Question

What bounded source-backed fixture and ownership path can prove one explicit IKEMEN Tag active root in state type A guards a direct `guardflag = A` contact without claiming generic aerial movement or broad air-guard parity?

## Required Mapping

- Confirm MUGEN/IKEMEN state-type and guardflag rules for A-only guard.
- Identify existing imported state entry and default air guard-state fixtures available to active-motion roots.
- Separate direct guard-distance latch, automatic guard-start, root admission, direct combat, and default air guard-state ownership.
- State the minimum deterministic trace, focused coverage, and explicitly blocked scope before implementation.

## Exit Criteria

- A primary-source research note and a precise implementation ticket or honest blocker.
- No runtime mutation, score change, or generic aerial-movement claim in this mapping ticket.

## Answer

- Elecbyte defines `A` as the air guard flag and state type A as the air state; pinned IKEMEN-GO selects `HF_A` only for `ST_A`.
- Local `RuntimeGuardDistanceWorld` already filters direct guard-distance through state-sensitive guard eligibility, and explicit active roots refresh that latch through the existing active-motion pass.
- `RuntimeGuardWorld.defaultGuardStartStateNo` selects state `132` for A when state `120` is unavailable; `RuntimeGuardWorld.defaultGuardHitStateNo` selects `154` before `150` for A. Focused GuardSystem coverage already pins both selections.
- Existing synthetic `withAutoGuardStartStates` is ground-only because its `120 -> 130` state changes to S. The narrow next cut is an A-only fixture branch that exposes `132` instead of `120`, plus default air guard states `154/155`, so existing automatic guard, admission, and direct combat can be observed without a generic runtime change.

## Outcome

- Research note: `docs/research/2026-07-12-ikemen-active-root-air-guard-contact-map.md`.
- Next implementation ticket: `125-prove-active-root-air-guard-contact.md`.
- Blocked scope remains generic jump/air movement, exact Common1 air-guard start timing, landing physics, projectiles/helpers, pause, presentation, team lifecycle, and full parity.

# Integrate IKEMEN Helper character identity

Type: implementation
Status: claimed
Blocked by: None

## Question

How should live Helpers join the numeric IKEMEN character-identity registry without changing current Helper scheduling, gameplay, or Tag mutation semantics?

## Acceptance

- Register each Helper at creation with a monotonically allocated PlayerID, its root's stable PlayerNo, and explicit parent/root identity links.
- Unregister Helpers at every destruction/removal/reset route without recycling PlayerID or colliding with effect-actor serial ids.
- Expose Helper `ID` and inherited `PlayerNo` through self, Parent, and Root expression contexts using explicit fields only.
- Keep disabled/destroyed lookup eligibility aligned with the shared registry while preserving same-tick Helper execution and current scheduling.
- Prove multiple Helpers, nested parent/root identity, same-tick reads, removal/no-reuse, reset behavior, and unchanged `mugen-1.1` behavior.
- Keep Helper Tag mutation, RedirectID targeting, gameplay participation, score movement, and broad character-controller redirects unsupported.

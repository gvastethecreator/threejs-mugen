# Integrate IKEMEN Helper character identity

Type: implementation
Status: resolved
Blocked by: None

## Question

How should live Helpers join the numeric IKEMEN character-identity registry without changing current Helper scheduling, gameplay, or Tag mutation semantics?

## Acceptance

- Register each Helper at creation with a monotonically allocated PlayerID, its root's stable PlayerNo, and explicit parent/root identity links.
- Unregister Helpers at every destruction/removal route without recycling PlayerID inside the active identity epoch; reset starts a fresh official-style identity epoch without conflating PlayerID and effect-actor serial ids.
- Expose Helper `ID` and inherited `PlayerNo` through self, Parent, and Root expression contexts using explicit fields only.
- Keep disabled/destroyed lookup eligibility aligned with the shared registry while preserving same-tick Helper execution and current scheduling.
- Prove multiple lifecycle routes, root-owned parent/root identity, same-tick reads, removal/no-reuse, reset behavior, and unchanged `mugen-1.1` behavior.
- Keep Helper Tag mutation, RedirectID targeting, gameplay participation, score movement, and broad character-controller redirects unsupported.

## Answer

`RuntimeEffectActorWorld` now publishes Helper spawn/removal lifecycle events across explicit removal, `DestroySelf`/expiry advancement, capacity eviction, and reset. Explicit `ikemen-go` matches subscribe once, register every root-created Helper in the shared numeric registry before same-tick scheduling, inherit the root's PlayerNo, and store separate self/parent/root PlayerID links without changing effect serial ids.

Helper trigger and runtime-controller contexts now expose `ID`, `PlayerNo`, `Parent, ID`, `Parent, PlayerNo`, `Root, ID`, and `Root, PlayerNo` from explicit fields. Destruction unregisters lookup immediately and never reuses PlayerID inside the epoch. Match reset clears the official-style character list and rebuilds the identity epoch from baseline, preserving P1/P2 numeric values while allowing reset effect serials safely. Legacy matches create no registry, and root Tag redirects still reject resolved Helper identities before mutation.

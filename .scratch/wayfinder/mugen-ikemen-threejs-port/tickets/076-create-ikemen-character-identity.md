# Create IKEMEN character identity boundary

Type: implementation
Status: resolved
Blocked by: None

## Question

What smallest runtime owner can represent IKEMEN PlayerID independently from stable sandbox actor ids and one-based PlayerNo before RedirectID is integrated?

## Acceptance

- Add a dedicated generic character-identity world; do not overload `p1`/Helper serial ids or PlayerNo.
- Assign initial roots from a configurable baseline, defaulting to official `HelperMax = 56`, in present odd-PlayerNo roots then present even-PlayerNo roots.
- Allocate later characters monotonically, reject duplicate actor registration, and never recycle an ID during the world lifetime.
- Resolve by numeric PlayerID while rejecting negative, missing, destroyed, and disabled characters; standby remains eligible.
- Expose an immutable JSON-safe diagnostic and prove order, lookup, lifecycle, duplicate, and no-reuse behavior.
- Leave PlayableMatchRuntime integration, `ID`/`PlayerNo` triggers, Helper wiring, Tag RedirectID mutation, and gameplay consumers for separate tickets.

## Answer

`RuntimeCharacterIdentityWorld` now creates a generic `RuntimeCharacterIdentityRegistry` independent from actor string ids and PlayerNo. Present roots receive numeric PlayerIDs from the configurable baseline (`56` by default) in odd-PlayerNo then even-PlayerNo order. Later characters allocate monotonically; removal clears lookup without recycling the numeric ID or actor id. Lookup rejects non-integer, negative, missing, destroyed, and disabled entries while retaining standby entries. A deeply frozen `RuntimeCharacterIdentity/v0` diagnostic exposes current registration and eligibility without leaking mutable registry state.

Focused tests cover default/configurable allocation, PlayerID versus PlayerNo separation, standby/disabled/destroyed lookup, later Helper-shaped registration, removal/no-reuse, duplicate/invalid topology, and detached diagnostics. Runtime integration remains Wayfinder 077.

# Map Tag RedirectID mutation ownership

Type: research
Status: resolved
Blocked by: None

## Question

What exact IKEMEN `RedirectID` syntax, target identity, execution context, and failure behavior must precede redirected TagIn/TagOut mutation in the sandbox?

## Acceptance

- Pin compiler and runtime source for TagIn/TagOut redirect parsing and resolution.
- Identify whether ids address roots, helpers, opponents, or arbitrary live characters.
- Separate expression caller context from redirected mutation/state ownership.
- Map missing/disabled/standby target behavior and partial-mutation order.
- Audit current actor registry and runtime-controller hook boundaries for safe target lookup.
- Select the smallest executable redirect subset or name the required architecture prefactor.

## Answer

`RedirectID` is an optional integer expression accepted by TagIn/TagOut and, per the IKEMEN wiki, by state controllers generally. IKEMEN evaluates it in the original caller context, resolves the result through the global numeric character-ID map, and aborts the controller before any mutation when the ID is negative, missing, destroyed, or disabled. Roots and Helpers are in the same map; standby characters remain eligible. All remaining Tag parameters also evaluate in the original caller context, while state/control/order/standby effects apply to the redirected character and its partner selection.

The sandbox currently has stable string actor ids and a snapshot-facing diagnostic registry, but no numeric PlayerID owner, no `ID`/`PlayerNo` expression context, and no live root/helper mutation lookup by numeric ID. Therefore redirected Tag execution is not safe yet. Wayfinder 076 first creates a deterministic numeric character-identity boundary modeled on IKEMEN's default `HelperMax = 56`, odd-root-then-even-root assignment, monotonic Helper allocation, and active lookup rules. Root runtime integration and Tag mutation remain separate later cuts.

IKEMEN's redirect failure itself is mutation-free because lookup precedes the Tag parameter pass. A later invalid Tag parameter can still leave earlier incremental mutations in IKEMEN; the sandbox keeps its documented aggregate prevalidation and does not claim exact partial-mutation parity.

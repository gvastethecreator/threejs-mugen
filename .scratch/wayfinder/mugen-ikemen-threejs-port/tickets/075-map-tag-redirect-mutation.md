# Map Tag RedirectID mutation ownership

Type: research
Status: open
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

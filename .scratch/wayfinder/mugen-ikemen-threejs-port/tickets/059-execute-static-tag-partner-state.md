# Execute static Tag partner state

Type: implementation
Status: open
Blocked by: None

## Question

How should static `partnerstateno` require and validate a selected partner before applying partner standby plus partner-owned state entry?

## Acceptance

- Static non-negative partner state requires static partner selection.
- Partner and state availability validate before any mutation.
- State entry uses the selected partner's own runtime program.
- Missing partner/state leaves caller and partner unchanged.
- Dynamic values, control, redirects, member/leader order, and gameplay remain blocked.

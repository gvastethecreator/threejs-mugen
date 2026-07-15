# Select TargetState RedirectID

Type: research/task
Status: implemented
Blocked by: None

## Question

Can root-only IKEMEN RedirectID route active CNS and imported State -1
`TargetState` through a live PlayerID destination without conflating the
caller target memory with the target's custom-state ownership?

## Boundary

Selection must begin from the official TargetState and RedirectID contracts.
Any implementation must keep custom-state transfer, state-owner lifetime,
target ID filtering, invalid redirects, helpers/projectiles/teams,
cross-localcoord behavior, exact multi-target order, persistence,
rollback/netplay, presentation, score, and full parity explicit.

## Next

Implemented as a bounded root-only slice.

## Decision

`RedirectID` resolves the live root destination first. The controller then
uses that destination's target memory, preserves the authored target ID and
state number, and enters the selected target with the redirected destination
as its custom-state owner. Active CNS and imported State -1 setup use the same
callback path. Invalid, negative, unavailable, disabled, destroyed,
malformed, and legacy redirects fail closed.

The official source basis and scope are recorded in
`docs/research/2026-07-15-target-state-redirectid-selection.md`.

## Evidence

- Active required artifact:
  `synthetic-imported-target-state-redirect`, checksum `43dcb915`.
- State -1 required artifact:
  `synthetic-imported-target-state-state-entry-redirect`, checksum `99fff243`.
- Full trace QA: `623/623` passed, `589` required, `34` optional, `0` skipped.
- Affected runtime suites: `892/892` passed.
- TypeScript 7, trace-runner syntax, and diff hygiene pass.

## Scope ceiling

Helpers, projectiles, teams, cross-localcoord scaling, exact multi-target
ordering, persistence, rollback/netplay, presentation, score, and full
MUGEN/IKEMEN parity remain separate boundaries.

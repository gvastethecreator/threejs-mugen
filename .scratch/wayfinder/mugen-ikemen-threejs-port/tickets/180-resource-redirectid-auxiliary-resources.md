# Ticket 180: Auxiliary Resource RedirectID

Status: resolved
Entry: 547
Area: IKEMEN runtime compatibility

## Scope

Implement root-only IKEMEN `RedirectID` mutation for GuardPointsAdd/Set, DizzyPointsAdd/Set, and RedLifeAdd/Set in active CNS and state-entry setup. Keep resource values and RedLife absolute evaluation in the original caller context.

## Evidence

- `af27e98f feat(runtime): route auxiliary resources through RedirectID`
- 848/848 focused tests
- TypeScript 7 typecheck passed
- Full trace gate 607/607, 573 required, 34 optional, 0 skipped
- Active checksum `79f60677`
- State-entry checksum `0e280069`

## Boundaries

The route is explicit `ikemen-go` and root-only. Missing RedirectID remains local; invalid, negative, missing, disabled, destroyed, empty, and legacy-profile routes fail closed. CtrlSet, helpers, projectiles, neutral identity, shared/team banks, exact red-life recovery, and full parity remain outside the claim.

## Next

Audit CtrlSet RedirectID as a control-ownership decision, then choose the next target-family mutation slice. Keep the required active/state-entry trace pattern.

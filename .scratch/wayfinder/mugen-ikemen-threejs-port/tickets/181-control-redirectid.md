# Ticket 181: CtrlSet RedirectID

Status: resolved
Entry: 548
Area: IKEMEN runtime compatibility

## Scope

Implement root-only IKEMEN `CtrlSet` RedirectID mutation in active CNS and state-entry setup. Keep the control value and RedirectID expression in the original caller context while applying the resulting flag to the live root PlayerID target.

## Evidence

- `6a8cf2d8 feat(runtime): route CtrlSet through RedirectID`
- 852/852 focused tests
- TypeScript 7 typecheck passed
- Full trace gate 609/609, 575 required, 34 optional, 0 skipped
- Active checksum `9c62ad5b`
- State-entry checksum `2f21266e`

## Boundaries

The route is explicit `ikemen-go` and root-only. Missing RedirectID remains local; invalid, negative, missing, disabled, destroyed, empty, and legacy-profile routes fail closed. Helpers, projectiles, neutral actors, aggregate/team control, persistent-controller timing, and full parity remain outside the claim.

## Next

Choose the next target-family mutation boundary after the control ownership audit. Keep the required active/state-entry trace pattern and commit each bounded feature separately.

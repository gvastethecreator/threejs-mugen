# Progress Report: Dizzy Points Defaults and AttackMulSet Scaling

## Delivered

Entry 511 closes two direct imported runtime gaps. Omitted HitDef dizzy points
now derive from authored normal/Super life-to-dizzy multipliers as negative
receiver deltas, and `AttackMulSet.DizzyPoints` has its own typed multiplier
path before defender defence scaling.

## Evidence

- `synthetic-imported-dizzypoints-default` passes with authored normal default
  `1.25`, damage `40`, and defender result `1000 -> 950`.
- `synthetic-imported-dizzypoints-attack-scale` passes with signed explicit
  `-20`, attacker specialized multiplier `0.5`, defender defence `0.5`, and
  defender result `1000 -> 995`.
- Focal parser, compiler, HitDef, damage-scale, combat, and trace tests cover
  authored constants, hyper selection, dispatch-level constants, signed
  scaling, and typed operation output.
- Full trace-corpus regeneration and repository-wide gates are intentionally
  batched for the next accumulated checkpoint.

## Claim Ceiling

This proves only direct imported HitDef default resolution and dedicated
`AttackMulSet.DizzyPoints` scaling. It does not prove helper specialized-state
persistence, break transitions, red-life sharing, reset/persistence, HUD,
rollback/netplay, or full MUGEN/IKEMEN parity.

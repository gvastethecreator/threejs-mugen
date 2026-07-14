# Ticket 150: Dizzy Points Defaults and AttackMulSet Scaling

Status: resolved

Question: can omitted direct HitDef dizzy points and the dedicated
`AttackMulSet.DizzyPoints` parameter follow the authored IKEMEN semantics while
preserving signed resource ownership?

Answer: yes, within the bounded imported direct-hit route.

Evidence:

- Official IKEMEN-GO changed-controller documentation defines omitted HitDef
  dizzy points through the life-to-dizzy multiplier and exposes the specialized
  `AttackMulSet.DizzyPoints` parameter.
- `Default.LifeToDizzyPointsMul` and `Super.LifeToDizzyPointsMul` are parsed from
  `[Constants]` with numeric fallback defaults; explicit authored `dizzypoints`
  remains authoritative.
- `AttackMulSet.DizzyPoints` is typed separately from regular damage scaling;
  signed direct-hit deltas are scaled by the attacker specialization before
  defender defence scaling.
- Required focused artifacts `synthetic-imported-dizzypoints-default` and
  `synthetic-imported-dizzypoints-attack-scale` pass.

Blocked: helper specialized multiplier persistence, dizzy break transitions,
LifeShare, sharing, reset/persistence, HUD, rollback/netplay, and full parity.

Next: [Ticket 151: dizzy break transition](151-dizzy-break-transition.md).

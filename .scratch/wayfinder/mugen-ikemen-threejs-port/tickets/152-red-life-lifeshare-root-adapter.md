# Ticket 152: Red-life LifeShare Root Adapter

Status: resolved

Question: can imported IKEMEN root actors share red-life through an explicit
team bank while local mode and Helper ownership remain isolated?

Answer: yes, for the bounded root adapter.

Evidence:

- `RuntimeRedLifeShareSystem/v0` owns shared-team and local actor banks without
  widening `RuntimeTeamResourceBank/v1`.
- Shared root mutations reconcile through per-actor baselines and mirror the
  team value; local mode does not mirror.
- Positive values clamp to current life through life max, and KO sides clear
  red-life. Helper controller writes stay local under a shared root topology.
- Required shared, local, and Helper-local trace artifacts pass inside the
  focal 611/611 test suite.

Blocked: native red-life triggers, Projectile/Explod/team-helper sharing,
reset/persistence, HUD, exact round semantics, rollback/netplay, and full
MUGEN/IKEMEN parity.

Next: red-life reset/persistence.

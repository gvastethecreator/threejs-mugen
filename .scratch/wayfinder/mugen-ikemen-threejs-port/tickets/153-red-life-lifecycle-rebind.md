# Ticket 153: Red-life Lifecycle Rebind

Status: resolved

Question: can the root-only red-life bank remain authoritative at typed team
handoff and match reset boundaries?

Answer: yes, for immediate rebind semantics.

Evidence:

- `PlayableMatchRuntime.applyTeamRoundHandoff` reconciles red-life before the
  handoff result returns.
- `RuntimeRedLifeShareRuntime` keeps standby changes out of its topology key,
  preserving the shared value across active-root changes.
- Runtime reset rebinds from the representative root and mirrors the shared
  value to all roots.
- Focused lifecycle, handoff, and trace suites pass 588/588 tests.

Blocked: exact multi-round persistence/round policy, native triggers,
Projectile/Explod/team-helper sharing, HUD, rollback/netplay, and full
MUGEN/IKEMEN parity.

Next: red-life/resource-bar presentation.

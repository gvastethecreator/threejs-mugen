# ADR 0003 - Runtime Global AssertSpecial Ownership

Status: accepted

Date: 2026-07-13

## Context

Imported `AssertSpecial` state is reset and re-applied per actor each frame.
The round adapter then interpreted `TimerFreeze`, `RoundNotOver`, `NoKOSlow`,
and `NoKOSnd` through separate local helpers. That was sufficient for the
current P1/P2 sandbox but leaves ownership ambiguous before IKEMEN team
KO/replacement work. It also makes source attribution and unknown flag handling
hard to inspect.

Elecbyte documents per-tick deassertion for `AssertSpecial` and defines the
round-flow flags as match controls. Ikemen-GO has additional profile-specific
round flags and historical `RoundNotOver` fixes, so those extensions must not
silently enter the MUGEN-compatible path.

## Decision

1. Add a stateless `RuntimeGlobalAssertSpecialWorld/v0` reducer after frame
   reset and per-actor `AssertSpecial` execution.
2. Keep one canonical allowlist for the currently recognized global flags.
   Expose `activeFlags`, `actorsByFlag`, and normalized `unknownFlags` in a
   JSON-safe read model.
3. Let `RuntimeMatchRoundWorld` consume the reducer for timer freeze,
   round-finish blocking, KO slowdown, and KO sound suppression. Each call
   recomputes the snapshot; no flag survives a tick without a fresh assertion.
4. Preserve the existing pair-only round boundary. Do not add team roots,
   replacement, Helper/Projectile flag ownership, IKEMEN `roundFreeze`, or
   new trace checksum fields in this cut.

## Alternatives

### Keep local round helpers

Rejected. It preserves behavior but duplicates global policy and cannot expose
actor sources or fail-closed unknown flags at one boundary.

### Latch global flags on the round system

Rejected. It conflicts with Elecbyte's per-tick deassertion rule and would make
short-lived imported flags persist into later frames.

### Aggregate every root and Helper now

Deferred. Team/replacement and Helper/Projectile ownership need separate
source-pinned decisions; widening them here would overclaim IKEMEN parity.

## Consequences

- Round-flow consumers have one named global ownership seam.
- Focused tests can assert canonical ordering, actor attribution, unknown
  diagnostics, and per-tick reset without depending on trace serialization.
- Existing runtime trace checksums remain stable because the read model is not
  added to `MugenSnapshot` in this prefactor.
- Team KO/replacement, post-KO echo timing, and profile-specific IKEMEN flags
  remain explicit follow-up work.

## Primary References

- [Elecbyte State Controller Reference - AssertSpecial](https://www.elecbyte.com/mugendocs/sctrls.html)
- [Elecbyte MUGEN Upgrade Notes](https://www.elecbyte.com/mugendocs-11b1/upgrading.html)
- [Ikemen-GO official v0.99.0-rc.1 release](https://github.com/ikemen-engine/Ikemen-GO/releases/tag/v0.99.0-rc.1)

## Claim Boundary

Allowed: bounded pair-round global `AssertSpecial` aggregation and ownership
diagnostics for the current runtime.

Blocked: exact MUGEN/IKEMEN team-round semantics, multi-root precedence,
replacement, lifebars/resources, Helper/Projectile global ownership, KO echo
parity, IKEMEN ZSS/Lua, rollback/netplay, and full parity.

# Execute Active-root Hit-admission Projection

Type: implementation
Status: resolved
Blocked by: None

## Goal

Publish a deterministic read-only projection of direct-hit candidates for every eligible explicit-Tag root without granting combat mutation ownership.

## Acceptance

- Add a named root hit-admission world with unique actor validation and no mutation hooks.
- Preserve pair/Single behavior by invoking the projection only for explicit IKEMEN Tag.
- Order attackers by active ReversalDef, active direct HitDef, then stable numeric PlayerNo/id fallback.
- Reject disabled, standby, invalid-side, non-player, self, and disallowed same-side pairs.
- Evaluate active move, repeated-contact, HitBy/NotHitBy, required attack/hurt Clsn, and overlap.
- Publish exact attacker/getter pair ids plus rejection reasons in snapshot/trace diagnostics.
- Prove pause/hitpause/reset freshness and zero life/target/effect/contact mutation.
- Pass focused/full tests, TypeScript 7, build, trace, boundaries, docs, audit, and commit.

## Claim Ceiling

Allowed: deterministic read-only direct-hit admission evidence for active explicit-Tag roots.

Blocked: hit/guard/reversal/HitOverride mutation, targets, juggle, priority trade mutation, helpers/projectiles, throws, resources, round/HUD/audio, scores, or full parity.

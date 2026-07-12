# Execute Active-root Body-push Promotion

Type: implementation
Status: resolved
Blocked by: None

## Goal

Promote current bounded X/Width body push from the playable pair to every eligible explicit-Tag root without granting hit or combat ownership.

## Acceptance

- Add a named plural body-push world with deterministic run-order input and unique actor validation.
- Preserve exact pair behavior outside explicit Tag.
- Explicit Tag admits valid-side player roots that are non-disabled/non-standby; `PlayerPush = 0` excludes each pair.
- Resolve every unordered eligible pair once in stable root order using current facing-aware Width geometry.
- Re-clamp moved roots to current stage bounds after plural separation.
- Publish body-push capability/ids and actor-scoped schedule/trace evidence.
- Cover same-side and cross-side roots, disabled, standby, invalid, duplicate, zero-distance, Width, edge clamp, reset, and no-combat/effect widening.
- Pass focused/full tests, TypeScript 7, build, trace, boundaries, docs, audit, and commit.

## Claim Ceiling

Allowed: bounded deterministic plural X/Width push for explicit-Tag root actors.

Blocked: exact IKEMEN AffectTeam, size-box/Clsn2 selection, Y/Z, localcoord, priority, weight, pushfactor, hit admission, helpers, throws, exact corner/tie interpolation, scores, or full parity.

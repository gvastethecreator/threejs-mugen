# Promote Root Target Maintenance

Type: implementation
Status: resolved
Blocked by: None

## Goal

Advance target memory and resolve existing target bindings across authoritative explicit-Tag roots without enabling new hit acquisition or combat mutation.

## Acceptance

- Give post-fighter target maintenance a deterministic actor list and complete valid candidate roster.
- Advance each eligible root target memory exactly once on normal ticks.
- Apply TargetBind and BindToTarget by exact actor id across roots, not one pair opponent.
- Preserve Pair/Single and paused-match behavior.
- Fail closed for disabled, invalid, or removed candidates and clear stale binding-subject telemetry.
- Expose actor-scoped schedule/trace proof with zero new contacts and unchanged behavior checksums.
- Pass focused/full tests, TypeScript 7, build, trace, boundaries, docs, audit, and commit.

## Claim Ceiling

Allowed: actor-keyed existing target-memory maintenance for explicit Tag roots.

Blocked: deferred hit-target acquisition, active-root hit mutation, target controller widening, throws, helpers/projectiles, round/HUD/audio, scores, or full parity.

## Outcome

Explicit Tag normal post-fighter maintenance now selects stable, unique, valid P1-P8 roots; ages each target store once; clears stale binding-subject telemetry across every authoritative root; resolves all TargetBind passes before all BindToTarget passes against complete exact-id candidates; and records actor-scoped schedule evidence. Pair/Single defaults and pause/hitpause paths remain unchanged. Invalid, disabled, non-player, and duplicate candidates fail closed.

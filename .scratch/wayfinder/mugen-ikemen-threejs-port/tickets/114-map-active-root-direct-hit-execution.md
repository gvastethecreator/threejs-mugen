# Map Active-root Direct Hit Execution

Type: research
Status: resolved
Blocked by: None

## Goal

Map the first real P3-P8 direct-hit mutation cut now that effect ownership, target maintenance, and HitDef getter memory are actor-keyed.

## Acceptance

- Reconcile read-only admitted pairs with resolver order and exact getter contact memory.
- Inventory scalar `hasHit`, priority/trade, HitOverride, ReversalDef, state ownership, power/life, contact/presentation/audio, KO/round, and target writes.
- Select one source-aligned mutation route with rollback-safe failure and deterministic actor ordering.
- Define team KO/resource claim limits and required trace/browser evidence.
- Preserve Pair/Single checksums and reject unsupported controllers or ownership instead of partial mutation.

## Claim Ceiling

Allowed: implementation-ready first active-root direct-hit execution contract.

Blocked: full multi-root combat, throws, projectile/helper teams, exact round/HUD/audio/resources, scores, or full parity.

## Outcome

The mapped first mutation route already landed in the runtime. Explicit IKEMEN Tag resolves ordered admitted direct pairs through `RuntimeCombatResolutionWorld.resolveDirect`, exact roots are looked up from the authoritative registry, and unknown admitted ids fail closed. Follow-on cuts also added active-root CNS HitDef authoring, actor-keyed target/contact memory, HitDef priority arbitration, equal-priority trades, and directed ReversalDef clashes.

Required traces now cover the direct-hit, priority, trade, and reversal routes. The next unimplemented direct-combat boundary is active-root HitOverride authoring and resolution, tracked by Wayfinder 116.

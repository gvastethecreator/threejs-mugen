# Execute Plural Active-root Automatic Guard Scheduling

Type: implementation
Status: resolved
Blocked by: None

## Goal

Let an active-motion explicit IKEMEN Tag root consume a prior direct `InGuardDist` observation from any eligible opposing active root at the existing pre- and post-controller automatic guard checkpoints.

## Acceptance

- Preserve existing Pair/Single P1/P2 latch and automatic-guard behavior.
- Refresh only active-motion roots after body push and before root hit admission.
- Consider every local `p2CandidateIds` opponent in stable diagnostic order; record the first direct guard-distance match only as diagnostic attribution.
- Treat `InGuardDist` as a boolean latch for guard-start eligibility, matching the upstream flag rather than coupling the guard state transition to a selected attacker.
- Admit active-motion roots to the existing pre/post automatic guard checkpoints; keep bounded-standby roots excluded.
- Prove a P3 defender holding side-one back enters state `120`/`130` because near P4 is in direct guard distance while primary P2 authors a guardable direct HitDef but remains deliberately out of range.
- Keep direct combat absent in the guard-distance proof and preserve the active-root hit/priority/reversal/HitOverride gates.

## Research Input

- `docs/research/2026-07-12-ikemen-active-root-auto-guard-scheduling.md`

## Claim Ceiling

Allowed: direct physical active-root guard-distance observation and existing imported guard-start state entry on normal IKEMEN Tag ticks.

Blocked: active-root projectiles/helpers, exact plural attacker ordering or nearest-target parity, Pause/hitpause guard scheduling, guard contact resolution, guard variants/effects, team KO/replacement, HUD/audio/resources, rollback, scores, and full MUGEN/IKEMEN parity.

## Outcome

`RuntimeMatchActorAdvanceWorld` now includes `active-motion` roots in the established pre/post automatic guard passes. `PlayableMatchRuntime` refreshes each precomputed active root after plural body push and before hit admission, using all local `p2CandidateIds` in stable order but retaining the first direct match only for trace provenance. Active-motion automatic guard consumes latch presence as the upstream boolean flag; Pair/Single P1/P2 automatic guard and generic `InGuardDist` triggers preserve their existing selected-attacker identity. A root that tags out during its controller pass is rechecked before post guard and latch refresh, which clears rather than carries a stale observation into standby CNS. Actual hitpause clears reserve-root latches before ignored-controller execution, and match pause clears them before paused reserve CNS can observe them; the normal hitpause probe preserves the current normal-tick latch. This cut does not imply Pause/hitpause guard scheduling support.

Required `synthetic-imported-ikemen-active-root-auto-guard` passes with trace checksum `5e0aaf61` / final checksum `0221a0e8`: P2 authors a guardable direct HitDef while remaining far, P4 is the direct no-contact threat, side-one held-back reaches P3, P3 records direct P4 provenance, enters state `120`, settles in `130`, remains life `1000`, and no hit/guard/override contact occurs. Consolidated focused coverage passes `760` tests; full regression passes `183` files / `1944` tests, trace QA `569/569` artifacts (`538` required), TypeScript typecheck, module boundaries, and production build.

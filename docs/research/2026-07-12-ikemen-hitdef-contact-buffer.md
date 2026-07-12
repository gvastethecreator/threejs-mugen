# IKEMEN HitDef Contact Buffer Research

Date: 2026-07-12
Wayfinder: 112
Pinned upstream revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`

## Correction

IKEMEN does not defer the CNS target list. On accepted direct contact it appends the getter id to `hitdefTargetsBuffer`, then later in the same result transaction calls deduplicating `addTarget(getter.id)` for the live CNS target list. The buffer belongs to a separate per-HitDef contact list.

## Source Facts

1. A non-projectile contact appends the getter PlayerID to `hitdefTargetsBuffer` before GetHitVars mutation: [direct result buffer](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10815-L10835).
2. The same result transaction immediately calls `addTarget(getter.id)`; `addTarget` deduplicates the live `targets` list.
3. Character update later appends the pending ids to `hitdefTargets` and clears only the buffer: [post-update commit](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L12312-L12333).
4. A new non-projectile HitDef reset clears both committed and pending HitDef target lists.
5. `hasTargetOfHitdef` participates in hitonce admission, counter-priority, ReversalDef, and juggle decisions. Projectile HitDefs do not use this character contact list.

## Local Audit

| Surface | Current behavior | Gap |
| --- | --- | --- |
| CNS targets | `RuntimeTargetWorld.remember` updates actor-local target refs immediately and deduplicates by actor/id. | Already aligned for timing. |
| Direct contacts | Pair actors set scalar `hasHit`; one contact blocks every later getter. | No per-getter contact identity or pending commit. |
| Root admission | `RuntimeRootDirectHitAdmissionWorld` returns `already-hit` from scalar `hasHit`. | Cannot distinguish P2 from P4/P6/P8. |
| Reset | Move/HitDef lifecycle resets scalar `hasHit`. | No explicit committed/pending contact lists. |
| Projectile/Helper | Own hit/contact state and target routes. | Must remain excluded from first character-HitDef cut. |
| Scheduling | Post-fighter target maintenance and combat phases are explicit. | Need one actor-scoped commit after direct combat. |

## Selected Cut: Wayfinder 113

- Add actor-local committed/pending direct-HitDef getter ids.
- Keep immediate `RuntimeTargetWorld` writes unchanged.
- Buffer accepted direct hit/guard/reversal getter ids, commit after direct combat, clear on direct HitDef/move reset.
- Let read-only root admission reject only getter ids already committed or pending; keep scalar `hasHit` for current pair mutation compatibility until migration proves parity.
- Do not widen P3-P8 mutation, projectile/helper behavior, or round/resources.

## Pressure Findings

- Deferring `RuntimeTargetWorld` would regress same-tick Target controllers and contradict upstream.
- Reusing scalar `hasHit` for teams prevents one attack from contacting multiple opposing roots.
- Removing scalar behavior in the same cut risks pair regressions; expand-contract first.
- Deduplicating the pending HitDef list is not source-exact: upstream appends contacts, while the live CNS target list deduplicates.

## Claim Ceiling

Allowed: corrected source model and implementation-ready direct-HitDef contact-memory contract.

Blocked: active-root hit mutation, exact hitonce/juggle/priority/reversal parity, throws, projectile/helper breadth, round/HUD/audio, scores, or full parity.

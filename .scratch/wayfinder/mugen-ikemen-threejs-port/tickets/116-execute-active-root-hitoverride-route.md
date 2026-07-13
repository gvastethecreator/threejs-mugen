# Execute Active-root HitOverride Route

Type: implementation
Status: resolved
Blocked by: None

## Goal

Let an already-active explicit IKEMEN Tag root author a bounded `HitOverride` and redirect one admitted opposing active-root direct HitDef through the existing actor-generic resolver.

## Acceptance

- Admit only `HitOverride` into the `active-motion` controller capability profile.
- Advance the active root's existing HitOverride slot lifetime once per normal active-root tick.
- Reuse the existing typed compiler, slot selection, guardflag filtering, direct resolver, target/contact buffering, and state-entry hooks.
- Prove P3 defender authored the controller, P4 direct HitDef selected the matching slot, P3 entered its own override state without normal damage, and P4 committed exact P3 target/contact memory.
- Preserve Pair/Single behavior, active-root direct-hit/priority/reversal traces, and all unsupported controller routes.

## Claim Ceiling

Allowed: one active-root direct-HitDef HitOverride redirect with actor-local state, target, contact, and slot-lifetime ownership.

Blocked: automatic guard, broad guard interaction, custom-state/forceguard breadth, helper/projectile combat, throws, ReversalDef-versus-ReversalDef, team KO/replacement, HUD/audio/resources, rollback, scores, and full parity.

## Outcome

`ACTIVE_MOTION_ROOT_CNS_CAPABILITIES` now admits only `hitoverride` beyond the prior active-root controller set, and `PlayableMatchRuntime` ages that root's existing override slots once before active-motion state/controller execution. No direct resolver branch was added.

Required `synthetic-imported-ikemen-active-root-hitoverride` passes with trace checksum `dd6bc943` and final checksum `5a093268`: P3 programs slot `2`, P4's admitted `HitDef` resolves as `override`, P3 enters state `777` at life `1000`, P4 commits target id `116` against P3, and normal hit/guard outcomes remain absent. Companion expiry trace `synthetic-imported-ikemen-active-root-hitoverride-expiry` passes with checksum `eae92580` / final `9314ef50`: P3 installs a one-tick slot at `Time = 0`, frame zero admits no P4 hit, and delayed frame-one `p4 -> p3` becomes an ordinary hit at P3 life `963`. Full trace regression passes `568/568` artifacts (`537` required).

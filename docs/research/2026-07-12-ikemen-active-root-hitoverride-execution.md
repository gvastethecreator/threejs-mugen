# IKEMEN Active-root HitOverride Execution Research

Date: 2026-07-12
Wayfinder: 116
Pinned upstream revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`

## Question

Can an already-active P3-P8 root install a bounded `HitOverride` and safely redirect an admitted opposing root direct HitDef without widening team combat ownership?

## Source Facts

1. The MUGEN State Controller Reference defines up to eight active HitOverride slots, a default lifetime of one tick, `-1` for replacement-only lifetime, and a redirect into the defender's specified state: [HitOverride](https://www.elecbyte.com/mugendocs/sctrls.html#HitOverride).
2. The same reference states that matching HitDefs with `p1stateno` or `p2getp1state = 1` do not affect an active override by default: [HitOverride notes](https://www.elecbyte.com/mugendocs/sctrls.html#HitOverride).
3. IKEMEN-GO evaluates guard/override/state routing inside its direct hit-result transaction after vulnerability/priority policy: [pinned result transaction](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10488-L10835).
4. IKEMEN-GO buffers successful direct contact ids for later character-update commit, so an override route must retain the exact attacker/getter ownership already introduced for active roots: [pinned contact-buffer and commit boundaries](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10815-L10835).

## Local Ownership Audit

| Surface | Status | Constraint |
| --- | --- | --- |
| Parsing and typed operation | Ready | `ControllerOps` and `StateControllerExecutor` compile/apply `HitOverride` to the executing actor. |
| Direct resolution | Ready | `RuntimeCombatResolutionWorld.resolveDirect` checks the defender slot before normal hit/guard mutation and uses actor-generic state/target/contact hooks. |
| Active-root CNS | Blocked | `ACTIVE_MOTION_ROOT_CNS_CAPABILITIES` excludes `hitoverride`, despite allowing active `HitDef` and `ReversalDef`. |
| Slot lifetime | Blocked | Full fighter advance calls `RuntimeHitOverrideWorld.tickSlots`; active-root motion does not. |
| Root identity/effects/targets | Ready for this route | Root-key stores plus explicit target/contact buffers prevent P3/P4 aliasing. |
| Team outcomes | Blocked | Round, replacement, HUD, shared resources, and broad presentation remain pair-owned. |

## Selected Cut

Add `hitoverride` to the active-motion runtime-controller allowlist and tick the existing actor-local slots before that root's state/controller phase. Do not add new resolver branches: P3 programs one ordinary slot in state `0`, P4 programs the already-supported active-root `HitDef`, and the existing admission plus direct resolver perform the redirect.

The required trace will prove controller/operation telemetry, P3's defender-owned redirect state, unchanged P3 life, P4-to-P3 target/contact ownership, and no normal hit or guard result. A one-tick slot is also allowed to age after redirect, but this cut does not claim every expiry/override replacement combination.

## Rejected Alternatives

- Auto guard needs plural guard-distance refresh, root input policy, and pre/post-controller schedule semantics; it is a separate phase design.
- Helper/projectile HitOverride already has pair-owned routes but would widen effect/combat lifecycle, not just root controller capability.
- Custom-state, forceguard, and guardflag variants would combine multiple unproven state-ownership rules; the first route remains ordinary defender-owned redirect only.

## Claim Boundary

Allowed: an explicit Tag P3/P4 direct-HitDef override redirect with exact actor-local slot, state, target, and contact mutation.

Blocked: automatic guard, broad HitOverride variants, custom state ownership, helper/projectile routes, throws, dual reversal ordering, team KO/replacement, HUD/audio/resources, rollback, scores, and full MUGEN/IKEMEN parity.

## Outcome

Wayfinder 116 is resolved. The active-motion controller profile now permits only `hitoverride` in addition to the prior bounded routes, and active roots tick existing override slots before their controller phase. No new combat resolver, target, effect, or round owner was introduced.

Required `synthetic-imported-ikemen-active-root-hitoverride` passes with trace checksum `dd6bc943`, final checksum `5a093268`, and two frames. It proves P3 controller/operation telemetry, P4 direct HitDef, root admission `p4 -> p3`, one `override` combat reason, P3 state `777` at life `1000`, P4-to-P3 target id `116`, and no normal hit or guard result. Companion `synthetic-imported-ikemen-active-root-hitoverride-expiry` passes with checksum `eae92580` / final `9314ef50`: P3 installs `time = 1` at `Time = 0`, no first-frame pair is admitted, then delayed P4 `Time >= 1` contact becomes an ordinary hit at P3 life `963`. This makes active-root slot aging observable. Full trace regression is `568/568` artifacts (`537` required).

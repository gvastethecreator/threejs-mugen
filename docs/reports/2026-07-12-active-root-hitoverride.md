# Active-root HitOverride Report

Date: 2026-07-12
Scope: Wayfinder 116

## Delivered

- Active-motion P3-P8 may execute the existing typed `HitOverride` controller.
- Each active root ages existing override slots once before its controller phase.
- The existing admission and direct resolver redirect P4's admitted HitDef into P3's defender-owned state without a new multi-root combat branch.

## Evidence

- Required `synthetic-imported-ikemen-active-root-hitoverride`: checksum `dd6bc943`, final `5a093268`, two frames.
- Required adversarial `synthetic-imported-ikemen-active-root-hitoverride-expiry`: checksum `eae92580`, final `9314ef50`; one-tick P3 slot expires before delayed P4 contact, producing P3 life `963` via ordinary hit.
- Full trace matrix: `568/568` passed, `537` required.
- Focused trace preset test: `2` tests passed.
- Full closeout: `183` files / `1939` tests, TypeScript 7 typecheck, production build, and boundaries all pass.
- Build retains the pre-existing Vite large-chunk advisory (`1,659.25 kB` JavaScript).

## Closure Audit

- Scope: one runtime-controller allowlist entry and one actor-local lifetime call; no new resolver, round, effect, helper, projectile, HUD, or resource branch.
- Positive proof: P3/P4 trace requires typed controller and operation telemetry, exact root admission, defender-owned redirect state, and P4 target/contact ownership.
- Negative proof: the expiry trace requires no first-frame contact and rejects `override` on the delayed frame, where P3 must instead receive normal damage.
- Regression proof: full trace, test, typecheck, build, boundaries, and whitespace checks pass. This is a local audit; no independent reviewer result was used for this closure.

## Global Port Status

The playable legal MUGEN-lite sandbox has browser evidence through motion, attack, guard, get-hit/fall/recovery, multi-frame AIR, and NoKOSlow KO. IKEMEN active roots now own bounded motion, presentation, constraints, body push, direct HitDef/ReversalDef/HitOverride mutation, target/contact lifecycle, priority, and directed reversal slices. Studio authoring spine, plural automatic guard scheduling, broad team round/HUD/resources, helper/projectile team combat, throws, and full compatibility remain separate work.

## Next Candidate

Map plural active-root automatic guard scheduling before widening guard interaction. It needs an explicit source-backed choice of cross-side attacker selection, guard-distance refresh, and pre/post-controller ordering; no implementation is claimed by this report.

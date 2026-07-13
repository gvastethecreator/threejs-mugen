# IKEMEN Active-root Direct Guard Contact

Date: 2026-07-12

## Question

Can the existing active-root admission and generic direct-combat path resolve a guarded P4 -> P3 physical contact after P3 has received the prior normal automatic-guard latch, without widening root selection or inventing a parallel guard resolver?

## Primary Sources

- [Elecbyte MUGEN tutorial: guardflag and holding back](https://www.elecbyte.com/mugendocs-11b1/tutorial4.html): `guardflag = MA` permits standing, crouching, or air guarding while holding back.
- [Elecbyte State Controller Reference: HitDef guardflag](https://www.elecbyte.com/mugendocs-11b1/sctrls.html): `guardflag` determines the states in which P2 may guard a HitDef; omission means the attack cannot be guarded.
- [IKEMEN-GO pinned `hitResultCheck`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10670-L10707): after confirming guard capability and a matching guard flag, upstream classifies the contact as guard.
- [IKEMEN-GO pinned player collision detection](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13220-L13320): player guard distance is observed before the Clsn contact path calls `hitResultCheck`.

## Local Findings

- `RuntimeMatchInteractionWorld` orders body push, pair/root guard-distance refresh, root admission, priority/reversal, then root direct combat.
- `RuntimeRootDirectHitAdmissionWorld` already admits direct P3/P4 root pairs only when both roots are active, opposing, collision-valid, and depth-valid.
- `RuntimeCombatResolutionWorld.resolveDirect` already evaluates `holdingBack` and `guardFlag`, applies generic direct guard mutations, target/contact memory, default guard state, and contact presentation.
- The closed active-root auto-guard trace deliberately avoids Clsn contact, so it cannot prove this contact path.

## Selected Boundary

Do not change root admission or combat mutation ownership. Add a delayed-position synthetic fixture route: P4 is initially in P3's direct guard distance without collision, then moves into physical overlap on the following tick after P3 receives the prior latch. Require the existing root admission and generic resolver to produce one guard result after the full fighter-controller phase.

## Deliberate Limits

- No projectile/helper contact.
- No claim about nearest-target ordering beyond the existing stable diagnostic candidate order.
- No pause/hitpause scheduling or guard transition during pause.
- No sound/spark/renderer proof, custom-state, forceguard, team KO, or full parity claim.

## Result

Yes. The selected delayed-position fixture passes without changing root admission or combat mutation ownership. Required `synthetic-imported-ikemen-active-root-direct-guard.json` checksum `202b9838` / final checksum `140ed77e` proves P3's prior P4 direct latch, then P4's delayed `PosSet` and P3's imported `120 -> 130` controller in deterministic actor-phase order before post-fighter admission. That admission yields exactly one `p4 -> p3` contact, generic `guard` resolution, target id `120`, default guard state `150`, `guarding = true`, and zero-chip P3 life `1000`. The result does not claim that P4's position mutation occurred after P3's state transition; only admission and combat occur after both controllers. The next decision must remain a separate guard-contact boundary; the result does not justify widening target precedence, effects, pause behavior, or guard variants.

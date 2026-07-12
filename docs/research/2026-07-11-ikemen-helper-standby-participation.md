# IKEMEN Helper standby participation

## Question

Which local runtime consumers must observe a Helper's standby flag before TagIn/TagOut may safely toggle it, and which behaviors must remain active?

## Answer

IKEMEN standby is a character-interaction flag, not a lifecycle or visibility flag. A standby Helper remains registered, scheduled, state-driven, animated, and drawable. Its effective `Ctrl` trigger is false, direct character hit detection rejects it as both attacker and defender, push and camera tracking ignore it, and active Enemy/P2 candidate lists exclude it.

Projectile behavior is deliberately different. Projectile creation records either the creating Helper or its root as owner, but projectile/player detection only rejects a standby getter and an unavailable owner. It does not reject a live standby projectile owner. Projectile travel, drawing, projectile clashes, and contact with active players therefore continue. Filtering helper-parented projectiles when the Helper tags out would diverge from the pinned source.

IKEMEN also accepts `standby` on Helper creation. That is a separate compiler/runtime feature from TagIn/TagOut and remains outside the next execution cut.

## Source behavior matrix

| Surface | Pinned IKEMEN behavior |
| --- | --- |
| CNS/action | `actionRun` skips destroyed or disabled characters, not standby characters. |
| Effective control | `ctrl()` requires the stored control flag and rejects standby. The stored flag is not cleared. |
| Direct HitDef/hurt | Player hit detection rejects standby attackers and getters before contact. |
| Projectile versus player | A standby getter is unhittable. A live standby projectile owner is not rejected. |
| Projectile versus projectile | Clash logic has no standby-owner filter. |
| Push | Both the pusher and getter are rejected while standby. |
| Camera | Screen-bound and X/Y camera tracking ignore standby characters. |
| Enemy/P2 | Enemy selection rejects standby; P2 candidates require non-standby. EnemyNear remains root-only. |
| Drawing | Character draw setup rejects invalid/disabled characters and explicit invisibility, not standby. |
| Helper creation | The `standby` parameter sets or clears the new Helper's standby flag. |

## Primary sources

- [Official IKEMEN wiki: TagIn affects Helpers](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#tagin)
- [Official IKEMEN wiki: TagOut standby properties](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#tagout)
- [Pinned character scheduler and CNS execution](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L11737-L11773)
- [Pinned effective control predicate](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L5330-L5337)
- [Pinned direct character hit filtering](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13207-L13228)
- [Pinned projectile owner selection](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L2496-L2511)
- [Pinned projectile/player owner and getter checks](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13434-L13474)
- [Pinned projectile clash path](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L2695-L2755)
- [Pinned push filtering](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13622-L13640)
- [Pinned camera filtering](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L12058-L12110)
- [Pinned EnemyNear/P2 candidate rules](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13962-L14015)
- [Pinned character drawing path](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L12648-L12790)
- [Pinned Helper creation `standby` parameter](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L5558-L5702)

## Local audit

| Consumer | Current sandbox status | Next action |
| --- | --- | --- |
| Helper CNS/state clock | Already continues without a standby branch in `HelperSystem`. | Preserve and test. |
| Effective `Ctrl` expression | Helper expression context exposes stored `ctrl` directly. | Project false while standby without erasing stored control. |
| Direct Helper HitDef | `RuntimeHelperCombatWorld.resolveDirect` iterates every Helper. | Add one reusable direct-character participation predicate. |
| Incoming Helper hurt | Helpers are not current match-combat defenders. | No widening; keep full Helper hurt parity blocked. |
| Helper push | Root pair alone enters `ActorConstraintWorld.separate`. | No widening; keep Helper push parity blocked. |
| Camera | Stage camera input contains P1/P2 roots only. | Preserve; no Helper camera widening. |
| Enemy/P2 candidate | Executable opponent rosters contain roots only; topology diagnostics already reject standby and default non-player-type Helpers. | Preserve; keep player-type Helper opponent parity blocked. |
| Helper projectiles | Parent provenance is stored, but combat/clash runs through the root owner store without a Helper standby filter. | Preserve contact, clashes, travel, and drawing; add a regression test. |
| Target controllers | Helper CNS and target memory continue. | Preserve; do not globally suppress controllers. |
| Presentation | Helper snapshots are emitted unconditionally and the renderer has no standby filter. | Preserve visible snapshots; add a regression test. |
| PlayerID lookup | Standby Helpers remain registry-eligible. | Preserve. |

## Decision

The next bounded cut needs only two new semantics before true/default Helper `self` is safe:

1. A shared `runtimeHelperCanDirectlyInteract` boundary must suppress direct Helper character combat for destroyed, disabled, or standby Helpers.
2. Helper expression context must expose effective `Ctrl = 0` while standby while retaining the stored control flag for TagIn.

TagIn/TagOut may then toggle Helper standby after prevalidated local state/control mutation. Projectiles, CNS, target controllers, identity, snapshots, and drawing must remain active. Aggregate partner/member/leader behavior remains separate.

## Uncertainty

The sandbox does not yet model Helpers as incoming combat targets, push actors, camera actors, or player-type opponent candidates. This research establishes that those paths must consume the same participation state when they are introduced, but it does not justify widening them now. Exact incremental IKEMEN mutation, Helper-originated Tag, Helper-created Helpers, initial Helper `standby`, and `ownprojectile` ownership remain blocked.

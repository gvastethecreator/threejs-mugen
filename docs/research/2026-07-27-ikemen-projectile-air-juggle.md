# IKEMEN Projectile `air.juggle` Research

## Question

What source contract does IKEMEN-GO use for Projectile `air.juggle`, and which
part can the Three.js runtime implement without guessing about helper ownership
or exact target timing?

## Pinned source

- Repository: `ikemen-engine/Ikemen-GO`
- Commit: `4aa0ba38f851c52549ba182310e9e53361cd472a`
- Primary source: [`src/char.go` projectile admission](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L13593-L13602)
- Primary source: [`src/char.go` juggle spend/reset](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L11490-L11505)
- Primary source: [`src/bytecode.go` ModifyHitDef forwarding](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L8323-L8330)
- Primary source: [`src/bytecode.go` Projectile `air.juggle` assignment](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L8858-L8867)

## Findings

1. A Projectile stores its own `HitDef air_juggle` value. The source admission
   compares that value with the target's per-attacker juggle points. `NoJuggleCheck`
   bypasses the check.
2. IKEMEN gives a first-target branch through `hittmp < 2`; the local runtime
   has no equivalent counter yet. This cut admits an untracked non-falling
   root-owned first contact and applies the budget to tracked or falling
   contacts. That is an explicit bounded approximation.
3. The source spends projectile `air_juggle` only when the target was falling
   before or after the hit. A projectile does not reset the attacker's `c.juggle`;
   that reset belongs to the non-projectile path.
4. `ModifyHitDef` forwards `air.juggle` into the active `HitDef` field. It does
   not prove that the direct character `c.juggle` field should change, so this
   slice leaves that route separate.

## Local contract

Under `runtimeProfile = "ikemen-go"`:

- CNS `Projectile air.juggle` compiles and survives spawn normalization.
- Root-owned projectiles (`rootId === attacker.id` and `parentId === attacker.id`)
  run admission after `HitBy` and before `HitOverride`.
- A rejected contact leaves contact memory, damage, removal, and hit counters
  untouched; the log includes `via air.juggle`.
- A falling contact spends points in `defender.runtime.airJugglePoints[attacker.id]`.
- `NoJuggleCheck` admits without spending; projectile contact does not reset
  `attacker.runtime.juggle`.
- MUGEN/unknown profiles and helper/child projectiles retain their prior path.

## Evidence

- `src/tests/RuntimeCompiler.test.ts`: compiler field.
- `src/tests/ProjectileSystem.test.ts`: spawn normalization and truncation.
- `src/tests/ProjectileCombatSystem.test.ts`: spend, rejection, bypass, profile,
  and child ownership boundaries.
- `src/tests/RuntimeTraceGatePresets.test.ts`: required imported trace with
  direct falling setup, projectile spend, over-budget rejection, and effect
  snapshot `airJuggle` value.
- Required trace id: `synthetic-imported-ikemen-projectile-air-juggle-golden`.

## Open questions

- Exact `hittmp` and target scheduling parity.
- Helper-owned and nested child projectile ownership.
- MUGEN branch, teams, projectile clashes, and `ModifyHitDef` mutation timing.
- Full global checkpoint and score/parity impact.

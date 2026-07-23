# T405 Direct HitDef Air Juggle

Type: task

Status: resolved in `462591ad`

## Question

Can an explicit IKEMEN direct normal HitDef use `air.juggle` against target
`data.airjuggle` points, reject an over-budget falling contact, and honor
`NoJuggleCheck`?

## Source evidence

- Pinned [IKEMEN HitDef compiler field](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L1778-L1815)
  reads `air.juggle` as an integer.
- Pinned [IKEMEN HitDef setup](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L999-L1005)
  defaults its field and updates the direct character value for an explicit
  non-projectile IKEMEN value.
- Pinned [IKEMEN target point helpers](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L1213-L1235)
  retain target points by attacker id and default to `data.airjuggle`.
- Pinned [IKEMEN direct contact path](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L13289-L13322)
  admits `NoJuggleCheck`, a fitting cost, or an IKEMEN target below falling
  `hittmp`; it spends points after a falling contact.

## Contract

Under explicit `ikemen-go`, a static normal direct HitDef reads the defender
`data.airjuggle` budget, defaulting to 15. Remaining points live on the
defender and use the direct attacker id as their key. A falling getting-hit
target rejects a cost above its remaining value. `NoJuggleCheck` bypasses the
check and does not deduct. A successful unguarded hit records the target id
and deducts when the target falls before or after the contact.

The required imported artifact uses a 4 point target. A first falling
`air.juggle = 3` hit leaves 1 point. A later 3 point direct HitDef rejects.
The next matching HitDef with `NoJuggleCheck` hits without spending the last
point.

## In scope

- Static HitDef compiler lowering and active move metadata.
- Target `data.airjuggle` budget with a 15 point local default.
- Explicit IKEMEN direct and equal-priority admission.
- Direct `NoJuggleCheck` bypass and no-deduction behavior.
- Trace snapshots and one required imported direct air-juggle artifact.

## Out of scope

StateDef character `juggle`, omitted-cost persistence, attack-state resets,
ModifyHitDef `air.juggle`, Projectiles, Helpers and inherited points, target
drop, exact target membership, full source scheduling, legacy MUGEN behavior,
rollback/netplay, and full MUGEN/IKEMEN parity.

## Verification

Focused `RuntimeJuggleSystem`, `RuntimeCombatResolutionSystem`,
`RuntimeCompiler`, `HitDefSystem`, and `RuntimeMatchCombatBridgeSystem`
coverage passes 5 files and 130 tests. The focused required trace passes 1
test with 647 tests skipped by its name filter. Trace-script syntax and diff
hygiene pass. The TypeScript 7 gate, full Vitest, aggregate traces, build, and
boundary checks remain reserved for the accumulated runtime checkpoint.

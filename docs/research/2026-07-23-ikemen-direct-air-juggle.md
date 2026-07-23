# IKEMEN Direct Air Juggle Research

Date: 2026-07-23

Status: runtime slice closed in `462591ad`.

## Question

Which direct normal HitDef `air.juggle` path can the runtime carry with
source-backed point, rejection, and bypass evidence?

## Source basis

Pinned IKEMEN-GO gives each target a `data.airjuggle` default of 15. Its
GetHitVar keeps a remaining value per attacking player id, retains that value
when an existing id is added again, and uses the target default for a new id.

- [Data default and target point helpers](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L1213-L1235)
- [Character data default](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L275-L300)

The HitDef compiler accepts `air.juggle` as an integer. HitDef setup defaults
its own field to zero. An explicit non-projectile IKEMEN value updates the
character `juggle` value used by direct contact.

- [HitDef compiler field](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L1778-L1815)
- [HitDef setup](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L999-L1005)

Direct source admission accepts `NoJuggleCheck`, a cost that fits the target
remaining value, or an IKEMEN target with `hittmp < 2`. A successful contact
retains the attacker id. If the target fell before or after the hit, source
deducts the direct cost unless `NoJuggleCheck` applies.

- [Direct admission](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L13289-L13322)
- [Target record and point spending](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L11411-L11506)
- [Character juggle reset](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L11983-L11989)

## Local mapping

`HitDefControllerOp` and `DemoMove` now carry static `airJuggle`. A newly
created local HitDef uses zero when the field is absent. Under explicit
`ikemen-go`, `RuntimeJuggleSystem` reads the target `data.airjuggle` constant,
uses 15 when it is absent, and stores remaining direct points on the defender
by attacker id.

`RuntimeCombatResolutionWorld` applies the direct check after local HitFlag
and HitBy admission. A bounded local getting-hit state maps IKEMEN `hittmp <
2` to an allowed contact. A target in local getting-hit fall state must have
enough remaining points unless the attacker has `NoJuggleCheck`. Accepted
unguarded direct hits retain the target entry. A hit where the target fell
before or after contact deducts the static cost. `NoJuggleCheck` passes the
check and keeps the remaining value unchanged.

`RuntimeMatchCombatBridgeWorld` passes the compatibility profile to direct and
equal-priority resolution. Trace snapshots expose `airJugglePoints`. The
required `synthetic-imported-ikemen-direct-air-juggle` artifact drives three
normal HitDefs: a 3 point falling hit against a 4 point target, a rejected
second hit, and a `NoJuggleCheck` hit. It ends with target life 966 and
remaining points `{ p1: 1 }`.

## Audit and verification

- Focused `RuntimeJuggleSystem`, `RuntimeCombatResolutionSystem`,
  `RuntimeCompiler`, `HitDefSystem`, and `RuntimeMatchCombatBridgeSystem`
  coverage passes 5 files and 130 tests.
- The focused required direct air-juggle trace preset passes: 1 test passed,
  647 tests skipped by the name filter.
- `node --check scripts/qa_traces.cjs` and `git diff --check` pass.

## Deferred

The source character-level `juggle` value, its StateDef route, omission
persistence, and reset when a character leaves attack state remain separate.
The local direct slice uses the active static move cost only. ModifyHitDef
`air.juggle`, Projectiles, Helpers and inherited juggle points, target drop,
exact target membership, full `hittmp` timing, the legacy MUGEN branch,
rollback/netplay, the accumulated TypeScript 7 gate, full Vitest, aggregate
traces, production build, boundary checks, and full parity remain deferred.

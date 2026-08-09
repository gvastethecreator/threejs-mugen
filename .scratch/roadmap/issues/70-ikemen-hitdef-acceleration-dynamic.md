# Issue 70 — Ikemen-GO dynamic HitDef acceleration metadata

- **Status:** closed-bounded
- **Priority:** I2
- **Lane:** runtime / compiler
- **Dependency:** Issue 69 / T485

## Scope

Retain supported scalar expressions for `HitDef` and `ModifyHitDef`
`xaccel`, `yaccel` and `zaccel`, then evaluate them in the active controller
context before writing the typed `GetHitVar` metadata. Static numbers keep the
existing typed path. This closes the dynamic metadata handoff only; it does
not apply acceleration to Common1 physics, add localcoord/facing scaling, or
broaden dynamic support to the other `ModifyHitDef` fields.

## Authority

- [Ikemen-GO changed state-controller reference](https://github-wiki-see.page/m/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28changed%29#hitdef-parameters)
- [Ikemen-GO `char.go` source](https://raw.githubusercontent.com/ikemen-engine/Ikemen-GO/develop/src/char.go)

## Evidence

- `src/mugen/compiler/ControllerOps.ts` retains executable scalar expressions
  for the three acceleration fields while preserving static numbers.
- `src/mugen/runtime/HitDefSystem.ts` evaluates those expressions through the
  existing runtime controller context for direct HitDef and active
  ModifyHitDef mutation.
- `src/tests/RuntimeCompiler.test.ts` and `src/tests/HitDefSystem.test.ts`
  cover operation retention, runtime evaluation and mutation (250 focused
  tests in the full seven-file slice).

## Claim ceiling

This issue does not claim acceleration physics, friction, depth integration,
localcoord/facing conversion, dynamic vectors, or full M.U.G.E.N/Ikemen
controller-expression parity.

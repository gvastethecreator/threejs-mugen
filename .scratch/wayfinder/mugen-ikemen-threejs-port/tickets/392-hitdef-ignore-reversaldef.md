# T392 HitDef IgnoreReversalDef

Type: task

Status: resolved in `3bb7fc3c`; imported coverage in `aa992740`

## Question

Can a static direct HitDef opt out of a matching active ReversalDef without
changing normal hit or reversal behavior for other attacks?

## Source evidence

- Pinned [IKEMEN HitDef compiler route](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L2267-L2270)
  accepts boolean `ignorereversaldef`.
- Pinned [IKEMEN HitDef bytecode](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L7920-L7922)
  stores that value on the active HitDef.
- Pinned [IKEMEN reversal admission](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L10445-L10472)
  rejects ReversalDef matching when the countered active HitDef sets the
  flag.

## Contract

Static direct HitDef now retains `ignorereversaldef` as
`ignoreReversalDef`. A true value skips direct ReversalDef admission, so
ordinary contact proceeds through the current HitDef path. Omitted or false
values preserve ReversalDef admission. A new HitDef resets this value to
false when it omits the field.

## In scope

- Static compiler and active move retention.
- Direct and equal-priority direct-combat ReversalDef admission checks.
- Focused system and imported P1/P2 coverage.

## Out of scope

Dynamic expressions, Projectile behavior, ReversalDef clashes, Helper
ownership differences, full priority scheduling, teams, renderer work,
rollback/netplay, and full MUGEN/IKEMEN parity.

## Verification

- `RuntimeCompiler`, `HitDefSystem`, `ReversalSystem`,
  `RuntimeCombatResolutionSystem`, `PlayableMatchRuntime`, and
  `CombatResolver`: 6 files / 478 tests pass.
- TypeScript 7 typecheck, `node --check scripts/qa_traces.cjs`, and diff
  hygiene pass.
- Full Vitest, aggregate traces, build, and boundaries remain queued for the
  next larger runtime checkpoint.

## Closure audit

Focused coverage proves omission resets a later HitDef to false, and imported
direct contact damages the defender. The equal-priority preflight uses the
same active-move guard; the current model does not hold a normal HitDef and an
active ReversalDef on one actor for an end-to-end dual-active fixture.
Projectile and clash routes remain outside this result.

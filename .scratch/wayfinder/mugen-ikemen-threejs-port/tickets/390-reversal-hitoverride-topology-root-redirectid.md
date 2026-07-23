# T390 Reversal HitOverride Topology Root RedirectID

Type: task

Status: resolved in `20324cf`

## Question

Can direct ReversalDef arbitration use the HitOverride owned by the countered
actor and the active ReversalDef inherited HitDef payload without changing
ordinary HitDef arbitration?

## Source evidence

- Pinned [IKEMEN ReversalDef compiler route](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L1864-L1905)
  parses `reversal.attr` separately, then passes inherited fields through the
  HitDef route.
- Pinned [IKEMEN ReversalDef bytecode](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L7965-L8000)
  and [ModifyReversalDef bytecode](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L8350-L8385)
  retain the inherited HitDef payload on an active reversal.
- Pinned [IKEMEN contact arbitration](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L10718-L10824)
  selects HitOverride slots from `getter.hover`: the actor countered by the
  ReversalDef.
- The same [source block](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L10718-L10770)
  matches slot attribute types against `hd.attr`, slot state against the
  counter owner's current state, slot guard flags against `hd.guardflag`, and
  applies the counter owner's unguardable flag.
- The [override result path](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L10765-L10824)
  returns a miss for the forced/default rule or selects the HitOverride route
  before ordinary ReversalDef state handling.

## Local finding

T389 retained `missonoverride`, but queried the reverser's HitOverride slots
with the original incoming HitDef `attr` and `guardflag`. That inverts the
source actors and hides the inherited payload. Its explicit-zero path then
ran normal reversal handling when IKEMEN selects the countered actor's
HitOverride redirect.

## Contract

Under explicit `ikemen-go`, direct ReversalDef contact uses the countered
actor's active HitOverride slots. It matches them with the active reversal's
inherited static `attr` and `guardflag`, plus the reverser's current state and
unguardable flag.

- A matching slot with omitted custom-state policy or explicit
  `missonoverride = 1` returns the direct miss result.
- A matching slot with `missonoverride = 0` applies the HitOverride redirect;
  it does not run normal ReversalDef p1/p2 state handling.
- A slot on the reverser does not take part in this decision.

## In scope

- Static inherited `attr` and `guardflag` on ReversalDef and root
  ModifyReversalDef RedirectID.
- Active payload mutation without replacing the move or reversal metadata.
- Direct root contact topology, source-shaped attr/state/guard matching, and
  existing HitOverride redirect application.
- Compiler, matcher, reversal, imported-match, and required trace coverage.

## Out of scope

Dynamic payloads, full attr grammar, Projectile or Helper contact,
ReversalDef-vs-ReversalDef, Helper receivers, exact source scheduling,
full HitOverride state side effects, teams, renderer work, rollback/netplay,
and full MUGEN/IKEMEN parity.

## Result

`20324cf` adds typed `hitDefAttr` and `guardFlag` fields, carries them through
activation and root mutation, and uses them in direct reversal arbitration.
The matcher can use the ReversalDef owner's state and unguardable flag without
changing ordinary HitDef callers. A matched countered-actor slot follows the
existing HitOverride redirect path; the direct reversal path runs only when no
such slot applies.

## Verification

- `RuntimeCompiler`, `ReversalSystem`, `RuntimeCombatResolutionSystem`,
  `PlayableMatchRuntime`, and `CombatResolver`: 5 files / 452 tests pass.
- Required
  `synthetic-imported-ikemen-root-modifyreversaldef-missonoverride-redirect`
  passes with attacker-owned HitOverride evidence, inherited `S,SP` / `A`
  payload, and final state `889` on the countered actor.
- `node --check scripts/qa_traces.cjs` and staged diff hygiene pass.
- Full typecheck, full Vitest, aggregate traces, build, and boundaries remain
  queued for the grouped runtime checkpoint.

## Closure audit

The tests prove separate slot ownership, default/forced miss behavior, and
explicit-zero redirect behavior. They do not claim global engine parity or
cover the out-of-scope contact families.

# IKEMEN Reversal GuardFlag Root Redirect Research

Date: 2026-07-22

## Question

Can the local reversal path add source-backed static `reversal.guardflag`
support before the separate negative guard filter?

## Sources

- [IKEMEN HitFlag parser](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L1678-L1703)
- [IKEMEN ReversalDef and ModifyReversalDef compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L2298-L2358)
- [IKEMEN reversal admission](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L10465-L10493)
- [IKEMEN ModifyReversalDef runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L8350-L8385)

## Findings

- IKEMEN stores positive and negative reversal guard filters independently.
- Positive `reversal.guardflag` needs overlap with the incoming HitDef guard
  flag and fails when the attacker has `AssertSpecial unguardable`.
- `M` expands to the high and low bits. The local overlap helper needs the same
  expansion before it can serve ReversalDef and HitOverride correctly.
- The local direct, clash, projectile, and helper reversal callers already hold
  the incoming actor or source needed to pass the unguardable flag.

## Decision

Implement positive static `reversal.guardflag` across activation and active
root mutation. Use a normalized local `H`, `L`, `M`, and `A` subset and reject
dynamic or unsupported flag forms. Keep `reversal.guardflag.not` as the next
separate source-backed cut.

## Evidence plan

- Compiler accepts normalized static input and rejects dynamic or unsupported
  input.
- Runtime reversal tests prove in-place mutation, match rejection, `M`
  expansion, and unguardable rejection.
- Imported match and required trace prove root RedirectID changes an active
  reversal from a nonmatching filter to a matching filter before counter
  contact.

## Implementation Result

`7c63118f` adds static H/L/M/A positive reversal guard filters to typed
ReversalDef and ModifyReversalDef operations, active move metadata, runtime
reversal metadata, and the synthetic imported fixture path. It exports the
normalized overlap helper used by HitOverride and passes incoming unguardable
state through all local reversal admission callers.

## Verification

Grouped compiler, reversal, playable-match, trace, and CombatResolver coverage
passes 5 files / 1049 tests. The required trace changes the active receiver
from an air filter to a high filter before reversal contact. Script syntax and
diff hygiene pass. The next grouped checkpoint owns TypeScript, full Vitest,
trace aggregate, build, and boundary evidence.

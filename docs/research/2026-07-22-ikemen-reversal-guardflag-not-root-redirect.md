# IKEMEN Reversal GuardFlag Not Root Redirect Research

Date: 2026-07-22

## Question

Can the local reversal path add `reversal.guardflag.not` with its distinct
unguardable rule?

## Sources

- [IKEMEN ReversalDef and ModifyReversalDef compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L2298-L2358)
- [IKEMEN reversal guard filter admission](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L10481-L10493)
- [IKEMEN ModifyReversalDef runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L8350-L8385)

## Findings

- The upstream positive and negative filters are separate fields.
- Negative overlap rejects a normal guardable attack.
- The negative filter does not reject an unguardable incoming attack, unlike
  the positive filter.
- The T386 local normalized overlap helper and incoming unguardable context
  provide the needed primitives.

## Decision

Implement static activation and root active-reversal mutation for the negative
field. Preserve the T386 positive check first, then apply negative rejection
only when the incoming attack is guardable. Keep wider flag forms and dynamic
input blocked.

## Evidence plan

- Compiler accepts static negative input and rejects dynamic or unsupported
  input.
- Runtime tests prove normal overlap rejection, `M` expansion, and unguardable
  bypass after an in-place redirect mutation.
- Imported match and required trace prove a root changes an active reversal
  from a blocking negative filter to a nonmatching filter before contact.

## Implementation Result

`5f4667e1` adds static H/L/M/A negative reversal guard filters to typed
ReversalDef and ModifyReversalDef operations, active move metadata, runtime
reversal metadata, and the synthetic imported fixture path. The admission order
keeps T386 positive rejection first, then applies the negative filter only to a
guardable incoming attack.

## Verification

Grouped compiler, reversal, playable-match, trace, and CombatResolver coverage
passes 5 files / 1049 tests. The required trace changes the active receiver
from a high-blocking negative filter to an air filter before high-flag reversal
contact. Script syntax and diff hygiene pass. The next grouped checkpoint owns
TypeScript, full Vitest, trace aggregate, build, and boundary evidence.

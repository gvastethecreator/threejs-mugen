# IKEMEN ModifyReversalDef Core Root Redirect Research

Date: 2026-07-22

## Question

Which source-backed `ModifyReversalDef` fields can extend T382 without claiming
the full shared HitDef surface?

## Sources

- [ModifyReversalDef compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L2331-L2359)
- [Shared HitDef compiler fields](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L1864-L1874)
- [Shared pause and depth fields](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L2041-L2044)
  and [attack depth](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L2243-L2246)
- [ModifyReversalDef runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L8350-L8385)
- [Shared HitDef mutation runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L7540-L7898)

## Findings

- IKEMEN compiles `ModifyReversalDef` with reversal-specific fields followed by
  shared HitDef fields.
- Its runtime resolves RedirectID in caller context, requires an active target
  reversal, then passes supplied fields into the existing HitDef mutation path.
- The local ReversalDef implementation already stores `hitPause`, `p1StateNo`,
  `targetId`, and `attackDepth` on the active move. Runtime reversal metadata
  stores the first, second, and fourth fields.
- The local model reads the first `pausetime` number. This cut can accept one
  or two static numbers and retain only the first one.
- The local reversal apply path always uses get-P1-state behavior for
  `p2stateno`. Do not expose that field until the behavior has a separate
  source-backed owner and state-transition contract.

## Decision

Implement a static root-only subset: `reversal.attr`, first `pausetime`,
`p1stateno`, `id`, and `attack.depth`. Require `RedirectID` and at least one
of those fields. Keep mutation in place and preserve all untouched receiver
state. Reject dynamic values, unknown keys, empty payloads, and unmodeled
fields.

## Implementation Result

`739ac163` implements the bounded root-to-root path. It mutates supplied core
fields on one verified active reversal without replacing its move or contact
state. The local runtime stores target id only on the active move; the other
supported fields update both the move and reversal metadata where available.

Focused compiler, reversal dispatch, imported-match, and trace coverage passes
7 files / 1051 tests. The new required trace proves depth admission, changed
counter state, and changed target id. The grouped checkpoint remains a separate
record.

## Checkpoint Result

The [global checkpoint after T383](2026-07-22-global-checkpoint-after-t383.md)
passed TypeScript 7, full Vitest, trace QA, production build, both boundary
guards, and diff hygiene. The claim ceiling remains unchanged.

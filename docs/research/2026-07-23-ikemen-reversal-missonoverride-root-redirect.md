# IKEMEN Reversal MissOnOverride Root Redirect Research

Date: 2026-07-23

## Question

What direct-contact contract can safely carry IKEMEN inherited
`missonoverride` from ReversalDef and root ModifyReversalDef RedirectID?

## Sources

- [IKEMEN HitDef compiler route](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L1864-L1905)
- [IKEMEN ReversalDef bytecode](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L7965-L8000)
- [IKEMEN ModifyReversalDef bytecode](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L8350-L8385)
- [IKEMEN HitOverride arbitration](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L10765-L10770)

## Findings

- The compiler accepts `missonoverride` in the inherited HitDef payload used
  by ReversalDef and ModifyReversalDef.
- IKEMEN stores an omitted value as its default and rejects a matching active
  HitOverride when the field forces a miss or the default direct custom-state
  rule applies.
- Local direct combat already has the matching override query and a shared
  default decision helper for ordinary HitDef. Its reversal branch ran before
  that query.
- A static tri-state local representation is enough for this cut: `undefined`
  preserves the default decision, `false` permits the reversal, and `true`
  forces the miss.

## Decision

Keep the feature direct and root-only. Add the static field to typed compiler
operations and active reversal state. Query the existing matching HitOverride
before applying a found reversal, and reuse the existing direct miss decision
instead of duplicating state-field rules.

## Evidence plan

- Compiler accepts static `0` and `1`, rejects dynamic input.
- ReversalSystem proves false mutation preserves active object identity.
- Imported root RedirectID match proves explicit zero lets a custom-state
  counter beat a matching HitOverride.
- Required trace records both controller families and ends in the reversal
  state rather than the HitOverride state.

## Implementation result

`188c4462` carries `missOnOverride` through activation and active mutation.
Direct combat skips a found reversal when the matching active override and the
source-shaped direct miss decision require it. The explicit zero route applies
the reversal and leaves the HitOverride state unentered.

## Verification

Focused compiler/combat/dispatch tests pass 113 tests, the imported-match test
passes 315, and the required trace passes. Script syntax and diff hygiene pass.
The grouped runtime checkpoint remains pending. A non-T389 team-handoff trace
needed 8.36 seconds under external Node load, so its default five-second result
is not counted as a passing aggregate gate; a diagnostic 20-second run passed.

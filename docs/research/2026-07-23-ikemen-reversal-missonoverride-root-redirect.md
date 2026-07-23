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
- Local direct combat has a shared default decision helper, but T389 initially
  queried the reverser's slots with the incoming HitDef payload.
- A static tri-state local representation is enough for this cut: `undefined`
  preserves the default decision, `false` permits the matching redirect, and `true`
  forces the miss.

## Correction

T390 confirms the source topology: HitOverride belongs to the countered actor,
while matching uses the ReversalDef inherited `attr` and `guardflag`, the
reverser's state, and its unguardable flag. With explicit zero, the selected
HitOverride redirects the countered actor; normal ReversalDef p1/p2 handling
does not run.

## Decision

Keep the feature direct and root-only. Retain the static field on typed
operations and active reversal state. T390 queries the countered actor's slot
with the active inherited payload, then reuses the existing direct miss
decision and redirect route.

## Evidence plan

- Compiler accepts static `0` and `1`, rejects dynamic input.
- ReversalSystem proves false mutation preserves active object identity.
- Imported root RedirectID match proves explicit zero selects the matching
  countered-actor HitOverride.
- Required trace records both controller families and ends in HitOverride
  state `889`, not reversal state `777`.

## Implementation result

`188c4462` carries `missOnOverride` through activation and active mutation.
T390 `20324cf` corrects the direct override actor/payload topology. The
default/forced cases skip, while explicit zero applies the countered actor's
HitOverride redirect.

## Verification

Focused compiler, combat, dispatch, imported-match, and matcher coverage passes
5 files / 452 tests, and the required trace passes. Script syntax and diff
hygiene pass.
The grouped runtime checkpoint remains pending. A non-T389 team-handoff trace
needed 8.36 seconds under external Node load, so its default five-second result
is not counted as a passing aggregate gate; a diagnostic 20-second run passed.

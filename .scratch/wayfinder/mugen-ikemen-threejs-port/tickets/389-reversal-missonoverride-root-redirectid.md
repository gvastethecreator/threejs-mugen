# T389 Reversal MissOnOverride Root RedirectID

Type: task

Status: resolved in `188c4462`

## Question

Can static `missonoverride` on ReversalDef and root ModifyReversalDef
RedirectID arbitrate a direct counter against a matching active HitOverride
without changing unrelated HitDef paths?

## Source evidence

- Pinned [IKEMEN HitDef compiler route](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L1864-L1905)
  accepts `missonoverride` as an inherited HitDef field.
- Pinned [IKEMEN ReversalDef bytecode](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L7965-L8000)
  delegates inherited fields through HitDef behavior.
- Pinned [IKEMEN ModifyReversalDef bytecode](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L8350-L8385)
  updates that payload on an active reversal.
- Pinned [IKEMEN HitOverride arbitration](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L10765-L10770)
  returns no contact for `missonoverride = 1`, or for its default when a
  non-projectile HitDef-family payload carries `p1stateno` or `p2stateno`.

## Local finding

The local direct resolver finds an active reversal before its normal
HitOverride route. Its existing HitOverride matcher and
`shouldRuntimeHitOverrideMissDirect` policy already model the source-shaped
default for direct custom-state payloads. Reversal activation did not retain
the field, so it could not use that policy before claiming a counter.

## Contract

Under explicit `ikemen-go`, static ReversalDef and root
ModifyReversalDef RedirectID accept `missonoverride`. With a matching active
direct HitOverride:

- absent field plus `p1stateno` or `p2stateno` skips the reversal;
- `missonoverride = 0` lets the reversal win;
- `missonoverride = 1` skips the reversal even without custom-state fields.

The skip records the current direct `hitoverride-custom-state-miss` result and
does not enter the HitOverride state.

## In scope

- Static field parsing on ReversalDef activation.
- Static root ModifyReversalDef RedirectID mutation on one active root
  reversal.
- Direct matching-HitOverride arbitration before accepted reversal contact.
- Compiler, dispatch, imported match, and required trace evidence.

## Out of scope

Dynamic expressions, Projectile or Helper contact, Helper receivers, broader
HitOverride guard/slot parity, source scheduler order, teams, renderer work,
rollback/netplay, and full MUGEN/IKEMEN parity.

## Result

Typed ReversalDef state now keeps `missOnOverride` on the active move and
runtime metadata. Root RedirectID mutation can write an explicit false value
without replacing the active reversal. Direct combat queries a matching active
HitOverride before applying an eligible counter, then uses the shared direct
miss policy.

## Verification

- `RuntimeCompiler`, `ReversalSystem`, and `RuntimeCombatResolutionSystem`
  pass 113 tests.
- `PlayableMatchRuntime` passes 315 tests.
- Required
  `synthetic-imported-ikemen-root-modifyreversaldef-missonoverride-redirect`
  passes and proves a root mutation from the default custom-state miss to an
  accepted reversal through a matching HitOverride.
- `node --check scripts/qa_traces.cjs` and diff hygiene pass.
- The full trace aggregate, typecheck, full Vitest, build, and boundaries stay
  queued for the grouped runtime checkpoint. Under external Node load, an
  unrelated team-handoff artifact exceeded the normal five-second test limit;
  it passed in 8.36 seconds with a diagnostic 20-second limit and does not
  exercise ReversalDef or HitOverride.

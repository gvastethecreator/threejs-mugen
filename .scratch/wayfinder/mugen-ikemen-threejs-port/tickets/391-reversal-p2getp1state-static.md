# T391 ReversalDef Static P2GetP1State

Type: task

Status: resolved in `a9837e49`; imported coverage in `aa992740`

## Question

Can a static `p2getp1state` on ReversalDef carry through typed compilation
and direct contact so a countered target can use its own `p2stateno` data?

## Source evidence

- Pinned [IKEMEN HitDef compiler route](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L1864-L1905)
  accepts `p2stateno` and `p2getp1state` as inherited HitDef fields.
- Pinned [IKEMEN ReversalDef bytecode](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L7965-L8000)
  resets the active HitDef, delegates inherited fields to `hitDef.runSub`,
  and finalizes the result for the redirected receiver.
- Pinned [IKEMEN contact route](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L10770-L10824)
  selects the ReversalDef `p2stateno` owner from `p2getp1state` before the
  normal direct contact result.

## Contract

Under explicit `ikemen-go`, static ReversalDef carries `p2getp1state` from
the typed operation into the active move and reversal metadata.

- `0` routes `p2stateno` through the countered target's own state data.
- Nonzero values route it through the ReversalDef owner's state data.
- Omitted values preserve the current default `true` when `p2stateno` is
  present.
- Dynamic values remain unsupported and do not produce a typed operation.

## In scope

- Static ReversalDef compiler lowering and active runtime retention.
- Direct imported P1/P2 target-state ownership proof.
- Existing root ModifyReversalDef mutation behavior remains unchanged.

## Out of scope

Dynamic expressions, Helper or Projectile receivers, custom-state timing,
HitOverride interactions, broader inherited HitDef fields, teams, renderer
work, rollback/netplay, and full MUGEN/IKEMEN parity.

## Verification

- `RuntimeCompiler`, `HitDefSystem`, `ReversalSystem`,
  `RuntimeCombatResolutionSystem`, `PlayableMatchRuntime`, and
  `CombatResolver`: 6 files / 478 tests pass.
- TypeScript 7 typecheck, `node --check scripts/qa_traces.cjs`, and diff
  hygiene pass.
- Full Vitest, aggregate traces, build, and boundaries remain queued for the
  next larger runtime checkpoint.

## Closure audit

The imported match proves a countered actor enters its own state `888` with
no custom-state owner when the active ReversalDef has static zero. The result
does not claim dynamic expression, Helper, Projectile, or exact source timing
parity.

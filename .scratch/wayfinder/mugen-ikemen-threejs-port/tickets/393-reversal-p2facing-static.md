# T393 ReversalDef Static P2Facing

Type: task

Status: resolved in `a9837e49`; imported coverage in `aa992740`

## Question

Can static inherited `p2facing` on ReversalDef carry through typed
compilation and direct counter contact so the countered actor faces the
source-defined direction?

## Source evidence

- Pinned [IKEMEN HitDef compiler fields](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L1965-L1988)
  parse `p1facing`, `p1getp2facing`, and `p2facing` as integer inherited
  HitDef values.
- Pinned [IKEMEN ReversalDef bytecode](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L7965-L7994)
  delegates inherited parameters to HitDef; ModifyReversalDef follows the
  same field path.
- Pinned [IKEMEN contact facing route](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L11474-L11490)
  assigns the target facing from the sign of `p2facing` for a hit or
  reversal result.

## Contract

Under explicit `ikemen-go`, static ReversalDef and root
ModifyReversalDef carry integer `p2facing` into the active move and reversal
metadata.

- Negative values make the countered actor face the reverser direction.
- Positive values make the countered actor face the opposite direction.
- Zero and omission leave the current target facing unchanged.
- Dynamic values remain unsupported and do not produce a typed operation.

## In scope

- Static compiler lowering and active runtime retention.
- Direct root ReversalDef and root ModifyReversalDef mutation.
- Focused unit and imported P1/P2 contact proof.

## Out of scope

`p1facing`, `p1getp2facing`, dynamic evaluation, exact deferred source
facing and hitpause order, Helper or Projectile routes, reversal clashes,
teams, renderer work, rollback/netplay, and full MUGEN/IKEMEN parity.

## Verification

- `RuntimeCompiler`, `HitDefSystem`, `ReversalSystem`,
  `RuntimeCombatResolutionSystem`, `PlayableMatchRuntime`, and
  `CombatResolver`: 6 files / 478 tests pass.
- TypeScript 7 typecheck, `node --check scripts/qa_traces.cjs`, and diff
  hygiene pass.
- Full Vitest, aggregate traces, build, and boundaries remain queued for the
  next larger runtime checkpoint.

## Closure audit

Unit coverage proves negative, positive, and zero values plus capture of the
reverser's pre-state-entry facing. Imported coverage proves activation and
root ModifyReversalDef RedirectID update the countered actor. The source's
deferred facing and hitpause order remain open.

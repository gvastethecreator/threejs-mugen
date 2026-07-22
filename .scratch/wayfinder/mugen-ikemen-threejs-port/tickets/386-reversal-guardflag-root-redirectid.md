# T386 Reversal GuardFlag Root RedirectID

Type: task

Status: resolved in `7c63118f`

Blocked by: None

## Question

Can static `reversal.guardflag` on ReversalDef and root ModifyReversalDef
RedirectID filter active reversal contact by the incoming HitDef guard flag,
including the upstream `unguardable` rejection?

## Source evidence

- Pinned [IKEMEN-GO compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L1678-L1703)
  parses `H`, `L`, `M`, `A`, `F`, `D`, `P`, `-`, and `+` into HitFlag bits.
- Pinned [ReversalDef and ModifyReversalDef compiler paths](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L2298-L2358)
  accept `reversal.guardflag` as a separate static field.
- Pinned [IKEMEN reversal admission](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L10465-L10493)
  requires guard-flag overlap and rejects an unguardable incoming HitDef.
- Pinned [ModifyReversalDef runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L8350-L8385)
  writes the field onto the already-active target reversal after RedirectID
  resolution.

## Local finding

The local active reversal move has `reversalAttr`, but no separate reversal
guard filter. The incoming move already carries `guardFlag`, direct and helper
combat know whether the attacker is unguardable, and HitOverride already has
guard-flag overlap logic. This cut can share normalized overlap behavior while
keeping `reversal.guardflag.not` separate.

## Candidate contract

Under explicit `ikemen-go`, static ReversalDef and ModifyReversalDef
`reversal.guardflag` support only the local `H`, `L`, `M`, and `A` guard-state
subset. A matching active reversal may counter a guardable incoming move; a
mismatch or unguardable incoming move does not activate it. RedirectID mutates
only the verified active root reversal in place.

## In scope

- ReversalDef activation and root ModifyReversalDef RedirectID.
- Static normalized `H`, `L`, `M`, and `A` values.
- Positive overlap, `M` expansion to high/low, and unguardable rejection.
- Required imported trace plus compiler, reversal, and playable-match coverage.

## Out of scope

`reversal.guardflag.not`, `F`, `D`, `P`, `-`, `+`, dynamic values, Helpers as
RedirectID receivers, teams, source timing, custom-state breadth, renderer
behavior, rollback, score movement, and full MUGEN/IKEMEN parity.

## Result

The active move and runtime reversal metadata now retain static positive
`reversal.guardflag`. ReversalDef activation and root ModifyReversalDef
RedirectID share normalized H/L/M/A overlap. `M` expands to high and low. The
root, clash, projectile, and helper callers pass incoming unguardable state, so
a positive filter rejects that incoming attack as upstream does.

## Verification

- Grouped compiler, reversal, playable-match, trace, and CombatResolver
  coverage passes 5 files / 1049 tests.
- Required
  `synthetic-imported-ikemen-root-modifyreversaldef-guardflag-redirect`
  evidence changes an active receiver from `A` to `H` before high-flag counter
  contact.
- `node --check scripts/qa_traces.cjs` and diff hygiene passed.
- Typecheck, complete Vitest, trace aggregate, build, and boundaries stay
  queued for the next grouped runtime checkpoint.

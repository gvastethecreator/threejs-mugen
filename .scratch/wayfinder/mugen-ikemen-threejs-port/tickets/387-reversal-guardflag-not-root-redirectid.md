# T387 Reversal GuardFlag Not Root RedirectID

Type: task

Status: resolved in `5f4667e1`

Blocked by: None

## Question

Can static `reversal.guardflag.not` on ReversalDef and root
ModifyReversalDef RedirectID block an active reversal for overlapping incoming
guard flags while preserving the upstream unguardable exception?

## Source evidence

- Pinned [IKEMEN-GO compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L2298-L2358)
  parses `reversal.guardflag.not` separately for ReversalDef and
  ModifyReversalDef.
- Pinned [IKEMEN reversal admission](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/char.go#L10481-L10493)
  rejects overlap only while the incoming attack is guardable.
- Pinned [ModifyReversalDef runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L8350-L8385)
  writes the negative filter onto the verified active target reversal.

## Local finding

T386 stores the positive filter on active move and runtime reversal metadata,
normalizes `M` to high and low, and sends incoming unguardable state through
direct, clash, projectile, and helper reversal checks. The same path can add the
negative field without changing positive precedence.

## Candidate contract

Under explicit `ikemen-go`, static ReversalDef and ModifyReversalDef
`reversal.guardflag.not` support the local `H`, `L`, `M`, and `A` subset. An
overlap blocks a guardable incoming move. An unguardable incoming move bypasses
only this negative rejection; a positive filter still rejects it.

## In scope

- ReversalDef activation and root ModifyReversalDef RedirectID.
- Static normalized `H`, `L`, `M`, and `A` values.
- Negative overlap and upstream unguardable exception.
- Required imported trace plus compiler, reversal, and playable-match coverage.

## Out of scope

Positive guard-filter changes beyond T386, wider HitFlag forms, dynamic values,
Helpers as RedirectID receivers, teams, source timing, renderer behavior,
rollback, score movement, and full MUGEN/IKEMEN parity.

## Result

The active move and runtime reversal metadata now retain static
`reversal.guardflag.not`. Reversal admission applies the positive filter first,
then rejects negative overlap only for guardable incoming moves. An unguardable
incoming move bypasses the negative filter exactly as the source condition
requires. Root RedirectID mutation keeps active move identity and contact state.

## Verification

- Grouped compiler, reversal, playable-match, trace, and CombatResolver
  coverage passes 5 files / 1049 tests.
- Required
  `synthetic-imported-ikemen-root-modifyreversaldef-guardflag-not-redirect`
  evidence changes an active receiver from blocking high to nonmatching air
  before high-flag counter contact.
- `node --check scripts/qa_traces.cjs` and diff hygiene passed.
- Typecheck, complete Vitest, trace aggregate, build, and boundaries stay
  queued for the next grouped runtime checkpoint.

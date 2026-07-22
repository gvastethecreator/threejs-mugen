# IKEMEN ModifyHitDef Root Redirect Research

Date: 2026-07-22

## Question

What minimum source-backed behavior can safely unblock a root `ModifyHitDef`
RedirectID slice?

## Answer

IKEMEN compiles `redirectid` before the shared HitDef parameter set. At run
time it resolves that id in caller context, rejects an unavailable target, and
then rejects targets without a normal active HitDef or with an active reversal.
It applies each supplied HitDef parameter to the existing target HitDef rather
than activating a new one. The local cut can therefore start with one static
`damage` pair, root-to-root selection, and explicit no-reset ownership.

## Sources

- [Compiler: ModifyHitDef](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L2286-L2294)
- [Runtime: ModifyHitDef](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L8323-L8347)
- [Runtime: Redirect resolver](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L4843-L4858)

## Findings

- The source checks target HitDef identity before any parameter mutation.
- The source skips `redirectid` during shared HitDef parameter application.
- Source parameter expressions run in caller context while the receiver owns
  the existing HitDef state.
- The source has a TODO beside the active-normal eligibility check, so the
  local claim must name that behavior as bounded source behavior rather than
  broad parity.

## Uncertainty

The source shares the full HitDef parameter decoder. This cut does not claim
dynamic expressions, omitted/default edge behavior for all fields, Helpers,
custom states, projectile ownership, scheduler timing, or full parity.

## Implemented Decision

Add a dedicated mutation boundary that preserves receiver move/contact state,
then prove a redirected static damage mutation reaches one direct contact.

## Implementation Result

`86cf7040` implements the bounded path: static `damage` or `damage,guardDamage`
only, caller-evaluated RedirectID, and one verified root receiver with an
already-active normal HitDef. The receiver's move object and contact memory stay
in place. The implementation blocks malformed, dynamic, unsupported, inactive,
reversal, and unknown routes without mutation.

Focused compiler, dispatch, imported-match, and trace coverage passed 7 files /
1054 tests. The required trace proves the receiver lands its modified HitDef on
the caller. The grouped TypeScript, full-suite, trace, build, and boundary
checkpoint remains pending by plan.

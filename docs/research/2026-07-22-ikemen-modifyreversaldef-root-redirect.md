# IKEMEN ModifyReversalDef Root Redirect Research

Date: 2026-07-22

## Question

What minimum source-backed behavior can safely unblock a root
`ModifyReversalDef` RedirectID slice?

## Answer

IKEMEN compiles `redirectid`, its reversal-specific attr/guard fields, then
the shared HitDef parameter set. At run time it resolves that id in caller
context, rejects an unavailable target, and rejects a target without a reversal
attr. It then changes supplied fields on the existing target HitDef rather than
activating a new reversal. The local cut can start with one static
`reversal.attr`, root-to-root selection, and explicit no-reset ownership.

## Sources

- [Compiler: ModifyReversalDef](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L2331-L2359)
- [Runtime: ModifyReversalDef](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L8350-L8385)
- [Runtime: Redirect resolver](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L4843-L4858)

## Findings

- The source evaluates RedirectID with caller context before it obtains the
  target pointer.
- The source checks existing reversal attr before any mutation.
- `reversal.attr`, `reversal.guardflag`, and `reversal.guardflag.not` have
  separate controller ids; remaining fields reuse the HitDef decoder.
- The source skips `redirectid` during field mutation.
- The source carries a TODO beside its active-reversal guard. The local claim
  must name this as a bounded source behavior, not broad parity.

## Uncertainty

The source exposes shared HitDef mutation, guard fields, and expression
evaluation. This cut does not claim those paths, unredirected behavior,
Helpers, custom states, projectile ownership, scheduler timing, hitpause, or
full parity.

## Implemented Decision

Add a dedicated reversal-mutation boundary that preserves receiver move and
contact state, then prove a redirected static attr mutation changes one
receiver-owned counter contact.

## Implementation Result

`0f30280e` implements the bounded path: static `reversal.attr` only,
caller-evaluated RedirectID, and one verified root receiver with an
already-active reversal. The receiver's move object and reversal state stay in
place. Malformed, unsupported, inactive, and unknown routes leave it unchanged.

Focused compiler, reversal dispatch, imported-match, and trace coverage passed
7 files / 1050 tests. The required trace proves the receiver counters the
caller only after the redirected attr mutation. The grouped TypeScript,
full-suite, trace, build, and boundary checkpoint remains pending by plan.

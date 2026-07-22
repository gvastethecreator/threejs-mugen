# T380 Root HitDef RedirectID

Type: task

Status: resolved

Blocked by: None

## Question

Can one root author a bounded `HitDef` through `RedirectID` so a verified
IKEMEN root owns the resulting active HitDef without claiming the full dynamic
HitDef parameter surface?

## Source evidence

- Pinned [IKEMEN-GO compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L2275-L2283)
  accepts `redirectid` before compiling the shared HitDef parameters.
- Pinned [IKEMEN-GO redirect resolver](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L4843-L4858)
  evaluates the player id in caller context and rejects an unavailable root.
- Pinned [IKEMEN-GO HitDef runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L7929-L7947)
  resets the resolved receiver HitDef and evaluates the source controller
  parameters from the caller.

## Local finding

The typed `HitDefControllerOp` discarded `redirectid`, and the root side-effect
hook always dispatched using the caller frame, constants, source defaults, and
active move. The imported trace factory had no required proof that a receiver
current Clsn1 could become the active direct attack.

## Quality contract

Under explicit `ikemen-go`, one static root `HitDef` payload can resolve a
verified root from a caller-evaluated RedirectID expression. The receiver owns
the activated HitDef, its frame and constants, and receiver telemetry. A
malformed expression is rejected during compilation and an unknown receiver
blocks before target mutation.

## In scope

- Root-to-root active-controller `HitDef RedirectID`.
- Caller-evaluated static and variable-backed RedirectID expressions.
- Receiver-owned static HitDef activation with its current Clsn1.
- Required imported contact trace and unknown-receiver fail-closed coverage.

## Result

Resolved in `fb470c82`. Compilation preserves a valid `redirectid` expression
on the typed HitDef operation. The root HitDef side-effect route resolves one
IKEMEN receiver before dispatching, uses receiver source defaults, constants,
and current collision frame, while preserving caller context for source sound
parameters. The required trace records a receiver-owned HitDef contact against
the caller; the direct runtime test proves `var(0)` target selection and the
unknown-receiver path leaves the target unchanged. Focused compiler, runtime,
and trace coverage passes 3 files / 996 tests. Broad typecheck, complete
Vitest, trace aggregate, build, and boundary gates remain queued for the next
runtime checkpoint.

## Out of scope

Dynamic HitDef payload fields, ModifyHitDef, Helpers, custom states, teams,
source-exact reset/finalization timing, hitpause scheduling, target memory
ordering, rollback, renderer behavior, score movement, and full
MUGEN/IKEMEN parity.

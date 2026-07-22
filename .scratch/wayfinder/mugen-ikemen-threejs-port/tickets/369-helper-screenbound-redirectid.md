# T369 Helper ScreenBound state and RedirectID

Type: task

Status: resolved

Blocked by: None

## Question

Can current first-generation Helpers execute ScreenBound with one-frame
screen/stage-bound state and a verified RedirectID destination while retaining
the port's current X/Z clamp model?

## Source evidence

The pinned Ikemen-GO compiler accepts value, movecamera, stagebound, and
redirectid for ScreenBound. Its runtime resolves the destination first,
evaluates every value in the caller, and sets screen, camera, and stage flags
on the destination character. MUGEN documents the screen-bound boolean and
camera parameters; the port keeps the current stage projection as a bounded
substitute for complete camera behavior.

- [MUGEN 1.1 ScreenBound reference](https://www.elecbyte.com/mugendocs/sctrls.html#screenbound)
- [Ikemen-GO ScreenBound compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler_functions.go#L3269-L3305)
- [Ikemen-GO ScreenBound runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L10159-L10205)

## Local finding

The generic controller dispatcher already compiles and executes root
ScreenBound with dynamic operation telemetry. Helpers reject the controller
before that dispatcher, have no copied screen/stage-bound runtime state, and
therefore cannot change the existing Helper depth or Width-edge projection.
The Helper redirect materializer handles resources and TransformClsn but not
the typed bounds operation.

## Quality contract

Artifact and user outcome: an eligible current Helper can set current
ScreenBound state locally or on a verified redirected target, reset it next
frame, and feed the existing current X/Z clamp logic without mutating another
actor.

Mission mode: change.

In scope: first-generation Helper static/dynamic ScreenBound value,
movecamera, and stagebound; per-frame reset; Helper runtime/snapshot writeback;
current stage X/Z projection; verified RedirectID caller evaluation and
resource lease/writeback; focused proof.

Out of scope: camera tracking or rendering, PosFreeze, exact screen/stage
separation, source CharList order, nested Helpers, broad redirect recursion,
pause/hitpause parity, renderer proof, upstream differentials, rollback,
score movement, and full MUGEN/IKEMEN parity.

## Evidence target

- Focused Helper state coverage for local dynamic ScreenBound, current X/Z
  bounds, snapshot state, and reset.
- Focused Helper RedirectID coverage for caller values and destination
  writeback.
- Imported Helper-to-root route proving controller and operation telemetry.
- Batch focused tests, TypeScript, traces, build, boundary guards, and diff
  hygiene after the implementation round.

## Result

Commit 0f420d44 adds one-frame ScreenBound and StageBound state to
first-generation Helpers. Helper dispatch now materializes the typed bounds
operation before the verified redirect lease writes the destination state.
Current local and redirected routes preserve caller expression values,
snapshots, and fail-closed RedirectID resolution. Explicit ScreenBound true
uses the existing X/Z projection; camera flags remain retained state only.
Commit ac8283dc also makes that projection accept a partial Helper stage
coordinate contract.

## Verification

Focused compiler, constraint, Helper, and imported match coverage passes 4
files and 411 tests, including local dynamic state, next-frame reset,
stagebound-off depth behavior, destination writeback, and invalid RedirectID
rejection. The broader batch passes 241 files and 2661 tests, TypeScript 7,
636 trace artifacts (602 required and 34 optional), both boundary guards,
diff hygiene, and a 329-module production build. Browser smoke is N/A for
this runtime-only batch.

Camera tracking, PosFreeze, exact source screen/stage separation, source
scheduler order, nested ownership, renderer proof, upstream differentials,
score movement, and full parity remain blocked.

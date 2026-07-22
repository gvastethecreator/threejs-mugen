# Global report: T373 Root ScreenBound RedirectID

Date: 2026-07-22

## Scope

T373 closes one narrow IKEMEN root-to-root ScreenBound RedirectID gap. It does
not raise compatibility scores or claim broad MUGEN or IKEMEN parity.

## Delivered

- Commit `9ff8cf90` materializes dynamic ScreenBound `value`, `movecamera`, and
  `stagebound` in the controller caller before destination dispatch.
- The existing root constraint queue now delays a write to a root that advances
  later until its one-frame bounds reset has completed.
- Imported runtime and required trace coverage prove destination screen/camera
  state and typed `bounds:screenbound` telemetry.

## Evidence

- Focused batch: `5/5` files and `1036/1036` tests pass.
- `git diff --check` passed before the feature commit.
- The required trace fixture is registered, but the broad `qa:trace` aggregate
  remains deferred with TypeScript, full Vitest, build, and boundary checks for
  the next grouped runtime checkpoint.

## Sources

- [MUGEN 1.1 ScreenBound reference](https://www.elecbyte.com/mugendocs/sctrls.html#screenbound)
- Pinned [IKEMEN-GO compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L3275-L3308)
- Pinned [IKEMEN-GO runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L10186-L10224)

## Remaining limits

Helper scheduling breadth, exact screen/stage and camera behavior, CharList
ordering, hitpause/reset parity, nested ownership, rendering, upstream
differentials, rollback/netplay, and full parity remain outside this slice.

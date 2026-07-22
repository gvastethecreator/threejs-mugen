# Global report: T374-T375 root RedirectID

Date: 2026-07-22

## Scope

T374 and T375 close narrow IKEMEN root-to-root RedirectID gaps for PosFreeze
and TransformClsn. They do not raise compatibility scores or claim broad MUGEN
or IKEMEN parity.

## Delivered

- Commit `0dfac1ff` materializes dynamic PosFreeze `value` in the caller,
  including the port's local Z policy, before verified root target dispatch.
- The existing later-root queue and captured-position hook retain the incoming
  PosFreeze policy through reset.
- The same commit materializes dynamic TransformClsn scale/angle in the caller
  and defers a later root until collision-transform reset completes.
- Required trace artifacts prove typed destination bounds/collision-transform
  telemetry and destination frame state for both routes.

## Evidence

- Focused batch: `5/5` files and `1041/1041` tests pass.
- `git diff --check` passed before the feature commit.
- Broad TypeScript, full Vitest, `qa:trace`, build, and boundary checks remain
  deliberately deferred with the larger runtime checkpoint.

## Sources

- [MUGEN 1.0 PosFreeze reference](https://www.elecbyte.com/mugendocs/sctrls.html#posfreeze)
- Pinned [IKEMEN-GO PosFreeze compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L3311-L3328)
- Pinned [IKEMEN-GO PosFreeze runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L10227-L10250)
- Pinned [IKEMEN-GO TransformClsn compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L6724-L6749)
- Pinned [IKEMEN-GO TransformClsn runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L14885-L14913)

## Remaining limits

Exact corner-push/collision geometry, source scheduling, Helpers, nested
ownership, hitpause/reset parity, renderer output, rollback, upstream
differentials, and full parity remain outside this slice.

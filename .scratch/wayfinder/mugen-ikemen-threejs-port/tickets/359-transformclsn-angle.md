# T359 TransformClsn angle

Status: resolved at bounded per-tick rotated collision scope

Feature commit: `38fb0f0a`

## Source evidence

The pinned local Ikemen-GO checkout and the official revision show that
`TransformClsn` accepts `angle`, adds it to the active character collision
angle, resets that state at the tick boundary, and sends the angle into
rotated Clsn1/Clsn2 intersection. Size boxes force angle `0` and keep their
local scale path.

Official sources:

- [Ikemen-GO `TransformClsn` compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler_functions.go#L6704-L6726)
- [Ikemen-GO `TransformClsn` bytecode execution](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L14690-L14718)
- [Ikemen-GO collision-box selection and size-box exception](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10236-L10285)
- [Ikemen-GO collision transform and rotated intersection dispatch](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L1948-L2008)
- [Ikemen-GO SAT rectangle intersection](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/common.go#L286-L340)

## Delivered

- Extended the typed `collision-transform` operation and compiler boundary to
  carry static or expression-backed `angle` values alongside optional scale.
- Added per-tick angle state with accumulation, fighter/helper reset, and
  runtime trace exposure.
- Added root collision rotation around the actor origin with facing-aware
  Ikemen sign convention and SAT projection across both rectangle axes.
- Kept size boxes outside the transform path with an explicit runtime marker,
  matching the upstream size-box angle exception.
- Propagated the bounded angle state to direct Helper collision consumers;
  proxy-local angle composition remains outside this cut.
- Added a required synthetic imported trace artifact and actor-frame gate for
  observed `TransformClsn angle` evidence.
- Added focused compiler, executor, collision, size-box, and trace-gate tests.

## Verification

- Focused runtime run: `6` files, `8/8` selected tests passed.
- `pnpm typecheck` passed with the TypeScript 7 toolchain.
- `pnpm build` passed with `328` transformed modules; JS output was
  `2,093.19 kB` before gzip.
- `pnpm check:boundaries` passed.
- `pnpm qa:trace` passed: `636/636` artifacts, `602` required and `34`
  optional; diagnostics report `0` failed and `0` skipped fixtures.
- `git diff --check` passed for the feature write-set.
- Full Vitest remains deferred; the latest full baseline is T356 with
  `240/240` files and `2612/2612` tests.
- Browser smoke remains deferred because this is a runtime collision slice.

## Claim ceiling

This ticket proves bounded per-tick root `TransformClsn angle` state, rotated
root collision intersection, size-box exclusion, direct Helper state, and
required trace evidence. It does not prove proxy-local angle composition,
size-box scaling, exact `animlocalscl` or `localcoord` composition, exact
non-rotated edge-touch behavior, every projectile/helper variant, renderer
parity, upstream differential parity, compatibility-score movement, or full
MUGEN/IKEMEN collision parity.

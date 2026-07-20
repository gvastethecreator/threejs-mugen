# T358 TransformClsn scale

Status: resolved at bounded per-tick collision-scale scope

Feature commit: `edad5bb2`

## Source evidence

The pinned local Ikemen-GO checkout and the official revision show that
`TransformClsn` accepts `scale`, accumulates the multiplier during the active
tick, and applies it to the character collision scale used by Clsn1 and Clsn2.
The compiler accepts an optional second axis value and `redirectid`; angle is a
separate modifier with its own collision-rotation path.

Official sources:

- [Ikemen-GO `TransformClsn` compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler_functions.go#L6704-L6726)
- [Ikemen-GO `TransformClsn` bytecode execution](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L14690-L14718)
- [Ikemen-GO collision-scale update](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L7692-L7713)
- [Ikemen-GO collision checks](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10196-L10285)

## Delivered

- Added a typed `collision-transform` controller operation for static scale
  pairs and a runtime resolver for expression-backed values.
- Added per-tick scale state with accumulation, reset at fighter/helper frame
  advance, and root `redirectid` routing through the existing controller path.
- Applied the multiplier after collision overrides to root Clsn1/Clsn2 boxes,
  including direct combat, root admission, projectile targets, and reversal
  consumers that already use the typed collision accessor.
- Applied the same bounded scale state to Helper collision snapshots, proxy
  geometry, and direct Helper HitDef contact.
- Kept size boxes outside the transform path and reported `angle` as an
  explicit unsupported capability until rotated rectangle intersection exists.
- Added collision-scale fields to runtime trace actor-frame evidence and a
  required synthetic imported `TransformClsn scale` production gate.

## Verification

- Focused runtime tests: `5` files, `96/96` tests passed.
- Isolated TransformClsn production gate: `1/1` test passed.
- `pnpm typecheck` passed with the TypeScript 7 toolchain.
- `pnpm build` passed with `328` transformed modules; JS output was
  `2,091.00 kB` before gzip.
- `pnpm check:boundaries` passed.
- `pnpm qa:trace` passed: `635/635` artifacts, `601` required and `34`
  optional; diagnostics report `0` failed and `0` skipped fixtures.
- `git diff --check` passed for the feature write-set.
- The broader RuntimeTrace preset file passed `715/716` in the combined
  focused run; the one failure was the pre-existing team round handoff test
  exceeding its 5-second test timeout under the large file load. The new
  TransformClsn test passed in isolation.
- Full Vitest and browser smoke remain deferred for this runtime-only block.

## Claim ceiling

This ticket proves bounded per-tick `TransformClsn scale` state and its reach
through the current root and Helper collision consumers. It does not prove
`TransformClsn angle`, rotated rectangle intersection, exact `animlocalscl`
or `localcoord` composition, size-box scaling, every projectile/helper
variant, renderer parity, upstream differential parity, compatibility-score
movement, or complete MUGEN/IKEMEN collision parity.

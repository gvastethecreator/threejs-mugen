# T335 - TargetLifeAdd resource flags

Status: resolved at bounded TargetLifeAdd resource scope
Date: 2026-07-20

## Source evidence

The pinned Ikemen-GO controller reads `dizzy` and `redlife` with a default of
`true`. It applies the selected life delta to each receiver, updates the
receiver kill flag, and derives red-life and dizzy-point changes from the
effective receiver delta. The receiver's last hit attribute selects the
default or super multiplier.

Pinned source:

- `.scratch/external/Ikemen-GO/src/bytecode.go`, revision
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`, `targetLifeAdd.Run`
- `.scratch/external/Ikemen-GO/src/char.go`, revision
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`, `targetLifeAdd`

## Delivered

- `TargetLifeAdd` now compiles `dizzy` and `redlife` with upstream defaults.
- Target execution applies red-life and dizzy-point changes from the actual
  life delta, including explicit healing deltas.
- Receiver constants override the default and super resource multipliers.
- The receiver `GetHitVar(kill)` state records the controller's kill value.
- Existing `NoDizzyPointsDamage` and resource clamps remain in force.
- Root and Helper target dispatches carry the resource constants into the
  target world.

## Verification

- `pnpm exec vitest run src/tests/RuntimeCompiler.test.ts src/tests/TargetSystem.test.ts src/tests/HelperSystem.test.ts src/tests/PlayableMatchRuntime.test.ts --testTimeout=30000`
  passed: 4 files / 390 tests.
- `pnpm typecheck` passed with the TypeScript 7 toolchain.
- `git diff --check` passed; existing CRLF normalization warnings remain in
  unrelated dirty roadmap files.
- No renderer or UI code changed; browser smoke and `qa:smoke` are deferred.

## Claim ceiling

This ticket covers typed `TargetLifeAdd` flags and receiver resource effects.
It does not claim `TargetRedLifeAdd`, `TargetGuardPointsAdd`, or
`TargetDizzyPointsAdd` source parity, winType attribution for those resources,
reversal/reflection, exact multi-target ordering, nested Helper ancestry,
direct screenpack proof, or complete MUGEN/IKEMEN parity.

## Next boundary

Audit `TargetRedLifeAdd`, `TargetGuardPointsAdd`, and `TargetDizzyPointsAdd`
against their receiver guards, absolute-value semantics, and source identity.

## Sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go
- `.scratch/external/Ikemen-GO/src/bytecode.go`
- `.scratch/external/Ikemen-GO/src/char.go`

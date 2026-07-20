# T332 - FightScreen same-root resource RedirectID cause

Status: resolved at bounded same-root resource scope
Date: 2026-07-20

## Source evidence

The pinned Ikemen-GO bytecode evaluates `RedirectID` and resource values on
the caller, then invokes `lifeAdd` or `lifeSet` on the redirected character.
The life-zero win-type branch runs on that destination receiver and only
accepts a player root. A same-root redirect therefore needs both the caller
root and the destination state owner; a cross-root or helper destination must
remain outside this root KO classifier until its source contract is modeled.

Pinned source:

- `.scratch/external/Ikemen-GO/src/bytecode.go`, revision
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`, redirected `LifeAdd` and
  `LifeSet`
- `.scratch/external/Ikemen-GO/src/char.go`, revision
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`, `Char.lifeSet`

## Delivered

- Root active and State -1 `LifeAdd`/`LifeSet` now preserve same-root
  `RedirectID` life-zero causes with the destination state-owner identity.
- Helper redirected resource operations carry the pre-operation life value
  through the existing operation telemetry hook.
- A first-generation Helper resource can classify a root KO only when the
  destination is the caller's root and the Helper belongs to that same root.
- Cross-root and helper-destination resource operations still apply their
  life change but fail closed for suicide attribution.

## Verification

- `pnpm exec vitest run src/tests/PlayableMatchRuntime.test.ts --testTimeout=30000`
  passed: 1 file / 275 tests.
- The wider focal run passed: 3 files / 321 tests.
- `pnpm typecheck` passed with the TypeScript 7 toolchain.
- `git diff --check` passed for the slice.
- No renderer or UI code changed; browser smoke and `qa:smoke` are not part of
  this runtime-only closeout.

## Claim ceiling

This ticket covers same-root root-resource and first-generation Helper-resource
life-zero attribution. It does not claim cross-root resource ownership,
helper-to-helper ownership, `TargetLifeAdd` or other target-resource paths,
reversal/reflection, redlife/guard/dizzy semantics, direct screenpack proof, or
complete MUGEN/IKEMEN result parity.

## Next boundary

Audit `TargetLifeAdd` and related target-resource dispatch separately. Preserve
the fail-closed rule until target memory, redirected actor identity, and source
root ownership have a typed contract.

## Sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go
- `.scratch/external/Ikemen-GO/src/bytecode.go`
- `.scratch/external/Ikemen-GO/src/char.go`

# T336 - TargetRedLifeAdd guards and absolute value

Status: resolved at bounded TargetRedLifeAdd scope
Date: 2026-07-20

## Source evidence

Ikemen-GO resolves `id`, `index`, `absolute`, and `value` on the caller,
then applies `computeDamage(value, false, absolute, 1, caller, true)` to each
selected receiver. The receiver's `NoRedLifeDamage` flag blocks the write.

## Delivered

- The typed operation now carries `absolute`.
- Runtime execution applies receiver defense scaling when `absolute` is off.
- Positive values use the upstream life-bound and non-kill cap before the
  red-life write.
- `NoRedLifeDamage` is parsed from `AssertSpecial` and blocks the controller.

## Verification

- Shared target-resource focal batch: 5 files / 401 tests passed.
- `pnpm typecheck` passed with TypeScript 7.
- No renderer/UI change; visual smoke is deferred.

## Claim ceiling

This covers TargetRedLifeAdd resource behavior. WinType cause attribution,
reversal, exact multi-target order, nested Helper ancestry, direct screenpack
proof, and full MUGEN/IKEMEN parity remain open.

## Sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go

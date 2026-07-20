# T337 - TargetGuardPointsAdd guards and absolute value

Status: resolved at bounded TargetGuardPointsAdd scope
Date: 2026-07-20

## Source evidence

Ikemen-GO reads `absolute` and `value`, computes the receiver-side value with
`computeDamage(value, false, absolute, 1, caller, false)`, and skips receivers
with `NoGuardPointsDamage`.

## Delivered

- The typed operation now carries `absolute` with the source default.
- Runtime execution applies receiver defense scaling when `absolute` is off.
- `NoGuardPointsDamage` is parsed from `AssertSpecial` and blocks the write.

## Verification

- Shared target-resource focal batch: 5 files / 401 tests passed.
- `pnpm typecheck` passed with TypeScript 7.
- No renderer/UI change; visual smoke is deferred.

## Claim ceiling

This covers TargetGuardPointsAdd resource behavior. WinType cause attribution,
reversal, exact multi-target order, nested Helper ancestry, direct screenpack
proof, and full MUGEN/IKEMEN parity remain open.

## Sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go

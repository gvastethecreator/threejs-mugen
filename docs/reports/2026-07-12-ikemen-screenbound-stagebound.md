# IKEMEN ScreenBound stagebound report

## Outcome

`ScreenBound stagebound` now controls logical-Z stage clamp independently from screen and camera flags.

## Supported

- Static `stagebound = 0|1` typed lowering.
- Dynamic expression fallback.
- Omitted parameter preserves an earlier same-frame value.
- Per-frame default/reset to enabled.
- Playable and explicit active-motion Tag roots.
- Existing `value` and `movecamera` behavior remains stable.

## Required evidence

`synthetic-imported-ikemen-screen-stagebound` runs P3 with `PosSet z = 20` and `ScreenBound stagebound = 0` under stage bounds that normally clamp this character to local Z `5`. P3 remains at Z `20`, executes typed `bounds:screenbound`, and cannot contact P4 at Z `-5`.

The required artifact passed with checksum `f709d58c` and final checksum `e28ba92f`.

After depth player-push promotion, current checksum is `ea905cc9` and final checksum is `0efa02b0`; P3 still remains at Z `20` and produces no contact.

## Verification

- `pnpm test`: 180 files / 1873 tests passed.
- `pnpm typecheck`: TypeScript 7 passed.
- `pnpm build`: passed; the existing chunk-size advisory remains.
- `pnpm qa:boundaries`: passed.
- `pnpm qa:trace`: 560/560 artifacts passed, 529 required and 31 optional.

## Honest boundary

Exact X stage/screen separation, `redirectid`, helpers, hitpause persistence/reset, visual depth projection, and full MUGEN/IKEMEN parity remain blocked claims.

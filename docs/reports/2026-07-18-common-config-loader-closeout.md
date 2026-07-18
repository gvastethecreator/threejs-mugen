# Common Config Loader Closeout

- Date: 2026-07-18
- Scope: T252 Common.Cmd, T253 Common.Const, T254 Common.Air
- Feature commits: `991613f7`, `e765822a`, `9fed3eda`
- Planning/documentation commit: `0ac95dca`
- Decisions: ADR 0019, ADR 0020, ADR 0021

## Result

The imported loader now consumes three source-backed IKEMEN common-data lanes:

- `Common.Cmd*`: character and common `.cmd` text share one parser boundary;
  common-only command packages are visible to the command model and
  compatibility report.
- `Common.Const*`: common INI constants seed the map before character CNS
  constants, so character values override duplicate defaults.
- `Common.Air*`: common `.air` actions fill missing IDs while character AIR
  and earlier common sources retain precedence.

All three lanes use ordered numeric config keys, root/config-relative virtual
path resolution, explicit missing-file diagnostics, and bounded unsupported
evidence for ZSS or wrong-format sources where applicable.

## Verification

- Focused loader/config suite: 4 files, `31/31` tests passed.
- `pnpm typecheck`: passed.
- `pnpm build`: passed; existing Vite large JavaScript chunk warning remains.
- `pnpm check:boundaries`: passed.
- `pnpm check:redirect-boundary`: passed.
- `git diff --check`: passed for the implementation and closeout patch.
- The trace runner logged that WebSocket port `24678` was already in use by an
  existing Node process, but its final JSON status was `passed` and all
  `633/633` artifacts completed successfully; no trace assertion failure was
  observed.

## Claim allowed

The loader has deterministic bounded CommonCmd, CommonConst, and CommonAir
source integration with tests for ordering, precedence, common-only packages,
path fallback, and explicit unsupported/missing evidence.

## Claim blocked

CommonFx, complete Common1/default-table behavior, ZSS/Lua, raw IKEMEN
InputBuffer internals, AI command generation, SOCD, rollback/netplay, broader
runtime ownership, visual/audio parity, and full MUGEN/IKEMEN parity remain
open. No compatibility score increase is inferred from this loader-only cut.

## Next source-backed frontier

CommonFx is the next bounded system-assets lane: resolve ordered `[Common]
Fx*` DEF packages, preserve prefix ownership, and feed them through the
existing FightFX library contract before considering ZSS/Lua.

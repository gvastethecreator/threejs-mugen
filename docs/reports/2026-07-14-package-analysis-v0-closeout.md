# PackageAnalysis/v0 closeout

Date: 2026-07-14

## Result

Bounded I1 package analysis is implemented and closed at the scanner/reporting
ceiling. `PackageAnalysis/v0` consumes the existing `VirtualFileSystem` and
produces deterministic, checksum-protected findings for character, stage,
system, and screenpack inputs. Findings preserve source path/line, dependency,
MUGEN profile/version metadata, and one of `recognized`, `unsupported`, or
`unknown`.

## Evidence

- `pnpm vitest run src/tests/PackageAnalysis.test.ts`: 1 file / 4 tests pass.
- Related parser/scanner/report gate: 6 files / 25 tests pass.
- `pnpm typecheck`: pass on TypeScript 7.0.2.
- `pnpm build`: pass, 290 modules; the existing large JavaScript chunk advisory
  remains.
- `pnpm check:boundaries`: pass.
- `pnpm qa:css:budget`: pass at the existing budget.
- The generated `.scratch/qa/trace-gates/diagnostics.json` records 600/600
  trace artifacts, 566 required, 34 optional, 0 failed, and 0 skipped.
- Mixed, stage-only, and system-only fixtures use the same VFS report path;
  checksum tampering is rejected.

The full repository suite was attempted after the accumulated gates, but its
wrapper did not surface a completion result inside the session timeout. It is
not counted as green for this closeout; the new code has focal and adjacent
coverage plus successful typecheck/build evidence.

No browser gate was required for this slice because it changes no UI or
runtime-render path. The pre-existing global smoke boundary remains the
MUGEN-lite imported attack-frame route before Studio.

## Claim ceiling

Allowed: bounded source-located package analysis and report-only IKEMEN
recognition through `ikemen-go-scan`.

Blocked: ZSS/Lua execution, full screenpack or motif parity, license
validation, runtime compatibility credit from scanning, rollback/netplay, and
full package runtime parity.

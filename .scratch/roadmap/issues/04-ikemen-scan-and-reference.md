# 04 - IKEMEN Scan And Reference

Status: ready-for-agent
Labels: ikemen-scan, docs, ready-for-agent

## Objective

Use Ikemen-GO as a reference source for compatibility planning while keeping near-term support to scanner/reporting unless a bounded runtime feature is explicitly gated.

## Next Useful Cuts

- Current queue label in `docs/ROADMAP_EXECUTION_BOARD.md`: I1 IKEMEN reference expansion.
- Keep full IKEMEN-GO-class port score separate from MUGEN MVP score in `docs/PORT_COMPLETION_SCORECARD.md`.
- Expand scanner signals for ZSS, Lua hooks, screenpacks, select/system files, model stages, and IKEMEN-only controllers/triggers.
- Current completed cut: scanner-only recognition now includes character `fightfx.prefix` metadata, source-mapped to the local Ikemen-GO `char.go` parser path and backed by `IkemenFeatureScanner.test.ts`. It remains recognized/unsupported and is not executed.
- Latest completed cut: scanner-only recognition now includes ZSS `[Statedef ...]` / `[State ...]` code blocks plus the IKEMEN text lifecycle controller `ModifyText`, backed by `IkemenFeatureScanner.test.ts`. These remain recognized/unsupported and are not executed.
- Current completed cut: scanner-only recognition now includes the IKEMEN text lifecycle controller `RemoveText` and text-count trigger `NumText`, sourced from the local Ikemen-GO compiler/bytecode snapshot and backed by `IkemenFeatureScanner.test.ts`. These remain recognized/unsupported and are not executed.
- Previous completed cut: scanner-only recognition now includes IKEMEN-GO data ZSS presentation/system controllers `LifeBarAction`, `GameMakeAnim`, `Text`, and `RedLifeSet`, backed by `IkemenFeatureScanner.test.ts`. These remain recognized/unsupported and are not executed.
- Link adopted behavior to source/documentation notes before implementing runtime semantics.
- Keep IKEMEN-only findings in compatibility reports as recognized/unsupported unless executed by a real gate.
- Prefer scanner/report tests before runtime work. Runtime execution requires a new explicit issue and trace gate.

## Acceptance

- Scanner tests prove each new signal.
- Docs distinguish MUGEN 1.0, MUGEN 1.1, IKEMEN scan-only, and future IKEMEN runtime work.
- `docs/IKEMEN_GO_REFERENCE.md`, `docs/COMPATIBILITY_PROFILES.md`, and `docs/SUPPORTED_FEATURES.md` stay aligned.

## Blocked Claims

- ZSS execution.
- Lua execution.
- Rollback/netplay.
- IKEMEN screenpack/lifebar parity.
- IKEMEN-specific runtime semantics without trace evidence.

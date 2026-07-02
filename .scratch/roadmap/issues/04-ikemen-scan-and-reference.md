# 04 - IKEMEN Scan And Reference

Status: ready-for-agent
Labels: ikemen-scan, docs, ready-for-agent

## Objective

Use Ikemen-GO as a reference source for compatibility planning while keeping near-term support to scanner/reporting unless a bounded runtime feature is explicitly gated.

## Next Useful Cuts

- Current queue label in `docs/ROADMAP_EXECUTION_BOARD.md`: I1 IKEMEN reference expansion.
- Keep full IKEMEN-GO-class port score separate from MUGEN MVP score in `docs/PORT_COMPLETION_SCORECARD.md`.
- Expand scanner signals for ZSS, Lua hooks, screenpacks, select/system files, model stages, and IKEMEN-only controllers/triggers.
- Current completed follow-up: character `fightfx.prefix` metadata is source-mapped to the local Ikemen-GO `char.go` parser path, recognized by `IkemenFeatureScanner.test.ts`, and now has bounded runtime metadata handoff into F-prefixed FightFX hit-spark trace events through `synthetic-imported-hitdef-fightfx-spark.json` plus F-prefixed hit-sound telemetry through `synthetic-imported-hitdef-hit-effect-package.json`. Character `[Files] fx = ...` packages can also load IKEMEN-style FightFX DEF `[Info] prefix` AIR/SFF/SND assets and be selected by matching `fightfx.prefix` for runtime `F` spark frames and prefixed sound lookup. Exact `sys.ffx` cache/refcount lifetime, channel fallback, visual/audio parity, and full character-specific FightFX routing remain unsupported.
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

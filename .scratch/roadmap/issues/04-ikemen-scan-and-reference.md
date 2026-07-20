# 04 - IKEMEN Scan And Reference

Status: closed-bounded
Labels: ikemen-scan, docs, ready-for-agent

## Objective

Use Ikemen-GO as a reference source for compatibility planning while keeping near-term support to scanner/reporting unless a bounded runtime feature is explicitly gated.

## 2026-07-18 Post-Wayfinder-256 source and reanalysis override

PackageAnalysis/v1 and productive Studio/export consumers are closed. Keep
`05b7d98...` normative, but stop calling local `044da720...` pinned: the cache
does not contain the normative object and has untracked files. First create a
validated source-authority manifest and classify relevant semantic deltas.
Then persist deterministic reanalysis/diff for source, ruleset, and upstream
changes. Common ZSS/Lua/Modules remain located scanner findings, not runtime
support. See
`docs/research/2026-07-18-daily-roadmap-architecture-audit-post-wayfinder-256.md`.

## Historical 2026-07-16 Post-Wayfinder-229 source and reanalysis override

PackageAnalysis/v1 and its persisted/exported character, stage, system, and
screenpack consumer are closed. Keep `05b7d98...` normative and do not assign
another v1/first-consumer task. Next make analyzer/ruleset/upstream authority a
validated manifest, then support deterministic reanalysis and semantic diff
when source or rules drift. Independent fixtures must keep unknown/malformed
findings visible. Scanner evidence earns no runtime, render, ZSS, or Lua credit.
See `docs/research/2026-07-16-daily-roadmap-architecture-audit-post-wayfinder-229.md`.

## Historical 2026-07-16 Source and consumer override

Keep `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703` as the normative source pin.
The local shallow `044da720...` checkout is a non-normative cache 46 commits
behind, not a reason to downgrade the pin. Build PackageAnalysis/v1 with
source/semantic digests, analyzer/ruleset/upstream identity, nested fail-closed
validation and targetable locations; then prove a productive VFS/Studio
consumer for character, stage, system, and screenpack. Scanner recognition
earns no runtime credit. See
`docs/research/2026-07-16-daily-roadmap-architecture-audit-post-wayfinder-209.md`.

## Historical 2026-07-15 Post-Entry-554 Daily Audit Override

PackageAnalysis/v0 still has no production consumer and hashes observation time
inside its payload checksum. Build v1 with semantic/source digests, analyzer and
ruleset identity, selected upstream revision, nested fail-closed validation,
freshness, and targetable source locations; then add one Studio Build/Evidence
Adapter. The issue 07 declared source pin and current shallow local Ikemen
snapshot disagree, so reconcile that pin before new normative runtime/scanner
claims. Recognition remains scanner-only. See
docs/research/2026-07-15-daily-roadmap-architecture-audit-post-entry-554.md.

## Historical 2026-07-15 Daily Audit Override

PackageAnalysis/v0 is closed-bounded but has no production consumer. The next
I1 gate is PackageAnalysis/v1 plus a Studio Evidence/Build adapter: add source
SHA-256, analyzer/ruleset/pinned-upstream identity, a semantic digest independent
of observation time, nested fail-closed validation, and targetable source
locations. This remains static analysis and earns no runtime compatibility
credit. ZSS/Lua execution, model stages, screenpack runtime, rollback, netplay,
and full IKEMEN parity remain blocked. See
`docs/research/2026-07-15-daily-roadmap-architecture-audit-entry-549.md`.

## Next Useful Cuts

- 2026-07-14 closeout: `PackageAnalysis/v0` now provides a versioned VFS/package scanner entry shared by character, stage, system and screenpack inputs. Findings carry source location, dependency, MUGEN profile/version or `ikemen-go-scan` metadata, and recognized/unsupported/unknown status. Mixed, stage-only, and system-only fixtures pass through the same contract; runtime claims remain unchanged.
- Current queue label in `docs/ROADMAP_EXECUTION_BOARD.md`: I1 IKEMEN reference expansion.
- Keep full IKEMEN-GO-class port score separate from MUGEN MVP score in `docs/PORT_COMPLETION_SCORECARD.md`.
- Expand scanner signals for ZSS, Lua hooks, screenpacks, select/system files, model stages, and IKEMEN-only controllers/triggers.
- Current completed follow-up: character `fightfx.prefix` metadata is source-mapped to the local Ikemen-GO `char.go` parser path, recognized by `IkemenFeatureScanner.test.ts`, and now has bounded runtime metadata handoff into F-prefixed FightFX hit-spark trace events through `synthetic-imported-hitdef-fightfx-spark.json` plus F-prefixed hit-sound telemetry through `synthetic-imported-hitdef-hit-effect-package.json`. Character `[Files] fx = ...` packages can also load IKEMEN-style FightFX DEF `[Info] prefix` AIR/SFF/SND assets and be selected by matching `fightfx.prefix` for runtime `F` spark frames and prefixed sound lookup. Exact `sys.ffx` cache/refcount lifetime, channel fallback, visual/audio parity, and full character-specific FightFX routing remain unsupported.
- Latest completed cut: scanner-only recognition now includes ZSS `[Statedef ...]` / `[State ...]` code blocks plus the IKEMEN text lifecycle controller `ModifyText`, backed by `IkemenFeatureScanner.test.ts`. These remain recognized/unsupported and are not executed.
- Current completed cut: scanner-only recognition now includes the IKEMEN text lifecycle controller `RemoveText` and text-count trigger `NumText`, sourced from the local Ikemen-GO compiler/bytecode snapshot and backed by `IkemenFeatureScanner.test.ts`. These remain recognized/unsupported and are not executed.
- Current completed cut: scanner-only recognition now includes IKEMEN stage/BGDef presentation signals `scenenumber`, `modeloffset`, `modelrotate`, `modelscale`, and video background layers, sourced from the local Ikemen-GO `bgdef.go` / `stage.go` snapshot and backed by `IkemenFeatureScanner.test.ts`. These remain recognized/unsupported and are not rendered or decoded.
- Previous completed cut: scanner-only recognition now includes IKEMEN-GO data ZSS presentation/system controllers `LifeBarAction`, `GameMakeAnim`, `Text`, and `RedLifeSet`, backed by `IkemenFeatureScanner.test.ts`. These remain recognized/unsupported and are not executed.
- Link adopted behavior to source/documentation notes before implementing runtime semantics.
- Keep IKEMEN-only findings in compatibility reports as recognized/unsupported unless executed by a real gate.
- Prefer scanner/report tests before runtime work. Runtime execution requires a new explicit issue and trace gate.

## Acceptance

- Scanner tests prove each new signal.
- Stage-only and system/screenpack-only package fixtures enter through the same VFS/package scanner contract and report source location, dependency, and pinned upstream profile/version.
- `PackageAnalysis/v0` is implemented in `src/mugen/compatibility/PackageAnalysis.ts`; its deterministic snapshot parser rejects checksum drift.
- Docs distinguish MUGEN 1.0, MUGEN 1.1, IKEMEN scan-only, and future IKEMEN runtime work.
- `docs/IKEMEN_GO_REFERENCE.md`, `docs/COMPATIBILITY_PROFILES.md`, and `docs/SUPPORTED_FEATURES.md` stay aligned.

## Blocked Claims

- ZSS execution.
- Lua execution.
- Rollback/netplay.
- IKEMEN screenpack/lifebar parity.
- Full package runtime compatibility beyond the bounded parser/scanner report.
- IKEMEN-specific runtime semantics without trace evidence.

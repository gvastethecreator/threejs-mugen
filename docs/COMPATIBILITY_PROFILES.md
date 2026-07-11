# Compatibility Profiles

This document defines the compatibility profiles used by the sandbox. It is a claim-control contract: a feature can parse, scan, compile, execute partially, or match parity, but those are different claims.

The current operating sentence is:

```txt
Partial MUGEN 1.1 fixture-backed runtime, native generated roster, IKEMEN scanner/reporting plus explicitly gated runtime slices.
```

## Profiles

| Profile | Purpose | Current Level | Runtime Claim |
| --- | --- | --- | --- |
| `native-runtime` | Authored/generated fighters and stages built for this sandbox. | Playable baseline. | Playable through local atlas/runtime data. |
| `mugen-1.0` | Legacy MUGEN 1.0 character/stage content. | Loader/parser/scanner plus partial SFF v1 and CMD/CNS runtime routes. | Partial only when a trace proves execution. |
| `mugen-1.1` | Elecbyte MUGEN 1.1 content such as official KFM/KFM720. | Primary imported fixture target. | Partial KFM/Common1 fixture-backed runtime. |
| `ikemen-go-scan` | IKEMEN-GO content classification. | Scanner/reporting only. | No execution claim. |
| `ikemen-go` | Explicit IKEMEN-GO runtime policy selection. | Executed Partial for named, source-backed slices only. | Root/helper RunOrder, same-tick appended helpers, and bounded simultaneous Pause buffers; no general IKEMEN content execution claim. |
| `ikemen-go-exec-later` | Future IKEMEN-specific execution target. | Blocked. | No ZSS, Lua, rollback, netplay, model-stage, or IKEMEN-only runtime claim yet. |
| `shared-module-later` | Future non-fighting modules such as platformer. | Blocked by fighting contracts. | No generic engine claim until one non-fighting slice runs. |

## Support Levels

Use the acceptance levels from `QA_AND_ACCEPTANCE_GATES.md` for every profile:

```txt
Parsed
Decoded
Recognized
Compiled
Executed Partial
Executed Parity
Unsupported
Unknown
```

Do not use `supported` without naming the level.

Examples:

- `SFF v2 LZ5 decoded for KFM sprites` is a decoded asset claim.
- `HitDef compiled into typed operation evidence` is a compiler/runtime-plumbing claim.
- `KFM state 200 routes and hits in kfm-official-x.json` is an executed-partial fixture claim.
- `ZSS recognized as IKEMEN-only unsupported` is a scanner claim.

## Profile Rules

### Native Runtime

Native/generated fighters are allowed to be playable without proving MUGEN compatibility. They prove:

- atlas manifest ingestion
- authored action maps
- authored collision boxes
- runtime controls and combat
- Three.js rendering from snapshots
- asset provenance and QA

They never prove imported MUGEN compatibility.

### MUGEN 1.0

MUGEN 1.0 claims should focus on:

- DEF, AIR, CMD, CNS/ST parsing
- SFF v1/PCX decoding
- ACT palette handling where available
- SND parsing/diagnostics
- basic State -1 command routing
- simple controller execution when traces exist

Do not use MUGEN 1.0 parser success to claim MUGEN 1.1 or IKEMEN runtime behavior.

### MUGEN 1.1

MUGEN 1.1 is the main imported runtime target for the near-term MVP.

Current fixture claim shape:

```txt
Official KFM/KFM720 can load and inspect. Selected CMD/CNS/Common1 routes execute partially when optional fixture trace artifacts pass.
```

A MUGEN 1.1 runtime claim must name:

- fixture
- trace artifact
- routed command/state
- executed states/controllers/typed operations
- final actor constraints
- remaining partial/unsupported gaps

### IKEMEN-GO

IKEMEN-GO is currently a reference and scanner target.

Current report contract:

- `CompatibilityReport.profiles.primary` names the primary claim profile.
- `CompatibilityReport.profiles.active` lists active profiles for the loaded package.
- `CompatibilityReport.profiles.ikemen` carries the `ikemen-go-scan` findings, feature counts, claim-allowed wording, and blocked-claim wording.
- Studio Evidence exposes the same scanner result as `compat:ikemen-scan` when findings exist.

The scanner should recognize and report:

- ZSS files and references
- ZSS `[Statedef ...]` / `[State ...]` code blocks and controller syntax
- IKEMEN-GO ZSS presentation/system controllers such as `LifeBarAction`, `GameMakeAnim`, `Text`, `ModifyText`, `RemoveText`, and `RedLifeSet`, plus text-system triggers such as `NumText`
- Lua/script hooks, including `hook.*` registration/execution calls
- IKEMEN-only config files
- screenpack/select signals such as `unlock` and `commandlist`
- character-specific `fightfx.prefix` metadata
- extended triggers/controllers and selected `AssertSpecial` flags
- extended stage/system/motif features, including named 3D/Z stage params, model-stage assets, IKEMEN BGDef model transform metadata, and video background layers
- profile-specific constants and params

`fightfx.prefix` is now a narrow exception with bounded runtime evidence: imported DEF raw metadata can flow into F-prefixed FightFX hit-spark and hit-sound trace events, and `[Files] fx = ...` packages with matching FightFX `[Info] prefix` can be loaded/selected for runtime spark frames plus prefixed SND lookup. Exact IKEMEN `sys.ffx` lifetime/refcount/cache semantics, channel fallback, screenpack ownership, visual/audio timing/layering/scale/palette/mixing, and broader IKEMEN-only behavior remain unsupported unless a runtime gate proves a bounded subset.

Until execution gates exist, IKEMEN-only features must be labeled `Recognized` plus `Unsupported`, not `Executed Partial`.

### Shared Modules

Future modules may share:

- project manifest contracts
- asset records
- input action maps
- deterministic tick loop shape
- snapshots
- render/audio adapters
- debug/evidence/build records

They must not inherit:

- CNS
- HitDef
- round logic
- helper/target ownership
- MUGEN command routing
- Common1 state assumptions

## Compatibility Claim Ledger

Every public label in docs, UI, QA summaries, and exported reports should map to one of these rows. Use the wording in `Allowed Wording` or something narrower. Do not use the wording in `Prohibited Wording`.

| Claim | Profile | Level | Required Artifacts | Optional Artifacts | Allowed Wording | Prohibited Wording | Required Gaps |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Local generated roster plays. | `native-runtime` / `generated-native` | Executed Partial for this runtime. | Runtime smoke, atlas manifests, collision/action data, visual screenshot, native trace when behavior changed. | Contact sheets, GIFs, sprite-atlas QA reports. | `generated/native roster playable in sandbox`. | `MUGEN compatible because generated fighter plays`. | Asset provenance, motion/scale QA warnings, missing authored actions. |
| MUGEN 1.0 loader/parser path works. | `mugen-1.0` | Parsed, Decoded, Recognized, or Executed Partial per artifact. | DEF/AIR/CMD/CNS/SFF v1/ACT/SND parser tests or trace for runtime route. | CodeFuMan-style SFF v1/PCX fixture. | `MUGEN 1.0 feature parsed/decoded/executed partial`. | `MUGEN 1.0 supported` without level. | Unsupported triggers/controllers, missing sprites, palette/audio gaps. |
| MUGEN 1.1 official fixture route executes. | `mugen-1.1` | Executed Partial unless oracle parity exists. | Required synthetic gate plus optional official fixture artifact present and passed. | KFM/KFM720 trace artifacts, imported stage fixture. | `official KFM route executed partial in artifact <name>`. | `KFM works`, `full MUGEN compatible`, `Executed Parity` without oracle comparison. | Exact tick order, exact recovery velocities/selection beyond bounded threshold and `5200/5201` / `5210` routes, guard timing/effects, unsupported controllers. |
| Typed controller family is wired. | `mugen-1.0` / `mugen-1.1` | Compiled or Executed Partial. | Controller compiler test and trace requiring `executedOperations` for runtime claim. | Official fixture route using the same controller. | `<Controller> compiled to typed op` or `<Controller> executed partial in trace`. | `<Controller> supported` because it parsed. | Params ignored, partial semantics, owner/target limitations. |
| IKEMEN-only feature is detected. | `ikemen-go-scan` | Recognized plus Unsupported or Unknown. | Scanner/report fixture naming file/section/feature. | Ikemen GO source/wiki research note. | `IKEMEN feature recognized by scanner and not executed`. | `IKEMEN compatible`, `IKEMEN supported`, `ZSS/Lua works`. | No ZSS/Lua execution, no rollback/netplay, no IKEMEN runtime gate. |
| IKEMEN actor RunOrder is selected explicitly. | `ikemen-go` | Executed Partial. | Required `synthetic-imported-ikemen-runfirst.json`, `synthetic-imported-ikemen-runorder.json`, and `synthetic-imported-ikemen-helper-runorder.json` plus focused expression/scheduler/runtime/public-facade tests. | Aggregate trace stability under default `unknown`. | `explicit IKEMEN profile applies bounded root/helper ordering, exposes one-based actor RunOrder, and advances appended helpers in the same tick`. | `IKEMEN scheduling supported`, `IKEMEN compatible`, or any team/nested-helper claim. | No teams/simul/tag, nested helper creation, exact Pause/hitpause order, or full source-oracle trace. |
| IKEMEN root/helper Pause ownership, team topology/eligibility, public registry, and live team-state snapshots are selected explicitly. | `ikemen-go` | Executed Partial. | Required pause/team-defense traces plus focused topology/roster/MatchWorld/helper/runtime tests and `RuntimeTeamRoster/v0` diagnostics. | Existing fixture corpus under default `unknown`. | `source-backed P1-P8 identity and disabled/standby/over-KO/player-type state can reach public diagnostics while pair scheduling stays stable`. | `full IKEMEN team/pause parity`, live P3/P4 construction, transitions, distance/cache semantics, playable multi-root systems, or global config. | Helper player-type compile, scheduler ownership, tag/turns, partner redirects, and source-oracle replay remain open. |
| Generated asset can export MUGEN-lite templates. | `generated-native` | Authored export format, not imported compatibility. | Generated manifest, DEF/AIR/CMD/CNS template output, atlas QA, runtime trace if playable. | Source prompts, imagegen metadata, contact sheets. | `MUGEN-lite authored export generated`. | `generated fighter proves MUGEN import compatibility`. | Real MUGEN engine validation not performed unless separately tested. |
| Stage layer/audio path is visible. | `mugen-1.0` / `mugen-1.1` / `native-runtime` | Parsed, Decoded, Rendered Partial, Fallback, Unsupported, or Missing. | Stage/audio report, screenshot for visible renderer changes, SND diagnostics for audio. | Official KFM stage or imported third-party stage. | `stage layer rendered/fallback/unsupported with report`. | `stage supported` while layers silently disappear. | BGCtrl, parallax, tiling, masking, windows, model stages, exact audio semantics. |
| Shared module contract exists. | `shared-module-later` | Contract Candidate until a non-fighting slice runs. | Import-boundary proof showing no MUGEN-only concepts in shared core. | Future platformer smoke. | `shared contract candidate`. | `modular engine ready` before a platformer slice runs. | Fighting regressions, platformer scene proof, module packaging. |

## Claim Checklist

Before adding a compatibility claim to docs or UI:

- What profile does this belong to?
- What support level is proven?
- Is the proof static parser data, runtime session data, or trace artifact data?
- Which fixture or generated asset proved it?
- What is still unsupported or unknown?
- Does the UI badge link to evidence and next action?

## Blocked Claims

These are explicitly blocked:

- `Full MUGEN compatible`
- `Full IKEMEN compatible`
- `KFM works` without official fixture artifact evidence
- `Generated fighter proves MUGEN compatibility`
- `Stage supported` when layers silently fallback or disappear
- `Modular engine ready` before a non-fighting module runs from project/build data

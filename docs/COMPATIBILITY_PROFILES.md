# Compatibility Profiles

This document defines the compatibility profiles used by the sandbox. It is a claim-control contract: a feature can parse, scan, compile, execute partially, or match parity, but those are different claims.

The current operating sentence is:

```txt
Partial MUGEN 1.1 fixture-backed runtime, native generated roster, IKEMEN
scanner/reporting plus explicitly gated runtime slices.
```

## 2026-08-08 bounded compatibility checkpoint

T522/T523/T524 are explicit executed-partial metadata slices: authored score,
effective hit/guard `givepower`, and authored `p2facing` are readable from
direct and player-owned Projectile contacts. They do not move score, mutate
the power resource, change live facing, or implement ReversalDef choreography.
T505's Gallery, T530's Showcase, T537's Animation Testbench, T545's Character
Matrix, and T562's Character Compare are product tooling at
`?mode=lab&labView=gallery|showcase|testbench|matrix|compare`. They are not new
compatibility claims. These views read current runtime definitions and do not
edit assets.
T536 is an executed-partial read slice: `RoundState` projects the typed
phase values `0/1/2/3/4`, with phase `1` reserved for the control-locked
Fight screen, in both `mugen-1.1` and `ikemen-go`. T538 is an executed-partial
read slice for `IntroState`, four `FightScreenState` booleans, and numeric
`FightScreenVar` timing/localcoord values. T539 is now an executed-partial
read slice: the round-owned `FightTime` clock and bounded timing `GameVar`
values are available through the same context in both profiles; pause
stacking, persistence flags, rollback, and netplay timing remain open. T540 is
now an executed-partial read slice: `AnimElemVar` exposes the active AIR
frame's Group/Image/effective Time, offsets, H/V flips, and Clsn counts through
CNS/controller expressions and the read-only Testbench. T541 is now an
executed-partial read slice: `AnimLength` sums effective imported AIR frame
durations with `max(1, duration)` through the same context and is visible in
  the Testbench. T542 is an executed-partial read slice: `AnimPlayerNo` reads
  the active animation owner's `playerNo` after `ChangeAnim` or `ChangeAnim2`
  through the shared animation, CNS, and controller contexts. Alpha, angle/scale,
  raw negative/infinite duration, loop/alternate-action, Helper/Projectile/team
  ownership, rollback/netplay, and full animation parity remain open. T543 is
  an executed-partial `ClsnVar` read slice: current-frame `clsn1`, `clsn2`, and
  `size` coordinates flow through shared CNS/controller contexts, redirects,
  `localcoord`, and the read-only Testbench. Missing indexes return `NaN` and
  `TransformClsn` is not applied. T544 is an executed-partial
  `ClsnOverlap` slice: dynamic player IDs and `clsn1`/`clsn2`/`size` pairs flow
  through shared CNS/controller contexts and the transformed collision
  boundary. Non-size boxes apply local coordinates, facing, scale, and angle;
  size boxes remain unscaled and unrotated. T546 is an executed-partial
  `ProjClsnOverlap` slice: active caller-owned projectiles use deterministic
  oldest-first indexing, both projectile Clsn groups, dynamic player-ID
  lookup, and their own collision scale/angle fields. Collision-proxy breadth,
  perspective/depth scaling, combat arbitration, rollback/netplay, and full
  collision parity remain open. T547 is an executed-partial numeric `ProjVar`
  slice over the same active owner-relative index. Identity, animation,
  position, motion, bounds, hit capacity, priority, removal, scale, time, and
  team-side values flow through redirects and caller output `localcoord`.
  T548 adds executed-partial static `attr`, `guardflag`, and `hitflag`
  comparisons with Ikemen's complemented-mask `!=` behavior. Dynamic strings
  and presentation fields remain open. T549 adds executed-partial Projectile
  Pause/SuperPause movement counters with typed spawn/modify operations,
  per-projectile paused advancement, and current numeric reads. T550 closes
  removal velocity and terminal motion. T551 closes the third `velmul` axis,
  acceleration-aware Z motion, terminal reset, and numeric reads. T552 closes
  normalized `projlayerno` state, numeric reads, and coarse live presentation
  bands. T553 closes `projangle` state and Z-axis renderer rotation. T554 is
  closes `projxangle`/`projyangle` state and bounded X/Y renderer rotation.
  T555 closes `projxshear` state and bounded live deformation. T556 closes
  `projshadow` RGB state, readback, and bounded live shadow tint. T557 closes
  `projreflection` auto/off/on state and bounded live mirrored presentation.
  T558 closes `projprojection`/`projfocallength` state and bounded live
  perspective projection. T559 closes four-value `projwindow` state and bounded
  live clipping. T560 is active for spawn-only `ownpal`/`remappal` and draw
  palette readback.
T525 `GetHitVar(guardcount)` is now a bounded
direct/Projectile cumulative counter with idle reset. T526 `GetHitVar(hitcount)`
is closed-bounded for `comboHitCount` across direct/player-owned Projectile
first, consecutive, guarded, and reset contacts. The `ikemen-go` profile also
tracks contacts carrying authored `numhits`; M.U.G.E.N/static imported traces
retain the authored fallback. T527 closes the `ikemen-go` authored-`numhits`
extension for one player-owned Projectile with two eligible contacts and a
guarded break. T528 is closed-bounded for `xveladd`/`yveladd`: Ikemen's KO
velocity delta is tracked separately from `xvel`/`yvel` on direct and
player-owned Projectile contacts, while non-KO and non-`ikemen-go` routes keep
the existing zero fallback. Helper/redirect/team ownership and full KO
velocity physics remain out of scope.

T478/T479 are now explicit IKEMEN runtime presentation slices: package-backed
CommonFX/FightFX hit sparks preserve `fx.scale` and apply the authored
package/character `localcoord` ratio before sprite binding. This remains a
bounded visual claim; exact FightFX timing, palette, layer, audio, cache and
general IKEMEN execution remain unsupported.

T480 adds one explicit IKEMEN combat slice: authored `fall.zvelocity` is
preserved through imported HitDef/projectile/fall-controller paths and applied
to the sandbox's `combatDepth` velocity, with both `GetHitVar` aliases exposed.
This is bounded metadata/depth propagation, not general Z physics or full
IKEMEN execution.

T481 closes the neighboring explicit IKEMEN combat slice: authored third
components on HitDef `ground/air/down/guard/airguard.velocity` survive imported
state and player-owned Projectile paths, select by contact context, and write
explicit `combatDepth.velocity` values. The profile remains executed-partial;
omitted Z, ModifyHitDef mutation, Common1 Z physics, helper/team breadth and full
IKEMEN execution remain outside the claim.

T482 closes the static `ModifyHitDef` continuation: authored vector-Z values
can mutate an active normal HitDef and then use the T481 direct/projectile
contact seam. This remains executed-partial; dynamic expressions, helper/team
ownership and Common1/full depth physics are not included. Focused mutation
coverage passes 2 files/89 tests; final 324/3317 suite and 682/682 traces pass.

T483 adds the bounded acceleration metadata continuation: static HitDef and
Projectile `xaccel`/`yaccel`/`zaccel` survive imported/direct/projectile contact
handoff and are readable through `GetHitVar`. Omitted horizontal/depth fields
use zero defaults. This remains executed-partial metadata only; physics,
localcoord/facing scaling, dynamic expressions and ModifyHitDef acceleration
mutation are outside the profile claim. Focused coverage passes 7 files/249
tests; typecheck and boundaries pass.

T484 extends that executed-partial seam to static `ModifyHitDef` acceleration:
active normal HitDefs can update `xaccel`/`yaccel`/`zaccel` metadata before the
same direct/projectile contact handoff. Focused mutation coverage passes 2
files/89 tests; typecheck passes. Dynamic expressions, scaling and physics are
outside the profile claim.

T485 closes the adjacent dynamic metadata seam: supported scalar expressions
for those three acceleration fields remain typed and evaluate in the active
controller context for HitDef and ModifyHitDef. Focused coverage passes 7
files/250 tests; final suite, typecheck/build/boundaries, trace and hygiene
gates pass. Acceleration physics, scaling, helper/team breadth and other
dynamic ModifyHitDef fields remain outside the profile claim.

T486 closes the adjacent Ikemen readback seam: `GetHitVar(zvel)` now returns
the active HitDef/Projectile depth velocity with an omitted-depth zero fallback
through the shared expression context. Focused coverage passes 27/27; legacy
M.U.G.E.N `GetHitVar` compatibility and depth physics remain outside the
profile claim.

T487 closes the adjacent Ikemen controller seam: static `HitVelSet z` compiles
and copies active hit depth velocity into `combatDepth.velocity` when its flag
is nonzero. The two-file focused slice passes 71 tests; generic Z physics,
dynamic parameters and legacy M.U.G.E.N behavior remain outside the profile
claim.

T488 closes the adjacent Ikemen readback seam: direct HitDef and player-owned
Projectile contacts preserve ground/air/down/guard/airguard velocity vectors for
the dotted `GetHitVar` aliases, with zero fallback for omitted families or
components. Four focused files pass 133 tests; dynamic vector evaluation,
exact default adjudication, Z physics and helper/team breadth remain outside
the profile claim.

T489 closes the adjacent Ikemen damage readback seam: direct HitDef and
player-owned Projectile contacts retain the first and second damage components
as `GetHitVar(hitdamage|guarddamage)`. Three focused files pass 114 tests;
resource gains, scaling, KO policy, string attributes and helper/team breadth
remain outside the profile claim.

T490 closes the adjacent Ikemen reaction readback seam: direct HitDef,
player-owned Projectile, and imported moves retain ground, air, and fall
animation types for the three dotted `GetHitVar` aliases. Seven test files
pass 256 tests; exact Common1 choreography, dynamic values, string semantics
and helper/team breadth remain outside the profile claim.

T491 closes the adjacent Ikemen EnvShake readback seam: direct HitDef,
player-owned Projectile, and imported moves retain `fall.envshake.mul` for
`GetHitVar(fall.envshake.mul)`, with omitted values returning `1`. Seven test
files pass 258 tests; exact EnvShake playback, dynamic values and helper/team
breadth remain outside the profile claim.

T492 closes the adjacent Ikemen source-identity readback seam: direct HitDef
and player-owned Projectile contacts retain the source attacker's `playerno`
for `GetHitVar(playerno)`, defaulting to `0` without aliasing the defender's
own slot. Three test files pass 119 tests; string attributes and helper/team
breadth remain outside the profile claim.

T506 closes the separate Ikemen numeric identity readback seam: root and
verified Helper direct/Projectile contacts retain the last source character's
`playerid` independently from `playerno`. Missing numeric source metadata reads
as `0`; Helpers keep their registered runtime ID while inheriting the root slot.
Five focused files pass 178 tests plus five deterministic IKEMEN trace checks.
Deprecated `ID`, string attributes and unverified custom-state/team ownership
remain outside the profile claim.

T507 keeps deprecated-but-valid `GetHitVar(ID)` as a case-insensitive alias of
`playerid`, with the same zero fallback. One focused expression file passes 27
tests; the alias does not widen the profile into string-valued GetHitVar data.

T509 exposes bounded numeric `GetHitVar(guardko)` from existing direct and
root-Projectile guard-KO metadata. Three focused files / 121 tests plus
682/682 traces pass; exact guard-point/damage accumulation, teams/simul breadth,
and full parity remain outside the profile claim.

T510 executes static `GetHitVar(attr) =/!= state, attack` filters against the
existing last-hit `sourceAttr`, including redirected actor context. Three
focused files / 118 tests and 682/682 traces pass. Dynamic filters, general
string results, `guardflag`, `hitflag`, and full parity remain outside the
profile claim.

T535 executes static `GetHitVar(hitflag) =/!= flags` filters against retained
effective direct/Projectile HitDef metadata, including redirected actors and
the official omitted `MAF` default. Comparison uses typed M/H/L/A/F/D/+/-
overlap. Dynamic flags, general string GetHitVar values, reset/lifetime parity,
and full parity remain unsupported.

## Profiles

| Profile | Purpose | Current Level | Runtime Claim |
| --- | --- | --- | --- |
| `native-runtime` | Authored/generated fighters and stages built for this sandbox. | Playable baseline. | Playable through local atlas/runtime data. |
| `mugen-1.0` | Legacy MUGEN 1.0 character/stage content. | Loader/parser/scanner plus partial SFF v1 and CMD/CNS runtime routes. | Partial only when a trace proves execution. |
| `mugen-1.1` | Elecbyte MUGEN 1.1 content such as official KFM/KFM720. | Primary imported fixture target. | Partial KFM/Common1 fixture-backed runtime. |
| `ikemen-go-scan` | IKEMEN-GO content classification. | Scanner/reporting only. | No execution claim. |
| `ikemen-go` | Explicit IKEMEN-GO runtime policy selection. | Executed Partial for named, source-backed slices only. | Root/helper RunOrder, same-tick appended helpers, bounded simultaneous Pause buffers, T427's direct/fallback character-state ZSS subset, T428's live `ignoreHitPause` route, and T429's constant combined-wrapper cadence evidence; no general IKEMEN content execution claim. |
| `ikemen-go-exec-later` | Future IKEMEN-specific execution target. | Blocked. | No general ZSS, Lua, rollback, netplay, model-stage, or broader IKEMEN-only runtime claim yet. |
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
- `ZSS recognized as IKEMEN-only unsupported` is a scanner claim outside the
  named T427 character-state subset.

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
- `PackageAnalysisResult` (`mugen-web-sandbox/package-analysis/v0`) is the package-level report contract. It preserves source locations, unresolved/resolved dependencies, MUGEN profile/version metadata, and report-only `ikemen-go-scan` findings across character, stage, system, and screenpack VFS inputs.
- Package analysis remains a scanner/reporting contract; it does not promote parsing or recognition to runtime execution, rendering parity, license validation, or score credit.

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
| IKEMEN-only feature is detected. | `ikemen-go-scan` | Recognized plus Unsupported or Unknown. | Scanner/report fixture naming file/section/feature. | Ikemen GO source/wiki research note. | `IKEMEN feature recognized by scanner and not executed`. | `IKEMEN compatible`, `IKEMEN supported`, `ZSS/Lua works`. | No general ZSS/Lua execution, no rollback/netplay, no IKEMEN runtime gate. |
| T427-T429 ZSS character-state subset executes. | `ikemen-go` | Executed Partial. | Direct/fallback/mixed loader tests; `ikemen-zss-live` `47c627a2`; mixed hit-pause `ikemen-zss-hitpause-wrapper` `b6533370`; combined-wrapper `ikemen-zss-combined-persistent-wrapper` `4ff43eb7`. | Focal static desktop/mobile preview for T427; T428/T429 change no UI route. | `named ZSS character-state subset, one ignoreHitPause route, and constant combined-wrapper cadence execute partial under ikemen-go`. | `ZSS works`, `IKEMEN compatible`, or parity wording. | Only `Null`/`PosAdd`/`ChangeState`/`VelSet`, `ignoreHitPause`, and constant positive combined cadence; raw-CNS persistence belongs to separate T430/T431 gates, while dynamic values, general grammar/controllers, Lua, system ZSS, or parity remain blocked. |
| T430-T438/T463-T464 raw CNS persistence executes. | `mugen-1.1` | Executed Partial. | `mugen-cns-persistent-cadence` `f7c32a53`, `mugen-cns-persistent-zero` `d13ad12a`, paired pause traces `94b49516` / `d6d00fd0`, T434 `3eb88436`, T435/T436 `6fce3962` / `b2719d71`, T437/T438 CMD State -1 `ba3d289d` / `27e1ffb7`, and T463/T464 State -1 ChangeState `88931500` / `3681fafa`, plus focused/runtime/suite/type/build/boundary gates. | No UI route changed. | `bounded raw-CNS normal, paused, special-state, imported CMD State -1 setup, and static State -1 ChangeState zero/interval-two persistence routes execute partial`. | `raw CNS persistence works`, generic State -1 ChangeState cadence, or M.U.G.E.N parity. | Bounded constants and owner routes only; other intervals, failed-value activation order, player-owned custom states, wrappers, helpers, dynamic values, generic VM, and parity remain blocked. |
| IKEMEN actor RunOrder is selected explicitly. | `ikemen-go` | Executed Partial. | Required `synthetic-imported-ikemen-runfirst.json`, `synthetic-imported-ikemen-runorder.json`, and `synthetic-imported-ikemen-helper-runorder.json` plus focused expression/scheduler/runtime/public-facade tests. | Aggregate trace stability under default `unknown`. | `explicit IKEMEN profile applies bounded root/helper ordering, exposes one-based actor RunOrder, and advances appended helpers in the same tick`. | `IKEMEN scheduling supported`, `IKEMEN compatible`, or any team/nested-helper claim. | No teams/simul/tag, nested helper creation, exact Pause/hitpause order, or full source-oracle trace. |
| IKEMEN root/helper Pause ownership, team topology/state/registry, and inert P3-P8 root construction are selected explicitly. | `ikemen-go` | Executed Partial. | Required pause/team-defense traces plus focused topology/roster/MatchWorld/runtime/reset/snapshot tests and `RuntimeTeamRoster/v0`. | Existing fixture corpus under default `unknown`. | `source-backed P1-P8 standby roots can enter runtime ownership and diagnostics while all playable phases stay P1/P2`. | `full IKEMEN team parity`, reserve activation, active multi-root scheduling/input/combat/round/presentation/effects, transitions, or global config. | Helper player-type compile, tag/turns, partner redirects, and source-oracle replay remain open. |
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

## T511 bounded trigger profile

Static `GetHitVar(guardflag) =/!= flags` executes against retained effective
HitDef metadata for active and redirected actors. Comparison uses Ikemen mask
overlap (`M = H|L`) and omitted local HitDefs default to `MA`. Dynamic filters,
general string GetHitVar values, `hitflag`, `GetHitVarSet`, broader ownership,
and parity remain unsupported.

## T512 bounded trigger profile

`GetHitVar(projid)` executes-partial as a numeric last-hit Projectile ID for
Projectile contacts and returns `-1` for direct or missing hit metadata. Active
and redirected contexts use the same typed read. Projectile lifecycle parity,
dynamic filters, `hitflag`, `GetHitVarSet`, broader ownership, and full parity
remain unsupported.

## T513 bounded trigger profile

`GetHitVar(teamside)` executes-partial as a numeric 1-based source side for
direct and Projectile contacts, including verified Helper-parented sources;
missing metadata returns `-1`. Team topology parity, dynamic filters,
`hitflag`, `GetHitVarSet`, and full parity remain unsupported.

## T514 bounded trigger profile

`GetHitVar(keepstate)` executes-partial as numeric direct-HitDef metadata:
authored `keepstate = 1` reads `1`, while false or missing metadata reads `0`.
Projectile/Reversal keepstate authoring, HitOverride timing, `GetHitVar(frame)`,
dynamic filters, and full parity remain unsupported.

## T515 bounded trigger profile

`GetHitVar(frame)` executes-partial as numeric `1` during direct HitDef and
Projectile hit/guard contact, remains set through hitpause, and clears at the
next non-paused frame. ReversalDef/HitOverride-only timing, broader pause
parity, dynamic filters, and full parity remain unsupported.

## T516 bounded trigger profile

`GetHitVar(priority)` executes-partial for direct HitDef and Projectile
hit/guard contacts. Direct contacts expose normalized authored priority;
Projectile contacts expose the HitDef default, while `projpriority` remains a
separate clash value. `GetHitVar(facing)`, priority type, ReversalDef/
HitOverride timing, and full parity remain unsupported.

## T517 bounded trigger profile

`GetHitVar(dizzypoints)` executes-partial for direct HitDef and Projectile
hit/guard contacts. Authored dizzypoints are retained in typed last-hit
metadata, missing values read `0`, and the field stays separate from the
defender's current dizzy resource. Cumulative multi-hit/reset behavior,
`GetHitVar(guardpoints)`, dynamic filters, and full parity remain unsupported.

## T518 bounded trigger profile

`GetHitVar(guardpoints)` executes-partial for direct HitDef and Projectile
hit/guard contacts. Authored guardpoints are retained in typed last-hit
metadata, missing values read `0`, and the field stays separate from the
defender's current guard resource. Cumulative multi-hit/reset behavior,
`GetHitVar(guardpower)`, dynamic filters, and full parity remain unsupported.

## T519 bounded trigger profile

`GetHitVar(redlife)` executes-partial for direct HitDef and Projectile hit/guard
contacts. Authored redlife is retained in typed last-hit metadata, missing
values read `0`, and the field stays separate from the defender's current
red-life resource. `guardredlife`, cumulative reset behavior, dynamic filters,
and full parity remain unsupported.

## T520 bounded trigger profile

`GetHitVar(guardpower)` executes-partial for direct HitDef and Projectile
hit/guard contacts. The second authored `givepower` value is retained in typed
last-hit metadata, missing values read `0`, and the field stays separate from
the defender's current power resource. `GetHitVar(hitpower)`, current-resource
readback, dynamic filters, and full parity remain unsupported.

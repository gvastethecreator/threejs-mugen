# Port Completion Scorecard

Last updated: 2026-06-30

This is the answer source for "how far are we from a usable port?" It measures the current repo against three different horizons, because a playable local sandbox, practical MUGEN compatibility, and a full IKEMEN-GO-class port are not the same milestone.

## Current Scores

| Horizon | Score | Current truth |
| --- | ---: | --- |
| Playable private sandbox | 65 / 100 | Usable local Three.js match exists with native/generated fighters, original stage, HUD, hit/hurt boxes, debug panels, Studio surfaces, and trace/smoke QA. |
| Practical MUGEN compatibility | 35 / 100 | DEF/AIR/CMD/CNS/SFF/SND/stage paths exist and many controller/trigger families have bounded gates, but broad character compatibility is still partial. |
| MUGEN 1.0/1.1 MVP port | 20 / 100 | Enough parser/runtime/render infrastructure exists to keep marching toward KFM/Common1-style compatibility, but exact VM, combat, helpers, screenpack, palette, audio, and tick-order parity remain open. |
| Full MUGEN-compatible engine | 10-12 / 100 | Foundation and evidence discipline exist. Complete behavior parity across real characters/stages/screenpacks is still a large engine project. |
| Full IKEMEN-GO-class port | 6-8 / 100 | IKEMEN scanner/reporting exists. ZSS, Lua, rollback/netplay, extended screenpacks, team modes, and IKEMEN runtime semantics are not executed yet. |
| Creator Studio / modular engine | 25 / 100 | Studio workbench/evidence/build/assets surfaces exist. Real authoring, persistent asset DB, export pipeline, and non-fighting modules are still early. |

## What "Usable" Means Next

The next usable milestone is not "full IKEMEN." It is:

```txt
MUGEN-lite playable MVP
  -> load official/local KFM-style package
  -> run common idle/walk/crouch/jump/attack/get-hit/guard/fall/recovery paths
  -> inspect every unsupported controller/trigger
  -> export trace/report evidence
  -> keep native generated roster playable
```

Target score for that milestone: playable sandbox 75+, practical MUGEN compatibility 45+, MUGEN MVP port 30+.

## Completion Bands

| Band | Meaning | Required proof |
| --- | --- | --- |
| 0-15 | Foundation only | Project builds, app opens, docs state limits. |
| 16-35 | Partial runtime | Real parsers, partial controller execution, synthetic trace gates. |
| 36-55 | Practical MVP | Official/local KFM-style fixture can execute common authored routes with visible reports. |
| 56-75 | Broad MUGEN subset | Many public character/stage packages load and play common move sets without custom patches. |
| 76-90 | Near-parity MUGEN | Exact-ish CNS/CMD/tick/combat/helper/projectile/screenpack behavior for a broad regression corpus. |
| 91-100 | Full engine parity | IKEMEN/MUGEN edge behavior, ZSS/Lua where applicable, teams, rollback/netplay, screenpacks, audio/video parity, tooling, release QA. |

The project is currently in the **16-35 partial runtime band** for imported compatibility and in the **56-75 practical playable band** for the private native sandbox.

## Evidence Ledger

| Area | Score | Evidence | Main blocker |
| --- | ---: | --- | --- |
| Project control | 80 | `AGENTS.md`, `docs/agents/*`, `CONTEXT.md`, `docs/adr/0001-roadmap-control-and-local-issues.md`, `docs/ROADMAP_PROGRESS_SYSTEM.md`, `docs/ROADMAP_PACKAGE_MILESTONES.md`, `docs/ROADMAP_RELEASE_TARGETS.md`, `docs/ROADMAP_EXECUTION_BOARD.md`, `.scratch/roadmap/*`, this scorecard. | Keep docs synchronized after each gate. |
| Native runtime | 65 | Local roster, Rooftop Dojo, HUD, controls, debug, smoke QA. | Gameplay depth, polish, broader move/system coverage. |
| File loading/parsers | 55 | ZIP/folder loader, DEF/AIR/CMD/CNS/ST/SFF/SND partial parsers. | More corpus coverage, exact raw preservation, edge formats. |
| SFF/render import | 40 | SFF v1 PCX and current SFF v2 RAW/RLE/LZ paths render current fixtures. | Palette parity, v2 edge formats, sprite/group fallback policy. |
| CMD/CNS expression VM | 30 | Many triggers/controllers parse and partially execute through gates. | Full AST/IR, redirects, helpers, dynamic params, exact tick timing. |
| Combat/Common1 | 30 | Direct HitDef, guard, hitstun, fall/get-hit/recovery gates, bounded owner-backed and target-owned custom-state routes, bounded hit/guard-sound and hit/guard-spark telemetry, combined hit/guard sound + FightFX spark trace evidence with shared contact package metadata, plus smoke-gated player AIR spark sprite rendering/source metadata. | Exact guard/fall/recovery, full custom states, throws, priority, KO/round flow. |
| Helpers/projectiles/explods | 25 | Bounded effect actors, projectile/Helper/Explod traces, pause budgets, helper-local redirects, static helper-local owner binding, helper-local `NumExplod(id)` / `NumHelper(id)` / `NumProjID(id)` count evidence, helper-local `Projectile` spawn, helper-local `ModifyProjectile`, helper-local `ProjHit(id)` contact-trigger evidence, helper-local `ProjGuarded(id)` / `ProjGuardedTime(id)` guard-trigger evidence, and helper-local `ProjContact(id)` / `ProjContactTime(id)` generic contact-trigger evidence. | Real helper VM, ownership, indexed/team/helper-owned redirects, exact helper effect-count parity, helper-owned projectile combat/contact and target memory, exact helper projectile contact timing/lifetime, player-state helper binding parity, exact lifecycle/pause parity. |
| Stages/presentation/audio | 25 | Basic imported stage route, EnvShake/EnvColor, partial SND event path, bounded HitDef hit/guard sound plus hit/guard spark telemetry, combined hit/guard-effect package telemetry with shared contact id/tick/kind, source metadata, first-frame player AIR spark sprite lookup, first-pass `fight.def`/FightFX AIR/SFF loading, decoded system-SFF provider registration, bounded common/FightFX provider handoff, and 180-frame fallback Three.js spark overlay. | BGCtrl parity, screenpacks/lifebars, exact FightFX/common layering, scale, palette, timing, motif ownership, and audio mixing/timing. |
| IKEMEN profile | 10 | Scanner recognizes ZSS/Lua/config/screenpack/model-stage signals. | No ZSS/Lua execution, rollback/netplay, IKEMEN runtime extensions. |
| Studio/product surface | 25 | Workbench, Assets, Inspector, Debug, Evidence, Modules, Build. | True editing, regeneration, persistent projects, export/publish workflow. |
| Modular engine | 10 | Boundary docs and module contract draft. | Platformer/shared core proof blocked until fighting contracts stabilize. |

Latest ownership checkpoint: `HelperSystem` now owns a bounded helper-local micro-VM for current visual Helper actors, including helper-local state/action/kinematic/destruction plus helper-local control/metadata/resource/variable trigger branches, helper-local int `VarRandom`, bounded helper identity triggers (`IsHelper`, `IsHelper(id)`), bounded parent/root owner-state reads, bounded helper-local `EnemyNear, ...` opponent reads, static helper-local owner binding through `BindToParent` / `BindToRoot`, static helper-local visual `Explod` handoff into the owner-side effect store, static helper-local `RemoveExplod` cleanup by id from that owner-side effect store, static helper-local `ModifyExplod` mutation by id of helper-parented owner-side Explods, helper-local `NumExplod(id)` counts for helper-parented owner-side Explods, helper-local `NumHelper(id)` counts for owner-side visual Helpers in the same effect store, helper-local `NumProjID(id)` counts for helper-parented owner-side Projectiles with removed-projectile exclusion, static helper-local `Projectile` spawn into the owner-side projectile store with helper `parentId`, static helper-local `ModifyProjectile` mutation against helper-parented owner-side Projectiles, helper-local `ProjHit(id)` / `ProjContact(id)` marker reads against helper-parented Projectile contact state, helper-local `ProjGuarded(id)` / `ProjGuardedTime(id)` marker reads against helper-parented Projectile guard state, and helper-local `ProjContact(id)` / `ProjContactTime(id)` generic contact-age reads against helper-parented Projectile contact state. `RuntimeStunWorld`, `RuntimeStateAvailabilityWorld`, `RuntimeHitStateTransitionWorld`, `RuntimeGetHitStateWorld`, `RuntimeGuardWorld`, `RuntimeOrientationWorld`, `RuntimeHitEligibilityWorld`, `RuntimeTargetWorld.applyTargetBindings` / `applyBindToTarget`, `RuntimeRecoverySystem`, `HitSparkAssetSystem`, `RuntimeRandomSystem`, and `RuntimeContactMemoryWorld` remain earlier ownership checkpoints. These are ownership cleanups plus bounded helper-local evidence only, not new broad parity or score movement.

Latest trace aggregate: `pnpm qa:trace` passes 185/185 artifacts, with 165 required and 20 optional local-fixture artifacts. The latest required helper/effect oracle is `synthetic-imported-helper-projcontact.json` checksum `07653cee`, proving a visual Helper can execute helper-local `ProjContact(8855)` / `ProjContactTime(8855) >= 1` against helper-parented owner-side Projectile anim `951` with `parentId = p1-helper-0`, route through `1200 -> 1220 -> 1221` / anims `949` and `950`, and expose guard/contact payload evidence with `hasHit = true` and `hitsRemaining = 0`. Previous helper/effect oracles remain required: `synthetic-imported-helper-projguard.json` checksum `3353eda7` proves helper-local Projectile guard routing, `synthetic-imported-helper-projhit.json` checksum `3892716e` proves helper-local Projectile hit/contact routing, `synthetic-imported-helper-modifyprojectile.json` checksum `77df008b` proves helper-local Projectile mutation, and `synthetic-imported-helper-numproj.json` checksum `4f8612b0` remains the helper-local projectile-count proof. The latest required Common1 oracles are `synthetic-imported-default-fall-official-recovery-threshold.json` checksum `86804271` and `synthetic-imported-default-fall-official-recovery-too-early.json` checksum `ef945ff5`, proving portable official-style synthetic recovery threshold and early-input rejection routes in addition to the previous `synthetic-imported-default-fall-recovery.json` checksum `d83797d9` lie-down/get-up recovery order. This does not move scores because exact `down.recovertime` / `fall.recovertime` tables, exact Common1 controller-loop tick order, player-state `BindToParent` / `BindToRoot`, exact helper effect-count/ownership parity, helper-owned projectile combat/contact presentation, helper-owned target memory, exact `ProjContact` / `ProjHit` / `ProjGuarded` timing and lifetime, dynamic bind/effect/projectile params, position rebinding, nested helper ancestry where root differs from parent, `EnemyNear(index)`, helper-owned opponents, helper-owned `HitDef`/effect namespaces, helper combat/contact presentation, helper/projectile target redirects, unsupported or negative target-id expressions, mutation through redirects, teams, multi-target selection, exact target/helper lifetime or tick order, keyctrl, and broader VM behavior remain blocked. The latest optional private-fixture KFM recovery oracle is `kfm-official-default-fall-recovery.json` checksum `b1c6456a`, applying matching bounded `5110 -> 5120` actor-frame/controller-order requirements to real KFM when `.scratch/fixtures/kfm-official.zip` exists. The latest required presentation oracles are `synthetic-imported-hitdef-common-spark.json` checksum `5ea054d7`, `synthetic-imported-hitdef-fightfx-spark.json` checksum `11537b56`, `synthetic-imported-hitdef-common-guard-spark.json` checksum `7650a09c`, `synthetic-imported-hitdef-fightfx-guard-spark.json` checksum `32f3e92d`, `synthetic-imported-hitdef-hit-effect-package.json` checksum `46aa5ce1`, and `synthetic-imported-hitdef-guard-effect-package.json` checksum `1c3167b7`, proving bounded common/default and FightFX hit/guard `HitSpark` source-frame metadata before renderer handoff plus combined direct hit/guard sound and spark telemetry.

Recent required oracles remain stable or intentionally strengthened: `synthetic-imported-helper-projcontact.json` checksum `07653cee`, `synthetic-imported-helper-projguard.json` checksum `3353eda7`, `synthetic-imported-helper-projhit.json` checksum `3892716e`, `synthetic-imported-helper-modifyprojectile.json` checksum `77df008b`, `synthetic-imported-helper-numproj.json` checksum `4f8612b0`, `synthetic-imported-helper-projectile.json` checksum `893f9427`, `synthetic-imported-helper-numhelper.json` checksum `4e32e951`, `synthetic-imported-helper-numexplod.json` checksum `4328278a`, `synthetic-imported-helper-modifyexplod.json` checksum `0749041c`, `synthetic-imported-helper-removeexplod.json` checksum `ff8658a2`, `synthetic-imported-helper-explod.json` checksum `87ae363f`, `synthetic-imported-helper-bindtoroot.json` checksum `bf72306c`, `synthetic-imported-helper-bindtoparent.json` checksum `f9922c0e`, `synthetic-imported-target-dynamic-redirect.json` checksum `9985b62a`, `synthetic-imported-target-redirect.json` checksum `89580963`, `synthetic-imported-helper-ishelper.json` checksum `37877602`, `synthetic-imported-identity.json` checksum `c9be5cf1`, `synthetic-imported-noop.json` checksum `2877b222`, `synthetic-imported-target-noko.json` checksum `321a1eba`, `synthetic-imported-assertspecial-noko.json` checksum `f2f60521`, `synthetic-imported-target-owned-custom-state.json` checksum `410fb8c0`, `synthetic-imported-default-fall-recovery.json` checksum `d83797d9`, `synthetic-imported-default-gethit-progression.json` checksum `ef2a67f8`, `synthetic-imported-hitdef-hit-sound.json` checksum `6fc00d8a`, `synthetic-imported-hitdef-common-spark.json` checksum `5ea054d7`, `synthetic-imported-hitdef-fightfx-spark.json` checksum `11537b56`, `synthetic-imported-hitdef-common-guard-spark.json` checksum `7650a09c`, `synthetic-imported-hitdef-fightfx-guard-spark.json` checksum `32f3e92d`, `synthetic-imported-hitdef-hit-effect-package.json` checksum `46aa5ce1`, `synthetic-imported-hitdef-guard-effect-package.json` checksum `1c3167b7`, `synthetic-imported-hitby-reject.json` checksum `65185fd1`, `synthetic-imported-hitby-allow.json` checksum `c75d5c7d`, `synthetic-imported-hitpausetime-ignorehitpause.json` checksum `a3a78bb8`, and `synthetic-imported-modifyexplod.json` checksum `bca75991`.

The current HitDef-effect oracle set is `synthetic-imported-hitdef-hit-sound.json` checksum `6fc00d8a`, `synthetic-imported-hitdef-guard-sound.json` checksum `fdf1f7f6`, `synthetic-imported-hitdef-hit-spark.json` checksum `b6554124`, `synthetic-imported-hitdef-guard-spark.json` checksum `72c8fa3a`, `synthetic-imported-hitdef-common-spark.json` checksum `5ea054d7`, `synthetic-imported-hitdef-fightfx-spark.json` checksum `11537b56`, `synthetic-imported-hitdef-common-guard-spark.json` checksum `7650a09c`, `synthetic-imported-hitdef-fightfx-guard-spark.json` checksum `32f3e92d`, `synthetic-imported-hitdef-hit-effect-package.json` checksum `46aa5ce1`, and `synthetic-imported-hitdef-guard-effect-package.json` checksum `1c3167b7`; the package gates now require sound and spark evidence to share non-empty contact id/tick/kind metadata. `HitSparkRenderer` treats `S` spark refs as player AIR action refs, classifies unprefixed refs as common/default and `F` refs as FightFX, preserves runtime-provided package frames from `hitSparkLibraries`, synthesizes bounded common/FightFX system lookup frames when no package frame exists, and `pnpm qa:smoke` requires active desktop/mobile sparks plus player-source resolved-sprite diagnostics. `MugenCharacterLoader` can load optional `data/fight.def` / `fightfx.air` / `fightfx.sff`, `createImportedFighterDefinition` can hand those AIR actions to runtime `hitSparkLibraries`, and `App` can register decoded system SFF sprites through the global hit-spark provider route; exact intra-tick sound/spark ordering, common/FightFX render lookup, layering, scale, palette, timing, channel ownership, motif/screenpack ownership, hit/guard-effect parity, and full presentation parity remain blocked.

The latest optional official KFM presentation oracles are `kfm-official-x-hit-sound.json` checksum `bd153db9` and `kfm-official-x-hit-spark.json` checksum `bd153db9`. The latest optional official KFM guard-hit oracles remain `kfm-official-default-guard-state.json` checksum `885bb1da`, `kfm-official-default-crouch-guard-state.json` checksum `d11153d0`, and `kfm-official-default-air-guard-state.json` checksum `f4378971`.

## Gap To Full Port

| Remaining area | Why it is still large |
| --- | --- |
| CNS VM and expression parity | Needs full source-located AST/IR, redirects, dynamic params, helper/parent/root ownership, exact trigger lifetime, and error compatibility. |
| Common1/combat parity | Needs exact get-hit, guard, fall, recovery, throws, custom states, priority, KO/round flow, sparks/sounds, and tick order across real fixtures. |
| Helpers/projectiles/explods | Current visual/effect actors are bounded and Helpers have a tiny helper-local micro-VM with local control/metadata/variables plus bounded helper-local int `VarRandom`, `IsHelper` / `IsHelper(id)` identity triggers, parent/root owner reads, current-opponent `EnemyNear, ...` reads, static helper-local `BindToParent` / `BindToRoot` owner binding, static helper-local `Explod`, static helper-local `RemoveExplod` cleanup by id, static helper-local `ModifyExplod` mutation by id, helper-local `NumExplod(id)` / `NumHelper(id)` counts, static helper-local `Projectile` spawn, static helper-local `ModifyProjectile` mutation, and bounded helper-local `ProjHit(id)` reads against helper-parented Projectile contact markers. Full port still needs indexed/team/helper-owned redirect ownership, full helper state machines, pause behavior, exact contact trigger timing/lifetime, player-state binding parity, life/power resources, helper fvar/sysvar `VarRandom`, exact random stream parity, helper-owned projectile combat/contact, helper-owned target memory, helper-owned effect namespaces, exact helper effect-count/ownership scopes, and lifecycle parity. |
| Rendering/palettes/audio | Needs full SFF/ACT palette behavior, FightFX, lifebars, screenpacks, blend/shadow behavior, SND timing/mixing, and presentation parity. |
| IKEMEN-specific runtime | Scanner exists, but ZSS, Lua hooks, rollback/netplay, model-stage, screenpack extensions, team modes, and IKEMEN-specific controllers are not executed. |
| Corpus and tooling | Full port needs many fixture packages, golden traces, compatibility profiles, automated diffing, authoring tools, and release QA. |

Practical reading: from today's evidence, a private playable sandbox is roughly two-thirds usable, a practical MUGEN subset is about one-third there, and a full IKEMEN-GO-class port remains a multi-stage engine project.

## Next Ten Gates

1. Remaining `AssertSpecial` and guard precision: broader lifetime/persistence layering, priority, helper/team/global ownership, pause interaction, FightFX/common guard-effect layering/timing/scale/palette beyond bounded player AIR/system-namespace/package-frame spark sprites/fallback sparks and first-pass system asset plumbing, proximity rules, and KFM/Common1 confirmation beyond bounded stand/crouch/air denial, one-frame expiry traces, and optional guard-hit actor-frame physics telemetry.
2. Exact-enough fall/recovery tick order, optional fixture threshold oracles, and broader recovery parity beyond the current synthetic threshold handoff, summarized actor-frame tick-order gate, bounded synthetic air/ground velocity gates, and synthetic/official early recovery-input reject gates.
3. Helper VM ownership slice: indexed/team/helper-owned redirect reads plus deeper helper-local state execution beyond the current micro-VM, especially helper combat/effect ownership, helper-owned projectile target memory, exact `ProjContact` / `ProjHit` timing, player-state binding parity, helper fvar/sysvar `VarRandom`, exact random stream parity, and tick-order parity.
4. Projectile parity slice beyond current bounded hit/guard/clash routes.
5. Stage BGCtrl slice with animated/velocity/tile/parallax evidence.
6. Palette application slice: ACT/SFF palette remap plus PalFX/RemapPal interaction.
7. CMD/CNS compiler hardening: source-located AST/IR for dynamic params and unsupported expressions.
8. Studio Build/Evidence as single trust source: stale fixture, blocked export, next-action workflow.
9. IKEMEN reference expansion: map ZSS/Lua/screenpack findings to scanner tests and blocked runtime claims.
10. ChangeAnim2 depth slice: missing-action fallback, redirects, helper/custom-state ownership, and multi-import SFF namespace behavior.

## Score Movement Rules

Docs-only roadmap/setup work can improve handoff quality but does not raise compatibility or port scores. Scores move only when one of these changes:

- Required runtime trace or focused test proves new behavior.
- Browser visual QA proves a visible runtime/Studio/render workflow.
- Fixture evidence proves a local imported package route.
- Package/build evidence proves a new export or persistence capability.

When a score changes, update this file, `docs/PROGRESS_TRACKER.md`, and `docs/ROADMAP_EXECUTION_BOARD.md` in the same round.

## Claim Rules

- Do not say "MUGEN compatible" without naming the fixture or trace artifact.
- Do not say "IKEMEN supported" while IKEMEN remains scanner-only.
- Do not count generated/native fighters as imported compatibility evidence.
- Do not raise scores from docs alone; scores move when tests, traces, browser evidence, or fixture results improve.
- Any changed score must update this file, `docs/PROGRESS_TRACKER.md`, and `docs/ROADMAP_EXECUTION_BOARD.md`.
- Any changed release-target wording must update `docs/ROADMAP_RELEASE_TARGETS.md`.

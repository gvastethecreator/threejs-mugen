# Port Completion Scorecard

Last updated: 2026-06-28

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
| Combat/Common1 | 30 | Direct HitDef, guard, hitstun, fall/get-hit/recovery gates, bounded owner-backed and target-owned custom-state routes, bounded hit/guard-sound and hit/guard-spark telemetry plus smoke-gated player AIR spark sprite rendering/source metadata. | Exact guard/fall/recovery, full custom states, throws, priority, KO/round flow. |
| Helpers/projectiles/explods | 25 | Bounded effect actors, projectile/Helper/Explod traces, pause budgets. | Real helper VM, ownership, redirects, exact lifecycle/pause parity. |
| Stages/presentation/audio | 25 | Basic imported stage route, EnvShake/EnvColor, partial SND event path, bounded HitDef hit/guard sound plus hit/guard spark telemetry, source metadata, first-frame player AIR spark sprite lookup, bounded common/FightFX system lookup frames, runtime package-frame handoff for common/FightFX spark libraries, and 180-frame fallback Three.js spark overlay. | BGCtrl parity, screenpacks/lifebars, real fight.def/FightFX/common AIR/SFF loading plus decoded system-SFF provider registration, audio mixing/timing. |
| IKEMEN profile | 10 | Scanner recognizes ZSS/Lua/config/screenpack/model-stage signals. | No ZSS/Lua execution, rollback/netplay, IKEMEN runtime extensions. |
| Studio/product surface | 25 | Workbench, Assets, Inspector, Debug, Evidence, Modules, Build. | True editing, regeneration, persistent projects, export/publish workflow. |
| Modular engine | 10 | Boundary docs and module contract draft. | Platformer/shared core proof blocked until fighting contracts stabilize. |

Latest ownership checkpoint: `RuntimeContactMemoryWorld` now owns bounded contact-memory creation, reset, mutation, and readback for direct/projectile contact trigger families. It is consumed by `PlayableMatchRuntime`, `RuntimeDirectCombatWorld`, and `RuntimeReversalWorld`; tests and trace stability prove ownership cleanup only, not new parity or score movement.

Latest trace aggregate: `pnpm qa:trace` passes 156/156 artifacts, with 138 required and 18 optional local-fixture artifacts. The latest required runtime oracle is `synthetic-imported-variable.json` checksum `3b33f7a8`, proving bounded imported `VarRandom` executes as typed `variable:varrandom` next to `VarSet`, `VarAdd`, and `VarRangeSet` and can drive an owner-local `var(...)` branch; exact MUGEN random stream parity and helper/parent/root variable scopes remain blocked. The previous required no-op oracle remains `synthetic-imported-noop.json` checksum `a5fe169e`, proving bounded imported `Null`, browser no-op `ForceFeedback`, debug clipboard no-ops `DisplayToClipboard` / `AppendToClipboard` / `ClearClipboard`, and deprecated dust presentation no-op `MakeDust` controller execution visibility before a simple `HitDef` route. The previous required custom-state oracle remains `synthetic-imported-target-owned-custom-state.json` checksum `410fb8c0`, proving bounded `HitDef p2stateno = 888` with `p2getp1state = 0` routes P2 through defender-owned state/action `888` without attacker `customOwnerId`, then returns to state `0`/control through `SelfState`. The previous hit-sound oracle remains `synthetic-imported-hitdef-hit-sound.json` checksum `6fc00d8a`, proving bounded `HitDef hitsound = S5,0` telemetry as an attacker-side `PlaySnd` event after direct hit contact. The previous hit-eligibility oracle remains `synthetic-imported-hitby-reject.json` checksum `65185fd1`, proving bounded static `HitBy value = S,NT` mismatch rejection against `HitDef attr = S,NA` through typed `eligibility:hitby` operation evidence, reject event/combat-reason telemetry, and final P2 life `1000`; `synthetic-imported-hitby-allow.json` checksum `c75d5c7d` remains the matching allow-list acceptance oracle with final P2 life `963`. The previous hitpause oracle remains `synthetic-imported-hitpausetime-ignorehitpause.json` checksum `a3a78bb8`, proving bounded active-state `HitPauseTime > 0` routing through `ignorehitpause = 1` during hitpause, with P1 player advance into state `220` and P2 player freeze evidence. The latest required visual-effect oracle remains `synthetic-imported-modifyexplod.json` checksum `bca75991`, proving bounded typed `ModifyExplod` operation evidence plus live owner-side Explod velocity/scale/priority/pause/remove telemetry. The current required HitDef-effect oracle set is `synthetic-imported-hitdef-hit-sound.json` checksum `6fc00d8a`, `synthetic-imported-hitdef-guard-sound.json` checksum `fdf1f7f6`, proving bounded `HitDef guardsound = S6,0` telemetry as a `PlaySnd` event, `synthetic-imported-hitdef-hit-spark.json` checksum `b6554124`, proving bounded `sparkno = S7001` plus `sparkxy = 10,-72` telemetry as an attacker-side hit `HitSpark` event, and `synthetic-imported-hitdef-guard-spark.json` checksum `72c8fa3a`, proving bounded `guard.sparkno = S7000` plus `sparkxy = 12,-64` telemetry as an attacker-side guard `HitSpark` event on imported direct-hit routes. `HitSparkRenderer` now treats `S` spark refs as player AIR action refs, resolves the first frame to a sprite texture when available, classifies unprefixed refs as common/default and `F` refs as FightFX, preserves runtime-provided package frames from `hitSparkLibraries`, synthesizes bounded common/FightFX system lookup frames when no package frame exists, and `pnpm qa:smoke` requires active desktop/mobile sparks plus player-source resolved-sprite diagnostics; real fight.def/FightFX/common AIR/SFF loading, decoded system-SFF provider registration, exact common/FightFX asset lookup, and timing remain blocked. The latest optional official KFM guard-hit oracles remain `kfm-official-default-guard-state.json` checksum `885bb1da`, `kfm-official-default-crouch-guard-state.json` checksum `d11153d0`, and `kfm-official-default-air-guard-state.json` checksum `f4378971`.

## Gap To Full Port

| Remaining area | Why it is still large |
| --- | --- |
| CNS VM and expression parity | Needs full source-located AST/IR, redirects, dynamic params, helper/parent/root ownership, exact trigger lifetime, and error compatibility. |
| Common1/combat parity | Needs exact get-hit, guard, fall, recovery, throws, custom states, priority, KO/round flow, sparks/sounds, and tick order across real fixtures. |
| Helpers/projectiles/explods | Current visual/effect actors are bounded. Full port needs helper-local VM, ownership, redirects, pause behavior, contact rules, and lifecycle parity. |
| Rendering/palettes/audio | Needs full SFF/ACT palette behavior, FightFX, lifebars, screenpacks, blend/shadow behavior, SND timing/mixing, and presentation parity. |
| IKEMEN-specific runtime | Scanner exists, but ZSS, Lua hooks, rollback/netplay, model-stage, screenpack extensions, team modes, and IKEMEN-specific controllers are not executed. |
| Corpus and tooling | Full port needs many fixture packages, golden traces, compatibility profiles, automated diffing, authoring tools, and release QA. |

Practical reading: from today's evidence, a private playable sandbox is roughly two-thirds usable, a practical MUGEN subset is about one-third there, and a full IKEMEN-GO-class port remains a multi-stage engine project.

## Next Ten Gates

1. Remaining `AssertSpecial` and guard precision: broader lifetime/persistence layering, priority, helper/team/global ownership, pause interaction, real fight.def/FightFX/common guard-effect AIR/SFF loading and provider registration beyond bounded player AIR/system-namespace/package-frame spark sprites/fallback sparks, proximity rules, and KFM/Common1 confirmation beyond bounded stand/crouch/air denial, one-frame expiry traces, and optional guard-hit actor-frame physics telemetry.
2. Exact-enough fall/recovery tick order, optional fixture threshold oracles, and broader recovery parity beyond the current synthetic threshold handoff, summarized actor-frame tick-order gate, bounded synthetic air/ground velocity gates, and synthetic/official early recovery-input reject gates.
3. Helper VM ownership slice: parent/root/redirect reads plus helper-local state execution.
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

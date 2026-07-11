# Delivery Roadmap

Last updated: 2026-07-11

This document turns the broad MUGEN / IKEMEN-GO / Studio / modular-engine horizon into delivery checkpoints. It is an execution companion to `docs/PORT_COMPLETION_SCORECARD.md`, `docs/ROADMAP_EXECUTION_BOARD.md`, and `.scratch/roadmap/issues/`.

Docs-only edits in this file do not move scores. Scores move only through tests, trace gates, browser visual QA, fixture evidence, or export/build evidence.

## Horizon Targets

| Horizon | Definition of usable | Current score source |
| --- | --- | --- |
| Playable private sandbox | Local match runs with native/generated fighters, original stage, HUD, controls, debug, and stable browser QA. | `docs/PORT_COMPLETION_SCORECARD.md` |
| MUGEN-lite playable MVP | KFM/Common1-style package can load and execute common idle, walk, crouch, jump, attack, guard, hitstun, fall, and recovery routes with unsupported features reported. | `docs/PORT_COMPLETION_SCORECARD.md` |
| Practical MUGEN compatibility | Many character/stage packages load without per-character patches and expose useful compatibility reports. | `docs/PORT_COMPLETION_SCORECARD.md` |
| MUGEN 1.0/1.1 port | Runtime, parser, render, audio, palettes, FightFX, screenpacks, common states, helpers, projectiles, and combat approach broad parity. | `docs/PORT_COMPLETION_SCORECARD.md` |
| IKEMEN-GO-class port | IKEMEN-specific ZSS/Lua/config/screenpack/team/rollback/netplay semantics move from scanner-only into executable systems. | `docs/PORT_COMPLETION_SCORECARD.md` |
| Creator Studio / modular engine | Project workbench edits assets, runtime modules, evidence, builds, exports, and later non-fighting modules through shared contracts. | `docs/PORT_COMPLETION_SCORECARD.md` |

## Delivery Phases

### Phase 0 - Control Plane

Goal: keep agents aligned and prevent false compatibility claims.

Required evidence:

- `AGENTS.md` has repo rules, setup-project profile, skill routing, and verification rules.
- `docs/agents/*` defines local issue tracker, triage labels, and domain-doc routing.
- `.scratch/roadmap/` contains local PRD/issues for work slicing.
- Roadmap docs name claim allowed / claim blocked for every compatibility step.

Exit gate:

- Any new agent can answer "what next?" from `AGENTS.md`, `docs/ROADMAP_NAVIGATION.md`, and `docs/ROADMAP_EXECUTION_BOARD.md`.

### Phase 1 - Playable Native Sandbox

Goal: keep a stable playable match while imported compatibility grows.

Required evidence:

- Browser smoke screenshots for desktop/mobile runtime.
- Native/generated fighters remain controllable.
- Stage, HUD, debug, hitboxes, hurtboxes, hit pause, hit stun, life, power, KO/time-over, and reset keep working.
- Generated asset provenance and motion/scale QA remain visible.

Exit gate:

- `pnpm qa:smoke` passes after visual/runtime changes.
- Screenshots show no broken canvas, layout overlap, or missing controls.

### Phase 2 - Imported Character Core

Goal: turn KFM/Common1-style imported content into an evidence-backed playable subset.

Required evidence:

- DEF, AIR, CMD, CNS/ST, SFF, SND paths parse and report errors without crashing.
- SFF sprites render where supported, with fallback compatibility errors where unsupported.
- AIR frames and Clsn1/Clsn2 boxes remain inspectable.
- CMD buffer can activate common directions/buttons and named commands.
- CNS controllers execute through typed operations, not ad hoc side effects.

Exit gate:

- Required trace artifacts prove each route.
- Optional official KFM/local fixtures can strengthen claims without bundling assets.

### Phase 3 - Runtime VM And Common1 Parity

Goal: deepen the fighting runtime toward exact-enough MUGEN semantics.

Required evidence:

- State -1 command routing and common state transitions preserve tick order.
- Guard, hitstun, fall, recovery, get-hit vars, contact counters, and resource changes have trace gates.
- Helper, Explod, Projectile, Target, Pause/SuperPause, ReversalDef, HitOverride, AssertSpecial, and Var controllers move behind named runtime worlds.
- Unsupported triggers/controllers are reported in compatibility output instead of crashing.

Exit gate:

- `pnpm qa:trace` passes with required artifacts and documented checksums.
- Any checksum drift is intentional, documented, and tied to a new claim.

### Phase 4 - Presentation, Audio, Palettes, And Stages

Goal: make imported content look and sound closer to MUGEN while preserving runtime truth.

Required evidence:

- FightFX/common AIR/SFF discovery, provider registration, sprite-axis binding, frame duration, layering, scale, palette, and fallback policy are covered.
- SND playback timing and stop semantics are bounded through audio events.
- Stage DEF/SFF/BGCtrl support grows through matrix entries and visual QA.
- ACT palette and PalFX/RemapPal interactions get parser/runtime/render gates.

Exit gate:

- Browser visual QA proves visible changes.
- `docs/STAGE_COMPATIBILITY_MATRIX.md`, `docs/SUPPORTED_FEATURES.md`, and `docs/QA_AND_ACCEPTANCE_GATES.md` stay synchronized.

### Phase 5 - Studio Trust Chain

Goal: make Studio useful from day one as a workbench, not a decorative shell.

Required evidence:

- Workbench, Assets, Inspector, Debug, Evidence, Modules, and Build read real project/runtime/evidence data.
- Evidence and Build share one status/next-action contract.
- Imported source relink, trace comparison, package export, runtime manifest, and blocked actions are visible.
- Product UI changes pass visual QA.

Exit gate:

- `pnpm qa:smoke` proves Studio surfaces.
- Screenshot inspection confirms no fake green states or unsupported-action ambiguity.

### Phase 6 - IKEMEN Scanner And Bounded Runtime Bridge

Goal: expand IKEMEN knowledge and explicit-profile runtime slices without pretending either proves broad IKEMEN gameplay.

Required evidence:

- Scanner recognizes ZSS, Lua hooks, IKEMEN configs, screenpack/select signals, model-stage signals, and IKEMEN-only controllers/triggers.
- Each finding is classified as recognized, unsupported, or unknown.
- I1 scanner remains separate from I2 runtime.
- Current I2 evidence covers bounded root/helper RunOrder, Pause/SuperPause, team topology/eligibility/registry/live state, and inert P3-P8 ownership.
- Root participation, activation, identity/redirect policy, standby CNS scheduling, input/effects/combat/round/presentation, lifebar, and resources advance through separate gates.

Exit gate:

- Scanner tests prove recognition.
- Each I2 slice names the pinned source revision, explicit profile, focused tests, required trace when behavior changes, and blocked consumers.
- ZSS/Lua, tag/simul gameplay, rollback, netplay, model/video presentation, and broad parity remain blocked until dedicated evidence exists.

### Phase 7 - Modular Engine Extraction

Goal: extract reusable project/asset/input/tick/render/audio/debug/build contracts after fighting runtime evidence stabilizes.

Required evidence:

- Shared modules do not import CNS, CMD, HitDef, rounds, helpers, targets, or MUGEN command routing.
- Fighting-specific modules depend on shared contracts, not the reverse.
- First non-fighting experiment starts from proven shared seams.

Exit gate:

- Boundary tests or docs prove no fighting leakage.
- Fighting smoke and trace gates remain green.

## Next Evidence Ladder

| Step | Work package | Evidence that moves project |
| --- | --- | --- |
| 1 | G1 current-truth reconciliation | Remove already-closed HitDef/presentation/schedule/Common1/guard gates from active queues and separate I1 from I2. |
| 2 | I2 root participation | Prove P3-P8/cap/reset/lifecycle breadth and publish `RuntimeRootParticipation/v0`-style diagnostics without activation or gameplay. |
| 3 | R1 post-KO timeline | Required KO/time-over ordering plus bounded `NoKOSlow`, with no motif/team/continue claim. |
| 4 | I2 activation then redirects | Plural active-root projection and batch standby transition first; identity/Partner/Enemy/P2 matrix second. |
| 5 | I2 standby schedule | Standby roots execute CNS in the explicit profile and same-tick TagIn/TagOut visibility is trace-gated before later gameplay consumers. |
| 6 | S1 source workflow | Identity/permission/conflict/write-reimport/invalidation/rollback smoke; undo/migration deferred. |
| 7 | A1/I1/M1 later | Permission-aware provenance, package scanner, then a real shared product contract with boundary proof. |

## Closeout Template

Use this for every meaningful round:

```txt
Changed:
Evidence:
Claim allowed:
Claim blocked:
Docs updated:
Checks:
Next:
```

If the round is docs-only, say "no score movement" explicitly.

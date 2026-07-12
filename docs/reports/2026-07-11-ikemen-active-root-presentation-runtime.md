# IKEMEN Active-root Presentation Runtime Report

Date: 2026-07-11
Scope: Wayfinder 099
Compatibility profile: explicit `ikemen-go` Tag

## Delivered

- `RuntimeRootPresentation/v0` publishes one stable draw/camera decision per owned root plus ordered `drawRootIds` and `cameraRootIds`.
- Explicit Tag draw admits available, non-disabled, non-standby player roots unless live `AssertSpecial invisible` suppresses the body. Camera-X selection is independent and honors standby plus `ScreenBound moveCameraX`.
- `MugenSnapshot.actors` remains the exact P1/P2 playable/HUD/audio/collision pair; P3-P8 remain in `reserveActors`. Non-Tag and Single paths preserve their exact playable pair, including noncanonical ids.
- `RuntimeMatchPresentationSnapshotWorld` receives selected camera roots but retains pair-owned EnvShake and effect groups. Reserve roots now participate in global `NoShadow` projection without widening effects.
- Three.js resolves selected draw ids across pair/reserve storage only for `CharacterRenderer`. Hit sparks, collision debug, effects, HUD, audio, combat, round, and resources remain pair-owned.
- `MatchWorld.rootParticipation` and `RuntimeRootPhaseCapabilities/v1` now report presentation from the same runtime projection. Reset recomputes P1/P2 selection and removes stale P3 meshes.

## Source Basis

- IKEMEN draw enrollment, invisibility, shadow, and reflection rules: [Ikemen-GO `char.go` lines 12649-12857](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L12649-L12857).
- Camera participation rejects standby roots and honors move-camera flags: [Ikemen-GO `char.go` lines 12058-12112](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L12058-L12112).
- ScreenBound owns camera-axis participation: [Ikemen-GO `char.go` lines 9871-9889](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L9871-L9889).
- Shipped Tag entering/leaving/waiting states own offscreen motion and invisibility: [Tag states](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/data/tag.zss#L72-L148), [Tag switch](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/data/tag.zss#L239-L327).
- Full source/local owner map: [`docs/research/2026-07-11-ikemen-active-root-presentation-promotion.md`](../research/2026-07-11-ikemen-active-root-presentation-promotion.md).

## Required Trace

`synthetic-imported-ikemen-active-root-presentation.json` is required.

- Trace checksum: `97255586`.
- Frame checksums: `65b85d54`, `65b00e8f`.
- Atomic host handoff changes exact draw/camera ids to `[p3,p2]` while trace actors stay `[p1,p2]` and reserve actors stay `[p3,p4]`.
- P3/P2 phase capabilities publish presentation; effect, combat, and round evidence remains absent.
- Root presentation is outside the legacy behavior checksum, so the diagnostic can evolve without masking gameplay drift.

## Browser Evidence

- Desktop `1440x960`: `.scratch/qa/qa-smoke/runtime-tag-presentation-desktop.png`; nonblank canvas, 994 unique colors.
- Mobile `390x844`: `.scratch/qa/qa-smoke/runtime-tag-presentation-mobile.png`; nonblank canvas, 1173 unique colors.
- Baseline `[p1,p2]`, handoff `[p3,p2]`, reset `[p1,p2]` match runtime draw/camera ids. Renderer diagnostics contain P2/P3 after handoff and remove P3 after reset.
- HUD remains `Nova Boxer` / `Mira Volt`; snapshot actors remain P1/P2 and reserves remain P3/P4.
- Desktop/mobile screenshots were visually inspected: both selected fighters are visible, framed, nonduplicated, and free of incoherent overlap.

## Verification

- Full suite: 176 files / 1794 tests.
- TypeScript 7: `pnpm typecheck` passed.
- Production build: passed; the existing large-chunk warning remains at 1,607.84 kB for the main JS chunk.
- Trace gates: 542/542 artifacts, including 511 required and 31 optional.
- Browser smoke: passed with no page or console failures.
- Architecture: `pnpm check:boundaries` passed.
- Final diff gate is recorded in the commit closeout.

## Global Project Status

| Area | Current status | Next highest-leverage move |
| --- | --- | --- |
| Playable sandbox | Stable at 65/100; native/generated match and smoke remain green. | Preserve while imported/team runtime expands. |
| Practical MUGEN | Stable at 35/100; this IKEMEN-specific slice adds no MUGEN claim. | Return to bounded post-KO / `NoKOSlow` or fixture-backed compatibility gates. |
| MUGEN MVP | Stable at 20/100. | Exact VM/combat/Common1/corpus breadth remains primary. |
| IKEMEN profile | Runtime evidence adds active-root body/shadow/camera handoff; full horizon remains 6-8/100 and profile evidence row 10. | Wayfinder 100: stage constraints, push, collision, and combat admission map. |
| Creator Studio | Stable at 25/100; no editor workflow changed. | Source identity/reimport and practical state/collision authoring remain open. |
| QA/evidence | 542/542 traces, 176/1794 tests, TypeScript 7 build, desktop/mobile smoke. | Keep one required artifact and browser proof per widened consumer. |

## Adversarial Audit

- Unknown/duplicate presentation ids reject before rendering; noncanonical legacy pairs remain exact.
- Draw and camera failure modes are independent: invisible roots can remain camera candidates, while `moveCameraX = false` does not hide bodies.
- Disabled, non-player, invalid-side, missing-state, standby, empty-side, over-KO, and duplicate-actor paths have focused regression coverage.
- Scheduler diagnostics compare actor-owned phases only within the same actor, preventing one root from masking another root's order divergence.
- Stable P1/P2 storage plus dedicated renderer selection prevents accidental HUD/audio/collision/hit-spark widening.
- Independent second-agent review was unavailable; source specialist, runtime adversary, browser visual, simplifier, and full-gate passes provide the current evidence.

## Quality Record

Task state: completed

Artifact verdict: win against Wayfinder 099 acceptance

Verification state: verified

Deferred: exact Tag leaving/entering overlap, Tag ZSS/Lua, camera Y/zoom parity, stage clamp/push, collision/combat, root-key effects, HUD/audio, round/resources, direct native input/AI, rollback, and netplay

Claim allowed: an already-live explicit-Tag P3-P8 root can own bounded runtime-selected body/shadow/camera presentation while the stable P1/P2 gameplay/HUD pair remains unchanged.

Claim blocked: collidable or fully playable multi-root Tag, exact presentation choreography, score movement, or full MUGEN/IKEMEN parity.

# Playable Port MVP Definition

The MVP is not "all of MUGEN in the browser." The MVP is a playable, inspectable, expandable Three.js port foundation that proves real MUGEN data can drive visible gameplay through measured compatibility layers.

The broader product is a creator studio and modular game engine. That future does not change the first MVP gate: the MUGEN/fighting module must become trustworthy before platformer or other modules are built on top of unstable contracts.

Important wording lock: the first MVP is **partial MUGEN compatibility proven by fixtures**, plus **IKEMEN feature scanning/reporting**. It is not full MUGEN parity, full IKEMEN execution, or a complete multi-genre engine.

## MVP Statement

The MVP is complete when the app can:

- Start directly into a playable local match.
- Load real MUGEN character ZIP/folder packages.
- Load at least one real MUGEN stage package.
- Render decoded character and stage sprites where supported.
- Route real CMD input into real CNS states for a known fixture.
- Execute a documented subset of CNS controllers in the match loop.
- Show hitboxes, hurtboxes, animation, state, command, runtime, and compatibility debug data.
- Export compatibility evidence that explains what parsed, rendered, routed, executed, and failed.
- Classify IKEMEN-only content as recognized/unsupported without attempting ZSS, Lua, or IKEMEN runtime execution.

## Required MVP Fixtures

Use local-only external assets under `.scratch/`, never committed:

| Fixture | MVP Role |
| --- | --- |
| Official KFM | Primary MUGEN 1.1 character compatibility gate. |
| KFM720 | Localcoord / 720p variant gate. |
| CodeFuMan | SFF v1 PCX and alternate KFM-style behavior gate. |
| SF3 Ryu demo | Large third-party stress fixture for parser/report scaling. |
| Native generated fighters | Renderer, controls, sprite-atlas, and gameplay fallback gate. |
| Rooftop Dojo | Native Three.js stage/art pipeline gate. |
| Imported KFM stage | Stage DEF/SFF compatibility gate. |

## Playability Gate

Minimum player-facing behavior:

- P1 keyboard and touch controls.
- CPU P2.
- Walk, crouch, jump, basic attacks.
- Hit pause, hit stun, pushback, damage, life, power.
- Round timer, KO/time-over, pause, step, speed, reset.
- Visible stage floor/bounds/camera.
- Debug overlays for hitboxes, hurtboxes, axis, and grid.

## Imported Character Gate

For official KFM, the MVP should prove:

- DEF, AIR, CMD, CNS/ST, SFF, SND parse without crashing.
- Sprites render from decoded SFF.
- Stage renders from imported DEF/SFF at least partially.
- Stand light punch routes from physical input through CMD `[State -1]` into state `200`.
- One special input, such as `~D, DF, F, x`, routes into its authored state.
- `HitDef` can connect or guard in the simplified runtime.
- Compatibility session records executed states/controllers.

## Runtime Controller Gate

MVP controller subset:

- State and animation: `ChangeState` with partial `anim` override/preserve behavior, `SelfState`, `ChangeAnim` with partial `elem`/`elemtime`, partial `ChangeAnim2`.
- Motion: `VelSet`, `VelAdd`, `VelMul`, `HitVelSet`, `PosSet`, `PosAdd`, `Gravity`.
- Control/status: `CtrlSet`, `StateTypeSet`, `AssertSpecial`.
- Variables/meter/life: `VarSet`, `VarAdd`, `VarRangeSet`, `LifeAdd`, `LifeSet`, `PowerAdd`, `PowerSet`.
- Combat: `HitDef`, `HitBy`, `NotHitBy`, `DefenceMulSet`, target memory controllers.
- Pause/camera/effects: `Pause`, `SuperPause`, `Width`, `PlayerPush`, `Turn`, `PosFreeze`, `ScreenBound`, `SprPriority`, `PalFX`, `AfterImage`, `Explod`, `Projectile`, `Helper`, `EnvShake`.
- Audio: `PlaySnd`, `StopSnd`.
- Safe no-op/reporting: `Null`, browser-inapplicable controllers such as `ForceFeedback`, debug clipboard controllers (`DisplayToClipboard`, `AppendToClipboard`, `ClearClipboard`), deprecated presentation-only `MakeDust`, and helper-lifecycle `DestroySelf` as accepted no-ops. Real helper destruction/removal semantics remain outside this MVP slice.

Controllers can be partial, but the partial behavior must be documented in `docs/SUPPORTED_FEATURES.md`.

## UI Gate

The MVP UI must include:

- File Loader.
- Character Info.
- Animation Browser.
- State Browser.
- Command Browser.
- Runtime Debugger.
- Combat Debugger.
- Compatibility Report.
- Stage Report.
- Console / Warnings.
- Export JSON action.

It does not need a complex visual design, but it must be coherent enough to debug a fixture without reading source code.

## QA Gate

Before calling the MVP usable:

- `pnpm test`
- `pnpm typecheck`
- `pnpm build`
- Browser visual QA with screenshots.
- At least one imported KFM upload in Inspector Mode.
- At least one imported KFM Runtime Mode route.
- At least one native roster match screenshot.
- Compatibility JSON evidence saved under `.scratch/qa/` or `output/playwright/`.

## Non-Goals For MVP

- Full IKEMEN-GO parity.
- ZSS and Lua.
- Rollback/netplay.
- Exact motif/screenpack support.
- Full project creator studio.
- Platformer/beat-em-up module implementation.
- Full helper/custom-state ownership.
- Full stage BGCtrl/3D model stage parity.
- Exact sound channel priority and all fightfx/system fallback behavior.
- Shipping third-party characters or commercial assets in the repo.

## Next MVP After The Fighting Slice

After the playable MUGEN/fighting MVP is trustworthy, the next MVP should be the Creator Studio slice:

- Local project manifest.
- Asset Library for characters/stages/audio/FX.
- Character Studio using the existing animation/collision inspector.
- Stage Studio using the existing imported/native stage preview.
- Playtest launcher that opens Runtime Mode with selected project assets.
- Module selector that initially contains only the fighting/MUGEN module but is shaped to allow platformer later.

The Studio MVP should still be evidence-first:

- Asset Library, Evidence Browser, Build Center, Character Preview, Stage Preview, and Runtime Debug come before advanced editing.
- Every green badge needs linked evidence or a named gate.
- Generated fighters and stages are native/authored assets with prompt/source/atlas/QA provenance; they do not count as imported MUGEN compatibility.
- Before a large Studio interface rebuild, produce three focused visual directions and choose one, then implement it against real data with browser visual QA.

## Usability Definition

The project is "usable" only when a developer can:

1. Run `pnpm install` and `pnpm dev`.
2. Open the app and play a local match immediately.
3. Load a real local character package.
4. See rendered sprites or a clear reason why rendering failed.
5. Inspect states, commands, animations, hitboxes, and unsupported features.
6. Export a compatibility report that can guide the next engine task.

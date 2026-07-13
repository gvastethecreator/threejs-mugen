# Legal ACT/RemapPal Route Report

Date: 2026-07-13
Area: MUGEN-lite palette compatibility
Roadmap entry: 480
Wayfinder ticket: 130

## Delivered

- Extended `MugenLiteJourneyFixture/v1` with two repository-authored 768-byte ACT files: `journey-source.act` and `journey-palette.act`.
- Wired DEF `pal1` and `pal2`, then added imported state `220` with `RemapPal source = 1,1` and `dest = 1,2`, reached through the declared `palette` command (`y`).
- Promoted `mugen-lite-journey-palette` to a required runtime trace rather than reusing the existing movement/combat checks.
- Added loader assertions for both ACT records, exact destination colors, runtime remap telemetry, and browser pixel evidence.
- Added desktop/mobile smoke captures that pause on state `220`, action `200`, frame `0`, verify source/destination telemetry, verify per-color destination coverage within the renderer's color-management tolerance in the projected sprite crop, and require return to idle.

## Official Semantics

The route follows the [official Elecbyte State Controller Reference](https://elecbyte.com/mugendocs/sctrls.html) and its [1.1 controller reference](https://www.elecbyte.com/mugendocs-11b1/sctrls.html): a `RemapPal` mapping selects a source palette group/index and draws it with a destination group/index. The implementation deliberately proves one explicit mapping with two same-depth ACT palettes; it does not infer transitive mappings or broader palette behavior from the single route.

## Evidence

- Package: `MUGEN Lite Journey`, `CC0-1.0`, entry `chars/mugen-lite-journey/journey.def`.
- Package digest: `sha256:b8e917e9b968f86765db017388823e897779d46041b3738a47c702ce57adfc50`.
- Runtime artifact: `.scratch/qa/trace-gates/mugen-lite-journey-palette.json`, checksum `1291909d`, initial `11c566dd`, final `380400cf`, six frames, required gate passed.
- Companion journey refs: `mugen-lite-journey` `7615fd2b`; `mugen-lite-journey-nokoslow` `ceac9f37`.
- Compatibility aggregate: `CompatibilityJourney/v1`, checksum `11da5411`.
- Required trace catalog: `578/578` artifacts passed, `547` required and `31` optional.
- Browser outputs: `.scratch/qa/qa-smoke/diagnostics.json`, plus `mugen-lite-runtime-desktop-palette.png` and `mugen-lite-runtime-mobile-palette.png` from the passing final smoke batch. The diagnostics retain both tolerance counts and RGB-exact counts; the gate uses tolerance counts because WebGL color management changes screenshot RGB values.

## Claim Allowed

One repository-owned legal MUGEN package loads two ACT palettes, executes one imported source-to-destination `RemapPal`, and exposes bounded runtime and browser pixel evidence on desktop and mobile.

## Claim Blocked

Arbitrary palette depth, palette selection UI, transitive mappings, `PalFX` interaction, helper/projectile `ownpal` behavior, exact renderer/palette parity, independent third-party character breadth, exact Common1 timing, broad controller parity, and full MUGEN/IKEMEN parity.

## Closure Audit

- The source and destination are distinct ACT files, so the trace cannot pass by recording a same-palette no-op.
- The required trace checks imported ownership, state/action/frame, controller execution, operation telemetry, and the destination index independently of the browser capture.
- The browser gate checks runtime remap metadata and per-color destination coverage in a camera-projected crop, preventing stage pixels from satisfying the assertion; exact RGB is retained as diagnostics rather than treated as a browser invariant.
- The package digest and aggregate checksum changed after the new files and are locked in focused tests.
- No scorecard movement is inferred. The next independent breadth decision is Wayfinder 131.

## Quality Record

- Focused integration: `MugenLiteJourneyFixture.test.ts` and `CompatibilityJourney.test.ts` pass together, `10/10` tests.
- Full regression: `184` files / `1959` tests. TypeScript 7 typecheck, module boundaries, production build, `qa:trace` (`578/578`, `547` required), and `qa:smoke` all pass; the production build retains the existing `1,662.07 kB` large-chunk advisory.
- Existing production build large-chunk advisory remains outside this feature's claim ceiling.

## Global Status

- Playable sandbox: expanded with a visible legal ACT palette route.
- MUGEN compatibility: one bounded source/destination palette mapping is now loader/runtime/browser evidenced.
- IKEMEN runtime: unchanged.
- Studio/editor: unchanged.
- Scores: unchanged.

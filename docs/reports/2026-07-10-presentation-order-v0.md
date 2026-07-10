# Port Status Report: Presentation Order v0

Date: 2026-07-10

## Completed package

`MugenPresentationOrder/v0` now separates MUGEN presentation semantics from the Three.js r184 adapter. Runtime player snapshots, stage layers, actor/effect meshes, hit sparks, debug collision boxes, pause darkening, and EnvColor overlays use or expose the shared ordering vocabulary.

Proof level: L2 adapted plus L3 desktop/mobile smoke with controlled WebGL overlap pixels. L4 deterministic visual regression and L5 reference-engine parity are not claimed.

## Area status

| Area | Current state | This package | Next risk |
| --- | --- | --- | --- |
| Playable sandbox | Playable local match, imported routes, runtime diagnostics | Stage/player/effect order is explicit and browser-gated | Equal ties, Explod `ontop`, broader effect order |
| Practical MUGEN | Partial compatibility with required traces | HitDef contact priorities now reach renderer semantics | Profile propagation and reference captures |
| Three.js renderer | Axis L2, SprPriority L2, general L3 smoke | Shared semantic key, actor-shadow underlay, and one 2D sorting queue | Afterimages, screenpack, L4/L5 |
| Studio editor | Persistent project name/scene and evidence workbench | Renderer diagnostics remain available through the bridge | First source write/reimport transaction |
| IKEMEN | Scanner/reporting only | `ikemen-go` is modeled but not inferred without evidence | Package-level scanner and executable profile behavior |
| Modular engine | Shared contracts and boundary gates | Semantic model is runtime-owned; Three adapter is separate | Broader presentation ownership and scheduling |

## Published scores

No score movement is claimed: private sandbox 65/100, practical MUGEN 35/100, MUGEN MVP 20/100, full MUGEN 10-12/100, IKEMEN 6-8/100, Studio/modular 25/100.

## Close audit

Adversarial review found actor shadows outside the shared queue, an unjustified semantic clamp, unstable effect-profile inference, and insufficient pixel proof. The close fixes all four: shadows use an actor-underlay phase, semantic values remain intact, effects stay `unknown` until ownership exists, and browser smoke renders four controlled overlap pairs with neutral root groups.

## Verification

- Focused: 5 files, 40 tests.
- Full suite: 155 files, 1535 tests.
- Browser: desktop/mobile semantic chain, four controlled overlap pairs, nonblank canvas, and inspected screenshots; `pnpm qa:smoke` passed in 118.2 s.
- Runtime trace: 526/526 artifacts, 495 required and 31 optional.
- TypeScript 7 typecheck, production build, architecture boundaries, and `git diff --check` passed.

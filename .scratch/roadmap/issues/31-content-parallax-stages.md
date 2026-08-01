# 31 - T446 original parallax stage pack

Status: in_progress
Labels: content-pack, stage, parallax, spritesheet, imagegen, grok-optional
Lane: C3 stages
Priority: P1
Depends on: T447 stage-loader integration

## Current evidence (2026-07-30)

`background-pack.json` exists for all four stages under
`public/stages/{rooftop-dojo,patio-dojo-publicidad,terminal-supermercado-24h,azotea-wifi}`.
The build-game-backgrounds validator passes for each pack with
`representative=true`, current SHA-256 layer hashes and Imagegen provenance.
Composite and scroll GIF proofs were inspected. The four stage definitions are
registered in `src/mugen/runtime/demoStage.ts` and exposed by the app stage
selector. T462 now owns the bounded browser/scroll proof; runtime collision and
final `select.def` package wiring remain open.

## Stage set

`rooftop-dojo`, `patio-dojo-publicidad`, `terminal-supermercado-24h` and
`azotea-wifi`: each has three authored depth layers (`far`, `mid`, `near`),
repeat metadata, collision bounds, palette-safe tiles and stage manifest. The
runtime consumes the layer offsets as `0.08`, `0.42` and `0.88` on X (and
`0.02`, `0.08` and `0.16` on Y), so the depth order is observable rather than
just descriptive metadata.

## Acceptance

Provider-backed layer/tileset runs pass slot, repeat, projection and visual QA;
loader consumes parallax metadata; runtime trace proves scroll/layer order,
stage limits and one selected stage. No scene collage is accepted as a tileset.

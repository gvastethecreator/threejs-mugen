# T302: Carry FightScreen layout layerno

- Type: task
- Status: resolved at bounded presentation-order scope
- Date: 2026-07-20
- Depends on: T301

## Question

How should an authored FightScreen `AnimLayout.layerno` reach the current
Three.js renderer while keeping the source layer calls separate from the
renderer presentation policy?

## Answer

The system-asset model accepts the source layer values `-1`, `0`, `1`, and
`2`. The loader rounds valid values and keeps unknown values out of the
renderable layout contract.

An explicit layer maps to the existing presentation phases: `-1` to stage
background, `0` to actor underlay, `1` to stage foreground, and `2` to
overlay. Background and top entries keep their authored order inside each
phase. An omitted value keeps the current overlay order, which matches the
FightScreen round defaults already used by this port. Diagnostics report
applied and culled layer values.

## Evidence

- Focused loader, renderer, and projection tests: 3 files / 21 tests passed.
- `pnpm typecheck`: passed with the repository TypeScript 7 toolchain.
- `pnpm build`: passed with 322 transformed modules. The existing large-chunk
  warning remains.
- `pnpm qa:smoke`: passed with Vite plus Playwright, desktop/mobile runtime
  captures, Studio authoring/debug captures, and no smoke assertion failure.
- Visual review covered runtime desktop/mobile and Studio authoring/debug
  captures. The main canvas stayed visible and no critical overlap appeared.
- `git diff --check`: passed; existing roadmap CRLF warnings remain unrelated.

## Claim ceiling

Allowed: transport of valid FightScreen layout `layerno` values and bounded
mapping to the current Three.js presentation phases for top/background
entries.

Blocked: exact interleaving with every stage, actor, motif, and character-text
draw pass; primary `AnimTextSnd` layer ownership; tile, advanced transforms,
PalFX, all KO/winner families, direct imported FightScreen browser asset proof,
and full MUGEN/IKEMEN parity.

## Primary sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/common.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go

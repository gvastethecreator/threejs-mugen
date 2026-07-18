# ADR 0022: Common FX Packages

- Status: Accepted bounded loader contract
- Date: 2026-07-18
- Scope: IKEMEN `[Common] Fx*` FightFX DEF loading for imported characters
- Implementation: `750e888e`
- Research: [`docs/research/2026-07-18-common-fx-packages.md`](../research/2026-07-18-common-fx-packages.md)
- Closeout: [`docs/reports/2026-07-18-common-fx-closeout.md`](../reports/2026-07-18-common-fx-closeout.md)

## Context

IKEMEN exposes common FightFX packages through ordered `[Common] Fx*`
configuration entries. The local system-assets loader already consumed the
default FightFX package and character-declared FX packages, but ignored these
global entries. That prevented an imported character's `fightfx.prefix` from
resolving to a configured common package.

## Decision

1. Resolve `Fx` and `Fx<number>` in natural numeric order, using the existing
   root-style and config-relative virtual path rules.
2. Accept supported FightFX `.def` packages and route them through the
   existing AIR/SFF/SND loader.
3. Register common packages before character packages in the existing
   `fightFxLibraries` map.
4. Preserve the first valid normalized prefix and emit duplicate-prefix
   diagnostics for later packages.
5. Record resolved common paths and report missing, ZSS, and wrong-format
   sources through the existing compatibility diagnostics.

## Consequences

Common hit-spark libraries are available to imported fighters without adding a
second runtime asset contract. The bounded first-wins policy is deterministic
but does not claim exact upstream cache lifetime or prefix-promotion parity.
Renderer/audio parity, Common1/default-table completion, ZSS/Lua, rollback,
and full MUGEN/IKEMEN parity remain separate work.

## Evidence

- Focused system-assets/imported-fighter coverage: `15/15` tests passed.
- Full suite: `230/230` files and `2380/2380` tests passed.
- TypeScript 7 typecheck, production build, repository boundaries, and
  redirect boundary passed; the existing Vite large-chunk warning remains.
- `pnpm qa:trace`: `633/633` artifacts passed (`599` required, `34`
  optional).
- `pnpm qa:smoke` was attempted in `.scratch/qa/qa-smoke-t255` but timed out
  after `424.1s` before its diagnostics file was written; no smoke pass is
  claimed for this closeout.

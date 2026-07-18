# ADR 0017: Global Common.States CNS Sources

- Status: Accepted bounded loader contract
- Date: 2026-07-18
- Last reviewed: 2026-07-18 at HEAD `0878f15e`
- Scope: imported character loading from game-config `[Common] States*`
- Implementation: [`0878f15e`](https://github.com/gvastethecreator/threejs-mugen/commit/0878f15e)
- Closeout: [`docs/reports/2026-07-18-global-common-states-cns-closeout.md`](../reports/2026-07-18-global-common-states-cns-closeout.md)
- Research: [`docs/research/2026-07-18-global-common-states-cns.md`](../research/2026-07-18-global-common-states-cns.md)

## Context

The project already loaded character `st*` and DEF `stcommon` sources, but it
ignored the parsed game-config `[Common]` section. IKEMEN documents common
states that apply even when a character DEF does not declare them, and its
compiler loads those files after character and `stcommon` state sources.

## Decision

1. Read keys matching `States`, `States0`, `States1`, ... from `[Common]` in
   natural numeric order.
2. Split comma-separated references and resolve `data/...` paths from the
   virtual root, with config-relative fallback for simple names.
3. Add existing CNS paths after DEF `stcommon` as common state sources.
4. Reuse the existing first-listed normal-state precedence and explicit
   IKEMEN negative-state append policy.
5. Emit a loader warning for missing configured paths.
6. Record `.zss` paths as unsupported `Common.States ZSS` findings and do not
   parse them as CNS.

## Consequences

Positive:

- global CNS states can supply missing identities without modifying character
  DEF files;
- `stcommon` remains the earlier common tier and character overrides remain
  deterministic;
- unsupported ZSS and missing files are actionable in compatibility output.

Boundaries:

- JSON `CommonStates`, ZSS compilation, common commands/constants/AIR/FX, Lua
  insertion/deletion, helper input buffers, and full timing/parity remain open;
- path lookup is limited to the bounded root/config-relative policy.

## Evidence

- `17/17` focused loader/config/compiler tests passed.
- `230/230` test files and `2372/2372` tests passed after implementation.
- TypeScript 7 typecheck/build and both repository boundary guards passed.

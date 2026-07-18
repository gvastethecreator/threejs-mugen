# ADR 0020: Common Constant Sources

- Status: Accepted bounded loader contract
- Date: 2026-07-18
- Scope: IKEMEN `[Common] Const*` loading for imported characters
- Implementation: `e765822a`
- Research: [`docs/research/2026-07-18-common-const-loading.md`](../research/2026-07-18-common-const-loading.md)
- Closeout: [`docs/reports/2026-07-18-common-config-loader-closeout.md`](../reports/2026-07-18-common-config-loader-closeout.md)

## Context

IKEMEN loads common constants before character CNS constants, allowing
character-owned values to override global defaults. The local loader had no
CommonConst path, so common-only values were unavailable to imported state
compilation and runtime expressions.

## Decision

1. Resolve `Const` and `Const<number>` in natural numeric order with the shared
   root/config-relative virtual path convention.
2. Parse extension-neutral INI constant sources through the existing CNS
   constant parser, while explicitly blocking ZSS sources.
3. Seed the map from CommonConst, then parse character CNS values so the
   character owns duplicate keys.
4. Record supported common constant paths and warn on missing references.

## Consequences

Common defaults and character overrides are now visible in one constants map,
including when no character CNS exists. State-file constant merging remains the
existing loader contract. Common AIR/FX, ZSS/Lua, runtime default tables,
rollback/netplay, and full parity remain outside this decision.

## Evidence

The loader/config focus passes `31/31`; TypeScript 7 typecheck, production
build, repository boundary guards, redirect guard, and diff hygiene pass.

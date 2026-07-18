# ADR 0021: Common AIR Sources

- Status: Accepted bounded loader contract
- Date: 2026-07-18
- Scope: IKEMEN `[Common] Air*` animation merge for imported characters
- Implementation: `9fed3eda`
- Research: [`docs/research/2026-07-18-common-air-merge.md`](../research/2026-07-18-common-air-merge.md)
- Closeout: [`docs/reports/2026-07-18-common-config-loader-closeout.md`](../reports/2026-07-18-common-config-loader-closeout.md)

## Context

IKEMEN parses common AIR with the character's local sprite archive and adds
only action IDs that the character table does not already own. The local
loader previously exposed only the DEF AIR map.

## Decision

1. Resolve `Air` and `Air<number>` in natural numeric order with root and
   config-relative virtual paths.
2. Parse supported `.air` files through the existing AIR parser.
3. Preserve character action IDs, then first-wins common IDs across sources.
4. Record common animation paths and surface missing/unsupported evidence.

## Consequences

Imported characters can reference bounded common actions without replacing
character-authored actions or introducing a second animation runtime model.
Sprite archive ownership, full Copy-action resolution, CommonFx, ZSS/Lua,
render parity, rollback/netplay, and full parity remain blocked.

## Evidence

The loader/config focus passes `31/31`; TypeScript 7 typecheck, production
build, repository boundary guards, redirect guard, and diff hygiene pass.

# ADR 0019: Common Command Sources

- Status: Accepted bounded loader contract
- Date: 2026-07-18
- Scope: IKEMEN `[Common] Cmd*` loading for imported characters
- Implementation: `991613f7`
- Research: [`docs/research/2026-07-18-common-cmd-loading.md`](../research/2026-07-18-common-cmd-loading.md)
- Closeout: [`docs/reports/2026-07-18-common-config-loader-closeout.md`](../reports/2026-07-18-common-config-loader-closeout.md)

## Context

IKEMEN appends configured common command files to the character CMD before
compiling its command list. The local loader previously parsed only the DEF
command file, leaving common commands unavailable to root and helper command
buffers.

## Decision

1. Resolve `Cmd` and `Cmd<number>` from the case-insensitive `[Common]` section
   in natural numeric order.
2. Resolve both root-style and config-relative virtual paths.
3. Concatenate supported `.cmd` sources after the character CMD and parse once.
4. Keep State -1 CNS extraction limited to the character CMD source.
5. Record supported common command paths and surface missing/ZSS evidence.

## Consequences

Root and helper command buffers now see the same merged command definitions and
the compatibility report recognizes common-only command coverage. This does
not implement ZSS/Lua commands, raw IKEMEN input history, AI commands, SOCD,
rollback/netplay, or full parity.

## Evidence

The loader/config focus passes `31/31`; TypeScript 7 typecheck, production
build, repository boundary guards, redirect guard, and diff hygiene pass.

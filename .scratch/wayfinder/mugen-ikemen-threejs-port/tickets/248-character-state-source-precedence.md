# Ticket 248: Character State Source Precedence

- Status: resolved
- Area: loader / source ownership
- Feature commit: `e47d4f76`
- Decision: ADR 0015
- Research: `docs/research/2026-07-18-character-state-source-precedence.md`

## Problem

The loader currently treats the DEF `cns` entry as a state source even when
the character does not list that path under `st*`. Numbered state files also
follow DEF insertion order, so duplicate identity selection can vary with
unrelated line ordering.

## Acceptance

- [x] constants-only `cns` contributes constants but no state definitions;
- [x] a path listed as both `cns` and `st` contributes constants and states;
- [x] `st`, `st0`, ..., `st9` resolve in canonical order regardless of DEF line order;
- [x] character state identities win over `stcommon` fallback identities;
- [x] a missing character identity is filled by `stcommon`;
- [x] existing loader/compiler/runtime focal suites, TypeScript 7/build,
  boundaries, redirect guard, and diff hygiene pass;
- [x] closeout names unsupported duplicate-append and merge assumptions.

## Out of scope

Controller append/merge semantics, CMD-vs-state-file duplicate handling,
IKEMEN ZSS/Lua insertion, helper input buffers, rollback/netplay, and full
MUGEN/IKEMEN parity.

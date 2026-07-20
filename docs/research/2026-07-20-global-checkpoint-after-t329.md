# Global checkpoint after T329

Date: 2026-07-20
HEAD: `4e15a736`
Scope: FightScreen win-type KO causes and repository-wide runtime gates

## Closed commits

- `806dfea2` records root self-KO causes.
- `bba05cdd` carries explicit hit-source identity.
- `3f50f608` classifies hit-state KO ownership.
- `4e15a736` carries source attr and guard-KO cause context.

## Global evidence

- `pnpm exec vitest run --testTimeout=30000`: passed, 238 files / 2567 tests.
- The default `pnpm test` run reached 2566/2567 before the repository's 5s
  timeout expired in one heavy trace test; that same test passed alone and the
  full rerun passed with the 30s test window.
- `pnpm build`: passed with TypeScript 7, Vite, and 324 transformed modules.
  The existing large-chunk advisory remains.
- `pnpm qa:trace`: passed, 633/633 artifacts; 599 required and 34 optional.
- `qa:trace` emitted a non-blocking WebSocket port-in-use warning during the
  run; no listener remained after completion.
- The test output still reports jsdom's unavailable canvas `getContext()`
  implementation in canvas-dependent tests; the suite remains green.
- No renderer or UI code changed in this checkpoint, so browser smoke remains
  deferred to the next visual surface change.

## Global report

FightScreen win-type derivation now has live perfect/clutch facts, root-roster
team aggregation, direct HitDef and root-owned projectile causes, root self-KO
ownership, hit-state suicide/teammate ownership, and rival source attr or
guard-KO preservation. Compatibility scores and full-port claims remain
unchanged.

## Open gates

Helper and redirected hit-source admission, reversal/reflection, exact source
slot arbitration, direct imported screenpack proof, ZSS/Lua, rollback/netplay,
and full MUGEN/IKEMEN result parity remain open.

## Sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go

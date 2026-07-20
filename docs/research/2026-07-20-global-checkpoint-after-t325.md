# Global checkpoint after T325

Date: 2026-07-20  
Scope: FightScreen win-type live derivation and repository-wide runtime gate

## Closed commits

- `48cb4fde` derives perfect and clutch from live life facts.
- `3f302038` aggregates root-roster team facts.
- `8e270f66` carries direct HitDef KO causes.
- `1a781067` carries root-owned projectile KO causes.

## Global evidence

- `pnpm test`: passed, 237 files / 2548 tests.
- `pnpm build`: passed with TypeScript 7 and Vite; 324 modules. The existing
  large-chunk advisory remains.
- `pnpm qa:trace`: passed, 633/633 artifacts; 599 required and 34 optional.
- The test output still reports jsdom's unavailable canvas `getContext()`
  implementation in canvas-dependent tests; the suite remains green.
- No renderer or UI code changed in this checkpoint, so browser smoke is
  deferred to the next visual surface change.

## Global report

FightScreen win-type selection now has live perfect/clutch facts, root-roster
aggregation, direct HitDef causes, and root-owned projectile causes. The next
implementation slice adds root self-KO evidence at focused scope; the full
port objective and compatibility scores remain unchanged.

## Open gates

Hit-state suicide, teammate ownership, reversal/reflection, exact source slot
admission, screenpack browser proof, ZSS/Lua, rollback/netplay, and full
MUGEN/IKEMEN result parity remain open.

# T406 StateDef + HitDef active juggle (bounded)

Date: 2026-07-26
Type: runtime research / closeout
Ticket: T406
Feature SHA: `07ad9227`
Depends on: T405 (`462591ad`), DA26-01..06, official matrix doc

## Question

Can the port arm and spend an active character juggle cost (`c.juggle`) from
StateDef `juggle` and explicit HitDef `air.juggle`, preserve omitted-field
identity, reset after falling contact, keep the T405 rejection sequence, and
expose JuggleTrace fields?

## Answer

Yes, under explicit `ikemen-go`, for direct normal HitDefs only.

## Contract

1. **Presence**
   - StateDef `juggle` omitted leaves prior cost on attack states.
   - StateDef `juggle` present arms `runtime.juggle` with origin `statedef`.
   - HitDef `air.juggle` omitted sets move field to 0 after setup but does not
     rewrite `runtime.juggle`.
   - HitDef `air.juggle` explicit (including 0) arms `runtime.juggle` with
     origin `hitdef` under `ikemen-go`.
2. **Entry / reset**
   - IKEMEN non-attack state entry with omitted StateDef juggle resets cost to 0
     (`juggleOrigin = reset`).
   - MUGEN profile does not auto-clear on non-A entry.
   - Falling contact always zeros the attacker cost after spend/bypass.
3. **Spend / admission (T405 preserved)**
   - Target budget still comes from `data.airjuggle` (default 15).
   - Remaining points stay keyed by attacker id.
   - Over-budget falling contact rejects; `NoJuggleCheck` bypasses without spend.
   - A later explicit HitDef re-arms cost before the next admission check.
4. **Trace**
   - Snapshots carry `juggle`, `juggleOrigin`, and `airJugglePoints`.
   - `buildRuntimeJuggleTrace` records cost, origin, remaining, falling, bypass,
     and admission.

## In scope

- CNS StateDef parse + negative-state merge of `juggle`
- Active cost arming from StateDef entry and HitDef activation
- Direct combat cost resolution and post-falling reset
- Focused unit/runtime tests and required T405 imported trace still green
- Wayfinder T406 ticket, map, board, backlog Entry 586

## Out of scope / claim blocked

- Projectile and Helper juggle ownership
- ModifyHitDef `air.juggle`
- Full periodic non-A frame loop parity
- Global Vitest / aggregate traces / score movement (DA26-08+)
- Full MUGEN/IKEMEN parity

## Verification

- Focused suites: RuntimeJuggleSystem, RuntimeCombatResolutionSystem,
  HitDefSystem, RuntimeStateEntrySystem, CmdCnsParser, RuntimeCompiler
- Required imported trace: `creates a required IKEMEN direct air.juggle artifact`
- `pnpm typecheck` exit 0
- Logs: implementer scratch `phase0-tests.log`, `typecheck.log`

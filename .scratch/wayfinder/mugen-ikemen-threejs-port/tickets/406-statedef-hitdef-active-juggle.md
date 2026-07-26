# T406 StateDef and HitDef Active Juggle

Type: task

Status: resolved in `07ad9227`

## Question

Can StateDef `juggle` and explicit HitDef `air.juggle` arm an active character
cost, preserve omission identity, reset after falling contact, keep the T405
rejection sequence, and expose JuggleTrace fields under `ikemen-go`?

## Source evidence

- Official matrix: `docs/research/2026-07-26-ikemen-juggle-official-matrix.md`
- Closeout note: `docs/research/2026-07-26-ikemen-statedef-hitdef-juggle.md`
- Pins `05b7d98a` / `4aa0ba38` juggle lines (HitDef arm, spend, non-A reset,
  StateDef bytecode) as cited in the matrix

## Contract

Under explicit `ikemen-go`:

- StateDef present arms `runtime.juggle` (`juggleOrigin = statedef`).
- StateDef omitted on attack inherits; on non-A clears to 0.
- Explicit HitDef `air.juggle` arms cost (`juggleOrigin = hitdef`); omitted
  leaves prior cost while move field defaults to 0.
- Direct admission/spend uses the armed cost; falling contact then zeros it.
- T405 sequence still holds: 4→1, reject, NoJuggleCheck bypass.
- Trace snapshots expose `juggle`, `juggleOrigin`, `airJugglePoints`.

## In scope

Parser/model, state entry, HitDef arming, RuntimeJuggleSystem cost/trace,
focused tests, required air.juggle artifact, docs/ticket/map/board/backlog.

## Out of scope

Projectile/Helper, ModifyHitDef air.juggle, global checkpoint, scores,
full parity.

## Ownership (DA26-01)

- Base SHA before incomplete juggle code: `c01d5e70`
- Incomplete six-file write-set had landed inside `c62eabe5` docs chore without
  ticket/tests; this ticket owns and finishes that surface exclusively.
- Exclusive files:
  - `src/mugen/compiler/StateSourceResolver.ts`
  - `src/mugen/model/MugenState.ts`
  - `src/mugen/parsers/CnsParser.ts`
  - `src/mugen/runtime/RuntimeJuggleSystem.ts`
  - `src/mugen/runtime/RuntimeStateEntrySystem.ts`
  - `src/mugen/runtime/types.ts`
  - Plus required callers: `HitDefSystem.ts`, `PlayableMatchRuntime.ts`,
    `HelperSystem.ts`, `RuntimeTrace.ts`, focused tests, research docs

## Verification

Focused juggle/HitDef/state-entry/parser/compiler suites and the required
direct air.juggle trace pass. TypeScript gate passes. Global suite remains
queued as DA26-08.

## Answer

Yes, bounded. Close as T406 with claim-allowed language above; keep
Projectile/Helper/ModifyHitDef and scores claim-blocked.

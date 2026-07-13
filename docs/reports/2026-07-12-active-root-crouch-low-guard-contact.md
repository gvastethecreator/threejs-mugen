# Active-root Crouch Low Guard Contact Report

Date: 2026-07-12
Area: IKEMEN active-root direct combat

## Delivered

- Added one required IKEMEN Tag trace for a low-only active-root contact against a command-driven C defender.
- The fixture routes held-back plus held-down P3 into imported state `10` C. Its state-local `PosSet` exists only to separate P3 from P1 in the four-root geometry before P4 becomes a direct low-only guard-distance source.
- Existing `120` `StateTypeSet` C, `120 -> 131`, root admission, direct combat, target memory, and default guard-hit selection own the resulting contact.

## Evidence

- Required trace: `synthetic-imported-ikemen-active-root-crouch-low-guard.json`.
- Trace checksum: `748679c8`; final checksum: `acec0c58`.
- Tick 1: P3 enters state `10` C at x = `-220`; distant P4 `guardflag = L` does not latch.
- Tick 2: P3 state-`10` `PosSet` reaches x = `-100`, then P4 is the sole direct `InGuardDist` source without contact.
- Tick 3: P3 executes `120` `StateTypeSet` C.
- Tick 4: P3 completes `120 -> 131`; delayed P4 overlap admits only `p4 -> p3`, records `guard`, target id `129`, state `152`, `guarding = true`, and life `1000`.
- Verification: `pnpm qa:trace` passed `573/573` artifacts (`542` required); `pnpm test` passed `183` files / `1948` tests; `pnpm typecheck`, `pnpm check:boundaries`, and `pnpm build` passed. Build retains the known `1,661.99 kB` JavaScript chunk advisory.

## Claim Allowed

One normal-tick direct low-only active-root contact can guard a defender in a command-driven imported C fixture state through existing state entry, guard-distance, StateTypeSet, root admission, direct combat, target/contact, and default guard-state ownership.

## Claim Blocked

Generic active-root crouch movement, standing or air behavior, a complete high/low matrix, automatic-guard breadth, projectiles/helpers, custom state, forceguard, target precedence, Pause/hitpause, guard presentation/audio, team replacement/KO, HUD/resources, rollback, score movement, and full MUGEN/IKEMEN parity.

## Closure Audit

- Reviewed the state-`10` fixture path and corrected duplicate statedef generation so the command route resolves the authored C metadata rather than an earlier generic state.
- The required gate now pins C/no-latch geometry at x = `-220`, state-local positioning/latch at x = `-100`, ordered controller events, and exact admission array `["p4->p3"]`; P1/P2 do not enter the contact result.
- No generic root admission, guard-distance, or combat resolver ownership changed. The only reusable fixture-builder extension is an explicitly requested state-local `PosSet`.

## Global Status

- Playable sandbox: unchanged.
- MUGEN compatibility: unchanged.
- IKEMEN runtime: active-root guard coverage now includes MA standing/crouch contact, C-versus-H rejection, and one low-only C guard contact.
- Studio/editor: unchanged.
- Modular boundary: generic root admission and combat remain intact; command-driven state-`10` geometry is fixture-only evidence.

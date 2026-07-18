# Root State -1 Ordering Closeout

Date: 2026-07-18

Feature commit: `730f1a14`

Decision: [`docs/adr/0014-root-state-minus-one-ordering.md`](../adr/0014-root-state-minus-one-ordering.md)

Research: [`docs/research/2026-07-18-root-state-minus-one-ordering.md`](../research/2026-07-18-root-state-minus-one-ordering.md)

## Result

Imported root actors that declare numeric State -3 or State -2 now observe the
bounded order `-3 -> -2 -> -1 -> current` under explicit `mugen-1.1` and
`ikemen-go` profiles. Player input and simple AI sample their intent before
fighter advancement; State -1 setup and command routing run at the ordered
boundary, and the original fallback control applies only when State -1 did not
route a state. AI therefore gets the same command-first behavior as player
input, including a movable IKEMEN Pause tick.

Built-in actors, unknown profiles, imported roots without numeric `-3/-2`,
helpers, standby roots, and pause-immune-only paths do not inherit this
deferral implicitly.

## Evidence

- Focused runtime gate: `262/262` tests passed across
  `RuntimeInputControlSystem.test.ts` and `PlayableMatchRuntime.test.ts`.
- Focal coverage proves `-3 -> -2 -> -1 -> current` for MUGEN 1.1 and IKEMEN,
  AI State -1 routing before heuristic fallback, and the movable IKEMEN Pause
  boundary.
- TypeScript 7 and production build: passed. Vite retains the existing large
  JavaScript chunk warning (>500 kB); this feature does not change that risk.
- `pnpm check:boundaries`: passed.
- `pnpm check:redirect-boundary`: passed.
- `git diff --check`: passed.
- Source basis: [Elecbyte CNS format](https://elecbyte.com/mugendocs/cns.html)
  defines the special-state order and State -1 command role; the IKEMEN
  extension is documented in the [official IKEMEN-GO Miscellaneous info](https://github.com/ikemen-engine/Ikemen-GO/wiki/Miscellaneous-info).

## Scope ceiling

This closeout does not claim exact State -1 controller interleaving after a
ChangeState, Common1 or multi-file source merge precedence, helper input
buffers, persistent-controller parity, rollback/netplay behavior, renderer or
Studio integration, compatibility score movement, or full MUGEN/IKEMEN parity.

## Next frontier

The next source-backed scheduler decision is the exact Common1/multi-file
negative-state merge contract or helper input-buffer ownership. Both require
separate source and runtime evidence rather than extending this root-only
boundary by assumption.

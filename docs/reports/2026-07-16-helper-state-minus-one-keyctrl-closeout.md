# Helper State -1 keyctrl Closeout

Date: 2026-07-16

Feature commit: `be951e9a`

Decision: [`docs/adr/0008-helper-state-minus-one-keyctrl.md`](../adr/0008-helper-state-minus-one-keyctrl.md)

Research: [`docs/research/2026-07-16-helper-state-minus-one-keyctrl.md`](../research/2026-07-16-helper-state-minus-one-keyctrl.md)

## Result

The bounded helper State -1 route is implemented and accepted. Static
`keyctrl` is compiled and retained on helper actors. Enabled helpers receive
the owning program's CMD `stateEntries`, execute them before their current
state, and evaluate command triggers through the owning root command buffer.
Disabled helpers skip the pass; current helper state and pause gating remain
active.

## Evidence

- `HelperSystem.test.ts`: enabled, command-miss, keyctrl-off, current-state,
  and pause-gated cases.
- `RuntimeCompiler.test.ts`: typed `keyCtrl` operation projection.
- `PlayableMatchRuntime.test.ts`: real imported helper and owner command
  buffer route.
- Grouped focal checkpoint: `404/404` tests passed across six files.
- `pnpm build`: TypeScript 7 and Vite production build passed.
- `pnpm check:boundaries`: passed.
- `pnpm check:redirect-boundary`: passed.
- `git diff --check`: passed for the feature slice.

## Scope ceiling

This closeout does not claim helper States -4/+1, helper-specific input
buffers, Common1/global negative-state merge or exact ordering, recursive
RedirectID, rollback/netplay, or full MUGEN/IKEMEN parity.

## Next frontier

ADR 0009 closes Ticket 242 with a bounded IKEMEN-only helper State -2/-3
route. The next frontier is the separate State -4/+1 pause and ordering
contract.

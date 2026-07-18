# Helper State -4 Closeout

Date: 2026-07-18

Feature commit: `a8777cce`

Decision: [`docs/adr/0010-helper-state-minus-four.md`](../adr/0010-helper-state-minus-four.md)

Research: [`docs/research/2026-07-18-helper-state-minus-four-plus-one.md`](../research/2026-07-18-helper-state-minus-four-plus-one.md)

## Result

IKEMEN helpers now execute owner State -4 before the normal helper advance
gate, even when `keyctrl` is disabled and the helper is under Pause. MUGEN and
`unknown` profiles skip the route. State +1 is intentionally deferred because
the current parser/model cannot preserve its distinct identity from State 1.

## Evidence

- `HelperSystem.test.ts`: keyctrl-off, profile-gated, and Pause-safe State -4.
- `PlayableMatchRuntime.test.ts`: imported helper route and MUGEN boundary.
- Grouped focal checkpoint: `405/405` tests passed across six files.
- `pnpm build`: TypeScript 7 and Vite production build passed; existing chunk
  warning only.
- `pnpm check:boundaries`: passed.
- `pnpm check:redirect-boundary`: passed.
- `git diff --check`: passed.

## Scope ceiling

This closeout does not claim State +1, root global-state scheduling, Common1 or
multi-file merge precedence, helper-specific input buffers, exact complete
global ordering, rollback/netplay, or full MUGEN/IKEMEN parity.

## Next frontier

Ticket 244 defines the special-state identity required before implementing
IKEMEN State +1.

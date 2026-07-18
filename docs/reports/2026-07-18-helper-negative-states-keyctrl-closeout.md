# Helper States -2/-3 keyctrl Closeout

Date: 2026-07-18

Feature commit: `12f483ec`

Decision: [`docs/adr/0009-helper-negative-states-keyctrl.md`](../adr/0009-helper-negative-states-keyctrl.md)

Research: [`docs/research/2026-07-18-helper-negative-states-keyctrl.md`](../research/2026-07-18-helper-negative-states-keyctrl.md)

## Result

IKEMEN helpers with `keyctrl = 1` now execute owner States -3 and -2 before
the existing State -1 pass and current helper state. MUGEN and `unknown`
profiles keep -2/-3 closed. The common post-fighter path now forwards the
owner profile and command callback, so the earlier State -1 behavior is also
preserved outside IKEMEN actor-order advancement.

## Evidence

- `HelperSystem.test.ts`: IKEMEN order, keyctrl gate, and MUGEN profile
  boundary.
- `PlayableMatchRuntime.test.ts`: real imported helper route through both
  IKEMEN and MUGEN profiles.
- `RuntimeEffectHelperContextSystem.test.ts`: profile propagation.
- Grouped focal checkpoint: `405/405` tests passed across six files.
- `pnpm build`: TypeScript 7 and Vite production build passed; existing chunk
  warning only.
- `pnpm check:boundaries`: passed.
- `pnpm check:redirect-boundary`: passed.
- `git diff --check`: passed.

## Scope ceiling

This closeout does not claim root State -2/-3 scheduling, Common1 or
multi-file merge precedence, helper-specific input buffers, exact complete
global ordering, State +1, rollback/netplay, or full MUGEN/IKEMEN parity.

## Next frontier

Ticket 243 records the State -4 closeout; the next frontier is State +1
identity and post-current ordering.

# Research: root negative-state scheduling

Date: 2026-07-18

Question: what bounded root execution contract is supported by the official
MUGEN/IKEMEN global-state rules and the current runtime architecture?

## Official source

- [IKEMEN-GO Miscellaneous info](https://github.com/ikemen-engine/Ikemen-GO/wiki/Miscellaneous-info)
  states that MUGEN global States -1, -2, and -3 execute constantly; -2 is
  checked every tick, while -3 is skipped while another player's state data
  is active. IKEMEN preserves that model, allows helper -2/-3 only with
  `keyctrl`, adds -4/+1, and orders global passes as `-4, -3, -2, -1,
  normal, +1`.
- [Elecbyte CNS reference](https://elecbyte.com/mugendocs/cns.html) remains the
  MUGEN baseline for special-state/controller syntax.

## Repository facts

- The loader already compiles negative CNS states into `RuntimeProgramIr`.
- `PlayableMatchRuntime` currently dispatches only the actor's current state
  through `RuntimeRootCnsExecutionWorld`; `stateEntries` are reserved for the
  command-gated State -1 route.
- `RuntimeActiveControllerScanWorld` selects the borrowed `stateOwner` program
  for custom states and has no explicit state-program override.
- `onlyIgnoreHitPause` already filters current-state controllers in paused and
  hitpause branches.

## Bounded implementation answer

Add an explicit state-number/owner override to the existing active-controller
scan/run path. Before the current-state dispatch, execute root-owned -3 then
-2 for explicit MUGEN/IKEMEN profiles. Skip -3 when `stateOwner` indicates
borrowed state data; force the root actor as owner for both global lookups.
Reuse the existing participation capabilities and hitpause filter. Do not
execute `stateEntries` in this slice, so command State -1 behavior stays
unchanged.

## Claim ceiling

The bounded route does not establish root -4/+1 ordering, State -1 command
priority, IKEMEN multi-file append precedence, helper input buffers,
rollback/netplay, or complete VM parity.

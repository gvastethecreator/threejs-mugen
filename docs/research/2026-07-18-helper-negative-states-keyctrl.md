# Research: Helper States -2/-3 and keyctrl

Date: 2026-07-18

Question: can the port add a bounded IKEMEN helper State -2/-3 route after
State -1 without changing MUGEN behavior or pretending to own the complete
global-state VM?

## Official sources

- [IKEMEN-GO Miscellaneous info](https://github.com/ikemen-engine/Ikemen-GO/wiki/Miscellaneous-info)
  documents that MUGEN helpers cannot access States -2/-3, while IKEMEN
  helpers can access them through `keyctrl`. The same reference records the
  negative-state order `-4, -3, -2, -1, normal states, +1` and distinguishes
  IKEMEN-only -4/+1 behavior.
- [Elecbyte CNS reference](https://elecbyte.com/mugendocs/cns.html) keeps the
  MUGEN baseline at special states -3, -2, -1, with helpers excluded from
  -3/-2 and requiring command control for -1.
- [Elecbyte state controller reference](https://elecbyte.com/mugendocs/sctrls.html)
  defines helper `keyctrl` as the opt-in for command input and inherited
  State -1 behavior; the port keeps that existing owner-command boundary.

## Repository facts

- `MugenCharacterLoader` filters CMD-derived `stateEntryControllers` to
  State -1, but character/state files already preserve negative `StateDef`
  records in `MugenCharacter.states`.
- `RuntimeProgramIr.states` therefore already represents owner State -2/-3
  programs. No new global VM or state-entry merge is needed for this bounded
  helper route.
- `RuntimeHelper` already stores `keyCtrl`, carries the owner runtime program,
  and executes State -1 before its current state.
- The lifecycle bridge now carries `runtimeProfile`; the active post-fighter
  path also carries the owning root's command callback, so both actor-order and
  legacy MUGEN helper advancement use the same owner context.

## Decision

Implement `HelperNegativeStates/v0` with these limits:

1. Gate States -3/-2 on `runtimeProfile === "ikemen-go"` and
   `helper.keyCtrl === true`.
2. Execute the existing owner `RuntimeProgramIr.states` entries in the order
   -3, -2, then the existing State -1 `stateEntries` pass, then the helper's
   current state.
3. Reuse helper-local variables, state transitions, triggers, and dispatch;
   keep all passes inside the existing pause/advance gate.
4. Keep MUGEN and `unknown` profiles unchanged for -2/-3.
5. Do not synthesize helper input, Common1 files, multi-file negative-state
   merge precedence, root negative-state execution, or State -4/+1.

## Proof target

- an IKEMEN keyctrl helper applies -3, then -2, then -1, then current-state
  mutations;
- MUGEN does not apply -2/-3 while retaining the existing keyctrl State -1
  route;
- keyctrl-off helpers skip all negative-state passes;
- the production post-fighter bridge forwards owner command/profile context;
- existing pause and helper-local lifecycle behavior remains unchanged.

## Result

The route is implemented in `12f483ec` and accepted by ADR 0009. Focused
coverage is `405/405`; TypeScript 7/build, repository boundaries, redirected
dispatch guard, and diff hygiene pass.

## Claim ceiling

This result does not claim root State -2/-3 scheduling, Common1 or multi-file
merge precedence, helper-specific input buffers, exact complete global tick
ordering, State -4/+1, rollback/netplay, or full MUGEN/IKEMEN parity.

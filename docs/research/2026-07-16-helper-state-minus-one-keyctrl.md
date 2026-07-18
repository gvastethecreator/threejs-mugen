# Research: Helper State -1 and keyctrl

Date: 2026-07-16

Question: can the port admit a bounded helper `State -1` route without
pretending that helpers inherit the complete global-state VM?

## Official sources

- [IKEMEN-GO Miscellaneous info](https://github.com/ikemen-engine/Ikemen-GO/wiki/Miscellaneous-info)
  states that helpers do not access State -1 unless `keyctrl` is enabled. It
  also documents the helper restrictions for States -2/-3, the IKEMEN-only
  States -4/+1, and the global processing order.
- [Elecbyte state controller reference](https://elecbyte.com/mugendocs/sctrls.html)
  states that a helper without `ctrl` does not access command input or inherit
  State -1. This is the compatibility baseline for the explicit `keyctrl`
  gate.

## Repository facts

- `HelperSystem` currently executes only the helper's current positive state.
- `RuntimeProgramIr` already stores compiled CMD State -1 controllers as
  `stateEntries`, but helper spawn input preserves only `states`.
- `HelperControllerOp` does not compile `keyctrl`.
- Helper expression context already supports `commandActive`, but the helper
  path does not receive the owner's command buffer callback.

## Decision candidate

Implement a bounded `HelperStateMinusOne/v0` slice:

1. compile static `keyctrl = 0/1` on Helper;
2. carry the owner runtime program's `stateEntries` into the helper;
3. execute those State -1 controllers before the helper's current state only
   when `keyctrl` is true;
4. evaluate `command =`/`selfcommand =` through the owning root's command
   buffer and command definitions;
5. preserve helper-local runtime/controller ownership and existing pause gate;
6. keep malformed/unsupported controller behavior fail-closed through the
   existing helper dispatch path.

The route does not implement helper States -2/-3, IKEMEN States -4/+1,
cross-file negative-state merge semantics, helper-specific input buffers, or
full global-state parity. A keyctrl-disabled helper must remain byte-identical
with respect to State -1 execution.

## Proof target

- a keyctrl-enabled helper executes a command-gated State -1 controller;
- a keyctrl-disabled helper does not execute the same controller;
- the helper current state still executes after the State -1 pass;
- the command callback reads the owner root's active command buffer;
- pause gating remains unchanged;
- existing helper/runtime traces remain green.

## Implementation result

Commit `be951e9a` accepts this slice at bounded scope. `HelperControllerOp`
parses static `keyctrl`; `RuntimeHelperProgram` carries optional `stateEntries`;
the helper runner executes State -1 before its current positive state only when
`keyCtrl === true`. The helper expression context now receives the owning
root's `CommandBuffer.isCommandActive` callback through the effect lifecycle
bridge. The pass remains inside `canAdvanceRuntimeHelper`, so hit-pause and
Pause/SuperPause movement-time behavior is unchanged.

Focused proof:

- `HelperSystem.test.ts` proves enabled, command-miss, keyctrl-off, current
  state continuation, and pause-gated paths.
- `RuntimeCompiler.test.ts` proves `keyctrl = 1` becomes typed operation data.
- `PlayableMatchRuntime.test.ts` proves an imported helper reads a custom
  owner command from the real root command buffer.
- The grouped focal checkpoint is `404/404`; TypeScript 7/build, repository
  boundaries, redirected-dispatch guard, and diff hygiene pass.

The implementation does not claim State +1, helper-specific input,
Common1 merge precedence, exact global negative-state ordering, rollback,
netplay, or full MUGEN/IKEMEN parity. ADR 0009 subsequently accepts the
bounded IKEMEN State -2/-3 extension using the same owner and fail-closed
boundaries.

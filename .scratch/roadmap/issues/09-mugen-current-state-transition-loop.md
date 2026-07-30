# 09 - T424 M.U.G.E.N Same-Tick State Transition Chain

Status: ready-for-agent
Labels: runtime-trace, mugen-compat, cns-vm, ready-for-agent
Lane: R1 runtime compatibility
Priority: P0

## Objective

Implement Elecbyte's current-state `ChangeState` continuation rule for imported
roots and helpers: stop the remaining controllers in the source state, enter
the destination, and continue from its first controller during the same tick.

## Official contract

Elecbyte's [CNS format](https://www.elecbyte.com/mugendocs-11b1/cns.html) defines
special-state order and says a transition from the current state skips the
remaining controllers and continues from the beginning of the new state.
Controller order is significant and parameters resolve when the controller
triggers.

## Current evidence

- Root/helper `-3 -> -2 -> -1 -> current` scheduling is already covered.
- Ikemen `-4`/`+1`, negative-state append, and bounded helper `keyctrl` are
  already covered and must not be rebuilt.
- `runActiveStateControllers` invokes the current state once and discards the
  scan result, while `runRuntimeHelperStateControllers` changes state without
  continuing the destination program.

## Scope

- Return a typed transition result from root/helper state execution.
- Continue only the current-state chain; do not rerun special states after each
  transition.
- Preserve `Time = 0`, state-entry setup, animation ownership, and trailing
  controller skip semantics for every transition.
- Add a deterministic per-actor/tick transition budget and an explicit cycle
  diagnostic; never allow authored loops to hang the browser.
- Apply to imported `mugen-1.1` and `ikemen-go`; keep `unknown` behavior
  unchanged.

## Acceptance

- Root `0 -> 100 -> 200` executes destination controllers in order in one tick.
- A controller after the source `ChangeState` does not execute.
- Helper current-state chaining follows the same rule.
- A self-loop or multi-state cycle stops at the declared budget and produces a
  stable diagnostic without corrupting state.
- Existing negative/global-state order tests remain green.
- One required imported trace proves the named chain and blocked cycle path.

## Verification

- Focused state-dispatch, root runtime, and helper tests.
- Expanded compiler/CNS/runtime suite.
- `pnpm typecheck`, `pnpm build`, `pnpm check:boundaries`, and `pnpm qa:trace`.
- `git diff --check` on the owned delta.

## Claim ceiling

Allowed: same-tick imported current-state chaining for the tested root/helper
profiles plus deterministic cycle protection.

Blocked: full CNS VM order, all controller parameter semantics, exact engine
failure behavior for infinite loops, ZSS execution, score movement, or full
M.U.G.E.N/Ikemen parity.

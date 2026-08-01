# T424 — M.U.G.E.N current-state transition chain

Date: 2026-07-30  
Task: T424  
Issue: `.scratch/roadmap/issues/09-mugen-current-state-transition-loop.md`  
Profile scope: imported `mugen-1.1` and `ikemen-go` current-state execution

## Official contract

Elecbyte's [CNS reference](https://www.elecbyte.com/mugendocs-11b1/cns.html)
defines the current-state controller pass after special states. An applied
`ChangeState` stops the remaining source controllers, enters the destination,
and starts its controller list in the same tick. The existing special-state
order (`-4/-3/-2/-1/+1`) stays separate from this current-state continuation.

## Implementation

- `RuntimeStateTransitionSystem.ts` defines the typed transition boundary and a
  shared budget of 32 transitions per current-state pass.
- `RuntimeActiveControllerRunWorld` carries applied root `ChangeState` metadata
  (`fromState`, `toState`, source `ControllerIr`) out of the scan.
- `PlayableMatchRuntime` repeats only the current-state root call. A blocked
  cycle records `compatibilitySession.stateTransitionCycles` and uses the
  existing blocked-controller route when supplied.
- `runRuntimeHelperStateControllers` returns a discriminated result with an
  optional transition. The helper current-state wrapper repeats destinations;
  negative and `+1` phases remain single-pass.
- `RuntimeTrace` preserves cycle diagnostics in compatibility evidence.

## Proof

Focused imported root fixture:

- `0 -> 100 -> 200` completes in one tick.
- Source controllers after each `ChangeState` do not execute.
- Controller trace starts `ChangeState@0`, `ChangeState@100`, `VarSet@200`.

Focused helper fixture:

- `1200 -> 1300 -> 1400` completes in one helper tick.
- Source tails do not execute; destination `ChangeAnim` does.
- A `1200 <-> 1300` cycle executes exactly 32 transitions, then returns with
  a stable callback diagnostic.

Commands:

```text
pnpm exec vitest run src/tests/RuntimeActiveControllerRunSystem.test.ts src/tests/HelperSystem.test.ts src/tests/PlayableMatchRuntime.test.ts src/tests/RuntimeTrace.test.ts src/tests/RuntimeTraceArtifact.test.ts
pnpm typecheck
pnpm test -- --pool=threads --maxWorkers=1
pnpm build
pnpm check:boundaries
pnpm qa:trace
git diff --check
```

Result: 403 focused tests across 5 files, the serial repository suite (305
files / 3234 tests), TypeScript, production build, boundary checks, and diff
hygiene all passed. `qa:trace` passed 667/667 artifacts (633 required, 34
optional).

## Claim ceiling

Allowed: tested imported root/helper same-tick current-state chaining for the
two explicit profiles, source-tail skipping, trace-visible transition metadata,
and deterministic cycle protection.

Not claimed: full CNS controller semantics, exact infinite-loop failure behavior
of either engine, ZSS execution, all team/Tag/Simul/Turns paths, or complete
M.U.G.E.N/Ikemen parity.

## Next task

T424 is closed-bounded. Continue with T425: reconcile Ikemen stable P2 switch
behavior against pinned source and wiki contract before implementation.

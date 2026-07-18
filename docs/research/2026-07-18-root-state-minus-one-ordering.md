# Root State -1 Ordering Research

## Question

Where should an imported root character's CMD `[State -1]` pass run relative to
root global states and ordinary input/AI fallback control?

## Source authority

Elecbyte's CNS reference states that M.U.G.E.N evaluates special states on each
game tick in increasing order `-3`, `-2`, then `-1`, followed by the current
state. It also states that State -1 is the command/input state and that a state
transition from a special state aborts the remainder of that state pass.

Source: [Elecbyte CNS format](https://elecbyte.com/mugendocs/cns.html), sections
"States", "Details on StateDef", and "The CMD file".

IKEMEN-GO's [Miscellaneous info](https://github.com/ikemen-engine/Ikemen-GO/wiki/Miscellaneous-info)
documents the extended root order around this baseline, including State -4
before the negative passes and State +1 after the current state. This slice
keeps that existing IKEMEN-only gate and only closes the missing State -1
relative position.

## Repository finding

Before this slice, the playable runtime executed imported `stateEntries` from
the input-control callback. Root State -3 and State -2 were already executed
inside the later fighter-controller pass. That made the observable order
`State -1 -> State -3 -> State -2 -> current`, even though the relative
controller ownership and profile gates for `-3/-2` were correct.

The same input callback also immediately applied the standard local/AI fallback.
Moving only the State -1 call would make an authored command route observe
`ctrl = 0` after a fallback attack had already started, so the input/AI intent
has to be sampled first and applied after the ordered special-state boundary.

## Decision boundary

Implement one bounded root slice:

1. sample player input or simple AI intent before fighter advancement;
2. execute root `-3` and `-2` through the existing profile-aware runner;
3. execute imported root State -1 setup and command routing;
4. apply the sampled fallback control only when State -1 did not route;
5. execute the current state.

Blocked from this slice: helper input buffers, Common1/multi-file merge
precedence, exact interleaving of every State -1 controller after a
ChangeState, persistent-controller parity, rollback/netplay, and full
M.U.G.E.N/IKEMEN parity.

## Evidence target

The focal gate must prove:

- `-3 -> -2 -> -1 -> current` for explicit MUGEN 1.1 and IKEMEN profiles;
- an AI-controlled imported root can route State -1 before its heuristic;
- a movable IKEMEN Pause tick retains the same State -1 ordering;
- existing input-control and runtime focused suites remain green.

## Outcome

The bounded implementation landed in `730f1a14`. The gate is green at
`262/262` focused tests, TypeScript 7/build, repository boundary checks,
redirected-target guard, and `git diff --check`. The implementation defers
the sampled player/AI fallback only when an imported root actually exposes
numeric `-3` or `-2`; imported roots without those states, built-in actors,
unknown profiles, helpers, and standby paths retain their previous control
timing.

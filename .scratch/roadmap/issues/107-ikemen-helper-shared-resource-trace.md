# T533 — Ikemen Helper shared-resource trace

## Objective

Promote the already-tested Helper Life/Power team-bank contract to a required
imported gameplay trace. The trace must prove all of the following in one
deterministic Tag run:

- the imported Helper is spawned by the imported root;
- the explicit Ikemen shared-resource contract is enabled;
- LifeSet/PowerSet mutate the active and reserve roots through the team bank;
- the Helper keeps its local Life/Power values unchanged;
- the trace records the contract route without double-applying local writes.

## Current evidence

- `PlayableMatchRuntime.test.ts` covers the imported Tag runtime path.
- `HelperSystem.test.ts` covers opt-in interception and denied-admission fail-closed behavior.
- `pnpm qa:trace` passes 686/686, including the required imported Helper
  shared-resource and red-life artifacts. The original Helper fixture remains
  intentionally local and is still the compatibility baseline.
- The synthetic fighter generator now exposes `helperResourceRouteShared` so
  shared routes can use time-based triggers instead of reading Helper-local
  resources after a root-bank write.
- Public runtime regression coverage now passes the enabled and disabled
  contract paths (`PlayableMatchRuntime` focused suite: 19 tests).
- Shared writes now record their operation against the imported root in
  compatibility telemetry, so a promoted trace can observe the sink without
  pretending the Helper mutated locally.

## Promotion gate

The required `RuntimeTraceArtifact` and focused preset test are now registered
in `scripts/qa_traces.cjs`. The artifact proves root Life/Power mutation,
Helper-local immutability, shared controller/operation telemetry, and the
Helper effect payload. The existing local-resource artifact remains the
compatibility baseline for non-shared Helpers.

## Latest verification

2026-08-02: `pnpm qa:trace` passed `685/685` (651 required); the public Helper
contract suite passed 24 focused tests across `HelperSystem` and
`PlayableMatchRuntime`. T533 is closed-bounded; broader auxiliary-resource
parity remains outside this trace.

Historical probe (2026-08-02): an early prototype artifact was intentionally
not promoted because its Helper remained in state 1200 and shared controllers
were not admitted. That probe is superseded by the imported compiled fixture
and the required 686/686 artifacts below.

The follow-up probe also tried a roster-complete Tag fixture and a monotonic
`Time >= 0` shared-controller trigger; it still did not produce admitted
resource operations. This confirms the next fix belongs in the runtime
Helper/Team-bank admission or scheduling seam, not in trace assertions.

The later preset-level `ControllerIr` probe was discarded: synthetic fighter
definitions intentionally do not carry the compiled `runtimeProgram`; that is
attached by the imported-character pipeline. Any next diagnostic must inspect
the post-import compiled program, otherwise it is not evidence about Helper
state 1200.

2026-08-02 implementation: `HelperSystem` records ephemeral shared Life/Power
and red-life shadows after an accepted sink write. Subsequent Helper triggers
read those shadows while snapshots and persisted Helper resources remain
local. T533 closes the Life/Power promotion; issue 108/T534 closes the
red-life extension. Broader auxiliary-resource parity remains outside scope.

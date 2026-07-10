# IKEMEN helper-owned SuperPause checkpoint

## Outcome

Helper CNS can now execute Pause/SuperPause through the shared match pipeline. Identity, dynamic params, root power, helper sound, helper-local movetime, telemetry, and current-target defense scaling stay distinct.

## Evidence

- `synthetic-imported-ikemen-helper-superpause.json`: checksum `d1444550`, final `f6c7da6a`.
- Trace result: helper owner `p1-helper-0`, root power `125`, helper sound `S9,4`, movetime `3`, target P2 life `959`.
- `pnpm qa:trace`: 537/537, 506 required and 31 optional.
- `pnpm test`: 161 files, 1587 tests.
- `pnpm typecheck`, `pnpm build`, and `pnpm check:boundaries`: passed. Build retains the known Vite large-chunk warning.

## Quality verdict

Artifact: better. Verification: verified for bounded explicit-IKEMEN 1v1 helper-owned SuperPause. No visual gate was applicable.

## Blocked

Opposing-team defense breadth, `p2defmul = 0`, nested helper ancestry, exact buffer/audio/hitpause parity, teams/simul/tag, rollback, and full IKEMEN parity.

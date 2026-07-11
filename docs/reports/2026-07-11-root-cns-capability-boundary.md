# Root CNS capability boundary checkpoint

## Outcome

Root controller execution now has explicit playable/standby capabilities. Disallowed routes stop before hooks.

## Evidence

- State/runtime-controller-type/side-effect/unsupported block matrix.
- End-to-end standby run: LifeAdd and sound blocked; VarSet and ChangeState executed; blocked/executed counts distinct.
- Playable and standby profile selection.
- Existing PlayableMatchRuntime focused suite green.
- Full gates: 167 files / 1618 tests; 538/538 traces (507 required, 31 optional); TypeScript 7 typecheck/build; boundaries and diff check pass. Build retains known large-chunk and plugin-timing warnings.

## Blocked

P3-P8 scheduling, standby side effects, TagIn/TagOut, gameplay consumers, and full parity.

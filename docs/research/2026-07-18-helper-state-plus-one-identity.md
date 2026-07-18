# Research: Helper State +1 identity

Date: 2026-07-18

Question: how can the port preserve IKEMEN helper State +1 without colliding
with normal State 1 or widening the MUGEN runtime lane?

## Official source

- [IKEMEN-GO Miscellaneous info](https://github.com/ikemen-engine/Ikemen-GO/wiki/Miscellaneous-info)
  defines +1 as a pass after the current state, like -4 for Pause/SuperPause
  behavior, and available to helpers without `keyctrl`.
- [Elecbyte CNS reference](https://elecbyte.com/mugendocs/cns.html) remains the
  baseline for the MUGEN numeric state model; this slice is profile-gated to
  IKEMEN.

## Repository facts before implementation

- CNS headers accepted `-?\d+` but rejected literal `+1`.
- `MugenStateDef.id`, `MugenStateController.stateId`, `StateProgramIr.id`,
  source selection, and runtime lookup were numeric-only.
- Treating `+1` as `1` would make normal State 1 and post-current State +1
  indistinguishable in source precedence, availability, and helper execution.

## Implementation

- Added `MugenStateSpecial = "plus-one"` and shared identity helpers.
- Parser now preserves `+1` on state definitions and controllers.
- Source resolution keys normal and special states separately.
- Compiled controller/state IR carries the special marker; normal numeric
  ChangeState routability filters special states out.
- Normal runtime lookups ignore special states. The helper runner invokes +1
  after current state only for `ikemen-go`, including Pause and keyctrl-off
  paths.

## Evidence

- `CmdCnsParser.test.ts`: literal and numeric identity collision proof.
- `StateSourceResolver.test.ts`: separate source identities.
- `RuntimeCompiler.test.ts`: IR preservation and normal-route exclusion.
- `HelperSystem.test.ts`: ordering, profile, keyctrl, and Pause behavior.
- `PlayableMatchRuntime.test.ts`: imported end-to-end helper route.
- Focal checkpoint: `345/345`.

## Result and ceiling

The bounded helper State +1 route is implemented in `2a8dba68` with type
contract follow-up `0caa2a34` and accepted by ADR 0011. The TypeScript 7 build,
repository boundaries, redirect-boundary guard, and diff hygiene pass. This
does not claim root +1 scheduling, Common1/multi-file merge parity,
helper input-buffer parity, rollback/netplay, or full compatibility.

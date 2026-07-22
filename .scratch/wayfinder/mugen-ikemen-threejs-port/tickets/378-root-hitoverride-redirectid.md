# T378 Root HitOverride RedirectID

Type: task

Status: resolved

Blocked by: None

## Question

Can an IKEMEN root apply the existing bounded `HitOverride` fields to another
verified root through `RedirectID`, while evaluating dynamic caller fields
before the receiver runs its own controllers?

## Source evidence

- Pinned [IKEMEN-GO compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L3371-L3423)
  reads `redirectid` before `attr`, `slot`, `stateno`, `time`, and the
  supported boolean and guard parameters.
- Pinned [IKEMEN-GO runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L10298-L10370)
  resolves the destination first, evaluates controller fields with the caller,
  and writes the destination override slot.

## Local finding

The generic root runtime-controller route supports eligibility redirects but
does not classify `HitOverride`. Static compilation also omits `redirectid`,
so a root controller currently remains local and dynamic values would be at
risk of reading the receiver after its own later controller writes.

## Quality contract

Under explicit `ikemen-go`, one verified root may redirect the current bounded
`HitOverride` subset to one other verified root. Dynamic `slot`, `stateno`,
`time`, `forceair`, `forceguard`, and `keepstate` materialize in caller context
before receiver dispatch. Existing attr, guard flags, slot sorting, combat
redirect, and current duration behavior remain owned by the hit-defense and
hit-override systems.

## In scope

- Root-to-root active-controller `HitOverride RedirectID`.
- Static RedirectID compilation and typed dynamic caller materialization.
- Current local `attr`, `slot`, `stateno`, `time`, boolean, and guard flag
  subset with imported trace proof.

## Result

Resolved in `1e28e811`. The typed operation preserves static `RedirectID`,
the active root dispatcher resolves one verified root under `ikemen-go`, and
the redirect materializes supported dynamic fields in the caller before it
writes the receiver slot. The required imported trace reaches slot `2` and
the receiver override state after a matching direct HitDef. The grouped
T378-T379 focal batch passes 5 files / 1014 tests; broad typecheck, complete
Vitest, trace aggregate, build, and boundary gates remain queued for the next
runtime checkpoint.

## Out of scope

Helpers, custom states, teams, source-exact `time` corner values and slot
decay schedule, full attr/guard grammar, hitpause scheduling, rollback,
renderer behavior, score movement, and full MUGEN/IKEMEN parity.

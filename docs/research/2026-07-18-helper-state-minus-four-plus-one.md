# Research: Helper State -4/+1 representation

Date: 2026-07-18

Question: can helper State -4 and +1 be added without silently changing the
MUGEN lane or collapsing IKEMEN's `+1` identity into normal State 1?

## Official sources

- [IKEMEN-GO Miscellaneous info](https://github.com/ikemen-engine/Ikemen-GO/wiki/Miscellaneous-info)
  defines State -4 as State -2 that is not halted by Pause/SuperPause and is
  available to helpers without `keyctrl`. It defines State +1 as the same
  behavior after the character's current state and records the order
  `-4, -3, -2, -1, normal states, +1`.
- [Elecbyte CNS reference](https://elecbyte.com/mugendocs/cns.html) documents
  the MUGEN special-state baseline without IKEMEN's -4/+1 additions.

## Repository facts

- CNS parsing currently accepts `-4` because state headers use `-?\d+`.
- CNS parsing does not accept a literal `+1` state header.
- `MugenStateDef.id`, `MugenStateController.stateId`, `StateProgramIr.id`,
  source resolution, and runtime state lookup are numeric. A normalized +1
  would collide with a normal State 1 in source selection and runtime lookup.
- The helper runner already has an explicit pre-current-state hook, a profile
  gate, and a pause gate. State -4 can reuse those surfaces without a new VM.

## Decision

1. Implement State -4 for `ikemen-go` helpers before the normal advance gate;
   this makes it run through Pause/SuperPause even when `keyctrl` is false.
2. Keep State -4 closed for MUGEN and `unknown` profiles.
3. Defer State +1 until a `MugenStateIdentity/v1` representation distinguishes
   signed special states from ordinary numeric states across parser, source
   resolver, compiler, availability, and runtime lookup.
4. Do not normalize +1 to State 1 or claim post-current ordering before that
   identity work is proven.

## Proof target

- State -4 mutation occurs for IKEMEN helpers with keyctrl off;
- State -4 still executes during Pause while normal state/age remain frozen;
- MUGEN/unknown skip State -4;
- the +1 parser/model collision is covered as an explicit missing capability,
  not hidden by a fallback.

## Result

State -4 is implemented in `a8777cce` and accepted by ADR 0010. State +1 is
tracked by Ticket 244.

## Claim ceiling

No root -4/+1 scheduler, Common1/multi-file merge precedence, helper input
buffer, exact complete tick order, rollback/netplay, or full parity claim is
made here.

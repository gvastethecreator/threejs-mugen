# Research: root State -4/+1 scheduling

Date: 2026-07-18

Question: what bounded root scheduling contract is supported for IKEMEN State
-4 and State +1, including pause behavior and the already-modelled special
identity?

## Official sources

- [IKEMEN-GO Miscellaneous info](https://github.com/ikemen-engine/Ikemen-GO/wiki/Miscellaneous-info)
  records the global order `-4, -3, -2, -1, normal, +1`. It describes State
  -4 as a State -2-like pass that is not halted by Pause/SuperPause and is
  available to helpers without `keyctrl`; State +1 follows the current state
  with the same pause immunity and helper access.
- [Elecbyte CNS reference](https://elecbyte.com/mugendocs/cns.html) remains the
  MUGEN baseline and does not establish IKEMEN's added root -4/+1 behavior.

## Repository facts

- The parser, source resolver, compiler IR, normal lookup, and helper runner
  already preserve literal `+1` as `id = 1` plus `special = "plus-one"`.
- Root `PlayableMatchRuntime` now runs root `-3 -> -2 -> normal` for explicit
  MUGEN/IKEMEN profiles. The active scan/run seam still selects only normal
  special identity and has no `stateSpecial` input.
- Root controllers called from hitpause currently use
  `onlyIgnoreHitPause: true`. IKEMEN regular Pause advances a root only when
  `pauseWorld.canActorMove` allows it, so a pause-immune root pass needs a
  separate frozen-actor hook to avoid running the normal state.
- The helper route already calls its bounded `-4` and `+1` passes outside the
  helper's normal state gate, but helper/global input-buffer and exact pause
  orchestration remain separate.

## Bounded implementation answer

Add optional `stateSpecial` to the active scan/run input and resolve the
composite identity. For `ikemen-go`, execute root `-4` with the pause filter
disabled before root `-3`, root `-2`, and normal state; execute root `+1` with
the same bypass after normal state. During hitpause, run only the pause-immune
`-4` and `+1` passes unconditionally while retaining the existing
`ignorehitpause` scan for the other passes. During regular IKEMEN Pause, invoke
the two special-only passes for roots that cannot advance normally.

## Claim ceiling

This bounded route does not establish State -1 command priority, Common1 or
multi-file append precedence, helper input-buffer parity, rollback/netplay, or
complete IKEMEN/MUGEN compatibility.

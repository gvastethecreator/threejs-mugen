# Issue 286 — transient Projectile `keepstate` release

## Status

Closed-bounded as T712 on 2026-08-11.

## Contract

Ikemen clears `ghv.keepstate` from `actionRun` after the accepted contact
metadata has been consumed. The pinned source clears the flag after applying
the resource deltas and the `GetHitVar` damage/power fields
(`.scratch/upstream-ikemen-go/src/char.go`, around lines 11946–11973). The
get-hit transition gate also excludes the actor while `ghv.keepstate` is true
(`char.go`, around lines 12418–12435).

The local runtime now keeps `hitVars.keepState` available through the active
hit/guard stun tick, then removes only that transient field before the next
active state-controller pass. Other `hitVars` metadata remains intact. This
prevents a previous Projectile or direct HitDef contact from suppressing later
state presentation forever.

## Evidence

- `RuntimeStunSystem.test.ts`: the flag remains effective while stun is active
  and is released when the window expires without deleting `hitTime` metadata.
- Required root Projectile trace:
  `synthetic-imported-projectile-keepstate-release` — trace `05c07804`, final
  `3445d810`.
- Required Helper-parented Projectile trace:
  `synthetic-imported-helper-projectile-keepstate-release` — trace `46636488`,
  final `719f5d6e`.

## Allowed claim

Root and Helper Projectile contacts, plus the shared direct-contact stun path,
release the transient `keepstate` flag after the bounded stun window while
preserving the remaining hit metadata. The release is observable through the
next active state controller and final actor state.

## Out of scope

Exact actionRun ordering during hitpause, resource-delta timing, multi-hit and
`hitonce` arbitration, facing, custom-state ownership, helper/projectile target
lifetime, guard/air edge timing, teams, rollback, and full MUGEN/IKEMEN parity
remain open. `ModifyProjectile` authoring and Projectile cleanup/reset breadth
are separate cuts.

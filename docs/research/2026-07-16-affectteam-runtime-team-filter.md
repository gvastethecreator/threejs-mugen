# Research: IKEMEN AffectTeam Runtime Team Filtering

Date: 2026-07-16
Status: implementation completed (Wayfinder 210)

## Primary-source findings

The official IKEMEN source models HitDef `affectteam` as `-1F`, `0B`, `1E`, initializes it to `1`, and initializes `teamside` from the owning character. The same HitDef model carries projectile and direct attack state.

The official direct player hit loop checks the attack's `affectteam` against the target's `teamside` before collision and then applies attack-depth and collision-box checks. The projectile player loop applies the projectile's `affectteam`/`teamside`, with the legacy owner exception preserved before the IKEMEN teamside rule.

The official projectile clash loop checks both projectiles' `affectteam` policies before Z overlap and strict current-frame Clsn2 overlap. A clash is therefore not admitted when either projectile rejects the other side.

`HitFlag = P` cancellation is evaluated from the defending player's active HitDef policy against the incoming projectile. This is distinct from the projectile's own hit policy and must remain a separate admission check.

Official references:

- [IKEMEN `char.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/develop/src/char.go)
- [IKEMEN controller compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/develop/src/compiler_functions.go)
- [IKEMEN changed controller documentation](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28changed%29)

## Port decision

Use the existing numeric representation already used by PlayerPush: `-1` friends, `0` both, `1` enemies. Keep fields optional at the data boundary so authored defaults can be applied by the shared combat policy (`E` when omitted) without changing legacy fixtures that do not expose team identity.

`teamside` is added to direct HitDef moves as well as existing projectile operations. An explicit attack side wins over the actor-derived side. Unknown legacy actor IDs remain permissive for compatibility; known `p1`-`p8` identities use strict team filtering.

## Boundaries

Included: compiler lowering, imported/static HitDef projection, active HitDef dispatch, root admission, priority contact, projectile owner/target admission, HitFlag P cancellation, and projectile clashes.

Deferred: Helpers/proxy identity beyond the existing owner/root mapping, neutral actors, platform projectiles, exact legacy owner exceptions for every profile, and complete upstream parity outside the typed paths.

## Implementation evidence

Implementation commit: `8de2bb3a`.

Related hardening commits: `9b3f434b` preserves root/helper/projectile owner
identity at the effect-actor spawn boundary; `80e69138` aligns the
post-fighter bridge fixture with its explicit same-owner scheduling hooks.

Focused coverage: `165/165` tests passed. Broad evidence: TypeScript 7,
production build, boundary checks, and `qa:trace` pass; the trace gate reports
`633/633` artifacts with `0` skipped. The full suite reports `216/216` files
and `2273/2273` tests.

The policy remains bounded to known `p1`-`p8` identities. Unknown legacy IDs
stay permissive so existing synthetic/helper fixtures do not silently acquire
a false team assignment. Proxy/helper/neutral/platform parity and the exact
upstream owner-exception matrix remain residuals.

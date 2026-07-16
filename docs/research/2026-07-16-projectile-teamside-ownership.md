# Projectile TeamSide ownership research

Date: 2026-07-16
Wayfinder ticket: 205

## Primary sources

- [IKEMEN state controllers (new)](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29) documents `RedirectID` as a general state-controller feature and lists `ModifyProjectile` as a controller surface.
- [IKEMEN state controllers (changed)](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28changed%29) documents the `Projectile` `teamside` behavior: an explicitly different side allows the projectile to hit its owner and interact with other projectiles from the same player.
- [Elecbyte state controller reference](https://www.elecbyte.com/mugendocs/sctrls.html) remains the MUGEN baseline for Projectile and HitDef ownership; the TeamSide behavior is treated as IKEMEN-specific here.

## Repository evidence

- `RuntimeProjectile` already owns projectile identity, hit state, and the
  complete contact lifecycle, but it has no TeamSide field.
- `ProjectileCombatSystem` only receives owner-to-opponent combat and the
  match interaction layer only clashes projectiles from opposing effect stores.
- `ModifyProjectile` already has static operation lowering and caller-context
  numeric resolvers, so `teamside` can join the existing typed path without a
  new expression evaluator.
- Root and Helper projectiles share the root effect store; the owner id is the
  stable side source for the bounded self-contact/clash decision.

## Decision

Add an optional normalized `teamSide` to projectile operations, runtime state,
and snapshots. Omitted TeamSide keeps current behavior. A valid explicit side
different from the owner side opts the projectile into two additional, local
match checks:

1. projectile combat against its owner;
2. projectile clashes against another projectile in the same owner store.

The same-owner clash is pairwise and deterministic. It is admitted when at
least one member has explicitly opted into the opposite-side behavior, which
keeps two ordinary owner projectiles from becoming a new self-clash surface.

Invalid or unsupported side values do not mutate the projectile. No team bank,
round, Helper identity, `ProjTypeCollision`, score, or renderer policy is
inferred from this slice.

## Acceptance boundary

Allowed: static `Projectile teamside`, static/dynamic `ModifyProjectile
teamside`, snapshot evidence, owner self-contact, and same-owner projectile
clash behavior for explicit opposite-side values.

Blocked: exact upstream processing order, multi-root team-side remapping,
projectile-vs-player `ProjTypeCollision`, custom states, score, RedirectID,
rollback/netplay, and full MUGEN/IKEMEN projectile parity.

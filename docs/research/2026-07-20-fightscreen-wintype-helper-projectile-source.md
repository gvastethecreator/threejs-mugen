# FightScreen Helper Projectile source

Date: 2026-07-20
Ticket: T331
Status: implemented at bounded first-generation Helper Projectile scope

## Official source findings

Ikemen-GO gives a Projectile hit context the inherited root player slot and the
Projectile owner identity. A Helper-created Projectile therefore carries the
Helper owner while the life-zero result branch still resolves the owning root's
team and player slot.

## Port slice

The Projectile combat input now accepts a source resolver. The production
combat bridge resolves root Projectiles directly and looks up Helper-parented
Projectiles in the attacker's root store. A Helper source is root-owned only
when the projectile and Helper share the current root, the Helper has that root
as its immediate parent, and the inherited player slots match.

The resulting `GetHitVar` metadata keeps the Helper serial, root id, player
number, effective attr, and guard-KO fact. Unknown or nested Helper sources
remain fail-closed for immediate and later hit-state result classification.

## Evidence

- Projectile core coverage proves verified Helper source cause and metadata.
- Production combat-resolution coverage proves the root-store Helper lookup,
  source actor identity, and hyper result cause.
- Existing root Projectile, direct HitDef, Helper direct, and hit-state tests
  remain green.
- Focused result: 5 files / 367 tests passed.
- TypeScript 7 typecheck and diff hygiene passed.

## Claim ceiling

This is first-generation Helper Projectile source evidence. It does not
establish nested Helper ancestry, redirected ownership, reversal/reflection,
exact source-slot arbitration, non-root target-state behavior, browser
FightScreen proof, or full MUGEN/IKEMEN parity.

## Source link

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go

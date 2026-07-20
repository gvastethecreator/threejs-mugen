# FightScreen helper source admission

Date: 2026-07-20
Ticket: T330
Status: implemented at bounded first-generation Helper scope

## Official source findings

Ikemen-GO stores the attacking character's `playerNo` in the HitDef context.
Helpers inherit that player slot from their root. The life-zero result branch
only writes a win type for a player root and then uses the hit context for
suicide, teammate, guard-KO, or attack-cause selection.

## Port slice

Direct combat source actors now carry explicit `rootOwned` provenance. The
Helper direct-combat adapter marks the source as root-owned only when the
Helper belongs to the current root owner, has that root as its immediate
parent, and has matching inherited `playerNo` and `rootPlayerNo` values.
Admitted Helpers keep their source player, root, attr, and guard-KO metadata in
the defender's `GetHitVar` state.

Nested Helpers and Helpers without the runtime identity contract remain
fail-closed. The rule stays separate from Helper Projectile admission.

## Evidence

- Helper direct HitDef coverage proves source player, actor, root, attr, and
  guard-KO metadata for a verified first-generation Helper.
- Existing classifier coverage keeps non-root helper source metadata outside
  hit-state ownership.
- Existing direct, Playable, and hit-state result paths remain green.
- Focused result: 4 files / 319 tests passed.
- TypeScript 7 typecheck and diff hygiene passed.

## Claim ceiling

This is first-generation Helper direct source evidence. It does not establish
nested Helper ancestry, Helper Projectile source admission, redirected
ownership, reversal/reflection semantics, exact source-slot arbitration,
browser FightScreen proof, or full MUGEN/IKEMEN parity.

## Source link

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go

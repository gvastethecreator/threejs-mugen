# Ticket 149: Dizzy Points Suppression

Status: resolved

Question: can a defender-owned IKEMEN `AssertSpecial NoDizzyPointsDamage` flag
block only the direct HitDef dizzy delta while preserving actor-local resource
ownership?

Answer: yes, within a bounded direct-hit route.

Evidence:

- Official changed-controller documentation defines the flag as excluding the
  player's HitDef `dizzypoints` parameter.
- `RuntimeAssertSpecial.noDizzyPointsDamage` is populated by the typed executor.
- `resolveRuntimeCombatHit` omits the dizzy result only when the defender flag
  is active; guard and explicit resource controllers remain separate.
- Required trace `synthetic-imported-dizzypoints-suppression` passes with
  checksum `29e75f2a`, including AssertSpecial operation evidence and defender
  dizzy points preserved at `1000`.

Blocked: omitted defaults, `AttackMulSet` dizzy scaling, break transitions,
LifeShare, sharing, reset/persistence, HUD, rollback/netplay, and full parity.

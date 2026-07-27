# IKEMEN `hittmp` first falling-contact repair

Date: 2026-07-27

Question: how should the local air-juggle spend behave when a new falling
HitDef has just installed `fall` while the materialized `hittmp` value still
records the pre-contact idle phase?

## Evidence

After T411 materialized explicit `hitTmp`, the first falling HitDef contact
could leave the target budget unchanged. The contact had already installed
fall data, while `hitTmp = 0` remained until the next fighter advance. The
global `qa:trace` gate exposed the result in the direct and Helper
`inheritJuggle` fixtures: later contacts were admitted, damage exceeded the
golden values, and the required `reject via air.juggle` events were absent.

## Local correction

Commit `19f1693e` keeps explicit `hitTmp` for admission, then treats an
explicitly falling HitDef as a falling contact during post-hit spend. The
JuggleTrace projection uses the same condition. The next fighter advance can
still materialize `hitTmp = 2` for later admission checks.

This restores the intended bounded sequence: the first direct falling contact
spends the cost, the next over-budget contact rejects, and `NoJuggleCheck`
can bypass without spending more. The Helper inherited budget now follows
the same first-contact rule before its Projectile route.

## Verification

The focused batch passed 5 files / 135 tests. The two affected trace tests
passed. The final `pnpm qa:trace` passed 667 artifacts: 633 required, 34
optional, and 0 failed. `git diff --check` passed.

## Claim ceiling

Allowed: local IKEMEN first falling direct HitDef spend and the resulting
bounded Helper inherited-budget trace.

Blocked: exact source update order beyond this contact boundary, projectile
fall metadata, ModifyHitDef timing, Helpers outside the named fixture, MUGEN,
global pause, teams, scores, and full parity.

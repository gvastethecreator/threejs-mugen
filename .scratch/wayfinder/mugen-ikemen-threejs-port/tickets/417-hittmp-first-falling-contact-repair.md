# T417 - Repair first falling air-juggle spend after `hittmp` materialization

Status: resolved bounded in `19f1693e`.

Question: repair the first falling contact after T411's explicit `hitTmp`
materialization without weakening later over-budget admission.

Answer: keep `hittmp` as the admission value. During post-contact spend, use
the authored HitDef `fall.enabled` result because the explicit `hitTmp = 0`
can remain stale until the next fighter advance.

Scope:

- `RuntimeJuggleSystem` charges a newly installed falling direct HitDef.
- `RuntimeJuggleSystem` keeps JuggleTrace falling-contact evidence aligned.
- A focused unit case covers the stale explicit `hitTmp = 0` edge.

Evidence: commit `19f1693e`; focused runtime batch passed 5 files / 135 tests;
the direct and Helper inherited-budget traces passed; `pnpm qa:trace` passed
667 artifacts with 0 failures; `git diff --check` passed.

Research: `docs/research/2026-07-27-ikemen-hittmp-first-falling-contact-repair.md`.

Out of scope: broader `hittmp` update order, projectile fall metadata,
ModifyHitDef timing, Helpers beyond the named fixture, MUGEN, pause behavior,
teams, scores, and full parity.

# Issue 109 — IKEMEN `GetHitVar(hitflag)` readback

Status: closed-bounded
Lane: I3 last-hit metadata
Priority: P1

## Objective

Expose the hitflag of the last direct HitDef or Projectile contact to CNS
expressions using the documented Ikemen comparison form:
`GetHitVar(hitflag) = <flags>` / `!= <flags>`.

## Source decision

The Ikemen changed-trigger reference defines `GetHitVar(hitflag)` as the
hitflag parameter of the last HitDef that hit the player and requires a
comparison against known flags. The official M.U.G.E.N HitDef reference keeps
the same H/L/A/M/F/D/+/- flag vocabulary and defaults an omitted `hitflag` to
`MAF`.

References: [Ikemen changed triggers](https://github.com/ikemen-engine/Ikemen-GO/wiki/Triggers-%28changed%29), [M.U.G.E.N 1.1 HitDef](https://www.elecbyte.com/mugendocs/sctrls.html#hitdef).

## Implemented contract

- `RuntimeGetHitVars` stores the effective source hitflag separately from
  `sourceGuardFlag`.
- Direct and Projectile contacts carry authored `hitflag`, falling back to the
  official `MAF` default when omitted.
- Expression compilation preserves the static comparison form, and runtime
  evaluation uses a typed flag-overlap predicate with M→H/L expansion and
  +/- markers.
- Redirected contexts (`Target, ...`) read the selected defender's last-hit
  metadata through the same callback boundary.

## Evidence

- Focused compiler/context/CNS/direct/projectile run: 5 files, 238 tests pass.
- `pnpm typecheck` and `git diff --check` pass after the implementation.
- No new `qa:trace` artifact is promoted: this read-only metadata seam is
  covered by the focused public runtime tests; the existing trace corpus stays
  at `686/686`.

## Claim ceiling

This closes static `GetHitVar(hitflag)` comparisons for direct and Projectile
last-hit metadata. It does not claim native Lua/ZSS dynamic flag expressions,
full GetHitVar lifetime/reset parity, RedirectID ownership, rollback/netplay,
or complete M.U.G.E.N/IKEMEN combat parity.

# Issue 233 — Dynamic direct HitDef guard.dist

- Status: `closed-bounded`
- Lane: `R1 direct contact admission`
- Priority: `P1`

## Objective

Resolve the legacy scalar direct HitDef `guard.dist` in root and Helper caller
contexts, preserve live ModifyHitDef omission, and feed the existing horizontal
`InGuardDist` latch before contact.

## Source gate

M.U.G.E.N 1.1 defines `guard.dist` as one integer expression for the horizontal
distance where P2 enters guarding. Pinned Ikemen GO treats it as the legacy X
alias, evaluates it in caller context, and ignores negative replacements.

Source symbols:

- M.U.G.E.N 1.1 `sctrls.html:1596-1600`
- pinned Ikemen `compiler_functions.go` `hitDef_guard_dist_x`
- pinned Ikemen `bytecode.go` `hitDef.runSub`
- pinned Ikemen `char.go` guard-distance admission

## Acceptance fixture

- Compile literal and dynamic scalar input and reject malformed input.
- Resolve root and Helper caller expressions once and truncate finite values.
- Prove nonnegative fresh/live replacements, negative preservation, and
  ModifyHitDef omission preservation.
- Feed the existing horizontal direct `InGuardDist` latch without requiring a
  hit or target link.
- Add one required imported whiff trace for `guard.dist = var(0)` with
  `var(0)=96`, adversarial fallback 1, and an imported `InGuardDist` branch.

## Claim ceiling

Do not claim the player-variable default, exact HitDefPersist/reset semantics,
front/back pairs, height/depth bounds, exact localcoord or auto-guard timing,
Projectile or ModifyProjectile, teams, rollback, or full guard-distance parity.

## Closeout evidence

- Compiler, HitDef, latch, and trace coverage passes 875/875.
- Typecheck and the 363-module production build pass.
- Required trace `synthetic-imported-hitdef-dynamic-guard-distance.json` passes
  with checksum `ccd433c7`. `var(0)=96` creates a direct latch and enters state
  130 without contact, guard result, or target link.
- Aggregate trace QA passes 731/731, including 697 required artifacts.
- Full suite executes 3628/3686. All 58 failures are deleted/stale roster
  expectations outside this cut.

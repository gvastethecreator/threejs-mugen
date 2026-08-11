# Issue 292 — Dynamic `ModifyReversalDef` state expressions

Status: **closed-bounded** (T718, 2026-08-11)

## Contract

The root-owned RedirectID `ModifyReversalDef` path now preserves typed
caller-context expressions for `p1stateno`, `p2stateno`, `p2getp1state`, and
`p2facing`. Each authored value is resolved once from the original controller
caller even when the active ReversalDef belongs to a redirected receiver.
Finite state values keep the local non-negative integer contract; unresolved
or non-finite dynamic values fail closed without overwriting the live field.

This is an Ikemen compatibility slice. Helper-owned ModifyReversalDef,
unmodeled reversal payloads, projectile reflection, guard/override precedence,
exact deferred tick ordering, teams, rollback, and full M.U.G.E.N/Ikemen
parity remain outside the claim.

## Upstream basis

- Ikemen GO pin `149402f`: `compiler_functions.go:2297-2329` compiles
  ReversalDef through the HitDef parameter block; `bytecode.go:8369+` routes
  ModifyReversalDef's shared HitDef fields through `runSub` in the original
  caller context. The state-field evaluation is visible at
  `bytecode.go:7634-7640` and p2facing at `bytecode.go:7713-7714`.
- M.U.G.E.N 1.1 documents the ReversalDef HitDef-compatible state parameters;
  dynamic RedirectID caller evaluation is claimed only for the pinned Ikemen
  behavior.

## Implementation and evidence

- Core commit `12cefbc3` widens the typed IR/compiler operation, passes the
  original caller context through the root RedirectID seam, and resolves the
  four fields in `ReversalSystem`.
- Focused Vitest: `RuntimeCompiler.test.ts` + `ReversalSystem.test.ts`,
  `167/167` assertions passed, including receiver/caller variable separation.
- Required trace artifact:
  `synthetic-imported-ikemen-root-modifyreversaldef-dynamic-state`.
- Trace checksum `50173bf7`, final checksum `05110cc8`.
- Evidence commit `a1b9bddb` registers the required gate; the complete
  `RuntimeTraceGatePresets.test.ts` suite passes `773/773`.
- `pnpm typecheck`, `git diff --check`, and `pnpm qa:trace` pass. Aggregate
  QA: `809/809` artifacts (`775` required, `34` optional), zero failures.

## Explicit exclusions

Helper-owned ModifyReversalDef, fresh ReversalDef expressions (closed by
T717), Projectile/ModifyProjectile reflection, reversal guard/override and
miss-on-override precedence, unsupported HitDef payloads, negative/overflow
int32 parity, exact hitpause/tick synchronization, custom-state breadth beyond
the owner-backed route, teams, rollback, and full M.U.G.E.N/Ikemen ReversalDef
parity remain open.

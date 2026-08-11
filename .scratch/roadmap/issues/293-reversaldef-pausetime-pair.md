# Issue 293 — `ReversalDef` pausetime pair

Status: **closed-bounded** (T719, 2026-08-11)

## Contract

Direct/root `ReversalDef` and root/RedirectID `ModifyReversalDef` now retain
`pausetime = p1_pausetime,p2_shaketime` as typed one/two-component values.
Static, dynamic, and mixed components resolve once in the original caller
context, including when a root redirects mutation to another actor's active
ReversalDef. A fresh ReversalDef defaults to `[0,0]`; a live one-component
ModifyReversalDef updates only P1 pause and preserves the active P2 shake.
Accepted reversal contact applies P1 pause to the reverser and P2 shake to the
attacker.

This is a bounded M.U.G.E.N/Ikemen compatibility slice. Helper-owned
ModifyReversalDef, other reversal payloads, exact pause tick ordering and
stacking, teams, rollback, and full parity remain outside the claim.

## Upstream basis

- The repository's M.U.G.E.N 1.1 reference documents
  `pausetime = p1_pausetime,p2_shaketime` with an omitted default of `0,0` in
  `referencias/.../common/sctrl.reversaldef.html`.
- The pinned Ikemen GO source reuses the HitDef parameter block for
  ReversalDef/ModifyReversalDef. Its runtime evaluates the pair in the caller,
  preserves omitted ModifyReversalDef components, and consumes the first value
  for the reverser and the second for the attacker.

## Implementation and evidence

- Core commit `987c5c7c` adds typed IR/compiler retention, caller-context
  pair resolution, fresh defaults, live preservation, runtime metadata, and
  asymmetric contact application.
- Focused Vitest: `RuntimeCompiler.test.ts` + `ReversalSystem.test.ts` pass
  `169/169`; the redirected PlayableMatchRuntime ReversalDef focus passes
  `39/39`.
- Required trace artifact:
  `synthetic-imported-ikemen-root-modifyreversaldef-pausetime-pair`.
- Trace checksums: `e73799ec` and final `9998654b`.
- Evidence commit `bfe8d2e8` adds the required registry and durable actor-frame
  pause assertions. `pnpm typecheck`, `git diff --check`, and `pnpm qa:trace`
  pass; aggregate QA is `810/810` artifacts (`776` required, `34` optional).

## Explicit exclusions

Helper-owned ModifyReversalDef, fresh Helper breadth, other ReversalDef fields,
Projectile/ModifyProjectile reflection, guard/override precedence, negative or
overflow int32 parity, exact hitpause tick synchronization and stacking,
custom-state breadth beyond the bounded root route, teams, rollback, and full
M.U.G.E.N/Ikemen ReversalDef parity remain open.

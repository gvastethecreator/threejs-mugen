# IKEMEN ModifyHitDef Fall Kill Research

Date: 2026-07-23

Status: closed in `799749b3`.

## Question

Which bounded static root ModifyHitDef `fall.kill` route can the runtime
support with source-backed deferred-damage evidence?

## Source basis

The pinned IKEMEN-GO `modifyHitDef.Run` resolves one redirected character,
rejects a missing or reversal HitDef, and sends every non-RedirectID field to
the active receiver's shared HitDef.

- [ModifyHitDef receiver delegation](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L8329-L8345)

The shared HitDef route evaluates `fall.kill` as a boolean and writes the
result to `fall_kill`. The compiler registers the source field as a boolean.

- [fall.kill field assignment](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/bytecode.go#L7577-L7584)
- [fall.kill compiler route](https://github.com/ikemen-engine/Ikemen-GO/blob/4aa0ba38f851c52549ba182310e9e53361cd472a/src/compiler_functions.go#L1778-L1800)

## Local mapping

`ModifyHitDefControllerOp` now carries static `fallKill`. The bounded compiler
accepts numeric scalar literals only: zero lowers to false and any nonzero
value lowers to true. Omitted input stays distinct from explicit true, so a
later controller can restore a false active value.

`RuntimeHitDefControllerDispatchWorld.modify` writes a supplied value to the
active move's fall metadata and keeps move identity and contact memory. When
the local move has no fall container, it creates `{ enabled: false }` before
writing `kill`; that preserves the source field without enabling a fall route.

The required imported trace redirects `fall.kill = 0` into a receiver with
fall enabled and 2000 deferred damage. It routes the target into a bounded
owner-backed `HitFallDamage` state, where the changed false value clamps life
at one. This proves the changed field reaches deferred damage rather than only
the active move snapshot.

## Audit and verification

- Compiler coverage proves false and true static lowering and rejects dynamic
  or malformed values.
- Active-move coverage proves fall metadata mutates in place while contact
  memory remains intact.
- Required imported RedirectID trace proves deferred 2000 HitFallDamage reads
  false `fall.kill` and leaves the target at one life.
- Focused `RuntimeCompiler`, `HitDefSystem`, and `RuntimeTraceGatePresets`
  coverage passes 3 files / 730 tests. Trace-script syntax and diff hygiene
  pass.

## Deferred

Dynamic expressions, `fall.damage`, `fall.defence_up`, `fall.recover`,
`hitonce`, `air.juggle`, exact source boolean/default behavior, Projectile and
Helper receivers, broader team behavior, exact source timing, rollback/netplay,
the accumulated TypeScript 7 gate, full Vitest, aggregate traces, production
build, boundaries, and full parity remain deferred.

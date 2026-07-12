# IKEMEN Helper Aggregate Tag Closure Audit

## Question

Does the root-to-Helper TagIn/TagOut path now satisfy the bounded pinned-source contract, and which remaining runtime debt is sufficiently isolated for the next implementation ticket?

## Answer

Yes, within the project's explicit atomic-prevalidation contract. Root callers can redirect TagIn/TagOut to live Helpers and combine every source-valid static/deferred axis: Helper-local state/control/self, stable-root-relative partner state/control/standby, position-one member order, and stable-PlayerNo TagIn leader rotation. Original-caller evaluation order, exact Helper root anchoring, lifecycle eligibility, mutation order, stable slots, reset, failure rollback, and telemetry suppression are covered.

The bounded path does not claim exact upstream incremental failure. It also does not execute TagIn/TagOut authored by a Helper itself. The next isolated slice is unredirected Helper-originated self standby only; active P3-P8 gameplay is more valuable but crosses input, combat, round, and presentation ownership and needs a separate source map first.

## Source Snapshot

- Repository: [Ikemen-GO](https://github.com/ikemen-engine/Ikemen-GO)
- Pinned develop commit: [`05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`](https://github.com/ikemen-engine/Ikemen-GO/commit/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703)
- Snapshot rechecked: 2026-07-11
- Current official controller wiki: [TagIn and TagOut](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#tagin)
- Pinned runtime: [TagIn/TagOut parameter and mutation path](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L5227-L5398)
- Pinned team order: [member and leader mutation](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L6113-L6250)

The wiki explicitly states that parameterless TagIn affects the calling player and Helpers. The pinned runtime executes against a generic character caller/redirect target, so Helper-originated Tag is a source-valid path rather than a separate controller family.

## Closure Matrix

| Contract | Source behavior | Local bounded state | Evidence/status |
| --- | --- | --- | --- |
| Profile and syntax | TagIn/TagOut expose the documented optional axes. | Typed operation only executes under explicit `ikemen-go`; TagOut control/leader and malformed combinations reject. | Compiler and runtime tests closed. |
| RedirectID | Resolves first; later expressions remain caller-owned. | Root caller resolves live numeric root/Helper identity first; missing, removed, or disabled targets abort. | Closed for root callers. |
| `self` | Defaults based on partner/control presence and mutates the redirected character. | Static/deferred zero/non-zero behavior mutates Helper standby after local/order effects. | Closed. |
| `partner` | Uses redirected character PlayerNo and selects a same-side root. | Exact Helper `rootId` anchors stable cyclic root selection; no fallback root. | Closed. |
| `stateno` | Mutates redirected character before later axes. | Helper-owned state validates before every mutation and applies first. | Closed. |
| `memberno` | Swaps mutable order from redirected character member position. | Dedicated Helper route swaps mutable position one without assigning a Helper slot. | Closed against pinned zero-value inference. |
| `partnerstateno` | Mutates selected partner root after standby adjustment. | Partner-owned state prevalidates and applies after partner standby. | Closed. |
| `ctrl` / `partnerctrl` | TagIn-only and post-state. | Helper control follows member; partner control follows partner state. | Closed. |
| `leader` | TagIn-only stable same-side PlayerNo rotation. | Exact root side plus existing order owner rotate/sink roots before self/partner. | Closed. |
| Failure | Upstream preserves earlier mutations and may run post-pass adjustments. | All admitted targets/expressions/states prevalidate; any failure rolls back the aggregate. | Intentional documented divergence. |
| Telemetry | No project-equivalent contract. | Success records a concrete root-caller operation; blocked routes record none. | Closed for current compatibility ledger. |
| Helper as caller | Generic character execution includes Helpers. | Helper controller runner rejects team-standby before a match hook. | Open and selected next. |

## Local Ownership Audit

- `compileTeamStandbyControllerOp` already emits the same typed operation for state programs used by roots and Helpers.
- `runRuntimeHelperStateControllers` classifies TagIn/TagOut as runtime controllers but rejects them because they are absent from `helperRuntimeControllers` and no team-standby callback exists.
- `helperExpressionContext` already owns Helper self, ID, PlayerNo, vars, time, Parent, Root, opponent, target, and team-side reads needed for a deferred self expression.
- `RuntimeEffectHelperContextWorld` already transports Helper controller hooks through the owner root; one team-standby hook can follow that boundary.
- `RuntimeHelperTelemetryWorld` currently excludes `team-standby` and must admit only successfully applied Helper operations.
- Standby participation already keeps Helper CNS active while projecting effective control false and suppressing direct HitDef, so self TagOut and later self TagIn can be proved without adding lifecycle or presentation policy.
- `RuntimeRootParticipation/v0` already exposes structurally active roots, but current input/combat/round/presentation owners remain the P1/P2 pair. Promoting reserves is therefore not a one-hook change.

## Residual Debt Ranking

1. **Helper-originated self Tag standby**: high source confidence, narrow ownership, reuses existing standby semantics, and closes a real unsupported controller route.
2. **Required Tag trace promotion**: useful after Helper-originated execution stabilizes; current 538 checks remain unchanged and unit/integration proof carries the feature.
3. **Active-root team gameplay**: highest playable value, but input, combat, round, presentation, HUD/resources, and side-controller handoff need one dedicated source/consumer map first.
4. **Incoming Helper interaction breadth**: requires hurt/collision/camera/opponent ownership absent from the current Helper model.
5. **Exact incremental failure parity**: source-accurate but high-risk, fixture-poor, and intentionally incompatible with the current aggregate atomic guarantee.

## Decision

Wayfinder 091 will implement only unredirected Helper-originated self TagIn/TagOut standby:

1. Route typed `team-standby` from Helper CNS through an explicit match callback.
2. Allow omission/static/deferred `self` in the Helper's own expression context.
3. Reject RedirectID, partner, state, control, member, and leader in this first Helper-caller slice.
4. Apply TagOut/TagIn standby without stopping CNS; verify direct interaction/effective control transitions and successful telemetry.
5. Keep legacy, removed/disabled Helper, invalid expression, and unsupported aggregate paths fail-closed.

## Blocked Claims

- Redirected or aggregate Helper-originated Tag remains blocked after the selected self-only slice.
- Active-root input/combat/round/presentation ownership remains unimplemented.
- Exact source incremental failure, incoming Helper breadth, required Tag traces, score movement, and full MUGEN/IKEMEN parity remain blocked.

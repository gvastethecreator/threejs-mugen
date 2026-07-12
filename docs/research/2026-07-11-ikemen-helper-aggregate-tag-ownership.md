# IKEMEN Helper Aggregate Tag Ownership

## Question

When root-executed `TagIn` or `TagOut` redirects to a Helper, which character owns `partner`, `partnerstateno`, `partnerctrl`, `memberno`, and `leader`, in what order do those effects occur, and which subset can the local runtime implement without widening unrelated team gameplay?

## Answer

The redirected Helper remains the target for `stateno`, TagIn `ctrl`, and self standby. Aggregate axes cross into root ownership:

- `partner` uses the Helper's inherited stable `PlayerNo` to select a same-side root; partner standby, state, and control mutate that root.
- `memberno` mutates the root team's mutable Tag order through the Helper's team side. A source-level quirk matters: Helpers do not inherit a root `memberNo`, so their zero-initialized value makes the swap originate from mutable position one.
- TagIn `leader` uses a stable same-side `PlayerNo`, rotates that root to the front, sinks dead roots, and rewrites root member positions.

Every expression still evaluates in the original controller caller context. Upstream applies several effects immediately and does not roll them back when a later parameter fails. The local runtime will retain its established fail-closed aggregate contract: resolve and validate the admitted operation before any mutation.

## Source Snapshot

- Repository: [Ikemen-GO](https://github.com/ikemen-engine/Ikemen-GO)
- Pinned develop commit: [`05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`](https://github.com/ikemen-engine/Ikemen-GO/commit/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703)
- Snapshot checked: 2026-07-11
- Current official controller wiki: [TagIn and TagOut](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#tagin)
- Current official trigger wiki: [MemberNo and PlayerNo](https://github.com/ikemen-engine/Ikemen-GO/wiki/Triggers-%28new%29#memberno)

## Evaluation And Mutation Order

`RedirectID` resolves first. Lookup and every later expression use the original caller `c`; only mutation is redirected to `crun`. This follows the shared [redirect lookup](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L4825-L4841) and the controller [compiler order](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler_functions.go#L487-L547).

TagIn evaluates parameters after redirect in this order:

1. `self`
2. `partner`
3. `stateno`
4. `memberno`
5. `partnerstateno`
6. `ctrl`
7. `partnerctrl`
8. `leader`

The observable mutation sequence is therefore:

1. Helper-local state change.
2. Root-team member-order change.
3. Helper-local control change.
4. Root-team leader change.
5. Helper standby clear when self resolves true or defaults true.
6. Selected partner root standby clear.
7. Selected partner root state change.
8. Selected partner root control change.

TagOut evaluates `self`, `partner`, `stateno`, `memberno`, and `partnerstateno`. Its observable mutation sequence is Helper-local state, root-team member order, Helper standby set, partner-root standby set, then partner-root state. The exact branches and post-pass adjustments are in the pinned [TagIn/TagOut runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L5227-L5398).

## Aggregate Ownership

### Partner

`partnerTag(n)` computes from `crun.playerNo`, wraps across the same-side stable slots, and returns `sys.chars[p][0]`: a root, never a Helper. Because Helper construction preserves the parent's root slot and team side, a redirected Helper selects partners relative to its inherited root identity. See [`partnerTag`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L4997-L5009) and [Helper field copying](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L6752-L6807).

The partner ordinal is stable-slot-relative and independent of mutable Tag order. A missing partner root does not abort upstream processing; the final partner block is skipped after earlier Helper or team mutations may already have occurred.

### Member Order

`changeTagOrder` is Tag-mode-only. It reads root team order, swaps the redirected character's current `memberNo` with the requested one-based position, then writes positions only to roots. See [team order and member swap](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L6113-L6181).

Pinned-source inference: a Helper's `memberNo` remains the zero-value. Helper initialization and parent copying do not assign it, while character loading and `updateTeamOrder` assign it to roots. Consequently, Helper-targeted `memberno` behaves as a swap from mutable position one, not from its root's current mutable position. No dedicated upstream Go test was found for this edge.

### Leader

`changeTagLeader` validates Tag mode and same-side stable PlayerNo, selects `sys.chars[nextLeaderPN][0]`, rotates that root to the front, sinks dead roots, updates `teamLeader`, and rewrites root member positions. It depends on the Helper's inherited team side and PlayerNo parity, not Helper `memberNo`. See [`changeTagLeader`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L6183-L6250).

## Failure Semantics

The upstream parameter walker stops after a callback returns false, but it returns no failure result to the controller. TagIn/TagOut still perform their final self and partner adjustments. See [`StateControllerBase.run`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L4785-L4806).

Consequences:

- invalid `RedirectID` aborts before every later expression and mutation;
- a negative state or partner value stops later parameter evaluation but preserves whatever immediate mutations already occurred;
- already stored self or partner data can still drive post-pass standby/partner mutation;
- invalid member or leader targets are local no-ops rather than aggregate rollback;
- a missing selected partner skips only the final partner-root block;
- `partnerstateno` without `partner` stores a value but cannot mutate a partner; for TagOut, its presence also suppresses omitted-self defaulting.

This is incremental source behavior. It is not the local bounded contract, which intentionally validates all admitted targets and states before mutation.

## Local Audit

- `PlayableMatchRuntime.applyHelperLocalTeamStandbyController` already owns Helper-local state/control/standby and currently rejects every aggregate axis.
- `RuntimeTagPartnerSelectionWorld` already provides stable same-side cyclic root selection, but requires a root anchor. Helper aggregate dispatch must resolve that anchor through `helper.rootId` and fail closed if the root is unavailable; it must not use a fallback root.
- `RuntimeTagTeamOrder` already owns explicit Tag-mode root member swaps and leader rotations. It has no Helper `memberNo`, which is correct for isolation but leaves the upstream position-one quirk unmodeled.
- Helper identity registration already copies root PlayerNo and stores explicit parent/root identity.
- The compiler already supports static and deferred partner, partner state/control, member, and leader fields. No compiler expansion is required for the first runtime cut.
- `resolveDynamicTeamStandbyOperation` currently resolves aggregate expressions in a different order from pinned source. The next implementation must align shared resolution to compiler/source order while preserving original-caller context.

## Decision

Implement partner ownership first in Wayfinder 087:

1. Admit Helper redirects with `partner`, optional `partnerstateno`, and TagIn `partnerctrl`, composed with existing Helper-local state/control/self standby.
2. Resolve dynamic values once in original-caller source order.
3. Resolve the Helper's actual root by `rootId`, then reuse stable root partner selection.
4. Prevalidate Helper and partner-owned states before any mutation.
5. Apply Helper-local state/control and self standby first, then partner-root standby/state/control.
6. Fail atomically for missing/disabled roots or partners, invalid expressions, and unavailable states.

Keep `memberno` and `leader` blocked. `leader` can later reuse stable-root team order directly. Helper `memberno` needs a dedicated explicit operation for the source position-one quirk plus a focused fixture before execution.

## Uncertainty And Blocked Claims

- The Helper `memberNo = 0` behavior is a pinned-source inference, not a documented compatibility promise or upstream test fixture.
- Exact upstream incremental partial mutation remains deliberately blocked.
- Helper-originated Tag, Helper-created Helpers, incoming Helper hurt/push/camera/opponent breadth, Simul breadth, gameplay/round/resource ownership, score movement, and full MUGEN/IKEMEN parity remain out of scope.

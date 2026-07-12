# IKEMEN Height controller research

Date: 2026-07-12

## Pinned source

Official source revision used for the contract: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`. The mutable local reference checkout was at `044da72008b8ba13caf7b0f820526ce16e955fb3` during final audit, so the reproducible evidence below uses immutable official permalinks rather than claiming a locally pinned worktree.

- [`Height` compiler](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler_functions.go#L6290-L6301): accepts optional `RedirectID` and requires a float-pair `value`.
- [`Height` bytecode execution](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L14262-L14288): evaluates values in caller context, redirects the mutation target, defaults an omitted second value to zero, and scales caller-authored values into the target localcoord.
- [Character height state](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L7617-L7668): composes top/bottom controller deltas over the current S/C/A/L base height. The size box projects top as negative height and bottom as positive height.

For caller width `C` and redirected target width `T`, the source scaling simplifies to `T / C`. The expressions remain caller-owned; only the resulting pair is scaled before target mutation.

## Port decision

The bounded port lowers static `Height value = top[,bottom]` to `collision:height`, preserves dynamic expression fallback, and routes optional `RedirectID` through the root redirect owner. `RuntimeActorConstraintWorld` stores a one-frame top/bottom delta. `RuntimeRootBodyPushWorld` composes that delta over the selected S/C/A/L size-box Y interval before PlayerPush admission.

Active-motion Tag roots receive `Width` and `Height` through the same constrained side-effect phase so collision geometry can follow their imported CNS without widening effects, combat, round, presentation, or resources.

## Deliberate limits

- This cut covers root actors and current PlayerPush Y admission only.
- Exact hitpause persistence/reset timing is not claimed.
- Helper targets, broad redirect namespaces, `OverrideClsn` group 3, `P2BodyDist Y`, and other height consumers remain blocked.
- The IKEMEN feature scanner remains a report surface; runtime execution is tracked separately in the controller registry.

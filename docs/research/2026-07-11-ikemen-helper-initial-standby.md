# IKEMEN initial Helper standby creation

## Question

How does IKEMEN compile, evaluate, and apply the Helper controller's `standby` parameter, and which local boundaries must change to preserve identity, initial state, control, and first-tick behavior?

## Answer

IKEMEN compiles `standby` as one optional boolean expression. Omission leaves a fresh Helper non-standby. Static zero is false, any non-zero value is true, and dynamic expressions evaluate against the original controller caller, even when the Helper controller itself uses `redirectid` to choose another creator.

The redirected creator allocates and registers the Helper before any Helper parameter is evaluated. The parameter pass then sets or clears standby, after which `helperInit` requests stored control enabled, enters the initial state, and prepares the actor for same-frame CNS execution. An authored StateDef `ctrl` runs during that entry and overrides the requested value; when omitted, the requested true value remains. Standby therefore exists before identity observers and the first controller tick; it suppresses effective `Ctrl` and direct character interaction without suppressing CNS, identity, snapshots, or Helper-parented projectiles.

The current official wiki documents TagIn/TagOut standby behavior but does not document the Helper creation parameter. The pinned engine compiler and runtime are authoritative for this extension.

## Source semantics

| Surface | Pinned IKEMEN behavior |
| --- | --- |
| Syntax | `standby` is optional, has one argument, and compiles as `VT_Bool`. |
| Coercion | Compile-time values normalize to boolean; runtime `evalB` treats zero as false and non-zero as true. |
| Evaluation owner | Every Helper parameter, including `standby`, evaluates with the original caller `c`; `redirectid` changes creator `crun`, not expression ownership. |
| Identity order | `newHelper` allocates numeric identity and adds the Helper to child/character lists before the parameter pass. |
| Default | `prepareNextRound` replaces `CharSystemVar`; its zero-valued `systemFlag` leaves a fresh Helper non-standby. |
| Explicit false | `standby = 0` explicitly clears the flag before initial state entry. |
| Initial state/control | `helperInit` calls `changeStateEx(..., ctrl = 1)` after the parameter pass. StateDef `ctrl`, when authored, runs during entry and overrides it; standby is not cleared. |
| First tick | Same-frame Helper discovery runs CNS with final standby and StateDef control. If StateDef omits `ctrl`, stored control remains true while the effective `Ctrl` trigger is false during standby. |

## Primary sources

- [Official IKEMEN wiki: TagIn affects Helpers](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#tagin)
- [Official IKEMEN wiki: TagOut standby semantics](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#tagout)
- [Pinned Helper compiler parameters](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler_functions.go#L735-L810)
- [Pinned optional parameter compilation](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler.go#L6128-L6147)
- [Pinned boolean expression normalization](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler.go#L5750-L5769)
- [Pinned runtime zero/non-zero boolean coercion](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L1108-L1119)
- [Pinned Helper allocation, caller evaluation, standby mutation, and init order](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L5579-L5718)
- [Pinned fresh Helper defaults and system flag storage](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L3194-L3221)
- [Pinned Helper round/creation reset](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L3544-L3576)
- [Pinned Helper identity registration and initial state entry](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L6753-L6845)

## Local audit

| Boundary | Current sandbox state | Required cut |
| --- | --- | --- |
| Typed Helper operation | `HelperControllerOp` has no standby fields; static/raw helpers ignore the parameter and dynamic values collapse to undefined. | Compile static boolean or normalized deferred expression; reject unsupported authored expressions for the IKEMEN route. |
| Profile gate | Effect spawn dispatch has no compatibility-profile input for Helper creation. | Apply initial standby only for explicit `ikemen-go`; preserve existing non-IKEMEN creation. |
| Caller context | Root effect dispatch already owns actor, opponent, state owner, stage, tick, and expression-context factories. | Resolve the deferred boolean there, before actor construction, against the spawning root caller. |
| Spawn state | `createRuntimeHelper` hardcodes `standby: false` and `ctrl: false`. | Accept resolved standby and initial control computed as authored StateDef `ctrl`, otherwise source fallback true. |
| Identity | Lifecycle observers run after `createRuntimeHelper` and store insertion. | Preserve order so registration sees the final standby flag before same-tick discovery. |
| First CNS tick | IKEMEN actor order discovers Helpers spawned during root advancement and runs them once that frame. | Preserve scheduling; assert CNS/projectile execution plus effective/stored control for omitted and authored StateDef control. |
| Combat/presentation | Ticket 083 already gates direct Helper HitDef and preserves snapshots/projectiles while standby. | Reuse those boundaries; do not add a global controller, projectile, or renderer filter. |
| Raw fallback/failure | Other Helper params retain raw static fallback. | If explicit IKEMEN `standby` cannot compile or resolve, block that Helper spawn rather than silently creating an interactive actor. |

## Decision

Wayfinder 085 will implement one root-created Helper slice:

1. Extend typed Helper IR with static/deferred standby metadata using zero/non-zero boolean coercion.
2. Resolve dynamic standby in original root caller context only under `ikemen-go`.
3. Pass the concrete value into Helper construction before lifecycle notification and same-tick discovery.
4. Apply StateDef `ctrl` when authored and source fallback true when omitted; rely on existing effective-control projection while standby.
5. Prove omitted/zero/non-zero/dynamic values, caller ownership, unsupported-expression failure, legacy isolation, identity snapshot timing, first-tick CNS/projectile continuation, and direct-HitDef suppression.

## Uncertainty

The sandbox still does not execute Helper-created Helpers or generic Helper-controller `RedirectID`, and it does not model incoming Helper hurt, push, camera, or player-type opponent breadth. Exact IKEMEN incremental side effects after a later parameter failure also remain outside this atomic bounded route. Those gaps do not block root-created initial standby.

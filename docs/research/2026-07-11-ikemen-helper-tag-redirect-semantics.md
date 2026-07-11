# IKEMEN Helper Tag redirect semantics

## Question

What does TagIn/TagOut mutate when RedirectID resolves to a Helper, and which effects are local to that Helper versus shared with its root team?

## Answer

IKEMEN resolves RedirectID before the Tag parameter pass, but every expression still evaluates against the original caller. When the resolved character is a Helper, `stateno`, TagIn `ctrl`, and the final `SCF_standby` change are Helper-local. The Helper stays scheduled while standby; separate collision, hit/push, camera, and Enemy/P2 filters give the flag its gameplay meaning.

`partner` is not Helper-local. `partnerTag` derives a root teammate from the Helper's inherited PlayerNo, then partner standby, state, and TagIn control mutate that root. `memberno` and TagIn `leader` also enter the root team-order model through the Helper's team side and PlayerNo. The Helper's `memberNo` is not copied from its parent during creation; source initialization leaves it at zero, so calling `changeTagOrder` through a Helper behaves as if the current member slot were zero. This last point is an inference from the pinned initialization and mutation paths and needs an upstream execution fixture before exact parity is claimed.

The fixed parameter pass is RedirectID first, then `self`, `partner`, `stateno`, `memberno`, `partnerstateno`, and, for TagIn, `ctrl`, `partnerctrl`, `leader`. Mutations are incremental. The sandbox continues to use aggregate prevalidation for its bounded subset and does not claim rollback-equivalent source order.

## Lifecycle matrix

| Condition | IKEMEN result |
| --- | --- |
| Negative, missing, destroyed, or disabled PlayerID | Abort the controller before later Tag expressions or mutation. |
| Standby Helper | Lookup remains valid; Tag can clear or set standby again. |
| Parent/root lifecycle | PlayerID lookup checks only the target entry and its own destroyed/disabled flags; it does not traverse ancestry. |
| `self = 0` plus Helper `stateno`/TagIn `ctrl` | Local state/control mutation occurs without changing Helper standby. |
| Omitted/true `self` | Helper standby is cleared by TagIn or set by TagOut. |
| `partner = N` | Select and mutate a root teammate relative to inherited PlayerNo. |
| `memberno` / TagIn `leader` | Mutate root team order/leader state, not a Helper-owned order. |

## Primary sources

- [Official IKEMEN wiki: RedirectID targets a designated PlayerID](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#redirectid)
- [Official IKEMEN wiki: TagIn also affects Helpers and defines Tag parameters](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28new%29#tagin)
- [Pinned compiler parameter order for TagIn and TagOut](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/compiler_functions.go#L487-L547)
- [Pinned redirect-first lookup and original-caller evaluation](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L4825-L4840)
- [Pinned TagIn/TagOut Helper-capable mutation path](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L5227-L5398)
- [Pinned Helper/root partner selection](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L4997-L5009)
- [Pinned team-order and leader mutation](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L6113-L6215)
- [Pinned Helper initialization and inherited PlayerNo/team side](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L3407-L3466)
- [Pinned Helper creation fields](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L6752-L6806)
- [Pinned standby flag writes and player-list invalidation](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L4721-L4738)
- [Pinned standby Helpers continue through the character action loop](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L11737-L11769)
- [Pinned destroyed/disabled PlayerID filtering](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L1492-L1510)

## Local audit

- The identity registry now resolves live Helpers correctly and preserves caller/parent/root numeric fields.
- `RuntimeHelper` can store state, control, and `teamState.standby`; its scheduler currently continues running standby Helpers, matching the source action-loop property.
- Helper TagIn/TagOut controllers are still rejected by `helperRuntimeControllers`, and match-level Tag dispatch currently accepts only `FighterMatchState` targets.
- Helper standby does not yet suppress every local hit/combat/presentation route, so enabling true/default `self` would expose a flag without its full observable contract.
- Partner, member, and leader effects cross from a Helper target into root aggregate systems and need separate ownership tests.
- Current Helpers execute root-owned programs only; custom state-owner semantics are not modeled.

## Implementation sequence

1. Admit root-executed RedirectID to a Helper only for explicit `self = 0` and local `stateno`/TagIn `ctrl`.
2. Add a complete Helper standby participation gate across combat, push, targeting, and presentation before enabling default/true self.
3. Add Helper-relative root partner selection and partner state/control as a separate aggregate feature.
4. Map and test the source `memberNo = 0` quirk before allowing Helper-routed member/leader order mutation.
5. Route Helper-originated Tag controllers through a match callback only after the same target contract is reusable.

## Blocked

Exact incremental mutation, custom state ownership, Helper-created Helpers, Helper standby gameplay parity, partner/root aggregate mutation, member/leader quirks, Helper-originated Tag, round/score participation, and full IKEMEN parity.

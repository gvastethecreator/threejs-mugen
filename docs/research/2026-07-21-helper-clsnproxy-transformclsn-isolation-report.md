# T360 research report: Helper clsnproxy TransformClsn isolation

Date: 2026-07-21

## Question

When a root and an active `clsnproxy` Helper both carry collision transforms,
does the runtime preserve the proxy's own position, facing, scale, angle, and
pivot during root Clsn1/Clsn2 queries?

## Primary source

Ikemen-GO first collects `flattenClsnProxies`, then calls `clsnCheckSingle`
for each root/proxy combination. Each call passes the selected character's own
position, facing, `clsnScale`, and `clsnAngle` to `clsnOverlap`. The same
shape applies to projectile checks except size boxes remain root-only.

- [Proxy flattening](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L9946-L9972)
- [Projectile collision path](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10085-L10182)
- [Character collision path](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10196-L10285)

This supersedes the proxy-local angle gap named by T359. The source authority
pin remains `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`; this report does not
claim semantic equivalence for the local cache.

## Implementation

`RuntimeHelperCollisionSystem` now converts proxy frame boxes into a typed
world-space shape when the playable root bridge asks for it. Scale and helper
facing resolve before a proxy-owned rotation is attached with
`-Rad(clsnAngle * facing)` and the Helper position as pivot.

`RuntimeCollisionBox` distinguishes world-space output. `runtimeWorldBox`
returns that output unchanged, so a root position, facing, or `clsnAngle`
cannot apply a second transform. The retained parent-local adapter marks proxy
boxes outside the parent transform and retains any proxy rotation metadata,
which keeps the legacy adapter safe for callers that still project it later.

`PlayableMatchRuntime` requests world-space output for root Clsn1 and Clsn2
queries. Root frame boxes remain local and continue through the root transform;
proxy boxes bypass it. The mixed list stays structural `CollisionBox[]` at
existing combat interfaces.

## Evidence

- `RuntimeHelperCollisionSystem.test.ts` covers own proxy angle, parent and
  proxy mirror differences, scale composition, and the parent-local fallback.
- `CombatResolver.test.ts` proves a root transform cannot alter a world proxy
  box and that SAT contact still sees its rotation.
- `PlayableMatchRuntime.test.ts` proves the live IKEMEN bridge emits a
  world-space proxy with its own pivot while the root has a different angle.
- Focused Vitest passed `3/3` files and `312/312` tests.
- TypeScript 7 typecheck, `636/636` trace artifacts, production build,
  boundary check, and diff hygiene all passed.

## Limits and next work

The current proxy resolver still reads frame boxes directly. It does not yet
apply helper-local `OverrideClsn` state before proxy flattening. It also lacks
full local-coordinate, animation-local scale, offset/postype, size-box,
renderer, or upstream differential coverage. Those remain separate work.

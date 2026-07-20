# T355 research report: Helper clsnproxy root attack extension

Date: 2026-07-20

## Question

Where should the bounded runtime consume the root `clsn1` extension supplied by
an IKEMEN `clsnproxy` Helper?

## Primary source

The pinned local checkout and the official revision of
[`src/char.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10196-L10285)
show that `clsnCheck` rejects proxies as direct actors, flattens the root and
its proxy descendants, and calls `clsnCheckSingle` with the attack group `1`.
The normal HitDef path therefore tests the root's current `clsn1` set after
proxy flattening.

## Implementation

`RuntimeCombatResolutionSystem` now resolves attack boxes from the existing
`getCollisionBoxes(actor, "clsn1")` boundary. That list already contains the
root frame box and the bounded IKEMEN proxy extension from T353/T354. The
resolver feeds it into direct contact, equal-priority preparation, and priority
clash contact. `RuntimeRootDirectHitAdmissionSystem` uses the same boundary for
normal root admission, while the paired ProjTypeCollision path keeps its
Clsn2 rules.

The old move-box fallback remains for isolated callers and tests that do not
provide a collision accessor. Reversal and projectile-specific attack paths
remain separate until their source and differential evidence is ready.

## Evidence

- `RuntimeCombatResolutionSystem.test.ts` proves a direct HitDef can connect
  through a resolved root `clsn1` box when `move.hitbox` misses.
- `RuntimeRootDirectHitAdmissionSystem.test.ts` proves team/tag admission uses
  that same resolved attack list.
- Focused Vitest: `341/341` across `4` files.
- TypeScript 7 typecheck, production build (`327` modules), boundary check,
  and `634/634` trace artifacts passed.
- `diagnostics.json` reports `600` required and `34` optional artifacts,
  `634` passed, `0` failed, and `0` skipped fixtures.
- The latest full baseline remains T351's `239/239` files and `2601/2601`
  tests; full Vitest and browser smoke are deferred for this runtime-only
  block.

## Limits and next work

The current boundary does not yet cover ReversalDef proxy attack boxes,
projectile source differentials, global collision scale and angle, renderer
debug overlays, or paired upstream/local traces. Those remain separate slices
before any broader collision-parity claim.

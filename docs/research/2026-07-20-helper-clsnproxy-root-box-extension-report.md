# T353 research report: Helper clsnproxy root box extension

Date: 2026-07-20

## Question

What part of Ikemen-GO `clsnproxy` behavior can the current TypeScript runtime
implement without claiming the full collision engine?

## Primary source

The pinned local checkout and the official revision of
[`src/char.go`](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L9946-L10285)
show four relevant rules:

1. `flattenClsnProxies` walks the root and proxy descendants into one list.
2. `clsnCheck` prevents a proxy from acting as an independent hit actor, then
   checks all combinations of parent and proxy collision boxes.
3. `clsnCheckSingle` evaluates current frame boxes in each actor's position and
   facing space before overlap testing.
4. Projectile collision uses the same parent-extension rule in
   `projClsnCheck`.

The source also carries scale and angle into `sys.clsnOverlap`. The current
runtime does not yet have a validated equivalent for those fields, so this
slice keeps its transform to position and facing.

## Implementation

`RuntimeHelperCollisionSystem` now owns the bounded transform. It clones the
selected current frame boxes, walks only active proxy descendants belonging to
the requested root, converts their world rectangle into the root-local space,
and appends those boxes after the root boxes. `PlayableMatchRuntime` enables
the resolver only for `ikemen-go`, and feeds the merged `clsn2` plus selected
`clsn1` queries into the existing combat bridge. Root size boxes remain local to
the root.

The current direct Helper combat filter still excludes `clsnProxy` Helpers as
independent attackers. That matches the validated part of the source model.

## Evidence

- `RuntimeHelperCollisionSystem.test.ts` covers current-frame cloning, child
  flattening, nested facing, inactive branches, root ownership, and cycles.
- `PlayableMatchRuntime.test.ts` covers a live imported Helper marked as an
  IKEMEN `clsnproxy` and verifies its box appears in the root's collision space.
- Focused Vitest: `349/349` across `5` files.
- TypeScript 7 typecheck, production build (`327` modules), boundary check, and
  `634/634` trace artifacts passed.
- The latest full baseline remains T351's `239/239` files and `2601/2601`
  tests; the full suite and browser smoke are deferred for this runtime-only
  block.

## Limits and next work

The next collision slice must add evidence for exact clsn scale and angle,
`ownclsnscale` selection, root attack-box extension, projectile differential
behavior, and upstream/local paired traces before any broader parity claim.

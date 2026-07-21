# T360 Helper clsnproxy TransformClsn isolation

Status: resolved at bounded proxy-local collision-transform scope

Feature commit: `ee49d04b`

## Source evidence

The normative source is Ikemen-GO revision
`05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`. It flattens the root and every
active `clsnproxy` descendant, then checks each member independently. The
single collision call receives each participant's own position, facing,
collision scale, and collision angle. A root `TransformClsn angle` must not
rotate a proxy rectangle around the root pivot.

Official sources:

- [Ikemen-GO proxy flattening](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L9946-L9972)
- [Ikemen-GO projectile proxy selection](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10085-L10182)
- [Ikemen-GO root/proxy collision pairs](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10196-L10285)
- [Ikemen-GO rotation sign and overlap dispatch](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go#L1948-L2008)

## Delivered

- Added typed world-space collision boxes for the root proxy bridge.
- Kept each proxy rectangle at its own world position and attached its own
  facing-aware `TransformClsn angle` rotation around the Helper pivot.
- Made `runtimeWorldBox` preserve a world-space proxy rectangle instead of
  mirroring, translating, or rotating it through the root actor.
- Kept the parent-local adapter correct for older callers by marking proxy
  boxes outside the parent transform and retaining a proxy-owned rotation.
- Routed root `clsn1` and `clsn2` helper-proxy accessors through world-space
  output, while size boxes stay root-only.
- Added coverage for parent and proxy mirror differences, root-angle bypass,
  proxy pivot/angle, and the live `PlayableMatchRuntime` bridge.

## Verification

- Focused Vitest passed: `3/3` files and `312/312` tests.
- `pnpm typecheck` passed with TypeScript `7.0.2`.
- `pnpm qa:trace` passed: `636/636` artifacts, `602` required and `34`
  optional; no failed or skipped fixture.
- `pnpm build` passed with `328` transformed modules and `2,093.73 kB` JS
  before gzip.
- `pnpm check:boundaries` and `git diff --check` passed.
- Full Vitest remains deferred. The latest full baseline is T356 with
  `240/240` files and `2612/2612` tests.
- Browser smoke remains deferred because this is a runtime collision slice.

## Claim ceiling

This ticket proves bounded active-root `clsnproxy` Clsn1/Clsn2 geometry keeps
the proxy's own world position, facing, current scale path, angle, and pivot
when the root also has a collision angle. It does not prove Helper
`OverrideClsn`, complete `animlocalscl` or `localcoord` ordering, helper
offset/postype parity, size-box proxy behavior, every projectile/reversal
case, upstream differential parity, renderer parity, score movement, or full
MUGEN/IKEMEN collision parity.

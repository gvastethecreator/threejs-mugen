# HitFlag minus/plus admission research

## Question

Which explicit `HitFlag -/+` rule can be implemented now while keeping the
sandbox honest about its partial `hittmp` and `acttmp` models?

## Primary source evidence

- The pinned [IKEMEN GO character loop](https://github.com/ikemen-engine/Ikemen-GO/blob/044da72008b8ba13caf7b0f820526ce16e955fb3/src/char.go#L10440-L10461)
  rejects `-` when the defender's `hittmp` is greater than zero, and rejects
  `+` unless `hittmp` is positive and the defender is not in a guard state.
- The same pinned source updates `hittmp` to `Btoi(fallflag) + 1` while the
  defender has move type `H`, and resets a positive value after leaving the
  get-hit move type at the action boundary:
  [update loop](https://github.com/ikemen-engine/Ikemen-GO/blob/044da72008b8ba13caf7b0f820526ce16e955fb3/src/char.go#L11863-L11883)
  and [fall mechanics](https://github.com/ikemen-engine/Ikemen-GO/blob/044da72008b8ba13caf7b0f820526ce16e955fb3/src/char.go#L12122-L12132).
- The [Elecbyte HitDef reference](https://elecbyte.com/mugendocs-11b1/sctrls.html)
  documents compact hitflag strings: `+` affects only get-hit targets,
  `-` affects only targets not in get-hit, and omitted hitflags default to
  `MAF`.
- IKEMEN's [guard-state predicate](https://github.com/ikemen-engine/Ikemen-GO/blob/044da72008b8ba13caf7b0f820526ce16e955fb3/src/char.go#L9514-L9517)
  identifies the Common1 guard states that the `+` rule must exclude.

## Repository boundary

The repository already carries explicit authored `HitDef.hitflag` values into
`DemoMove.hitFlag`. Runtime actors expose `moveType`, `stateNo`, `hitFall`, and
the guard latch, while root admission stores a narrower runtime projection.
Projectiles do not currently carry an authored direct HitDef `hitFlag` field,
so they cannot be included without first changing projectile ownership.

## Decision for T261

Use one pure admission predicate and one rejection-reason helper:

1. If `hitFlag` is omitted, preserve the current compatibility behavior.
2. Normalize compact, comma-delimited, and whitespace-delimited flag text.
3. Project `hittmp` as `0` for non-`H`, `1` for `H` without fall metadata, and
   `2` for `H` with `hitFall.falling = true`.
4. Apply the existing `F` / `NoFallHitFlag` rule at projected `hittmp = 2`.
5. Reject `-` for projected `hittmp > 0`.
6. Require projected `hittmp > 0` for `+`, and reject Common1 guard states or
   the runtime guard latch.

This is a deliberately bounded admission projection, not a claim that the
sandbox owns the engine's full per-tick `hittmp` lifecycle or reversal value
`-1`.

## Uncertainty and non-claims

- Default `MAF` inference remains unchanged because imported/default HitDef
  ownership is a separate compatibility boundary.
- State-type `H/L/A/D` admission, projectile HitDef metadata, reversal
  admission, exact pause scheduling, custom-state ownership, and ZSS/Lua stay
  outside this tranche.
- The current guard latch is a runtime compatibility signal; exact guard-state
  controller ordering and all custom guard states remain open.

## Implementation outcome

Implemented in `c88fd483` after planning commit `bf5f296c`. The shared direct
predicate now parses compact and separated explicit hitflags, projects the
bounded runtime `hittmp` values `0/1/2`, and applies source-ordered `F`, `-`,
and `+` admission across root, regular direct, equal-priority preparation, and
helper routes. Focused coverage passed `4` files / `79` tests before T262;
grouped closeout evidence passes `230` files / `2416` tests, TypeScript 7,
build, boundaries, redirect boundary, trace QA, and diff hygiene. The claim
ceiling remains bounded and omitted/default flags, projectiles, reversals, and
exact `hittmp`/`acttmp` remain open.

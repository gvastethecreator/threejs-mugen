# HitFlag minus/plus closeout report

- Date: 2026-07-18
- Ticket: [T261](../../.scratch/wayfinder/mugen-ikemen-threejs-port/tickets/261-hitflag-minus-plus-admission.md)
- Planning commit: `bf5f296c`
- Feature commit: `c88fd483`
- ADR: [`0028-hitflag-minus-plus-admission`](../adr/0028-hitflag-minus-plus-admission.md)
- Research: [`2026-07-18-hitflag-minus-plus-admission`](../research/2026-07-18-hitflag-minus-plus-admission.md)

## Result

The runtime now parses explicit compact/separated HitFlag text and shares a
bounded `hittmp` projection across root admission, regular direct combat,
equal-priority preparation, and helper direct combat. `-` rejects projected
get-hit/falling targets; `+` requires projected get-hit/falling targets and
excludes Common1 guard states and the runtime guard latch. Existing `F` and
`NoFallHitFlag` behavior remains intact, and omitted hitflags remain unchanged.

## Verification

- Focused: `4` files / `79/79` tests passed.
- Grouped full suite after T262: `230` files / `2416/2416` tests passed.
- TypeScript 7 typecheck: passed.
- Production build: passed; existing Vite large-chunk advisory remains.
- Repository boundaries: passed.
- Redirected-target boundary: passed.
- Trace gate: `633/633` artifacts passed (`599` required, `34` optional), with
  no failed artifacts and no skipped optional fixtures.
- `git diff --check`: passed.
- Browser smoke: N/A; no renderer, Studio, or visible surface changed.

The trace runner logged WebSocket port `24678` already occupied by the known
unrelated process from `D:\DEV\moklos.club`; this did not change the passed
trace result.

## Quality audit

- Source alignment: IKEMEN `hittmp`, `-`, `+`, and guard-state branches were
  checked against pinned commit `044da72008b8ba13caf7b0f820526ce16e955fb3`;
  the Elecbyte HitDef reference was also checked for compact flag semantics.
- Adversarial cases: compact/comma/whitespace flags, idle/get-hit/falling,
  explicit guard state, omitted hitflags, direct/root/helper paths, and
  equal-priority pre-admission were covered without mutation on rejection.
- Compatibility audit: the complete test and trace corpus remained green; no
  compatibility score moved.

## Claim boundary

Allowed: explicit direct HitFlag `-`/`+` admission over the bounded runtime
projection. Blocked: default inference, state-type completeness, projectiles,
reversals, exact `hittmp`/`acttmp`, ZSS/Lua, rollback/netplay, and full parity.

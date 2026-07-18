# T263 closeout: explicit projectile HitFlag admission

- Date: 2026-07-18
- Planning commit: `597b03bf`
- Implementation commit: `f6990dff`
- ADR: [`0030-projectile-hitflag-admission`](../adr/0030-projectile-hitflag-admission.md)
- Ticket: [`263-projectile-hitflag-admission`](../../.scratch/wayfinder/mugen-ikemen-threejs-port/tickets/263-projectile-hitflag-admission.md)

## Delivered

- `Projectile` compiles static explicit `hitflag` into typed IR.
- `ModifyProjectile` compiles and applies static explicit `hitflag` to active
  matching projectiles.
- Live projectile state and effect snapshots expose authored HitFlags.
- Projectile/player contact reuses the direct state-type, fall,
  `NoFallHitFlag`, minus, and plus predicate before HitBy/NotHitBy and
  overrides.
- Omitted values remain undefined; dynamic string expressions remain outside
  this contract.

## Verification

- Focused: `3` test files / `115` tests passed.
- Full suite: `230` test files / `2418` tests passed.
- `pnpm typecheck`: passed.
- `pnpm build`: passed; Vite emitted `1,973.94 kB` JavaScript with the
  existing large-chunk advisory.
- `pnpm check:boundaries`: passed.
- `pnpm check:redirect-boundary`: passed.
- `git diff --check`: passed; existing dirty roadmap files emit only CRLF
  normalization warnings.
- `pnpm qa:trace`: passed `633/633` artifacts (`599` required, `34` optional),
  `0` failed, `0` skipped optional; controller families `92`, operation
  families `87`. The known unrelated WebSocket port `24678` warning did not
  change the final passed status.
- Browser smoke: N/A; no visible UI or renderer surface changed.

## Claim ceiling

This closeout proves one source-backed static explicit projectile/player
HitFlag path. It does not prove default `MAF` inference, dynamic string
expressions, reversal or clash parity, exact projectile pause/contact timing,
`acttmp`/`hittmp`, custom-state breadth, or full MUGEN/IKEMEN compatibility.

## Next frontier

The next independent compatibility frontier is default HitFlag inference and
its provenance boundary, or a separately audited projectile `acttmp`/pause
route. Neither should be inferred from this closeout.

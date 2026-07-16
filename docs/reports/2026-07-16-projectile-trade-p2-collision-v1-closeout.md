# Wayfinder 209 closeout: projectile trade and p2 collision

Date: 2026-07-16  
Commits: `de3cf4a` selection, `3838fa5e` implementation, `845b8de5` fixture alignment

## Delivered

- Shared `MugenCollisionBoxType`: `clsn1`, `clsn2`, `size`, `none`.
- Compiler lowering and raw imported fallback for `p2clsncheck` and
  `p2clsnrequire` on HitDef and Projectile operations.
- Direct, tag-root, and projectile contact selection with required-box
  preconditions that fail closed.
- `ProjTypeCollision` remains authoritative for paired player/projectile
  `Clsn2` contact.
- Projectile trade admission now uses strict current-frame `Clsn2`, preserving
  the existing priority decrement/trade arbitration.
- EffectActor trade fixtures now author overlapping `Clsn2` geometry.

## Evidence

- Focused: `168/168` tests passed across compiler, HitDef, projectile, direct
  combat, root admission, and effect actor surfaces.
- TypeScript 7: `pnpm typecheck` passed.
- Build: `pnpm build` passed; existing large-chunk warning remains.
- Boundaries: `pnpm check:boundaries` passed.
- Trace QA: `pnpm qa:trace` passed `633/633` artifacts, `0` skipped.
- Full checkpoint: `pnpm test -- --testTimeout=15000` passed `2262/2263` tests.

## Residual

The one remaining full-suite failure is the pre-existing
`RuntimeMatchPostFighterSystem.test.ts` call-list assertion. It omits same-owner
projectile clash/cancel/contact callbacks already scheduled by
`MatchInteractionSystem`; this feature did not change that scheduling path.

Still blocked: exact proxy flattening, depth and `affectteam` ordering, complete
cancel-time parity, rollback/netplay, score, renderer/audio parity, and full
MUGEN/IKEMEN parity.


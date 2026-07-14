# Report: Score-band adjudication, Entry 530

## Decision

The practical MUGEN compatibility score moves from **35 to 36 / 100**. This
is the minimum promotion into the written `36-55` practical MVP band, whose
criterion is an official/local KFM-style fixture executing common authored
routes with visible reports.

All other headline scores remain unchanged: `65 / 20 / 10-12 / 6-8 / 25` for
the private sandbox, MUGEN MVP, full MUGEN, IKEMEN-GO-class port, and Studio /
modular engine respectively.

## Gate matrix

| Criterion | Evidence | Verdict |
| --- | --- | --- |
| KFM-style movement | Passed local official KFM basic-movement artifact | Accepted |
| Normal and special attack | Passed KFM `x` and QCF `x` artifacts | Accepted |
| Guard and get-hit | Passed KFM guard, hitstun, get-hit, fall artifacts | Accepted |
| Recovery and visible reports | Passed KFM recovery traces, compatibility reports, and Studio stage report | Accepted |
| Independent stage/package breadth | Official Training Room route, browser/native gates, `optional-private` corpus entry | Accepted as bounded breadth |
| Public breadth / parity | Not proven | Blocked |

## Verification

- `CompatibilityCorpus.test.ts`: 4/4 focused tests.
- `pnpm typecheck`: passed.
- Full suite: 211 test files / 2129 tests passed with controlled workers.
- `pnpm build`: passed, 289 modules; existing large chunk advisory remains.
- `pnpm qa:trace`: 600/600 artifacts passed.
- `pnpm qa:stage`: desktop/mobile official Training Room route passed with zero
  page errors and zero console issues.

## Claim ceiling

Allowed: `official KFM route executed partial` and `bounded practical MUGEN
compatibility at the 36/100 band threshold`.

Blocked: `KFM works`, full MUGEN compatibility, public character breadth,
commercial redistribution, exact Common1/VM/tick parity, complete stage parity,
and any IKEMEN ZSS/Lua/rollback/netplay claim.

## Next

Continue with the next independently evidenced stage/runtime gap. No further
score movement is implied until another written criterion is met.

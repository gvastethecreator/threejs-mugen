# Source Authority Reconciliation Closeout

Date: 2026-07-18
Ticket: Wayfinder 269
Commit: `0d4a0274`

## Result

The selected normative/local IKEMEN source bytes are now materialized in
`docs/evidence/source-authority-manifest-v0.json`. The artifact compares
normative revision `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703` with local
revision `044da72008b8ba13caf7b0f820526ce16e955fb3` across nine selected
files: three are `same`, six are `changed`. The local cache is `dirty` because
four pre-existing untracked files are present. Artifact SHA-256:
`20216fe3f7031af71fd43af8ca1e918037cea9a23eb8a642cb8c2085442ff79b`.

## Evidence

- Real materialization passed through `pnpm materialize:source-authority`.
- Artifact parser test passed: `1` file / `7` tests.
- Missing normative Git root returned exit code `1` with a fail-closed error.
- `node --check`, TypeScript 7, module boundaries, and redirect boundaries
  passed.
- Browser smoke: N/A, tooling-only change.

## Claim ceiling

Allowed: reproducible selected-file identity, byte-level delta, dirty-cache
visibility, and fail-closed materialization. Blocked: semantic equivalence,
repository-wide reconciliation, ZSS/Lua/module execution, runtime parity,
rollback/netplay, and score movement. `semanticReview` is intentionally
`unclassified`.

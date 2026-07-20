# T341 - Helper RedirectID ancestry admission

Status: resolved at bounded stale-caller scope
Date: 2026-07-20

## Source evidence

The pinned Ikemen-GO runtime resolves PlayerID-based controller targets from
live character identity. A Helper redirect therefore needs a live caller
identity as well as a valid destination. The local port already had the
ancestry verifier used for nested source and target-life cause admission, but
the Helper RedirectID entry point did not call it.

Pinned revision: `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.

## Delivered

- `resolveHelperTargetRedirect` now rejects an `ikemen-go` Helper caller whose
  live parent chain cannot reach its declared root.
- Target and resource RedirectID controllers share that caller guard.
- Redirected-target telemetry uses the verified root for `ikemen-go`, while
  legacy profiles retain their existing fallback path.
- Valid first-generation and nested Helper redirects remain admitted; missing,
  stale, cyclic, cross-root, or identity-inconsistent callers fail closed.

## Verification

- `pnpm exec vitest run src/tests/PlayableMatchRuntime.test.ts --testTimeout=30000`
  passed: 1 file / 281 tests.
- `pnpm typecheck` passed with the TypeScript 7 toolchain.
- `git diff --check` passed.
- No renderer or Studio UI file changed; browser smoke is deferred.

## Claim ceiling

This closes live caller ancestry admission for bounded Helper target/resource
RedirectID dispatch in `ikemen-go`. It does not claim recursive redirect
leases, Helper-victim result attribution, reversal/reflection ownership, exact
dispatch ordering, direct screenpack proof, or complete MUGEN/IKEMEN parity.

## Sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go
- `.scratch/external/Ikemen-GO/src/bytecode.go`
- `.scratch/external/Ikemen-GO/src/char.go`

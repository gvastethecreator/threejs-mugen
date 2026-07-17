# Implement SourceWriteReceipt/v1 compensation

Type: task
Status: resolved
Blocked by: None

Implementation commit: `2f072a4c`
Verification commit: `65badd9b`

## Question

Can the existing single-file folder source editor retain a byte-level preimage
through the post-close reimport verification boundary, restore it after a
verification failure, and expose a parser-validated `restore-failed` outcome
without implying ZIP, multi-file, ACID, or rollback/netplay guarantees?

## Answer

Implement a bounded v1 receipt and helper seam. Capture the existing file bytes
and SHA-256 before opening the exclusive writer. After `close()`, keep the
preimage alive until reimport and digest verification finish. On any failure
after close, write the exact preimage through a fresh exclusive stream, reopen
the file, compare bytes/length/digest, and record `restored` or
`restore-failed` with diagnostics. Reimport the restored folder when the failed
verification already changed the active runtime. Keep ZIP, create/delete,
multi-file transactions, and ACID claims blocked.

## Evidence target

- Focused tests cover preimage read failure, staged write/close failure, exact
  restore, rejected compensating write, and restore byte-verification failure.
- Browser smoke keeps the existing real folder save/reimport journey green and
  asserts the v1 receipt plus compensation fields.
- TypeScript 7, syntax, diff, and the final batched browser gate close the cut.

## Closeout evidence

- `pnpm exec vitest run src/tests/StudioSourceWrite.test.ts src/tests/StudioSourceWriteReceipt.test.ts`
  passes `16/16` focused tests.
- `pnpm run typecheck`, `pnpm run build`, `node --check scripts/qa_smoke.cjs`,
  and the scoped `git diff --check` pass.
- `pnpm run qa:smoke` passes in started-Vite mode in `539.4s`; the browser
  artifact reports `0` console issues and `0` page errors.
- `.scratch/qa/qa-smoke-v4/diagnostics.json` records
  `source-write-receipt/v1`, `committed`, `write-and-reimport`, and
  `compensation.status = not-needed` with a 64-character SHA-256 preimage
  digest and byte length. The exported package contains the same receipt.

## Result

The existing-file folder editor now retains a byte-level preimage through the
post-close verification boundary. Failed verification attempts restore the
preimage through a fresh exclusive stream and reimport the restored folder when
the runtime had already changed. The parser rejects missing or incomplete v1
compensation evidence.

## Claim ceiling

The contract proves bounded one-file compensation after a successful stream
close. It does not prove durable crash recovery, filesystem journal semantics,
multi-file atomicity, ZIP rewrite, or external-engine parity.

Next ordered Studio cut: `T07 ProjectReleaseDecision/v0`; deterministic semantic
export remains `T09` after the decision contract is explicit.

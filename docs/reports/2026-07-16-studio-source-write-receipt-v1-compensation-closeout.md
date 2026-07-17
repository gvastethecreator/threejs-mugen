# Studio SourceWriteReceipt/v1 compensation closeout

Date: 2026-07-16
Wayfinder ticket: 234
Implementation commit: `2f072a4c`
Verification commit: `65badd9b`

## Global status

| Area | Status | Evidence |
| --- | --- | --- |
| Preimage capture | passed | Exact file bytes, SHA-256, and byte length retained before write |
| Post-close compensation | passed | Fresh exclusive restore stream plus byte/digest/length verification |
| Failure evidence | passed | `restored` and `restore-failed` parser paths with diagnostics |
| Studio save/reimport integration | passed | Existing folder editor retains/reimports the restored runtime when needed |
| Receipt/export consumers | passed | Evidence, Build, Trust Chain, bridge, and required ZIP receipt use v1 |
| Focused tests | passed | `16/16` `StudioSourceWrite` and `StudioSourceWriteReceipt` tests |
| TypeScript 7 and production build | passed | `pnpm run typecheck`, `pnpm run build` |
| Browser smoke | passed | `pnpm run qa:smoke`, `539.4s`, 0 console issues, 0 page errors |

## Result

The existing-file folder source editor now keeps a byte-level preimage alive
until post-close reimport and semantic verification finish. A failed
verification restores the original bytes through a new exclusive stream and
checks exact byte equality, SHA-256, and length. If the active runtime had
already changed, the restored folder is reimported before the failure receipt
is exposed. Missing or incomplete compensation fields fail closed in
`SourceWriteReceipt/v1`.

## Browser evidence

`.scratch/qa/qa-smoke-v4/diagnostics.json` records:

- `source-write-receipt/v1`
- `status = committed`
- `reason = write-and-reimport`
- `compensation.status = not-needed`
- a 64-character SHA-256 preimage digest and safe byte length
- matching receipt metadata in `studio-source-write-package.zip`
- `0` console issues and `0` page errors

The smoke runner also received a bounded stability hardening: the generated
asset filter uses the visible DOM event path instead of relying on a transient
viewport click, and navigation allows the cold Vite bundle up to 120 seconds.
Assertions remain state- and artifact-based.

## Research basis

The implementation follows the browser write boundary described by the
[WHATWG File System Standard](https://fs.spec.whatwg.org/#api-filesystemfilehandle-createwritable)
and the permission/exclusive-writer behavior documented by
[MDN `FileSystemFileHandle.createWritable()`](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle/createWritable).
The browser contract does not provide an application recovery journal, so the
preimage and compensation receipt remain application-owned evidence.

## Claim ceiling and next

This closes only one existing file in a linked folder after a resolved writer
close. It does not claim crash recovery, filesystem journal durability,
multi-file atomicity, file creation/deletion, ZIP rewrite, rollback/netplay,
external-engine parity, or full MUGEN/IKEMEN parity.

Next ordered Studio cut: `ProjectReleaseDecision/v0` (T07). Deterministic
semantic export remains T09 after the release-decision contract is explicit.

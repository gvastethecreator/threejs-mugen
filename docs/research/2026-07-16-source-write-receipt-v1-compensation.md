# SourceWriteReceipt/v1 compensation research

Date: 2026-07-16

## Question

What can the browser File System Access contract support for a bounded
single-file Studio source write, and where must the application add explicit
compensation evidence?

## Answer

`createWritable()` provides a staged write boundary: the WHATWG File System
Standard says changes are not reflected in the file entry until the stream is
closed and user agents try to avoid partial writes. `keepExistingData` controls
whether the existing bytes seed the staged buffer. The application still needs
its own preimage, post-close reimport verification, and compensating restore for
failures after close. This is a bounded transaction pattern, not a general
filesystem or multi-file ACID guarantee.

## Primary sources

- WHATWG File System Standard, living standard last updated 2026-03-15:
  https://fs.spec.whatwg.org/#api-filesystemfilehandle-createwritable
  - `createWritable()` changes are not reflected until close; user agents try
    to avoid partial writes; `keepExistingData` copies existing bytes into the
    staged buffer.
  - The same standard defines file snapshots through `getFile()` and the
    `readwrite` access boundary for `createWritable()`.
- MDN `FileSystemFileHandle.createWritable()`, revised 2025-07-04:
  https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle/createWritable
  - `mode: "exclusive"` rejects concurrent writers and permission/not-found
    failures remain possible at the write boundary.

## Implementation decision

1. Read the target file bytes before opening the writer. Copy the bytes into a
   short-lived in-memory preimage and calculate SHA-256 plus byte length.
2. Use the existing exclusive staged stream for the new bytes. Treat resolved
   `close()` as the post-close boundary, not as successful Studio commit.
3. Reimport and verify the edited path and semantic digest. Retain the preimage
   until this verification completes.
4. If verification fails after close, write the preimage through a fresh
   exclusive stream, reopen it, and compare exact bytes, length, and SHA-256.
5. Emit a v1 receipt with `compensation.status = restored` or
   `restore-failed`, diagnostics, preimage digest/length, and restored
   digest/length when available.

## Uncertainty and blocked scope

The browser standard does not provide a durable application recovery journal or
guarantee that storage hardware has flushed every modification at `close()`.
This cut therefore proves only observed byte-equivalent restore in the active
handle path. Crash recovery, multi-file commit, archive rewrite, file creation
or deletion, and rollback/netplay remain separate work.

## Outcome

Ticket 234 is resolved in commit `2f072a4c`. The helper and receipt parser now
cover preimage capture, exact restore, rejected restore writes, and failed
restore verification. The real folder browser journey passes with a committed
`source-write-receipt/v1` and exported compensation metadata; the bounded
claim still excludes crash recovery, ZIP rewrite, and multi-file atomicity.

The next ordered Studio cut is `ProjectReleaseDecision/v0` (T07). Deterministic
semantic export remains T09 after that decision contract is explicit.

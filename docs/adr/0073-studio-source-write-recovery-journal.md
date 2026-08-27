# ADR 0073: Studio source-write recovery journal

- Status: Proposed
- Date: 2026-07-28
- Owner: Studio/product
- Depends on: ADR 0065, ADR 0072, DA32-021…026

## Context

Studio already uses IndexedDB as the authority for envelopes, revisions, snapshots, write intents, phases, and receipts. File System Access keeps the external handle and asks for its own permissions. IndexedDB can commit a transaction on its object stores. That commit does not include the external file stream.

DA32-026 proves rehydration of a receipt that is already persisted. The drop windows between open, write, close, reimport, and receipt creation are still missing. Quota, eviction, and file groups are also missing.

## Proposed decision

1. IndexedDB keeps the project, the revision, and the recovery journal.
2. Each external write uses a stable id, base revision, previous digest, expected digest, bytes or preimage reference, phase, and permission state.
3. The close receipt is immutable and is validated by digest on rehydrate.
4. `write-closed` without a receipt enters `needs-observation`. Studio does a readback when it has permission and compares length and digest.
5. Studio offers explicit actions: accept the observed file, restore the preimage, retry with a new permission, or abandon the intent.
6. Studio does not create a receipt or repeat a write only because the stream closed. Each action needs an observation or a user order.
7. A file group uses a manifest and one saga per file. The product does not promise atomicity across IndexedDB, loose files, or ZIP.
8. The log keeps cause, phase, subject, browser, and result so a gate can reproduce failures.

## Alternatives

### A. Automatic retry after reload

Fewer steps, but it can overwrite an external edit and does not resolve a closed-stream uncertainty. Rejected.

### B. Treat IndexedDB and File System Access as one transaction

Simpler conceptual interface, but the APIs do not share commit or rollback. Rejected.

### C. Always write a new copy and replace at the end

Helps on some systems, but File System Access does not offer a portable transactional rename for the whole group. It can stay as an adapter tactic without raising the general claim.

### D. Explicit journal, observation, and user actions

Exposes the uncertainty, avoids hidden overwrites, and allows tests per failure window. This is the proposed option.

## Consequences

- The interface must distinguish `pending`, `permission-required`, `write-started`, `write-closed`, `needs-observation`, `observed-match`, `observed-divergence`, `receipt-settled`, and `abandoned`.
- Gates must inject each cut and prove bytes, digest, revision, permission, message, action, and the absence of hidden writes.
- Quota, eviction, multi-tab, and multi-file stay as their own cuts.
- The allowed claim covers only the subject, browser, and window that passed.

## ADR acceptance

- Joint review of Studio, persistence, and QA.
- Complete matrix of phases and valid transitions.
- At least one positive and one negative case per drop window.
- Explicit decision on preimage retention and encryption.
- No atomic-commit claim between IndexedDB and the file system.

## Sources

- [Indexed Database API 3.0](https://www.w3.org/TR/IndexedDB/)
- [File System Access](https://wicg.github.io/file-system-access/)

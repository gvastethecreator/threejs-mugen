# Research: Studio SourceWriteReceipt/v0

Date: 2026-07-16
Lane: R2 Studio editor reliability and evidence
Wayfinder ticket: 225
Implementation commit: `653a1e2c`

## Question

How can the existing folder-backed CNS/ST editor prove what happened after a
user presses Save & Reimport, without turning a successful button click into a
release claim?

## Decision

Keep `SourceWriteReceipt/v0` app-owned and attach it to the existing source
transaction boundary. The receipt records the operation outcome, not only the
intent to write. A source edit is committed only after the exclusive writable
stream closes, the folder is explicitly reimported, the edited path is still
present, the semantic source digest matches the preflight digest, and the
reimport exposes a source fingerprint.

Represent blocked and rejected outcomes instead of dropping them. This keeps
permission denial, project conflict, changed source identity, semantic
diagnostics, and reimport mismatch visible in Evidence and exportable as
diagnostic context while keeping `canExport` false.

## Findings from the repository

- `StudioSourceWrite.ts` already provides the directory-only plan gate and
  exclusive `createWritable` operation.
- `StudioSemanticDraft.ts` already provides CNS/ST parsing, runtime compile
  diagnostics, stale source checks, and a deterministic draft digest.
- `App.saveStudioSourceDocument()` already performs explicit reimport and
  refreshed-text comparison, but had no durable outcome record.
- `SourceTransaction/v0` already defines the invalidated output set, so the
  receipt reuses `runtime-manifest`, `trace-artifact`, and `project-bundle`
  rather than inventing a parallel invalidation vocabulary.
- The browser-backed source journey uses a VFS-rooted path such as
  `kfm-folder/chars/kfm/kfm.cns`; the receipt preserves that canonical editor
  path and Trust Chain targets it as a `source-file`.

## Integrity and status policy

The digest is a deterministic FNV-1a 32-bit transport-integrity marker. It
detects unsupported payload edits at the application boundary but is not a
cryptographic source identity or an external attestation. Source identity
continues to use the existing SHA-256 virtual-file-system fingerprint, while
semantic equivalence uses the existing CNS/ST draft digest.

The parser fails closed for missing required fields, invalid optional values,
unknown status/reason values, malformed permission, missing digest, and digest
mismatch. The committed predicate additionally requires both committed source
fingerprint and committed semantic digest.

## Verification policy

The focal contract suite covers deterministic construction, parser acceptance,
tamper rejection, malformed optional fields, blocked non-commit behavior, and
missing digest rejection. The broad browser smoke proves the user path from a
real remembered folder through invalid/valid editing, exclusive write,
explicit reimport, Evidence, Trust Chain, and required ZIP export on the same
session record.

## Boundaries

This slice does not rewrite ZIP archives, reacquire handles after browser
restart, or promote a shared evidence contract. The next independent contract
should add package/asset analysis evidence, then evaluate whether two real
consumers justify a shared Evidence abstraction.

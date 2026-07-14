# Research: StudioSemanticDraft/v0

Date: 2026-07-14

## Question

How can Studio edit one existing CNS/ST file without opening a writable stream
for malformed, unsupported, or stale source content?

## Primary sources

- [WHATWG File System Standard: `createWritable()`](https://fs.spec.whatwg.org/#dom-filesystemfilehandle-createwritable)
  says changes are not reflected in the file entry until the stream closes and
  describes temporary-file behavior intended to avoid partial writes.
- [Elecbyte CNS documentation](https://www.elecbyte.com/mugendocs/cns.html)
  defines numbered state definitions and controller blocks as the focused draft
  structure.
- [Elecbyte state controller reference](https://www.elecbyte.com/mugendocs/sctrls.html)
  supports keeping unsupported controller behavior as explicit compatibility
  facts instead of treating parser success as runtime parity.

## Decision

`StudioSemanticDraft/v0` is an in-memory, non-persistent preflight envelope for
one `.cns` or `.st` file. It records source package/path, base versus active
source fingerprint, base versus active project revision, compiler profile/version,
deterministic source and diagnostic digests, parser diagnostics, and a compact
Runtime IR compilation summary.

The write gate is fail-closed:

- `ready`: parser completed without syntax diagnostics and source context is
  unchanged; unsupported controllers remain visible warnings;
- `invalid`: unsupported extension or parser diagnostic; the editor remains
  usable for repair, but Save stays disabled;
- `stale`: source fingerprint or project revision moved; editing pauses until
  explicit reimport or conflict resolution.

Immediately before `createWritable()`, Studio requests write permission again,
re-reads the remembered folder, recomputes its SHA-256 fingerprint, and compares
it with the draft base. After close and explicit reimport, the edited document's
deterministic digest is compared with the requested draft digest. A successful
close is not described as application-level rollback: any post-close mismatch is
reported and the reimported text remains visible for inspection.

## Scope boundary

This slice does not add a structured CNS editor, CMD/DEF/AIR editing, ZIP
rewrite, create/delete, file watching/merge, or post-close compensating rollback.
The existing explicit folder write plus reimport transaction remains the only
mutation path.


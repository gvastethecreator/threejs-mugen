# AssetProvenance/v1 File Digest Research

Date: 2026-07-13

## Question

How can Studio prove which source bytes and exported binary files belong to an
asset without treating a package fingerprint as the hash of an output file?

## Sources

- [MDN `SubtleCrypto.digest()`](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest)
- [MDN File API](https://developer.mozilla.org/en-US/docs/Web/API/File_API)
- [MDN `FileReader.readAsArrayBuffer()`](https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsArrayBuffer)
- [W3C IndexedDB 3.0](https://www.w3.org/TR/IndexedDB/)

## Findings

- `SubtleCrypto.digest()` can hash each byte buffer already available to the
  browser. The current package fingerprint remains a separate deterministic
  digest over sorted paths, lengths, and bytes.
- File and FileReader APIs provide session-readable bytes, but do not grant a
  durable write capability or make an external path safe to publish.
- Export records already know the package path, byte length, and binary hash
  after a candidate is fetched or copied from the VFS. That record is the
  correct output-side evidence for the current export session.
- Source and output paths need independent redaction before they enter the
  public bridge or project diagnostics.

## Decision

`SourceFingerprint/v1` keeps the aggregate package digest and adds a sorted
per-file inventory. `AssetProvenance/v1` keeps separate `inputFiles` and
`outputFiles` arrays, each with a redacted path, byte length, and optional
SHA-256 digest. A record is complete when its available file side is fully
hashed and both input and output evidence exist; otherwise it remains partial.

The exporter does not invent an aggregate output digest for a multi-file
transform. Its per-file hashes are exposed as output evidence, while the
existing package manifest remains the authoritative bundle inventory.

## Local Boundary

The project manifest persists source file digests for future relink comparison.
The Studio bridge joins source VFS candidates to those digests and joins
successful bundle records to output files. Smoke checks schema v1 and path
redaction without claiming that metadata-only assets are complete.

## Deferred Work

Durable File System Access handles, IndexedDB metadata, permission-aware source
writes/recovery, license and ownership assertions, ordered transform chains,
and full generated-authoring provenance remain separate work.

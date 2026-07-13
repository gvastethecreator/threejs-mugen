# AssetProvenance/v0 Read Model Research

Date: 2026-07-13

## Question

What minimum provenance contract lets Studio report whether an asset has
content evidence without leaking a developer's local filesystem path or
pretending that a source fingerprint is an output-file digest?

## Sources

- [MDN `SubtleCrypto.digest()`](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest)
- [MDN File API](https://developer.mozilla.org/en-US/docs/Web/API/File_API)
- [MDN `FileReader.readAsArrayBuffer()`](https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsArrayBuffer)
- [W3C IndexedDB 3.0](https://www.w3.org/TR/IndexedDB/)

## Findings

- `SubtleCrypto.digest()` gives a content digest for bytes already held by the
  browser, but it does not turn a package fingerprint into a per-output-file
  digest and it does not provide streaming input by itself.
- File and FileReader APIs expose readable browser-session bytes; they do not
  establish durable write permission or a recoverable external path.
- Absolute local paths must not enter project or public diagnostics records.
  Public URLs and virtual package paths can remain useful after a leading local
  root is removed.
- IndexedDB is appropriate for future metadata persistence, but a persisted
  provenance record still needs an explicit relationship to the external bytes
  it describes.

## Decision

Implement `AssetProvenance/v0` as a pure record with separate input and output
digests, optional tool and permission metadata, a redacted source reference,
and an honest `complete`, `partial`, or `blocked` status. Missing output digest
keeps provenance readiness false even when the asset remains playable and the
current browser package exporter can still include it with warnings.

The current source package fingerprint is accepted only as an input digest. It
is never copied into `outputDigest` as a shortcut.

## Local Boundary

Asset Library exposes one record per asset through the Studio bridge and the
selected asset detail surface. Smoke verifies the schema, record coverage,
partial readiness for metadata-only assets, and zero absolute-path leaks.

## Deferred Work

Per-file output hashing, digest computation for every generated binary,
permission-aware source editing, IndexedDB handle metadata, license/ownership
fields, and export blocking policy remain separate work. This record does not
claim unknown licensing or complete asset provenance.

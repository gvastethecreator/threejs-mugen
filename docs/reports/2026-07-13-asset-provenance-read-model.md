# AssetProvenance/v0 Read Model Report

Date: 2026-07-13
Status: closed; implementation and grouped verification passed

## Scope

Studio now publishes a provenance record for every Asset Library item. The
record distinguishes input and output content digests, keeps durable permission
optional and explicit, redacts absolute local paths, and reports whether the
provenance itself is complete without changing the existing playable package
export path.

## Contract

- `complete` requires both a valid SHA-256 input digest and output digest.
- `partial` keeps the asset visible but marks provenance readiness false when a
  content digest is missing.
- `blocked` is reserved for a required durable permission that is not granted.
- A source package fingerprint is recorded only as `inputDigest`.
- Absolute drive, UNC, file URL, and traversal paths are replaced with
  `[local-path-redacted]`; virtual/public paths remain relative.
- Asset Library, selected Asset Detail, and `studioAssets` expose the same
  schema and record set.

## Claim Ceiling

Allowed: provenance completeness/readiness evidence and path-redaction safety.

Blocked: per-file output digest coverage, license certainty, durable source
editing, handle persistence, and full MUGEN/IKEMEN parity.

## Verification

- Focused provenance/source/model tests: 3 files, 25 tests passed.
- Full test suite: 191 files, 1989 tests passed.
- TypeScript 7 typecheck, module boundaries, CSS budget, Node smoke syntax,
  and `git diff --check`: passed.
- Production build: 1,688.02 kB JavaScript, 424.20 kB gzip; the existing
  large-chunk advisory remains visible.
- Runtime traces: 581/581 artifacts passed (547 required, 34 optional, 0
  skipped).
- Browser smoke: passed with 0 page errors and 0 console issues; `6/6`
  provenance records, schema `mugen-web-sandbox/asset-provenance/v0`,
  selected status `partial`, `0` absolute-path leaks, and `0` provenance-ready
  assets because output digests are intentionally deferred.

## Official References

- [MDN `SubtleCrypto.digest()`](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest)
- [MDN File API](https://developer.mozilla.org/en-US/docs/Web/API/File_API)
- [MDN `FileReader.readAsArrayBuffer()`](https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsArrayBuffer)
- [W3C IndexedDB 3.0](https://www.w3.org/TR/IndexedDB/)

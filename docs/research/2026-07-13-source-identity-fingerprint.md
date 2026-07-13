# Source Identity Fingerprint

Date: 2026-07-13

## Question

What is the smallest source identity contract that lets Studio distinguish an
unchanged relink from a changed or missing MUGEN package without claiming
filesystem persistence or automatic source writes?

## Sources

- [MDN: `SubtleCrypto.digest()`](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest)
- [MDN: File API](https://developer.mozilla.org/en-US/docs/Web/API/File_API)
- [MDN: `FileReader.readAsArrayBuffer()`](https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsArrayBuffer)

## Findings

- SHA-256 is available through Web Crypto in current browsers and returns a
  promise; the digest API accepts typed-array data but does not stream input.
- The existing Studio import path already bounds the source in a
  `VirtualFileSystem`, so identity can be calculated from sorted normalized
  paths plus bytes before the package becomes the active runtime source.
- File and FileReader APIs read user-selected data. They do not grant durable
  filesystem ownership, so a fingerprint must remain metadata and cannot be
  treated as a reacquirable file handle.
- A manifest needs both the expected fingerprint and the observed fingerprint
  when a relink differs; replacing the expected value is a later explicit
  reimport transaction, not a side effect of loading a package. A legacy
  manifest without an expected fingerprint can establish its first baseline
  only after the user explicitly relinks that package.

## Decision

Add optional SHA-256 identity metadata to each `GameProjectSourcePackage` and
compute a deterministic VFS fingerprint during ZIP/folder import. A relink
with matching required paths and fingerprint is `matched`; a relink with the
same paths but a different fingerprint is `changed` and remains unavailable
for clean export; a missing source is `missing`; legacy manifests without a
fingerprint stay `unknown` until an explicit relink establishes the new
baseline.

## Uncertainty

The digest currently materializes the bounded VFS input because Web Crypto
does not provide streaming `digest()`. Large-source memory policy remains the
responsibility of the existing ZIP limits and the future source transaction;
this slice does not add IndexedDB, OPFS, permission handles, writes, or
rollback.

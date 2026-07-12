# MUGEN-lite ZIP Transport Research

Date: 2026-07-12
Scope: deterministic legal package transport

## Sources

- JSZip `generateAsync` officially supports `arraybuffer`, DEFLATE, compression levels, and DOS/UNIX platform metadata: https://stuk.github.io/jszip/documentation/api_jszip/generate_async.html
- JSZip `loadAsync` accepts ArrayBuffer/File input, supports DEFLATE, sanitizes relative path components, and documents unsupported password-protected and multivolume archives: https://stuk.github.io/jszip/documentation/api_jszip/load_async.html

## Decision

Generate archive bytes from the canonical VFS in sorted path order. Pin every ZIP entry to the DOS epoch and request DOS platform metadata so repeated generation is byte-identical. Pass the resulting `File` through the existing `ZipCharacterSource`; do not bypass extraction in the required journey.

## Proof boundary

Required proof: valid ZIP signature, repeated byte identity, exact extracted-file parity, loader success, and checksum-stable runtime journey.

Blocked: corrupt/hostile archive rejection policy beyond JSZip, password/multivolume support, broad third-party archive layouts, and content/runtime parity beyond Entry 457.

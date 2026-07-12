# ZIP Ingestion Policy Research

Date: 2026-07-12
Scope: local untrusted MUGEN/IKEMEN package upload

## Sources

- JSZip documents path sanitization, `unsafeOriginalName`, malformed-archive rejection, and unsupported password/multivolume archives: https://stuk.github.io/jszip/documentation/api_jszip/load_async.html
- OWASP recommends defense in depth for uploads, filename validation, compressed and post-decompression size limits, and explicit ZIP-bomb consideration: https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html

## Decision

Keep extraction browser-local and introduce `ZipCharacterSourcePolicy/v0`. Reject compressed-size and entry-count excess before extraction. Use JSZip central-directory uncompressed sizes for an early per-entry/aggregate gate when available, then sequentially extract and recheck actual bytes. Reject any path JSZip changed during sanitization, absolute/drive/NUL paths, and case-insensitive duplicates before VFS insertion.

## Boundary

Allowed: bounded defense against covered malformed, traversal, collision, and resource-exhaustion cases.

Blocked: antivirus, arbitrary content validation, parser process isolation, perfect bomb prevention when trustworthy expanded-size metadata is unavailable, password/multivolume archives, and complete security certification.

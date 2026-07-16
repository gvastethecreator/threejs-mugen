# Asset path and permission hygiene closeout

Date: 2026-07-16
Scope: T28 / Wayfinder 229

## Task state

Completed at bounded diagnostic scope.

## Artifact verdict

Win against the T28 acceptance target. Public text reports have no detected
absolute, file-URI, or traversal path tokens. Nova has machine-readable
repository ownership/permission, verified CC0-1.0 metadata, and stable
source/output digests. Studio and exported ZIP consume the same facts.

## Verification state

Verified.

## Changes

- StudioAssetPermission/v0 parser with fail-closed path, ownership, license,
  and digest validation.
- Nova first-party LICENSE.txt and asset-permission.json.
- Studio metadata loading and ZIP inclusion for permission, license, and
  source files.
- Provenance fallback to declared first-party output digests before export;
  actual bundled records replace that expectation during export.
- Redaction coverage for traversal and drive-relative paths.
- Public report cleanup for Nova, Mira, and Rook.
- Standalone asset path/digest gate and stronger browser ZIP assertions.

## Evidence

Command: pnpm run qa:assets:hygiene

- passed
- 62 public text files scanned
- 13/13 declared Nova digests passed
- 0 path or metadata violations

Command: pnpm run qa:smoke

- passed in 312.5s
- 0 console issues
- 0 page errors
- Studio Assets: Nova complete and ready
- exported ZIP: Nova ready, CC0 declared
- 0 provenance path violations
- 0 provenance digest mismatches
- 0 package asset path violations
- 0 permission metadata digest mismatches

Additional gates:

- 10/10 focused provenance/permission tests
- TypeScript 7 typecheck passed
- node syntax checks passed
- git diff check passed

## Audit

The path gate is independent from browser provenance so raw public reports are
also inspected. The ZIP gate compares provenance output records against actual
package asset hashes and compares permission metadata against ZIP bytes.

No score moved. No legal approval, third-party/commercial authorization,
imported-MUGEN credit, IKEMEN execution, or full parity is claimed.

## Next highest-leverage move

Implement AssetReleasePolicy/v0 as a separate fail-closed contract over
permission/license freshness, ordered transforms, QA, collision, playtest,
input/output digests, and public bundle eligibility.

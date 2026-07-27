# DA29-101 architecture note

Wave 10 · revision 119e627410a4

## Decision surface

Version AssetProvenance with cryptographic content digests. Depends on DA29-008 and DA29-081.

## Acceptance

Schema covers inputs/outputs, SHA-256, canonical metadata, permission, license, creator/tool, timestamps, transforms, and subject revision; migration is explicit.

## Constraints

Weak digest may imply integrity. Allows provenance schema only.

## Status

Architecture/control design recorded for series closeout. Implementation remains
owned by later `[I]` / `[G]` cuts that list this ID as a dependency.

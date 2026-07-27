# DA29-008 architecture note

Wave 0 · revision 119e627410a4

## Decision surface

Define fingerprint and cryptographic digest vocabulary. Depends on DA29-001. Systems: evidence, Studio, assets, scanner, source manifests.

## Acceptance

ADR names SHA-256 content uses, stable behavior fingerprints, canonical bytes, version fields, and migration rules; misleading fields are inventoried.

## Constraints

Hash names may imply security. Allows terminology and migration design only.

## Status

Architecture/control design recorded for series closeout. Implementation remains
owned by later `[I]` / `[G]` cuts that list this ID as a dependency.

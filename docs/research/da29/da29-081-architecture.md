# DA29-081 architecture note

Wave 8

## Decision surface
Define lawful corpus authority and fixture independence. Depends on DA29-008 and DA29-015.

## Acceptance
Manifest records ownership/license, origin, independent syntax digests, mutations, expected profiles, forbidden public paths, and permitted evidence uses.

## Constraints
Duplicate fixtures inflate breadth. Allows corpus identity only.

## Anchors
- Authority materializer: scripts/materialize_authority_selector.cjs
- Authority doc: docs/AUTHORITY_SELECTOR.md
- Series registry: docs/evidence/da29/series-registry-v1.json

## Status
Architecture/control design only. Downstream [I]/[G] cuts own runtime proof.

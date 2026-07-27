# DA29-014 architecture note

Wave 1

## Decision surface
Make one controller-support registry feed compiler, docs, and materializers. Depends on DA29-013. Systems: compiler table, support registry, coverage JSON.

## Acceptance
One versioned registry records parse, compile, execute, trace, and product states; generated docs match it byte-for-byte.

## Constraints
A registry can overstate runtime depth. Allows registry consistency only.

## Anchors
- Authority materializer: scripts/materialize_authority_selector.cjs
- Authority doc: docs/AUTHORITY_SELECTOR.md
- Series registry: docs/evidence/da29/series-registry-v1.json

## Status
Architecture/control design only. Downstream [I]/[G] cuts own runtime proof.

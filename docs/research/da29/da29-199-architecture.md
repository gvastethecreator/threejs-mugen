# DA29-199 architecture note

Wave 19

## Decision surface
Define telemetry, crash evidence, and privacy policy. Depends on DA29-008, DA29-144, DA29-190, and DA29-198.

## Acceptance
Decision covers opt-in, data minimization, local logs, redaction, retention, user export/delete, crash envelope, performance sampling, consent, and production authority.

## Constraints
Diagnostics can expose project/user data. Allows policy only.

## Anchors
- Authority materializer: scripts/materialize_authority_selector.cjs
- Authority doc: docs/AUTHORITY_SELECTOR.md
- Series registry: docs/evidence/da29/series-registry-v1.json

## Status
Architecture/control design only. Downstream [I]/[G] cuts own runtime proof.

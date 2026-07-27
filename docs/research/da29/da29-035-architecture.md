# DA29-035 architecture note

Wave 3

## Decision surface
Version the canonical trigger capability registry. Depends on DA29-032 and DA29-033.

## Acceptance
Each trigger maps context, redirects, coercion, timing, evaluator owner, tests, traces, and unsupported branches.

## Constraints
Evaluator context may be incomplete. Allows capability mapping only.

## Anchors
- Authority materializer: scripts/materialize_authority_selector.cjs
- Authority doc: docs/AUTHORITY_SELECTOR.md
- Series registry: docs/evidence/da29/series-registry-v1.json

## Status
Architecture/control design only. Downstream [I]/[G] cuts own runtime proof.

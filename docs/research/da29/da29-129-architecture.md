# DA29-129 architecture note

Wave 12 · revision 119e627410a4

## Decision surface

Set actor, Helper, projectile, effect, trace, and evidence caps. Depends on DA29-060, DA29-122, and DA29-126.

## Acceptance

Limits have source/product rationale, deterministic refusal/degradation, visible diagnostics, telemetry, reset behavior, and adversarial tests.

## Constraints

Caps can alter compatibility. Allows explicit sandbox policy only.

## Status

Architecture/control design recorded for series closeout. Implementation remains
owned by later `[I]` / `[G]` cuts that list this ID as a dependency.

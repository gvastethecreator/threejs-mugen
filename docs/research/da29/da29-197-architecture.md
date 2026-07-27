# DA29-197 architecture note

Wave 19 · revision 119e627410a4

## Decision surface

Define semantic versioning, migration, and deprecation policy. Depends on DA29-181, DA29-192, and DA29-196.

## Acceptance

Policy separates project schema, evidence, source/profile, public API, plugin, asset, and runtime compatibility versions with support windows and migration gates.

## Constraints

One version cannot express all contracts. Allows policy only.

## Status

Architecture/control design recorded for series closeout. Implementation remains
owned by later `[I]` / `[G]` cuts that list this ID as a dependency.

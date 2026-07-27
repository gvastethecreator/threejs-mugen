# ADR 0062 — Match-state serialization (DA30-037)

Versioned schema owners: roots, helpers, projectiles, effects, inputs, clocks, RNG, targets, team, round. Float policy: fixed decimal or integer micros. Unknown version: fail closed. Migration: explicit upcasters. SHA-256 over canonical bytes.

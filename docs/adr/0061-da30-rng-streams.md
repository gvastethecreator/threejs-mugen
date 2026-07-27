# ADR 0061 — Deterministic RNG streams (DA30-035)

Separate streams: gameplay, AI, visual, audio, asset. Seed derivation from match seed + stream id. Snapshot/restores each stream. Cross-use forbidden. Planned tests: same seed identical gameplay stream bytes; visual stream mutation must not alter gameplay.

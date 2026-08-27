# Satirical FightFX

Original atlas VFX for content-pack hits and combat reads.

- `source/satirical-fightfx-imagegen-atlas.png`: accepted Imagegen output, 4×2.
- `runtime/sprite-sheet-alpha.png`: 8×1 alpha atlas for the runtime.
- `runtime/manifest.json`: `asset_kind=vfx`, contact pivot, `screen` blend, and phases.
- `runtime/*-report.json`: provenance, slot, alignment, and animation QA.

Slots: `electric-comment`, `receipt-snap`, `scooter-dust`, `cardboard-impact`, `wifi-fold`, `coupon-slash`, `guard-spark`, `comic-ko`.

Runtime mapping: groups `7300-7307` are registered by `App` with the `vfx` row mapping. Content-pack punch/kick contacts emit `F7300`/`F7301`, guard emits `F7306`, and the renderer keeps its geometry fallback if the atlas request is missing. Special-effect rows stay available for the next bounded trigger cut.

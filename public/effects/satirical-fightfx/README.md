# Satirical FightFX

Atlas VFX original para impactos y lecturas de combate del content pack.

- `source/satirical-fightfx-imagegen-atlas.png`: salida Imagegen aceptada, 4×2.
- `runtime/sprite-sheet-alpha.png`: atlas 8×1 con alpha para el runtime.
- `runtime/manifest.json`: contrato `asset_kind=vfx`, pivote de contacto, blend `screen` y fases.
- `runtime/*-report.json`: provenance/slot/alignment/animation QA.

Slots: `electric-comment`, `receipt-snap`, `scooter-dust`, `cardboard-impact`, `wifi-fold`, `coupon-slash`, `guard-spark`, `comic-ko`.

Runtime mapping: groups `7300-7307` are registered by `App` with the `vfx`
row mapping. Content-pack punch/kick contacts emit `F7300`/`F7301`, guard emits
`F7306`, and the renderer keeps its geometry fallback if the atlas request is
unavailable. Special-effect rows remain available for the next bounded trigger
cut.

La ejecución real de Grok Imagine quedó en dry-run porque el CLI local no estaba autenticado; este atlas usa la salida aceptada de Imagegen y mantiene provenance verificable.

# Patio Dojo Publicidad

Parallax v2 pack regenerated for the MUGEN/Ikemen port. Camera contract: 1672×941, 16:9, with a central safe zone for fighters. Direction: severe combat pixel art, Baki-like anatomy, charcoal/rust/bone palette, no neon.

- `source/*imagegen.png`: stable aliases for v2 layers derived from one Imagegen master scene.
- `source/*-v2.png`: v2 sources and layers. `source-provenance.json` records the master and deterministic transforms.
- `source/*near-alpha.png`: near plane with a vertical alpha mask. No painted replacements.
- `background-pack.json`: order, depth, hashes, and parallax factors.
- `qa/background-composite.png`: composition proof.
- `qa/background-scroll.gif`: per-layer scroll proof.

Validation: `validate_background_pack.py` passes with `representative=true` and `imagegen` provenance.

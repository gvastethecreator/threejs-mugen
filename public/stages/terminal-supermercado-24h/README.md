# Terminal Supermercado 24h

Parallax v2 pack regenerated for the MUGEN/Ikemen port. Camera contract: 1672×941, 16:9, with a clear central fight area. Palette: charcoal, slate blue, olive, and muted amber, combat-manga contrast, no saturated lights.

- `source/terminal-supermercado-24h-base-imagegen.png`: stable far-plane v2 alias.
- `source/terminal-supermercado-24h-mid-imagegen-v2.png`: mid plane derived from the Imagegen master.
- `source/terminal-supermercado-24h-near-alpha.png`: foreground with a vertical alpha mask. No painted replacements.
- `background-pack.json`: order, depth, hashes, and parallax factors.
- `qa/background-composite.png`: composition proof.
- `qa/background-scroll.gif`: per-layer scroll proof.

Validation: `validate_background_pack.py` passes with `representative=true` and `imagegen` provenance.

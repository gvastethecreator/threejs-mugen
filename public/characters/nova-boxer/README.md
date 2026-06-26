# Nova Boxer Runtime Atlas

Original local/private test character for `mugen-web-sandbox`.

- Visual source: built-in `imagegen` sprite sheet copied to `source/nova-boxer-imagegen-sheet.png`.
- Normalized runtime atlas: `sprite-sheet-alpha.png` + `manifest.json.frame_layout`.
- `walk-forward` is an 8-frame, slow-cadence grounded walk generated as new sprite art, not a mechanical repair of older frames.
- QA outputs live in `qa/`; the current motion heuristic can warn on low body-center drift for deliberate short-step walks, so visual contact-sheet/browser review remains part of acceptance.
- MUGEN-lite template files live in `mugen/` and are based structurally on the official KFM-style DEF/AIR/CMD/CNS contract, without copying KFM art.
- This folder intentionally does not include commercial or third-party character assets.

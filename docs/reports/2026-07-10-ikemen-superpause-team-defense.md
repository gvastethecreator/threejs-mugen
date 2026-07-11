# IKEMEN SuperPause team-defense checkpoint

## Outcome

Explicit `ikemen-go` now resolves omitted/non-positive `p2defmul` through the game-level `1.5` default and projects a separate temporary `2/3` incoming-damage multiplier to the represented opposing root plus existing helpers, without overwriting `Data.Defence` or `DefenceMulSet`.

## Evidence

- `synthetic-imported-ikemen-superpause-team-defense.json`: checksum `76873f0d`, final `b4425c66`.
- Trace result: P2 and `p2-helper-0` expose temporary multiplier `0.6667`; final P2 life is `950`.
- `pnpm qa:trace`: 538/538, 507 required and 31 optional.
- `pnpm test`: 162 files / 1597 tests. TypeScript 7.0.2 typecheck/build and boundaries passed; build retains the known Vite large-chunk warning.

## Global areas

| Area | Status this checkpoint |
| --- | --- |
| Playable runtime | Advanced: source-backed IKEMEN SuperPause defense breadth for current 1v1 root/helper topology. |
| IKEMEN compatibility | Advanced: omitted/zero fallback, configurable game-level value, session-safe stacking/restoration. |
| Studio editor | Unchanged. |
| Three.js renderer | Unchanged; no visual surface changed. |
| Assets/scanner/modular engine | Unchanged. |
| Overall score | Unchanged; this closes a bounded parity gate, not a horizon exit. |

## Quality verdict

Artifact: better. Verification: verified for bounded explicit-IKEMEN 1v1 roots and existing helpers. Independent review found and closed base-defense interference by separating temporary SuperPause state.

## Blocked

Simul/tag team topology, global `config.json` loading, helper-as-defender combat proof, nested helper ancestry, exact hitpause/buffer timing, rollback, and full IKEMEN parity.

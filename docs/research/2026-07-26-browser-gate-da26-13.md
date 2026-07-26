# DA26-13 browser gate (bounded closeout)

Date: 2026-07-26  
Type: browser product proof  
Status: closed-bounded

## What ran

Script: `scripts/qa_browser_gate_da26_13.cjs`  
Base: Vite dev server `http://127.0.0.1:5173/`  
Evidence: `docs/evidence/da26-13-browser/`

| Viewport | Size | Runtime visible | Console errors | Overflow-X | Contact log | Skip link |
| --- | --- | --- | --- | --- | --- | --- |
| desktop | 1440×960 | yes | 0 | no | yes | yes |
| tablet | 820×1180 | yes | 0 | no | yes | yes |
| mobile | 390×844 | yes | 0 | no | yes | yes |

Reduced-motion context was enabled for every capture. Screenshots include SHA-256 in
`browser-gate-report-v1.json`.

## Claim allowed

- Runtime shell loads on desktop/tablet/mobile without page/console errors
- Contact appears in console region logs during live match
- Skip-to-runtime focus link present
- No horizontal overflow at the three measured viewports

## Claim blocked

- Full `pnpm qa:smoke` attack/canvas checksum matrix
- Audible Common.Fx proof
- Score movement
- Replacing formal/global pin or T342 visual pin without a new global gate

## Next

DA26-16 Turns journey browser (depends on Turns product path + DA26-15 unit tx).

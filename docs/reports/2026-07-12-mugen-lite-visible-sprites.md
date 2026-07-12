# MUGEN-lite Visible Sprite Report

Date: 2026-07-12
Roadmap entry: 460

## Delivered

- Twelve generated 32x64 indexed PCX sprites inside SFF v1.
- Stable `16,62` sprite axes.
- Distinct idle/crouch/air/attack/guard/get-hit/fall/recovery silhouettes.
- Loader assertions for sprite count, dimensions, axes, twelve unique indexed payloads, grounded contact, airborne separation, and baseline bounds.

## Verification

- Focused fixture tests: 3/3 passed.
- Full regression: 183 files / 1935 tests passed.
- TypeScript 7 typecheck and production build: passed.
- Architecture boundaries and diff hygiene: passed.
- Runtime trace QA: 565/565 passed; 534 required, 31 optional; MUGEN-lite checksum `8b19b865` unchanged.
- Independent review found duplicate silhouette geometry and incorrect foot alignment. Both P2 findings were fixed; re-review found no remaining P1/P2.

## Claim boundary

The legal fixture now owns visible decoded frames appropriate for Three.js handoff. Browser render proof, production art, multi-frame animation, palette breadth, and visual parity remain blocked.

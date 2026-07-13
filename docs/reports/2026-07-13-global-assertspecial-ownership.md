# Global AssertSpecial Ownership Report

Date: 2026-07-13
Status: closed at bounded pair-round scope

## Outcome

`RuntimeGlobalAssertSpecialWorld/v0` is now the single read-model boundary for
recognized global `AssertSpecial` flags after per-actor frame reset and
imported controller execution. It emits canonical active flags, deterministic
actor sources, unknown-name diagnostics, and typed `NoKOSlow`, `NoKOSnd`,
`TimerFreeze`, and `RoundNotOver` projections.

`RuntimeMatchRoundWorld` consumes that snapshot for current timer, KO slowdown,
KO sound suppression, and round-finish blocking. Existing trace payloads and
checksums remain unchanged because the read model is not added to
`MugenSnapshot` in this cut.

## Changed Surface

- `src/mugen/runtime/RuntimeGlobalAssertSpecialSystem.ts`
- `src/mugen/runtime/RuntimeMatchRoundSystem.ts`
- `src/mugen/runtime/PlayableMatchRuntime.ts`
- `src/tests/RuntimeGlobalAssertSpecialSystem.test.ts`
- `docs/adr/0003-runtime-global-assertspecial-ownership.md`
- `docs/research/2026-07-13-global-assertspecial-ownership.md`
- `.scratch/wayfinder/mugen-ikemen-threejs-port/tickets/134-map-global-assertspecial-ownership.md`

## Evidence

Focused contract: 3 files / 19 tests passed, including canonical ordering,
source attribution, unknown-flag fail-closed behavior, per-tick recomputation,
and existing round timer/KO regression coverage.

Batch gates:

- `pnpm test`: 194 files / 2003 tests passed.
- `pnpm typecheck`: passed with TypeScript 7.
- `pnpm build`: passed; JS `1,705.57 kB` / `428.94 kB gzip`, with the existing
  Vite large-chunk advisory.
- `pnpm qa:trace`: 581/581 artifacts passed, 547 required and 34 optional.
- `pnpm check:boundaries`: passed.
- `git diff --check`: passed; existing dirty-doc CRLF warnings only.

Visual smoke: N/A. No UI, renderer, CSS, or visible gameplay surface changed.

## Claim Boundary

Allowed: bounded pair-round global `AssertSpecial` ownership and diagnostics.

Blocked: exact team/multi-root precedence, team KO/replacement, lifebars and
resources, Helper/Projectile global ownership, post-KO echo timing, IKEMEN
`roundFreeze`, ZSS/Lua, rollback/netplay, score promotion, and full
MUGEN/IKEMEN parity.

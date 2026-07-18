# ADR 0015: Character State Source Precedence

- Status: Accepted bounded loader contract
- Date: 2026-07-18
- Last reviewed: 2026-07-18 at HEAD `e47d4f76`
- Scope: imported character DEF/CNS/ST source loading
- Implementation: [`e47d4f76`](https://github.com/gvastethecreator/threejs-mugen/commit/e47d4f76)
- Closeout: [`docs/reports/2026-07-18-character-state-source-precedence-closeout.md`](../reports/2026-07-18-character-state-source-precedence-closeout.md)
- Research: [`docs/research/2026-07-18-character-state-source-precedence.md`](../research/2026-07-18-character-state-source-precedence.md)

## Context

The official M.U.G.E.N file model gives `cns` the constants role, `st*` the
character-state role, and `stcommon` the common-state fallback role. The
repository's loader currently adds `cns` to the state-source list regardless of
whether the DEF lists the same file as `st*`, and it leaves numbered `st*`
entries in textual DEF order.

## Decision

1. Parse `cns` for constants and diagnostics.
2. Parse state code only from explicitly declared `st`, `st0` through `st9`,
   plus declared `stcommon` files.
3. Normalize character state-file order to `st`, `st0`, `st1`, ..., `st9`.
4. Resolve character identities before common identities; the first selected
   identity wins and later duplicates are retained only as shadowed evidence.
5. Keep CMD State -1 and its command definitions in the existing separate
   command-state path.

The contract does not append duplicate controllers or claim exact engine merge
semantics.

## Consequences

Positive:

- constants-only CNS files no longer leak state code into the runtime;
- shared `cns`/`st` paths remain supported;
- character/common fallback ownership is deterministic and source-visible;
- DEF line reordering cannot change which character file wins a duplicate.

Negative:

- packages that relied on undeclared state sections inside `cns` are surfaced
  as missing state data instead of being silently accepted;
- duplicate-state append behavior, Common1 merge details, CMD state-source
  interaction, ZSS/Lua, and full parity remain open.

## Evidence

- Implementation: `e47d4f76`.
- Focal loader/parser/compiler/package suite: `49/49` passed.
- `pnpm build` passed with TypeScript 7; the existing large JavaScript chunk
  warning remains.
- `pnpm check:boundaries` passed.
- `pnpm check:redirect-boundary` passed.
- `git diff --check` passed.

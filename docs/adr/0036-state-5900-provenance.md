# ADR 0036: State 5900 Provenance

## Status

Accepted for bounded runtime evidence. 2026-07-18.

## Context

The official IKEMEN round reset enters participating characters through state
5900. The runtime already preflights availability, but an availability boolean
cannot distinguish a character override from Common1 fallback, show shadowed
source files, or explain a source-less parsed/synthetic state.

The loader already resolves state sources with character-before-common
precedence and records an `fnv1a32` text fingerprint. That value is not a
cryptographic file digest and must keep its existing name.

## Decision

Keep the outer `RuntimeRoundState5900/v0` snapshot stable. Add an optional
nested `RuntimeRoundState5900Provenance/v1` block when an actor supplies source
selections. It records:

- selected source layer (`character` or `common`), path, and existing FNV
  fingerprint;
- precedence reason (`character-override`, `common-fallback`, or the other
  resolver outcomes);
- shadowed and appended source refs;
- `unknown` when state 5900 exists without a matching selection;
- `unavailable` when the actor has source metadata but no state 5900.

Actors without source-selection metadata retain the historical actor snapshot
shape. Imported fighter definitions carry `MugenCharacter.stateSources`, and
the normal-round plus Turns callers pass that metadata to the shared world.

## Consequences

Round evidence can now answer which bounded source supplied state 5900 without
claiming that the source's controllers execute with upstream timing. Missing
source metadata is visible rather than inferred. No state-entry behavior,
score, or compatibility band changes.

## Evidence

- Implementation: `src/mugen/runtime/RuntimeRoundState5900System.ts`,
  `src/mugen/runtime/importedFighter.ts`,
  `src/mugen/runtime/PlayableMatchRuntime.ts`.
- Focused tests: `src/tests/RuntimeRoundState5900System.test.ts`,
  `src/tests/importedFighter.test.ts`, `src/tests/PlayableMatchRuntime.test.ts`.
- Commit: `f2c4b2a0`.

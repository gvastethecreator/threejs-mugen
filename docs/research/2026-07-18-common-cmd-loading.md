# Common.Cmd loading research

## Question

How should the Three.js loader expose IKEMEN's configured common command file
before command buffers and helper-local command ownership consume it?

## Primary source evidence

- The official [IKEMEN GO global states and common files reference](https://github.com/ikemen-engine/Ikemen-GO/wiki/Miscellaneous-info#global-states)
  identifies `CommonCmd` as a common command source appended to a character's
  CMD, rather than as an isolated runtime command bank.
- The pinned IKEMEN source at `.scratch/external/Ikemen-GO` commit
  `044da72008b8ba13caf7b0f820526ce16e955fb3` reads the character command text
  and then appends each configured `sys.cfg.Common.Cmd` entry in
  `src/compiler.go:8168-8179`. The source uses sorted config keys and loader
  roots containing the character DEF, motif/fight-screen context, the virtual
  root, and `data/`.
- The pinned default configuration at
  `.scratch/external/Ikemen-GO/src/resources/defaultConfig.ini:6-18` declares
  array-like `[Common]` keys, including `Cmd = data/common.cmd`, and documents
  numeric suffixes such as `States0` and `States2`.

## Repository gap

`MugenCharacterLoader` currently parses only `files.cmd`. `MugenGameConfig`
already preserves case-insensitive raw sections, and the loader already has a
root/config-relative resolver for `Common.States`, but no equivalent command
source merge exists. The newly completed helper-local `CommandBuffer` path
therefore receives only character commands.

## Decision for this slice

Resolve `Cmd`/`Cmd<number>` in natural order, filter the bounded supported
format to CNS-compatible `.cmd` files, concatenate character and common command
text, and parse once. A single parser pass preserves command order and the
repository's existing defaults/remap/buffer metadata semantics. CommonCmd is
not parsed as CNS state-entry data in this slice; character CMD remains the
only source for State -1 extraction.

## Risks and non-claims

- This does not reproduce every upstream `LoadFile` search context; it preserves
  the repository's tested virtual root and config-relative behavior.
- Common command diagnostics currently use the merged parser boundary; source
  path warnings remain explicit for missing and unsupported CommonCmd entries.
- Common constants, animations, effects, ZSS/Lua, AI input, SOCD, rollback, and
  full parity remain unimplemented.

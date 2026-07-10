# Common1 state source precedence

Date: 2026-07-10

## Question

When both character state data and `stcommon` define state 120, which source must the runtime compile, and what must happen when the character omits it?

## Answer

Elecbyte defines character state data as the override tier: when a character defines the same state number as a common state, the character state is entered. `stcommon` supplies the fallback when that character-owned state is absent. State 120 is the common guard-start state, so source selection can be proven independently from guard-phase timing.

## Primary sources

- Elecbyte CNS documentation: <https://elecbyte.com/mugendocs/cns.html>
- Elecbyte character creation tutorial: <https://www.elecbyte.com/mugendocs/tutorial1.html>
- IKEMEN GO repository and compatibility scope: <https://github.com/ikemen-engine/Ikemen-GO>

## Implementation decision

- Resolve all character CNS/state files before common files, independent of caller input order.
- Compile one selected state per state number.
- Record selected and shadowed source kind, normalized path, and deterministic decoded-source FNV-1a fingerprint.
- Attach the selected source to state controllers so runtime trace artifacts can prove which file executed.
- Preserve the existing state 120 `Time >= 1` transition in both synthetic probes; source precedence does not authorize guard timing changes.

## Uncertainty and blocked claims

- Same-tier duplicate behavior across multiple character state files is preserved as first-listed and is not claimed as exact MUGEN/IKEMEN parity.
- Constant precedence is unchanged and remains outside this slice.
- This does not prove complete Common1 coverage, automatic guard-phase ordering, ZSS execution, or full IKEMEN compatibility.

## Next decision

Research the official and implementation-backed ordering of automatic guard-start evaluation relative to state controllers, hitpause, pause, and contact resolution before changing guard timing.

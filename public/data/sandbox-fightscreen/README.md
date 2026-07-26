# Sandbox FightScreen

Repository-authored CC0 FightScreen system package for loader/runtime evidence.

Surfaces covered in `fight.def` timing and display tables:

- round / fight call
- KO / Double KO / Draw / Time Over
- win-type text (normal/perfect/clutch samples)
- intro skip shutter
- fade-in / fade-out
- over/reset timing windows
- fallback default round display

Binary assets (`fightfx.sff`, `fightfx.snd`, font SFF) are generated
deterministically in code. This package does not claim Elecbyte screenpack
visual parity.

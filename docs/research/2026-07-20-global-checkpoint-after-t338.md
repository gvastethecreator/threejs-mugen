# Global checkpoint after T338

Date: 2026-07-20
Head before checkpoint: `ec2819f5`
Status: green for the implemented runtime slices

## Evidence

- Full Vitest: 238 files / 2583 tests passed.
- `pnpm build`: passed with TypeScript 7 and 325 transformed modules.
- `pnpm qa:trace`: 633/633 artifacts passed, including 599 required and 34
  optional artifacts.
- `git diff --cached --check` passed for the target-resource closeout.
- No renderer or UI files changed in T335-T338; browser smoke and `qa:smoke`
  remain deferred for this runtime-only checkpoint.

## Known advisories

- jsdom reports the existing `HTMLCanvasElement.getContext()` limitation.
- Vite reports the existing post-minification chunk above 500 kB.

## Scope

The checkpoint covers TargetLifeAdd resource flags and target red-life,
guard-point, and dizzy-point guards. It does not raise the compatibility score
or the full-port claim. WinType attribution for non-life target resources,
nested Helper ancestry, reversal, exact target ordering, direct screenpack
proof, and complete MUGEN/IKEMEN parity remain open.

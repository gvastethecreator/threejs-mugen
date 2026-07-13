# Select Independent Legal Breadth

Type: research
Status: resolved
Blocked by: None

## Question

Which new legal input should follow the accepted fixture-backed MUGEN-lite
milestone: an independently sourced character package, or an ACT/palette route
on the existing repository-owned package?

## Inputs

- `docs/reports/2026-07-13-mugen-lite-milestone-adjudication.md`
- `docs/reports/2026-07-13-compatibility-journey-v1.md`
- `.scratch/fixtures/external-fixtures.json`
- `.scratch/external/CodeFuMan-master/`
- Existing ACT/palette loader and browser evidence paths.

## Acceptance

- Choose one input with a verifiable source/license or permission record.
- Record a stable digest and exact file set without committing third-party
  assets into the repository.
- Define a required loader, runtime, and report or browser gate that cannot
  pass by copying the current MUGEN-lite journey checksum.
- Keep exact Common1 parity, broad corpus claims, teams, screenpacks, and full
  MUGEN/IKEMEN parity outside the claim ceiling.

## Preferred Order

1. Prefer a second independent legal character package if the local fixture
   inventory provides enough source and permission metadata.
2. Otherwise implement an ACT/palette route on the CC0 fixture with visible
   desktop/mobile evidence and a typed compatibility report reference.

## Claim Ceiling

Allowed: one new independent compatibility input and its bounded evidence.

Blocked: broad corpus compatibility, commercial asset compatibility, exact
renderer/palette parity, or score movement without the written scorecard gate.

## Outcome

- Selected the repository-owned ACT/palette route because the local independent-package inventory did not provide a stronger permission-backed candidate for immediate runtime/browser proof.
- Added `journey-source.act` and `journey-palette.act` to `MugenLiteJourneyFixture/v1`, wired DEF `pal1`/`pal2`, and executed imported `RemapPal 1,1 -> 1,2` from state `220`.
- Required runtime artifact `mugen-lite-journey-palette` passes with checksum `1291909d` / final `380400cf`; the package digest is `sha256:b8e917e9b968f86765db017388823e897779d46041b3738a47c702ce57adfc50`.
- `CompatibilityJourney/v1` was refreshed to checksum `11da5411`; the route has a dedicated desktop/mobile browser smoke capture with per-color destination coverage within renderer color-management tolerance.
- Report: `docs/reports/2026-07-13-legal-act-palette-route.md`.

## Closure Audit

- The destination palette is a distinct ACT file and a distinct DEF palette slot, so a no-op source/destination mapping is not sufficient to pass.
- The required trace and browser gates are independent: runtime state/controller telemetry must pass, and browser pixels must expose the destination ACT colors.
- No score movement was made. The evidence supports one legal palette route only; broad palette semantics, third-party breadth, exact Common1 timing, and full MUGEN/IKEMEN parity remain blocked.
- Next: Wayfinder 131 maps a second independent legal character package.

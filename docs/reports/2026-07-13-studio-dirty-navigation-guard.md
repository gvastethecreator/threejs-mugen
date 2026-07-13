# Studio Dirty-Navigation Guard Report

Date: 2026-07-13
Status: closed at current project/source boundary scope

## Question

Can Studio prevent accidental loss of unsaved identity edits when the user
leaves the page, opens another project, or replaces the imported source?

## Implementation

- `StudioProjectNavigationGuard.ts` defines the tested rule: only a dirty
  Studio surface requires confirmation.
- `App.ts` installs a `beforeunload` guard and asks for confirmation before
  opening another project or loading a replacement ZIP/folder source.
- Clean projects and Runtime/Inspector surfaces stay non-blocking.
- Dismissing a confirmation leaves the current project, dirty marker, and
  selected scene untouched.

## Evidence

### Focused model tests

`src/tests/StudioProjectNavigationGuard.test.ts`: `2/2` passed. Coverage
includes dirty Studio gating, clean/non-Studio bypasses, and destination-aware
prompt content.

### Browser smoke

`pnpm qa:smoke` passed. The Studio Workbench synthetic `beforeunload` event was
prevented while dirty. A real project-open confirmation was emitted and
dismissed; the project stayed dirty and the authored `training-grid` stage
remained selected. The clean save/reopen path remained unblocked.

### Batch closure

- `pnpm test`: `187` files and `1969` tests passed.
- `pnpm typecheck`: passed through the production build.
- `pnpm check:boundaries`: passed.
- `pnpm build`: passed with the existing `1,668.07 kB` JavaScript chunk
  advisory.
- `pnpm qa:trace`: `581/581` artifacts passed (`547` required, `34` optional).

## Claim ceiling

Allowed: protection against dirty page exit and project/source replacement at
the current Studio identity-authoring boundary.

Blocked: autosave, conflict resolution, migrations, filesystem/source writes,
transaction rollback, deeper editor undo semantics, and full MUGEN/IKEMEN
parity.

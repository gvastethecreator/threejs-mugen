# Studio Desktop Route Visibility Closeout

Date: 2026-07-18
Ticket: Wayfinder 283
Implementation commit: `bf49f178`

## Result

The redesigned desktop Workbench no longer strands local projects or Debug in
the hidden legacy navigator. Recent Projects and Runtime Debug are now visible
in the right inspector. The smoke harness opens collapsed project disclosures,
selects visible tab buttons, retries bridge transitions, and enters Debug from
the visible Workbench route.

## Evidence

- `pnpm typecheck`: passed with TypeScript 7.0.2.
- `node --check scripts/qa_smoke.cjs`: passed.
- `git diff --check`: passed.
- Real Vite browser smoke: `status=passed`, 64 capture paths, 0 console issues,
  0 page errors.
- Visual audit: Workbench, storage conflict, desktop Debug, and mobile Debug
  captures show no text overlap or clipped action labels.

## Claim Ceiling

Allowed: desktop Workbench route reachability, stored-project reopen, Debug
surface reachability, and smoke-harness evidence.

Blocked: new editor semantics, durable filesystem handles, source editing,
rollback/netplay, compatibility-score movement, and full parity.

# Studio Desktop Route Visibility and Smoke Resilience

Type: implementation
Status: resolved
Blocked by: None

## Goal

Keep the primary desktop Studio Workbench actionable after the redesigned
layout hides the legacy navigator. Local saved projects and Runtime Debug must
remain reachable through visible controls, while browser QA must interact with
the same visible routes a user sees.

## Acceptance

- Show recent local projects in the desktop Workbench inspector.
- Expose Runtime Debug from the desktop Workbench inspector.
- Open stored-project rows after expanding their disclosure container.
- Make smoke tab navigation resilient to rerenders and hidden legacy nodes.
- Preserve storage-conflict behavior and existing responsive surfaces.

## Outcome

- Commit: `bf49f178`.
- Workbench exposes Recent Projects and Runtime Debug in the right inspector.
- Smoke navigation uses visible buttons, retries stable bridge transitions, and
  normalizes through Workbench before Debug.
- Browser smoke passes with 64 capture paths, 0 console issues, and 0 page
  errors.

## Claim Ceiling

Allowed: desktop route reachability, stored-project reopen QA, and visible
Studio navigation evidence.

Blocked: broader Studio editing, persistent filesystem ownership, source
editing/reimport, external-engine parity, and full MUGEN/IKEMEN parity.

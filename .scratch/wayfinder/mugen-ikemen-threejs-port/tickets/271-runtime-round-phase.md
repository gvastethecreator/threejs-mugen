# Ticket 271: RuntimeRoundPhase/v0

- Status: resolved
- Date: 2026-07-18
- Scope: replace constant RoundState reads with a typed profile-owned phase
  boundary
- Depends on: [T270](270-state-5900-provenance.md)
- Research: [`docs/research/2026-07-18-runtime-round-phase.md`](../../../../docs/research/2026-07-18-runtime-round-phase.md)

## Question

How can the runtime expose the official RoundState values `0..4` through legal
events without conflating round outcome, state 5900, win poses, or MatchOver?

## Bounded contract

1. Add `RuntimeRoundPhase/v0` with typed values 0 pre-intro, 1 intro, 2 fight,
   3 pre-over, and 4 over.
2. Define legal transitions as named events; reject impossible transitions
   instead of accepting arbitrary integers.
3. Keep the existing runtime startup at fight (`2`) for behavior compatibility;
   prove 0 -> 1 -> 2 with the phase world's explicit transition table.
4. Derive round snapshot phase 3 at KO/time-over finish and phase 4 after the
   bounded post-round window. Reset/next-round returns to phase 2.
5. Make `RoundState` read the actor's phase, with legacy fallback `2` when no
   phase metadata exists.

## Acceptance evidence

- Phase-world tests cover legal 0 -> 1 -> 2 -> 3 -> 4 transitions, reset, and
  invalid transition rejection.
- Runtime round tests cover fight -> pre-over -> over and reset.
- Expression tests prove `RoundState` reads phase rather than a constant.
- Playable snapshot tests prove actor/round phase synchronization on KO and
  over. Browser smoke is N/A unless a visible consumer changes.
- Implementation commit: `89403690`.
- Focused verification passes `5` files / `295` tests and `pnpm typecheck`.
- `git diff --check` passes for the implementation surface.
- Checkpoint passes `232` files / `2446` tests, build, TypeScript 7,
  boundaries, redirect boundary, and `633/633` runtime traces (`599` required,
  `34` optional).
- The intentional `mugen-lite-journey-nokoslow` trace golden moved from
  `ceac9f37` to `a1ce409c` because the phase metadata is now part of the
  post-KO evidence; all other journey goldens remain unchanged.

## Claim ceiling

Allowed: typed bounded phase values, legal transitions, and dynamic RoundState
for the current runtime lifecycle. Blocked: exact intro/motif timing, winpose
execution, MatchOver timing parity, Common1/ZSS phase behavior, Turns
atomicity, rollback/netplay, and full MUGEN/IKEMEN round parity.

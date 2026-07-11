# Integrate IKEMEN root character identity

Type: implementation
Status: resolved
Blocked by: None

## Question

How should P1-P8 consume the numeric identity registry and expose source-backed `ID`/`PlayerNo` expressions without changing current scheduling or Tag mutation?

## Acceptance

- Give each live root an explicit one-based PlayerNo and registry-owned numeric PlayerID without replacing its stable string actor id.
- Build the registry after all present roots exist, preserve official odd-then-even assignment, and keep identities stable across reset.
- Expose a detached identity diagnostic in snapshots or an equivalent public runtime read path.
- Add caller/redirect-aware `ID` and `PlayerNo` expression values from explicit context fields; do not parse them implicitly inside the evaluator.
- Prove P1-P4 assignment, caller expressions, redirected expressions, disabled/standby diagnostic projection, reset stability, and unchanged legacy profile behavior.
- Keep Helper registration, PlayerID redirects, Tag RedirectID mutation, and gameplay consumers unsupported.

## Answer

Explicit `ikemen-go` matches now assign one-based PlayerNo to each present root before creating one shared `RuntimeCharacterIdentityRegistry`. The registry allocates PlayerID in present odd-then-even PlayerNo order, while `FighterMatchState.id` remains the stable sandbox actor id. `PlayableMatchRuntime.getCharacterIdentity()` returns detached, deeply frozen `RuntimeCharacterIdentity/v0` diagnostics with live disabled/standby eligibility.

`ID` and `PlayerNo` are executable expression identifiers backed only by explicit context values. Active and raw-controller contexts carry caller, opponent, parent, root, EnemyNear, and Target identity without parsing actor ids. P1-P4 coverage proves allocation, caller/redirect evaluation, standby diagnostics, reset stability, and the absence of this profile-owned registry under `mugen-1.1`. Helper registration and RedirectID execution remain separate work.

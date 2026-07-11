# Integrate IKEMEN root character identity

Type: implementation
Status: claimed
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

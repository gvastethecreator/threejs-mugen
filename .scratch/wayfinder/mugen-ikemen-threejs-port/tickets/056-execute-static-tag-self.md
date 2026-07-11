# Execute static Tag self flag

Type: implementation
Status: resolved
Blocked by: None

## Question

How should static `self` combine with optional static partner so caller and partner mutations remain atomic and match IKEMEN defaults?

## Acceptance

- Static self 0/1 compiles with or without static partner.
- Omitted self defaults according to official Tag rules.
- Self plus partner changes validate before either mutation.
- Dynamic/invalid self and every other optional parameter fail closed.
- Same-tick selection and gameplay isolation remain intact.

## Answer

Static `self` accepts only exact `0` or `1`. Omitted `self` defaults true only when `partner` is also omitted; partner-only forms default false. Runtime resolves every requested target before applying one deduplicated standby batch, so missing partners leave caller and team unchanged. `self = 0` without partner is a successful no-op. Dynamic/invalid self and every unimplemented optional parameter fail closed.

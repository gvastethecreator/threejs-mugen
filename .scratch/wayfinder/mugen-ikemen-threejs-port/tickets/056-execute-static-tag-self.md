# Execute static Tag self flag

Type: implementation
Status: open
Blocked by: None

## Question

How should static `self` combine with optional static partner so caller and partner mutations remain atomic and match IKEMEN defaults?

## Acceptance

- Static self 0/1 compiles with or without static partner.
- Omitted self defaults according to official Tag rules.
- Self plus partner changes validate before either mutation.
- Dynamic/invalid self and every other optional parameter fail closed.
- Same-tick selection and gameplay isolation remain intact.

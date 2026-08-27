# Security

This project loads local ZIP and folder packages in the browser. Treat imported files as untrusted data.

## Report a vulnerability

Email or GitHub private advisory through [gvastethecreator/threejs-mugen](https://github.com/gvastethecreator/threejs-mugen/security/advisories/new).

Do not open a public issue for a secret, credential, or remote-code path.

## Scope

In scope: secret leakage in this repository, unsafe handling of uploaded packages in the sandbox, and CI credential exposure.

Out of scope: third-party MUGEN/IKEMEN character packages you load yourself, and local ignored trees such as `.scratch/` or `.local/`.

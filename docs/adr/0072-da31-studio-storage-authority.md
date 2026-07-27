# ADR 0072 — DA31 Studio storage authority

Status: Accepted (DA31-025)  
Date: 2026-07-27

## Context

Studio projects need a durable local authority for envelopes, source graphs, and
revision journals. DA30 models already describe transactional writes. DA31 must
choose one release authority and keep claim ceilings honest.

## Decision

**IndexedDB is the release authority** for project envelopes and revision
journals.

- **File System Access API** is optional for import/export ports, not the
  primary release store.
- **LocalStorage** may cache UI state (last tab, layout flags). It must not be
  the release authority without the same transaction proof as IndexedDB.

## Consequences

- Save paths use prepare → validate → commit | abort against IndexedDB.
- Multi-tab conflict uses revision numbers / base digests, not last-write-wins
  LocalStorage blobs.
- Browser spikes cover commit, abort, quota, permission, cancel, crash/reopen,
  unknown version, and atomic retention.
- Claim ceiling: chosen local authority and tested failures only.

## Evidence

- `src/mugen/da31/StudioAssetAdoption.ts` (`decideStorageAuthority`)
- DA31-026…027 transactional save and conflict models

# Issue 82 — Required trace decoupling from retired roster labels

Status: closed-bounded
Lane: R1
Priority: P0
Dependency: T499 roster reset
Date: 2026-08-02

## Problem

The required synthetic identity and nonlethal HitDef trace artifacts execute
against the active second demo fighter but still author or require the retired
literal `Mira Volt`. After T499 replaced the public roster, those two stale
labels alone keep `pnpm qa:trace` red.

## Implemented boundary

- Bind the identity fixture's `P2Name` trigger to the active legal opponent's
  display name.
- Bind the nonlethal HitDef event requirement and focused assertion to that
  same active opponent label.
- Preserve routed states, damage, life floor, actor source, and every other
  trace requirement.

## Required evidence

- Focused two-artifact `RuntimeTraceGatePresets` slice: 1 file / 2 tests passed
  (651 skipped by the name filter).
- Full `pnpm qa:trace`: 682/682 artifacts passed, 648 required and 34 optional,
  with zero failures or skips.
- Typecheck, production build, boundaries, and diff hygiene pass.
- Browser smoke: N/A; no visible route or renderer changed.

## Claim ceiling

This issue fixes required synthetic trace ownership after the authorized roster
reset. It does not restore retired public characters, rewrite the broader DA29
test corpus, move compatibility scores, or claim runtime parity.

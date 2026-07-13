import { describe, expect, it, vi } from "vitest";
import {
  createSourceTransactionRecord,
  prepareSourceImportTransaction,
  runSourceImportTransaction,
  type SourceTransactionRecord,
  type SourceImportTransaction,
} from "../app/StudioSourceTransaction";
import type { GameProjectManifest, GameProjectSourcePackage } from "../app/StudioModel";

describe("StudioSourceTransaction", () => {
  it("accepts a legacy source relink while establishing its first fingerprint baseline", () => {
    const transaction = prepareSourceImportTransaction(manifestWithoutFingerprint(), source("a".repeat(64)));

    expect(transaction).toMatchObject({
      status: "accepted",
      reason: "legacy-baseline",
      linkedIds: ["kfm-official"],
    });
    expect(transaction.sourcePackages[0]).toMatchObject({
      status: "linked",
      fingerprint: "a".repeat(64),
      identityStatus: "matched",
    });
  });

  it("rejects a changed source before session state can be committed", () => {
    const transaction = prepareSourceImportTransaction(manifestWithFingerprint("a".repeat(64)), source("b".repeat(64)));

    expect(transaction.status).toBe("rejected");
    expect(transaction.reason).toBe("changed-source");
    expect(transaction.sourcePackages[0]).toMatchObject({
      status: "missing",
      identityStatus: "changed",
      observedFingerprint: "b".repeat(64),
    });
  });

  it("rolls back the previous session when the commit callback fails", () => {
    const transaction = acceptedTransaction();
    const rollback = vi.fn();

    expect(() => runSourceImportTransaction(transaction, { active: "old" }, () => {
      throw new Error("commit failed");
    }, rollback)).toThrow("commit failed");
    expect(rollback).toHaveBeenCalledWith({ active: "old" });
  });

  it("does not run callbacks for a rejected transaction", () => {
    const transaction: SourceImportTransaction = { ...acceptedTransaction(), status: "rejected", reason: "changed-source" };
    const apply = vi.fn();
    const rollback = vi.fn();

    expect(runSourceImportTransaction(transaction, { active: "old" }, apply, rollback)).toBe("rejected");
    expect(apply).not.toHaveBeenCalled();
    expect(rollback).not.toHaveBeenCalled();
  });

  it("exposes a linked read model without pretending that a write permission exists", () => {
    const record = createSourceTransactionRecord({
      sourcePackage: linkedPackage(),
      permission: "not-requested",
    });

    expect(record).toMatchObject({
      schemaVersion: "mugen-web-sandbox/source-transaction/v0",
      state: "linked",
      permission: "not-requested",
      revisionStatus: "unknown",
      canRead: true,
      canWrite: false,
      nextAction: "request-permission",
      invalidatedOutputs: [],
    });
  });

  it("turns changed source identity into an explicit reimport action", () => {
    const record = createSourceTransactionRecord({
      sourcePackage: {
        ...linkedPackage(),
        status: "missing",
        identityStatus: "changed",
        observedFingerprint: "b".repeat(64),
      },
      permission: "granted",
    });

    expect(record).toMatchObject({
      state: "changed",
      canRead: false,
      canWrite: false,
      nextAction: "reimport-source",
      invalidatedOutputs: ["project-bundle", "runtime-manifest", "trace-artifact"],
    });
  });

  it("prioritizes a project revision conflict over a granted source permission", () => {
    const record = createSourceTransactionRecord({
      sourcePackage: linkedPackage(),
      permission: "granted",
      expectedRevision: 4,
      observedRevision: 5,
    });

    expect(record).toMatchObject({
      state: "conflict",
      revisionStatus: "changed",
      canRead: true,
      canWrite: false,
      nextAction: "resolve-conflict",
    });
  });

  it("allows a durable write only for a matched linked source and equal revision", () => {
    const record: SourceTransactionRecord = createSourceTransactionRecord({
      sourcePackage: linkedPackage(),
      permission: "granted",
      expectedRevision: 7,
      observedRevision: 7,
    });

    expect(record).toMatchObject({
      state: "linked",
      revisionStatus: "matched",
      canRead: true,
      canWrite: true,
      nextAction: "none",
      warnings: [],
    });
  });
});

function source(fingerprint: string) {
  return {
    name: "kfm-official.zip",
    kind: "zip" as const,
    fileCount: 5,
    paths: requiredPaths(),
    fingerprint,
    byteLength: 5,
  };
}

function manifestWithoutFingerprint(): GameProjectManifest {
  return manifestWithSourcePackage({});
}

function manifestWithFingerprint(fingerprint: string): GameProjectManifest {
  return manifestWithSourcePackage({
    fingerprint,
    fingerprintAlgorithm: "sha-256",
    byteLength: 5,
  });
}

function manifestWithSourcePackage(fields: Partial<GameProjectSourcePackage>): GameProjectManifest {
  const sourcePackage: GameProjectSourcePackage = {
    id: "kfm-official",
    name: "kfm-official.zip",
    kind: "zip",
    fileCount: 5,
    status: "missing",
    stageIds: [],
    stageDefPaths: [],
    requiredPaths: requiredPaths(),
    ...fields,
  };
  return {
    schemaVersion: "mugen-web-sandbox/project/v0",
    id: "transaction-fixture",
    name: "Transaction Fixture",
    engineVersion: "test",
    generatedAt: "2026-07-13T00:00:00.000Z",
    projectType: "mugen-port",
    modules: [],
    sourcePackages: [sourcePackage],
    assets: { characters: [], stages: [], audio: [], ui: [], effects: [] },
    assetRecords: [],
    entry: { mode: "match", p1: "nova-boxer", p2: "mira-volt", stage: "rooftop-dojo" },
    compatibility: { gates: [], stats: { characters: 0, stages: 0, importedCharacters: 0, importedStages: 0, generatedAtlases: 0 } },
  };
}

function linkedPackage(): GameProjectSourcePackage {
  return {
    id: "kfm-official",
    name: "kfm-official.zip",
    kind: "zip",
    fileCount: 5,
    status: "linked",
    stageIds: [],
    stageDefPaths: [],
    requiredPaths: requiredPaths(),
    fingerprint: "a".repeat(64),
    fingerprintAlgorithm: "sha-256",
    byteLength: 5,
    observedFingerprint: "a".repeat(64),
    observedByteLength: 5,
    identityStatus: "matched",
  };
}

function acceptedTransaction(): SourceImportTransaction {
  return {
    status: "accepted",
    reason: "new-source",
    sourceName: "kfm-official.zip",
    sourceKind: "zip",
    sourcePackages: [],
    linkedIds: [],
    warnings: [],
  };
}

function requiredPaths(): string[] {
  return ["chars/kfm/kfm.def", "chars/kfm/kfm.sff", "chars/kfm/kfm.air", "chars/kfm/kfm.cmd", "chars/kfm/kfm.cns"];
}

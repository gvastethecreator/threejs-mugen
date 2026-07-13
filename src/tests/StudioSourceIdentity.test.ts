import { describe, expect, it } from "vitest";
import { VirtualFileSystem } from "../mugen/loader/VirtualFileSystem";
import { classifySourceIdentity, fingerprintVirtualFileSystem } from "../app/StudioSourceIdentity";

describe("StudioSourceIdentity", () => {
  it("fingerprints normalized files independent of insertion order", async () => {
    const first = new VirtualFileSystem();
    first.addFile("chars/kfm/kfm.def", new TextEncoder().encode("[Info]\nname = KFM\n"));
    first.addFile("chars/kfm/kfm.sff", new Uint8Array([1, 2, 3]));

    const second = new VirtualFileSystem();
    second.addFile("chars/kfm/kfm.sff", new Uint8Array([1, 2, 3]));
    second.addFile("chars/kfm/kfm.def", new TextEncoder().encode("[Info]\nname = KFM\n"));

    const firstFingerprint = await fingerprintVirtualFileSystem(first);
    const secondFingerprint = await fingerprintVirtualFileSystem(second);

    expect(firstFingerprint).toEqual(secondFingerprint);
    expect(firstFingerprint.algorithm).toBe("sha-256");
    expect(firstFingerprint.digest).toMatch(/^[0-9a-f]{64}$/);
    expect(firstFingerprint.fileCount).toBe(2);
    expect(firstFingerprint.byteLength).toBe(21);
  });

  it("changes when source bytes change and classifies the read model", async () => {
    const original = new VirtualFileSystem();
    original.addFile("chars/kfm/kfm.def", new Uint8Array([1, 2, 3]));
    const changed = new VirtualFileSystem();
    changed.addFile("chars/kfm/kfm.def", new Uint8Array([1, 2, 4]));

    const originalFingerprint = await fingerprintVirtualFileSystem(original);
    const changedFingerprint = await fingerprintVirtualFileSystem(changed);

    expect(changedFingerprint.digest).not.toBe(originalFingerprint.digest);
    expect(classifySourceIdentity(originalFingerprint.digest, originalFingerprint.digest, true)).toBe("matched");
    expect(classifySourceIdentity(originalFingerprint.digest, changedFingerprint.digest, true)).toBe("changed");
    expect(classifySourceIdentity(originalFingerprint.digest.toUpperCase(), originalFingerprint.digest, true)).toBe("matched");
    expect(classifySourceIdentity(undefined, changedFingerprint.digest, true)).toBe("unknown");
    expect(classifySourceIdentity(originalFingerprint.digest, undefined, false)).toBe("missing");
  });
});

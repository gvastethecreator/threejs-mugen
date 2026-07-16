import { describe, expect, it } from "vitest";
import {
  ASSET_PERMISSION_SCHEMA,
  isSafeAssetMetadataPath,
  parseAssetPermissionMetadata,
} from "../app/StudioAssetPermission";

describe("StudioAssetPermission", () => {
  it("accepts verified repository-owned metadata with stable file digests", () => {
    const metadata = parseAssetPermissionMetadata({
      schemaVersion: ASSET_PERMISSION_SCHEMA,
      assetId: "nova-boxer",
      ownership: "repository-owned",
      permission: "repository-owned",
      license: { expression: "CC0-1.0", sourceRef: "LICENSE.txt", verified: true },
      sourceFiles: [{ path: "source/input.png", bytes: 12, sha256: "A".repeat(64) }],
      outputFiles: [{ path: "sprite-sheet-alpha.png", bytes: 24, sha256: "B".repeat(64) }],
    });

    expect(metadata).toMatchObject({
      schemaVersion: ASSET_PERMISSION_SCHEMA,
      assetId: "nova-boxer",
      license: { expression: "CC0-1.0", sourceRef: "LICENSE.txt", verified: true },
      sourceFiles: [{ sha256: "a".repeat(64) }],
    });
  });

  it("rejects unverified, absolute, traversal, and incomplete declarations", () => {
    expect(isSafeAssetMetadataPath("C:relative/file.png")).toBe(false);
    expect(isSafeAssetMetadataPath("/characters/nova-boxer/file.png")).toBe(false);
    expect(isSafeAssetMetadataPath("source/../secret.png")).toBe(false);
    expect(parseAssetPermissionMetadata({
      schemaVersion: ASSET_PERMISSION_SCHEMA,
      assetId: "nova-boxer",
      ownership: "repository-owned",
      permission: "repository-owned",
      license: { expression: "CC0-1.0", sourceRef: "C:\\local\\LICENSE.txt", verified: true },
      sourceFiles: [{ path: "source/input.png", bytes: 12, sha256: "A".repeat(64) }],
      outputFiles: [],
    })).toBeUndefined();
  });
});

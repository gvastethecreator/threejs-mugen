import { describe, expect, it } from "vitest";
import {
  canonicalizeSourceAuthorityManifest,
  createSourceAuthorityManifest,
  deriveSourceAuthorityFileDelta,
  parseSourceAuthorityManifest,
  type SourceAuthorityManifestInput,
} from "../mugen/compatibility/SourceAuthorityManifest";
import { sha256Hex } from "../app/EvidenceEnvelope";

const COMMIT_NORMATIVE = "0".repeat(40);
const COMMIT_LOCAL = "1".repeat(40);
const DIGEST_A = "a".repeat(64);
const DIGEST_B = "b".repeat(64);
const DIGEST_C = "c".repeat(64);

function input(overrides: Partial<SourceAuthorityManifestInput> = {}): SourceAuthorityManifestInput {
  return {
    generatedAt: "2026-07-18T12:00:00.000Z",
    source: {
      project: "ikemen-engine/Ikemen-GO",
      repository: "https://github.com/ikemen-engine/Ikemen-GO",
      normative: {
        revision: COMMIT_NORMATIVE,
        files: [
          { path: "src/char.go", digest: DIGEST_A },
          { path: "src/input.go", digest: DIGEST_B },
        ],
      },
      localCache: {
        revision: COMMIT_LOCAL,
        state: "clean",
        files: [
          { path: "src/char.go", digest: DIGEST_A },
          { path: "src/input.go", digest: DIGEST_B },
        ],
        dirtyPaths: [],
      },
    },
    claims: {
      allowed: ["source identity"],
      blocked: ["semantic parity"],
    },
    ...overrides,
  };
}

describe("SourceAuthorityManifest", () => {
  it("creates a deterministic manifest and keeps semantic review unclassified", () => {
    const first = createSourceAuthorityManifest(input());
    const second = createSourceAuthorityManifest({
      ...input(),
      source: {
        ...input().source,
        normative: { ...input().source.normative, files: [...input().source.normative.files].reverse() },
        localCache: { ...input().source.localCache, files: [...input().source.localCache.files].reverse() },
      },
      claims: { allowed: ["source identity"], blocked: ["semantic parity"] },
    });

    expect(first.digest).toEqual(second.digest);
    expect(first.digest.value).toBe(sha256Hex(canonicalizeSourceAuthorityManifest(first)));
    expect(first.comparison.status).toBe("same");
    expect(first.comparison.semanticReview.status).toBe("unclassified");
  });

  it("round-trips and rejects checksum tampering", () => {
    const manifest = createSourceAuthorityManifest(input());
    expect(parseSourceAuthorityManifest(manifest)).toEqual({ errors: [], manifest });
    const tampered = { ...manifest, claims: { ...manifest.claims, allowed: ["semantic parity"] } };
    expect(parseSourceAuthorityManifest(tampered).errors).toContain("Source authority manifest digest mismatch");
  });

  it("derives changed and missing file states independently of semantic review", () => {
    const delta = deriveSourceAuthorityFileDelta(
      [{ path: "src/char.go", digest: DIGEST_A }, { path: "src/input.go", digest: DIGEST_B }],
      [{ path: "src/char.go", digest: DIGEST_C }, { path: "src/extra.go", digest: DIGEST_A }],
    );
    expect(delta).toEqual([
      { path: "src/char.go", status: "changed" },
      { path: "src/extra.go", status: "missing-normative" },
      { path: "src/input.go", status: "missing-local" },
    ]);
    const manifest = createSourceAuthorityManifest(input({
      source: {
        ...input().source,
        localCache: {
          ...input().source.localCache,
          files: [{ path: "src/char.go", digest: DIGEST_C }, { path: "src/extra.go", digest: DIGEST_A }],
        },
      },
    }));
    expect(manifest.comparison.status).toBe("changed");
    expect(manifest.comparison.semanticReview.status).toBe("unclassified");
  });

  it("marks a dirty cache incomplete even when listed files match", () => {
    const manifest = createSourceAuthorityManifest(input({
      source: {
        ...input().source,
        localCache: { ...input().source.localCache, state: "dirty", dirtyPaths: ["src/compiler.go"] },
      },
    }));
    expect(manifest.comparison.status).toBe("incomplete");
    expect(parseSourceAuthorityManifest(manifest)).toEqual({ errors: [], manifest });
  });

  it("fails closed on invalid identities, paths, and digests", () => {
    const manifest = createSourceAuthorityManifest(input());
    const invalid = {
      ...manifest,
      source: {
        ...manifest.source,
        normative: {
          ...manifest.source.normative,
          files: [{ path: "../src/input.go", digest: "bad" }],
        },
      },
    };
    const result = parseSourceAuthorityManifest(invalid);
    expect(result.manifest).toBeUndefined();
    expect(result.errors).toEqual(expect.arrayContaining([
      "Source authority manifest normative file digest is invalid",
    ]));
  });

  it("rejects duplicate file records and a dirty-path claim on a clean cache", () => {
    const manifest = createSourceAuthorityManifest(input());
    const duplicate = {
      ...manifest,
      source: {
        ...manifest.source,
        localCache: {
          ...manifest.source.localCache,
          files: [...manifest.source.localCache.files, manifest.source.localCache.files[0]],
        },
      },
    };
    expect(parseSourceAuthorityManifest(duplicate).errors).toContain(
      "Source authority manifest local cache file digests contain duplicate paths",
    );
    expect(() => createSourceAuthorityManifest(input({
      source: {
        ...input().source,
        localCache: { ...input().source.localCache, dirtyPaths: ["src/input.go"] },
      },
    }))).toThrow("clean or missing source cache cannot contain dirty paths");
  });
});

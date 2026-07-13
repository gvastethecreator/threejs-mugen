import type { VirtualFileSystem } from "../mugen/loader/VirtualFileSystem";

export const SOURCE_FINGERPRINT_ALGORITHM = "sha-256" as const;

export type SourceFingerprintAlgorithm = typeof SOURCE_FINGERPRINT_ALGORITHM;

export type SourceFileFingerprint = {
  path: string;
  digest: string;
  byteLength: number;
};

export type SourceFingerprint = {
  algorithm: SourceFingerprintAlgorithm;
  digest: string;
  fileCount: number;
  byteLength: number;
  files: SourceFileFingerprint[];
};

export type SourceIdentityStatus = "matched" | "changed" | "missing" | "unknown";

export type SourceDigestApi = Pick<SubtleCrypto, "digest">;

export async function fingerprintVirtualFileSystem(
  vfs: VirtualFileSystem,
  digestApi: SourceDigestApi | undefined = globalThis.crypto?.subtle,
): Promise<SourceFingerprint> {
  if (!digestApi) {
    throw new Error("Web Crypto SHA-256 is unavailable for source identity");
  }
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const files: SourceFileFingerprint[] = [];
  let inputLength = 0;
  let byteLength = 0;
  const paths = vfs.listFiles().sort(compareVirtualPaths);
  for (const path of paths) {
    const pathBytes = encoder.encode(path);
    const bytes = vfs.readBytes(path) ?? new Uint8Array();
    const header = new Uint8Array(8 + pathBytes.byteLength);
    const view = new DataView(header.buffer);
    view.setUint32(0, pathBytes.byteLength);
    view.setUint32(4, bytes.byteLength);
    header.set(pathBytes, 8);
    chunks.push(header, bytes);
    const fileInput = new Uint8Array(bytes.byteLength);
    fileInput.set(bytes);
    const fileDigest = await digestApi.digest(SOURCE_FINGERPRINT_ALGORITHM.toUpperCase(), fileInput);
    files.push({
      path,
      digest: toHex(new Uint8Array(fileDigest)),
      byteLength: bytes.byteLength,
    });
    inputLength += header.byteLength + bytes.byteLength;
    byteLength += bytes.byteLength;
  }

  const input = new Uint8Array(inputLength);
  let offset = 0;
  for (const chunk of chunks) {
    input.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const digest = await digestApi.digest(SOURCE_FINGERPRINT_ALGORITHM.toUpperCase(), input);
  return {
    algorithm: SOURCE_FINGERPRINT_ALGORITHM,
    digest: toHex(new Uint8Array(digest)),
    fileCount: paths.length,
    byteLength,
    files,
  };
}

export function classifySourceIdentity(
  expectedFingerprint: string | undefined,
  observedFingerprint: string | undefined,
  sourceAvailable: boolean,
): SourceIdentityStatus {
  if (!sourceAvailable) {
    return "missing";
  }
  if (!expectedFingerprint || !observedFingerprint) {
    return "unknown";
  }
  return expectedFingerprint.toLowerCase() === observedFingerprint.toLowerCase() ? "matched" : "changed";
}

function compareVirtualPaths(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

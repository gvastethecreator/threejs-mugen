import JSZip from "jszip";
import { normalizeVirtualPath } from "./PathResolver";
import { VirtualFileSystem } from "./VirtualFileSystem";

export const ZIP_CHARACTER_SOURCE_POLICY = Object.freeze({
  schema: "ZipCharacterSourcePolicy/v0" as const,
  maxArchiveBytes: 256 * 1024 * 1024,
  maxEntries: 4096,
  maxEntryUncompressedBytes: 64 * 1024 * 1024,
  maxTotalUncompressedBytes: 512 * 1024 * 1024,
});

export type ZipCharacterSourceErrorCode =
  | "archive-too-large"
  | "invalid-archive"
  | "too-many-entries"
  | "unsafe-path"
  | "duplicate-path"
  | "entry-too-large"
  | "expanded-archive-too-large";

export class ZipCharacterSourceError extends Error {
  constructor(readonly code: ZipCharacterSourceErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ZipCharacterSourceError";
  }
}

export type ZipCharacterSourcePolicy = {
  maxArchiveBytes: number;
  maxEntries: number;
  maxEntryUncompressedBytes: number;
  maxTotalUncompressedBytes: number;
};

export class ZipCharacterSource {
  private readonly policy: ZipCharacterSourcePolicy;

  constructor(private readonly file: File, policy: Partial<ZipCharacterSourcePolicy> = {}) {
    this.policy = { ...ZIP_CHARACTER_SOURCE_POLICY, ...policy };
  }

  async load(): Promise<VirtualFileSystem> {
    if (this.file.size > this.policy.maxArchiveBytes) {
      throw new ZipCharacterSourceError("archive-too-large", `ZIP exceeds ${this.policy.maxArchiveBytes} compressed bytes`);
    }
    let zip: JSZip;
    try {
      zip = await JSZip.loadAsync(await this.file.arrayBuffer());
    } catch (cause) {
      throw new ZipCharacterSourceError("invalid-archive", "ZIP could not be decoded", { cause });
    }
    const vfs = new VirtualFileSystem();
    const archiveEntries = Object.values(zip.files);
    if (archiveEntries.length > this.policy.maxEntries) {
      throw new ZipCharacterSourceError("too-many-entries", `ZIP contains ${archiveEntries.length} entries; limit is ${this.policy.maxEntries}`);
    }
    const entries = archiveEntries.filter((entry) => !entry.dir);

    const normalizedPaths = new Set<string>();
    let declaredTotal = 0;
    for (const entry of entries) {
      const originalName = entry.unsafeOriginalName ?? entry.name;
      const path = normalizeVirtualPath(entry.name);
      if (!path || isUnsafeArchivePath(originalName, entry.name)) {
        throw new ZipCharacterSourceError("unsafe-path", `ZIP entry path is unsafe: ${originalName}`);
      }
      const key = path.toLowerCase();
      if (normalizedPaths.has(key)) {
        throw new ZipCharacterSourceError("duplicate-path", `ZIP contains a duplicate virtual path: ${path}`);
      }
      normalizedPaths.add(key);
      const declaredSize = compressedEntrySize(entry);
      if (declaredSize !== undefined) {
        if (declaredSize > this.policy.maxEntryUncompressedBytes) {
          throw new ZipCharacterSourceError("entry-too-large", `ZIP entry exceeds ${this.policy.maxEntryUncompressedBytes} bytes: ${path}`);
        }
        declaredTotal += declaredSize;
        if (declaredTotal > this.policy.maxTotalUncompressedBytes) {
          throw new ZipCharacterSourceError("expanded-archive-too-large", `ZIP expands beyond ${this.policy.maxTotalUncompressedBytes} bytes`);
        }
      }
    }

    let actualTotal = 0;
    for (const entry of entries) {
      let buffer: ArrayBuffer;
      try {
        buffer = await entry.async("arraybuffer");
      } catch (cause) {
        throw new ZipCharacterSourceError("invalid-archive", `ZIP entry could not be decoded: ${entry.name}`, { cause });
      }
      if (buffer.byteLength > this.policy.maxEntryUncompressedBytes) {
        throw new ZipCharacterSourceError("entry-too-large", `ZIP entry exceeds ${this.policy.maxEntryUncompressedBytes} bytes: ${entry.name}`);
      }
      actualTotal += buffer.byteLength;
      if (actualTotal > this.policy.maxTotalUncompressedBytes) {
        throw new ZipCharacterSourceError("expanded-archive-too-large", `ZIP expands beyond ${this.policy.maxTotalUncompressedBytes} bytes`);
      }
      vfs.addFile(entry.name, buffer);
    }

    return vfs;
  }

  get name(): string {
    return this.file.name;
  }
}

function compressedEntrySize(entry: JSZip.JSZipObject): number | undefined {
  const value = (entry as JSZip.JSZipObject & { _data?: { uncompressedSize?: unknown } })._data?.uncompressedSize;
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : undefined;
}

function isUnsafeArchivePath(originalName: string, sanitizedName: string): boolean {
  const normalized = originalName.replace(/\\/g, "/");
  return originalName !== sanitizedName
    || normalized.startsWith("/")
    || /^[a-z]:\//i.test(normalized)
    || normalized.includes("\0")
    || normalized.split("/").includes("..");
}

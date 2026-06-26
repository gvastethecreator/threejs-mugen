import { normalizeVirtualPath } from "./PathResolver";

export type VirtualFile = {
  path: string;
  originalPath: string;
  bytes: Uint8Array;
};

export class VirtualFileSystem {
  private readonly files = new Map<string, VirtualFile>();

  addFile(path: string, bytes: ArrayBuffer | Uint8Array): void {
    const normalized = normalizeVirtualPath(path);
    if (!normalized) {
      return;
    }
    const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    this.files.set(normalized.toLowerCase(), {
      path: normalized,
      originalPath: path,
      bytes: data,
    });
  }

  listFiles(): string[] {
    return [...this.files.values()].map((file) => file.path).sort((a, b) => a.localeCompare(b));
  }

  get(path: string | undefined): VirtualFile | undefined {
    if (!path) {
      return undefined;
    }
    return this.files.get(normalizeVirtualPath(path).toLowerCase());
  }

  has(path: string | undefined): boolean {
    return Boolean(this.get(path));
  }

  findByExtension(extension: string): string[] {
    const suffix = extension.toLowerCase().startsWith(".")
      ? extension.toLowerCase()
      : `.${extension.toLowerCase()}`;
    return this.listFiles().filter((path) => path.toLowerCase().endsWith(suffix));
  }

  readBytes(path: string | undefined): Uint8Array | undefined {
    return this.get(path)?.bytes;
  }

  readArrayBuffer(path: string | undefined): ArrayBuffer | undefined {
    const bytes = this.readBytes(path);
    if (!bytes) {
      return undefined;
    }
    const copy = new Uint8Array(bytes.byteLength);
    copy.set(bytes);
    return copy.buffer;
  }

  readText(path: string | undefined): string | undefined {
    const bytes = this.readBytes(path);
    if (!bytes) {
      return undefined;
    }
    return decodeLegacyText(bytes);
  }
}

export function decodeLegacyText(bytes: Uint8Array): string {
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return new TextDecoder("utf-8").decode(bytes.slice(3));
  }
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return new TextDecoder("utf-16le").decode(bytes.slice(2));
  }

  const utf8 = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  if (!utf8.includes("\uFFFD")) {
    return utf8;
  }

  try {
    return new TextDecoder("windows-1252", { fatal: false }).decode(bytes);
  } catch {
    return utf8;
  }
}

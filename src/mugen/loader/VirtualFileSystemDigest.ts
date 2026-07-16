import type { VirtualFileSystem } from "./VirtualFileSystem";

export async function createVirtualFileSystemPackageDigest(
  vfs: VirtualFileSystem,
  label = "virtual file system",
): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error(`Web Crypto is required to digest the ${label}`);
  }
  const parts = vfs.listFiles().map((path) => {
    const pathBytes = new TextEncoder().encode(path);
    const fileBytes = vfs.readBytes(path) ?? new Uint8Array();
    const bytes = new Uint8Array(pathBytes.length + fileBytes.length);
    bytes.set(pathBytes, 0);
    bytes.set(fileBytes, pathBytes.length);
    return bytes;
  });
  const totalLength = parts.reduce((total, part) => total + part.length, 0);
  const payload = new Uint8Array(totalLength);
  let offset = 0;
  for (const part of parts) {
    payload.set(part, offset);
    offset += part.length;
  }
  const digest = new Uint8Array(await globalThis.crypto.subtle.digest("SHA-256", payload));
  return `sha256:${[...digest].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}
